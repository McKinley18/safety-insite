/**
 * §251 -- HOW FAR REASONABLE LOSSLESS COMPACTION GETS.
 *
 * Builds the compacted provider-wire representation as an ANALYSIS ARTIFACT (no production module is
 * modified) and measures it against the two provider limits demonstrated in §250:
 *
 *   C1  union-typed parameters   limit 16, target <= 12
 *   C2  compiled grammar size    undocumented; bracketed by probe in this section
 *
 * Every transformation here is representational. None invents, repairs or removes safety meaning.
 */
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

import {
  POSTURE_DRIVER_ROLES_239, DRIVER_ROLE_REF_KINDS_239, buildExpert239WireSchema,
} from '../src/safescope-v2/expert-hazlenz/contract/expert-239-posture-contract';
import {
  ROLE_EPISTEMIC_CHARACTERS_247, EPISTEMIC_CHARACTER_DEFINITIONS_247, CESSATION_ROLE_247,
  CONTROLS_ROLE_247, buildExpert247WireSchema,
} from '../src/safescope-v2/expert-hazlenz/contract/expert-247-posture-contract';
import { governedBindingFor } from '../src/safescope-v2/expert-hazlenz/contract/expert-first-pass-instruction-vnext';
import { POSTURE_FIELD } from '../src/safescope-v2/expert-hazlenz/contract/expert-233-posture-contract';
import { transmitted, inputFor, CASES_251, countUnions, grammarMetrics } from './analyze-251-wire-budget';

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

// ---------------------------------------------------------------- structural counters

export function slotProfile(s: unknown): {
  slots: number; objects: number; freeStrings: number; enumNodes: number; enumMembers: number;
  refs: number; defs: number;
} {
  let slots = 0, objects = 0, freeStrings = 0, enumNodes = 0, enumMembers = 0, refs = 0, defs = 0;
  const walk = (n: unknown): void => {
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (!n || typeof n !== 'object') return;
    const o = n as Record<string, any>;
    if (typeof o.$ref === 'string') refs += 1;
    if (o.$defs && typeof o.$defs === 'object') defs += Object.keys(o.$defs).length;
    if (o.type === 'object' && o.properties) { objects += 1; slots += Object.keys(o.properties).length; }
    if (o.type === 'string' && !o.enum && o.const === undefined) freeStrings += 1;
    if (Array.isArray(o.enum)) { enumNodes += 1; enumMembers += o.enum.length; }
    for (const [k, v] of Object.entries(o)) { if (k === 'enum') continue; walk(v); }
  };
  walk(s);
  return { slots, objects, freeStrings, enumNodes, enumMembers, refs, defs };
}

// ---------------------------------------------------------------- the compacted §247 posture wire

/**
 * COMPACTION 1 -- NULLABILITY. `unresolvedElement` is optional AND nullable today, and no
 * deterministic rule distinguishes null from absent, so absence carries the same meaning. The two
 * cessation fields KEEP their null: on that branch they are required, so null is their only way to
 * say "the observation states no such control", and removing it would change what the model is asked.
 *
 * COMPACTION 2 -- PER-ROLE PROPERTY SETS. The three role-scoped fields appear in every branch today
 * although their own descriptions scope them to one role each and the deterministic projection reads
 * them only under that role. Restricting each branch to the fields its role actually uses states on
 * the wire what the contract already meant.
 *
 * COMPACTION 3 -- $defs. The narrative core is identical across all five branches, so it is defined
 * once and referenced. `epistemicCharacter` is hoisted to the entry because its admissible set is
 * per-role; deterministic normalization puts it back inside `roleJustification`.
 */
export const JUSTIFICATION_CORE_DEF = 'justificationCore';

export function buildCompactBasisEntryUnion251(): Record<string, unknown> {
  const branches = POSTURE_DRIVER_ROLES_239.map(role => {
    const props: Record<string, unknown> = {
      ref: { type: 'string', description: 'a candidateKey or a declarationId from THIS analysis' },
      refKind: {
        type: 'string', enum: [...DRIVER_ROLE_REF_KINDS_239[role]],
        description: 'the carrier kinds this role may be used on',
      },
      driverRole: { type: 'string', const: role },
      epistemicCharacter: {
        type: 'string', enum: [...ROLE_EPISTEMIC_CHARACTERS_247[role]],
        description: [...ROLE_EPISTEMIC_CHARACTERS_247[role]]
          .map(c => `${c}: ${EPISTEMIC_CHARACTER_DEFINITIONS_247[c]}`).join(' '),
      },
      roleJustification: { $ref: `#/$defs/${JUSTIFICATION_CORE_DEF}` },
    };
    const required = ['ref', 'refKind', 'driverRole', 'epistemicCharacter', 'roleJustification'];
    if (role === CESSATION_ROLE_247) {
      props.alongsideControlConsidered = {
        type: ['string', 'null'],
        description: 'REQUIRED ON A CESSATION DRIVER. The control operating alongside the work that '
          + 'you considered, named from the observation. Write null only if the observation states '
          + 'no such control at all.',
      };
      props.whyAlongsideControlInsufficient = {
        type: ['string', 'null'],
        description: 'REQUIRED ON A CESSATION DRIVER. Why that control does not make continued '
          + 'exposure acceptable.',
      };
      required.push('alongsideControlConsidered', 'whyAlongsideControlInsufficient');
    }
    if (role === CONTROLS_ROLE_247) {
      props.dischargingControlRef = {
        type: 'string',
        description: 'REQUIRED ON A CONTROLS DRIVER. The exact `control` text from your own '
          + 'requiredControls that discharges THIS entry.',
      };
      required.push('dischargingControlRef');
    }
    return { type: 'object', additionalProperties: false, required, properties: props };
  });
  return { anyOf: branches };
}

export const JUSTIFICATION_CORE_SCHEMA_251: Record<string, unknown> = {
  type: 'object', additionalProperties: false,
  required: ['factualBasis', 'whyDecisionMaterial', 'whyControllingNotFollowUp'],
  description: 'WHY this entry qualifies for the role you gave it.',
  properties: {
    factualBasis: { type: 'string', description: 'What the observation ESTABLISHES about this condition.' },
    unresolvedElement: {
      type: 'string',
      description: 'The single thing that is NOT settled. OMIT this field entirely when nothing is '
        + 'unresolved.',
    },
    whyDecisionMaterial: { type: 'string', description: 'Why resolving this could change the IMMEDIATE decision.' },
    whyControllingNotFollowUp: { type: 'string', description: 'Why this belongs in the role you chose.' },
  },
};

export function buildCompact251PostureProperty(base247Posture: Record<string, any>): Record<string, unknown> {
  const p = JSON.parse(JSON.stringify(base247Posture));
  p.properties.requiredBy.items = buildCompactBasisEntryUnion251();
  return p;
}

export function buildCompact251WireSchema(input: any, governed: any): Record<string, unknown> {
  const v247 = JSON.parse(JSON.stringify(buildExpert247WireSchema(input, governed)));
  const out = v247 as Record<string, any>;
  out.properties[POSTURE_FIELD] = buildCompact251PostureProperty(out.properties[POSTURE_FIELD]);
  out.$defs = { [JUSTIFICATION_CORE_DEF]: JSON.parse(JSON.stringify(JUSTIFICATION_CORE_SCHEMA_251)) };
  return out;
}

// ---------------------------------------------------------------- report

function main(): void {
  const OUT = join(__dirname, '..', '..', 'verification',
    'expert-hazlenz-251-strict-wire-schema-budget-2026-09-12');
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  const stripDesc = (n: any): any => {
    if (Array.isArray(n)) return n.map(stripDesc);
    if (!n || typeof n !== 'object') return n;
    const o: any = {};
    for (const [k, v] of Object.entries(n)) { if (k === 'description') continue; o[k] = stripDesc(v); }
    return o;
  };

  const rows: any[] = [];
  for (const c of CASES_251) {
    const input = inputFor(c); const g = governedBindingFor([]);
    const t239 = transmitted(buildExpert239WireSchema(input, g));
    const t247 = transmitted(buildExpert247WireSchema(input, g));
    const t251 = transmitted(buildCompact251WireSchema(input, g));
    rows.push({
      caseId: c.id,
      v239: { ...slotProfile(stripDesc(t239)), unions: countUnions(t239).length, bytes: grammarMetrics(t239).bytes },
      v247: { ...slotProfile(stripDesc(t247)), unions: countUnions(t247).length, bytes: grammarMetrics(t247).bytes },
      v251: { ...slotProfile(stripDesc(t251)), unions: countUnions(t251).length, bytes: grammarMetrics(t251).bytes,
        sha: sha(JSON.stringify(t251)) },
    });
  }
  writeFileSync(join(OUT, 'SECTION-251-COMPACTION-CEILING.json'), JSON.stringify({
    section: '251', generated: '2026-09-12', providerCalls: 0, databaseOperations: 0,
    note: 'analysis artifact only; no production module was modified to produce it',
    perCase: rows,
  }, null, 2));
  const r = rows[0];
  console.log('           slots objects freeStr enumMem refs defs unions bytes');
  for (const k of ['v239', 'v247', 'v251'] as const) {
    const m = r[k];
    console.log(`${k.padEnd(10)} ${String(m.slots).padStart(5)} ${String(m.objects).padStart(7)} `
      + `${String(m.freeStrings).padStart(7)} ${String(m.enumMembers).padStart(7)} `
      + `${String(m.refs).padStart(4)} ${String(m.defs).padStart(4)} ${String(m.unions).padStart(6)} `
      + `${String(m.bytes).padStart(5)}`);
  }
}
if (require.main === module) main();
