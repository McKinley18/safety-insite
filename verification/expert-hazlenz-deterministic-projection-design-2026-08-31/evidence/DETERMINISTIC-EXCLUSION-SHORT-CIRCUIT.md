# A pre-existing production defect this phase uncovered — reported, NOT repaired

**Classification: `DETERMINISTIC_MACHINE_GUARDING_EXCLUSION_SHORT_CIRCUIT`.**
Pre-existing, independent of the Expert programme, on a **customer-authoritative** surface.
**Not repaired here** — repairing `evidence-foundation.ts` is outside this operation's scope, needs
its own authorization and its own safety analysis. It is documented because it materially shaped
the projection design and because it is the more important of the two findings.

## The mechanism

`evidence-foundation.ts:220-231`:

```ts
const guardPresent = has(e, 'guardState', 'present_and_effective');
const energyUnsafe = has(e, 'energyState', 'energized_or_operating');
const energySafe   = has(e, 'energyIsolationState', 'isolated_and_verified')
                  || has(e, 'energyState', 'deenergized');
output.push(decision(e, '29 CFR 1910.212(a)(1)', '…machine guarding', [
  ['general-industry jurisdiction', giJur, …],
  ['machine guard condition', guardPresent ? false : true, …],
  ['moving or accessible energy', energyUnsafe ? true : energySafe ? false : undefined, …],
  ['current condition', current, …],
], guardPresent || energySafe));            // <-- notApplicable
```

and `decision()` (line 58):

```ts
const status = notApplicable ? 'NOT_APPLICABLE'
  : contradictoryEvidence.length ? 'CONTRADICTED'
  : missingPredicates.length ? 'UNKNOWN' : 'SUPPORTED';
```

`notApplicable` **short-circuits before the predicate statuses are consulted.** Two consequences:

1. `energySafe` is a pure OR. Once `energyIsolationState = isolated_and_verified` is extracted
   *anywhere* in the text, machine guarding is excluded at confidence **0.96** regardless of every
   other fact — a live second energy source, a charged accumulator, a running machine, or a worker
   with both hands in the point of operation.
2. The emitted decision can **contradict its own predicate list**.

## Measured, on the corpus's own frozen adversarial fixtures

Run via the real `applyEvidenceFoundation`, zero cost, read-only.

| fixture | what the observation states | machine-guarding decision | correct? |
|---|---|---|---|
| `R6` | verified zero-energy isolation, guard off | `NOT_APPLICABLE` 0.96 | **yes** |
| `V2` | accumulator **left charged, not bled down** | `NOT_APPLICABLE` 0.96 | **NO** |
| `V4` | second pneumatic circuit **connected to live shop air** | `NOT_APPLICABLE` 0.96 | **NO** |
| `V7` | **"a technician is currently reaching into the point of operation with both hands"** | `NOT_APPLICABLE` 0.96 | **NO** |
| `R6-I` | **"the press is now running production parts with the guard still off"** | `NOT_APPLICABLE` 0.96 | **NO** |
| `V5` | merely stopped, no LOTO | `UNKNOWN` 0.45 | yes |

### `V4` is the starkest — an internally contradictory decision

```
status = NOT_APPLICABLE, confidence 0.96
  general-industry jurisdiction = SUPPORTED
  machine guard condition       = SUPPORTED
  moving or accessible energy   = SUPPORTED     <-- the hazard IS present, per the decision itself
  current condition             = SUPPORTED
```

Every required predicate is `SUPPORTED` — the decision's own evidence says the guarding hazard
applies — and the status still reads `NOT_APPLICABLE`, because `energySafe` was true and
short-circuited. (`energyUnsafe` is *also* true here, which is why the predicate reads `SUPPORTED`;
it simply has no influence on `notApplicable`.)

### `R6-I` additionally contradicts its own currency predicate

```
status = NOT_APPLICABLE, confidence 0.96
  moving or accessible energy = CONTRADICTED
  current condition           = CONTRADICTED
```

The extractor read *"had been locked out earlier"* as `isolated_and_verified` and did not register
that *"the lock and tag have since been removed and the press is now running."*

## Why this is reported and not repaired here

- `evidence-foundation.ts` is **customer-authoritative** and this operation's terms require proving
  no production/customer behaviour changed.
- The correct fix is not obvious and is not a one-line change: `energySafe` needs to stop being an
  unconditional exclusion, which touches `1910.212` applicability for every observation, and the
  golden/precision/recall suites would all need to be re-baselined under a separate authorization.
- §115/D-127 confirmed the `R6` oracle partly *on* this predicate. The predicate is **right for
  R6** and wrong for the degraded variants; the defect is its unconditionality, not its existence.
  Any repair must preserve the `R6` result while fixing `V2`/`V4`/`V7`/`R6-I`.

## How it changed this phase's design

Projecting these determinations verbatim would have told Expert that machine guarding is excluded
at 0.96 on an observation where a technician's hands are in the machine. Run 1 measured exactly that
risk materialising once, on `V4`: the `machine_guarding` candidate present 3/3 in the baseline arm
disappeared 3/3 under projection.

The response was a **projection-side guard**, not an engine change
(`isExclusionPredicateJustified`): an exclusion is projectable only when at least one required
predicate is actually `CONTRADICTED`. `V4`'s all-`SUPPORTED` exclusion is therefore withheld and
Expert sees exactly what it sees today; `R6`'s `moving or accessible energy = CONTRADICTED` is
projected as before.

This turned the anti-rubber-stamp controls from *constructed* into *real*: the "deliberately
incomplete deterministic view" that Phase 7 asked for did not need to be invented, because the
production engine emits one on four of the corpus's own fixtures.

## Recommended follow-up (not authorized here)

A separate, own-authorization phase to adjudicate whether
`notApplicable = guardPresent || energySafe` should become conditional — at minimum requiring that
no required predicate be `SUPPORTED`-for-hazard, and that `energyState = energized_or_operating`
defeat `energySafe`. It must preserve the `R6` result that §115/D-127 confirmed. Until then the
projection guard is the containment, and it lives in the prototype, not in production.
