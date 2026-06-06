import * as fs from 'fs';
import * as path from 'path';

const PACK_PATH = path.resolve(__dirname, '../../safescope-data/approved-knowledge/draft-candidates/machine-guarding-conveyor-loto-draft-candidates.v1.json');
const prohibitedPhrases = [
    "is a violation",
    "creates a citation",
    "will be cited",
    "non-compliant",
    "noncompliant",
    "must comply",
    "regulatory violation"
];

async function validate() {
  const pack = JSON.parse(fs.readFileSync(PACK_PATH, 'utf-8'));
  
  if (pack.records.length < 12) {
    console.error(`Expected >= 12 records, found ${pack.records.length}`);
    process.exit(1);
  }

  const packString = JSON.stringify(pack).toLowerCase();
  for (const phrase of prohibitedPhrases) {
    if (packString.includes(phrase)) {
      console.error(`Prohibited language detected: ${phrase}`);
      process.exit(1);
    }
  }

  for (const record of pack.records) {
    if (record.status !== 'draft_candidate') {
        console.error(`Record ${record.recordId} has invalid status: ${record.status}`);
        process.exit(1);
    }
    if (!record.governance.advisoryOnly || !record.governance.doesNotDeclareViolation || !record.governance.doesNotCreateCitation || !record.governance.requiresQualifiedReview) {
        console.error(`Record ${record.recordId} missing advisory guardrails`);
        process.exit(1);
    }
    if (!record.governance.duplicateKeys || record.governance.duplicateKeys.length === 0) {
        console.error(`Record ${record.recordId} missing duplicate keys`);
        process.exit(1);
    }
    if (!record.mapping.evidenceQuestions || record.mapping.evidenceQuestions.length === 0) {
        console.error(`Record ${record.recordId} missing evidence questions`);
        process.exit(1);
    }
    if (!record.correctiveActionLinks) {
        console.error(`Record ${record.recordId} missing corrective action links`);
        process.exit(1);
    }
    if (!record.correctiveActionLinks.commonWeakActionsToAvoid || record.correctiveActionLinks.commonWeakActionsToAvoid.length === 0) {
        console.error(`Record ${record.recordId} missing weak actions to avoid`);
        process.exit(1);
    }
  }
  
  console.log('✅ SafeScope machine guarding conveyor LOTO draft pack validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
