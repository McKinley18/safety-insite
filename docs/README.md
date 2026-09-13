# This directory is not project documentation

**Project documentation lives in [`../project-docs/`](../project-docs/README.md).** Nothing here is
current. What remains are forwarding stubs and one machine-readable artifact.

## Why this directory still exists

§273 moved every document out of here into `project-docs/`. It could not simply delete the vacated
paths, because **each of them is digested as a member of a frozen verification manifest** — the
§223 frozen-acceptance computation and the 2026-09-07 checkpoint-consolidation manifests both record
`docs/…` files by path and SHA-256.

The evidence guard distinguishes two things deliberately:

- a manifest member whose **bytes changed** is *external reference drift* — expected, tolerated, and
  explicitly described in `backend/scripts/hazlenz/evidence-integrity.ts` as "a historical pointer
  doing its job";
- a manifest member that is **absent** is a fault.

That asymmetry is correct: it means ongoing development is free, but nobody can quietly delete
something the evidence base depends on. Moving these files out tripped 37 `MEMBER_ABSENT` faults
across two frozen manifests. The guard has a baseline mechanism that could have absorbed them, and
using it would have been weakening a gate to obtain a pass — so §273 did not.

Leaving a stub at each path is the resolution that satisfies both rules: the path stays populated,
no frozen evidence is edited, and the reader is sent to the real document.

## What is here

- **22 forwarding stubs**, each naming the document's new location.
- `INSITE_CURRENT_STATE.json` — a state manifest read at this exact path by
  `backend/scripts/test-201-harness-hardening.ts`, itself a digested member of a frozen manifest.
  Moving either would break a frozen instrument.

## Where to actually go

| you want | read |
|---|---|
| the current state of the product | [`../project-docs/current/CURRENT-STATE.md`](../project-docs/current/CURRENT-STATE.md) |
| what blocks release | [`../project-docs/current/BETA-READINESS.md`](../project-docs/current/BETA-READINESS.md) |
| how to run or release it | [`../project-docs/operations/`](../project-docs/operations/DEPLOYMENT-RUNBOOK.md) |
| anything else | [`../project-docs/README.md`](../project-docs/README.md) |
