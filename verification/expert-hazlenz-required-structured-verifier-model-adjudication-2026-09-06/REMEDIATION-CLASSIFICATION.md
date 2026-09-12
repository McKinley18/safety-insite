# §190 — Remediation classification

Each bucket is marked **DEMONSTRATED** only where the frozen mechanical evidence and/or the §190
model adjudication actually supports it. Model findings are diagnostic; where a bucket rests on them
alone that is said explicitly, because the human instrument is incomplete.

**No product, runtime, prompt, schema or contract source was modified in §190.**

---

| bucket | status | rests on |
|---|---|---|
| `STRUCTURAL_CONTRACT` | **DEMONSTRATED** | mechanical (§187B/§188) |
| `CLARIFICATION_EVIDENCE_SUFFICIENCY` | **DEMONSTRATED** | model adjudication (§190) |
| `ADJACENT_PROPERTY_SUBSTITUTION` | **DEMONSTRATED** | model adjudication (§190) |
| `OWED_FACT_PRESERVATION` | **DEMONSTRATED** — as a consequence, not independently | model adjudication (§190) |
| `CLARIFICATION_POLICY` | **INCONCLUSIVE** | see below |
| `CHALLENGE_POLICY` | **INCONCLUSIVE** | n = 1 |
| `FACTKEY_TARGETING` | **NOT_DEMONSTRATED** | mechanical + model, both clean |
| `SETTLEMENT_AUTHORITY` | **NOT_DEMONSTRATED** | structural, clean on every execution |
| `OTHER — first-pass question quality` | **DEMONSTRATED**, and it is not a verifier defect | model adjudication (§190) |

---

## DEMONSTRATED

### `STRUCTURAL_CONTRACT`
Two of fifteen executions were refused whole for an output state the schema permits and its own
field descriptions license. Established **mechanically**, independent of any adjudication:
`VERIFIER_V3_RESPONSE_SCHEMA` carries no `if`/`then`/`oneOf`/`anyOf`/`allOf`/`not`/
`dependentRequired`; `clarificationSourceMode`'s description contradicts itself once a binding
appears under a non-`ADD` verdict; `declaration` has no description at all; and the contract has no
token meaning *"the first pass's question already reaches this fact"*.

§190 sharpens the picture: `188-HR-01-R3` is **contract-invalid and semantically sound**. The
failure costs yield, not safety — the architecture refused both outputs whole and no fact moved.

### `CLARIFICATION_EVIDENCE_SUFFICIENCY`
All three HR-08 executions certified a question that cannot settle its conjunctive owed fact
(**isolated AND proved dead**) because its parenthetical is disjunctive — *"locked out (or otherwise
verified de-energized)"*. The verifier never tests a question conjunct by conjunct against the owed
property. This is the most consequential behavioural finding, and the most contestable; the
counter-argument and the aggregate's sensitivity to it are both recorded.

### `ADJACENT_PROPERTY_SUBSTITUTION`
Three of fifteen, all HR-04, all category **C**. Presence stands in for securement; an inspection of
*belt tracking and lubrication* stands in for verification of fastener securement; absence of tools
is allowed to bear on securement; a historical annual torque check is allowed to speak to current
state. Replicate 1 additionally states as observed fact a daily guard check the observation does not
describe.

The mechanism is general even though the outcome is row-specific: the instruction's inclusionary
heuristic — *"a control that cannot be seen is not a control that was checked"* — has no stated
boundary for the case where a **housing is visible but a property of it is not**. HR-04 R3 declines
the heuristic on exactly that ground.

### `OWED_FACT_PRESERVATION`
Four executions (HR-04 ×3, HR-08 R2) treated the owed fact as covered or unnecessary. **This is a
consequence of the two buckets above rather than an independent defect** — there is no execution
where preservation fails without substitution or sufficiency failing first. Remediating those two
should close this; it does not need its own change.

### `OTHER` — first-pass question quality, upstream of the verifier
The insufficient HR-08 question was authored by the **first pass** (`hazlenz.expert.prompt.v15`),
not by the verifier. The verifier's failure is failing to *catch* it. Two distinct remediation
targets sit behind one observation, and they are not interchangeable: hardening the verifier's
sufficiency test catches such questions in future; hardening first-pass question construction stops
them being authored. **Only the verifier-side target is in scope for the current programme**; the
first-pass side is recorded as a finding and needs its own authorization.

## INCONCLUSIVE

### `CLARIFICATION_POLICY`
`proposedClarification = 0/15` is **not** itself a defect: on twelve executions a targeted first-pass
question already existed, and declining to add one there is contract-prescribed behaviour. On HR-04
no question existed and none was proposed — but the model finding is that this followed from
substitution, not from a policy bias against asking. **Whether the verifier is under-triggered on
clarification proposal generally cannot be determined from a cohort with only three unconditional
opportunities, all on one row.** Marked inconclusive rather than demonstrated, and it would need a
cohort designed to create proposal opportunities.

### `CHALLENGE_POLICY`
One challenge in fifteen. Judged invalid on all three validity axes and **REVIEWABLE**. One
observation cannot establish a policy defect or its absence, and the frozen instruction states in
terms that there is *"no expected number of challenges"*. The single data point is suggestive —
challenge was reached for on the row where substitution occurred — but suggestive is not
demonstrated.

## NOT_DEMONSTRATED

### `FACTKEY_TARGETING`
Clean on both instruments. Zero wrong-key declarations mechanically; all fifteen engaged the correct
supplied key semantically. Where reasoning went wrong it went wrong about the **property**, never
about which fact was at issue — which is why the §190 principle routes those defects to the
substitution axis and this bucket stays empty.

### `SETTLEMENT_AUTHORITY`
No execution moved a fact's status. `PROVIDER_SETTLEMENT_AUTHORITY = NEVER` held on every row,
including all three HR-04 replicates where the reasoning was wrong. HR-04 R2 states the boundary
unprompted: *"I am not entitled to mark it answered."* **The containment layer absorbed a real
reasoning defect without the ledger moving** — the strongest positive architectural result in the
cohort, and a reason not to touch it.

---

## Smallest justified remediation

Ordered smallest first. Each is independently testable and none requires the others.

**1. Repair the three schema field descriptions** — unchanged from the §188 recommendation, and
still the smallest. Scope `bindingFactKey`'s *"this question"* to the response; remove
`clarificationSourceMode`'s internal contradiction; give `declaration` the description it lacks. No
structural change, no new field, no new enum member, no change to admission. Addresses
`STRUCTURAL_CONTRACT` and rests on **mechanical** evidence alone, so it does not wait on the human
adjudication.

**2. Add a conjunct-by-conjunct sufficiency step to the verifier instruction.** Step 3 already
demands that an answer *"would settle the fact that changes the decision"*; what is missing is the
instruction to decompose a conjunctive owed fact and check the question's wording against **each**
conjunct, and to treat a disjunctive question as satisfied by its weakest disjunct. One step,
addressing `CLARIFICATION_EVIDENCE_SUFFICIENCY`.

**3. Bound the unseen-control heuristic.** Add that a visible component does not make an
unobservable **property** of that component a seen control — presence is not securement, and an
inspection of stated scope does not verify a property outside that scope. One clause in step 2,
addressing `ADJACENT_PROPERTY_SUBSTITUTION`.

**Explicitly not recommended now**, unchanged from §188: JSON-Schema conditionals (provider
enforcement unverified here); a fourth declaration member (needs its own authorization, must be
typed `settles: false`); normalizing the illegal state away (would destroy the evidence that a
binding was asserted); partial admission. **Do not touch the settlement-authority containment** — it
is the thing that worked.

**Governance note.** Items 2 and 3 modify the verifier instruction, which changes its identity hash
and means results before and after are not one population. Item 1 does the same to the schema hash.
They should be authorized and executed as one bounded change with a re-baselined identity, not
drip-fed. And items 2 and 3 rest on **model** adjudication of a 15-execution cohort; if the human
instrument is later completed and disagrees, the basis for those two changes changes with it.
