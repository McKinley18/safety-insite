/**
 * L3-2 -- runs Level-3 reasoning over an evaluation set and CAPTURES RAW RESULTS ONLY.
 *
 * Capture and judgement are separate programs, following the KG-4D precedent recorded in
 * `run-kg4d-customer-capture.ts`: a harness that scores while it runs lets an expectation be
 * adjusted the moment a result is visible. This one asserts nothing.
 *
 * OFF THE CUSTOMER PATH BY CONSTRUCTION. It boots no Nest module, imports nothing from
 * `intelligence-orchestrator.service.ts` or `safescope-v2.service.ts`, and touches no database.
 *
 * Env: SET (path to an eval set), OUT (artifact path), LIMIT (optional).
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { HAZARD_TAXONOMY } from '../src/safescope-v2/taxonomy/hazard-taxonomy';
import { buildReasoningInput, describeEgress } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { OllamaReasoningProvider, L3_2_INFERENCE_CONFIG } from '../src/safescope-v2/reasoning-l3/ollama-reasoning-provider';
import { runValidatedReasoning } from '../src/safescope-v2/reasoning-l3/reasoning-runner';
import { L3_PROMPT_VERSION } from '../src/safescope-v2/reasoning-l3/reasoning-prompt';
import type { AdvisorySignal, L3RegulatoryContextValue } from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';

/** The closed vocabulary, taken from the engine's own taxonomy (KEEP_AS_GUARDRAIL, section 29.7). */
const ALLOWED_FAMILIES = [...new Set(HAZARD_TAXONOMY.map(p => p.id))].sort();

interface EvalScenario {
  id: string; regime: string; text: string; failureMode?: string; cohort?: string;
  /** L3-2c: INDEPENDENT vs AUTHORED_COMPLEMENT, so results can be reported separately. */
  provenanceClass?: string;
  advisorySignals?: AdvisorySignal[];
  expect: Record<string, unknown>;
}

function regulatoryContext(regime: string) {
  const value = (['osha-general-industry', 'osha-construction', 'msha'].includes(regime)
    ? regime : 'unknown') as L3RegulatoryContextValue;
  return { value, provenance: value === 'unknown' ? 'UNKNOWN' as const : 'USER_CONFIRMED' as const };
}

async function main(): Promise<void> {
  const setPath = process.env.SET || '';
  const outPath = process.env.OUT || '';
  const limit = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity;
  if (!setPath || !outPath) throw new Error('SET and OUT are required');

  const set = JSON.parse(readFileSync(setPath, 'utf8')) as { setId: string; role: string; scenarios: EvalScenario[] };
  const provider = new OllamaReasoningProvider();
  const records: unknown[] = [];
  let egressSample: Record<string, unknown> | null = null;

  let n = 0;
  for (const scenario of set.scenarios) {
    if (n >= limit) break;
    const built = buildReasoningInput({
      analysisId: `${set.setId}:${scenario.id}`,
      observationText: scenario.text,
      regulatoryContext: regulatoryContext(scenario.regime),
      allowedHazardFamilies: ALLOWED_FAMILIES,
      advisorySignals: scenario.advisorySignals,
    });
    if (!egressSample) egressSample = describeEgress(built.input);

    const run = await runValidatedReasoning(provider, built.input);
    const telemetry = provider.lastTelemetry;

    records.push({
      id: scenario.id,
      cohort: scenario.cohort ?? null,
      provenanceClass: scenario.provenanceClass ?? null,
      failureMode: scenario.failureMode ?? null,
      regime: scenario.regime,
      text: scenario.text,
      expect: scenario.expect,
      redactions: built.redactions,
      outcomeKind: run.outcome.kind,
      attempts: run.attempts,
      totalMs: run.totalMs,
      telemetry,
      validationState: run.validation?.state ?? null,
      validationIssues: run.validation?.issues ?? [],
      semanticIssues: run.semantic?.issues ?? [],
      semanticRejected: run.semantic?.rejected ?? [],
      semanticAdvisories: (run.semantic?.issues ?? []).filter(i => i.severity === 'ADVISORY'),
      clarificationExpectedByBinder: run.semantic?.clarificationExpected ?? [],
      // L3-2c: candidates the impression gate refused as ACTIVE but kept at INSUFFICIENT_EVIDENCE
      // so a clarification could travel. Captured so a demotion is never mistaken for a deletion.
      semanticDemoted: run.semantic?.demoted ?? [],
      // L3-2d: clarifications dropped because the candidate's state was already decided. Captured so
      // a dropped question is visible in the evidence rather than merely absent from it.
      semanticClarificationsDropped: run.semantic?.clarificationsDropped ?? [],
      // L3-2e: what the inspector explicitly could not establish. Advisory evidence only.
      semanticObservationAvailability: run.semantic?.observationAvailability ?? [],
      // L3-2f: CONTROL_MENTION vs CONTROL_EFFECTIVE, recorded per candidate. Advisory evidence only.
      semanticControlAdequacy: run.semantic?.controlAdequacy ?? [],
      // Captured for DIAGNOSIS only -- what the model plus the deterministic validator produced
      // BEFORE semantic binding. The pipeline still rejects these; recording them is what makes
      // "provider success vs validator acceptance vs semantic correctness" separable (section 8).
      preSemanticHazards: (run.validation?.validated?.hazards ?? []).map(h => ({
        candidateKey: h.candidateKey, hazardFamily: h.hazardFamily, conditionState: h.conditionState,
        evidence: h.evidence.map(e => e.quotedText), clarification: h.clarification,
      })),
      // Clarifications actually supplied by the provider, at each tier.
      clarificationsPreSemantic: (run.validation?.validated?.hazards ?? []).filter(h => h.clarification).length,
      clarificationsShipped: ('reasoning' in run.outcome ? run.outcome.reasoning.hazards : []).filter(h => h.clarification).length,
      // The full reasoning object when one exists, so scoring needs no second run.
      reasoning: 'reasoning' in run.outcome ? run.outcome.reasoning : null,
    });

    n += 1;
    process.stderr.write(`[${n}/${set.scenarios.length}] ${scenario.id} ${run.outcome.kind} (${run.totalMs}ms)\n`);
  }

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify({
    setId: set.setId,
    role: set.role,
    capturedAt: new Date().toISOString(),
    provider: {
      providerId: provider.providerId,
      config: { ...L3_2_INFERENCE_CONFIG, endpoint: '<local>' },
      promptVersion: L3_PROMPT_VERSION,
    },
    allowedHazardFamilyCount: ALLOWED_FAMILIES.length,
    egressSample,
    records,
  }, null, 2) + '\n');
  process.stderr.write(`DONE ${n} scenarios -> ${outPath}\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
