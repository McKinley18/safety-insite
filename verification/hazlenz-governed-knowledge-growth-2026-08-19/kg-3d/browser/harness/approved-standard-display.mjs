/**
 * KG-3D Phases 7, 8, 21: real-Chromium verification of the FIRST genuinely reviewer-approved
 * regulatory record.
 *
 * KG-3C proved the three display states against fixtures whose approvals it created itself. This
 * run renders 29 CFR 1910.36 carrying the real KG-3D reviewer decision, recorded against
 * authoritative eCFR evidence, and additionally asserts the Phase 8 acceptance criterion that
 * KG-3C could only flag (§20.13): an approved standard must not simultaneously claim that
 * "source approval or release coverage limits confidence".
 *
 * Captures light / dark / mobile / mobile-dark.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const API = process.env.API_BASE_URL || 'http://127.0.0.1:4320';
const APP = process.env.APP_BASE_URL || 'http://127.0.0.1:3320';
const OUT = process.env.SHOT_DIR;
const EMAIL = process.env.FIXTURE_EMAIL;
const PASSWORD = process.env.FIXTURE_PASSWORD;
const INSPECTION_ID = process.env.FIXTURE_INSPECTION_ID;
const CITATION = process.env.FIXTURE_CITATION || '29 CFR 1910.36';

fs.mkdirSync(OUT, { recursive: true });

const VERIFIED_BADGE = 'Verified standard text';
const UNAVAILABLE_NOTICE = 'Verified standard text is not currently available for this citation.';

// Phase 8. The old copy asserted that source approval limits confidence. On an approved record
// that is self-contradictory, and on an unapproved one it misattributes an applicability limit to
// a content-backing cause. Neither phrasing may appear beside an approved standard.
const CONFIDENCE_CONTRADICTIONS = [
  'Regulatory source approval or release coverage limits confidence',
  'limits confidence',
  'has not completed source review',
];

const FORBIDDEN = ['starter-unverified', 'reviewer_approved', 'recordChecksum', 'corpusBacked',
  'backingStatus', 'UNAPPROVED_CONTENT', 'CITATION_ONLY', 'APPROVED_GOVERNED_CONTENT',
  'effectiveReviewState', 'releaseId', 'mechanically_validated', 'kg-3d-remediation-reviewer',
  'federal-core-2026-08-19', 'osha-ecfr-1910'];

// Text the approved record must actually show -- proving the remediated content reached the user,
// not just that a badge appeared.
const REQUIRED_CONTENT = ['permanent part of the workplace'];
// The starter text's misattributed rule must be gone from the rendered summary.
const REMOVED_CONTENT = 'Exit routes must be permanent, unobstructed, and adequate for emergency egress';

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
  await page.waitForSelector('.guided-standard-card', { timeout: 45000 });
  await page.waitForTimeout(1200);

  const appliedTheme = await page.evaluate(() =>
    document.documentElement.className + '|' + document.documentElement.getAttribute('data-theme'));
  console.log(`\n=== view=${view.name} (${view.width}x${view.height}) html=${appliedTheme} ===`);

  // Select the finding through the real UI control. The fixture inspection holds a single
  // emergency-egress finding, but match on the card rather than assume an index.
  const index = await page.evaluate(() => Array.from(document.querySelectorAll('article'))
    .findIndex(a => /egress|exit/i.test(a.innerText)));
  if (index < 0) throw new Error('no egress finding card found');
  const article = page.locator('article').nth(index);
  const reviewBtn = article.getByRole('button', { name: /Review this finding|Reviewing this finding/ });
  await reviewBtn.scrollIntoViewIfNeeded();
  await reviewBtn.click();
  await page.waitForTimeout(1000);

  const card = page.locator('.guided-standard-card').first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const cardText = (await card.innerText()).replace(/\s+/g, ' ').trim();
  const pageText = await page.evaluate(() => document.body.innerText);
  const U = cardText.toUpperCase();

  const hasNotice = U.includes(UNAVAILABLE_NOTICE.toUpperCase());
  const hasBadge = U.includes(VERIFIED_BADGE.toUpperCase()) && !hasNotice;

  const checks = [];
  const check = (name, ok, detail = '') => {
    checks.push({ name, ok, detail });
    if (!ok) failures.push(`[${view.name}] ${name} ${detail}`);
  };

  // --- Phase 7: the approved state renders as approved ------------------------------------
  check('citation is visible', cardText.includes(CITATION), `expected "${CITATION}"`);
  check('verified badge shown', hasBadge);
  check('no unavailable notice', !hasNotice);
  check('remediated title shown', /design and construction requirements for exit routes/i.test(cardText));
  for (const phrase of REQUIRED_CONTENT) {
    check(`approved regulatory content shown: "${phrase}"`, cardText.toLowerCase().includes(phrase.toLowerCase()));
  }
  check('superseded starter text is gone', !cardText.includes(REMOVED_CONTENT));

  // --- Phase 8: no confidence contradiction beside an approved standard --------------------
  for (const phrase of CONFIDENCE_CONTRADICTIONS) {
    check(`no confidence contradiction: "${phrase}"`, !cardText.toLowerCase().includes(phrase.toLowerCase()));
  }
  // Applicability confidence itself must still be reported -- the fix must not have deleted it.
  check('applicability confidence still reported', /confidence:/i.test(cardText));

  // --- no governance vocabulary leaks -------------------------------------------------------
  for (const term of FORBIDDEN) {
    check(`no internal term "${term}" on page`, !pageText.includes(term));
  }

  // --- layout -------------------------------------------------------------------------------
  const overflow = await page.evaluate(() => ({
    docScrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    bodyScrollW: document.body.scrollWidth,
  }));
  check('no horizontal page overflow', overflow.docScrollW <= overflow.innerW + 1, JSON.stringify(overflow));

  const box = await card.boundingBox();
  check('standard card has non-zero size', !!box && box.width > 50 && box.height > 30, JSON.stringify(box));

  // The KG-3C mobile defect: the badge must render as ONE pill, not two fragments.
  const badgeGeometry = await page.evaluate(() => {
    const card = document.querySelector('.guided-standard-card');
    const badge = Array.from(card?.querySelectorAll('span') || [])
      .find(s => s.textContent.trim() === 'Verified standard text');
    if (!badge) return null;
    return { rects: badge.getClientRects().length, whiteSpace: getComputedStyle(badge).whiteSpace };
  });
  check('verified badge renders as a single unbroken pill',
    !!badgeGeometry && badgeGeometry.rects === 1, JSON.stringify(badgeGeometry));

  const styles = await page.evaluate(() => {
    const card = document.querySelector('.guided-standard-card');
    if (!card) return null;
    const badge = Array.from(card.querySelectorAll('span')).find(s => s.textContent.trim() === 'Verified standard text');
    const read = (el) => { if (!el) return null; const cs = getComputedStyle(el); return { color: cs.color, background: cs.backgroundColor, fontSize: cs.fontSize }; };
    const cardCs = getComputedStyle(card);
    return { badge: read(badge), card: { background: cardCs.backgroundColor, color: cardCs.color } };
  });

  await card.screenshot({ path: path.join(OUT, `approved-1910-36-${view.name}.png`) });
  await page.screenshot({ path: path.join(OUT, `approved-1910-36-${view.name}-context.png`) });

  results.push({ view: view.name, citation: CITATION, hasBadge, hasNotice, styles, overflow, badgeGeometry, cardText: cardText.slice(0, 700), checks });
  console.log(`  badge=${hasBadge} notice=${hasNotice} ${checks.every(c => c.ok) ? 'OK' : 'FAILED'}`);
  if (styles?.badge) console.log(`      badge color=${styles.badge.color} bg=${styles.badge.background}`);
  console.log(`      card: ${cardText.slice(0, 260)}`);
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(OUT, 'approved-standard-results.json'), JSON.stringify({ results, failures }, null, 2));
console.log(`\n${failures.length === 0 ? 'ALL KG-3D DISPLAY CHECKS PASSED' : 'FAILURES:\n' + failures.join('\n')}`);
process.exitCode = failures.length === 0 ? 0 : 1;
