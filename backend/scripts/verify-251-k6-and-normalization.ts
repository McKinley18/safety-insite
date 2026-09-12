/**
 * §251 -- K6 AND NORMALIZATION PROOF FOR THE COMPACTED WIRE REPRESENTATION.
 *
 * Zero provider calls. Zero database operations. Proves, mechanically, that the compacted wire
 * representation designed in `analyze-251-compaction-ceiling.ts`:
 *
 *   K6      expresses exactly the six admissible role/carrier pairs and none of the four inadmissible
 *           ones, exactly as the §247 union does;
 *   NORM    normalizes one-to-one into the canonical §247 basis entry with no semantic inference:
 *           the mapping only moves named fields between two levels of one object.
 *
 * The compaction is NOT ADOPTED into production. This file proves what it would guarantee if it were.
 */
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

import {
  POSTURE_DRIVER_ROLES_239, DRIVER_ROLE_REF_KINDS_239,
} from '../src/safescope-v2/expert-hazlenz/contract/expert-239-posture-contract';
import {
  buildBasisEntryUnion247, admissiblePairs247, expressiblePairsUnder239,
  ROLE_EPISTEMIC_CHARACTERS_247, ROLE_JUSTIFICATION_SUBFIELDS_247, CESSATION_ROLE_247,
  CONTROLS_ROLE_247,
} from '../src/safescope-v2/expert-hazlenz/contract/expert-247-posture-contract';
import { buildCompactBasisEntryUnion251 } from './analyze-251-compaction-ceiling';

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

/** Key-order-insensitive JSON identity. A JSON object is a map, not a byte sequence. */
function canonicalJson(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonicalJson).join(',')}]`;
  if (v && typeof v === 'object') {
    return `{${Object.keys(v as object).sort()
      .map(k => `${JSON.stringify(k)}:${canonicalJson((v as Record<string, unknown>)[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(v) ?? 'null';
}

/** Read the (role, refKind) pairs a union actually expresses, from the generated schema itself. */
function pairsExpressedBy(union: Record<string, any>): { role: string; refKind: string }[] {
  const out: { role: string; refKind: string }[] = [];
  for (const branch of union.anyOf as Record<string, any>[]) {
    const role = branch.properties.driverRole.const as string;
    for (const k of branch.properties.refKind.enum as string[]) out.push({ role, refKind: k });
  }
  return out;
}

/**
 * The deterministic wire -> canonical normalization. It MOVES named fields; it reads no prose,
 * chooses no role, and supplies no missing value. An absent optional field stays absent.
 */
export function normalize251BasisEntry(wire: Record<string, unknown>): Record<string, unknown> {
  const HOISTED = ['epistemicCharacter', 'alongsideControlConsidered',
    'whyAlongsideControlInsufficient', 'dischargingControlRef'] as const;
  const core = (wire.roleJustification ?? {}) as Record<string, unknown>;
  const justification: Record<string, unknown> = { ...core };
  for (const f of HOISTED) if (f in wire) justification[f] = wire[f];
  const entry: Record<string, unknown> = {
    ref: wire.ref, refKind: wire.refKind, driverRole: wire.driverRole,
    roleJustification: justification,
  };
  return entry;
}

/** The inverse. Together they must be a bijection on admissible entries. */
export function denormalize251BasisEntry(canonical: Record<string, unknown>): Record<string, unknown> {
  const HOISTED = ['epistemicCharacter', 'alongsideControlConsidered',
    'whyAlongsideControlInsufficient', 'dischargingControlRef'] as const;
  const j = { ...((canonical.roleJustification ?? {}) as Record<string, unknown>) };
  const wire: Record<string, unknown> = {
    ref: canonical.ref, refKind: canonical.refKind, driverRole: canonical.driverRole,
  };
  for (const f of HOISTED) if (f in j) { wire[f] = j[f]; delete j[f]; }
  wire.roleJustification = j;
  return wire;
}

function main(): void {
  const OUT = join(__dirname, '..', '..', 'verification',
    'expert-hazlenz-251-strict-wire-schema-budget-2026-09-12');
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

  const u247 = buildBasisEntryUnion247() as Record<string, any>;
  const u251 = buildCompactBasisEntryUnion251() as Record<string, any>;
  const p247 = pairsExpressedBy(u247);
  const p251 = pairsExpressedBy(u251);
  const key = (p: { role: string; refKind: string }): string => `${p.role}|${p.refKind}`;
  const set247 = new Set(p247.map(key));
  const set251 = new Set(p251.map(key));
  const admissible = new Set(admissiblePairs247().map(key));
  const allExpressibleUnder239 = expressiblePairsUnder239().map(key);
  const inadmissible = allExpressibleUnder239.filter(k => !admissible.has(k));

  const checks: { id: string; claim: string; pass: boolean; detail: string }[] = [];
  const add = (id: string, claim: string, pass: boolean, detail = ''): void => {
    checks.push({ id, claim, pass, detail });
  };

  add('K6-1', 'the compact union expresses exactly the six admissible pairs',
    set251.size === 6 && [...set251].every(k => admissible.has(k)),
    `expressed=${set251.size} admissible=${admissible.size}`);
  add('K6-2', 'the compact union expresses none of the four inadmissible §239 pairs',
    inadmissible.every(k => !set251.has(k)), `inadmissible checked=${inadmissible.length}`);
  add('K6-3', 'the compact union expresses the same pair set as the §247 union',
    set247.size === set251.size && [...set247].every(k => set251.has(k)));
  add('K6-4', 'every branch pins its role with const and restricts refKind to that role only',
    (u251.anyOf as any[]).every((b, i) => {
      const role = POSTURE_DRIVER_ROLES_239[i];
      return b.properties.driverRole.const === role
        && JSON.stringify(b.properties.refKind.enum) === JSON.stringify([...DRIVER_ROLE_REF_KINDS_239[role]]);
    }));
  add('K6-5', 'every branch restricts epistemicCharacter to the characters its role admits',
    (u251.anyOf as any[]).every((b, i) => JSON.stringify(b.properties.epistemicCharacter.enum)
      === JSON.stringify([...ROLE_EPISTEMIC_CHARACTERS_247[POSTURE_DRIVER_ROLES_239[i]]])));
  add('K6-6', 'no controlling role admits MANUFACTURED_OR_SPECULATIVE in the compact union',
    (u251.anyOf as any[]).every(b => b.properties.driverRole.const === 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP'
      || !(b.properties.epistemicCharacter.enum as string[]).includes('MANUFACTURED_OR_SPECULATIVE')));

  // ---- normalization: round trip every field combination the compact union admits.
  const sample = (role: string): Record<string, unknown> => {
    const w: Record<string, unknown> = {
      ref: 'CAND-1', refKind: DRIVER_ROLE_REF_KINDS_239[role as never][0],
      driverRole: role, epistemicCharacter: ROLE_EPISTEMIC_CHARACTERS_247[role as never][0],
      roleJustification: {
        factualBasis: 'the observation states X', whyDecisionMaterial: 'because Y',
        whyControllingNotFollowUp: 'because Z',
      },
    };
    if (role === CESSATION_ROLE_247) {
      w.alongsideControlConsidered = 'a banksman in radio contact';
      w.whyAlongsideControlInsufficient = 'it does not remove the exposure';
    }
    if (role === CONTROLS_ROLE_247) w.dischargingControlRef = 'isolate the supply';
    return w;
  };
  const roundTrips: any[] = [];
  let allRoundTrip = true;
  for (const role of POSTURE_DRIVER_ROLES_239) {
    for (const withUnresolved of [false, true]) {
      const w = sample(role);
      if (withUnresolved) (w.roleJustification as any).unresolvedElement = 'whether the slab is rated';
      const canonical = normalize251BasisEntry(w);
      const back = denormalize251BasisEntry(canonical);
      const ok = canonicalJson(back) === canonicalJson(w);
      allRoundTrip = allRoundTrip && ok;
      roundTrips.push({ role, withUnresolved, ok, canonicalKeys: Object.keys(canonical),
        justificationKeys: Object.keys(canonical.roleJustification as object) });
    }
  }
  add('NORM-1', 'wire -> canonical -> wire is the identity on every admissible shape', allRoundTrip,
    `${roundTrips.length} shapes`);
  add('NORM-2', 'every canonical justification subfield produced is a §247 subfield',
    roundTrips.every(r => (r.justificationKeys as string[])
      .every(k => ROLE_JUSTIFICATION_SUBFIELDS_247.includes(k))));
  add('NORM-3', 'normalization supplies no value the wire did not carry',
    roundTrips.every(r => (r.justificationKeys as string[]).length
      === (r.withUnresolved ? 4 : 3) + (r.role === CESSATION_ROLE_247 ? 3 : r.role === CONTROLS_ROLE_247 ? 2 : 1)));

  const verdict = checks.every(c => c.pass) ? 'PASS' : 'FAIL';
  const doc = {
    section: '251', generated: '2026-09-12', providerCalls: 0, databaseOperations: 0,
    adopted: false,
    adoptionNote: 'the compacted representation is proved here but NOT wired into production, because '
      + 'the §250 C2 grammar-size limit blocks the base contract independently of this compaction',
    verdict,
    admissiblePairs: [...admissible].sort(),
    inadmissiblePairsUnder239: inadmissible.sort(),
    compactUnionPairs: [...set251].sort(),
    compactUnionSha: sha(JSON.stringify(u251)),
    section247UnionSha: sha(JSON.stringify(u247)),
    checks, roundTrips,
  };
  writeFileSync(join(OUT, 'SECTION-251-K6-NORMALIZATION-PROOF.json'), JSON.stringify(doc, null, 2));
  checks.forEach(c => console.log(`${c.pass ? 'PASS' : 'FAIL'}  ${c.id}  ${c.claim}  ${c.detail}`));
  console.log(`\nverdict ${verdict}`);
  if (verdict !== 'PASS') process.exit(1);
}
if (require.main === module) main();
