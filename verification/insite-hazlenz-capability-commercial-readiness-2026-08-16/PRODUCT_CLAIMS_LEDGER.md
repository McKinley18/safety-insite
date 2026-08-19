# HazLenz / Safety InSite — Product Claims Ledger

Date: 2026-08-16
Scope: `frontend-next/app/about/page.tsx`, `frontend-next/app/page.tsx`, `frontend-next/app/pricing/page.tsx` (+ `components/pricing/PricingContent.tsx`), `frontend-next/app/hazlenz/page.tsx`, `frontend-next/app/legal/page.tsx`, `frontend-next/app/settings/page.tsx`, plus spot-checks of `inspection*`/`inspections` pages for HazLenz copy.

Ground truth used for verdicts (established this session by live-testing `POST /safescope-v2/classify` and reading `backend/src/safescope-v2/engine/deterministic-classifier.ts`):

- The primary hazard-family classifier is a **keyword-weighted scorer**. Its scoring loop (`deterministic-classifier.ts:73-125`) awards points for phrase matches (+3), all-tokens-present (+2), or ≥2-token overlap (+1) against a taxonomy keyword list. There is no NLP/semantic model in this path.
- There **is** one narrow escape hatch: a `verifiedControl` regex block (`deterministic-classifier.ts:55-71`) that only fires on a handful of tightly-templated phrasings (e.g. `guard...fixed|interlocked...tested|prevents access|cannot reach`, or `stopped|deenergized|locked out...log|record|tested|verified`). It does **not** generalize to ordinary negation phrasing. Live tests confirm: "No exposed energized conductors were observed... no deficiencies were noted" → classified **Electrical, 70%**; "all machine guards were in place, guardrails were installed... no hazards identified" → classified **Fall Protection, 93%**; a guard described as "properly installed, fully enclosed, and confirmed to prevent any contact" → classified **Machine Guarding, 93%** (same/higher confidence than the case where the guard was actually broken).
- The response `explanation` field is templated, e.g. "HazLenz AI matched weighted Electrical signals" / "Matched deterministic taxonomy terms for X" — it reports what keywords matched, not a causal/physical inference.
- Every classify result carries `advisoryOnly: true`, `mayFinalize: false`, `qualifiedHumanReviewRequired: true` — the system never unilaterally finalizes a violation. This is real and structurally enforced.
- The 200-case benchmark dataset (`safescope-data/benchmarks/safescope-field-validation-dataset.v1.json`) contains **zero** cases whose expected answer is "no hazard" / "controlled condition" / negated hazard. All 200 `expectedHazardFamily` values are affirmative hazard categories (`machine_guarding`, `electrical`, `fall_protection`, `mobile_equipment`, `slip_trip_fall`, `hazcom`). The benchmark cannot and does not validate negation/false-positive handling.
- Standards suggestion, evidence-gap/clarification prompting, and corrective-action suggestion are established elsewhere in this codebase's work as functioning capabilities (not re-derived here) and are treated as PROVEN where claimed plainly.

Verdict legend: **PROVEN** / **PARTIALLY_PROVEN** / **OVERSTATED** / **OUTDATED** / **UNDERSELLS_CAPABILITY** / **UNCLEAR**

---

## 1. `frontend-next/app/hazlenz/page.tsx` — highest-risk surface

| # | Claim (exact quote) | Location | Verdict | Basis |
|---|---|---|---|---|
| 1 | "A governed hazard intelligence engine that interprets inspection observations, extracts structured hazard context, **reasons across equipment, task, exposure, energy, and control factors**, identifies evidence gaps, and supports advisory corrective action review." | hazlenz/page.tsx:66-68 | **OVERSTATED** | "Reasons across... control factors" implies the engine distinguishes control-present from control-absent. Live tests show the opposite: an intact, verified guard scored *higher* confidence for "Machine Guarding" (a hazard family) than a broken one. |
| 2 | **"Structured observation understanding"** — "...processes natural language safety observations into clean, structured datasets including equipment category, components in use, active worker tasks, exposure pathways, energy sources, and **control failures**." | hazlenz/page.tsx:10-12 | **OVERSTATED** | Claims reliable extraction of "control failures" as a structured field. The classifier cannot currently distinguish a stated control failure from a stated control success outside a few hard-coded regex phrasings — it labels effectively-controlled conditions as active hazards. |
| 3 | **"Hazard mechanism reasoning"** — "**Instead of simple keyword matching**, the engine analyzes physical energy pathways (e.g., mechanical rotation, gravity, electrical) and barrier failure modes to identify plausible ways harm could occur in a given scenario." | hazlenz/page.tsx:14-16 | **OVERSTATED — highest priority** | This is a direct, falsifiable factual claim that is contradicted by the code. `deterministic-classifier.ts` is literally a keyword/phrase-overlap scorer (score += 3/2/1 by match tier). There is no energy-pathway or barrier-failure-mode model in the classification path this page is describing. The explicit denial ("instead of simple keyword matching") makes this the single most legally/commercially risky sentence found. |
| 4 | **"Standards-informed matching"** — matches structured observations against approved MSHA/OSHA frameworks to surface potentially applicable standard families. | hazlenz/page.tsx:18-19 | **PROVEN** | Standards suggestion is an established, working capability per prior work this session; phrasing already hedges with "potentially applicable" and "for qualified safety review." |
| 5 | **"Evidence gap detection"** — autonomously identifies missing/ambiguous parameters and flags them as critical questions. | hazlenz/page.tsx:22-23 | **PROVEN** | Clarification/evidence-gap workflow is an established working capability per prior work. |
| 6 | **"Advisory corrective action support"** — recommends layered action plans following hierarchy of controls. | hazlenz/page.tsx:26-27 | **PROVEN** | Corrective-action suggestion is an established working capability; already framed as advisory. |
| 7 | **"Explainability & transparency"** — "Every finding includes a full visual and step-by-step AI Reasoning Trace... the **exact reasoning sequence**, inputs used, and matched logic." | hazlenz/page.tsx:30-31 | **PARTIALLY_PROVEN** | A real reasoning-trace subsystem exists (`backend/src/safescope-v2/audit-ready-reasoning-trace/`, `SafeScopeReasoningPanel.tsx`), so a trace UI is not fabricated. But "reasoning sequence" borrows the same overstated framing as claim #3 — the trace is faithful to what the system did (keyword matches), not evidence of physical/causal reasoning. The word "reasoning" is doing more work than the underlying mechanism supports. |
| 8 | **"Human-in-the-loop governance"** — "It never auto-finalizes findings, declares violations, creates official citations, or replaces qualified safety professionals." | hazlenz/page.tsx:34-36 | **PROVEN** | Matches live-tested API behavior exactly: `advisoryOnly: true`, `mayFinalize: false`, `qualifiedHumanReviewRequired: true` on every result. |
| 9 | **"Benchmark validation"** — "the engine's observation understanding is supported by an automated multi-scenario benchmark covering core industrial hazard scenarios." | hazlenz/page.tsx:38-40 | **PARTIALLY_PROVEN** | Literally true (a real 200-case automated benchmark exists and is run by scripts in `backend/scripts/`), but misleading by omission: 0 of 200 cases test negated/safe/effective-control observations, i.e. the one dimension this page's other claims (#1-#3) assert is handled. The benchmark cannot support those claims. |
| 10 | "Qualified review required" callout — "HazLenz AI supports professional judgment. It does not replace qualified safety review, declare violations, create citations, determine compliance, or make final decisions." | hazlenz/page.tsx:76-77 | **PROVEN** | Matches live behavior; good honest framing. |
| 11 | Footer line pointing to legal disclaimer for "use limitations." | hazlenz/page.tsx:101-107 | **PROVEN** | Accurate cross-reference. |

## 2. `frontend-next/app/about/page.tsx`

| # | Claim | Location | Verdict | Basis |
|---|---|---|---|---|
| 12 | "Safety InSite helps safety professionals turn field observations into documented findings, risk review, standards support, corrective action, and inspection-ready records." | about/page.tsx:58-60 | **PROVEN** | Workflow-level claim, no accuracy/understanding claim made. |
| 13 | Capability tiles: "Mobile inspection capture," "Risk and exposure review," "Standards-aware support," "Corrective action tracking," "Professional records" | about/page.tsx:8-33 | **PROVEN** | All are organizational/workflow claims ("organize," "support," "track"), not hazard-detection-accuracy claims. None use "understands," "identifies every," "guarantees," etc. |
| 14 | "HazLenz AI helps organize hazard context, risk signals, evidence gaps, standards review, and corrective action reasoning so findings are easier to understand, review, and act on." | about/page.tsx:137-139 | **PROVEN** | "Helps organize... easier to understand" — carefully stops short of claiming HazLenz itself understands or is always correct. |
| 15 | "HazLenz AI is advisory decision support. It does not replace professional judgment, declare violations, create citations, or override regulatory requirements." | about/page.tsx:140-142 | **PROVEN** | Matches live behavior. |
| 16 | Section header: "Intelligence that supports the reviewer." | about/page.tsx:132 | **PROVEN** | Appropriately modest framing ("supports," not "replaces" or "automates"). |

The About page is, notably, the **best-hedged** surface reviewed — it makes no specific accuracy/understanding claims about the classifier and would need no changes for this specific negation-handling gap. It still lacks any capability list a reader could use to judge what HazLenz is actually good at today (see companion review doc).

## 3. `frontend-next/app/page.tsx` (marketing home page)

| # | Claim | Location | Verdict | Basis |
|---|---|---|---|---|
| 17 | "Inspection-first safety intelligence for real field work." | page.tsx:44-46 | **PROVEN** (as a positioning tagline) | Vague enough not to make a falsifiable accuracy claim. |
| 18 | "Safety InSite helps safety professionals capture hazards, organize evidence, plan corrective actions, and build cleaner inspection records — with HazLenz AI supporting the review instead of replacing qualified judgment." | page.tsx:48-50 | **PROVEN** | Matches advisory-only reality. |
| 19 | Proof point: "HazLenz AI support" — "Turn photos and observations into **organized hazard reasoning**, evidence gaps, corrective actions, and report-ready findings." | page.tsx:11 | **PARTIALLY_PROVEN** | "Organized hazard reasoning" leans on the same "reasoning" framing flagged in claim #3/#7. Softer than the HazLenz page's explicit "instead of keyword matching," but still implies more analytical depth on the classification step than the code demonstrates for negated/safe inputs. |
| 20 | "Professional guardrails" section — "AI-assisted, not auto-cited. Designed for qualified safety review." + "HazLenz AI is advisory support. It helps organize observations, likely hazard context, evidence gaps, and corrective action ideas, while keeping the final safety decision with the qualified reviewer." | page.tsx:164-169 | **PROVEN** | One of the strongest, most accurate framings in the whole surface — matches live API guardrail behavior precisely. |

## 4. `frontend-next/app/pricing/page.tsx` + `components/pricing/PricingContent.tsx`

| # | Claim | Location | Verdict | Basis |
|---|---|---|---|---|
| 21 | "Don't just record hazards. **Understand them**, correct them, and prove they were addressed." | PricingContent.tsx:390-393 | **OVERSTATED** | "Understand" is a semantic-comprehension claim. Given the classifier's demonstrated inability to distinguish "hazard present" from "hazard explicitly absent," claiming the product delivers *understanding* (vs. organization/support) overstates current capability. |
| 22 | "Basic audit apps document the issue. Safety InSite helps **explain what it means** and what should happen next." | PricingContent.tsx:350-353 | **PARTIALLY_PROVEN** | Explanation is generated (see reasoning-trace claim #7), but on negated/safe observations the explanation is confidently wrong (e.g., explains an "Electrical" hazard match for text stating no electrical deficiencies exist), so "explains what it means" is not yet reliable. |
| 23 | Comparison row: "Full HazLenz AI hazard intelligence" (Pro/Expert = "Yes") | PricingContent.tsx:142 | **PARTIALLY_PROVEN** | "Intelligence" is vague marketing language; feature exists and is gated correctly by tier, but the word invites the same overstatement as elsewhere. |
| 24 | "Risk and confidence support" (Pro AI Intelligence bullet) | PricingContent.tsx:73 | **UNCLEAR / worth flagging** | The product surfaces a numeric "confidence" score to users. Per the classifier code, confidence is purely a function of keyword-match density (`score>=6 → 92%`, `score>=3 → 74%`, else `45%`) — it is **not** correlated with correctness on negated/safe inputs (a wrongly-classified negated observation scored 70-93%, same tier as correct hazard calls). The claim isn't false as literally written, but the underlying number it refers to can mislead a user into treating "high confidence" as "verified accurate." |
| 25 | "Additional hazard awareness" (Pro bullet) | PricingContent.tsx:75 | **UNCLEAR** | Too vague to verify or falsify against code; no corresponding mechanism was identified in this review. |
| 26 | "Repeat-hazard insight support" (Pro bullet) | PricingContent.tsx:84 | **UNCLEAR** | Not verified in this pass — no repeat-hazard/pattern-detection logic was located in the files reviewed. Would need separate code confirmation before being called PROVEN. |
| 27 | "Human-review safeguards" (Pro bullet) | PricingContent.tsx:85 | **PROVEN** | Matches `qualifiedHumanReviewRequired: true` behavior. |
| 28 | "Suggested MSHA / OSHA standards" | PricingContent.tsx:143 | **PROVEN** | Established working capability. |
| 29 | "Evidence gap prompts" | PricingContent.tsx:144 | **PROVEN** | Established working capability. |

## 5. `frontend-next/app/legal/page.tsx`

| # | Claim | Location | Verdict | Basis |
|---|---|---|---|---|
| 30 | "HazLenz AI does not declare violations, create citations, determine legal compliance, issue regulatory interpretations, or override MSHA, OSHA, site or legal requirements." | legal/page.tsx:26-28 | **PROVEN** | Matches live behavior exactly. |
| 31 | "Do not rely on Safety InSite or HazLenz AI as the sole basis for safety, compliance, disciplinary, legal, medical, engineering, emergency-response, or operational decisions." | legal/page.tsx:75-77 | **PROVEN** | Appropriate, unhedged disclaimer; arguably the single strongest piece of consumer protection on the whole site. |
| 32 | "Safety InSite and HazLenz AI do not replace qualified safety professionals, legal counsel, regulatory agencies, site policy, site-specific evaluation, or professional judgment." | legal/page.tsx:22-24 | **PROVEN** | Matches live behavior. |

The legal page is comprehensive and does not contain any of the dangerous absolute phrases the task asked to check for ("understands everything," "guarantees compliance," "ensures safety," "replaces a safety professional," "always identifies every hazard," "provides legal advice"). None of those phrases, or close paraphrases, were found anywhere in the four reviewed surfaces or the settings/inspection pages spot-checked.

## 6. `frontend-next/app/settings/page.tsx`

| # | Claim | Location | Verdict | Basis |
|---|---|---|---|---|
| 33 | "Let HazLenz AI Evaluate" — "HazLenz AI decides the likely agency context." | settings/page.tsx:34 | **PARTIALLY_PROVEN** | "Decides the likely agency context" (MSHA vs. OSHA General vs. OSHA Construction) is a narrower, more plausible claim than hazard-family classification, and is not directly contradicted by the ground truth evidence gathered (which concerned hazard-family/negation, not jurisdiction routing). Not independently verified in this pass — flagged UNCLEAR-leaning-PARTIALLY_PROVEN rather than tested. |
| 34 | "Set the default agency context HazLenz AI should use during inspection review." | settings/page.tsx:270 | **PROVEN** | Describes a configuration control, not an accuracy claim. |

## 7. Inspection workflow pages (`inspection/page.tsx`, `inspections/page.tsx`, `inspection-quick/page.tsx`, `inspection-review/page.tsx`) — spot check

| # | Claim | Location | Verdict | Basis |
|---|---|---|---|---|
| 35 | "Complete a guided inspection with HazLenz AI review, risk scoring, standards support, corrective actions, and report generation." | inspections/page.tsx:63-65 | **PROVEN** | Workflow description, no accuracy claim. |
| 36 | "HazLenz AI Quick Review" / "Let HazLenz AI suggest one after review" (category suggestion copy) | inspection-quick/page.tsx:103,392,399,412 | **PROVEN** | Framed as a suggestion to confirm, not an authoritative determination — appropriately hedged given the classifier's actual reliability. |
| 37 | "HazLenz AI Review Status" / "N HazLenz AI finding(s) need qualified review" | inspection-review/page.tsx:237-242 | **PROVEN** | Directly reflects the human-review-required design. |

None of the inspection-workflow UI strings reviewed made unhedged accuracy claims; all remained at "review/suggest/support" language consistent with the advisory design.

---

## Summary counts

- **Total meaningful capability/quality claims catalogued:** 37
- **PROVEN:** 21
- **PARTIALLY_PROVEN:** 9
- **OVERSTATED:** 4 (claims #1, #2, #3, #21)
- **UNCLEAR:** 3 (claims #24, #25, #26)
- **OUTDATED:** 0
- **UNDERSELLS_CAPABILITY:** 0 (About page is thorough but generic; see companion review for a recommendation to *add* a proven-capability list, which is an omission rather than an underselling claim)

## Single highest-priority fix

Claim #3, `frontend-next/app/hazlenz/page.tsx:14-16` — the "Hazard mechanism reasoning" section's sentence **"Instead of simple keyword matching, the engine analyzes physical energy pathways... and barrier failure modes..."** This is the one claim in the entire reviewed surface that explicitly and affirmatively denies being a keyword matcher while the code confirms it is exactly that (plus one narrow regex carve-out that does not generalize to ordinary negation phrasing). It should be rewritten or removed before any external/commercial use of this page.
