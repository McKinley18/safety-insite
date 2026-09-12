# §223 — FROZEN ACCEPTANCE COMPUTATION, CANONICAL STATE, AND REPOSITORY REVIEW

**Provider calls 0 · Database operations 0 · Commit / push / tag / deploy NONE ·
Runtime behaviour changed NO · Frozen evidence changed NO.**

Frozen §221 digest `82487b704e7601476481bbbe803d1b3299742478404e8df65f0149330302e1f6`
Adjudication packet `893156ac55d121c9d77640c927116b14a2683feeb1fb49a15f7901b323138633`

---

## PHASE A — §222 CLOSED, §221 COMPUTED

### Integrity

All ten required checks pass, plus three §223 additions. Detail and per-check evidence are in
`GATE-RESULTS-221.json` and `GATE-RESULTS-221.md`. In summary: 62 of 62 slots recorded, every
judgment attributed `PRODUCT_OWNER`, sequence contiguous 1..62 with non-decreasing timestamps, zero
amendments, zero duplicates, packet and preregistration digests unchanged, all 11 §221 and all 8 §222
manifest entries re-verified, and every frozen slot field carried through byte for byte.

Two observations that are recorded rather than treated as failures:

- `IG3.J1` was recorded at sequence 28 rather than 15, out of the packet's slot order. Membership,
  fields, uniqueness and contiguity are all intact, and the frozen protocol imposes no recording
  order. An append-only ledger recording a deferred judgment later is the ledger working correctly.
- `ADJUDICATION-STATUS-222.json` still reads `gateOutcomesComputed: false` because it was written
  55 seconds before `GATE-COMPUTATION-222.json`. It is a stale snapshot, not a contradiction. It is
  not edited; this section supersedes that field.

Gate computation was therefore permitted.

### Results

| gate | name | result |
|---|---|---|
| IG1 | DECISION_CRITICAL_FACT_PRESERVATION | COVERAGE_INSUFFICIENT |
| IG2 | MULTI_FACT_INDEPENDENCE | PASS |
| IG3 | KR1_AUTHORITY_CONTAINMENT | **FAIL** |
| IG4 | SETTLEMENT_AUTHORITY | COVERAGE_INSUFFICIENT |
| IG5 | UNSAFE_AUTHORIZATION | COVERAGE_INSUFFICIENT |
| IG6 | EXACT_PROPERTY_AND_TARGET_INTEGRITY | **FAIL** |
| IG7 | RR7_FAIL_CLOSED_PRESERVATION | **FAIL** |
| IG8 | EPISTEMIC_DISCIPLINE | COVERAGE_INSUFFICIENT |
| IG9 | GOVERNED_REGULATORY_INTEGRITY | PASS |
| IG10 | HUMAN_AUTHORITY_EFFECT | COVERAGE_INSUFFICIENT |
| IG11 | SAFE_NEGATED_RESTRAINT | PASS |
| IG12 | DETERMINISTIC_SEMANTIC_NON_INVENTION | COVERAGE_INSUFFICIENT |

**Overall frozen integrated result: NOT PASSED.** No aggregate score was used, and no headline
accuracy percentage is reported.

§223 recomputed all twelve gates independently from the frozen preregistration and the §222 ledger,
rather than from §222's output, and reached the same result on all twelve. Each gate's
feeding-judgment count also matched the frozen `judgmentsFeedingEachGate` declaration exactly.
`GATE-COMPUTATION-222.json` is left unmodified.

Five of the six coverage-insufficient gates are short because §221 listed a gate in a case's
exercised set without authoring any judgment slot feeding it. §223 verified this directly: for those
case–gate pairs the frozen packet contains no slot at all. IG10 is the only execution-caused
shortfall.

### Defect classification

Full detail in `DEFECT-CLASSIFICATION-223.json`.

**Class A — 2.** Both sit at the first pass's semantic-to-structured-emission boundary.

- **A1 silent non-declaration** (IG1, IG8). A well-formed, complete, structurally valid response
  with an empty declarations array while the concern is named in prose or as a hazard candidate.
  Uncontained: every containment mechanism operates on declared facts, nothing is malformed, and no
  fail-closed path triggers. The end state reads "hazard analysis with NO decision-critical
  unresolved fact recorded, against 1 expected". The gap and its absence are both invisible.
- **A2 wrong controlling property selected** (IG10). A well-formed declaration named the ventilation
  fan's run state where the frozen property was whether the plant-room atmosphere is safe to enter.
  Uncontained: RR-7 preserved exactly what it was given, which is correct, and preservation is
  property-agnostic by design.

**Class B — 4, all contained.** Declarations returned as a JSON string (IG7); a 45-output-token
degenerate response (IG3); truncation at `max_tokens` (IG2); and the executor crash on IG7's
string-typed field, which was a harness defect. In every case the output was refused fail closed,
never parsed or repaired, nothing was settled or authorised, and the end state names the structural
defect to the user.

**Class C — 3.** No governed grounding presented in checkable form on IG8; a clarification on IG7
that would not obtain the run-down time; and the IG6 bound-clarification span observation.

**Divergence from §222, stated rather than buried.** §222 placed the IG3 and IG7 fact loss inside
Class A, on the ground that fact loss is not excused because downstream stages could not run. That
ground is §222's own; it is not in the frozen §221 preregistration. Applying the §223 classification
principle to the observed system consequence moves both to Class B, because the authoritative end
state names the structural defect and tells the user the result is not usable — which is exactly what
the containment test asks. No gate, verdict, denominator, threshold or terminal changes as a result.
§222's record is left unmodified.

**Semantic or structured-output? BOTH, and they are distinct.** IG1, IG8 and IG10 are semantic
capability failures. IG2, IG3 and IG7 are structured-output reliability failures. They have different
remedies and must not be treated as one remediation problem.

---

## PHASE B — CANONICAL CURRENT STATE

`docs/hazlenz/current/EXPERT_HAZLENZ_CURRENT_STATE.md` (about 1,670 words) is now the default
development-context source. It covers product purpose, supported tasks, the pipeline, the semantic
and deterministic authority models, the owed-fact and verifier contracts, the KR-1 boundary, human
settlement authority, the governed evidence boundary, fail-closed invariants, current limitations,
validation status, the active blocker, the next phase, and pointers to the archive. It narrates no
section history.

It supersedes `docs/expert-hazlenz/CURRENT-EXPERT-HAZLENZ-STATE.md`, which stops at §209 while still
describing itself as the primary entry point for every future session. That package is retained for
provenance and marked historical.

---

## PHASE C — REPOSITORY STRUCTURE

`docs/hazlenz/governance/REPOSITORY_COMPARTMENTALIZATION_PLAN.md`. Nothing was moved, renamed,
merged, archived or deleted.

Two structural facts frame the assessment. **There are zero import cycles** across all 200 runtime
and experiment files, and the dependency direction is one-way on all 201 crossing imports. **Expert
HazLenz has no runtime consumer** — no controller, service, module or provider imports it, and the
validated pipeline is assembled by a harness module.

The most consequential finding is that the §221-pinned semantic contracts — first-pass contract and
wire schema, declaration projection, scope containment, verifier payload, and both §218 verifier
modules — live under `backend/scripts/lib/`. That placement is deliberate: `tsconfig.json` includes
only `src/**/*`, so it is what keeps unvalidated expert modules out of the production build. The cost
is that the repository's most safety-critical contracts are not where an engineer would look. Moving
them is therefore **blocked** on building a replacement production-build boundary first, and that
step needs its own authorization because it changes where a pinned identity's bytes live.

Also found: 68 benchmark and golden-test files inside the production build under
`src/safescope-v2/tests/`; 99 of 136 expert modules in `scripts/lib/` off the §221 closure with
nothing in their names to say so; 393 of 903 files under `backend/scripts/` untracked; 358 npm
scripts; 2,183 macOS duplicate-copy files, 2,091 of them under `verification/`; and ten tracked
build- and diagnostic-output files in `backend/`.

Safe-now steps are ordered first: gitignore and generated-artifact cleanup, the manifest-checked
duplicate-copy sweep, archiving the superseded docs package, and moving tests and fixtures out of
`src/`. The contract move comes last and separately.

---

## PHASE D — SOURCE AND TOKEN EFFICIENCY

`CONTEXT_INDEX.md`, `HAZLENZ_INVARIANTS.md`, `SOURCE_OF_TRUTH_MAP.md`,
`PROMPT_CONTEXT_OPTIMIZATION.md` and `VALIDATION_EFFICIENCY_PLAN.md`.

**The provider prompt has no slack.** Measured locally across the ten §221 cases: 78,898 bytes per
first-pass call, of which the system prompt is 57,027 (72%), the wire schema 19,317 (24%) and the
user prompt 2,554 (3%). Of 632 distinct long lines in the composed system prompt, exactly one
repeats, costing 65 bytes. There is no byte-level duplication to reclaim, and the remaining content
carries epistemic and counterfactual discipline that the Class A findings show is already under
strain. Every wire-side reduction is graded DO NOT CHANGE or REQUIRES REGRESSION.

**Flattening the additive prompt-ancestor chain is explicitly rejected.** It would produce identical
wire bytes while destroying byte-for-byte reconstruction of every pinned ancestor identity and the
guards that prove a successor added only what it claims.

**The real reduction is in development context, and it is large.**
`docs/INSITE_ENGINEERING_BLUEPRINT.md` is roughly 308,000 words; the superseded expert-hazlenz
package about 6,800. The new always-read set totals about 2,600 words.

A validation ladder is defined, level 1 targeted regression through level 5 formal frozen acceptance,
with the rule that the default loop uses the lowest level capable of answering the question. There is
currently **no aggregated runner at any level** — §221's twenty protected suites were invoked as
twenty separate scripts out of 358 — so four composite scripts are proposed that compose existing
suites without rewriting any of them.

---

## LOCAL STRUCTURAL VERIFICATION

Run to prove that documentation and inventory work altered no runtime behaviour.

| check | result |
|---|---|
| `REPORT-221.sha256` — 11 entries | all OK |
| `REPORT-222.sha256` — 8 entries | all OK |
| 12 §221-pinned module digests | 12 / 12 unchanged |
| §221 preregistration suite | 53 passed, 0 failed |
| §205 declaration preservation | 92 passed, 0 failed |
| §210E final remediation | 103 passed, 0 failed |
| §210J epistemic schema | 99 PASS, 0 FAIL |
| §214 scope containment | 68 PASS, 0 FAIL |
| §218 structured property verifier | 113 PASS, 0 FAIL |
| §220 KR-1 property authority | 43 PASS, 0 FAIL |
| `tsc --noEmit -p tsconfig.scripts-221.json` | clean |

`REPORT-223.sha256` carries fifteen entries: the eleven §223 outputs, then the four frozen inputs
this section read and did not produce, recorded for provenance.

**571 assertions, zero failures.** No file under `backend/src/` or `backend/scripts/` was created or
modified by this slice; the only new paths are `docs/hazlenz/` and this evidence directory.

---

## FINAL REPORT

**§221 acceptance result**

```
IG1   COVERAGE_INSUFFICIENT
IG2   PASS
IG3   FAIL
IG4   COVERAGE_INSUFFICIENT
IG5   COVERAGE_INSUFFICIENT
IG6   FAIL
IG7   FAIL
IG8   COVERAGE_INSUFFICIENT
IG9   PASS
IG10  COVERAGE_INSUFFICIENT
IG11  PASS
IG12  COVERAGE_INSUFFICIENT
```

**Overall frozen integrated result:** NOT PASSED — 3 PASS, 3 FAIL, 6 COVERAGE_INSUFFICIENT.

**Class A defects:** 2 — silent non-declaration (IG1, IG8); wrong controlling property selected (IG10).
**Class B defects:** 4 — all contained, all named to the user in the end state.
**Class C defects:** 3.

**KR-1 status:** OPEN — HUMAN-GATED V1.0 LIMITATION. Unchanged. Its containment claim was
`NOT_EXERCISED` end to end by this run, because IG3 produced no property mistake to contain. That is
neither a pass nor a failure of the boundary.

**Repository structural assessment:** sound at the dependency level — zero cycles, one-way imports,
no validation code reachable from runtime by import. Weak at the discoverability level — the
safety-critical semantic contracts live in a directory named `scripts`, the superseded and active
experiment modules are indistinguishable by name, and the canonical state document was four sections
stale.

**Highest-value compartmentalization changes:** move the 68 benchmark and golden-test files out of
the production build; archive the 99 off-closure experiment modules under a name that says so;
archive the superseded `docs/expert-hazlenz/` package; then, separately authorized, build a
replacement production-build boundary and relocate the pinned contracts into `src/`.

**Highest-value prompt/context token reductions:** stop loading historical validation narrative into
development prompts and read the 2,600-word always-read set instead; archive the four off-closure
prompt modules; split `expert-prompt.ts`. Wire-side reductions are not recommended.

**Estimated routine context reduction:** HIGH — for development context. LOW for provider context,
and deliberately so.

**Runtime behaviour changed:** NO.
**Frozen evidence changed:** NO.
**Provider calls:** 0.
**Database operations:** 0.
**Commit / push / tag / deploy:** NONE.

---

## ONE RECOMMENDED NEXT PRODUCT PHASE

**A targeted first-pass declaration-recall and property-selection capability slice, preregistered on
a local instrument before any hosted spend.**

Both Class A defects are one capability question: the model recognises the concern and does not emit
it as a decision-critical fact, or emits the wrong property. The explicit structured representation
that such defects were meant to be answered by already exists — §210J declarations, the owed-fact
ledger, RR-7 preservation. Adding another deterministic layer cannot reach either defect, because
deterministic code may not invent the meaning the model withheld or judge whether a property is the
right property.

So this is a capability decision for the product owner, not an architecture slice. It should measure
recall and restraint against each other rather than trading them blind, and it must not be answered
by editing the prompt and re-running a hosted probe. One observation belongs in that instrument as a
hypothesis and nothing more: the first-pass user prompt contains restraint language stating that an
empty list is a complete and correct answer, and IG1 and IG8 returned empty lists. Whether that
language contributes to under-declaration cannot be settled by reading the prompt.

The instrument must also assert, before freezing, that every gate listed in a case's exercised set
has at least one judgment slot authored for that case. That single check would have prevented five of
the six coverage-insufficient gates in §221.

---

**TERMINAL:
`EXPERT_HAZLENZ_INTEGRATED_VALIDATION_COMPLETE — TARGETED_CAPABILITY_REMEDIATION_REQUIRED`**

Do not begin the next phase. §223 stops here.
