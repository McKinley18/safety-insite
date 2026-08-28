#!/usr/bin/env node
/**
 * Risk-band parity check.
 *
 * The frontend cannot import `backend/src/safescope-v2/risk/risk-profiles.ts` (separate package,
 * separate build), so `lib/inspection/riskBands.ts` mirrors it. A mirror nobody verifies is how
 * the UI came to display "Moderate" for a 5x5 score of 12 while the engine, the saved finding and
 * the report all said "High".
 *
 * This parses BOTH files and fails on any difference in matrix size, band label, or boundary. It
 * reads sources only -- no database, no network, no build step -- so it is safe in any tier.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const backendProfiles = resolve(here, "../../backend/src/safescope-v2/risk/risk-profiles.ts");
const frontendBands = resolve(here, "../lib/inspection/riskBands.ts");

function fail(message) {
  console.error(`FAIL  ${message}`);
  process.exitCode = 1;
}

/** Pulls `size` and the `bands` array out of each profile literal in the backend file. */
function parseBackend(source) {
  const result = {};
  // Each profile block runs from `id: "<name>"` to the closing of its `bands: [ ... ]`.
  const profileRe = /id:\s*"(simple_4x4|standard_5x5|advanced_6x6)"[\s\S]*?size:\s*(\d+)[\s\S]*?bands:\s*\[([\s\S]*?)\]/g;
  let match;
  while ((match = profileRe.exec(source)) !== null) {
    const [, id, size, bandsBlock] = match;
    const bands = [];
    const bandRe = /\{\s*label:\s*"(\w+)",\s*min:\s*(\d+),\s*max:\s*(\d+)\s*\}/g;
    let band;
    while ((band = bandRe.exec(bandsBlock)) !== null) {
      bands.push({ label: band[1], min: Number(band[2]), max: Number(band[3]) });
    }
    result[Number(size)] = { id, bands };
  }
  return result;
}

/** Pulls the `RISK_BANDS_BY_MATRIX_SIZE` table out of the frontend module. */
function parseFrontend(source) {
  const tableMatch = source.match(/RISK_BANDS_BY_MATRIX_SIZE[^=]*=\s*\{([\s\S]*?)\n\};/);
  if (!tableMatch) return null;
  const result = {};
  // The final entry in the table has no trailing newline inside the captured block, so the
  // terminator must not require one -- band objects contain no "]", making this unambiguous.
  const sizeRe = /(\d+):\s*\[([\s\S]*?)\]\s*,?/g;
  let match;
  while ((match = sizeRe.exec(tableMatch[1])) !== null) {
    const bands = [];
    const bandRe = /\{\s*label:\s*"(\w+)",\s*min:\s*(\d+),\s*max:\s*(\d+)\s*\}/g;
    let band;
    while ((band = bandRe.exec(match[2])) !== null) {
      bands.push({ label: band[1], min: Number(band[2]), max: Number(band[3]) });
    }
    result[Number(match[1])] = { bands };
  }
  return result;
}

const backend = parseBackend(readFileSync(backendProfiles, "utf8"));
const frontend = parseFrontend(readFileSync(frontendBands, "utf8"));

if (!frontend) {
  fail("could not parse RISK_BANDS_BY_MATRIX_SIZE from lib/inspection/riskBands.ts");
  process.exit(1);
}

const backendSizes = Object.keys(backend).map(Number).sort();
const frontendSizes = Object.keys(frontend).map(Number).sort();

if (backendSizes.length === 0) {
  fail("parsed no profiles from risk-profiles.ts -- the parser or the file shape changed");
  process.exit(1);
}

if (backendSizes.join(",") !== frontendSizes.join(",")) {
  fail(`matrix sizes differ. backend=[${backendSizes}] frontend=[${frontendSizes}]`);
}

let compared = 0;
for (const size of backendSizes) {
  const server = backend[size];
  const client = frontend[size];
  if (!client) {
    fail(`frontend has no bands for the ${size}x${size} matrix (backend profile ${server.id})`);
    continue;
  }
  if (server.bands.length !== client.bands.length) {
    fail(`${size}x${size}: backend has ${server.bands.length} bands, frontend has ${client.bands.length}`);
    continue;
  }
  server.bands.forEach((serverBand, index) => {
    const clientBand = client.bands[index];
    compared += 1;
    if (serverBand.label !== clientBand.label
      || serverBand.min !== clientBand.min
      || serverBand.max !== clientBand.max) {
      fail(
        `${size}x${size} band ${index + 1}: backend ${serverBand.label} ${serverBand.min}-${serverBand.max}`
        + ` != frontend ${clientBand.label} ${clientBand.min}-${clientBand.max}`,
      );
    }
  });
}

// ---------------------------------------------------------------- governed remediation deadlines
//
// Same reasoning as the bands: the UI shows the deadline the risk decision established, so its
// table must not drift from `urgencyForRisk` in backend/src/inspection/risk-policy.ts.
const riskPolicySource = readFileSync(resolve(here, "../../backend/src/inspection/risk-policy.ts"), "utf8");
const serverDueDays = {};
// Each `case 'level':` block returns an object containing `dueDays: N`.
const caseRe = /case\s+'(critical|high|moderate|low)':[\s\S]*?dueDays:\s*(\d+)/g;
let caseMatch;
while ((caseMatch = caseRe.exec(riskPolicySource)) !== null) {
  const label = caseMatch[1][0].toUpperCase() + caseMatch[1].slice(1);
  serverDueDays[label] = Number(caseMatch[2]);
}
// `low` is the switch default in the server rather than a labelled case, so read its return too.
if (serverDueDays.Low === undefined) {
  const fallback = riskPolicySource.match(/default:[\s\S]*?dueDays:\s*(\d+)/);
  if (fallback) serverDueDays.Low = Number(fallback[1]);
}

const clientDueSource = readFileSync(frontendBands, "utf8");
const clientTable = clientDueSource.match(/RISK_BAND_DUE_DAYS[^=]*=\s*\{([\s\S]*?)\n\};/);
const clientDueDays = {};
if (clientTable) {
  const dueRe = /(\w+):\s*(\d+)/g;
  let due;
  while ((due = dueRe.exec(clientTable[1])) !== null) clientDueDays[due[1]] = Number(due[2]);
} else {
  fail("could not parse RISK_BAND_DUE_DAYS from lib/inspection/riskBands.ts");
}

const dueLabels = ["Critical", "High", "Moderate", "Low"];
if (Object.keys(serverDueDays).length !== dueLabels.length) {
  fail(`parsed ${Object.keys(serverDueDays).length} due-day levels from risk-policy.ts, expected ${dueLabels.length}`);
}
for (const label of dueLabels) {
  if (serverDueDays[label] === undefined) { fail(`risk-policy.ts has no dueDays for ${label}`); continue; }
  if (serverDueDays[label] !== clientDueDays[label]) {
    fail(`${label} due days: backend ${serverDueDays[label]} != frontend ${clientDueDays[label]}`);
  } else {
    compared += 1;
  }
}

if (process.exitCode) {
  console.error("\nThe UI risk bands no longer match backend/src/safescope-v2/risk/risk-profiles.ts.");
  console.error("Update lib/inspection/riskBands.ts to match the server profile exactly.");
  process.exit(1);
}

console.log(`PASS  risk bands match risk-profiles.ts across ${backendSizes.length} matrix profiles, and governed due days match risk-policy.ts (${compared} values compared).`);
