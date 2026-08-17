# Safety InSite — Operating Instructions

## Autonomous development

Work autonomously until the requested task is complete or a genuine decision requiring user judgment blocks progress.

You are authorized to inspect/search repository files and run normal development and verification commands without asking for routine confirmation, including relevant tests, builds, linters, type checks, git inspection, deterministic verification scripts, scorers, and disposable local development/verification services.

Do not stop merely to ask what to do next when the requested objective and repository evidence determine the next step.

Diagnose before editing. Establish the actual root cause from repository evidence before modifying production code.

Prefer the smallest generalized correction that fixes the demonstrated defect. Avoid speculative fixes, broad heuristics, unrelated refactors, or tuning merely to make a test pass.

## Existing worktree protection

Assume the repository may contain substantial legitimate uncommitted work. Preserve all unrelated existing work.

Never:

- reset the repository or files
- use `git reset`
- use `git checkout --` to discard changes
- use `git restore` to discard changes
- stash existing work
- run destructive `git clean`
- overwrite unrelated changes
- revert changes merely because they were not created during the current task

Inspect `git status` and relevant diffs before making changes. If a target file already contains modifications, understand and preserve them while making the narrow requested change.

## Git and remote boundaries

Do not commit. Do not push. Do not create or modify remote branches. Do not open pull requests. Do not deploy. Do not alter remote infrastructure or production systems.

These actions require explicit user authorization.

## Data protection

Do not modify, reset, migrate destructively, or seed over the original development database.

For verification requiring mutable database state, use disposable verification databases/services where the existing project workflow supports them.

Never access or modify production data unless explicitly authorized.

Before any migration, seed, destructive, schema-changing, or otherwise mutable database command: determine the actual resolved database target using the repository's real configuration precedence (in this repository, `DATABASE_URL` takes precedence over discrete `DB_*` variables wherever the runtime/data-source honors it — do not assume `DB_*` overrides win); print/verify the resolved host and database name before executing; refuse to execute unless that target is positively proven disposable (an explicitly temporary/test/verification database created for the current verification workflow); never run migrations, seeds, schema mutations, destructive commands, or mutable verification against the original `safescope` development database, even when the command is expected to be a no-op; if `DATABASE_URL` could redirect the command away from the intended disposable target, explicitly override/unset it as required and re-verify the resolved target before execution.

## HazLenz verification integrity

Treat frozen verification contracts, canonical scorers, manifests, adjudications, and protected test artifacts as evidence/governance surfaces.

Do not weaken, rewrite, bypass, mock, disable, or relax a scorer, expected result, assertion, quality threshold, authorization requirement, persistence requirement, or protected verification gate merely to obtain a passing result.

Do not change production because a test fails until determining whether the failure represents:

1. a genuine production defect,
2. a taxonomy/alias/adjudication issue,
3. a verification-infrastructure problem, or
4. an invalid/stale expectation.

When authoritative frozen contracts exist, use them rather than guessing expected behavior.

## Verification

After an implementation change, run the narrowest relevant verification first. Expand verification according to demonstrated regression risk and the repository's existing verification-tier policy.

Do not claim a test, build, scorer, or command passed unless it was actually executed successfully.

When hashes matter, calculate them from the actual files rather than copying expected values from the task description.

When reporting a production modification, verify the resulting diff and file hash.

## Interaction policy

Do not ask the user questions whose answers can be determined by:

- inspecting repository files
- searching existing documentation/artifacts
- running non-destructive commands
- executing tests or diagnostics
- applying reasonable engineering judgment within the stated constraints

Ask only when:

- materially different interpretations cannot be resolved from available evidence;
- credentials/external authorization are required;
- an action would affect production, remote systems, or unrelated user work;
- a destructive or irreversible operation is genuinely necessary; or
- a product/policy decision belongs to the user rather than engineering evidence.

When blocked, explain the exact blocker and the decision required.

## Completion reports

At the end of substantial work, report:

- root cause established
- files changed
- substantive behavior changed
- verification actually executed and results
- relevant remaining uncertainty
- repository/worktree state
- whether any broader verification remains required

Keep reports evidence-based and distinguish measured results from inference.
