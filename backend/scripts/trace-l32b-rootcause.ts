/**
 * L3-2b Phase 2 -- reproduces each known defect and dumps EVERY pipeline stage.
 *
 * `ROOT_CAUSE_BEFORE_REMEDIATION`. Nothing is patched until the exact decision rule that produced
 * the mismatch is on the record. This runs the real provider against the real scenarios and prints
 * the raw proposal, the mechanical binding, the deterministic validator's verdict, the semantic
 * binder's verdict and the final outcome, side by side with what was expected.
 *
 * Env: OUT (artifact path).
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { HAZARD_TAXONOMY } from '../src/safescope-v2/taxonomy/hazard-taxonomy';
import { buildReasoningInput } from '../src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { OllamaReasoningProvider } from '../src/safescope-v2/reasoning-l3/ollama-reasoning-provider';
import { validateReasoningProposal } from '../src/safescope-v2/reasoning-l3/deterministic-safety-validator';
import { bindEvidenceSemantically } from '../src/safescope-v2/reasoning-l3/semantic-evidence-binding';
import { runValidatedReasoning } from '../src/safescope-v2/reasoning-l3/reasoning-runner';
import type { L3RegulatoryContextValue } from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';

const ALLOWED = [...new Set(HAZARD_TAXONOMY.map(p => p.id))].sort();

const CASES = [
  { id: 'B08', defect: 'evidence-span selectivity over-rejection', regime: 'osha-general-industry',
    text: 'An employee on a rolling scaffold at nine feet was using an angle grinder without a face shield while a propane forklift idled directly underneath refueling from a portable cylinder.',
    expected: 'ANALYZED with >=1 ACTIVE high-consequence hazard' },
  { id: 'C11', defect: 'comma-clause negation governance', regime: 'osha-general-industry',
    text: 'welding on the mezz rail, no fire watch, cardboard and pallets stacked under where the sparks were landing, extinguisher in the area was last inspected 2 yrs ago per the tag',
    expected: 'ANALYZED with an ACTIVE fire/hot-work hazard' },
  { id: 'B10', defect: 'subjective ambiguity became ACTIVE', regime: 'osha-general-industry',
    text: 'The rail on the platform did not look right to me.',
    expected: 'NOT ACTIVE -- UNKNOWN / INSUFFICIENT_EVIDENCE, ideally with a decision-critical clarification' },
  { id: 'D02', defect: 'CONTROLLED refused despite isolation language', regime: 'osha-general-industry',
    text: 'The line was shut down, the main disconnect was locked out with each worker\'s personal lock, and voltage was verified absent at the load side before work began.',
    expected: 'NOT ACTIVE -- CONTROLLED or equivalent, surviving the binder' },
  { id: 'A10', defect: 'negation flagged on a sibling clause', regime: 'osha-general-industry',
    text: 'The welding bay had no local exhaust ventilation in use during stainless welding, and separately the exit door at the north end of the same bay was blocked by a stack of gas cylinders.',
    expected: 'TWO independent ACTIVE hazards, neither dropped' },
];

function ctx(regime: string) {
  const value = (['osha-general-industry', 'osha-construction', 'msha'].includes(regime) ? regime : 'unknown') as L3RegulatoryContextValue;
  return { value, provenance: value === 'unknown' ? 'UNKNOWN' as const : 'USER_CONFIRMED' as const };
}

async function main(): Promise<void> {
  const outPath = process.env.OUT || '';
  const provider = new OllamaReasoningProvider();
  const traces: unknown[] = [];

  for (const c of CASES) {
    const built = buildReasoningInput({
      analysisId: `rootcause:${c.id}`, observationText: c.text,
      regulatoryContext: ctx(c.regime), allowedHazardFamilies: ALLOWED,
    });

    // Stage 1 -- raw provider proposal (called directly, so nothing is hidden by the runner).
    const raw = await provider.analyzeObservation(built.input);
    const binding = provider.lastTelemetry?.binding ?? null;

    // Stage 2 -- deterministic validator.
    const validation = raw.ok ? validateReasoningProposal(raw.proposal, built.input) : null;

    // Stage 3 -- semantic binder.
    const semantic = validation?.validated ? bindEvidenceSemantically(validation.validated, built.input) : null;

    // Stage 4 -- the shipped pipeline, for the final outcome.
    const run = await runValidatedReasoning(provider, built.input);

    traces.push({
      id: c.id, defect: c.defect, text: c.text, expected: c.expected,
      stage1_rawProposal: raw.ok ? {
        outcome: raw.proposal.outcome,
        candidates: raw.proposal.hazardCandidates.map(h => ({
          key: h.candidateKey, family: h.hazardFamily, state: h.conditionState,
          evidence: h.evidence.map(e => ({ quote: e.quotedText, span: [e.startOffset, e.endOffset] })),
          conditionRationale: h.conditionRationale,
          independentHazardRationale: h.independentHazardRationale,
          clarification: h.clarification,
        })),
      } : { failure: raw.kind, detail: raw.detail },
      stage2_mechanicalBinding: binding,
      stage3_deterministicValidator: validation ? {
        state: validation.state, issues: validation.issues,
        validatedHazardCount: validation.validated?.hazards.length ?? 0,
      } : null,
      stage4_semanticBinder: semantic ? {
        issues: semantic.issues, rejected: semantic.rejected,
        survivingHazardCount: semantic.boundHazards.length,
        surviving: semantic.boundHazards.map(h => `${h.hazardFamily}/${h.conditionState}`),
      } : null,
      stage5_finalOutcome: run.outcome.kind,
      finalHazards: 'reasoning' in run.outcome
        ? run.outcome.reasoning.hazards.map(h => `${h.hazardFamily}/${h.conditionState}`) : [],
    });

    process.stderr.write(`${c.id}: raw=${raw.ok ? raw.proposal.hazardCandidates.length + ' candidates' : raw.kind}`
      + ` validator=${validation?.state ?? 'n/a'}`
      + ` binderRejected=${semantic?.rejected.length ?? 'n/a'}`
      + ` final=${run.outcome.kind}\n`);
  }

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify({ capturedAt: new Date().toISOString(), providerId: provider.providerId, traces }, null, 2) + '\n');
  process.stderr.write(`\nwritten -> ${outPath}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
