// Phase 8: light / dark / mobile capture + automated checks for every route this phase touched.
// Checks are mechanical (overflow, contrast of primary text, touch targets); the screenshots
// are for human acceptance.
import { chromium } from "playwright";
import pg from "pg";
import { mkdirSync } from "node:fs";

const appUrl = process.env.APP_URL || "http://localhost:3010";
const apiUrl = process.env.API_BASE_URL || "http://localhost:4010";
const outDir = process.env.OUT_DIR || "/tmp/visual";
if (!process.env.DATABASE_URL || !/test|closure|phase[0-9]+|_qa_/i.test(process.env.DATABASE_URL)) {
  throw new Error("An explicitly disposable database is required.");
}
mkdirSync(outDir, { recursive: true });

const suffix = Date.now();
const email = `visual-${suffix}@insite-verify.test`;
const password = "Visual!Pass123";
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
const browser = await chromium.launch({ headless: true });

const VIEWPORTS = [
  { name: "light", width: 1280, height: 1000, scheme: "light" },
  { name: "dark", width: 1280, height: 1000, scheme: "dark" },
  { name: "mobile", width: 390, height: 844, scheme: "light" },
];

const results = [];
try {
  // One authenticated inspection with findings, reused for every viewport.
  const setup = await browser.newPage();
  const reg = await setup.request.post(`${apiUrl}/auth/register`, {
    data: { email, password, name: "Visual Check", type: "individual" },
  });
  if (reg.status() !== 201) throw new Error(`register ${reg.status()}`);
  const { userId } = await reg.json();
  await db.query(
    `INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'test','pro','active',now(),now()+interval '4 hours',NULL,'Phase-8 visual fixture')`,
    [userId],
  );
  await setup.close();

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      colorScheme: vp.scheme,
    });
    await context.addInitScript(
      `try{localStorage.setItem("safety_insite_theme","${vp.scheme}")}catch(e){}`,
    );
    const page = await context.newPage();
    await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
    await page.getByPlaceholder("you@example.com").fill(email);
    await page.getByPlaceholder("Enter your password").fill(password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/command-center/, { timeout: 30000 });

    // Build one inspection with findings so the review step has real content to render.
    await page.goto(`${appUrl}/inspections`, { waitUntil: "networkidle" });
    await page.getByLabel("New site name").fill(`Visual ${vp.name} ${suffix}`);
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

    const checks = [];
    const routes = [
      { key: "inspection-workspace-review", settle: 800 },
    ];

    for (const route of routes) {
      await page.screenshot({ path: `${outDir}/${route.key}-${vp.name}.png`, fullPage: true });
      checks.push({ route: route.key, ...(await audit(page)) });
    }

    // Add-finding capture screen.
    await page.locator("[data-testid='add-finding']").click();
    await page.locator("[data-testid='additional-observation-banner']").waitFor();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${outDir}/add-finding-capture-${vp.name}.png`, fullPage: true });
    checks.push({ route: "add-finding-capture", ...(await audit(page)) });

    // Calendar day view + task form.
    await page.goto(`${appUrl}/safety-calendar`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Calendar Controls" }).click();
    await page.waitForTimeout(400);
    await page.getByRole("button", { name: /^day$/i }).first().click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${outDir}/calendar-day-${vp.name}.png`, fullPage: true });
    checks.push({ route: "calendar-day", ...(await audit(page)) });

    results.push({ viewport: vp.name, checks });
    await context.close();
  }

  const problems = [];
  for (const r of results) {
    for (const c of r.checks) {
      if (c.horizontalOverflow) problems.push(`${r.viewport}/${c.route}: horizontal overflow`);
      if (c.transparentBody) problems.push(`${r.viewport}/${c.route}: body has no explicit background`);
      if (r.viewport === "mobile" && c.smallTouchTargets > 0) {
        problems.push(`${r.viewport}/${c.route}: ${c.smallTouchTargets} control(s) under 44px`);
      }
      if (c.lowContrastText > 0) problems.push(`${r.viewport}/${c.route}: ${c.lowContrastText} low-contrast text node(s)`);
    }
  }
  console.log(JSON.stringify({ results, passed: problems.length === 0, problems }, null, 2));
  if (problems.length) process.exitCode = 1;
} finally {
  await browser.close();
  await db.end();
}

async function audit(page) {
  return page.evaluate(() => {
    // Only plain rgb()/rgba() with 0-255 channels can be trusted. This app also uses
    // lab()/oklch(), which a regex parse turns into nonsense like rgb(0.999994, 0.00004, ...)
    // and would produce fabricated contrast failures.
    const parse = (c) => {
      if (typeof c !== "string" || !/^rgba?\(/.test(c)) return null;
      const all = (c.match(/[\d.]+/g) || []).map(Number);
      const n = all.slice(0, 3);
      if (n.length < 3 || n.some((v) => !Number.isFinite(v) || v > 255)) return null;
      // Fractional channels indicate a converted non-sRGB colour, not a real 0-255 triple.
      if (n.every((v) => v <= 1) && n.some((v) => v > 0 && v < 1)) return null;
      // Translucent backdrops (e.g. --app-warning-bg-hex is rgba(251,146,60,0.14) in dark)
      // composite over whatever is behind them. Treating the raw triple as the painted
      // colour reports a solid orange that is never actually drawn, so skip these.
      if (all.length > 3 && all[3] < 1) return null;
      return n;
    };
    const lum = ([r, g, b]) => {
      const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

    // Returns null when the backdrop cannot be determined honestly: a gradient/image
    // ancestor (hero panels, the nav bar) means the painted colour behind the text is not
    // any single background-color, so walking past it to the body invents a contrast pair.
    const effectiveBg = (el) => {
      let node = el;
      while (node) {
        const style = getComputedStyle(node);
        if (style.backgroundImage && style.backgroundImage !== "none") return null;
        const bg = style.backgroundColor;
        if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) {
          const p = parse(bg);
          return p; // null here means unparseable colour space -> skip this node
        }
        node = node.parentElement;
      }
      return parse(getComputedStyle(document.body).backgroundColor);
    };

    let lowContrastText = 0;
    let contrastSkipped = 0;
    const lowContrastSamples = [];
    const textNodes = Array.from(document.querySelectorAll("p,h1,h2,h3,h4,span,label,a,button,td,th,li"))
      .filter((el) => el.offsetParent !== null && (el.textContent || "").trim().length > 2)
      .slice(0, 400);
    for (const el of textNodes) {
      const style = getComputedStyle(el);
      const size = parseFloat(style.fontSize);
      const weight = Number(style.fontWeight) || 400;
      const large = size >= 24 || (size >= 18.66 && weight >= 700);
      const fg = parse(style.color);
      const bg = effectiveBg(el);
      if (!fg || !bg) { contrastSkipped++; continue; }
      const r = ratio(fg, bg);
      if (r < (large ? 3 : 4.5)) {
        lowContrastText++;
        if (lowContrastSamples.length < 6) {
          lowContrastSamples.push({
            text: (el.textContent || "").trim().slice(0, 40),
            color: style.color, bg: `rgb(${bg.join(", ")})`, ratio: +r.toFixed(2), size,
          });
        }
      }
    }

    let smallTouchTargets = 0;
    for (const el of document.querySelectorAll("button,a[href],input,select,textarea")) {
      if (el.offsetParent === null) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if (rect.height < 44 && rect.width < 44) smallTouchTargets++;
    }

    const bodyBg = getComputedStyle(document.body).backgroundColor;
    return {
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      transparentBody: bodyBg.includes("rgba(0, 0, 0, 0)"),
      lowContrastText,
      contrastSkipped,
      lowContrastSamples,
      smallTouchTargets,
      bodyBg,
    };
  });
}
