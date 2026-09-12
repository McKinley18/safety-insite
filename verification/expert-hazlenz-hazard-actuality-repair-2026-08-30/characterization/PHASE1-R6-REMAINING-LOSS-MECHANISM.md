# Phase 1 — proving the remaining R6 loss mechanism

Source evidence: §112/D-124, all 3 raw R6 hosted (Claude Sonnet 5, prompt v5) responses, transcribed
in full in `verification/expert-hazlenz-v5-temporal-state-hosted-confirmation-2026-08-30/transport/v5-confirmation.jsonl`.

## The fixture, unchanged since §110

> "The press was locked out with the supervisor tag applied and stored energy bled down and
> verified at zero before the guard was removed, and a second worker verified the isolation."

## Per-repetition trace

### Rep 1

```
OBSERVATION FACT
  "...before the guard was removed..." — the guard's removal is the terminal event in a
  completed, second-person-verified zero-energy isolation sequence.

MODEL INTERPRETATION
  evidenceBasis: "...which is a current condition of an unguarded machine even though the
  lockout itself is controlled."
  -- The model explicitly treats "unguarded" and "lockout controlled" as two SEPARATE facts,
  and asserts the first is a "current condition" independent of the second.

HAZARD-FAMILY DECOMPOSITION
  reasoning: "...the guard removal is a present physical state that constitutes a machine
  guarding exposure... This is a distinct hazard family from lockout/tagout itself."
  -- Explicit, stated decomposition: machine_guarding is asserted to be its own hazard family,
  unaffected by the lockout/tagout family's controlled status.

CURRENT-STATE / EXPOSURE ASSUMPTION
  reasoning (full clause): "...if any re-energization occurs, or if other workers approach
  assuming the machine is safe."
  -- Both clauses are explicitly conditional ("if"). Neither claims re-energization is
  occurring, planned, or imminent; neither claims another worker is actually present. The
  observation supplies no fact supporting either "if." The model is not identifying a stated or
  inferable current exposure -- it is constructing a HYPOTHETICAL one to justify the candidate.

TYPED CANDIDATE
  expertHazardCandidates[0]: hazardFamily=machine_guarding, assertedConditionState=ACTIVE,
  confidence=MODERATE. Note assertedConditionState is ACTIVE despite the reasoning containing
  no actual present exposure -- only two unstated hypotheticals.

CLARIFICATION
  q1 asks whether the guard "will be reinstalled before the press is returned to service" --
  a future-transition question with no textual signal the transition is imminent, in doubt, or
  materially affects today's assessment.
  q2 asks whether "other workers in the area" could be exposed -- invented population not
  established by the text, which only describes the two workers who performed and verified the
  isolation.

WHY UNSUPPORTED
  Zero current exposure is actually claimed. Every hazardous consequence named ("if
  re-energization occurs", "if other workers approach") is a hypothetical FUTURE or UNSTATED
  state, not a fact the observation establishes now. The candidate's own `assertedConditionState:
  ACTIVE` contradicts its own reasoning, which never asserts anything is currently active.
```

### Rep 2

```
OBSERVATION FACT
  same span, "before the guard was removed."

MODEL INTERPRETATION
  evidenceBasis: "The observation states the guard was removed to perform work on the press."
  (Note: the observation does not actually say the guard was removed "to perform work" --
  that framing is the model's own addition, not evidenced.)

HAZARD-FAMILY DECOMPOSITION
  reasoning: "This is a distinct hazard family from lockout/tagout and should be tracked
  separately for the duration the guard is off."
  -- Identical decomposition move to rep 1, now adding an explicit temporal frame ("for the
  duration") that presumes an ongoing, trackable gap rather than a momentary, fully-controlled
  procedural step.

CURRENT-STATE / EXPOSURE ASSUMPTION
  reasoning: "...may be exposed to workers IF the machine were to unexpectedly become
  accessible OR IF work requires reaching into the guarded area."
  -- Again both branches are explicitly hypothetical ("if... were to", "if... requires"). No
  claim that the machine IS accessible or that anyone IS reaching into the area now.

TYPED CANDIDATE
  Same shape as rep 1: machine_guarding, ACTIVE, MODERATE.

CLARIFICATION
  q1: duration + barricading -- same future/bystander-hypothetical shape as rep 1's q2, merged
  with rep 1's q1's future-reinstatement framing.
  q2: "Is the lockout device (lock) itself, not just the tag, applied to the energy-isolating
  means?" -- THIS IS A NEW INSTANCE OF THE SAME UNDERLYING MOVE §112 FLAGGED: the observation
  states "locked out with the supervisor tag applied," and "locked out" is not merely a tag --
  the model re-litigates an already-answered fact (the isolation method) in different words,
  the same way the §110 "residual stored energy" question re-litigated "verified at zero."

WHY UNSUPPORTED
  Same as rep 1: no current exposure is actually claimed, only hypothetical future/unstated
  ones. q2 is a fresh instance of the "re-ask an answered question" failure mode, this time
  targeting "was it really locked" rather than "is there really zero energy."
```

### Rep 3

```
OBSERVATION FACT
  same span.

MODEL INTERPRETATION
  evidenceBasis: "...which is a current condition once lockout is in place."
  -- A third phrasing of the same move: "current condition" is asserted the moment lockout
  exists, as if guard-off and lockout-on are simply two independent facts to be listed, rather
  than jointly determining whether an exposure exists.

HAZARD-FAMILY DECOMPOSITION
  reasoning: "...even though lockout/tagout controls are in place for stored/electrical energy.
  The guard's absence itself is a distinct hazard from the energy-control hazard and should be
  tracked until the guard is reinstated and verified."
  -- Explicit decomposition again, now framed as an obligation to "track... until" a future
  event (reinstatement), reinforcing that the candidate exists to monitor a transition rather
  than to report a present condition.

CURRENT-STATE / EXPOSURE ASSUMPTION
  reasoning: "...exposure at the point of operation for ANY WORKER APPROACHING the press DURING
  THE WORK."
  -- "Any worker approaching" is a hypothetical class of person, not a person the observation
  places at the machine. "During the work" presumes work is actively occurring at the point of
  operation, which the observation does not state (it describes an isolation-and-guard-removal
  sequence, not an in-progress task).

TYPED CANDIDATE
  Same shape: machine_guarding, ACTIVE, MODERATE.

CLARIFICATION
  q1: access-restriction/barricading -- same bystander-hypothetical as reps 1-2.
  q2: task + "reinstalled and function-tested before the press is returned to service" -- same
  future-transition shape as reps 1-2's reinstatement question.

WHY UNSUPPORTED
  Identical mechanism to reps 1-2: no stated current exposure; the model manufactures one from
  an unstated hypothetical population ("any worker approaching") and an unstated hypothetical
  activity ("during the work").
```

## Is the reinstatement-timing clarification manufacturing a future exposure, or resolving genuine present uncertainty?

Manufacturing. In all three reps, the reinstatement/re-energization clarification is asked
IMMEDIATELY beside the model's own explanation that the current state (isolated, verified zero
energy, second-person-checked) is "thorough," "current," and raises "no additional concern... on
that front" (rep 3's `expertExplanation.summary`). The clarification does not target a gap in
today's safety picture — it targets a step (reinstatement before restart) that is procedurally
downstream of, and gated by, the very isolation the model itself just described as fully adequate.
Nothing in the observation suggests reinstatement is in doubt, that restart is imminent, or that the
facility lacks a normal LOTO release procedure. The clarification exists to give the manufactured
candidate somewhere to point, not because the text leaves the question open.

## Root cause: CONFIRMED, not merely hypothesized

The working hypothesis in this operation's authorization is confirmed directly from the raw text in
all three reps:

```
TRUE HAZARD-RELEVANT FACT        "the guard was removed" (true, stated)
        ↓
SEPARATE HAZARD FAMILY           "this is a distinct hazard family from lockout/tagout itself"
        ↓                        (asserted explicitly, in these or equivalent words, all 3 reps)
CURRENT HAZARD                   assertedConditionState: ACTIVE, confidence: MODERATE
```

with the middle step never validated against:

```
CURRENT EXPOSURE / CURRENT HAZARDOUS INTERACTION   -- NEVER CLAIMED.
```

Every consequence the model names to justify "ACTIVE" is explicitly hedged as hypothetical
("if... occurs", "if... were to", "may be exposed... if", "for any worker approaching") and rests on
a population (unnamed bystanders) or an event (re-energization, active work at the point of
operation) the observation neither states nor implies. `HAZARD_FAMILY_INDEPENDENCE_MISTAKEN_FOR_CURRENT_EXPOSURE_INDEPENDENCE`
is the correct name for this mechanism: the model is not wrong that machine guarding and
lockout/tagout are different hazard families in general — it is wrong to conclude that because they
are different families, a fact relevant to one (guard off) automatically clears the bar for a
CURRENT candidate in the other, without any current-exposure fact to support it.

One secondary, recurring sub-pattern also confirmed: rep 2's "is the lockout device (lock) itself,
not just the tag, applied" is a new instance of the §110/§112-documented failure of re-asking a
question the observation already answered ("locked out with the supervisor tag applied" already
describes an applied lock, per standard LOTO terminology — "locked out" is not a synonym for "tag
only").
