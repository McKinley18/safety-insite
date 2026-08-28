// Whole-Level-1 recall measurement over the FROZEN 56-row decomposition corpus.
//
// Phase 2 of "Deterministic Level-1 Recall Closure Before Expert HazLenz".
//
// The precision phase measured the DECOMPOSITION LAYER IN ISOLATION and recorded
// 11 required hazard groups (7 life-critical) missed on Population B. This
// scorer answers a different, larger question: does the COMPLETE deterministic
// Level-1 authority — the same `SafescopeV2Service.classify()` the product
// calls — ultimately represent those hazards through the classifier, the
// intelligence orchestrator, and the standards layer, or are they genuinely
// absent from the customer-authoritative safety floor?
//
//   npx ts-node src/safescope-v2/tests/hazlenz-level1-recall-scorer.ts \
//       --label=level1-baseline --out=<path>.json [--dump=<path>.json]
//
// It NEVER edits the corpus and never rewrites an expectation from output.
// Exit code is 0 whenever measurement completed; adjudication belongs to the
// gate, not to the measurement.
//
// ---------------------------------------------------------------------------
// PREDECLARED SCORING SURFACE
// ---------------------------------------------------------------------------
// Authored from the product's own data flow before any Level-1 output for these
// rows was inspected:
//
//   FINDINGS surface  — `multiHazardDecomposition.hazards[]`. This is the only
//     surface `InspectionService.reconcileDecompositionFindings()` materialises
//     into customer `inspection_findings` rows, so it is the strongest form of
//     "the product surfaced this hazard".
//   PRIMARY surface   — `family` / `classification` / `hazardCategory` /
//     `multiHazardDecomposition.primaryHazard`. The analysis header the
//     inspector reads; a hazard named here is surfaced to the customer.
//   ADDITIONAL surface — `additionalHazards[]`. Derived in classify from
//     decomposition, but read separately so a divergence would be visible.
//
//   STANDARDS surface — citations in `primaryStandards` / `suggestedStandards`
//     / `supportingStandards`, mapped to families by regulatory subject matter.
//     RECORDED BUT NOT COUNTED as representation. A citation is an answer to
//     "which rule governs the hazard the engine already named"; treating it as
//     proof that the hazard itself was surfaced would inflate recall, because a
//     citation can arrive as a broad candidate without any hazard being stated.
//     It is reported so a reviewer can see partial recognition.
//
// LEVEL1_REPRESENTED := FINDINGS ∪ PRIMARY ∪ ADDITIONAL.
// ---------------------------------------------------------------------------

import 'dotenv/config';
import 'reflect-metadata';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { Standard } from '../../standards/entities/standard.entity';
import { ApplicableStandardsService } from '../../applicable-standards/applicable-standards.service';
import { ActionEngineService } from '../../action-engine/action-engine.service';
import { HazardFixService } from '../../intelligence/hazard-fix.service';
import { FixFeedbackService } from '../../intelligence/fix-feedback.service';
import { EvidenceFusionService } from '../evidence/evidence-fusion.service';
import { SafeScopeIntelligenceOrchestrator } from '../orchestration/intelligence-orchestrator.service';
import { VisualEvidenceReasoningService } from '../visual-evidence-reasoning/visual-evidence-reasoning.service';
import { RealImageAnalysisService } from '../real-image-analysis/real-image-analysis.service';
import { OfflineReasoningMobileResilienceService } from '../offline-reasoning-mobile-resilience/offline-reasoning-mobile-resilience.service';
import { WorkspaceGovernanceAccessService } from '../workspace-governance-access/workspace-governance-access.service';
import { HazLenzKnowledgeRouterService } from '../knowledge-router/hazlenz-knowledge-router.service';
import { HazLenzKnowledgeShardService } from '../knowledge-shards/hazlenz-knowledge-shard.service';
import { HazLenzKnowledgeIndexService } from '../knowledge-index/hazlenz-knowledge-index.service';
import { SafescopeV2Service } from '../safescope-v2.service';
import { normalizeHazardObservationText } from '../display/hazlenz-evidence-boundary';
import { POPULATION_A, POPULATION_B } from './hazlenz-decomposition-precision-corpus';

// ---------------------------------------------------------------------------
// Vocabulary adjudication
// ---------------------------------------------------------------------------
// The corpus is written in the taxonomy-coverage vocabulary. The classifier and
// the response header use their own profile ids and human labels. Both sides of
// every comparison are mapped through ONE table, exactly as the decomposition
// precision scorer does, so this widens nothing asymmetrically. Only
// unambiguous synonyms are merged; genuinely distinct families are not.
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
};

// Classifier profile ids / labels / response `family` strings expressed in the
// corpus vocabulary. Each entry is a synonym, not a widening: e.g. the
// classifier's `loto_stored_energy` profile IS the corpus's `lockout_tagout`
// family, and its `trenching_shoring` profile IS `excavation_trenching`.
const ENGINE_LABEL_TO_DOMAIN: Record<string, string> = {
  // classifier profile ids
  loto_stored_energy: 'lockout_tagout',
  trenching_shoring: 'excavation_trenching',
  falls: 'fall_protection',
  mobile_equipment: 'mobile_equipment',
  respirable_dust_silica: 'silica_respirable_dust',
  compressed_gas_cylinders: 'compressed_gas',
  compressed_air_hose_safety: 'hydraulic_pneumatic_energy',
  welding_cutting_hot_work: 'hot_work',
  lifting_rigging: 'cranes_rigging_hoisting',
  chemical_storage: 'hazard_communication',
  first_aid_eyewash_safety_shower_access: 'emergency_equipment',
  ground_control: 'ground_control',
  drowning_hazards: 'drowning_hazards',
  // response `family` strings (taxonomy family column)
  loto: 'lockout_tagout',
  machine: 'machine_guarding',
  fall: 'fall_protection',
  housekeeping: 'slips_trips_falls_housekeeping',
  'powered mobile equipment': 'mobile_equipment',
  fire: 'fire_explosion',
  'industrial hygiene': 'industrial_hygiene',
  'emergency preparedness': 'emergency_egress',
  'trenching & shoring': 'excavation_trenching',
  'lifting & rigging': 'cranes_rigging_hoisting',
  'material handling': 'material_handling_storage',
  'compressed gas cylinders': 'compressed_gas',
  'compressed air / hose safety': 'hydraulic_pneumatic_energy',
  'chemical storage': 'hazard_communication',
  'welding / cutting / hot work': 'hot_work',
  'first aid / eyewash / safety shower access': 'emergency_equipment',
  'personal protective equipment': 'personal_protective_equipment',
  'hazard communication': 'hazard_communication',
  'confined space': 'confined_space',
  electrical: 'electrical',
  // human labels
  'lockout / stored energy': 'lockout_tagout',
  'machine guarding': 'machine_guarding',
  'fall protection': 'fall_protection',
  'walking/working surfaces': 'walking_working_surfaces',
  'mobile equipment / traffic': 'mobile_equipment',
  'fire / explosion': 'fire_explosion',
  'respirable dust / silica': 'silica_respirable_dust',
  'noise exposure': 'noise_exposure',
  'emergency egress': 'emergency_egress',
  'ground control / highwall / roof fall': 'ground_control',
};

function slug(value: string): string {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function canon(value: string): string {
  const raw = String(value || '').toLowerCase().trim();
  if (!raw) return '';
  const mappedLabel = ENGINE_LABEL_TO_DOMAIN[raw];
  const s = mappedLabel ? mappedLabel : slug(raw);
  const mappedSlug = ENGINE_LABEL_TO_DOMAIN[s] || s;
  return DOMAIN_ALIASES[mappedSlug] || mappedSlug;
}

function canonSet(values: (string | undefined | null)[]): string[] {
  return Array.from(
    new Set(
      values
        .map(v => canon(String(v || '')))
        .filter(v => v && v !== 'unknown' && v !== 'unclassified' && v !== 'safety_observation'),
    ),
  ).sort();
}

// ---------------------------------------------------------------------------
// Citation -> family, by regulatory subject matter. Recorded, never counted.
// ---------------------------------------------------------------------------
const CITATION_FAMILY_RULES: Array<{ pattern: RegExp; domain: string }> = [
  // Section numbers are matched with a right boundary that forbids a further
  // digit, so 1910.105 cannot swallow 1910.1053 (respirable silica) and 1910.13
  // cannot swallow 1910.132.
  { pattern: /\b19(?:10\.147|26\.417)(?!\d)|\b(?:56|57)\.1(?:2016|4105)(?!\d)/i, domain: 'lockout_tagout' },
  { pattern: /\b1910\.3(?:0[3-9]|1[0-9]|3[0-9])(?!\d)|\b1926\.4(?:0[0-9]|1[0-6])(?!\d)|\b(?:56|57)\.12\d{3}(?!\d)/i, domain: 'electrical' },
  { pattern: /\b1910\.21[1-9](?!\d)|\b1926\.30[0-7](?!\d)|\b(?:56|57)\.141\d{2}(?!\d)/i, domain: 'machine_guarding' },
  { pattern: /\b1926\.65[0-2](?!\d)|\b(?:56|57)\.3130(?!\d)/i, domain: 'excavation_trenching' },
  { pattern: /\b1910\.2[3-9](?!\d)|\b1926\.(?:50[0-3]|105)(?!\d)|\b(?:56|57)\.1(?:1001|5005)(?!\d)/i, domain: 'fall_protection' },
  { pattern: /\b1910\.22(?!\d)|\b1926\.25(?!\d)/i, domain: 'walking_working_surfaces' },
  { pattern: /\b1910\.25[1-5](?!\d)|\b1926\.35[0-4](?!\d)|\b(?:56|57)\.4\d{3}(?!\d)/i, domain: 'hot_work' },
  { pattern: /\b1910\.10[1-6](?!\d)|\b1926\.35[0-3](?!\d)/i, domain: 'compressed_gas' },
  { pattern: /\b1910\.146(?!\d)|\b1926\.120[0-9](?!\d)/i, domain: 'confined_space' },
  { pattern: /\b1910\.1200(?!\d)|\b1926\.59(?!\d)/i, domain: 'hazard_communication' },
  { pattern: /\b1910\.13[2-8](?!\d)|\b1926\.(?:9[5-9]|10[0-3])(?!\d)|\b(?:56|57)\.1500[0-9](?!\d)/i, domain: 'personal_protective_equipment' },
  { pattern: /\b1910\.17[8-9](?!\d)|\b1926\.60[0-2](?!\d)|\b(?:56|57)\.9\d{3}(?!\d)/i, domain: 'mobile_equipment' },
  { pattern: /\b1910\.18[0-4](?!\d)|\b1926\.(?:125[0-1]|55[0-4])(?!\d)|\b(?:56|57)\.140\d{2}(?!\d)/i, domain: 'cranes_rigging_hoisting' },
  { pattern: /\b1910\.1053(?!\d)|\b1926\.1153(?!\d)/i, domain: 'silica_respirable_dust' },
  { pattern: /\b1910\.134(?!\d)|\b1926\.103(?!\d)/i, domain: 'respiratory_protection' },
  { pattern: /\b1910\.15[6-9](?!\d)|\b1926\.15[0-5](?!\d)/i, domain: 'fire_explosion' },
  { pattern: /\b1910\.3[6-7](?!\d)|\b1926\.34(?!\d)/i, domain: 'emergency_egress' },
  { pattern: /\b1910\.176(?!\d)|\b1926\.250(?!\d)/i, domain: 'material_handling_storage' },
  { pattern: /\b1910\.9[45](?!\d)|\b1926\.52(?!\d)/i, domain: 'noise_exposure' },
];

function citationDomains(citations: string[]): string[] {
  const found = new Set<string>();
  for (const citation of citations) {
    for (const rule of CITATION_FAMILY_RULES) {
      if (rule.pattern.test(citation)) found.add(canon(rule.domain));
    }
  }
  return Array.from(found).sort();
}

// ---------------------------------------------------------------------------
// Surface extraction
// ---------------------------------------------------------------------------
export interface Level1Surfaces {
  findings: string[];
  primary: string[];
  additional: string[];
  represented: string[];
  citationDomains: string[];
  citations: string[];
  rawFindingLabels: string[];
  rawPrimaryLabels: string[];
  rawAdditionalLabels: string[];
  conditionStates: string[];
  isVague: boolean;
  clarificationCount: number;
  riskScore: number | null;
}

function collectCitations(response: any): string[] {
  const out = new Set<string>();
  const take = (items: any) => {
    for (const item of Array.isArray(items) ? items : []) {
      const citation = typeof item === 'string' ? item : String(item?.citation || '');
      if (citation.trim()) out.add(citation.trim());
    }
  };
  take(response?.primaryStandards);
  take(response?.suggestedStandards);
  take(response?.supportingStandards);
  take(response?.standards);
  if (response?.primaryCitation) out.add(String(response.primaryCitation));
  return Array.from(out).sort();
}

export function extractSurfaces(response: any): Level1Surfaces {
  const decompositionHazards = Array.isArray(response?.multiHazardDecomposition?.hazards)
    ? response.multiHazardDecomposition.hazards
    : [];
  const additionalHazards = Array.isArray(response?.additionalHazards) ? response.additionalHazards : [];

  const rawFindingLabels = decompositionHazards.flatMap((hazard: any) =>
    [hazard?.domainId, hazard?.hazardFamily].filter(Boolean).map(String),
  );
  const rawPrimaryLabels = [
    response?.family,
    response?.classification,
    response?.hazardCategory,
    response?.multiHazardDecomposition?.primaryHazard?.domainId,
    response?.multiHazardDecomposition?.primaryHazard?.hazardFamily,
  ]
    .filter(Boolean)
    .map(String);
  const rawAdditionalLabels = additionalHazards.flatMap((hazard: any) =>
    [hazard?.family, hazard?.classification, hazard?.hazardCategory].filter(Boolean).map(String),
  );

  const findings = canonSet(rawFindingLabels);
  const primary = canonSet(rawPrimaryLabels);
  const additional = canonSet(rawAdditionalLabels);
  const citations = collectCitations(response);

  return {
    findings,
    primary,
    additional,
    represented: Array.from(new Set([...findings, ...primary, ...additional])).sort(),
    citationDomains: citationDomains(citations),
    citations,
    rawFindingLabels,
    rawPrimaryLabels,
    rawAdditionalLabels,
    conditionStates: Array.from(
      new Set(
        decompositionHazards
          .map((hazard: any) => String(hazard?.conditionState || '').toUpperCase())
          .filter(Boolean),
      ),
    ) as string[],
    isVague: Boolean(response?.isVague),
    clarificationCount: Array.isArray(response?.evidenceGapQuestions)
      ? response.evidenceGapQuestions.length
      : 0,
    riskScore:
      typeof response?.risk?.riskScore === 'number'
        ? response.risk.riskScore
        : typeof response?.risk?.operationalRisk?.riskScore === 'number'
          ? response.risk.operationalRisk.riskScore
          : null,
  };
}

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------
async function makeService() {
  const databaseUrl = process.env.DATABASE_URL;
  const ds = new DataSource({
    type: 'postgres',
    url: databaseUrl || undefined,
    host: databaseUrl ? undefined : process.env.DB_HOST || 'localhost',
    port: databaseUrl ? undefined : Number(process.env.DB_PORT || 5432),
    username: databaseUrl ? undefined : process.env.DB_USERNAME || process.env.DB_USER || 'user',
    password: databaseUrl ? undefined : process.env.DB_PASSWORD || process.env.DB_PASS || 'password',
    database: databaseUrl ? undefined : process.env.DB_DATABASE || process.env.DB_NAME || 'safescope',
    entities: [Standard],
    // Read-only measurement. No schema mutation, no seed, no migration.
    synchronize: false,
  });
  await ds.initialize();

  const mockFixFeedbackRepo = {
    create: (x: any) => x,
    save: async (x: any) => x,
    find: async () => [],
  } as any;

  const service = new SafescopeV2Service(
    new ActionEngineService(new HazardFixService(), new FixFeedbackService(mockFixFeedbackRepo)),
    new EvidenceFusionService(),
    new ApplicableStandardsService(ds.getRepository(Standard)),
    new SafeScopeIntelligenceOrchestrator(),
    new VisualEvidenceReasoningService(),
    new RealImageAnalysisService(),
    new OfflineReasoningMobileResilienceService(),
    new WorkspaceGovernanceAccessService(),
    new HazLenzKnowledgeRouterService(new HazLenzKnowledgeIndexService()),
    new HazLenzKnowledgeShardService(),
  );

  return { service, ds };
}

interface BLevelRow {
  id: string;
  category: string;
  surfaces: Level1Surfaces;
  satisfiedGroups: string[];
  missedGroups: string[];
  missedLifeCriticalGroups: string[];
  citationOnlyGroups: string[];
  fullRecall: boolean;
}

interface ALevelRow {
  id: string;
  category: string;
  surfaces: Level1Surfaces;
  missingRequired: string[];
}

export interface Level1RecallReport {
  label: string;
  corpus: {
    populationASize: number;
    populationBSize: number;
    populationBRequiredGroups: number;
    populationBLifeCriticalGroups: number;
  };
  populationB: {
    requiredGroupsSatisfied: number;
    requiredGroupRecall: number;
    missedGroupCount: number;
    lifeCriticalSatisfied: number;
    lifeCriticalOmissionCount: number;
    caseLevelFullRecall: number;
    citationOnlyGroupCount: number;
    rows: BLevelRow[];
  };
  populationA: {
    requiredOmissionCount: number;
    rows: ALevelRow[];
  };
}

function scoreGroups(row: (typeof POPULATION_B)[number], surfaces: Level1Surfaces) {
  // Same distinct-emission rule as the decomposition scorer: one represented
  // family satisfies at most one required group, most-constrained group first.
  const order = row.required
    .map((group, index) => ({ group, index }))
    .sort((a, b) => a.group.domains.length - b.group.domains.length);
  const consumed = new Set<string>();
  const satisfiedByIndex = new Array<boolean>(row.required.length).fill(false);
  for (const { group, index } of order) {
    const hit = canonSet(group.domains).find(d => surfaces.represented.includes(d) && !consumed.has(d));
    if (hit) {
      consumed.add(hit);
      satisfiedByIndex[index] = true;
    }
  }

  const satisfiedGroups: string[] = [];
  const missedGroups: string[] = [];
  const missedLifeCriticalGroups: string[] = [];
  const citationOnlyGroups: string[] = [];
  row.required.forEach((group, index) => {
    const key = group.domains.join('|');
    if (satisfiedByIndex[index]) {
      satisfiedGroups.push(key);
      return;
    }
    missedGroups.push(key);
    if (group.lifeCritical) missedLifeCriticalGroups.push(key);
    if (canonSet(group.domains).some(d => surfaces.citationDomains.includes(d))) {
      citationOnlyGroups.push(key);
    }
  });
  return { satisfiedGroups, missedGroups, missedLifeCriticalGroups, citationOnlyGroups };
}

export async function measure(label: string, dumpPath?: string): Promise<Level1RecallReport> {
  const { service, ds } = await makeService();
  const dump: any[] = [];

  try {
    const bRows: BLevelRow[] = [];
    for (const row of POPULATION_B) {
      const response = await service.classify(normalizeHazardObservationText(row.observation));
      const surfaces = extractSurfaces(response);
      const scored = scoreGroups(row, surfaces);
      bRows.push({
        id: row.id,
        category: row.category,
        surfaces,
        ...scored,
        fullRecall: scored.missedGroups.length === 0,
      });
      if (dumpPath) dump.push({ id: row.id, population: 'B', response });
      process.stderr.write(`  scored ${row.id}\n`);
    }

    const aRows: ALevelRow[] = [];
    for (const row of POPULATION_A) {
      const response = await service.classify(normalizeHazardObservationText(row.observation));
      const surfaces = extractSurfaces(response);
      aRows.push({
        id: row.id,
        category: row.category,
        surfaces,
        missingRequired: canonSet(row.requiredDomains).filter(d => !surfaces.represented.includes(d)),
      });
      if (dumpPath) dump.push({ id: row.id, population: 'A', response });
      process.stderr.write(`  scored ${row.id}\n`);
    }

    if (dumpPath) {
      fs.mkdirSync(path.dirname(path.resolve(dumpPath)), { recursive: true });
      fs.writeFileSync(path.resolve(dumpPath), JSON.stringify(dump, null, 2));
    }

    const totalGroups = POPULATION_B.reduce((n, r) => n + r.required.length, 0);
    const lifeCriticalGroups = POPULATION_B.reduce(
      (n, r) => n + r.required.filter(g => g.lifeCritical).length,
      0,
    );
    const satisfied = bRows.reduce((n, r) => n + r.satisfiedGroups.length, 0);
    const missed = bRows.reduce((n, r) => n + r.missedGroups.length, 0);
    const lifeCriticalMissed = bRows.reduce((n, r) => n + r.missedLifeCriticalGroups.length, 0);

    return {
      label,
      corpus: {
        populationASize: POPULATION_A.length,
        populationBSize: POPULATION_B.length,
        populationBRequiredGroups: totalGroups,
        populationBLifeCriticalGroups: lifeCriticalGroups,
      },
      populationB: {
        requiredGroupsSatisfied: satisfied,
        requiredGroupRecall: satisfied / totalGroups,
        missedGroupCount: missed,
        lifeCriticalSatisfied: lifeCriticalGroups - lifeCriticalMissed,
        lifeCriticalOmissionCount: lifeCriticalMissed,
        caseLevelFullRecall: bRows.filter(r => r.fullRecall).length / POPULATION_B.length,
        citationOnlyGroupCount: bRows.reduce((n, r) => n + r.citationOnlyGroups.length, 0),
        rows: bRows,
      },
      populationA: {
        requiredOmissionCount: aRows.reduce((n, r) => n + r.missingRequired.length, 0),
        rows: aRows,
      },
    };
  } finally {
    await ds.destroy();
  }
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function printReport(report: Level1RecallReport): void {
  console.log('==================================================');
  console.log(`HazLenz WHOLE-LEVEL-1 recall — ${report.label}`);
  console.log('==================================================');
  console.log(
    `Corpus: Population B = ${report.corpus.populationBSize} rows / ` +
      `${report.corpus.populationBRequiredGroups} required groups ` +
      `(${report.corpus.populationBLifeCriticalGroups} life-critical)\n`,
  );
  console.log(
    `  required-group recall (Level-1) : ${pct(report.populationB.requiredGroupRecall)} ` +
      `(${report.populationB.requiredGroupsSatisfied}/${report.corpus.populationBRequiredGroups})`,
  );
  console.log(
    `  life-critical recall            : ${report.populationB.lifeCriticalSatisfied}/` +
      `${report.corpus.populationBLifeCriticalGroups} ` +
      `(omissions: ${report.populationB.lifeCriticalOmissionCount})`,
  );
  console.log(`  case-level full recall          : ${pct(report.populationB.caseLevelFullRecall)}`);
  console.log(
    `  missed groups with a citation-only signal: ${report.populationB.citationOnlyGroupCount}`,
  );
  console.log(`  Population A required omissions  : ${report.populationA.requiredOmissionCount}\n`);

  for (const row of report.populationB.rows) {
    const flag = row.missedGroups.length ? 'MISS' : ' ok ';
    console.log(
      `  [${flag}] ${row.id} represented=[${row.surfaces.represented.join(', ')}]` +
        (row.missedGroups.length ? `\n          MISSED=[${row.missedGroups.join(' ; ')}]` : '') +
        (row.missedLifeCriticalGroups.length ? ' (LIFE-CRITICAL)' : '') +
        (row.citationOnlyGroups.length
          ? `\n          citation-only signal for=[${row.citationOnlyGroups.join(' ; ')}]`
          : ''),
    );
  }
  console.log('\n-- Population A required-hazard omissions --');
  for (const row of report.populationA.rows) {
    if (row.missingRequired.length) {
      console.log(
        `  [${row.id}] represented=[${row.surfaces.represented.join(', ')}] MISSING=[${row.missingRequired.join(', ')}]`,
      );
    }
  }
  console.log('==================================================\n');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const label = (args.find(a => a.startsWith('--label=')) || '--label=unlabelled').split('=')[1];
  const outArg = args.find(a => a.startsWith('--out='));
  const dumpArg = args.find(a => a.startsWith('--dump='));
  measure(label, dumpArg ? dumpArg.split('=').slice(1).join('=') : undefined)
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
    .catch(error => {
      console.error(error);
      process.exit(2);
    });
}
