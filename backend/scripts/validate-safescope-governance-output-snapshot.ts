import * as fs from 'fs';
import * as path from 'path';
import { SafeScopeIntelligenceOrchestrator } from '../src/safescope-v2/orchestration/intelligence-orchestrator.service';

const orchestrator = new SafeScopeIntelligenceOrchestrator();
const SNAPSHOT_PATH = path.join(__dirname, '../../safescope-data/snapshots/safescope-governance-output-snapshot.v1.json');

function sanitize(obj: any): any {
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (typeof obj === 'object' && obj !== null) {
        const newObj: any = {};
        for (const key in obj) {
            // Remove timestamp, random IDs, local paths
            if (['generatedAt', 'id', 'traceId', 'version'].includes(key)) continue; 
            newObj[key] = sanitize(obj[key]);
        }
        return newObj;
    }
    return obj;
}

async function validate() {
  const observation = "MSHA mechanic is servicing a conveyor drive with the guard removed while the equipment is not locked out. Stored and rotating energy could start unexpectedly and employees are exposed.";
  
  const result = await orchestrator.evaluate({
    fusedText: observation,
    promotedPrimary: { classification: 'Machine Guarding', confidence: 0.9, risk: { riskScore: 15 } },
    classifierResult: { ambiguityWarnings: [] },
    evidenceTexts: [],
    expandedContext: {},
    primaryStandardsResult: { suggestedStandards: ['1910.147'] },
    generatedActions: [],
    additionalHazards: [],
  });

  const sanitized = sanitize(result);

  if (fs.existsSync(SNAPSHOT_PATH)) {
    const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf-8'));
    if (JSON.stringify(sanitized) !== JSON.stringify(snapshot)) {
      console.error('Snapshot mismatch detected!');
      // console.error(JSON.stringify(sanitized, null, 2)); // Debugging
      process.exit(1);
    }
    console.log('Snapshot matched!');
  } else {
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(sanitized, null, 2));
    console.log('Snapshot created!');
  }
}

validate().catch(err => {
  console.error(err);
  process.exit(1);
});
