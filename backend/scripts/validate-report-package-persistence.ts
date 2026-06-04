import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { ReportsService } from '../src/reports/reports.service';
import { Report } from '../src/reports/entities/report.entity';
import { Finding } from '../src/reports/entities/finding.entity';
import { ReportAttachment } from '../src/reports/entities/attachment.entity';

function assert(condition: any, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function createMemoryRepository<T extends { id?: string }>() {
  const rows: T[] = [];

  return {
    rows,

    create(input: Partial<T>) {
      return { ...input } as T;
    },

    async save(input: T) {
      const entity = {
        ...input,
        id: input.id || randomUUID(),
      } as T;

      const existingIndex = rows.findIndex((row) => row.id === entity.id);

      if (existingIndex >= 0) {
        rows[existingIndex] = {
          ...rows[existingIndex],
          ...entity,
        };
        return rows[existingIndex];
      }

      rows.push(entity);
      return entity;
    },

    async find(options?: any) {
      let result = [...rows];

      if (options?.where?.organizationId) {
        result = result.filter(
          (row: any) => row.organizationId === options.where.organizationId,
        );
      }

      return result;
    },

    async findOne(options: any) {
      const where = options?.where || {};

      return (
        rows.find((row: any) =>
          Object.entries(where).every(([key, value]) => row[key] === value),
        ) || null
      );
    },
  };
}

async function main() {
  console.log('\nReport Package Persistence Validation');
  console.log('=====================================\n');

  const reportRepo = createMemoryRepository<any>();
  const findingRepo = createMemoryRepository<any>();
  const attachmentRepo = createMemoryRepository<any>();

  const standards = {
    match: (category: string) => [
      {
        citation: '30 CFR 56.14107',
        rationale: `Matched ${category}`,
      },
    ],
  };

  const actionEngine = {
    generateActionsFromReport: async () => [
      {
        title: 'Correct machine guarding exposure',
        priority: 'HIGH',
      },
    ],
  };

  const correctiveActionsService = {
    syncReportAction: async ({ reportId, findingId, action, finding, user }: any) => ({
      id: action.backendActionId || action.id || `mock-action-${Date.now()}`,
      reportId,
      findingId,
      title: action.title || action.description || "Corrective action",
      description: action.description || action.title || "Corrective action",
      priorityCode: action.priorityCode || action.priority || "medium",
      statusCode: action.statusCode || action.status || "open",
      dueDate: action.dueDate || action.due || null,
      source: action.source || "Report Package",
      category: finding?.hazardCategory || action.category || null,
      organizationId: user?.organizationId || "workspace-alpha",
    }),
    syncReportActions: async ({ reportId, findings, user }: any) => {
      const syncedActions: any[] = [];

      for (const finding of findings || []) {
        const actions = [
          ...(finding.correctiveActions || []),
          ...(finding.selectedGeneratedActions || []),
          ...(finding.manualActions || []),
          ...(finding.safeScopeResult?.generatedActions || []),
        ];

        for (const action of actions) {
          syncedActions.push({
            id: action.backendActionId || action.id || `mock-action-${Date.now()}-${syncedActions.length}`,
            reportId,
            findingId: finding.id || null,
            title: action.title || action.description || "Corrective action",
            description: action.description || action.title || "Corrective action",
            priorityCode: action.priorityCode || action.priority || "medium",
            statusCode: action.statusCode || action.status || "open",
            dueDate: action.dueDate || action.due || null,
            source: action.source || "Report Package",
            category: finding.hazardCategory || action.category || null,
            organizationId: user?.organizationId || "workspace-alpha",
          });
        }
      }

      return syncedActions;
    },
  };

  const service = new ReportsService(
    reportRepo as unknown as Repository<Report>,
    findingRepo as unknown as Repository<Finding>,
    attachmentRepo as unknown as Repository<ReportAttachment>,
    standards as any,
    actionEngine as any,
    correctiveActionsService as any,
  );

  const userAlpha = {
    userId: 'user-alpha',
    organizationId: 'workspace-alpha',
  };

  const userBeta = {
    userId: 'user-beta',
    organizationId: 'workspace-beta',
  };

  const frontendReport = {
    id: 'SSR-TEST-PERSISTENCE',
    title: 'Persistence Test Report',
    organizationName: 'Sentinel Test Co',
    siteLocation: 'Crusher Area',
    leadInspector: 'Persistence Validator',
    isConfidential: true,
    createdAt: new Date().toISOString(),
    findings: [
      {
        id: 'finding-1',
        hazardCategory: 'Machine Guarding',
        description:
          'Missing guard on conveyor tail pulley with employee access during cleanup.',
        location: 'Crusher tail pulley',
        severity: 4,
        likelihood: 4,
        photos: [
          {
            id: 'photo-1',
            name: 'tail-pulley.jpg',
            cloudImageUri: '/uploads/evidence/tail-pulley.jpg',
            cloudAttachmentId: 'attachment-placeholder',
          },
        ],
        safeScopeResult: {
          classification: 'Machine Guarding',
          reasoningSnapshotId: 'snapshot-test',
        },
      },
    ],
  };

  console.log('▶ Create cloud report package');
  const created = await service.create(
    {
      frontendReportJson: frontendReport,
      report: frontendReport,
      company: frontendReport.organizationName,
      site: frontendReport.siteLocation,
      inspector: frontendReport.leadInspector,
      confidential: frontendReport.isConfidential,
      findings: frontendReport.findings,
    },
    userAlpha,
  );

  assert(created.id, 'Created report should have an id.');
  assert(
    created.organizationId === 'workspace-alpha',
    'Created report should be scoped to workspace-alpha.',
  );
  assert(
    created.frontendReportJson?.id === frontendReport.id,
    'Created report should persist frontendReportJson.',
  );
  assert(
    Array.isArray(created.findings) && created.findings.length === 1,
    'Created report should persist normalized finding rows.',
  );
  console.log(`✅ Created report: ${created.id}`);

  console.log('\n▶ Add evidence attachment');
  const attachment = await service.addAttachment(
    created.id,
    {
      imageUri: '/uploads/evidence/tail-pulley.jpg',
      mimeType: 'image/jpeg',
      fileName: 'tail-pulley.jpg',
    },
    userAlpha,
  );

  assert(attachment?.id, 'Attachment should be saved.');
  assert(
    attachment?.reportId === created.id,
    'Attachment should reference the saved report.',
  );

  const savedAttachment = attachment as NonNullable<typeof attachment>;

  console.log(`✅ Added attachment: ${savedAttachment.id}`);

  console.log('\n▶ Patch cloud report package after evidence sync');
  const patchedFrontendReport = {
    ...frontendReport,
    cloudReportId: created.id,
    evidenceCloudSync: {
      attemptedAt: new Date().toISOString(),
      uploadedCount: 1,
    },
    findings: [
      {
        ...frontendReport.findings[0],
        photos: [
          {
            ...frontendReport.findings[0].photos[0],
            cloudAttachmentId: savedAttachment.id,
            cloudImageUri: savedAttachment.imageUri,
            cloudUploadedAt: new Date().toISOString(),
          },
        ],
      },
    ],
  };

  const patched = await service.updatePackage(
    created.id,
    {
      frontendReportJson: patchedFrontendReport,
      report: patchedFrontendReport,
      company: patchedFrontendReport.organizationName,
      site: patchedFrontendReport.siteLocation,
      inspector: patchedFrontendReport.leadInspector,
      confidential: patchedFrontendReport.isConfidential,
    },
    userAlpha,
  );

  assert(
    patched?.frontendReportJson?.evidenceCloudSync?.uploadedCount === 1,
    'Patched report should persist evidenceCloudSync.',
  );
  assert(
    patched?.frontendReportJson?.findings?.[0]?.photos?.[0]?.cloudAttachmentId ===
      savedAttachment.id,
    'Patched report should persist cloudAttachmentId on photo metadata.',
  );
  console.log('✅ Patched report package with cloud evidence metadata');

  console.log('\n▶ Reload workspace reports');
  const reports = await service.findAll(userAlpha);

  assert(
    reports.some((report: any) => report.id === created.id),
    'Workspace reports should include saved cloud report.',
  );
  console.log(`✅ Reloaded ${reports.length} workspace report(s)`);

  console.log('\n▶ Workspace isolation');
  const hiddenFromWrongWorkspace = await service.findOne(created.id, userBeta);
  assert(
    hiddenFromWrongWorkspace === null,
    'Report should not be visible to a different workspace.',
  );

  const visibleToOwner = await service.findOne(created.id, userAlpha);
  assert(visibleToOwner?.id === created.id, 'Report should be visible to owner workspace.');
  console.log('✅ Workspace isolation passed');


  console.log('\n▶ Archive cloud report package');
  const blockedArchive = await service.archive(created.id, userBeta);
  assert(
    blockedArchive === null,
    'Wrong workspace should not archive another workspace report.',
  );

  const archived = await service.archive(created.id, userAlpha);
  assert(archived?.status === 'archived', 'Archived report should have archived status.');
  assert(
    archived?.frontendReportJson?.status === 'archived',
    'Archived report should mark frontendReportJson as archived.',
  );

  const reportsAfterArchive = await service.findAll(userAlpha);
  assert(
    !reportsAfterArchive.some((report: any) => report.id === created.id),
    'Archived reports should be excluded from workspace report list.',
  );
  console.log('✅ Archive behavior passed');

  console.log('\n=====================================');
  console.log('✅ Report package persistence validation passed.');
  console.log('=====================================\n');
}

main().catch((error) => {
  console.error('\n❌ Report package persistence validation failed.');
  console.error(error);
  process.exit(1);
});
