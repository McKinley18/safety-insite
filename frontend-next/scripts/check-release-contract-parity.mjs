#!/usr/bin/env node
/**
 * §279 — HOLD THE TWO COPIES OF THE RELEASE COMPATIBILITY RULE TOGETHER, AND CHECK THE ONE VALUE
 * THAT COULD NOT BE DERIVED.
 *
 * Two things are checked, and they fail for different reasons:
 *
 * 1. THE RULE. `backend/src/common/release-contract.ts` decides what the server says a client is;
 *    `frontend-next/lib/release/releaseContract.ts` decides what the client believes it is. If
 *    those two disagree, a client can be told it is supported and refuse its own writes, or be
 *    told it is obsolete by a server that would have accepted them. Comments are stripped before
 *    the comparison, so the frontend copy's explanatory header is free and a divergence in the
 *    RULE is not.
 *
 * 2. THE DECLARED FRONTEND VERSION. `SHIPPED_FRONTEND_VERSION` in the backend cannot be derived:
 *    the backend builds with `rootDir: backend` on Render and never sees the frontend project.
 *    It is therefore the one hand-maintained value in the whole contract, and this is what stops
 *    it going stale -- if it does not equal `frontend-next/package.json`, the release is shipping
 *    a backend that will tell the current frontend it is a version behind, or worse, that a
 *    genuinely old client is current.
 *
 * Exits non-zero on either failure.
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");

const BACKEND_RULE = resolve(repoRoot, "backend/src/common/release-contract.ts");
const FRONTEND_RULE = resolve(repoRoot, "frontend-next/lib/release/releaseContract.ts");
const BACKEND_IDENTITY = resolve(repoRoot, "backend/src/common/release-identity.ts");
const FRONTEND_MANIFEST = resolve(repoRoot, "frontend-next/package.json");

function ruleBody(path) {
  return readFileSync(path, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, "").trimEnd())
    .filter((line) => line.trim().length > 0)
    .join("\n");
}

function fail(payload) {
  console.error(JSON.stringify({ check: "release-contract-parity", result: "FAIL", ...payload }, null, 2));
  process.exit(1);
}

const backend = ruleBody(BACKEND_RULE);
const frontend = ruleBody(FRONTEND_RULE);

if (backend !== frontend) {
  const backendLines = backend.split("\n");
  const frontendLines = frontend.split("\n");
  let firstDiff = -1;
  for (let i = 0; i < Math.max(backendLines.length, frontendLines.length); i += 1) {
    if (backendLines[i] !== frontendLines[i]) {
      firstDiff = i;
      break;
    }
  }
  fail({
    failure: "RULE_DIVERGED",
    message:
      "The release compatibility rule differs between the server and the browser. A client can "
      + "then be declared obsolete by one and supported by the other.",
    firstDifferingLine: firstDiff + 1,
    backend: backendLines[firstDiff] ?? "<end of file>",
    frontend: frontendLines[firstDiff] ?? "<end of file>",
  });
}

const identitySource = readFileSync(BACKEND_IDENTITY, "utf8");
const declared = /export const SHIPPED_FRONTEND_VERSION\s*=\s*['"]([^'"]+)['"]/.exec(identitySource);
if (!declared) {
  fail({
    failure: "DECLARATION_MISSING",
    message: "SHIPPED_FRONTEND_VERSION could not be read from backend/src/common/release-identity.ts.",
  });
}

const floor = /export const MINIMUM_SUPPORTED_FRONTEND_VERSION\s*=\s*['"]([^'"]+)['"]/.exec(identitySource);
if (!floor) {
  fail({
    failure: "DECLARATION_MISSING",
    message:
      "MINIMUM_SUPPORTED_FRONTEND_VERSION could not be read from backend/src/common/release-identity.ts.",
  });
}

const actual = JSON.parse(readFileSync(FRONTEND_MANIFEST, "utf8")).version;

if (declared[1] !== actual) {
  fail({
    failure: "SHIPPED_FRONTEND_VERSION_STALE",
    message:
      "The backend declares it ships with a different frontend release than frontend-next actually is. "
      + "Update SHIPPED_FRONTEND_VERSION in the same commit that changes frontend-next/package.json.",
    declaredByBackend: declared[1],
    frontendPackageVersion: actual,
  });
}

const semver = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/;
if (!semver.test(declared[1]) || !semver.test(floor[1])) {
  fail({
    failure: "DECLARATION_UNPARSEABLE",
    message:
      "Both declared versions must be major.minor.patch. The rule resolves an unparseable version "
      + "to UNKNOWN, which never blocks -- so a typo here would silently disable the whole contract.",
    shippedFrontendVersion: declared[1],
    minimumSupportedFrontendVersion: floor[1],
  });
}

// The floor may equal the shipped version, but it may never exceed it: that would declare every
// client, including the one shipping with this backend, unsupported on the day of release.
const parse = (value) => semver.exec(value).slice(1, 4).map(Number);
const [sMajor, sMinor, sPatch] = parse(declared[1]);
const [fMajor, fMinor, fPatch] = parse(floor[1]);
if (fMajor > sMajor || (fMajor === sMajor && (fMinor > sMinor || (fMinor === sMinor && fPatch > sPatch)))) {
  fail({
    failure: "FLOOR_ABOVE_SHIPPED",
    message:
      "MINIMUM_SUPPORTED_FRONTEND_VERSION is above SHIPPED_FRONTEND_VERSION, which would declare "
      + "the frontend released alongside this backend to be below the supported floor.",
    shippedFrontendVersion: declared[1],
    minimumSupportedFrontendVersion: floor[1],
  });
}

console.log(
  JSON.stringify(
    {
      check: "release-contract-parity",
      result: "PASS",
      comparedRuleLines: backend.split("\n").length,
      shippedFrontendVersion: declared[1],
      minimumSupportedFrontendVersion: floor[1],
      frontendPackageVersion: actual,
    },
    null,
    2,
  ),
);
