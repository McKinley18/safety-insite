// Pixel-accurate contrast measurement.
//
// Deliberately does NOT read computed styles. It screenshots the element and measures the
// pixels the browser actually painted, then re-decodes them through a canvas. That makes it
// immune to the failure modes of the style-based checker used earlier in this phase:
// gradients and background images, lab()/oklch() colour spaces, alpha compositing, and
// ancestor-walking guesswork.
//
// Foreground/background are separated by luminance clustering over the element's own pixels:
// the modal colour is the background, and the anti-aliasing-resistant extreme on the other
// side of the midpoint is the text colour.
import { chromium } from "playwright";
import pg from "pg";
import { mkdirSync, writeFileSync } from "node:fs";

const appUrl = process.env.APP_URL || "http://localhost:3010";
const apiUrl = process.env.API_BASE_URL || "http://localhost:4010";
const outDir = process.env.OUT_DIR || "/tmp/contrast";
if (!process.env.DATABASE_URL || !/test|closure|phase[0-9]+|_qa_/i.test(process.env.DATABASE_URL)) {
  throw new Error("An explicitly disposable database is required.");
}
mkdirSync(outDir, { recursive: true });

const suffix = Date.now();
const email = `contrast-${suffix}@insite-verify.test`;
const password = "Contrast!Pass123";
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
const browser = await chromium.launch({ headless: true });

// Runs inside the page: decode a PNG data URL and cluster its pixels.
const ANALYSE = (dataUrl) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    const counts = new Map();
    for (let i = 0; i < data.length; i += 4) {
      const key = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const unpack = (k) => [(k >> 16) & 255, (k >> 8) & 255, k & 255];
    const lum = ([r, g, b]) => {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((t, e) => t + e[1], 0);
    const bg = unpack(entries[0][0]);
    const bgL = lum(bg);
    // Text pixels: the furthest-from-background colour that still covers a real share of the
    // element (>=0.4%), which excludes single-pixel anti-aliasing artefacts and sub-pixel fringes.
    let fg = bg, best = -1;
    for (const [key, count] of entries) {
      if (count / total < 0.004) continue;
      const rgb = unpack(key);
      const d = Math.abs(lum(rgb) - bgL);
      if (d > best) { best = d; fg = rgb; }
    }
    const [hi, lo] = [lum(fg), bgL].sort((a, b) => b - a);
    resolve({
      foreground: 'rgb(' + fg.join(', ') + ')',
      background: 'rgb(' + bg.join(', ') + ')',
      ratio: +(((hi + 0.05) / (lo + 0.05)).toFixed(2)),
      distinctColours: entries.length,
      pixels: total,
    });
  };
  img.src = dataUrl;
});

async function measure(page, locator, label) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  const shot = await locator.screenshot();
  const dataUrl = `data:image/png;base64,${shot.toString("base64")}`;
  const res = await page.evaluate(ANALYSE, dataUrl);
  const style = await locator.evaluate((el) => {
    const s = getComputedStyle(el);
    return { fontSize: parseFloat(s.fontSize), fontWeight: Number(s.fontWeight) || 400 };
  });
  const large = style.fontSize >= 24 || (style.fontSize >= 18.66 && style.fontWeight >= 700);
  const target = large ? 3.0 : 4.5;
  return {
    label, ...res, fontSize: style.fontSize, fontWeight: style.fontWeight,
    largeText: large, target, passes: res.ratio >= target,
    size: box ? `${Math.round(box.width)}x${Math.round(box.height)}` : null,
  };
}

const results = [];
try {
  const setup = await browser.newPage();
  const reg = await setup.request.post(`${apiUrl}/auth/register`, {
    data: { email, password, name: "Contrast", type: "individual" },
  });
  if (reg.status() !== 201) throw new Error(`register ${reg.status()}`);
  const { userId } = await reg.json();
  await db.query(
    `INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'test','pro','active',now(),now()+interval '4 hours',NULL,'Contrast fixture')`,
    [userId],
  );
  await setup.close();

  for (const scheme of ["light", "dark"]) {
    for (const width of [1280, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 950 }, colorScheme: scheme });
      await context.addInitScript(`try{localStorage.setItem("safety_insite_theme","${scheme}")}catch(e){}`);
      const page = await context.newPage();
      await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
      await page.getByPlaceholder("you@example.com").fill(email);
      await page.getByPlaceholder("Enter your password").fill(password);
      await page.getByRole("button", { name: /sign in/i }).click();
      await page.waitForURL(/command-center/, { timeout: 30000 });

      // ---- Schedule button (calendar) ----
      await page.goto(`${appUrl}/safety-calendar`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1000);
      const schedule = page.getByRole("button", { name: /^Schedule$/ }).first();
      results.push({ scheme, width, state: "rest", ...(await measure(page, schedule, "Schedule button")) });
      await schedule.hover();
      await page.waitForTimeout(250);
      results.push({ scheme, width, state: "hover", ...(await measure(page, schedule, "Schedule button")) });
      await schedule.focus();
      await page.evaluate(() => document.activeElement?.classList.add("__probe-focus"));
      await page.waitForTimeout(250);
      results.push({ scheme, width, state: "focus-visible", ...(await measure(page, schedule, "Schedule button")) });

      // ---- Citation link (inspection workspace) ----
      await page.goto(`${appUrl}/inspections`, { waitUntil: "networkidle" });
      await page.getByLabel("New site name").fill(`Contrast ${scheme}${width} ${suffix}`);
      await page.getByRole("button", { name: "Save site" }).click();
      await page.getByRole("status").filter({ hasText: "Site saved" }).waitFor();
      await page.getByRole("button", { name: /Full Inspection/ }).first().click();
      await page.getByRole("button", { name: /Start Full Inspection/ }).click();
      await page.waitForURL(/inspection-workspace/, { timeout: 30000 });
      await page.locator("#observation").fill(
        "The emergency exit door in the north aisle is blocked by stacked pallets and a solvent drum beside it has no hazard label.",
      );
      await page.getByRole("button", { name: "Save and review with HazLenz AI" }).click();
      await page.getByRole("heading", { name: /HazLenz assessment/ }).waitFor({ timeout: 60000 });
      await page.waitForTimeout(1200);

      const citation = page.locator("span.underline").filter({ hasText: /CFR/ }).first();
      if (await citation.count()) {
        results.push({ scheme, width, state: "rest", ...(await measure(page, citation, "Citation link")) });
      }
      const pill = page.getByText(/^(Standard detail|Hide standard detail)$/).first();
      if (await pill.count()) {
        results.push({ scheme, width, state: "rest", ...(await measure(page, pill, "Standard detail pill")) });
      }
      await context.close();
    }
  }

  const failures = results.filter((r) => !r.passes);
  writeFileSync(`${outDir}/contrast-results.json`, JSON.stringify({ results, failures }, null, 2));
  console.log(JSON.stringify({
    summary: results.map((r) => `${r.scheme}/${r.width}/${r.state} ${r.label}: ${r.ratio}:1 (target ${r.target}) ${r.passes ? "PASS" : "FAIL"} [${r.foreground} on ${r.background}]`),
    failureCount: failures.length,
    passed: failures.length === 0,
  }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await browser.close();
  await db.end();
}
