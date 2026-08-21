/**
 * KG-3C Phases 4-8: real-Chromium verification of the standards display contract.
 * Captures light / dark / mobile evidence for all three backing states and asserts the
 * customer-visible contract in the actually-rendered DOM.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const API = process.env.API_BASE_URL || 'http://127.0.0.1:4310';
const APP = process.env.APP_BASE_URL || 'http://127.0.0.1:3310';
const OUT = process.env.SHOT_DIR;
const EMAIL = process.env.FIXTURE_EMAIL;
const PASSWORD = process.env.FIXTURE_PASSWORD;
const INSPECTION_ID = process.env.FIXTURE_INSPECTION_ID;

fs.mkdirSync(OUT, { recursive: true });

// finding label (exact first line of its list card) -> expected backing state
const STATES = [
  { key: 'approved',      findingLabel: 'Fall protection', citation: '29 CFR 1926.501',       expect: 'APPROVED_GOVERNED_CONTENT' },
  { key: 'unapproved',    findingLabel: 'Egress',          citation: '29 CFR 1926.34(a)',     expect: 'UNAPPROVED_CONTENT' },
  { key: 'citation-only', findingLabel: 'Excavation',      citation: '29 CFR 1926.652(a)(1)', expect: 'CITATION_ONLY' },
];

const VERIFIED_BADGE = 'Verified standard text';
const UNAVAILABLE_NOTICE = 'Verified standard text is not currently available for this citation.';
const FORBIDDEN = ['starter-unverified', 'reviewer_approved', 'recordChecksum', 'corpusBacked',
  'backingStatus', 'UNAPPROVED_CONTENT', 'CITATION_ONLY', 'APPROVED_GOVERNED_CONTENT',
  'effectiveReviewState', 'releaseId', 'mechanically_validated'];

const VIEWS = [
  { name: 'light',       theme: 'light', width: 1440, height: 1000, mobile: false },
  { name: 'dark',        theme: 'dark',  width: 1440, height: 1000, mobile: false },
  { name: 'mobile',      theme: 'light', width: 390,  height: 844,  mobile: true  },
  { name: 'mobile-dark', theme: 'dark',  width: 390,  height: 844,  mobile: true  },
];

const login = await fetch(`${API}/auth/login`, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
}).then(r => r.json());
if (!login.token) throw new Error('login failed');

const results = [];
const failures = [];
const browser = await chromium.launch();
console.log('Chromium', browser.version());

for (const view of VIEWS) {
  const ctx = await browser.newContext({
    viewport: { width: view.width, height: view.height },
    deviceScaleFactor: 2,
    isMobile: view.mobile,
    hasTouch: view.mobile,
    colorScheme: view.theme,
  });
  const page = await ctx.newPage();
  await page.goto(`${APP}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(([token, refresh, user, inspectionId, theme]) => {
    localStorage.setItem('sentinel_auth_token', token);
    localStorage.setItem('sentinel_auth_refresh_token', refresh);
    localStorage.setItem('sentinel_auth_user', JSON.stringify(user));
    localStorage.setItem('sentinel_selected_inspection_context', JSON.stringify({ persistedInspectionId: inspectionId }));
    localStorage.setItem('safety_insite_theme', theme);
  }, [login.token, login.refreshToken, login.user, INSPECTION_ID, view.theme]);

  await page.goto(`${APP}/inspection-workspace`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.guided-standard-card', { timeout: 30000 });
  await page.waitForTimeout(1200);

  const appliedTheme = await page.evaluate(() => document.documentElement.className + '|' + document.documentElement.getAttribute('data-theme'));
  console.log(`\n=== view=${view.name} (${view.width}x${view.height}) html=${appliedTheme} ===`);

  for (const state of STATES) {
    // --- select the finding through the real UI control -------------------------------------
    // Matched on the card's exact first line so "Excavation" cannot also match the sibling
    // "excavation/trench condition" finding.
    const index = await page.evaluate((label) => Array.from(document.querySelectorAll('article'))
      .findIndex(a => a.innerText.split('\n')[0].trim() === label), state.findingLabel);
    if (index < 0) throw new Error(`no finding card with first line "${state.findingLabel}"`);
    const article = page.locator('article').nth(index);
    const reviewBtn = article.getByRole('button', { name: /Review this finding|Reviewing this finding/ });
    await reviewBtn.scrollIntoViewIfNeeded();
    await reviewBtn.click();
    await page.waitForTimeout(900);

    const card = page.locator('.guided-standard-card').first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const cardText = (await card.innerText()).replace(/\s+/g, ' ').trim();
    const pageText = await page.evaluate(() => document.body.innerText);

    // The badge is rendered uppercase by CSS (`uppercase`), and innerText reflects the applied
    // text-transform, so all copy matching here is case-insensitive.
    const U = cardText.toUpperCase();
    const hasNotice = U.includes(UNAVAILABLE_NOTICE.toUpperCase());
    const hasBadge = U.includes(VERIFIED_BADGE.toUpperCase()) && !hasNotice;
    const showsCitation = cardText.includes(state.citation);

    // --- contract assertions on the RENDERED DOM ---------------------------------------------
    const checks = [];
    const check = (name, ok, detail = '') => { checks.push({ name, ok, detail }); if (!ok) failures.push(`[${view.name}/${state.key}] ${name} ${detail}`); };

    check('citation is visible', showsCitation, `expected "${state.citation}" in card`);
    if (state.expect === 'APPROVED_GOVERNED_CONTENT') {
      check('verified badge shown', hasBadge);
      check('no unavailable notice', !hasNotice);
    } else if (state.expect === 'UNAPPROVED_CONTENT') {
      check('no verified badge', !U.includes(VERIFIED_BADGE.toUpperCase()));
      check('no unavailable notice', !hasNotice);
      check('summary still shown under honest label', U.includes('HAZLENZ STANDARD SUMMARY'));
    } else {
      check('no verified-text claim', !U.includes(VERIFIED_BADGE.toUpperCase()) || hasNotice);
      check('unavailable notice shown', hasNotice);
      check('no fabricated body text', !U.includes('HAZLENZ STANDARD SUMMARY'));
    }
    for (const term of FORBIDDEN) {
      check(`no internal term "${term}" on page`, !pageText.includes(term));
    }
    // layout
    const overflow = await page.evaluate(() => ({
      docScrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
      bodyScrollW: document.body.scrollWidth,
    }));
    check('no horizontal page overflow', overflow.docScrollW <= overflow.innerW + 1, JSON.stringify(overflow));

    const box = await card.boundingBox();
    check('standard card has non-zero size', !!box && box.width > 50 && box.height > 30, JSON.stringify(box));

    // measured colors for the badge / notice, read from the live computed style
    const styles = await page.evaluate(() => {
      const card = document.querySelector('.guided-standard-card');
      if (!card) return null;
      const badge = Array.from(card.querySelectorAll('span')).find(s => s.textContent.trim() === 'Verified standard text');
      const notice = Array.from(card.querySelectorAll('p')).find(p => p.textContent.includes('not currently available for this citation'));
      const read = (el) => { if (!el) return null; const cs = getComputedStyle(el); return { color: cs.color, background: cs.backgroundColor, fontSize: cs.fontSize }; };
      const cardCs = getComputedStyle(card);
      return { badge: read(badge), notice: read(notice), card: { background: cardCs.backgroundColor, color: cardCs.color, borderLeft: cardCs.borderLeftColor } };
    });

    const file = path.join(OUT, `${state.key}-${view.name}.png`);
    await card.screenshot({ path: file });
    const ctxFile = path.join(OUT, `${state.key}-${view.name}-context.png`);
    await page.screenshot({ path: ctxFile });

    results.push({ view: view.name, state: state.key, expect: state.expect, hasBadge, hasNotice, showsCitation, styles, overflow, cardText: cardText.slice(0, 400), checks });
    console.log(`  ${state.key.padEnd(14)} badge=${String(hasBadge).padEnd(5)} notice=${String(hasNotice).padEnd(5)} citation=${showsCitation} ${checks.every(c => c.ok) ? 'OK' : 'FAILED'}`);
    if (styles?.badge) console.log(`      badge  color=${styles.badge.color} bg=${styles.badge.background} size=${styles.badge.fontSize}`);
    if (styles?.notice) console.log(`      notice color=${styles.notice.color} bg=${styles.notice.background} size=${styles.notice.fontSize}`);
    if (styles?.card) console.log(`      card   bg=${styles.card.background} color=${styles.card.color}`);
  }
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(OUT, 'browser-verification-results.json'), JSON.stringify({ results, failures }, null, 2));
console.log(`\n${failures.length === 0 ? 'ALL CONTRACT CHECKS PASSED' : 'FAILURES:\n' + failures.join('\n')}`);
process.exitCode = failures.length === 0 ? 0 : 1;
