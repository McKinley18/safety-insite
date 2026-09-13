# Safety InSite — project documentation

**Safety InSite** is the application. **HazLenz** is the governed safety-intelligence engine inside
it. These are the only live product names; earlier names survive only as internal identifiers pinned
by compatibility, each recorded in the
[brand compatibility register](current/BRAND-COMPATIBILITY-REGISTER.md).

This directory is the single documentation root. **Documents outside `project-docs/` should not be
treated as current product documentation unless they are explicitly evidence, code-adjacent
technical documentation, or generated references.**

## Navigation

| area | start here | what it covers |
|---|---|---|
| **Current state** | [current/CURRENT-STATE.md](current/CURRENT-STATE.md) | what exists now, what is live, what blocks release |
| | [current/PRODUCT-OVERVIEW.md](current/PRODUCT-OVERVIEW.md) | what the product does and for whom |
| | [current/BETA-READINESS.md](current/BETA-READINESS.md) | the open blockers and who owns each |
| | [current/CAPABILITY-REGISTER.md](current/CAPABILITY-REGISTER.md) | what may and may not be claimed |
| | [current/BRAND-COMPATIBILITY-REGISTER.md](current/BRAND-COMPATIBILITY-REGISTER.md) | retained legacy identifiers and why |
| **Architecture** | [architecture/SYSTEM-ARCHITECTURE.md](architecture/SYSTEM-ARCHITECTURE.md) | frontend, backend, database, storage, billing, auth |
| | [architecture/HAZLENZ-ARCHITECTURE.md](architecture/HAZLENZ-ARCHITECTURE.md) | the engine's layers and authority boundaries |
| | [architecture/DATA-ARCHITECTURE.md](architecture/DATA-ARCHITECTURE.md) | entities, persistence, object storage, lifecycle |
| | [architecture/SECURITY-AND-AUTHORITY.md](architecture/SECURITY-AND-AUTHORITY.md) | auth, tenancy, entitlements, fail-closed rules |
| | [architecture/HAZLENZ-INVARIANTS.md](architecture/HAZLENZ-INVARIANTS.md) | the rules that must hold. Read before engine work |
| **Operations** | [operations/LOCAL-DEVELOPMENT.md](operations/LOCAL-DEVELOPMENT.md) | running it on a laptop |
| | [operations/DEPLOYMENT-RUNBOOK.md](operations/DEPLOYMENT-RUNBOOK.md) | **the** release procedure. Its ordering is a safety property |
| | [operations/ROLLBACK-MODEL.md](operations/ROLLBACK-MODEL.md) | what may and may not be undone |
| | [operations/BACKUP-AND-RESTORE.md](operations/BACKUP-AND-RESTORE.md) | backup posture and the rehearsed restore |
| | [operations/BETA-OPERATIONS.md](operations/BETA-OPERATIONS.md) | running the controlled beta day to day |
| | [operations/MONITORING.md](operations/MONITORING.md) | what is watched and how to review it |
| **Legal** | [legal/README.md](legal/README.md) | the drafts, all pending counsel review |
| | [legal/COUNSEL-REVIEW-PACKET.md](legal/COUNSEL-REVIEW-PACKET.md) | what counsel is being asked |
| **Historical** | [historical/README.md](historical/README.md) | superseded material, kept for context only |

## What is deliberately not here

**Frozen verification evidence lives in `verification/`, not here.** Those packages, manifests,
digests and fixtures record what was actually built and measured, often under retired names. They
are never edited to match current documentation — doing so would destroy the provenance that makes
them evidence. `verification/current/` holds the machine-readable current-state manifest that
`npm run hazlenz:verify` checks.

Code-adjacent technical notes stay next to the code they describe (for example
`backend/src/hazlenz/coverage/RENDER_PRODUCTION_DIAGNOSTICS.md`). They document a module, not
the product.

## Source-of-truth rule

One subject, one authoritative active document. If two documents describe the same current
subject, one of them is wrong and must be merged or archived — not kept "just in case". The
authoritative document for each subject is the one linked in the table above.
