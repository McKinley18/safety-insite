import * as fs from 'fs';
import * as path from 'path';
import { KnowledgeRecordValidatorService } from '../src/safescope-v2/knowledge-intake/knowledge-record-validator.service';
import { KnowledgeRecord } from '../src/safescope-v2/knowledge-intake/knowledge-intake.types';

const quarantinedDir = path.join(__dirname, '../src/safescope-v2/knowledge-intake/records/quarantined');
const validator = new KnowledgeRecordValidatorService();

const files = fs.readdirSync(quarantinedDir);
let allValid = true;

for (const file of files) {
  if (file.endsWith('.json')) {
    const record: KnowledgeRecord = JSON.parse(fs.readFileSync(path.join(quarantinedDir, file), 'utf-8'));
    const result = validator.validate(record);
    
    if (!result.isValid) {
      console.error(`Validation failed for ${file}:`, result.errors);
      allValid = false;
    } else {
      console.log(`Validation passed for ${file}`);
    }
  }
}

if (!allValid) {
  process.exit(1);
}
