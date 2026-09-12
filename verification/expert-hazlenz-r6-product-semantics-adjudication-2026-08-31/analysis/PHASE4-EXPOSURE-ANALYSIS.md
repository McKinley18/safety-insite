# Phase 4 — Exposure analysis on the exact stated facts

Each question is answered on the observation **as written**, with unstated facts named as
unstated rather than filled in. "Do not manufacture uncertainty where the fixture already
supplies the answer" is applied throughout — and so is its converse.

---

## 1. Energy exposure — is hazardous energy currently available?

**NO. Answered by the observation, not inferred.**

The text states four separate energy-control facts: locked out; supervisor tag applied; stored
energy bled down; **verified at zero**; and independently re-verified by a second worker. This
is the maximal assertion the observation vocabulary permits — it is not "isolated" (which would
leave stored energy open), and not "de-energized" (which would leave isolation open). It is
isolation *plus* stored-energy dissipation *plus* zero-verification *plus* second-person
verification.

The deterministic extractor agrees mechanically: `energyIsolationState = isolated_and_verified`
(measured this phase).

The one hosted attempt to reopen this — v6 rep 3's *"gravity-fed components, unexpected
motion… not addressed by electrical/stored-energy lockout alone"* — asserts a mechanism the
text **contradicts**. "Stored energy bled down and verified at zero" is not qualified to
electrical energy anywhere in the sentence; the model narrowed a general statement to
"electrical/stored-energy" in order to leave a gap for gravity. That is invention, and the
repository's own 1910.147 record lists **gravity** among the energy sources a bleed-down and
zero-verification are expected to cover.

## 2. Motion exposure — can hazardous machine motion currently occur?

**NO, on the stated facts.**

Motion requires available energy. Energy availability is affirmatively excluded above. There is
no stated auto-restart capability (that is `V6`, a *different* fixture, and it correctly
requires recall), no stated second energy source (`V4`), no stated un-bled accumulator (`V2`).

This is the hinge of the entire adjudication. The governed 1910.212 record frames guarding as
protection against *"hazardous machine motions"* and *"employee access to moving parts."*
**With motion foreclosed, the hazard class the guard exists to control is not present.**

## 3. Guarding exposure — what hazardous interaction is the missing guard currently permitting?

**None that the observation establishes.**

Stated: the guard is off (at least as of the moment described). What that permits is *physical
access to a stationary point of operation on a machine at verified zero energy.*

What would make that access hazardous, and is **not** stated:
- a person at the point of operation (that is `V7` — and `V7` **requires** a candidate);
- a live pathway to motion (`V2`, `V4`, `V6`);
- a secondary exposure created by the task itself (`V8`);
- a sharp/thermal/chemical condition at the exposed surface.

All nine hosted responses had to supply one of these themselves. Every single consequence named
across v4, v5 and v6 is hedged on a condition the responder added: *"once re-energized"*,
*"if re-energization occurs"*, *"if a worker were to approach"*, *"for any worker approaching…
during the work"*, *"to anyone who could contact the machine"*, *"if the guard remains off,
personnel working at the machine…"*. Not one of them points to a stated fact.

Prompt v6 names this test in as many words: *"If the exposure you are describing only exists
under a hypothetical you added yourself… That is not a current hazard."* Applying the product's
own stated test to the product's own transcripts, **there is no current guarding exposure.**

## 4. Servicing exposure — does the servicing activity itself create another current exposure?

**Not on the stated facts, and this is the one place the observation is genuinely thin.**

A servicing activity is *inferred* (Phase 1), not stated. Its nature is unstated (fact **U2**).
Some servicing tasks do create exposures that survive a perfect LOTO — `V8` is exactly that
fixture (grinding, sparks, solvent-soaked rags → `chemical_exposure`, recall required).

But an unstated task cannot establish an exposure. The correct treatment of "we do not know what
task is being performed" on an observation that states nothing hazardous about it is silence,
not a speculative candidate — and, importantly, not a clarification either, because the answer
would not change what this observation reports today (see §6 below).

## 5. Restoration obligation — current hazard, or future prerequisite?

**FUTURE PREREQUISITE. Unambiguously.**

Guard reinstatement is a precondition on a state transition — return to service — that the
observation never states is occurring, imminent, or contemplated. Nothing in the text initiates
it. `R6-H` and `R6-I` (Phase 5) are the variants where that transition *is* stated, and they
classify differently precisely because the transition is what changes the answer.

Two further qualifications, both material:

- The obligation is real professional practice, but the repository's **governed corpus does not
  currently carry it** (PHASE3, distinction 2). The product cannot cite it today.
- Even granting it, "this will need doing before restart" is true of essentially every properly
  executed LOTO with a guard removed. Prompt v6 already names that genericness as
  disqualifying: *"that genericness is itself evidence the question is not decision-critical."*

## 6. Genuinely unresolved facts — and whether any is necessary to classify the CURRENT state

Five facts are genuinely unstated (Phase 1: U1–U5). The question Phase 4 asks is narrower: does
resolving any of them change the classification of the **current** state?

| unstated fact | if resolved one way | if resolved the other | changes current classification? |
|---|---|---|---|
| **U1** guard still off, or reinstalled? | still off — machine remains at verified zero energy, no motion possible | reinstalled — plainly nothing | **NO.** Both branches are non-hazardous. |
| **U2** what task? | a benign task — nothing | a task creating new exposure — but that is `V8`, a different observation | **NO**, not from this text. |
| **U3** anyone at the point of operation? | yes — that is `V7`, and `V7` requires a candidate | no — nothing | **NO** from this text: the observation states the two workers doing the isolation and nothing about a third. This is the closest call and is treated squarely in PHASE6. |
| **U4** re-energization imminent? | yes — that is `R6-H` | no — nothing | **NO**, not stated. |
| **U5** whose lock? | supervisor's only — a real `lockout_tagout` adequacy question | employee's own — nothing | **Marginally yes**, but for `lockout_tagout`, not `machine_guarding`. See PHASE3's residual note. |

**Conclusion: no genuinely unresolved fact is necessary to classify the current state, and
U1 — the fact eight of nine hosted clarifications actually asked about — is the clearest case of
all, because both of its branches are non-hazardous.** A question whose every answer leaves the
classification unchanged is definitionally not decision-critical, which is the contract's own
bar (`EXPERT_AFFECTED_DECISIONS`, and the normalizer's refusal of questions that change no
listed decision).
