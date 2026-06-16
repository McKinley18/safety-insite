import * as fs from 'fs';
import * as path from 'path';
import { SafeScopeReasoningOrchestratorService } from '../src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function textOf(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(textOf).join(' ');
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).map(textOf).join(' ');
  return String(value);
}

function generatedDecisionText(result: any): string {
  return textOf({
    hazardClassification: result.hazardClassification,
    jurisdictionAssessment: result.jurisdictionAssessment,
    applicabilitySignals: result.applicabilitySignals,
    applicabilityAnalysisSummary: result.applicabilityAnalysis?.summary,
    applicabilityConclusionBoundary: result.applicabilityAnalysis?.conclusionBoundary,
    correctiveActionReasoningSummary: result.correctiveActionReasoning?.summary,
    correctiveActionRecommendations: result.correctiveActionReasoning?.recommendations,
    correctiveActionReasoningBoundary: result.correctiveActionReasoning?.reasoningBoundary,
    missingEvidence: result.missingEvidence,
    confidence: result.confidence,
    recommendedNextQuestions: result.recommendedNextQuestions,
    brainSummary: result.brainSnapshot?.situationalAwarenessPacket?.summary
      ? {
          likelyCitation: result.brainSnapshot.situationalAwarenessPacket.summary.likelyCitation,
          likelyMechanism: result.brainSnapshot.situationalAwarenessPacket.summary.likelyMechanism,
          selectedScenarioId: result.brainSnapshot.situationalAwarenessPacket.summary.selectedScenarioId,
          selectedScenarioLabel: result.brainSnapshot.situationalAwarenessPacket.summary.selectedScenarioLabel,
          scenarioConfidence: result.brainSnapshot.situationalAwarenessPacket.summary.scenarioConfidence,
          evidenceGapDisposition: result.brainSnapshot.situationalAwarenessPacket.summary.evidenceGapDisposition,
          evidenceGapHighestSeverity: result.brainSnapshot.situationalAwarenessPacket.summary.evidenceGapHighestSeverity,
          evidenceGapCriticalQuestions: result.brainSnapshot.situationalAwarenessPacket.summary.evidenceGapCriticalQuestions,
          decisionConfidenceLevel: result.brainSnapshot.situationalAwarenessPacket.summary.decisionConfidenceLevel,
          defensibilityScore: result.brainSnapshot.situationalAwarenessPacket.summary.defensibilityScore,
          decisionRecommendedDisposition: result.brainSnapshot.situationalAwarenessPacket.summary.decisionRecommendedDisposition,
          decisionWarnings: result.brainSnapshot.situationalAwarenessPacket.summary.decisionWarnings,
          likelyControls: result.brainSnapshot.situationalAwarenessPacket.summary.likelyControls,
          criticalEvidenceQuestions: result.brainSnapshot.situationalAwarenessPacket.summary.criticalEvidenceQuestions,
        }
      : undefined,
    brainAlignment: result.brainSnapshot?.alignment
      ? JSON.parse(
          JSON.stringify(result.brainSnapshot.alignment),
          (key, val) => (key === 'aliases' ? undefined : val),
        )
      : undefined,
    brainBoundary: result.brainSnapshot?.boundary,
  }).toLowerCase();
}

type FieldRealismPackV2Case = {
  id: string;
  title: string;
  hazardObservation: string;
  siteType: string;
  industryContext: string;
  taskContext: string;
  equipmentInvolved: string;
  photosAvailable: boolean;
  employeeExposureKnown: boolean;
  expectedTerms: string[];
  forbiddenTerms?: string[];
  shouldHaveMissingEvidence?: boolean;
};

const benchmarkPath = path.resolve(
  __dirname,
  '../../safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json',
);

const cases: FieldRealismPackV2Case[] = JSON.parse(fs.readFileSync(benchmarkPath, 'utf8'));

const service = new SafeScopeReasoningOrchestratorService();

type FieldRealismPackV2ResultRow = {
  id: string;
  title: string;
  domain: string;
  jurisdiction: string;
  confidenceLevel: string;
  status: 'pass' | 'fail';
  failureReason?: string;
};

function incrementCount(map: Record<string, number>, key: string | undefined) {
  const normalized = key || 'unknown';
  map[normalized] = (map[normalized] || 0) + 1;
}

function markdownTableEscape(value: unknown): string {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');
}

function writeResultsReport(rows: FieldRealismPackV2ResultRow[]) {
  const rootDir = path.resolve(__dirname, '../..');
  const jsonPath = path.join(
    rootDir,
    'safescope-data/benchmarks/safescope-field-realism-pack-v2-results.v1.json',
  );
  const mdPath = path.join(
    rootDir,
    'project-docs/08-audits/SAFESCOPE_FIELD_REALISM_PACK_V2_RESULTS.md',
  );

  const domainDistribution: Record<string, number> = {};
  const jurisdictionDistribution: Record<string, number> = {};
  const confidenceDistribution: Record<string, number> = {};

  for (const row of rows) {
    incrementCount(domainDistribution, row.domain);
    incrementCount(jurisdictionDistribution, row.jurisdiction);
    incrementCount(confidenceDistribution, row.confidenceLevel);
  }

  const failedRows = rows.filter((row) => row.status === 'fail');

  const resultPayload = {
    benchmark: 'SafeScope Field Realism Pack v2',
    version: 'v1',
    generatedAt: new Date().toISOString(),
    totalCases: rows.length,
    passCount: rows.filter((row) => row.status === 'pass').length,
    failCount: failedRows.length,
    domainDistribution,
    jurisdictionDistribution,
    confidenceDistribution,
    failedCases: failedRows,
    cases: rows,
  };

  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.mkdirSync(path.dirname(mdPath), { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(resultPayload, null, 2)}\n`);

  const distributionLines = (distribution: Record<string, number>) =>
    Object.entries(distribution)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => `| ${markdownTableEscape(key)} | ${count} |`)
      .join('\n');

  const caseRows = rows
    .map((row) =>
      [
        markdownTableEscape(row.id),
        markdownTableEscape(row.title),
        markdownTableEscape(row.domain),
        markdownTableEscape(row.jurisdiction),
        markdownTableEscape(row.confidenceLevel),
        markdownTableEscape(row.status),
        markdownTableEscape(row.failureReason || ''),
      ].join(' | '),
    )
    .map((line) => `| ${line} |`)
    .join('\n');

  const failedSection = failedRows.length
    ? failedRows
        .map((row) => `- **${row.id}** — ${row.failureReason || 'Failed without reason.'}`)
        .join('\n')
    : 'No failed or weak cases identified.';

  const md = `# SafeScope Field Realism Pack v2 Results

## Summary

| Metric | Value |
|---|---:|
| Total cases | ${resultPayload.totalCases} |
| Pass count | ${resultPayload.passCount} |
| Fail count | ${resultPayload.failCount} |

## Domain Distribution

| Domain | Count |
|---|---:|
${distributionLines(domainDistribution)}

## Jurisdiction Distribution

| Jurisdiction | Count |
|---|---:|
${distributionLines(jurisdictionDistribution)}

## Confidence / Risk Distribution

| Confidence / Risk | Count |
|---|---:|
${distributionLines(confidenceDistribution)}

## Failed or Weak Cases

${failedSection}

## Case Results

| ID | Title | Domain | Jurisdiction | Confidence / Risk | Status | Failure reason |
|---|---|---|---|---|---|---|
${caseRows}
`;

  fs.writeFileSync(mdPath, md);
  console.log(`Results JSON: ${jsonPath}`);
  console.log(`Results MD: ${mdPath}`);
}

async function main() {
  const failures: string[] = [];
  const resultRows: FieldRealismPackV2ResultRow[] = [];

  for (const testCase of cases) {
    let result: any = undefined;
    try {
      result = service.reason({
        hazardObservation: testCase.hazardObservation,
        siteType: testCase.siteType,
        industryContext: testCase.industryContext,
        taskContext: testCase.taskContext,
        equipmentInvolved: testCase.equipmentInvolved,
        photosAvailable: testCase.photosAvailable,
        employeeExposureKnown: testCase.employeeExposureKnown,
        enableApprovedKnowledgeContext: true,
      });

      assert(result, `${testCase.id}: result missing.`);
      assert(result.engine === 'safescope_reasoning_orchestrator_v1', `${testCase.id}: engine mismatch.`);
      assert(result.productionReasoningModified === false, `${testCase.id}: must not modify production reasoning.`);

      assert(result.hazardClassification?.primaryDomain, `${testCase.id}: missing hazard classification.`);
      assert(result.jurisdictionAssessment?.likelyJurisdiction, `${testCase.id}: missing jurisdiction assessment.`);
      assert(result.correctiveActionReasoning?.reasoningBoundary?.requiresQualifiedReview === true, `${testCase.id}: must require qualified review.`);
      assert(result.applicabilityAnalysis?.conclusionBoundary?.doesNotDeclareViolation === true, `${testCase.id}: must not declare violation.`);
      assert(result.applicabilityAnalysis?.conclusionBoundary?.doesNotCreateCitation === true, `${testCase.id}: must not create citation.`);

      const combined = textOf({
        requestSummary: result.requestSummary,
        hazardClassification: result.hazardClassification,
        jurisdictionAssessment: result.jurisdictionAssessment,
        applicabilitySignals: result.applicabilitySignals,
        applicabilityAnalysis: result.applicabilityAnalysis,
        correctiveActionReasoning: result.correctiveActionReasoning,
        equipmentTaskMechanismContext: result.equipmentTaskMechanismContext,
        equipmentArchetypeContext: result.equipmentArchetypeContext,
        equipmentReasoningSummary: result.equipmentReasoningSummary,
        brainSummary: result.brainSnapshot?.situationalAwarenessPacket?.summary,
        alignment: result.brainSnapshot?.alignment,
        primaryCitation: result.primaryCitation,
        missingEvidence: result.missingEvidence,
        confidence: result.confidence,
        recommendedNextQuestions: result.recommendedNextQuestions,
      }).toLowerCase();

      const missingExpected = testCase.expectedTerms.filter(
        (term) => !combined.includes(term.toLowerCase()),
      );

      assert(
        missingExpected.length === 0,
        `${testCase.id}: missing expected field-realism term(s): ${missingExpected.join(', ')}`,
      );

      const generatedText = generatedDecisionText(result);

      const forbiddenMatches = (testCase.forbiddenTerms || []).filter(
        (term) => generatedText.includes(term.toLowerCase()),
      );

      assert(
        forbiddenMatches.length === 0,
        `${testCase.id}: false-positive forbidden term(s) appeared in generated decision fields: ${forbiddenMatches.join(', ')}`,
      );

      if (testCase.shouldHaveMissingEvidence) {
        const missingEvidenceText = textOf({
          missingEvidence: result.missingEvidence,
          equipmentReasoningSummary: result.equipmentReasoningSummary,
          recommendedNextQuestions: result.recommendedNextQuestions,
          confidence: result.confidence,
          brainSummary: result.brainSnapshot?.situationalAwarenessPacket?.summary,
        }).toLowerCase();

        assert(
          missingEvidenceText.includes('unknown') ||
            missingEvidenceText.includes('missing') ||
            missingEvidenceText.includes('confirm') ||
            missingEvidenceText.includes('verify') ||
            missingEvidenceText.includes('evidence') ||
            missingEvidenceText.includes('height') ||
            missingEvidenceText.includes('atmosphere') ||
            missingEvidenceText.includes('permit') ||
            missingEvidenceText.includes('employee exposure'),
          `${testCase.id}: incomplete scenario should surface missing-evidence or verification language.`,
        );
      }

      const domain = result.hazardClassification.primaryDomain;
      const jurisdiction = result.jurisdictionAssessment.likelyJurisdiction;
      const confidenceLevel = result.confidence?.level || 'confidence unavailable';

      resultRows.push({
        id: testCase.id,
        title: testCase.title,
        domain,
        jurisdiction,
        confidenceLevel,
        status: 'pass',
      });

      console.log(
        `✅ ${testCase.id}: ${testCase.title} | ${domain} | ${jurisdiction} | ${confidenceLevel}`,
      );
    } catch (error) {
      const failureReason = error instanceof Error ? error.message : String(error);
      failures.push(`${testCase.id}: ${failureReason}`);
      resultRows.push({
        id: testCase.id,
        title: testCase.title,
        domain: 'unknown',
        jurisdiction: 'unknown',
        confidenceLevel: 'unknown',
        status: 'fail',
        failureReason: failureReason,
      });
    }
  }

  writeResultsReport(resultRows);

  if (failures.length) {
    throw new Error(failures.join('\n'));
  }

  console.log('✅ SafeScope Field Realism Pack v2 validation passed.');
  console.log(`Cases: ${cases.length}`);
}

main().catch((error) => {
  console.error('❌ SafeScope Field Realism Pack v2 validation failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
