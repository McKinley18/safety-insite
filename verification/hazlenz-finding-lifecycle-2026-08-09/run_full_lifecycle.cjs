const { chromium, request } = require('/Users/mckinley/Desktop/Safety_InSite/frontend-next/node_modules/playwright');
const fs = require('fs');
const backend = 'http://127.0.0.1:4237';
const frontend = 'http://localhost:3008';
const email = 'lifecycle.owner@example.test';
const password = 'Lifecycle!123';
const chrome = '/Users/mckinley/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

async function json(response) { return response.json().catch(() => ({})); }
async function createInspection(api, headers, siteId, title) {
  const r = await api.post(`${backend}/inspections`, { headers, data: { siteId, title } });
  return { status: r.status(), body: await json(r) };
}

(async () => {
  const api = await request.newContext();
  const login = await api.post(`${backend}/auth/login`, { data: { email, password } });
  const auth = await json(login);
  const headers = { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' };
  const sitesResponse = await api.get(`${backend}/sites?limit=100`, { headers });
  const sites = await json(sitesResponse);
  let site = sites.data?.[0];
  if (!site) site = await json(await api.post(`${backend}/sites`, { headers, data: { name: 'Finding Lifecycle Site' } }));
  const scenarios = [{
    key: 'guard-electrical-floor',
    title: 'Lifecycle Guard Electrical Floor',
    observation: 'During conveyor clearing, the drive nip point is exposed while the belt is running, and a nearby electrical panel has an open cover with energized conductors within reach. Operators also cross an oily walking surface beside the drive.',
    location: 'Crusher conveyor drive and adjacent panel', activity: 'Clearing a conveyor jam',
  }, {
    key: 'ladder-mobile-equipment',
    title: 'Lifecycle Ladder Mobile Equipment',
    observation: 'A worker climbs a damaged extension ladder from an uneven loading area while a forklift reverses through the same aisle; the ladder feet are not secured and the forklift alarm is not heard.',
    location: 'Loading dock aisle', activity: 'Loading pallets',
  }, {
    key: 'hotwork-gas-egress',
    title: 'Lifecycle Hot Work Gas Egress',
    observation: 'Welding is underway beside stored oxygen cylinders and combustible packaging. One cylinder is unsecured, and the nearest exit route is narrowed by scrap material.',
    location: 'Fabrication bay', activity: 'Welding repair',
  }];
  const browser = await chromium.launch({ headless: true, executablePath: chrome });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const all = [];
  for (const scenario of scenarios) {
    const created = await createInspection(api, headers, site.id, scenario.title);
    const inspection = created.body;
    const events = [];
    page.on('response', response => {
      if (/inspections|safescope|actions|tasks|inspection-reports/.test(response.url())) events.push({ url: response.url(), status: response.status() });
    });
    await page.goto(`${frontend}/login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(({ token, user, inspectionId, siteId, title }) => {
      localStorage.setItem('sentinel_auth_token', token);
      localStorage.setItem('sentinel_auth_user', JSON.stringify(user));
      localStorage.setItem('sentinel_selected_inspection_context', JSON.stringify({ persistedInspectionId: inspectionId, persistedSiteId: siteId, persistenceState: 'saved', inspectionType: 'guided_inspection', inspectionTitle: title, workflowDepth: 'guided' }));
    }, { token: auth.token, user: auth.user, inspectionId: inspection.id, siteId: site.id, title: scenario.title });
    await page.goto(`${frontend}/inspection-workspace`, { waitUntil: 'domcontentloaded' });
    await page.getByLabel('What did you observe?').fill(scenario.observation);
    await page.getByLabel('Location or area').fill(scenario.location);
    await page.getByLabel('Work activity').fill(scenario.activity);
    await page.getByRole('button', { name: /Save and review with HazLenz AI/i }).click();
    await page.waitForTimeout(6000);
    const reviewBody = await page.locator('body').innerText();
    const findingTexts = await page.locator('article').allTextContents();
    const findings = findingTexts.filter(t => /Finding ID:/.test(t)).map(t => {
      const id = t.match(/Finding ID:\s*([\w-]+)/)?.[1];
      const category = t.split('\n')[0];
      return { id, category, text: t };
    });
    const stage = { review: /Human review required/.test(reviewBody), findings, buttons: await page.getByRole('button').allTextContents(), events: [...events] };
    // Exercise one finding review through the normal UI, then prove the remaining review gate.
    if (stage.review && findings.length) {
      await page.getByRole('button', { name: /Continue to risk review/i }).click();
      await page.waitForTimeout(200);
      const before = await page.locator('body').innerText();
      await page.getByRole('button', { name: /Attempt finalization now/i }).click();
      await page.waitForTimeout(400);
      const partial = await page.locator('body').innerText();
      stage.partialFinalization = { blocked: /requires|review|unreviewed|cannot|rejected/i.test(partial) && !/Inspection finalized\./.test(partial), text: partial.slice(-1800) };
      await page.getByRole('button', { name: /Back to HazLenz review/i }).click();
      await page.waitForTimeout(200);
      await page.getByRole('button', { name: /Continue to risk review/i }).click();
      await page.waitForTimeout(150);
      await page.getByRole('button', { name: /Confirm risk and finalize finding/i }).click();
      await page.waitForTimeout(700);
      stage.afterFirstReview = (await page.locator('body').innerText()).slice(-2200);
    }
    const persistedResponse = await api.get(`${backend}/inspections/${inspection.id}`, { headers });
    const persisted = await json(persistedResponse);
    stage.persisted = persisted;
    all.push({ scenario, inspectionId: inspection.id, stage });
    await page.screenshot({ path: `${__dirname}/${scenario.key}.png`, fullPage: true });
  }
  fs.writeFileSync(`${__dirname}/FULL_LIFECYCLE_PROBE.json`, JSON.stringify(all, null, 2));
  console.log(JSON.stringify(all.map(x => ({ key:x.scenario.key, inspectionId:x.inspectionId, review:x.stage.review, findings:x.stage.findings.length, partial:x.stage.partialFinalization, persistedFindings:x.stage.persisted.findings?.length, status:x.stage.persisted.status })), null, 2));
  await browser.close(); await api.dispose();
})();
