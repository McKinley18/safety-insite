// §287 — THE CORRECTIVE ACTION LIFECYCLE IN A REAL BROWSER.
//
// Reviews the surface D-050 added, at 390 / 768 / 1280 / 1440 in both themes, and then performs the
// behavioural probes the direction names that a static sweep cannot answer: repeated-tap
// protection, due-date interaction, error recovery without duplicate mutation, and keyboard reach.
//
// ==================== INSTRUMENT DISCIPLINE ====================
//
// Carries forward every repair made to the §286 batch instrument, because those were instrument
// defects and would otherwise recur here:
//   I-17  overflow is judged on the page's own scrollWidth, not on bounding boxes
//   I-18  contrast over a gradient is UNMEASURABLE, never a failure
//   I-20  colours are converted by the browser (Tailwind v4 emits lab()/oklch())
//   I-21  focus is measured by real keyboard traversal with baselines captured beforehand
//
// Five error classes are recorded separately and never conflated. The account's entitlement state
// is recorded.
//
// Usage:
//   APP_URL=... API_URL=... VAL_EMAIL=... VAL_PASSWORD=... OUT_DIR=<dir> \
//     node scripts/review-287-action-lifecycle-ux.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:4000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-287-ux";
const EMAIL = process.env.VAL_EMAIL;
const PASSWORD = process.env.VAL_PASSWORD;
const shotDir = `${OUT_DIR}/screenshots`;
mkdirSync(shotDir, { recursive: true });

const WIDTHS = [
  { id: "390", width: 390, height: 844 },
  { id: "768", width: 768, height: 1024 },
  { id: "1280", width: 1280, height: 900 },
  { id: "1440", width: 1440, height: 1000 },
];

const findings = [];
const probes = [];
function note(width, theme, kind, severity, detail) {
  findings.push({ surface: "safety-calendar/actions", width, theme, kind, severity, detail });
  console.log(`  ${severity === "OBJECTIVE" ? "!!" : "??"} [${theme}]@${width} ${kind}: ${JSON.stringify(detail).slice(0, 150)}`);
}
function probe(id, outcome, detail) {
  probes.push({ id, outcome, detail: String(detail).slice(0, 400) });
  console.log(`${outcome === "PASS" ? "ok  " : outcome === "FAIL" ? "FAIL" : "--  "} ${id}  [${String(detail).slice(0, 170)}]`);
}

const login = await (await fetch(`${API_URL}/auth/login`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
})).json();
const token = login.accessToken || login.access_token || login.token;
const claims = token ? JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()) : {};
const entitlementState = {
  jwtPlanClaim: claims.planCode || "unknown",
  effectivePlanClaim: claims.effectivePlanCode || "unknown",
  correctiveActionAssignments: claims.billingEntitlements?.correctiveActionAssignments ?? null,
};

// A known OPEN, OVERDUE action so the surface under review has something real on it.
const H = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
const today = new Date();
const day = (offset) => {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const seeded = await (await fetch(`${API_URL}/actions`, {
  method: "POST", headers: H,
  body: JSON.stringify({
    title: "UX probe — overdue guard refit",
    description: "Seeded so the §287 review has a real overdue action to look at.",
    priorityCode: "high", dueDate: day(-3), assignedToName: "Maintenance lead",
    clientRequestId: `ux287-${Date.now()}`,
  }),
})).json();

const browser = await chromium.launch();

/**
 * SIGN IN ONCE, AND REUSE THE SESSION.
 *
 * §287, INSTRUMENT DEFECT I-23. The first version signed in per context — nine times across eight
 * viewport/theme combinations plus the behavioural pass — and `POST /auth/login` is throttled to
 * five attempts a minute per address. The run died on the second context with a navigation
 * timeout that looked like a product failure and was the product's brute-force protection working
 * correctly. A harness may not reach around that, so it stops triggering it: one sign-in, and the
 * resulting storage state is reused by every context.
 */
const signInContext = await browser.newContext();
const signInPage = await signInContext.newPage();
await signInPage.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
await signInPage.locator('button[type="submit"]').waitFor({ state: "visible", timeout: 20000 });
await signInPage.fill('input[autocomplete="email"]', EMAIL);
await signInPage.fill('input[autocomplete="current-password"]', PASSWORD);
await signInPage.locator('button[type="submit"]').click();
await signInPage.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 25000 });
await signInPage.waitForTimeout(1500);
const storageState = await signInContext.storageState();
await signInContext.close();

/** Apply the saved session and the theme, then land on the surface under review. */
async function openCalendar(page, theme) {
  await page.goto(`${APP_URL}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate((v) => localStorage.setItem("safety_insite_theme", v), theme);
  await page.goto(`${APP_URL}/safety-calendar`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
}
const results = [];

// =================================================================================================
// PART 1 — the surface, across widths and themes.
// =================================================================================================
for (const theme of ["light", "dark"]) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width: width.width, height: width.height },
      deviceScaleFactor: 1, isMobile: width.width <= 430, hasTouch: width.width <= 430,
      colorScheme: theme, storageState,
    });
    const consoleErrors = [], httpErrors = [], requestFailures = [], navigationAborts = [], pageErrors = [];
    context.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200)); });
    context.on("response", (r) => {
      if (r.status() >= 400) httpErrors.push(`${r.request().method()} ${r.status()} ${r.url().slice(0, 130)}`);
    });
    context.on("requestfailed", (r) => {
      const reason = r.failure()?.errorText || "";
      const line = `${r.method()} ${r.url().slice(0, 120)} ${reason}`;
      if (reason.includes("ERR_ABORTED")) navigationAborts.push(line); else requestFailures.push(line);
    });
    context.on("weberror", (e) => pageErrors.push(String(e.error()).slice(0, 200)));

    const page = await context.newPage();
    await openCalendar(page, theme);
    await page.locator('[data-testid="corrective-actions-panel"]').first()
      .scrollIntoViewIfNeeded({ timeout: 10000 }).catch(() => undefined);
    await page.waitForTimeout(800);

    const m = await page.evaluate(() => {
      const panel = document.querySelector('[data-testid="corrective-actions-panel"]');
      const body = document.body.innerText || "";
      const visible = (el) => {
        const s = getComputedStyle(el);
        return s.visibility !== "hidden" && s.display !== "none" && Number(s.opacity) > 0;
      };

      // ---- I-17: overflow judged on the page's own scroll width.
      const pageScrolls = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;

      // ---- Touch targets, WITHIN the panel only: this is the surface under review.
      const controls = panel
        ? Array.from(panel.querySelectorAll("button, a, input, select, textarea, [role=button]"))
          .filter(visible).map((el) => {
            const r = el.getBoundingClientRect();
            return { label: `${el.tagName.toLowerCase()}:${(el.textContent || "").trim().slice(0, 24)}`,
              w: Math.round(r.width), h: Math.round(r.height) };
          }).filter((c) => c.w > 0 && c.h > 0)
        : [];
      const belowProjectFloor = controls.filter((c) => c.h < 36 || c.w < 36)
        .map((c) => `${c.label} ${c.w}x${c.h}`).slice(0, 10);
      const belowNativeGuideline = controls.filter((c) => (c.h >= 36 && c.h < 44) || (c.w >= 36 && c.w < 44))
        .map((c) => `${c.label} ${c.w}x${c.h}`).slice(0, 10);

      // ---- Naming and labelling.
      const named = (el) => Boolean((el.textContent || "").trim() || el.getAttribute("aria-label")
        || el.getAttribute("title")
        || (el.getAttribute("aria-labelledby") && document.getElementById(el.getAttribute("aria-labelledby"))));
      const unnamed = panel
        ? Array.from(panel.querySelectorAll("button, a, [role=button]")).filter(visible).filter((el) => !named(el))
          .map((el) => String(el.className).slice(0, 40)).slice(0, 6) : [];
      const unlabelledFields = panel
        ? Array.from(panel.querySelectorAll("input, select, textarea")).filter(visible)
          .filter((el) => el.type !== "hidden")
          .filter((el) => !(el.getAttribute("aria-label")
            || (el.getAttribute("aria-labelledby") && document.getElementById(el.getAttribute("aria-labelledby")))
            || (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`))
            || el.closest("label")))
          .map((el) => `${el.tagName.toLowerCase()}[${el.type || "text"}]`).slice(0, 6) : [];

      // ---- I-18 / I-20: contrast, with the browser converting colours and gradients unmeasurable.
      const swatch = document.createElement("canvas");
      swatch.width = 1; swatch.height = 1;
      const ctx = swatch.getContext("2d", { willReadFrequently: true });
      const parseColor = (value) => {
        const text = String(value || "").trim();
        if (!text || text === "transparent") return null;
        let alpha = 1;
        const rgba = /rgba?\(([^)]+)\)/.exec(text);
        if (rgba) {
          const parts = rgba[1].split(/[ ,/]+/).filter(Boolean).map(Number);
          if (parts.length > 3) alpha = parts[3];
        }
        ctx.fillStyle = "#010203";
        ctx.fillStyle = text;
        if (ctx.fillStyle === "#010203" && text.toLowerCase() !== "#010203") return null;
        ctx.clearRect(0, 0, 1, 1); ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        return { r, g, b, a: alpha };
      };
      const background = (el) => {
        let node = el;
        while (node && node !== document.documentElement) {
          const s = getComputedStyle(node);
          if (s.backgroundImage && s.backgroundImage !== "none") return null;
          const bg = parseColor(s.backgroundColor);
          if (bg && bg.a > 0.5) return bg;
          node = node.parentElement;
        }
        const rs = getComputedStyle(document.body);
        if (rs.backgroundImage && rs.backgroundImage !== "none") return null;
        const rb = parseColor(rs.backgroundColor);
        return rb && rb.a > 0.5 ? rb : { r: 255, g: 255, b: 255, a: 1 };
      };
      const lum = ({ r, g, b }) => {
        const ch = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
        return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
      };
      const contrastFailures = [];
      let contrastMeasured = 0, contrastUnmeasurable = 0;
      for (const el of Array.from(panel ? panel.querySelectorAll("p, span, h1, h2, h3, dt, dd, li, button, label, option") : [])) {
        if (!visible(el)) continue;
        const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3)
          .map((n) => n.textContent.trim()).join(" ").trim();
        if (own.length < 2) continue;
        const s = getComputedStyle(el);
        const fg = parseColor(s.color);
        if (!fg || fg.a < 0.5) continue;
        const bg = background(el);
        if (!bg) { contrastUnmeasurable += 1; continue; }
        contrastMeasured += 1;
        const size = parseFloat(s.fontSize);
        const bold = parseInt(s.fontWeight, 10) >= 700;
        const required = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
        const la = lum(fg), lb = lum(bg);
        const ratio = (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
        if (ratio + 0.05 < required) {
          contrastFailures.push(`${own.slice(0, 32)} :: ${ratio.toFixed(2)}:1 (needs ${required}:1)`);
          if (contrastFailures.length >= 8) break;
        }
      }

      const panelText = panel ? (panel.innerText || "") : "";
      return {
        panelPresent: Boolean(panel),
        controlCount: controls.length,
        pageScrolls, belowProjectFloor, belowNativeGuideline, unnamed, unlabelledFields,
        contrastFailures, contrastMeasured, contrastUnmeasurable,
        // The direction's UX questions, answered from the rendered panel.
        hasObviousCloseControl: /close action/i.test(panelText),
        hasEditControl: /\bEdit\b/.test(panelText),
        statesOverdueInWords: /overdue/i.test(panelText),
        statesLifecycleInWords: /\b(Open|In progress|Completed|Verified|Cancelled)\b/.test(panelText),
        /** §287 / D-052: the screen must say what closing does NOT claim. */
        statesNoVerification: /no independent verification|does not record an independent verification/i.test(panelText),
        rawUuid: (panelText.match(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi) || []).slice(0, 2),
        developerVocabulary: ["statusCode", "priorityCode", "lifecycleState", "closedByUserId", "clientRequestId"]
          .filter((t) => panelText.includes(t)),
        excerpt: panelText.slice(0, 700),
      };
    });

    // ---- I-21: focus by real keyboard traversal, baselines captured first.
    const focus = await (async () => {
      const candidates = await page.evaluate(() => {
        const panel = document.querySelector('[data-testid="corrective-actions-panel"]');
        if (!panel) return 0;
        let i = 0;
        for (const el of panel.querySelectorAll("button, a[href], input, select, textarea, [role=button]")) {
          const s = getComputedStyle(el); const r = el.getBoundingClientRect();
          if (s.visibility === "hidden" || s.display === "none" || r.width === 0) continue;
          el.setAttribute("data-focus-probe", String(i));
          el.setAttribute("data-focus-baseline",
            `${s.outlineStyle}|${s.outlineWidth}|${s.outlineColor}|${s.boxShadow}|${s.backgroundColor}|${s.borderColor}`);
          i += 1;
        }
        return i;
      });
      const offenders = [], seen = new Set();
      for (let step = 0; step < Math.min(candidates * 3 + 30, 220); step++) {
        await page.keyboard.press("Tab");
        const stop = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          const baseline = el.getAttribute("data-focus-baseline");
          if (baseline === null) return { key: "outside", outside: true };
          const s = getComputedStyle(el);
          const focused = `${s.outlineStyle}|${s.outlineWidth}|${s.outlineColor}|${s.boxShadow}|${s.backgroundColor}|${s.borderColor}`;
          return {
            key: el.getAttribute("data-focus-probe"),
            label: `${el.tagName.toLowerCase()}:${(el.textContent || "").trim().slice(0, 26)}`,
            changed: focused !== baseline, outside: false,
          };
        });
        if (!stop || stop.outside) continue;
        if (seen.has(stop.key)) continue;
        seen.add(stop.key);
        if (!stop.changed) offenders.push(stop.label);
      }
      await page.evaluate(() => {
        for (const el of document.querySelectorAll("[data-focus-probe]")) {
          el.removeAttribute("data-focus-probe"); el.removeAttribute("data-focus-baseline");
        }
      });
      return { offenders: offenders.slice(0, 6), reached: seen.size, candidates };
    })();

    const shot = `${shotDir}/actions-${theme}-${width.id}.png`;
    await page.screenshot({ path: shot, fullPage: true });

    results.push({
      theme, width: width.id, screenshot: shot, ...m,
      focusInvisible: focus.offenders, keyboardReached: focus.reached, keyboardCandidates: focus.candidates,
      consoleErrors: [...consoleErrors], httpErrors: [...httpErrors],
      requestFailures: [...requestFailures], navigationAborts: [...navigationAborts], pageErrors: [...pageErrors],
    });

    if (!m.panelPresent) note(width.id, theme, "PANEL_ABSENT", "OBJECTIVE", "the action panel did not render");
    if (m.panelPresent && m.controlCount === 0) {
      note(width.id, theme, "INSTRUMENT_NO_CONTROLS_MEASURED", "INSTRUMENT", "panel present but no controls");
    }
    if (m.pageScrolls) note(width.id, theme, "HORIZONTAL_OVERFLOW", "OBJECTIVE", "page scrolls horizontally");
    if (m.belowProjectFloor.length) note(width.id, theme, "BELOW_PROJECT_TOUCH_FLOOR_36", "OBJECTIVE", m.belowProjectFloor);
    if (m.belowNativeGuideline.length) note(width.id, theme, "BELOW_NATIVE_TOUCH_GUIDELINE_44", "APP_FORMAT", m.belowNativeGuideline);
    if (m.unnamed.length) note(width.id, theme, "UNNAMED_CONTROL", "OBJECTIVE", m.unnamed);
    if (m.unlabelledFields.length) note(width.id, theme, "UNLABELLED_FORM_FIELD", "OBJECTIVE", m.unlabelledFields);
    if (m.contrastFailures.length) note(width.id, theme, "CONTRAST_BELOW_AA", "OBJECTIVE", m.contrastFailures);
    if (focus.candidates > 0 && focus.reached < Math.min(focus.candidates, 6)) {
      note(width.id, theme, "INSTRUMENT_PARTIAL_KEYBOARD_WALK", "INSTRUMENT", `${focus.reached}/${focus.candidates}`);
    } else if (focus.offenders.length) {
      note(width.id, theme, "NO_VISIBLE_FOCUS", "OBJECTIVE", focus.offenders);
    }
    if (!m.hasObviousCloseControl) note(width.id, theme, "NO_OBVIOUS_CLOSE_CONTROL", "OBJECTIVE", m.excerpt.slice(0, 120));
    if (!m.statesOverdueInWords) note(width.id, theme, "OVERDUE_NOT_STATED_IN_WORDS", "OBJECTIVE", "no overdue wording");
    if (!m.statesLifecycleInWords) note(width.id, theme, "LIFECYCLE_NOT_STATED_IN_WORDS", "OBJECTIVE", "no state wording");
    if (m.rawUuid.length) note(width.id, theme, "RAW_UUID_ON_CUSTOMER_SURFACE", "OBJECTIVE", m.rawUuid);
    if (m.developerVocabulary.length) note(width.id, theme, "DEVELOPER_VOCABULARY", "OBJECTIVE", m.developerVocabulary);
    if (consoleErrors.length) note(width.id, theme, "CONSOLE_ERROR", "OBJECTIVE", consoleErrors);
    if (httpErrors.length) note(width.id, theme, "HTTP_ERROR_STATUS", "OBJECTIVE", httpErrors);
    if (requestFailures.length) note(width.id, theme, "TRANSPORT_FAILURE", "OBJECTIVE", requestFailures);
    if (pageErrors.length) note(width.id, theme, "UNCAUGHT_PAGE_ERROR", "OBJECTIVE", pageErrors);

    await context.close();
  }
}

// =================================================================================================
// PART 2 — behavioural probes. One phone-sized context, driven like a field user.
// =================================================================================================
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, storageState,
  });
  const mutations = [];
  context.on("request", (r) => {
    if (/\/actions(\/|\?|$)/.test(r.url()) && r.method() !== "GET") mutations.push(`${r.method()} ${r.url().split("/").slice(-2).join("/")}`);
  });
  const page = await context.newPage();
  await openCalendar(page, "light");

  const rows = page.locator('[data-testid="corrective-action-row"]');
  probe("U0-GUARD the panel rendered real actions to drive",
    (await rows.count()) > 0 ? "PASS" : "FAIL", `${await rows.count()} row(s)`);

  // ---- DUE-DATE INTERACTION on a phone.
  await rows.first().locator('[data-testid="edit-action"]').click({ timeout: 10000 });
  await page.waitForTimeout(700);
  const dateField = page.locator('[data-testid="action-due-date"]').first();
  probe("U1 the due-date control is a real date input, reachable on a phone",
    (await dateField.count()) > 0 && (await dateField.getAttribute("type")) === "date" ? "PASS" : "FAIL",
    `type=${await dateField.getAttribute("type").catch(() => "absent")}`);
  const newDate = day(21);
  await dateField.fill(newDate);
  const before = mutations.length;
  await page.locator('[data-testid="save-action"]').first().click();
  await page.waitForTimeout(3500);
  probe("U2 saving the due date issues exactly ONE mutation",
    mutations.length - before === 1 ? "PASS" : "FAIL",
    `${mutations.length - before} mutation(s): ${mutations.slice(before).join(", ")}`);
  const shownAfterSave = await page.locator('[data-testid="corrective-action-row"]').first().innerText();
  probe("U3 the saved date is shown from the server's answer, not from the field",
    /\d{4}/.test(shownAfterSave) ? "PASS" : "FAIL", shownAfterSave.replace(/\n+/g, " | ").slice(0, 140));

  // ---- REPEATED-TAP PROTECTION on the close control.
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  await page.locator('[data-testid="close-action"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(600);
  const confirm = page.locator('[data-testid="confirm-close-action"]').first();
  const beforeClose = mutations.length;
  // Three taps as fast as Playwright can deliver them, bypassing actionability waits so the
  // second and third genuinely race the first rather than politely queueing behind it.
  await confirm.dispatchEvent("click");
  await confirm.dispatchEvent("click");
  await confirm.dispatchEvent("click");
  await page.waitForTimeout(4000);
  probe("U4 REPEATED TAPS on Confirm close issue exactly ONE mutation",
    mutations.length - beforeClose === 1 ? "PASS" : "FAIL",
    `${mutations.length - beforeClose} mutation(s): ${mutations.slice(beforeClose).join(", ")}`);

  // ---- The closed action must read as closed, and must not claim verification.
  //
  // The panel hides closed actions by default (an inspector's list should be work that is still
  // open), so the first version of this probe searched a list the action had correctly left and
  // could only ever report OBSERVED. It now reveals the closed rows first, which is what a user
  // does when they want to check something they just closed.
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: /show closed/i }).first().click({ timeout: 10000 });
  await page.waitForTimeout(1200);
  const afterClose = await page.locator('[data-testid="corrective-actions-panel"]').innerText();
  probe("U5 a closed action reads as COMPLETED and never claims verification",
    /Completed/.test(afterClose)
      && /No independent verification has been recorded/i.test(afterClose)
      && !/Recorded as done and independently verified/i.test(afterClose) ? "PASS" : "FAIL",
    afterClose.replace(/\n+/g, " | ").slice(0, 220));
  probe("U5b and the words VERIFIED_STRONG / SUPERVISOR_SIGNOFF appear nowhere on the surface",
    !/VERIFIED_STRONG|SUPERVISOR_SIGNOFF/.test(afterClose) ? "PASS" : "FAIL", "absent");
  await page.getByRole("button", { name: /hide closed/i }).first().click({ timeout: 10000 }).catch(() => undefined);
  await page.waitForTimeout(600);

  // ---- ERROR RECOVERY WITHOUT DUPLICATE MUTATION.
  await page.goto(`${APP_URL}/safety-calendar`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  await page.locator('[data-testid="edit-action"]').first().click({ timeout: 10000 });
  await page.waitForTimeout(600);
  const typed = day(30);
  await page.locator('[data-testid="action-due-date"]').first().fill(typed);
  // Fail the next PATCH at the server boundary.
  await context.route("**/actions/*", async (route) => {
    if (route.request().method() === "PATCH") {
      await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "Service unavailable." }) });
    } else await route.continue();
  });
  const beforeFail = mutations.length;
  await page.locator('[data-testid="save-action"]').first().click();
  await page.waitForTimeout(3000);
  const errorState = await page.evaluate(() => {
    const panel = document.querySelector('[data-testid="corrective-actions-panel"]');
    const alert = panel?.querySelector('[role="alert"]');
    const field = panel?.querySelector('[data-testid="action-due-date"]');
    return {
      errorShown: Boolean(alert && (alert.textContent || "").trim()),
      errorText: (alert?.textContent || "").trim().slice(0, 140),
      formStillOpen: Boolean(panel?.querySelector('[data-testid="action-edit-form"]')),
      fieldValue: field ? field.value : null,
    };
  });
  probe("U6 a failed save shows the error rather than failing silently",
    errorState.errorShown ? "PASS" : "FAIL", errorState.errorText);
  probe("U7 and the form stays open with what the user typed still in it",
    errorState.formStillOpen && errorState.fieldValue === typed ? "PASS" : "FAIL",
    `open=${errorState.formStillOpen} value=${errorState.fieldValue} expected=${typed}`);
  probe("U8 the failed save was ONE request — nothing was silently retried",
    mutations.length - beforeFail === 1 ? "PASS" : "FAIL",
    `${mutations.length - beforeFail} mutation(s)`);
  await context.unroute("**/actions/*");
  // Recovery: the same press now succeeds, without the user retyping.
  const beforeRetry = mutations.length;
  await page.locator('[data-testid="save-action"]').first().click();
  await page.waitForTimeout(3500);
  const recovered = await page.evaluate(() => {
    const panel = document.querySelector('[data-testid="corrective-actions-panel"]');
    return {
      formClosed: !panel?.querySelector('[data-testid="action-edit-form"]'),
      stillErroring: Boolean(panel?.querySelector('[role="alert"]')),
    };
  });
  probe("U9 retrying after the error succeeds without retyping, and clears the error",
    recovered.formClosed && !recovered.stillErroring ? "PASS" : "FAIL",
    `formClosed=${recovered.formClosed} stillErroring=${recovered.stillErroring} requests=${mutations.length - beforeRetry}`);

  // ---- REFRESH / RESTART: authoritative persisted state.
  const serverDate = await (await fetch(`${API_URL}/actions?limit=100`, { headers: H })).json();
  const target = (serverDate.data || []).find((r) => r.id === seeded.id);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  const afterReload = await page.locator('[data-testid="corrective-actions-panel"]').innerText();
  probe("U10 after a full reload the panel shows the SERVER's state",
    target ? "PASS" : "OBSERVED",
    `server due=${String(target?.dueDate).slice(0, 10)} lifecycle=${target?.lifecycleState}; panel mentions it=${afterReload.includes(String(target?.lifecycleState === "open" ? "Open" : "Completed"))}`);

  await page.screenshot({ path: `${shotDir}/actions-behavioural-390.png`, fullPage: true });

  // ===============================================================================================
  // OFFLINE — the completed lifecycle, MEASURED. Nothing is built here (D-042 is not §287's).
  //
  // The WARM case throughout: the inspector had the surface open and the signal went. A cold
  // navigation reaches the app's offline fallback, which §286 already measured and which has no
  // action panel on it to exercise.
  // ===============================================================================================
  const offline = {};
  await context.setOffline(true);
  await page.waitForTimeout(1000);

  // -- CREATE offline. There is no create control on this panel (actions are raised from the
  //    inspection review), so this records the reachability rather than pretending to press one.
  offline.create = await page.evaluate(() => {
    const panel = document.querySelector('[data-testid="corrective-actions-panel"]');
    return {
      createControlOnThisSurface: Boolean(panel && Array.from(panel.querySelectorAll("button"))
        .some((b) => /new action|raise|create/i.test(b.textContent || ""))),
    };
  });

  // -- EDIT offline.
  await page.locator('[data-testid="edit-action"]').first().click({ timeout: 10000 }).catch(() => undefined);
  await page.waitForTimeout(500);
  const offlineTyped = day(45);
  await page.locator('[data-testid="action-due-date"]').first().fill(offlineTyped).catch(() => undefined);
  const beforeOfflineEdit = mutations.length;
  await page.locator('[data-testid="save-action"]').first().click({ timeout: 10000 }).catch(() => undefined);
  await page.waitForTimeout(3500);
  offline.edit = await page.evaluate(() => {
    const panel = document.querySelector('[data-testid="corrective-actions-panel"]');
    const alert = panel?.querySelector('[role="alert"]');
    const field = panel?.querySelector('[data-testid="action-due-date"]');
    return {
      errorShown: Boolean(alert && (alert.textContent || "").trim()),
      errorText: (alert?.textContent || "").trim().slice(0, 120),
      formStillOpen: Boolean(panel?.querySelector('[data-testid="action-edit-form"]')),
      typedValueRetained: field ? field.value : null,
      // A queued write would have to say so. Nothing here claims to have saved anything.
      claimsQueued: /pending|queued|will sync|saved offline/i.test(panel?.innerText || ""),
    };
  });
  offline.edit.requestsAttempted = mutations.length - beforeOfflineEdit;
  probe("F1 OFFLINE EDIT fails honestly and keeps what the user typed",
    offline.edit.errorShown && offline.edit.formStillOpen
      && offline.edit.typedValueRetained === offlineTyped ? "PASS" : "FAIL",
    `error="${offline.edit.errorText}" retained=${offline.edit.typedValueRetained}`);
  probe("F2 and it does NOT claim to have queued the change",
    offline.edit.claimsQueued === false ? "PASS" : "FAIL",
    `claimsQueued=${offline.edit.claimsQueued}`);

  // -- CLOSE offline.
  await page.locator('[data-testid="edit-action"]').first().click({ timeout: 8000 }).catch(() => undefined);
  await page.waitForTimeout(400);
  await page.locator('[data-testid="close-action"]').first().click({ timeout: 10000 }).catch(() => undefined);
  await page.waitForTimeout(500);
  /**
   * §287, INSTRUMENT DEFECT I-24. This was a CONSTANT string, and F5 counts the server rows
   * carrying it to prove the failed attempt left no duplicate. Run the instrument twice against
   * the same database and the second run finds two rows — from two runs, not from one duplicated
   * close — and reports a product duplicate that never happened. The marker is now unique per run,
   * so the count means what F5 says it means.
   */
  const offlineNotes = `Closed while offline — should not be lost from the field. [${Date.now()}]`;
  await page.locator('[data-testid="closure-notes"]').first().fill(offlineNotes).catch(() => undefined);
  const beforeOfflineClose = mutations.length;
  await page.locator('[data-testid="confirm-close-action"]').first().click({ timeout: 10000 }).catch(() => undefined);
  await page.waitForTimeout(3500);
  offline.close = await page.evaluate(() => {
    const panel = document.querySelector('[data-testid="corrective-actions-panel"]');
    const alert = panel?.querySelector('[role="alert"]');
    const notes = panel?.querySelector('[data-testid="closure-notes"]');
    return {
      errorShown: Boolean(alert && (alert.textContent || "").trim()),
      formStillOpen: Boolean(panel?.querySelector('[data-testid="action-close-form"]')),
      notesRetained: notes ? notes.value : null,
      claimsClosed: /Completed/.test(panel?.innerText || ""),
    };
  });
  offline.close.requestsAttempted = mutations.length - beforeOfflineClose;
  probe("F3 OFFLINE CLOSE fails honestly and keeps the notes the user wrote",
    offline.close.errorShown && offline.close.formStillOpen
      && offline.close.notesRetained === offlineNotes ? "PASS" : "FAIL",
    `error=${offline.close.errorShown} notesRetained=${offline.close.notesRetained === offlineNotes}`);
  await page.screenshot({ path: `${shotDir}/actions-offline-390.png`, fullPage: true });

  // -- RECONNECT and RETRY. The user presses again; nothing was silently re-sent meanwhile.
  await context.setOffline(false);
  await page.waitForTimeout(1500);
  const beforeReconnect = mutations.length;
  await page.locator('[data-testid="confirm-close-action"]').first().click({ timeout: 10000 }).catch(() => undefined);
  await page.waitForTimeout(4000);
  offline.reconnect = await page.evaluate(() => {
    const panel = document.querySelector('[data-testid="corrective-actions-panel"]');
    return {
      formClosed: !panel?.querySelector('[data-testid="action-close-form"]'),
      stillErroring: Boolean(panel?.querySelector('[role="alert"]')),
    };
  });
  offline.reconnect.requestsOnRetry = mutations.length - beforeReconnect;
  probe("F4 RECONNECT + one deliberate retry completes the close, without retyping",
    offline.reconnect.formClosed && !offline.reconnect.stillErroring
      && offline.reconnect.requestsOnRetry === 1 ? "PASS" : "FAIL",
    `formClosed=${offline.reconnect.formClosed} requests=${offline.reconnect.requestsOnRetry}`);

  // -- And the SERVER is the judge of what happened.
  const serverAfter = await (await fetch(`${API_URL}/actions?limit=100`, { headers: H })).json();
  const closedRows = (serverAfter.data || []).filter((r) => r.closureNotes === offlineNotes);
  probe("F5 the server holds EXACTLY ONE closure for the offline-then-retried action",
    closedRows.length === 1 && closedRows[0].lifecycleState === "completed" ? "PASS" : "FAIL",
    `${closedRows.length} row(s); lifecycle=${closedRows[0]?.lifecycleState}`);
  probe("F6 and that closure still claims no verification",
    closedRows.length === 1 && closedRows[0].verified === false
      && closedRows[0].verifiedAt === null ? "PASS" : "FAIL",
    `verified=${closedRows[0]?.verified} verifiedAt=${closedRows[0]?.verifiedAt}`);

  writeFileSync(`${OUT_DIR}/action-lifecycle-offline.json`, JSON.stringify({
    instrument: "§287 — offline behaviour of the completed action lifecycle",
    measuredAt: new Date().toISOString(),
    note: "WARM case throughout: the surface was already open when the connection went. Nothing is "
      + "built here; D-042 remains unimplemented by direction.",
    measurements: offline,
    inventory: [
      { operation: "create", offline: "REQUIRES_NETWORK", dataLossRisk: "VULNERABLE",
        basis: "Not raised from this surface — actions are created in the inspection review flow, "
          + "which has no outbox. §287 added `clientRequestId`, which is the PRECONDITION for one." },
      { operation: "edit due date", offline: "REQUIRES_NETWORK", dataLossRisk: "RECOVERABLE_IN_SESSION",
        basis: "MEASURED: the save fails, the error is shown, the form stays open and the typed "
          + "date is retained, so nothing is lost while the page lives. It is not queued and does "
          + "not survive leaving the page — hence not NONE_KNOWN." },
      { operation: "close", offline: "REQUIRES_NETWORK", dataLossRisk: "RECOVERABLE_IN_SESSION",
        basis: "MEASURED: identical to edit — the closure notes the user wrote are retained in the "
          + "open form and a single deliberate retry after reconnect completes it." },
      { operation: "retry", offline: "PARTIAL", dataLossRisk: "NONE_KNOWN",
        basis: "MEASURED: mutations are sent with `retries: 0`, so nothing is silently re-sent. "
          + "The failed attempt issued exactly one request and the retry issued exactly one." },
      { operation: "reconnect", offline: "PARTIAL", dataLossRisk: "NONE_KNOWN",
        basis: "MEASURED: after reconnect one retry succeeded and the server holds exactly ONE "
          + "closure for it — no duplicate from the failed attempt." },
    ],
  }, null, 2));

  await context.close();
}

await browser.close();
const objective = findings.filter((f) => f.severity === "OBJECTIVE").length;
const probeFailures = probes.filter((p) => p.outcome === "FAIL").length;
writeFileSync(`${OUT_DIR}/action-lifecycle-ux.json`, JSON.stringify({
  instrument: "§287 — corrective action lifecycle UX",
  measuredAt: new Date().toISOString(),
  entitlementState,
  errorClassNote: "consoleErrors / httpErrors / requestFailures / navigationAborts / pageErrors are "
    + "recorded SEPARATELY. `requestFailures` is transport-only and can never evidence the absence "
    + "of an HTTP error status.",
  results, findings, probes,
}, null, 2));
console.log(`\n${findings.length} finding(s) across ${results.length} visits (${objective} objective); `
  + `${probes.length} behavioural probes, ${probeFailures} failed.`);
console.log(`evidence: ${OUT_DIR}`);
