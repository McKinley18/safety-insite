/**
 * §235 -- WIRE-SHAPE NORMALIZATION. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * §234 lost six of sixteen outputs to transport-shape variation rather than to any judgment about
 * safety. This module recovers the ones that can be recovered WITHOUT INVENTING OR REPAIRING A
 * SINGLE SEMANTIC FIELD, and refuses the rest.
 *
 * ==================== THE ONE RULE THAT GOVERNS EVERY LINE HERE ====================
 *
 *   >>> NORMALIZATION MAY CHANGE THE CONTAINER. IT MAY NEVER CHANGE THE CONTENT.
 *   >>>
 *   >>> Unwrapping an envelope and re-typing a JSON string are both statements about ENCODING.
 *   >>> Neither adds a field, removes a field, edits a value, guesses a posture, or resolves an
 *   >>> ambiguity. Where the encoding cannot be undone with certainty, the output STAYS BROKEN and
 *   >>> the analysis fails closed. A malformed safety state is never guessed into a good one.
 *
 * A parse is accepted only when the parsed value EXACTLY SATISFIES THE SCHEMA THAT WAS TRANSMITTED
 * for that field -- the schema as the model actually saw it, not a laxer local copy and not a
 * stricter one. `validateAgainstTransmittedSchema` below is a strict structural validator over the
 * JSON-Schema subset this programme transmits, and it is deliberately not a general-purpose one.
 *
 * Every action, and every refusal to act, is recorded in a typed normalization record that travels
 * with the projection result, so an auditor can see exactly what was and was not touched.
 */

import { createHash } from 'crypto';

export const NORMALIZATION_235_VERSION = 'hazlenz.expert.235.wire-normalization.v1' as const;

/** The §234 anomaly families, named as classes before any of them is acted on. */
export const WIRE_ANOMALY_CLASSES_235 = [
  'INERT_WRAPPER_ENVELOPE',
  'SELF_NAMED_FIELD_WRAPPER',
  'REQUIRED_ROOT_FIELD_ABSENT',
  'STRUCTURED_FIELD_ENCODED_AS_JSON_STRING',
  'MALFORMED_JSON_STRING',
  'OTHER',
] as const;
export type WireAnomalyClass235 = (typeof WIRE_ANOMALY_CLASSES_235)[number];

export const NORMALIZATION_ACTIONS_235 = [
  'UNWRAPPED_INERT_ENVELOPE',
  'PARSED_JSON_STRING_FIELD',
  'UNWRAPPED_SELF_NAMED_FIELD_WRAPPER',
  'REFUSED_AMBIGUOUS_ENVELOPE',
  'REFUSED_MALFORMED_JSON_STRING',
  'REFUSED_PARSED_VALUE_DOES_NOT_SATISFY_TRANSMITTED_SCHEMA',
  'LEFT_UNTOUCHED',
] as const;
export type NormalizationAction235 = (typeof NORMALIZATION_ACTIONS_235)[number];

/**
 * A CLOSED LITERAL SET, and closed on purpose.
 *
 * These are tool-call envelope keys observed or documented for this provider interface. A wrapper
 * key outside this set is NOT unwrapped, because "it looks like a wrapper" is a reading and this
 * module does not read. Adding a member is a deliberate contract act, not a maintenance detail.
 */
export const KNOWN_INERT_WRAPPER_KEYS_235: readonly string[] = [
  'parameters', 'parameter', 'parameter name', 'parameter_name', 'parameterName',
  'input', 'arguments', 'args',
];

/** Fields the §233/§235 projection actually reads. Nothing else is ever re-typed. */
export const NORMALIZABLE_FIELDS_235: readonly { field: string; kind: 'ARRAY' | 'OBJECT' }[] = [
  { field: 'expertHazardCandidates', kind: 'ARRAY' },
  { field: 'unresolvedFactDeclarations', kind: 'ARRAY' },
  { field: 'decisionCriticalClarifications', kind: 'ARRAY' },
  { field: 'immediateSafetyPosture', kind: 'OBJECT' },
];

// ================================================================ strict schema conformance

export interface SchemaViolation235 { path: string; reason: string }

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Strict structural conformance against the JSON-Schema subset this programme transmits:
 * `type`, `properties`, `required`, `additionalProperties: false`, `enum`, `items`, `minLength`,
 * `minItems`. Anything the subset does not cover is IGNORED rather than guessed at, and an
 * unrecognised `type` is a violation rather than a pass.
 *
 * It answers one question -- does this value exactly satisfy this schema -- and it never edits.
 */
export function validateAgainstTransmittedSchema(
  value: unknown, schema: unknown, path = '$',
): SchemaViolation235[] {
  if (!isPlainObject(schema)) return [{ path, reason: 'schema node is not an object' }];
  const out: SchemaViolation235[] = [];
  const t = schema.type;

  if (Array.isArray(schema.enum)) {
    if (!(schema.enum as unknown[]).some(x => x === value)) {
      out.push({ path, reason: `value is not a member of the transmitted enum` });
    }
  }

  switch (t) {
    case 'object': {
      if (!isPlainObject(value)) { out.push({ path, reason: 'expected an object' }); break; }
      const props = isPlainObject(schema.properties) ? schema.properties : {};
      const required = Array.isArray(schema.required) ? schema.required as string[] : [];
      for (const r of required) {
        if (!(r in value)) out.push({ path: `${path}.${r}`, reason: 'required property absent' });
      }
      if (schema.additionalProperties === false) {
        for (const k of Object.keys(value)) {
          if (!(k in props)) out.push({ path: `${path}.${k}`, reason: 'property not in the schema' });
        }
      }
      for (const [k, v] of Object.entries(value)) {
        if (k in props) out.push(...validateAgainstTransmittedSchema(v, props[k], `${path}.${k}`));
      }
      break;
    }
    case 'array': {
      if (!Array.isArray(value)) { out.push({ path, reason: 'expected an array' }); break; }
      if (typeof schema.minItems === 'number' && value.length < schema.minItems) {
        out.push({ path, reason: `fewer than the transmitted minItems` });
      }
      if (schema.items !== undefined) {
        value.forEach((v, i) =>
          out.push(...validateAgainstTransmittedSchema(v, schema.items, `${path}[${i}]`)));
      }
      break;
    }
    case 'string': {
      if (typeof value !== 'string') { out.push({ path, reason: 'expected a string' }); break; }
      if (typeof schema.minLength === 'number' && value.length < schema.minLength) {
        out.push({ path, reason: 'shorter than the transmitted minLength' });
      }
      break;
    }
    case 'number': case 'integer':
      if (typeof value !== 'number') out.push({ path, reason: 'expected a number' });
      break;
    case 'boolean':
      if (typeof value !== 'boolean') out.push({ path, reason: 'expected a boolean' });
      break;
    case undefined:
      // a node with no type constrains nothing in this subset; enum was already applied
      break;
    default:
      out.push({ path, reason: `unrecognised schema type ${String(t)}` });
  }
  return out;
}

// ================================================================ the normalization record

export interface FieldNormalization235 {
  readonly field: string;
  readonly action: NormalizationAction235;
  readonly anomaly: WireAnomalyClass235 | null;
  readonly detail: string;
}

export interface NormalizationResult235 {
  readonly version: typeof NORMALIZATION_235_VERSION;
  /** The analysis to project. Container changes only. Never a repaired or invented value. */
  readonly analysis: Record<string, unknown> | null;
  readonly anomaliesObserved: readonly WireAnomalyClass235[];
  readonly envelope: FieldNormalization235 | null;
  readonly fields: readonly FieldNormalization235[];
  readonly changedContainerOnly: true;
  readonly semanticFieldsInventedOrRepaired: 0;
  /** True when something was observed that this module refuses to undo. */
  readonly failsClosed: boolean;
  readonly failClosedReasons: readonly string[];
  readonly inputDigest: string;
  readonly outputDigest: string | null;
}

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

/**
 * The expected root field names, taken from the transmitted schema rather than from a local list,
 * so envelope detection cannot drift away from the contract.
 */
function rootFieldNames(transmittedSchema: unknown): string[] {
  if (!isPlainObject(transmittedSchema)) return [];
  const props = transmittedSchema.properties;
  return isPlainObject(props) ? Object.keys(props) : [];
}

/**
 * UNWRAP ONLY WHEN THE INTENDED ROOT OBJECT IS UNAMBIGUOUS.
 *
 * All four conditions must hold, and any one of them failing leaves the output exactly as it
 * arrived:
 *
 *   1  the outer object has EXACTLY ONE key;
 *   2  that key is a member of the closed inert-wrapper set;
 *   3  the outer object carries NO field the transmitted schema declares at the root;
 *   4  the inner value is an object that carries AT LEAST ONE field the schema declares at the root.
 *
 * Condition 3 is what makes it unambiguous: there is no root content outside the wrapper that could
 * be lost, so removing the wrapper cannot choose between two candidate roots.
 */
function unwrapEnvelope(
  raw: Record<string, unknown>, rootFields: readonly string[],
): { body: Record<string, unknown>; record: FieldNormalization235 | null } {
  const keys = Object.keys(raw);
  const carriesRootField = (o: Record<string, unknown>): boolean =>
    rootFields.some(f => f in o);

  if (keys.length !== 1) {
    return { body: raw, record: null };
  }
  const key = keys[0];
  if (!KNOWN_INERT_WRAPPER_KEYS_235.includes(key)) {
    return carriesRootField(raw) ? { body: raw, record: null } : {
      body: raw,
      record: { field: '$root', action: 'REFUSED_AMBIGUOUS_ENVELOPE',
        anomaly: 'OTHER',
        detail: `the output has a single root key "${key}" which is not a known inert wrapper and `
          + 'is not a declared root field. Nothing is unwrapped.' },
    };
  }
  const inner = raw[key];
  if (!isPlainObject(inner) || !carriesRootField(inner) || carriesRootField(raw)) {
    return {
      body: raw,
      record: { field: '$root', action: 'REFUSED_AMBIGUOUS_ENVELOPE',
        anomaly: 'INERT_WRAPPER_ENVELOPE',
        detail: `a "${key}" wrapper is present but the intended root object is not unambiguous. `
          + 'Nothing is unwrapped.' },
    };
  }
  return {
    body: inner,
    record: { field: '$root', action: 'UNWRAPPED_INERT_ENVELOPE',
      anomaly: 'INERT_WRAPPER_ENVELOPE',
      detail: `removed a single inert "${key}" wrapper. No field was added, removed or edited.` },
  };
}

/**
 * Normalize one provider tool-call payload against the schema that was transmitted with it.
 *
 * Returns the analysis to project, plus the full record of what was and was not done. A caller that
 * ignores `failsClosed` still gets a correct refusal from the projection, because nothing broken is
 * ever silently made whole here.
 */
export function normalizeExpertToolOutput235(
  raw: unknown, transmittedSchema: unknown,
): NormalizationResult235 {
  const inputDigest = sha(JSON.stringify(raw ?? null));
  const anomalies = new Set<WireAnomalyClass235>();
  const failClosedReasons: string[] = [];
  const fields: FieldNormalization235[] = [];

  if (!isPlainObject(raw)) {
    return {
      version: NORMALIZATION_235_VERSION, analysis: null,
      anomaliesObserved: ['OTHER'], envelope: null, fields: [],
      changedContainerOnly: true, semanticFieldsInventedOrRepaired: 0,
      failsClosed: true,
      failClosedReasons: ['the tool-call payload is not an object'],
      inputDigest, outputDigest: null,
    };
  }

  const rootFields = rootFieldNames(transmittedSchema);
  const { body, record: envelope } = unwrapEnvelope(raw, rootFields);
  if (envelope !== null) {
    if (envelope.anomaly !== null) anomalies.add(envelope.anomaly);
    if (envelope.action === 'REFUSED_AMBIGUOUS_ENVELOPE') {
      failClosedReasons.push(envelope.detail);
    }
  }

  // ---- required root fields the schema declares and the output does not carry.
  // NOTHING IS SUPPLIED FOR THEM. Their absence is an absence, and it fails closed downstream.
  const requiredRoot = isPlainObject(transmittedSchema) && Array.isArray(transmittedSchema.required)
    ? transmittedSchema.required as string[] : [];
  const absent = requiredRoot.filter(f => !(f in body));
  if (absent.length > 0) {
    anomalies.add('REQUIRED_ROOT_FIELD_ABSENT');
    failClosedReasons.push(`required root fields absent and NOT supplied: ${absent.join(', ')}`);
    fields.push({ field: absent.join(','), action: 'LEFT_UNTOUCHED',
      anomaly: 'REQUIRED_ROOT_FIELD_ABSENT',
      detail: 'absent from the output. Normalization does not invent a field.' });
  }

  // ---- structured fields encoded as JSON strings
  const props = isPlainObject(transmittedSchema) && isPlainObject(transmittedSchema.properties)
    ? transmittedSchema.properties : {};
  const out: Record<string, unknown> = { ...body };

  for (const { field, kind } of NORMALIZABLE_FIELDS_235) {
    const v = body[field];
    if (typeof v !== 'string') { continue; }
    anomalies.add('STRUCTURED_FIELD_ENCODED_AS_JSON_STRING');

    let parsed: unknown;
    try { parsed = JSON.parse(v); } catch (e) {
      anomalies.add('MALFORMED_JSON_STRING');
      const detail = `${field} arrived as a string that does not parse (${String(e)}). It is left `
        + 'exactly as received. Malformed safety state is never repaired into guessed content.';
      fields.push({ field, action: 'REFUSED_MALFORMED_JSON_STRING',
        anomaly: 'MALFORMED_JSON_STRING', detail });
      failClosedReasons.push(detail);
      continue;
    }

    /**
     * THE SELF-NAMING FIELD WRAPPER, and why undoing it is safe.
     *
     * Observed in §234 F3: `expertHazardCandidates` arrived as the string
     * `{"expertHazardCandidates":[ ... ]}`. The wrapper key is the FIELD'S OWN NAME, so there is no
     * second candidate for what the intended value is -- the disambiguation is stronger here than
     * for the root envelope, not weaker. All three conditions must hold: the parsed value is an
     * object, it has exactly one key, and that key is exactly this field's name. The unwrapped
     * value must then satisfy the transmitted schema like any other.
     *
     * DELIBERATELY NARROW. This applies only inside the JSON-string path, because that is the shape
     * §234 observed. A field that arrives as an unstringified self-named object is NOT unwrapped:
     * an unobserved normalization is speculative surface area on a safety boundary, and this module
     * does not add any.
     */
    let value: unknown = parsed;
    let selfNamed = false;
    if (isPlainObject(parsed)) {
      const ik = Object.keys(parsed);
      if (ik.length === 1 && ik[0] === field) {
        value = parsed[field];
        selfNamed = true;
        anomalies.add('SELF_NAMED_FIELD_WRAPPER');
      }
    }

    const kindOk = kind === 'ARRAY' ? Array.isArray(value) : isPlainObject(value);
    const schemaNode = (props as Record<string, unknown>)[field];
    const violations = kindOk && schemaNode !== undefined
      ? validateAgainstTransmittedSchema(value, schemaNode, `$.${field}`) : [];

    if (!kindOk || schemaNode === undefined || violations.length > 0) {
      const detail = !kindOk
        ? `${field} parses but is a ${Array.isArray(value) ? 'array' : typeof value}, not the `
          + `${kind.toLowerCase()} the contract declares. Left as received.`
        : schemaNode === undefined
          ? `${field} parses but the transmitted schema declares no node for it. Left as received.`
          : `${field} parses but does not exactly satisfy the transmitted schema `
            + `(${violations.length} violation(s), first at ${violations[0].path}: `
            + `${violations[0].reason}). Left as received.`;
      fields.push({ field, action: 'REFUSED_PARSED_VALUE_DOES_NOT_SATISFY_TRANSMITTED_SCHEMA',
        anomaly: selfNamed ? 'SELF_NAMED_FIELD_WRAPPER' : 'STRUCTURED_FIELD_ENCODED_AS_JSON_STRING',
        detail });
      failClosedReasons.push(detail);
      continue;
    }

    out[field] = value;
    fields.push({
      field,
      action: selfNamed ? 'UNWRAPPED_SELF_NAMED_FIELD_WRAPPER' : 'PARSED_JSON_STRING_FIELD',
      anomaly: selfNamed ? 'SELF_NAMED_FIELD_WRAPPER' : 'STRUCTURED_FIELD_ENCODED_AS_JSON_STRING',
      detail: selfNamed
        ? `${field} was transported as a JSON string holding a single object keyed by the field's `
          + 'own name. Both containers were removed and the value exactly satisfies the transmitted '
          + 'schema. No value was altered.'
        : `${field} was transported as a JSON string and parses to a value that exactly satisfies `
          + 'the transmitted schema. The container was re-typed; no value was altered.',
    });
  }

  return {
    version: NORMALIZATION_235_VERSION,
    analysis: out,
    anomaliesObserved: [...anomalies],
    envelope,
    fields,
    changedContainerOnly: true,
    semanticFieldsInventedOrRepaired: 0,
    failsClosed: failClosedReasons.length > 0,
    failClosedReasons,
    inputDigest,
    outputDigest: sha(JSON.stringify(out)),
  };
}

export function normalizationIdentity235(): Record<string, unknown> {
  return {
    version: NORMALIZATION_235_VERSION,
    anomalyClasses: [...WIRE_ANOMALY_CLASSES_235],
    actions: [...NORMALIZATION_ACTIONS_235],
    knownInertWrapperKeys: [...KNOWN_INERT_WRAPPER_KEYS_235],
    normalizableFields: NORMALIZABLE_FIELDS_235.map(f => f.field),
    unwrapsSelfNamedFieldWrapperInsideAJsonStringOnly: true,
    unwrapsUnstringifiedSelfNamedField: false,
    repairsMalformedJson: false,
    inventsSemanticFields: false,
    readsProseForMeaning: false,
    acceptsAParseOnlyIfItExactlySatisfiesTheTransmittedSchema: true,
  };
}
