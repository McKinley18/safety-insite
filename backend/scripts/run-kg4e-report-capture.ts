/**
 * KG-4E -- drives the REAL report/PDF path end to end and captures the artifacts.
 *
 * KG-4D closed API response -> persistence -> reload -> Standard Detail through real HTTP and a
 * real browser, and recorded honestly that the generated report/PDF was never exercised. This is
 * that surface. Nothing here reimplements report generation: every PDF is produced by
 * `CanonicalReportsService.generate()` inside the running server, stored through the real storage
 * service, and fetched back over the real authenticated download route.
 *
 * ONE JOB: CAPTURE. It asserts nothing about invariance; comparison lives in
 * `compare-kg4e-report-invariance.ts`. KG-4B's most expensive lesson was that a harness which both
 * measures and judges will confidently report agreement produced by its own defect.
 *
 * WHY THE CUSTOMER-VISIBLE INPUT IS HELD CONSTANT. The site name, inspection title, regulatory
 * context, observation text, review rationale, finding conclusion and corrective-action fields are
 * fixed per case and identical on both sides. What is NOT constant is the inspection's uuid and the
 * generation timestamp -- those differ between any two inspections, LEGACY or SHADOW, and the
 * comparison derives them empirically from two same-configuration LEGACY runs rather than declaring
 * them in an ignore list.
 *
 * PACED INSIDE THE THROTTLE. `/safescope-v2/classify` is 30/60s. This paces at 3s and REFUSES a 429
 * rather than recording it -- two identical error responses compare equal and prove nothing.
 *
 * Env: API_BASE_URL, KG4E_EMAIL, KG4E_PASSWORD, OUT_DIR, LABEL
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const API = process.env.API_BASE_URL || 'http://127.0.0.1:4360';
const EMAIL = process.env.KG4E_EMAIL || '';
const PASSWORD = process.env.KG4E_PASSWORD || '';
const OUT_DIR = process.env.OUT_DIR || '';
const LABEL = process.env.LABEL || 'capture';
const ONLY = (process.env.ONLY || '').split(',').map((s) => s.trim()).filter(Boolean);

const PACE_MS = 3_000;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Regime = 'osha-construction' | 'osha-general-industry' | 'msha';

interface Case {
  id: string;
  text: string;
  scopes: string[];
  regulatoryContext: Regime;
  hazardCategory: string;
  conclusion: string;
  /** Fixed corrective action, or none. Dates are literal so nothing drifts with the clock. */
  action?: { title: string; description: string; priorityCode: string; dueDate: string; assignedToName: string };
}

/**
 * The case set. Carried over from KG-4D's capture harness -- already proven to produce citations
 * across three regimes -- plus the corrective-action and multi-hazard shapes the report needs.
 * Which shadow mismatch category each case actually exercises is READ FROM TELEMETRY afterwards,
 * never asserted here.
 */
const CASES: Case[] = [
  {
    id: 'FALL-01',
    text: 'A worker on a scaffold at about 12 feet has no guardrail and no harness anchored.',
    scopes: ['osha_construction'], regulatoryContext: 'osha-construction',
    hazardCategory: 'Fall Protection',
    conclusion: 'Unprotected edge on the scaffold platform with no guardrail and no anchored personal fall arrest.',
    action: {
      title: 'Restore fall protection on the scaffold platform',
      description: 'Immediate: stop work at the open edge and remove the worker from the platform.\nPermanent: install a compliant guardrail system on all open sides.\nVerification: competent-person inspection before the next shift.',
      priorityCode: 'urgent', dueDate: '2026-09-15T00:00:00.000Z', assignedToName: 'Site Superintendent',
    },
  },
  {
    id: 'GUARD-01',
    text: 'The bench grinder is missing its tongue guard and the work rest is set about half an inch away.',
    scopes: ['osha_general_industry'], regulatoryContext: 'osha-general-industry',
    hazardCategory: 'Machine Guarding',
    conclusion: 'Abrasive wheel machinery in service without a tongue guard and with the work rest out of adjustment.',
    action: {
      title: 'Adjust and reinstate abrasive wheel guarding',
      description: 'Immediate: tag the grinder out of service.\nPermanent: refit the tongue guard and set the work rest to no more than one eighth inch.\nVerification: supervisor sign-off on the guarding checklist.',
      priorityCode: 'high', dueDate: '2026-09-05T00:00:00.000Z', assignedToName: 'Maintenance Lead',
    },
  },
  {
    id: 'LOTO-01',
    text: 'A maintenance technician is servicing the conveyor while it is still energized and no lock is applied.',
    scopes: ['osha_general_industry'], regulatoryContext: 'osha-general-industry',
    hazardCategory: 'Hazardous Energy Control',
    conclusion: 'Servicing performed on energized equipment with no energy-isolating device locked out.',
  },
  {
    id: 'MSHA-01',
    text: 'A haul truck at the surface mine is backing without a functional backup alarm and no spotter present.',
    scopes: ['msha'], regulatoryContext: 'msha',
    hazardCategory: 'Mobile Equipment',
    conclusion: 'Haul truck reversing with no functional audible warning device and no observer signalling that it is safe to proceed.',
    action: {
      title: 'Return the reverse-activated alarm to service',
      description: 'Immediate: park the unit and restrict reversing movements.\nPermanent: repair or replace the reverse-activated signal alarm.\nVerification: pre-operational check recorded for three consecutive shifts.',
      priorityCode: 'high', dueDate: '2026-09-10T00:00:00.000Z', assignedToName: 'Mine Foreman',
    },
  },
  {
    id: 'ELEC-01',
    text: 'An extension cord feeding the shop light has damaged insulation and exposed conductor.',
    scopes: ['osha_general_industry'], regulatoryContext: 'osha-general-industry',
    hazardCategory: 'Electrical Safety',
    conclusion: 'Flexible cord in service with damaged insulation exposing an energized conductor.',
  },
  {
    id: 'MULTI-01',
    text: 'The unguarded pulley sits beside an open floor hole, and the nearby drum of solvent is unlabeled.',
    scopes: ['osha_general_industry'], regulatoryContext: 'osha-general-industry',
    hazardCategory: 'Multiple Hazards',
    conclusion: 'Three co-located hazards: an unguarded rotating pulley, an unprotected floor opening, and an unlabeled container of a hazardous chemical.',
    action: {
      title: 'Correct the co-located hazards in the pump room',
      description: 'Immediate: barricade the floor opening and de-energize the drive.\nPermanent: fit a fixed guard to the pulley, install a compliant floor-hole cover, and label the solvent drum.\nVerification: re-inspect all three conditions after correction.',
      priorityCode: 'urgent', dueDate: '2026-09-01T00:00:00.000Z', assignedToName: 'Plant Manager',
    },
  },
  {
    id: 'CONTROL-01',
    text: 'The machine guard is fixed and interlocked, tested this morning, and prevents access to the point of operation.',
    scopes: ['osha_general_industry'], regulatoryContext: 'osha-general-industry',
    hazardCategory: 'Machine Guarding',
    conclusion: 'Point-of-operation guarding observed in place, interlocked and functionally tested; no deficiency identified.',
  },
  {
    id: 'SILICA-01',
    text: 'A worker is dry-cutting concrete block with a handheld saw and no water suppression or respirator.',
    scopes: ['osha_construction'], regulatoryContext: 'osha-construction',
    hazardCategory: 'Respirable Crystalline Silica',
    conclusion: 'Dry cutting of masonry with no integrated water delivery and no respiratory protection in use.',
  },
];

const SITE_NAME = 'KG-4E Verification Site';
const REVIEW_RATIONALE = 'KG-4E verification: the qualified reviewer accepted the HazLenz assessment without edit.';

let token = '';

async function api(method: string, path: string, body?: unknown): Promise<{ status: number; body: any }> {
  const response = await fetch(API + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  let parsed: any = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
  return { status: response.status, body: parsed };
}

function must(result: { status: number; body: any }, what: string): any {
  if (result.status === 429) throw new Error('THROTTLED (HTTP 429) on ' + what + '; the runner must pace, not the server relax');
  if (result.status >= 400) throw new Error(what + ' failed: HTTP ' + result.status + ' ' + JSON.stringify(result.body).slice(0, 400));
  return result.body;
}

async function runCase(entry: Case, siteId: string): Promise<Record<string, unknown>> {
  const inspection = must(await api('POST', '/inspections', {
    siteId, title: 'KG-4E ' + entry.id, regulatoryContext: entry.regulatoryContext,
  }), 'create inspection ' + entry.id);
  const inspectionId = inspection.id as string;

  const observation = must(await api('POST', '/inspections/' + inspectionId + '/observations', {
    rawText: entry.text,
  }), 'create observation ' + entry.id);
  const observationId = observation.id as string;

  // THE request-path call. On the SHADOW server this is the four-run orchestration; the payload
  // returned is the pristine legacy branch. Nothing downstream knows or can know which it was.
  const classified = must(await api('POST', '/safescope-v2/classify', {
    text: entry.text, scopes: entry.scopes,
  }), 'classify ' + entry.id);

  const analysis = must(await api('POST', '/inspections/observations/' + observationId + '/analyses', {
    engineVersion: 'hazlenz-production',
    traceId: 'kg4e-' + LABEL + '-' + entry.id,
    idempotencyKey: 'kg4e-' + LABEL + '-' + entry.id + '-' + Date.now(),
    requestVersion: 1,
    resultSnapshot: classified,
  }), 'persist analysis ' + entry.id);
  const analysisId = analysis.id as string;

  // Findings already materialized by decomposition reconciliation (multi-hazard observations) are
  // reviewed and finalized individually; a single-hazard observation materializes its finding at
  // finalization under the 'primary' segment key. Both shapes are exercised, because the PDF's
  // standard-extraction takes a DIFFERENT branch for each.
  let current = must(await api('GET', '/inspections/' + inspectionId), 'reload ' + entry.id);
  const existing: any[] = (current.findings || []).filter((f: any) =>
    f.observationId === observationId && f.status !== 'superseded');
  const segmentKeys: string[] = existing.length ? existing.map((f: any) => f.hazardKey) : ['primary'];

  const findingIds: string[] = [];
  for (const segmentKey of segmentKeys) {
    const matching = existing.find((f: any) => f.hazardKey === segmentKey);
    const review = must(await api('POST', '/inspections/observations/' + observationId + '/reviews', {
      analysisId,
      ...(matching ? { findingId: matching.id } : {}),
      decision: 'accepted',
      rationale: REVIEW_RATIONALE,
      idempotencyKey: 'kg4e-' + LABEL + '-' + entry.id + '-' + segmentKey + '-' + Date.now(),
    }), 'review ' + entry.id + '/' + segmentKey);

    const finding = must(await api('POST', '/inspections/observations/' + observationId + '/findings', {
      reviewId: review.id, segmentKey,
      hazardCategory: matching?.hazardCategory || entry.hazardCategory,
      conclusion: matching?.conclusion || entry.conclusion,
    }), 'finalize ' + entry.id + '/' + segmentKey);
    findingIds.push(finding.id);
  }

  if (entry.action && findingIds.length) {
    must(await api('POST', '/actions', {
      inspectionId, findingId: findingIds[0], siteId,
      title: entry.action.title, description: entry.action.description,
      priorityCode: entry.action.priorityCode, dueDate: entry.action.dueDate,
      assignedToName: entry.action.assignedToName,
      classificationId: null, source: 'kg4e-verification',
    }), 'corrective action ' + entry.id);
  }

  current = must(await api('GET', '/inspections/' + inspectionId), 'reload before transition ' + entry.id);
  must(await api('POST', '/inspections/' + inspectionId + '/transition', {
    status: 'in_review', version: current.version,
  }), 'transition in_review ' + entry.id);
  current = must(await api('GET', '/inspections/' + inspectionId), 'reload before completion ' + entry.id);
  must(await api('POST', '/inspections/' + inspectionId + '/transition', {
    status: 'completed', version: current.version,
  }), 'transition completed ' + entry.id);

  // The real canonical generator, inside the server.
  const metadata = must(await api('POST', '/inspections/' + inspectionId + '/reports', {}),
    'generate report ' + entry.id);

  const download = await fetch(API + '/inspection-reports/' + metadata.reportId + '/versions/' +
    metadata.version + '/download', { headers: { Authorization: 'Bearer ' + token } });
  if (!download.ok) throw new Error('download failed for ' + entry.id + ': HTTP ' + download.status);
  const pdf = Buffer.from(await download.arrayBuffer());
  if (pdf.subarray(0, 5).toString() !== '%PDF-') throw new Error('downloaded bytes are not a PDF for ' + entry.id);

  const pdfPath = join(OUT_DIR, LABEL + '__' + entry.id + '.pdf');
  writeFileSync(pdfPath, pdf);

  return {
    case: entry.id,
    inspectionId, observationId, analysisId,
    findingIds, findingCount: findingIds.length,
    reportId: metadata.reportId, versionId: metadata.versionId, version: metadata.version,
    checksum: metadata.checksum, sizeBytes: Number(metadata.sizeBytes),
    generatorVersion: metadata.generatorVersion,
    generatedAt: metadata.generatedAt,
    pdfPath,
    hasCorrectiveAction: !!entry.action,
    // The customer payload itself, so the report comparison can be tied back to the API surface
    // KG-4D already closed.
    classifyPayload: classified,
  };
}

async function main(): Promise<void> {
  if (!EMAIL || !PASSWORD || !OUT_DIR) throw new Error('KG4E_EMAIL, KG4E_PASSWORD and OUT_DIR are required');
  mkdirSync(OUT_DIR, { recursive: true });

  token = must(await api('POST', '/auth/login', { email: EMAIL, password: PASSWORD }), 'login').token;

  // ONE site, reused across every run. The site name is printed on the cover, in the executive
  // summary and in the running header, so it must be identical on both sides -- and reusing the
  // same row removes the site id as a variable entirely rather than holding two ids equal by
  // coincidence of naming.
  const listed = must(await api('GET', '/sites'), 'list sites');
  const rows: any[] = Array.isArray(listed) ? listed : (listed?.data || listed?.items || []);
  const site = rows.find((row: any) => row?.name === SITE_NAME)
    || must(await api('POST', '/sites', { name: SITE_NAME }), 'create site');

  const selected = ONLY.length ? CASES.filter((c) => ONLY.includes(c.id)) : CASES;
  const results: Array<Record<string, unknown>> = [];
  for (const entry of selected) {
    results.push(await runCase(entry, site.id));
    process.stdout.write('.');
    await sleep(PACE_MS);
  }
  process.stdout.write('\n');

  const manifestPath = join(OUT_DIR, LABEL + '__manifest.json');
  writeFileSync(manifestPath, JSON.stringify({
    label: LABEL, api: API, email: EMAIL, siteId: site.id, siteName: SITE_NAME,
    capturedAt: new Date().toISOString(),
    caseCount: results.length,
    cases: results,
  }, null, 2) + '\n');

  // NON-VACUITY FLOOR. A capture whose PDFs carry no findings would compare equal for the wrong
  // reason, exactly as KG-4B's 429s did.
  const withFindings = results.filter((r) => Number(r.findingCount) > 0).length;
  console.log(LABEL + ': ' + results.length + ' reports -> ' + OUT_DIR);
  console.log('  cases with at least one finalized finding: ' + withFindings + '/' + results.length);
  console.log('  manifest: ' + manifestPath);
  if (withFindings !== results.length) throw new Error('NON-VACUITY FLOOR: a case produced no finalized finding');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
