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

say "scheduled backup complete"
exit 0
