type FieldOutputContract = {
  version: 'field_output_v1';
  primaryMessage: string;
  summary: string;
  priority: string;
  recommendedDisposition: string;
  immediateControls: string[];
  correctiveActions: Array<{
    title: string;
    description?: string;
    priority?: string;
    suggestedFixes?: string[];
    verification?: string;
    source?: string;
  }>;
  verificationEvidence: string[];
  evidenceGaps: string[];
  supervisorQuestions: string[];
  warnings: string[];
  boundary: {
    requiresQualifiedReview: true;
    canDeclareViolation: false;
    canBypassHumanReview: false;
  };
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertNonEmptyString(value: unknown, label: string) {
  assert(
    typeof value === 'string' && value.trim().length > 0,
    `${label} must be a non-empty string.`,
  );
}

function assertStringArray(value: unknown, label: string) {
  assert(Array.isArray(value), `${label} must be an array.`);
  for (const item of value as unknown[]) {
    assertNonEmptyString(item, `${label} item`);
  }
}

function buildRepresentativeFieldOutput(): FieldOutputContract {
  return {
    version: 'field_output_v1',
    primaryMessage: 'Stop exposed work and correct the condition before resuming normal operation.',
    summary:
      'SafeScope field output summarizes immediate controls, corrective actions, verification evidence, and review triggers for field use.',
    priority: 'High',
    recommendedDisposition: 'proceed_with_human_review',
    immediateControls: [
      'Restrict access to the exposure area.',
      'Stop affected work until controls are verified.',
    ],
    correctiveActions: [
      {
        title: 'Correct and verify the hazardous condition',
        description:
          'Apply the selected control, document the correction, and verify effectiveness before closure.',
        priority: 'High',
        suggestedFixes: [
          'Install or restore the required control.',
          'Document supervisor verification.',
        ],
        verification:
          'Photo evidence and supervisor verification required before closure.',
        source: 'SafeScope field output',
      },
    ],
    verificationEvidence: [
      'Photo of corrected condition',
      'Supervisor verification record',
    ],
    evidenceGaps: [
      'Confirm employee exposure and task context.',
      'Confirm whether the condition was corrected before work resumed.',
    ],
    supervisorQuestions: [
      'What task was occurring when the condition was observed?',
      'What evidence confirms the correction was completed?',
    ],
    warnings: [
      'SafeScope output requires qualified review before final report use.',
    ],
    boundary: {
      requiresQualifiedReview: true,
      canDeclareViolation: false,
      canBypassHumanReview: false,
    },
  };
}

function validateFieldOutputContract(fieldOutput: FieldOutputContract) {
  assert(
    fieldOutput.version === 'field_output_v1',
    'fieldOutput.version must be field_output_v1.',
  );

  assertNonEmptyString(fieldOutput.primaryMessage, 'fieldOutput.primaryMessage');
  assertNonEmptyString(fieldOutput.summary, 'fieldOutput.summary');
  assertNonEmptyString(fieldOutput.priority, 'fieldOutput.priority');
  assertNonEmptyString(
    fieldOutput.recommendedDisposition,
    'fieldOutput.recommendedDisposition',
  );

  assertStringArray(fieldOutput.immediateControls, 'fieldOutput.immediateControls');
  assertStringArray(fieldOutput.verificationEvidence, 'fieldOutput.verificationEvidence');
  assertStringArray(fieldOutput.evidenceGaps, 'fieldOutput.evidenceGaps');
  assertStringArray(fieldOutput.supervisorQuestions, 'fieldOutput.supervisorQuestions');
  assertStringArray(fieldOutput.warnings, 'fieldOutput.warnings');

  assert(
    Array.isArray(fieldOutput.correctiveActions),
    'fieldOutput.correctiveActions must be an array.',
  );
  assert(
    fieldOutput.correctiveActions.length > 0,
    'fieldOutput.correctiveActions must not be empty.',
  );

  for (const action of fieldOutput.correctiveActions) {
    assertNonEmptyString(action.title, 'fieldOutput.correctiveActions.title');

    if (action.description !== undefined) {
      assertNonEmptyString(
        action.description,
        'fieldOutput.correctiveActions.description',
      );
    }

    if (action.priority !== undefined) {
      assertNonEmptyString(action.priority, 'fieldOutput.correctiveActions.priority');
    }

    if (action.verification !== undefined) {
      assertNonEmptyString(
        action.verification,
        'fieldOutput.correctiveActions.verification',
      );
    }

    if (action.source !== undefined) {
      assertNonEmptyString(action.source, 'fieldOutput.correctiveActions.source');
    }

    if (action.suggestedFixes !== undefined) {
      assertStringArray(
        action.suggestedFixes,
        'fieldOutput.correctiveActions.suggestedFixes',
      );
    }
  }

  assert(
    fieldOutput.boundary?.requiresQualifiedReview === true,
    'fieldOutput.boundary.requiresQualifiedReview must be true.',
  );
  assert(
    fieldOutput.boundary?.canDeclareViolation === false,
    'fieldOutput.boundary.canDeclareViolation must be false.',
  );
  assert(
    fieldOutput.boundary?.canBypassHumanReview === false,
    'fieldOutput.boundary.canBypassHumanReview must be false.',
  );
}

try {
  const representative = buildRepresentativeFieldOutput();
  validateFieldOutputContract(representative);

  console.log('✅ SafeScope field output contract validation passed.');
  console.log(`Version: ${representative.version}`);
  console.log(`Actions: ${representative.correctiveActions.length}`);
  console.log(`Evidence gaps: ${representative.evidenceGaps.length}`);
  console.log(`Supervisor questions: ${representative.supervisorQuestions.length}`);
} catch (error) {
  console.error('❌ SafeScope field output contract validation failed.');
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
