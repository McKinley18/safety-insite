# V5 Midpoint Audit — Phase 7: Corrective-Action Intelligence Triage

## 1. Corrective Action Intelligence Benchmark — REAL_PRODUCT_DEFECT

Location: `backend/src/safescope-v2/tests/corrective-action-benchmark.ts`, invoked from
`hazlenz-core-regression.ts:19-21`. Run read-only:

```
📊 Corrective Action Benchmark Summary: 1 passed, 3 failed.
```

Scenarios 1–3 (conveyor/machine-guarding, electrical, fall) fail on "narrative references parsed
equipment/components" and "tailored phrase" assertions.

**Root cause** (traced in `backend/src/safescope-v2/brain/corrective-action-brain/corrective-
action.service.ts`, currently uncommitted, +78/-1 vs HEAD `24e37703`): the working-tree diff added a new
`domainIs*`/fallback-context block (lines 42-112) that runs *before* the pre-existing, richer
`observationUnderstanding`-driven block. The guard at line 114 —
`if (observationUnderstanding && !(domainIsWalking || ... || domainIsGuarding))` — means the new generic
block now **shadows** the older component-aware narrative generator whenever the scenario's domain
matches guarding/electrical/fall/mobile/walking, which is exactly when the benchmark's scenarios fire.

Result: narratives that used to interpolate the parsed equipment/component (e.g. `"...around the exposed
${componentLabel || "tail pulley"}..."`, line 138) are now replaced by static domain boilerplate
(`"Stop access to the exposed moving interface..."`, line 71).

`CorrectiveActionBrainService` is `LIVE_AND_EFFECTIVE` per the C04 disposition map; its output surfaces in
the live API response as `correctiveActionReasoning`.

**Classification: REAL_PRODUCT_DEFECT.** Severity: moderate — does not block or corrupt the workflow
(output remains valid and safety-appropriate) but is a genuine loss of tailored-to-observation quality
that the benchmark correctly caught. It is currently **uncommitted**, so it has not shipped, but it sits
in the same working tree this audit evaluated and should be resolved (or its intent confirmed as
deliberate) before it lands, independent of any further evidence-architecture work.

## 2. DefensibleCorrectiveActionService validation failures — STALE_TEST

`DefensibleCorrectiveActionService` (`backend/src/safescope-v2/defensible-corrective-action/dca.
service.ts`) is live (`intelligence-orchestrator.service.ts:139`, `.evaluateDCA()` called), confirmed
`LIVE_AND_EFFECTIVE`/`KEEP` in the C04 map, though its output is intentionally excluded from the API
response by the display sanitizer. Ran `backend/scripts/validate-safescope-defensible-corrective-
action.ts` read-only:

```
✅ DCA-001..004
❌ DCA-005: DCA output used prohibited violation/citation/compliance language
❌ DCA-006: DCA output used prohibited violation/citation/compliance language
```

Traced with an instrumented scratch copy (deleted after use, not committed): both failures match the
literal word **"citation"** inside `blockedActions`, from `dca.service.ts:123`: `'Compliance, citation,
or regulatory conclusion language is blocked until jurisdiction and applicability are reviewed.'` — the
engine's own *disclosure that it is withholding* citation language. The test's `noProhibitedLanguage`
check (`validate-safescope-defensible-corrective-action.ts:225-229`) does a blunt substring scan over the
entire JSON-stringified output including `blockedActions`, flagging the disclaimer as if it were
prohibited content itself.

This is a pre-existing, previously-documented failure ("2-case failure — C04-documented," carried
unchanged through C02/C03/C04 per `verification/hazlenz-v5-c02-shared-evidence-facts-2026-08-16/
V5_C02_VERIFICATION.md:79`), **not introduced by anything in the current diff** (`dca.service.ts` is not
in the modified file list).

**Classification: STALE_TEST** — test-infrastructure false positive; the assertion is too blunt to
distinguish "we blocked citation language" from "we emitted a citation." Severity: low — DCA output never
reaches a live user (sanitized out of the API response), so this cannot corrupt or block a real workflow.

## 3. Stale corrective-action DTO fixture — FIXTURE_DRIFT

Both `backend/src/corrective-actions/dto/corrective-action.dto.ts` and `backend/src/corrective-actions/
entities/corrective-action.entity.ts` are modified in the working tree: `reportId` changed from a required
plain-string DTO field / untyped `@Column()` to `@IsOptional() reportId?: string` and
`@Column({ type: 'uuid', nullable: true })` respectively, with a new `inspectionId` field added.

`backend/scripts/smoke-corrective-actions-organization-scope.ts:78` still constructs its fixture as
`reportId: \`smoke-report-${Date.now()}\`` — a non-UUID placeholder string. The DTO's `@IsString()`
validator would accept this, but the entity's `reportId` column is now typed `uuid`; on
`manager.getRepository(CorrectiveAction).save(action)` (`corrective-actions.service.ts:203`) Postgres
would reject it with an invalid-uuid-syntax error.

This script was **not executed** (it performs a real `dataSource.initialize()`/insert/delete against
whatever DB `data-source.ts` resolves to, and no disposable target was positively verified per operating
constraints) — this is a static-analysis finding from the type diff, not an observed runtime failure.

**Classification: FIXTURE_DRIFT** — the fixture wasn't updated after the entity's column type change.
Severity: low, confined to a verification script; would not corrupt production data (the script writes and
deletes only its own rows) but would currently fail if run as-is.

## Severity ranking and outranking assessment

Of the three, only item 1 (benchmark regression) reflects a live, currently-shipping-if-committed defect
in a real intelligence path. It does **not** rise to a level that should outrank further
evidence-architecture work — it is a narrow, low-blast-radius quality regression (narrative specificity),
not a correctness or safety failure, and is quick to fix or reverse. It is flagged as an urgent
housekeeping item to resolve before the current working-tree changes are committed, independent of the
strategic phase sequencing recommended in `V5_MIDPOINT_BACKLOG.md`.
