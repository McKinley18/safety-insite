#!/usr/bin/env node
/**
 * §276 / D-008 — HOLD THE TWO COPIES OF THE SEVERITY RULE TOGETHER.
 *
 * `backend/src/common/effective-severity.ts` decides the severity that is printed in the
 * report; `frontend-next/lib/risk/effectiveSeverity.ts` decides the one on the screen the
 * reviewer approves. D-008 exists because those two answers were allowed to differ, so a
 * hand-maintained copy with nobody checking it is not an acceptable arrangement here.
 *
 * This compares the two files after stripping comments and blank lines. The frontend file
 * carries one extra leading comment block explaining that it is a mirror; comments are
 * removed before comparison, so that block is free and a divergence in the RULE is not.
 *
 * Exits non-zero on any difference, and prints the first differing line from each side.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");

const BACKEND = resolve(repoRoot, "backend/src/common/effective-severity.ts");
const FRONTEND = resolve(repoRoot, "frontend-next/lib/risk/effectiveSeverity.ts");

/** Strip block comments, line comments and blank lines, then normalise whitespace. */
function ruleBody(path) {
  const source = readFileSync(path, "utf8");
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, "").trimEnd())
    .filter((line) => line.trim().length > 0)
    .join("\n");
}

const backend = ruleBody(BACKEND);
const frontend = ruleBody(FRONTEND);

if (backend === frontend) {
  const lines = backend.split("\n").length;
  console.log(
    JSON.stringify({ check: "effective-severity-parity", result: "PASS", comparedLines: lines }, null, 2),
  );
  process.exit(0);
}

const backendLines = backend.split("\n");
const frontendLines = frontend.split("\n");
let firstDiff = -1;
for (let i = 0; i < Math.max(backendLines.length, frontendLines.length); i += 1) {
  if (backendLines[i] !== frontendLines[i]) {
    firstDiff = i;
    break;
  }
}

console.error(
  JSON.stringify(
    {
      check: "effective-severity-parity",
      result: "FAIL",
      message:
        "The severity rule differs between the server and the browser. D-008 is the defect that produces: a report and a screen stating different severities for the same finding.",
      firstDifferingLine: firstDiff + 1,
      backend: backendLines[firstDiff] ?? "<end of file>",
      frontend: frontendLines[firstDiff] ?? "<end of file>",
      backendLineCount: backendLines.length,
      frontendLineCount: frontendLines.length,
    },
    null,
    2,
  ),
);
process.exit(1);
