# KG-4B — four instrumentation defects the corpus run exposed

Recorded prominently because they are the most important methodological result of this slice: **the
first three corpus runs each produced a confident, coherent-looking, and completely wrong answer.**
Every one was caught by making the run adversarial against itself rather than by inspection.

Phase 14 warns that "a 99% match rate can hide one catastrophic case". The inverse is just as
dangerous, and is what actually happened: a broken instrument manufactured catastrophic-looking
results that did not exist.

---

## 1. A throttled run that passed vacuously

**Symptom.** 42 cases, all invariance assertions green.
**Reality.** `/safescope-v2/classify` is throttled at 30 requests / 60s. The runner issues three
calls per case, so the window was exhausted after ten cases and **32 of 42 comparisons were two
identical HTTP 429s**. Identical errors satisfy an equality oracle perfectly.

**Fix.** Pace inside the limit (28/60s with headroom) and **refuse a 429 outright** — a throttled
response is not a comparison. The throttle itself was *not* weakened; that would be relaxing a
production control to make a verification convenient.

**Guard added.** `HARD: every compared case returned a real analysis, none throttled or errored`, and
a non-vacuity floor requiring ≥40% of cases to produce citations.

## 2. `JURISDICTION_DIFFERENCE` on 54 of 83 comparisons

**Symptom.** 54 BLOCKING jurisdiction disagreements, including `29 CFR 1910.212(a)(1)` evaluated
under OSHA General Industry — which is obviously not a jurisdiction disagreement.
**Reality.** Three vocabularies are genuinely in use and none match by string comparison:

| source | value |
|---|---|
| request scope | `general_industry` |
| result `regulatoryContext.value` | `osha-general-industry` |
| governed record payload | `OSHA/general_industry` |

Worse, `regulatoryContext` is an **object**, so the legacy side was recording the literal string
`"[object Object]"` on all 83 events.

**Fix.** `canonicalizeRegime()` maps all three vocabularies to one canonical regime, and
`jurisdictionsDisagree()` returns true **only** when both sides resolve to a known, *different*
regime — an unestablished regime on either side is not a disagreement. The extraction now reads
`regulatoryContext.value`.

**Guard added.** 14 canonicalisation cases plus explicit "same regime, different vocabulary is NOT a
disagreement" assertions.

## 3. `CONTENT_DIFFERENCE` on 31 of 83 comparisons

**Symptom.** 31 BLOCKING content differences.
**Reality.** The legacy text was captured from the standard-decision object **before hydration**,
where `standardText` holds the *rule-family decision explanation*, not regulatory text. The proof was
decisive: `standards_master.standard_text`, `plain_language_summary`, `payload.canonicalText` and
`payload.summary` **all digest to `82843496…`** — exactly the governed digest — while the recorded
legacy digest `2841ac1a…` matched no corpus column at all.

**Fix.** Hydrate every distinct citation once up front and compare the **hydrated corpus text** — the
text the customer would actually be shown. One extra hydration call per analysis.

**Result after the fix.** `CONTENT_DIFFERENCE` fell to **0**, and 54/54 events carrying both digests
now agree.

## 4. `APPLICABILITY_DIFFERENCE` on 51 of 83 comparisons

**Symptom.** Almost every citation looked applicability-uncertain.
**Reality.** The runner read `standardDecisions[].status`, which is
`applicable_after_human_review` — a **review-state label**, not an applicability signal. The
authoritative axis is `applicabilityDecisions[].status` (a `PredicateStatus`), with the per-decision
`applicabilityStatus` (`confirmed` / `probable` / `needs-more-evidence`) as the fallback.

**Fix.** Read the authoritative axis first; `toApplicabilityState()` extended to understand the
display vocabulary, so one function still owns the whole applicability axis.

**Result after the fix.** `APPLICABILITY_DIFFERENCE` fell from 51 to **13**, and `EXACT_MATCH` rose
from 3 to 41.

## 5. Two further self-inflicted false positives, both caught by the guards

* **Event volume.** `correlationId` defaulted to the literal `'anonymous-analysis'`, collapsing all
  43 analyses into one correlation and reporting **40 phantom duplicates**. An idempotency key that is
  not unique per analysis is worse than none, because it silently *merges* observations. Fixed with a
  server-generated per-context UUID.
* **Browser vocabulary.** The pass flagged the word `SHADOW` on screen — from a fixture named
  `KG-4B browser …SHADOW`. The check was right; the fixture was renamed neutrally.

---

## What this changes about the result

The headline — **0 blocking mismatches** — is only trustworthy because three earlier runs produced
31, 54 and 51 blocking or review findings that were all artifacts, and each was chased to a root
cause rather than accepted or explained away. The corpus now has guards for every one of those
failure modes, so a future run cannot silently reproduce them.
