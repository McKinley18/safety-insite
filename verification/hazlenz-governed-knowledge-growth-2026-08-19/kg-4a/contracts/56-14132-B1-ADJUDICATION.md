# KG-4A Phase 5 — `30 CFR 56.14132(b)(1)` source adjudication

## Outcome

> ## `GOVERNED — record created, reviewed and approved`

The paragraph record KG-3E deferred is now in the corpus, sourced through the established provenance
pipeline, reviewed clause-by-clause against the hash-verified authoritative text, and approved only
through the checksum/provenance-bound reviewer mechanism.

**The cutover architecture does not depend on this.** Every KG-4A suite except the two that name the
record passed before it existed, and the fallback contract handles the un-governed case correctly
either way (`APPROVED_SECTION_ONLY` → citation kept, no badge, no provenance).

## 1. The authoritative text

`verification/…/kg-3e/source-evidence/ecfr-56-14132.xml`, sha256 `62f182c1d779619c…`, re-verified
against KG-3E's own `SHA256SUMS.txt` before any claim was checked. eCFR blocks automated fetch; the
hash-verified copy already in the repository is the authority.

```
§ 56.14132 Horns and backup alarms.
(a) Manually-operated horns or other audible warning devices provided on self-propelled mobile
    equipment as a safety feature shall be maintained in functional condition.
(b)(1) When the operator has an obstructed view to the rear, self-propelled mobile equipment shall have—
   (i) An automatic reverse-activated signal alarm;
   (ii) A wheel-mounted bell alarm which sounds at least once for each three feet of reverse movement;
   (iii) A discriminating backup alarm that covers the area of obstructed view; or
   (iv) An observer to signal when it is safe to back up.
 (2) Alarms shall be audible above the surrounding noise level.
 (3) An automatic reverse-activated strobe light may be used at night in lieu of an audible reverse alarm.
(c) This standard does not apply to rail equipment.
```

## 2. Why KG-3E refused, and why that reason no longer applies

KG-3E adjudicated this citation while HazLenz emitted `56.14132(a)`. It refused to back that citation
— correctly, since (a) is horn maintenance and the predicate described reversing — and added the
**section** record instead, "leaving the emitted paragraph resolving to nothing". Its stated bar was
explicit:

> "a record is written at the paragraph level ONLY where the predicate establishes every element that
> paragraph requires."

At that time the predicate established **none** of (b)(1)'s elements: the obstructed-view trigger was
hard-coded `true` and no rear-visibility evidence fact existed anywhere in the extractor.

**KG-3F changed exactly that.** `rearViewState` and `reverseWarningAlternative` made both statutory
conditions evidence-borne, and `(b)(1)` is now emitted only where an obstructed rear view is
established — 16/16 in `test:kg3f-56-14132-predicate`. The bar KG-3E set is met, so the record it
deferred is written.

## 3. Granularity decision

The record's text is (b)(1)'s introductory clause **together with its own subdivisions (i)–(iv)**.
That is completeness, not absorption: (i)–(iv) are subdivisions *of* (b)(1), and "shall have—" is
meaningless without them.

What the record must not do is absorb its **siblings**, so:

* `(b)(2)` audibility, `(b)(3)` night strobe and `(c)` rail exclusion are **named as qualifications
  with their own citations**, not stated as this paragraph's rule;
* `(a)` is **explicitly disclaimed** — "is a separate requirement and is not addressed by this
  paragraph" — rather than silently included;
* all four alternatives are stated, and the record says **"Any one of the four satisfies this
  paragraph"**, so "no backup alarm" cannot read as a violation of a rule the operator may be
  complying with — the precise error KG-3F removed from the predicate;
* the record states the paragraph **does not apply where the rear view is clear**.

## 4. Review and approval

`npm run verify:kg4a-record-source -- <releaseId>` → **31/31**, covering: source hash, codified
heading, title as a justified narrowing, every asserted element present in the source, all four
alternatives, each sibling qualification disclosed *with its own citation*, paragraph (a) disclaimed,
the clear-view non-application, non-placeholder provenance (`msha-30-cfr-standards`).

Approved via `review:release-record` bound to checksum
`388a349c2b0a6f6d5c0deba02d43f54717b54a2c1e6957e5c6f4c3eb5f616d5a`.
**Negative control:** the same command with a wrong checksum is refused — `failedGates: [checksumMatches]`.

## 5. Result

| Citation | citationKey | Governed state |
|---|---|---|
| `30 CFR 56.14132(b)(1)` | `30cfr56.14132(b)(1)` | **`CORPUS_BACKED`** (approved, has text) |
| `30 CFR 56.14132` | `30cfr56.14132` | unchanged — its own record, its own state |
| `30 CFR 56.14132(a)` | `30cfr56.14132(a)` | **`NOT_IN_RELEASE`** — KG-3E's refusal preserved |

Three distinct citation identities, three distinct states, no promotion in either direction.
`test-kg3e-citation-granularity` remains **48/48** against the corpus containing the new record.

Live, through the product: the allowlisted account sees `30 CFR 56.14132(b)(1)` with
**"Verified standard text"**; `56.14132(a)` in the same analysis resolves `APPROVED_SECTION_ONLY` and
gets **no** badge.

## 6. Cost, stated plainly

Adding a 35th record moves the seed manifest identity:

| | records | `manifestChecksum` |
|---|---|---|
| control (KG-4A record removed, re-seeded) | 34 | `bee47ebe1e82b74d…` — the KG-3A→3F value |
| with the KG-4A record | 35 | **`14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b`** |

This is the correct behaviour of a content-identity digest when content is legitimately added, and it
was measured against a purpose-built control rather than assumed. **No automated suite asserts
`bee47ebe`** — it appears only in KG-3F documentation, verified by repository-wide grep. The value is
recorded here so the next slice compares against the right baseline.
