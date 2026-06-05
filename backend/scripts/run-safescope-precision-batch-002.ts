import * as fs from 'fs';
import * as path from 'path';
import { SafeScopeIntelligenceOrchestrator } from '../src/safescope-v2/orchestration/intelligence-orchestrator.service';

type PrecisionCase = {
  id: string;
  observationText: string;
  jurisdiction: string;
  equipment: string;
  task: string;
  locationContext: string;
  controlFailure: string;
  exposurePattern: string;
  expectedHazardFamily: string;
  expectedScenarioFamily: string;
  expectedMechanism: string;
  expectedRiskBand: string;
  expectedStandardFamily: string;
  notes: string;
};

type ScoreStatus = 'exact_match' | 'actual_value_different' | 'field_not_available';

function normalize(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return 'unknown';
  return value.trim().toLowerCase().replace(/-/g, '_');
}

function score(expected: string, actual: unknown): {
  expected: string;
  actual: string;
  status: ScoreStatus;
} {
  const expectedNorm = normalize(expected);
  const actualNorm = normalize(actual);

  if (!actualNorm || actualNorm === 'unknown') {
    return {
      expected: expectedNorm,
      actual: actualNorm,
      status: 'field_not_available'
    };
  }

  return {
    expected: expectedNorm,
    actual: actualNorm,
    status: expectedNorm === actualNorm ? 'exact_match' : 'actual_value_different'
  };
}

function riskBandFromOutput(output: any): string {
  return (
    output?.calibrationMeta?.riskBand ??
    output?.executiveJudgment?.riskBand ??
    output?.riskReasoning?.initialRiskLevel ??
    'unknown'
  );
}

function standardFamilyFromOutput(output: any): string {
  return (
    output?.calibrationMeta?.standardFamily ??
    output?.scenarioIntelligence?.candidateStandardFamily ??
    output?.standardsReasoning?.topDefensible?.[0]?.standardFamily ??
    output?.standardFamilyCandidates?.[0]?.family ??
    output?.citationLevelCandidates?.[0]?.standardFamily ??
    'unknown'
  );
}

async function main() {
  const datasetPath = path.resolve(
    __dirname,
    '../../safescope-data/benchmarks/safescope-precision-batch-002.v1.json'
  );

  const outputPath = path.resolve(
    __dirname,
    '../../safescope-data/benchmarks/safescope-precision-batch-002-results.v1.json'
  );

  const raw = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));
  const cases: PrecisionCase[] = raw.cases ?? [];

  const orchestrator = new SafeScopeIntelligenceOrchestrator();

  const details = [];

  const summary = {
    total: cases.length,
    metrics: {
      hazardFamily: { exact_match: 0, actual_value_different: 0, field_not_available: 0 },
      scenarioFamily: { exact_match: 0, actual_value_different: 0, field_not_available: 0 },
      mechanism: { exact_match: 0, actual_value_different: 0, field_not_available: 0 },
      riskBand: { exact_match: 0, actual_value_different: 0, field_not_available: 0 },
      standardFamily: { exact_match: 0, actual_value_different: 0, field_not_available: 0 }
    } as Record<string, Record<ScoreStatus, number>>
  };

  for (const record of cases) {
    const input = {
      fusedText: record.observationText,
      promotedPrimary: {
        jurisdiction: record.jurisdiction,
        equipment: record.equipment,
        task: record.task,
        locationContext: record.locationContext,
        controlFailure: record.controlFailure,
        exposurePattern: record.exposurePattern
      } as any,
      classifierResult: {
        ambiguityWarnings: []
      } as any,
      expandedContext: {
        jurisdiction: record.jurisdiction,
        equipment: record.equipment,
        task: record.task,
        locationContext: record.locationContext,
        controlFailure: record.controlFailure,
        exposurePattern: record.exposurePattern
      } as any,
      primaryStandardsResult: {
        suggestedStandards: []
      } as any,
      generatedActions: [],
      additionalHazards: [],
      priorFindings: [],
      workspaceId: 'precision-batch-002',
      standardsFeedback: [],
      correctiveActionOutcomes: [],
      supervisorValidations: []
    };

    const output = await orchestrator.evaluate(input) as any;

    const scoring = {
      hazardFamily: score(
        record.expectedHazardFamily,
        output?.calibrationMeta?.hazardFamily
      ),
      scenarioFamily: score(
        record.expectedScenarioFamily,
        output?.calibrationMeta?.scenarioFamily ?? output?.scenarioIntelligence?.scenarioFamilyId
      ),
      mechanism: score(
        record.expectedMechanism,
        output?.calibrationMeta?.mechanism ?? output?.scenarioIntelligence?.mechanismOfInjury
      ),
      riskBand: score(
        record.expectedRiskBand,
        riskBandFromOutput(output)
      ),
      standardFamily: score(
        record.expectedStandardFamily,
        standardFamilyFromOutput(output)
      )
    };

    for (const [metric, result] of Object.entries(scoring)) {
      summary.metrics[metric][result.status] += 1;
    }

    details.push({
      id: record.id,
      observationText: record.observationText,
      expected: {
        hazardFamily: normalize(record.expectedHazardFamily),
        scenarioFamily: normalize(record.expectedScenarioFamily),
        mechanism: normalize(record.expectedMechanism),
        riskBand: normalize(record.expectedRiskBand),
        standardFamily: normalize(record.expectedStandardFamily)
      },
      actual: {
        hazardFamily: normalize(output?.calibrationMeta?.hazardFamily),
        scenarioFamily: normalize(output?.calibrationMeta?.scenarioFamily ?? output?.scenarioIntelligence?.scenarioFamilyId),
        mechanism: normalize(output?.calibrationMeta?.mechanism ?? output?.scenarioIntelligence?.mechanismOfInjury),
        riskBand: normalize(riskBandFromOutput(output)),
        standardFamily: normalize(standardFamilyFromOutput(output))
      },
      scoring,
      confidence: output?.confidenceIntelligence?.overallConfidence ?? output?.scenarioIntelligence?.confidenceSignals?.score ?? null,
      scenarioReasoning: output?.scenarioIntelligence?.confidenceSignals?.reasoning ?? [],
      evidenceGaps: output?.scenarioIntelligence?.evidenceGaps ?? []
    });
  }

  const report = {
    version: 'v1',
    batch: '002',
    generatedAt: new Date().toISOString(),
    summary,
    details
  };

  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  console.log(JSON.stringify(summary, null, 2));
  console.log(`Output: ${outputPath}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
