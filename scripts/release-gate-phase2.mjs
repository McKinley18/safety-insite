import { spawnSync } from "node:child_process";
import { mkdirSync, appendFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const logDir = resolve(root, "verification/production-remediation-phase-2-2026-07-26/logs");
mkdirSync(logDir, { recursive: true });
const log = resolve(logDir, `release-gate-${new Date().toISOString().replace(/[:.]/g, "-")}.log`);

function stage(name, command, args, cwd, reportOnly = false) {
  process.stdout.write(`\n[release-gate] ${name}\n`);
  const result = spawnSync(command, args, { cwd, env: process.env, encoding: "utf8" });
  appendFileSync(log, `\n## ${name}\n${result.stdout || ""}${result.stderr || ""}`);
  process.stdout.write(result.stdout || "");
  process.stderr.write(result.stderr || "");
  if (result.status !== 0 && !reportOnly) throw new Error(`${name} failed with exit ${result.status}`);
}

if (!process.env.DATABASE_URL || !process.env.BASELINE_REFERENCE_DATABASE_URL) {
  throw new Error("Disposable DATABASE_URL and BASELINE_REFERENCE_DATABASE_URL are required.");
}
if (!/phase2_|audit|test/.test(process.env.DATABASE_URL)) {
  throw new Error("Release gate refuses a DATABASE_URL that is not explicitly named as disposable.");
}

try {
  stage("git diff check", "git", ["diff", "--check"], root);
  stage("backend build", "npm", ["run", "build"], resolve(root, "backend"));
  stage("frontend build", "npm", ["run", "build"], resolve(root, "frontend-next"));
  stage("migration validation", "npm", ["run", "migration:run"], resolve(root, "backend"));
  stage("migration baseline dry run", "npm", ["run", "migration:baseline"], resolve(root, "backend"));
  stage("authentication", "npm", ["run", "test:auth-flow"], resolve(root, "backend"));
  stage("password reset delivery", "npm", ["run", "test:password-reset-delivery"], resolve(root, "backend"));
  stage("upload security", "npm", ["run", "test:upload-security"], resolve(root, "backend"));
  stage("billing regression", "npm", ["run", "billing:regression"], resolve(root, "backend"));
  stage("corrective action scope", "npm", ["run", "smoke:corrective-actions-scope"], resolve(root, "backend"));
  stage("dashboard scope", "npm", ["run", "smoke:dashboard-scope"], resolve(root, "backend"));
  stage("modified frontend lint", "npx", ["eslint", "app/forgot-password/page.tsx", "app/reset-password/page.tsx", "scripts/check-company-actions-sync.mjs", "scripts/check-action-workflow-visibility.mjs"], resolve(root, "frontend-next"));
  stage("authenticated browser release", "npm", ["run", "check:authenticated-release"], resolve(root, "frontend-next"));
  stage("backend dependency report", "npm", ["audit", "--omit=dev"], resolve(root, "backend"), true);
  stage("frontend dependency report", "npm", ["audit", "--omit=dev"], resolve(root, "frontend-next"), true);
  console.log(`[release-gate] PASS; log ${log}`);
} catch (error) {
  console.error(`[release-gate] FAIL: ${error.message}; log ${log}`);
  process.exitCode = 1;
}
