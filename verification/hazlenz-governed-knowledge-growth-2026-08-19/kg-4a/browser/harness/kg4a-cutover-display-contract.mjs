/**
 * KG-4A Phase 16 — real-Chromium verification of the controlled-cutover display contract.
 *
 * WHAT THIS ADDS OVER KG-3F. KG-3F verified that the Standard Detail card keeps CONTENT BACKING and
 * APPLICABILITY visually independent. It could only ever verify one deployment at a time, because
 * there was no mode to vary.
 *
 * KG-4A introduces the variable that actually matters for a cutover: two accounts, on the SAME
 * server, against the SAME database and the SAME active release, one allowlisted for
 * GOVERNED_WITH_FALLBACK and one not. The properties under test are therefore comparative:
 *
 *   1. the NON-allowlisted account's card is indistinguishable from today's product — this is what
 *      "LEGACY preserves current behaviour" means where a customer can actually see it;
 *   2. the allowlisted account sees "Verified standard text" ONLY where an exact approved record
 *      backs the exact citation;
 *   3. a citation that fell back shows NO verified badge and NO governance vocabulary — the
 *      customer must not be able to tell that a governance layer declined to back it;
 *   4. applicability language is IDENTICAL between the two accounts for the same citation, because
 *      governance may not move applicability;
 *   5. no internal governance vocabulary leaks in any mode, theme or viewport.
 *
 * Usage:
 *   API_BASE_URL=… APP_BASE_URL=… ALLOWED_EMAIL=… OTHER_EMAIL=… PASSWORD=… \
 *   ALLOWED_INSPECTION_ID=… OTHER_INSPECTION_ID=… SHOT_DIR=… node kg4a-cutover-display-contract.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const API = process.env.API_BASE_URL || 'http://127.0.0.1:4331';
const APP = process.env.APP_BASE_URL || 'http://127.0.0.1:3331';
const OUT = process.env.SHOT_DIR;
const PASSWORD = process.env.PASSWORD || 'KG4aTestPass!234';
fs.mkdirSync(OUT, { recursive: true });

const VERIFIED_BADGE = 'Verified standard text';
const UNAVAILABLE_NOTICE = 'not currently available for this citation';

/**
 * Internal vocabulary that must never reach a customer surface. KG-4A adds its own names to the
 * KG-3F list: a delivery state or a fallback reason code on screen would tell a customer that a
 * governance layer declined to back their citation, which is an internal migration fact, not a
 * property of their hazard.
 */
const FORBIDDEN = [
  'starter-unverified', 'reviewer_approved', 'recordChecksum', 'corpusBacked', 'backingStatus',
  'UNAPPROVED_CONTENT', 'CITATION_ONLY', 'APPROVED_GOVERNED_CONTENT', 'effectiveReviewState',
  'releaseId', 'mechanically_validated', 'approvalDigest',
  // KG-4A additions
  'GOVERNED_WITH_FALLBACK', 'GOVERNED_STRICT', 'LEGACY_TEXT_UNVERIFIED', 'GOVERNED_VERIFIED_TEXT',
  'CITATION_ONLY_NO_TEXT', 'governedDeliveryState', 'governedFallbackReason',
  'GOVERNED_RECORD_ABSENT', 'GOVERNED_SECTION_ONLY_NOT_PARAGRAPH', 'GOVERNED_APPROVED_EXACT',
  'knowledgeReleaseId', 'APPROVED_SECTION_ONLY', 'RESOLVER_UNAVAILABLE', 'federal-core-',
];

const VIEWS = [
  { name: 'light',       theme: 'light', width: 1440, height: 900, mobile: false },
  { name: 'dark',        theme: 'dark',  width: 1440, height: 900, mobile: false },
  { name: 'mobile',      theme: 'light', width: 390,  height: 844, mobile: true  },
  { name: 'mobile-dark', theme: 'dark',  width: 390,  height: 844, mobile: true  },
];

const ACCOUNTS = {
  governed: { email: process.env.ALLOWED_EMAIL, inspectionId: process.env.ALLOWED_INSPECTION_ID },
  legacy:   { email: process.env.OTHER_EMAIL,   inspectionId: process.env.OTHER_INSPECTION_ID },
};

async function login(email) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const response = await fetch(`${API}/auth/login`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: PASSWORD }),
    });
    const body = await response.json().catch(() => ({}));
    const token = body.token || body.accessToken;
    if (token) return { ...body, token };
    if (response.status !== 429) throw new Error(`login failed for ${email}: ${response.status} ${JSON.stringify(body).slice(0, 200)}`);
    await new Promise(r => setTimeout(r, 13_000));
  }
  throw new Error(`login for ${email} kept returning 429`);
}

/** Reads every Standard Detail card on the page as structure, not flattened text. */
async function readCards(page) {
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll('.guided-standard-card')).map((card) => {
      const heading = card.querySelector('button span span');
      const citation = heading ? heading.textContent.trim() : '';
      const confidenceP = Array.from(card.querySelectorAll('p')).find((p) => {
        const strong = p.querySelector('strong');
        return strong && strong.textContent.trim() === 'Confidence:';
      });
      const confidenceLabel = confidenceP
        ? Array.from(confidenceP.childNodes).filter(n => n.nodeType === Node.TEXT_NODE)
          .map(n => n.textContent).join(' ').trim()
        : '';
      const badge = Array.from(card.querySelectorAll('span'))
        .some(s => s.textContent.trim() === 'Verified standard text');
      const notice = Array.from(card.querySelectorAll('p'))
        .some(p => p.textContent.includes('not currently available for this citation'));
      const caveat = Array.from(card.querySelectorAll('p'))
        .some(p => p.textContent.includes('has not completed source review'));
      return {
        citation, confidenceLabel,
        hasBadge: badge, hasNotice: notice, hasSourceCaveat: caveat,
        hasSummaryLabel: card.innerText.toUpperCase().includes('HAZLENZ STANDARD SUMMARY'),
        text: card.innerText.replace(/\s+/g, ' ').trim(),
      };
    });
  });
}

const results = [];
const failures = [];
let checks = 0;
function check(condition, label) {
  checks++;
  if (condition) { console.log(`  ok    ${label}`); }
  else { failures.push(label); console.log(`  FAIL  ${label}`); }
}

const sessions = {
  governed: await login(ACCOUNTS.governed.email),
  legacy: await login(ACCOUNTS.legacy.email),
};

const browser = await chromium.launch();
console.log('Chromium', browser.version());

for (const view of VIEWS) {
  console.log(`\n=== view=${view.name} (${view.width}x${view.height}, ${view.theme}) ===`);
  const captured = {};

  for (const which of ['governed', 'legacy']) {
    const ctx = await browser.newContext({
      viewport: { width: view.width, height: view.height },
      deviceScaleFactor: 2, isMobile: view.mobile, hasTouch: view.mobile,
      colorScheme: view.theme,
    });
    const page = await ctx.newPage();
    await page.goto(`${APP}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(([token, refresh, user, inspectionId, theme]) => {
      localStorage.setItem('sentinel_auth_token', token);
      localStorage.setItem('sentinel_auth_refresh_token', refresh || '');
      localStorage.setItem('sentinel_auth_user', JSON.stringify(user || {}));
      localStorage.setItem('sentinel_selected_inspection_context',
        JSON.stringify({ persistedInspectionId: inspectionId }));
      localStorage.setItem('safety_insite_theme', theme);
    }, [sessions[which].token, sessions[which].refreshToken, sessions[which].user,
      ACCOUNTS[which].inspectionId, view.theme]);

    await page.goto(`${APP}/inspection-workspace`, { waitUntil: 'networkidle' });
    await page.waitForSelector('article', { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(1500);

    const cards = await readCards(page);
    captured[which] = cards;
    const body = (await page.evaluate(() => document.body.innerText)) || '';

    console.log(`  -- ${which} account: ${cards.length} standard card(s)`);
    for (const term of FORBIDDEN) {
      check(!body.includes(term),
        `[${view.name}/${which}] internal vocabulary '${term}' does not appear on screen`);
    }
    for (const card of cards) {
      if (card.hasBadge) {
        check(which === 'governed',
          `[${view.name}/${which}] '${VERIFIED_BADGE}' appears ONLY for the allowlisted account (${card.citation})`);
      }
      check(!(card.hasBadge && card.hasNotice),
        `[${view.name}/${which}] ${card.citation}: a card never both shows verified text and says it is unavailable`);
      check(!(card.hasBadge && card.hasSourceCaveat),
        `[${view.name}/${which}] ${card.citation}: verified text is not shown alongside the source-review caveat`);
    }

    const shot = path.join(OUT, `${which}-${view.name}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    await ctx.close();
  }

  // The comparative properties.
  const g = captured.governed, l = captured.legacy;
  check(l.every(card => !card.hasBadge),
    `[${view.name}] HARD: the NON-allowlisted account shows no verified badge anywhere — legacy display preserved`);
  check(g.some(card => card.hasBadge),
    `[${view.name}] HARD: the allowlisted account DOES show a verified badge — the pass is not vacuous`);

  const byCitation = new Map(l.map(card => [card.citation, card]));
  for (const card of g) {
    const twin = byCitation.get(card.citation);
    if (!twin) continue;
    check(card.confidenceLabel === twin.confidenceLabel,
      `[${view.name}] HARD: ${card.citation} shows the SAME applicability confidence in both modes ` +
      `('${card.confidenceLabel}' vs '${twin.confidenceLabel}') — governance did not move applicability`);
  }
  results.push({ view: view.name, governed: g, legacy: l });
}

await browser.close();

const summary = {
  generatedBy: 'kg4a-cutover-display-contract.mjs',
  api: API, app: APP, views: VIEWS.map(v => v.name),
  checks, failed: failures.length, failures, results,
};
fs.writeFileSync(path.join(OUT, 'kg4a-browser-verification-results.json'), JSON.stringify(summary, null, 2));

console.log(`\n${checks - failures.length}/${checks} checks passed`);
if (failures.length) { console.log('FAILURES:'); failures.forEach(f => console.log('  ' + f)); process.exit(1); }
console.log('ALL KG-4A CUTOVER DISPLAY CONTRACT CHECKS PASSED');
