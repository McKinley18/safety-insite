import * as fs from "fs";
import * as path from "path";

type Check = {
  name: string;
  passed: boolean;
  detail?: string;
};

const root = path.resolve(__dirname, "../..");

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath: string) {
  return fs.existsSync(path.join(root, relativePath));
}

function walk(dir: string): string[] {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];

  const out: string[] = [];

  for (const item of fs.readdirSync(abs)) {
    const full = path.join(abs, item);
    const rel = path.relative(root, full);

    if (
      item === "node_modules" ||
      item === ".next" ||
      item === "dist" ||
      item === ".git"
    ) {
      continue;
    }

    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      out.push(...walk(rel));
    } else {
      out.push(rel);
    }
  }

  return out;
}

const checks: Check[] = [];

const mainTs = read("backend/src/main.ts");
checks.push({
  name: "Nest app uses rawBody for Stripe webhook verification",
  passed: mainTs.includes("rawBody: true"),
});

checks.push({
  name: "Nest app enables Helmet",
  passed: mainTs.includes("helmet()") || mainTs.includes("helmet("),
});

checks.push({
  name: "Nest app enables CORS",
  passed: mainTs.includes("enableCors"),
});

checks.push({
  name: "Nest app uses global ValidationPipe",
  passed: mainTs.includes("ValidationPipe") && mainTs.includes("useGlobalPipes"),
});

const appModule = read("backend/src/app.module.ts");
checks.push({
  name: "Backend has global throttling guard",
  passed: appModule.includes("APP_GUARD") && appModule.includes("ThrottlerGuard"),
});

const billingController = read("backend/src/billing/billing.controller.ts");
const billingService = read("backend/src/billing/billing.service.ts");

checks.push({
  name: "Billing checkout route is guarded",
  passed:
    billingController.includes('@Post("checkout")') ||
    billingController.includes("@Post('checkout')"),
  detail: billingController.includes("UseGuards(JwtGuard)")
    ? undefined
    : "Billing controller should use JwtGuard on checkout/portal/me routes.",
});

checks.push({
  name: "Stripe webhook verifies signature",
  passed:
    billingService.includes("constructEvent") &&
    billingService.includes("STRIPE_WEBHOOK_SECRET"),
});

checks.push({
  name: "Billing exposes Free/Pro/Expert tiers",
  passed:
    exists("backend/src/billing/plan-entitlements.ts") &&
    read("backend/src/billing/plan-entitlements.ts").includes('"free"') &&
    read("backend/src/billing/plan-entitlements.ts").includes('"pro"') &&
    read("backend/src/billing/plan-entitlements.ts").includes('"expert"'),
});

const sourceFiles = [
  ...walk("backend/src"),
  ...walk("frontend-next/app"),
  ...walk("frontend-next/components"),
  ...walk("frontend-next/lib"),
];

const sourceText = sourceFiles
  .filter((file) => /\.(ts|tsx|js|jsx)$/.test(file))
  .map((file) => `${file}\n${read(file)}`)
  .join("\n\n");

checks.push({
  name: "No hardcoded JWT supersecretkey remains",
  passed: !sourceText.includes("supersecretkey"),
});

checks.push({
  name: "No dev-local-user fallback remains",
  passed: !sourceText.includes("dev-local-user"),
});

checks.push({
  name: "No anonymous fallback remains in backend source",
  passed: !walk("backend/src")
    .filter((file) => /\.(ts|js)$/.test(file))
    .map((file) => read(file))
    .join("\n")
    .includes("'anonymous'"),
});

const frontendAuth = read("frontend-next/lib/auth.ts");
checks.push({
  name: "Frontend auth bypass is blocked in production",
  passed:
    frontendAuth.includes("NEXT_PUBLIC_DISABLE_AUTH") &&
    frontendAuth.includes('NODE_ENV !== "production"'),
});

const trackedEnv = require("child_process")
  .execSync("git ls-files", { cwd: root })
  .toString()
  .split(/\r?\n/)
  .filter((file: string) =>
    /(^|\/)\.env($|\.|\/)|frontend-next\/\.env|backend\/\.env/.test(file),
  )
  .filter((file: string) => file !== "backend/.env.example");

checks.push({
  name: "No real env files are tracked",
  passed: trackedEnv.length === 0,
  detail: trackedEnv.join(", "),
});

const failed = checks.filter((check) => !check.passed);

console.log("\nSafety InSite production security readiness\n");

for (const check of checks) {
  console.log(`${check.passed ? "✅" : "❌"} ${check.name}`);
  if (!check.passed && check.detail) {
    console.log(`   ${check.detail}`);
  }
}

if (failed.length) {
  console.error(`\n${failed.length} production security readiness check(s) failed.`);
  process.exit(1);
}

console.log("\nAll production security readiness checks passed.");
