import * as fs from 'fs';
import * as path from 'path';

async function validate() {
  console.log('--- Testing SafeScope Project Organization Audit v1 ---');

  const rootDir = path.resolve(__dirname, '../../');
  const backendSrc = path.join(rootDir, 'backend/src');
  const frontendSrc = path.join(rootDir, 'frontend-next');
  const dataDir = path.join(rootDir, 'safescope-data');
  const docsDir = path.join(rootDir, 'project-docs');

  const newDocs = [
    { 
        path: 'project-docs/00-index/PROJECT_STRUCTURE_MAP.md',
        keywords: ['backend', 'frontend', 'safescope-data', 'project-docs']
    },
    { 
        path: 'project-docs/04-safescope-engine/SAFESCOPE_CANONICAL_TAXONOMY_MAP.md',
        keywords: ['canonical', 'hazard', 'alias', 'machine_guarding']
    },
    { 
        path: 'project-docs/04-safescope-engine/SAFESCOPE_COVERAGE_GAP_REGISTER.md',
        keywords: ['OSHA', 'MSHA', 'controls', 'mitigation', 'evidence', 'P0', 'P1']
    },
    { 
        path: 'project-docs/04-safescope-engine/SAFESCOPE_GENERATED_FILES_POLICY.md',
        keywords: ['benchmark', 'results', 'reviewer', 'candidates', 'persistence', 'audit_records', 'scenario packs']
    }
  ];

  for (const doc of newDocs) {
      const fullPath = path.join(rootDir, doc.path);
      if (!fs.existsSync(fullPath)) {
          throw new Error(`Project Audit failed: Document missing at ${doc.path}`);
      }
      const content = fs.readFileSync(fullPath, 'utf-8');
      for (const keyword of doc.keywords) {
          if (!content.includes(keyword)) {
              throw new Error(`Project Audit failed: Document ${doc.path} missing required keyword/section: ${keyword}`);
          }
      }
      console.log(`[PASS] Verified: ${doc.path}`);
  }

  // Verify Prompt Archive
  const archivePath = path.join(rootDir, 'project-docs/09-archive-reference/prompts/SAFESCOPE_PROJECT_ORGANIZATION_COVERAGE_READINESS_AUDIT_V1_PROMPT.md');
  if (!fs.existsSync(archivePath)) {
      throw new Error('Project Audit failed: Prompt archive missing.');
  }
  console.log('[PASS] Verified prompt archive.');

  console.log('✅ SafeScope project organization and coverage audit validation passed.');
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
