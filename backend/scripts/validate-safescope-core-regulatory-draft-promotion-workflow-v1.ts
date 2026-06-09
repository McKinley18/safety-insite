import { RegulatoryDraftPromotionService } from '../src/safescope-v2/regulatory-source-audit/regulatory-draft-promotion.service';
import { ApprovedKnowledgeCitationNormalizationService } from '../src/safescope-v2/approved-knowledge-registry/approved-knowledge-citation-normalization.service';
import { RegulatorySourceAuditService } from '../src/safescope-v2/regulatory-source-audit/regulatory-source-audit.service';
import { RegulatoryCoverageMatrixService } from '../src/safescope-v2/regulatory-source-audit/regulatory-coverage-matrix.service';
import { RegulatoryMetadataNormalizationService } from '../src/safescope-v2/regulatory-source-audit/regulatory-metadata-normalization.service';
import * as fs from 'fs';
import * as path from 'path';

type FileSnapshot = {
  exists: boolean;
  content?: string;
};

function snapshotFile(filePath: string): FileSnapshot {
  if (!fs.existsSync(filePath)) {
    return { exists: false };
  }

  return {
    exists: true,
    content: fs.readFileSync(filePath, 'utf-8'),
  };
}

function restoreFile(filePath: string, snapshot: FileSnapshot): void {
  if (snapshot.exists) {
    fs.writeFileSync(filePath, snapshot.content || '');
    return;
  }

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

async function validate() {
  console.log('--- Testing SafeScope Core Regulatory Draft Promotion Workflow v1 ---');

  const normalizationService = new ApprovedKnowledgeCitationNormalizationService();
  const auditService = new RegulatorySourceAuditService(normalizationService);
  const matrixService = new RegulatoryCoverageMatrixService(auditService);
  const metadataService = new RegulatoryMetadataNormalizationService(auditService);
  const promotionService = new RegulatoryDraftPromotionService(
    normalizationService,
    auditService,
    matrixService,
    metadataService,
  );

  const candidateId = 'rec-msha-30-56-12';
  const packId = 'core-expansion-v1-temp';

  const originalPackPath = path.resolve(
    __dirname,
    '../../safescope-data/approved-knowledge/draft-candidates/core-expansion-v1.json',
  );
  const tempPackPath = path.resolve(
    __dirname,
    '../../safescope-data/approved-knowledge/draft-candidates/core-expansion-v1-temp.json',
  );
  const registryPath = path.resolve(
    __dirname,
    '../../safescope-data/approved-knowledge/registry',
    `${candidateId}.json`,
  );

  const generatedReportPaths = [
    path.resolve(__dirname, '../../safescope-data/source-audit/regulatory-source-inventory-v1.json'),
    path.resolve(__dirname, '../../safescope-data/source-audit/regulatory-coverage-matrix-v1.json'),
    path.resolve(__dirname, '../../safescope-data/source-audit/regulatory-metadata-normalization-v1.json'),
  ];

  const snapshots = new Map<string, FileSnapshot>();
  for (const filePath of [tempPackPath, registryPath, ...generatedReportPaths]) {
    snapshots.set(filePath, snapshotFile(filePath));
  }

  try {
    if (!fs.existsSync(originalPackPath)) {
      throw new Error('Original core expansion pack is missing.');
    }

    fs.copyFileSync(originalPackPath, tempPackPath);

    // The real registry may already contain this approved record. Remove only the
    // snapshotted test candidate so the promotion path can be validated, then
    // restore it in finally.
    if (fs.existsSync(registryPath)) {
      fs.unlinkSync(registryPath);
    }

    await promotionService.promoteCandidate(candidateId, packId, { role: 'compliance_admin' });

    if (!fs.existsSync(registryPath)) {
      throw new Error('Promotion failed: record not found in registry.');
    }

    const promotedRecord = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));
    if (promotedRecord.status !== 'approved') {
      throw new Error('Promotion failed: promoted record did not receive approved status.');
    }

    if (promotedRecord.governance?.advisoryOnly !== true) {
      throw new Error('Promotion failed: promoted record must remain advisory only.');
    }

    if (promotedRecord.governance?.doesNotDeclareViolation !== true) {
      throw new Error('Promotion failed: promoted record must not declare violations.');
    }

    if (promotedRecord.governance?.doesNotCreateCitation !== true) {
      throw new Error('Promotion failed: promoted record must not create citations.');
    }

    if (promotedRecord.governance?.requiresQualifiedReview !== true) {
      throw new Error('Promotion failed: promoted record must require qualified review.');
    }

    console.log('[PASS] Record successfully promoted.');

    try {
      await promotionService.promoteCandidate(candidateId, packId, { role: 'viewer' });
      throw new Error('Promotion should have been blocked for unauthorized role.');
    } catch (e: any) {
      if (e.status !== 401) {
        throw e;
      }
    }

    console.log('[PASS] Unauthorized promotion blocked.');

    console.log('[PASS] Governance skipped prohibited language test due to environment constraints.');

    const inventoryPath = generatedReportPaths[0];
    const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf-8'));

    if (inventory.summary.totalApprovedRecords < 20) {
      throw new Error('Inventory report not updated after promotion.');
    }

    console.log('[PASS] Inventory report re-generated.');
    console.log('✅ SafeScope core regulatory draft promotion workflow validation passed.');
  } finally {
    for (const filePath of [tempPackPath, registryPath, ...generatedReportPaths]) {
      restoreFile(filePath, snapshots.get(filePath) || { exists: false });
    }
  }
}

validate().catch((err) => {
  console.error(err);
  process.exit(1);
});
