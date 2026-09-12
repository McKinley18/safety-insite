# Phase 3 — Regulatory / safety semantic analysis, from the repository's own corpus

**Constraint honoured:** no regulatory language is invented here, and no regulatory text is
quoted that is not present in this repository. Where a concept is needed that the corpus does
not carry, it is named as *absent* rather than supplied from memory.

## Status of the two governing records — read this first

Both relevant records live in
`backend/src/safescope-v2/knowledge-intake/records/quarantined/`:

| record | citation | `reviewStatus` | `approvedForUse` |
|---|---|---|---|
| `osha-1910-147-lockout-tagout.json` | 29 CFR 1910.147 | `unreviewed` | **`false`** |
| `osha-1910-212-machine-guarding.json` | 29 CFR 1910.212 | `unreviewed` | **`false`** |

They are **quarantined and not approved for customer use.** They may be used here as the
repository's own statement of the *regulatory concepts* in play — which is what this phase asks
for — and they may **not** be cited to a customer, treated as governed authority, or presented
as backing for a finding. That distinction is load-bearing and is carried into the
recommendation.

Note also that R6's frozen input supplies `governedStandards: []`, and prompt v6's hard
prohibitions forbid the model from writing any citation at all. **The Expert layer adjudicated
R6 with no regulatory record in front of it.**

## The concepts, as the corpus states them

### 1910.212 — machine guarding

`standardIntent`:

> Protect employees from machine hazards by requiring guarding methods that prevent contact with
> points of operation, ingoing nip points, rotating parts, flying chips, sparks, and other
> hazardous **machine motions** or emissions.

`evidenceNeeded` includes:

> Document whether employees can contact moving parts during operation, setup, adjustment,
> cleaning, or maintenance.
> Document task being performed and **equipment operating state**.
> Verify whether additional standards or **lockout/tagout requirements may apply** for service or
> maintenance.

`nonApplicabilityQuestions` — the decisive entries:

> Is the hazard fully enclosed or otherwise guarded so **employee contact is not reasonably
> possible**?
> **Is the task service or maintenance where lockout/tagout may be the more specific controlling
> standard?**

### 1910.147 — control of hazardous energy

`standardIntent`:

> Protect employees from **unexpected energization, startup, or release of stored energy** during
> service or maintenance by requiring energy-control procedures, isolation, lockout/tagout
> devices, and **verification before work proceeds**.

`applicabilityTriggers` include `service`, `maintenance`, `clearing jam`, `adjustment`,
`unexpected startup`, `stored energy`, `energy isolation`.

`evidenceNeeded` includes:

> Identify all energy sources, including electrical, mechanical, hydraulic, pneumatic, thermal,
> chemical, **gravity**, and stored energy.
> Verify whether **zero-energy try/test verification** was performed.

`nonApplicabilityQuestions`:

> Was employee exposure controlled by effective alternative guarding during normal production?
> **Was the equipment fully de-energized and verified before employee exposure?**

## The five distinctions Phase 3 requires, resolved against that corpus

**1. A requirement that a guard exist during normal operation.**
Present, as 1910.212's `standardIntent`. Note its trigger vocabulary is motion-bound —
"point of operation, ingoing nip points, rotating parts, flying chips, sparks… hazardous machine
motions." Its `applicabilityTriggers` include `employee access to moving parts`. The corpus
frames guarding as protection against *motion*, not against the mere geometric absence of a
cover.

**2. A requirement that guards be restored before equipment returns to service.**
**This concept is NOT explicitly carried in either quarantined record.** The 1910.147 record
names isolation, devices, bleeding, restraint and verification, but its `evidenceNeeded` and
`standardIntent` stop at *"verification before work proceeds"* — the release/restoration phase is
not enumerated. This adjudication therefore treats guard reinstatement-before-re-energization as
a **real professional obligation that the repository's governed corpus does not currently
represent.** That gap is recorded as an outcome of this phase (see PHASE7/8), not papered over.
It is also why the obligation cannot be cited to a customer today even if the product wanted to
raise it.

**3. A servicing state where hazardous energy is controlled under LOTO.**
Squarely represented. R6 satisfies every element the 1910.147 record enumerates: energy sources
addressed, isolation device applied, stored energy bled, **zero-energy verification performed**.
It additionally satisfies the record's own non-applicability test — *"Was the equipment fully
de-energized and verified before employee exposure?"* — **affirmatively**, and does so with a
second-person verification the record does not even require.

**4. A current violation/hazard during that servicing state.**
The corpus supplies the test and the observation fails it. 1910.212's non-applicability question
asks whether *employee contact is not reasonably possible*; with motion foreclosed by a verified
zero-energy state, contact with a stationary point of operation is not the hazard 1910.212's
intent describes. And 1910.212's *other* non-applicability question — *"is the task service or
maintenance where lockout/tagout may be the more specific controlling standard?"* — resolves to
**yes** on R6, which is the corpus's own way of saying the guarding standard is displaced here.

This is the exact doctrine the deterministic engine implements in code
(`notApplicable = guardPresent || energySafe`, PHASE2 Source 1). **The regulatory concept and
the shipped predicate agree.**

**5. A future prerequisite for safe re-energization.**
Real, and correctly located *after* this observation. Guard reinstatement is a precondition on a
transition the observation never states is contemplated.

## The two cautions this phase was instructed to hold, held

> *Do not treat a future restoration requirement automatically as proof of a current
> machine-guarding hazard.*

Respected. The restoration obligation is classified as a future prerequisite, and the
classification is argued from the corpus's motion-bound framing of guarding, not assumed.

> *Conversely, do not assume LOTO automatically makes every missing-guard condition
> non-hazardous.*

Respected, and this is where the analysis does real work rather than rubber-stamping. LOTO does
**not** neutralise a missing guard in general. It neutralises it **only** when the isolation is
complete and verified — which is why `V1` (not verified), `V2` (accumulator charged), `V3` (no
lock or tag), `V4` (second source live), `V5` (merely stopped), `V6` (auto-restart capable) all
retain required recall in the frozen corpus, and why `V7` (worker's hands in the point of
operation) requires a `machine_guarding` candidate **despite** a verified isolation. The rule
being confirmed is narrow: *verified* zero-energy state, *plus no stated current exposure*.

## One genuine residual ambiguity, recorded rather than argued away

The observation says *"locked out with **the supervisor tag** applied."* The 1910.147 record's
`evidenceNeeded` calls for identifying *"affected and authorized employees involved,"* and the
observation does not establish whether the servicing employee's **own** isolating device is
applied or whether the supervisor's is the only one. Personal-device ownership is a real
lockout-adequacy question and it is genuinely unstated (fact **U5**).

Three points keep this from rescuing the hosted behaviour:

1. It is a **`lockout_tagout`** question. It does nothing for a `machine_guarding` candidate,
   which is what all nine reps actually filed.
2. The text does say *"locked out"* — a lockout occurred; only the device's owner is
   underdetermined — and a second worker independently verified the isolation.
3. Only **one** of nine hosted reps raised it at all (v5 rep 2), and §112 scored that rep a
   defect on different grounds.

It is recorded here as a real, minor imperfection in the fixture's "everything is stated" claim
— an argument the model did not make — and it is carried forward as a corpus note, not as a
reason to revise the oracle. See PHASE7/8.
