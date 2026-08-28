# Expert HazLenz readiness — reassessment after actionable-coverage closure

`ARCHITECTURE ONLY. NO PROVIDER CALL WAS IMPLEMENTED OR MADE IN THIS PHASE.`

```
EXPERT_HAZLENZ_IMPLEMENTED        = FALSE
PROVIDER_CALL_IMPLEMENTED         = FALSE
PROVIDER_CALLS_MADE               = 0
LEVEL_1_AUTHORITY                 = DETERMINISTIC
AUTHORIZATION_REQUIRED_TO_PROCEED = TRUE
```

The §1 invariant and §3 attribution requirements of
`../insite-v1-hazlenz-precision-2026-08-27/EXPERT_HAZLENZ_READINESS_CONTRACT.md`
stand unchanged and are restated here by reference. Only the readiness state is
reassessed.

## 1. The deterministic safety-floor preconditions

The account owner's required state, measured on the bounded evidence:

| requirement | measured |
|---|---|
| required hazard recognition = 43/43 | **43/43** |
| life-critical recognition = 35/35 | **35/35** |
| actionable required-hazard coverage = 43/43 | **43/43** |
| actionable life-critical coverage = 35/35 | **35/35** |
| Population A precision = 100 % | **100.0 %**, 0 forbidden emissions, 0 required omissions |
| no known new regression | **none** — 34/34 core suites, four pre-existing failures byte-identical, three previously-unverifiable gauntlets now executed with identical failure sets |
| no known life-critical finding-materialisation gap | **none** — the two life-critical `RECOGNIZED_BUT_NOT_ACTIONABLE` groups (B-05 `compressed_gas`, B-20 `suspended_loads`) now materialise as findings and were carried through review, corrective action, completion and the report PDF |

**The precondition set is met on this evidence.** What that sentence is worth is
bounded by §3.

## 2. Blocker status

| # | blocker | status |
|---|---|---|
| 1 | **Provider authority governance** — no rule defines when, if ever, Expert output may override, reorder or suppress a Level-1 output | **OPEN.** Policy decision; belongs to the account owner. Until written and governed, Expert output is strictly additive and advisory. |
| 2 | **Attribution schema** — persistence columns and DTO fields for Expert provenance, Expert confidence and Expert-sourced standards | **OPEN.** Not designed; no migration exists. |
| 3 | **Fallback proof** — a test showing a provider timeout, refusal or malformed response yields byte-identical Level-1 output | **OPEN.** Must exist before the first provider call ships. |
| 4 | **Level-1 invariance harness** — assert that enabling Expert HazLenz changes no deterministic family for any corpus row | **OPEN, and its target is now larger and better defined.** Four protected gates exist (`test:hazlenz-precision`, `test:hazlenz-level1-recall`, `test:hazlenz-actionable-coverage`, all inside `test:hazlenz-core`, plus `verify:hazlenz-actionable-workflow`). The invariance assertion itself is still unwritten. |
| 5 | **Cost, latency and offline behaviour** — InSite ships offline field readiness; per-classify cost ceiling undecided | **OPEN.** Product decision. |
| 6 | **Credentials and provider selection** | **OPEN.** No provider configured, no key present. External authorisation; belongs to the account owner. |
| 7 | **Deterministic recall gaps** | **RESOLVED (2026-08-28, recognition phase), and now extended to materialisation:** recognition 43/43 and actionable coverage 43/43. |

**Six of seven blockers remain open. Expert HazLenz implementation is not
authorised.**

## 3. What "the floor is complete" does and does not mean

It means a remote provider is not establishing the minimum safety floor on this
corpus, and — new in this phase — that the floor reaches the customer as
findings they can act on, not merely as labels in an analysis header.

It does **not** mean the deterministic engine is complete:

* **26 of 43 actionable groups carry no standard on their finding.** The
  finding-scoped applicability rule set covers about twelve families and can
  emit thirty citations; hot work, fire/explosion, compressed gas, confined
  space, PPE, respiratory protection, material handling, environmental release
  and ventilation have no rule at all. A hazard the customer can see, explain,
  score and correct but for which the product names no regulation is a real gap
  in the regulatory picture, and it is the most obvious next deterministic
  workstream.
* **The DB-backed standards corpus is empty** in both the development and the
  disposable database, so the analysis-level standards path is unproven.
* **Single-winner routing and control-noun negation persist** in the taxonomy
  router. Every repair across the last three phases has been a family-specific
  preservation block compensating for them, so coverage is uneven by
  construction and each new family costs another block.
* **The evidence is bounded** by 56 corpus rows, an 8-row probe family and 6
  workflow cases, all authored by this process rather than drawn from field
  data. New wording will find new gaps.

## 4. Additional requirements this phase adds for Expert HazLenz

1. **Actionable-coverage invariance.** The Expert invariance harness must assert
   coverage, not only recognition: with Expert enabled, the same 43 required
   groups must still materialise as deterministic findings, and W-05/W-06 (a
   negated observation and a verified MCC isolation) must still materialise
   none. An Expert layer that starts creating findings on a verified lockout is
   a worse failure than one that creates too few.
2. **Expert output must never be a finding's only route to existence.** Customer
   findings are materialised from `multiHazardDecomposition.hazards`. If Expert
   contributions are ever allowed into that collection, they must be separately
   attributed at the data layer and must be removable without reducing
   deterministic coverage below 43/43 — otherwise the floor silently becomes
   provider-dependent, which is the exact failure the invariant forbids.
3. **Expert must not be positioned as the answer to the standards gap in §3.**
   A provider writing citations the deterministic rule set cannot justify would
   produce authoritative-looking regulatory claims with no governed basis. That
   gap is deterministic work.
