#!/bin/bash
# §311A — the secret scan that must pass before the backup tooling is committed.
#
# =====================================================================================================
# WHY THIS EXISTS AS A COMMAND RATHER THAN AS CARE.
#
# The repository is PUBLIC (register entry SE-21) and §311A introduces, for the first time, a working
# set that sits next to a live production database credential and a live R2 token. "I was careful" is
# not a control. This is.
#
# It scans the CANDIDATE TRACKED CONTENT — what would actually be committed — for credential shapes,
# and it scans git history for the same. It exits non-zero on any hit.
#
#   ./scan-candidate-diff-for-secrets.sh           # staged + unstaged + untracked-but-not-ignored
#   ./scan-candidate-diff-for-secrets.sh --history # additionally scan all of git history
#
# =====================================================================================================
# WHAT IT DELIBERATELY DOES NOT CLAIM.
#
# A pattern scan proves the ABSENCE OF KNOWN SHAPES, not the absence of secrets. It cannot recognise
# a credential that looks like an ordinary word. It is a floor, not a guarantee, and the real control
# is that no secret is ever written inside the repository in the first place — the operator secret
# file lives at ~/.safety-insite/backup.env, outside this tree.

set -uo pipefail
cd "$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)" || exit 1

SCAN_HISTORY=0
[ "${1:-}" = "--history" ] && SCAN_HISTORY=1

# Credential SHAPES. Each is a prefix or structure that only appears in a real credential.
PATTERNS=(
  'npg_[A-Za-z0-9]{12,}'                                  # Neon database password
  # Any credentialed postgres URL. The password class excludes $ < > { } so that a SHELL VARIABLE
  # REFERENCE or an <ANGLE_PLACEHOLDER> is not reported as a credential — a variable reference is
  # definitionally not a secret. This is a PRECISION improvement, not a relaxation: every literal
  # password still matches. The cost is a literal password containing one of those five characters,
  # which would in practice be percent-encoded in a URL anyway.
  'postgres(ql)?://[^[:space:]"'"'"']*:[^[:space:]"'"'"'@${}<>]{6,}@'
  'sk-ant-[A-Za-z0-9_-]{20,}'                             # Anthropic
  'sk_live_[A-Za-z0-9]{16,}'                              # Stripe secret, live
  'rk_live_[A-Za-z0-9]{16,}'                              # Stripe restricted, live
  'whsec_[A-Za-z0-9]{16,}'                                # Stripe webhook signing
  're_[A-Za-z0-9]{20,}'                                   # Resend
  'AKIA[0-9A-Z]{16}'                                      # AWS access key id
  'gh[pousr]_[A-Za-z0-9]{20,}'                            # GitHub token
  'BEGIN [A-Z ]*PRIVATE KEY'                              # PEM
  '[Aa]ccess[-_ ]?[Kk]ey[-_ ]?[Ii][Dd]["'"'"']?[[:space:]]*[:=][[:space:]]*["'"'"']?[A-Za-z0-9]{20,}'
  '[Ss]ecret[-_ ]?[Aa]ccess[-_ ]?[Kk]ey["'"'"']?[[:space:]]*[:=][[:space:]]*["'"'"']?[A-Za-z0-9/+]{30,}'
)

# Paths whose JOB is to describe these patterns, or which are frozen evidence about past scans.
# Excluded by path, never by pattern, so an exclusion can never hide a NEW secret in a NEW file.
EXCLUDE_RE='(^|/)(node_modules|dist|\.git)/|scan-candidate-diff-for-secrets\.sh$|backup\.env\.example$|SECTION-307-SECURITY-READINESS\.json$|INSITE_CURRENT_STATE\.json$'

echo "§311A candidate-diff secret scan"
echo "repository: $(pwd)"
echo

# The candidate set: everything git would let you commit — tracked-and-modified plus untracked and
# not ignored. Ignored files (the real .env, the operator secret file) are correctly never included.
#
# Written for bash 3.2, which is what macOS ships: no `mapfile`, no associative arrays. The first
# draft used `mapfile` and died with "command not found" — which is the right failure, but a scan
# that cannot run is a scan that cannot protect anything, so it is portable now.
CANDIDATE_LIST="$(
  { git diff --name-only --diff-filter=ACMR
    git diff --cached --name-only --diff-filter=ACMR
    git ls-files --others --exclude-standard
  } 2>/dev/null | sort -u | grep -Ev "$EXCLUDE_RE"
)"

CANDIDATE_COUNT=0
[ -n "$CANDIDATE_LIST" ] && CANDIDATE_COUNT=$(printf '%s\n' "$CANDIDATE_LIST" | wc -l | tr -d ' ')
echo "candidate tracked-content files: $CANDIDATE_COUNT"

# A scan that examined nothing must never report PASS. If there is genuinely nothing to commit that
# is a legitimate state, but it is stated rather than silently rendered as a clean bill of health.
if [ "$CANDIDATE_COUNT" -eq 0 ]; then
  echo
  echo "SECRET SCAN: NOTHING TO SCAN — no candidate tracked content. This is not a PASS."
  exit 2
fi

HITS=0
for pattern in "${PATTERNS[@]}"; do
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    [ -f "$f" ] || continue
    if match=$(grep -InEm1 "$pattern" "$f" 2>/dev/null); then
      echo "  HIT  $f: ${match%%:*} matches /$pattern/"
      HITS=$((HITS+1))
    fi
  done <<EOF
$CANDIDATE_LIST
EOF
done

# An ignored-file sanity check: prove the operator secret file is genuinely outside the candidate set.
if git check-ignore -q .env 2>/dev/null; then
  echo "  ok   .env is gitignored"
else
  echo "  WARN .env is NOT gitignored"
  HITS=$((HITS+1))
fi
for tracked_env in $(git ls-files | grep -E '(^|/)\.env($|\.)' | grep -v '\.example$'); do
  echo "  HIT  a non-example environment file is TRACKED: $tracked_env"
  HITS=$((HITS+1))
done

if [ "$SCAN_HISTORY" = "1" ]; then
  echo
  echo "scanning full git history..."
  for pattern in "${PATTERNS[@]}"; do
    if match=$(git grep -InE "$pattern" $(git rev-list --all) -- . 2>/dev/null \
               | grep -Ev "$EXCLUDE_RE" | head -3); then
      if [ -n "$match" ]; then
        echo "  HISTORY HIT /$pattern/:"
        echo "$match" | sed 's/^/    /'
        HITS=$((HITS+1))
      fi
    fi
  done
fi

echo
if [ "$HITS" -eq 0 ]; then
  echo "SECRET SCAN PASS — no credential shape found in the candidate tracked content."
  exit 0
fi
echo "SECRET SCAN FAIL — $HITS finding(s). Do not commit."
exit 1
