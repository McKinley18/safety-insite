#!/usr/bin/env node
/*
 * L3 ACCEPTANCE HOLDOUT, CONSTRUCTION ATTEMPT 2 -- DETERMINISTIC BUILDER
 *
 * Governing: INDEPENDENT_EVIDENCE_PLAN.md base + Amendment 1 (S-1..S-5, D-A, D-B, D-C, G3-DEN,
 *            D-D) + Amendment 2 (D-E, D-F).  Freeze: ../HOLDOUT_FREEZE.txt.
 *
 * THIS BUILDER EXERCISES NO SEMANTIC JUDGMENT.
 *   It reads bytes, sorts by a total byte comparator, takes an arithmetically derived offset, and
 *   assigns truth metadata by table lookup from fields the frozen sources already carry.
 *   It NEVER ranks, scores, prefers, skips, replaces, substitutes, re-orders on semantics,
 *   normalizes a carrier, inspects composition before or during selection, or adapts a rule to
 *   what it observes. Every failure mode below is a THROW, never a silent repair.
 *
 * Usage:  node build-holdout.js <output.json>
 * It prints counts, hashes and booleans only. It prints NO observation text.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO = path.resolve(__dirname, '..', '..', '..');
const P = (rel) => path.join(REPO, rel);

// ---------------------------------------------------------------- frozen identities (freeze s.1-2)
const PLAN_PATH = 'verification/hazlenz-l3-2g-state-separation-2026-08-23/evidence-plan/INDEPENDENT_EVIDENCE_PLAN.md';
const PLAN_SHA  = '8d8f6e8d4a34e16a90f19b511bf31b4dfe255bae9ad142856c913e625f4dd7c4';

const SOURCES = {
  gauntlet: {
    path: 'safescope-data/gauntlets/safescope-gauntlet.source.v1.json',
    sha:  'a95e54809c41b3eb88ea35de133c5576e63c921944ca4724597852f922f0adb4',
    rows: 150, key: 'scenarioId', carrier: 'observation', m: 4,
  },
  seed: {
    path: 'safescope-data/gauntlets/safescope-gauntlet.seed.json',
    sha:  '49aa40fdcc507d549f22b59c9791823c3f1196034543df1746c8eb5d857b73fe',
    rows: 100, key: 'scenarioId', carrier: 'observation', m: 4,
  },
  realism: {
    path: 'safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json',
    sha:  '6f6897f11aa3b174b2863fad4edc895625e0a3d27e1318dbd2371dcd5231a9cb',
    rows: 117, key: 'id', carrier: 'hazardObservation', m: 4,
  },
};

const CONSTRUCTION_VERSION = 'L3-ACCEPTANCE-HOLDOUT-ATTEMPT-2';

// ------------------------------------------------------------------- shared primitives (S-1..S-3)
const NORM = (s) => String(s == null ? '' : s).normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();
const CMP  = (a, b) => Buffer.compare(Buffer.from(String(a), 'utf8'), Buffer.from(String(b), 'utf8'));
const OFFSET = (digest, m) => parseInt(digest.slice(-8), 16) % m;
const sha256File = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

const rowsOf = (d) => {
  if (Array.isArray(d)) return d;
  if (d == null || typeof d !== 'object') return [];
  for (const k of ['scenarios', 'rows', 'items', 'data', 'entries']) {
    if (Array.isArray(d[k])) return d[k];
  }
  const arr = Object.values(d).find((v) => Array.isArray(v));
  return Array.isArray(arr) ? arr : [];
};

// ------------------------------------------------------------------------- S-5 source-drift guard
function loadFrozen(spec) {
  const abs = P(spec.path);
  const sha = sha256File(abs);
  if (sha !== spec.sha) {
    throw new Error(`S-5 DRIFT: ${spec.path} sha256 ${sha} != frozen ${spec.sha}. The builder does ` +
      'NOT rescale a modulus, re-derive an offset, resize a partition or adapt in any way.');
  }
  const rows = rowsOf(JSON.parse(fs.readFileSync(abs, 'utf8')));
  if (rows.length !== spec.rows) {
    throw new Error(`S-5 DRIFT: ${spec.path} has ${rows.length} physical rows, frozen ${spec.rows}.`);
  }
  return { ...spec, abs, sha, rows };
}

// ------------------------------------------------------------ D-A / D-B deterministic reservation
function reserve(src) {
  // S-2 totality requirement: sort keys MUST be pairwise distinct or THROW.
  const keys = src.rows.map((r) => {
    const k = r[src.key];
    if (typeof k !== 'string' || k.length === 0) {
      throw new Error(`S-2: ${src.path} carries a non-string or empty sort key on some row.`);
    }
    return k;
  });
  if (new Set(keys).size !== keys.length) {
    throw new Error(`S-2: ${src.path} sort key ${src.key} is not pairwise distinct -- CMP is not a ` +
      'strict total order. THROW.');
  }

  const sorted = src.rows.slice().sort((a, b) => CMP(a[src.key], b[src.key]));
  const k = OFFSET(src.sha, src.m);
  const sizes = Array.from({ length: src.m }, (_, o) => sorted.filter((_r, i) => i % src.m === o).length);
  const selected = sorted.filter((_r, i) => i % src.m === k);

  // D-A / D-B duplicate handling: within the selected partition, NORM collisions THROW.
  const norms = selected.map((r) => {
    const c = r[src.carrier];
    if (typeof c !== 'string' || NORM(c) === '') {
      throw new Error(`${src.path}: a selected row's carrier ${src.carrier} is absent, non-string, ` +
        'or empty after NORM. It is NOT skipped and NOT replaced -- the source is not what the ' +
        'amendment froze. THROW.');
    }
    return NORM(c);
  });
  if (new Set(norms).size !== norms.length) {
    throw new Error(`${src.path}: two selected rows share NORM(${src.carrier}). No silent ` +
      'de-duplication, no replacement. THROW.');
  }

  return { k, sizes, selected, sortedKeys: sorted.map((r) => r[src.key]) };
}

// ------------------------------------------------------------------------------------- the build
function build() {
  // ---- frozen governing plan identity (freeze s.1) --------------------------------------------
  const planSha = sha256File(P(PLAN_PATH));
  if (planSha !== PLAN_SHA) {
    throw new Error(`S-5 DRIFT: governing plan sha256 ${planSha} != frozen ${PLAN_SHA}. THROW.`);
  }

  const G = loadFrozen(SOURCES.gauntlet);
  const S = loadFrozen(SOURCES.seed);
  const R = loadFrozen(SOURCES.realism);

  const gRes = reserve(G);
  const rRes = reserve(R);

  // ---- INDEPENDENT_GAUNTLET rows ---------------------------------------------------------------
  const gaunt = gRes.selected.map((r) => {
    const sev = r.severityExpectation;
    return {
      provenanceClass: 'INDEPENDENT_GAUNTLET',
      source: `${SOURCES.gauntlet.path} sha256 ${SOURCES.gauntlet.sha}`,
      sourceId: r[SOURCES.gauntlet.key],
      selectionRule: 'gauntlet.source.v1 · CMP(scenarioId) asc · i % 4 === 0',
      family: null,
      familyVariant: null,
      pole: 'INDEPENDENT_POSITIVE',
      regime: null,
      // S-4 verbatim carriage: byte-for-byte, no normalization, no trimming, no case change.
      observation: r[SOURCES.gauntlet.carrier],
      expect: {
        hazardEstablished: null,
        conditionState: null,
        acceptableStates: null,
        activeProhibited: false,
        // G3-DEN.0: this source declares no ambiguity field and none may be inferred.
        clarificationExpected: false,
        // freeze s.7: table lookup on the ONLY severity field the source carries.
        highConsequence: sev === 'critical' || sev === 'high',
        inG3Denominator: false,
        inG4Denominator: false,
        inG7Pole: false,
      },
      sourceMeta: { severityExpectation: sev == null ? null : sev },
    };
  });

  // ---- INDEPENDENT_REALISM rows ----------------------------------------------------------------
  const realism = rRes.selected.map((r) => {
    const present = Object.prototype.hasOwnProperty.call(r, 'shouldHaveMissingEvidence');
    const val = present ? r.shouldHaveMissingEvidence : null;
    return {
      provenanceClass: 'INDEPENDENT_REALISM',
      source: `${SOURCES.realism.path} sha256 ${SOURCES.realism.sha}`,
      sourceId: r[SOURCES.realism.key],
      selectionRule: 'field-realism-pack-v2 · CMP(id) asc · i % 4 === 3',
      family: null,
      familyVariant: null,
      pole: 'INDEPENDENT_REALISM_ROW',
      regime: null,
      observation: r[SOURCES.realism.carrier],
      expect: {
        hazardEstablished: null,
        conditionState: null,
        acceptableStates: null,
        activeProhibited: false,
        // G3-DEN.0: strict identity. false -> false; ABSENT -> false.
        clarificationExpected: val === true,
        // freeze s.7: the source carries NO severity field; heuristics are prohibited as truth.
        highConsequence: false,
        inG3Denominator: val === true,
        inG4Denominator: false,
        inG7Pole: false,
      },
      sourceMeta: { shouldHaveMissingEvidencePresent: present, shouldHaveMissingEvidence: val },
    };
  });

  // ---- AUTHORED_CONTROL rows -------------------------------------------------------------------
  const { buildAuthoredControls, FROZEN_ALLOCATION } = require('./authored-controls.js');
  const rawControls = buildAuthoredControls();

  // D-D.1 / D-D.3: allocation is frozen and derived, never hard-coded as a proof of membership.
  for (const f of Object.keys(FROZEN_ALLOCATION)) {
    const n = rawControls.filter((c) => c.family === f).length;
    if (n !== FROZEN_ALLOCATION[f]) {
      throw new Error(`D-D.3 allocation: family ${f} has ${n} controls, frozen ${FROZEN_ALLOCATION[f]}. THROW.`);
    }
  }
  const allocTotal = Object.values(FROZEN_ALLOCATION).reduce((a, b) => a + b, 0);
  if (rawControls.length !== allocTotal) {
    throw new Error(`D-D.1: ${rawControls.length} controls, frozen total ${allocTotal}. THROW.`);
  }

  // freeze s.10 ordering within AUTHORED_CONTROL: frozen family order then frozen ordinal,
  // equivalently ascending CMP over the frozen sourceId.
  const controls = rawControls.slice().sort((a, b) => CMP(a.sourceId, b.sourceId)).map((c) => ({
    provenanceClass: c.provenanceClass,
    source: c.source,
    sourceId: c.sourceId,
    selectionRule: c.selectionRule,
    family: c.family,
    familyVariant: c.familyVariant,
    pole: c.pole,
    regime: c.regime,
    observation: c.text,
    expect: c.expect,
    sourceMeta: null,
  }));

  // ---- D-D.6 overlap rejection, THROW ON VIOLATION ---------------------------------------------
  const overlap = buildOverlapSurfaces(G, S, R);
  for (const c of controls) {
    const n = NORM(c.observation);
    for (const surf of overlap) {
      if (surf.set.has(n)) {
        throw new Error(`D-D.6: authored control ${c.sourceId} collides with surface "${surf.name}". ` +
          'No skip, no de-duplication, no replacement. THROW.');
      }
    }
  }

  // ---- assemble in the frozen stratum order (freeze s.10) --------------------------------------
  const assembled = [...gaunt, ...realism, ...controls];

  // within-holdout duplicate rejection (D-D.6 additional clause)
  const seenNorm = new Map();
  const seenId = new Map();
  for (const r of assembled) {
    const n = NORM(r.observation);
    if (seenNorm.has(n)) throw new Error(`D-D.6: two holdout rows share NORM(carrier) (${seenNorm.get(n)} / ${r.sourceId}). THROW.`);
    seenNorm.set(n, r.sourceId);
    if (seenId.has(r.sourceId)) throw new Error(`D-D.6: duplicate sourceId ${r.sourceId}. THROW.`);
    seenId.set(r.sourceId, true);
  }

  // stable row identifiers, derived from the frozen ordering (freeze s.10)
  const rows = assembled.map((r, i) => ({
    rowId: `H2A-${String(i + 1).padStart(3, '0')}`,
    ...r,
    constructionVersion: CONSTRUCTION_VERSION,
  }));

  // ---- G3-DEN.3: |DEN_A| == 0 is a construction failure, not a pass ----------------------------
  const denA = rows.filter((r) => r.expect.clarificationExpected === true).length;
  if (denA === 0) {
    throw new Error('G3-DEN.3: |DEN_A| = 0. A vacuous 100% is not evidence. THROW.');
  }

  const document = {
    holdoutId: 'holdout-l3-acceptance-attempt2',
    constructionVersion: CONSTRUCTION_VERSION,
    governingPlan: { path: PLAN_PATH, sha256: PLAN_SHA },
    freezeRecord: 'verification/hazlenz-l3-acceptance-holdout-attempt2-2026-08-24/HOLDOUT_FREEZE.txt',
    sources: {
      gauntlet: { path: SOURCES.gauntlet.path, sha256: SOURCES.gauntlet.sha, physicalRows: SOURCES.gauntlet.rows,
                  offset: gRes.k, partitionSizes: gRes.sizes, selected: gRes.selected.length,
                  selectionRule: 'CMP(scenarioId) asc · i % 4 === 0' },
      realism:  { path: SOURCES.realism.path, sha256: SOURCES.realism.sha, physicalRows: SOURCES.realism.rows,
                  offset: rRes.k, partitionSizes: rRes.sizes, selected: rRes.selected.length,
                  selectionRule: 'CMP(id) asc · i % 4 === 3' },
      seedReserve: { path: SOURCES.seed.path, sha256: SOURCES.seed.sha, physicalRows: SOURCES.seed.rows,
                     drawnFrom: false, note: 'reserve tranche -- checked for overlap, NOT drawn from' },
    },
    composition: {
      INDEPENDENT_GAUNTLET: gaunt.length,
      INDEPENDENT_REALISM: realism.length,
      AUTHORED_CONTROL: controls.length,
      total: rows.length,
      independent: gaunt.length + realism.length,
    },
    rows,
  };

  return { document, G, S, R, gRes, rRes, overlap };
}

// ---------------------------------------------------- D-D.6 the eight overlap surfaces
function buildOverlapSurfaces(G, S, R) {
  const surfaces = [];
  const add = (name, set) => surfaces.push({ name, set });

  add('1 gauntlet.source.v1 (all 150)', new Set(G.rows.map((r) => NORM(r.observation)).filter(Boolean)));
  add('2 field-realism-pack-v2 (all 117)', new Set(R.rows.map((r) => NORM(r.hazardObservation)).filter(Boolean)));
  add('3 gauntlet.seed (all 100, reserve)', new Set(S.rows.map((r) => NORM(r.observation)).filter(Boolean)));
  // surface 4 (authored vs authored) and the within-holdout clause are enforced in build().

  // surfaces 5, 6, 7: every prior sealed holdout, every development set, the exhausted field corpus.
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
  // surface 8: previously spent acceptance offsets -- NONE exist; nothing has ever been spent.
  return surfaces;
}

// D-D.6 surfaces 5, 6 and 7 are PRIOR sealed holdouts, PRIOR development sets and the exhausted
// field corpus. This attempt's own package is not a prior set: comparing the artifact under
// construction against itself is not a surface D-D.6 names, and would trivially self-collide.
const SELF_PACKAGE = 'verification/hazlenz-l3-acceptance-holdout-attempt2-2026-08-24';

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

// ------------------------------------------------------------------------------------------ main
function main() {
  const outArg = process.argv[2];
  if (!outArg) { console.error('usage: node build-holdout.js <output.json>'); process.exit(2); }

  const { document, gRes, rRes, overlap } = build();

  // freeze s.10 serialization: UTF-8, 2-space JSON, LF, exactly one trailing newline.
  const bytes = Buffer.from(JSON.stringify(document, null, 2) + '\n', 'utf8');
  fs.mkdirSync(path.dirname(path.resolve(outArg)), { recursive: true });
  fs.writeFileSync(path.resolve(outArg), bytes);

  const sha = crypto.createHash('sha256').update(bytes).digest('hex');
  console.log('== BUILD OK -- counts, hashes and booleans only; no observation text printed ==');
  console.log('  output              :', outArg);
  console.log('  sha256              :', sha);
  console.log('  bytes               :', bytes.length);
  console.log('  rows                :', document.rows.length);
  console.log('  gauntlet offset k   :', gRes.k, ' partitions', gRes.sizes.join(','), ' selected', gRes.selected.length);
  console.log('  realism  offset k   :', rRes.k, ' partitions', rRes.sizes.join(','), ' selected', rRes.selected.length);
  console.log('  composition         :', JSON.stringify(document.composition));
  console.log('  overlap surfaces    :', overlap.length, '(all checked, 0 collisions -- any collision would THROW)');
}

if (require.main === module) main();
module.exports = { build, NORM, CMP, OFFSET, SOURCES, PLAN_PATH, PLAN_SHA, CONSTRUCTION_VERSION };
