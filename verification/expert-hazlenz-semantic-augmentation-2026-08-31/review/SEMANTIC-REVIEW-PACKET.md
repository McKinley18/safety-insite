# Independent safety review — `FORMAL_EXPERT_SEMANTIC_AUGMENTATION_V1_CANDIDATE`

**You are the reviewer. Your judgement decides whether any of this becomes formal truth.**

Thirty-five newly authored inspection observations. None of this is formal truth yet — every
determination below is a *candidate*, and nothing enters the evaluation until you accept it.

Three judgements per row need you:

- **A. Clarification** — is a question genuinely *owed*? A clarification is owed only when a
  specific fact is missing AND its absence changes a safety decision. "More detail would help"
  is not enough. If any plausible answer leads to the same action, it is not decision-critical.
- **B. Cross-hazard interaction** — do two hazards genuinely *interact*? Two hazards in one room
  are two hazards. An interaction exists only where assessing them separately would lose real
  safety information.
- **C. Family partition** — is each hazard family correctly placed? **FORBIDDEN is the narrow
  bucket**: it means the text affirmatively rules the family out, so raising it would be a false
  positive. Where a competent professional could legitimately raise a family, it belongs in
  DEFENSIBLE. Absence of evidence is never evidence of absence.

Your last review of authored material overturned 3 of 14 forbidden determinations. That is why
this step exists, and the same authoring hand wrote everything below.

Where I was unsure, I have said so under **Author uncertainty** rather than presenting the call
as settled. Those are not the only places I may be wrong.

---

## SEM-01

**Where / what:** Municipal wastewater plant, primary digester — annual internal inspection

**Observation as recorded**

> Two contractors were preparing to enter the primary digester through the side access hatch for an annual grit inspection. The digester had been drawn down and washed the previous day. A four-gas meter was clipped to the entrant harness, and the hole watch had the permit on a clipboard. I could see the meter was powered on but not the readings from where I stood, and the sludge line to the digester was valved but I saw no blind flange installed.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** the actual pre-entry atmospheric readings, specifically whether hydrogen sulphide and methane were below action levels and oxygen was within range
- **Why it is not already in the observation:** The observer states plainly that the meter was powered on but its display was not legible from the standing position, so the readings were never established.
- **Decision affected:** `REQUIRED_CONTROL`
- **Why that is decision-critical:** If the atmosphere tested clean the entry proceeds as a permit entry with continuous monitoring. If H2S is present above action level, the entry requires supplied air and a non-entry retrieval posture, and a straight harness-and-meter entry becomes prohibited. Those are different entries, not different paperwork.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: PRESENT**

- **Participating families:** confined space + chemical exposure
- **Interaction kind:** `CONFINED_SPACE_ATMOSPHERIC`
- **Evidence for each participant:**
    - *confined space* — A digester entered through a side hatch is a permit space: restricted egress, not designed for continuous occupancy, and an entry permit is in use.
    - *chemical exposure* — Digester residue generates hydrogen sulphide and methane; the vessel was drawn down and washed, which liberates gas from settled solids rather than removing the source.
- **The relationship:** The enclosure is what makes the gas dangerous. The same H2S concentration in open air disperses; inside a sealed vessel it accumulates and displaces oxygen, and the single access hatch is also the only escape route.
- **What separate assessment would lose:** Assessed separately a reviewer writes "permit entry, monitor the space" and "H2S present, wear protection". Together they say the atmosphere must be proven before a person is committed to a space they cannot quickly leave -- which is the actual control.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **confined space** | PRESENT _(life-critical)_ | established by the observation |
| **chemical exposure** | PRESENT _(life-critical)_ | established by the observation |
| electrical, fall protection, lockout/tagout, machine guarding, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

> **Author uncertainty.** The missing blind flange is arguably a second, independent gap about line isolation. I recorded one gap rather than two because the atmospheric question is the one that decides the entry method; a reviewer may reasonably say the isolation question deserves its own.

---

## SEM-02

**Where / what:** Sawmill, edger line — blade change

**Observation as recorded**

> A millwright was changing edger saw blades. The machine disconnect was open with his lock on it, and the access door was swung back with the blade arbor exposed at chest height. He mentioned the line had a gravity return that sometimes drifts. I did not see whether the arbor had been pinned or blocked, and there was no second person at the panel.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** whether the saw arbor was mechanically pinned or blocked against the gravity return the millwright described, after electrical isolation
- **Why it is not already in the observation:** The observer could not see a pin or block from the doorway, and the millwright named the drift as a known behaviour rather than something he stated he had restrained.
- **Decision affected:** `REQUIRED_CONTROL`
- **Why that is decision-critical:** If the arbor is pinned, electrical isolation plus mechanical restraint is a complete energy-control state and the work is correct. If it is not, a gravity-driven arbor can rotate onto a hand that is inside the guard opening while the disconnect is still locked -- the lockout is real and the hazard survives it.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: PRESENT**

- **Participating families:** lockout/tagout + machine guarding
- **Interaction kind:** `LOTO_STORED_ENERGY`
- **Evidence for each participant:**
    - *lockout/tagout* — The disconnect is open under a personal lock, and the millwright names a gravity return that is a stored-energy source outside that isolation.
    - *machine guarding* — The access door is open with the blade arbor exposed at chest height while a person works at it.
- **The relationship:** The guard is legitimately open because the machine is isolated -- but the isolation covers electrical energy only, and the exposure created by opening the guard is to a hazard driven by gravity, which the disconnect does not touch.
- **What separate assessment would lose:** Independently this reads as a correct lockout and a guard that is open for planned work, which is exactly right and exactly wrong. The point is that the guard opening is safe only if the energy control covers the energy that actually moves this part.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **lockout/tagout** | PRESENT _(life-critical)_ | established by the observation |
| **machine guarding** | PRESENT _(life-critical)_ | established by the observation |
| chemical exposure, confined space, electrical, fall protection, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

---

## SEM-03

**Where / what:** Cold storage, glycol pump vault — leak investigation

**Observation as recorded**

> Maintenance was down in the glycol pump vault below the cold-store floor chasing a leak. The vault is about seven feet deep, entered by a fixed ladder, and had roughly two inches of standing glycol-water mix on the floor. A portable sump pump was running on an extension cord that ran down the ladder and lay in the liquid. I could not tell whether the circuit it was plugged into upstairs was GFCI protected.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** whether the receptacle feeding the portable sump pump is GFCI protected
- **Why it is not already in the observation:** The receptacle is on the floor above and the observer was in the vault; the protection status is not determinable from the cord or the pump.
- **Decision affected:** `REQUIRED_CONTROL`
- **Why that is decision-critical:** With GFCI protection a cord fault in the standing liquid trips in milliseconds and the finding is about cord management. Without it, the same fault energises the liquid a person is standing in, inside a space they exit by ladder -- which is a stop-work condition, not a housekeeping note.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: PRESENT**

- **Participating families:** electrical + confined space
- **Interaction kind:** `ELECTRICAL_WET_ENVIRONMENT`
- **Evidence for each participant:**
    - *electrical* — An energised extension cord lies in two inches of conductive glycol-water mix.
    - *confined space* — A seven-foot below-grade vault entered by a fixed ladder: restricted egress and a space not designed for continuous occupancy.
- **The relationship:** The liquid makes the person part of the fault path, and the vault removes the ability to get away from it. A shock at grade is a shock; a shock on a ladder in a flooded pit is a fall and a person left in the space.
- **What separate assessment would lose:** Separately: "keep cords out of water" and "this is a confined space". Together they establish that the electrical control has to be chosen for a place nobody can leave quickly, which is why GFCI protection is the decisive question rather than a preference.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **electrical** | PRESENT _(life-critical)_ | established by the observation |
| **confined space** | PRESENT _(life-critical)_ | established by the observation |
| chemical exposure, fall protection, lockout/tagout, machine guarding, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

---

## SEM-04

**Where / what:** Distribution centre, mezzanine steel — sprinkler pipe modification

**Observation as recorded**

> A pipefitter was working from a scissor lift at about eighteen feet altering sprinkler branch line under the mezzanine. His harness was on and the lanyard was clipped to the lift rail. The lift was positioned with one wheel on the edge of a floor plate that covers a utility trench. I could not establish the plate rating and there was no spotter at the base.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** the load rating of the trench cover plate relative to the scissor lift wheel load
- **Why it is not already in the observation:** The plate is an existing floor feature with no visible marking, and the observer had no way to establish its rating on the spot.
- **Decision affected:** `HAZARD_EXISTENCE`
- **Why that is decision-critical:** If the plate is rated for the wheel load this is a routine elevated-work finding about spotting. If it is not, the lift can drop a wheel mid-task, and a tip-over at eighteen feet with an occupant clipped to the rail is a fatality mechanism rather than a fall arrest event.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: PRESENT**

- **Participating families:** fall protection + mobile equipment
- **Interaction kind:** `FALL_EXPOSURE_ANCHORAGE`
- **Evidence for each participant:**
    - *fall protection* — Work at approximately eighteen feet with a harness and lanyard in use.
    - *mobile equipment* — A scissor lift is the work platform and is positioned with a wheel on a floor plate of unknown rating.
- **The relationship:** The anchorage is the machine. The fall-protection system is only as sound as the platform it is attached to, so a stability problem in the lift is a fall-protection problem, not a separate equipment problem.
- **What separate assessment would lose:** Assessed apart, the fall protection looks correct -- harness on, lanyard clipped -- and the lift placement looks like a minor siting issue. The interaction is that being clipped to an unstable anchorage is worse than not being clipped at all.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **fall protection** | PRESENT _(life-critical)_ | established by the observation |
| **mobile equipment** | PRESENT | established by the observation |
| chemical exposure, confined space, electrical, lockout/tagout, machine guarding | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

---

## SEM-05

**Where / what:** Metal finishing, plating line tank 7 — tank relining

**Observation as recorded**

> A two-person crew was inside a drained chrome plating tank applying a solvent-based liner. The tank is about five feet deep with a fixed ladder over the lip. Both wore half-face respirators with organic vapour cartridges. A flexible duct was laid over the rim but the blower it connects to was not running while I watched, and the liner product data sheet was not on site.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** the solvent constituents of the liner product, specifically whether it contains a substance with poor warning properties or an IDLH low enough to prohibit air-purifying respirators
- **Why it is not already in the observation:** The product data sheet was not on site and the observer had no other source for the formulation.
- **Decision affected:** `REQUIRED_CONTROL`
- **Why that is decision-critical:** For a common high-flashpoint solvent, organic vapour cartridges plus working ventilation are adequate and the finding is that the blower was off. For a methylene-chloride-type constituent, cartridge respirators are prohibited outright and the crew requires supplied air -- the current PPE would be providing false assurance rather than protection.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: PRESENT**

- **Participating families:** chemical exposure + confined space
- **Interaction kind:** `CHEMICAL_PPE_VENTILATION`
- **Evidence for each participant:**
    - *chemical exposure* — Solvent-based liner applied by hand, with respirators in use, indicating a recognised inhalation exposure.
    - *confined space* — A five-foot drained tank entered over a lip by fixed ladder, with a single access route.
- **The relationship:** Solvent vapour is heavier than air and settles into the tank, so the enclosure concentrates exactly the exposure the PPE is chosen against, and the idle blower removes the control that would otherwise keep the concentration inside the cartridge range.
- **What separate assessment would lose:** Separately this is "wear the right respirator" and "this is a confined space". Together it is that respirator selection cannot be made without knowing the concentration the enclosure will produce, and the ventilation is what holds that concentration down.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **chemical exposure** | PRESENT _(life-critical)_ | established by the observation |
| **confined space** | PRESENT _(life-critical)_ | established by the observation |
| electrical, fall protection, lockout/tagout, machine guarding, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

> **Author uncertainty.** I classified the tank as a confined space on depth, single access and restricted egress. A reviewer might argue a five-foot open-topped tank is not a permit space at this site.

---

## SEM-06

**Where / what:** Rail transfer dock, grain terminal — railcar unloading

**Observation as recorded**

> A front-end loader was working the pit apron while two operators walked between the railcar and the pit grating to clear spillage. The loader was reversing along the same line they used. The pit grating had one panel lifted and set aside, leaving an opening onto the conveyor below. Nobody was wearing high-visibility clothing and I could not tell whether the loader had a functioning reverse alarm.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** whether the loader reverse alarm is functional, since it is the only warning available to pedestrians in the reversing path
- **Why it is not already in the observation:** The loader did not reverse within the observer's hearing during the observation, so the alarm was never demonstrated either way.
- **Decision affected:** `EXPOSURE`
- **Why that is decision-critical:** With a working alarm, pedestrians in the lane have an audible warning and the finding is about segregation and visibility. Without one, workers with their backs turned clearing spillage have no warning at all, and the exposure changes from "poorly controlled" to "uncontrolled".

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: PRESENT**

- **Participating families:** mobile equipment + fall protection
- **Interaction kind:** `MOBILE_EQUIPMENT_PEDESTRIAN`
- **Evidence for each participant:**
    - *mobile equipment* — A front-end loader reversing along the same line two people are walking.
    - *fall protection* — A grating panel is lifted out, leaving an open floor opening onto the conveyor below.
- **The relationship:** The open grating is directly in the path people take to get out of the way of the loader. The evasive movement the vehicle hazard demands is toward the fall opening.
- **What separate assessment would lose:** Independently: "segregate pedestrians from equipment" and "cover the floor opening". Together they establish that the two hazards share a footprint, so fixing the traffic route without covering the hole moves people toward the opening.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **mobile equipment** | PRESENT _(life-critical)_ | established by the observation |
| **fall protection** | PRESENT _(life-critical)_ | established by the observation |
| chemical exposure, confined space, electrical, lockout/tagout, machine guarding | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

---

## SEM-07

**Where / what:** Bottling plant, filler carousel — clearing a jam

**Observation as recorded**

> An operator had opened the filler carousel guard door to clear a fallen bottle. The E-stop on the panel was pressed in and the carousel was still. The line uses a nitrogen dosing head above the fill point that is fed from a separate header. Nobody had locked the disconnect, and I could not tell whether the nitrogen header had been bled.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** whether the nitrogen dosing header was isolated and bled before the guard door was opened
- **Why it is not already in the observation:** The header runs above the fill point from a separate supply and its state is not visible from the guard door where the observer stood.
- **Decision affected:** `REQUIRED_CONTROL`
- **Why that is decision-critical:** If the header is bled, the remaining issue is that an E-stop is being used as an energy isolation device. If it is still charged, a person reaching into the fill point is also reaching into a pressurised inert-gas discharge, which adds an asphyxiation and injection mechanism the guard interlock was never intended to control.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: PRESENT**

- **Participating families:** machine guarding + lockout/tagout
- **Interaction kind:** `LOTO_STORED_ENERGY`
- **Evidence for each participant:**
    - *machine guarding* — The carousel guard door is open with a hand entering the fill point.
    - *lockout/tagout* — An E-stop is being relied on in place of a locked disconnect, and a separate pressurised nitrogen header serves the same point of operation.
- **The relationship:** The guard opening creates access to a point served by two energies, and the control in use -- an E-stop -- addresses neither of them as an isolation. An E-stop is a control-circuit function, not an energy-isolating device.
- **What separate assessment would lose:** Separately: "do not reach past a guard" and "use lockout, not E-stop". Together: the reason the E-stop is inadequate here is specifically that it leaves a second energy source live at the exact point the guard was opened to reach.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **machine guarding** | PRESENT _(life-critical)_ | established by the observation |
| **lockout/tagout** | PRESENT | established by the observation |
| chemical exposure, confined space, electrical, fall protection, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

---

## SEM-08

**Where / what:** Brewery, fermentation cellar — tank cleaning changeover

**Observation as recorded**

> A cellar operator was leaning through the manway of a fermenter to swap a spray ball. The tank had been emptied that morning after primary fermentation. There was no gas meter in use and no attendant, though a second operator was working elsewhere in the cellar. The CIP caustic line was connected at the tank and I could not see whether it was valved shut.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** the oxygen concentration inside the fermenter after primary fermentation and before the operator put his head through the manway
- **Why it is not already in the observation:** No gas meter was in use anywhere at the tank, so no reading exists to report.
- **Decision affected:** `HAZARD_EXISTENCE`
- **Why that is decision-critical:** If the tank was purged and ventilated, leaning in to change a spray ball is routine work. If residual CO2 has displaced oxygen -- which is the normal state of a freshly emptied fermenter -- then breaking the plane of the manway is an oxygen-deficient exposure that incapacitates before it is noticed.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: PRESENT**

- **Participating families:** confined space + chemical exposure
- **Interaction kind:** `CONFINED_SPACE_ATMOSPHERIC`
- **Evidence for each participant:**
    - *confined space* — A fermenter accessed through a manway, with a person breaking the plane of the opening.
    - *chemical exposure* — Primary fermentation produces CO2, and the vessel was emptied the same morning; a caustic CIP line is also connected at the tank.
- **The relationship:** CO2 is denser than air and stays in the vessel after the liquid leaves. The enclosure is what preserves the oxygen-deficient atmosphere; the same gas volume in open air is harmless.
- **What separate assessment would lose:** Independently a reviewer notes "confined space entry procedure" and "CO2 is generated here". Together they explain why an emptied tank is more dangerous than a full one, which is the counter-intuitive fact the control exists for.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **confined space** | PRESENT _(life-critical)_ | established by the observation |
| **chemical exposure** | PRESENT _(life-critical)_ | established by the observation |
| electrical, fall protection, lockout/tagout, machine guarding, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

> **Author uncertainty.** Whether leaning through a manway constitutes entry is a real judgement question. I treated breaking the plane as entry; a reviewer may hold that only full-body entry counts, which would change the control set though probably not the gap.

---

## SEM-09

**Where / what:** Furniture works, finishing booth — spray booth maintenance

**Observation as recorded**

> A maintenance tech was replacing filter media in the down-draught finishing booth. Solvent residue was heavy on the plenum and the booth still smelled strongly of thinner. He was using a corded shop light with a standard plastic cage hung from the plenum frame. The booth exhaust fan was off and locked out for the filter change.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** whether the corded shop light in use is a rated explosion-proof or intrinsically safe fitting for a Class I location
- **Why it is not already in the observation:** The observer describes the fitting only by its plastic cage; the rating marking is not visible in that description and was not established.
- **Decision affected:** `HAZARD_EXISTENCE`
- **Why that is decision-critical:** A rated fitting makes this a routine filter change in a solvent atmosphere. An ordinary shop light is a competent ignition source introduced into a space with a strong solvent vapour concentration and no running exhaust -- which is a flash-fire mechanism, not a housekeeping issue.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — this row has more than one hazard present (chemical exposure, electrical) and they are judged to be co-occurrence, not an interaction.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **chemical exposure** | PRESENT _(life-critical)_ | established by the observation |
| **electrical** | PRESENT | established by the observation |
| **machine guarding** | **FORBIDDEN** | The only powered equipment in the booth is the exhaust fan, and it is off and locked out for this task, so no point of operation or rotating part is accessible. |
| confined space, fall protection, lockout/tagout, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_Your call:_ correct any classification above → ____________

> **Author uncertainty.** This row SHOULD carry an interaction and does not. Flammable vapour plus an energised unrated fitting, with the exhaust locked out, is a real relationship -- but the closed vocabulary has no kind for it and its only catch-all, OTHER, is unusable as truth because it is simultaneously a legal model output. Recorded as a contract limitation.

---

## SEM-10

**Where / what:** Car park structure, level 2 drainage — storm drain clearing

**Observation as recorded**

> A crew was clearing a blocked storm sump on level 2 of the car park. One worker was down in the sump chamber, roughly six feet, standing in water to mid-calf. A submersible pump and a work light were both fed from a cord reel at the deck edge. Vehicles were circulating on the deck. I did not see a rescue line and I could not tell whether the cord reel had integral GFCI.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** whether the cord reel feeding the pump and work light provides GFCI protection to the worker standing in water
- **Why it is not already in the observation:** The reel is at the deck edge above the chamber and its protection status is not determinable from the cords running into the sump.
- **Decision affected:** `REQUIRED_CONTROL`
- **Why that is decision-critical:** Protected, a fault clears instantly and the finding concerns rescue provision. Unprotected, an insulation failure in either appliance energises standing water around a person in a chamber with no rescue line, and the work must stop rather than continue with added precautions.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: PRESENT**

- **Participating families:** electrical + confined space
- **Interaction kind:** `ELECTRICAL_WET_ENVIRONMENT`
- **Evidence for each participant:**
    - *electrical* — Two energised appliances are fed into a chamber where a person stands in water.
    - *confined space* — A six-foot sump chamber with a single top opening and, as observed, no rescue line.
- **The relationship:** Standing water couples the worker to any fault, and the chamber prevents both self-rescue and quick assisted rescue. Each condition makes the other's consequence worse.
- **What separate assessment would lose:** Apart, these are two ordinary findings with ordinary fixes. Together they describe a person who cannot get out of a place where the floor may become energised, which is what makes the GFCI question decisive rather than advisable.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **electrical** | PRESENT _(life-critical)_ | established by the observation |
| **confined space** | PRESENT _(life-critical)_ | established by the observation |
| chemical exposure, fall protection, lockout/tagout, machine guarding, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

---

## SEM-11

**Where / what:** Paper mill, winder — roll change observation

**Observation as recorded**

> At the winder, an operator was clearing a wrap from the rider roll. The drive was locked out at the panel with two locks and the crew had verified zero speed. The nip guard was swung clear, and the roll had been chocked with the wedge the procedure specifies before anyone reached in. The pneumatic loading cylinder was bled and its gauge read zero at the frame.

### A. Clarification

**Candidate verdict: NOT OWED** — everything a decision needs is stated.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: PRESENT**

- **Participating families:** lockout/tagout + machine guarding
- **Interaction kind:** `LOTO_STORED_ENERGY`
- **Evidence for each participant:**
    - *lockout/tagout* — Two locks at the panel, verified zero speed, pneumatic cylinder bled with a zero gauge reading at the frame.
    - *machine guarding* — The nip guard is swung clear and a person reaches into the nip region.
- **The relationship:** The same relationship as an incomplete isolation, executed correctly: the guard is open precisely because every energy that could drive the nip -- electrical, rotational inertia and stored pneumatic -- has been isolated and verified first.
- **What separate assessment would lose:** Recorded because the interaction is what makes this correct. A reviewer who checks only that a lock exists misses that the wedge and the bled cylinder are what make the open guard acceptable.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **lockout/tagout** | PRESENT _(recorded safe/controlled)_ | established by the observation |
| **machine guarding** | PRESENT _(life-critical)_ _(recorded safe/controlled)_ | established by the observation |
| chemical exposure, confined space, electrical, fall protection, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

---

## SEM-12

**Where / what:** Ethanol plant, beer well — permit entry oversight

**Observation as recorded**

> Entry into the beer well was under way for a level probe replacement. Continuous monitoring was running with the meter at the opening and readings called out every ten minutes and logged. The feed line was blinded with the blind visible from the platform, the space had been purged with forced air for two hours before entry, and an attendant with retrieval gear was at the hatch with the entrant in sight.

### A. Clarification

**Candidate verdict: NOT OWED** — everything a decision needs is stated.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: PRESENT**

- **Participating families:** confined space + chemical exposure
- **Interaction kind:** `CONFINED_SPACE_ATMOSPHERIC`
- **Evidence for each participant:**
    - *confined space* — A permit entry into a process vessel through a hatch, with an attendant and retrieval gear posted.
    - *chemical exposure* — A beer well holds fermenting mash, which generates CO2 and ethanol vapour; the space required a two-hour forced-air purge.
- **The relationship:** The atmospheric hazard exists because of the enclosure, and here every element of the control set addresses that relationship: purge to remove the accumulation, blind to stop it returning, continuous monitoring to prove it stays gone.
- **What separate assessment would lose:** A reviewer treating these separately would count the controls but not see that the blind is what stops the purge being undone -- the sequencing, not the checklist, is the point.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **confined space** | PRESENT _(life-critical)_ _(recorded safe/controlled)_ | established by the observation |
| **chemical exposure** | PRESENT _(recorded safe/controlled)_ | established by the observation |
| electrical, fall protection, lockout/tagout, machine guarding, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

---

## SEM-13

**Where / what:** Arena, roof truss walkway — rigging point inspection

**Observation as recorded**

> A rigger was inspecting truss attachment points from a personnel lift at roughly thirty feet over fixed seating. He was harnessed with the lanyard clipped to the manufacturer anchor inside the basket, the outriggers were deployed on levelling pads, and the lift was positioned on the poured concourse slab clear of any covers or trenching. A ground attendant was posted at the base with the controls keyed.

### A. Clarification

**Candidate verdict: NOT OWED** — everything a decision needs is stated.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: PRESENT**

- **Participating families:** fall protection + mobile equipment
- **Interaction kind:** `FALL_EXPOSURE_ANCHORAGE`
- **Evidence for each participant:**
    - *fall protection* — Work at approximately thirty feet with harness and lanyard clipped to the basket anchor.
    - *mobile equipment* — A personnel lift is the platform, with outriggers deployed and a ground attendant posted.
- **The relationship:** The machine is the anchorage, so platform stability and fall protection are one system. Here the stability side is established -- outriggers on pads, sound slab, attendant at the base -- which is what makes the anchor trustworthy.
- **What separate assessment would lose:** Recorded because it is the same interaction as SEM-04 with the stability question answered. Reading the harness alone would credit the wrong thing for the safety of this setup.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **fall protection** | PRESENT _(life-critical)_ _(recorded safe/controlled)_ | established by the observation |
| **mobile equipment** | PRESENT _(recorded safe/controlled)_ | established by the observation |
| chemical exposure, confined space, electrical, lockout/tagout, machine guarding | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

---

## SEM-14

**Where / what:** Pharmaceutical plant, granulator suite — solvent charge observation

**Observation as recorded**

> An operator was charging isopropanol into a high-shear granulator through the charge port in a closed suite. The suite was under active local exhaust with the face velocity gauge in the green band, he wore a supplied-air hood fed from the plant breathing-air panel, the transfer was bonded and grounded at both the drum and the vessel, and the granulator drive was interlocked off with the charge port open.

### A. Clarification

**Candidate verdict: NOT OWED** — everything a decision needs is stated.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: PRESENT**

- **Participating families:** chemical exposure + confined space
- **Interaction kind:** `CHEMICAL_PPE_VENTILATION`
- **Evidence for each participant:**
    - *chemical exposure* — Isopropanol is charged by hand, with supplied-air respiratory protection and bonding and grounding in use.
    - *confined space* — A closed granulator suite under local exhaust: an enclosed work area whose atmosphere is actively managed rather than open to the plant.
- **The relationship:** PPE selection and ventilation performance determine each other. Supplied air is chosen because the enclosure can concentrate vapour, and the exhaust keeps the concentration in the range that makes the rest of the control set valid.
- **What separate assessment would lose:** Separately: "wear the hood" and "run the exhaust". Together: the hood is the control that stays valid if the exhaust degrades, which is why this pairing is correct rather than redundant.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **chemical exposure** | PRESENT _(life-critical)_ _(recorded safe/controlled)_ | established by the observation |
| **confined space** | PRESENT | established by the observation |
| **machine guarding** | **FORBIDDEN** | The granulator drive is interlocked off while the charge port is open, so no impeller or point of operation is accessible during the charge. |
| electrical, fall protection, lockout/tagout, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_Your call:_ correct any classification above → ____________

> **Author uncertainty.** Calling a closed granulator suite a confined_space is the weakest classification in this corpus. It is an enclosed, ventilation-dependent work area rather than a permit space, and a reviewer may well move this to DEFENSIBLE, which would remove the interaction with it.

---

## SEM-15

**Where / what:** Foundry, shakeout line — general walkthrough

**Observation as recorded**

> At the shakeout, the vibrating conveyor drive coupling guard was in place and bolted. A forklift was moving flask stacks in the adjacent bay behind a painted barrier line. The shakeout hood exhaust was running. A worker was using a compressed-air wand to blow silica dust off the deck plates and I could not tell what the wand outlet pressure was set to.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** the regulated outlet pressure of the compressed-air wand being used to blow down silica dust
- **Why it is not already in the observation:** The wand regulator setting is not visible in the observation and was not stated.
- **Decision affected:** `APPLICABILITY`
- **Why that is decision-critical:** A wand regulated to a low outlet pressure with effective chip guarding is permitted equipment and the finding becomes about dry sweeping of silica generally. Above that threshold the practice is prohibited outright, and the applicable requirement changes from a respirable-dust control question to an equipment prohibition.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — this row has more than one hazard present (chemical exposure, mobile equipment) and they are judged to be co-occurrence, not an interaction.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **chemical exposure** | PRESENT _(life-critical)_ | established by the observation |
| **mobile equipment** | PRESENT | established by the observation |
| **machine guarding** | **FORBIDDEN** | The coupling guard is in place and bolted, and no other point of operation or rotating part is described as accessible. |
| confined space, electrical, fall protection, lockout/tagout | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_Your call:_ correct any classification above → ____________

---

## SEM-16

**Where / what:** Bakery, dough divider — sanitation shift observation

**Observation as recorded**

> Sanitation was washing down the dough divider at the end of shift. The machine was stopped and the main disconnect was open with a departmental lock. A worker was spraying the hopper interior with a hose from outside the frame. The sanitiser concentrate was being drawn through a wall-mounted proportioner and I could not tell whether the proportioner had been verified at its dilution setting.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** whether the chemical proportioner was verified to be delivering the sanitiser at its labelled dilution rather than at concentrate strength
- **Why it is not already in the observation:** Proportioner performance is not observable from the discharge; it requires a titration or test strip that was not described.
- **Decision affected:** `HAZARD_SEVERITY`
- **Why that is decision-critical:** At correct dilution this is routine sanitation with ordinary splash precautions. A failed proportioner delivering near-concentrate turns the same hose into a corrosive spray exposure needing face and body protection and a very different response to contact.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — this row has more than one hazard present (chemical exposure, lockout/tagout) and they are judged to be co-occurrence, not an interaction.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **chemical exposure** | PRESENT | established by the observation |
| **lockout/tagout** | PRESENT _(recorded safe/controlled)_ | established by the observation |
| **machine guarding** | **FORBIDDEN** | The divider is stopped with its disconnect open under a lock and the worker sprays from outside the frame, so no point of operation is entered. |
| confined space, electrical, fall protection, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_Your call:_ correct any classification above → ____________

---

## SEM-17

**Where / what:** HVAC penthouse, tower 3 — chiller maintenance

**Observation as recorded**

> A technician was working on a chiller compressor in the penthouse. The unit disconnect was open and tagged, but not locked -- the tag was signed and dated today. He had the terminal box open and was taking readings. The penthouse roof hatch was propped open behind him at the top of a fixed ladder. I did not establish whether the disconnect is capable of accepting a lock.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** whether this disconnect is capable of accepting a lockout device, which determines whether tagout alone is permissible here
- **Why it is not already in the observation:** Lock capability is a property of the switch hardware that the observer did not inspect and that a signed tag does not reveal.
- **Decision affected:** `APPLICABILITY`
- **Why that is decision-critical:** If the disconnect cannot accept a lock, tagout plus additional safety measures is the applicable path and the finding is whether those measures exist. If it can accept a lock, tagout alone is not permitted and the finding is a straightforward isolation violation.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — this row has more than one hazard present (electrical, lockout/tagout) and they are judged to be co-occurrence, not an interaction.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **electrical** | PRESENT _(life-critical)_ | established by the observation |
| **lockout/tagout** | PRESENT | established by the observation |
| chemical exposure, confined space, fall protection, machine guarding, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

> **Author uncertainty.** I did not mark fall_protection present. The propped hatch at the head of a fixed ladder is a plausible opening exposure and a reviewer may consider it present rather than defensible.

---

## SEM-18

**Where / what:** Quarry, primary crusher gallery — blockage clearing

**Observation as recorded**

> Two workers were poking a blockage in the primary crusher jaw from the gallery above using a long bar. The crusher was stopped and the feeder was off. The gallery grating was sound and the handrail was continuous. I could not tell from above whether the crusher drive had been isolated or merely stopped at the local control station.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** whether the crusher drive was isolated at its disconnect or only stopped at the local control station
- **Why it is not already in the observation:** The disconnect is not visible from the gallery where the observer stood, and a stopped machine looks identical to an isolated one from above.
- **Decision affected:** `REQUIRED_CONTROL`
- **Why that is decision-critical:** Isolated, this is a controlled blockage-clearing task and the question becomes bar technique and stored material. Merely stopped, a remote or automatic restart while a bar is in the jaw is a crushing fatality mechanism, and the required control becomes full isolation before any tool enters the chamber.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — this row has more than one hazard present (machine guarding, lockout/tagout) and they are judged to be co-occurrence, not an interaction.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **machine guarding** | PRESENT _(life-critical)_ | established by the observation |
| **lockout/tagout** | PRESENT | established by the observation |
| **fall protection** | **FORBIDDEN** | The gallery grating is described as sound with a continuous handrail, and the work is done from that platform with a bar rather than by leaning past the rail. |
| chemical exposure, confined space, electrical, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_Your call:_ correct any classification above → ____________

---

## SEM-19

**Where / what:** Textile mill, dye house — colour kitchen walkthrough

**Observation as recorded**

> In the colour kitchen a technician was weighing powdered dye into a mixing vessel under a canopy hood. He wore a fitted half-face respirator with P100 cartridges and nitrile gloves. The hood was drawing and the capture appeared adequate at the weighing position. The dye in use was a benzidine-family product according to the drum label, and I could not tell whether the facility had a written exposure control plan for it.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** whether a written exposure control plan and the associated regulated-area controls exist for the benzidine-family dye in use
- **Why it is not already in the observation:** A written programme is a document held elsewhere in the facility and cannot be established by watching the weighing operation.
- **Decision affected:** `REGULATORY_INTERPRETATION`
- **Why that is decision-critical:** With a plan in place the observed PPE and local exhaust may be exactly what the programme specifies, and the finding is nil. Without one, a carcinogen-class dye is being handled outside a required regulated-area regime, which is a programme-level violation the on-the-day PPE cannot cure.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — fewer than two hazards are present.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **chemical exposure** | PRESENT _(life-critical)_ | established by the observation |
| confined space, electrical, fall protection, lockout/tagout, machine guarding, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

---

## SEM-20

**Where / what:** Data centre, generator yard — load bank test

**Observation as recorded**

> A vendor was running a load bank test on the standby generator. Cables ran from the load bank to the generator breaker cubicle across the yard on rubber ramps. The cubicle door was closed and latched during the run. The vendor was standing at the load bank taking readings. I could not tell whether the site had established an arc flash boundary for the cubicle or what the incident energy at that point is.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** the incident energy and arc flash boundary at the generator breaker cubicle during the load bank run
- **Why it is not already in the observation:** Incident energy comes from a study and its label; the observation describes only a closed and latched door, with no label content reported.
- **Decision affected:** `EXPOSURE`
- **Why that is decision-critical:** If the boundary is small and the door stays closed, the vendor at the load bank is outside any approach boundary and there is no exposure to assess. If incident energy is high, the yard positions and the PPE required for anyone approaching the cubicle mid-run change materially, and cable routing across the approach path becomes a finding.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — fewer than two hazards are present.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **electrical** | PRESENT _(life-critical)_ | established by the observation |
| chemical exposure, confined space, fall protection, lockout/tagout, machine guarding, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

---

## SEM-21

**Where / what:** Auto body shop, prep bay — panel preparation

**Observation as recorded**

> A technician was sanding filler on a quarter panel with an orbital sander connected to a vacuum shroud. He wore a dust mask of the moulded disposable type. The shop compressor was running in the corner behind a screen. The panel had been repaired previously and I could not tell whether the underlying coating being sanded contained lead or chromate.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** whether the previously applied coating being sanded contains lead or hexavalent chromium
- **Why it is not already in the observation:** The prior repair history is unknown and the coating composition cannot be determined by eye; no testing was described.
- **Decision affected:** `HAZARD_SEVERITY`
- **Why that is decision-critical:** For a modern lead-free coating, shrouded sanding with a disposable mask is proportionate. If the substrate carries lead or chromate, the same task becomes a regulated metal exposure requiring fit-tested respiratory protection, hygiene facilities and exposure monitoring, and the observed mask is not adequate.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — fewer than two hazards are present.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **chemical exposure** | PRESENT | established by the observation |
| confined space, electrical, fall protection, lockout/tagout, machine guarding, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

---

## SEM-22

**Where / what:** Grain elevator, headhouse — belt tracking adjustment

**Observation as recorded**

> A millwright was adjusting tracking on the headhouse belt while it ran at reduced speed, reaching to the take-up screw with the drum guard hinged open. Grain dust was visible in the air in the headhouse. He was not wearing gloves and stood on the fixed platform. I could not tell whether the reduced-speed jog mode disables the automatic restart.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** whether the reduced-speed jog mode in use disables automatic restart to normal running speed
- **Why it is not already in the observation:** Control-system behaviour is not visible from the platform and the millwright did not state it; a belt running slowly looks the same either way.
- **Decision affected:** `EXPOSURE`
- **Why that is decision-critical:** If jog mode latches, exposure is bounded by a slow-moving belt with a hand near a take-up. If the drive can return to full speed automatically, the same reach becomes exposure to a full-speed drum nip with the guard open, which is an entanglement fatality mechanism.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — this row has more than one hazard present (machine guarding, chemical exposure) and they are judged to be co-occurrence, not an interaction.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **machine guarding** | PRESENT _(life-critical)_ | established by the observation |
| **chemical exposure** | PRESENT | established by the observation |
| confined space, electrical, fall protection, lockout/tagout, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

> **Author uncertainty.** I recorded no interaction between the dust and the machine hazard. Grain dust is an explosion hazard and a hot bearing or nip can be the ignition source, so a reviewer could argue a genuine interaction exists here. I judged the text does not establish an ignition mechanism, so recording one would be inference rather than observation.

---

## SEM-23

**Where / what:** Marina, travel lift bay — hull pressure washing

**Observation as recorded**

> A yard hand was pressure washing a hull suspended in the travel lift slings. He worked from the ground with a wand on an extension pole, spraying upward. Antifouling paint was coming off in flakes and washing into the yard drain. The lift operator was in the cab with the hoist stationary. I could not tell whether the yard drain discharges to a treatment interceptor or directly to the basin.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** whether the yard drain receiving antifouling paint residue discharges to an interceptor or directly to the water
- **Why it is not already in the observation:** Drainage routing is below grade and cannot be determined by watching the wash-down.
- **Decision affected:** `APPLICABILITY`
- **Why that is decision-critical:** To an interceptor, this is a contained operation and the finding is worker exposure to biocide-laden spray. Direct to the basin, an entirely different set of discharge requirements applies and the operation must be contained before it continues.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — this row has more than one hazard present (chemical exposure, mobile equipment) and they are judged to be co-occurrence, not an interaction.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **chemical exposure** | PRESENT | established by the observation |
| **mobile equipment** | PRESENT | established by the observation |
| confined space, electrical, fall protection, lockout/tagout, machine guarding | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

---

## SEM-24

**Where / what:** Boiler house, No. 2 boiler — annual outage preparation

**Observation as recorded**

> The crew was preparing No. 2 boiler for internal inspection. The fuel gas valve was closed and chained, and the boiler had been cooling for two days. The manway cover was still bolted. A blank list was posted at the boiler front. I could not establish whether the steam header stop valve had been double-blocked and bled, or only closed.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** whether the steam header connection was double-blocked and bled rather than only valved closed, before the manway is opened for entry
- **Why it is not already in the observation:** The header arrangement is not visible from the boiler front and the posted blank list records the plan rather than proving what has been executed.
- **Decision affected:** `REQUIRED_CONTROL`
- **Why that is decision-critical:** Double-blocked and bled, entry into the drum proceeds on a proven isolation. Valved only, a passing or mis-set valve can admit live steam into a vessel containing a person, which is the mechanism that requires positive isolation rather than valve position.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — this row has more than one hazard present (lockout/tagout, confined space) and they are judged to be co-occurrence, not an interaction.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **lockout/tagout** | PRESENT _(life-critical)_ | established by the observation |
| **confined space** | PRESENT _(life-critical)_ | established by the observation |
| chemical exposure, electrical, fall protection, machine guarding, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

---

## SEM-25

**Where / what:** Recycling MRF, sort line — sort platform observation

**Observation as recorded**

> Sorters were working both sides of the container line pulling film and rigid plastics. The line was running at normal speed. Guards were in place along the drive side and the emergency pull cord ran the length of the platform. Sorters wore cut-resistant gloves. A skid steer was loading the infeed hopper on the tipping floor below and behind them. I could not tell whether the sort platform had been assessed for noise requiring hearing protection, which nobody was wearing.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** the measured noise exposure level on the sort platform during normal line operation
- **Why it is not already in the observation:** Noise level requires measurement; the observation can establish that nobody wore protection but not whether protection is required.
- **Decision affected:** `APPLICABILITY`
- **Why that is decision-critical:** Below the action level, no hearing conservation obligation attaches and the absence of plugs is not a finding. At or above it, a monitoring, protection and audiometric programme is required, and its complete absence becomes the most significant finding on the platform.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — this row has more than one hazard present (machine guarding, mobile equipment) and they are judged to be co-occurrence, not an interaction.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **machine guarding** | PRESENT _(recorded safe/controlled)_ | established by the observation |
| **mobile equipment** | PRESENT | established by the observation |
| chemical exposure, confined space, electrical, fall protection, lockout/tagout | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

---

## SEM-26

**Where / what:** Print works, web press — blanket wash

**Observation as recorded**

> A press operator was washing blankets on the running web press using a cloth and solvent from a squeeze bottle, reaching between the units at the wash-up position the press provides. The press was in wash mode at crawl speed. Ventilation in the press hall is general only. The solvent bottle was unlabelled and I could not establish what it contained.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** the identity and flash point of the solvent in the unlabelled squeeze bottle
- **Why it is not already in the observation:** The container carries no label and no other identification was available at the press.
- **Decision affected:** `HAZARD_EXISTENCE`
- **Why that is decision-critical:** A high-flash automatic wash solvent used at crawl speed with general ventilation is ordinary practice. A low-flash solvent such as a naphtha blend introduces a flammable atmosphere next to a running press with static generation, creating a fire hazard that does not otherwise exist in this scene.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — this row has more than one hazard present (chemical exposure, machine guarding) and they are judged to be co-occurrence, not an interaction.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **chemical exposure** | PRESENT | established by the observation |
| **machine guarding** | PRESENT _(life-critical)_ | established by the observation |
| confined space, electrical, fall protection, lockout/tagout, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

> **Author uncertainty.** I did not record an interaction between the solvent and the press. If the solvent proves low-flash, a web press is a strong static generator and the relationship would become material -- but that depends on the answer to the gap, and recording an interaction contingent on an unknown seemed like asserting the answer.

---

## SEM-27

**Where / what:** Cement works, clinker cooler — inspection door observation

**Observation as recorded**

> A process technician opened an inspection door on the clinker cooler to look at grate condition. Radiant heat from the opening was strong enough to feel several feet back. He wore standard cotton coveralls and a face shield. The cooler was running. The walkway was sound with a handrail. I could not establish whether the coveralls were flame-resistant.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** whether the cotton coveralls in use are flame-resistant rated, given radiant heat and potential for hot material ejection at the inspection door
- **Why it is not already in the observation:** FR rating is established by garment labelling that the observer did not inspect; cotton coveralls look the same either way.
- **Decision affected:** `REQUIRED_CONTROL`
- **Why that is decision-critical:** FR-rated coveralls make the observed PPE set proportionate to a hot-face inspection. Untreated cotton exposed to a hot-material puff can ignite and continue burning, which changes the required control from a face shield to a full FR garment set and a different door-opening procedure.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — this row has more than one hazard present (machine guarding, chemical exposure) and they are judged to be co-occurrence, not an interaction.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **machine guarding** | PRESENT | established by the observation |
| **chemical exposure** | PRESENT | established by the observation |
| **fall protection** | **FORBIDDEN** | The walkway is described as sound with a handrail and the technician works from it at the door, with no elevated edge or opening exposure described. |
| confined space, electrical, lockout/tagout, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_Your call:_ correct any classification above → ____________

---

## SEM-28

**Where / what:** Hospital plant room, medical gas manifold — cylinder changeover

**Observation as recorded**

> A porter was changing oxygen cylinders on the manifold in the plant room. Cylinders were chained in the racks and the manifold isolation was closed during the swap. He used no lubricant and the fittings were clean. The room has mechanical ventilation and I could not tell whether it was interlocked to run continuously or cycles with a thermostat.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** whether the plant room ventilation runs continuously or cycles on a thermostat, which determines whether an oxygen leak can accumulate
- **Why it is not already in the observation:** Ventilation control strategy is not observable from the manifold; the fan may simply have been running during the visit.
- **Decision affected:** `HAZARD_EXISTENCE`
- **Why that is decision-critical:** Continuous ventilation prevents accumulation and the changeover as observed is correct practice. Thermostatic cycling allows an oxygen-enriched atmosphere to build in a closed plant room, which creates a fire-intensification hazard that does not exist while the fan runs.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — fewer than two hazards are present.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **chemical exposure** | PRESENT | established by the observation |
| confined space, electrical, fall protection, lockout/tagout, machine guarding, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

---

## SEM-29

**Where / what:** Steel service centre, slitting line — coil loading

**Observation as recorded**

> An operator was loading a coil onto the slitter mandrel using the overhead crane and a C-hook. He guided the coil by hand at the end of the travel. The mandrel was stationary and the line was stopped. Banding on the coil had been cut and one strap end was standing proud. I could not tell whether the crane had been inspected within its required period, as no tag was visible from the floor.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** whether the overhead crane and its C-hook are within their required periodic inspection interval
- **Why it is not already in the observation:** No inspection tag was visible from the floor position and the records are held elsewhere.
- **Decision affected:** `HAZARD_SEVERITY`
- **Why that is decision-critical:** Within period, hand-guiding a suspended coil is the ordinary risk of the task and the finding concerns hand placement and the proud strap. Out of period, an unverified lifting assembly is carrying a multi-tonne coil over a person's hands, and the severity of a failure changes the acceptability of guiding by hand at all.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — this row has more than one hazard present (machine guarding, mobile equipment) and they are judged to be co-occurrence, not an interaction.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **machine guarding** | PRESENT | established by the observation |
| **mobile equipment** | PRESENT _(life-critical)_ | established by the observation |
| chemical exposure, confined space, electrical, fall protection, lockout/tagout | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

---

## SEM-30

**Where / what:** Cold store, ammonia engine room — routine plant check

**Observation as recorded**

> The refrigeration engineer was doing a routine check in the ammonia engine room. Compressor guards were fitted, the oil level sight glasses were clear, and the room ammonia detector panel showed no alarm. Two self-contained breathing sets hung by the door. I could not establish when the detector heads were last calibrated, and the panel showed only status rather than a calibration date.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** the last calibration date of the ammonia detector heads serving the engine room
- **Why it is not already in the observation:** The panel displays alarm status only; calibration records are held separately and were not available at the panel.
- **Decision affected:** `EXPOSURE`
- **Why that is decision-critical:** Recently calibrated, a no-alarm panel is meaningful evidence that the room atmosphere is clean and the check is routine. Long out of calibration, the same display proves nothing, and personnel are relying on an instrument that may not detect a release -- which changes the exposure from monitored to unmonitored.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — fewer than two hazards are present.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **chemical exposure** | PRESENT _(life-critical)_ _(recorded safe/controlled)_ | established by the observation |
| **machine guarding** | **FORBIDDEN** | Compressor guards are described as fitted, and no open drive, coupling or point of operation is described anywhere in the room. |
| confined space, electrical, fall protection, lockout/tagout, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_Your call:_ correct any classification above → ____________

---

## SEM-35

**Where / what:** Fuel terminal, top-loading rack bay 2 — tanker loading

**Observation as recorded**

> A driver was on top of a tanker at the loading rack connecting the vapour recovery arm. The fold-down gangway was lowered onto the trailer walkway and its cage was around him. The tractor was still coupled with the engine idling. I saw no wheel chocks placed and could not tell whether the rack has a brake interlock that holds the vehicle while the gangway is down.

### A. Clarification

**Candidate verdict: OWED**

- **Exact missing fact:** whether the loading rack has a vehicle brake interlock or drive-away prevention that is engaged while the gangway is lowered onto the trailer
- **Why it is not already in the observation:** An interlock is a rack control system feature; with no chocks visible and the engine idling, nothing observable establishes whether movement is prevented.
- **Decision affected:** `REQUIRED_CONTROL`
- **Why that is decision-critical:** With an engaged interlock, the gangway is a stable platform and the finding is the absence of chocks as a redundant measure. Without one, a coupled tractor with a running engine can pull away while a person stands on the trailer inside a cage attached to the rack -- which is a drive-away fatality mechanism and requires the loading sequence itself to change, not an extra chock.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: PRESENT**

- **Participating families:** fall protection + mobile equipment
- **Interaction kind:** `FALL_EXPOSURE_ANCHORAGE`
- **Evidence for each participant:**
    - *fall protection* — Work on top of a tanker using a fold-down gangway and cage as the fall-protection system.
    - *mobile equipment* — The tractor remains coupled with its engine idling and no chocks are placed.
- **The relationship:** The gangway spans from a fixed rack onto a vehicle that can move. The fall-protection system depends on the relative position of two objects, one of which is under power, so vehicle movement control IS the fall control here.
- **What separate assessment would lose:** Independently: "the gangway and cage are in use, fall protection is provided" and "chock the wheels". Together they establish that the gangway is only protective while the trailer stays put, so the vehicle interlock is part of the fall-protection system rather than a separate traffic measure.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **fall protection** | PRESENT _(life-critical)_ | established by the observation |
| **mobile equipment** | PRESENT | established by the observation |
| chemical exposure, confined space, electrical, lockout/tagout, machine guarding | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_No family is forbidden on this row — nothing here can be scored as a false positive._

_Your call:_ correct any classification above → ____________

---

## SEM-31

**Where / what:** Warehouse, battery charging room — end-of-shift walkthrough

**Observation as recorded**

> The battery charging room was checked at end of shift. Chargers were running with their leads seated, the room extract fan was running and its airflow indicator was in range, the eyewash and drench shower were tagged as tested this month, and spill neutraliser was stocked in the cabinet. No trucks were on charge out of their bays and no work was in progress in the room.

### A. Clarification

**Candidate verdict: NOT OWED** — everything a decision needs is stated.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — fewer than two hazards are present.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **chemical exposure** | PRESENT _(recorded safe/controlled)_ | established by the observation |
| **electrical** | **FORBIDDEN** | Chargers are described as running normally with leads seated, and no damaged cord, exposed conductor or open enclosure is described. |
| **mobile equipment** | **FORBIDDEN** | No trucks are on charge out of their bays and no work is in progress in the room, so no travel, lift or pedestrian interaction is described. |
| confined space, fall protection, lockout/tagout, machine guarding | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_Your call:_ correct any classification above → ____________

---

## SEM-32

**Where / what:** Machine shop, CNC cell 4 — production observation

**Observation as recorded**

> CNC cell 4 was running a production batch with the enclosure door closed and the interlock proven -- the operator demonstrated that opening the door halts the spindle. Coolant concentration had been checked and logged that morning at the specified ratio. Chip conveyor guarding was in place. The operator loaded and unloaded only at the door with the spindle stopped.

### A. Clarification

**Candidate verdict: NOT OWED** — everything a decision needs is stated.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — fewer than two hazards are present.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **machine guarding** | PRESENT _(recorded safe/controlled)_ | established by the observation |
| **chemical exposure** | **FORBIDDEN** | Coolant concentration was checked and logged the same morning at its specified ratio, and no mist, dermal contact or unlabelled product is described. |
| **lockout/tagout** | **FORBIDDEN** | Loading and unloading happen at the door with the spindle stopped under a proven interlock, and no maintenance task requiring energy isolation is described. |
| confined space, electrical, fall protection, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_Your call:_ correct any classification above → ____________

---

## SEM-33

**Where / what:** Laboratory block, fume hood bay — quarterly inspection

**Observation as recorded**

> Quarterly inspection of the fume hood bay. All four hoods carried current face velocity certification stickers, sashes were at the marked working height, and nothing was stored inside the hood interiors obstructing the baffles. Chemical storage was segregated by compatibility in vented cabinets below. No work was in progress at the time of inspection.

### A. Clarification

**Candidate verdict: NOT OWED** — everything a decision needs is stated.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — fewer than two hazards are present.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **chemical exposure** | **FORBIDDEN** | Hoods are certified current with sashes at working height and baffles unobstructed, and storage is segregated by compatibility in vented cabinets. No handling, spill or release is described, and no work was in progress. |
| confined space, electrical, fall protection, lockout/tagout, machine guarding, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_Your call:_ correct any classification above → ____________

---

## SEM-34

**Where / what:** Site offices, drawing store — general inspection

**Observation as recorded**

> Toured the drawing store attached to the site offices. It is a carpeted room with flat files, a plan chest and shelving, no process equipment and no chemical storage of any kind. The shelving was bracket-fixed to the wall and fully loaded within its marked levels. A kick stool sat under the plan chest, stowed.

### A. Clarification

**Candidate verdict: NOT OWED** — everything a decision needs is stated.

_Your call:_ `APPROVE` · `CHANGE TO NOT_OWED` · `MODIFY GAP` · `REJECT ROW` → ____________

### B. Cross-hazard interaction

**Candidate verdict: ABSENT** — fewer than two hazards are present.

_Your call:_ `APPROVE` · `CHANGE TO ABSENT` · `MODIFY INTERACTION` · `REJECT ROW` → ____________

### C. Family partition

| family | candidate | rationale |
|---|---|---|
| **fall protection** | **FORBIDDEN** | The kick stool is stowed under the plan chest, and no climbing, elevated work or unprotected edge is described. |
| **machine guarding** | **FORBIDDEN** | The observation states the room contains no process equipment. |
| **chemical exposure** | **FORBIDDEN** | The observation states the room contains no chemical storage of any kind. |
| confined space, electrical, lockout/tagout, mobile equipment | DEFENSIBLE | not ruled in or out by the text; raising one is neither required nor penalised |

_Your call:_ correct any classification above → ____________

---

## Returning your verdicts

Per row: a line for A, B and C is enough — e.g. `SEM-01 A:APPROVE B:APPROVE C:APPROVE`.
For anything you change, say what it should be instead.

Rejections cost the corpus material and nothing will be rewritten to win it back. If your review
leaves too little to support the evaluation, the correct outcome is that the evaluation stops and
is redesigned — not that the judgements are adjusted until they fit.
