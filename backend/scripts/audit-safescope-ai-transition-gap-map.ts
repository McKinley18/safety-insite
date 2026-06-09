import * as fs from 'fs';
import * as path from 'path';

async function audit() {
  const root = path.resolve(__dirname, '..');
  const draftCandidatesDir = path.join(root, '../safescope-data/approved-knowledge/draft-candidates');
  const runnerPath = path.join(root, 'scripts/run-safescope-full-validation.ts');
  
  const draftFiles = fs.readdirSync(draftCandidatesDir).filter(f => f.endsWith('.json'));
  const runnerContent = fs.readFileSync(runnerPath, 'utf-8');

  let draftPackCount = 0;
  let draftCandidateRecordTotal = 0;
  let validatorCount = 0;
  let missingValidators: string[] = [];

  for (const file of draftFiles) {
    draftPackCount++;
    const pack = JSON.parse(fs.readFileSync(path.join(draftCandidatesDir, file), 'utf-8'));
    draftCandidateRecordTotal += pack.records.length;
    
    // Find associated validator: validate-safescope-[packId].ts
    const packName = file.replace('.v1.json', '').replace('.json', '');
    const validatorName = `validate-safescope-${packName}.ts`;
    
    // Some packs have specific validator names not directly mapping to the packId.
    // Hardcode known mappings for the audit script.
    const knownMappings: Record<string, string> = {
        'confined-space-atmospheric-hazard-draft-candidates': 'validate-safescope-confined-space-atmospheric-draft-pack.ts',
        'electrical-energized-equipment-draft-candidates': 'validate-safescope-electrical-energized-equipment-draft-pack.ts',
        'excavation-trenching-ground-control-draft-candidates': 'validate-safescope-excavation-trenching-ground-control-draft-pack.ts',
        'fall-protection-working-at-height-draft-candidates': 'validate-safescope-fall-protection-working-at-height-draft-pack.ts',
        'hazcom-chemical-labeling-sds-draft-candidates': 'validate-safescope-hazcom-chemical-labeling-sds-draft-pack.ts',
        'machine-guarding-conveyor-loto-draft-candidates': 'validate-safescope-machine-guarding-conveyor-loto-draft-pack.ts',
        'mobile-equipment-pedestrian-traffic-control-draft-candidates': 'validate-safescope-mobile-equipment-pedestrian-draft-pack.ts',
        'core-expansion-v1.json': 'validate-safescope-core-regulatory-expansion-v1.ts',
        'core-regulatory-expansion-v1': 'validate-safescope-core-regulatory-expansion-v1.ts'
    };
    
    const finalValidatorName = knownMappings[packName] || validatorName;
    const validatorPath = path.join(root, 'scripts', finalValidatorName);
    
    if (fs.existsSync(validatorPath)) {
        validatorCount++;
        if (!runnerContent.includes(finalValidatorName)) {
            missingValidators.push(finalValidatorName);
        }
    } else {
        missingValidators.push(finalValidatorName);
    }
  }

  console.log(`Draft pack count: ${draftPackCount}`);
  console.log(`Draft candidate record total: ${draftCandidateRecordTotal}`);
  console.log(`Validator count: ${validatorCount}`);
  console.log(`Missing validators in runner: ${missingValidators.join(', ')}`);

  if (missingValidators.length > 0) {
      process.exit(1);
  }
}

audit().catch(err => {
  console.error(err);
  process.exit(1);
});
