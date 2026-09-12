# HS-E1 — VERIFIER ROW-TRUTH RECONCILIATION PACKET

**For PRODUCT-OWNER / HUMAN adjudication of the AUTHORED TRUTH on this row. Prepared 2026-09-04 (§159).**

The question is whether the authored truth on this row is a sound standard to grade a verifier
against. It is not whether any model output was good. This packet reaches no conclusion and
selects no disposition.

**Why a human is being asked.** The standard was authored by the same model family it grades.
A model cannot adjudicate its own evaluation standard. HS-H1 went through this process on
2026-09-04 and returned `AUTHORING_AMBIGUOUS`; that outcome is the reason the remaining
load-bearing rows are being reviewed rather than assumed sound.

| | |
|---|---|
| row | `HS-E1` |
| authored class | `REQUIRED` — asserts ONE NAMED FACT governs a current decision |
| fixture form | `PRIOR_EVENT` |
| blinded draws | VC-04 (R3) |
| in primary denominator | VC-04 |
| excluded from primary | (none) |
| verifier executions covered | 2 (1 draws × v1 and v2) + 1 §158 repair |

---

## 1. Exact observation

Fixture `hazlenz.expert.hardened-development.fixtures.v9`, file sha256 `09195af8fb7ce07c693c8d056526745196a81c4170d5d801eaccfe1e1f1545cb`
Jurisdiction `osha-general-industry`  ·  412 characters

> A sawmill debarker is running and a sawyer is standing at the infeed deck rolling logs onto the chain. The machine's guard door over the rotor is closed and its interlock switch is in place. The machine was returned to service this morning after a rotor tooth change carried out overnight by the maintenance fitter, who has gone off shift. The sawyer is working from the deck and is not reaching into the throat.

Allowed hazard families: `machine_guarding`, `lockout_tagout`, `material_handling_storage`, `chemical_release`

---

## 2. Deterministic result and governed evidence available to the first pass

- **§154 R3** — families emitted: `(none)`  ·  life-critical: `(none)`

**Governed regulatory evidence supplied with this row:**

**None. `governedStandards` is `[]` on the row and `governedEvidence` is `[]` in the blinded packet for every draw.**

This is true of every row behind the verifier packet. Whether an authored decision-critical
claim can rest on an observation alone, with no governed record, is part of what is being
adjudicated — and it is the point on which HS-H1 turned.

---

## 3. The authored truth, verbatim

### The claim

**Missing fact:** whether the guard interlock was function-tested after the overnight rotor tooth change

**Affected decision:** `REQUIRED_CONTROL`

### The counterfactual, as authored

- **Answer A:** the interlock was proved to stop the rotor before the machine was handed back
- **Done under A:** the machine runs and the finding is the infeed method and the sawyer working the deck alone
- **Answer B:** no function test was made after the guard was refitted
- **Done under B:** the debarker must come out of service until the interlock is proved, because nothing else stands between an opened guard and a turning rotor

### Why the author says the observation does not establish it

> the guard being closed and the switch being present are both visible now and are equally consistent with a tested interlock and an untested one; a test performed overnight leaves nothing at the deck that its absence would not also leave

### All authored acceptable selectors

- whether the guard interlock was function-tested after the rotor work
- whether the rotor was proved to stop when the guard is opened

### The selector keyword sets the scorer matched on

```json
[
  [
    "interlock",
    "test"
  ],
  [
    "interlock",
    "prov"
  ],
  [
    "rotor",
    "stop"
  ],
  [
    "function",
    "test"
  ]
]
```

A proposed question counted as reaching the owed fact only if it contained **every** keyword
in **some** set. This is the mechanism HS-H1's adjudication found could not be relied on
when the observation does not establish that the named mechanism is the applicable one.

### The row-level truth record

```json
{
  "presentHazardFamilies": [
    "machine_guarding"
  ],
  "defensibleHazardFamilies": [
    "lockout_tagout",
    "material_handling_storage"
  ],
  "forbiddenHazardFamilies": [
    "chemical_release"
  ],
  "negatedOrSafeStateFamilies": [],
  "lifeCriticalHazardFamilies": [
    "machine_guarding"
  ],
  "decisionCriticalGaps": [
    {
      "gapId": "HS-E1-G1",
      "description": "whether the guard interlock was function-tested after the overnight rotor work, without which its being \"in place\" says nothing about whether it stops the rotor",
      "affectedDecision": "REQUIRED_CONTROL"
    }
  ]
}
```

### The authoring rationale

> THE UNKNOWN IS A PAST EVENT and nothing visible now can settle it: an interlock proved on test and one never re-tested look identical from the deck. The fitter having gone off shift is a stated fact that makes the answer unobtainable on the spot, without making the test's absence a fact.

### The review signatures recorded at authoring time

These are the author's own checks. They are part of the material under adjudication, not
evidence that the adjudication is settled.

- **NOT_ALREADY_STATED** — The text says the guard door is closed and the switch is in place, and that the machine was returned to service; it never says the interlock was tested.
- **NO_PRESUPPOSITION** — "Returned to service" is a statement about the machine running again, not about a test having been passed, and I avoided writing "signed back into service" which would have implied one.
- **NOT_DETERMINISTICALLY_DERIVABLE** — A switch being physically in place does not entail that it opens the circuit; deriving that needs a premise about post-maintenance testing that the text does not supply.
- **TWO_PLAUSIBLE_VALUES** — The fitter function-tested it before handing back, or he refitted the guard and left without testing — both are ordinary overnight outcomes.
- **BRANCHES_CHANGE_A_CURRENT_DECISION** — Tested, the machine keeps running now and the finding is the infeed method; untested, it stops today until the interlock is proved, because a defeated interlock on a debarker rotor is not survivable.
- **NO_HIDDEN_DEFAULT** — No record is supplied and nothing in the text sets a default about post-maintenance testing.
- **SELECTOR_IS_UNIQUE_OR_ALTERNATIVES_ENUMERATED** — Two selectors are enumerated: whether the interlock was function-tested after the work, and whether the rotor was proved to stop with the guard opened.
- **AFFECTED_DECISION_JUSTIFIED** — The answer decides whether a specific control has been verified before use, which is REQUIRED_CONTROL.

---

## 4. Stored first-pass outputs

First-pass prompt v13, analysis contract `analysis.v2`, model `claude-sonnet-5`.

### §154 — draw R3 (blinded as VC-04)

`verification/expert-hazlenz-hardened-v13-replicate3-2026-09-03/RUN-RECORDS.jsonl`  ·  sha256 `9e2328b93523adc92c07b767bc8bbf05a5037f129f324579e1ac7bb7d38a8bed`  ·  18836 in / 423 out  ·  $0.041901999999999995

```json
{
  "contractVersion": "hazlenz.expert.analysis.v2",
  "analysisId": "HS-E1",
  "outcome": "NOTHING_TO_ADD",
  "expertHazardCandidates": [],
  "decisionCriticalClarifications": [],
  "crossHazardInsights": [],
  "disagreements": [],
  "expertExplanation": {
    "summary": "The observation describes a debarker with its guard door closed and interlock in place while the sawyer works from the deck without reaching into the throat — a controlled, current state with no stated gap. The overnight rotor tooth change is a resolved historical event: the machine was returned to service, the guard is confirmed closed with the interlock engaged, and no failure, bypass, or residual exposure from that maintenance is stated. The lockout/tagout question already flagged by the deterministic engine concerns that completed maintenance activity, not a live hazard, and nothing in the text gives reason to believe the machine is not properly restored to normal operation."
  },
  "uncertainty": {
    "statements": []
  }
}
```

---

## 5. Verifier outputs

### VC-04 (R3)

**What the verifier was given:**

```json
{
  "unresolvedFacts": [],
  "firstPassClarificationsAsked": [],
  "triggerConditions": [
    "T_WHOLLY_EMPTY_ANALYSIS"
  ]
}
```

**§156 verifier v1**

```json
{
  "verdict": "ADD_OR_REPLACE_CLARIFICATION",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": null,
  "rationale": "The observation states the guard door is closed and the interlock switch \"is in place,\" but this is a maintenance-restoration scenario following an overnight rotor tooth change by a fitter who is now off shift and unavailable to confirm the work. \"Interlock in place\" is ambiguous between two very different states: (1) the interlock has been verified functional and tested after reassembly, or (2) the switch is physically present/reconnected but its function after the maintenance disturbance has not been verified. A guard door that is physically closed with a switch present is consistent with both a properly functioning interlock and one that was left mis-adjusted, bypassed, or wired incorrectly during reassembly — this is exactly the case of a control that cannot be verified from the observation alone. Since the sawyer is actively working at the infeed deck with the machine running, if the interlock is not actually functional the exposure to an unguarded rotor is live and severe (crush/amputation hazard), whereas if it was tested and confirmed functional after the tooth change, work may continue as normal. The two answers lead to different actions now (stop and verify interlock function vs. continue operating), so this is decision-critical and was left completely unaddressed by the first pass, which raised no hazard candidates and asked no clarifying questions at all.",
  "proposedClarification": {
    "question": "Was the debarker's rotor guard interlock functionally tested (not just visually confirmed closed) after this morning's reassembly following the overnight rotor tooth change, before the sawyer resumed work at the infeed deck?",
    "whyItMatters": "A guard door that is physically closed with the switch present looks identical whether the interlock is truly functional or was left mis-adjusted/bypassed during reassembly after maintenance. If it has not been verified functional, the sawyer is exposed to an unguarded rotor while the machine runs, which is a severe crush/amputation hazard requiring the machine to be stopped until interlock function is confirmed.",
    "affectedDecision": "REQUIRED_CONTROL",
    "evidenceGap": "The observation only states the guard is closed and the interlock switch is in place, not that interlock function was tested or verified after the overnight maintenance disturbance."
  },
  "nominatedFact": null,
  "stopReason": "tool_use",
  "outputTokens": 835
}
```

**§157 verifier v2**

```json
{
  "verdict": "ADD_OR_REPLACE_CLARIFICATION",
  "clarificationSourceMode": "NOMINATED_FACT",
  "aboutUnresolvedFactRef": null,
  "rationale": "The observation states the machine was returned to service after overnight maintenance (a rotor tooth change) and that the guard door is closed with the interlock switch \"in place.\" But being \"in place\" describes the physical position of the switch component, not that it was functionally verified after the maintenance work. A rotor tooth change requires removing the guard to access the rotor, meaning the interlock circuit was necessarily disturbed. The text never states that a post-maintenance functional test or verification of the interlock's operation (e.g., that opening the guard actually stops/prevents rotor motion) was performed before the sawyer resumed working at the infeed deck. This is exactly the case where a control that cannot be seen to fail is not a control that was checked: the switch could be correctly reinstalled and verified, or it could be reconnected but miswired/defeated/left non-functional after the overnight repair, and the observation is consistent with either. If the interlock was verified functional post-maintenance, the sawyer's current work practice (standing at the deck, not reaching into the throat) is adequately protected and work continues as-is. If the interlock was not verified and is in fact non-functional after the maintenance disturbance, the guard provides no actual protection against rotor contact if the door were later opened or defeated, meaning the machine should not have been released to normal production operation without lockout/tagout-cleared verification — a required control (functional interlock test) is missing before continued operation. These are different actions today: continue routine operation vs. halt and verify/test the interlock before further use. This is not a magnitude question and not a duplicate of the LTO-for-completed-maintenance point the summary dismisses; it is about whether the safety device was confirmed operational before restart, which is a standard verification step following guarding-related maintenance and needs to be resolved now, not at a later review, since the sawyer is currently operating with exposure at the infeed deck. The first pass raised no candidates and asked no clarification at all, missing this decision-critical fact.",
  "proposedClarification": null,
  "nominatedFact": {
    "missingFact": "Whether the rotor guard interlock switch was functionally tested/verified to actually stop or prevent rotor operation when the guard is opened, following the overnight rotor tooth change and reassembly, before the machine was returned to service.",
    "observationSpan": "The machine was returned to service this morning after a rotor tooth change carried out overnight by the maintenance fitter, who has gone off shift.",
    "notEstablishedBecause": "This span states the machine was put back into service and that the guard door is closed with the interlock switch 'in place,' but it describes only physical positioning, not a functional verification. A rotor tooth change requires disturbing the guard/interlock to access the rotor, so the interlock's post-repair operability is not established by stating it is 'in place' -- the same observation is consistent with the switch being correctly restored and verified, or being reconnected without confirming it actually functions.",
    "affectedDecision": "REQUIRED_CONTROL",
    "branchA": "The interlock was functionally tested and confirmed to stop/prevent rotor motion when the guard opens before restart",
    "decisionIfA": "Normal operation continues as observed; no additional action needed",
    "branchB": "The interlock was not functionally tested after reassembly and its operability post-repair is unverified",
    "decisionIfB": "Operation should be halted and the guard interlock functionally verified (or the machine placed back under lockout/tagout) before the sawyer continues working at the infeed deck",
    "whyNecessaryNow": "The sawyer is currently working at the infeed deck with the machine running; if the interlock is non-functional after the maintenance disturbance, the primary safeguard against rotor contact is not actually in place during ongoing operation, which is an immediate exposure that cannot wait for a later review."
  },
  "admissionAccepted": false,
  "stopReason": "max_tokens",
  "outputTokens": 1600
}
```

**§158 measurement repair — the same bytes re-sent under a 4,000-token ceiling after the §157 execution was truncated at 1,600**

```json
{
  "verdict": "NO_CLARIFICATION_REQUIRED",
  "clarificationSourceMode": null,
  "aboutUnresolvedFactRef": null,
  "rationale": "The observation states the guard door is closed, the interlock is in place, and the sawyer is not reaching into the throat — the current operating state is fully controlled and stated as such. The overnight rotor tooth change is a completed maintenance event; the machine was returned to service and the guard/interlock are confirmed engaged now, so there is no stated gap suggesting a bypassed interlock or residual lockout hazard. Whether the return-to-service check was a formal verification step or an informal one does not change what is being done now: the guard is closed and interlocked, and the sawyer is not exposed to the rotor. Because the interlock is verified as engaged and the operator's exposure is not established as open (they are not reaching in), there is no branch of any missing fact (e.g., exact verification procedure used overnight) that would change the current action — the machine continues to run under the stated closed/interlocked/no-reach condition either way. No hazard candidate was reasonably omitted, and no unresolved fact would flip the decision from continue-operating to stop-and-correct.",
  "proposedClarification": null,
  "nominatedFact": null,
  "admissionAccepted": true,
  "stopReason": "tool_use",
  "outputTokens": 520
}
```

The §157 and §158 executions of this case returned DIFFERENT VERDICTS on byte-identical
input, provider-attested at 4,598 metered input tokens on both. Both are shown because
neither supersedes the other.

---

## 6. Every fact any execution actually focused on

Derived mechanically from the artifacts above — the unresolved facts each verifier was handed,
the ref each verdict was about, and each proposed question. Not ranked and not filtered.

**F1.** Was the debarker's rotor guard interlock functionally tested (not just visually confirmed closed) after this morning's reassembly following the overnight rotor tooth change, before the sawyer resumed work at the infeed deck?
- appears as: proposed by v1 on VC-04 [REQUIRED_CONTROL]

**F2.** Whether the rotor guard interlock switch was functionally tested/verified to actually stop or prevent rotor operation when the guard is opened, following the overnight rotor tooth change and reassembly, before the machine was returned to service.
- appears as: NOMINATED by v2 on VC-04

**F3.** whether the guard interlock was function-tested after the overnight rotor tooth change
- appears as: THE AUTHORED FACT (v9 fixture)

---

## HUMAN ADJUDICATION QUESTIONS

**A.** Is the authored fact genuinely unresolved from the observation and supplied evidence?

> 

**B.** Would the two authored answer states materially change a current safety, regulatory or required-control decision?

> 

**C.** Is asking this fact necessary now, rather than at a later review?

> 

**D.** Does the observation establish the conditions under which the NAMED MECHANISM in the selector is the applicable one? (This is the test HS-H1 did not meet: failing to settle the safe state is not the same as establishing which mechanism governs it.)

> 

**E.** Is the authored selector uniquely appropriate? If not, which other selectors in section 6 are equally valid?

> 

**F.** Did any supplied evidence already establish the authored fact?

> 

**G.** Would a competent safety professional reasonably be expected to identify this as the missing fact without being prompted toward it?

> 

**H.** Should this row remain in a strict selector-based semantic-accuracy denominator?

> 

### Allowed dispositions

Select exactly one. This packet does not select one and does not indicate a preference.

- [ ] `AUTHORING_VALID_UNIQUE_SELECTOR`
- [ ] `AUTHORING_VALID_MULTIPLE_ACCEPTABLE_SELECTORS`
- [ ] `AUTHORING_AMBIGUOUS`
- [ ] `AUTHORING_INVALID`
- [ ] `INSUFFICIENT_INFORMATION_FOR_HUMAN_ADJUDICATION`

If the disposition removes this row from a denominator, name **which** denominators. The
policy in `docs/VERIFIER-TRUTH-DENOMINATOR-POLICY.md` requires the exclusion to match the
scope of the defect and to apply prospectively only.

Reviewer: ______________________  Date: ____________

