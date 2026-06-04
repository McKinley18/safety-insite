import * as fs from 'fs';
import * as path from 'path';

type SourceRegisterEntry = {
  sourceTitle?: string;
  sourceUrl?: string;
  agency?: string;
  sourceType?: string;
  dateAccessed?: string;
  topic?: string;
  reliabilityTier?: string;
  usedInStructuredOutput?: boolean;
  notes?: string;
};

const registerPath = path.join(
  __dirname,
  '../src/safescope-v2/knowledge-intake/source-register/source-register.seed.json',
);

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const raw = fs.readFileSync(registerPath, 'utf-8');
const entries = JSON.parse(raw) as SourceRegisterEntry[];

assert(Array.isArray(entries), 'Source register must be an array.');
assert(entries.length > 0, 'Source register must contain at least one source.');

const seenUrls = new Set<string>();
let validCount = 0;

for (const [index, entry] of entries.entries()) {
  const label = `source-register[${index}]`;

  assert(Boolean(entry.sourceTitle), `${label}: missing sourceTitle`);
  assert(Boolean(entry.sourceUrl), `${label}: missing sourceUrl`);
  assert(isValidUrl(String(entry.sourceUrl)), `${label}: sourceUrl must be a valid HTTPS URL`);
  assert(Boolean(entry.agency), `${label}: missing agency`);
  assert(Boolean(entry.sourceType), `${label}: missing sourceType`);
  assert(Boolean(entry.dateAccessed), `${label}: missing dateAccessed`);
  assert(Boolean(entry.topic), `${label}: missing topic`);
  assert(Boolean(entry.reliabilityTier), `${label}: missing reliabilityTier`);

  const url = String(entry.sourceUrl);
  assert(!seenUrls.has(url), `${label}: duplicate sourceUrl ${url}`);
  seenUrls.add(url);

  validCount += 1;
}

console.log(`✅ SafeScope source register validation passed. Sources validated: ${validCount}`);
