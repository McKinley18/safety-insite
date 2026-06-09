import * as fs from 'fs';
import * as path from 'path';

async function audit() {
  const root = path.resolve(__dirname, '..');
  const draftCandidatesDir = path.join(root, '../safescope-data/approved-knowledge/draft-candidates');
  const taxonomyMapPath = path.join(root, '../safescope-data/hazard-taxonomy/hazard-taxonomy-coverage-map.v1.json');
  const runnerPath = path.join(root, 'scripts/run-safescope-full-validation.ts');
  const targetedRunnerPath = path.join(root, 'scripts/run-safescope-targeted-validation.ts');
  const packageJsonPath = path.join(root, 'package.json');
  const guidePath = path.join(root, '../project-docs/04-safescope-engine/SAFESCOPE_TARGETED_VALIDATION_GUIDE.md');
  
  const draftFiles = fs.readdirSync(draftCandidatesDir).filter(f => f.endsWith('.json'));
  const runnerContent = fs.readFileSync(runnerPath, 'utf-8');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  let draftPackCount = 0;
  let draftCandidateRecordTotal = 0;
  let validatorCount = 0;
  let errors: string[] = [];

  // Known mappings for the audit script
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

  // Check Taxonomy Map
  if (!fs.existsSync(taxonomyMapPath)) {
      errors.push('Missing taxonomy map');
  } else {
      const taxonomy = JSON.parse(fs.readFileSync(taxonomyMapPath, 'utf-8'));
      if (taxonomy.domains.length < 40) errors.push('Fewer than 40 taxonomy domains');
  }

  // Check Targeted Validation Infrastructure
  if (!fs.existsSync(targetedRunnerPath)) errors.push('Missing targeted validation runner');
  if (!fs.existsSync(guidePath)) errors.push('Missing targeted validation guide');
  if (!packageJson.scripts['validate:safescope:targeted']) errors.push('Missing validate:safescope:targeted npm script');

  for (const file of draftFiles) {
    draftPackCount++;
    const pack = JSON.parse(fs.readFileSync(path.join(draftCandidatesDir, file), 'utf-8'));
    draftCandidateRecordTotal += pack.records.length;
    
    const packName = file.replace('.v1.json', '').replace('.json', '');
    const validatorName = knownMappings[packName];
    
    if (!validatorName) {
        errors.push(`Missing mapping for pack: ${packName}`);
        continue;
    }
    
    const validatorPath = path.join(root, 'scripts', validatorName);
    
    if (fs.existsSync(validatorPath)) {
        validatorCount++;
        if (!runnerContent.includes(validatorName)) {
            errors.push(`Validator ${validatorName} missing from master runner`);
        }
    } else {
        errors.push(`Missing validator script: ${validatorName}`);
    }
  }

  console.log(`Draft pack count: ${draftPackCount}`);
  console.log(`Draft candidate record total: ${draftCandidateRecordTotal}`);
  console.log(`Validator count: ${validatorCount}`);
  
  if (errors.length > 0) {
      console.error('Audit failed:', errors.join(', '));
      process.exit(1);
  }
  
  console.log('✅ SafeScope system audit passed.');
}

audit().catch(err => {
  console.error(err);
  process.exit(1);
});
