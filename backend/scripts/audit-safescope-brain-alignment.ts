import * as fs from 'fs/promises';
import * as path from 'path';
import { SafeScopeReasoningOrchestratorService } from '../src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service';
import { SafeScopeReasoningRequest } from '../src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.types';


function buildBenchmarkSearchText(testCase: any): string {
  const parts = [
    testCase.findingDescription,
    testCase.description,
    testCase.finding,
    testCase.narrative,
    testCase.text,
    testCase.title,
    testCase.expected?.hazardFamily,
    testCase.expected?.hazardMechanism,
    testCase.expected?.equipment,
  ];

  return parts
    .filter((value) => typeof value === 'string' && value.trim().length > 0)
    .join(' ');
}


const PROJECT_ROOT = path.resolve(__dirname, '../..');
const BENCHMARK_PATH = path.join(PROJECT_ROOT, 'safescope-data/benchmarks/safescope-finding-audit.v1.json');
const RESULTS_JSON_PATH = path.join(PROJECT_ROOT, 'safescope-data/benchmarks/safescope-brain-alignment-audit-results.v1.json');
const RESULTS_MD_PATH = path.join(PROJECT_ROOT, 'project-docs/08-audits/SAFESCOPE_BRAIN_ALIGNMENT_AUDIT_RESULTS.md');

const DOMAIN_MAP: Record<string, string> = {
  excavation_trenching: 'trenching_and_excavation',
  ground_control: 'roof_control',
};

function normalizeDomain(domain: string | undefined): string {
  if (!domain) return '';
  return DOMAIN_MAP[domain] || domain;
}

function normalizeCitation(citation: string | undefined): string {
  return String(citation || '').trim();
}

function sameMechanismFamily(expected: string | undefined, actual: string | undefined): boolean {
  const e = String(expected || '').trim();
  const a = String(actual || '').trim();

  if (!e || !a) return false;
  if (e === a) return true;

  const rotating = new Set(['rotating_equipment', 'rotating_equipment_nip_point']);
  const struck = new Set(['pedestrian_strike', 'struck_by', 'struck_by_mobile_equipment']);

  return (
    (rotating.has(e) && rotating.has(a)) ||
    (struck.has(e) && struck.has(a))
  );
}

function scoreAlignment(params: {
  expectedDomain: string;
  nativeDomain: string;
  expectedCitation: string;
  nativeCitation?: string;
  brainCitation?: string;
  expectedMechanism: string;
  nativeMechanism?: string;
  brainMechanism?: string;
  evidenceQuestionCount: number;
  controlCount: number;
  snapshotPresent: boolean;
  selectedScenarioId?: string;
  scenarioConfidence?: string;
  scenarioHumanReviewRecommended?: boolean;
}) {
  let score = 0;
  const notes: string[] = [];

  if (params.snapshotPresent) score += 10;
  else notes.push('Brain snapshot missing.');

  if (params.nativeDomain === params.expectedDomain) score += 15;
  else notes.push(`Native domain mismatch: expected ${params.expectedDomain}, got ${params.nativeDomain}.`);

  if (normalizeCitation(params.nativeCitation) === params.expectedCitation) score += 15;
  else notes.push(`Native citation mismatch: expected ${params.expectedCitation}, got ${params.nativeCitation || 'N/A'}.`);

  if (normalizeCitation(params.brainCitation) === params.expectedCitation) score += 25;
  else notes.push(`Brain citation mismatch: expected ${params.expectedCitation}, got ${params.brainCitation || 'N/A'}.`);

  if (sameMechanismFamily(params.expectedMechanism, params.nativeMechanism)) score += 10;
  else notes.push(`Native mechanism mismatch: expected ${params.expectedMechanism}, got ${params.nativeMechanism || 'N/A'}.`);

  if (sameMechanismFamily(params.expectedMechanism, params.brainMechanism)) score += 15;
  else notes.push(`Brain mechanism mismatch: expected ${params.expectedMechanism}, got ${params.brainMechanism || 'N/A'}.`);

  if (params.evidenceQuestionCount > 0) score += 5;
  else notes.push('Brain snapshot returned no critical evidence questions.');

  if (params.controlCount > 0) score += 5;
  else notes.push('Brain snapshot returned no likely controls.');

  /*
   * Scenario disambiguation is traceability context, not proof of correctness.
   * Only moderate/high confidence selections receive a small audit credit.
   * Low-confidence selections are reported but do not improve alignment score.
   */
  if (!params.selectedScenarioId) {
    notes.push('No scenario disambiguation selection was returned.');
  } else if (params.scenarioConfidence === 'high') {
    score += 5;
  } else if (params.scenarioConfidence === 'moderate') {
    score += 3;
  } else {
    notes.push(`Scenario disambiguation confidence was ${params.scenarioConfidence || 'N/A'}.`);
  }

  const result = score >= 90 ? 'pass' : score >= 70 ? 'review' : 'fail';

  return { score, result, notes };
}

async function runAudit() {
  console.log('Starting SafeScope Brain Alignment Audit...');

  const orchestrator = new SafeScopeReasoningOrchestratorService();
  const rawData = await fs.readFile(BENCHMARK_PATH, 'utf-8');
  const benchmarks = JSON.parse(rawData);

  const results: any[] = [];
  let totalScore = 0;

  for (const testCase of benchmarks) {
    const benchmarkSearchText = buildBenchmarkSearchText(testCase);

    const request: SafeScopeReasoningRequest = {
      hazardObservation: benchmarkSearchText,
      siteType: testCase.context.industry === 'mining' ? 'mine' : 'facility',
      taskContext: testCase.context.task,
      industryContext: testCase.context.industry,
      equipmentInvolved: testCase.context.equipment,
      enableApprovedKnowledgeContext: true,
      photosAvailable: false,
      employeeExposureKnown: true,
      measurementsAvailable: false,
    };

    const reasoning = orchestrator.reason(request);
    const snapshot = reasoning.brainSnapshot;
    const packet = snapshot?.situationalAwarenessPacket;

    const expectedDomain = normalizeDomain(testCase.expected.hazardFamily);
    const nativeDomain = normalizeDomain(reasoning.hazardClassification.primaryDomain);
    const expectedCitation = normalizeCitation(testCase.expected.primaryCitation);
    const nativeCitation = normalizeCitation(reasoning.primaryCitation);
    const brainCitation = normalizeCitation(packet?.summary.likelyCitation);
    const expectedMechanism = testCase.expected.hazardMechanism;
    const nativeMechanism = reasoning.resolvedMechanism?.mechanismId;
    const brainMechanism = packet?.summary.likelyMechanism;
    const selectedScenarioId = packet?.summary.selectedScenarioId;
    const selectedScenarioLabel = packet?.summary.selectedScenarioLabel;
    const scenarioConfidence = packet?.summary.scenarioConfidence;
    const scenarioHumanReviewRecommended = packet?.summary.scenarioHumanReviewRecommended;

    const evidenceQuestionCount = packet?.summary.criticalEvidenceQuestions.length || 0;
    const controlCount = packet?.summary.likelyControls.length || 0;

    const scored = scoreAlignment({
      expectedDomain,
      nativeDomain,
      expectedCitation,
      nativeCitation,
      brainCitation,
      expectedMechanism,
      nativeMechanism,
      brainMechanism,
      evidenceQuestionCount,
      controlCount,
      snapshotPresent: Boolean(snapshot),
      selectedScenarioId,
      scenarioConfidence,
      scenarioHumanReviewRecommended,
    });

    totalScore += scored.score;

    results.push({
      id: testCase.id,
      title: testCase.title,
      expected: {
        domain: expectedDomain,
        citation: expectedCitation,
        mechanism: expectedMechanism,
      },
      native: {
        domain: nativeDomain,
        citation: nativeCitation,
        mechanism: nativeMechanism,
      },
      brain: {
        citation: brainCitation,
        mechanism: brainMechanism,
        evidenceQuestionCount,
        controlCount,
        alignmentNotes: snapshot?.alignment.notes || [],
        compartmentSummaries: packet?.summary.compartmentSummaries || [],
      },
      scenario: {
        selectedScenarioId,
        selectedScenarioLabel,
        confidence: scenarioConfidence,
        humanReviewRecommended: scenarioHumanReviewRecommended,
      },
      score: scored.score,
      result: scored.result,
      notes: scored.notes,
    });
  }

  await fs.writeFile(RESULTS_JSON_PATH, JSON.stringify(results, null, 2));

  let report = '# SafeScope Brain Alignment Audit Results\n\n';
  report += `- Total cases: ${results.length}\n`;
  report += `- Pass: ${results.filter((r) => r.result === 'pass').length}\n`;
  report += `- Review: ${results.filter((r) => r.result === 'review').length}\n`;
  report += `- Fail: ${results.filter((r) => r.result === 'fail').length}\n`;
  report += `- Average alignment score: ${(totalScore / Math.max(results.length, 1)).toFixed(2)}\n\n`;

  report += '| ID | Expected Citation | Native Citation | Brain Citation | Expected Mechanism | Native Mechanism | Brain Mechanism | Scenario | Scenario Confidence | Evidence Qs | Controls | Score | Result | Notes |\n';
  report += '| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | ---: | ---: | ---: | :--- | :--- |\n';

  for (const r of results) {
    report += `| ${r.id} | ${r.expected.citation} | ${r.native.citation} | ${r.brain.citation} | ${r.expected.mechanism} | ${r.native.mechanism || 'N/A'} | ${r.brain.mechanism || 'N/A'} | ${r.scenario?.selectedScenarioId || 'N/A'} | ${r.scenario?.confidence || 'N/A'} | ${r.brain.evidenceQuestionCount} | ${r.brain.controlCount} | ${r.score} | ${r.result} | ${r.notes.join('; ')} |\n`;
  }

  await fs.writeFile(RESULTS_MD_PATH, report);

  console.log('✅ SafeScope Brain Alignment Audit complete.');
  console.log(`Results JSON: ${RESULTS_JSON_PATH}`);
  console.log(`Results MD: ${RESULTS_MD_PATH}`);
  console.log(`Average alignment score: ${(totalScore / Math.max(results.length, 1)).toFixed(2)}`);
}

runAudit().catch((error) => {
  console.error(error);
  process.exit(1);
});
