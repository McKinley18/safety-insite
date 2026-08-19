# HazLenz Classify Pipeline — AI Behavior Characterization

Scope: `POST /classify` (backend/src/safescope-v2/safescope-v2.controller.ts:241) →
`SafescopeV2Service.classify(...)` (backend/src/safescope-v2/safescope-v2.service.ts, ~7,172 lines).
This document characterizes the ~15 most "AI-sounding" top-level response fields by reading the
actual service implementation that produces each one, not the field/class name.

## Top-line verdict

**Does HazLenz call an external LLM anywhere in the live classify path? No.**

Evidence:
- `grep -rniE "openai|anthropic|OPENAI_API_KEY|ANTHROPIC_API_KEY|api\.openai\.com|generativeai|chatgpt|gpt-4|gpt-3|\bllm\b" backend/src --include="*.ts"` returns **zero matches** anywhere in the backend, including `backend/src/safescope-v2/`.
- `backend/package.json` contains no OpenAI, Anthropic, LangChain, or other LLM-provider SDK dependency. The only NLP-adjacent dependency found in use is `natural` (classic Porter-stemmer/tokenizer library, not an LLM) in `backend/src/safescope-v2/contradiction-intelligence/contradiction-intelligence.service.ts:1,17-19`.
- The only files matching `fetch(` / `axios.` / `https?://api\.` under `backend/src/safescope-v2/` are regulatory-data-source connectors (eCFR, MSHA, OSHA fatality/investigation data) under `regulatory-source-audit/connectors/` and `regulatory-source-audit/regulatory-live-fetch.service.ts`. These are for pulling public regulatory/fatality datasets, not model inference, and the actual live `fetch()` call in `regulatory-live-fetch.service.ts:50` is **commented out** — the method is a stub.
- The primary classification layer, `DeterministicClassifier` (backend/src/safescope-v2/engine/deterministic-classifier.ts:43), is confirmed pure keyword-weighted scoring (`score += 3/2/1` at lines 99/105/111, confidence bands from score thresholds at lines 34-38) against a hand-authored keyword taxonomy (`backend/src/safescope-v2/taxonomy.seed.ts`). No negation handling, no model call.
- Every downstream "intelligence"/"reasoning"/"brain" service inspected below is TypeScript control flow: `string.includes(...)`, regex tests, if/else chains, weighted scoring arithmetic, and template-literal string assembly over already-classified fields. None constructs an HTTP request to a model endpoint, references an API key, or imports a model client library.

**Plain-English summary for marketing review:** HazLenz is a deterministic, rule-based reasoning
system, not a generative AI product. Every field in the classify response — including ones
named "intelligence," "reasoning," "brain," and "synthesis" — is produced by authored TypeScript
logic: keyword/phrase matching, regular expressions, decision trees, weighted scoring, and
template-string assembly over a curated OSHA/MSHA standards knowledge base and hazard taxonomy.
The system does not call any external large language model (OpenAI, Anthropic, or otherwise) at
any point in the live classification path. Its sophistication comes from the breadth and
specificity of the authored domain rules (hundreds of hand-written regex patterns and keyword
taxonomies covering distinct hazard families, energy sources, and standard citations) and from
chaining many small deterministic modules together into a multi-stage pipeline — not from a
neural network making judgment calls. This is a defensible, auditable, reproducible expert-system
architecture: the same input text will always produce the same output, and every output field can
be traced back to the specific rule or keyword match that produced it. That traceability is a
genuine strength for a compliance/safety product where defensibility and explainability matter,
and it should be described accurately as "structured/rule-based reasoning over an authored
knowledge base," not as generative AI.

## Component-by-component classification

| Component (response field) | File:line | Classification | Evidence |
|---|---|---|---|
| Primary classifier (`classification`, `confidence`) | backend/src/safescope-v2/engine/deterministic-classifier.ts:43-111 | DETERMINISTIC_RULE_BASED | Keyword-tier scoring (`score += 3/2/1`), confidence from score thresholds (lines 34-38). No API calls. |
| `multiHazardDecomposition` | backend/src/safescope-v2/multi-hazard-decomposition/multi-hazard-decomposition.service.ts:6-9 (1,379 lines total) | STRUCTURED_REASONING | Splits observation into fragments by regex delimiters (line 14-17), routes each fragment through `HazardTaxonomyCoverageService.route()`, then applies dozens of hand-authored regex guard conditions (negation detection, "positive mechanism" detection, condition-state inference) to add/suppress hazard candidates. Entirely regex/string logic; no model call. |
| `riskReasoning` | backend/src/safescope-v2/brain/risk-reasoning/risk-reasoning.service.ts:9-52 | STRUCTURED_REASONING | Multi-step deterministic pipeline: `inferSeverity()` (string `.includes()` checks, lines 55-90) → `inferLikelihood()` (lines 92-135) → `calculateRisk()` (lookup table, lines 137-151) → risk drivers/reducers/urgency/due-date logic, all via `.includes()` matching and switch-like conditionals. No model call. |
| `causalRiskReasoning` | backend/src/safescope-v2/causal-risk/causal-risk.service.ts:24-93 | STRUCTURED_REASONING | `evaluate()` chains ~9 private inference methods (`inferMechanism`, `inferEnergySource`, `inferEnergyTransferPath`, etc.), each a chain of `includesAny(text, [...])` keyword checks (e.g. lines 95-150). Emits a `reasoningTrace` array of template strings describing which rule fired — this trace is authored string formatting, not model output. No model call. |
| `domainIntelligence` | backend/src/safescope-v2/hazard-domain-intelligence/hazard-domain-intelligence.service.ts:1-150+ | DETERMINISTIC_RULE_BASED | Static `DOMAIN_PROFILES` lookup table (hand-authored array of ~12 hazard domains with keyword lists, hardcoded starting at line 43) matched via `hasPhraseOrWord()` word-boundary regex (lines 25-37). Pure lookup/matching, no inference beyond keyword presence. |
| `scenarioIntelligence` | backend/src/safescope-v2/brain/scenario-intelligence/scenario-intelligence.service.ts:4-150+ | STRUCTURED_REASONING | Long if/else-if chain mapping classification name substrings to `inferredHazard`/`inferredMechanism`/`inferredStandardFamily` (lines 16-61), then a large "priority scenario" disambiguation block using dozens of `text.includes(...)` boolean flags (lines 64-150+) to pick more specific scenario families before generic fallback. No model call. |
| `energyTransferIntelligence` | backend/src/safescope-v2/energy-intelligence/energy-transfer-intelligence.service.ts:12-105 | DETERMINISTIC_RULE_BASED | Sequential `includesAny(text, [...])` checks per energy-source category (electrical, mechanical, gravity, mobile equipment, pressure, thermal, chemical — lines 23-63), pushing hardcoded advisory strings into arrays. No model call. |
| `humanFactors` | backend/src/safescope-v2/human-factors/human-factors.service.ts:2-63 | DETERMINISTIC_RULE_BASED | Five independent `text.includes(...)` checks (lines 17-39) each pushing a single hardcoded sentence. Simplest module in the set despite the "human factors" framing. |
| `contradictionIntelligence` | backend/src/safescope-v2/contradiction-intelligence/contradiction-intelligence.service.ts:3-113 | STRUCTURED_REASONING (library-assisted, not LLM) | Uses the `natural` npm package (Porter stemmer + word tokenizer, line 1, 17-19) to catch stemmed keyword variants, then compares pairs of boolean keyword-presence flags (deenergized vs. energized, guarded vs. unguarded, etc., lines 27-59) to flag contradictions. A comment at line 81 says "AI ambiguity detection" but the logic beneath it is `stemmed.includes("safe") && stemmed.includes("unsafe")` — plain keyword-set intersection, not an AI model. `natural` is a classical NLP toolkit (stemming/tokenizing), not a machine-learning or generative model. |
| `counterfactualIntelligence` | backend/src/safescope-v2/counterfactual-intelligence/counterfactual-intelligence.service.ts:1-46 | DETERMINISTIC_RULE_BASED | Four independent `if (input.X?.Y)` presence checks (lines 13-31), each pushing one hardcoded template sentence into `counterfactuals`/`preventionLevers`. No model call. |
| `multidisciplinaryExpertSynthesis` | backend/src/safescope-v2/multidisciplinary-expert/multidisciplinary-expert.service.ts:35-117+ | DETERMINISTIC_RULE_BASED | Despite the "multidisciplinary expert" framing (safety/health, labor lawyer, industrial hygiene, environmental "experts"), this is if/else keyword matching against `textLower`/`classLower` producing **hardcoded** advisory strings and even hardcoded case-law citations (`'Secretary of Labor v. General Motors Corp (LOTO Precedent)'`, line 64; `'Secretary of Labor v. L.R. Willson and Sons...'`, line 65) that fire whenever the classification string contains "lockout" or "fall" respectively, regardless of the actual facts of the observation. This is the most name-inflated component found: the citations are static template text keyed off a keyword match, not case-specific legal research. No model call. |
| `executiveJudgment` | backend/src/safescope-v2/executive-judgment/executive-judgment.service.ts:2-83 | STRUCTURED_REASONING | Combines several already-computed upstream fields (risk band, energy-transfer flags, contradiction flags, barrier adequacy) via boolean logic (lines 12-27) into stop-work/supervisor-review recommendations and an assembled `auditReadySummary` string (template concatenation, lines 76-81). No independent inference of its own beyond boolean combination; no model call. |
| `hazardGraph` | backend/src/safescope-v2/hazard-graph/hazard-graph.service.ts:1-62 | DETERMINISTIC_RULE_BASED | Builds a node/edge list from presence checks on other already-computed fields (lines 14-44); "graph complexity" is just an edge-count threshold (lines 46-51). Simple data restructuring, not learned graph inference. No model call. |
| `siteMemory` | backend/src/safescope-v2/site-memory/site-memory.service.ts:1-120+ | STRUCTURED_REASONING | Deterministic recurrence analysis: filters prior findings by classification/location string match (lines 16-46), buckets them into 30/90/180-day recurrence windows via date-diff arithmetic (lines 49-68), then applies fixed thresholds (`>=1`, `>=2`, `>=3`) to set an `escalationLevel` and emit template sentences (lines 70-120+). No model call. |
| `correctiveActionReasoning` | backend/src/safescope-v2/brain/corrective-action-brain/corrective-action.service.ts:4-150+ | STRUCTURED_REASONING | Multi-stage template-string generator: urgency/immediate-actions from boolean flags (lines 10-27), then a "component-aware generator" that substitutes structured-observation fields (equipment, component, task labels) into hardcoded narrative templates per hazard family (conveyor/electrical/fall/chemical, lines 62-116), with a domain-keyword fallback generator when the structured path doesn't match (lines 125-150+). All output text is authored template strings with field interpolation — no free-form generation. No model call. |
| `standardsReasoning` / `standardApplicability` | backend/src/safescope-v2/standards-reasoning/standards-reasoning.service.ts:5-108 | STRUCTURED_REASONING | Weighted scoring: starts each candidate standard at `defensibilityScore = 0.5` and adds fixed increments (+0.15 curated source, +0.08 exposure pathways, +0.08 per domain-specific citation match via `calculateDomainBoost()`, lines 88-107, +0.06 reputable-source supplement) then ranks and slices top 5 (lines 75-77). Arithmetic scoring over authored rules, not a learned ranking model. |
| `clarifyingQuestions` / `evidenceGapQuestions` | backend/src/safescope-v2/safescope-v2.service.ts:592-680+ (`buildStructuredClarifyingQuestions`); registry lookup at backend/src/safescope-v2/brain/evidence-gap-question-generator/evidence-gap-question.service.ts:5-8 | DETERMINISTIC_RULE_BASED | The question generator itself is a pure static-registry filter (`EVIDENCE_GAP_QUESTION_REGISTRY.filter(q => q.scenarioFamilyId === scenarioFamilyId)`, line 7 — a lookup table, not generation). The orchestration in `safescope-v2.service.ts` that decides which questions are "safety decisive" / block finalization is a large regex/boolean rule set (lines 604-680+). No model call. |
| Narrative text (`findingSummary`, action narratives, etc.) | backend/src/safescope-v2/brain/narrative-generator/narrative.service.ts:5-65 | DETERMINISTIC_RULE_BASED | All narrative strings are JS template literals interpolating already-computed structured fields (`scenario.hazardCategory`, `mechanism`, `activity`, etc., lines 12-35); `mechanismNarrative()` (lines 44-64) is a regex-dispatch to one of ~6 hardcoded sentence templates keyed by mechanism keyword. This reads as fluent prose but is 100% authored template text, not generated by a language model. |

## Notes on naming vs. implementation

Several components have names that strongly imply generative AI or machine learning
("multidisciplinaryExpertSynthesis," "executiveJudgment," "hazardGraph," "AI ambiguity
detection" comment in contradiction-intelligence) but on inspection are all authored
if/else, regex, and weighted-scoring logic over already-classified fields. This is a legitimate
architectural pattern (an expert system / decision-tree pipeline), and it should be described to
marketing/commercial stakeholders using accurate terminology — "deterministic," "rule-based," or
"structured reasoning" — rather than "AI-powered" or "machine learning" claims that imply
statistical/generative model behavior, which this codebase does not contain anywhere in the
classify path.

## Bucket summary

18 components/fields were inspected at implementation level (table above):

- DETERMINISTIC_RULE_BASED: 9 — primary classifier, domainIntelligence,
  energyTransferIntelligence, humanFactors, counterfactualIntelligence,
  multidisciplinaryExpertSynthesis, hazardGraph, clarifyingQuestions registry lookup
  (`EvidenceGapQuestionGeneratorService`), narrative templates.
- STRUCTURED_REASONING: 9 — multiHazardDecomposition, riskReasoning, causalRiskReasoning,
  scenarioIntelligence, contradictionIntelligence, executiveJudgment, siteMemory,
  correctiveActionReasoning, standardsReasoning/standardApplicability. (The `clarifyingQuestions`
  *orchestration* logic in safescope-v2.service.ts that decides which registry questions block
  finalization is itself structured-reasoning-grade regex/boolean logic, layered on top of the
  deterministic registry lookup — see its row above for detail.)
- AI_GENERATED: 0 components found anywhere in the classify path.
- HYBRID: 0.
- UNKNOWN: 0 (all inspected components were fully traceable to authored logic).
