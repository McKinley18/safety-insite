/**
 * KG-3F -- a single-database probe of the REAL retrieval path.
 *
 * Runs `ApplicableStandardsService.suggest()` -- the actual customer-facing corpus retrieval, not a
 * reimplementation -- over a fixed query set and emits the ordered result for each query as JSON.
 *
 * It deliberately does ONE database per process, because `dataSource` is a module-level singleton
 * built from `DATABASE_URL` at import time. The determinism harness invokes this once per physical
 * layout and diffs the outputs, which also guarantees the layouts cannot contaminate each other
 * through a shared connection pool or query cache.
 *
 * Usage: DATABASE_URL=... npx ts-node scripts/probe-kg3f-retrieval.ts [--out FILE]
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import { dataSource } from '../src/database/data-source';
import { ApplicableStandardsService } from '../src/applicable-standards/applicable-standards.service';
import { Standard } from '../src/standards/entities/standard.entity';

/**
 * The query set. Covers every hazard family the KG-3F brief names, plus the cases that specifically
 * exercise parent/paragraph competition -- which is where the KG-3E nondeterminism lived.
 *
 * `PARENT_CHILD` cases are crafted to match BOTH a section record and one of its own paragraph
 * records on shared keywords, so that the dedup step has a genuine choice to make.
 */
export const PROBE_QUERIES: Array<{ id: string; family: string; description: string; source?: string }> = [
  // --- parent/child competition (the KG-3E reproduction) -----------------------------------------
  { id: 'PC-01', family: 'electrical (parent/child)', source: 'OSHA_GENERAL_INDUSTRY',
    description: 'Damaged conductor on electrical equipment with arc flash and electrocution exposure during electrical maintenance.' },
  { id: 'PC-02', family: 'electrical (parent/child)', source: 'OSHA_GENERAL_INDUSTRY',
    description: 'Electrical equipment shows deteriorated insulation and a conductor is exposed; electric shock risk in general industry.' },
  { id: 'PC-03', family: 'electrical (parent/child)', source: 'OSHA_GENERAL_INDUSTRY',
    description: 'Electrical panel cover missing, energized conductors exposed next to a walkway.' },

  // --- the families the brief requires ------------------------------------------------------------
  { id: 'EL-01', family: 'electrical', source: 'OSHA_CONSTRUCTION',
    description: 'Worker running conduit next to an energized overhead power circuit with no guarding.' },
  { id: 'MG-01', family: 'machine guarding', source: 'OSHA_GENERAL_INDUSTRY',
    description: 'Rotating shaft on the mixer has no guard and the operator works beside it.' },
  { id: 'MG-02', family: 'machine guarding (mining)', source: 'MSHA_MNM_SURFACE',
    description: 'Conveyor tail pulley guard removed and the walkway runs right beside it.' },
  { id: 'FP-01', family: 'fall protection', source: 'OSHA_CONSTRUCTION',
    description: 'Employee working at 12 feet on an unprotected leading edge with no guardrail or fall arrest.' },
  { id: 'FP-02', family: 'fall protection (scaffold)', source: 'OSHA_CONSTRUCTION',
    description: 'A mason is working on a scaffold platform 18 feet above the lower level with an open side and no guardrail.' },
  { id: 'FP-03', family: 'walking-working surfaces', source: 'OSHA_GENERAL_INDUSTRY',
    description: 'The handrail on the interior stairway is missing, exposing employees descending the stairs to a fall hazard.' },
  { id: 'LO-01', family: 'hazardous energy', source: 'OSHA_GENERAL_INDUSTRY',
    description: 'Maintenance worker was clearing a jam inside the press with the machine still energized and no lockout applied.' },
  { id: 'LO-02', family: 'hazardous energy (mining)', source: 'MSHA_MNM_SURFACE',
    description: 'Mechanic began work on electrically powered equipment at the mine without deenergizing or locking out the power switch.' },
  { id: 'EG-01', family: 'emergency egress', source: 'OSHA_GENERAL_INDUSTRY',
    description: 'Exit door in the shipping area is chained shut during the shift.' },
  { id: 'EG-02', family: 'emergency egress (construction)', source: 'OSHA_CONSTRUCTION',
    description: 'Only stairwell out of the occupied floor is blocked with stacked material.' },
  { id: 'EX-01', family: 'excavation', source: 'OSHA_CONSTRUCTION',
    description: 'Laborers are working in a 6-foot trench with no protective system installed and the soil is not stable rock.' },
  { id: 'SI-01', family: 'silica / dust', source: 'OSHA_CONSTRUCTION',
    description: 'A worker is dry-cutting concrete with a masonry saw, generating a visible dust cloud, with no water suppression.' },
  { id: 'NO-01', family: 'noise', source: 'OSHA_GENERAL_INDUSTRY',
    description: "An employee's full-shift measured noise exposure is 92 dBA time-weighted average." },
  { id: 'NO-02', family: 'noise (mining)', source: 'MSHA_MNM_SURFACE',
    description: 'Miners working near the crusher all shift without hearing protection.' },
  { id: 'HC-01', family: 'hazard communication', source: 'OSHA_GENERAL_INDUSTRY',
    description: 'A workplace chemical container has no label identifying its contents or hazards.' },
  { id: 'HC-02', family: 'hazard communication (mining)', source: 'MSHA_MNM_SURFACE',
    description: 'Several chemical containers in the shop have missing or unreadable labels.' },
  { id: 'ME-01', family: 'mobile equipment (mining)', source: 'MSHA_MNM_SURFACE',
    description: 'A haul truck at the surface mine is backing without a functional backup alarm and no spotter present.' },
  { id: 'ME-02', family: 'powered industrial trucks', source: 'OSHA_GENERAL_INDUSTRY',
    description: 'A forklift with a hydraulic leak and a defective mast is still being operated in the warehouse.' },
];

async function main() {
  const target = new URL(process.env.DATABASE_URL || 'postgresql://localhost/UNSET');
  const dbName = target.pathname.replace('/', '');
  if (dbName === 'safescope' || !/^test_/.test(dbName)) {
    throw new Error(`Refusing to run against database '${dbName}'.`);
  }

  await dataSource.initialize();
  const service = new ApplicableStandardsService(dataSource.getRepository(Standard) as any);

  // The physical layout as the probe found it, so a comparison can name the layout it measured.
  const layout: any[] = await dataSource.query(
    `SELECT ctid::text AS ctid, citation FROM standards_master ORDER BY ctid LIMIT 6`);

  const results: any[] = [];
  for (const q of PROBE_QUERIES) {
    const matches: any[] = await service.suggest(q.description, undefined, q.source, 5);
    results.push({
      id: q.id,
      family: q.family,
      source: q.source ?? null,
      citations: matches.map((m: any) => String(m.citation)),
      detail: matches.map((m: any) => ({
        citation: String(m.citation),
        agencyCode: m.agencyCode ?? null,
        scopeCode: m.scopeCode ?? null,
        candidateStatus: m.candidateStatus ?? null,
      })),
    });
  }

  const out = {
    database: dbName,
    physicalHead: layout.map(r => `${r.ctid} ${r.citation}`),
    queryCount: PROBE_QUERIES.length,
    results,
  };

  const dest = process.argv.includes('--out')
    ? process.argv[process.argv.indexOf('--out') + 1] : undefined;
  if (dest) writeFileSync(dest, JSON.stringify(out, null, 2));
  else console.log(JSON.stringify(out));

  await dataSource.destroy();
}

main().catch(async err => {
  console.error(err);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exit(1);
});
