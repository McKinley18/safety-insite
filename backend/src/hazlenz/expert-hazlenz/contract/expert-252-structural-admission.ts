/**
 * §252 -- DETERMINISTIC FAIL-CLOSED STRUCTURAL ADMISSION. ZERO PROVIDER CALLS. ZERO DATABASE
 * OPERATIONS. NO VENDOR NAME, NO ENDPOINT, NO CREDENTIAL, NO NETWORK PRIMITIVE.
 *
 * ==================== WHY THIS MODULE EXISTS ====================
 *
 * §251 established that the complete Expert semantic contract cannot be compiled into the provider's
 * single-call strict grammar without deleting product capability. The product owner closed strict
 * single-call output and authorized NON-STRICT single-call output plus deterministic fail-closed
 * structural admission.
 *
 * That trade moves one obligation, and only one. Under `strict: true` the provider guaranteed that
 * the tool input satisfied the transmitted schema before it ever reached us. Under `strict: false`
 * it guarantees nothing beyond well-formed JSON. **The obligation does not disappear; it moves here.**
 *
 * ==================== THE LINE THIS MODULE MAY NOT CROSS ====================
 *
 * This module decides ADMISSIBILITY. It never decides MEANING.
 *
 * It may reject, preserve an unresolved fact the model itself explicitly supplied, normalize a
 * mechanically equivalent container, map fixed enums and project valid structured fields. It may not
 * invent justification text, select a driver role, infer a property, infer a hazard, create a
 * required control, infer evidence sufficiency, turn malformed text into an authoritative
 * declaration, or reconstruct meaning from prose. Where a load-bearing structure is invalid the
 * analysis FAILS CLOSED and the model is asked again by a human, never patched by this file.
 *
 * ==================== WHAT IS NEW HERE AND WHAT IS DELEGATED ====================
 *
 * NEW: one whole-output conformance gate, and the rule that turns the pipeline's results into a
 * disposition. NOTHING ELSE. This module composes no projection of its own: the production entry
 * point still calls §233/§239, §210J, §205 and §247 in the same order it always did, and hands their
 * results here. There is therefore exactly ONE composition of the pipeline, which is what makes the
 * production path and every validation harness necessarily the same path. None of those modules is
 * edited.
 *
 * The gate exists because the pre-existing pipeline validated the whole output against the
 * transmitted schema in exactly one place -- inside §235, and only for a field that arrived as a
 * JSON STRING. A field that arrived as a well-formed array of wrongly-shaped members was passed
 * through untouched, and only whatever downstream check happened to look at it would notice. Under
 * `strict: true` that was adequate because the provider had already refused such an output. Under
 * `strict: false` it is not.
 *
 * ==================== WHICH SCHEMA THE GATE VALIDATES AGAINST ====================
 *
 * The canonical wire schema, with every object node CLOSED (`additionalProperties: false`). Closure
 * is what the contract already means: each object enumerates its properties, and a property the
 * contract does not declare is not part of the contract.
 *
 * The transport applies its own provider-native transformations before transmission, and those may
 * only ADD closure or REMOVE keywords. So this gate is never LAXER than what the model was shown,
 * and where it differs it refuses more rather than less. That asymmetry is deliberate and is the
 * fail-closed direction. `closeObjectNodes252` is asserted by the §252 suite to be byte-identical to
 * the transport's own strict wrapper on the real schema, so the two cannot drift apart silently.
 */

import {
  normalizeExpertToolOutput235, validateAgainstTransmittedSchema,
  type NormalizationResult235,
} from './expert-235-wire-normalization';

export const ADMISSION_252_VERSION = 'hazlenz.expert.252.structural-admission.v1' as const;

/** The three dispositions a provider output may receive. There is no fourth. */
export const ADMISSION_OUTCOMES_252 = ['ADMIT', 'REFUSE', 'PRESERVE_UNRESOLVED'] as const;
export type AdmissionOutcome252 = (typeof ADMISSION_OUTCOMES_252)[number];

/**
 * The conformance gate's vocabulary. Each names a STRUCTURAL fact about the output, never a
 * judgement about the workplace.
 */
export const CONFORMANCE_CODES_252 = [
  'OUTPUT_NOT_AN_OBJECT',
  'REQUIRED_FIELD_ABSENT',
  'FIELD_TYPE_DOES_NOT_MATCH_CONTRACT',
  'NULL_WHERE_CONTRACT_FORBIDS_NULL',
  'ENUM_VALUE_NOT_A_MEMBER',
  'CONST_VALUE_MISMATCH',
  'PROPERTY_NOT_DECLARED_BY_CONTRACT',
  'NO_UNION_BRANCH_SATISFIED',
  'STRING_SHORTER_THAN_CONTRACT_REQUIRES',
  'ARRAY_SHORTER_THAN_CONTRACT_REQUIRES',
  'UNRECOGNISED_CONTRACT_NODE',
] as const;
export type ConformanceCode252 = (typeof CONFORMANCE_CODES_252)[number];

export interface ConformanceViolation252 {
  readonly path: string;
  readonly code: ConformanceCode252;
  readonly reason: string;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

// ================================================================ schema closure

/**
 * Add `additionalProperties: false` to every object node that declares properties and does not
 * already say otherwise. Clones; the input schema is provably untouched.
 */
export function closeObjectNodes252(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(closeObjectNodes252);
  if (!node || typeof node !== 'object') return node;
  const src = node as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(src)) out[k] = closeObjectNodes252(v);
  if (out.type === 'object' && out.properties && typeof out.properties === 'object') {
    out.additionalProperties = false;
  }
  return out;
}

// ================================================================ the conformance gate

/**
 * Does this value satisfy this contract node, exactly?
 *
 * This walker covers the whole JSON-Schema subset the Expert contract transmits, including the two
 * constructs §235's validator does not model -- `anyOf` unions and `type` arrays -- because the §247
 * K6 representation uses the first and its justification uses the second. On every node shape §235
 * DOES model, the §252 suite asserts the two agree exactly, so this is a superset rather than a
 * second, laxer standard.
 */
export function conformsToContract252(
  value: unknown, schema: unknown, path = '$',
): ConformanceViolation252[] {
  if (!isPlainObject(schema)) {
    return [{ path, code: 'UNRECOGNISED_CONTRACT_NODE', reason: 'contract node is not an object' }];
  }
  const out: ConformanceViolation252[] = [];

  // ---- anyOf. Satisfied when at least one branch is satisfied, and never repaired toward one.
  if (Array.isArray(schema.anyOf)) {
    const branches = schema.anyOf as unknown[];
    const perBranch = branches.map(b => conformsToContract252(value, b, path));
    if (perBranch.some(v => v.length === 0)) return [];
    const best = perBranch.reduce((a, b) => (b.length < a.length ? b : a), perBranch[0] ?? []);
    return [{
      path, code: 'NO_UNION_BRANCH_SATISFIED',
      reason: `no branch of a ${branches.length}-branch union is satisfied; the closest failed with `
        + `${best.length} violation(s), first at ${best[0]?.path ?? path}: ${best[0]?.reason ?? ''}`,
    }];
  }

  if (schema.const !== undefined && value !== schema.const) {
    out.push({ path, code: 'CONST_VALUE_MISMATCH', reason: 'value is not the contract constant' });
  }
  if (Array.isArray(schema.enum) && !(schema.enum as unknown[]).some(x => x === value)) {
    out.push({ path, code: 'ENUM_VALUE_NOT_A_MEMBER',
      reason: 'value is not a member of the contract enum' });
  }

  const t = schema.type;

  // ---- type arrays, the nullable representation. Satisfied when any listed type is satisfied.
  if (Array.isArray(t)) {
    const members = t as unknown[];
    if (value === null) {
      if (!members.includes('null')) {
        out.push({ path, code: 'NULL_WHERE_CONTRACT_FORBIDS_NULL',
          reason: 'null where the contract does not list null' });
      }
      return out;
    }
    const attempts = members.filter(m => m !== 'null')
      .map(m => conformsToContract252(value, { ...schema, type: m, enum: undefined, const: undefined }, path));
    if (!attempts.some(a => a.length === 0)) {
      out.push({ path, code: 'FIELD_TYPE_DOES_NOT_MATCH_CONTRACT',
        reason: `value matches none of the contract types ${JSON.stringify(members)}` });
    }
    return out;
  }

  if (value === null && t !== undefined && t !== 'null') {
    out.push({ path, code: 'NULL_WHERE_CONTRACT_FORBIDS_NULL',
      reason: `null where the contract declares ${String(t)}` });
    return out;
  }

  switch (t) {
    case 'object': {
      if (!isPlainObject(value)) {
        out.push({ path, code: 'FIELD_TYPE_DOES_NOT_MATCH_CONTRACT', reason: 'expected an object' });
        break;
      }
      const props = isPlainObject(schema.properties) ? schema.properties : {};
      const required = Array.isArray(schema.required) ? schema.required as string[] : [];
      for (const r of required) {
        if (!(r in value)) {
          out.push({ path: `${path}.${r}`, code: 'REQUIRED_FIELD_ABSENT',
            reason: 'required property absent' });
        }
      }
      if (schema.additionalProperties === false) {
        for (const k of Object.keys(value)) {
          if (!(k in props)) {
            out.push({ path: `${path}.${k}`, code: 'PROPERTY_NOT_DECLARED_BY_CONTRACT',
              reason: 'property is not declared by the contract' });
          }
        }
      }
      for (const [k, v] of Object.entries(value)) {
        if (k in props) out.push(...conformsToContract252(v, props[k], `${path}.${k}`));
      }
      break;
    }
    case 'array': {
      if (!Array.isArray(value)) {
        out.push({ path, code: 'FIELD_TYPE_DOES_NOT_MATCH_CONTRACT', reason: 'expected an array' });
        break;
      }
      if (typeof schema.minItems === 'number' && value.length < schema.minItems) {
        out.push({ path, code: 'ARRAY_SHORTER_THAN_CONTRACT_REQUIRES',
          reason: 'fewer members than the contract requires' });
      }
      if (schema.items !== undefined) {
        value.forEach((v, i) => out.push(...conformsToContract252(v, schema.items, `${path}[${i}]`)));
      }
      break;
    }
    case 'string': {
      if (typeof value !== 'string') {
        out.push({ path, code: 'FIELD_TYPE_DOES_NOT_MATCH_CONTRACT', reason: 'expected a string' });
        break;
      }
      if (typeof schema.minLength === 'number' && value.length < schema.minLength) {
        out.push({ path, code: 'STRING_SHORTER_THAN_CONTRACT_REQUIRES',
          reason: 'shorter than the contract requires' });
      }
      break;
    }
    case 'number': case 'integer':
      if (typeof value !== 'number') {
        out.push({ path, code: 'FIELD_TYPE_DOES_NOT_MATCH_CONTRACT', reason: 'expected a number' });
      }
      break;
    case 'boolean':
      if (typeof value !== 'boolean') {
        out.push({ path, code: 'FIELD_TYPE_DOES_NOT_MATCH_CONTRACT', reason: 'expected a boolean' });
      }
      break;
    case 'null':
      if (value !== null) {
        out.push({ path, code: 'FIELD_TYPE_DOES_NOT_MATCH_CONTRACT', reason: 'expected null' });
      }
      break;
    case undefined:
      break;
    default:
      out.push({ path, code: 'UNRECOGNISED_CONTRACT_NODE',
        reason: `unrecognised contract type ${String(t)}` });
  }
  return out;
}

/**
 * The two validators must not drift. Delegates the same question to §235 on a node the §235 subset
 * models, and reports whether the verdicts agree. Used by the suite, exported so the agreement is a
 * checked property of the module rather than a claim in a comment.
 */
export function agreesWithSection235(value: unknown, schema: unknown): boolean {
  return (conformsToContract252(value, schema).length === 0)
    === (validateAgainstTransmittedSchema(value, schema).length === 0);
}

// ================================================================ semantic-invention audit

/**
 * EVERY MODEL-AUTHORED STRING THE ADMITTED STATE CARRIES MUST HAVE ARRIVED FROM THE PROVIDER.
 *
 * The audit collects every string on the MODEL-AUTHORED SURFACE of the admitted state and checks it
 * against the multiset of strings the raw payload carried. A string there that the provider never
 * wrote would be an invention, and this returns it.
 *
 * The model-authored surface is defined by the records themselves, not by this file's opinion. On an
 * admitted posture it is the whole object, because §233/§239 build it from the model's own fields. On
 * a preserved unresolved fact it is exactly the three members §205 documents as model content --
 * `declarationId`, `identifiedProperty` ("VERBATIM from the declaration ... copied, never composed")
 * and the verbatim `presentFields`.
 *
 * HazLenz bookkeeping is deliberately NOT audited, because it is not model judgement and is never
 * presented as any: the record kind, the refusal codes, the refusal detail, the absent-field names,
 * the protective sequence and the literal admissibility flags are all written by HazLenz by design.
 * Auditing them would report the safety machinery describing its own refusal as an invented fact.
 */
export function collectStrings252(v: unknown, acc: string[] = []): string[] {
  if (typeof v === 'string') { acc.push(v); return acc; }
  if (Array.isArray(v)) { v.forEach(x => collectStrings252(x, acc)); return acc; }
  if (isPlainObject(v)) { Object.values(v).forEach(x => collectStrings252(x, acc)); return acc; }
  return acc;
}

export function modelAuthoredSurfaceOfPreservedRecord252(record: unknown): unknown[] {
  const r = isPlainObject(record) ? record : {};
  return [r.declarationId, r.identifiedProperty, r.presentFields];
}

export function auditSemanticInvention252(
  raw: unknown, admittedPosture: unknown, preservedRecords: readonly unknown[],
): readonly string[] {
  const supplied = new Set(collectStrings252(raw));
  const emitted = [
    ...collectStrings252(admittedPosture),
    ...preservedRecords.flatMap(r =>
      modelAuthoredSurfaceOfPreservedRecord252(r).flatMap(v => collectStrings252(v))),
  ];
  return emitted.filter(s => !supplied.has(s));
}

// ================================================================ the gate and the verdict

/**
 * THE WHOLE-OUTPUT CONFORMANCE GATE. The one thing §252 adds to the pipeline.
 *
 * It normalizes the container with §235 first, so an anomaly that module can undo with certainty is
 * undone before the output is judged, then asks whether what remains satisfies the contract exactly.
 */
export interface ConformanceGateResult252 {
  readonly normalization: NormalizationResult235;
  readonly violations: readonly ConformanceViolation252[];
  readonly codes: readonly ConformanceCode252[];
  readonly conforms: boolean;
  /** The normalized analysis the rest of the pipeline should read. Null when there is none. */
  readonly analysis: Record<string, unknown> | null;
}

export function gateExpertOutput252(
  rawToolInput: unknown, wireSchema: unknown,
): ConformanceGateResult252 {
  const normalization = normalizeExpertToolOutput235(rawToolInput, wireSchema);
  const violations: ConformanceViolation252[] = normalization.analysis === null
    ? [{ path: '$', code: 'OUTPUT_NOT_AN_OBJECT',
      reason: 'the tool-call payload is not an object' }]
    : conformsToContract252(normalization.analysis, closeObjectNodes252(wireSchema));
  return {
    normalization,
    violations,
    codes: [...new Set(violations.map(v => v.code))],
    conforms: violations.length === 0,
    analysis: normalization.analysis,
  };
}

/**
 * THE VERDICT RULE. Takes the results the entry point already computed and states the disposition.
 *
 * It runs no projection of its own, so there is exactly one composition of the pipeline and the
 * production path and every validation harness necessarily exercise the same one.
 */
export interface AdmissionVerdictInput252 {
  readonly rawToolInput: unknown;
  readonly gate: ConformanceGateResult252;
  readonly postureAdmitted: boolean;
  /** The posture object §239 admitted, or null. Audited for invention. */
  readonly admittedPosture: unknown;
  readonly roleJustificationAdmitted: boolean;
  readonly declarationRefusalCount: number;
  /** The RR-7 records §205 preserved. Their model-authored surface is audited for invention. */
  readonly preservedRecords: readonly unknown[];
}

export interface AdmissionVerdict252 {
  readonly version: typeof ADMISSION_252_VERSION;
  readonly outcome: AdmissionOutcome252;
  readonly admitted: boolean;
  readonly conformance: readonly ConformanceViolation252[];
  readonly conformanceCodes: readonly ConformanceCode252[];
  readonly preservedUnresolvedCount: number;
  /** Must always be empty. Non-empty is a defect in this module, not a property of the output. */
  readonly semanticInventions: readonly string[];
}

export function decideAdmission252(v: AdmissionVerdictInput252): AdmissionVerdict252 {
  /**
   * WHAT "ADMITTED" MEANS, AND WHY A REFUSED DECLARATION DOES NOT REFUSE THE ANALYSIS.
   *
   * The canonical analysis enters state when the output satisfies the contract, the posture
   * projection admits it, and every basis entry justified its role. A single malformed declaration
   * is CONTAINED at the declaration level exactly as it was before §252: it never enters canonical
   * state, it is reported, and RR-7 preserves any property it identified.
   *
   * Escalating one contained declaration refusal into a refusal of the whole analysis would be
   * over-restriction rather than extra safety. It would withdraw a correct posture from the user
   * because a neighbouring declaration was malformed, and §252 changes containment, not conservatism.
   */
  const admitted = v.gate.conforms && v.postureAdmitted && v.roleJustificationAdmitted;

  const semanticInventions = auditSemanticInvention252(
    v.rawToolInput, admitted ? v.admittedPosture : null, v.preservedRecords);

  /**
   * PRESERVE_UNRESOLVED outranks the other two whenever RR-7 actually preserved something, because
   * "this output lost no unresolved truth" is the fact a reader most needs and it must not be
   * hidden behind either an ADMIT or a bare REFUSE.
   */
  const preservedUnresolvedCount = v.preservedRecords.length;
  const outcome: AdmissionOutcome252 = preservedUnresolvedCount > 0
    ? 'PRESERVE_UNRESOLVED' : (admitted ? 'ADMIT' : 'REFUSE');

  return {
    version: ADMISSION_252_VERSION,
    outcome,
    admitted,
    conformance: v.gate.violations,
    conformanceCodes: v.gate.codes,
    preservedUnresolvedCount,
    semanticInventions,
  };
}

/** What this module does and does not do, as data, so a report cannot overstate it. */
export function admissionIdentity252(): Record<string, unknown> {
  return {
    version: ADMISSION_252_VERSION,
    outcomes: [...ADMISSION_OUTCOMES_252],
    conformanceCodes: [...CONFORMANCE_CODES_252],
    validatesWholeOutputAgainstTheContract: true,
    validatesUnionBranches: true,
    validatesNullability: true,
    closesEveryObjectNode: true,
    delegatesNormalizationTo235: true,
    composesNoProjectionOfItsOwn: true,
    onePipelineCompositionSharedByProductionAndValidation: true,
    editsNoProtectedModule: true,
    inventsSemanticFields: false,
    selectsADriverRole: false,
    infersAProperty: false,
    createsARequiredControl: false,
    readsProseForMeaning: false,
    repairsMalformedOutput: false,
  };
}
