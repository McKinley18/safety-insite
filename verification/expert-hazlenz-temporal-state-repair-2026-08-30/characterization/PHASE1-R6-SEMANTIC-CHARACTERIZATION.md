# Phase 1 — R6 semantic characterization

Source evidence: §110 / D-122, `verification/expert-hazlenz-r4-r6-targeted-hosted-confirmation-2026-08-31/results/targeted-confirmation-summary.json`, all 3 R6 hosted transcripts (reps 1–3, `req_011CeZkApeTqpk15rRvm95Qa`, `req_011CeZkBccCGkNsD2xddQo14`, `req_011CeZkCTwL2e1VE6h2jkivU`).

## The fixture

`R6` (`backend/src/safescope-v2/expert-hazlenz/fixtures/routing-fixtures.ts`), observation text:

> "The press was locked out with the supervisor tag applied and stored energy bled down and verified at zero before the guard was removed, and a second worker verified the isolation."

Deterministic finding supplied: `lockout_tagout`, state `CONTROLLED`, not life-critical, not actionable. Expectation: all four typed collections `FORBIDDEN`. The fixture's own authoring comment: "Everything is stated: locked out, tagged, bled down, verified at zero, second-person verified. A candidate or a question here is invention."

Read literally, the sentence describes a **sequence that has already completed**: isolate → tag → bleed down → verify zero → *then* remove the guard → second-person verify the isolation. The guard's removal is not a stray, unexplained fact — it is placed, grammatically and causally, as the four­th step of a stated safety procedure, gated on the energy state already being proven zero. Nothing in the sentence describes the machine being reassembled, restarted, or handed back to production; nothing describes work being performed; nothing describes a time elapsed since the isolation was verified. The observation is a snapshot of a machine correctly placed into a zero-energy state for the guard to be removed, full stop.

## What the model did, identically in shape across all 3 reps

Every rep produced exactly the same two-part structure:

1. one `expertHazardCandidates` entry, `hazardFamily: machine_guarding`, framed as "the guard was removed... exposes machine hazards... unless the guard is restored before re-energization" (rep 1) / "...no statement about whether or when the guard will be reinstalled before the press is returned to service" (rep 2) / "...does not state whether the guard has been reinstalled or whether work is complete" (rep 3);
2. two `decisionCriticalClarifications`, one about guard reinstatement timing before re-energization, one about a second present-state question (residual stored energy in rep 1, current task/exposure in rep 2, LOTO-removal authority in rep 3).

`crossHazardInsights` and `disagreements` were correctly empty on all 3 — the over-routing is confined to exactly these two collections, exactly as D-122 recorded.

## State-transition trace

### Candidate — `machine_guarding`, "exposes machine hazards... unless the guard is restored before re-energization"

```
OBSERVED TEXT
  "...stored energy bled down and verified at zero before the guard was removed,
   and a second worker verified the isolation."
      → the guard's removal is the LAST described event, gated behind a
        completed, second-person-verified zero-energy state.

MODEL-INFERRED CURRENT STATE
  "The machine currently lacks its guard, and whether it will be restored before
   the machine moves is an open, undetermined fact about the world right now."

TYPED OBJECT
  expertHazardCandidates[0]:
    hazardFamily: machine_guarding
    reasoning: "...exposes machine hazards (pinch points, stored mechanical
      hazards) unless the guard is restored before re-energization."

WHY UNSUPPORTED
  The candidate's own hedge — "unless the guard is restored before
  re-energization" — is not evidence of a hazard that exists NOW; it is a
  conditional about a future event (re-energization) that the observation
  never describes as imminent, in progress, or even contemplated. The
  candidate treats an entailment that is true of literally any correctly
  performed guard-removal-under-LOTO ("eventually it must go back on before
  the machine restarts") as if it were a fact specific to what THIS
  observation left open. It isn't: nothing in the text suggests the
  procedure is incomplete, abandoned, or that restoration will be skipped.
  While the stated zero-energy, locked-out, tagged, second-person-verified
  state holds — which is the entirety of what the observation reports — the
  pinch points and stored mechanical hazards the candidate names cannot be
  exposed to anyone, because the machine cannot move. The candidate is not
  wrong about machine guarding in general; it is unsupported as a claim
  about THIS observation.
```

### Clarification 1 — "Will the guard be reinstalled and verified... before the press is re-energized?" (rep 1 phrasing; reps 2–3 ask the equivalent)

```
OBSERVED TEXT
  Same span as above — the guard's removal is the terminal event described,
  under a verified zero-energy state.

MODEL-INFERRED CURRENT STATE
  "Whether standard LOTO close-out (guard back on, verified, before
   re-energizing) will actually happen is not yet decided, and asking
   closes a real gap in today's safety picture."

TYPED OBJECT
  decisionCriticalClarifications[0]:
    question: "Will the guard be reinstalled and verified before lockout is
      removed and the press is re-energized?"
    affectedDecision / criticality fields framing this as decision-critical.

WHY UNSUPPORTED
  This is the "generic commentary" failure named in this operation's own
  authorization: the question is true of, and could be asked about, almost
  any observation in which a guard was ever removed under LOTO, anywhere,
  regardless of what this specific observation actually establishes. It is
  not decision-critical to what was observed, because nothing in the
  observation is left undetermined by it — the observation describes a
  program mature enough to already require second-person isolation
  verification, which is itself evidence bearing on whether guard
  restoration before restart is also part of that program's normal
  practice. A clarification earns its place by closing a gap THIS
  observation actually has; this one manufactures a gap that fits any
  guard-removal observation rather than pointing at one this text left
  open.
```

### Clarification 2 — residual stored energy / current task / LOTO-removal authority (varies by rep)

```
OBSERVED TEXT (rep 1's target)
  "...stored energy bled down and verified at zero..."

MODEL-INFERRED CURRENT STATE
  "It is still undetermined whether a stored-energy source beyond what was
   bled down might be present."

TYPED OBJECT
  decisionCriticalClarifications[1]:
    question: "...is any residual stored energy source (e.g., springs,
      counterweights, or pneumatic accumulators) present beyond what was
      bled down?"

WHY UNSUPPORTED
  This is the sharpest instance of the failure, because it does not merely
  invent an ungrounded future contingency (as the candidate and
  clarification 1 do) — it re-asks a question the observation has already
  answered. "Stored energy bled down and verified at zero" is a completed,
  second-person-verified fact stated in the text; the clarification treats
  it as though it were still open. This is not filling a gap the
  observation left; it is disregarding evidence that was supplied. The
  rep-2 and rep-3 variants ("what task is being performed," "who has
  authority to remove the lockout") are the same underlying move in a
  different guise: manufacturing a present-tense open question about a
  procedure the observation frames as already correctly executed and
  verified, rather than identifying an actual gap in what was stated.
```

## Summary of the error, generalized

In all three instances, the model reasons **forward** from a stated, resolved, verified condition (guard removed *under a completed, verified zero-energy isolation*) to a **hypothetical future transition** (eventual re-energization / return to service) and then treats that future transition's contingencies as **present, decision-critical unknowns about the current observation** — even where, as with residual stored energy, the observation already answered the question being asked. The failure is not lexical (it is not triggered by the word "removed" or by past tense) and it is not specific to `machine_guarding` — it is a general pattern of collapsing "a condition existed historically, and something about it will eventually need to be resolved" into "a hazard or an open question exists right now," without any textual signal that the resolution is actually in doubt, incomplete, or that a stated remediation fact should be disregarded.
