# Phase 2 — Does existing product semantics already determine the R6 answer?

**Verdict: YES, and from four independent surfaces, three of which predate the Expert
programme entirely.** The R6 expectation was NOT introduced primarily for this test sequence.

This was the question most likely to overturn the oracle — §114.8 explicitly flagged that "the
expectation was written before any hosted evidence existed," which invites the reading that it
was written *for* the Expert tests. That reading is false, and the evidence is mechanical.

---

## Source 1 — the deterministic engine already answers this, in production code

`backend/src/safescope-v2/evidence/evidence-foundation.ts`, lines 220–231:

```ts
if (giGate && has(e, 'guardState')) {
  const guardPresent = has(e, 'guardState', 'present_and_effective');
  const energyUnsafe = has(e, 'energyState', 'energized_or_operating');
  const energySafe   = has(e, 'energyIsolationState', 'isolated_and_verified')
                    || has(e, 'energyState', 'deenergized');
  output.push(decision(e, '29 CFR 1910.212(a)(1)', 'OSHA General Industry machine guarding', [
    ['general-industry jurisdiction', giJur, ids(e, 'jurisdiction')],
    ['machine guard condition', guardPresent ? false : true, ids(e, 'guardState')],
    ['moving or accessible energy', energyUnsafe ? true : energySafe ? false : undefined, …],
    ['current condition', current, ids(e, 'currentHazardState')],
  ], guardPresent || energySafe));      // <-- the `notApplicable` argument
}
```

The fourth argument to `decision()` is `notApplicable`. Per `decision()` (lines 48–77), when it
is true the decision's `status` becomes `NOT_APPLICABLE` at `confidence: 0.96`, with the
explanation *"The submitted evidence establishes an exception or a condition below this
family's material threshold."*

So the rule reads, in plain terms: **a machine guard that is absent does not raise 1910.212 when
energy is isolated-and-verified or de-energized.** That is exactly the R6 configuration.

### Measured, not inferred

Running the real extractor on the exact R6 sentence (zero cost, read-only,
`buildEvidenceFacts` from `evidence/shared-evidence-facts.ts`, scope `osha_general_industry`):

```
===== R6
    energyIsolationState = isolated_and_verified
    guardState           = absent_or_ineffective
```

Substituting into the predicate above: `guardPresent = false`, `energySafe = true`, therefore
`notApplicable = false || true = true` → **29 CFR 1910.212(a)(1) resolves to `NOT_APPLICABLE`
at 0.96 confidence on this exact observation.**

### Provenance

`git log -L 220,231` on that block returns `6a593fd2` (2026-08-18, *"Add inspection regulatory
context, professional report layout, and safety-semantic control reasoning"*) and `8d91109b`
(2026-08-17). The Expert routing fixtures were introduced in `37a5d1b5` (2026-08-29).
**The doctrine predates the fixture by eleven days and lives on the customer-authoritative
deterministic path, not in an Expert test.**

---

## Source 2 — a protected golden scenario asserts the same displacement, from the other side

`backend/src/safescope-v2/tests/golden-hardening-tests.ts`, scenario 7 — named, in the test data
itself, **"LOTO energized maintenance (Not Guarding alone)"**:

```
text:  "Maintenance performed without lockout and stored energy not released on
        electrically-powered equipment while mechanic clears a jam on the running
        conveyor tail pulley."
expectedClassification: "Lockout / Stored Energy"
```

This is R6's mirror image: servicing, guard-relevant machine access, energy **not** controlled.
The protected expectation is that the controlling family is **lockout/tagout**, explicitly
*"not guarding alone."* The product has held, as a named golden expectation, that where
servicing and energy control are both in play the energy-control family is the controlling one.
R6 applies the same doctrine to the case where that control **succeeded**.

---

## Source 3 — the Expert fixture corpus already encodes the boundary as a contrast pair

R6 is not a lone assertion. The frozen corpus contains its deliberate opposite:

| fixture | observation | expectation |
|---|---|---|
| `R6` | locked out, tagged, bled down, **verified at zero**, second-person verified, guard removed | candidates **FORBIDDEN** |
| `V7` | locked out, tagged, verified at zero, guard removed, **"and a technician is currently reaching into the point of operation with both hands to clear debris"** | candidates **REQUIRED** (`machine_guarding`) |

`V7` holds *every* R6 control constant and adds exactly one fact: a person actually at the point
of operation. The corpus therefore already states the product's rule with precision:

> Guard off + verified LOTO = no current machine-guarding candidate.
> Guard off + verified LOTO + **a stated current exposure** = a required machine-guarding
> candidate.

That is a coherent, discriminating semantic boundary, not a blanket suppression of the
`machine_guarding` family. `V6` (auto-restart capable → `machine_guarding`, recall required)
makes the same point from the energy-control side: the corpus requires `machine_guarding` recall
whenever the observation supplies a live pathway to motion.

`R3` (`'A millwright had the conveyor drive guard off and was working on the take-up pulley.'`)
is the third leg: same physical guard-off condition, **no** isolation stated, and the fixture
carries a deterministic `machine_guarding` / `ACTIVE` / life-critical finding whose required
action is *"restore the drive guard."* The product does not under-call guarding. It calls it
where motion is possible.

---

## Source 4 — the governed knowledge corpus states the displacement as an applicability test

See `PHASE3-GOVERNED-STANDARD-ANALYSIS.md`. In short: the repository's own 1910.212 record lists,
as a `nonApplicabilityQuestion`, *"Is the task service or maintenance where lockout/tagout may be
the more specific controlling standard?"*

---

## The architectural finding this phase also surfaced

**Expert was never shown the determination that answers the question it was asked.**

The R6 input's `deterministicFindings` carries exactly one entry — `lockout_tagout` /
`CONTROLLED`. It does **not** carry the `29 CFR 1910.212(a)(1)` → `NOT_APPLICABLE` decision that
the real engine produces on this sentence. `governedStandards` is `[]`.

Meanwhile prompt v6 instruction 1 reads:

> **1. PLAUSIBLE HAZARDS -> expertHazardCandidates**
> Any hazard you think may be present that is **NOT already in the deterministic findings above.**
> Include it even if you are unsure — set confidence LOW and requiresUserConfirmation true.

From the model's vantage point, `machine_guarding` **is** absent from the deterministic set it
was shown, and instruction 1 tells it to raise absent hazards it is unsure about, at LOW
confidence, with `requiresUserConfirmation: true`. All nine hosted responses set
`requiresUserConfirmation: true` and `relationshipToDeterministic: ADDITIONAL_TO_DETERMINISTIC`.

The model is, in substantial part, **complying with instruction 1 on an incomplete input** —
not merely defying the two sections written to stop it. Three prompt generations have tried to
instruct around a missing input rather than supply it.

Note also: `grep -rn "DeterministicFindingView" src/` returns only the type declaration and its
use inside `ExpertAnalysisInput`. **No production projection from the deterministic result into
the Expert input exists yet** — every `deterministicFindings` array in the repository is
hand-written in a fixture. The projection is still an open design decision, which is precisely
why this finding is actionable rather than a defect report.
