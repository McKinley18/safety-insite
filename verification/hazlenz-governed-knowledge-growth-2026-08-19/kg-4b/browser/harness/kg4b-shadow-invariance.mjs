/**
 * KG-4B Phase 18 — real-Chromium proof that a customer cannot tell SHADOW is running.
 *
 * THE PROPERTY. KG-4A's browser pass verified that a GOVERNED customer sees a verified-text badge
 * and a legacy customer does not. KG-4B verifies the opposite and harder property: with the server
 * genuinely configured `GOVERNED_CUTOVER_MODE=SHADOW` and one account allowlisted, the two accounts
 * must be INDISTINGUISHABLE. Anything a reader could use to tell them apart — a badge, a notice, a
 * different confidence label, a different citation, a different card count — is a failure.
 *
 * It also covers the persistence loop the brief names: analysis → persistence → RELOAD → Standard
 * Detail → report-facing data. A shadow run must survive a reload without leaving a trace.
 *
 * NO CUSTOMER-FACING "SHADOW" TERMINOLOGY. The forbidden-vocabulary list includes the word itself,
 * so a well-meaning "shadow mode active" badge would fail the pass rather than ship.
 *
 * Usage:
 *   API_BASE_URL=… APP_BASE_URL=… SHADOW_EMAIL=… LEGACY_EMAIL=… PASSWORD=… \
 *   SHADOW_INSPECTION_ID=… LEGACY_INSPECTION_ID=… SHOT_DIR=… node kg4b-shadow-invariance.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const API = process.env.API_BASE_URL || 'http://127.0.0.1:4340';
const APP = process.env.APP_BASE_URL || 'http://127.0.0.1:3340';
const OUT = process.env.SHOT_DIR;
const PASSWORD = process.env.PASSWORD || 'KG4bTestPass!234';
fs.mkdirSync(OUT, { recursive: true });

/**
 * Internal vocabulary that must never reach a customer surface. KG-4B adds the shadow programme's
 * own names to KG-4A's list — including the bare word "shadow", because the brief is explicit that
 * no customer-facing shadow terminology may be introduced.
 */
const FORBIDDEN = [
  'starter-unverified', 'reviewer_approved', 'recordChecksum', 'corpusBacked', 'backingStatus',
  'UNAPPROVED_CONTENT', 'CITATION_ONLY', 'APPROVED_GOVERNED_CONTENT', 'effectiveReviewState',
  'releaseId', 'mechanically_validated', 'approvalDigest',
  'GOVERNED_WITH_FALLBACK', 'GOVERNED_STRICT', 'LEGACY_TEXT_UNVERIFIED', 'GOVERNED_VERIFIED_TEXT',
  'CITATION_ONLY_NO_TEXT', 'governedDeliveryState', 'governedFallbackReason', 'knowledgeReleaseId',
  'APPROVED_SECTION_ONLY', 'RESOLVER_UNAVAILABLE', 'federal-core-',
  // KG-4B additions
  'SHADOW', 'shadow mode', 'Shadow mode', 'mismatch', 'governed_shadow_comparison',
  'correlationId', 'eventKey', 'EXACT_MATCH', 'GOVERNED_MISSING', 'BLOCKING', 'kg4b',
];

const VIEWS = [
  { name: 'light',       theme: 'light', width: 1440, height: 900, mobile: false },
  { name: 'dark',        theme: 'dark',  width: 1440, height: 900, mobile: false },
  { name: 'mobile',      theme: 'light', width: 390,  height: 844, mobile: true  },
  { name: 'mobile-dark', theme: 'dark',  width: 390,  height: 844, mobile: true  },
];

const ACCOUNTS = {
  shadow: { email: process.env.SHADOW_EMAIL, inspectionId: process.env.SHADOW_INSPECTION_ID },
  legacy: { email: process.env.LEGACY_EMAIL, inspectionId: process.env.LEGACY_INSPECTION_ID },
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
    if (response.status !== 429) throw new Error(`login ${email}: ${response.status}`);
    await new Promise(r => setTimeout(r, 13_000));
  }
  throw new Error(`login for ${email} kept returning 429`);
}

/** Reads every Standard Detail card as structure, not flattened text. */
async function readCards(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll('.guided-standard-card')).map((card) => {
    const heading = card.querySelector('button span span');
    const confidenceP = Array.from(card.querySelectorAll('p')).find((p) => {
      const strong = p.querySelector('strong');
      return strong && strong.textContent.trim() === 'Confidence:';
    });
    return {
      citation: heading ? heading.textContent.trim() : '',
      confidenceLabel: confidenceP
        ? Array.from(confidenceP.childNodes).filter(n => n.nodeType === Node.TEXT_NODE)
          .map(n => n.textContent).join(' ').trim() : '',
      hasBadge: Array.from(card.querySelectorAll('span')).some(s => s.textContent.trim() === 'Verified standard text'),
      hasNotice: Array.from(card.querySelectorAll('p')).some(p => p.textContent.includes('not currently available for this citation')),
      hasSourceCaveat: Array.from(card.querySelectorAll('p')).some(p => p.textContent.includes('has not completed source review')),
      hasSummaryLabel: card.innerText.toUpperCase().includes('HAZLENZ STANDARD SUMMARY'),
    };
  }));
}

const failures = [];
let checks = 0;
function check(condition, label) {
  checks++;
  if (condition) console.log(`  ok    ${label}`);
  else { failures.push(label); console.log(`  FAIL  ${label}`); }
}

const sessions = { shadow: await login(ACCOUNTS.shadow.email), legacy: await login(ACCOUNTS.legacy.email) };
const browser = await chromium.launch();
console.log('Chromium', browser.version());
const results = [];

for (const view of VIEWS) {
  console.log(`\n=== view=${view.name} (${view.width}x${view.height}, ${view.theme}) ===`);
  const captured = {};

  for (const which of ['shadow', 'legacy']) {
    const ctx = await browser.newContext({
      viewport: { width: view.width, height: view.height },
      deviceScaleFactor: 2, isMobile: view.mobile, hasTouch: view.mobile, colorScheme: view.theme,
    });
    const page = await ctx.newPage();
    await page.goto(`${APP}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(([token, refresh, user, inspectionId, theme]) => {
      localStorage.setItem('sentinel_auth_token', token);
      localStorage.setItem('sentinel_auth_refresh_token', refresh || '');
      localStorage.setItem('sentinel_auth_user', JSON.stringify(user || {}));
      localStorage.setItem('sentinel_selected_inspection_context', JSON.stringify({ persistedInspectionId: inspectionId }));
      localStorage.setItem('safety_insite_theme', theme);
    }, [sessions[which].token, sessions[which].refreshToken, sessions[which].user,
      ACCOUNTS[which].inspectionId, view.theme]);

    await page.goto(`${APP}/inspection-workspace`, { waitUntil: 'networkidle' });
    await page.waitForSelector('article', { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(1500);

    const cards = await readCards(page);
    const body = (await page.evaluate(() => document.body.innerText)) || '';

    // RELOAD: a shadow run must leave no trace that survives persistence + rehydration.
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('article', { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const cardsAfterReload = await readCards(page);
    const bodyAfterReload = (await page.evaluate(() => document.body.innerText)) || '';

    captured[which] = { cards, cardsAfterReload, body, bodyAfterReload };
    console.log(`  -- ${which} account: ${cards.length} card(s), ${cardsAfterReload.length} after reload`);

    for (const term of FORBIDDEN) {
      check(!body.includes(term), `[${view.name}/${which}] '${term}' does not appear on screen`);
      check(!bodyAfterReload.includes(term), `[${view.name}/${which}] '${term}' does not appear after reload`);
    }
    check(JSON.stringify(cards) === JSON.stringify(cardsAfterReload),
      `[${view.name}/${which}] the Standard Detail cards are identical after a reload`);

    await page.screenshot({ path: path.join(OUT, `${which}-${view.name}.png`), fullPage: true });
    await ctx.close();
  }

  // THE COMPARATIVE PROPERTY: the two accounts must be indistinguishable.
  const s = captured.shadow, l = captured.legacy;
  check(s.cards.length === l.cards.length,
    `[${view.name}] HARD: both accounts render the SAME NUMBER of standard cards (${s.cards.length} vs ${l.cards.length})`);
  check(JSON.stringify(s.cards.map(c => c.citation)) === JSON.stringify(l.cards.map(c => c.citation)),
    `[${view.name}] HARD: identical citations in identical order`);
  check(JSON.stringify(s.cards.map(c => c.confidenceLabel)) === JSON.stringify(l.cards.map(c => c.confidenceLabel)),
    `[${view.name}] HARD: identical applicability confidence labels`);
  check(s.cards.every(c => !c.hasBadge) && l.cards.every(c => !c.hasBadge),
    `[${view.name}] HARD: NEITHER account shows a verified-text badge — SHADOW grants nothing`);
  check(JSON.stringify(s.cards.map(c => [c.hasBadge, c.hasNotice, c.hasSourceCaveat, c.hasSummaryLabel])) ===
        JSON.stringify(l.cards.map(c => [c.hasBadge, c.hasNotice, c.hasSourceCaveat, c.hasSummaryLabel])),
    `[${view.name}] HARD: identical badge / notice / caveat / label state on every card`);
  check(JSON.stringify(s.cards) === JSON.stringify(l.cards),
    `[${view.name}] HARD: the whole Standard Detail structure is byte-identical between the two accounts`);

  results.push({ view: view.name, shadow: s.cards, legacy: l.cards });
}

await browser.close();

const summary = {
  generatedBy: 'kg4b-shadow-invariance.mjs',
  api: API, app: APP, views: VIEWS.map(v => v.name),
  checks, failed: failures.length, failures, results,
};
fs.writeFileSync(path.join(OUT, 'kg4b-browser-verification-results.json'), JSON.stringify(summary, null, 2));

console.log(`\n${checks - failures.length}/${checks} checks passed`);
if (failures.length) { console.log('FAILURES:'); failures.forEach(f => console.log('  ' + f)); process.exit(1); }
console.log('ALL KG-4B SHADOW BROWSER INVARIANCE CHECKS PASSED');
