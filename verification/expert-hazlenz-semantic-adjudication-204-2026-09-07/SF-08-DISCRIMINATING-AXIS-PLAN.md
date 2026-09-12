# §204B PHASE 2 — SF-08 MINIMAL DISCRIMINATING-AXIS PLAN

Written 2026-09-07 under §204B product-owner direction. **NO SEMANTIC VERDICT IS SUPPLIED,
PROPOSED, OR IMPLIED BY THIS DOCUMENT.** It reports frozen structure only, and maps that
structure onto the five questions the product owner asked. Every characterisation below is a
structural fact readable from the §199/§200 preregistration or from the recorded artefact
fields — never an assessment of whether the provider got it right.

**This plan is not authorized.** U15/U16/U17 remain unpresented and unadjudicated.

---

## 1. FROZEN STRUCTURE OF SF-08

**Row.** `SF-08`, family `CONJUNCTIVE_FACT`, preregistered expected gap count **min 1 / max 2**.
Design intent, verbatim: *"CONJUNCTIVE. Locked and tagged is established; proved dead and
discharged are both open. Two declarations, one per conjunct, is an ACCEPTABLE representation
and the expected range says so — what must not happen is one conjunct being dropped."*

**Preregistered NOT established (two conjuncts of one owed property):**
1. whether the circuit was proved dead at the point of work after isolation;
2. whether the capacitor bank was discharged before the enclosure was opened.

The single preregistered expected owed fact states the property as a conjunction: *"whether the
panel was proved safe to work on before the enclosure was opened: the circuit proved dead at the
point of work AND the capacitor bank discharged."* Its criticality note reads: *"a person working
inside an enclosure that may be live or holding stored charge is an electrocution exposure now."*

**Row-level structural facts.** Outcome `ANALYZED`; 2 raw declarations, 2 admitted, 0 rejected;
recorded neutral observation: *"2 raw / 2 admitted against 1-2 — the admitted count is inside the
preregistered range."* No deterministic findings and no governed records were shown.

**The two projected facts.**

| | U16 | U17 |
|---|---|---|
| declaration | `decl-cap-discharge` | `decl-voltage-test` |
| factKey | `FP.REQUIRED_CONTROL.OBS-SF-08.426-508.1` | `FP.REQUIRED_CONTROL.OBS-SF-08.324-424.1` |
| conjunct addressed | discharge (conjunct 2) | proved dead (conjunct 1) |
| `missingFactInDeclaration` | present | present |
| `missingFactInProjectedOwedFact` | **False** | **False** |
| evidenceSpan vs preregistered regions | exactly one of the regions | exactly one of the regions |
| affectedDecision vs preregistered | matches (`REQUIRED_CONTROL`) | matches (`REQUIRED_CONTROL`) |
| projected `priority` | `OTHER` | `OTHER` |
| verifier verdict | `VERIFIED_AS_IS`, `STILL_UNRESOLVED`, no challenge, no proposed clarification | identical shape |
| conjunct/text overlap pointer (weak) | 0% conjunct 1 / 100% conjunct 2 | 67% conjunct 1 / 40% conjunct 2 |

**Two structural features carry directly to the questions asked.**

- **The same projection-loss precondition observed at SF-06 is present on both facts.**
  `missingFactInProjectedOwedFact` is `False` for U16 and U17, i.e. the explicit missingFact
  sentence does not appear in what the verifier received. Whether that loss had any
  consequence here is exactly what an SF-08 `Q` judgment would decide; it is not decided here,
  and the recorded U09 constraint against overgeneralising the SF-06 result stands.
- **Both verifier rationales make a compound-completeness claim spanning BOTH facts.** The
  `decl-cap-discharge` rationale states *"each question as written … would fully settle the
  corresponding fact with a single yes/no answer — there is no compound requirement being left
  partially unaddressed"*; the `decl-voltage-test` rationale states the clarifications match the
  two facts *"one-to-one"*. This is the same claim shape the product owner judged
  semantically incorrect at U09. Whether it is correct HERE is undecided.

**Branch-text asymmetry (structural observation, offered without judgment).** `decl-cap-discharge`
branch A restates the sequence qualifier — *"discharged **before the enclosure was opened**"*.
`decl-voltage-test` branch A does not restate one — *"A voltage test was carried out at the point
of work confirming a de-energized state"* — where the preregistered conjunct reads *"proved the
circuit dead at the point of work **after isolation**"*. This is the same structural feature that
axes E and F engaged at U09. It is flagged, not adjudicated; see §4.

---

## 2. PROPOSED MINIMAL DISCRIMINATING SET — 7 HEADLINE SLOTS

Not 24. Each entry states its unique question, what recorded evidence cannot answer it, and what
decision could turn on it.

### Q1 — did first pass preserve the genuinely decision-critical semantic content?

**`ROW:SF-08:A_FIRST_PASS_GAP_RECALL`** *(U15, 1 slot)*
*Unique question:* were ALL genuinely decision-critical unresolved facts declared for this row —
here, did both conjuncts get declared at all, or was one dropped?
*Not answered by existing evidence:* recall is recorded CORRECT on SF-01 and SF-06 (single-fact
rows) and INCORRECT on SF-02 (two independent facts). SF-08 is the only row where the owed
property is a single conjunction that may legitimately be represented as one or two
declarations, so neither the single-fact nor the independent-fact result transfers.
*Decision it could change:* whether the declaration contract must constrain how a conjunctive
owed property is decomposed, or whether decomposition may be left to the model.

### Q2 — did the conjunctive owed property survive declaration → projection?

**`ROW:SF-08:H_MULTI_GAP_PRESERVATION`** *(U15, 1 slot)*
*Unique question:* do the parts survive INDEPENDENTLY, or does one collapse into the other?
*Not answered by existing evidence:* the only recorded H failure (SF-02) concerns genuinely
independent gaps. At U08 the product owner ruled H `NOT_EXERCISED` on SF-06 precisely because
its two statements were conjuncts of one property rather than independent gaps. **SF-08 forces
that applicability question to be settled on a row whose design intent explicitly contemplates
two declarations.** Whether H is exercised here at all is itself a product-owner judgment, and
the U08 precedent does not decide it — SF-06 had one declaration, SF-08 has two.
*Decision it could change:* whether "one conjunct dropped" is detectable by the same mechanism
as "one independent gap dropped", or needs a separate contract.

**`FACT:…426-508.1:C_OWED_PROPERTY_SEMANTIC_CORRECTNESS`** *(U16, 1 slot)*
**`FACT:…324-424.1:C_OWED_PROPERTY_SEMANTIC_CORRECTNESS`** *(U17, 1 slot)*
*Unique question:* does each projected owed property still name its own conjunct exactly, so that
the two together still cover the preregistered conjunction?
*Why BOTH C slots and not one:* survival of a conjunction cannot be read off one half. A single
C judgment would show one conjunct intact while leaving open whether the other was blurred or
lost — the precise failure mode this row was built to detect. These are the only two slots in the
plan that are deliberately duplicated across facts.
*Not answered by existing evidence:* every recorded C judgment (U02, U05, U07, U09) is on a row
with a single projected fact, so none tests cross-fact coverage of one property.
*Decision it could change:* whether the OwedFact contract must carry an explicit conjunction or
parent-property binding, versus relying on two independent facts to reconstitute one property.

### Q3 — did the verifier remain bound to the exact projected property?

**`FACT:…324-424.1:L_VERIFIER_TARGET_BINDING`** *(U17, 1 slot)*
*Unique question:* did the verifier stay on the proved-dead property it was actually handed,
rather than substituting isolation/LOTO status — the preregistered unacceptable neighbour *"whether
the isolator is OFF — the text states it is"*, which the recorded weak-pointer observation flags at
33% shared vocabulary on both facts?
*Why U17 and not U16:* the two verifier records are structurally near-identical, so one L
judgment tests the binding behaviour. U17 is selected because its declaration text overlaps BOTH
preregistered conjuncts (67%/40%) rather than one cleanly (0%/100%), making it the harder binding
case of the pair. If L comes back other than clean, U16's L becomes worth adding.
*Not answered by existing evidence:* L is recorded CORRECT four times, but never where two
sibling facts from one property were before the verifier simultaneously.
*Decision it could change:* whether verifier input needs sibling-fact disambiguation.

### Q4 — could the clarification actually settle the COMPLETE relevant property?

**`FACT:…324-424.1:M_CLARIFICATION_RESOLUTION_SUFFICIENCY`** *(U17, 1 slot)*
*Unique question:* can the clarification set actually settle the full conjunction — the exact
compound-completeness claim both verifier rationales assert in terms?
*Not answered by existing evidence:* M is recorded CORRECT on U02/U05/U07 and INCORRECT on U09,
where the insufficiency was a lost TEMPORAL qualifier on a single fact. SF-08's risk is a lost
CONJUNCTIVE scope across two facts. A second insufficiency of a different kind would establish
that U09 was not a temporal-property special case; a clean result would bound the U09 finding to
temporal properties. **Either outcome is decision-relevant, which is what makes this the single
highest-value slot in the plan.**
*Decision it could change:* whether the functional remediation requirement stated by the product
owner — that the property necessary to settle the fact must survive projection in a form the
verifier can consume without reconstruction from prose — must cover compound scope as well as
temporal scope.

### Q5 — another observable instance of owed-property loss during projection?

**`FACT:…324-424.1:Q_OWED_PROPERTY_LOSS_IMPACT`** *(U17, 1 slot)*
*Unique question:* given that `missingFactInProjectedOwedFact` is `False` on both facts, did that
loss produce observable downstream degradation here, and of which kind?
*Not answered by existing evidence:* Q currently reads `NO_OBSERVABLE_LOSS` three times (U02,
U05, U07) and `CLARIFICATION_INSUFFICIENCY` once (U09). With n=1 on the loss side, the recorded
evidence cannot distinguish "loss sometimes degrades" from "loss degrades whenever the property is
compound or temporal." SF-08 is the only remaining conjunctive instance.
*Decision it could change:* the scope of the functional remediation requirement, and whether the
loss-impact taxonomy needs a distinct compound-scope member. **Constraint carried forward: a
second instance still does not authorize the conclusion that a dedicated `missingFact` field is
the required remedy.**

**Minimal set total: 7 slots — U15 {A, H}, U16 {C}, U17 {C, L, M, Q}.**

---

## 3. OPTIONAL ADD-ON, PRODUCT-OWNER DECISION — 2 SLOTS

**`FACT:…324-424.1:R_SAFETY_CLASSIFICATION`** and **`FACT:…324-424.1:R_PRIORITY_FLOOR_IMPACT`**
*(U17, 2 slots)*

Outside Q1–Q5 as posed, and therefore **not included in the minimum**. Flagged because the
product owner's efficiency target explicitly declines to optimise toward a number while
safety-relevant uncertainty remains, and this is the relevant uncertainty: both SF-08 projections
carry `priority: "OTHER"`, the preregistered criticality note describes a person working inside a
possibly-live enclosure as an electrocution exposure *now*, and the recorded floor finding stands
at exactly two instances (U05, U09). A third instance on a different hazard family — electrical
rather than mechanical/crane — would show the floor behaviour is not hazard-family-specific.
This would remain diagnostic evidence only and would not authorize a priority-policy change.

---

## 4. CONSIDERED AND EXCLUDED FROM THE MINIMUM — 15 SLOTS

| Slot(s) | Why excluded |
|---|---|
| `ROW:SF-08:B_FIRST_PASS_GAP_PRECISION` | Q1–Q5 ask about preservation, not precision. The recorded neutral observation already places the admitted count inside the preregistered 1–2 range, so B is not positioned to expose a preservation defect. |
| `ROW:SF-08:I_FALSE_GAP_SUPPRESSION` | I is the sufficient-text axis. SF-08 is not a `NO_REAL_GAP` row; it carries two preregistered open conjuncts. At U08 the product owner recorded `NOT_EXERCISED` for the analogous position and warned against vacuous CORRECT. **Excluded means unreviewed — not `NOT_EXERCISED`, which only the product owner may record.** |
| `D_EVIDENCE_SPAN_SEMANTIC_RELEVANCE` on U16 and U17 | The recorded neutral observation states each declared span is EXACTLY one of the preregistered acceptable regions, on both facts. D is not positioned to discriminate. |
| `E_BRANCH_PLAUSIBILITY`, `F_DECISION_DIVERGENCE_VALIDITY`, `G_AFFECTED_DECISION_CORRECTNESS` on U16 and U17 | Not asked by Q1–Q5. `affectedDecision` matches the preregistered expectation on both facts, so G has no structural opening. **One flag against this exclusion:** the branch-text asymmetry in §1 — U17's branch A does not restate the *after isolation* sequence qualifier, while U16's does restate *before the enclosure was opened* — is the same structural feature that produced PARTIALLY_CORRECT on E and F at U09. If the product owner wants the temporal/sequence question tested inside the conjunctive row rather than only across rows, **`FACT:…324-424.1:E_BRANCH_PLAUSIBILITY` (1 slot) is the one addition worth its cost.** Offered, not recommended into the minimum. |
| `L`, `M`, `Q` on U16 | The two verifier records are structurally near-identical and both rationales make the same compound claim; duplicating these three axes on the sibling fact buys replication, not discrimination. Promote them only if U17's results come back other than clean. |
| `R_SAFETY_CLASSIFICATION`, `R_PRIORITY_FLOOR_IMPACT` on U16 | Same reasoning: one fact carries the priority question for the row. |
| `N`, `S`, `T` on U16 and U17 | Structurally prefilled `NOT_EXERCISED`; no governed evidence was shown. Not open, not counted. |

**Cost comparison:** 7 slots (or 9 with the R pair, 10 with the E flag) against 24 for the full
SF-08 block.
