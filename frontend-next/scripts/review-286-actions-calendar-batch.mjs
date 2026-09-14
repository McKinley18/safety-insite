// §286 — BATCH 5. THE CORRECTIVE-ACTION AND SAFETY-CALENDAR SURFACES, IN A REAL BROWSER.
//
// Also revisits `/reports`, because §286 rebuilt it for D-046 and a rebuilt surface is not a
// reviewed surface.
//
// ==================== INSTRUMENT DISCIPLINE (carried forward from §285) ====================
//
// `requestfailed` is structurally blind to HTTP error statuses -- a 402 is a COMPLETED request --
// so `netFailures: 0` was never evidence that nothing failed. Five classes are recorded separately
// and never conflated: consoleErrors, httpErrors (status >= 400, from the `response` event),
// requestFailures (transport only), navigationAborts (harness-caused), pageErrors.
//
// The account's ENTITLEMENT STATE is recorded, because §284 found that the single variable
// distinguishing two contradictory review runs was the one neither of them wrote down.
//
// ==================== WHAT §286 ADDS ====================
//
// An ACCESSIBILITY pass with objective, falsifiable checks only -- control naming, keyboard
// reachability, focus visibility, semantic status communication, reliance on colour alone, and
// text contrast computed from the rendered pixels. No subjective redesign is proposed here.
//
// Usage:
//   APP_URL=... API_URL=... VAL_EMAIL=... VAL_PASSWORD=... OUT_DIR=<dir> [TIER=...] \
//     node scripts/review-286-actions-calendar-batch.mjs
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:4000";
const OUT_DIR = process.env.OUT_DIR || "/tmp/insite-286-batch5";
const EMAIL = process.env.VAL_EMAIL;
const PASSWORD = process.env.VAL_PASSWORD;
const TIER = process.env.TIER || "unspecified";
const shotDir = `${OUT_DIR}/screenshots`;
mkdirSync(shotDir, { recursive: true });

const WIDTHS = [
  { id: "390", width: 390, height: 844 },
  { id: "768", width: 768, height: 1024 },
  { id: "1280", width: 1280, height: 900 },
  { id: "1440", width: 1440, height: 1000 },
];
const TARGETS = [
  { id: "safety-calendar", path: "/safety-calendar", name: "Safety Calendar" },
  { id: "command-center", path: "/command-center", name: "Command Center (due work)" },
  { id: "reports", path: "/reports", name: "Report library (D-046 revision history)" },
];

const findings = [];
function note(target, width, theme, kind, severity, detail) {
  findings.push({ target, width, theme, kind, severity, detail });
  console.log(`  ${severity === "OBJECTIVE" ? "!!" : "??"} ${target}[${theme}]@${width} ${kind}: `
    + `${JSON.stringify(detail).slice(0, 150)}`);
}

const login = await (await fetch(`${API_URL}/auth/login`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
})).json();
const token = login.accessToken || login.access_token || login.token;
const claims = token ? JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()) : {};
const calendarProbe = token
  ? await fetch(`${API_URL}/calendar`, { headers: { Authorization: `Bearer ${token}` } })
  : null;
const entitlementState = {
  tierDeclaredByRunner: TIER,
  jwtPlanClaim: claims.planCode || claims.subscriptionTier || "unknown",
  effectivePlanClaim: claims.effectivePlanCode || "unknown",
  correctiveActionAssignments: claims.billingEntitlements?.correctiveActionAssignments ?? null,
  calendarReadStatus: calendarProbe?.status ?? null,
  note: "The JWT claim is a CACHED value; EntitlementService treats a live subscription row or an "
    + "active grant as authoritative over it. Both are recorded so a later reader can tell which "
    + "tier this evidence describes.",
};

const browser = await chromium.launch();
const results = [];

for (const theme of ["light", "dark"]) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width: width.width, height: width.height },
      deviceScaleFactor: 1,
      isMobile: width.width <= 430,
      hasTouch: width.width <= 430,
      colorScheme: theme,
    });

    const consoleErrors = [];
    const httpErrors = [];
    const requestFailures = [];
    const navigationAborts = [];
    const pageErrors = [];
    context.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200)); });
    context.on("response", (r) => {
      if (r.status() >= 400) httpErrors.push(`${r.request().method()} ${r.status()} ${r.url().slice(0, 130)}`);
    });
    context.on("requestfailed", (r) => {
      const reason = r.failure()?.errorText || "";
      const line = `${r.method()} ${r.url().slice(0, 120)} ${reason}`;
      if (reason.includes("ERR_ABORTED")) navigationAborts.push(line);
      else requestFailures.push(line);
    });
    context.on("weberror", (e) => pageErrors.push(String(e.error()).slice(0, 200)));

    const page = await context.newPage();
    await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.locator('button[type="submit"]').waitFor({ state: "visible", timeout: 20000 });
    await page.evaluate((v) => localStorage.setItem("safety_insite_theme", v), theme);
    await page.waitForTimeout(1500);
    await page.fill('input[autocomplete="email"]', EMAIL);
    await page.fill('input[autocomplete="current-password"]', PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 25000 });
    await page.waitForTimeout(1500);

    for (const target of TARGETS) {
      const before = {
        console: consoleErrors.length, http: httpErrors.length,
        failed: requestFailures.length, aborts: navigationAborts.length, pageErr: pageErrors.length,
      };
      await page.goto(`${APP_URL}${target.path}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(3500);

      // D-046: open the revision history where one exists, so the new surface is MEASURED rather
      // than merely present in the markup behind a closed toggle.
      let revisionHistoryOpened = false;
      if (target.id === "reports") {
        const toggle = page.locator('[data-testid="revision-history-toggle"]').first();
        if (await toggle.count()) {
          await toggle.click({ timeout: 10000 }).catch(() => undefined);
          await page.waitForTimeout(2000);
          revisionHistoryOpened = await page.locator('[data-testid="revision-history"]').count() > 0;
        }
      }

      const m = await page.evaluate(() => {
        const body = document.body.innerText || "";

        // ---- LAYOUT ----------------------------------------------------------------------
        /**
         * §286, INSTRUMENT DEFECT I-17. This used to report every element whose right edge lay
         * past the viewport, and that is not what horizontal overflow IS. A decorative blur
         * deliberately positioned off-canvas inside a clipping ancestor has a bounding box past
         * the edge and scrolls nothing -- the first run flagged exactly that on `/command-center`
         * at 390 and 768 while `scrollWidth === clientWidth === 390`, i.e. while the page did not
         * scroll horizontally at all.
         *
         * The page's OWN scroll width is the question, and it is asked first. The per-element list
         * is kept only to name the culprits WHEN the page genuinely scrolls, and elements clipped
         * by an ancestor are excluded because they cannot be the cause.
         */
        const pageScrollsHorizontally =
          document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
        const clippedByAncestor = (el) => {
          let node = el.parentElement;
          while (node && node !== document.documentElement) {
            const style = getComputedStyle(node);
            if (style.overflowX !== "visible" || style.overflow !== "visible") return true;
            node = node.parentElement;
          }
          return false;
        };
        const overflow = [];
        if (pageScrollsHorizontally) {
          for (const el of Array.from(document.querySelectorAll("body *"))) {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.right > document.documentElement.clientWidth + 1 && !clippedByAncestor(el)) {
              overflow.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`);
              if (overflow.length >= 5) break;
            }
          }
        }

        // ---- TOUCH TARGETS ---------------------------------------------------------------
        // Two thresholds meaning two different things. 36px is THIS PRODUCT'S floor (§73.3) and a
        // control under it is an objective defect against a standard the project already set. 44px
        // is the iOS HIG minimum / WCAG 2.5.5 (AAA) -- a control between the two is a finding for
        // the Pre-Production App-Format gate, not a defect against the product's own rule.
        const visible = (el) => {
          const style = getComputedStyle(el);
          return style.visibility !== "hidden" && style.display !== "none" && Number(style.opacity) > 0;
        };
        const controls = Array.from(document.querySelectorAll("button, a, input, select, [role=button]"))
          .filter(visible)
          .map((el) => {
            const r = el.getBoundingClientRect();
            return {
              label: `${el.tagName.toLowerCase()}:${(el.textContent || "").trim().slice(0, 24)}`,
              w: Math.round(r.width), h: Math.round(r.height),
            };
          })
          .filter((c) => c.w > 0 && c.h > 0);
        const belowProjectFloor = controls
          .filter((c) => c.h < 36 || c.w < 36).map((c) => `${c.label} ${c.w}x${c.h}`).slice(0, 10);
        const belowNativeGuideline = controls
          .filter((c) => (c.h >= 36 && c.h < 44) || (c.w >= 36 && c.w < 44))
          .map((c) => `${c.label} ${c.w}x${c.h}`).slice(0, 10);

        // ---- ACCESSIBILITY ---------------------------------------------------------------
        // An accessible NAME, by the rules a screen reader applies: text content, aria-label,
        // aria-labelledby, or title. An icon-only control with none of them is unusable.
        const named = (el) => Boolean(
          (el.textContent || "").trim()
          || el.getAttribute("aria-label")
          || el.getAttribute("title")
          || (el.getAttribute("aria-labelledby")
            && document.getElementById(el.getAttribute("aria-labelledby"))),
        );
        const unnamed = Array.from(document.querySelectorAll("button, a, [role=button]"))
          .filter(visible).filter((el) => !named(el))
          .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`).slice(0, 8);

        // Every form control must have a programmatic label, not just a visible placeholder --
        // a placeholder disappears the moment the field has a value.
        const unlabelledFields = Array.from(document.querySelectorAll("input, select, textarea"))
          .filter(visible)
          .filter((el) => el.type !== "hidden")
          .filter((el) => !(
            el.getAttribute("aria-label")
            || (el.getAttribute("aria-labelledby")
              && document.getElementById(el.getAttribute("aria-labelledby")))
            || (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`))
            || el.closest("label")
          ))
          .map((el) => `${el.tagName.toLowerCase()}[${el.type || "text"}] placeholder="${el.placeholder || ""}"`)
          .slice(0, 8);

        // KEYBOARD REACHABILITY. A control the keyboard cannot reach is unusable without a mouse.
        const keyboardUnreachable = Array.from(document.querySelectorAll("button, a[href], input, select, textarea, [role=button]"))
          .filter(visible)
          .filter((el) => el.getAttribute("tabindex") === "-1" && !el.hasAttribute("disabled"))
          .map((el) => `${el.tagName.toLowerCase()}:${(el.textContent || "").trim().slice(0, 24)}`)
          .slice(0, 8);

        // RELIANCE ON COLOUR ALONE for status. An element whose class names carry a status colour
        // but whose text carries no status word communicates its state only to sighted readers who
        // can distinguish those hues.
        const STATUS_WORDS = /overdue|due|open|closed|complete|completed|pending|current|superseded|blocked|in progress|scheduled|not issued|critical|high|moderate|low|not rated/i;
        const colourOnlyStatus = Array.from(document.querySelectorAll("[class*='bg-red'], [class*='bg-amber'], [class*='bg-emerald'], [class*='bg-orange']"))
          .filter(visible)
          .filter((el) => {
            const text = (el.innerText || "").trim();
            // Only leaf-ish elements: a container inherits its children's words.
            if (el.querySelector("[class*='bg-red'], [class*='bg-amber'], [class*='bg-emerald'], [class*='bg-orange']")) return false;
            return text.length > 0 && text.length < 160 && !STATUS_WORDS.test(text);
          })
          .map((el) => `${String(el.className).slice(0, 50)} :: ${(el.innerText || "").trim().slice(0, 40)}`)
          .slice(0, 8);

        // TEXT CONTRAST, computed from the rendered colours. WCAG AA: 4.5:1 for normal text,
        // 3:1 for large text (>=24px, or >=18.66px bold).
        /**
         * §286, INSTRUMENT DEFECT I-20. This used to match `rgb()` / `rgba()` with a regular
         * expression and return null for anything else. Tailwind v4 emits modern colour spaces, and
         * this product's computed styles are full of them -- the Safety Calendar's day badge
         * resolves to `lab(72.7183 31.8672 97.9407)`. The regex returned null, the background walk
         * fell through to an ancestor that was transparent and then to the page, and the badge was
         * reported at exactly 1.00:1: the signature of a colour compared against itself. A real
         * contrast question was being answered by a parser failure.
         *
         * The browser is asked to do the conversion instead. A canvas 2D context accepts any CSS
         * colour the engine can parse -- `lab()`, `oklch()`, `color()`, named colours -- and hands
         * back sRGB bytes, which is exactly what the WCAG luminance formula takes. `fillStyle`
         * silently keeps its previous value for an unparseable string, so it is reset to a known
         * sentinel before each read and a value that does not move is reported as unreadable
         * rather than as black.
         */
        const swatch = document.createElement("canvas");
        swatch.width = 1; swatch.height = 1;
        const swatchCtx = swatch.getContext("2d", { willReadFrequently: true });
        const parseRgb = (value) => {
          const text = String(value || "").trim();
          if (!text || text === "transparent") return null;
          const alphaMatch = /rgba?\(([^)]+)\)/.exec(text);
          let alpha = 1;
          if (alphaMatch) {
            const parts = alphaMatch[1].split(/[ ,/]+/).filter(Boolean).map((n) => parseFloat(n));
            if (parts.length > 3) alpha = parts[3];
          } else {
            const slash = /\/\s*([0-9.]+%?)\s*\)/.exec(text);
            if (slash) alpha = slash[1].endsWith("%") ? parseFloat(slash[1]) / 100 : parseFloat(slash[1]);
          }
          swatchCtx.fillStyle = "#010203";
          swatchCtx.fillStyle = text;
          if (swatchCtx.fillStyle === "#010203" && text.toLowerCase() !== "#010203") return null;
          swatchCtx.clearRect(0, 0, 1, 1);
          swatchCtx.fillRect(0, 0, 1, 1);
          const [r, g, b] = swatchCtx.getImageData(0, 0, 1, 1).data;
          return { r, g, b, a: alpha };
        };
        /**
         * §286, INSTRUMENT DEFECT I-18. This walked ancestors for a `background-color` and ignored
         * `background-image` entirely -- so on a gradient surface it walked straight past the panel
         * the text actually sits on and resolved the body's colour instead. The first run reported
         * the `HeroPanel` headings on every page as 1.10:1 white-on-white; they are white on a dark
         * gradient and are among the highest-contrast text in the product. Reporting that as a
         * product defect would have been a tooling failure written up as an accessibility verdict.
         *
         * A gradient's contribution cannot be computed from one colour, so the honest answer is
         * UNKNOWN rather than a number: the walk stops and returns null, and the caller records the
         * element as unmeasurable instead of failing it. A gradient surface's contrast is a
         * rendered-pixel question, which is `npm run audit:text-contrast`'s job, not this one's.
         */
        const effectiveBackground = (el) => {
          let node = el;
          while (node && node !== document.documentElement) {
            const style = getComputedStyle(node);
            if (style.backgroundImage && style.backgroundImage !== "none") return null;
            const bg = parseRgb(style.backgroundColor);
            if (bg && bg.a > 0.5) return bg;
            node = node.parentElement;
          }
          const rootStyle = getComputedStyle(document.body);
          if (rootStyle.backgroundImage && rootStyle.backgroundImage !== "none") return null;
          const rootBg = parseRgb(rootStyle.backgroundColor);
          return rootBg && rootBg.a > 0.5 ? rootBg : { r: 255, g: 255, b: 255, a: 1 };
        };
        const luminance = ({ r, g, b }) => {
          const channel = (c) => {
            const s = c / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
          };
          return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
        };
        const ratio = (a, b) => {
          const la = luminance(a), lb = luminance(b);
          return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
        };
        const contrastFailures = [];
        let contrastMeasured = 0;
        let contrastUnmeasurable = 0;
        for (const el of Array.from(document.querySelectorAll("p, span, h1, h2, h3, h4, dt, dd, li, button, a, label, summary, td, th"))) {
          if (!visible(el)) continue;
          // Own text only: a wrapper's colour is not what its child renders in.
          const own = Array.from(el.childNodes)
            .filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(" ").trim();
          if (own.length < 2) continue;
          const style = getComputedStyle(el);
          const fg = parseRgb(style.color);
          if (!fg || fg.a < 0.5) continue;
          const bg = effectiveBackground(el);
          if (!bg) { contrastUnmeasurable += 1; continue; }
          contrastMeasured += 1;
          const size = parseFloat(style.fontSize);
          const bold = parseInt(style.fontWeight, 10) >= 700;
          const large = size >= 24 || (bold && size >= 18.66);
          const required = large ? 3 : 4.5;
          const measured = ratio(fg, bg);
          if (measured + 0.05 < required) {
            contrastFailures.push(
              `${own.slice(0, 36)} :: ${measured.toFixed(2)}:1 (needs ${required}:1, ${size}px${bold ? " bold" : ""})`);
            if (contrastFailures.length >= 10) break;
          }
        }

        // Live regions: a surface that changes asynchronously must announce it.
        const liveRegions = Array.from(document.querySelectorAll("[aria-live], [role=status], [role=alert]")).length;
        // Disclosure controls must state their state.
        const disclosuresWithoutState = Array.from(document.querySelectorAll("[aria-controls]"))
          .filter(visible).filter((el) => !el.hasAttribute("aria-expanded"))
          .map((el) => (el.textContent || "").trim().slice(0, 30)).slice(0, 5);

        // ---- CUSTOMER-SURFACE HYGIENE ----------------------------------------------------
        const leakage = ["riskSnapshot", "sourceCandidate", "resultSnapshot", "guidedFinding",
          "criticalUnknowns", "observationId", "inspectionId", "storageObjectId",
          "sourceFingerprint", "generatorVersion", "statusCode", "priorityCode"]
          .filter((t) => body.includes(t));
        const rawUuid = (body.match(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi) || [])
          .slice(0, 3);

        return {
          title: document.title,
          h1: Array.from(document.querySelectorAll("h1")).map((h) => (h.textContent || "").trim()),
          mainCount: document.querySelectorAll("main").length,
          nestedMain: Boolean(document.querySelector("main main")),
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          overflow, belowProjectFloor, belowNativeGuideline,
          unnamed, unlabelledFields, keyboardUnreachable, colourOnlyStatus, contrastFailures,
          liveRegions, disclosuresWithoutState,
          contrastMeasured, contrastUnmeasurable,
          leakage, rawUuid,
          controlCount: controls.length,
          textLength: body.length,
          retiredBrand: ["SafeScope", "Sentinel Safety", "SentinelSafety"].filter((b) => body.includes(b)),
          bodyExcerpt: body.slice(0, 1200),
        };
      });

      /**
       * FOCUS VISIBILITY — measured by REAL KEYBOARD TRAVERSAL.
       *
       * §286, INSTRUMENT DEFECT I-19. The first version of this check called `el.focus()` in the
       * page and compared computed styles before and after. That is not how a keyboard user
       * reaches a control, and `:focus-visible` -- which is what every focus ring in this product
       * is written against -- is a heuristic on HOW focus arrived. Programmatic focus after a
       * mouse click does not satisfy it, so the check reported "no visible focus" for the whole of
       * `/reports` including its navigation, while a direct probe pressing Tab showed a real
       * `outline: auto 1px rgb(15, 23, 42)` ring on the same buttons. That was an instrument
       * failure about to be written up as an accessibility verdict on a rebuilt surface.
       *
       * This presses Tab, and at each stop compares the element's CURRENT computed style against
       * the same element's style with focus removed. The unfocused baseline is captured by reading
       * the style after blurring, so the two readings are of one element in two states rather than
       * of two different elements.
       */
      const focusInvisible = await (async () => {
        /**
         * §286, INSTRUMENT DEFECT I-21. The first keyboard version blurred each stop to read its
         * unfocused style and then re-focused it. Blurring CLEARS the sequential focus navigation
         * starting point, so the next Tab restarted from the top of the document -- the traversal
         * cycled through the same handful of controls and reported 5 unique stops on a page with
         * 69 of them. A coverage number that low is not a focus result, it is a broken walk.
         *
         * The baseline is therefore captured for every candidate BEFORE the walk begins, keyed by a
         * temporary attribute, and the walk then only READS. Nothing moves focus except Tab.
         */
        const candidates = await page.evaluate(() => {
          let index = 0;
          for (const el of document.querySelectorAll("button, a[href], input, select, textarea, [role=button], [tabindex]")) {
            const style = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            if (style.visibility === "hidden" || style.display === "none" || r.width === 0) continue;
            el.setAttribute("data-focus-probe", String(index));
            el.setAttribute("data-focus-baseline",
              `${style.outlineStyle}|${style.outlineWidth}|${style.outlineColor}`
              + `|${style.boxShadow}|${style.backgroundColor}|${style.borderColor}`);
            index += 1;
          }
          return index;
        });

        const offenders = [];
        const seen = new Set();
        // Generous bound: enough Tab presses to cross a long surface without running forever.
        const budget = Math.min(candidates * 2 + 10, 160);
        for (let step = 0; step < budget; step++) {
          await page.keyboard.press("Tab");
          const stop = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el || el === document.body || el === document.documentElement) return null;
            const baseline = el.getAttribute("data-focus-baseline");
            const style = getComputedStyle(el);
            const focused = `${style.outlineStyle}|${style.outlineWidth}|${style.outlineColor}`
              + `|${style.boxShadow}|${style.backgroundColor}|${style.borderColor}`;
            return {
              key: el.getAttribute("data-focus-probe")
                || `${el.tagName}:${(el.textContent || "").trim().slice(0, 28)}`,
              label: `${el.tagName.toLowerCase()}:${(el.textContent || "").trim().slice(0, 28)}`,
              // A control with no recorded baseline appeared after the snapshot (a disclosure
              // opening, say). Not measurable, and not counted either way.
              measurable: baseline !== null,
              changed: baseline !== null && focused !== baseline,
            };
          });
          if (!stop) continue;
          if (seen.has(stop.key)) continue;
          seen.add(stop.key);
          if (stop.measurable && !stop.changed) offenders.push(stop.label);
        }
        await page.evaluate(() => {
          for (const el of document.querySelectorAll("[data-focus-probe]")) {
            el.removeAttribute("data-focus-probe");
            el.removeAttribute("data-focus-baseline");
          }
        });
        return { offenders: offenders.slice(0, 8), stopsVisited: seen.size, candidates };
      })();

      const shot = `${shotDir}/${target.id}-${theme}-${width.id}.png`;
      await page.screenshot({ path: shot, fullPage: true });

      const record = {
        target: target.id, name: target.name, path: target.path, theme, width: width.id,
        landedOn: new URL(page.url()).pathname, screenshot: shot, revisionHistoryOpened, ...m,
        focusInvisible: focusInvisible.offenders,
        keyboardStopsVisited: focusInvisible.stopsVisited,
        keyboardCandidates: focusInvisible.candidates,
        consoleErrors: consoleErrors.slice(before.console),
        httpErrors: httpErrors.slice(before.http),
        requestFailures: requestFailures.slice(before.failed),
        navigationAborts: navigationAborts.slice(before.aborts),
        pageErrors: pageErrors.slice(before.pageErr),
      };
      results.push(record);

      // A measurement over zero controls proves nothing. §285's I-15 was this class of defect.
      if (m.controlCount === 0) {
        note(target.id, width.id, theme, "INSTRUMENT_NO_CONTROLS_MEASURED", "INSTRUMENT", m.textLength);
      }
      if (record.landedOn !== target.path) {
        note(target.id, width.id, theme, "REDIRECTED", "OBJECTIVE", `${target.path} -> ${record.landedOn}`);
      }
      if (m.overflow.length) note(target.id, width.id, theme, "HORIZONTAL_OVERFLOW", "OBJECTIVE", m.overflow);
      if (m.unnamed.length) note(target.id, width.id, theme, "UNNAMED_CONTROL", "OBJECTIVE", m.unnamed);
      if (m.unlabelledFields.length) note(target.id, width.id, theme, "UNLABELLED_FORM_FIELD", "OBJECTIVE", m.unlabelledFields);
      if (m.keyboardUnreachable.length) note(target.id, width.id, theme, "KEYBOARD_UNREACHABLE", "OBJECTIVE", m.keyboardUnreachable);
      // NON-VACUITY: a walk that reached only a fraction of the page's controls cannot support a
      // conclusion about the rest of them, and must say so rather than report a clean result.
      if (focusInvisible.stopsVisited === 0) {
        note(target.id, width.id, theme, "INSTRUMENT_NO_KEYBOARD_STOPS", "INSTRUMENT",
          "Tab reached nothing; a focus result here would be vacuous");
      } else if (focusInvisible.candidates > 0
        && focusInvisible.stopsVisited < Math.min(focusInvisible.candidates, 10)) {
        note(target.id, width.id, theme, "INSTRUMENT_PARTIAL_KEYBOARD_WALK", "INSTRUMENT",
          `${focusInvisible.stopsVisited} of ${focusInvisible.candidates} focusable controls reached`);
      }
      if (focusInvisible.offenders.length) {
        note(target.id, width.id, theme, "NO_VISIBLE_FOCUS", "OBJECTIVE",
          { offenders: focusInvisible.offenders, ofStops: focusInvisible.stopsVisited });
      }
      if (m.contrastFailures.length) note(target.id, width.id, theme, "CONTRAST_BELOW_AA", "OBJECTIVE", m.contrastFailures);
      if (m.colourOnlyStatus.length) note(target.id, width.id, theme, "STATUS_BY_COLOUR_ALONE", "OBJECTIVE", m.colourOnlyStatus);
      if (m.disclosuresWithoutState.length) note(target.id, width.id, theme, "DISCLOSURE_WITHOUT_ARIA_EXPANDED", "OBJECTIVE", m.disclosuresWithoutState);
      if (m.belowProjectFloor.length) {
        note(target.id, width.id, theme, "BELOW_PROJECT_TOUCH_FLOOR_36", "OBJECTIVE", m.belowProjectFloor);
      }
      if (m.belowNativeGuideline.length) {
        note(target.id, width.id, theme, "BELOW_NATIVE_TOUCH_GUIDELINE_44", "APP_FORMAT", m.belowNativeGuideline);
      }
      if (m.leakage.length) note(target.id, width.id, theme, "DEVELOPER_VOCABULARY", "OBJECTIVE", m.leakage);
      if (m.rawUuid.length) note(target.id, width.id, theme, "RAW_UUID_ON_CUSTOMER_SURFACE", "OBJECTIVE", m.rawUuid);
      if (m.retiredBrand.length) note(target.id, width.id, theme, "RETIRED_BRAND", "OBJECTIVE", m.retiredBrand);
      if (!m.title || !m.title.includes("Safety InSite")) {
        note(target.id, width.id, theme, "UNBRANDED_PAGE_TITLE", "OBJECTIVE", m.title);
      }
      if (m.h1.length === 0) note(target.id, width.id, theme, "NO_H1", "OBJECTIVE", "no level-1 heading");
      if (m.h1.length > 1) note(target.id, width.id, theme, "MULTIPLE_H1", "OBJECTIVE", m.h1);
      if (m.nestedMain) note(target.id, width.id, theme, "NESTED_MAIN", "OBJECTIVE", m.mainCount);
      if (record.consoleErrors.length) note(target.id, width.id, theme, "CONSOLE_ERROR", "OBJECTIVE", record.consoleErrors);
      if (record.httpErrors.length) note(target.id, width.id, theme, "HTTP_ERROR_STATUS", "OBJECTIVE", record.httpErrors);
      if (record.requestFailures.length) note(target.id, width.id, theme, "TRANSPORT_FAILURE", "OBJECTIVE", record.requestFailures);
      if (record.pageErrors.length) note(target.id, width.id, theme, "UNCAUGHT_PAGE_ERROR", "OBJECTIVE", record.pageErrors);
    }
    await context.close();
  }
}

await browser.close();
writeFileSync(`${OUT_DIR}/batch5-measurements.json`, JSON.stringify({
  instrument: "§286 Batch 5 — corrective actions, Safety Calendar, and the rebuilt report library",
  measuredAt: new Date().toISOString(),
  entitlementState,
  errorClassNote: "consoleErrors / httpErrors / requestFailures / navigationAborts / pageErrors are "
    + "recorded SEPARATELY. `requestFailures` is transport-only and can never evidence the absence "
    + "of an HTTP error status; `httpErrors` is the class that answers that question.",
  results, findings,
}, null, 2));
const objective = findings.filter((f) => f.severity === "OBJECTIVE").length;
console.log(`\n${findings.length} observation(s) across ${results.length} page/theme/width visits `
  + `(${objective} objective).`);
console.log(`evidence: ${OUT_DIR}`);
