/*
 * L3 RUN-2 ACCEPTANCE HOLDOUT BUILDER.
 * Governed by ../HOLDOUT_FREEZE.txt @ 67e6b47c7c13b217236220284894d8b44aac1d4769c8e4fa37323d993b8937bb,
 * which was written BEFORE this file existed and is not modified by it.
 *
 * MECHANICAL, WITH NO SEMANTIC JUDGMENT. It reads bytes, sorts by a total comparator, takes a
 * derived offset, assigns truth metadata by table lookup from frozen fields, and THROWS on any
 * drift, collision or cardinality surprise. It cannot rank, prefer, skip, replace, substitute,
 * re-order on semantics, normalize a carrier, or adapt any rule to what it observes.
 *
 * IT PRINTS COUNTS, HASHES AND BOOLEANS ONLY. IT PRINTS NO OBSERVATION TEXT.
 * IT PERFORMS NO INFERENCE AND CONTACTS NO PROVIDER. There is no network primitive in this file.
 */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..', '..', '..');
const P = (rel) => path.join(ROOT, rel);
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const shaFile = (rel) => sha(fs.readFileSync(P(rel)));

// ---- Amendment 1 shared primitives, transcribed ------------------------------------------------
const NORM = (s) => String(s).normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();
const CMP = (a, b) => Buffer.compare(Buffer.from(String(a), 'utf8'), Buffer.from(String(b), 'utf8'));
const OFFSET = (digest, m) => parseInt(digest.slice(-8), 16) % m;

const CONSTRUCTION_VERSION = 'L3-ACCEPTANCE-HOLDOUT-RUN-2';
const FREEZE_SHA = '67e6b47c7c13b217236220284894d8b44aac1d4769c8e4fa37323d993b8937bb';
const PLAN_PATH = 'verification/hazlenz-l3-2g-state-separation-2026-08-23/evidence-plan/INDEPENDENT_EVIDENCE_PLAN.md';
const PLAN_SHA = 'a7da57e4ebc330809a9fc08728c73af667c815c76eda50b1b87a0ac4564ed35a';
const SELF_PACKAGE = 'verification/hazlenz-l3-run2-acceptance-holdout-2026-08-25';
const RUN1_HOLDOUT = 'verification/hazlenz-l3-acceptance-holdout-attempt2-2026-08-24/holdout/holdout-l3-acceptance-attempt2.json';
const RUN1_HOLDOUT_SHA = '69665e41d975f67515bf9864e221a4b05c0811e4c48089e4671c8a2ae1cc094c';

const SOURCES = {
  gauntlet: { path: 'safescope-data/gauntlets/safescope-gauntlet.source.v1.json',
    sha: 'a95e54809c41b3eb88ea35de133c5576e63c921944ca4724597852f922f0adb4',
    rows: 150, key: 'scenarioId', carrier: 'observation', m: 4, run2Offset: 1 },
  realism: { path: 'safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json',
    sha: '6f6897f11aa3b174b2863fad4edc895625e0a3d27e1318dbd2371dcd5231a9cb',
    rows: 117, key: 'id', carrier: 'hazardObservation', m: 4, run2Offset: 0 },
  seed: { path: 'safescope-data/gauntlets/safescope-gauntlet.seed.json',
    sha: '49aa40fdcc507d549f22b59c9791823c3f1196034543df1746c8eb5d857b73fe',
    rows: 100, key: 'scenarioId', carrier: 'observation', m: 4, run2Offset: null },
};

/**
 * Transcribed verbatim from the Run-1 builder (56b73f85-era build-holdout.js). It REQUIRES an
 * array: a key holding a scalar -- e.g. a score file whose `scenarios` is a COUNT -- must never be
 * mistaken for a corpus. Falls back to the first array-valued property so no genuine surface is
 * silently dropped.
 */
const rowsOf = (d) => {
  if (Array.isArray(d)) return d;
  if (d == null || typeof d !== 'object') return [];
  for (const k of ['scenarios', 'rows', 'items', 'data', 'entries']) {
    if (Array.isArray(d[k])) return d[k];
  }
  const arr = Object.values(d).find((v) => Array.isArray(v));
  return Array.isArray(arr) ? arr : [];
};

/** S-5 drift guard: sha256 AND physical row count must equal the frozen values, or THROW. */
function loadFrozen(s) {
  const digest = shaFile(s.path);
  if (digest !== s.sha) throw new Error(`S-5: ${s.path} sha256 drift (${digest}). THROW.`);
  const parsed = JSON.parse(fs.readFileSync(P(s.path), 'utf8'));
  const rows = rowsOf(parsed);
  if (rows.length !== s.rows) throw new Error(`S-5: ${s.path} row count ${rows.length} != ${s.rows}. THROW.`);
  return { digest, rows };
}

/** D-A / D-B reservation: CMP over the sort key, 0-based index, i % m === k. */
function reserve(s, loaded) {
  const keys = loaded.rows.map((r) => r[s.key]);
  if (!keys.every((k) => typeof k === 'string' && k.length)) throw new Error(`S-2: ${s.path} missing sort key. THROW.`);
  if (new Set(keys).size !== keys.length) throw new Error(`S-2: ${s.path} sort keys not pairwise distinct. THROW.`);
  const sorted = loaded.rows.slice().sort((a, b) => CMP(a[s.key], b[s.key]));
  const sizes = [0, 1, 2, 3].map((k) => sorted.filter((_, i) => i % s.m === k).length);
  const k0 = OFFSET(loaded.digest, s.m);
  const k = s.run2Offset;
  const selected = sorted.filter((_, i) => i % s.m === k);
  return { sorted, sizes, k0, k, selected };
}

function build() {
  if (shaFile(PLAN_PATH) !== PLAN_SHA) throw new Error('S-5: governing plan drift. THROW.');
  if (shaFile('verification/hazlenz-l3-run2-acceptance-holdout-2026-08-25/HOLDOUT_FREEZE.txt') !== FREEZE_SHA) {
    throw new Error('RUN-2 FREEZE DRIFT -- the freeze was modified after it was written. THROW.');
  }
  if (shaFile(RUN1_HOLDOUT) !== RUN1_HOLDOUT_SHA) throw new Error('RUN-1 holdout drift. THROW.');

  const G = loadFrozen(SOURCES.gauntlet);
  const R = loadFrozen(SOURCES.realism);
  const S = loadFrozen(SOURCES.seed);          // hash-verified and used ONLY as an overlap surface

  const gRes = reserve(SOURCES.gauntlet, G);
  const rRes = reserve(SOURCES.realism, R);

  // The run-2 offsets must equal the frozen cyclic derivation, or the builder refuses to run.
  if (gRes.k !== (gRes.k0 + 1) % 4) throw new Error(`gauntlet run-2 offset ${gRes.k} != derived ${(gRes.k0 + 1) % 4}. THROW.`);
  if (rRes.k !== (rRes.k0 + 1) % 4) throw new Error(`realism run-2 offset ${rRes.k} != derived ${(rRes.k0 + 1) % 4}. THROW.`);
  if (gRes.k === gRes.k0) throw new Error('gauntlet run-2 offset equals the RETIRED run-1 offset. THROW.');
  if (rRes.k === rRes.k0) throw new Error('realism run-2 offset equals the RETIRED run-1 offset. THROW.');
  if (gRes.selected.length !== 38) throw new Error(`gauntlet selected ${gRes.selected.length} != 38. THROW.`);
  if (rRes.selected.length !== 30) throw new Error(`realism selected ${rRes.selected.length} != 30. THROW.`);

  // ---- INDEPENDENT_GAUNTLET -------------------------------------------------------------------
  const gaunt = gRes.selected.map((r) => {
    const sev = r.severityExpectation;
    return {
      provenanceClass: 'INDEPENDENT_GAUNTLET',
      source: `${SOURCES.gauntlet.path} sha256 ${SOURCES.gauntlet.sha}`,
      sourceId: r[SOURCES.gauntlet.key],
      selectionRule: 'gauntlet.source.v1 · CMP(scenarioId) asc · i % 4 === 1',
      family: null, familyVariant: null, pole: 'INDEPENDENT_POSITIVE', regime: null,
      observation: r[SOURCES.gauntlet.carrier],       // S-4 verbatim, byte-for-byte
      expect: {
        hazardEstablished: null, conditionState: null, acceptableStates: null,
        activeProhibited: false,
        clarificationExpected: false,                  // G3-DEN.0
        highConsequence: sev === 'critical' || sev === 'high',
        inG3Denominator: false, inG4Denominator: false, inG7Pole: false,
      },
      sourceMeta: { severityExpectation: sev == null ? null : sev },
    };
  });

  // ---- INDEPENDENT_REALISM --------------------------------------------------------------------
  const realism = rRes.selected.map((r) => {
    const present = Object.prototype.hasOwnProperty.call(r, 'shouldHaveMissingEvidence');
    const val = present ? r.shouldHaveMissingEvidence : null;
    const carrier = r[SOURCES.realism.carrier];
    if (typeof carrier !== 'string' || NORM(carrier) === '') {
      throw new Error(`D-B.4: realism row ${r.id} carrier absent or empty. THROW.`);
    }
    return {
      provenanceClass: 'INDEPENDENT_REALISM',
      source: `${SOURCES.realism.path} sha256 ${SOURCES.realism.sha}`,
      sourceId: r[SOURCES.realism.key],
      selectionRule: 'field-realism-pack-v2 · CMP(id) asc · i % 4 === 0',
      family: null, familyVariant: null, pole: 'INDEPENDENT_REALISM_ROW', regime: null,
      observation: carrier,                            // S-4 verbatim, byte-for-byte
      expect: {
        hazardEstablished: null, conditionState: null, acceptableStates: null,
        activeProhibited: false,
        clarificationExpected: val === true,           // G3-DEN.0 strict identity
        highConsequence: false,                        // no severity field exists; heuristics prohibited
        inG3Denominator: val === true,
        inG4Denominator: false, inG7Pole: false,
      },
      sourceMeta: { shouldHaveMissingEvidencePresent: present, shouldHaveMissingEvidence: val },
    };
  });

  // ---- AUTHORED_CONTROL (fresh) ---------------------------------------------------------------
  const { buildAuthoredControlsRun2, FROZEN_ALLOCATION } = require('./authored-controls-run2.js');
  const rawControls = buildAuthoredControlsRun2();
  const alloc = {};
  for (const c of rawControls) alloc[c.family] = (alloc[c.family] || 0) + 1;
  for (const [f, n] of Object.entries(FROZEN_ALLOCATION)) {
    if (alloc[f] !== n) throw new Error(`D-D.3: family ${f} allocated ${alloc[f]} != frozen ${n}. THROW.`);
  }
  if (rawControls.length !== 25) throw new Error(`authored total ${rawControls.length} != 25. THROW.`);
  const controls = rawControls.slice().sort((a, b) => CMP(a.sourceId, b.sourceId)).map((c) => ({
    provenanceClass: c.provenanceClass, source: c.source, sourceId: c.sourceId,
    selectionRule: c.selectionRule, family: c.family, familyVariant: c.familyVariant,
    pole: c.pole, regime: c.regime, observation: c.text, expect: c.expect, sourceMeta: null,
  }));

  // ---- D-D.6 overlap, THROW on violation ------------------------------------------------------
  const surfaces = buildOverlapSurfaces(G, S, R);
  const run1Surface = surfaces.find((s) => s.name.includes('holdout-l3-acceptance-attempt2'));
  if (!run1Surface) throw new Error('D-D.6 surface 8: the SPENT RUN-1 HOLDOUT was not enumerated. THROW.');
  if (run1Surface.set.size !== 92) throw new Error(`D-D.6 surface 8: Run-1 surface has ${run1Surface.set.size} distinct texts, expected 92. THROW.`);

  for (const c of controls) {
    const n = NORM(c.observation);
    for (const surf of surfaces) {
      if (surf.set.has(n)) {
        throw new Error(`D-D.6: fresh authored control ${c.sourceId} collides with surface "${surf.name}". THROW.`);
      }
    }
  }

  // ---- assembly, ordering, identifiers (freeze s.10) -------------------------------------------
  const assembled = [...gaunt, ...realism, ...controls];
  const seenNorm = new Map(), seenId = new Map();
  for (const r of assembled) {
    const n = NORM(r.observation);
    if (seenNorm.has(n)) throw new Error(`D-D.6: two holdout rows share NORM(carrier) (${seenNorm.get(n)} / ${r.sourceId}). THROW.`);
    seenNorm.set(n, r.sourceId);
    if (seenId.has(r.sourceId)) throw new Error(`D-D.6: duplicate sourceId ${r.sourceId}. THROW.`);
    seenId.set(r.sourceId, true);
  }

  const rows = assembled.map((r, i) => ({
    rowId: `H2B-${String(i + 1).padStart(3, '0')}`,
    ...r,
    constructionVersion: CONSTRUCTION_VERSION,
  }));
  if (rows.length !== 93) throw new Error(`assembled ${rows.length} rows != 93. THROW.`);

  // ---- PHASE 8: |DEN_A|, discovered from frozen metadata ONLY AFTER selection (D-B.3) ----------
  const denARows = rows.filter((r) => r.expect.clarificationExpected === true);
  if (denARows.length === 0) throw new Error('G3-DEN.3: |DEN_A| = 0. A vacuous 100% is not evidence. THROW.');
  const denAAuthored = denARows.filter((r) => r.provenanceClass === 'AUTHORED_CONTROL').length;
  const denAIndependent = denARows.filter((r) => r.provenanceClass !== 'AUTHORED_CONTROL').length;

  const document = {
    holdoutId: 'holdout-l3-acceptance-run2',
    constructionVersion: CONSTRUCTION_VERSION,
    governingPlan: { path: PLAN_PATH, sha256: PLAN_SHA },
    freezeRecord: 'verification/hazlenz-l3-run2-acceptance-holdout-2026-08-25/HOLDOUT_FREEZE.txt',
    freezeSha256: FREEZE_SHA,
    reservationIdentity: { run: 2, gauntletOffset: gRes.k, realismOffset: rRes.k,
      run1RetiredGauntletOffset: gRes.k0, run1RetiredRealismOffset: rRes.k0 },
    sources: {
      gauntlet: { path: SOURCES.gauntlet.path, sha256: SOURCES.gauntlet.sha, physicalRows: SOURCES.gauntlet.rows,
        offset: gRes.k, partitionSizes: gRes.sizes, selected: gRes.selected.length,
        selectionRule: 'CMP(scenarioId) asc · i % 4 === 1' },
      realism: { path: SOURCES.realism.path, sha256: SOURCES.realism.sha, physicalRows: SOURCES.realism.rows,
        offset: rRes.k, partitionSizes: rRes.sizes, selected: rRes.selected.length,
        selectionRule: 'CMP(id) asc · i % 4 === 0' },
      seedReserve: { path: SOURCES.seed.path, sha256: SOURCES.seed.sha, physicalRows: SOURCES.seed.rows,
        drawnFrom: false, note: 'reserve tranche -- checked for overlap, NOT drawn from' },
      spentRun1: { path: RUN1_HOLDOUT, sha256: RUN1_HOLDOUT_SHA, rows: 92,
        drawnFrom: false, note: 'SPENT and RETIRED -- protected D-D.6 surface 8, NOT drawn from' },
    },
    composition: {
      INDEPENDENT_GAUNTLET: gaunt.length, INDEPENDENT_REALISM: realism.length,
      AUTHORED_CONTROL: controls.length, total: rows.length,
      independent: gaunt.length + realism.length,
    },
    denominatorA: { size: denARows.length, authoredContribution: denAAuthored,
      independentContribution: denAIndependent,
      derivation: 'D-B.3 -- discovered from frozen metadata AFTER authorized selection; it never gated selection' },
    rows,
  };
  return { document, G, S, R, gRes, rRes, surfaces };
}

// ---------------------------------------------------- D-D.6 surfaces
function buildOverlapSurfaces(G, S, R) {
  const surfaces = [];
  const add = (name, set) => surfaces.push({ name, set });
  add('1 gauntlet.source.v1 (all 150)', new Set(G.rows.map((r) => NORM(r.observation)).filter(Boolean)));
  add('2 field-realism-pack-v2 (all 117)', new Set(R.rows.map((r) => NORM(r.hazardObservation)).filter(Boolean)));
  add('3 gauntlet.seed (all 100, reserve)', new Set(S.rows.map((r) => NORM(r.observation)).filter(Boolean)));
  const textOf = (r) => [r.observation, r.hazardObservation, r.text, r.observationText]
    .find((v) => typeof v === 'string' && v.trim() !== '');
  for (const rel of priorSetPaths()) {
    const abs = P(rel);
    if (!fs.existsSync(abs)) continue;
    let parsed;
    try { parsed = JSON.parse(fs.readFileSync(abs, 'utf8')); } catch { continue; }
    const set = new Set(rowsOf(parsed).map((r) => NORM(textOf(r))).filter(Boolean));
    if (set.size) add(`${rel}`, set);
  }
  return surfaces;
}

/**
 * Surfaces 5-8: every PRIOR sealed holdout, every development set, the exhausted field corpus,
 * AND the spent Run-1 acceptance holdout. Only the artifact under construction is excluded --
 * comparing it against itself is not a surface D-D.6 names and would trivially self-collide.
 */
function priorSetPaths() {
  const out = [];
  const roots = ['safescope-data', 'verification', 'backend/data', 'backend/src'];
  const wanted = /(holdout|devset|development|field-validation-dataset)/i;
  const walk = (dir, depth) => {
    if (depth > 6) return;
    let ents;
    try { ents = fs.readdirSync(P(dir), { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      const rel = `${dir}/${e.name}`;
      if (rel.startsWith(SELF_PACKAGE)) continue;
      if (e.isDirectory()) walk(rel, depth + 1);
      else if (e.isFile() && e.name.endsWith('.json') && wanted.test(e.name)) out.push(rel);
    }
  };
  for (const r of roots) walk(r, 0);
  return out.sort();
}

module.exports = { build, buildOverlapSurfaces, priorSetPaths, NORM, CMP, OFFSET, CONSTRUCTION_VERSION };

if (require.main === module) {
  const dest = process.env.OUT;
  if (!dest) throw new Error('OUT is required');
  const { document, gRes, rRes, surfaces } = build();
  const text = JSON.stringify(document, null, 2) + '\n';
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, text, 'utf8');
  console.log('== RUN-2 BUILD OK -- counts, hashes and booleans only; no observation text printed ==');
  console.log(`  gauntlet k0 ${gRes.k0} -> run-2 offset ${gRes.k}  sizes ${JSON.stringify(gRes.sizes)}  selected ${gRes.selected.length}`);
  console.log(`  realism  k0 ${rRes.k0} -> run-2 offset ${rRes.k}  sizes ${JSON.stringify(rRes.sizes)}  selected ${rRes.selected.length}`);
  console.log(`  composition ${JSON.stringify(document.composition)}`);
  console.log(`  |DEN_A| ${document.denominatorA.size}  (authored ${document.denominatorA.authoredContribution}, independent ${document.denominatorA.independentContribution})`);
  console.log(`  overlap surfaces evaluated ${surfaces.length}   authored collisions 0`);
  console.log(`  rows ${document.rows.length}  bytes ${Buffer.byteLength(text, 'utf8')}  sha256 ${sha(Buffer.from(text, 'utf8'))}`);
  console.log(`  wrote ${dest}`);
}
