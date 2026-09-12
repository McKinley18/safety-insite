# Independent safety review — `FORMAL_EXPERT_NEGATIVE_CONTROL_AUGMENTATION_V1`

**You are the reviewer. Your judgement controls the source-case truth in this corpus.**

Sixteen inspection observations were authored to broaden this evaluation's coverage. Each one
carries a set of labels saying which hazard families are *present*, which are *defensible* for a
reasonable reviewer to raise, and which are *forbidden* — meaning the observation affirmatively
rules them out, so raising one would be a false positive rather than diligence.

**The forbidden labels are the ones that need your judgement.** A family is only forbidden where
the text contains a fact that defeats it. If you think a competent safety professional could
legitimately raise a family that is marked forbidden here, that label is wrong and must be
corrected before this corpus is used — because it would score correct reasoning as an error.

For each row, reply **APPROVE**, or **REJECT/CORRECT** with what you would change.

These cases were written by the same agent that is asking you to review them. That is exactly why
this step exists: an authoring self-review is not an independent safety review.

---

## AUG-01

**Where / what:** Maintenance shop, Plant 1 — routine walkthrough

**Observation as recorded**

> Bench grinder in the maintenance shop was running with the tongue guard missing and the work rest sitting about half an inch off the wheel while a fitter dressed a bracket freehand. A forklift was parked and keyed off against the far wall, and the shop electrical panel was closed with its cover latched.

- **Hazards present (labelled real):** machine guarding
- **Defensible to raise (neither required nor penalised):** chemical exposure, confined space, fall protection, lockout/tagout
- **Forbidden (raising one is scored as a false positive):** mobile equipment, electrical
- **Marked life-critical:** machine guarding
- **Clarification obligation:** NO question is owed — everything a decision needs is stated.

**Why each forbidden family is claimed to be ruled out — the judgement to check:**

- **mobile equipment** — The forklift is parked and keyed off. No travel, lift or pedestrian interaction is described, so its presence is location detail rather than exposure.
- **electrical** — The panel is closed with its cover latched. No exposed conductor, damaged cord or contact is described.

**Authoring rationale.** An ordinary abrasive-wheel finding. The missing tongue guard and the oversized work-rest gap are both stated, and the operator is engaged with the wheel, so a reviewer has what a decision needs. The forklift and the panel are the kind of incidental detail real notes carry, and each is defeated in the same clause that introduces it.

**Your verdict:** `APPROVE` / `REJECT-CORRECT` → ______________________

---

## AUG-02

**Where / what:** Bagging line, Plant 2 — observed maintenance activity

**Observation as recorded**

> Conveyor drive at the bagging line was locked out for belt replacement. Two personal locks were on the disconnect, the crew zero-energy test was recorded on the permit, and the drive guard was off and lying beside the frame as expected for that work.

- **Hazards present (labelled real):** lockout/tagout
- **Defensible to raise (neither required nor penalised):** chemical exposure, confined space, fall protection, mobile equipment
- **Forbidden (raising one is scored as a false positive):** machine guarding, electrical
- **Recorded as safe / resolved / correctly controlled:** lockout/tagout, machine guarding
- **Clarification obligation:** NO question is owed — everything a decision needs is stated.

**Why each forbidden family is claimed to be ruled out — the judgement to check:**

- **machine guarding** — The guard is off as a planned part of an isolated maintenance task, with the drive locked out and zero energy verified. That is the correct condition for the work, not an operating exposure.
- **electrical** — The disconnect is open with two personal locks and a recorded zero-energy test.

**Authoring rationale.** A correctly executed isolation. This row exists because a layer that flags the removed guard here has not understood the task -- the guard being off is what the permit is for. Nothing decision-critical is missing: the energy state is verified and recorded.

**Your verdict:** `APPROVE` / `REJECT-CORRECT` → ______________________

---

## AUG-03

**Where / what:** Pump house roof — roof repair observation

**Observation as recorded**

> Roofer on the flat roof of the pump house was working about four feet from an unprotected edge with no guardrail, warning line or anchored lanyard. Roof height to grade is roughly eighteen feet. A weatherhead and service drop run up the far corner of the building, well outside the work area.

- **Hazards present (labelled real):** fall protection
- **Defensible to raise (neither required nor penalised):** chemical exposure, confined space, lockout/tagout, machine guarding, mobile equipment
- **Forbidden (raising one is scored as a false positive):** electrical
- **Marked life-critical:** fall protection
- **Clarification obligation:** NO question is owed — everything a decision needs is stated.

**Why each forbidden family is claimed to be ruled out — the judgement to check:**

- **electrical** — The service drop is at the far corner of the building, outside the work area, with no approach, contact or conductive equipment described near it.

**Authoring rationale.** A plain unprotected-edge exposure at a height where a fall is life-threatening. The distance from the edge, the absence of every listed protection and the height are all stated, so no clarification is owed. The service drop is a real feature of such a building and is defeated by its stated distance from the work.

**Your verdict:** `APPROVE` / `REJECT-CORRECT` → ______________________

---

## AUG-04

**Where / what:** Tank farm, degreaser tank 4 — interior cleaning

**Observation as recorded**

> Two workers were pressure-washing the inside of a 6,000-gallon degreaser tank through the top manway. The wash solution is a caustic degreaser, the crew had no supplied air or ventilation set up, and no attendant was posted at the opening. A tag on the adjacent transfer pump showed it had been isolated the previous shift.

- **Hazards present (labelled real):** chemical exposure, confined space
- **Defensible to raise (neither required nor penalised):** electrical, fall protection, lockout/tagout, machine guarding, mobile equipment
- **Forbidden (raising one is scored as a false positive):** _none_
- **Marked life-critical:** confined space, chemical exposure
- **Clarification obligation:** a question IS owed —
    - whether the tank atmosphere was tested before entry, and with what result _(affects: REQUIRED_CONTROL)_
- **Recorded interaction:** `CONFINED_SPACE_ATMOSPHERIC` — confined space, chemical exposure (the hazards make each other worse, rather than merely coexisting)

**No family is forbidden on this row.** Every family not present is treated as defensible, so
nothing here can be scored as a false positive.

**Authoring rationale.** Caustic aerosol generated inside an enclosed vessel is a genuine interaction rather than two adjacent facts, which is why an interaction is recorded. One decision-critical fact really is missing -- whether the atmosphere was tested -- and it decides which controls the entry requires, so this row legitimately owes a clarification.

**Your verdict:** `APPROVE` / `REJECT-CORRECT` → ______________________

---

## AUG-05

**Where / what:** Finished-goods rack area — aisle observation

**Observation as recorded**

> A stand-up reach truck was running the aisle in the finished-goods rack area with the horn inoperative and a load raised to roughly the third beam level while travelling. The rack uprights are ladder-braced but nobody was climbing them, and the shrink wrapper at the aisle end was powered down and tagged out of service.

- **Hazards present (labelled real):** mobile equipment
- **Defensible to raise (neither required nor penalised):** chemical exposure, confined space, electrical, lockout/tagout
- **Forbidden (raising one is scored as a false positive):** fall protection, machine guarding
- **Recorded as safe / resolved / correctly controlled:** machine guarding
- **Clarification obligation:** NO question is owed — everything a decision needs is stated.

**Why each forbidden family is claimed to be ruled out — the judgement to check:**

- **fall protection** — The ladder-braced uprights are structural rack members. Nobody was climbing and no elevated work or unprotected edge is described.
- **machine guarding** — The shrink wrapper is powered down and tagged out of service.

**Authoring rationale.** Travelling with an elevated load and no working horn is a stated, decision-complete finding. The ladder-braced uprights are the natural lure here -- they look climbable in a note -- and the row defeats them explicitly.

**Your verdict:** `APPROVE` / `REJECT-CORRECT` → ______________________

---

## AUG-06

**Where / what:** Die shop — walkthrough

**Observation as recorded**

> A temporary 120V cord set feeding a work light in the die shop had the ground pin broken off and the outer jacket split near the plug. It was plugged in and energized at the time. The press it sat beside was down for the day with its main disconnect open and locked.

- **Hazards present (labelled real):** electrical
- **Defensible to raise (neither required nor penalised):** chemical exposure, confined space, fall protection, mobile equipment
- **Forbidden (raising one is scored as a false positive):** lockout/tagout, machine guarding
- **Recorded as safe / resolved / correctly controlled:** lockout/tagout, machine guarding
- **Clarification obligation:** NO question is owed — everything a decision needs is stated.

**Why each forbidden family is claimed to be ruled out — the judgement to check:**

- **lockout/tagout** — The press disconnect is open and locked. The damaged cord set is a separate temporary circuit and is not part of any isolation boundary described here.
- **machine guarding** — The press is down for the day with its disconnect open and locked, so no point-of-operation exposure is described.

**Authoring rationale.** A damaged energized cord set beside a correctly isolated press. The press is the lure: a reader scanning for hazards in a die shop reaches for the press, and the row defeats it twice over. The cord defect itself is fully stated.

**Your verdict:** `APPROVE` / `REJECT-CORRECT` → ______________________

---

## AUG-07

**Where / what:** Finished-goods staging — shift-change walkthrough

**Observation as recorded**

> Walked the finished-goods staging area at shift change. Aisles were clear and marked, the pallet jack was parked in its charging bay on charge, the eyewash station in the corner was flushed and tagged current for the month, and no work was in progress at the time.

- **Hazards present (labelled real):** _none_
- **Defensible to raise (neither required nor penalised):** confined space, electrical, fall protection, lockout/tagout, machine guarding
- **Forbidden (raising one is scored as a false positive):** mobile equipment, chemical exposure
- **Clarification obligation:** NO question is owed — everything a decision needs is stated.

**Why each forbidden family is claimed to be ruled out — the judgement to check:**

- **mobile equipment** — The pallet jack is parked in its charging bay on charge, with no travel, lift or pedestrian interaction described.
- **chemical exposure** — The eyewash is a fixture, flushed and tagged current. No chemical handling, storage or release is described in the area.

**Authoring rationale.** A clean area at a quiet moment. Rows like this are why the evaluation can measure restraint at all: everything a decision needs is stated, nothing is wrong, and a candidate raised here is a false positive rather than diligence.

**Your verdict:** `APPROVE` / `REJECT-CORRECT` → ______________________

---

## AUG-08

**Where / what:** North lift station — permit-required entry

**Observation as recorded**

> Entry into the north lift-station wet well was in progress under a permit. Continuous four-gas monitoring was running at the opening with readings logged every fifteen minutes, a tripod and retrieval winch were rigged, and an attendant was at the hole with the entrant in sight. The influent pump was locked out at the MCC.

- **Hazards present (labelled real):** confined space
- **Defensible to raise (neither required nor penalised):** chemical exposure, electrical, machine guarding, mobile equipment
- **Forbidden (raising one is scored as a false positive):** lockout/tagout, fall protection
- **Recorded as safe / resolved / correctly controlled:** confined space, lockout/tagout, fall protection
- **Clarification obligation:** NO question is owed — everything a decision needs is stated.

**Why each forbidden family is claimed to be ruled out — the judgement to check:**

- **lockout/tagout** — The influent pump is locked out at the MCC. That is the control the entry requires, correctly in place, rather than a deficiency.
- **fall protection** — A tripod and retrieval winch are rigged at the opening and an attendant is posted with the entrant in sight.

**Authoring rationale.** A permit entry done properly, and the hardest kind of row for an eager layer: every element that would be a finding if missing is present. Monitoring, retrieval, attendant and isolation are all stated, so nothing is owed.

**Your verdict:** `APPROVE` / `REJECT-CORRECT` → ______________________

---

## AUG-09

**Where / what:** Transfer pump skid — follow-up on a reported defect

**Observation as recorded**

> Operator reported the coupling guard on the transfer pump had been missing for part of last week. The work order shows it was refabricated and refitted on Thursday. This morning it was in place, bolted, and the pump was running normally. The area sump grate was open beside the pump, but it is a ten-inch drain opening rather than an entry point and it was barricaded.

- **Hazards present (labelled real):** machine guarding
- **Defensible to raise (neither required nor penalised):** chemical exposure, electrical, fall protection, lockout/tagout, mobile equipment
- **Forbidden (raising one is scored as a false positive):** confined space
- **Recorded as safe / resolved / correctly controlled:** machine guarding
- **Clarification obligation:** NO question is owed — everything a decision needs is stated.

**Why each forbidden family is claimed to be ruled out — the judgement to check:**

- **confined space** — The sump grate is a ten-inch drain opening, not a space a person can enter, and it was barricaded.

**Authoring rationale.** A defect that was real last week and is verifiably corrected now, confirmed by direct observation rather than by the work order alone. The open grate is the lure and is defeated by its stated size and the barricade.

**Your verdict:** `APPROVE` / `REJECT-CORRECT` → ______________________

---

## AUG-10

**Where / what:** Equipment bay 3 — coating application

**Observation as recorded**

> Painter was spraying a two-part epoxy inside the equipment bay with the roll-up door about a quarter open, working off a rolling scaffold with one guardrail section removed to reach the wall. He had a half-face respirator on. I could not tell from the label photo whether the product contains isocyanates, and no ventilation fan was set up.

- **Hazards present (labelled real):** chemical exposure, fall protection
- **Defensible to raise (neither required nor penalised):** electrical, lockout/tagout, machine guarding, mobile equipment
- **Forbidden (raising one is scored as a false positive):** confined space
- **Clarification obligation:** a question IS owed —
    - whether the two-part epoxy contains isocyanates, which decides whether a half-face cartridge respirator is adequate or supplied air is required _(affects: REQUIRED_CONTROL)_

**Why each forbidden family is claimed to be ruled out — the judgement to check:**

- **confined space** — The equipment bay is a normal work bay with a roll-up door standing partly open. It is not a permit space and no entry permit or restricted egress is described.

**Authoring rationale.** Two independent exposures in one scene, and one genuinely missing fact that a reviewer could not resolve on site. The isocyanate question is decision-critical because it changes the required respiratory protection outright, not merely its rating.

**Your verdict:** `APPROVE` / `REJECT-CORRECT` → ______________________

---

## AUG-11

**Where / what:** Press shop, 200-ton press — die change

**Observation as recorded**

> Millwright was changing a die on the 200-ton press. The main disconnect was open and a lock was on it, but I could not tell whether the hydraulic accumulator had been bled -- no gauge was visible from where I stood and the crew had left for break. A die cart was staged at the press, chocked and unhitched.

- **Hazards present (labelled real):** lockout/tagout
- **Defensible to raise (neither required nor penalised):** chemical exposure, confined space, electrical, fall protection, machine guarding
- **Forbidden (raising one is scored as a false positive):** mobile equipment
- **Marked life-critical:** lockout/tagout
- **Clarification obligation:** a question IS owed —
    - whether the hydraulic accumulator was bled to zero stored energy after the disconnect was opened _(affects: REQUIRED_CONTROL)_

**Why each forbidden family is claimed to be ruled out — the judgement to check:**

- **mobile equipment** — The die cart is chocked and unhitched with no travel or lift described.

**Authoring rationale.** Electrical isolation is stated and stored hydraulic energy is not, which is the classic incomplete isolation. The gap is real rather than manufactured: the observer says plainly why the fact could not be established.

**Your verdict:** `APPROVE` / `REJECT-CORRECT` → ______________________

---

## AUG-12

**Where / what:** Basement sump pit — dewatering

**Observation as recorded**

> Crew was running a submersible pump to dewater a flooded sump pit in the basement, roughly eight feet deep and entered by a fixed ladder. Two workers went in without any atmospheric testing beforehand. The pump cord and a plugged-in extension were lying in the standing water on the pit floor, and the extension connection was not a sealed fitting.

- **Hazards present (labelled real):** electrical, confined space
- **Defensible to raise (neither required nor penalised):** chemical exposure, fall protection, lockout/tagout, mobile equipment
- **Forbidden (raising one is scored as a false positive):** machine guarding
- **Marked life-critical:** confined space, electrical
- **Clarification obligation:** NO question is owed — everything a decision needs is stated.
- **Recorded interaction:** `ELECTRICAL_WET_ENVIRONMENT` — electrical, confined space (the hazards make each other worse, rather than merely coexisting)

**Why each forbidden family is claimed to be ruled out — the judgement to check:**

- **machine guarding** — The only equipment in the pit is a submersible pump, which has no exposed drive, nip point or point of operation described.

**Authoring rationale.** An unsealed energized connection lying in standing water inside an enclosed space is a real interaction: the water and the enclosure each make the electrical exposure worse than it would be alone. Both the missing atmospheric test and the unsealed connection are stated, so nothing is owed.

**Your verdict:** `APPROVE` / `REJECT-CORRECT` → ______________________

---

## AUG-13

**Where / what:** Paint mixing room — walkthrough

**Observation as recorded**

> Checked the paint mixing room. Both flammable cabinets were closed and grounded, the bonding strap was connected to the drum in use, no spraying was in progress, and the exhaust fan was running with the differential gauge in range. A portable heater was stored in the corner, unplugged, with its cord wrapped.

- **Hazards present (labelled real):** chemical exposure
- **Defensible to raise (neither required nor penalised):** confined space, fall protection, lockout/tagout, machine guarding, mobile equipment
- **Forbidden (raising one is scored as a false positive):** electrical
- **Recorded as safe / resolved / correctly controlled:** chemical exposure
- **Clarification obligation:** NO question is owed — everything a decision needs is stated.

**Why each forbidden family is claimed to be ruled out — the judgement to check:**

- **electrical** — The portable heater is stored unplugged with its cord wrapped, and the only operating electrical item described is the exhaust fan running normally.

**Authoring rationale.** Flammable handling with its controls demonstrably in place, including the bonding detail that is usually the first thing missing. The stored heater is a plausible lure in a room like this and is defeated by being unplugged and stowed.

**Your verdict:** `APPROVE` / `REJECT-CORRECT` → ______________________

---

## AUG-14

**Where / what:** Shipping dock, door 6 — trailer unloading

**Observation as recorded**

> At the dock, a counterbalance forklift was backing pallets off a trailer while two order pickers walked the same lane. There is no marked pedestrian route through that stretch and the spotter position was vacant. The trailer wheels were chocked and the dock lock was engaged.

- **Hazards present (labelled real):** mobile equipment
- **Defensible to raise (neither required nor penalised):** chemical exposure, confined space, electrical, lockout/tagout, machine guarding
- **Forbidden (raising one is scored as a false positive):** fall protection
- **Marked life-critical:** mobile equipment
- **Clarification obligation:** NO question is owed — everything a decision needs is stated.

**Why each forbidden family is claimed to be ruled out — the judgement to check:**

- **fall protection** — The trailer is chocked and the dock lock is engaged, and no open dock edge, unprotected leveller pit or elevated work is described.

**Authoring rationale.** Pedestrians in a reversing lane with no marked route and no spotter is an ordinary and serious dock finding. The chocks and dock lock are stated because a real note would state them, and they defeat the dock-edge reading.

**Your verdict:** `APPROVE` / `REJECT-CORRECT` → ______________________

---

## AUG-15

**Where / what:** Packaging line 2 — jam clearance

**Observation as recorded**

> During a jam clearance on the carton sealer, the operator reached past the opened interlock gate to pull a crushed carton while the machine was still under air. The lockout point is a valve on the frame and it was open. Nobody had isolated the air supply.

- **Hazards present (labelled real):** machine guarding, lockout/tagout
- **Defensible to raise (neither required nor penalised):** chemical exposure, confined space, electrical, fall protection, mobile equipment
- **Forbidden (raising one is scored as a false positive):** _none_
- **Marked life-critical:** machine guarding
- **Clarification obligation:** NO question is owed — everything a decision needs is stated.
- **Recorded interaction:** `LOTO_STORED_ENERGY` — machine guarding, lockout/tagout (the hazards make each other worse, rather than merely coexisting)

**No family is forbidden on this row.** Every family not present is treated as defensible, so
nothing here can be scored as a false positive.

**Authoring rationale.** Reaching past a defeated interlock into a machine still under air is the interaction itself: the guarding exposure exists because the energy was never isolated. The word "lockout" is the lure toward electrical, and the row defeats it by naming the energy as air.

**Your verdict:** `APPROVE` / `REJECT-CORRECT` → ______________________

---

## AUG-16

**Where / what:** Records annex — general inspection

**Observation as recorded**

> Toured the records annex. It is an office-grade space with sealed floors, no process equipment and no chemical storage. The only items noted were a step stool in the aisle, folded and stowed against the shelving, and a wall-mounted extinguisher tagged current.

- **Hazards present (labelled real):** _none_
- **Defensible to raise (neither required nor penalised):** confined space, electrical, lockout/tagout, mobile equipment
- **Forbidden (raising one is scored as a false positive):** fall protection, machine guarding, chemical exposure
- **Clarification obligation:** NO question is owed — everything a decision needs is stated.

**Why each forbidden family is claimed to be ruled out — the judgement to check:**

- **fall protection** — The step stool is folded and stowed against the shelving. No climbing, elevated work or unprotected edge is described.
- **machine guarding** — The observation states the space contains no process equipment.
- **chemical exposure** — The observation states the space contains no chemical storage.

**Authoring rationale.** A genuinely unremarkable space, recorded because inspections cover them and an evaluation needs them. The two exclusions are explicit statements by the observer rather than mere silence, which is what makes them usable as forbidden truth under the frozen rule.

**Your verdict:** `APPROVE` / `REJECT-CORRECT` → ______________________

---

## How to return this

A line per row is enough, e.g. `AUG-01 APPROVE`. For anything you reject, say which family and
what it should be instead — *present*, *defensible*, or *safe/resolved*.

A rejection costs the corpus a label and nothing will be rewritten to win it back. If your
review leaves the corpus unable to support the evaluation, the correct outcome is that the
evaluation stops and is redesigned — not that the labels are adjusted until it fits.
