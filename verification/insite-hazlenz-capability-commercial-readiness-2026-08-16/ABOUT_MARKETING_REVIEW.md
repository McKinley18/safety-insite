# HazLenz Marketing Copy — Narrative Review and Honest Rewrite Draft

Date: 2026-08-16
Companion to: `PRODUCT_CLAIMS_LEDGER.md` (claim-by-claim table, 37 claims, 4 OVERSTATED, 3 UNCLEAR)

## What's actually true today (verified this session)

HazLenz's primary hazard-family classifier (`backend/src/safescope-v2/engine/deterministic-classifier.ts`) is a keyword/phrase-overlap scorer. It:

- Reliably takes a written observation and returns a structured, organized finding (hazard family, evidence tokens, confidence band, ambiguity warnings).
- Reliably surfaces multiple candidate hazards from one observation (`additionalHazards` array) and separates them into distinct findings.
- Reliably never finalizes anything on its own — `advisoryOnly: true`, `mayFinalize: false`, `qualifiedHumanReviewRequired: true` on every single result, confirmed live.
- Downstream of this classification step, standards suggestion (MSHA/OSHA), corrective-action suggestion, and evidence-gap/clarification prompting are established, working capabilities (proven in prior work this session, not re-derived here).
- Does **not** reliably distinguish a hazard that is present from one the observation explicitly states is absent, controlled, or resolved. Live tests: a negated electrical observation classified "Electrical" at 70%; a fully-guarded, no-hazard-identified observation classified "Fall Protection" at 93%; a guard explicitly described as effective classified "Machine Guarding" at 93% — equal to or higher than the confidence given to an actually-broken guard. There is a narrow regex carve-out for a handful of exact phrasings, but it does not generalize.

## The problem with the current `hazlenz/page.tsx` copy

Most of the reviewed marketing surface (About page, home page, legal page, pricing bullets) is already carefully hedged — it consistently uses "helps organize," "supports," "advisory," and explicitly disclaims violation-declaration and citation-creation. That framing is honest and should be the house style going forward.

The HazLenz feature-detail page breaks that pattern in three places, most seriously here:

> "Instead of simple keyword matching, the engine analyzes physical energy pathways (e.g., mechanical rotation, gravity, electrical) and barrier failure modes to identify plausible ways harm could occur in a given scenario."

This is not vague marketing puffery — it is a specific, falsifiable technical claim, and it is false as written. The mechanism actually doing the classification *is* keyword/phrase matching (see `deterministic-classifier.ts:73-125`). Paired with the "control failures" extraction claim and the "reasons across... control factors" claim, a reader (or a regulator, or a customer's counsel) would reasonably conclude HazLenz distinguishes "hazard present" from "hazard explicitly absent/controlled" — which live testing disproves. This is the one sentence on the entire site that should not survive contact with the classify endpoint's actual behavior.

## Recommended honest framing pattern

Use verified, demonstrated language throughout, following this pattern established elsewhere in this session's work:

- **"HazLenz identified..."** — describe what the system surfaced, not what it "understood" or "knew."
- **"Suggested standard"** / **"HazLenz standard summary"** vs. **"Official regulation text"** — always distinguish the AI's paraphrase from the authoritative source.
- **"Additional information may improve this analysis"** — invite more evidence rather than asserting completeness.
- Only claim capabilities actually demonstrated: analyze written observations; identify multiple hazards from one observation; organize hazards into separate findings; support finding-scoped risk; suggest relevant OSHA/MSHA standards; explain standards relevance; suggest corrective actions; identify uncertainty and request clarification.
- State plainly, as a *strength* rather than a limitation to bury: every result requires qualified human review before any violation determination is made. The product does not make unilateral compliance calls. This is true, differentiating, and legally protective — it should be foregrounded, not softened.
- Do **not** claim negation/effective-control handling, physical/energy-pathway reasoning, or "understanding" until the classifier has been changed and re-benchmarked against negation cases (the current 200-case benchmark has zero such cases).

## Draft rewrite — `hazlenz/page.tsx` capability section

The following replaces the eight `sections` entries currently on the HazLenz page (`frontend-next/app/hazlenz/page.tsx:8-41`). This is a drafting exercise only — no site file was edited.

```md
### What HazLenz AI does today

**Observation analysis**
HazLenz AI reads a written safety observation and organizes it into a structured
finding — equipment, task, and hazard category — so it's easier to review and act on.

**Multi-hazard identification**
When a single observation describes more than one condition, HazLenz AI identifies
each candidate hazard separately instead of collapsing them into one finding.

**Suggested standards**
HazLenz AI suggests potentially applicable MSHA and OSHA standard families for each
finding and explains, in plain language, why a standard may be relevant — labeled
as a HazLenz standard summary, distinct from the official regulation text, which a
qualified reviewer should always confirm against the current CFR.

**Evidence gap prompts**
HazLenz AI flags missing or ambiguous details — such as worker proximity, equipment
state, or control status — and asks clarifying questions before a finding is
finalized. Additional information may improve this analysis.

**Suggested corrective actions**
HazLenz AI proposes corrective action options organized by hierarchy of controls,
for the reviewer to select, edit, or reject.

**Qualified human review — always**
HazLenz AI never finalizes a finding, declares a violation, or issues a citation on
its own. Every finding it produces is advisory and requires review and sign-off by
a qualified safety professional before any compliance determination is made. This
is a structural safeguard, not a configurable setting.

**What HazLenz AI does not yet do**
HazLenz AI's hazard-category matching is based on the language used in an
observation. It is still improving at reliably telling the difference between a
hazard that is present and one an observation explicitly states is absent,
resolved, or effectively controlled — for example, "guard was broken" versus
"guard was inspected and confirmed intact." Until this is independently verified,
treat every HazLenz AI category and confidence score as a starting point for
qualified review, not a conclusion — especially on findings that describe a
control as working correctly.
```

## Notes on tone

- The "What HazLenz AI does not yet do" section is unusual for marketing copy, but it is consistent with the legal page's existing disclaimer strength and with the "professional guardrails" framing already used on the home page ("AI-assisted, not auto-cited"). It converts a real limitation into a credibility signal: a product that states its own known gap is more trustworthy than one that claims comprehensive understanding and is later shown to be wrong in a demo, an audit, or in litigation discovery.
- This draft removes "Instead of simple keyword matching," "physical energy pathways," "barrier failure modes," and "control failures" as structured-extraction claims — all four are the claims flagged OVERSTATED in the companion ledger.
- This draft keeps "Benchmark validation" language out entirely rather than repeating the misleading-by-omission version, until the benchmark is extended to include negation/safe-condition cases. Once that gap is closed, a truthful version could read: "validated against an automated benchmark that includes both hazard-present and hazard-absent scenarios."
- Suggested companion change (not drafted in full here, flagged for follow-up): the "confidence" percentage shown to users elsewhere in the product (settings/inspection review UI) should probably carry an inline caption such as "Confidence reflects how strongly the language matches known hazard terms, not verified accuracy" — since claim #24 in the ledger shows the number can be equally high whether the classification is right or wrong.

## Files read for this review

- `frontend-next/app/about/page.tsx`
- `frontend-next/app/page.tsx`
- `frontend-next/app/pricing/page.tsx`
- `frontend-next/components/pricing/PricingContent.tsx`
- `frontend-next/app/hazlenz/page.tsx`
- `frontend-next/app/legal/page.tsx`
- `frontend-next/app/settings/page.tsx`
- `frontend-next/app/inspection/page.tsx`, `inspections/page.tsx`, `inspection-quick/page.tsx`, `inspection-review/page.tsx` (spot-checked via grep for HazLenz/AI copy)
- `frontend-next/app/register/page.tsx` (spot-checked via grep for dangerous phrasing)
- `backend/src/safescope-v2/engine/deterministic-classifier.ts` (full read, confirms keyword-scoring mechanism and narrow `verifiedControl` regex carve-out)
- `safescope-data/benchmarks/safescope-field-validation-dataset.v1.json` (confirmed 200/200 cases are affirmative-hazard scenarios; zero negation/safe-condition cases)
