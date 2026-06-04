import { SOURCE_AUTHORITY_REGISTRY } from '../src/safescope-v2/brain/source-governance/source-authority.registry';

function validate() {
  console.log("Validating Source Authority Registry...");
  const ids = new Set();
  for (const entry of SOURCE_AUTHORITY_REGISTRY) {
    if (ids.has(entry.sourceId)) {
        throw new Error(`Duplicate source authority ID: ${entry.sourceId}`);
    }
    ids.add(entry.sourceId);
    
    if (entry.authorityTier === 'binding_regulation' && !entry.citationPattern) {
        throw new Error(`Binding regulation ${entry.sourceId} must have citation pattern.`);
    }
  }
  console.log("Source Authority Registry is valid.");
}

validate();
