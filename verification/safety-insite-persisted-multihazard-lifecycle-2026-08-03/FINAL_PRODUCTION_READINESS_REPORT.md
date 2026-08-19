# Final production-readiness report — persisted multi-hazard lifecycle

## Verdict

**NOT READY**

## Executive result

The canonical persistence defect was materially fixed: accepted decomposition hazards now become first-class `InspectionFinding` rows with stable hazard keys, analysis linkage, transactional reconciliation, reload persistence, historical supersession, downstream action/task links, and current-only report snapshots. Real Chromium evidence exercised guarding/energy, electrical/fall, and hot-work/gas scenarios, including analysis, clarification, reanalysis, reload, risk/action stages, finalization, tasks, report download, and PDF visual review.

This phase does not pass its exit criteria. Risk remains observation-scoped rather than finding-scoped; complete finding/resource authorization and audit coverage are not proven; report version-2 historical mutation and full browser stale/duplicate matrices remain incomplete. The application is not safe for general production deployment. A supervised internal pilot remains possible only with qualified review and manual controls, but should not be represented as production readiness.

## Repository state

Repository `/Users/mckinley/Desktop/Safety_InSite`, branch `main`, expected HEAD unchanged at `24e37703ff37d96b0e42cde4b85ccdef89b2bf2a`. Initial status count was 204 and final count must be recorded after cleanup; existing unrelated dirty work was preserved. No commit or push occurred. Original development DB was not targeted; disposable DB was `phase9_persisted_multihazard`. Disposable backend/frontend/Postgres/MinIO services were used and must be stopped after handoff. `git diff --check` and protected HazLenz hash comparison are required final checks.

## Architecture

The root cause was a single-finding canonical workflow that treated multi-hazard decomposition as ephemeral UI output. The durable identity is observation plus normalized stable hazard key, with originating analysis linkage and superseded status. Reconciliation reuses stable findings, creates new findings, and preserves removed findings historically. The migration is backward compatible with legacy `primary` rows. Existing advisory locking/version checks serialize accepted analysis transitions.

## Scenario results

Electrical/fall inspection `90fded51-5dbf-4d80-ba2b-5eca811a8fe7` persisted four routed active findings, four actions/tasks, completed state, and report checksum `41a424e50a111164e2dd80911dde597375612236d0206142eab082207175ceb4`.

Guarding/energy fresh inspection `7e09abad-ab41-4267-988a-dd6eea6d1811` retained two finding cards after reload and produced report `090212a0-afe7-45d3-99e6-8978d09a8006` v1, 2597 bytes, checksum `b4ba17023eb5ca7cfde03429d48f4b3ec03861a62d19808c85e74130d57875e4`. The engine’s routed keys were machine-guarding and hot-work for this specific evidence; no claim is made that engine output is exactly the scenario label.

Hot-work/gas inspection `e03e7e4b-91a4-46ab-a38c-83e7fb2e39f8` persisted compressed-gas, hot-work, and an additional routed machine-guarding finding, three actions/tasks, and report checksum `e3e456e757e6060936a274b55b55b4d468922581cfb01c6ec2da17c4a61b3bdd`. No unsupported leak, damage, concentration, cap, securing, or storage fact was invented.

## Concurrency and idempotency

Focused persistence regression: two initial findings; duplicate replay created no additional findings; reanalysis added and removed keys deterministically; stale request returned 409; exactly one current analysis remained. Browser report duplicate generation returned the same report ID/version/checksum. Full browser stale/duplicate risk, actions, tasks, finalization, and concurrent report matrices remain incomplete.

## Reports and PDF

Owner download was HTTP 200 and checksum matched stored object bytes. Foreign report access was HTTP 404. A report snapshot defect was fixed so superseded findings are excluded from current PDFs. Visual inspection of `report-latest-filtered.pdf` showed two current findings, hazard-specific actions, readable spacing, no clipping, and no overlap. Version-2 historical mutation after a legitimate source change is not yet proven.

## Authorization and audit

Existing evidence covers authenticated owner flows, cross-user regression denials, and foreign report 404. It does not yet constitute the requested complete matrix for current/historical findings, evidence, tasks, audit, same-organization roles, and cross-organization mutations. Materialization/reconciliation audit events are not fully covered. These are High blockers.

## Quality and safety

Backend build, migration, focused persisted-finding regression, canonical workflow regression, frontend typecheck, targeted lint, and supported production build passed. Global frontend lint remains 502 errors/115 warnings. No HazLenz reasoning files changed; prior valid baseline is retained: 129 cases, 113 PASS, 16 NEEDS REVIEW, 0 FAIL, 0 pending leaks, 0 transport failures, and 81/81 life-critical repeatability stable over 243 runs.

Offline, accessibility/responsive/theme, performance, live storage, regulatory qualification, and operational rehearsal remain open release gates.
