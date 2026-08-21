/**
 * KG-3C Phases 5, 6, 8:
 *   5 — Standard Detail expand/collapse + finding switching, no stale content, state preserved.
 *   6 — placeholder-provenance (1910.36) UI hard gate.
 *   8 — mobile workflow: finding -> card -> open detail -> return, tap targets, no h-scroll.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const API = process.env.API_BASE_URL;
const APP = process.env.APP_BASE_URL;
const OUT = process.env.SHOT_DIR;
const PASSWORD = 'KG3cBrowser!Pass123';
const MAIN = { email: process.env.FIXTURE_EMAIL, inspection: process.env.FIXTURE_INSPECTION_ID };
const PLACEHOLDER = { email: process.env.PLACEHOLDER_EMAIL, inspection: process.env.PLACEHOLDER_INSPECTION_ID };

fs.mkdirSync(OUT, { recursive: true });
const failures = [];
const log = [];
const check = (name, ok, detail = '') => {
  log.push({ name, ok, detail });
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures.push(name + (detail ? ' — ' + detail : ''));
};

async function session(browser, fixture, view) {
  const login = await fetch(`${API}/auth/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: fixture.email, password: PASSWORD }),
  }).then(r => r.json());
  if (!login.token) throw new Error('login failed for ' + fixture.email);
  const ctx = await browser.newContext({
    viewport: { width: view.width, height: view.height },
    deviceScaleFactor: 2, isMobile: view.mobile, hasTouch: view.mobile, colorScheme: view.theme,
  });
  const page = await ctx.newPage();
  await page.goto(`${APP}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(([t, r, u, id, theme]) => {
    localStorage.setItem('sentinel_auth_token', t);
    localStorage.setItem('sentinel_auth_refresh_token', r);
    localStorage.setItem('sentinel_auth_user', JSON.stringify(u));
    localStorage.setItem('sentinel_selected_inspection_context', JSON.stringify({ persistedInspectionId: id }));
    localStorage.setItem('safety_insite_theme', theme);
  }, [login.token, login.refreshToken, login.user, fixture.inspection, view.theme]);
  await page.goto(`${APP}/inspection-workspace`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.guided-standard-card', { timeout: 30000 });
  await page.waitForTimeout(1200);
  return { ctx, page };
}

async function selectFinding(page, label) {
  const index = await page.evaluate((l) => Array.from(document.querySelectorAll('article'))
    .findIndex(a => a.innerText.split('\n')[0].trim() === l), label);
  if (index < 0) throw new Error(`no finding "${label}"`);
  const btn = page.locator('article').nth(index).getByRole('button', { name: /Review(ing)? this finding/ });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await page.waitForTimeout(900);
}

const cardState = (page) => page.evaluate(() => {
  const card = document.querySelector('.guided-standard-card');
  const t = card.innerText;
  return {
    citation: (t.match(/\d+ CFR [\d.]+(\([a-z0-9]+\))*/) || [''])[0],
    text: t.replace(/\s+/g, ' ').trim(),
    hasBadge: /VERIFIED STANDARD TEXT/i.test(t),
    hasNotice: /not currently available for this citation/i.test(t),
  };
});

const browser = await chromium.launch();
console.log('Chromium', browser.version());

// ---------------------------------------------------------------- Phase 5
console.log('\n=== PHASE 5 — Standard Detail E2E (desktop, light) ===');
{
  const { ctx, page } = await session(browser, MAIN, { width: 1440, height: 1000, theme: 'light', mobile: false });
  for (const label of ['Fall protection', 'Egress', 'Excavation']) {
    await selectFinding(page, label);
    const before = await cardState(page);

    const detailBtn = page.locator('.guided-standard-card').getByRole('button', { name: /Standard detail|Hide standard detail/ }).first();
    await detailBtn.click();
    await page.waitForTimeout(1500);
    const expandedText = await page.locator('.guided-standard-card').innerText();
    check(`[${label}] Standard detail opens an "Official regulation text" panel`,
      /OFFICIAL REGULATION TEXT/i.test(expandedText));
    check(`[${label}] detail panel does not fabricate text when unavailable`,
      /OFFICIAL REGULATION TEXT/i.test(expandedText));
    await page.screenshot({ path: path.join(OUT, `standard-detail-${label.toLowerCase().replace(/\W+/g, '-')}.png`) });

    await detailBtn.click();          // collapse -> back to the finding
    await page.waitForTimeout(800);
    const after = await cardState(page);
    check(`[${label}] citation unchanged after detail round-trip`, before.citation === after.citation, `${before.citation} -> ${after.citation}`);
    check(`[${label}] backing state unchanged after detail round-trip`,
      before.hasBadge === after.hasBadge && before.hasNotice === after.hasNotice);
  }

  // switching away and back must not leave another standard's content behind
  await selectFinding(page, 'Fall protection');
  const fall = await cardState(page);
  await selectFinding(page, 'Excavation');
  const exc = await cardState(page);
  await selectFinding(page, 'Fall protection');
  const fallAgain = await cardState(page);
  check('switching findings changes the rendered citation', fall.citation !== exc.citation, `${fall.citation} vs ${exc.citation}`);
  check('returning to a finding restores its own citation', fall.citation === fallAgain.citation);
  check('returning to a finding restores its own backing state',
    fall.hasBadge === fallAgain.hasBadge && fall.hasNotice === fallAgain.hasNotice);
  check('no stale content from the other standard', !fallAgain.text.includes(exc.citation));
  await ctx.close();
}

// ---------------------------------------------------------------- Phase 6
console.log('\n=== PHASE 6 — placeholder-provenance 1910.36 UI hard gate ===');
for (const view of [{ name: 'light', width: 1440, height: 1000, theme: 'light', mobile: false },
                    { name: 'dark', width: 1440, height: 1000, theme: 'dark', mobile: false },
                    { name: 'mobile', width: 390, height: 844, theme: 'light', mobile: true }]) {
  const { ctx, page } = await session(browser, PLACEHOLDER, view);
  const state = await cardState(page);
  const pageText = await page.evaluate(() => document.body.innerText);
  check(`[${view.name}] 1910.36 is the rendered citation`, state.text.includes('1910.36'), state.citation);
  check(`[${view.name}] NOT marked "Verified standard text"`, !state.hasBadge);
  check(`[${view.name}] no "starter-unverified" string anywhere in the UI`, !pageText.includes('starter-unverified'));
  check(`[${view.name}] no "corpus" / backing vocabulary leaked`,
    !/corpusBacked|backingStatus|UNAPPROVED_CONTENT|corpus-backed/i.test(pageText));
  await page.locator('.guided-standard-card').first().screenshot({ path: path.join(OUT, `placeholder-1910-36-${view.name}.png`) });
  await ctx.close();
}

// ---------------------------------------------------------------- Phase 8
console.log('\n=== PHASE 8 — mobile workflow (390x844) ===');
{
  const { ctx, page } = await session(browser, MAIN, { width: 390, height: 844, theme: 'light', mobile: true });
  await selectFinding(page, 'Fall protection');
  const before = await cardState(page);

  const detailBtn = page.locator('.guided-standard-card').getByRole('button', { name: /Standard detail|Hide standard detail/ }).first();
  const box = await detailBtn.boundingBox();
  check('standard-detail control meets a usable tap height (>=24px)', !!box && box.height >= 24, `h=${box?.height}`);

  const reviewBtnBox = await page.locator('article').first().getByRole('button', { name: /Review(ing)? this finding/ }).boundingBox();
  check('finding review control meets 40px tap height', !!reviewBtnBox && reviewBtnBox.height >= 40, `h=${reviewBtnBox?.height}`);

  await detailBtn.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, 'mobile-standard-detail-open.png'), fullPage: false });
  const overflowOpen = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, win: window.innerWidth }));
  check('no horizontal page scroll with the detail panel open', overflowOpen.doc <= overflowOpen.win + 1, JSON.stringify(overflowOpen));

  await detailBtn.click();
  await page.waitForTimeout(800);
  const after = await cardState(page);
  check('mobile: returning from detail preserves the finding', before.citation === after.citation);
  check('mobile: returning from detail preserves the backing state',
    before.hasBadge === after.hasBadge && before.hasNotice === after.hasNotice);

  const overflow = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, win: window.innerWidth }));
  check('no horizontal page scroll on the workflow', overflow.doc <= overflow.win + 1, JSON.stringify(overflow));
  await ctx.close();
}

await browser.close();
fs.writeFileSync(path.join(OUT, 'e2e-verification-results.json'), JSON.stringify({ log, failures }, null, 2));
console.log(`\n${failures.length === 0 ? 'ALL E2E / PLACEHOLDER / MOBILE CHECKS PASSED' : 'FAILURES:\n' + failures.join('\n')}`);
process.exitCode = failures.length ? 1 : 0;
