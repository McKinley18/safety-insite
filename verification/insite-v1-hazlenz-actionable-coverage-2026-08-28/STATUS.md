# HazLenz deterministic actionable-finding coverage closure — 2026-08-28

```
TERMINAL = HAZLENZ_DETERMINISTIC_ACTIONABLE_COVERAGE_HARDENED
           — EXPERT_HAZLENZ_IMPLEMENTATION_AUTHORIZATION_REQUIRED
```

Scope: close the distinction between a hazard the deterministic engine
**recognises** and a hazard the customer can **act on**. The preceding phase
established recognition at 43/43 and life-critical recognition at 35/35, but
three required hazard groups were reaching the customer only through the primary
classifier, and `InspectionService.reconcileDecompositionFindings()` materialises
customer findings from one surface only. No Expert / LLM behaviour was
implemented and no provider call was made.

---

## 1. Repository state

| item | value |
|---|---|
| branch | `main` |
| HEAD | `d67d645608f13f7b0fc40e64b40f117d40c2ef71` |
| upstream | `origin/main` |
| commit / push / tag / deploy / reset / restore / clean / stash / rebase | **none performed** |
| pre-existing uncommitted work | preserved untouched |
| stashes | 4, untouched |
| tags | 24, untouched |

Frozen evaluation surfaces unchanged, proved by hash:

| path | SHA-256 | state |
|---|---|---|
| `backend/src/safescope-v2/tests/hazlenz-decomposition-precision-corpus.ts` | `1e61840ad534d75d68e38abf5877975fa660620549e6927899ce6e9e0f3ef77e` | unchanged |
| `backend/src/safescope-v2/tests/hazlenz-decomposition-precision-scorer.ts` | `df6fd22f62dcf00a270e8b252ffe0eb4f1ef7dcb9e924e24bb08e50543863a57` | unchanged |
| `backend/src/safescope-v2/tests/hazlenz-level1-recall-probe-corpus.ts` | `808b4c6613624819d91c25282c4e29fd7e30157ccd7d50aa11aac3a6ed16cb56` | unchanged |
| `backend/src/safescope-v2/safescope-v2.service.ts` | `1121b36d3284fcd748cb68d85b1a6e48afc8c034b47255e65e9acfc954f7217a` | unchanged |
| `backend/src/inspection/inspection.service.ts` | — | **unchanged; the lifecycle was not reopened** |
| `backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts` | `efd27758e699573843a70e066a6179a5b9fb4f4dc30d9b6cc6053a69ab305a81` | **changed by this phase** (from `4633429…`) |

No corpus row, scorer, threshold, expectation or assertion was edited, weakened
or relaxed at any point.

## 2. Phase 1 — what "actionable" was declared to mean

Declared before any workflow output for these rows was inspected, and derived
from the product's own data flow rather than from engine behaviour.

A required hazard group has **actionable coverage** when a materialised,
non-superseded `inspection_finding` on the customer's inspection represents the
hazard and carries what the customer needs in order to act on it:

* **identity** — the finding's family/category/hazard key resolves into the group;
* **evidence** — a conclusion/mechanism *and* an observation fragment, so the
  inspector can see why it was identified;
* **risk** — a risk snapshot, so significance can be assigned;
* **action** — a corrective-action path on that finding.

Standards are scored **separately** into three states (§6), because a hazard
with no applicable standard under the selected jurisdiction is a legitimate
outcome and must not be counted as a coverage failure.

**No artificial one-hazard-one-record rule was imposed.** A group is satisfied by
any finding that represents it, and one finding satisfies at most one group —
the same distinct-consumption rule the recognition scorers use — so two
independently actionable hazards still require two findings, while a finding
that legitimately carries related hazards is not penalised.

A hazard named only in an analysis label, a classifier result, internal metadata
or a standards citation does **not** count.

## 3. Phase 2 — the real workflow, executed

`backend/src/safescope-v2/tests/hazlenz-actionable-coverage-scorer.ts`
(SHA-256 `a7ee253e7fa3defc0273fd0a5d31cb9f125ceb1968399a41ac15b7f88033b05e`).

Behaviour was **not** inferred from source. Every Population-B row was driven
through the real customer path against a disposable API instance and a
disposable database:

```
register -> disposable Pro grant -> site -> inspection -> observation
  -> POST /safescope-v2/classify          (the real deterministic engine)
  -> POST .../analyses                    (the real snapshot persistence)
  -> reconcileDecompositionFindings       (the real materialisation)
  -> GET /inspections/{id}                (what the customer actually reads)
```

**Database discipline.** A new database `test_v1_actionable_coverage_20260828`
was created for this phase. Its resolved host and name were printed and proved
against the repository's own disposable allowlist before any migration ran, and
`DATABASE_URL` was set explicitly so it could not be redirected. The protected
`safescope` development database was never migrated, seeded or mutated; it was
read only by the DB-free suites' read-only standards lookups. The paid
entitlement was granted with the repository's own
`scripts/grant-test-entitlement.ts`, which itself refuses to run unless
`NODE_ENV=test` and the database is on that allowlist. No billing guard was
bypassed and no Stripe object was touched.

### Measured, before any change (`measurements/actionable-before.json`)

| metric | value |
|---|---|
| `LEVEL1_RECOGNITION_RECALL` | **100.0 % (43/43)** |
| recognition, life-critical | **35/35** |
| `ACTIONABLE_FINDING_COVERAGE` | **93.0 % (40/43)** |
| `LIFE_CRITICAL_ACTIONABLE_COVERAGE` | **94.3 % (33/35)** |

Exactly three groups were `RECOGNIZED_BUT_NOT_ACTIONABLE`, and in every case the
reason was the same: **no finding at all**.

| row | required group | life-critical | classifier recovery | determination |
|---|---|---|---|---|
| B-05 | `compressed_gas` | **yes** | primary classification `Compressed Gas Cylinders` @0.93 | `RECOGNIZED_BUT_NOT_ACTIONABLE` |
| B-16 | `machine_guarding` | no | primary classification `machine_guarding` | `RECOGNIZED_BUT_NOT_ACTIONABLE` |
| B-20 | `suspended_loads\|cranes_hoists\|rigging_lifting` | **yes** | primary classification `Lifting & Rigging` @0.93 | `RECOGNIZED_BUT_NOT_ACTIONABLE` |

### The downstream path, traced

For all three the path is identical and terminates at the same boundary:

```
observation -> classify: family named in the analysis header  ✔ recognised
            -> decomposition: no hazard emitted for that family  ✘
            -> reconcileDecompositionFindings: reads ONLY
               snapshot.multiHazardDecomposition.hazards          ✘ no finding
            -> standards / risk / corrective action: never reached
            -> persistence: nothing to persist
            -> report: the hazard has no line
```

`addAnalysis()` calls `reconcileDecompositionFindings()` and nothing else, and
no code path in `classify()` ever adds to `multiHazardDecomposition.hazards` —
the pipeline only filters it. The only other finding writer is
`createUserAuthoredFinding()`, which is the inspector's own act
(`source = 'user_authored'`), not an engine detection.

## 4. Phase 4 — why a general classifier-promotion rule was rejected, with numbers

The obvious general reconciliation rule is "promote the primary classification
into the finding collection". It was evaluated against the frozen Population A
before being rejected:

* promoting every primary classification would have introduced **14 forbidden
  families across 12 of the 34 Population A rows** — destroying the 100.0 %
  precision the two preceding phases established;
* **classifier confidence cannot gate it.** The classifier's own confidence band
  does not separate the legitimate cases from the illegitimate ones:

  | row | classifier said | score | band | verdict |
  |---|---|---|---|---|
  | B-05 | Compressed Gas Cylinders | 46 | high @0.93 | legitimate |
  | B-20 | Lifting & Rigging | 65 | high @0.93 | legitimate |
  | A-13 | Mobile Equipment / Traffic (`the forklift charging room`) | 40 | high @0.93 | **forbidden** |
  | A-24 | Machine Guarding (`the guard was correctly fitted`) | 52 | high @0.93 | **forbidden** |
  | A-27 | Fall Protection (`the opening was fitted with a hinged cover that was closed`) | 46 | high @0.93 | **forbidden** |

A rule gated on classifier confidence would have admitted A-13, A-14, A-15,
A-24, A-26, A-27 and A-31. A rule gated on "the decomposition layer's own
evidence agrees" is not a general reconciliation rule at all — it is the
decomposition repair, written indirectly. **The smallest correction that fixes
the demonstrated defect is therefore to give the decomposition layer the three
detectors it lacks**, which is the pattern both preceding phases established and
the one the precision gate already protects.

This is recorded so the option is not re-proposed without the measurement.

## 5. The failing gate, then the repair

`backend/src/safescope-v2/tests/hazlenz-actionable-coverage-regression.ts`
(SHA-256 `25ae3eec12e7c8b0e50618e0a190f0a927a6c10d42389313b4e921cc0744b1c1`),
registered as the 34th suite of `npm run test:hazlenz-core` and as
`npm run test:hazlenz-actionable-coverage`. Its two halves are the two halves of
the property: the three hazards must reach a finding, and the fourteen
classifier-named forbidden families must not.

**Demonstrated failure before any source change: 3 failures across 17 checks**
(the fourteen precision counter-cases already passed and had to keep passing).

One production file changed:
`multi-hazard-decomposition.service.ts` (+103 / −4).

1. **Suspended-load exposure vocabulary knows the trades.** The exposure
   predicate accepted `worker|employee|person|spotter|pedestrian` but not
   `rigger`, `millwright`, `fitter`, `technician`, `welder`, `electrician`,
   `mason`, `contractor`, `banksman`, `signaller`, `operator`, `crew` — so "a
   rigger was standing … to guide a steel beam that was hanging from the crane
   directly overhead" established no person under the load.
   **A duplicated-predicate bug was found and removed while fixing it:** the
   same two questions were asked twice, once in the finding-local detector and
   again in the output filter, each with its own copy of the pattern. Widening
   only the detector created the finding and the filter then silently deleted it
   again. Both now read one shared definition (`SUSPENDED_LOAD_EVIDENCE`,
   `SUSPENDED_LOAD_EXPOSURE`), so they cannot drift apart again.
2. **New compressed-gas cylinder detector.** A named gas cylinder **and** a
   restraint, valve-cap or oxidiser-segregation deficiency. The single-winner
   router sent B-05's cylinder clause to `hot_work` on the word "welding", and
   an unrestrained cylinder with its cap removed is a life-critical missile
   hazard in its own right. A cylinder that is secured and capped, merely named,
   negated or uncertain does not qualify.
3. **New machine-guarding component detector.** A named guarding component (tool
   rest, work rest, tongue guard, wheel guard, barrier/fixed guard, light
   curtain, point of operation, nip point) **and** an explicit deficiency in it.
   The taxonomy router carries no abrasive-wheel guarding vocabulary at all.
   A component reported as *correctly fitted*, or a clearance reported as
   correctly *set*, is excluded — which is precisely what the frozen A-24 row
   ("the grinding wheel guard … was correctly fitted and the tool rest was set at
   one eighth of an inch", classifier: Machine Guarding @0.93 high) exists to
   protect, and A-24 still emits nothing.

Explicitly **not** done: no primary classification blindly appended to
decomposition; no Expert/provider inference; no weakening of Population A
precision, negation, or safe-state handling; no legitimate multi-hazard finding
collapsed; no duplicate or phantom finding introduced; no standard fabricated;
no corpus row id or exact evaluation sentence special-cased; the accepted
inspection lifecycle was not reopened.

## 6. Results

### Actionable coverage, measured end to end

`measurements/actionable-before.json` → `measurements/actionable-after.json`,
identical frozen corpus, identical scorer, identical disposable stack.

| metric | before | after |
|---|---|---|
| `LEVEL1_RECOGNITION_RECALL` | 100.0 % (43/43) | **100.0 % (43/43)** |
| recognition, life-critical | 35/35 | **35/35** |
| `ACTIONABLE_FINDING_COVERAGE` | 93.0 % (40/43) | **100.0 % (43/43)** |
| `LIFE_CRITICAL_ACTIONABLE_COVERAGE` | 94.3 % (33/35) | **100.0 % (35/35)** |
| groups `RECOGNIZED_BUT_NOT_ACTIONABLE` | 3 (2 life-critical) | **0** |

### Decomposition layer and Population A precision

`measurements/decomposition-after.json`

| metric | phase entry | after |
|---|---|---|
| **A** case-level precision | 100.0 % | **100.0 %** |
| **A** forbidden-family count | 0 | **0** |
| **A** required-hazard omissions | 0 | **0** |
| **A** unexpected (non-forbidden) families | 5 | 5 |
| **B** required-group recall (decomposition) | 93.0 % (40/43) | **100.0 % (43/43)** |
| **B** life-critical omissions | 2 | **0** |
| **B** case-level full recall | 86.4 % | **100.0 %** |

Recognition and materialisation now agree: every required hazard group the
engine recognises is also a finding the customer can act on.

One additional emission appeared and is legitimate: B-17 now also emits
`suspended_loads` for pallets overhanging a racking beam above an aisle where a
truck operator is working. `suspended_loads` is in that frozen row's
`allowedDomains`, so it is a defensible sibling hazard, not a false promotion.

## 7. Phase 5 — bounded standards check

Scored per actionable group, with the expected-standard map authored from
regulatory subject matter rather than from output.

| state | count |
|---|---|
| `HAZARD_PRESENT_STANDARD_APPLICABLE_AND_MATCHED` | **16** |
| `HAZARD_PRESENT_NO_STANDARD_APPLICABLE` | **1** |
| `HAZARD_PRESENT_STANDARD_EXPECTED_BUT_MISSING` | **26** |

**This is a measured limitation of the finding-scoped applicability rule set, not
a matching defect and not an artefact of an empty corpus.** Finding-level
`sourceCandidate.standardCandidates` — the field the finding view and the PDF
renderer read — are produced by the code-resident rule set in
`src/safescope-v2/evidence/evidence-foundation.ts`, which can emit exactly 30
citations across about twelve families. It has rules for lockout/tagout,
electrical, machine guarding, excavation, fall protection, hazard communication,
silica, noise, egress, powered industrial trucks, scaffolds and MSHA
equivalents; it has **no rule for hot work, fire/explosion, compressed gas,
confined space, PPE, respiratory protection, material handling, environmental
release or ventilation**, which is exactly the set that scores
`EXPECTED_BUT_MISSING`.

Separately recorded, because it changes what this check can and cannot prove:
the analysis-level `primaryStandards` and `suggestedStandards` were **empty for
all 22 rows**, because `standards_master` holds **0 rows** in the disposable
database *and in the `safescope` development database*. The DB-backed standards
suggestion path is therefore **UNVERIFIED** in this environment. The
finding-level result above is unaffected by that, because it does not read the
database.

**This does not prove complete OSHA/MSHA regulatory-corpus coverage and is not
claimed to.** It is a bounded check over 43 groups in one selected jurisdiction
posture (`Not established`).

## 8. Phase 6 — the real inspection workflow

`backend/src/safescope-v2/tests/hazlenz-actionable-workflow-verification.ts`
(SHA-256 `d659d0662740e66ce0dad1465c29e8c72d47bf7bdee1d5d8971b8d25b780b193`),
`npm run verify:hazlenz-actionable-workflow` — **66 checks, 0 failures.**

The accepted lifecycle was walked, not redesigned: draft → in_review →
completed, with a human review and finalisation per finding.

| case | intent | result |
|---|---|---|
| W-01 | genuine multi-hazard observation (B-01) | both hazards seen, explained, risk-scored, corrective-actioned, finalized |
| W-02 | classifier-only residual now actionable (B-05) | `compressed_gas` **and** `hot_work` both actionable |
| W-03 | MCC bucket opened live, no lock (B-15) | `lockout_tagout` **and** `electrical` both actionable |
| W-04 | two materially distinct corrective actions (B-12) | two distinct actions on two distinct findings |
| W-05 | negated/safe control (A-22, "no welding, cutting or other hot work") | **no engine finding materialised** |
| W-06 | MCC safe-isolation control (probe HE-02) | **no engine finding materialised** |

End of workflow: 8 corrective actions all retrievable by the customer;
completion readiness `ready: true` with 8/8 findings reviewed; the inspection
persisted through completion; the report generated; **the report PDF downloaded
and its text checked — all eight hazards appear as their own numbered findings**
("Finding 1 Lockout Tagout", "Finding 3 Compressed Gas", "Finding 5 Electrical",
"Finding 7 Fall Protection", …), with an executive summary, a risk distribution
and a corrective-action table.

Recorded, not asserted: which findings carried standards at the finding level.
`compressed_gas`, `hot_work`, `electrical` (B-15) and `fall_protection` (B-12)
carried **none**, for the rule-set reason in §7. That is a coverage limitation
in the standards layer, not a workflow defect — the hazard is still seen,
explained, risk-scored, corrected, finalised and reported.

## 9. Phase 7 — regression

| suite | result |
|---|---|
| `npm run test:hazlenz-core` | **34/34 PASS**, unrelaxed |
| `npx tsc --noEmit` | clean |
| `test:hazlenz-precision` | PASS — A precision 100.0 %, 0 forbidden, 0 A omissions, B 43/43, 0 life-critical omissions |
| `test:hazlenz-level1-recall` | PASS (17 checks) |
| `test:hazlenz-actionable-coverage` | PASS (17 checks) |
| `verify:hazlenz-actionable-workflow` | PASS (66 checks) |
| `validate-safescope-multi-hazard-decomposition-v1` | PASS |
| `validate-safescope-generalization-intelligence-v1` | PASS |
| `hazlenz-generalization-regression` | PASS |
| `hazlenz-energy-isolation-negation-regression` | PASS |
| `hazlenz-condition-state-invariants-regression` | PASS |
| `hazlenz-vague-candidate-retention-regression` | PASS |
| `hazlenz-primary-citation-visible-contract-regression` | PASS |
| `standard-applicability-regression` | PASS |
| `narrative-quality-regression` | PASS |
| `hazard-understanding-coverage-benchmark` | PASS |
| `golden-domain-intelligence-tests` | PASS |
| `golden-operational-reasoning-tests` | PASS |

**NEW_REGRESSION: none.**

### Three suites that were UNVERIFIED in both preceding phases are now EXECUTED

The disposable stack this phase built supplied the running server and paid
entitlement they always needed. Each was run on the **pre-change engine**
(restored in place, SHA-256 `4633429…`) and again on the repaired engine
(`efd27758…`), so attribution is measured:

| suite | pre-change | after | verdict |
|---|---|---|---|
| `hazlenz-field-gauntlet` | 98.5 % average, 8 scenario failures | 98.5 % average, 8 scenario failures | **identical failure set — PRE_EXISTING** |
| `hazlenz-authentic-capability-gauntlet` | 98.5 % average, 8 scenario failures | 98.5 % average, 8 scenario failures | **identical failure set — PRE_EXISTING** |
| `hazlenz-clarification-gauntlet` | fails on its first assertion (`guard initial: expected machine-controls, received machine-energy-state, machine-task`) | identical output | **PRE_EXISTING** |

The eight gauntlet scenario failures are in the `evidenceGaps` (4), `standards`
(3) and `falsePositives` (1) dimensions; none is a hazard-recognition or
finding-materialisation failure, and none moved.

### Pre-existing failures, adjudicated by measurement

Compared against logs produced on the engine as it stood at the start of this
phase, in the same environment:

| suite | before | after | log diff |
|---|---|---|---|
| `domain-association-regression` | FAIL | FAIL | identical |
| `golden-hazard-tests` | FAIL 1/12 | FAIL 1/12 | identical |
| `hazlenz-vague-candidate-promotion-regression` | FAIL (2) | FAIL (2) | identical |
| `hazlenz-standard-return-contract-regression` | FAIL (9) | FAIL (9) | identical |

### Still UNVERIFIED — reported as such, never converted to PASS

| suite / surface | reason |
|---|---|
| `golden-standards-tests` | refuses to run without a deliberate override because it would read the protected `safescope` corpus. **The override was not set.** |
| DB-backed standards suggestion (`primaryStandards` / `suggestedStandards`) | `standards_master` holds 0 rows in both the disposable and the development database, so this path produced nothing and could not be exercised (§7). |

## 10. Remaining architectural limitations

* **Finding-scoped standards coverage is family-limited** (§7): 26 of 43
  actionable groups get no citation on their finding because the applicability
  rule set has no rule for their family. This is the largest known gap in the
  customer's regulatory picture and it is *not* closed by this phase.
* **The DB-backed standards corpus is empty** in this environment, so the
  analysis-level standards path is unproven here.
* **Single-winner routing and control-noun negation persist** in
  `HazardTaxonomyCoverageService.route()`. Every repair in the last two phases
  has been a family-specific preservation block compensating for them. Coverage
  is therefore uneven by construction, and each new family costs a new block.
* **Evidence remains bounded**: 56 corpus rows, an 8-row hazardous-energy probe
  family and 6 workflow cases, all authored by this process rather than drawn
  from field data.

## 11. Expert HazLenz readiness

See `EXPERT_HAZLENZ_READINESS_REASSESSMENT.md`. The deterministic safety-floor
preconditions the account owner set are now met on this bounded evidence; six
readiness blockers remain open and no implementation is authorised.

```
EXPERT_HAZLENZ_IMPLEMENTED = FALSE
PROVIDER_CALL_IMPLEMENTED  = FALSE
PROVIDER_CALLS_MADE        = 0
```
