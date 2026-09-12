# §208 — EXECUTOR DEFECT REGISTER

**APPEND-ONLY.** Entries are added, never edited or removed.

Nothing in this register is a model semantic defect, a contract defect, a transport defect or a
truth-specification defect. Each entry is a defect in the §208 harness, classified as such and
reported rather than absorbed — the precedent is §206's `LOCAL_SMOKE_EXECUTOR_GUARD_DEFECT`, which
the product owner accepted as an executor defect in the §207 ruling.

**The rule this register honours, both directions:** a structural, contract or tooling failure is
never converted into a semantic verdict — and a *harness* failure is never allowed to stand as an
apparent *model or contract* failure either.

---

## ENTRY 1 — FIRST-PASS PROJECTION CALLED WITH A NON-EMPTY SUPPLIED GOVERNED SET

- **Opened:** 2026-09-08, immediately after the first-pass stage completed, while reviewing the one
  refused declaration in the run.
- **Class:** `SECTION_208_EXECUTOR_PROJECTION_PARAMETERISATION_DEFECT`.
- **Explicitly NOT:** a model defect, a first-pass contract defect, a transport defect, an F8
  recurrence, or a preregistration defect. No frozen truth item, gate, denominator or threshold is
  implicated, and none is changed.
- **Component:** `backend/scripts/execute-208-acceptance-cohort.ts`, the `projectDeclaredOwedFacts`
  call inside `runFirstPass`.
- **Provider calls consumed by the defect:** **ZERO.** It was a derivation-time defect, discovered
  after the calls it affected had already been made and persisted.

### Observed behaviour

The executor called the projection with

```
suppliedGovernedSourceIds: c.governedRecords.map(g => g.sourceId)
```

so on the three governed cases the supplied set was non-empty. `projectDeclaredOwedFacts` treats a
non-empty supplied set as **capability PRESENT** and then requires every declaration to carry a
`governedEvidenceSourceIds` array:

```
const capabilityPresent = suppliedGoverned.size > 0;
...
} else if (!Array.isArray(d.governedEvidenceSourceIds)) {
  fail('GOVERNED_SOURCE_IDS_NOT_AN_ARRAY', ...);
```

But the §208 first pass is **capability-ABSENT on every case** by the frozen architecture. Its wire
schema has no such property, and the pre-transmission guard refuses to transmit a first-pass request
that mentions one anywhere. The model was therefore *structurally forbidden* from producing the
field the projection demanded.

### Consequence, exactly

On **AC-22** the row's only declaration, `UF-1`, was refused:

```
codes  = [GOVERNED_SOURCE_IDS_NOT_AN_ARRAY]
detail = ["governedEvidenceSourceIds is undefined"]
admitted = 0    refused = 1    preserved = 0
```

The declaration itself carried **all eleven required fields** — `declarationId`, `missingFact`,
`observationSourceId`, `observationSpan`, `notEstablishedBecause`, `affectedDecision`, `branchA`,
`decisionIfA`, `branchB`, `decisionIfB`, `whyNecessaryNow` — and nothing else. It was well-formed
for the capability-ABSENT contract it was produced under.

**AC-23 and AC-24 produced no declarations, so nothing was refused there.** The twenty-one
non-governed cases already passed an empty supplied set and are unaffected.

**Had this not been corrected**, AC-22 — a `PLAUSIBLY_LIFE_CRITICAL` governed case — would have
presented as a total owed-fact loss, and the loss would have been attributed to the model or to the
declaration contract. It belonged to neither.

### Correction applied

`backend/scripts/rederive-208-projection.ts` re-derives the first-pass projection for **all
twenty-four cases** from the **persisted raw output**, with the parameterisation the frozen
architecture requires:

```
suppliedGovernedSourceIds: []      // the first pass is capability-ABSENT on EVERY case
```

- **No provider call was made.** The model output is fixed and was not re-requested.
- **No prompt, schema, contract, boundary, representation, truth item, gate, denominator or
  threshold was changed.**
- The original `PROJECTION-208.jsonl` is **preserved byte-untouched**; the corrected derivation is
  written to the separate `PROJECTION-208-CORRECTED.jsonl`. Both are in the evidence and neither
  replaces the other.
- Re-running the re-derivation refuses to overwrite the corrected file.

**Measured effect of the correction: exactly one case changed.**

| case | before | after |
|---|---|---|
| AC-22 | admitted 0, refused 1 | admitted 1, refused 0 |
| all 23 others | unchanged | unchanged |

That the other twenty-three are bit-for-bit unchanged is the evidence that the correction is exactly
what it claims to be and reaches nothing else.

### Why re-deriving is not mid-run remediation

The §208 authorization prohibits, once the first call is made: modifying R2, first-pass or verifier
instructions, governed transport, `OwedFact` representation, deterministic boundaries, semantic
filtering, truth, gate applicability, denominators; tuning prompts against failing cases; and
regenerating failed cases with different wording. **This is none of those.** It re-runs a
deterministic function over already-captured output with the architecturally correct argument, and
it is the same class of act as §206's guard narrowing — corrected to its actual meaning, not
relaxed to obtain a favourable result.

### Standing constraint

Any future caller of `projectDeclaredOwedFacts` on a **capability-ABSENT** first pass must pass an
**empty** `suppliedGovernedSourceIds`. The supplied set describes what the *treatment offered the
model*, not what HazLenz holds. Under the §202 separate-stage architecture the first pass is offered
nothing, and the governed binding is applied afterwards by the governed stage.

### Deferred, NOT AUTHORIZED, NOT PERFORMED

Consider whether `projectDeclaredOwedFacts` should take the capability posture as an **explicit
argument** rather than inferring it from the size of the supplied set. Inferring a contract posture
from a collection's length is what allowed a caller to state one thing and mean another. This is a
deterministic-tooling change, requires separate authorization, and must not be performed during an
acceptance run.

---

## ENTRY 2 — VERIFIER TOOL TRANSMITTED IN ANTHROPIC STRICT MODE, WHICH §199 NEVER USED

- **Opened:** 2026-09-08, on the first verifier call, which the provider rejected.
- **Class:** `SECTION_208_EXECUTOR_VERIFIER_TRANSPORT_PARAMETERISATION_DEFECT`.
- **Explicitly NOT:** a rejection of the preregistered verifier artifact, and therefore NOT the
  `TRANSPORT_STRUCTURAL` run-void condition the frozen protocol describes. The distinction is the
  whole entry and is evidenced below.
- **Component:** `backend/scripts/execute-208-acceptance-cohort.ts`, the tool block in
  `providerCall`.
- **Provider cost of the defect:** **USD 0.00.** The request was rejected before inference with no
  token usage. It is call index 26 in the append-only ledger and stays there.

### Observed behaviour

```
HTTP 400  invalid_request_error
tools.0.custom: Invalid schema: Enum value 'SUPPLIED_FACT' does not match declared type
  '['string', 'null']'
```

The §208 executor set `strict: true` on **every** tool block. That is correct for the first pass and
the governed stage — it is exactly what §206 transmitted and what the provider accepted, twice.
It is **wrong for the verifier**, whose response schema was never sent that way.

### Evidence that the artifact under test is not what was rejected

`execute-199-structured-e2e-2026-09-07.ts`, the verifier leg, transmits:

```
tools: [{ name: 'emit_verifier_verdict',
  description: 'Emit the clarification verification verdict. This is the ONLY way to answer.',
  input_schema: VERIFIER_V3_2_RESPONSE_SCHEMA }],
```

**No `strict` flag.** And §199's `RAW-VERIFIER-OUTPUTS.jsonl` records **8 of 8 verifier calls at
HTTP 200 with `reachedInference: true`** and real verdicts (`VERIFIED_AS_IS`,
`NO_CLARIFICATION_REQUIRED`, …). The schema the §208 run is meant to exercise has crossed this exact
provider boundary successfully before; what the provider refused was the strict wrapper the §208
harness added around it.

The rejection message confirms it: it is a strict-mode validation complaint about a nullable enum,
raised by the strict validator that §199 never engaged.

### Correction applied

The verifier tool block is now transmitted **exactly as §199 transmitted it** — name, description,
`input_schema`, and no `strict` flag. A `strictTool` argument makes the posture explicit per leg:
`true` for the first pass and the governed stage, `false` for the verifier.

**THE VERIFIER RESPONSE SCHEMA IS BYTE-UNCHANGED.** So is the verifier system prompt, and so is the
verifier admission contract. Nothing was simplified, shortened, rewritten or re-grammared. The
correction *removes* a wrapper the harness added; it does not alter the artifact under test, and it
could not have been used to obtain a more favourable semantic result because it changes what is
*transmitted*, not what is *judged*.

### Why this is not the run-void condition

The frozen `TRANSPORT_STRUCTURAL` rule exists for the case where "the thing that executed is not the
thing that was preregistered" — the §199 `COMPILED_GRAMMAR_TOO_LARGE` shape, where the provider
refuses the intended grammar and no amount of correct harness code would change that. Here the
inverse holds: the intended artifact is known-acceptable to this provider, and the harness sent
something else. Treating a harness wrapper as a property of the preregistered verifier would void an
acceptance run for a reason that has nothing to do with Expert HazLenz.

Applying the run-void rule here would also be the §204 error in its other direction: converting a
tooling failure into a verdict about the system under test.

### Evidence preserved

- The rejected call remains in `CALL-LEDGER-208.jsonl` as call 26,
  `failureClass: TRANSPORT_STRUCTURAL`, HTTP 400, cost USD 0.00.
- The aborted stage's empty output file is preserved as
  `RAW-VERIFIER-208.ABORTED-ATTEMPT-1.jsonl` rather than deleted.
- No verifier call had reached inference at the time of the abort, so no verifier evidence was lost
  and none was overwritten.

### Standing constraint

Anthropic strict tool mode is a per-leg property in this programme, not a global one. The first-pass
and governed-stage schemas are built through `applyStrictSchemaWrapper` +
`stripAnthropicUnsupportedKeywords` and are sent strict; the verifier v3.2 response schema is sent
raw and non-strict. A future executor must not assume one posture for all three.

### Deferred, NOT AUTHORIZED, NOT PERFORMED

Whether `VERIFIER_V3_2_RESPONSE_SCHEMA` should be made strict-compatible is a separate question. It
is a change to a schema that eight recorded verifier calls have executed against, so it needs its
own authorization and its own evidence, and it must not be attempted during an acceptance run.

---

## ENTRY 3 — VERIFIER RECEIVED AN EMPTY HAZARD-CANDIDATE BLOCK ON EVERY CALL

- **Opened:** 2026-09-08, after the verifier stage completed, while cross-reading the first-pass
  payload structure against the verifier prompt builder.
- **Class:** `SECTION_208_EXECUTOR_VERIFIER_INPUT_FIDELITY_DEFECT`.
- **Explicitly NOT:** a model defect, a verifier-instruction defect, a verifier-contract defect, or
  a transport defect. Every verifier call reached inference and returned a well-formed verdict.
- **Component:** `backend/scripts/execute-208-acceptance-cohort.ts`, `runVerifier`.
- **Provider cost of the defect:** the 24 verifier calls were made with the degraded input. They
  are valid calls and their outputs are preserved; the question is what they may support.

### Observed behaviour

The executor read the first-pass candidates as `fp.hazardCandidates`. In the **parsed provider
payload** the field is `expertHazardCandidates`; `hazardCandidates` was the name §199 gave the field
when it *persisted* the record, and §199's verifier then read it from the persisted record rather
than from `parsed`. §208 read the §199 name out of the wrong object.

Consequence: every verifier user prompt carried

```
FIRST-PASS ANALYSIS — HAZARD CANDIDATES
(none raised)
```

when the cohort had in fact raised **49 hazard candidates across the 24 cases**.

### What was NOT affected — stated precisely, because the scope matters

Reconstructing the exact prompt from the persisted inputs shows every other block was supplied
correctly:

- the **full frozen observation**, verbatim;
- the jurisdiction;
- the governed evidence block;
- the deterministic engine block;
- **FIRST-PASS ANALYSIS — CLARIFICATIONS ASKED** — correctly populated (25 clarifications across
  20 cases);
- **FIRST-PASS ANALYSIS — STATED UNCERTAINTY** and **SUMMARY** — correctly populated;
- and, decisively for axis L, the **UNRESOLVED FACTS IDENTIFIED FOR YOUR REVIEW** block: factKey,
  affectedDecision, whyUnresolved, evidence span, both branches and both branch decisions.

So the **binding target axis L is about was supplied in full on every call.** The missing block is
context about the first pass's hazard analysis, not the owed fact.

### Why this was NOT corrected by re-running

A corrected verifier leg is 24 further calls. The ledger stands at **50** and the frozen **hard call
ceiling is 57**; a re-run would reach 74. The §208 authorization is explicit: *"Do not exceed either
hard ceiling without a new product-owner authorization."* Re-running is therefore **not available to
this slice**, and inventing headroom for it would be exactly the kind of ad hoc repair the
authorization forbids.

The alternative — silently letting the axis-L judgments stand as if the verifier had received §199's
input — would misrepresent what was measured. So the defect is disclosed instead, on the record and
on every affected slot.

### Disposition, and what it does NOT decide

- The 24 verifier records are **preserved and usable**; they are what this verifier produced on this
  input.
- **Axis L (15 slots) and gate G6 rest on a verifier input of lower fidelity than §199's.** That is
  a fact about the measurement, disclosed to the adjudicator on every axis-L slot.
- **Whether G6 can carry a 100 % hard claim on this evidence is a PRODUCT-OWNER decision, not
  mine.** The frozen protocol's own remedy for a discovered defect applies: decide after the run
  whether a bounded replacement — here, a 24-call verifier re-run at roughly USD 0.60 under a new
  authorization — is required.
- No other gate is implicated. G7 (axis M) is judged against the clarification, which was supplied
  correctly; G8 likewise.

### Standing constraint

`parsed.expertHazardCandidates` is the provider field name. `hazardCandidates` is §199's *persisted*
field name. A future executor must read the payload field from the payload and the persisted field
from the persisted record, and must not assume the two share a name.

---

## PRODUCT-OWNER RULINGS ON ENTRIES 1–3 (§208B authorization, 2026-09-08)

Appended, not edited. The entries above stand as written; this records how the product owner
classified them and what follows.

**ENTRY 1 → `LOCAL_EXECUTOR_PARAMETERIZATION_DEFECT`.** The zero-provider-call corrected
re-derivation is **ACCEPTED**, on the four conditions stated, each of which holds and is checkable:
the persisted provider response is byte-untouched; no model-authored semantic content was repaired;
the correction changes only the deterministic invocation parameterisation; and the other 23
derivations are byte-identical. Both derivations remain preserved —
`PROJECTION-208.jsonl` as `ORIGINAL_ERRONEOUS_DERIVATION` and `PROJECTION-208-CORRECTED.jsonl` as
`CORRECTED_DETERMINISTIC_DERIVATION`. **AC-22 must not be scored as a model semantic failure because
the executor invoked the projection with an invalid stage parameter.**

**ENTRY 2 → `LOCAL_EXECUTOR_TRANSPORT_ENVELOPE_DEFECT`.** The HTTP 400 represented no provider
inference failure, no verifier semantic failure, no grammar-size failure and no model refusal.
**But the frozen rule that a structural provider rejection makes the acceptance execution
infrastructure-invalid is NOT waived retrospectively.** Therefore:

```
ORIGINAL_§208_EXECUTION_CLEAN_ACCEPTANCE_VALIDITY = NOT_ESTABLISHED
```

The failed strict-wrapper attempt remains preserved as ledger call 26 and as
`RAW-VERIFIER-208.ABORTED-ATTEMPT-1.jsonl`. The corrected §199 envelope was permitted for the
bounded §208B recovery because the verifier schema, prompt, admission contract, provider and model
are unchanged, no semantic treatment is tuned, and the rejected request reached no inference.

*Note on §208's own reasoning:* the §208 report argued this was not the run-void condition. The
product owner accepted the defect classification but **declined the conclusion**, and that ruling
governs. §208's clean-acceptance validity is not established; §208B exists to establish it.

**ENTRY 3 → `SYSTEMATIC_VERIFIER_INPUT_ASSEMBLY_DEFECT`, and it is MATERIAL to acceptance
evidence.** All 24 verifier calls omitted the candidate block despite 49 candidate records existing.
**The owed fact being supplied in full does not make the omission irrelevant** — axis L and gate G6
were preregistered against the intended verifier architecture, not against knowingly degraded input.
Therefore:

- axis L is **NOT** adjudicated from the original defective verifier calls;
- G6 is **NOT** computed from them;
- **a caveat may not convert lower-fidelity evidence into full-fidelity acceptance evidence** — the
  §208 packet's per-slot disclosure was the wrong remedy and is superseded, not relied upon.

The verifier leg was re-run for all 24 frozen cases with the candidate block correctly populated.
See `verification/expert-hazlenz-verifier-recovery-208b-2026-09-08/`.

**Replacement rule, uniform:** the §208B outputs are `ACCEPTANCE_VERIFIER_EVIDENCE` wherever a
verifier result is an input to a preregistered judgment or gate; the §208 outputs are
`DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE`. No per-fact selection between the two sets exists, and
none is possible in the tooling.
