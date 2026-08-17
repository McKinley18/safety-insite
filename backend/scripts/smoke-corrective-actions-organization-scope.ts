import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { dataSource } from '../src/database/data-source';
import { CorrectiveActionsService } from '../src/corrective-actions/corrective-actions.service';
import { CorrectiveAction } from '../src/corrective-actions/entities/corrective-action.entity';
import { Inspection } from '../src/inspection/inspection.entity';
import { InspectionFinding } from '../src/inspection/entities/inspection-finding.entity';
import { Site } from '../src/sites/entities/site.entity';
import { OrganizationMembership } from '../src/organizations/entities/organization-membership.entity';

const SECRET = process.env.JWT_SECRET || 'development-only-secret-change-me';

function tokenFor(input: {
  userId: string;
  organizationId: string;
  tenantId?: string;
  role?: string;
}) {
  return jwt.sign(
    {
      userId: input.userId,
      sub: String(input.userId),
      email: `smoke-${input.userId}@sentinelsafety.local`,
      role: input.role || 'Owner',
      type: 'company',
      planCode: 'company',
      organizationPlanCode: 'company',
      organizationId: input.organizationId,
      tenantId: input.tenantId || input.organizationId,
    },
    SECRET,
  );
}

async function main() {
  await dataSource.initialize();

  const actionRepo = dataSource.getRepository(CorrectiveAction);

  const auditService = {
    log: async () => undefined,
  } as any;

  const notificationsService = {
    create: async () => undefined,
    findExistingForEntity: async () => null,
  } as any;

  const fixFeedbackService = {
    recordFeedback: async () => undefined,
  } as any;

  const outcomeService = {
    recordOutcome: async () => ({ recurrenceDetected: false }),
  } as any;

  const service = new CorrectiveActionsService(
    actionRepo,
    dataSource.getRepository(Inspection),
    dataSource.getRepository(InspectionFinding),
    dataSource.getRepository(Site),
    dataSource.getRepository(OrganizationMembership),
    dataSource,
    auditService,
    notificationsService,
    fixFeedbackService,
    outcomeService,
  );

  const orgA = randomUUID();
  const orgB = randomUUID();
  const userA = randomUUID();
  const userB = randomUUID();
  const authA = jwt.verify(tokenFor({ userId: userA, organizationId: orgA }), SECRET);
  const authB = jwt.verify(tokenFor({ userId: userB, organizationId: orgB }), SECRET);

  const created = await service.create(authA, {
    reportId: `smoke-report-${Date.now()}`,
    classificationId: '',
    title: 'Smoke scoped corrective action',
    description: 'Verify organization-scoped corrective action create, list, and status update.',
    priorityCode: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
  });

  if (!created.id) {
    throw new Error('Corrective action was not created.');
  }

  if (created.organizationId !== orgA) {
    throw new Error(`Expected organizationId ${orgA}, received ${created.organizationId}`);
  }

  const orgAList = await service.findAll(authA, {
    page: 1,
    limit: 20,
  });

  const visibleToOrgA = orgAList.data.some((action) => action.id === created.id);
  if (!visibleToOrgA) {
    throw new Error('Created corrective action was not visible to its organization.');
  }

  const orgBList = await service.findAll(authB, {
    page: 1,
    limit: 20,
  });

  const visibleToOrgB = orgBList.data.some((action) => action.id === created.id);
  if (visibleToOrgB) {
    throw new Error('Corrective action leaked across organization scope.');
  }

  let blockedCrossOrgUpdate = false;

  try {
    await service.updateStatus(authB, created.id, {
      statusCode: 'in_progress',
    });
  } catch {
    blockedCrossOrgUpdate = true;
  }

  if (!blockedCrossOrgUpdate) {
    throw new Error('Cross-organization status update was not blocked.');
  }

  const updated = await service.updateStatus(authA, created.id, {
    statusCode: 'in_progress',
  });

  if (updated.statusCode !== 'in_progress') {
    throw new Error(`Expected in_progress status, received ${updated.statusCode}`);
  }

  await actionRepo.delete({ id: created.id });

  await dataSource.destroy();

  console.log('PASS: Corrective actions backend organization scope smoke test passed.');
}

main().catch(async (error) => {
  console.error(`FAIL: ${error.message}`);

  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }

  process.exit(1);
});
