/**
 * KG-4D -- captures customer-visible classify payloads from a running server.
 *
 * One job: log in, issue a fixed observation set, and write the raw responses to an artifact. It
 * makes no claims and asserts nothing; comparison is `compare-kg4d-customer-capture.ts`. Keeping
 * capture and judgement apart is deliberate -- the KG-4B corpus run conflated them and a broken
 * instrument produced a confident wrong answer three times running.
 *
 * PACED INSIDE THE THROTTLE. `/safescope-v2/classify` is limited to 30 requests / 60s. This paces
 * at 20/60s and REFUSES a 429 outright rather than recording it: an error response compares equal
 * to another error response, and an oracle fed two identical 429s reports perfect agreement. The
 * throttle is not raised.
 *
 * Env: API_BASE_URL, KG4D_EMAIL, KG4D_PASSWORD, OUT (artifact path), LABEL
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const API = process.env.API_BASE_URL || 'http://127.0.0.1:4350';
const EMAIL = process.env.KG4D_EMAIL || '';
const PASSWORD = process.env.KG4D_PASSWORD || '';
const OUT = process.env.OUT || '';
const LABEL = process.env.LABEL || 'capture';

/**
 * The observation set. Deliberately spans regimes and shapes so the comparison is not a single
 * lucky case: positive hazards, a negative control, a multi-hazard observation, and an MSHA case.
 */
const OBSERVATIONS: Array<{ id: string; text: string; scopes?: string[] }> = [
  { id: 'FALL-01', text: 'A worker on a scaffold at about 12 feet has no guardrail and no harness anchored.', scopes: ['osha_construction'] },
  { id: 'GUARD-01', text: 'The bench grinder is missing its tongue guard and the work rest is set about half an inch away.', scopes: ['osha_general_industry'] },
  { id: 'LOTO-01', text: 'A maintenance technician is servicing the conveyor while it is still energized and no lock is applied.', scopes: ['osha_general_industry'] },
  { id: 'MSHA-01', text: 'A haul truck at the surface mine is backing without a functional backup alarm and no spotter present.', scopes: ['msha'] },
  { id: 'ELEC-01', text: 'An extension cord feeding the shop light has damaged insulation and exposed conductor.', scopes: ['osha_general_industry'] },
  { id: 'MULTI-01', text: 'The unguarded pulley sits beside an open floor hole, and the nearby drum of solvent is unlabeled.', scopes: ['osha_general_industry'] },
  { id: 'CONTROL-01', text: 'The machine guard is fixed and interlocked, tested this morning, and prevents access to the point of operation.', scopes: ['osha_general_industry'] },
  { id: 'SILICA-01', text: 'A worker is dry-cutting concrete block with a handheld saw and no water suppression or respirator.', scopes: ['osha_construction'] },
];

/** 20 requests per 60s, with headroom under the server's 30/60s. */
const PACE_MS = 3_000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function login(): Promise<string> {
  const response = await fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!response.ok) throw new Error('login failed: HTTP ' + response.status);
  const body = await response.json() as { token?: string };
  if (!body.token) throw new Error('login returned no token');
  return body.token;
}

async function classify(token: string, observation: typeof OBSERVATIONS[number]): Promise<unknown> {
  const response = await fetch(API + '/safescope-v2/classify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ text: observation.text, scopes: observation.scopes }),
  });
  if (response.status === 429) {
    // A throttled response is NOT a comparison. Refuse it rather than record it.
    throw new Error('THROTTLED (HTTP 429) on ' + observation.id + '; the runner must pace, not the server relax');
  }
  if (!response.ok) throw new Error('classify failed for ' + observation.id + ': HTTP ' + response.status);
  return response.json();
}

async function main(): Promise<void> {
  if (!EMAIL || !PASSWORD || !OUT) throw new Error('KG4D_EMAIL, KG4D_PASSWORD and OUT are required');
  const token = await login();
  const captured: Record<string, unknown> = {};

  for (const observation of OBSERVATIONS) {
    captured[observation.id] = await classify(token, observation);
    process.stdout.write('.');
    await sleep(PACE_MS);
  }
  process.stdout.write('\n');

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify({
    label: LABEL, api: API, email: EMAIL,
    capturedAt: new Date().toISOString(),
    caseCount: OBSERVATIONS.length,
    cases: captured,
  }, null, 2) + '\n');

  const withCitations = Object.values(captured).filter((entry) => {
    const value = entry as Record<string, unknown>;
    const lists = ['suggestedStandards', 'primaryStandards', 'standardDecisions'];
    return lists.some((key) => Array.isArray(value?.[key]) && (value[key] as unknown[]).length > 0);
  }).length;

  console.log(LABEL + ': captured ' + OBSERVATIONS.length + ' cases -> ' + OUT);
  console.log('  cases producing citations: ' + withCitations + '/' + OBSERVATIONS.length);
  if (withCitations === 0) {
    throw new Error('NON-VACUITY FLOOR: no case produced any citation; this capture proves nothing');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
