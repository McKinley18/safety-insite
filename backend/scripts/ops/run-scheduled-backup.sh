#!/bin/bash
# §311A / BR-5 — the machine-local scheduled backup entry point.
#
# =====================================================================================================
# WHAT launchd ACTUALLY INVOKES. Everything else is configuration.
#
# It does three things in order and stops at the first failure:
#   1. loads the operator secret file, which lives OUTSIDE this repository
#   2. takes a durable backup (dump -> upload -> read back -> re-hash -> retention -> freshness record)
#   3. re-reads the destination through a separate code path to confirm it now looks fresh
#
# Step 3 is not redundant. Step 2 reports its own success; step 3 asks the destination. A run that
# claimed success but left the destination in a state a monitor would call stale fails HERE, in the
# run that caused it, rather than being discovered tomorrow.
#
# =====================================================================================================
# WHY THE SECRETS ARE IN A FILE AND NOT IN THIS SCRIPT, THE PLIST, OR THE REPOSITORY.
#
# The repository is PUBLIC (register entry SE-21). The secret file lives at
# ~/.safety-insite/backup.env with 0600 permissions, is never tracked, and is read only by this
# script. The launchd plist references this script by path and carries no secret of its own, so the
# plist is safe to commit as a template and safe to read with `launchctl print`.
#
# =====================================================================================================
# SCHEDULING REALITY ON A LAPTOP, stated here because it is the honest limit of this design.
#
# launchd runs a missed StartCalendarInterval job at the next wake, not at the next scheduled time,
# so an overnight sleep does not skip a day. What it cannot do is run while the machine is SHUT DOWN.
# §311A measured this machine over the power log's full 8-day retention: 644 wake events, a longest
# continuous gap of 16.0 hours, no day without a wake, and 17 days of uninterrupted uptime. On that
# evidence a daily job runs daily. An extended powered-off period would break both this job AND the
# freshness check that would otherwise report it, and that residual is registered rather than hidden.

set -u
set -o pipefail

SECRET_FILE="${SAFETY_INSITE_BACKUP_ENV:-$HOME/.safety-insite/backup.env}"
LOG_DIR="${SAFETY_INSITE_BACKUP_LOG_DIR:-$HOME/.safety-insite/logs}"
SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ---------------------------------------------------------------------------------------------------
# TWO LAYOUTS, AND THE REASON THE SECOND ONE EXISTS.
#
# In the REPOSITORY layout this script sits in backend/scripts/ops/ beside the job scripts, with the
# backend's node_modules two levels up. That is the layout a developer runs by hand.
#
# In the INSTALLED RUNNER layout it sits in ~/.safety-insite/runner/ with the job scripts and a
# minimal node_modules beside it. That layout exists because of macOS TCC: a launchd user agent has
# NO access to ~/Desktop, ~/Documents or ~/Downloads. §311A measured this rather than guessing — a
# probe agent could stat the repository script but reading it returned "Operation not permitted", and
# the first scheduled run failed with exit 126. A checkout under ~/Desktop is therefore unusable as a
# scheduled payload, whatever its file permissions say.
#
# Installing outside the checkout is better for a second reason anyway: a scheduled job should not
# stop working because someone renamed a folder, switched branch, or is mid-rebase.
# ---------------------------------------------------------------------------------------------------
if [ -f "$SELF_DIR/backup-production-database.js" ]; then
  JOB_DIR="$SELF_DIR"                                  # installed runner layout
  LAYOUT="runner"
elif [ -f "$SELF_DIR/../../scripts/ops/backup-production-database.js" ]; then
  JOB_DIR="$(cd "$SELF_DIR/../../scripts/ops" && pwd)" # repository layout
  LAYOUT="repository"
else
  JOB_DIR="$SELF_DIR"
  LAYOUT="unknown"
fi
# node resolves modules by walking up from the script's directory, so NODE_PATH is set explicitly to
# the runner's own node_modules when one is present.
[ -d "$JOB_DIR/node_modules" ] && export NODE_PATH="$JOB_DIR/node_modules"

mkdir -p "$LOG_DIR"
chmod 700 "$LOG_DIR" 2>/dev/null || true

stamp() { date -u '+%Y-%m-%dT%H:%M:%SZ'; }
say() { echo "[$(stamp)] $*"; }

say "scheduled backup starting; layout=$LAYOUT jobs=$JOB_DIR"

# §315. SAY WHICH CODE THIS IS. The installed runner is a COPY of the checkout, and §315 found it had
# been a stale copy since §312A without anything saying so in the log. Printing the binding on every
# run means the next drift is visible in the run that suffers from it, rather than only to whoever
# remembers to run `install-machine-local-scheduler.sh --verify`.
if [ -r "$JOB_DIR/SOURCE-BINDING.json" ]; then
  say "runner source binding: $(sed -n 's/.*"sourceCommit"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$JOB_DIR/SOURCE-BINDING.json" | head -1)"
else
  say "runner source binding: UNKNOWN (no SOURCE-BINDING.json beside the jobs)"
fi

if [ ! -r "$SECRET_FILE" ]; then
  say "FATAL: secret file not readable at $SECRET_FILE"
  say "Create it from backend/scripts/ops/backup.env.example and chmod 600 it."
  exit 78   # EX_CONFIG
fi

# Refuse a world- or group-readable secret file rather than quietly using it.
PERMS="$(stat -f '%Lp' "$SECRET_FILE" 2>/dev/null || stat -c '%a' "$SECRET_FILE" 2>/dev/null || echo '???')"
case "$PERMS" in
  600|400) : ;;
  *) say "FATAL: $SECRET_FILE has mode $PERMS; it must be 600. Refusing to read it."; exit 78 ;;
esac

set -a
# shellcheck disable=SC1090
. "$SECRET_FILE"
set +a

# Node must be the pinned runtime, and launchd's PATH is not a login shell's PATH.
NODE_BIN="${SAFETY_INSITE_NODE_BIN:-}"
if [ -z "$NODE_BIN" ]; then
  for candidate in \
    "$HOME/.nvm/versions/node/v24.14.1/bin" \
    "/opt/homebrew/bin" \
    "/usr/local/bin"; do
    if [ -x "$candidate/node" ]; then NODE_BIN="$candidate"; break; fi
  done
fi
if [ -z "$NODE_BIN" ]; then say "FATAL: no node runtime found"; exit 127; fi
export PATH="$NODE_BIN:$PATH"
say "node $(node --version) from $NODE_BIN"

cd "$JOB_DIR" || { say "FATAL: cannot cd to $JOB_DIR"; exit 1; }

say "--- taking backup ---"
if ! node "$JOB_DIR/backup-production-database.js"; then
  say "BACKUP FAILED (exit $?). The script has already pushed to the alert webhook if configured."
  exit 1
fi

say "--- confirming the destination reports a fresh backup ---"
# A tight threshold here: the backup finished seconds ago, so anything but FRESH means the run did
# not leave the destination in the state it reported.
if ! BACKUP_MAX_AGE_HOURS=1 node "$JOB_DIR/check-backup-freshness.js"; then
  say "POST-BACKUP FRESHNESS CHECK FAILED (exit $?)."
  exit 1
fi

# =====================================================================================================
# §315 / BR-9 — LIVE-BYTE INTEGRITY, AND WHY IT RUNS BEFORE THE CAPTURE RATHER THAN AFTER IT.
#
# Reconciliation below CAPTURES live bytes into recovery storage. If those bytes are corrupt, running
# it first would faithfully copy the corruption into the recovery store as a new generation — spending
# operations to preserve the wrong thing, and doing it in the one run that was supposed to notice.
# Verifying first and skipping the capture on failure means a bad day cannot propagate.
#
# THE RUN DOES NOT EXIT HERE, and that is deliberate. Exiting on integrity failure would skip the
# aggregate step, and the aggregate step is what dispatches MO-1. A monitor that goes quiet exactly
# when it finds something is the failure mode §312A already had to fix once. The outcome is recorded,
# the capture is skipped, the aggregate reports it, the alert goes out, and THEN the run exits non-zero.
say "--- live-byte evidence integrity ---"
INTEGRITY_OK=skipped
INTEGRITY_REPORT="$LOG_DIR/last-integrity.json"
# The aggregate will refuse a report older than this, so a stale file from a previous run cannot be
# mistaken for this run's result.
INTEGRITY_NOT_BEFORE="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
rm -f "$INTEGRITY_REPORT"
if [ -n "${EVIDENCE_SOURCE_S3_ACCESS_KEY_ID:-}" ]; then
  if node "$JOB_DIR/verify-evidence-digest-integrity.js" --json "$INTEGRITY_REPORT"; then
    INTEGRITY_OK=yes
  else
    INTEGRITY_OK=no
    say "LIVE-BYTE INTEGRITY DID NOT HOLD (exit $?). Continuing to the aggregate so MO-1 is dispatched."
  fi
else
  say "SKIPPED: EVIDENCE_SOURCE_S3_* is not configured, so live bytes are NOT being verified."
fi

say "--- evidence recovery reconciliation ---"
# §312. DELIBERATELY CONDITIONAL, and it fails loudly rather than skipping quietly once configured.
#
# Evidence reconciliation needs READ access to the customer-evidence bucket, which is a SECOND
# credential (EVIDENCE_SOURCE_S3_*) that must be read-only and separate from both the application's
# credential and this job's destination credential. Until the product owner provisions it, the
# database backup above is complete and correct and the evidence half simply has not been activated —
# which is a different thing from having failed, and is reported as such.
RECONCILE_FAILED=no
if [ -n "${EVIDENCE_SOURCE_S3_ACCESS_KEY_ID:-}" ]; then
  if [ "$INTEGRITY_OK" = "no" ]; then
    # §315. Do not capture bytes that have just been shown not to match their recorded digest.
    say "SKIPPING CAPTURE: integrity did not hold, so live bytes are not copied into recovery storage."
    RECONCILE_FAILED=yes
  elif ! node "$JOB_DIR/reconcile-evidence-recovery.js" --apply; then
    say "EVIDENCE RECONCILIATION REPORTED A PROBLEM (exit $?). The alert webhook has been notified."
    RECONCILE_FAILED=yes
  fi
else
  say "SKIPPED: EVIDENCE_SOURCE_S3_* is not configured, so customer evidence is NOT being protected."
  say "This is the §312 owner action — see project-docs/operations/DISASTER-RECOVERY-RUNBOOK.md."
fi

say "--- aggregate backup health ---"
# §312A, extended by §315. The run is only HEALTHY when ALL THREE halves are: a fresh database backup,
# protected evidence, AND live bytes that hash to the digests the database recorded. A green database
# backup beside unprotected evidence used to exit 0; so did a green backup beside evidence whose bytes
# had silently changed. Both false assurances are removed by this composition.
#
# The integrity report produced above is handed over rather than recomputed, so the population is
# hashed once per run. The aggregate refuses it if it is missing, stale, malformed or foreign.
HEALTH_ARGS=()
if [ "$INTEGRITY_OK" != "skipped" ] && [ -f "$INTEGRITY_REPORT" ]; then
  HEALTH_ARGS=(--integrity-report "$INTEGRITY_REPORT" --integrity-not-before "$INTEGRITY_NOT_BEFORE")
fi
if ! node "$JOB_DIR/check-backup-health.js" "${HEALTH_ARGS[@]+"${HEALTH_ARGS[@]}"}"; then
  say "AGGREGATE HEALTH IS NOT HEALTHY (exit $?). The alert webhook has been notified."
  exit 1
fi

# The aggregate is the authority on health, but a reconciliation that failed must still fail the RUN.
if [ "$RECONCILE_FAILED" = "yes" ]; then
  say "RUN FAILED: evidence reconciliation did not complete."
  exit 1
fi

say "scheduled backup complete"
exit 0
