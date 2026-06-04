import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SupervisorValidationService } from '../src/safescope-v2/validation/supervisor-validation.service';
import { SafeScopeReasoningSnapshot } from '../src/safescope-v2/snapshots/reasoning-snapshot.entity';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const savedValidations: any[] = [];
  const snapshotStatuses: Record<string, string> = {};

  const snapshot = {
    id: 'snapshot-validation-test-1',
    workspaceId: 'workspace-alpha',
    reportId: 'report-alpha',
    classification: 'Machine Guarding',
    validationStatus: 'generated',
  } as SafeScopeReasoningSnapshot;

  const reasoningSnapshots = {
    findOne: async (id: string) => {
      if (id === snapshot.id) return snapshot;
      return null;
    },
    assertSnapshotAccess: (
      candidate: SafeScopeReasoningSnapshot | null,
      user: any,
    ) => {
      if (!candidate) return;
      const workspaceIds = [
        user?.organizationId,
        user?.workspaceId,
        user?.tenantId,
      ]
        .filter(Boolean)
        .map(String);

      if (!candidate.workspaceId || !workspaceIds.includes(candidate.workspaceId)) {
        throw new ForbiddenException(
          'Reasoning snapshot is outside the current workspace.',
        );
      }
    },
    updateValidationStatus: async (id: string, status: string) => {
      snapshotStatuses[id] = status;
      return { ...snapshot, validationStatus: status };
    },
  };

  const validationRepo = {
    create: (input: any) => ({ id: `validation-${savedValidations.length + 1}`, ...input }),
    save: async (input: any) => {
      savedValidations.push(input);
      return input;
    },
    find: async ({ where }: any) =>
      savedValidations.filter((item) => {
        return Object.entries(where || {}).every(
          ([key, value]) => item[key] === value,
        );
      }),
  };

  const service = new SupervisorValidationService(
    validationRepo as any,
    reasoningSnapshots as any,
  );

  const allowed = await service.createValidationForUser(
    {
      reasoningSnapshotId: snapshot.id,
      validationDecision: 'accepted',
      reviewerNotes: 'Reviewed and accepted.',
      workspaceId: 'workspace-beta',
    },
    {
      userId: 'user-alpha',
      email: 'reviewer@example.com',
      organizationId: 'workspace-alpha',
    },
  );

  assert(
    allowed.workspaceId === 'workspace-alpha',
    'Validation workspace must be derived from authenticated user, not request body.',
  );
  assert(
    allowed.validationDecision === 'accepted',
    'Validation decision should be saved.',
  );
  assert(
    snapshotStatuses[snapshot.id] === 'validated_accepted',
    'Accepted validation should update snapshot status.',
  );

  const history = await service.getValidationHistoryForUser(snapshot.id, {
    organizationId: 'workspace-alpha',
  });

  assert(history.length === 1, 'Allowed workspace should retrieve validation history.');
  assert(
    history[0].reasoningSnapshotId === snapshot.id,
    'Validation history should be tied to snapshot ID.',
  );

  let blockedCreate = false;
  try {
    await service.createValidationForUser(
      {
        reasoningSnapshotId: snapshot.id,
        validationDecision: 'rejected',
      },
      {
        organizationId: 'workspace-beta',
      },
    );
  } catch (error) {
    blockedCreate = error instanceof ForbiddenException;
  }

  assert(blockedCreate, 'Wrong workspace should be blocked from creating validation.');

  let blockedHistory = false;
  try {
    await service.getValidationHistoryForUser(snapshot.id, {
      organizationId: 'workspace-beta',
    });
  } catch (error) {
    blockedHistory = error instanceof ForbiddenException;
  }

  assert(blockedHistory, 'Wrong workspace should be blocked from validation history.');

  let missingSnapshotBlocked = false;
  try {
    await service.createValidationForUser(
      {
        reasoningSnapshotId: 'missing-snapshot',
        validationDecision: 'accepted',
      },
      {
        organizationId: 'workspace-alpha',
      },
    );
  } catch (error) {
    missingSnapshotBlocked = error instanceof NotFoundException;
  }

  assert(missingSnapshotBlocked, 'Missing snapshot should produce NotFoundException.');

  let invalidDecisionBlocked = false;
  try {
    await service.createValidationForUser(
      {
        reasoningSnapshotId: snapshot.id,
        validationDecision: 'not_a_real_decision' as any,
      },
      {
        organizationId: 'workspace-alpha',
      },
    );
  } catch (error) {
    invalidDecisionBlocked = error instanceof ForbiddenException;
  }

  assert(invalidDecisionBlocked, 'Unsupported validation decision should be blocked.');

  console.log('✅ SafeScope supervisor validation workspace-scope validation passed.');
  console.log(`Snapshot status after acceptance: ${snapshotStatuses[snapshot.id]}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
