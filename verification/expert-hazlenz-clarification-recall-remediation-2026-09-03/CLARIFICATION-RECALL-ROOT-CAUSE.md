# Clarification Recall — Root-Cause Reconstruction

**§147 Phase 1. ZERO provider calls. $0.00.** Every finding below is read from persisted run records
of executions that are already spent: `verification/expert-hazlenz-hosted-linkage-probe-2026-09-02/RUN-RECORDS.jsonl`
(§142, LP-B2) and `verification/expert-hazlenz-expanded-post-remediation-validation-2026-09-03/RUN-RECORDS.jsonl`
(§146). No historical artifact was modified. No spent formal cohort or reserved material was opened.

---

## 0. The layer question, settled first

The authorization is explicit: *"Do not assume prompt failure merely because the final collection was
empty. Trace the complete path first."*

**Across all 24 §146 calls there is exactly ONE normalization issue in the entire run**, and it is on a
different row than any clarification miss:

```
EV-A3   OUTPUT_REJECTED   EVIDENCE_OUT_OF_BOUNDS  expertHazardCandidates[2]: [-1,-1) outside observation
every other row            issues: []              mergeViolations: 0
```

LP-B2 in §142 is likewise `PRESENT`, `issues: []`, `mergeViolations: 0`.

Therefore, for **every** clarification miss under analysis:

| layer | contributed? | proof |
|---|---|---|
| persistence | **NO** | 24/24 records complete, 0 parse problems, 0 completeness problems, sha `d52d850c…` |
| authority merge | **NO** | `mergeViolations: 0` on all 24 |
| arbitration (`CLARIFICATION_CONTRADICTS_ACTIVE_CANDIDATE`) | **NO** | zero arbitration events; it fires only on `HAZARD_EXISTENCE` + resolved link + ACTIVE candidate, and zero `HAZARD_EXISTENCE` clarifications were emitted in 41 hosted calls across three probes |
| link resolution (`CLARIFICATION_LINK_UNRESOLVED`) | **NO** | zero occurrences; it strips a key and **keeps** the question by construction |
| normalization / validation | **NO** | no clarification was stripped anywhere; the only issue in the run is an evidence-binding failure on a candidate |
| schema / collection routing | **PARTIAL, on one row only** | EV-A2 routed the fact to `uncertainty.statements` instead of `decisionCriticalClarifications` — but see §2.1: the routing followed a prior judgment, it did not cause it |

**The clarifications were never emitted.** The failure is entirely upstream of the boundary, in what
the model decided to produce. Layers G, H, the merge and persistence are exonerated on evidence, not
by assumption.

---

## 1. The four cases, reconstructed

Each is answered against the authorization's A–H questions.

### 1.1 LP-B2 (§142) — APPLICABILITY

> *Two employees entered a below-grade concrete vault through a twenty-four inch top opening to pull
> cable. The vault is about eight feet deep with fixed ladder access and no continuous forced
> ventilation. Nothing in the vault was sampled before entry and no attendant was posted at the
> opening.*

**Authored gap:** whether this vault has been evaluated and classified under the site
permit-required confined space program — `APPLICABILITY`.

- **A. Known:** dimensions, opening size, depth, absence of continuous ventilation, no pre-entry
  sampling, no attendant, entry already occurred.
- **B. Unknown:** whether the site's programme has classified this vault, and under what
  classification.
- **C. Dependent decisions:** if classified permit-required, entry as described is a permit
  violation demanding immediate retrieval and programme enforcement; if evaluated and classified
  non-permit, the corrective action is ventilation and attendant practice under a different régime.
  Materially different current actions.
- **D. Did Expert see the branches?** **No — it removed them.** Its summary reads *"the vault meets
  the profile of a confined space"* and closes *"These conditions are additive current hazards, not
  hypothetical ones."*
- **E. Improper resolution?** **YES — inferential settlement.** The model reasoned from the physical
  profile to the classification and then asserted the classification as established fact.
- **F. Did v9 require preservation?** No. Once the model believes the classification settled, the
  counterfactual test's condition (a) — *"a specific current safety decision cannot be resolved
  from the observation…"* — is never entered, because in the model's own frame the decision **was**
  resolved.
- **G. Could a layer have removed it?** No. `issues: []`.
- **H. Attribution:** **prompt semantics.**

### 1.2 EV-A4 (§146) — REQUIRED_CONTROL

> *A maintenance fitter had the guard off the number 2 conveyor drive and was seating a new belt by
> hand. The local isolator was in the OFF position with no lock or tag on it, and the conveyor is
> fed by an automatic upstream sequence that restarts on a level signal.*

**Authored gap:** whether the automatic upstream sequence has been inhibited as well as the local
isolator turned off — `REQUIRED_CONTROL`.

- **A. Known:** guard off, hands in the drive, isolator OFF, no lock or tag, an automatic upstream
  sequence exists and restarts on a level signal.
- **B. Unknown:** whether that sequence has been inhibited.
- **C. Dependent decisions:** if inhibited, the residual defect is the missing lock and tag —
  a procedural correction; if not inhibited, an unprompted automatic restart can occur with hands in
  an unguarded drive — immediate stop-work. Materially different current actions.
- **D. Did Expert see the branches?** It saw the mechanism and named it *"The critical additional
  fact"*, but it did not hold both branches open.
- **E. Improper resolution?** **YES — adverse-branch collapse.** It resolved the unknown to its worse
  value and stated the consequence as fact: *"the unlocked, untagged isolator does not merely risk a
  human error re-energization but an unprompted automatic one while the fitter's hands are in the
  unguarded drive area seating the belt."* `uncertainty.statements` is **empty**; the fact was not
  retained anywhere.
- **F. Did v9 require preservation?** No. Assuming the worse branch is not named anywhere in the
  prompt as a thing that leaves a question owed. To the contrary, having assumed it, the model has a
  single coherent recommendation — so condition (c), *"two materially different answers that lead to
  DIFFERENT current outcomes"*, appears not to hold **within its own resolved frame**.
- **G. Could a layer have removed it?** No. `issues: []`.
- **H. Attribution:** **prompt semantics.**

### 1.3 EV-A6 (§146) — REGULATORY_INTERPRETATION

> *A fixed steel ladder on the clarifier runs from grade to the top walkway. The tape measure read
> twenty-three feet six inches from the lowest rung to the landing, and there is no cage, well or
> ladder safety system. Two operators climb it each shift.*
>
> Supplied governed record (APPROVED): *"Each employee on a fixed ladder above 24 feet shall be
> protected by a personal fall arrest system, ladder safety system, cage or well…"*

**Authored gap:** how the supplied record's stated height condition applies when the measured height
falls just below it — `REGULATORY_INTERPRETATION`.

**This is the most diagnostic row in the programme,** because the model did the entire analysis out
loud and then declined to record it:

> *"The supplied governed record sets its threshold at above 24 feet, so it does not extend to a
> ladder measured at twenty-three feet six inches; **that is a distinction worth flagging** but not a
> basis to challenge the deterministic hazard finding… **No additional hazard families, missing
> decision-critical facts, or cross-hazard interactions are supported by the observation as
> written.**"*

- **A. Known:** the tape reading (23'6", lowest rung to landing), absence of any ladder safety system,
  two climbers per shift, the record's threshold.
- **B. Unknown:** whether the record's "above 24 feet" is measured on the same basis as the tape
  reading — six inches from the boundary, with the measurement datum unstated in the record.
- **C. Dependent decisions:** if the bases coincide, the record imposes no obligation and the
  corrective action rests on the deterministic finding alone; if they differ, the record's protection
  requirement is engaged and a ladder safety system, cage or well is required now.
- **D. Did Expert see the branches?** **It explicitly said the distinction was "worth flagging"** — it
  recognised flag-worthiness in the same sentence in which it declined to flag it.
- **E. Improper resolution?** **YES — boundary settlement by literal reading.** It treated a
  threshold comparison as arithmetic on established facts, when what was unestablished was the
  comparability of the two measurements.
- **F. Did v9 require preservation?** **No — and this is a structural gap, not just a judgment
  error.** The whole clarification licence is framed around a **MISSING FACT**: the section heading
  is *"2. MISSING FACTS THAT WOULD CHANGE A DECISION"*, condition (b) demands *"a named condition,
  measurement, state or presence"*, and `evidenceGap` is *"What is missing, stated as a fact"*. But
  `affectedDecision` offers `REGULATORY_INTERPRETATION` — *"what a SUPPLIED governed record means, or
  how its stated conditions apply here"* — which is an **interpretive** question that can be live
  when **every physical measurement is known**. The vocabulary admits a category the entry gate does
  not. A model that reads the licence strictly will conclude, correctly under that reading, that no
  fact is missing, and so emit nothing — which is exactly the sentence it wrote.
- **G. Could a layer have removed it?** No. `issues: []`.
- **H. Attribution:** **prompt semantics, with a specific internal inconsistency between the
  clarification entry gate and the `affectedDecision` vocabulary.**

### 1.4 EV-A2 (§146) — the substitution, and a different mechanism

> *A worker was cutting fibre-cement board with a dry circular saw… He wore a fit-tested half-face
> P100. The site hygienist recorded a personal sample on this exact task three weeks ago and the
> result is filed at the head office, unavailable on site.*

**Authored gap:** the recorded personal exposure result — `HAZARD_SEVERITY`.
**Emitted instead:** *"Is dust extraction going to be connected to the saw before cutting continues…"*
— a genuine and well-formed question, but a different one, which is why strict recall (5/8) is lower
than loose (6/8).

**Here the model DID retain the fact.** `uncertainty.statements` carries it verbatim:

> *"Whether the historical personal sample result, once available, would show exposure levels
> requiring a higher level of respiratory protection than the half-face P100 currently worn is
> unknown, **but does not change the current control gap already identified**."*

and the summary states the judgment:

> *"The three-week-old personal sample… **does not change the current respirator/extraction control
> question** and is not itself decision-critical to what is done today, since a respirator is already
> in use."*

- **A. Known:** dry cutting, no extraction connected, P100 worn and fit-tested, a sample exists, it
  is filed off site.
- **B. Unknown:** the sample result.
- **C. Dependent decisions:** if the result is within the half-face P100's assigned protection
  factor, the respiratory control in use is adequate and the corrective action is extraction; if it
  exceeds it, the respiratory protection **in use right now is inadequate** and a different class of
  RPE (PAPR/supplied air) is required immediately. Materially different current controls.
- **D. Did Expert see the branches?** **Yes — it named both.**
- **E. Improper resolution?** **YES, but by a different mechanism — invariance by subsumption.** It
  did not settle the fact; it judged the fact *decision-invariant* on the ground that **a corrective
  action is already owed for another reason** ("the current control gap already identified"). That is
  a category error: an action already owed for reason X does not make the answers to Y equivalent
  when Y decides a *different* control.
- **F. Did v9 require preservation?** No. Condition (c) says *"If both answers lead to the same thing
  you would say today, it is not decision-critical"* — and the prompt never says against **which**
  decision sameness is judged. The model judged it against the row's overall corrective posture. The
  contract intends it judged against the decision the fact governs.
- **G. Could a layer have removed it?** No. `issues: []`. Rule 6 (*"If an uncertainty can be phrased
  as a question that would change a decision, it is a decisionCriticalClarification"*) is
  **conditioned on the very judgment that failed**, so it could not catch this.
- **H. Attribution:** **prompt semantics — an unscoped invariance test.** Collection routing carried
  the consequence but did not cause it.

---

## 2. What the SUCCESSES have in common — the discriminating variable

Five true positives were reconstructed. Their `evidenceGap` fields are the tell:

| row | `evidenceGap` (model's own words) |
|---|---|
| EV-A5 | *"The observation **explicitly states** it does not establish whether the walkway remains in use…"* |
| EV-C6 | *"The observation **explicitly states** it does not establish whether the unit is still moving its rated volume."* |
| EV-A8 | *"…the observation **does not state** whether a fire watch is physically present…"* |
| EV-A7 | *"…**does not confirm** whether any pedestrian is currently on or near the active slewing stretch."* |
| EV-A1 | *"The substance inside the venting drum is **unknown**; the label is painted over and unreadable and no transfer record was available."* |

**Every recovered gap is one the observation ADVERTISES.** Either the text literally says the fact is
not established (A5, C6 — the fixture wrote that sentence in), or the scene contains an explicit
epistemic marker: a painted-over label, nobody who could say, no transfer record, a blank permit
section, a banksman who has not returned.

**Every missed gap is one the observation does NOT advertise.** Nothing in LP-B2 says the vault's
classification is unknown; nothing in EV-A4 says the upstream inhibit state is unknown; nothing in
EV-A6 says the measurement datum is uncertain. The absence must be derived from what the text never
mentions — and into that unmarked hole the model puts an inference.

The three correct silences confirm the other side. EV-B1, EV-B4 and EV-C5 are all rows where the
observation **positively verifies** the fact (an interlock tested in the inspector's presence, a pull
cord pulled at three points, 210 lux measured against a 150 lux standard). The model stayed silent
and was right to: those are settled facts, and nothing in the repair may disturb them.

### 2.1 Two mechanisms, one class

| mechanism | rows | what happens |
|---|---|---|
| **M1 — SETTLEMENT OF AN UNMARKED ABSENCE** | LP-B2, EV-A4, EV-A6 | the fact is not established and its absence is not advertised; the model fills the hole with an inference — a classification derived from a profile, a worst-case assumption, a literal boundary reading — and thereafter treats it as established. The counterfactual test is never entered, because in the model's own frame there is nothing missing. |
| **M2 — INVARIANCE BY SUBSUMPTION** | EV-A2 | the fact IS marked and IS retained, but decision-invariance is judged against *everything already owed on the row* rather than against *the decision this fact governs*, so two genuinely different controls are scored as "the same thing you would say today". |

Both are instances of one class: **v9 governs which ACKNOWLEDGED gaps deserve a question. It has no
rule about when the model is ENTITLED TO SETTLE a fact in the first place, and no rule scoping the
invariance judgment.** The existing NO-LOSS RULE is the closest thing, and it is explicitly keyed to
an acknowledged gap — *"If you find yourself writing 'no information about whether X' in the summary,
X is a decisionCriticalClarification"*. A gap the model has already resolved never produces that
sentence, so the no-loss rule cannot see it. **Every one of the four misses is a gap resolved before
the no-loss rule could fire.**

---

## 3. Root cause

> **ROOT CAUSE — ESTABLISHED.**
>
> The v9 clarification contract regulates the DISPOSAL of gaps the model has already acknowledged.
> It never regulates ACKNOWLEDGEMENT itself. Consequently:
>
> **(1)** a fact whose absence the observation does not advertise can be settled by the model's own
> inference — profile-to-classification, worst-case assumption, or literal threshold reading — and a
> settled fact is not a missing fact, so the counterfactual test in section 2 is never entered and the
> NO-LOSS RULE in section 5, which is keyed to an acknowledged gap, cannot fire; and
>
> **(2)** where the fact IS acknowledged, the invariance limb of the counterfactual test is unscoped,
> so "the same thing you would say today" can be satisfied by a corrective action already owed for an
> unrelated reason.
>
> A third, narrower defect compounds (1): the clarification entry gate is framed exclusively around a
> **missing fact**, while the `affectedDecision` vocabulary offers `REGULATORY_INTERPRETATION`, a
> category that can be live when every physical fact is known. EV-A6 sits precisely in that gap and
> the model's own output states both halves of it.
>
> **Attribution: PROMPT SEMANTICS.** Normalization, validation, arbitration, link resolution,
> authority merge and persistence are excluded on direct evidence (§0) — across 24 §146 calls and
> LP-B2, not one clarification was stripped by any layer.

### 3.1 What this root cause is NOT

- **Not an inability to detect gaps.** 6 of 8 TRUE-GAP rows produced a question; 5 recovered the
  authored fact exactly, with correctly written two-branch counterfactuals.
- **Not a routing failure.** Only EV-A2 mis-routed, and only after the judgment had already failed.
- **Not a precision problem to be traded away.** `GENERIC_OR_COVERAGE_HABIT_QUESTIONS = 0`,
  `DUPLICATE_QUESTIONS = 0`, 0.435 clarifications per call. The v9 precision repair is working and
  the remediation must not spend it.
- **Not a candidate, insight, linkage, governed-evidence or citation defect.** Those axes are clean
  or instrument-blocked and are out of scope (§146 §9).
