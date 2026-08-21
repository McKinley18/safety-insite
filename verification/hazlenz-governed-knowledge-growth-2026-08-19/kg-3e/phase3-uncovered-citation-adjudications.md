# KG-3E Phase 3 — the seven emitted citations with no governed record

Each was adjudicated independently against the authoritative eCFR text retrieved for it
(title 29 and title 30, up-to-date-as-of **2026-08-18**), against the HazLenz predicate that
actually emits it, and against the granularity the predicate can support.

The governing rule applied throughout: **a citation may be backed only when the governed record
accurately supports the regulatory proposition HazLenz uses it for.** Six of the seven cleared it.
One did not, and creating content for it would have made the product worse, not better.

| # | Citation | Predicate source | Verdict |
|---|---|---|---|
| 1 | `29 CFR 1926.451(g)(1)` | CON-FALL-01, CROSS-01 | **SAFE_TO_ADD** — exact paragraph |
| 2 | `29 CFR 1926.652(a)(1)` | CON-EXC-01 | **SAFE_TO_ADD** — exact paragraph |
| 3 | `29 CFR 1910.28` | GI-WWS-01 | **SAFE_TO_ADD** — section level, truthfully labelled |
| 4 | `29 CFR 1910.95` | GI-NOISE-01 | **SAFE_TO_ADD** — section level |
| 5 | `29 CFR 1910.1200` | GI-HAZCOM-01 | **SAFE_TO_ADD** — section level |
| 6 | `29 CFR 1926.1153` | CON-SILICA-01 | **SAFE_TO_ADD** — section level |
| 7 | `30 CFR 56.14132(a)` | MSHA-TRAFFIC-01 | **CITATION_GRANULARITY_MISMATCH — content deliberately NOT created for the emitted citation** |

---

## 1. `29 CFR 1926.451(g)(1)` — SAFE_TO_ADD, exact paragraph

**Predicate** (CON-FALL-01): *"A mason is working on a scaffold platform 18 feet above the lower
level with an open side that has no guardrail or personal fall arrest system."*

**Source**: *"(g) Fall protection. (1) Each employee on a scaffold more than 10 feet (3.1 m) above a
lower level shall be protected from falling to that lower level."*

The predicate establishes every element the paragraph requires: construction regime, a scaffold, a
height (18 ft) that clears the *more than 10 feet* threshold, an employee on it, and the absence of
protection. The emitted granularity `(g)(1)` is the correct one — `(g)(1)(i)`–`(vii)` then prescribe
*which* system by scaffold type, and the observation does not establish scaffold type, so promoting
to a roman-numeral subparagraph would assert a fact the evidence does not carry. `(g)(1)` is exactly
what the evidence supports.

## 2. `29 CFR 1926.652(a)(1)` — SAFE_TO_ADD, exact paragraph

**Predicate** (CON-EXC-01): *"Laborers are working in a 6-foot trench with no protective system
installed and the soil is not stable rock."*

**Source**: *"(a)(1) Each employee in an excavation shall be protected from cave-ins by an adequate
protective system … except when: (i) Excavations are made entirely in stable rock; or (ii)
Excavations are less than 5 feet in depth and examination of the ground by a competent person
provides no indication of a potential cave-in."*

Unusually clean: the predicate negates **both** statutory exceptions explicitly — 6 feet clears the
5-foot exception, and "not stable rock" clears the other. This is the strongest evidence-to-rule fit
of the seven.

## 3. `29 CFR 1910.28` — SAFE_TO_ADD at section level

**Predicate** (GI-WWS-01): *"The handrail on the interior stairway is missing, exposing employees
descending the stairs to a fall hazard."*

**Source**: `1910.28(b)(11)(ii)` — *"Each flight of stairs having at least 3 treads and at least 4
risers is equipped with stair rail systems and handrails."*

The requirement exists and matches. But **the paragraph carries a qualifier the observation does not
establish**: at least 3 treads and at least 4 risers. HazLenz emits the *section*, and the section is
the honest granularity here — citing `(b)(11)(ii)` would assert a tread/riser count nobody observed.
This is the 1910.303 lesson applied prospectively rather than retrospectively. The governed summary
therefore states the section's structure, attributes the handrail rule to `(b)(11)(ii)`, and **names
the tread/riser condition as something the finding must establish** rather than presenting it as
satisfied.

## 4. `29 CFR 1910.95` — SAFE_TO_ADD at section level

**Predicate** (GI-NOISE-01): *"An employee's full-shift measured noise exposure is 92 dBA
time-weighted average with no unusual impulse noise."*

**Source**: `(a)` + Table G-16 (90 dBA permitted for 8 hours; 92 dBA for only 6); `(b)(1)` feasible
administrative or engineering controls, with PPE only if controls fail; `(c)(1)` hearing conservation
program whenever exposure equals or exceeds a TWA8 of 85 dBA, or equivalently a 50 percent dose.

92 dBA over a full shift exceeds Table G-16 **and** clears the 85 dBA program trigger, so both
`(b)(1)` and `(c)(1)` are supported. The ordering in `(b)(1)` matters and is preserved: engineering
and administrative controls first, PPE only on their failure — a summary that offered hearing
protection as an equal option would misstate the hierarchy.

## 5. `29 CFR 1910.1200` — SAFE_TO_ADD at section level

**Predicate** (GI-HAZCOM-01): *"A workplace chemical container has no label identifying its contents
or hazards."*

**Source**: `(f)(6)` — *"Except as provided in paragraphs (f)(7) and (f)(8) … the employer shall
ensure that each container of hazardous chemicals in the workplace is labeled, tagged or marked."*

The operative paragraph is `(f)(6)` (**workplace** labeling), not `(f)(1)` (**shipped** containers) —
a distinction that decides who the duty falls on. The expert applicability rules declare both
`1910.1200(f)(1)` and `(f)(6)`; the gold set emits the section. Section level is retained, with
`(f)(6)` named as the operative paragraph and the `(f)(7)`/`(f)(8)` alternatives preserved, because
signs or placards in lieu of individual labels are a lawful compliance route and a summary omitting
them would overstate the duty.

## 6. `29 CFR 1926.1153` — SAFE_TO_ADD at section level

**Predicate** (CON-SILICA-01): *"A worker is dry-cutting concrete with a masonry saw, generating a
visible dust cloud, with no water suppression or dust control in use."*

**Source**: `(c)(1)` + Table 1, entries (i) *Stationary masonry saws* and (ii) *Handheld power saws
(any blade diameter)*, both requiring *"saw equipped with integrated water delivery system that
continuously feeds water to the blade"*; `(d)(1)` PEL of 50 µg/m³ as an 8-hour TWA for employers not
fully implementing Table 1.

The observation does not say whether the saw is stationary or handheld, and Table 1 treats them as
separate entries with different respiratory-protection requirements. Both require the same
engineering control (integrated water delivery), so the control duty is established either way — but
the summary stays at section level and names both entries rather than picking one, and preserves the
`(d)` alternative route.

---

## 7. `30 CFR 56.14132(a)` — CITATION_GRANULARITY_MISMATCH

**This is the one that could not be honestly backed, and it is the Phase 4 hazard occurring again on
a citation nobody was watching.**

**Predicate** (MSHA-TRAFFIC-01): *"A haul truck at the surface mine is backing without a functional
backup alarm and no spotter present."*

**What `56.14132(a)` actually says**:

> (a) Manually-operated horns or other audible warning devices provided on self-propelled mobile
> equipment as a safety feature shall be maintained in functional condition.

**What the predicate actually describes** is governed by `56.14132(b)(1)`:

> (b)(1) When the operator has an obstructed view to the rear, self-propelled mobile equipment shall
> have — (i) An automatic reverse-activated signal alarm; (ii) A wheel-mounted bell alarm …;
> (iii) A discriminating backup alarm …; or (iv) An observer to signal when it is safe to back up.

Paragraph (a) is about **manually-operated horns**. Paragraph (b)(1) is about **reversing with an
obstructed view**, and it is the only paragraph under which "no backup alarm **and** no spotter"
is a violation — because (b)(1)(iv) makes an observer one of the four permitted alternatives, so the
absence of *both* is precisely what (b)(1) prohibits.

Creating a governed record for `56.14132(a)` would put reviewer-approved text about **horn
maintenance** behind a **backup-alarm** finding, and the Standard Detail card would show
"Verified standard text" over it. That is worse than the current `CITATION_ONLY` state: an unbacked
citation tells the user nothing, whereas an approved-but-wrong one tells them something false with
the product's authority behind it.

Note also that the tracked gold set's own `expectedCitations` for this case is **`56.14132`** — the
section — not `(a)`. HazLenz's emission of `(a)` does not match its own expectation fixture.

### Disposition

1. **No governed record was created for `30 CFR 56.14132(a)`.** It remains `CITATION_ONLY`.
2. **A section-level record `30 CFR 56.14132` was created**, covering (a), (b)(1)(i)–(iv), (b)(2),
   (b)(3) and the (c) rail-equipment exclusion. It is accurate and it is what the corpus should hold.
3. **It does not silently back the emitted paragraph.** Release citation identity keeps `(a)` and the
   bare section distinct, so `56.14132(a)` still resolves to nothing. This is verified explicitly by
   the Phase 4 regression contract rather than assumed — a section record must not be allowed to
   stand in for a paragraph requirement, which is the whole point of that contract.
4. **Recorded as a selection/corpus-contract defect for KG-3F**: HazLenz should emit `56.14132(b)(1)`
   (or the section) for obstructed-view reversing findings, and the obstructed-view element should be
   established by the predicate. **No selection logic was changed in KG-3E** — the brief forbids
   broad HazLenz recognition changes, and this needs a gold-set regression pass of its own.

### Why this was not "fixed" by just citing (b)(1)

Because `(b)(1)` is conditioned on *"the operator has an obstructed view to the rear"*, and the
observation does not state that. A haul truck reversing is conventionally obstructed-view, but
conventional is not established. Promoting the citation to `(b)(1)` in KG-3E would repeat exactly the
error KG-3D refused for `1910.303(g)(2)(i)`, where voltage was never established. The correct fix is
a predicate refinement, which belongs with the selection change.
