# Root-cause traces — deterministic Level-1 recall omissions

Every entry below was established by executing the engine and reading the
route/predicate decision that actually fired, not by inferring a cause from the
output. Fragment lists are the real output of `decompose()`'s splitter
(`/[.;,!]|\band\b|\balso\b|\bwhile\b/i`).

---

## 1. B-15 / HE-01 — MCC bucket, disconnect closed, no lock

> An electrician opened the motor control centre bucket and began replacing the
> starter while the upstream disconnect remained closed and no lock had been
> applied, exposing live 480-volt terminals.

Traced router result, per fragment:

```
[0] "An electrician opened the motor control centre bucket"  -> unknown @0
[1] "began replacing the starter"                            -> unknown @0
[2] "the upstream disconnect remained closed"                -> unknown @0
[3] "no lock had been applied"                               -> unknown @0
[4] "exposing live 480-volt terminals"                       -> unknown @0
DECOMPOSED: []
```

### 1a. `electrical` — finding-local preservation block, source vocabulary

The block exists and its three conditions were all satisfiable by fragment [4]:
an electrical source, an energized/live state (`live`), and an exposure defect
(`exposing`). It did not fire because the source alternation reads

```
/\b(?:panel|junction\s+box|disconnect|conductors?|terminal|wiring|wires?|cable|bus|electrical)\b/i
```

`conductors?`, `wires?` are pluralised; `terminal` is not. Against
`terminals` the trailing `\b` fails on the `s`. Field notes use the plural at
least as often as the singular.

**Correction:** `terminal` → `terminals?`. Nothing else in the block changed.

### 1b. `lockout_tagout` — cross-clause detector, servicing vocabulary

`crossClauseLoto` requires three predicates. Two were already true:

* `crossClauseEnergy` — true (`disconnect`);
* `crossClauseUncontrolledEnergy` — true, via `lotoControlAbsent("… no lock had
  been applied …")` matching `LOTO_CONTROL_ABSENT_BARE`;
* `crossClauseIntervention` — **false**. Its alternation was
  `servic*|maint*|repair*|interven*|clear*|unjam*|reach* into|disconnect* (a)
  hydraulic|pneumatic|work* beneath|under`. "began **replacing** the starter"
  matches none of them.

Component replacement is servicing under any hazardous-energy-control rule.

**Correction:** add `replac\w*`, `install\w*` and the ordinary field phrasing
`(?:began|started|performing) … work`. This predicate only *opens* the detector;
the energy source and the uncontrolled-energy evidence are still both required,
so it cannot manufacture a finding on its own.

---

## 2. HE-05 — disconnect open, absence of voltage never established

> The disconnect was opened but absence of voltage was not verified before the
> electrician began work inside the starter enclosure.

`crossClauseUncontrolledEnergy` already recognises
`zero-energy was not verified` and `verification was never completed`, but not
the standard electrical form. The omitted verification *is* the deficiency.

**Correction:** add
`absence\s+of\s+voltage\s+(?:was|had)?\s*(?:not|never)\s+(?:been\s+)?(?:verified|tested|checked|confirmed|established)`.

Its safe counterpart HE-02 ("his personal lock was applied and absence of
voltage **was verified**") does not match the new alternative and emits nothing,
which was confirmed by measurement.

---

## 3. B-18 — mixer vessel entry, agitator "energized and unlocked"

```
[0] "A maintenance technician entered the mixer vessel through the top hatch to scrape residue" -> confined_space @0.2 ["vessel"]
[1] "the agitator drive remained energized" -> unknown @0
[2] "unlocked"                              -> unknown @0
[3] "no atmospheric test had been performed before entry" -> unknown @0
```

`crossClauseIntervention` (true, `maintenance`) and `crossClauseEnergy` (true,
`energized`) were both satisfied. `crossClauseUncontrolledEnergy` was false:
`LOTO_CONTROL_ABSENT_BARE` covers `without a lock`, `not locked`, `no lock`, but
not the adjectival `unlocked`, which says exactly the same thing.

**Correction:** add `un-?locked\b`. Every caller of `lotoControlAbsent()` also
requires a servicing verb and a hazardous-energy source in the same scope, so an
ordinary unlocked door or cabinet cannot reach a LOTO finding through it.

---

## 4. B-10 — hydraulic press, ram raised, pressure retained

```
[0] "The hydraulic press was left with the ram raised" -> unknown @0
[1] "pressure retained in the cylinder"                -> compressed_gas @0.2 ["cylinder"]
[2] "a fitter worked beneath it"                       -> unknown @0
[3] "the light curtain guarding the point of operation had been bypassed with a jumper wire" -> machine_guarding @0.2 ["guard"]
```

`addHydraulicEnergyFinding` found its energy source (`pressure`, `cylinder`) but
not its hazardous-energy evidence: the alternation carries
`retain(?:s|ed)?\s+pressure` and `pressure\s+remain(?:s|ed)?` — the active and
the "remains" forms — but not the inverted passive `pressure retained`, which is
how the observation is actually written. The same gap made
`fullHydraulicEnergy` false over the whole text.

**Correction:** add `pressure\s+(?:is|was|been)?\s*retained` at both sites.
A-20 ("isolated, bled to zero and verified") still returns early on its
safe-state predicate, which was confirmed by measurement.

---

## 5. B-19 — welding inside a fuel tank

```
[0] "A contractor was welding inside the empty fuel tank through the manway with no entry permit" -> confined_space @0.2 ["tank"]
[1] "no attendant"                     -> unknown @0
[2] "no ventilation"                   -> unknown @0
[3] "no fire watch was posted outside" -> unknown @0
```

Two independent mechanisms conspired.

* **Single-winner routing.** Fragment [0] carries both the confined space and
  the weld. `HazardTaxonomyCoverageService.route()` returns one domain: `tank`
  scored for `confined_space`, and `confined_space` precedes `hot_work` in the
  coverage map, so on the tie the weld was discarded. (`fire watch` in fragment
  [3] was additionally suppressed by the router's negation window — "no fire
  watch" reads as a negated signal when it is in fact the hazard.)
* **The compensating cross-clause hot-work detector was blocked by its own
  exclusion.** `activeHotWork` requires
  `!/\b(?:discussed|reviewed|permit|selected|completed|canceled|cancelled|planned|scheduled)\b/`
  over the whole observation. The bare word `permit` matched **"no entry
  permit"** — a *confined-space* permit — and suppressed an active weld inside a
  fuel tank.

**Correction:** scope that exclusion to `hot[- ]?work\s+permit`. Its purpose —
keeping a permit *record* from reading as an active operation — is preserved:
A-21 ("The **hot work permit** for last month's welding … was closed out") is
still excluded, and A-22's explicit negation still routes through
`hotWorkNegated`.

---

## 6. B-13, B-16, A-02 — required protective equipment stated absent

```
B-13 [2] "neither was wearing a respirator despite a visible dust cloud in the breathing zone" -> silica_respirable_dust @0.2 ["dust"]
B-16 [0] "The pedestal grinder was operated with the tool rest missing" -> unknown @0
B-16 [2] "the operator wore no eye or face protection"                  -> unknown @0
```

Both the PPE block and the respirator block already exist and are correctly
structured (item + deficiency + task/exposure, with uncertainty, planned,
adequate and historical exclusions). Their **deficiency predicates** recognised
only two shapes:

* `without|required` … *item*; or
* *item* … `absent|missing|not (provided|worn|used|available)|damaged|defective`.

The ordinary field forms — "**wore no** eye or face protection", "**was not
wearing** a face shield", "**neither was wearing** a respirator" — match neither.
The PPE **item** vocabulary additionally spelled the pair as `eye(/face)
protection`, which cannot match the coordinated "eye **or** face protection".

For B-13 and B-16 the router had separately discarded `respirator` and `eye` as
negated signal (`neither`, `no`), which is the same control-noun negation defect
seen at B-19: for these families the missing control *is* the hazard.

**Correction:** add the negative-possession alternative
`\b(?:no|not|never|neither|nor|without)\b[^.]{0,45}\b<item>\b` to both deficiency
predicates; widen the PPE item to `(?:eye|face)(?:\s*(?:,|/|or|and)\s*(?:eye|face))?\s+protection`;
and add `operat(?:ed|ing)` to the PPE task/exposure context so "the pedestal
grinder **was operated**" counts as the task it plainly is. The A-row rows that
forbid `ppe` — A-11 "shielding their eyes from the low sun", A-24 "the grinding
wheel guard … was correctly fitted" — contain no protective-equipment item in an
absence construction and remain clean, which was confirmed by measurement.

---

## 7. B-07 — atmosphere never tested before entry

```
[2] "the atmosphere had not been tested for oxygen deficiency or hydrogen sulphide before entry" -> unknown @0
```

The coverage map gives `atmospheric_hazard` a single entity word, `gas`, and a
snake_case mechanism token `toxic_exposure` that can never match prose. Neither
`atmosphere`, `oxygen deficiency` nor `hydrogen sulphide` is a routable signal,
so no candidate was generated anywhere in the pipeline. There was no
compensating preservation block for this family.

**Correction:** a new preservation block requiring **both** a named atmospheric
hazard (atmosphere / atmospheric / oxygen / H2S / carbon monoxide / methane /
LEL / toxic or flammable gas / air quality) **and** an explicitly omitted
evaluation (`no|not|never|without` … `tested|monitored|sampled|measured|
evaluated|verified|checked|reading`, or `testing … not performed`), excluding a
tested atmosphere, an uncertain statement, and a historically corrected one. It
follows the file's existing preservation-block shape exactly.

---

## 8. HE-07 and HE-08 — precision defects the probe family exposed

These were **not** part of the eleven; the probe family found them, and they
were measured on the unmodified engine.

```
"The electrical safety training matrix"                                     -> electrical @0.2 ["electrical"]
"the annual lockout procedure audit were both current at the maintenance office" -> lockout_tagout @0.2 ["lockout"]
"A spare motor control centre bucket was stored on a shelf in the electrical room" -> electrical @0.2 ["electrical"]
```

This is the same defect class the 2026-08-27 precision phase repaired for six
other families: a single bare entity-word hit at confidence 0.2 promoted to an
ACTIVE finding. The existing `positiveElectrical` / `positiveEnergyControl`
gates did not stop it, because they too are satisfied by the mere presence of
the family's name.

**Correction:** extend the precision phase's own evidence-independence rule to
`electrical` and `lockout_tagout` at `route.confidence <= 0.4`. A weak route must
carry the family's own *condition* evidence — energized / live / exposed / bare /
open / missing / damaged / arc / shock / ungrounded / overloaded for electrical;
a control-absence, a hazardous-energy source, or a deficiency word for LOTO.
Routes that arrive with their own evidence (the electrical-exposure clause at
0.9, `positiveLotoMechanism` at 0.75, the cross-clause detector) are above this
confidence and are untouched — confirmed by measurement, since every previously
detected Population-B group survived.
