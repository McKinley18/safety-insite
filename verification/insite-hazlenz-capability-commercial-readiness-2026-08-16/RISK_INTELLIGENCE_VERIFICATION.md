# Phase 4 — Risk Intelligence Verification (live)

Risk is computed by an `operationalRisk` 5x5 severity x likelihood matrix (`profileId: "standard_5x5"`) plus a mirrored `aiRisk` escalation score, both present on every classify response alongside a plain-language `reasoning[]` array. Traced: evidence text → hazard family → severity/likelihood lookup for that family → `matrixScore`/`riskBand` → same score echoed into `risk.riskScore`/`risk.riskBand` → (not independently re-verified this session) UI/report display.

## What responds correctly to evidence

| Test | riskScore / band | Correct? |
|---|---|---|
| single-hazard-fall (open edge, no guardrail) | 25 / **Critical**, `imminentDanger: true`, `requiresShutdown: true` | High severity + high likelihood → highest band. Reasoning cites "Imminent-danger trigger detected in finding text." **Correct and well-justified.** |
| temporal-historical-resolved (guard missing last month, since fixed) | **0 / Controlled** | Reasoning: "Current uncontrolled exposure is not established by the submitted evidence." Risk correctly collapses to zero for a resolved historical condition rather than scoring the stale hazard. **Correct — this is genuine temporal-aware risk reasoning, not just a classification-layer decoration.** |
| multi-hazard-3 (3 distinct hazards, one observation) | 6 / Moderate, severity 2 / likelihood 3 | A single risk score is returned for the whole multi-hazard observation rather than one score per decomposed hazard fragment — see gap below. |

## What does NOT respond correctly to evidence

| Test | riskScore / band | severity / likelihood | Problem |
|---|---|---|---|
| failed-control (guard present but broken, no longer blocks contact) | 15 / High | 4 / 3 | — |
| effective-control (guard present, fully enclosed, confirmed to block contact) | **15 / High** (identical) | **4 / 3** (identical) | **Risk score is byte-identical to the failed-control case.** A guard verified as effective should score materially lower risk than one verified as broken; instead the risk engine produced the same severity/likelihood/score for both, because — consistent with the classification-layer finding — risk is keyed to the matched hazard *family* ("Machine Guarding"), not to the control-effectiveness evidence in the text. |
| unknown-control (unclear if LOTO was verified) | 15 / High, same profile as a confirmed hazard | 4 / 3 | Not unreasonable on its own (unverified LOTO is legitimately a "treat as unmitigated" default), but it is indistinguishable from a confirmed-broken-control case rather than being flagged as its own uncertain-risk state. |

## What HazLenz determines automatically vs. what remains user-confirmed

**Automatic (verified live):**
- Severity and likelihood default values per matched hazard family (a lookup table effect, not evidence-derived per-case tuning).
- Imminent-danger / shutdown-required flags from specific trigger phrases in the finding text.
- Temporal suppression: `HISTORICAL` conditions correctly zero out current risk; this is real evidence-conditioned behavior, not a static lookup.
- A parallel `aiRisk` escalation score that mirrors `operationalRisk` in every case observed this session (no case where the two diverged).

**Not automatic / still needs a human or better evidence, but the product's own gating (`mayFinalize: false`, `requiresHumanReview: true`, `clarifyingQuestions`) already reflects this:**
- Control-effectiveness-adjusted severity/likelihood (currently absent — see gap above).
- Final violation/compliance determination — never automatic; always advisory pending qualified review, verified across all 12 cases in `HAZLENZ_CAPABILITY_MATRIX.md`.
- Per-fragment risk in a multi-hazard observation — the live response returns one risk object for the whole observation, not one per decomposed hazard; whether the frontend computes/displays finding-scoped risk after persistence (a documented product feature — "finding-scoped risk") was not verified in this pass and should be checked against the persisted-finding flow, not the raw classify response, before being marketed as verified at the classify stage specifically.

## Accurate product-capability statement (for marketing use)

"HazLenz automatically scores likely severity and likelihood for the hazard family it identifies, using a standard 5x5 risk matrix, and will flag imminent-danger language for immediate escalation. It does not yet adjust that score based on whether a described control is present-but-broken versus verified effective — treat the risk score as a starting point tied to the hazard type, not a substitute for the reviewer's judgment on control adequacy, which the product already requires (no risk score is finalized without human review)."

Do not claim "automatically accounts for control effectiveness in risk scoring" — this session's evidence contradicts it directly (identical scores for opposite control states).
