// Shared helpers for the whole-application visual acceptance sweep.
//
// Safety: every consumer must run against an explicitly disposable database.
// The guard below mirrors the one used by the Checkpoint 2 harnesses so a
// repository .env fallback can never silently select the original `safescope`
// development database.
import pg from "pg";

export const APP_URL = process.env.APP_URL || "http://localhost:3010";
export const API_URL = process.env.API_BASE_URL || "http://localhost:4010";

export function assertDisposableDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url || !/test|closure|phase[0-9]+|_qa_/i.test(url)) {
    throw new Error(
      "An explicitly disposable database is required (DATABASE_URL must match test|closure|phase<N>|_qa_).",
    );
  }
  if (/\/safescope(\?|$)/i.test(url)) {
    throw new Error("Refusing to run against the protected safescope development database.");
  }
  const name = url.split("/").pop().split("?")[0];
  console.log(`[db] resolved target: ${name}`);
  return url;
}

export async function connectDb() {
  const db = new pg.Client({ connectionString: assertDisposableDatabase() });
  await db.connect();
  return db;
}

/** Register a Pro-entitled account and return its credentials. */
export async function createProAccount(page, db, label) {
  const suffix = `${Date.now()}-${Number(process.hrtime.bigint() % 100000n)}`;
  const email = `${label}-${suffix}@insite-verify.test`;
  const password = "VisualAccept!Pass123";
  const reg = await page.request.post(`${API_URL}/auth/register`, {
    data: { email, password, name: "Visual Acceptance", type: "individual" },
  });
  if (reg.status() !== 201) throw new Error(`register failed: ${reg.status()}`);
  const { userId } = await reg.json();
  await db.query(
    `INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'test','pro','active',now(),now()+interval '6 hours',NULL,'visual acceptance fixture')`,
    [userId],
  );
  return { email, password, userId };
}

export async function signIn(page, email, password) {
  await page.goto(`${APP_URL}/login`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/command-center/, { timeout: 30000 });
}

/**
 * Force a theme before first paint. The app's render-blocking initializer reads
 * `safety_insite_theme`, so seeding it via an init script exercises the real
 * first-paint path rather than a post-hydration toggle.
 */
export async function applyTheme(context, theme) {
  await context.addInitScript((value) => {
    try {
      window.localStorage.setItem("safety_insite_theme", value);
    } catch {}
  }, theme);
}

/** Diagnostics collected from a rendered route. */
export async function inspectRoute(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const overflow = Math.max(0, doc.scrollWidth - doc.clientWidth);
    const bg = getComputedStyle(document.body).backgroundColor;
    const rootClass = doc.className;
    const colorScheme = doc.style.colorScheme || getComputedStyle(doc).colorScheme;
    const h1 = Array.from(document.querySelectorAll("h1")).map((n) => n.textContent.trim()).filter(Boolean);
    // Elements extending past the viewport are the usual cause of a horizontal
    // scrollbar on narrow layouts; report the worst few for triage.
    const offenders = [];
    if (overflow > 0) {
      for (const el of Array.from(document.querySelectorAll("*"))) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > doc.clientWidth + 1) {
          offenders.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className || "").toString().slice(0, 70),
            right: Math.round(r.right),
          });
        }
      }
      offenders.sort((a, b) => b.right - a.right);
    }
    return {
      overflow,
      bg,
      rootClass,
      colorScheme,
      h1Count: h1.length,
      h1: h1.slice(0, 2),
      offenders: offenders.slice(0, 5),
      scrollHeight: doc.scrollHeight,
    };
  });
}

export const VIEWPORTS = {
  desktop: { width: 1440, height: 1000 },
  mobile: { width: 390, height: 844 },
};
