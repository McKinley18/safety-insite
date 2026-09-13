/**
 * ONE diagnostic provider call, to answer a question the probe's counts cannot:
 * when the collections came back empty, did the model REASON and decline to propose, or did it
 * return an empty husk?
 *
 * This distinguishes a model-capability finding from a prompt-design defect, and those have
 * completely different remediations. Local, $0.00, one call.
 */
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { OllamaExpertProvider } from '../src/hazlenz/expert-hazlenz-adapters/ollama-expert-provider';
import { runExpertAnalysis } from '../src/hazlenz/expert-hazlenz/expert-runner';
import { EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput } from '../src/hazlenz/expert-hazlenz/expert-contract.types';

const OBS = 'An extension cord ran through standing water to a sump pump while a worker reached into '
  + 'the pump housing to clear a blockage.';

const input: ExpertAnalysisInput = {
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'diag-1',
  authoritativeSources: [{ sourceId: 'obs-1', sourceType: 'observation', text: OBS }],
  inspectionContext: { location: 'Plant 2', task: 'routine walkthrough' },
  jurisdiction: 'osha-general-industry',
  allowedHazardFamilies: ['electrical', 'lockout_tagout', 'confined_space', 'machine_guarding', 'wet_environment'],
  deterministicFindings: [
    { findingKey: 'f1', hazardFamily: 'electrical', conditionState: 'ACTIVE', isLifeCritical: true,
      isActionable: true, requiredActions: ['de-energize and remove the cord from the water'] },
  ],
  governedStandards: [],
  answeredClarifications: [],
};

(async () => {
  const provider = new OllamaExpertProvider();
  const run = await runExpertAnalysis(provider, input, { nowIso: '2026-08-29T00:00:00.000Z' });
  const out = join(__dirname, '..', '..', 'verification',
    'expert-hazlenz-provider-transport-probe-2026-08-29', 'results');
  mkdirSync(out, { recursive: true });
  const payload = {
    layerStatus: run.layer.status,
    issues: run.issues.map(i => i.code),
    telemetry: provider.lastTelemetry,
    analysis: run.layer.validated?.analysis ?? null,
  };
  writeFileSync(join(out, 'content-diagnostic.json'), JSON.stringify(payload, null, 2) + '\n');
  console.log(JSON.stringify(payload, null, 2));
})();
