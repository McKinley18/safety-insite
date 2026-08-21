# KG-4A — the fallback contract and the applicability/backing separation (Phases 3, 4)

Machine-readable form: **`fallback-matrix.json`** — all 84 rows
(4 modes × 3 applicability states × 7 backing states), emitted by
`npm run test:kg4a-cutover-contract -- --emit <file>`.

## 1. The governing principle

> Governance controls **claims about verified regulatory text**.
> It does not control **which regulation HazLenz cites**, and it does not erase HazLenz's
> applicability reasoning.

This is KG-3B's option **(B)** — recommended there, deferred by KG-3C for want of a display state,
implemented here.

## 2. The three axes, kept separate

| Axis | Values | Owner |
|---|---|---|
| **Applicability** | `SUPPORTED` · `UNCERTAIN` · `UNSUPPORTED` | HazLenz evidence reasoning |
| **Governed backing** | `APPROVED_EXACT` · `APPROVED_SECTION_ONLY` · `APPROVED_NO_TEXT` · `UNAPPROVED_RECORD` · `NOT_IN_RELEASE` · `NO_ACTIVE_RELEASE` · `RESOLVER_UNAVAILABLE` | the governed corpus |
| **Delivery** | `GOVERNED_VERIFIED_TEXT` · `LEGACY_TEXT_UNVERIFIED` · `CITATION_ONLY_NO_TEXT` | the fallback table |

There is deliberately **no `SUPPRESSED` delivery state**. Suppression is an *applicability* decision
made upstream (an `UNSUPPORTED` rule emits no decision at all), never a governance decision. The type
makes governance-driven suppression unrepresentable.

## 3. The table, summarised

| Mode | Backing | Citation | Text | Verified | "text unavailable" | Governed provenance |
|---|---|---|---|---|---|---|
| LEGACY / SHADOW | *any* | ✔ | ✔ | ✘ | ✘ | **✘** |
| GOVERNED_WITH_FALLBACK | `APPROVED_EXACT` | ✔ | ✔ | **✔** | ✘ | **✔** |
| GOVERNED_WITH_FALLBACK | `APPROVED_NO_TEXT` | ✔ | ✘ | ✘ | ✔ | ✔ |
| GOVERNED_WITH_FALLBACK | section-only / unapproved / absent / no-release / resolver-failed | ✔ | ✔ (legacy) | ✘ | ✘ | **✘** |
| GOVERNED_STRICT | `APPROVED_EXACT` | ✔ | ✔ | **✔** | ✘ | ✔ |
| GOVERNED_STRICT | everything else | ✔ | ✘ | ✘ | ✔ | only if a record resolved |

Counts from the emitted matrix: `LEGACY` 21 × legacy-text · `SHADOW` 21 × legacy-text ·
`GOVERNED_WITH_FALLBACK` 3 verified / 3 citation-only / 15 legacy-text ·
`GOVERNED_STRICT` 3 verified / 18 citation-only.

**The citation is shown in all 84 rows.** Asserted directly.

## 4. Three refusals, each enforced

1. **No substitution.** `resolvedCitation` is always `requestedCitation` — a separate field precisely
   so the invariant is assertable. There is no "nearest approved match". Verified against a
   digit-prefix neighbour (`1926.5011` vs `1926.501`).
2. **No parent/child promotion.** Only `APPROVED_EXACT` yields verified text. `APPROVED_SECTION_ONLY`
   is recorded and observable but confers nothing, carries no text, and supplies no governed backing
   input. Observed live: `30 CFR 56.14132(a)` → `APPROVED_SECTION_ONLY` →
   `GOVERNED_SECTION_ONLY_NOT_PARAGRAPH`, no badge, no provenance.
3. **No upgrading uncertainty.** Approved text may be shown beside an `UNCERTAIN` applicability — the
   text is true regardless — but the missing trigger stays disclosed.

## 5. Axis independence, proven not asserted

Two executable predicates, run over every mode/axis combination:

* `disclosureIsIndependentOfBacking(mode, applicability)` — changing **only** backing never changes
  the applicability disclosure. 12/12.
* `backingDecisionIsIndependentOfApplicability(mode, backing)` — changing **only** applicability never
  changes the text/verification/provenance decision. 28/28.

And over all 84 rows: `discloseApplicabilityUncertain === (applicability === 'UNCERTAIN')`.

**Browser-confirmed:** the same citation shows `Confidence: High` in *both* the governed and the
legacy account, in all four themes — governance did not move applicability where a customer can see it.

## 6. `EVIDENCE_UNKNOWN` vs `GOVERNANCE_FILTER_EMPTY`, tested independently

| | meaning | delivery | applicability disclosure |
|---|---|---|---|
| `EVIDENCE_UNKNOWN` (`applicability = UNCERTAIN`) | an applicability trigger is unestablished | unchanged by backing | **disclosed** |
| `GOVERNANCE_FILTER_EMPTY` (`backing = NOT_IN_RELEASE`) | a content-availability gap | `LEGACY_TEXT_UNVERIFIED`, reason `GOVERNED_RECORD_ABSENT`, class `EXPECTED_FALLBACK` | **not** disclosed |

`decideFallback('…','UNCERTAIN','APPROVED_EXACT')` and `decideFallback('…','SUPPORTED','APPROVED_EXACT')`
produce the **same delivery state** and **different** disclosure. That is the whole separation, in one
assertion. Absence of clarification manufactures nothing: an unrecognised applicability status
degrades to `UNCERTAIN`, never to `SUPPORTED`.

## 7. Why fallback shows legacy text without a caution

Every non-approved state under `GOVERNED_WITH_FALLBACK` delivers today's HazLenz-authored text,
already labelled "HazLenz standard summary" by the P1 label-integrity contract, and already carrying
the source-review caveat. Adding "verified text unavailable" on top would attach a caution to
essentially every standard in the product (KG-3F: 137 of 160 declared citations unemitted or
unapproved), which reads as breakage rather than precision. KG-3C made the same call for
`UNAPPROVED_CONTENT`. What differs between those states is the **reason code**, which operators and
the corpus backlog need and which never reaches the customer.
