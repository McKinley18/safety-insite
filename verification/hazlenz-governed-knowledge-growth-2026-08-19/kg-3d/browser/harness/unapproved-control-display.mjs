/**
 * KG-3D Phase 8 CONTROL.
 *
 * The Phase 8 fix suppresses the content-backing caveat when the verified badge is shown. The
 * obvious way to "pass" that check is to suppress the caveat everywhere, which would silently
 * delete a disclosure. This run asserts the opposite branch on a standard that is NOT approved:
 * no badge, and the caveat still present.
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

fs.mkdirSync(OUT, { recursive: true });

const login = await fetch(`${API}/auth/login`, {
  method: 'POST', headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
}).then(r => r.json());
if (!login.token) throw new Error('login failed');

const failures = [];
const results = [];
const browser = await chromium.launch();
console.log('Chromium', browser.version());

for (const view of [
  { name: 'light', theme: 'light', width: 1440, height: 1000, mobile: false },
  { name: 'mobile-dark', theme: 'dark', width: 390, height: 844, mobile: true },
]) {
  const ctx = await browser.newContext({
    viewport: { width: view.width, height: view.height },
    deviceScaleFactor: 2, isMobile: view.mobile, hasTouch: view.mobile, colorScheme: view.theme,
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

  const index = await page.evaluate(() => Array.from(document.querySelectorAll('article'))
    .findIndex(a => a.querySelector('button')));
  const article = page.locator('article').nth(Math.max(index, 0));
  const reviewBtn = article.getByRole('button', { name: /Review this finding|Reviewing this finding/ });
  await reviewBtn.scrollIntoViewIfNeeded();
  await reviewBtn.click();
  await page.waitForTimeout(1000);

  const card = page.locator('.guided-standard-card').first();
  await card.scrollIntoViewIfNeeded();
  const cardText = (await card.innerText()).replace(/\s+/g, ' ').trim();
  const U = cardText.toUpperCase();

  const checks = [];
  const check = (name, ok, detail = '') => {
    checks.push({ name, ok, detail });
    if (!ok) failures.push(`[${view.name}] ${name} ${detail}`);
  };

  // The unavailable notice CONTAINS the badge phrase ("Verified standard text is not currently
  // available..."), so a bare substring test would report a badge that is not there. Same
  // discrimination the KG-3C harness makes.
  const hasNotice = U.includes('VERIFIED STANDARD TEXT IS NOT CURRENTLY AVAILABLE FOR THIS CITATION.');
  const hasBadge = U.includes('VERIFIED STANDARD TEXT') && !hasNotice;
  check('no verified badge on an unapproved standard', !hasBadge, cardText.slice(0, 200));
  check('content-backing caveat IS still shown',
    cardText.toLowerCase().includes('has not completed source review'), cardText.slice(0, 300));
  check('caveat does not claim to limit confidence',
    !cardText.toLowerCase().includes('limits confidence'));
  check('applicability confidence still reported', /confidence:/i.test(cardText));

  await card.screenshot({ path: path.join(OUT, `control-unapproved-${view.name}.png`) });
  results.push({ view: view.name, cardText: cardText.slice(0, 500), checks });
  console.log(`  ${view.name}: ${checks.every(c => c.ok) ? 'OK' : 'FAILED'}`);
  console.log(`     ${cardText.slice(0, 240)}`);
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(OUT, 'control-unapproved-results.json'), JSON.stringify({ results, failures }, null, 2));
console.log(`\n${failures.length === 0 ? 'ALL CONTROL CHECKS PASSED' : 'FAILURES:\n' + failures.join('\n')}`);
process.exitCode = failures.length === 0 ? 0 : 1;
