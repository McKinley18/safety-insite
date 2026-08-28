// Actionable-finding coverage measurement over the FROZEN 56-row corpus.
//
// Phase 1-3 of "Final Deterministic Actionable-Finding Coverage Closure".
//
// The preceding phase measured RECOGNITION: whether the complete deterministic
// Level-1 authority represents a required hazard group anywhere in its analysis
// output (43/43). That is not the same question as whether the customer can act
// on the hazard. `InspectionService.reconcileDecompositionFindings()`
// materialises customer `inspection_findings` rows from ONE surface — the
// analysis snapshot's `multiHazardDecomposition.hazards` — so a hazard named
// only by the primary classifier is visible in the analysis header and never
// becomes a finding with its own standard, risk and corrective action.
//
// This scorer therefore drives the REAL customer workflow end to end against a
// disposable API instance and a disposable database:
//
//   register -> grant disposable Pro -> site -> inspection -> observation
//     -> POST /safescope-v2/classify        (the real deterministic engine)
//     -> POST .../analyses                  (the real snapshot persistence)
//     -> reconcileDecompositionFindings     (the real materialisation)
//     -> GET /inspections/{id}              (what the customer actually reads)
//
//   API_BASE_URL=http://127.0.0.1:4231 \
//   npx ts-node src/safescope-v2/tests/hazlenz-actionable-coverage-scorer.ts \
//       --label=before --out=<path>.json
//
// It NEVER edits the frozen corpus and never rewrites an expectation from
// output. Exit code is 0 whenever measurement completed; adjudication belongs
// to the gate.
//
// ---------------------------------------------------------------------------
// PREDECLARED DEFINITION OF ACTIONABLE COVERAGE
// ---------------------------------------------------------------------------
// Authored before any workflow output for these rows was inspected.
//
// A required hazard group has ACTIONABLE coverage when a materialised, non
// superseded `inspection_finding` on the customer's inspection represents the
// hazard AND that finding carries what the customer needs in order to act:
//
//   identity   — the finding's hazard family/category resolves to a domain in
//                the group (one finding may legitimately carry more than one
//                related hazard, so identity is read from the finding's family,
//                its hazard key and its source candidate's domain);
//   evidence   — a conclusion/mechanism and an observation fragment, so the
//                inspector can see WHY it was identified;
//   risk       — a risk snapshot, so significance can be assigned;
//   action     — a corrective-action path on that finding.
//
// Standards are scored SEPARATELY (Phase 5) into three states, because a
// hazard with no applicable standard under the selected jurisdiction is a
// legitimate outcome and must not be counted as a failure.
//
// A hazard named ONLY in the analysis header, the classifier result, internal
// metadata or a standards citation does NOT count.
//
// No artificial one-hazard-one-finding rule is imposed: a group is satisfied by
// ANY finding that represents it, and one finding may satisfy at most one group
// (the same distinct-emission rule the recognition scorers use), so two
// independently actionable hazards still require two findings.

import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { POPULATION_B } from './hazlenz-decomposition-precision-corpus';

const BASE = process.env.API_BASE_URL || 'http://127.0.0.1:4231';

// Identical alias adjudication to the recognition scorers: applied to the
// expectation and to the emission alike.
const DOMAIN_ALIASES: Record<string, string> = {
  ppe: 'personal_protective_equipment',
  material_handling: 'material_handling_storage',
  noise: 'noise_exposure',
  hazcom: 'hazard_communication',
  sds_labeling: 'hazard_communication',
  slips_trips_falls: 'slips_trips_falls_housekeeping',
  housekeeping: 'slips_trips_falls_housekeeping',
  environmental_spill: 'environmental_release',
  chemical_release: 'environmental_release',
  cranes_hoists: 'cranes_rigging_hoisting',
  rigging_lifting: 'cranes_rigging_hoisting',
  forklifts: 'powered_industrial_trucks',
  chemical_exposure: 'chemical_inhalation_contact',
  ergonomics: 'ergonomic_strain',
  first_aid_medical: 'emergency_equipment',
  fire_protection: 'fire_explosion',
  atmospheric_hazard: 'ventilation_air_quality',
  welding_cutting: 'hot_work',
};

function canon(value: string): string {
  const slug = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  return DOMAIN_ALIASES[slug] || slug;
}

// ---------------------------------------------------------------------------
// Standards applicability, authored from regulatory subject matter
// ---------------------------------------------------------------------------
// Which required hazard families carry an applicable OSHA general-industry /
// construction obligation for the observation as written. `null` means "no
// standard is expected for this family in this jurisdiction", which is a
// legitimate outcome and is scored as HAZARD_PRESENT_NO_STANDARD_APPLICABLE.
const EXPECTED_STANDARD_PATTERN: Record<string, RegExp | null> = {
  lockout_tagout: /1910\.147|1926\.417|(?:56|57)\.1(?:2016|4105)/i,
  electrical: /1910\.3(?:0[3-9]|1[0-9]|3[0-9])|1926\.4(?:0[0-9]|1[0-6])/i,
  machine_guarding: /1910\.21[1-9]|1926\.30[0-7]|(?:56|57)\.141/i,
  guarding_interlocks: /1910\.21[1-9]|1926\.30[0-7]/i,
  conveyors: /1910\.21[1-9]|(?:56|57)\.141/i,
  excavation_trenching: /1926\.65[0-2]/i,
  fall_protection: /1910\.2[3-9]|1926\.(?:50[0-3]|105)/i,
  hot_work: /1910\.25[1-5]|1926\.35[0-4]/i,
  fire_explosion: /1910\.15[6-9]|1926\.15[0-5]/i,
  compressed_gas: /1910\.10[1-6]|1926\.35[0-3]/i,
  confined_space: /1910\.146|1926\.120[0-9]/i,
  hazard_communication: /1910\.1200|1926\.59/i,
  personal_protective_equipment: /1910\.13[2-8]|1926\.(?:9[5-9]|10[0-3])/i,
  respiratory_protection: /1910\.134|1926\.103/i,
  mobile_equipment: /1910\.17[8-9]|1926\.60[0-2]|(?:56|57)\.9\d{3}/i,
  powered_industrial_trucks: /1910\.178|1926\.602/i,
  cranes_rigging_hoisting: /1910\.18[0-4]|1926\.(?:125[0-1]|55[0-4])/i,
  suspended_loads: /1910\.18[0-4]|1926\.125[0-1]/i,
  silica_respirable_dust: /1910\.1053|1926\.1153/i,
  combustible_dust: /1910\.(?:22|307)|1926\.25/i,
  material_handling_storage: /1910\.176|1926\.250/i,
  walking_working_surfaces: /1910\.22|1926\.25/i,
  ventilation_air_quality: /1910\.146|1910\.134|1926\.353/i,
  environmental_release: /1910\.1200|1910\.120/i,
  chemical_inhalation_contact: /1910\.100[0-9]|1910\.1200/i,
  // No dedicated federal standard is expected for these under the selected
  // jurisdictions; a matched citation is welcome but never required.
  traffic_control: null,
  ground_control: null,
  slips_trips_falls_housekeeping: null,
  emergency_egress: null,
  emergency_equipment: null,
};

interface Json { [key: string]: any }

async function request(
  method: string,
  route: string,
  body?: unknown,
  token?: string,
  expected?: number,
): Promise<{ status: number; body: Json }> {
  const response = await fetch(`${BASE}${route}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  let parsed: Json = {};
  try { parsed = text ? JSON.parse(text) : {}; } catch { parsed = { text }; }
  if (expected !== undefined && response.status !== expected) {
    throw new Error(`${method} ${route}: expected ${expected}, got ${response.status}: ${text.slice(0, 800)}`);
  }
  return { status: response.status, body: parsed };
}

// ---------------------------------------------------------------------------
// Finding-level extraction
// ---------------------------------------------------------------------------
export interface FindingView {
  id: string;
  status: string;
  source: string | null;
  hazardKey: string;
  domains: string[];
  hasEvidence: boolean;
  hasRisk: boolean;
  hasCorrectiveActionPath: boolean;
  citations: string[];
  conclusion: string;
}

function findingDomains(finding: Json): string[] {
  const candidate = finding?.sourceCandidate || {};
  return Array.from(new Set([
    finding?.hazardCategory,
    candidate?.domainId,
    candidate?.hazardFamily,
    finding?.hazardKey,
  ].filter(Boolean).map((value: any) => canon(String(value))))).filter(Boolean);
}

function findingCitations(finding: Json): string[] {
  const candidates = Array.isArray(finding?.sourceCandidate?.standardCandidates)
    ? finding.sourceCandidate.standardCandidates
    : [];
  const out = new Set<string>();
  for (const item of candidates) {
    const citation = typeof item === 'string' ? item : String(item?.citation || '');
    if (citation.trim()) out.add(citation.trim());
  }
  return Array.from(out).sort();
}

export function viewFinding(finding: Json): FindingView {
  const risk = finding?.riskSnapshot;
  return {
    id: String(finding?.id || ''),
    status: String(finding?.status || ''),
    source: finding?.source ? String(finding.source) : null,
    hazardKey: String(finding?.hazardKey || ''),
    domains: findingDomains(finding),
    hasEvidence: Boolean(
      String(finding?.conclusion || '').trim() &&
      String(finding?.sourceCandidate?.observationFragment || '').trim(),
    ),
    hasRisk: Boolean(risk && typeof risk === 'object' && Object.keys(risk).length > 0),
    hasCorrectiveActionPath: Boolean(
      risk?.correctiveActionIntelligence &&
      typeof risk.correctiveActionIntelligence === 'object' &&
      Object.keys(risk.correctiveActionIntelligence).length > 0,
    ),
    citations: findingCitations(finding),
    conclusion: String(finding?.conclusion || ''),
  };
}

// ---------------------------------------------------------------------------
// Recognition surface (unchanged from the Level-1 recall scorer)
// ---------------------------------------------------------------------------
function recognitionDomains(analysis: Json): string[] {
  const decomposition = Array.isArray(analysis?.multiHazardDecomposition?.hazards)
    ? analysis.multiHazardDecomposition.hazards
    : [];
  const additional = Array.isArray(analysis?.additionalHazards) ? analysis.additionalHazards : [];
  const labels = [
    ...decomposition.flatMap((h: any) => [h?.domainId, h?.hazardFamily]),
    ...additional.flatMap((h: any) => [h?.family, h?.classification, h?.hazardCategory]),
    analysis?.family,
    analysis?.classification,
    analysis?.hazardCategory,
    analysis?.multiHazardDecomposition?.primaryHazard?.domainId,
  ];
  return Array.from(new Set(
    labels.filter(Boolean).map((value: any) => canon(String(value))),
  )).filter(d => d && d !== 'unknown' && d !== 'unclassified' && d !== 'safety_observation').sort();
}

// Engine label vocabulary expressed in corpus terms; the recognition scorer's
// table, reused verbatim so recognition is measured identically here.
const ENGINE_LABEL_TO_DOMAIN: Record<string, string> = {
  loto_stored_energy: 'lockout_tagout',
  loto: 'lockout_tagout',
  lockout_stored_energy: 'lockout_tagout',
  trenching_shoring: 'excavation_trenching',
  trenching_and_shoring: 'excavation_trenching',
  excavation: 'excavation_trenching',
  falls: 'fall_protection',
  fall: 'fall_protection',
  machine: 'machine_guarding',
  respirable_dust_silica: 'silica_respirable_dust',
  respirable_dust_silica_: 'silica_respirable_dust',
  silica: 'silica_respirable_dust',
  compressed_gas_cylinders: 'compressed_gas',
  compressed_air_hose_safety: 'hydraulic_pneumatic_energy',
  welding_cutting_hot_work: 'hot_work',
  welding_cutting_and_hot_work: 'hot_work',
  lifting_rigging: 'cranes_rigging_hoisting',
  lifting_and_rigging: 'cranes_rigging_hoisting',
  cranes: 'cranes_rigging_hoisting',
  rigging: 'cranes_rigging_hoisting',
  chemical_storage: 'hazard_communication',
  hazardous_materials: 'hazard_communication',
  first_aid_eyewash_safety_shower_access: 'emergency_equipment',
  emergency_preparedness: 'emergency_egress',
  powered_mobile_equipment: 'mobile_equipment',
  mobile_equipment_traffic: 'mobile_equipment',
  fire: 'fire_explosion',
  slip_trip_fall: 'walking_working_surfaces',
  environmental: 'environmental_release',
  industrial_hygiene: 'industrial_hygiene',
};

function canonDeep(value: string): string {
  const first = canon(value);
  const mapped = ENGINE_LABEL_TO_DOMAIN[first] || first;
  return DOMAIN_ALIASES[mapped] || mapped;
}

function canonSet(values: string[]): string[] {
  return Array.from(new Set(values.map(canonDeep))).filter(Boolean).sort();
}

// ---------------------------------------------------------------------------
// Group matching — distinct-consumption, most-constrained-first
// ---------------------------------------------------------------------------
function matchGroups<T>(
  groups: Array<{ domains: string[]; lifeCritical: boolean }>,
  carriers: T[],
  carrierDomains: (carrier: T) => string[],
): Array<{ index: number; carrier: T | null }> {
  const order = groups
    .map((group, index) => ({ group, index }))
    .sort((a, b) => a.group.domains.length - b.group.domains.length);
  const consumed = new Set<number>();
  const result: Array<{ index: number; carrier: T | null }> =
    groups.map((_, index) => ({ index, carrier: null }));
  for (const { group, index } of order) {
    const wanted = canonSet(group.domains);
    const hit = carriers.findIndex((carrier, position) =>
      !consumed.has(position) && carrierDomains(carrier).some(d => wanted.includes(d)));
    if (hit >= 0) {
      consumed.add(hit);
      result[index] = { index, carrier: carriers[hit] };
    }
  }
  return result;
}

export interface RowResult {
  id: string;
  category: string;
  observationId: string;
  analysisId: string;
  regulatoryContext: string;
  recognizedDomains: string[];
  findings: FindingView[];
  groups: Array<{
    key: string;
    lifeCritical: boolean;
    recognized: boolean;
    actionable: boolean;
    findingId: string | null;
    missingActionabilityElements: string[];
    standardsState: 'HAZARD_PRESENT_STANDARD_APPLICABLE_AND_MATCHED'
      | 'HAZARD_PRESENT_NO_STANDARD_APPLICABLE'
      | 'HAZARD_PRESENT_STANDARD_EXPECTED_BUT_MISSING'
      | 'NOT_ACTIONABLE_NOT_SCORED';
  }>;
}

export interface ActionableCoverageReport {
  label: string;
  apiBase: string;
  corpus: { populationBRows: number; requiredGroups: number; lifeCriticalGroups: number };
  recognition: { satisfied: number; recall: number; lifeCriticalSatisfied: number };
  actionable: {
    satisfied: number;
    coverage: number;
    lifeCriticalSatisfied: number;
    lifeCriticalCoverage: number;
    recognizedButNotActionable: string[];
  };
  standards: {
    applicableAndMatched: number;
    noStandardApplicable: number;
    expectedButMissing: number;
    missingDetail: string[];
  };
  rows: RowResult[];
}

/**
 * The inspection-level regulatory context this run measures under.
 * `REGULATORY_CONTEXT=osha-general-industry|osha-construction|msha` selects one; omitting it
 * measures the legacy `unknown` posture. The accepted product contract requires new inspections
 * to carry an explicit context, so a run without one measures a legacy/incomplete record rather
 * than the shipping flow.
 */
const REGULATORY_CONTEXT = String(process.env.REGULATORY_CONTEXT || '').trim();
/** Spacing between classify calls; the endpoint is throttled at 30 requests per minute. */
const CLASSIFY_SPACING_MS = Number(process.env.CLASSIFY_SPACING_MS || 2100);
const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function bootstrapCustomer() {
  const suffix = `actionable-${Date.now()}`;
  const email = `${suffix}@example.test`;
  const password = 'Actionable!Strong123';
  await request('POST', '/auth/register',
    { email, password, name: suffix, type: 'individual' }, undefined, 201);
  const login = await request('POST', '/auth/login', { email, password }, undefined, 201);
  const token = String(login.body.token);
  const userId = String(login.body.user?.id || '');
  // Paid surfaces (classify, corrective-action assignment) need an entitlement.
  // Granted through the repository's own disposable-only tool, which refuses to
  // run unless NODE_ENV=test and the database name is on the disposable
  // allowlist. No billing guard is bypassed and no Stripe object is touched.
  execFileSync('npx', ['ts-node', 'scripts/grant-test-entitlement.ts', userId, '4'], {
    env: { ...process.env, NODE_ENV: 'test' },
    stdio: 'pipe',
  });
  const site = await request('POST', '/sites', { name: suffix }, token, 201);
  const inspection = await request('POST', '/inspections', {
    siteId: site.body.id,
    title: `Actionable coverage ${suffix}`,
    ...(REGULATORY_CONTEXT ? { regulatoryContext: REGULATORY_CONTEXT } : {}),
  }, token, 201);
  return { token, inspectionId: String(inspection.body.id), suffix };
}

export async function measure(label: string): Promise<ActionableCoverageReport> {
  const { token, inspectionId, suffix } = await bootstrapCustomer();
  const rows: RowResult[] = [];

  for (const [index, row] of POPULATION_B.entries()) {
    const observation = await request('POST', `/inspections/${inspectionId}/observations`,
      { rawText: row.observation, evidenceSource: 'direct_observation' }, token, 201);
    const observationId = String(observation.body.id);

    // `inspectionId` is what makes the controller apply the inspection's regulatory context,
    // exactly as the product does.
    if (CLASSIFY_SPACING_MS > 0) await pause(CLASSIFY_SPACING_MS);
    const classify = await request('POST', '/safescope-v2/classify',
      { text: row.observation, inspectionId }, token, 201);
    const analysisSnapshot = classify.body;

    const analysis = await request('POST', `/inspections/observations/${observationId}/analyses`, {
      engineVersion: 'actionable-coverage-measurement',
      idempotencyKey: `${suffix}-${row.id}-${index}`,
      requestVersion: 1,
      resultSnapshot: analysisSnapshot,
    }, token, 201);

    const inspectionView = await request('GET',
      `/inspections/${inspectionId}?observationId=${observationId}`, undefined, token, 200);
    const allFindings = Array.isArray(inspectionView.body.findings) ? inspectionView.body.findings : [];
    const findings = allFindings
      .filter((finding: Json) => String(finding?.observationId || '') === observationId)
      .filter((finding: Json) => String(finding?.status || '') !== 'superseded')
      .map(viewFinding);

    const recognizedDomains = canonSet(recognitionDomains(analysisSnapshot));
    const recognitionMatch = matchGroups(row.required, recognizedDomains, d => [d]);
    const actionableMatch = matchGroups(row.required, findings, f => f.domains);

    const groups = row.required.map((group, groupIndex) => {
      const key = group.domains.join('|');
      const recognized = recognitionMatch[groupIndex].carrier !== null;
      const finding = actionableMatch[groupIndex].carrier as FindingView | null;
      const missing: string[] = [];
      if (finding) {
        if (!finding.hasEvidence) missing.push('evidence');
        if (!finding.hasRisk) missing.push('risk');
        if (!finding.hasCorrectiveActionPath) missing.push('correctiveAction');
      }
      const actionable = Boolean(finding) && missing.length === 0;

      let standardsState: RowResult['groups'][number]['standardsState'] = 'NOT_ACTIONABLE_NOT_SCORED';
      if (finding) {
        const wanted = canonSet(group.domains);
        const patterns = wanted.map(d => EXPECTED_STANDARD_PATTERN[d]).filter(p => p !== undefined);
        const expectsStandard = patterns.some(p => p !== null);
        if (!expectsStandard) {
          standardsState = 'HAZARD_PRESENT_NO_STANDARD_APPLICABLE';
        } else {
          const matched = patterns.some(pattern =>
            pattern !== null && pattern !== undefined && finding.citations.some(c => pattern.test(c)));
          standardsState = matched
            ? 'HAZARD_PRESENT_STANDARD_APPLICABLE_AND_MATCHED'
            : 'HAZARD_PRESENT_STANDARD_EXPECTED_BUT_MISSING';
        }
      }

      return {
        key,
        lifeCritical: group.lifeCritical,
        recognized,
        actionable,
        findingId: finding ? finding.id : null,
        missingActionabilityElements: missing,
        standardsState,
      };
    });

    rows.push({
      id: row.id,
      category: row.category,
      observationId,
      analysisId: String(analysis.body.id),
      regulatoryContext: String((analysisSnapshot as any)?.regulatoryContext?.value || 'unknown'),
      recognizedDomains,
      findings,
      groups,
    });
    process.stderr.write(`  workflow ${row.id}: ${findings.length} finding(s)\n`);
  }

  const allGroups = rows.flatMap(r => r.groups);
  const lifeCritical = allGroups.filter(g => g.lifeCritical);
  const recognizedButNot = rows.flatMap(r =>
    r.groups.filter(g => g.recognized && !g.actionable)
      .map(g => `${r.id}:${g.key}${g.lifeCritical ? ' (LIFE-CRITICAL)' : ''}` +
        (g.findingId ? ` [finding missing ${g.missingActionabilityElements.join(', ')}]` : ' [no finding]')));
  const missingStandards = rows.flatMap(r =>
    r.groups.filter(g => g.standardsState === 'HAZARD_PRESENT_STANDARD_EXPECTED_BUT_MISSING')
      .map(g => `${r.id}:${g.key}`));

  return {
    label,
    apiBase: BASE,
    corpus: {
      populationBRows: POPULATION_B.length,
      requiredGroups: allGroups.length,
      lifeCriticalGroups: lifeCritical.length,
    },
    recognition: {
      satisfied: allGroups.filter(g => g.recognized).length,
      recall: allGroups.filter(g => g.recognized).length / allGroups.length,
      lifeCriticalSatisfied: lifeCritical.filter(g => g.recognized).length,
    },
    actionable: {
      satisfied: allGroups.filter(g => g.actionable).length,
      coverage: allGroups.filter(g => g.actionable).length / allGroups.length,
      lifeCriticalSatisfied: lifeCritical.filter(g => g.actionable).length,
      lifeCriticalCoverage: lifeCritical.filter(g => g.actionable).length / lifeCritical.length,
      recognizedButNotActionable: recognizedButNot,
    },
    standards: {
      applicableAndMatched: allGroups.filter(g => g.standardsState === 'HAZARD_PRESENT_STANDARD_APPLICABLE_AND_MATCHED').length,
      noStandardApplicable: allGroups.filter(g => g.standardsState === 'HAZARD_PRESENT_NO_STANDARD_APPLICABLE').length,
      expectedButMissing: allGroups.filter(g => g.standardsState === 'HAZARD_PRESENT_STANDARD_EXPECTED_BUT_MISSING').length,
      missingDetail: missingStandards,
    },
    rows,
  };
}

function pct(n: number): string { return `${(n * 100).toFixed(1)}%`; }

export function printReport(report: ActionableCoverageReport): void {
  console.log('==================================================');
  console.log(`HazLenz ACTIONABLE FINDING coverage — ${report.label}`);
  console.log(`API: ${report.apiBase}`);
  console.log('==================================================');
  console.log(`Corpus: ${report.corpus.populationBRows} rows / ${report.corpus.requiredGroups} required groups ` +
    `(${report.corpus.lifeCriticalGroups} life-critical)\n`);
  console.log(`  LEVEL1_RECOGNITION_RECALL       : ${pct(report.recognition.recall)} ` +
    `(${report.recognition.satisfied}/${report.corpus.requiredGroups})`);
  console.log(`  recognition life-critical       : ${report.recognition.lifeCriticalSatisfied}/${report.corpus.lifeCriticalGroups}`);
  console.log(`  ACTIONABLE_FINDING_COVERAGE     : ${pct(report.actionable.coverage)} ` +
    `(${report.actionable.satisfied}/${report.corpus.requiredGroups})`);
  console.log(`  LIFE_CRITICAL_ACTIONABLE_COVERAGE: ${pct(report.actionable.lifeCriticalCoverage)} ` +
    `(${report.actionable.lifeCriticalSatisfied}/${report.corpus.lifeCriticalGroups})\n`);
  if (report.actionable.recognizedButNotActionable.length) {
    console.log('-- RECOGNIZED_BUT_NOT_ACTIONABLE --');
    for (const item of report.actionable.recognizedButNotActionable) console.log(`    ${item}`);
    console.log('');
  }
  console.log('-- bounded standards check --');
  console.log(`  HAZARD_PRESENT_STANDARD_APPLICABLE_AND_MATCHED : ${report.standards.applicableAndMatched}`);
  console.log(`  HAZARD_PRESENT_NO_STANDARD_APPLICABLE          : ${report.standards.noStandardApplicable}`);
  console.log(`  HAZARD_PRESENT_STANDARD_EXPECTED_BUT_MISSING   : ${report.standards.expectedButMissing}`);
  if (report.standards.missingDetail.length) {
    console.log(`    ${report.standards.missingDetail.join(', ')}`);
  }
  console.log('\n-- per row --');
  for (const row of report.rows) {
    const missed = row.groups.filter(g => !g.actionable);
    console.log(`  [${missed.length ? 'GAP ' : ' ok '}] ${row.id} findings=[${row.findings.map(f => f.hazardKey).join(', ')}]` +
      (missed.length ? `\n          NOT ACTIONABLE=[${missed.map(g => g.key).join(' ; ')}]` : ''));
  }
  console.log('==================================================\n');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const label = (args.find(a => a.startsWith('--label=')) || '--label=unlabelled').split('=')[1];
  const outArg = args.find(a => a.startsWith('--out='));
  measure(label)
    .then(report => {
      printReport(report);
      if (outArg) {
        const outPath = path.resolve(outArg.split('=').slice(1).join('='));
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
        console.log(`Wrote ${outPath}`);
      }
      process.exit(0);
    })
    .catch(error => { console.error(error); process.exit(2); });
}
