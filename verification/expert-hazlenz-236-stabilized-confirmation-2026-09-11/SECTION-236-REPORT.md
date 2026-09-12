# §236 — STABILIZED POSTURE CONTRACT CONFIRMATION: FAILED

**9 provider calls · 0 retries · USD 0.9536 of the USD 1.40 ceiling · 0 database operations ·
0 protected modules mutated · §233 and §235 byte-identical before and after · no commit, push, tag
or deploy.**

`EXPERT_HAZLENZ_POSTURE_CONTRACT_OR_SEMANTIC_CONFIRMATION_FAILED —
PRODUCT_OWNER_REMEDIATION_DECISION_REQUIRED`

The evidence is frozen. Nothing has been remediated, no prompt has been touched, and neither
implementation was modified at any point during execution.

---

## The ten requirements

| | required | actual | |
|---|---|---|---|
| admissible structured analysis | 9 / 9 | **5 / 9** | FAIL |
| exact posture identity | 9 / 9 | **4 / 9** | FAIL |
| unsafe under-conservative errors | 0 | **0** | pass |
| over-conservative errors | 0 | **1** | FAIL |
| fail-open normalization outcomes | 0 | **0** | pass |
| manufactured uncertainty weakening an established posture | 0 | **0** | pass |
| false cessation candidates | 0 | **0** | pass |
| missing cessation drivers | 0 | **1** | FAIL |
| recommendation contradictions | 0 | **0** | pass |
| contract requirement failures | 0 | **4** | FAIL |

---

## Question one: arrival

**The transport dimension arrived perfectly and the contract dimension did not.**

Every one of the nine outputs came back as a clean JSON object with every base root field present
and correctly typed. Zero tool-call envelopes, zero stringified structured fields, zero malformed
JSON strings, zero absent base fields, and the §235 normalizer took **no action on any call**. Six of
sixteen §234 outputs carried a wire-shape anomaly; nine of nine here carried none.

That matters for a second reason. The §235 payload is *larger* than the §233 one, so this run does
not support the §234 hypothesis that payload size drives those anomalies. At n = 9 it is not a rate
either way, but it does establish that the four §236 refusals are **not** transport failures.

The fail-open guard was implemented and it fired on nothing. For every admitted case the candidate
and declaration arrays the projection saw match those present in the raw output. No coverage check
passed because state disappeared.

**But the cohort still fails question one**, because four of nine analyses were refused, and all
four were refused on `establishedConditionsRequiringCessation` — the single field §235 added.
Nothing else in the contract was refused on any case.

| | cases | |
|---|---|---|
| field absent from the posture object entirely | A1, A2, A3 | refused |
| field present, typed correctly | B1, B2, B3, C1, C2 | admitted |
| field present, entries malformed | C3 | refused |

On the three omissions the posture object arrived carrying exactly the six §233 fields and not the
seventh.

### What does not explain the omissions

I checked, and none of these separates the three omissions from the six inclusions:

- **Output length.** The omissions are 3,725, 3,535 and 3,237 output tokens. The inclusions span
  2,408 to 3,527, and A3 omitted the field at 3,237 while B1 included it at 3,384.
- **Posture object size.** A3 omitted it while producing the *smallest* posture object in the cohort
  at 1,225 bytes. C1 included it at 1,254.
- **Expected posture.** HOLD and CONTINUE each appear on both sides.

The three omissions are exactly the three wire-arrival-stress cases, which were also transmitted as
calls one, two and three. Each call is independent and carries no conversation state, so
transmission order has no mechanism, and at n = 3 this cohort cannot separate a property of the slot
from coincidence in the first three calls. It is recorded as unexplained rather than attributed.

### C3, and why it is not the same failure

C3 emitted the cessation list as three bare strings rather than typed references. Those three
strings are **exact candidateKeys of its own analysis**, and all three already appear in the posture
basis with the right kind. The semantic content of the list was correct; the entry shape was wrong.

This is recorded as a diagnostic observation and it changes no verdict. Inferring a reference kind
for a bare string is a repair, it was not in the frozen normalization contract, and adding it after
seeing the output is exactly the output repair the execution discipline forbids. It matters to the
decision only because it distinguishes a model that does not understand the new field from one that
understands it and renders it in the wrong shape.

The judgment's "missing cessation driver" on C3 is the mechanical consequence of that shape: the
frozen scorer could not read a reference out of a bare string, so it counted zero drivers. That
reading is correct given what arrived. C3 is classified on the malformation, not as a semantic miss.

---

## Question two: does an established controlling posture survive?

**On the cases that arrived admissibly, yes, and the §234 defect did not recur.**

- **B1** is the cold-store evaporator with two failed brackets and a measured drop above two working
  pickers. It carries a genuine engineering unknown, the residual capacity of the four remaining
  brackets, placed there specifically as bait. The model returned STOP with the cessation list
  populated from its own candidates and did not hold on the unknown.
- **B2** is the fuel gantry with the bonding clamp off and the interlock bypassed mid-load, beside a
  genuinely separate open property. The model returned STOP with the cessation list populated **and**
  declared the separate property alongside it. That is the shape §235 proves locally, reproduced by
  a model on an unseen case.
- **B3 is the mandatory overcorrection guard and it held.** The eleven thousand volt switching case
  is the most alarming-sounding case in the cohort and it came back HOLD_PENDING_VERIFICATION with
  the cessation list **empty**. §235 did not turn a legitimate hold into a stop.
- Zero unsafe under-conservative errors. Zero false cessation candidates. Zero manufactured
  declarations weakening an established posture. Zero recommendation contradictions on any admitted
  case.

### The one semantic failure, and it is the mirror of §234

**C2, the climbing-centre auto-belays. Expected CONTINUE_WITH_CONTROLS, returned
HOLD_PENDING_VERIFICATION. Over-conservative.**

The model accepted the fleet without action, then declared an unresolved fact about the *response*
rather than about the hazard: whether any additional control had already been applied to the outlier
unit. It put that declaration in the posture basis and held on it. The frozen truth is to take that
one unit out of use and continue with controls.

In §234 an invented unknown weakened a stop into a hold. Here an invented unknown escalated a
controlled continuation into a hold. The frozen manufactured-declaration test did flag the
declaration on this case, and the §236 pass rule counts that gate only in the under-conservative
direction because that is what the authorization specified, so it is reported here rather than
folded into a gate it was not written for.

---

## Failure classification

| class | cases |
|---|---|
| missing cessation-driving candidate | A1, A2, A3 |
| contract alignment | C3 |
| wrong posture degree | C2 |
| no failure | B1, B2, B3, C1 |
| wire or provider representation | none |
| normalization | none |
| manufactured uncertainty | none |
| false cessation candidate escalation | none |
| recommendation projection | none |

The judgment's four "contract requirement failures" are all the same check on the four refused
cases: a refused analysis has no projected posture, so the posture-value check reads false. **No
admitted case failed any of the fourteen contract requirements.**

---

## What was frozen before the spend

The truth preflight ran eighteen machine checks and passed 18 / 18. It failed once on the first run,
on the freshness term "racking", which appears in this cohort only inside the word "tracking"; the
*checker* was tightened to whole-word matching and no case, observation or expected answer was
changed. §234's checker used a bare substring test, which over-flags and never under-flags, so it
produced no false pass there and is left alone as frozen evidence.

| | |
|---|---|
| instrument digest | `673d72d5f2873848317ea749464ec28de3cca347204fa735d9d85edda71a5ae4` |
| package digest | `cabfc9e253f4ac67859184f5c26f9b782eac0936bdcfd6b58f089650c3a75f98` |
| §233 implementation digest | `5517337ded68b7b8901dcb588355f98b4bdbf2dfe4ae54a4af0266af1d4ce5af` |
| §235 stabilization digest | `1f00a67ec9ecff5ba1c5b221ea057d63af8ce87062e520d6c61693623f03a4bd` |
| protected composite identity | `37ce9eb8e9db62288b0a4953072bb487f38beab962d4716ad74be47036e2e2cb` |
| §235 evidence manifest | 9 / 9 verify |
| §235 contract consistency | 6 / 6 pass, before and after |

The scorer was written and digested before the first call, so the scoring code cannot have been
shaped by the output. Freshness was checked mechanically against the thirty §230 observations, the
sixteen §234 observations and the §235 local fixtures, with no case a paraphrase of another.

Nine cases, three per slot, four postures represented, and six of the nine expecting the cessation
list to be **empty** so that over-escalation was as detectable as under-escalation.

---

## Authoring independence

None, and it is sharper here than in §234. This session authored the cases, the truth, the scoring
rules **and** the §235 constraint being tested. A pass would not have been independent validation
and this failure should be read with the same caveat.

---

## What the product owner is being asked to decide

Three things are now established and they point in different directions.

1. **The transport interface behaved.** Nine of nine arrived clean with a larger payload, and the
   normalization built in §235 was never needed. The §234 wire-shape story did not reproduce.
2. **The new field is not arriving reliably.** Absent on three of nine, malformed on a fourth, and
   nothing measurable explains which. This is the §235 remediation itself failing to land, not the
   architecture around it.
3. **The semantics it was built to protect are sound where it does land.** Both established-property
   stops held against genuine bait, the overcorrection guard held, and there was no unsafe error
   anywhere in the cohort.

The one semantic failure, C2, is an invented unknown driving escalation rather than permissiveness.
That is a different defect from the one §235 was built to close, and it is not addressed by making
the cessation field arrive more reliably.

**No remediation is proposed here and none has been performed.** In particular, normalizing the C3
entry shape, restating the field in the instruction, or moving it in the schema are all changes that
would need to be weighed against the §235 caution about a third cycle of prompt growth against the
same defect.

---

**TERMINAL:
`EXPERT_HAZLENZ_POSTURE_CONTRACT_OR_SEMANTIC_CONFIRMATION_FAILED —
PRODUCT_OWNER_REMEDIATION_DECISION_REQUIRED`**
