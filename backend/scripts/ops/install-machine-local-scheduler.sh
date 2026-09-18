#!/bin/bash
# §311A / BR-5 — install the machine-local daily backup as a launchd user agent.
#
# =====================================================================================================
# WHY THIS INSTALLS A COPY INSTEAD OF POINTING launchd AT THE CHECKOUT.
#
# Because pointing launchd at the checkout does not work, and §311A found that out by doing it. The
# first scheduled run exited 126 with "Operation not permitted". A diagnostic agent then established
# the cause precisely: a launchd user agent can **stat** a file under ~/Desktop but **cannot read**
# it, and cannot list ~/Desktop at all. That is macOS TCC — ~/Desktop, ~/Documents and ~/Downloads
# are protected locations, and a LaunchAgent holds no grant for them. File permissions are irrelevant;
# `chmod 755` on the script changes nothing.
#
# The alternative would be granting Full Disk Access to /bin/bash, which hands every script the user
# ever runs the keys to the whole filesystem in order to fix one backup job. That is a bad trade.
#
# So the job payload is installed to ~/.safety-insite/runner/, which is not TCC-protected. This is
# also simply better: a scheduled job should not break because someone renamed a directory, switched
# branch, or left the tree mid-rebase.
#
# =====================================================================================================
# THE COST OF A COPY, AND HOW IT IS MANAGED.
#
# A copy can drift from the repository. So the installer records, in INSTALLED.json beside the runner,
# the source commit and a sha256 of every file it copied. `--verify` re-checks those hashes against
# the current checkout and reports drift. Re-running the installer is the fix.
#
# =====================================================================================================
# USAGE
#
#   ./install-machine-local-scheduler.sh            install or re-install, then verify
#   ./install-machine-local-scheduler.sh --verify   check the installed runner against the checkout
#   ./install-machine-local-scheduler.sh --uninstall
#
# It does NOT create the secret file and it never reads one. ~/.safety-insite/backup.env is the
# operator's to create, at mode 600, from backup.env.example.

set -uo pipefail

REPO_OPS="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNNER_DIR="$HOME/.safety-insite/runner"
LOG_DIR="$HOME/.safety-insite/logs"
LABEL="com.safety-insite.backup"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
NODE_BIN="${SAFETY_INSITE_NODE_BIN:-$HOME/.nvm/versions/node/v24.14.1/bin}"

# The scheduled path needs these; the other ops scripts are operator-run from the checkout.
#
# §315 ADDED verify-evidence-digest-integrity.js, and the reason it MUST be here is the defect §315
# found: the installed runner had been carrying a pre-§313 reconcile-evidence-recovery.js since §312A,
# so the SCHEDULED path was running code the checkout had already moved past. `--verify` reports that
# drift, but only when somebody runs it. Anything the scheduled path executes belongs in this list.
JOB_FILES=(
  run-scheduled-backup.sh
  backup-production-database.js
  check-backup-freshness.js
  verify-object-consistency.js
  verify-evidence-digest-integrity.js
  reconcile-evidence-recovery.js
  check-backup-health.js
)

say() { echo "  $*"; }

verify() {
  local manifest="$RUNNER_DIR/INSTALLED.json"
  if [ ! -f "$manifest" ]; then echo "NOT INSTALLED: $manifest is absent"; return 1; fi
  local drift=0
  for f in "${JOB_FILES[@]}"; do
    local src="$REPO_OPS/$f" dst="$RUNNER_DIR/$f"
    if [ ! -f "$dst" ]; then say "MISSING in runner: $f"; drift=1; continue; fi
    if [ ! -f "$src" ]; then say "MISSING in checkout: $f"; drift=1; continue; fi
    local a b
    a="$(shasum -a 256 "$src" | awk '{print $1}')"
    b="$(shasum -a 256 "$dst" | awk '{print $1}')"
    if [ "$a" = "$b" ]; then say "match   $f"; else say "DRIFT   $f  (checkout $a / runner $b)"; drift=1; fi
  done
  return $drift
}

case "${1:-install}" in
  --uninstall)
    launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null
    rm -f "$PLIST"
    rm -rf "$RUNNER_DIR"
    echo "uninstalled: agent booted out, plist and runner removed."
    echo "NOTE: ~/.safety-insite/backup.env was NOT removed. Delete it yourself if you mean to."
    exit 0 ;;
  --verify)
    echo "§311A scheduler verification"
    verify; rc=$?
    echo ""
    launchctl print "gui/$(id -u)/$LABEL" >/dev/null 2>&1 \
      && echo "launchd: agent is loaded" || { echo "launchd: agent NOT loaded"; rc=1; }
    [ $rc -eq 0 ] && echo "VERIFY PASS" || echo "VERIFY FAIL"
    exit $rc ;;
esac

echo "§311A — installing the machine-local backup scheduler"
echo ""

# ---- 1. runner directory, outside any TCC-protected location -------------------------------------
mkdir -p "$RUNNER_DIR" "$LOG_DIR"
chmod 700 "$HOME/.safety-insite" "$RUNNER_DIR" "$LOG_DIR"
case "$RUNNER_DIR" in
  "$HOME"/Desktop/*|"$HOME"/Documents/*|"$HOME"/Downloads/*)
    echo "REFUSING: the runner directory is inside a TCC-protected location. launchd could not read it."
    exit 1 ;;
esac
say "runner directory: $RUNNER_DIR"

# ---- 2. copy the job payload ---------------------------------------------------------------------
for f in "${JOB_FILES[@]}"; do
  cp "$REPO_OPS/$f" "$RUNNER_DIR/$f" || { echo "FAILED to copy $f"; exit 1; }
  say "copied  $f"
done
chmod +x "$RUNNER_DIR/run-scheduled-backup.sh"

# ---- 3. the one dependency the job actually needs -------------------------------------------------
#
# The runner is given its OWN package.json first, and that is load-bearing rather than tidy. Without
# one, npm walks up the directory tree looking for a project root, finds an unrelated package.json in
# the home directory, and fails resolving ITS peer dependencies — §311A hit exactly that, an Expo
# peer-dependency conflict in a backup installer. A private package.json stops the walk.
if [ ! -f "$RUNNER_DIR/package.json" ]; then
  cat > "$RUNNER_DIR/package.json" <<'PKGEOF'
{
  "name": "safety-insite-backup-runner",
  "version": "1.0.0",
  "private": true,
  "description": "§311A machine-local backup runner. Installed outside the checkout because macOS TCC denies launchd read access to ~/Desktop.",
  "dependencies": { "@aws-sdk/client-s3": "^3.1096.0" }
}
PKGEOF
  say "wrote   package.json (makes the runner its own npm root)"
fi

if [ ! -d "$RUNNER_DIR/node_modules/@aws-sdk/client-s3" ]; then
  say "installing @aws-sdk/client-s3 into the runner (this is the only dependency)"
  ( cd "$RUNNER_DIR" && PATH="$NODE_BIN:$PATH" npm install --silent --no-audit --no-fund >/dev/null 2>&1 ) \
    || { echo "FAILED: npm install of @aws-sdk/client-s3 in $RUNNER_DIR"; exit 1; }
fi
[ -d "$RUNNER_DIR/node_modules/@aws-sdk/client-s3" ] || { echo "FAILED: @aws-sdk/client-s3 is not present after install"; exit 1; }
say "dependency present: @aws-sdk/client-s3"

# ---- 3b. record the application source binding, because the runner is not a checkout ---------------
#
# backup-production-database.js binds each artifact to the applicationSourceDigest so a restored
# database can be paired with a build that understands it. In the runner layout it cannot compute one
# — there is no .git there, by design. So the digest is computed HERE, from the checkout, using the
# exact command recorded in project-docs/preservation/v1-beta/release-manifest.json, and written
# beside the job for the backup script to read.
REPO_ROOT="$(cd "$REPO_OPS/../../.." && pwd)"
APP_DIGEST="$(cd "$REPO_ROOT" && git ls-tree -r HEAD --format='%(path) %(objectname)' 2>/dev/null \
  | grep -E '^(backend/(src|scripts)/|backend/package(-lock)?\.json|backend/tsconfig|frontend-next/(app|components|lib|public|scripts)/|frontend-next/package(-lock)?\.json|frontend-next/(next\.config|tsconfig|tailwind))' \
  | LC_ALL=C sort | shasum -a 256 | awk '{print $1}')"
if [ -n "$APP_DIGEST" ]; then
  cat > "$RUNNER_DIR/SOURCE-BINDING.json" <<BINDEOF
{
  "artifact": "SECTION-311A-RUNNER-SOURCE-BINDING",
  "recordedAt": "$(date -u '+%Y-%m-%dT%H:%M:%SZ')",
  "sourceCommit": "$(cd "$REPO_ROOT" && git rev-parse HEAD 2>/dev/null || echo unknown)",
  "applicationSourceDigest": "$APP_DIGEST",
  "recomputeCommand": "git ls-tree -r HEAD --format='%(path) %(objectname)' | grep -E '^(backend/(src|scripts)/|backend/package(-lock)?\\\\.json|backend/tsconfig|frontend-next/(app|components|lib|public|scripts)/|frontend-next/package(-lock)?\\\\.json|frontend-next/(next\\\\.config|tsconfig|tailwind))' | LC_ALL=C sort | shasum -a 256",
  "note": "Recorded at INSTALL time from the checkout. The runner is deliberately not a git checkout, because macOS TCC denies a launchd agent access to ~/Desktop. Artifacts taken by the runner report applicationSourceDigestStatus RECORDED_AT_INSTALL rather than COMPUTED, so the provenance is never overstated."
}
BINDEOF
  chmod 600 "$RUNNER_DIR/SOURCE-BINDING.json"
  say "wrote   SOURCE-BINDING.json  (applicationSourceDigest ${APP_DIGEST:0:12}…)"
else
  say "WARNING: could not compute applicationSourceDigest; artifacts will record it as unbound"
fi

# ---- 4. record what was installed, so drift is detectable ------------------------------------------
{
  echo '{'
  echo '  "artifact": "SECTION-311A-INSTALLED-RUNNER",'
  echo "  \"installedAt\": \"$(date -u '+%Y-%m-%dT%H:%M:%SZ')\","
  echo "  \"sourceRepo\": \"$(cd "$REPO_OPS/../../.." && pwd)\","
  echo "  \"sourceCommit\": \"$(cd "$REPO_OPS" && git rev-parse HEAD 2>/dev/null || echo unknown)\","
  echo "  \"sourceBranch\": \"$(cd "$REPO_OPS" && git branch --show-current 2>/dev/null || echo unknown)\","
  echo '  "files": {'
  last=$(( ${#JOB_FILES[@]} - 1 )); i=0
  for f in "${JOB_FILES[@]}"; do
    h="$(shasum -a 256 "$RUNNER_DIR/$f" | awk '{print $1}')"
    comma=","; [ $i -eq $last ] && comma=""
    echo "    \"$f\": \"$h\"$comma"
    i=$((i+1))
  done
  echo '  },'
  echo '  "note": "Installed OUTSIDE the checkout because macOS TCC denies a launchd user agent read access to ~/Desktop. Re-run the installer after changing any of these files; ./install-machine-local-scheduler.sh --verify reports drift."'
  echo '}'
} > "$RUNNER_DIR/INSTALLED.json"
chmod 600 "$RUNNER_DIR/INSTALLED.json"
say "wrote   INSTALLED.json"

# ---- 5. the launchd agent --------------------------------------------------------------------------
cat > "$PLIST" <<PLISTEOF
<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by install-machine-local-scheduler.sh. Carries NO secret: launchctl print would show
     EnvironmentVariables to anyone who asked. Secrets live in ~/.safety-insite/backup.env at 0600. -->
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$RUNNER_DIR/run-scheduled-backup.sh</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict><key>Hour</key><integer>5</integer><key>Minute</key><integer>0</integer></dict>
  <key>RunAtLoad</key><false/>
  <key>StandardOutPath</key><string>$LOG_DIR/backup.log</string>
  <key>StandardErrorPath</key><string>$LOG_DIR/backup.log</string>
  <key>ProcessType</key><string>Background</string>
  <key>ExitTimeOut</key><integer>1800</integer>
</dict>
</plist>
PLISTEOF
plutil -lint "$PLIST" >/dev/null || { echo "FAILED: generated plist is not valid"; exit 1; }
say "wrote   $PLIST"

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null
launchctl bootstrap "gui/$(id -u)" "$PLIST" || { echo "FAILED: launchctl bootstrap"; exit 1; }
launchctl enable "gui/$(id -u)/$LABEL"
say "launchd agent bootstrapped and enabled (05:00 local, daily)"

echo ""
echo "verifying..."
verify || { echo "VERIFY FAILED immediately after install"; exit 1; }
echo ""
echo "INSTALL OK."
echo "  run once now:  launchctl kickstart -p gui/\$(id -u)/$LABEL"
echo "  scheduler health: launchctl print gui/\$(id -u)/$LABEL | grep -E 'state|runs|last exit code'"
echo "  job log:       tail -40 $LOG_DIR/backup.log"
