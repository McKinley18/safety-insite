# Production SHADOW — operator runbook

> ### THIS RUNBOOK DOES NOT AUTHORIZE EXECUTION.
> It describes how a production shadow **would** be run if someone with the authority to decide that
> decided it. At the time of writing, production SHADOW is **disabled**, no acknowledgement value is
> set in any production environment, and no cohort exists. Reading this document is not approval;
> nothing below may be executed without a separate, explicit authorization.

Environment-variable **names** and placeholder values only. No secrets, no real account ids, no real
hostnames appear here or should ever be added.

---

## 0. The lock model, in one place

Production SHADOW requires **all four locks open** and **neither disabling override engaged**.

| # | Lock | Variable | Opens on |
|---|---|---|---|
| 1 | server mode | `GOVERNED_CUTOVER_MODE` | exactly `SHADOW` |
| 2 | principal eligibility | `GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST` / `GOVERNED_CUTOVER_ORG_ALLOWLIST` | the authenticated principal appears, within the stage ceiling |
| 3 | governed-cutover production ack (KG-4A) | `GOVERNED_CUTOVER_PRODUCTION_ACK` | exactly `I_ACKNOWLEDGE_GOVERNED_CUTOVER` |
| 4 | production-shadow ack (KG-4C) | `GOVERNED_CUTOVER_PRODUCTION_SHADOW_ACK` | exactly `I_ACKNOWLEDGE_PRODUCTION_SHADOW` |

| Override | Variable | Engages on |
|---|---|---|
| kill switch | `GOVERNED_CUTOVER_KILL_SWITCH` | **any** non-empty value |
| circuit breaker | in-process latch | any hard invariant, or a rate above its stop threshold |

Also required: `GOVERNED_CUTOVER_SHADOW_STAGE` at something other than `STAGE_0_DISABLED`.

**The two acknowledgements are not interchangeable.** Lock 4 authorizes SHADOW and nothing else —
it cannot be reused as consent to change customer output. Lock 3 alone does not authorize a
production shadow.

---

## 1. Preflight

- [ ] Repository at the intended commit; `git status` inspected; nothing unintended in the tree.
- [ ] `npm run test:kg4c-production-shadow-contract` → **438 passed, 0 failed**
- [ ] `npm run test:kg4c-disabled-deployment` → **80 passed, 0 failed**
- [ ] `npm run test:kg4c-db-ownership` → **31 passed, 0 failed**
- [ ] `npm run test:kg4a-default-off` → **51/51**; `npm run test:kg4b-default-off` → **48/48**
- [ ] KG-3F foundation reproduced: **170 · 54 · 16 · 48 · 57**
- [ ] Backend `npm run build` exit 0; `frontend-next` `npx tsc --noEmit` exit 0
- [ ] `npm run test:hazlenz-core` → 28 of 30 suites, **only** the two documented baseline failures
- [ ] Production currently resolves `LEGACY`, verified against the live environment, not assumed.

## 2. Deployment prerequisites, in this order

1. **Migrations.** `1800000014000-ApprovalProvenanceContract` must be applied **before**
   `seed:safescope-standards` runs anywhere. With SHADOW off it is not on the customer path
   (LEGACY never reads the active-release pointer — proven by `test:kg4c-disabled-deployment`), but
   it must precede any finalization.
2. **Code.** Deploy with every cutover variable unset. This is a proven customer no-op: 9 disabled
   configurations each resolve `LEGACY`, create no context, emit no telemetry, and record no
   governed provenance.
3. **Environment.** Nothing yet. Do not set any cutover variable in this step.
4. **Telemetry dependency.** Confirm the platform log pipeline is collecting stdout JSON and that its
   retention matches §14 of the KG-4C record. The application cannot enforce retention; if the
   pipeline is not ready, shadow produces no usable evidence and there is no point starting.
5. **Activation.** Only now, and only with a separate authorization.

## 3. Enabling (the three-step sequence)

Set, in one deliberate configuration change:

```
GOVERNED_CUTOVER_MODE=SHADOW
GOVERNED_CUTOVER_SHADOW_STAGE=STAGE_1_SINGLE_ACCOUNT
GOVERNED_CUTOVER_ACCOUNT_ALLOWLIST=<ONE internal account id>
GOVERNED_CUTOVER_PRODUCTION_ACK=I_ACKNOWLEDGE_GOVERNED_CUTOVER
GOVERNED_CUTOVER_PRODUCTION_SHADOW_ACK=I_ACKNOWLEDGE_PRODUCTION_SHADOW
GOVERNED_CUTOVER_OBSERVABILITY=enabled
```

`STAGE_1_SINGLE_ACCOUNT` permits **exactly one** named principal. Two entries in the allowlist is
refused with `STAGE_PRINCIPAL_LIMIT_EXCEEDED` rather than silently widened.

## 4. First cohort

**One internal or test account. Never an ordinary customer.**

The first cohort is not a sample; it is a smoke test of the mechanism in production conditions.
Deterministic percentage cohorts were rejected for the first cutover because a percentage names
nobody, and an operator must be able to say in advance exactly who is affected.

**Gates before Stage 2** (small explicit allowlist, ≤ 10 named accounts) — all must hold:

- [ ] ≥ 24 hours at Stage 1 with zero hard-invariant violations
- [ ] ≥ 100 shadow comparisons observed
- [ ] output-invariance mismatch count **0**, unverified count **0**
- [ ] shadow provenance violations **0**
- [ ] privacy violations **0**
- [ ] telemetry delivery ≥ 95%
- [ ] p95 shadow overhead within the 12 ms ceiling
- [ ] every BLOCKING mismatch, if any, individually reviewed and adjudicated

Stage 3 (deterministic cohort) additionally requires the Stage 2 gates met at ≥ 500 comparisons and a
separate authorization. There is no automatic promotion between any two stages.

## 5. Startup and health validation

- [ ] Service starts. (Startup **refuses** a production governed/shadow mode without lock 3 — so a
      successful start with SHADOW set is itself evidence lock 3 is present.)
- [ ] Logs show the mode resolving to `SHADOW` with reason `EXPLICIT_MODE`.
- [ ] A **non**-allowlisted request produces no shadow events.

## 6. First eligible request

- [ ] Allowlisted account submits one analysis.
- [ ] Exactly one `kg4c.shadow-comparison.v2` event per (analysis × distinct citation) appears.
- [ ] `customerOutputUnchanged: true` on every event.
- [ ] `shadowProvenanceNull: true` on every event.
- [ ] `outputInvarianceVerdict: INVARIANT`.

## 7. Customer invariance check

- [ ] `shadow_output_hash_mismatch` = **0**
- [ ] `shadow_output_hash_unverified` = **0** — INDETERMINATE is not a pass
- [ ] Persisted `hazlenz_analyses.knowledgeReleaseId` for the shadow account: **NULL**
- [ ] Persisted `inspection_findings.knowledgeReleaseId`: **NULL**
- [ ] Standard Detail for the shadow account shows no verified-text badge and no internal vocabulary

## 8. Telemetry check

- [ ] Events are structured single-line JSON with `schemaVersion: kg4c.shadow-comparison.v2`
- [ ] Every event carries only allowlisted fields
- [ ] `shadow_privacy_violation` = **0**
- [ ] `shadow_telemetry_dropped` within tolerance
- [ ] Event volume ≈ 2.2 per analysis (the KG-4B measured mean); a large deviation means the
      cardinality contract is not holding and is itself a finding

## 9. Metrics to watch

`shadow_eligible_requests` · `shadow_executed` · `shadow_skipped` · `shadow_comparisons`
(the denominator) · `shadow_exact_match` · `shadow_expected_fallback` · `shadow_review_mismatch` ·
`shadow_blocking_mismatch` · `shadow_resolver_failure` · `shadow_integrity_failure` ·
`shadow_output_hash_mismatch` · `shadow_output_hash_unverified` · `shadow_provenance_violation` ·
`shadow_privacy_violation` · `shadow_telemetry_dropped` · `shadow_overhead_p50_ms` ·
`shadow_overhead_p95_ms`

Aggregate by hazard family, jurisdiction, backing state, mismatch category, severity, root cause,
stage, release. **Never** by account, organization, user, inspection or correlation id.

## 10. Alerts

| Condition | Action |
|---|---|
| any hard invariant (7 of them) | **STOP immediately**, zero tolerance |
| resolver failure rate > 2% over ≥ 200 comparisons | **STOP** |
| telemetry failure rate > 5% over ≥ 200 | **STOP** |
| blocking mismatch rate > 0.1% over ≥ 500 | **STOP** |
| mean shadow overhead > 12 ms over ≥ 200 | **STOP** |
| any of the above above half its threshold | **REVIEW** |
| any individual BLOCKING mismatch, at any rate | **REVIEW** — reviewed individually, never only as a percentage |

Every threshold's derivation is recorded in `shadow-circuit-breaker.ts` and is tied to a KG-4B
measurement. None is a round number chosen for its looks.

## 11. Kill switch

**Fastest path:** set `GOVERNED_CUTOVER_KILL_SWITCH` to any non-empty value.

Effect: every future eligible request behaves as LEGACY. It does **not** roll back the corpus,
de-activate a release, revoke an approval, delete an event, or rewrite a customer record.

> **Operational limitation, stated honestly.** The kill switch is read from the process environment
> on every context creation, so a change takes effect on the **next** eligible request within a
> process that sees the new value. On a platform where environment changes require a restart or
> redeploy, **the kill switch requires that restart or redeploy.** There is no hot-reload mechanism
> in this codebase and none was invented for this runbook.
>
> The **circuit breaker's in-process latch is the genuinely immediate path**: it takes effect on the
> next request in that process with no restart, no configuration change and no database write — but
> it is engaged by the breaker, not by an operator. If an operator-triggered instant kill is
> required, that is a control-plane feature and it is KG-4D work, not a claim this runbook may make.

Clearing the mode (`GOVERNED_CUTOVER_MODE=LEGACY`) or emptying the allowlist are equivalent
configuration-level rollbacks with the same restart characteristics.

## 12. Circuit-breaker behaviour

Hard invariants trip on **one** occurrence with no sample floor. Rate conditions trip only once their
minimum sample is reached, so an early transient cannot stop a healthy run. A trip engages the
runtime kill switch and does nothing else.

## 13. Stop conditions

Stop immediately on: customer-output mutation, customer-output unverified, governed provenance
written in SHADOW, a privacy schema violation, an impossible approval/provenance integrity state, a
nondeterministic governed result, or a substituted citation.

## 14. Evidence collection

On any stop: capture the metric window, the categorical event stream for the affected release, and
the breaker verdict. **Never** capture raw customer payloads — the invariance mechanism deliberately
records path names and digests only, and that constraint is not relaxed during an incident.

## 15. Disabling

1. Engage the kill switch (fastest available), or set `GOVERNED_CUTOVER_MODE=LEGACY`.
2. Confirm the next eligible request produces no shadow events.
3. Confirm persisted provenance for subsequent analyses is NULL (it always was in SHADOW).
4. Leave historical records untouched — rollback is a mode change, never a rewrite.

## 16. Post-run review

- [ ] Mismatch distribution by category, severity and root cause, with the denominator stated
- [ ] Which of the eleven KG-4B-unobserved categories occurred, if any
- [ ] Every BLOCKING mismatch listed individually
- [ ] Coverage against the sample-sufficiency criteria below
- [ ] An explicit expand / hold / stop recommendation

---

## Sample sufficiency

Sample-based, not time-based. Time in production is not evidence; comparisons are.

| Criterion | Insufficient | Required minimum | Desirable confidence |
|---|---|---|---|
| analyses observed | < 50 | 200 | 1,000 |
| citation comparisons | < 100 | 500 | 2,500 |
| OSHA General Industry comparisons | < 30 | 100 | 500 |
| OSHA Construction comparisons | < 30 | 100 | 500 |
| MSHA comparisons | < 10 | 50 | 250 |
| multi-finding analyses | < 10 | 40 | 200 |
| distinct hazard families | < 5 | 12 | 20 of the 27 measured |
| hard-invariant defects | any | **0** | **0** |
| BLOCKING mismatches | any unadjudicated | every one adjudicated | 0 observed |

**These are coverage thresholds, not statistical confidence intervals.** No confidence level is
claimed anywhere in this document, because none has been computed. Stating "95% confidence" without
a computed interval would be exactly the kind of borrowed authority this programme refuses.

The MSHA minimum is lower than the OSHA ones because MSHA traffic in this product is genuinely
lower; setting an equal bar would either stall the decision indefinitely or invite manufacturing
MSHA traffic to clear it, and KG-4B already refused to pad a corpus to improve a coverage number.

---

## Blocking-mismatch response

```
production shadow BLOCKING mismatch
  -> privacy-safe capture (categorical event; digests and path names only)
  -> classify: category, severity, root cause, affected release
  -> if the rate exceeds its stop threshold, or the cause is a hard invariant: STOP SHADOW
     otherwise: continue with the case flagged for adjudication
  -> reproduce LOCALLY, in an owned disposable database
  -> remediate in a SEPARATE KG slice, with its own verification
  -> full regression
  -> separate, explicit authorization to resume shadow
```

**Never permitted in response to a mismatch:**

* a live corpus hot-fix;
* a live approval change;
* a production rule change;
* reviewer approval driven from telemetry.

The last one is the important one. A mismatch says the governed and legacy answers differ; it says
nothing about which is correct. Approving a record because shadow surfaced it would make usage the
basis for approval, which KG-3E, KG-3F and the corpus principles all refuse. Approval remains a
clause-by-clause human review against the authoritative source, and it happens in a remediation
slice, not in an incident channel.
