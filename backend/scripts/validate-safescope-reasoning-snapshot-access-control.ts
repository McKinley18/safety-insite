import { ForbiddenException } from '@nestjs/common';
import { ReasoningSnapshotService } from '../src/safescope-v2/snapshots/reasoning-snapshot.service';
import { SafeScopeReasoningSnapshot } from '../src/safescope-v2/snapshots/reasoning-snapshot.entity';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const service = Object.create(
    ReasoningSnapshotService.prototype,
  ) as ReasoningSnapshotService;

  const snapshot = {
    id: 'snapshot-access-test-1',
    workspaceId: 'workspace-alpha',
    classification: 'Machine Guarding',
    validationStatus: 'generated',
    equipmentReasoningSummary: {
      primaryReasoningMode: 'specific_with_archetype_support',
    },
    fullIntelligenceSnapshot: {
      stored: true,
    },
  } as SafeScopeReasoningSnapshot;

  const missingWorkspaceSnapshot = {
    id: 'snapshot-no-workspace',
    workspaceId: null,
    classification: 'Machine Guarding',
    validationStatus: 'generated',
  } as unknown as SafeScopeReasoningSnapshot;

  (service as any).findOne = async (id: string) => {
    if (id === 'snapshot-access-test-1') return snapshot;
    if (id === 'snapshot-no-workspace') return missingWorkspaceSnapshot;
    return null;
  };

  const allowedByOrganization = await service.findSummaryForUser(
    'snapshot-access-test-1',
    {
      organizationId: 'workspace-alpha',
    },
  );

  assert(
    allowedByOrganization?.id === 'snapshot-access-test-1',
    'Matching organizationId should allow snapshot summary access.',
  );

  const allowedByTenant = await service.findRawForUser(
    'snapshot-access-test-1',
    {
      tenantId: 'workspace-alpha',
    },
  );

  assert(
    allowedByTenant?.id === 'snapshot-access-test-1',
    'Matching tenantId should allow raw snapshot access.',
  );

  let blockedDifferentWorkspace = false;
  try {
    await service.findSummaryForUser('snapshot-access-test-1', {
      organizationId: 'workspace-beta',
    });
  } catch (error) {
    blockedDifferentWorkspace = error instanceof ForbiddenException;
  }

  assert(
    blockedDifferentWorkspace,
    'Different workspace should be blocked from snapshot summary access.',
  );

  let blockedMissingUserWorkspace = false;
  try {
    await service.findRawForUser('snapshot-access-test-1', {
      userId: 'user-without-workspace',
    });
  } catch (error) {
    blockedMissingUserWorkspace = error instanceof ForbiddenException;
  }

  assert(
    blockedMissingUserWorkspace,
    'User without workspace scope should be blocked from raw snapshot access.',
  );

  const previousDevBypass = process.env.DEV_AUTH_BYPASS;
  const previousNodeEnv = process.env.NODE_ENV;

  process.env.DEV_AUTH_BYPASS = 'false';
  process.env.NODE_ENV = 'production';

  let blockedMissingSnapshotWorkspace = false;
  try {
    await service.findSummaryForUser('snapshot-no-workspace', {
      organizationId: 'workspace-alpha',
    });
  } catch (error) {
    blockedMissingSnapshotWorkspace = error instanceof ForbiddenException;
  }

  assert(
    blockedMissingSnapshotWorkspace,
    'Production snapshot without workspace scope should be blocked.',
  );

  process.env.DEV_AUTH_BYPASS = previousDevBypass;
  if (previousNodeEnv === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = previousNodeEnv;
  }

  console.log('✅ SafeScope reasoning snapshot access-control validation passed.');
  console.log('Allowed workspace: workspace-alpha');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
