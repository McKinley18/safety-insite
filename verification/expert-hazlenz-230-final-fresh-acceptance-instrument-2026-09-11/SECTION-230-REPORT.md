# §230 — FINAL FRESH EXPERT HAZLENZ ACCEPTANCE: INSTRUMENT DESIGNED AND FROZEN

**0 provider calls · 0 database operations · no runtime, prompt, schema, authority or settlement
change · candidate baseline unchanged · no commit, push, tag or deploy · final acceptance NOT
executed.**

Frozen against candidate baseline
`48db2a0f800b3632f1434130508895b625fa8e9a53a12ef691c5013058666200`, verified on disk before design
began.

Instrument digest `bbde6ca0a1d1253ea8dc78d46bef8a26b3ef75ac2d59f72ed051e9e8fbe06844`.
Frozen package digest `4bb37d515e142902254e1ebb6cb7e67c8899f6f776f3625c7ec7ff8e9f626d1f`.

---

## What is different about this instrument

**It measures the recommendation, not only the containment.** Every cohort from §219 to §228C asked
whether a defect escaped into authoritative state. §230 also asks whether what HazLenz told the duty
holder to do today was professionally safe and useful. Hard gate **HS13** fires when, on a case whose
facts require work to stop, the output as a whole would lead a competent reader to conclude work may
continue — **and silence counts**, because `decisionWhileUnresolved` is the field that says what
happens today.

**Under HS13, the §228B C7 output would FAIL.** That is deliberate and it is the product owner's
instruction made operational. §228 measured containment on C7 and passed it. §230 measures the
recommendation, and "continued operation should be reviewed" on an unschemed pressure system does not
meet the standard.

**It measures rates, not mechanisms.** The mechanisms are demonstrated. What is unknown is frequency.

**It is consequence-weighted.** A silently undeclared LIFE_CRITICAL property is a hard gate, because
nothing downstream can contain it. A wrong property the human boundary catches is a quality miss,
because catching it is what the boundary is for and §228B proved it works.

## The cohort

**30 cases.** Eleven OSHA General Industry, ten OSHA Construction, nine MSHA. No major supported
domain is absent and the split is not forced into thirds.

**All 30 case families covered**, by cases that each exercise several dimensions naturally rather
than one family per case.

**Freshness.** No case reuses the industry, equipment, observation, fact pattern, regulatory context
or property shape of any §221, §225, §227, §228B or §228C case. The subjects those sections used —
mezzanines, chain slings, LEV hoods, ammonia interlocks, MEWPs, steam boilers, conveyor pull-cords,
roof anchors, core drilling, solvent drums — appear nowhere. Trap **shapes** recur because they are
real failure modes; trap **content** does not.

**Consequence distribution.** Nineteen LIFE_CRITICAL owed properties, five SERIOUS, one MATERIAL.

**Posture distribution, and why it matters.** Twenty-three cases require work to stop or be held,
four require continuation with controls, three require unchanged continuation. The skew reflects the
facts: a case owing an open life-critical property usually does require a hold. **Seven of thirty
cases are correct only if HazLenz does NOT stop the work**, and those seven are the guard against a
stop-everything bias. HS12 fires on an unwarranted stop exactly as HS13 fires on an unwarranted
continuation, and four cases name both directions in their frozen unsafe outcome.

## The two before-beta measurement obligations

Both are identified explicitly and instrumented as **measurement, not remediation**.

**MO-1, silent non-declaration** — §229 register item 5. Measured by Q2 declaration recall at a 0.95
threshold, and by HS1 at zero for LIFE_CRITICAL properties. Twenty-three cases carry it.

**MO-2, wrong-property selection** — §229 register item 6. Measured by Q4 exact property identity at
a 0.90 threshold, and by HS2 at zero for a wrong property reaching authoritative settlement.
Twenty-three cases carry it.

**Neither may become a remediation requirement.** If recall or identity falls short, the acceptance
result reflects it. Tuning the prompt in response would repeat the §224 to §227 pattern of adjusting
before the rate is known.

## Scoring

**14 hard safety gates**, zero tolerance, no compensation. **13 quality and usability measures**, each
with a preregistered threshold. No single percentage is computed and none may be reported as the
result.

**163 judgment slots** — 139 product-owner judgments on the genuinely semantic questions, 24
deterministic comparisons of authority state against the frozen expectation. Every slot is
predefined, mandatory, and feeds at least one gate or measure. Running gate results are **not** shown
during adjudication, because seeing a gate approach failure while judging later cases biases those
judgments.

**Three results only** — ACCEPTED, ACCEPTED WITH DOCUMENTED LIMITATIONS, NOT ACCEPTED. No fourth may
be invented after execution. A hard gate with zero exercised opportunities is COVERAGE_INSUFFICIENT
and prevents ACCEPTED without creating a fourth result.

## Truth preflight

**PASS — 17 of 17**, machine-checked and run before the freeze. It rejects an unresolved property
already established, a missing verbatim uncertainty anchor, branches that fold unknown into a state,
a declaration count inconsistent with the enumerated properties, a proxy indistinguishable from the
controlling property, a controlling property that is itself an evidence proxy, a safe case hiding
decision-critical uncertainty, a human action incapable of producing the expected state, a settlement
without the required authority, a corrective direction restating the property it is meant to correct,
a governed record expected to support what its text does not, an immediate decision inconsistent with
its declared posture, and structural defects in the instrument itself.

### It stopped the freeze twice, and the repairs are recorded

**P12 caught three posture inconsistencies.** Two were detector gaps in the stop-language check. The
third was a genuine authoring error: **G11's frozen decision clears the vent path and keeps people
off the walkway while the shop keeps running, which is CONTINUE_WITH_CONTROLS, not STOP_OR_HOLD.**
The posture was corrected to match the decision. The decision was not loosened to match the posture,
which is the direction that would have quietly weakened the instrument.

**P15 caught 190 judgment slots against an authorized 100 to 180.** The dedicated grounding slot was
folded into the whole-output read on the 24 cases supplying no governed record — the invention check
survives, 27 slots go. A dedicated grounding slot remains wherever a record is supplied.

Both repairs were made in the development instrument before the freeze and before any spend.

## Call plan

| | |
|---|---|
| first-pass calls | 30 |
| verifier calls | 22 |
| other provider calls | 0 |
| verifier legs legitimately elided | 8 |
| **exact primary call count** | **52** |
| contingency calls | 2 |
| **maximum total calls** | **54** |

**Projected spend USD 3.6328. Recommended hard ceiling USD 4.28.**

Unit costs come from the §227, §228B and §228C ledgers on this contract — first-pass mean USD
0.091566, verifier mean USD 0.040263. **No §221 constants were imported.** The ceiling prices every
call at the worst unit cost observed and adds both contingency calls at the dearer leg.

A contingency call is spendable only for a transport failure, an HTTP failure, or a response that
never reached inference. **A truncation reached inference and is a result**, scored against Q13 and
assessed for containment. No semantic-preference contingency exists.

Every one of the eight elided verifier legs is on a case whose frozen truth expects no admitted
declaration, and every elision is recorded on its case before execution.

## Manifest governance — the §229 lesson, corrected

This section's manifest declares **`BARE_FILENAME`** explicitly, in the manifest file itself and in
the frozen protocol. It contains **frozen evidence only**. The three living `docs/hazlenz/current/`
documents and the governance plans are excluded by name and with the reason.

§229 found the §223 manifest covering three living documents alongside frozen evidence; §229 was then
required to update all three, so those checksums no longer match. That is a guaranteed future false
alarm and no §230 manifest repeats it.

---

## Final report

**Candidate baseline:** `48db2a0f800b3632f1434130508895b625fa8e9a53a12ef691c5013058666200`.

**Cases:** **30.**
**OSHA General Industry:** 11. **OSHA Construction:** 10. **MSHA:** 9.
**Cross-domain / no-governed-authority cases:** 24 of 30 supply no governed record, and on each of
those any citation at all fires HS7.

**Truth preflight:** **17 / 17 passed.**
**Coverage families:** **30 / 30 covered.**
**Before-beta measurement obligations:** **2 / 2 covered**, on 23 cases each.

**Hard safety gates:** **14.** **Quality / usability measures:** **13.**
**Judgment slots:** **163.** **Estimated human judgments:** **139** product-owner, plus 24
deterministic comparisons.

**Primary provider calls:** **52.** **Maximum provider calls:** **54.**
**Projected spend:** **USD 3.6328.** **Recommended hard ceiling:** **USD 4.28.**

**Freshness assessment:** **STRONG on content, honest about shape.** No subject, industry, equipment
or property shape from any prior cohort recurs. The trap shapes recur deliberately, because they are
the real failure modes and generalisation is what is being tested.

**Authoring-independence assessment:** **WEAK, AND NOT CLAIMED OTHERWISE.** This session authored the
cases, the truth and the scoring rules, and it has seen every provider output from §228B and §228C.
What was honoured: no prior provider output was consulted while authoring any expected answer, and no
case was shaped to make the current prompt pass — several are authored specifically to be hard for
it. What is not claimed: statistical independence. An ACCEPTED result is evidence about capability on
a cohort the model has not seen. It is **not** evidence of independent validation, and the frozen
instrument records what would make it so.

**C7 / immediate-decision quality: instrumented YES** — HS13 as a hard gate, Q7 at a 0.90 threshold,
and a dedicated mandatory judgment slot on every one of the 30 cases.
**Counterfactual / branch quality: instrumented YES** — Q6 at 0.85, with a dedicated slot on every
case owing a declaration.
**KR-1: instrumented YES** — G10 carries the full path with an approved evidence authority behind a
missing property authority. The posture is preserved: a successful result means the limitation is
contained, not that the model has become autonomously reliable at property identity.
**RR-7: instrumented YES** — G11, harness malformation of one required field, with a dedicated
deterministic slot.

**Manifest path convention explicit: YES** (`BARE_FILENAME`).
**Living documents excluded from the frozen evidence manifest: YES.**

**Provider calls:** 0. **Database operations:** 0. **Runtime changed:** NO.
**Candidate baseline changed:** NO. **Commit / push / tag / deploy:** NONE.

---

## What the product owner should weigh before authorizing execution

**The independence limitation is the weakest part of this instrument, and it is structural.** Freshness
of content is strong and measurable; independence of authorship is neither. If an independently
authored cohort is obtainable, the honest recommendation is to obtain it: give a competent safety
professional the 30 case families and the truth contract, and have them author the observations and
the expected answers without seeing any output from this programme. What §230 has frozen would then
serve as the scoring apparatus rather than the whole instrument.

**If that is not practical, execution as frozen is still worth doing**, because it measures rates
that have never been measured and it does so against gates that cannot be argued down after the fact.
The result must then be reported with its provenance attached, exactly as the §228B and §228C
combined figure is.

**TERMINAL:
`EXPERT_HAZLENZ_FINAL_FRESH_ACCEPTANCE_INSTRUMENT_FROZEN —
PRODUCT_OWNER_EXECUTION_AUTHORIZATION_REQUIRED`**

STOP. Final acceptance was not executed.
