# Historical documentation

**These documents are historical. They do not represent the current product architecture, release
state, or operating instructions. Do not use them as current references.**

They are kept because they record why the system is shaped the way it is, and because deleting them
would erase the reasoning behind decisions that are still in force. They retain the retired product
names (SafeScope, Sentinel Safety, AuditAlly, GuideGuard, SightSignal, ReviewCore) because that is
what those documents actually said at the time. That is deliberate and must not be "fixed".

For anything current, start at [`../README.md`](../README.md).

## What is in here

| directory | what it is |
|---|---|
| `00-index/` | early project indexes and generation prompts from the SafeScope era |
| `01-checkpoints/` | development checkpoints, superseded by the verification packages |
| `02-architecture/` | SafeScope-era architecture and orchestrator plans |
| `03-production-readiness/` | an earlier readiness plan, superseded by `current/BETA-READINESS.md` |
| `04-safescope-engine/` | engine documentation from before the HazLenz naming |
| `05-deployment/` | a staging-deployment note, superseded by `operations/DEPLOYMENT-RUNBOOK.md` |
| `05-source-intelligence/` | source-intelligence design material |
| `06-validation-and-gauntlets/` | early gauntlet design, superseded by `verification/` |
| `07-ui-ux/` | earlier UI/UX exploration |
| `08-audits/` | generated audit outputs. Several are still written by scripts under `backend/scripts/` |
| `09-archive-reference/` | previously archived reference material |
| `10-business-launch/` | commercial planning material |
| `historical-blueprints/` | the root-level blueprint and transition prompts relocated in §272 |
| `engineering-blueprint/` | the 28k-line engineering blueprint and build blueprints |
| `hazlenz-governance/` | governance and consolidation plans, including the §223 source-of-truth analysis |
| `superseded-209/` | Expert HazLenz state documents explicitly superseded at §209 |
| `notes/` | assorted superseded notes, roadmaps and integration write-ups |

## A caution about `08-audits/`

Some scripts in `backend/scripts/` still write their output into `historical/08-audits/`. Those
files are generated artifacts, not curated documentation; a fresh run overwrites them. They are
archived here because the audits themselves are historical, not because the outputs are precious.
