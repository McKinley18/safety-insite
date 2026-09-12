# Candidate silence-control rows — for product-owner review

**§168, 2026-09-04. Zero provider calls. DRAFT MATERIAL, NOT EVALUATION TRUTH.**

```
AUTHORITY_STATUS = CANDIDATE_NOT_AUTHORITATIVE
```

These rows were **drafted by a model**. §162 established that five of seven rows of
model-authored evaluation truth did not survive human review and three were invalid, and
this operation's authorization requires silence-control truth to be "not authored by the
evaluated provider as final authority". **No denominator, rate or figure may rest on these
rows unless and until a review returns a disposition for each.**

## Why a silence control is harder to author than a REQUIRED row

A REQUIRED row asserts one named, checkable fact. A silence row asserts that **nothing** is
decision-critical — an unbounded claim about everything the observation does not say. So
each candidate below states the facts it settles *with the verbatim span that settles
each*, and then lists the plausible facts a reasonable verifier might reach for **with an
explicit argument for why answering each one either way leads to the same thing being done
today**.

That last list is the row's real content. It lets a reviewer disagree with a specific
counterfactual rather than with a verdict.

---

## Mechanical lint

| candidate | domain | observation chars | settled facts | counterfactuals | problems |
|---|---|---|---|---|---|
| `SC-1` | electrical / hazardous energy control | 572 | 4 | 3 | 0 |
| `SC-2` | respiratory / solvent vapour | 584 | 4 | 3 | 0 |
| `SC-3` | fall protection / work at height | 592 | 5 | 3 | 0 |
| `SC-4` | noise exposure | 589 | 4 | 3 | 0 |
| `SC-5` | powered industrial truck / pedestrian separation | 559 | 5 | 3 | 0 |

A clean lint does **not** make a row valid. It catches only the failures decidable without
judgement: a settling span that is not verbatim, a conclusion cue in the observation, a
counterfactual whose branches are identical or whose reasoning does not actually state
action-equivalence.

### The cue risk these rows cannot fix on their own

A row that settles everything is **longer** than a row that leaves a gap. If the assembled
cohort's silence rows are systematically longer than its REQUIRED rows, length becomes a
cue for "ask nothing" and the measurement is worthless.

Candidate observations: 559–592 characters (mean 579).
Existing REQUIRED rows: HS-A1 402, HS-E1 412.

**`SEPARABLE_BY_LENGTH`** — NO REQUIRED row falls inside the candidate length band. Length would be a usable cue for "ask nothing" and the set MUST NOT be used until the imbalance is corrected, either by shortening the controls or by adding longer REQUIRED rows.

---

## SC-1 — electrical / hazardous energy control

**Jurisdiction:** `osha-general-industry` · **Tested question family:** whether hazardous energy is controlled for the work in progress

### Observation

> An electrician is replacing a contactor inside a motor control cabinet on the packaging line. The line disconnect is open and padlocked with the electrician's own lock and tag, and they are the only person working on the circuit. Before opening the cabinet they tested their meter on a known live source, tested the line terminals and read zero volts, then retested the meter on the known live source. The cabinet door is open and the electrician is wearing safety glasses and insulated gloves. The packaging line is stopped and a supervisor is standing at the disconnect.

### Decision-critical facts the observation SETTLES

| fact | settled by this span |
|---|---|
| the circuit is isolated and the isolation is under the worker's own exclusive lock | "The line disconnect is open and padlocked with the electrician's own lock and tag, and they are the only person working on the circuit." |
| absence of voltage was verified by a live-dead-live test at the point of work | "they tested their meter on a known live source, tested the line terminals and read zero volts, then retested the meter on the known live source" |
| the equipment is at rest, so no stored motion energy is acting | "The packaging line is stopped" |
| the disconnect is attended, so inadvertent re-energisation is guarded | "a supervisor is standing at the disconnect" |

### Plausible omitted facts, and why each changes nothing today

**whether the electrician holds a formal lockout/tagout training certificate**

- if *they hold a current certificate* · if *their certificate has lapsed*
- the observation states the isolation was performed and verified by live-dead-live test with an exclusive personal lock. A lapsed certificate is a records and qualification finding for the employer, not a change to what is done at this cabinet right now. The energy is already controlled and verified at the point of work, so the SAME thing is done either way and the work stops for neither answer.

**the voltage class of the circuit**

- if *low voltage* · if *higher voltage within the cabinet's rating*
- the circuit is verified de-energised at the point of work, so the class governs the arc-rated PPE that would be required for ENERGISED work, which is not what is occurring. The method and the protection in use are UNCHANGED either way, so the same thing is done today under both branches.

**whether a written energy-control procedure exists for this machine**

- if *a written procedure exists* · if *no written procedure exists*
- a missing written procedure is a programme finding. The steps it would prescribe — isolate, lock, verify absence of voltage — are stated as already performed, so the work in progress is unchanged either way.

### No hidden competing gap

the only other physical hazard the text raises is the open cabinet door, and the observation settles the exposure it creates by stating the circuit is verified dead and the line stopped. No second unresolved decision-critical fact is present.

### Applicability is unambiguous

servicing an electrical circuit inside a cabinet on stopped equipment is squarely within hazardous-energy control; there is no boundary question about whether the activity is covered.

### Disposition

- [ ] `SILENCE_CONTROL_VALID`
- [ ] `SILENCE_CONTROL_INVALID`
- [ ] `SILENCE_CONTROL_AMBIGUOUS`
- [ ] `INSUFFICIENT_INFORMATION_FOR_HUMAN_ADJUDICATION`

Disputed counterfactual(s), if any: ______________________________________

---

## SC-2 — respiratory / solvent vapour

**Jurisdiction:** `osha-general-industry` · **Tested question family:** whether inhalation exposure is controlled for the task in progress

### Observation

> A technician is wiping down two printed-circuit assemblies with isopropyl alcohol at a downdraft bench in the electronics repair room. The bench extraction is running and its airflow indicator is in the green band, which the technician checked and initialled at the start of the shift. They are using about 50 millilitres from a closed squeeze bottle and the job takes four minutes. They are wearing nitrile gloves and safety glasses, and the safety data sheet for the alcohol is in the binder on the bench. The room has no other solvent in use and the door to the corridor is closed.

### Decision-critical facts the observation SETTLES

| fact | settled by this span |
|---|---|
| engineering control is present and verified working at the point of use | "The bench extraction is running and its airflow indicator is in the green band, which the technician checked and initialled at the start of the shift." |
| the quantity and duration of the task are stated | "They are using about 50 millilitres from a closed squeeze bottle and the job takes four minutes." |
| no other solvent source contributes to the atmosphere | "The room has no other solvent in use" |
| skin and eye protection appropriate to the solvent are in use | "They are wearing nitrile gloves and safety glasses" |

### Plausible omitted facts, and why each changes nothing today

**whether personal air monitoring has ever been performed in this room**

- if *monitoring was performed* · if *no monitoring has been performed*
- the observation states a small stated quantity, a short stated duration, a working local exhaust ventilation control at the point of generation and no other solvent source. Monitoring data would inform the written exposure assessment; it does not change the control in use at this bench during these four minutes.

**whether the technician has been fit-tested for a respirator**

- if *fit-tested* · if *not fit-tested*
- no respirator is in use and none is indicated: the stated control is engineering extraction verified in the green band. Because the control relied on is not a respirator, the SAME control is used and the SAME work proceeds either way.

**the room's general air-change rate**

- if *a high general air-change rate* · if *a low general air-change rate*
- the control being relied on is local extraction at the point of generation, stated as running and verified. General room ventilation is a secondary factor: the method and the protection in use are the SAME under a high or a low rate, so nothing done today changes on the answer.

### No hidden competing gap

the alcohol is also flammable, and the observation settles that exposure by stating a small quantity from a closed container at an extracted bench with no other solvent present. No ignition source is stated or implied, so no second decision-critical fact is left open.

### Applicability is unambiguous

solvent wiping at a ventilated bench is an ordinary covered task; nothing about the activity raises a boundary question of whether a standard applies.

### Disposition

- [ ] `SILENCE_CONTROL_VALID`
- [ ] `SILENCE_CONTROL_INVALID`
- [ ] `SILENCE_CONTROL_AMBIGUOUS`
- [ ] `INSUFFICIENT_INFORMATION_FOR_HUMAN_ADJUDICATION`

Disputed counterfactual(s), if any: ______________________________________

---

## SC-3 — fall protection / work at height

**Jurisdiction:** `osha-construction` · **Tested question family:** whether fall and falling-object exposure is controlled for the work in progress

### Observation

> Two joiners are fixing cladding rails from a mobile tower scaffold on the north elevation, working at a platform height of four metres. The platform is fully boarded and has guard rails on all four sides at 1.1 metres with a mid-rail and a toe board. The tower's wheels are locked and its outriggers are deployed on the concrete apron. A scaffold tag dated this morning and signed by the erector hangs at the access ladder. Both joiners are working within the platform footprint and are passing rails up by hand from a colleague at ground level. The apron below is cordoned off with barriers.

### Decision-critical facts the observation SETTLES

| fact | settled by this span |
|---|---|
| collective fall protection is present on every open side | "has guard rails on all four sides at 1.1 metres with a mid-rail and a toe board" |
| the platform is complete, so there is no gap to fall through | "The platform is fully boarded" |
| the tower is stable and cannot move | "The tower's wheels are locked and its outriggers are deployed on the concrete apron." |
| the scaffold has been inspected and the inspection is current | "A scaffold tag dated this morning and signed by the erector hangs at the access ladder." |
| the falling-object exposure below is controlled | "The apron below is cordoned off with barriers." |

### Plausible omitted facts, and why each changes nothing today

**whether either joiner is wearing a harness**

- if *a harness is worn* · if *no harness is worn*
- the stated control is collective — a fully boarded platform with compliant guard rails on all four sides, worked within the footprint. Personal fall arrest is not the control being relied on and there is no stated anchor for it; the work method is unchanged either way.

**the rated load of the tower and the weight of the cladding rails**

- if *the load is well within rating* · if *the load approaches the rating*
- the rails are stated to be passed up by hand one at a time from ground level rather than stacked on the platform, so no accumulation is described. This is a magnitude fact with no stated threshold turning on it, and the SAME method — one rail at a time, passed by hand — is used either way.

**whether the joiners hold a tower-scaffold user competence card**

- if *both hold current cards* · if *one card has lapsed*
- the erection is stated complete, tagged and signed by the erector, and the joiners are users rather than erectors. A lapsed user card is a records finding; it does not change the guarding in place or the method being used now.

### No hidden competing gap

the second exposure the text raises is falling objects, and the observation settles it with the toe board and the cordon. No third decision-critical fact is left open.

### Applicability is unambiguous

work from a mobile tower at four metres is unambiguously work at height; there is no boundary question about coverage.

### Disposition

- [ ] `SILENCE_CONTROL_VALID`
- [ ] `SILENCE_CONTROL_INVALID`
- [ ] `SILENCE_CONTROL_AMBIGUOUS`
- [ ] `INSUFFICIENT_INFORMATION_FOR_HUMAN_ADJUDICATION`

Disputed counterfactual(s), if any: ______________________________________

---

## SC-4 — noise exposure

**Jurisdiction:** `osha-general-industry` · **Tested question family:** whether noise exposure requires a change of control for the shift in progress

### Observation

> A machine operator is tending two CNC routers in the joinery shop. A noise survey completed last month and posted on the shop notice board records 84 dBA at this workstation over a full shift with both routers cutting, measured by an occupational hygienist. The operator is at the workstation for the whole shift and no other noise source is present in the shop. The routers are the same models and settings as when the survey was taken, and the operator is wearing earmuffs from the dispenser at the shop entrance. A sign at the entrance states hearing protection is available on request.

### Decision-critical facts the observation SETTLES

| fact | settled by this span |
|---|---|
| the full-shift exposure level is measured, recent, and attributable to a qualified assessor | "A noise survey completed last month and posted on the shop notice board records 84 dBA at this workstation over a full shift with both routers cutting, measured by an occupational hygienist." |
| the conditions the survey measured still hold | "The routers are the same models and settings as when the survey was taken" |
| exposure duration is the full shift, so no partial-shift arithmetic is needed | "The operator is at the workstation for the whole shift" |
| no additional noise source contributes | "no other noise source is present in the shop" |

### Plausible omitted facts, and why each changes nothing today

**the noise reduction rating of the earmuffs**

- if *a high rating* · if *a low rating*
- the measured full-shift exposure is 84 dBA, below the 85 dBA action level at which a hearing conservation programme is triggered. The muffs are stated as worn and are additional to what the measured level requires, so their rating does not change what must be done today.

**whether the operator has had an audiogram**

- if *an audiogram is on file* · if *no audiogram has been taken*
- audiometric testing is an element of the hearing conservation programme required above the action level. The measured exposure is below it, so the SAME controls apply at this workstation on this shift either way, and nothing done today changes on the answer.

**peak impulse noise from workpiece handling**

- if *peaks occur* · if *no peaks occur*
- the survey is stated to have been taken over a full shift with both routers cutting under the same models and settings, so handling noise during normal operation is inside what was measured. Nothing done today turns on the answer.

### No hidden competing gap

the routers are a machine-guarding subject in general, but the observation describes tending rather than any interaction with the cutting area and states no guard condition, so no second decision-critical fact about guarding is raised by the text.

### Applicability is unambiguous

a measured full-shift dBA level at a fixed workstation is exactly the quantity the noise standard turns on; there is no question about which rule applies or how the level is read.

### Disposition

- [ ] `SILENCE_CONTROL_VALID`
- [ ] `SILENCE_CONTROL_INVALID`
- [ ] `SILENCE_CONTROL_AMBIGUOUS`
- [ ] `INSUFFICIENT_INFORMATION_FOR_HUMAN_ADJUDICATION`

Disputed counterfactual(s), if any: ______________________________________

---

## SC-5 — powered industrial truck / pedestrian separation

**Jurisdiction:** `osha-general-industry` · **Tested question family:** whether pedestrian and load-stability exposure is controlled for the movement in progress

### Observation

> A counterbalance forklift is moving banded pallets of tinned goods from the goods-in dock to racking in aisle four of the warehouse. The aisle is closed to pedestrians by hinged barriers at both ends, which are shut, and a warehouse operative is standing outside the barrier at the aisle entrance directing the movement by radio. The forklift's pre-use check sheet for today is completed and hangs in the cab, the load is at travel height with the mast tilted back, and the operator is seat-belted. The floor is dry and clear, and lighting in the aisle is on.

### Decision-critical facts the observation SETTLES

| fact | settled by this span |
|---|---|
| pedestrians are physically separated from the travel path | "The aisle is closed to pedestrians by hinged barriers at both ends, which are shut" |
| the only person near the movement is outside the separation | "a warehouse operative is standing outside the barrier at the aisle entrance directing the movement by radio" |
| the truck has been checked for the shift | "The forklift's pre-use check sheet for today is completed and hangs in the cab" |
| the load is carried in the stable travel configuration | "the load is at travel height with the mast tilted back" |
| floor and lighting conditions are stated and adequate for the movement | "The floor is dry and clear, and lighting in the aisle is on." |

### Plausible omitted facts, and why each changes nothing today

**whether the forklift operator holds a current authorisation to operate**

- if *currently authorised* · if *authorisation has lapsed*
- a lapsed authorisation is a records and permissions finding for the employer. The controls governing the movement observed — segregation, travel configuration, pre-use check, seat belt — are all stated present, so the movement in progress proceeds the SAME way either way and nothing done today changes.

**the weight of the pallets against the truck's rated capacity**

- if *well within capacity* · if *near capacity*
- this is a magnitude fact. The observation states banded pallets of tinned goods carried at travel height with the mast tilted back and no instability described, No stated threshold turns on the precise weight, and the SAME travel configuration is used either way, so today's action is unchanged.

**whether the racking has been inspected within its inspection interval**

- if *inspection is current* · if *inspection is overdue*
- racking inspection status governs the racking system as an asset. The observation describes travel to the racking and states no damage, deflection or impact; the answer would change a maintenance decision, while the pedestrian separation and load handling assessed now are the SAME either way.

### No hidden competing gap

load stability is the second exposure the text raises and the observation settles it with the travel-height, mast-tilt and banding statements. No third decision-critical fact is open.

### Applicability is unambiguous

a powered industrial truck moving loads in an aisle is plainly covered; no boundary question about applicability arises.

### Disposition

- [ ] `SILENCE_CONTROL_VALID`
- [ ] `SILENCE_CONTROL_INVALID`
- [ ] `SILENCE_CONTROL_AMBIGUOUS`
- [ ] `INSUFFICIENT_INFORMATION_FOR_HUMAN_ADJUDICATION`

Disputed counterfactual(s), if any: ______________________________________

---

## What a clean review would and would not unlock

**Would:** a denominator for falsifier D — whether the binding architecture manufactures
questions where silence was right — and therefore the first evidence on the precision half
of every claim this architecture wants to make.

**Would not:** any production rate. Five rows across five domains is a *semantic diversity*
target, not a statistical sample, and must never be reported as one.

**Reviewer:** ______________________  **Date:** ____________

