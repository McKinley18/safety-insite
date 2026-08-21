# KG-3F Phases 11–13 — rule-to-corpus inventory, and shadow invariance

## Phases 11–12 — the declared-but-unemitted inventory, recomputed

**KG-3E's "~30" was an undercount, because it sampled one file.** KG-3E derived its figure from
`standard-applicability.rules.ts` alone. Scanning **every** surface that declares a citation HazLenz
could emit gives a very different picture:

| Declaring surface | |
|---|---|
| `standard-applicability.rules.ts` | the expert rule table KG-3E sampled |
| `inspection-intelligence-expansion.rules.ts` | |
| `msha-inspection-intelligence.service.ts` | |
| `evidence-foundation.ts` | the finding-scoped engine (`decision(e, '…')`) |
| `safescope-v2.service.ts` | |

```
distinct citations          160
emitted by the gold set      23
emitted AND approved         23        (100%)
declared but NOT emitted    137
```

### Classification

| Class | Count |
|---|---|
| `NOT_SAFE_TO_GOVERN_YET` | **132** |
| `ALREADY_GOVERNED` | 25 |
| `VALID_RULE_NOT_EXERCISED` | 3 |

`NOT_SAFE_TO_GOVERN_YET` means: declared by a rule, no governed record, and no measured emission.
Sourcing 132 records speculatively would be exactly the "approve because a rule declares it" error
the brief forbids — a rule that no observation reaches gives no evidence about what its citation
should say. They are inventoried, not sourced.

`VALID_RULE_NOT_EXERCISED` (3) — `29 CFR 1926.95(a)`, `30 CFR 56.14105`, `30 CFR 57.14107(a)` — have
governed records but no gold-set observation selects them.

### Governance flags

| Flag | Count | Meaning |
|---|---|---|
| `ruleCitationWithNoGovernedRecord` | 132 | a rule declares it; the corpus has nothing |
| `declaredOnMultipleSurfaces` | 42 | the same citation is declared by 2+ selection surfaces — a duplication/consistency risk |
| `parentChildAmbiguity` | 39 | two declared citations share a section (e.g. `1910.28` with `(b)(1)`, `(b)(3)`, `(b)(11)`) |
| `governedRecordWithoutSource` | 3 | `1926.95(a)`, `56.14105`, `57.14107(a)` |

**One flag was a defect in the diagnostic itself and was fixed rather than reported.** The initial
run flagged `29 CFR 1910.212(a)(1)` as `governedRecordWithoutSource`, contradicting KG-3E, which
sourced it. Cause: `standards_master` stores some citations bare (`1910.212(a)(1)`) and others
prefixed (`29 CFR 1910.212(a)(1)`), and the lookup normalised punctuation but **not the agency
prefix**, so `29cfr1910212(a)(1)` never matched `1910212(a)(1)`. Fixed; the flag count went 4 → 3 and
the three remaining are genuine.

`42 declaredOnMultipleSurfaces` and `39 parentChildAmbiguity` are the substantive findings here:
citation selection is spread across five files with overlapping declarations, which is how
`56.14132(a)` came to be declared in four places at once.

Reproduce: `npm run report:kg3f-rule-to-corpus federal-core-2026-08-20.5`

---

## Phase 13 — governed shadow retrieval across physical layouts

Run against four of the nine adversarial layout databases — `original`, `citation_desc`,
`child_before_parent`, `random_seed_2` — chosen to span the extremes of heap ordering.

```
original             gold 30/31  wrongRegime=0  expectedGoverned=24/24  losingBacking=0  corpus 34->26
citation_desc        gold 30/31  wrongRegime=0  expectedGoverned=24/24  losingBacking=0  corpus 34->26
child_before_parent  gold 30/31  wrongRegime=0  expectedGoverned=24/24  losingBacking=0  corpus 34->26
random_seed_2        gold 30/31  wrongRegime=0  expectedGoverned=24/24  losingBacking=0  corpus 34->26
```

**Identical on every metric across every layout.** Hard acceptance criterion — *approved-only shadow
behaviour is deterministic* — is **met**. All 24 distinct expected citations remain governed and none
loses corpus backing under approved-only filtering.

### The 31/31 → 30/31 delta — diagnosed, and the most consequential judgment in this slice

One gold-set case changed:

```
MSHA-TRAFFIC-01
  observation        "A haul truck at the surface mine is backing without a functional
                      backup alarm and no spotter present."
  expected           ["56.14132"]
  returnedConfirmed  []          <-- was ["30 CFR 56.14132(a)"]
  gotForbidden       false
```

**This is a direct and intended consequence of the Phase 5–7 correction, not a retrieval defect.**

Previously the predicate hard-coded `'reverse warning required' = true`, so the decision was
`SUPPORTED` and `56.14132(a)` landed in `returnedConfirmed`, where it matched the expectation. Now
the obstructed-view trigger is evidence-borne; this observation does not state visibility, so the
decision is `UNKNOWN` — the section is surfaced as a **candidate with a named open question** rather
than as a confirmed violation.

The gold-set case expects a *confirmed* citation for an observation that does not establish the
statutory trigger, so the expectation encodes the same error the predicate did. **The gold set is
hash-verified and was not modified.**

The brief is explicit on the trade-off: *"HazLenz must not equate 'no backup alarm' with 'violation'
if the regulation permits alternatives"*, and *"Coverage percentage is subordinate to legal
correctness."* `56.14132(b)(1)(iv)` permits an observer, and `(b)(1)` applies only on an obstructed
rear view. Asserting a confirmed violation here would be asserting a rule whose trigger nobody
observed.

**This is flagged rather than absorbed**, because it is a measurable movement against a protected
baseline and the trade-off is a product judgment:

- **Keep** (current state): legally correct; one gold-set case now yields a clarification rather than
  a confirmed finding.
- **Revert**: restores 31/31 and re-introduces a citation that misstates which paragraph applies.

`test:kg3f-56-14132-predicate` proves the full matrix — `(b)(1)` **is** confirmed when an obstructed
view is stated, a clear view makes it `NOT_APPLICABLE`, and an observer satisfies it — so the
capability is present and only the unestablished case is withheld.
