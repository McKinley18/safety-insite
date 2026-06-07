import { execSync } from 'child_process';

const args = process.argv.slice(2);
const area = args.find(a => a.startsWith('--area='))?.split('=')[1];

const validatorGroups: Record<string, string[]> = {
    taxonomy: [
        'validate-safescope-hazard-taxonomy-coverage.ts',
        'validate-safescope-hazard-information-absorption.ts'
    ],
    knowledge: [
        'validate-safescope-approved-knowledge-review-api-v1.ts',
        'validate-safescope-approved-knowledge-promotion-v1.ts',
        'validate-safescope-approved-knowledge-retrieval-output-v1.ts',
        'validate-safescope-approved-knowledge-registry-io.ts',
        'validate-safescope-approved-knowledge-search.ts',
        'validate-safescope-approved-knowledge-registry-schema.ts',
        'validate-safescope-source-freshness-governance-v1.ts',
        'validate-safescope-jurisdiction-applicability-decision-tree-v1.ts',
        'validate-safescope-source-ingestion-approved-update-workflow-v1.ts',
        'validate-safescope-reviewer-candidate-console-v1.ts',
        'validate-safescope-reviewer-candidate-console-api-contract-v1.ts',
        'validate-safescope-semantic-synonym-expansion-v1.ts',
        'validate-safescope-visual-evidence-reasoning-v1.ts',
        'validate-safescope-visual-evidence-api-ui-wiring-v1.ts',
        'validate-safescope-real-image-analysis-v1.ts',
        'validate-safescope-production-persistence-audit-storage-v1.ts',
        'validate-safescope-full-regulatory-knowledge-expansion-v1.ts',
        'validate-safescope-regulatory-dedup-citation-normalization-v1.ts',
        'validate-safescope-role-based-approval-gates-v1.ts',
        'validate-safescope-offline-reasoning-mobile-resilience-v1.ts',
        'validate-safescope-workspace-auth-governance-v1.ts',
        'validate-safescope-staging-hardening-v1.ts',
        'validate-safescope-field-test-scenario-packs-v1.ts'
    ],
    output: [
        'validate-safescope-approved-knowledge-retrieval-output-v1.ts',
        'validate-safescope-field-output-composer-v1.ts',
        'validate-safescope-field-evidence-weighting-v1.ts',
        'validate-safescope-multi-hazard-decomposition-v1.ts',
        'validate-safescope-observation-narrative-synthesis-v1.ts',
        'validate-safescope-cross-domain-causal-chain-v1.ts',
        'validate-safescope-corrective-action-strategy-ranking-v1.ts',
        'validate-safescope-risk-verification-residual-risk-v1.ts',
        'validate-safescope-human-review-feedback-loop-v1.ts',
        'validate-safescope-source-freshness-governance-v1.ts',
        'validate-safescope-jurisdiction-applicability-decision-tree-v1.ts',
        'validate-safescope-audit-ready-reasoning-trace-v1.ts',
        'validate-safescope-source-ingestion-approved-update-workflow-v1.ts',
        'validate-safescope-reviewer-candidate-console-v1.ts',
        'validate-safescope-reviewer-candidate-console-api-contract-v1.ts',
        'validate-safescope-semantic-synonym-expansion-v1.ts',
        'validate-safescope-visual-evidence-reasoning-v1.ts',
        'validate-safescope-visual-evidence-api-ui-wiring-v1.ts',
        'validate-safescope-real-image-analysis-v1.ts',
        'validate-safescope-production-persistence-audit-storage-v1.ts',
        'validate-safescope-full-regulatory-knowledge-expansion-v1.ts',
        'validate-safescope-regulatory-dedup-citation-normalization-v1.ts',
        'validate-safescope-role-based-approval-gates-v1.ts',
        'validate-safescope-offline-reasoning-mobile-resilience-v1.ts',
        'validate-safescope-workspace-auth-governance-v1.ts',
        'validate-safescope-field-test-scenario-packs-v1.ts',
        'validate-safescope-field-output-contract.ts'
    ],
    orchestrator: [
        'validate-safescope-orchestrator-field-output-wiring.ts',
        'validate-safescope-governance-output-snapshot.ts',
        'validate-safescope-field-evidence-weighting-v1.ts',
        'validate-safescope-multi-hazard-decomposition-v1.ts',
        'validate-safescope-observation-narrative-synthesis-v1.ts',
        'validate-safescope-cross-domain-causal-chain-v1.ts',
        'validate-safescope-corrective-action-strategy-ranking-v1.ts',
        'validate-safescope-risk-verification-residual-risk-v1.ts',
        'validate-safescope-human-review-feedback-loop-v1.ts',
        'validate-safescope-source-freshness-governance-v1.ts',
        'validate-safescope-jurisdiction-applicability-decision-tree-v1.ts',
        'validate-safescope-audit-ready-reasoning-trace-v1.ts',
        'validate-safescope-source-ingestion-approved-update-workflow-v1.ts',
        'validate-safescope-reviewer-candidate-console-v1.ts',
        'validate-safescope-reviewer-candidate-console-api-contract-v1.ts',
        'validate-safescope-semantic-synonym-expansion-v1.ts',
        'validate-safescope-visual-evidence-reasoning-v1.ts',
        'validate-safescope-visual-evidence-api-ui-wiring-v1.ts',
        'validate-safescope-real-image-analysis-v1.ts',
        'validate-safescope-production-persistence-audit-storage-v1.ts',
        'validate-safescope-full-regulatory-knowledge-expansion-v1.ts',
        'validate-safescope-regulatory-dedup-citation-normalization-v1.ts',
        'validate-safescope-role-based-approval-gates-v1.ts',
        'validate-safescope-offline-reasoning-mobile-resilience-v1.ts',
        'validate-safescope-workspace-auth-governance-v1.ts',
        'validate-safescope-field-test-scenario-packs-v1.ts',
        'validate-safescope-main-output-observation-understanding.ts',
        'validate-safescope-observation-trace-snapshot.ts'
    ],
    governance: [
        'validate-safescope-governance-output-snapshot.ts',
        'validate-safescope-governance-pipeline-contract.ts',
        'validate-safescope-field-evidence-weighting-v1.ts',
        'validate-safescope-approved-knowledge-registry-write-guard.ts',
        'validate-safescope-approved-knowledge-promotion-workflow-governance.ts',
        'validate-safescope-approved-source-knowledge-intake-governance.ts',
        'validate-safescope-source-backed-applicability-governance.ts',
        'validate-safescope-human-review-learning-governance.ts',
        'validate-safescope-human-review-feedback-loop-v1.ts',
        'validate-safescope-source-freshness-governance-v1.ts',
        'validate-safescope-jurisdiction-applicability-decision-tree-v1.ts',
        'validate-safescope-audit-ready-reasoning-trace-v1.ts',
        'validate-safescope-source-ingestion-approved-update-workflow-v1.ts',
        'validate-safescope-reviewer-candidate-console-v1.ts',
        'validate-safescope-reviewer-candidate-console-api-contract-v1.ts',
        'validate-safescope-semantic-synonym-expansion-v1.ts',
        'validate-safescope-visual-evidence-reasoning-v1.ts',
        'validate-safescope-visual-evidence-api-ui-wiring-v1.ts',
        'validate-safescope-real-image-analysis-v1.ts',
        'validate-safescope-production-persistence-audit-storage-v1.ts',
        'validate-safescope-full-regulatory-knowledge-expansion-v1.ts',
        'validate-safescope-regulatory-dedup-citation-normalization-v1.ts',
        'validate-safescope-role-based-approval-gates-v1.ts',
        'validate-safescope-offline-reasoning-mobile-resilience-v1.ts',
        'validate-safescope-workspace-auth-governance-v1.ts',
        'validate-safescope-field-test-scenario-packs-v1.ts',
        'validate-safescope-output-policy.ts',
        'validate-safescope-confidence-governance.ts'
    ],
    precision: [
        'run-safescope-precision-batch-001.ts',
        'run-safescope-precision-batch-002.ts',
        'run-safescope-precision-batch-003.ts'
    ],
    core: [
        'audit-safescope-system-index.ts',
        'validate-safescope-hazard-taxonomy-coverage.ts',
        'validate-safescope-field-evidence-weighting-v1.ts',
        'validate-safescope-multi-hazard-decomposition-v1.ts',
        'validate-safescope-observation-narrative-synthesis-v1.ts',
        'validate-safescope-cross-domain-causal-chain-v1.ts',
        'validate-safescope-corrective-action-strategy-ranking-v1.ts',
        'validate-safescope-risk-verification-residual-risk-v1.ts',
        'validate-safescope-human-review-feedback-loop-v1.ts',
        'validate-safescope-source-freshness-governance-v1.ts',
        'validate-safescope-jurisdiction-applicability-decision-tree-v1.ts',
        'validate-safescope-audit-ready-reasoning-trace-v1.ts',
        'validate-safescope-source-ingestion-approved-update-workflow-v1.ts',
        'validate-safescope-reviewer-candidate-console-v1.ts',
        'validate-safescope-reviewer-candidate-console-api-contract-v1.ts',
        'validate-safescope-semantic-synonym-expansion-v1.ts',
        'validate-safescope-visual-evidence-reasoning-v1.ts',
        'validate-safescope-visual-evidence-api-ui-wiring-v1.ts',
        'validate-safescope-real-image-analysis-v1.ts',
        'validate-safescope-production-persistence-audit-storage-v1.ts',
        'validate-safescope-full-regulatory-knowledge-expansion-v1.ts',
        'validate-safescope-regulatory-dedup-citation-normalization-v1.ts',
        'validate-safescope-role-based-approval-gates-v1.ts',
        'validate-safescope-offline-reasoning-mobile-resilience-v1.ts',
        'validate-safescope-workspace-auth-governance-v1.ts',
        'validate-safescope-field-test-scenario-packs-v1.ts',
        'validate-safescope-approved-knowledge-retrieval-output-v1.ts',
        'validate-safescope-field-output-composer-v1.ts',
        'validate-safescope-orchestrator-field-output-wiring.ts',
        'validate-safescope-field-output-contract.ts'
    ]
};

if (!area) {
    console.error('Usage: npx ts-node scripts/run-safescope-targeted-validation.ts --area=<area>');
    process.exit(1);
}

const validators = area === 'all' 
    ? [...new Set(Object.values(validatorGroups).flat())]
    : validatorGroups[area] || [];

if (validators.length === 0) {
    console.error(`No validators found for area: ${area}`);
    process.exit(1);
}

console.log(`--- Running targeted validation: ${area} ---`);
for (const validator of validators) {
    console.log(`Running: ${validator}`);
    try {
        execSync(`npx ts-node scripts/${validator}`, { stdio: 'inherit' });
    } catch (e) {
        console.error(`Validator failed: ${validator}`);
        process.exit(1);
    }
}
console.log('✅ Targeted validation passed.');
