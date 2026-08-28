# Root-cause trace — Population A failures on the unmodified engine

Captured 2026-08-27 against the pristine `HEAD` (`d67d6456`) decomposition
service, SHA-256 `f94ebe07420926bd7bd57b64126a16b285e24121b0981067a963b0d481f6f79e`,
before any source change. Each entry shows the emitted family, the routing
confidence, the exact fragment it was derived from, the signals it matched, and
the independent re-route of that fragment through
`HazardTaxonomyCoverageService.route()`.

Format: `case → emitted family → triggering rule → evidence used → why invalid`.

---

## Mechanism 1 — bare taxonomy entity-word promotion

`HazardTaxonomyCoverageService.route()` scores one bare substring hit as `1`
(confidence `0.2`) and two as `2` (confidence `0.4`), and `decompose()` promoted
**any** route whose `domainId !== 'unknown'` into a finding. At that confidence
the route rests entirely on entity-word coincidence and carries no evidence that
the family's hazard is present.

```
A-01  material_handling            conf=0.2  mech="material"
      fragment  "material was being fed"
      signals   ["material"]
      re-route  material_handling conf=0.2 matched=["material"]

A-01  walking_working_surfaces     conf=0.2  mech="walkway"
      fragment  "the walkway passes within about two feet of the exposed pinch point"
      signals   ["walkway"]
      re-route  walking_working_surfaces conf=0.2 matched=["walkway"]

A-05  material_handling            conf=0.2  fragment "the operator continued feeding material into the machine"
A-06  material_handling            conf=0.2  fragment "material moved along the flight"
A-07  material_handling            conf=0.2  fragment "material was being fed from the infeed table"
A-31  material_handling            conf=0.2  mech="aisle"
      fragment  "directly beside the main aisle where employees pass"

A-12  walking_working_surfaces     conf=0.2  mech="walkway"
      fragment  "A concrete jersey barrier separated the visitor parking area from the office walkway"
A-30  walking_working_surfaces     conf=0.2  mech="walkway"
      fragment  "the walkway passes within two feet of it"

A-13  mobile_equipment             conf=0.2  mech="forklift"
      fragment  "The fire extinguisher bracket in the forklift charging room was empty"
A-15  mobile_equipment             conf=0.2  mech="loader"
      fragment  "A first-aid kit was missing from the loader operator's break trailer"

A-24  machine_guarding             conf=0.2  mech="guard"
      fragment  "The grinding wheel guard on the pedestal grinder was correctly fitted"

A-26  excavation_trenching         conf=0.2  mech="trench"
      fragment  "The trench that was excavated last autumn has been fully backfilled"

A-27  walking_working_surfaces     conf=0.4  mech="floor"  signals ["floor","opening"]
      fragment  "The floor opening at the mezzanine was fitted with a hinged cover that was closed"

A-28  fall_protection              conf=0.2  mech="fall"
      fragment  "Autumn leaf fall around the yard drains is cleared every week under the housekeeping schedule"
A-29  fall_protection              conf=0.4  mech="handrail"  signals ["handrail","stairway"]
      fragment  "The stairway handrail was continuous"
```

**Why invalid.** Every one of these fragments is either (a) a clause the
inspector wrote to establish energy state, material state, exposure or proximity
*for a different hazard*, (b) a location or role descriptor, (c) an unrelated
sense of an ordinary English word, or (d) an affirmative statement that the
condition is sound. None carries evidence independently sufficient for the
family it was routed to.

**Why the engine had no defence.** The file already carried family-relative
false-current guards at `route.confidence <= 0.4` for roughly twelve families
(`compressed_gas`, `confined_space`, `emergency_egress`,
`respiratory_protection`, `fall_protection` for the guardrail-effective case,
`mobile_equipment` for the bare-pedestrian case, `silica_respirable_dust`,
`machine_guarding` for the unconfirmed case, `electrical`,
`environmental_spill`, `rigging_lifting`, `hazcom`). The defective families
simply had none. This is not a new class of problem; it is an incomplete
application of a pattern the engine already accepts.

## Mechanism 2 — invalid lexical alias `shield(?:ing)?` (the most damaging)

`multi-hazard-decomposition.service.ts`, the excavation preservation block,
emitting at **confidence 0.85** and bypassing the router entirely.

```
A-02  excavation_trenching  conf=0.85  signals ["direct excavation or trench evidence"]
      fragment  "A grinder operator was not wearing a face shield"
      re-route  unknown conf=0

A-03  excavation_trenching  conf=0.85
      fragment  "The welder was not using a welding shield"
      re-route  hot_work conf=0.2 matched=["welder"]

A-04  excavation_trenching  conf=0.85
      fragment  "A splash shield was missing from the parts washer"
      re-route  unknown conf=0

A-09  excavation_trenching  conf=0.85
      fragment  "The arc-flash shield on the 480-volt panel door was missing"
      re-route  electrical conf=0.2 matched=["panel"]

A-10  excavation_trenching  conf=0.85
      fragment  "The heat shield over the exhaust manifold on the standby generator was missing"
      re-route  unknown conf=0

A-11  excavation_trenching  conf=0.85
      fragment  "Operators were shielding their eyes from the low sun at the scale house window"
      re-route  ppe conf=0.2 matched=["eye"]
```

**Why invalid.** The alias was intended for a *trench shield* (trench box), a
protective system. In field language a bare "shield" is almost never that: it is
a face shield, welding shield, splash shield, arc-flash shield or heat shield —
PPE, machine or thermal guarding — and "shielding" is ordinarily a verb. The
alias also inverted the confidence ordering: a genuine unshored trench with a
spoil pile at the edge scored **0.60**, while all six of these false positives
scored **0.85**.

## Mechanism 3 — `explicitPoweredTruck` fires on a location word

```
A-13  powered_industrial_trucks  conf=0.65  mech="struck_by"
      signals   ["explicit powered industrial truck evidence"]
      fragment  "The fire extinguisher bracket in the forklift charging room was empty"
```

**Why invalid.** The gate was `/(powered industrial truck|forklift)/` anywhere in
the observation, minus a short parked/stored exclusion. "The forklift charging
room" is an attributive place name; no truck is operating, moving or defective.
The row's real deficiency is an empty extinguisher bracket.

## Mechanism 4 — hot-work verb form matches idiomatic English

```
A-23  hot_work  conf=0.4  signals ["active hot-work operation"]
      fragment  "Employees were cutting their lunch break short in order to attend the toolbox talk."
      re-route  unknown conf=0
```

**Why invalid.** `grindCutActivity`'s verb-form alternative,
`(is|was|were|are|while|during|…)\s+(?:\w+\s+){0,2}(grinding|cutting)`, matched
"were cutting". The object is an abstract noun phrase; nothing physical is being
cut and no thermal source exists.

**Note on the first attempted fix.** Requiring a named workpiece was measured and
**rejected**: it suppressed a genuine `hot_work` emission on "grinding nearby" in
the protected `validate-safescope-multi-hazard-decomposition-v1` case. Sparks do
not depend on the inspector naming the material. The accepted fix excludes only
the idiomatic object.

## Mechanism 5 — fall/opening "effectively covered" exclusion too narrow

```
A-27  fall_protection  conf=0.8  signals ["direct fall or opening evidence"]
      fragment  "The floor opening at the mezzanine was fitted with a hinged cover that was closed"
```

**Why invalid.** The block's safe-state exclusion matched only the participle
`covered` within 40 characters of the opening word. Ordinary field phrasing —
"fitted with a hinged cover that was closed" — uses the noun and sits further
away, so a protected opening read as an active fall exposure.

---

## Summary

Ten defective behaviours, five mechanisms, and one dominant cause: promotion of
a route that possesses no evidence independently sufficient for its family. The
`shield` alias is the single worst offender because it is both wrong and highly
confident. Everything else is the absence of an evidence-independence predicate
that the engine already applies to a dozen other families.
