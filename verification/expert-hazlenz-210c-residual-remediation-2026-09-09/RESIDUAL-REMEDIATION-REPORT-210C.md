# §210C — RESIDUAL FIRST-PASS SEMANTIC REMEDIATION

**`EXPERT_HAZLENZ_RESIDUAL_FIRST_PASS_REMEDIATION_IMPLEMENTED — MINIMAL_HOSTED_CONFIRMATION_REQUIRED`**

Provider calls: **0**. Database operations: **0**. No customer or production activation. No commit,
push, tag or deploy. §210B-3 evidence untouched; PB-01 … PB-08 not rerun and their outputs not
repaired; the frozen preregistration still hashes to
`7b2e292f5fc2ddd61368b4adc8f4416c11b1925ecd514a589169f0118fec20b5`.

---

## 1. The exact residual instruction change

One appended block, built the way §210B-2 is built: inserted before the same unique closing anchor,
reversible byte for byte. **`expert-first-pass-instruction-210b2.ts` is not edited**, so its
identities and its suite are untouched.

| | |
|---|---|
| New module | `backend/scripts/lib/expert-first-pass-instruction-210c.ts` |
| Version | `hazlenz.expert.first-pass-instruction.210c-R1-R3` |
| Base | `hazlenz.expert.first-pass-instruction.210b2-S1-S6` |
| Plain identity | `55d10ae6…` → **`b243c323af82031c6f733af80f456c4bc61d52efafd89b5c25806a5d8a83b0e6`** |
| Governed identity | `994b378e…` → **`f386a198b960991104cf9631b7877921038eccc127c59bc122d4a923a1ec8048`** |
| Prose removed | none |

The block is titled **THE DECLARATION GATE: APPLIED TO ONE ENTRY AT A TIME** and carries three
gates. It is headed `GATE 1/2/3` rather than continuing the §210B-2 numbering, because the governed
variant already ends at `5` and the plain variant does not — a shared `6, 7, 8` would read as a gap
in one and a continuation in the other.

**GATE 1 (R1) — the property must say what the rest of the entry is about.** The model reads its own
`missingFact` against its own `branchA`, `branchB`, `decisionIfA`, `decisionIfB` and question, and
asks whether the property names the exact proposition the branches decide between, carries every
part they rely on, and states the safety state rather than the evidence for it — an inspection,
test, check, record, history, availability, existence or requirement. Where the branches carry
meaning the property does not, the instruction says in terms that **the property is the half that is
wrong**, and that the meaning moves **up** into `missingFact`. The destructive repair — cutting
detail out of the branches so they agree with an impoverished property — is named and forbidden.

**GATE 2 (R2) — no decision-critical question leaves without an entry.** The model walks its own
question list one at a time and names, explicitly, the declaration each question would settle. If a
question exists to obtain something that changes what is done today and no entry states that fact,
the response is not finished: either write the entry, or conclude the question is not
decision-critical and handle it as the contract already allows. S2 is present and unedited; R2 is an
additional reconciliation pass over the model's own output.

**GATE 3 (R3) — an entry must change what is done now.** Per entry, the model reads `decisionIfA`
against `decisionIfB` and asks what must happen **now** under each. Materially the same action either
way means delete the entry. The block states that a fact may be unknown, safety-related, required by
law, worth recording and needed later and still not be owed now, and that a difference appearing only
in a later decision is not a difference today — **unless that later decision is the one being
analysed**. The broader counterfactual rule is not removed; R3 enforces it at the admission boundary.

Nothing is performed deterministically. No code reads a declaration, compares it to its branches,
infers a clarification-to-declaration binding, or removes an entry. The model authors the property,
authors the binding and makes the admission decision.

No case-specific vocabulary enters the instruction. The suite asserts the absence of every PB term
and that the rules are stated over the contract's own field names, which is what makes them general.

## 2. Static-token delta — measured

| | Plain | Governed |
|---|---:|---:|
| Characters before | 46,272 | 47,609 |
| Characters after | 49,130 | 50,467 |
| **Added characters** | **+2,858** | **+2,858** |
| **Estimated added tokens** | **~+1,001** | **~+1,001** |

Estimated from the frozen §208 ratio of 69,968 body bytes to 24,512 input tokens. It is a derived
estimate from real cohort data, **not a tokenizer result**, and is labelled so wherever reported.

For scale: §210B-2 added 3,482 characters (~1,220 tokens). §210C is smaller than the block it
extends, which the suite asserts, in keeping with TBR-11.

Projected effect on a future run: about +1,001 input tokens per call, roughly **+0.002 USD per call**
at $2/MTok, or **+0.016 USD across eight calls**.

## 3. Local fixture results

Seven required distinctions, covered by eight fixtures in
`backend/scripts/lib/section-210c-residual-fixtures.ts`. R1 carries three because a dropped conjunct
and a dropped sequence qualifier are different failures.

| Fixture | Targets | Gate | Expected declarations |
|---|---|---|---:|
| `FX-R1-A-CONJUNCT-DROPPED-FROM-PROPERTY` | R1 | GATE 1 | 1 |
| `FX-R1-B-SEQUENCE-DROPPED-FROM-PROPERTY` | R1 | GATE 1 | 1 |
| `FX-R1-C-CHECK-PROXY-IN-PROPERTY` | R1 | GATE 1 | 1 |
| `FX-R2-A-ORPHANED-DECISION-CRITICAL-QUESTION` | R2 | GATE 2 | 1 |
| `FX-R3-A-SAME-ACTION-EITHER-WAY` | R3 | GATE 3 | 0 |
| `FX-R3-B-FUTURE-ONLY-DIVERGENCE` | R3 | GATE 3 | 0 |
| `FX-PROTECTED-TWO-INDEPENDENT-CURRENT-GAPS` | PROTECTED | EXISTING | 2 |
| `FX-PROTECTED-FACT-LOCAL-SETTLEMENT` | PROTECTED | EXISTING | 2 |

None replays a PB case. Every scenario is a new situation in a different setting, and the fixture
lib refuses any scenario carrying PB vocabulary or labelling its own answer. The two protected
fixtures are marked `EXISTING`, because the G and H behaviours they guard were produced by §210B-2
and §210C must not claim credit for them.

**`test-210c-residual-remediation.ts` — 92 passed, 0 failed.**

These fixtures are frozen expectations, not results. No fixture here can pass or fail on model
behaviour, because no model is called. **A semantic PASS may only be claimed from a hosted run.**

## 4. Protected regression — exact counts

| Suite | Result |
|---|---|
| §207 preregistration | **144 passed, 0 failed** |
| §209 batch recorder | **116 passed, 0 failed** |
| §210B-1 structural | **55 passed, 0 failed** |
| §210B-2 semantic | **36 passed, 0 failed** |
| §210C residual (new) | **92 passed, 0 failed** |
| **Total** | **443 passed, 0 failed** |

The §210B-3 construction path was re-verified independently: the cache preflight still reports all
eight stimuli byte-identical to the frozen artifact and still builds `55d10ae6…` and `994b378e…`,
confirming §210C perturbed nothing the frozen probe depends on.

## 5. Expected effect on R1, R2, R3 — and what would falsify it

Stated as expectations, because nothing here has been tested against a model.

**R1 — expected to fix PB-05, PB-07 and PB-08.** All three had the semantics present in the branches
and absent from the property. GATE 1 makes the model read one against the other and names the
direction of repair. The risk worth watching is the opposite failure: a model that satisfies the gate
by shortening the branches instead of enriching the property. That is why the forbidden direction is
stated explicitly and asserted in the suite, and it is the first thing a hosted confirmation should
look for.

**R2 — expected to fix PB-03.** The model already asked a question capable of settling the owed fact.
GATE 2 makes it walk that list and bind each question to a declaration or demote it. The risk is
over-emission: a model that responds by declaring against every question it asked. GATE 3 is the
counterweight, and the two must be evaluated together rather than separately.

**R3 — expected to fix PB-06.** PB-06's own branches diverged only about a future return to service.
GATE 3 asks what happens now, per entry, with deletion as the defined consequence. The risk is
under-emission — suppressing a genuinely owed fact — which is why the block preserves the carve-out
for the case where the later decision *is* the one being analysed, and why two protected fixtures
guard multi-gap and fact-local behaviour.

**Interaction risk, stated plainly.** R2 pushes toward emitting and R3 pushes toward deleting. They
are deliberately opposed, and neither was tuned against the other, because tuning that balance
without model evidence would be guessing. This is the single most important thing for a hosted
confirmation to measure.

## 6. PB-02 grammar root cause

Full analysis in `PB02-TRANSPORT-RECOMMENDATION-210C.md`; measurements in
`PB02-GRAMMAR-ANALYSIS-210C.json`.

The capability-PRESENT binding adds **+426 canonical bytes (+2.3%), +1 property, +1 enum, +1 required
entry** to the same case. The seven accepted schemas span 18,742–18,773 bytes; the refused one is
19,184. Governed record **text never enters the schema** — only the count of permissible source ids
does, at roughly 10 bytes each. Case-specific enums are not the cause: every accepted case carried
them.

The property sits inside the `unresolvedFactDeclarations` **array item**, which a constrained-decoding
compiler expands per permitted element. That is inference, not measurement, and is labelled so.

**Recommendation: retain the separate governed stage.** It is already proven transmissible in §206
and §208, it binds governed records to facts that exist rather than to facts still being authored,
and it keeps the first-pass grammar identical across governed and ungoverned cases — which also
removes one of the two causes behind TBR-20. Enums, `strict`, `required` and `additionalProperties`
must not be relaxed to buy transport headroom.

**S6 remains NOT_EXERCISED and is untouched in §210C.**

## 7. Recommended minimal hosted confirmation design

Deliberately small. This is a confirmation, not a new probe, and it must not become a second broad
cohort.

- **Four to five new cases, capability-ABSENT, first pass only.** One per residual mechanism —
  property-conjunct, check-proxy, orphaned question, decision-neutral — plus one protected control
  carrying two genuinely independent current-action gaps, to prove G and H did not regress.
- **New stimuli, not PB replays.** PB-01 … PB-08 are spent and must not be rerun. The §210C fixtures
  above are the right starting shapes; they need frozen truth and evaluation questions written to
  §210B-3A's standard before any call.
- **Axes: A, B, C, D, E, plus G and H on the control.** Axis I stays out — S6 cannot be exercised
  until the governed-stage question is settled, and no verifier call belongs in this slice.
- **Preregistered before execution**, with expectations frozen and the instrument authored first, as
  §210B-3A was.
- **Projected cost.** About 25,000 input and 2,800 output tokens per call at the §210B-3B observed
  rate plus the §210C static delta, so roughly **0.078 USD per call** and **0.31–0.39 USD** for four
  to five calls. Uncached, for the reason recorded in TBR-20.
- **Explicitly look for the two risks in section 5**: branches shortened to match a thin property,
  and over-emission driven by GATE 2.

## STOP

Local remediation and the PB-02 analysis are complete. No provider call was made. No broad probe was
created. PB-01 … PB-08 were not rerun. No failure was tuned away, and no verifier was run.
