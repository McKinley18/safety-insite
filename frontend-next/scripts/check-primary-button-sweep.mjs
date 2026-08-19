// Blast-radius check for the AppButton `primary` variant change (dark:!text-slate-950).
// Measures EVERY rendered primary button on the routes that use them, in dark and light,
// from actual painted pixels. Catches any primary button whose fill was overridden by a
// caller className such that near-black text would now be wrong.
import { chromium } from "playwright";
import pg from "pg";
import { mkdirSync, writeFileSync } from "node:fs";

const appUrl = process.env.APP_URL || "http://localhost:3010";
const apiUrl = process.env.API_BASE_URL || "http://localhost:4010";
const outDir = process.env.OUT_DIR || "/tmp/sweep";
if (!process.env.DATABASE_URL || !/test|closure|phase[0-9]+|_qa_/i.test(process.env.DATABASE_URL)) {
  throw new Error("An explicitly disposable database is required.");
}
mkdirSync(outDir, { recursive: true });

const suffix = Date.now();
const email = `sweep-${suffix}@insite-verify.test`;
const password = "Sweep!Pass123";
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
const browser = await chromium.launch({ headless: true });

const ROUTES = ["/command-center", "/inspections", "/safety-calendar", "/reports", "/settings", "/profile", "/pricing"];

const ANALYSE = (dataUrl) => new Promise((resolve) => {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    const counts = new Map();
    for (let i = 0; i < data.length; i += 4) {
      const k = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    const un = (k) => [(k >> 16) & 255, (k >> 8) & 255, k & 255];
    const lum = ([r, g, b]) => {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const es = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const total = es.reduce((t, e) => t + e[1], 0);
    const bg = un(es[0][0]); const bgL = lum(bg);
    let fg = bg, best = -1;
    for (const [k, n] of es) {
      if (n / total < 0.004) continue;
      const rgb = un(k); const d = Math.abs(lum(rgb) - bgL);
      if (d > best) { best = d; fg = rgb; }
    }
    const [hi, lo] = [lum(fg), bgL].sort((a, b) => b - a);
    resolve({ fg: `rgb(${fg.join(", ")})`, bg: `rgb(${bg.join(", ")})`, ratio: +(((hi + 0.05) / (lo + 0.05)).toFixed(2)) });
  };
  img.src = dataUrl;
});

const rows = [];
try {
  const setup = await browser.newPage();
  const reg = await setup.request.post(`${apiUrl}/auth/register`, {
    data: { email, password, name: "Sweep", type: "individual" },
  });
  if (reg.status() !== 201) throw new Error(`register ${reg.status()}`);
  const { userId } = await reg.json();
  await db.query(
    `INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'test','pro','active',now(),now()+interval '4 hours',NULL,'Primary-button sweep fixture')`,
    [userId],
  );
  await setup.close();

  for (const scheme of ["dark", "light"]) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 950 }, colorScheme: scheme });
    await context.addInitScript(`try{localStorage.setItem("safety_insite_theme","${scheme}")}catch(e){}`);
    const page = await context.newPage();
    await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
    await page.getByPlaceholder("you@example.com").fill(email);
    await page.getByPlaceholder("Enter your password").fill(password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/command-center/, { timeout: 30000 });

    for (const route of ROUTES) {
      await page.goto(`${appUrl}${route}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(900);
      // AppButton primary is identified by its fill utility.
      const buttons = page.locator("button.bg-app-primary");
      const n = await buttons.count();
      for (let i = 0; i < n; i++) {
        const btn = buttons.nth(i);
        if (!(await btn.isVisible())) continue;
        const box = await btn.boundingBox();
        if (!box || box.width < 8 || box.height < 8) continue;
        await btn.scrollIntoViewIfNeeded();
        const shot = await btn.screenshot();
        const res = await page.evaluate(ANALYSE, `data:image/png;base64,${shot.toString("base64")}`);
        const meta = await btn.evaluate((el) => ({
          label: (el.textContent || "").trim().slice(0, 32),
          fontSize: parseFloat(getComputedStyle(el).fontSize),
          fontWeight: Number(getComputedStyle(el).fontWeight) || 400,
          disabled: el.disabled,
        }));
        const large = meta.fontSize >= 24 || (meta.fontSize >= 18.66 && meta.fontWeight >= 700);
        const target = large ? 3.0 : 4.5;
        rows.push({ scheme, route, ...meta, ...res, target, passes: meta.disabled || res.ratio >= target });
      }
      await page.screenshot({ path: `${outDir}/${route.replace(/\//g, "_")}-${scheme}.png`, fullPage: true });
    }
    await context.close();
  }

  const failures = rows.filter((r) => !r.passes);
  writeFileSync(`${outDir}/primary-button-sweep.json`, JSON.stringify({ rows, failures }, null, 2));
  console.log(JSON.stringify({
    buttonsMeasured: rows.length,
    byScheme: { dark: rows.filter((r) => r.scheme === "dark").length, light: rows.filter((r) => r.scheme === "light").length },
    failures: failures.map((f) => `${f.scheme}${f.route} "${f.label}": ${f.ratio}:1 (target ${f.target}) [${f.fg} on ${f.bg}]`),
    passed: failures.length === 0,
  }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await browser.close();
  await db.end();
}
