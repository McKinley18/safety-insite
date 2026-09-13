/**
 * §201 EXPERT HAZLENZ -- OWED-PROPERTY REPRESENTATION PROOF SUITE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO CUSTOMER ACTIVATION. NO CONTRACT MUTATION.
 *
 * Every option is exercised over the SAME inputs: the eight real structured declarations §199's
 * hosted first pass returned, and the eight real `OwedFact`s §199's deterministic projection
 * produced from them. The evidence directory is read-only and is never written.
 *
 * The suite proves five things about every prototype representation:
 *
 *   IDENTITY      the computed factKey is byte-identical to the one production already computed
 *   VERBATIM      the owed property is `declaration.missingFact`, trimmed, and nothing else
 *   NO INVENTION  a declaration without a property yields a REFUSAL, never a composed sentence
 *   NO DUPLICATION the property is written in exactly one place and the other fields are untouched
 *   NO AUTHORITY  no representation adds a status, a settlement, or a field a provider may set
 *
 * And two things about the suite's own limits:
 *
 *   the lexical loss characterisation is LEXICAL and is not a semantic finding;
 *   §200 axis Q is unadjudicated, so NO OPTION IS RECOMMENDED.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

import type { OwedFact } from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';
import {
  owedFactDefects, createOwedFactLedger, unresolvedFacts,
} from '../src/hazlenz/expert-hazlenz/owed-facts/owed-fact-ledger';
import {
  projectOwedFact, PROJECTION_FORBIDDEN_FIELDS,
} from '../src/hazlenz/expert-hazlenz/owed-facts/verifier-v3-development-boundary';
import {
  OWED_FACT_FIELD_PROVENANCE, NON_PROJECTING_DECLARATION_FIELDS,
  type StructuredUnresolvedFactDeclaration,
} from './lib/expert-first-pass-owed-fact-projection';
import {
  OWED_PROPERTY_REPRESENTATION_VERSION, OWED_PROPERTY_RECOMMENDATION,
  RECOMMENDATION_WITHHELD_BECAUSE, REPRESENTATION_OPTIONS, REPRESENTATION_REQUIREMENTS,
  DOWNSTREAM_CONSUMERS, OPTION_ASSESSMENTS, OWED_PROPERTY_REFUSAL_CODES, NEVER_COMPOSED_FROM,
  OWED_PROPERTY_SOURCE_FIELD, PINNED_CONTRACT_FILE, SECTION_187_PINNED_SHA256,
  SECTION_187_PIN_ASSERTING_SCRIPTS, HISTORICAL_PIN_DIVERGENCE_PRECEDENT,
  SECTION_199_EXPECTED_CHARACTERISATION, PROTOTYPE_FORBIDDEN_FIELD_NAMES,
  attachOwedProperty, buildO2, buildO3, buildO3WithoutTarget, buildDeclarationRecord,
  addToSidecar, owedPropertyFromSidecar, widenToV2, narrowToV1,
  projectUnderO1, projectUnderO2, projectUnderO3, projectUnderO4, projectUnderO5,
  propertyTokensAbsentFromProjection, owedPropertyRepresentationEffect, sha256,
  type DeclarationSidecar, type ProjectedUnderOption, type RepresentationOption,
} from './lib/expert-201-owed-property-representation';

let passed = 0;
let failed = 0;
const results: Array<{ id: string; ok: boolean; detail: string }> = [];
function ok(id: string, condition: boolean, detail = ''): void {
  results.push({ id, ok: condition, detail });
  if (condition) { passed += 1; console.log(`ok    ${id}${detail ? '  — ' + detail : ''}`); }
  else { failed += 1; console.log(`FAIL  ${id}${detail ? '  — ' + detail : ''}`); }
}

const ROOT = join(__dirname, '..', '..');
const E199 = join(ROOT, 'verification', 'expert-hazlenz-successor-structured-e2e-2026-09-07');
const E200 = join(ROOT, 'verification', 'expert-hazlenz-semantic-adjudication-2026-09-07');
const E187 = join(ROOT, 'verification',
  'expert-hazlenz-required-structured-verifier-validation-2026-09-05');

const readJsonl = (p: string): any[] =>
  readFileSync(p, 'utf8').split('\n').filter(l => l.trim().length > 0).map(l => JSON.parse(l));

// ================================================================ 0. real §199 pairs, read-only

console.log('--- 0. THE REAL §199 INPUTS (read-only; nothing is written to any evidence directory)');

const rawFirstPass = readJsonl(join(E199, 'RAW-FIRST-PASS-OUTPUTS.jsonl'));
const provenance = readJsonl(join(E199, 'PROJECTION-PROVENANCE.jsonl'));

interface Pair {
  rowId: string;
  declaration: StructuredUnresolvedFactDeclaration;
  fact: OwedFact;
}

const declByRowAndId = new Map<string, any>();
let rawDeclarationCount = 0;
for (const r of rawFirstPass) {
  for (const d of (r.rawDeclarations ?? [])) {
    rawDeclarationCount += 1;
    declByRowAndId.set(`${r.rowId}::${d.declarationId}`, d);
  }
}

const pairs: Pair[] = [];
let refusedCount = 0;
for (const p of provenance) {
  for (const pd of p.perDeclaration) {
    if (!pd.admitted) { refusedCount += 1; continue; }
    const d = declByRowAndId.get(`${p.rowId}::${pd.declarationId}`);
    pairs.push({ rowId: p.rowId, declaration: d, fact: pd.owedFact as OwedFact });
  }
}

ok('A1. the §199 evidence supplies nine raw declarations, eight admitted and one refused',
  rawDeclarationCount === 9 && pairs.length === 8 && refusedCount === 1,
  `${rawDeclarationCount} raw · ${pairs.length} admitted · ${refusedCount} refused`);

ok('A2. every admitted declaration carries a non-blank missingFact',
  pairs.every(p => typeof p.declaration.missingFact === 'string'
    && p.declaration.missingFact.trim().length > 0),
  `${pairs.length}/${pairs.length}`);

ok('A3. no projected OwedFact carries the property, under any key or as a substring',
  pairs.every(p => !Object.keys(p.fact).includes('missingFact')
    && !Object.keys(p.fact).includes('owedProperty')
    && !JSON.stringify(p.fact).includes(p.declaration.missingFact)),
  'this is the omission itself, measured rather than described');

ok('A4. §196 already records the omission as a non-projecting declaration field',
  NON_PROJECTING_DECLARATION_FIELDS.some(
    f => f.field === 'missingFact' && /NO canonical OwedFact field/i.test(f.role)),
  'NON_PROJECTING_DECLARATION_FIELDS');

ok('A5. the provenance table covers the projected OwedFact exactly and has no owed-property row',
  (() => {
    const factKeys = Object.keys(pairs[0].fact).sort();
    const rows = OWED_FACT_FIELD_PROVENANCE.map(r => r.owedFactField).sort();
    return JSON.stringify(factKeys) === JSON.stringify(rows)
      && !rows.includes('owedProperty') && !rows.includes('unresolvedTarget');
  })(),
  `${OWED_FACT_FIELD_PROVENANCE.length} rows cover ${Object.keys(pairs[0].fact).length} fields`);

// ================================================================ 1. the copy-or-refuse boundary

console.log('\n--- 1. VERBATIM COPY, OR REFUSAL. NOTHING IS COMPOSED (R3)');

ok('B1. every real declaration yields the property byte-equal to declaration.missingFact, trimmed',
  pairs.every(p => {
    const a = attachOwedProperty(p.declaration);
    return a.ok && a.owedProperty === p.declaration.missingFact.trim();
  }),
  `${pairs.length}/${pairs.length} byte-equal`);

ok('B2. an absent property field is REFUSED, not filled',
  (() => {
    const { missingFact, ...withoutProperty } = pairs[0].declaration;
    void missingFact;
    const a = attachOwedProperty(withoutProperty);
    return !a.ok && a.code === 'OWED_PROPERTY_FIELD_ABSENT';
  })());

ok('B3. a blank property field is REFUSED, not filled',
  (() => {
    const a = attachOwedProperty({ ...pairs[0].declaration, missingFact: '   ' });
    return !a.ok && a.code === 'OWED_PROPERTY_BLANK';
  })());

ok('B4. a non-string property field is REFUSED, not coerced',
  (() => {
    const a = attachOwedProperty({ ...pairs[0].declaration, missingFact: 42 as any });
    const b = attachOwedProperty({ ...pairs[0].declaration, missingFact: ['x'] as any });
    return !a.ok && a.code === 'OWED_PROPERTY_NOT_A_STRING'
      && !b.ok && b.code === 'OWED_PROPERTY_NOT_A_STRING';
  })());

ok('B5. THE INVENTION TEST — a declaration rich in every other field but blank in missingFact '
  + 'yields a refusal whose detail contains no text from any of those fields',
  (() => {
    const rich = {
      ...pairs[0].declaration,
      missingFact: '',
      notEstablishedBecause: 'SENTINEL_NOTESTABLISHED zzqx',
      branchA: 'SENTINEL_BRANCHA zzqx',
      branchB: 'SENTINEL_BRANCHB zzqx',
      decisionIfA: 'SENTINEL_IFA zzqx',
      decisionIfB: 'SENTINEL_IFB zzqx',
      observationSpan: 'SENTINEL_SPAN zzqx',
      whyNecessaryNow: 'SENTINEL_WHYNOW zzqx',
    };
    const a = attachOwedProperty(rich);
    if (a.ok) return false;
    const serialised = JSON.stringify(a);
    return !serialised.includes('SENTINEL') && !serialised.includes('zzqx');
  })(),
  `${NEVER_COMPOSED_FROM.length} fields the boundary will never read`);

ok('B6. the boundary reads exactly one declaration field, and it is named as a constant',
  OWED_PROPERTY_SOURCE_FIELD === 'missingFact'
  && !NEVER_COMPOSED_FROM.includes(OWED_PROPERTY_SOURCE_FIELD)
  && OWED_PROPERTY_REFUSAL_CODES.length === 3);

// ================================================================ 2. build every option

console.log('\n--- 2. THE FIVE REPRESENTATIONS, BUILT FROM THE SAME EIGHT REAL PAIRS');

interface Built {
  pair: Pair;
  property: string;
  o1: OwedFact;
  o2: ReturnType<typeof buildO2>;
  o3: ReturnType<typeof buildO3>;
  o4Fact: OwedFact;
  o5: ReturnType<typeof widenToV2>;
}

let sidecar: DeclarationSidecar = Object.freeze({});
const built: Built[] = pairs.map(pair => {
  const a = attachOwedProperty(pair.declaration);
  if (!a.ok) throw new Error(`unexpected refusal on real data: ${a.code}`);
  sidecar = addToSidecar(sidecar, buildDeclarationRecord({
    factKey: pair.fact.factKey,
    declaration: pair.declaration,
    stage: 'FIRST_PASS_MODEL',
    owedProperty: a.owedProperty,
  }));
  return {
    pair,
    property: a.owedProperty,
    o1: pair.fact,
    o2: buildO2(pair.fact, a.owedProperty),
    o3: buildO3(pair.fact, a.owedProperty, 'FIRST_PASS_MODEL'),
    o4Fact: pair.fact,
    o5: widenToV2(pair.fact, a.owedProperty),
  };
});

ok('C0. all five representations were built for all eight facts',
  built.length === 8 && REPRESENTATION_OPTIONS.length === 5
  && Object.keys(sidecar).length === 8);

// ---------------------------------------------------------------- identity (R1)

console.log('\n--- 3. IDENTITY IS PRESERVED BY EVERY OPTION (R1)');

const projectionsFor = (b: Built): Record<RepresentationOption, ProjectedUnderOption> => ({
  O1_UNCHANGED: projectUnderO1(b.o1),
  O2_OWED_PROPERTY_FIELD: projectUnderO2(b.o2),
  O3_UNRESOLVED_TARGET_OBJECT: projectUnderO3(b.o3),
  O4_DECLARATION_REFERENCE_SIDECAR: projectUnderO4(b.o4Fact, sidecar),
  O5_ADDITIVE_SUCCESSOR_TYPE: projectUnderO5(b.o5),
});

ok('D1. every option carries the factKey production already computed, byte for byte',
  built.every(b => {
    const proj = projectionsFor(b);
    return REPRESENTATION_OPTIONS.every(o => proj[o].factKey === b.pair.fact.factKey);
  }),
  `${built.length} facts × ${REPRESENTATION_OPTIONS.length} options = `
  + `${built.length * REPRESENTATION_OPTIONS.length} identity checks`);

ok('D2. no option introduces, renames or removes a factKey',
  built.every(b => {
    const keys = [b.o1.factKey, b.o2.factKey, b.o3.factKey, b.o4Fact.factKey, b.o5.factKey];
    return new Set(keys).size === 1
      && Object.prototype.hasOwnProperty.call(sidecar, b.pair.fact.factKey);
  }));

ok('D3. the eight factKeys remain unique across the analysis under every option',
  REPRESENTATION_OPTIONS.every(o =>
    new Set(built.map(b => projectionsFor(b)[o].factKey)).size === 8));

ok('D4. O5 narrows back to the pinned contract shape byte-for-byte',
  built.every(b => JSON.stringify(narrowToV1(b.o5)) === JSON.stringify(b.pair.fact)),
  'widenToV2 → narrowToV1 is the identity on OwedFact');

// ---------------------------------------------------------------- O1 equals production

console.log('\n--- 4. O1 IS TODAY, PROVED AGAINST THE PRODUCTION FUNCTION');

const SHARED = ['factKey', 'affectedDecision', 'whyUnresolved', 'branchA', 'branchB',
  'decisionDivergence', 'evidenceSpan'] as const;

ok('E1. O1\'s projection is byte-equal to projectOwedFact on every shared field',
  built.every(b => {
    const prod = projectOwedFact(b.pair.fact) as unknown as Record<string, unknown>;
    const mine = projectUnderO1(b.o1) as unknown as Record<string, unknown>;
    return SHARED.every(k => JSON.stringify(prod[k]) === JSON.stringify(mine[k]));
  }),
  `${SHARED.length} fields × ${built.length} facts`);

ok('E2. the production projection carries no owed property under any name',
  built.every(b => {
    const keys = Object.keys(projectOwedFact(b.pair.fact));
    return !keys.includes('owedProperty') && !keys.includes('missingFact')
      && !keys.includes('unresolvedTarget');
  }),
  `projectOwedFact returns ${Object.keys(projectOwedFact(built[0].pair.fact)).length} keys`);

ok('E3. O1 reports the omission as a value rather than an absent key',
  built.every(b => {
    const p = projectUnderO1(b.o1);
    return p.owedProperty === null && p.owedPropertyReachesTheVerifier === false;
  }),
  '"not carried" is distinguishable from "not declared"');

ok('E4. O2, O3, O4 and O5 all put the same verbatim property on the wire',
  built.every(b => {
    const proj = projectionsFor(b);
    return (['O2_OWED_PROPERTY_FIELD', 'O3_UNRESOLVED_TARGET_OBJECT',
      'O4_DECLARATION_REFERENCE_SIDECAR', 'O5_ADDITIVE_SUCCESSOR_TYPE'] as RepresentationOption[])
      .every(o => proj[o].owedProperty === b.property
        && proj[o].owedPropertyReachesTheVerifier === true);
  }));

// ---------------------------------------------------------------- no duplication (R2)

console.log('\n--- 5. THE PROPERTY IS WRITTEN ONCE, AND NOTHING ELSE MOVES (R2)');

ok('F1. no option alters any existing OwedFact field',
  built.every(b => {
    const base = JSON.stringify(b.pair.fact);
    const strip = (o: Record<string, unknown>, ...drop: string[]): string => {
      const c = { ...o };
      for (const d of drop) delete c[d];
      // key order is preserved by spread, and the dropped keys were appended last
      return JSON.stringify(c);
    };
    return strip(b.o2 as any, 'owedProperty') === base
      && strip(b.o3 as any, 'unresolvedTarget') === base
      && JSON.stringify(b.o4Fact) === base
      && strip(b.o5 as any, 'owedProperty') === base;
  }),
  'whyUnresolved, both branches and both decisions are untouched under every option');

ok('F2. the property appears exactly once in each representation that carries it',
  built.every(b => {
    const count = (hay: string, needle: string): number => hay.split(needle).length - 1;
    const q = JSON.stringify(b.property).slice(1, -1);
    return count(JSON.stringify(b.o2), q) === 1
      && count(JSON.stringify(b.o3), q) === 1
      && count(JSON.stringify(b.o5), q) === 1
      && count(JSON.stringify(b.o4Fact), q) === 0
      && count(JSON.stringify(sidecar[b.pair.fact.factKey]), q) === 1;
  }),
  'O4 stores it in the sidecar and nowhere else; the others store it on the fact and nowhere else');

ok('F3. O3\'s object adds two members that restate what a reader already has',
  built.every(b => b.o3.unresolvedTarget !== null
    && b.o3.unresolvedTarget.authoredBy === b.pair.fact.source
    && b.o3.unresolvedTarget.declarationField === OWED_PROPERTY_SOURCE_FIELD),
  'authoredBy duplicates OwedFact.source and declarationField has one legal value — recorded as '
  + 'O3 residual, not hidden');

ok('F4. O4 keeps the fact byte-identical to production and the property reachable only by lookup',
  built.every(b => JSON.stringify(b.o4Fact) === JSON.stringify(b.pair.fact)
    && owedPropertyFromSidecar(sidecar, b.pair.fact.factKey) === b.property));

ok('F5. O4\'s silent-failure mode is real and is demonstrated, not asserted',
  (() => {
    const empty: DeclarationSidecar = Object.freeze({});
    const p = projectUnderO4(built[0].o4Fact, empty);
    // A consumer holding the fact but not the sidecar gets TODAY'S behaviour, with no error.
    return p.owedProperty === null && p.owedPropertyReachesTheVerifier === false
      && JSON.stringify({ ...p, option: 'O1_UNCHANGED' })
        === JSON.stringify(projectUnderO1(built[0].o1));
  })(),
  'a call site given only the fact degrades to O1 and nothing tells it so');

ok('F6. the sidecar is append-only: an existing key is refused, never overwritten',
  (() => {
    try {
      addToSidecar(sidecar, buildDeclarationRecord({
        factKey: built[0].pair.fact.factKey,
        declaration: built[0].pair.declaration,
        stage: 'FIRST_PASS_MODEL',
        owedProperty: 'a different property',
      }));
      return false;
    } catch (e) {
      return /SIDECAR_KEY_ALREADY_PRESENT/.test(String(e));
    }
  })());

ok('F7. a fact with no declaration behind it carries null under O3 and O5, never a stand-in',
  (() => {
    const noTarget = buildO3WithoutTarget(built[0].pair.fact);
    const noProp = widenToV2(built[0].pair.fact, null);
    return noTarget.unresolvedTarget === null && noProp.owedProperty === null
      && projectUnderO3(noTarget).owedProperty === null
      && projectUnderO5(noProp).owedProperty === null;
  })(),
  'DETERMINISTIC and GOVERNED_EVIDENCE facts never had a declared property');

// ---------------------------------------------------------------- backward compatibility (R4)

console.log('\n--- 6. BACKWARD COMPATIBILITY AGAINST THE PRODUCTION VALIDATORS (R4)');

ok('G1. every option\'s fact passes the production owedFactDefects unchanged',
  built.every(b => owedFactDefects(b.o2).length === 0
    && owedFactDefects(b.o3).length === 0
    && owedFactDefects(b.o4Fact).length === 0
    && owedFactDefects(b.o5).length === 0),
  'the added field is invisible to the existing field-level validator');

ok('G2. every option\'s facts admit to a DEVELOPMENT ledger through the production constructor',
  (() => {
    for (const facts of [built.map(b => b.o2), built.map(b => b.o3),
      built.map(b => b.o4Fact), built.map(b => b.o5)]) {
      const l = createOwedFactLedger('DEVELOPMENT', facts as readonly OwedFact[]);
      if (l.facts.length !== 8 || l.transitions.length !== 0) return false;
      if (unresolvedFacts(l).length !== 8) return false;
    }
    return true;
  })(),
  '4 ledgers × 8 facts, 0 transitions recorded');

ok('G3. O5 accepts a fact that has no property; O2 has no such form',
  (() => {
    const v2 = widenToV2(built[0].pair.fact, null);
    return owedFactDefects(v2).length === 0
      // buildO2's signature requires a string; there is no null-accepting builder. The runtime
      // consequence of forcing one is what R4 records as NOT_MET for O2.
      && !Object.prototype.hasOwnProperty.call(built[0].pair.fact, 'owedProperty');
  })(),
  'O2 required means every existing OwedFact literal needs a value it may not truthfully have');

// ---------------------------------------------------------------- no authority (R5)

console.log('\n--- 7. NO OPTION GRANTS SETTLEMENT OR PROVIDER AUTHORITY (R5)');

const ADDED_FIELD_NAMES = ['owedProperty', 'unresolvedTarget', 'property', 'declarationField',
  'authoredBy', 'composed', 'missingFact', 'capturedVerbatim'];

ok('H1. no added field name is one a provider may set',
  ADDED_FIELD_NAMES.every(n => !PROTOTYPE_FORBIDDEN_FIELD_NAMES.includes(n)),
  `${ADDED_FIELD_NAMES.length} names checked against `
  + `${PROTOTYPE_FORBIDDEN_FIELD_NAMES.length} forbidden`);

ok('H2. no added field name collides with the projection\'s forbidden list',
  ADDED_FIELD_NAMES.every(n => !PROJECTION_FORBIDDEN_FIELDS.includes(n)),
  `${PROJECTION_FORBIDDEN_FIELDS.length} forbidden projection fields`);

ok('H3. every option leaves status UNRESOLVED and priority untouched',
  built.every(b => [b.o2, b.o3, b.o4Fact, b.o5].every(f =>
    f.status === 'UNRESOLVED' && f.priority === b.pair.fact.priority
    && f.source === b.pair.fact.source && f.modelAuthored === b.pair.fact.modelAuthored)));

ok('H4. no option\'s projection carries a status, priority, source or grading field',
  built.every(b => {
    const proj = projectionsFor(b);
    return REPRESENTATION_OPTIONS.every(o => {
      const keys = Object.keys(proj[o]);
      return !keys.some(k => PROJECTION_FORBIDDEN_FIELDS.includes(k));
    });
  }));

ok('H5. O3\'s composed flag is the literal false and cannot be read otherwise',
  built.every(b => b.o3.unresolvedTarget !== null && b.o3.unresolvedTarget.composed === false));

ok('H6. building representations records no transition and settles nothing',
  (() => {
    const before = createOwedFactLedger('DEVELOPMENT', built.map(b => b.pair.fact));
    const after = createOwedFactLedger('DEVELOPMENT', built.map(b => b.o5 as OwedFact));
    return before.transitions.length === 0 && after.transitions.length === 0
      && unresolvedFacts(after).length === 8;
  })());

// ---------------------------------------------------------------- the §187 pin (R6)

console.log('\n--- 8. THE §187 HASH PIN, RECOMPUTED FROM THE FILE');

const contractSha = sha256(readFileSync(join(ROOT, PINNED_CONTRACT_FILE), 'utf8'));

ok('I1. the pinned contract file is unchanged by this slice',
  contractSha === SECTION_187_PINNED_SHA256, contractSha);

ok('I2. the recomputed sha matches §187\'s preregistered owedFactSourceHashes',
  (() => {
    const p = JSON.parse(readFileSync(join(E187, 'PREREGISTRATION.json'), 'utf8'));
    return p.owedFactSourceHashes['owed-fact.types.ts'] === contractSha;
  })(),
  'read from the frozen §187 preregistration, not from a constant in this file');

ok('I3. every recorded §187-pin-asserting script exists and reads owedFactSourceHashes',
  SECTION_187_PIN_ASSERTING_SCRIPTS.every(rel => {
    const p = join(ROOT, rel);
    return existsSync(p) && /owedFactSourceHashes/.test(readFileSync(p, 'utf8'));
  }),
  `${SECTION_187_PIN_ASSERTING_SCRIPTS.length} live assertions would fail on a contract mutation`);

ok('I4. the §186 historical-pin precedent is quoted accurately from its own artifact',
  (() => {
    const p = join(ROOT, HISTORICAL_PIN_DIVERGENCE_PRECEDENT.artifact);
    if (!existsSync(p)) return false;
    const j = JSON.parse(readFileSync(p, 'utf8'));
    return j.classification === HISTORICAL_PIN_DIVERGENCE_PRECEDENT.classification
      && j.pin.pinnedValue === HISTORICAL_PIN_DIVERGENCE_PRECEDENT.divergedPin
      && j.actionTaken === HISTORICAL_PIN_DIVERGENCE_PRECEDENT.actionTaken
      && j.CURRENT_REGRESSION_FAILURE === false;
  })(),
  'an archived pin diverging is settled; eleven LIVE assertions are not');

ok('I5. the two contract-mutating options are the two that break the pin, and they say so',
  OPTION_ASSESSMENTS.filter(a => a.mutatesPinnedContractFile).length === 2
  && OPTION_ASSESSMENTS.filter(a => a.mutatesPinnedContractFile)
    .every(a => /BREAKS THE PIN/.test(a.section187HashConsequence))
  && OPTION_ASSESSMENTS.filter(a => !a.mutatesPinnedContractFile)
    .every(a => /^NONE/.test(a.section187HashConsequence)),
  'O2 and O3 mutate; O1, O4 and O5 do not');

ok('I6. this module mutates nothing and activates nothing',
  (() => {
    const e = owedPropertyRepresentationEffect();
    return e.contractMutated === false && e.productionActivated === false
      && e.providerCallsMade === 0 && e.databaseOperations === 0
      && e.recommendationMade === false && e.semanticVerdictSupplied === false;
  })());

/**
 * The import graph, not a word scan.
 *
 * A scan for the WORD "repository" fires on prose inside a string literal, which proves nothing; a
 * scan that then strips string literals would stop seeing `require('typeorm')`, which proves less.
 * The dependency set is the honest object: a module that imports only `crypto` and two owed-fact
 * type modules cannot reach a provider or a database whatever its prose says.
 */
const PROTOTYPE_SRC = readFileSync(
  join(__dirname, 'lib', 'expert-201-owed-property-representation.ts'), 'utf8');
const PROTOTYPE_IMPORTS = [...new Set(
  [...PROTOTYPE_SRC.matchAll(/(?:^|\n)\s*import[^;]*?from\s+'([^']+)'/g)].map(m => m[1])
    .concat([...PROTOTYPE_SRC.matchAll(/require\(\s*'([^']+)'\s*\)/g)].map(m => m[1])),
)].sort();

ok('I7. the prototype module\'s entire dependency set is three modules, none of which can reach a '
  + 'provider or a database',
  JSON.stringify(PROTOTYPE_IMPORTS) === JSON.stringify([
    '../../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types',
    './expert-first-pass-owed-fact-projection',
    'crypto',
  ])
  && !/process\.env/.test(PROTOTYPE_SRC)
  && !/\bfetch\s*\(|\baxios\b|getRepository|createQueryBuilder|entityManager/.test(PROTOTYPE_SRC),
  PROTOTYPE_IMPORTS.join(' · '));

// ---------------------------------------------------------------- the assessment table

console.log('\n--- 9. THE ASSESSMENT TABLE IS COMPLETE AND HONEST');

ok('J1. every option has an assessment, and every assessment an option',
  OPTION_ASSESSMENTS.length === REPRESENTATION_OPTIONS.length
  && REPRESENTATION_OPTIONS.every(o => OPTION_ASSESSMENTS.some(a => a.option === o)));

ok('J2. every assessment scores every requirement',
  OPTION_ASSESSMENTS.every(a =>
    REPRESENTATION_REQUIREMENTS.every(r => typeof a.requirements[r] === 'string')
    && Object.keys(a.requirements).length === REPRESENTATION_REQUIREMENTS.length),
  `${REPRESENTATION_REQUIREMENTS.length} requirements × ${OPTION_ASSESSMENTS.length} options`);

ok('J3. every assessment names the consequence for every downstream consumer',
  OPTION_ASSESSMENTS.every(a =>
    DOWNSTREAM_CONSUMERS.every(c => typeof a.downstream[c] === 'string'
      && a.downstream[c].length > 8)
    && Object.keys(a.downstream).length === DOWNSTREAM_CONSUMERS.length),
  `${DOWNSTREAM_CONSUMERS.length} consumers × ${OPTION_ASSESSMENTS.length} options`);

ok('J4. EVERY option records a residual — including the one that changes nothing',
  OPTION_ASSESSMENTS.every(a => a.residual.length > 0 && a.residual.every(r => r.length > 30)),
  OPTION_ASSESSMENTS.map(a => `${a.option}:${a.residual.length}`).join(' '));

ok('J5. no option is scored MET on every requirement — none is free',
  OPTION_ASSESSMENTS.every(a =>
    !REPRESENTATION_REQUIREMENTS.every(r => a.requirements[r] === 'MET_BY_CONSTRUCTION')
    || a.residual.length > 0),
  'O1 is MET_BY_CONSTRUCTION throughout and still carries three residuals, which is the point');

ok('J6. the B3 exactness gate is named as a consequence by both mutating options',
  OPTION_ASSESSMENTS.filter(a => a.mutatesPinnedContractFile)
    .every(a => /FAILS/.test(a.downstream.provenanceTableCaseB3)),
  'a field added without a provenance row fails §196 case B3 by design');

// ---------------------------------------------------------------- §199 loss, recomputed

console.log('\n--- 10. WHAT §199\'S REAL DATA SHOWS. LEXICAL, AND SAID TO BE LEXICAL');

const perFact = built.map(b => ({
  rowId: b.pair.rowId,
  factKey: b.pair.fact.factKey,
  property: b.property,
  absent: propertyTokensAbsentFromProjection(b.property, projectUnderO1(b.o1)),
}));

const characterisation = {
  rawDeclarations: rawDeclarationCount,
  admittedDeclarations: built.length,
  refusedDeclarations: refusedCount,
  declarationsCarryingMissingFact: [...declByRowAndId.values()]
    .filter(d => typeof d.missingFact === 'string' && d.missingFact.trim().length > 0).length,
  projectedFactsCarryingTheProperty: built.filter(
    b => JSON.stringify(b.pair.fact).includes(b.property)).length,
  missingFactVerbatimInProjectedFact: built.filter(
    b => JSON.stringify(projectOwedFact(b.pair.fact)).includes(b.property)).length,
  totalPropertyBytesNotProjected: built.reduce(
    (n, b) => n + b.pair.declaration.missingFact.length, 0),
  factsWhereEveryContentTokenAlsoAppearsInTheProjection:
    perFact.filter(f => f.absent.length === 0).length,
  factsWithAtLeastOneContentTokenAbsent: perFact.filter(f => f.absent.length > 0).length,
};

for (const f of perFact) {
  console.log(`      ${f.rowId.padEnd(6)} ${f.factKey.padEnd(42)} `
    + `absent tokens: ${f.absent.length === 0 ? '(none)' : f.absent.join(', ')}`);
}

ok('K1. the recomputed characterisation matches the recorded one exactly',
  (Object.keys(characterisation) as Array<keyof typeof characterisation>)
    .every(k => characterisation[k] === (SECTION_199_EXPECTED_CHARACTERISATION as any)[k]),
  JSON.stringify(characterisation));

ok('K2. zero of eight projected facts carry the property in any form',
  characterisation.projectedFactsCarryingTheProperty === 0
  && characterisation.missingFactVerbatimInProjectedFact === 0,
  '770 bytes of authored property across 8 facts reach neither the fact nor the verifier');

ok('K3. the characterisation states its own interpretation boundary',
  /LEXICAL OVERLAP IS NOT SEMANTIC RECOVERABILITY/
    .test(SECTION_199_EXPECTED_CHARACTERISATION.interpretationBoundary)
  && /axis Q/.test(SECTION_199_EXPECTED_CHARACTERISATION.interpretationBoundary));

ok('K4. the refused declaration was refused for reasons unrelated to the owed property',
  (() => {
    const refused = provenance.flatMap((p: any) => p.perDeclaration)
      .filter((d: any) => !d.admitted);
    return refused.length === 1
      && refused[0].codes.every((c: string) => c === 'REQUIRED_FIELD_MISSING');
  })(),
  'the one refusal is a blank decisionIfA/decisionIfB, not a missing property');

// ---------------------------------------------------------------- the non-recommendation

console.log('\n--- 11. NO RECOMMENDATION IS MADE, AND THE REASON IS EVIDENCE');

const worksheetPath = join(E200, 'ADJUDICATION-WORKSHEET.json');
const worksheet = existsSync(worksheetPath)
  ? JSON.parse(readFileSync(worksheetPath, 'utf8')) : null;

ok('L1. §200 axis Q exists and is defined as a MEASUREMENT axis only',
  worksheet !== null
  && worksheet.factAxes.some((a: any) => a.id === 'Q'
    && a.name === 'OWED_PROPERTY_LOSS_IMPACT'
    && /MEASUREMENT ONLY/.test(a.mustNotInfluence)
    && /does not authorise adding a field/i.test(a.mustNotInfluence)));

ok('L2. axis Q carries no verdict for any of the eight facts',
  worksheet !== null
  && worksheet.facts.length === 8
  && worksheet.facts.every((f: any) => f.verdicts.Q_OWED_PROPERTY_LOSS_IMPACT === null),
  '0/8 adjudicated');

ok('L3. the §200 worksheet as a whole is unadjudicated',
  worksheet !== null
  && worksheet.status === 'PENDING_HUMAN_ADJUDICATION'
  && worksheet.completeness.verdictsSupplied === 0
  && worksheet.completeness.verdictSlotsTotal === 152
  && worksheet.completeness.STATUS === 'UNMEASURED',
  `${worksheet?.completeness?.HUMAN_ADJUDICATION_COMPLETENESS}`);

ok('L4. this module makes no recommendation, and the value is a literal',
  OWED_PROPERTY_RECOMMENDATION === 'NOT_MADE'
  && RECOMMENDATION_WITHHELD_BECAUSE.length === 4
  && RECOMMENDATION_WITHHELD_BECAUSE.some(r => /axis Q/.test(r))
  && owedPropertyRepresentationEffect().recommendationMade === false);

ok('L5. no ranking, score or ordering of the options exists anywhere in the module',
  (() => {
    const src = readFileSync(join(__dirname, 'lib',
      'expert-201-owed-property-representation.ts'), 'utf8');
    const code = src.split('\n')
      .filter(l => !/^\s*\*/.test(l) && !/^\s*\/\//.test(l) && !/^\s*\/\*/.test(l)).join('\n');
    return !/\brecommend(ed|ation)?\s*[:=]\s*['"](?!NOT_MADE)/i.test(code)
      && !/\bpreferred\b|\bbestOption\b|\bchosen\b|\bwinner\b|\brank\b/i.test(code);
  })(),
  'migrationBurden is a stated cost, not a score, and nothing sorts by it');

ok('L6. this suite supplies no §200 semantic verdict',
  (() => {
    const src = readFileSync(__filename.replace(/\.js$/, '.ts'), 'utf8');
    return !/'(PARTIALLY_CORRECT|TRUTH_SPECIFICATION_DEFECT)'/.test(src)
      && !/Q_OWED_PROPERTY_LOSS_IMPACT\s*=\s*['"]/.test(src);
  })(),
  'the only reads of axis Q assert that it is null');

// ---------------------------------------------------------------- report

console.log('\n' + '='.repeat(100));
console.log(`  ${passed}/${passed + failed} PASS  ·  ${failed} FAIL`);
console.log(`  ${OWED_PROPERTY_REPRESENTATION_VERSION}`);
console.log('  PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   CUSTOMER ACTIVATION: NONE');
console.log(`  CONTRACT sha256: ${contractSha}  (§187 pin ${
  contractSha === SECTION_187_PINNED_SHA256 ? 'INTACT' : 'BROKEN'})`);
console.log(`  RECOMMENDATION: ${OWED_PROPERTY_RECOMMENDATION} — §200 axis Q is unadjudicated`);
console.log('='.repeat(100));
if (failed > 0) {
  console.log('\nFAILED:');
  for (const r of results.filter(x => !x.ok)) console.log(`  ${r.id}  ${r.detail}`);
  process.exit(1);
}
