# Safety InSite / HazLenz Agent Instructions

Repository root:
`/Users/mckinley/Desktop/Safety_InSite`

## Hard repository boundary

Work only inside this repository unless the user explicitly authorizes otherwise.

Do not search or inspect:

- `/Users/mckinley`
- `~/sentinel_test`
- `~/Sentinel_Safety`
- old backups
- unrelated repositories
- unrelated home-directory projects

Do not use broad filesystem searches outside this repository.

If something is not found here, report that instead of searching elsewhere.

## Known important paths

Production HazLenz source:

- `backend/src/safescope-v2/safescope-v2.service.ts`
- `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts`

Authoritative verification root:

- `verification/hazlenz-temporal-foundation-2026-08-09`

Reuse existing verification scripts, fixtures, scorers, ledgers, manifests, and runners before creating new ones.

## Operating mode

Work autonomously on routine engineering tasks.

Do not ask the user for approval before:

- reading repository files
- editing files within this repository
- running shell commands
- running npm/node/npx commands
- running tests
- running builds
- starting/stopping disposable PostgreSQL
- creating/dropping disposable test databases
- running migrations on disposable databases
- starting/stopping disposable backend/frontend services
- running curl/API verification
- retrying transport failures
- generating verification artifacts
- hashing files/artifacts
- cleaning phase-specific temporary files
- removing clearly generated stale `.next` cache artifacts

Make routine technical decisions yourself.

## Hard safeguards

Do not:

- commit
- push
- deploy
- mutate production data
- mutate the development `safescope` database
- reset/stash/checkout unrelated working-tree changes
- delete unrelated user work
- overwrite unrelated files
- perform destructive git operations
- weaken verification gates
- change frozen expectations merely because production disagrees

Preserve unrelated work.

## Efficiency rules

Be conservative with tokens and tool calls.

Prefer:

- targeted `rg`/`grep`
- small line-range reads
- existing runners
- existing fixtures
- existing artifacts
- focused verification before broad verification

Avoid:

- listing entire repositories
- reading whole large service files
- repeated architecture discovery
- broad `find` commands
- searching for hashes already supplied
- recreating runners that already exist
- creating duplicate artifacts
- verbose command-by-command narration
- dumping large logs into chat

If an existing artifact already proves a fact, reuse it.

Diagnose before editing.

Make the smallest generalized correction at the first lost stage.

Prefer:

- family-local
- clause-local
- finding-local

changes over shared architectural changes.

## Verification behavior

Transport failures are not semantic failures.

For transport-only failures:

1. preserve the original result;
2. retry the exact same fixture on the same candidate;
3. preserve the retry result;
4. distinguish transport from semantic failure.

Run full Tier-3 only when required by the current milestone policy or when shared/high-risk logic changes.

## Reporting

Keep final reports concise.

Report:

- candidate hashes
- exact target rows
- root cause / first lost stage
- files changed
- focused verification
- regressions
- Tier decision
- builds/static
- final hashes
- remaining cluster count
- next recommendation

Do not include command transcripts unless specifically requested.
