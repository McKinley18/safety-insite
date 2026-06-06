import { ApprovedSourceKnowledgeIntakeGovernanceService } from '../src/safescope-v2/approved-source-knowledge-intake-governance/approved-source-knowledge-intake-governance.service';

const service = new ApprovedSourceKnowledgeIntakeGovernanceService();

type Expected = {
  decision: string[];
  authorityTier?: string;
  possibleDuplicate?: boolean;
  mergeAction?: string;
  mappingConfidence?: string[];
  requiresWarning?: string;
  requiresBlockedReason?: string;
  requiresReviewerRequirement?: string;
};

const cases: Array<{
  id: string;
  source: any;
  context?: any;
  expected: Expected;
}> = [
  {
    id: 'ASKIG-001',
    source: {
      agency: 'OSHA',
      authorityTier: 'primary_regulation',
      jurisdiction: 'osha_general_industry',
      citation: '29 CFR 1910.146',
      title: 'Permit-required confined spaces',
      sourceUrl: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.146',
      effectiveDate: '1993-04-15',
      revisionDate: '2024-01-01',
      standardFamily: 'confined_space',
      sourceText: 'OSHA regulation for confined space atmospheric testing attendant permit rescue.',
    },
    expected: {
      decision: ['approved_candidate'],
      authorityTier: 'primary_regulation',
      mappingConfidence: ['high', 'moderate'],
      requiresReviewerRequirement: 'qualified reviewer approval',
    },
  },
  {
    id: 'ASKIG-002',
    source: {
      agency: 'MSHA',
      authorityTier: 'primary_regulation',
      jurisdiction: 'msha',
      citation: '30 CFR 56.14105',
      title: 'Procedures during repairs or maintenance',
      sourceUrl: 'https://www.ecfr.gov/current/title-30/chapter-I/subchapter-K/part-56',
      effectiveDate: '1988-01-01',
      revisionDate: '2024-01-01',
      standardFamily: 'machine_guarding_energy_control',
      sourceText: 'MSHA regulation lockout repairs maintenance machinery conveyor unexpected startup.',
    },
    expected: {
      decision: ['approved_candidate'],
      authorityTier: 'primary_regulation',
      mappingConfidence: ['high', 'moderate'],
      requiresReviewerRequirement: 'qualified reviewer approval',
    },
  },
  {
    id: 'ASKIG-003',
    source: {
      agency: 'unknown',
      title: 'Random safety note',
      sourceText: 'A note copied from an unknown source.',
    },
    expected: {
      decision: ['blocked', 'rejected'],
      authorityTier: 'unknown',
      requiresBlockedReason: 'unknown',
    },
  },
  {
    id: 'ASKIG-004',
    source: {
      agency: 'OSHA',
      authorityTier: 'primary_regulation',
      jurisdiction: 'osha_general_industry',
      title: 'Walking-working surfaces opening protection',
      sourceUrl: 'https://www.osha.gov/laws-regs',
      revisionDate: '2024-01-01',
      standardFamily: 'walking_working_surfaces_fall_protection',
      sourceText: 'OSHA walking-working surfaces floor hole fall protection.',
    },
    expected: {
      decision: ['rejected', 'blocked'],
      requiresBlockedReason: 'citation',
    },
  },
  {
    id: 'ASKIG-005',
    source: {
      agency: 'OSHA',
      authorityTier: 'primary_regulation',
      jurisdiction: 'osha_general_industry',
      citation: '29 CFR 1910.146',
      title: 'Permit-required confined spaces',
      sourceUrl: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.146',
      revisionDate: '2024-01-01',
      standardFamily: 'confined_space',
      sourceText: 'OSHA confined space atmospheric testing permit attendant rescue.',
    },
    context: {
      existingApprovedKnowledge: [
        {
          agency: 'OSHA',
          jurisdiction: 'osha_general_industry',
          citation: '29 CFR 1910.146',
          title: 'Permit-required confined spaces',
          standardFamily: 'confined_space',
        },
      ],
    },
    expected: {
      decision: ['needs_review'],
      possibleDuplicate: true,
      mergeAction: 'review_merge',
      requiresWarning: 'duplicate',
    },
  },
  {
    id: 'ASKIG-006',
    source: {
      agency: 'company_policy',
      authorityTier: 'company_policy',
      jurisdiction: 'site_policy',
      citation: 'POL-LOTO-001',
      title: 'Site lockout policy',
      sourceUrl: 'internal://policy/POL-LOTO-001',
      revisionDate: '2024-01-01',
      standardFamily: 'machine_guarding_energy_control',
      sourceText: 'Company policy for lockout and energy isolation.',
    },
    expected: {
      decision: ['needs_review'],
      authorityTier: 'company_policy',
      requiresReviewerRequirement: 'company policy',
    },
  },
  {
    id: 'ASKIG-007',
    source: {
      agency: 'ANSI',
      authorityTier: 'consensus_standard',
      jurisdiction: 'consensus',
      citation: 'ANSI Z117.1',
      title: 'Safety requirements for entering confined spaces',
      sourceUrl: 'https://www.ansi.org/',
      revisionDate: '2022-01-01',
      standardFamily: 'confined_space',
      sourceText: 'Consensus standard confined space entry atmospheric testing rescue.',
    },
    expected: {
      decision: ['needs_review'],
      authorityTier: 'consensus_standard',
      requiresReviewerRequirement: 'consensus standard',
    },
  },
  {
    id: 'ASKIG-008',
    source: {
      agency: 'OSHA',
      authorityTier: 'official_guidance',
      jurisdiction: 'osha_general_industry',
      citation: 'OSHA-GUIDANCE-LOCKOUT',
      title: 'Lockout guidance',
      sourceUrl: 'https://www.osha.gov/',
      standardFamily: 'machine_guarding_energy_control',
      sourceText: 'Official guidance lockout hazardous energy control.',
    },
    expected: {
      decision: ['needs_review', 'approved_candidate'],
      authorityTier: 'official_guidance',
      requiresWarning: 'date status is unknown',
    },
  },
  {
    id: 'ASKIG-009',
    source: {
      agency: 'OSHA',
      authorityTier: 'official_guidance',
      jurisdiction: 'osha_general_industry',
      citation: 'OLD-OSHA-GUIDANCE',
      title: 'Old guidance document',
      sourceUrl: 'https://www.osha.gov/',
      effectiveDate: 'outdated',
      revisionDate: 'superseded',
      standardFamily: 'walking_working_surfaces_fall_protection',
      sourceText: 'Outdated guidance floor hole fall protection.',
    },
    expected: {
      decision: ['needs_review'],
      authorityTier: 'official_guidance',
      requiresWarning: 'outdated',
    },
  },
];

async function main() {
  let failures = 0;

  for (const item of cases) {
    const result = await service.evaluateIntake(item.source, item.context || {});
    const errors: string[] = [];
    const expected = item.expected;

    if (!expected.decision.includes(result.intakeDecision)) {
      errors.push(`decision expected one of ${expected.decision.join(', ')} got ${result.intakeDecision}`);
    }

    if (expected.authorityTier && result.sourceAuthority.authorityTier !== expected.authorityTier) {
      errors.push(`authorityTier expected ${expected.authorityTier} got ${result.sourceAuthority.authorityTier}`);
    }

    if (expected.possibleDuplicate !== undefined && result.duplicateGovernance.possibleDuplicate !== expected.possibleDuplicate) {
      errors.push(`possibleDuplicate expected ${expected.possibleDuplicate} got ${result.duplicateGovernance.possibleDuplicate}`);
    }

    if (expected.mergeAction && result.duplicateGovernance.recommendedMergeAction !== expected.mergeAction) {
      errors.push(`mergeAction expected ${expected.mergeAction} got ${result.duplicateGovernance.recommendedMergeAction}`);
    }

    if (expected.mappingConfidence && !expected.mappingConfidence.includes(result.mappingGovernance.mappingConfidence)) {
      errors.push(`mappingConfidence expected one of ${expected.mappingConfidence.join(', ')} got ${result.mappingGovernance.mappingConfidence}`);
    }

    if (expected.requiresWarning) {
      const warningText = result.governanceWarnings.join(' ').toLowerCase();
      if (!warningText.includes(expected.requiresWarning.toLowerCase())) {
        errors.push(`expected governance warning containing ${expected.requiresWarning}`);
      }
    }

    if (expected.requiresBlockedReason) {
      const blockedText = result.blockedReasons.join(' ').toLowerCase();
      if (!blockedText.includes(expected.requiresBlockedReason.toLowerCase())) {
        errors.push(`expected blocked reason containing ${expected.requiresBlockedReason}`);
      }
    }

    if (expected.requiresReviewerRequirement) {
      const reviewerText = result.reviewerRequirements.join(' ').toLowerCase();
      if (!reviewerText.includes(expected.requiresReviewerRequirement.toLowerCase())) {
        errors.push(`expected reviewer requirement containing ${expected.requiresReviewerRequirement}`);
      }
    }

    if (
      !result.advisoryGuardrails.advisoryOnly ||
      !result.advisoryGuardrails.doesNotDeclareViolation ||
      !result.advisoryGuardrails.doesNotCreateCitation ||
      !result.advisoryGuardrails.requiresQualifiedReview
    ) {
      errors.push('advisory guardrails were not preserved');
    }

    const safeText = JSON.stringify({
      ...result,
      advisoryGuardrails: undefined,
    }).toLowerCase();

    if (
      safeText.includes('automatically promote') ||
      safeText.includes('write approved knowledge') ||
      safeText.includes('persist approved knowledge') ||
      safeText.includes('without reviewer approval')
    ) {
      errors.push('ASKIG output used unsafe auto-promotion language');
    }

    if (errors.length) {
      failures += 1;
      console.error(`❌ ${item.id}`);
      for (const error of errors) console.error(`  - ${error}`);
      console.error(JSON.stringify(result, null, 2));
    } else {
      console.log(`✅ ${item.id}: ${result.intakeDecision} / tier=${result.sourceAuthority.authorityTier} / duplicate=${result.duplicateGovernance.possibleDuplicate}`);
    }
  }

  if (failures > 0) {
    throw new Error(`${failures} approved-source-knowledge-intake-governance validation case(s) failed.`);
  }

  console.log('✅ SafeScope approved source knowledge intake governance validation passed.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
