/**
 * KG-4A (Phase 5) -- reviewer evidence for the ONE record this slice sources.
 *
 * Follows the KG-3D/KG-3E discipline exactly, and for the same reason: each slice carries its OWN
 * checks file and its own source directory, so a later slice can never make an earlier slice's
 * recorded verification result fail. KG-3E's verifier stays byte-identical; this one covers only
 * `30 CFR 56.14132(b)(1)`.
 *
 * This tool ASSISTS a review. It has NO write path and cannot approve anything. Approval remains
 * an explicit human command bound to an expected checksum.
 *
 * The source is KG-3E's hash-verified `ecfr-56-14132.xml`, re-verified against KG-3E's own
 * SHA256SUMS before a single claim is checked -- reviewing against an unverified copy of the
 * regulation would make the whole exercise decorative.
 *
 * Usage: DATABASE_URL=…test_… npx ts-node scripts/verify-kg4a-record-against-source.ts <releaseId>
 */
import 'dotenv/config';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import { dataSource } from '../src/database/data-source';
import { resolveGovernedCitation } from '../src/standards/releases/governed-corpus-lookup';

const SOURCE_DIR = join(__dirname, '..', '..', 'verification',
  'hazlenz-governed-knowledge-growth-2026-08-19', 'kg-3e', 'source-evidence');
const SOURCE_FILE = 'ecfr-56-14132.xml';
const CITATION = '30 CFR 56.14132(b)(1)';

let failed = 0; let passed = 0;
function assert(cond: unknown, msg: string) {
  if (cond) { passed++; console.log(`ok    ${msg}`); }
  else { failed++; console.log(`FAIL  ${msg}`); }
}
const norm = (s: string) => s.toLowerCase().replace(/[—–-]/g, ' ').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

/** Every element (b)(1) requires, and the source phrase that must support it. */
// Each entry is [label, source phrase, the words the RECORD must carry]. The record's words are
// listed explicitly rather than derived from the source phrase, because the governed corpus writes
// plain-language summaries ("must have") where the CFR writes the statutory modal ("shall have").
// Keying the record check on the source's modal verb would fail every record in the corpus and
// would be testing house style rather than regulatory fidelity.
const CLAIMS: Array<[string, string, string[]]> = [
  ['the obstructed-view trigger', 'when the operator has an obstructed view to the rear',
    ['obstructed', 'view', 'rear']],
  ['scope is self-propelled mobile equipment', 'self propelled mobile equipment shall have',
    ['propelled', 'mobile', 'equipment']],
  ['alternative (i): reverse-activated signal alarm', 'an automatic reverse activated signal alarm',
    ['automatic', 'reverse', 'activated', 'signal', 'alarm']],
  ['alternative (ii): wheel-mounted bell alarm', 'a wheel mounted bell alarm which sounds at least once for each three feet of reverse movement',
    ['wheel', 'mounted', 'bell', 'alarm', 'three', 'feet']],
  ['alternative (iii): discriminating backup alarm', 'a discriminating backup alarm that covers the area of obstructed view',
    ['discriminating', 'backup', 'alarm', 'covers']],
  ['alternative (iv): an observer', 'an observer to signal when it is safe to back up',
    ['observer', 'signal', 'safe', 'back']],
];

/** Qualifications from SIBLING paragraphs that limit the rule and must be disclosed, with citations. */
const QUALIFICATIONS: Array<[string, string, string]> = [
  ['(b)(2) audibility', 'alarms shall be audible above the surrounding noise level', '56.14132(b)(2)'],
  ['(b)(3) night strobe alternative', 'an automatic reverse activated strobe light may be used at night in lieu of an audible reverse alarm', '56.14132(b)(3)'],
  ['(c) rail-equipment exclusion', 'this standard does not apply to rail equipment', '56.14132(c)'],
];

async function main() {
  const releaseId = process.argv[2];
  if (!releaseId) { console.error('usage: verify-kg4a-record-against-source.ts <releaseId>'); process.exit(2); }

  // 1. The source must be the hash-verified copy.
  const sumsLine = readFileSync(join(SOURCE_DIR, 'SHA256SUMS.txt'), 'utf8')
    .split('\n').find(line => line.includes(SOURCE_FILE));
  const expectedSha = sumsLine?.trim().split(/\s+/)[0];
  const raw = readFileSync(join(SOURCE_DIR, SOURCE_FILE), 'utf8');
  const actualSha = createHash('sha256').update(raw).digest('hex');
  assert(Boolean(expectedSha) && actualSha === expectedSha,
    `authoritative source ${SOURCE_FILE} matches KG-3E's recorded sha256 (${actualSha.slice(0, 16)}…)`);

  const source = norm(raw);
  // `norm()` reduces "§ 56.14132 Horns and backup alarms." to "56 14132 horns and backup alarms",
  // so the section number is matched in its normalized form.
  assert(/56 14132 horns and backup alarms/.test(source),
    'the source carries the codified section heading "Horns and backup alarms"');

  await dataSource.initialize();
  const resolved = await resolveGovernedCitation(dataSource, releaseId, CITATION);
  assert(resolved.backing !== 'NOT_IN_RELEASE', `release ${releaseId} holds a record for ${CITATION}`);
  assert(resolved.citationKey === '30cfr56.14132(b)(1)',
    `the record's citation identity is the PARAGRAPH (${resolved.citationKey}), distinct from the section`);

  const governed = norm(`${resolved.title || ''} ${resolved.standardText || ''} ${resolved.plainLanguageSummary || ''}`);
  const rawGoverned = `${resolved.title || ''} ${resolved.standardText || ''} ${resolved.plainLanguageSummary || ''}`;

  // 2. Title: a justified narrowing of the codified heading.
  assert(/backup alarm/i.test(resolved.title || ''),
    `the title names the half of the section this record covers ("${resolved.title}")`);
  assert(/obstructed view/i.test(resolved.title || ''),
    'the title states the trigger, so the narrowing is visible without reading the body');

  // 3. Every asserted element appears in the authoritative source.
  for (const [label, phrase, recordWords] of CLAIMS) {
    assert(source.includes(norm(phrase)), `SOURCE supports ${label}`);
    const missing = recordWords.filter(word => !governed.includes(word));
    assert(missing.length === 0, `RECORD asserts ${label}${missing.length ? ` (missing: ${missing.join(', ')})` : ''}`);
  }

  // 4. All four alternatives, and the fact that ANY ONE suffices.
  assert(/any one of the four satisfies/i.test(rawGoverned),
    'HARD: the record states that ANY ONE of the four alternatives satisfies the paragraph');
  assert(/observer/i.test(rawGoverned),
    'HARD: the observer alternative is present — "no backup alarm" alone is not a violation');

  // 5. Qualifications disclosed WITH their own citations (named, not absorbed).
  for (const [label, phrase, citation] of QUALIFICATIONS) {
    assert(source.includes(norm(phrase)), `SOURCE carries the ${label} qualification`);
    assert(rawGoverned.includes(citation),
      `RECORD discloses the ${label} qualification and attributes it to ${citation}`);
  }

  // 6. It must NOT absorb paragraph (a).
  assert(/paragraph \(a\)/i.test(rawGoverned) && /separate requirement and is not addressed/i.test(rawGoverned),
    'HARD: paragraph (a) is explicitly DISCLAIMED as a separate requirement, not absorbed');
  assert(!/^.*shall be maintained in functional condition\.?$/i.test(resolved.title || ''),
    'the title does not present horn maintenance as this paragraph\'s rule');

  // 7. It must not claim the paragraph applies when the rear view is clear.
  assert(/rear view is clear, this paragraph does not apply/i.test(rawGoverned),
    'HARD: the record states the paragraph does NOT apply where the rear view is clear');

  // 8. Provenance is registered, not placeholder.
  assert(!resolved.placeholderSource, `source is registered, not a placeholder (${resolved.sourceKey})`);
  assert(Boolean(resolved.recordChecksum), `record checksum present (${resolved.recordChecksum?.slice(0, 16)}…)`);

  await dataSource.destroy();
  console.log(`\n${passed} passed, ${failed} failed`);
  console.log(`\nRECORD CHECKSUM FOR APPROVAL: ${resolved.recordChecksum}`);
  process.exit(failed ? 1 : 0);
}
main().catch(e => { console.error(e); process.exit(1); });
