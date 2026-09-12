# HS-A1 — DISPLACED-FACT HUMAN ADJUDICATION PACKET

**For PRODUCT-OWNER adjudication. Prepared 2026-09-04 (§164). Zero provider calls.**

§163 measured that **7 of 10** execution-valid HS-A1 draws emitted a clarification about
isolation of the discharge auger rather than the authored flame-failure target. The question
here is what those seven ARE — not whether the verifier reached the owed target, which §163
already recorded as a miss and which is not reopened.

**This packet assigns no classification.** `VALID_BUT_TARGET_DISPLACED` has not been applied to
these seven by any code, and is not applied here.

---

## 1. Exact observation

Fixture file sha256 `09195af8fb7ce07c693c8d056526745196a81c4170d5d801eaccfe1e1f1545cb`

> A grain dryer is running on the farm drying floor. The burner unit sits at the far end of the plenum behind a steel shroud, and from the walkway the flame-failure device and its wiring are behind that shroud and cannot be seen. Grain dust has settled on the horizontal surfaces of the walkway and on the motor housings. An operative is clearing a blockage at the discharge auger with the dryer running.

---

## 2. The seven displaced clarification outputs, verbatim

Source: `verification/expert-hazlenz-verifier-draw-reliability-2026-09-04/DRAW-RUN-RECORDS.jsonl`  ·  sha256 `7e84cef427d8c12659d01b96bf992bf41fc42c1ed8a2f46ba6dc7ddef07d8399`
All seven from one frozen request, sha256 `d9ba1dc6fb7e45590e747111d855a3d0d4bd0190b7c227e3256bb51fb7351809`.

### draw 1 — verdict `ADD_OR_REPLACE_CLARIFICATION`, source mode `NOMINATED_FACT`, affectedDecision `REQUIRED_CONTROL`

**Question:** Has the discharge auger's drive/motor been locked out or de-energized (isolated from its power source) before the operative began clearing the blockage, or is the auger still mechanically capable of turning while they work at the discharge point?

**Nominated fact:** Whether the discharge auger's drive/motor has been locked out or de-energized before the operative began clearing the blockage, or whether it remains mechanically capable of turning while the operative works on it.

Contract admitted: true · execution valid: true · degenerate: false · forbidden fields: 0

### draw 2 — verdict `ADD_OR_REPLACE_CLARIFICATION`, source mode `NOMINATED_FACT`, affectedDecision `REQUIRED_CONTROL`

**Question:** Has the discharge auger (and its drive) been locked out or de-energized before the operative began clearing the blockage, or is the auger still mechanically capable of running/restarting while the operative's hands or tools are near the flighting?

**Nominated fact:** Whether the discharge auger has been locked out/de-energized (isolated from its power source) before the operative began clearing the blockage, independent of whether the overall dryer unit is running.

Contract admitted: true · execution valid: true · degenerate: false · forbidden fields: 0

### draw 3 — verdict `ADD_OR_REPLACE_CLARIFICATION`, source mode `NOMINATED_FACT`, affectedDecision `REQUIRED_CONTROL`

**Question:** Has the discharge auger's drive been locked out or otherwise de-energized before the operative began clearing the blockage, independent of the dryer continuing to run for other functions?

**Nominated fact:** Whether the discharge auger's drive/power has been locked out or de-energized before the operative began clearing the blockage by hand.

Contract admitted: true · execution valid: true · degenerate: false · forbidden fields: 0

### draw 4 — verdict `ADD_OR_REPLACE_CLARIFICATION`, source mode `NOMINATED_FACT`, affectedDecision `REQUIRED_CONTROL`

**Question:** Has the discharge auger and its drive mechanism been locked out/de-energized before the operative began clearing the blockage, or is the auger still capable of powered motion while the operative is working on it?

**Nominated fact:** Whether the discharge auger (and its drive) has been de-energized/locked out before the operative began clearing the blockage, or whether it remains powered and capable of motion while the operative's body/hands are exposed to it.

Contract admitted: true · execution valid: true · degenerate: false · forbidden fields: 0

### draw 5 — verdict `ADD_OR_REPLACE_CLARIFICATION`, source mode `NOMINATED_FACT`, affectedDecision `REQUIRED_CONTROL`

**Question:** Has the discharge auger's drive been de-energized and locked out (e.g., via lockout/tagout or a local disconnect) before the operative began manually clearing the blockage, or does the auger remain capable of rotating while the dryer runs?

**Nominated fact:** Whether the discharge auger's drive/rotating components have been de-energized or locked out before the operative began clearing the blockage, as opposed to the auger remaining powered while the dryer runs.

Contract admitted: true · execution valid: true · degenerate: false · forbidden fields: 0

### draw 6 — verdict `ADD_OR_REPLACE_CLARIFICATION`, source mode `NOMINATED_FACT`, affectedDecision `REQUIRED_CONTROL`

**Question:** Has the discharge auger's drive/motor been locked out or de-energized (isolated from its power source) before the operative began clearing the blockage, even though the dryer as a whole continues running?

**Nominated fact:** Whether the discharge auger drive has been locked out/de-energized before the operative began clearing the blockage

Contract admitted: true · execution valid: true · degenerate: false · forbidden fields: 0

### draw 8 — verdict `ADD_OR_REPLACE_CLARIFICATION`, source mode `NOMINATED_FACT`, affectedDecision `REQUIRED_CONTROL`

**Question:** Has the discharge auger's drive been locked out or de-energized (independent of the dryer's other systems) before the operative began clearing the blockage by hand?

**Nominated fact:** Whether the discharge auger's drive/power has been locked out or de-energized before the operative began clearing the blockage, even though the dryer overall continues running.

Contract admitted: true · execution valid: true · degenerate: false · forbidden fields: 0

---

## 3. Normalized semantic intent shared across the seven

Stated as the common content of the seven questions, not as a judgement about them:

> whether the discharge auger and its drive were locked out or de-energised before the operative
> began clearing the blockage, or whether the auger remained capable of powered motion while the
> operative worked at it

Six of the seven explicitly distinguish the auger drive from the dryer as a whole — phrases such
as *"independent of the dryer continuing to run for other functions"* and *"even though the
dryer as a whole continues running"*. The wording differs in every draw; **7 distinct question
strings express this one intent**.

---

## 4. affectedDecision emitted

`REQUIRED_CONTROL` on all seven. The authored HS-A1 target carries `REQUIRED_CONTROL`.

---

## 5. First-pass candidate state for the auger hazard

```json
{
  "candidateKey": "auger_entanglement",
  "hazardFamily": "machine_guarding",
  "assertedConditionState": "ACTIVE",
  "evidenceBasis": "The text states an operative is actively clearing a blockage at the discharge auger while the dryer, and by implication its driven components, remain running.",
  "reasoning": "Clearing a blockage at an auger while it and the associated equipment are running exposes the operative to entanglement/caught-in injury from the moving auger flighting or drive components. This is a current, ongoing exposure, not a hypothetical."
}
```

**The candidate was asserted `ACTIVE`, not left at
`INSUFFICIENT_EVIDENCE`.** Because the selective-verification packet supplies only *unresolved*
facts, this candidate was **not** among the unresolved facts given to the verifier:

```json
[
  {
    "ref": "candidate:flame_failure_device_unverifiable",
    "kind": "CANDIDATE",
    "text": "flame_failure_device_unverifiable (fire_explosion) left INSUFFICIENT_EVIDENCE: The text states the flame-failure device and its wiring cannot be seen from the walkway due to the shroud."
  },
  {
    "ref": "uncertainty:0",
    "kind": "UNCERTAINTY_STATEMENT",
    "text": "Whether the flame-failure device is currently functioning correctly cannot be determined from the observation, as it is physically obscured from view; no stated fact indicates it has failed or is out of service."
  }
]
```

So on all seven draws the auger fact arrived through the verifier's own **nomination** path
(`sourceMode: NOMINATED_FACT`), not from the supplied set. The three on-target draws used
`SUPPLIED_FACT` instead.

---

## 6. Deterministic output

`familiesEmitted: []` · `lifeCriticalFindingKeys: []`

The deterministic engine emitted nothing for this row.

---

## 7. Governed evidence

**NONE SUPPLIED.** `governedStandards` is `[]` on the row and `governedEvidence` is `[]` in the blinded packet.

---

## 8. Relevant allowed hazard family, and how the row truth classifies it

Allowed hazard families: `combustible_dust`, `fire_explosion`, `machine_guarding`, `noise_exposure`

```json
{
  "presentHazardFamilies": [
    "combustible_dust",
    "machine_guarding"
  ],
  "defensibleHazardFamilies": [
    "fire_explosion"
  ],
  "forbiddenHazardFamilies": [
    "noise_exposure"
  ],
  "lifeCriticalHazardFamilies": [
    "machine_guarding"
  ],
  "decisionCriticalGaps": [
    {
      "gapId": "HS-A1-G1",
      "description": "whether the burner's flame-failure device is fitted and functioning, which the shroud prevents the observer from seeing",
      "affectedDecision": "REQUIRED_CONTROL"
    }
  ]
}
```

Recorded mechanically, without inference: `machine_guarding` — the family the auger candidate
was raised under — appears in **`presentHazardFamilies`** and in **`lifeCriticalHazardFamilies`**
for this row, while `decisionCriticalGaps` contains only the flame-failure gap.

---

## 9. Does the observation state operation while the blockage is cleared?

The observation contains this sentence verbatim:

> An operative is clearing a blockage at the discharge auger with the dryer running.

---

## 10. Is isolation / lockout state explicitly established?

Mechanical scan of the observation for isolation vocabulary — `lockout`, `lock out`, `tagout`,
`isolat`, `de-energis`, `de-energiz`, `disconnect`, `stopped`, `switched off`:

- `lockout` — not present
- `lock out` — not present
- `tagout` — not present
- `isolat` — not present
- `de-energis` — not present
- `de-energiz` — not present
- `disconnect` — not present
- `stopped` — not present
- `switched off` — not present

None of the nine terms appears. The text states the dryer is running and does not state the
auger drive's energy state either way.

---

## 11–13. Plausible branches, and whether they change present action

**Constructed mechanically from the two answer states the seven outputs themselves name.** These
are the verifier's branches restated, not an authored counterfactual and not an endorsement.

- **Branch A** — the auger drive was locked out / de-energised before the operative began.
- **Branch B** — the auger drive remains powered and capable of motion while the operative works.

Whether those two lead to different things being done at this dryer today is the adjudication
question and is **not** answered here.

---

## 14. Relationship to the flame-failure target

**Authored target:** the functional status/effectiveness of the burner flame-failure safeguard

The two facts concern different equipment, different hazard families and different
mechanisms — the burner safeguard behind a shroud, versus the energy state of the discharge
auger drive. Mechanically, they do not overlap in subject.

For comparison, the three draws that reached the authored target, verbatim:

- draw 7 (`SUPPLIED_FACT`): Has the flame-failure (flame-safeguard) device on the burner been functionally tested or verified as operating correctly (e.g., through maintenance records, a recent test, or an accessible indicator), given that it and its wiring cannot be visually inspected from the walkway due to the shroud?
- draw 9 (`SUPPLIED_FACT`): Has the flame-failure device on the burner been functionally tested/verified as operating correctly (e.g., per maintenance log or recent test), even though it cannot be visually confirmed from the walkway due to the shroud?
- draw 10 (`SUPPLIED_FACT`): Has the flame-failure (flame-out) device on the burner been functionally tested/verified as operating correctly, given that it and its wiring are physically obscured behind the shroud and cannot be visually confirmed from the walkway while the dryer is running?

---

## 15. Can both facts be decision-critical simultaneously?

Recorded as a structural observation only. Nothing in the v9 row truth, the contract or the
verifier instruction states that a row may have only one decision-critical gap. The row's
authored `decisionCriticalGaps` array contains one entry; whether that reflects the observation
or the authoring is part of what is being adjudicated. The verifier contract permits **exactly
one** nomination per verdict, and the first pass emitted **no** clarification on this draw set —
so on this case the architecture allowed at most one question to survive regardless of how many
facts were decision-critical.

---

## ADJUDICATION QUESTION

Do the seven HS-A1 auger outputs represent unsafe semantic reasoning, useful but
target-displaced reasoning, or ambiguous reasoning?

### Allowed dispositions

- [ ] `DISPLACED_FACT_VALID_DECISION_CRITICAL`
- [ ] `DISPLACED_FACT_VALID_BUT_NOT_NECESSARY_NOW`
- [ ] `DISPLACED_FACT_INVALID`
- [ ] `DISPLACED_FACT_AMBIGUOUS`

**Whatever the disposition, §163 is not rescored and HS-A1's frozen target is not broadened.**
The seven remain an `OWED_TARGET_RECALL` miss. What the disposition decides is whether they are
additionally a clarification-precision defect.

Reviewer: ______________________  Date: ____________

