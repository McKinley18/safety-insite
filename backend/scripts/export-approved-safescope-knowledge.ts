import * as fs from 'fs';
import * as path from 'path';
import { KnowledgeRecord } from '../src/safescope-v2/knowledge-intake/knowledge-intake.types';
import { KnowledgeRecordValidatorService } from '../src/safescope-v2/knowledge-intake/knowledge-record-validator.service';

type ApprovedKnowledgeBundle = {
  engine: 'safescope_approved_knowledge_export';
  mode: 'human_reviewed_only';
  generatedAt: string;
  sourceDirectory: string;
  approvedRecordCount: number;
  records: KnowledgeRecord[];
  guardrails: {
    onlyApprovedByHuman: true;
    requiresApprovedForUse: true;
    excludesQuarantinedUnreviewedRecords: true;
    doesNotModifyProductionReasoning: true;
    doesNotDeclareViolations: true;
  };
};

const quarantinedDir = path.join(
  __dirname,
  '../src/safescope-v2/knowledge-intake/records/quarantined',
);

const approvedDir = path.join(
  __dirname,
  '../src/safescope-v2/knowledge-intake/records/approved',
);

const approvedBundlePath = path.join(approvedDir, 'approved-knowledge-bundle.json');

const validator = new KnowledgeRecordValidatorService();

function readJsonRecords(dir: string): Array<{ file: string; record: KnowledgeRecord }> {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      const fullPath = path.join(dir, file);
      const record = JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as KnowledgeRecord;
      return { file, record };
    });
}

const records = readJsonRecords(quarantinedDir);

const approvedRecords: KnowledgeRecord[] = [];

for (const { file, record } of records) {
  const result = validator.validate(record);

  /**
   * The normal quarantine validator intentionally rejects approved records because
   * automated intake must never create approved records. Export is different:
   * this script is allowed to READ records that were approved through the separate
   * human review workflow, but it must never approve anything itself.
   */
  const nonApprovalErrors = result.errors.filter(
    (error) =>
      !error.includes("cannot have reviewStatus 'approved_by_human'") &&
      !error.includes("cannot have approvedForUse 'true'"),
  );

  if (nonApprovalErrors.length) {
    throw new Error(`Cannot export invalid record ${file}: ${nonApprovalErrors.join('; ')}`);
  }

  if (record.reviewStatus === 'approved_by_human' && record.approvedForUse === true) {
    approvedRecords.push(record);
  }
}

fs.mkdirSync(approvedDir, { recursive: true });

const bundle: ApprovedKnowledgeBundle = {
  engine: 'safescope_approved_knowledge_export',
  mode: 'human_reviewed_only',
  generatedAt: new Date().toISOString(),
  sourceDirectory: quarantinedDir,
  approvedRecordCount: approvedRecords.length,
  records: approvedRecords,
  guardrails: {
    onlyApprovedByHuman: true,
    requiresApprovedForUse: true,
    excludesQuarantinedUnreviewedRecords: true,
    doesNotModifyProductionReasoning: true,
    doesNotDeclareViolations: true,
  },
};

fs.writeFileSync(approvedBundlePath, `${JSON.stringify(bundle, null, 2)}\n`);

console.log('✅ SafeScope approved knowledge export completed.');
console.log(`Approved records exported: ${approvedRecords.length}`);
console.log(`Bundle: ${approvedBundlePath}`);
