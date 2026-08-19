# Production Readiness — Release Gate Decision

**Decision: `NOT_PRODUCTION_READY`**

## Why

Release readiness requires zero unresolved P0 and zero unresolved P1. This audit found:

- **P0: 0**
- **P1: 1** — [PRA-002](./PRODUCTION_READINESS_ISSUES.json): inspection finalization (`POST /inspections/:id/transition` → `completed`) is unconditionally and deterministically rejected with HTTP 400 whenever a multi-hazard observation is correctly split into 2+ findings that share one human review. This is the core, explicitly-designed multi-hazard decomposition capability that the majority of this session's prior engineering work (RM-1–RM-5, FM-198, the 228/228 V4 family matrix) was built to produce. Root-caused to a non-deduplicated array passed into a `Repository.count({where:[...]})` call in `backend/src/inspection/inspection.service.ts`, confirmed with live reproduction, DB-state inspection proving the underlying data was fully valid, and a passing corroborating control (distinct-review findings complete normally).
- **P2: 3** — PRA-001 (raw JSON error surfaced on the older `/inspection` route), PRA-005 (two parallel inspection entry points with different persistence models), PRA-006 (risk assessment captured once per analysis rather than per finding).
- **P3: 3** — PRA-003 (CSV export lacks field escaping), PRA-004 (dead/unwired duplicate reports code including `.bak`/`.broken` files), PRA-007 (`corrective_actions` lacks FK constraints).

PRA-002 alone is sufficient to fail the gate: it materially breaks the primary inspection journey for any multi-hazard case, which is an explicitly required Domain 5 sub-scenario, not an edge case.

## What already passes

- Production builds (backend `tsc`, frontend `next build`) — PASS
- Clean disposable migration/bootstrap (34/34 migrations, fresh DB) — PASS
- Primary inspection workflow — PASS for single-hazard/simple cases; **FAILS at finalization for the multi-hazard split case (PRA-002)**
- HazLenz integration (rendering, structured facts, clarification questions, multi-hazard decomposition surfacing in the UI) — PASS
- Finding persistence/reload — PASS (except the finalization step blocked by PRA-002)
- Risk review — PASS with a real product gap noted (PRA-006, P2, does not block the gate on its own)
- Corrective-action linkage — PASS (creation, cross-user denial, task/calendar projection, status transitions)
- Report/PDF critical path — PASS (real PDF generation, versioning, immutability, checksum integrity, cross-user denial)
- Auth/authz critical path — PASS (IDOR-tested, rate-limited, enumeration-safe, production-config fail-fast gate independently verified)
- No known critical data-loss path — PASS (FK/cascade audit clean; PRA-002's failure mode is a blocked transition, not data loss — all data remains persisted and readable)

## Minimum change required to cross the gate

Fix PRA-002 only: deduplicate the `reviewIds` array (e.g. `[...new Set(reviewIds)]`) before the `Repository.count({where:...})` call in `inspection.service.ts`'s `transition()` method, and compare the resulting count against the number of *distinct* required review ids rather than `active.length` (the finding count). This is a small, narrowly-scoped, single-file logic fix. No schema change, no migration, no other file requires modification to cross the gate.

After that fix is verified (re-run `test-canonical-workflow.ts` and `test-finding-scoped-reviews.ts` live against a disposable DB to confirm both the previously-failing multi-hazard case and the already-passing distinct-review case still pass), the gate would move to `PRODUCTION_READY_WITH_KNOWN_P2_P3` provided the 3 P2 items are explicitly documented as known/accepted for launch, or `PRODUCTION_READY` if any subset of them are also addressed.

**No remediation was performed in this pass**, per the audit's explicit instruction to stop after diagnosis and report.
