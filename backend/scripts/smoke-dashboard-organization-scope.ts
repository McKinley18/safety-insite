import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { dataSource } from '../src/database/data-source';
import { CorrectiveAction } from '../src/corrective-actions/entities/corrective-action.entity';
import { Site } from '../src/sites/entities/site.entity';
import { Organization } from '../src/organizations/entities/organization.entity';
import { DashboardService } from '../src/dashboards/dashboard.service';

const secret = process.env.JWT_SECRET || 'development-only-secret-change-me';

function tokenFor(organizationId: string, userId: string) {
  return `Bearer ${jwt.sign(
    {
      userId,
      email: `${userId}@sentinelsafety.local`,
      role: 'Owner',
      type: 'company',
      planCode: 'company',
      organizationId,
    },
    secret,
  )}`;
}

async function main() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const actionRepo = dataSource.getRepository(CorrectiveAction);
  const siteRepo = dataSource.getRepository(Site);
  const orgRepo = dataSource.getRepository(Organization);

  const orgA = randomUUID();
  const orgB = randomUUID();

  await orgRepo.save({
    id: orgA,
    name: 'Smoke Dashboard Organization A',
    type: 'company',
    planCode: 'company',
  } as any);

  await orgRepo.save({
    id: orgB,
    name: 'Smoke Dashboard Organization B',
    type: 'company',
    planCode: 'company',
  } as any);

  const siteA = await siteRepo.save(
    siteRepo.create({
      name: 'Smoke Dashboard Site A',
      organizationId: orgA,
    } as Partial<Site>),
  );

  const siteB = await siteRepo.save(
    siteRepo.create({
      name: 'Smoke Dashboard Site B',
      organizationId: orgB,
    } as Partial<Site>),
  );

  const dueYesterday = new Date(Date.now() - 86400000);

  await actionRepo.save([
    actionRepo.create({
      reportId: `smoke-dashboard-report-a-${Date.now()}`,
      tenantId: orgA,
      organizationId: orgA,
      siteId: siteA.id,
      classificationId: '',
      title: 'Smoke dashboard org A urgent overdue action',
      description: 'This action should appear only in org A dashboard summaries.',
      priorityCode: 'urgent',
      statusCode: 'open',
      dueDate: dueYesterday,
    }),
    actionRepo.create({
      reportId: `smoke-dashboard-report-b-${Date.now()}`,
      tenantId: orgB,
      organizationId: orgB,
      siteId: siteB.id,
      classificationId: '',
      title: 'Smoke dashboard org B high action',
      description: 'This action should appear only in org B dashboard summaries.',
      priorityCode: 'high',
      statusCode: 'open',
      dueDate: new Date(Date.now() + 86400000),
    }),
  ]);

  const service = new DashboardService(actionRepo, siteRepo);

  const summaryA = await service.getExecutiveSummary(tokenFor(orgA, 'dashboard-user-a'));
  const summaryB = await service.getExecutiveSummary(tokenFor(orgB, 'dashboard-user-b'));

  if (summaryA.totalFindings !== 1) {
    throw new Error(`Org A expected 1 total finding, received ${summaryA.totalFindings}`);
  }

  if (summaryA.criticalRiskFindings !== 1) {
    throw new Error(`Org A expected 1 critical finding, received ${summaryA.criticalRiskFindings}`);
  }

  if (summaryA.overdueActions !== 1) {
    throw new Error(`Org A expected 1 overdue action, received ${summaryA.overdueActions}`);
  }

  if (summaryB.totalFindings !== 1) {
    throw new Error(`Org B expected 1 total finding, received ${summaryB.totalFindings}`);
  }

  if (summaryB.highRiskFindings !== 1) {
    throw new Error(`Org B expected 1 high-risk finding, received ${summaryB.highRiskFindings}`);
  }

  if (summaryB.criticalRiskFindings !== 0) {
    throw new Error(`Org B expected 0 critical findings, received ${summaryB.criticalRiskFindings}`);
  }

  const corporateA = await service.getCorporateSummary(tokenFor(orgA, 'dashboard-user-a'));
  const corporateB = await service.getCorporateSummary(tokenFor(orgB, 'dashboard-user-b'));

  if (corporateA.totalSites !== 1) {
    throw new Error(`Org A expected 1 scoped site, received ${corporateA.totalSites}`);
  }

  if (corporateB.totalSites !== 1) {
    throw new Error(`Org B expected 1 scoped site, received ${corporateB.totalSites}`);
  }

  const siteANameSeenByB = corporateB.siteRankings.some((site) => site.siteName === siteA.name);
  if (siteANameSeenByB) {
    throw new Error('Org B corporate summary leaked Org A site data.');
  }

  await actionRepo.delete({ organizationId: orgA });
  await actionRepo.delete({ organizationId: orgB });
  await siteRepo.delete({ id: siteA.id });
  await siteRepo.delete({ id: siteB.id });

  await dataSource.destroy();

  console.log('PASS: Dashboard backend organization scope smoke test passed.');
}

main().catch(async (error) => {
  console.error(`FAIL: ${error.message}`);

  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }

  process.exit(1);
});
