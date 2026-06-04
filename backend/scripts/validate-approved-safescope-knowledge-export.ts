import * as fs from 'fs';
import * as path from 'path';
import { KnowledgeRecord } from '../src/safescope-v2/knowledge-intake/knowledge-intake.types';

type ApprovedKnowledgeBundle = {
  engine?: string;
  mode?: string;
  generatedAt?: string;
  approvedRecordCount?: number;
  records?: KnowledgeRecord[];
  guardrails?: {
    onlyApprovedByHuman?: boolean;
    requiresApprovedForUse?: boolean;
    excludesQuarantinedUnreviewedRecords?: boolean;
    doesNotModifyProductionReasoning?: boolean;
    doesNotDeclareViolations?: boolean;
  };
};

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const approvedBundlePath = path.join(
  __dirname,
  '../src/safescope-v2/knowledge-intake/records/approved/approved-knowledge-bundle.json',
);

assert(fs.existsSync(approvedBundlePath), 'Approved knowledge bundle does not exist. Run export-approved-safescope-knowledge.ts first.');

const bundle = JSON.parse(fs.readFileSync(approvedBundlePath, 'utf-8')) as ApprovedKnowledgeBundle;

assert(bundle.engine === 'safescope_approved_knowledge_export', 'Approved bundle has incorrect engine.');
assert(bundle.mode === 'human_reviewed_only', 'Approved bundle must use human_reviewed_only mode.');
assert(Array.isArray(bundle.records), 'Approved bundle records must be an array.');

const records = bundle.records as KnowledgeRecord[];

assert(bundle.approvedRecordCount === records.length, 'approvedRecordCount must match records length.');

assert(bundle.guardrails?.onlyApprovedByHuman === true, 'Bundle must require human approval.');
assert(bundle.guardrails?.requiresApprovedForUse === true, 'Bundle must require approvedForUse.');
assert(bundle.guardrails?.excludesQuarantinedUnreviewedRecords === true, 'Bundle must exclude unreviewed records.');
assert(bundle.guardrails?.doesNotModifyProductionReasoning === true, 'Bundle must not modify production reasoning.');
assert(bundle.guardrails?.doesNotDeclareViolations === true, 'Bundle must not declare violations.');

for (const [index, record] of records.entries()) {
  const label = `approvedBundle.records[${index}]`;

  assert(record.reviewStatus === 'approved_by_human', `${label}: record is not approved_by_human.`);
  assert(record.approvedForUse === true, `${label}: record is not approvedForUse.`);
  assert(Boolean(record.recordId), `${label}: missing recordId.`);
  assert(Boolean(record.citation), `${label}: missing citation.`);
  assert(Boolean(record.sourceUrl), `${label}: missing sourceUrl.`);
  assert(Boolean(record.sourceBoundary), `${label}: missing sourceBoundary.`);
  assert(record.sourceBoundary !== 'prohibited', `${label}: prohibited records cannot be exported.`);
}

console.log('✅ SafeScope approved knowledge export validation passed.');
console.log(`Approved records validated: ${records.length}`);
