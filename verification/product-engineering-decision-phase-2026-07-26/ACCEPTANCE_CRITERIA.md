# Acceptance criteria

## Architecture

- One TypeORM entity and migration path per canonical concept.
- Zero active competing persistence paths for finalized workflow data.
- Entity/schema diff is empty on a clean database.
- `synchronize` is disabled; migrations are 100% explicit.

## Ownership and authorization

- User can operate with zero or one active membership.
- Every site satisfies user/org XOR ownership.
- Children inherit immutable scope from site/inspection.
- A1/A2 draft/finalized rules and B1 denials pass at controller/database level.
- Platform support access is explicit, expiring, reason-bearing, and audited.
- Every active route has a matrix result; foreign records consistently return 404.

## Workflow persistence

- Site, inspection draft, observation, analysis snapshot, review, finding, action, task, completed inspection, report metadata, and file survive full reload and login renewal.
- HazLenz snapshot and human review are distinct and immutable.
- No UI success appears before durable commit.
- Duplicate requests are idempotent and concurrent edits use versions.

## Reports and files

- Only completed inspection revisions generate reports.
- Every generation produces an immutable version or explicit failure.
- Object keys are not exposed; unauthenticated/cross-tenant access fails.
- Active content, spoofed MIME, oversize and traversal remain rejected.

## Entitlements

- Free, Pro, Pilot, expired/revoked, and Test paths pass.
- Test fixture refuses production and non-disposable databases.
- Frontend cannot override backend access.

## Database reconciliation

- Two restored clones produce identical mapped/quarantined counts and fingerprint.
- Mapped plus quarantined equals source rows for every migrated family.
- Zero guessed owners and zero unexpected orphans.
- Backup restore/rollback is demonstrated before live migration.

## Release gate

- Backend/frontend builds, critical lint, migrations, authorization, upload/file, entitlement, billing, workflow and browser tests pass.
- Full browser workflow verifies database and object-store effects.
- Gate passes twice from clean disposable infrastructure and returns nonzero on injected failure.
- Production logs contain no passwords, tokens, reset links, storage credentials, or signed URLs.

## Pilot operational gate

Invite-only approved users, qualified HazLenz review, advisory report language, monitored production email, daily backup, tested restore, support owner, alerting, rollback, and acceptable measured memory/latency. Public production and unsupervised HazLenz remain out of scope.
