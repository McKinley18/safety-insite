/**
 * §203 -- CANONICAL EFFECTIVE GRAMMAR IDENTITY. THE PROSPECTIVE REPLACEMENT FOR §201's PROTOTYPE.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOT REACHABLE FROM PRODUCTION.
 *
 * ==================== MANDATE (product-owner Ruling 7, §203) ====================
 *
 * The §201 grammar-identity implementation containing dangerous equivalences is RETIRED
 * PROSPECTIVELY. §201's `grammarShapeOf` erased grammar-relevant leaf scalars, so it merged
 * `{type:"string"}` with `{type:"number"}`, `additionalProperties:false` with
 * `additionalProperties:true`, and `pattern:"^a$"` with `pattern:"^[0-9]{40}$"`. A grammar identity
 * MUST NOT treat those as equivalent. This module is the canonical EFFECTIVE_GRAMMAR_IDENTITY for
 * prospective deterministic-contract-rejection caching. §201 and §202 modules are unmodified;
 * historical evidence keyed on them keeps meaning what it meant.
 *
 * ==================== RELATION TO §202 ====================
 *
 * §202 already corrected the three dangerous §201 equivalences and validated its projection against
 * the recorded §199 cohort. This module is the §203 canonical successor: it retains §202's keyword
 * classification where the §199 evidence supports it, is SELF-CONTAINED (no import from the §201 or
 * §202 modules, so retiring either cannot orphan this one), and closes the gaps §202 left open:
 *
 *   G1  `dependentRequired` -- under §202 its property-name arrays fell to the generic leaf rule and
 *       the NAMES WERE ERASED to '@string', merging `{a:["x"]}` with `{a:["y"]}`. Property names are
 *       grammar. §203 keeps the map keys as names and the array members as names (order normalised).
 *   G2  `unevaluatedProperties` / `unevaluatedItems` boolean forms fell to the generic leaf rule and
 *       were erased to '@boolean', merging `false` with `true` -- the same closed-vs-open collapse
 *       Ruling 7 forbids for `additionalProperties`. §203 classifies them subschema-or-boolean.
 *   G3  `minContains` / `maxContains` fell to the generic rule and their values were erased. §203
 *       classifies them grammar-literal.
 *   G4  union-alternative ORDER and the two NULLABLE representations had no declared decision. §203
 *       declares both (D2, D3 below).
 *   G5  no composed cache key existed binding identity + provider scope + rejection signature in one
 *       place. §202 found all three necessary; §203 exports the constructor.
 *   G6  the proxy claims existed as prose. §203 additionally carries them machine-readable
 *       (GRAMMAR_MEASUREMENT_CLAIMS_203), so a gate can assert them rather than trust a report.
 *
 * ==================== THE ENUM RULE, AND WHY IT IS MEASURED RATHER THAN ASSUMED ====================
 *
 * Ruling 7 requires every provider-grammar-relevant structural distinction we can deterministically
 * identify, and simultaneously that scenario data not affecting grammar must not fragment the
 * identity. For `enum` those requirements meet head-on: member values are literally part of the
 * accepted language, but in this architecture per-row scenario identifiers (`OBS-<rowId>` source
 * ids, per-row hazard-family sets) travel INSIDE enum members.
 *
 * MEASURED against the twelve recorded §199 requests (§203 suite, replayed offline):
 *
 *   - full member VALUES as identity  -> 12 classes of 12; SG-02 NOT suppressed after SG-01's
 *     rejection. That is the §200 defect reproduced verbatim.
 *   - member LENGTH profiles as identity -> the 10 accepted capability-ABSENT rows split into 6
 *     classes, and SG-01 / SG-02 (the two rows carrying the SAME recorded grammar-size fault) carry
 *     DIFFERENT length profiles, so SG-02 is again NOT suppressed.
 *   - member ARITY + member KINDS (this module's rule) -> exactly the 10 / 2 partition the recorded
 *     provider behaviour followed, and SG-02 is suppressed.
 *
 * So on the only recorded provider evidence this repository has, the provider's grammar-size
 * rejection followed enum STRUCTURE and not member content or length: ten rows with ten distinct
 * value digests and five distinct length profiles were all ACCEPTED as one behaviour class, and the
 * two rejected rows differ from each other in both values and lengths. Keeping arity + kinds and
 * erasing member values is therefore not a convenience -- it is the only candidate rule among the
 * three that reproduces the observed partition. The residual risk (a value- or length-sensitive
 * provider metric on some future schema family) is recorded as limits L1/L2 with the run-scoped
 * cache as the containment, exactly as §202 recorded it.
 *
 * ==================== DECLARED DECISIONS (each tested) ====================
 *
 *   D1  `type` ARRAYS ARE SETS. `["string","null"]` and `["null","string"]` accept the same
 *       language by JSON-Schema semantics, so the array is sorted before hashing. Every other
 *       grammar-literal value is kept verbatim.
 *   D2  UNION ALTERNATIVES KEEP THEIR ORDER. `anyOf:[A,B]` vs `anyOf:[B,A]` split. A union is
 *       semantically unordered, but whether the provider's compiler is order-insensitive has never
 *       been observed, and for a REJECTION cache the dangerous direction is the false MERGE (a
 *       would-be-accepted grammar inheriting a recorded rejection). When unsure, split. Recorded as
 *       limit L7, direction FINER_THAN_THE_PROVIDER.
 *   D3  THE TWO NULLABLE REPRESENTATIONS SPLIT. `{type:["string","null"]}` and
 *       `{type:"string", nullable:true}` may compile identically, but that equivalence has never
 *       been observed either. When unsure, split. Recorded as limit L8, direction FINER.
 *   D4  ANNOTATION KEYS AND VALUES ARE BOTH DROPPED (§202's correction to §201 retained): presence
 *       of a `description` is no more a grammar fact than its content.
 *   D5  `format` IS KEPT (grammar-literal). The Anthropic adapter strips unsupported keywords from
 *       the SENT schema; whether `format` survives is a property of the schema stage the caller
 *       hands in, not of this projection. Keeping it splits only where the caller's schema differs,
 *       which is the safe direction.
 *
 * ==================== WHAT THIS IS NOT ====================
 *
 * A PROXY. It is not the provider's compiled grammar and no §203 artifact may claim provider
 * equivalence beyond the observed/replayed evidence: agreement was measured on ONE cohort of twelve
 * recorded §199 requests. See EFFECTIVE_GRAMMAR_IDENTITY_203_IS_A_PROXY and
 * GRAMMAR_MEASUREMENT_CLAIMS_203, both exported as data.
 */

import { createHash } from 'crypto';

export const EFFECTIVE_GRAMMAR_IDENTITY_203_VERSION =
  'hazlenz.expert.203.effective-grammar-identity.v1' as const;

/** The §201 identity this module retires, named so the retirement is greppable and testable. */
export const RETIRES_PROSPECTIVELY =
  'hazlenz.expert.201.harness-hardening effectiveGrammarIdentity/grammarShapeOf' as const;

/** The disclaimer, held in code so it cannot be dropped from a report by omission. */
export const EFFECTIVE_GRAMMAR_IDENTITY_203_IS_A_PROXY: string =
  'PROXY, NOT THE PROVIDER\'S COMPILED-GRAMMAR IDENTITY. This value is an equivalence class over '
  + 'OUR OWN request schemas, computed offline from the schema keywords a grammar compiler is known '
  + 'to read. The provider\'s compiled grammar is built inside its service under a size metric we '
  + 'have never observed - §199 measured a 433-byte margin between an accepted and a rejected '
  + 'request and concluded that byte size is not that metric. Agreement with provider behaviour has '
  + 'been measured on exactly one cohort of twelve recorded §199 requests. It is agreement, not '
  + 'equality, and it must never be reported as equality.';

/**
 * Machine-readable proxy claims. A §203 gate may assert every member is `false`; none may ever be
 * flipped to `true` without a NEW, explicitly authorized provider measurement campaign.
 */
export const GRAMMAR_MEASUREMENT_CLAIMS_203 = {
  reproducesProviderCompiledGrammar: false,
  providerSizeMetricObserved: false,
  exercisedAgainstLiveProvider: false,
  agreementProvenBeyondRecorded199Cohort: false,
  licensesHostedGovernedTesting: false,
} as const;

const sha256 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

// ===========================================================================================
// 1. THE KEYWORD CLASSIFICATION
// ===========================================================================================

/** Kept verbatim (D1's type-array sort excepted): each decides which strings are accepted. */
export const GRAMMAR_LITERAL_KEYWORDS_203: ReadonlySet<string> = new Set([
  'type', 'format', 'pattern', 'const', '$ref',
  'minLength', 'maxLength', 'minimum', 'maximum',
  'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf',
  'minItems', 'maxItems', 'minProperties', 'maxProperties',
  'minContains', 'maxContains',                                    // G3: absent from §202
  'uniqueItems', 'nullable', 'strict', 'contentEncoding', 'contentMediaType',
]);

/** Verbatim when boolean (closed vs open object/array); recursed when a subschema. */
export const SUBSCHEMA_OR_BOOLEAN_KEYWORDS_203: ReadonlySet<string> = new Set([
  'additionalProperties', 'additionalItems',
  'unevaluatedProperties', 'unevaluatedItems',                     // G2: absent from §202
]);

/** Dropped whole -- key and value. Natural-language annotation, not accepted language (D4). */
export const ANNOTATION_KEYWORDS_203: ReadonlySet<string> = new Set([
  'description', 'title', '$comment', 'examples', 'default',
  'deprecated', 'readOnly', 'writeOnly', '$schema', '$id',
]);

/** Arity and member kinds survive; member values do not. See the measured justification above. */
export const ENUM_KEYWORD_203 = 'enum' as const;

/** Arrays whose members are PROPERTY NAMES: members kept verbatim, order normalised. */
export const NAME_SET_KEYWORDS_203: ReadonlySet<string> = new Set(['required']);

/**
 * G1: maps whose KEYS are property names and whose VALUES are arrays of property names.
 * Both sides are grammar; the value arrays denote sets and are order-normalised.
 */
export const NAME_TO_NAME_SET_MAP_KEYWORDS_203: ReadonlySet<string> = new Set(['dependentRequired']);

/**
 * Maps whose KEYS are property names (or patterns) and whose VALUES are subschemas. Keyword
 * classification is suspended for exactly one level so a property legitimately named `type`,
 * `required` or `description` is treated as a name, never as the keyword of that name.
 */
export const PROPERTY_NAME_MAP_KEYWORDS_203: ReadonlySet<string> = new Set([
  'properties', 'patternProperties', 'definitions', '$defs', 'dependentSchemas',
]);

/**
 * Union / alternative keywords. Their arrays keep ORDER and ARITY (D2). Listed explicitly so the
 * decision is visible and testable, though the generic array rule would already preserve both.
 */
export const ALTERNATIVE_KEYWORDS_203: ReadonlySet<string> = new Set(['anyOf', 'oneOf', 'allOf']);

const kindOf = (v: unknown): string => {
  if (v === null) return '@null';
  if (Array.isArray(v)) return '@array';
  return `@${typeof v}`;
};

/** Key-sorted JSON. Internal fingerprint only; never compared against a frozen external hash. */
export function canonicalJson203(value: unknown): string {
  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(walk);
    if (v !== null && typeof v === 'object') {
      const o: Record<string, unknown> = {};
      for (const k of Object.keys(v as Record<string, unknown>).sort()) {
        o[k] = walk((v as Record<string, unknown>)[k]);
      }
      return o;
    }
    return v;
  };
  return JSON.stringify(walk(value));
}

// ===========================================================================================
// 2. THE PROJECTION
// ===========================================================================================

/**
 * Reduce a schema to the structure a grammar compiler is known to read.
 *
 * `keyword` is the schema keyword whose value this node is, or `null` at the root or in any
 * position that is not a keyword's value (array elements, name-map values). `inNameMap` is true
 * when this node's OWN KEYS are property names rather than schema keywords.
 */
export function grammarProjection203(
  node: unknown, keyword: string | null = null, inNameMap = false,
): unknown {
  // ---- enum: arity and member kinds; never member values. The measured rule.
  if (!inNameMap && keyword === ENUM_KEYWORD_203 && Array.isArray(node)) {
    const kinds = Array.from(new Set(node.map(kindOf))).sort();
    return { '@enumAlternatives': node.length, '@enumMemberKinds': kinds };
  }

  // ---- required: names verbatim, order normalised.
  if (!inNameMap && keyword !== null && NAME_SET_KEYWORDS_203.has(keyword) && Array.isArray(node)) {
    const names = node.map(m => (typeof m === 'string' ? m : kindOf(m))).sort();
    return { '@nameSet': names };
  }

  // ---- G1: dependentRequired. Map keys are names; values are name sets, order normalised.
  if (!inNameMap && keyword !== null && NAME_TO_NAME_SET_MAP_KEYWORDS_203.has(keyword)
      && node !== null && typeof node === 'object' && !Array.isArray(node)) {
    const src = node as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const name of Object.keys(src).sort()) {
      const v = src[name];
      out[name] = Array.isArray(v)
        ? { '@nameSet': v.map(m => (typeof m === 'string' ? m : kindOf(m))).sort() }
        : kindOf(v);
    }
    return { '@nameToNameSetMap': out };
  }

  // ---- grammar-literal: verbatim, whatever the shape. D1: a `type` ARRAY is sorted (set).
  if (!inNameMap && keyword !== null && GRAMMAR_LITERAL_KEYWORDS_203.has(keyword)) {
    if (keyword === 'type' && Array.isArray(node) && node.every(t => typeof t === 'string')) {
      return { '@literal': canonicalJson203([...(node as string[])].sort()) };
    }
    return { '@literal': canonicalJson203(node) };
  }

  // ---- subschema-or-boolean: boolean form is grammar-literal; object form recurses below.
  if (!inNameMap && keyword !== null && SUBSCHEMA_OR_BOOLEAN_KEYWORDS_203.has(keyword)
      && typeof node === 'boolean') {
    return { '@literal': canonicalJson203(node) };
  }

  // ---- arrays keep order and arity (D2). Elements are schema positions, not keyword positions.
  if (Array.isArray(node)) return node.map(v => grammarProjection203(v, null, false));

  // ---- objects.
  if (node !== null && typeof node === 'object') {
    const src = node as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(src).sort()) {
      // D4: annotations dropped whole -- suspended inside a property-name map, where a property
      // may legitimately be called `title` or `default`.
      if (!inNameMap && ANNOTATION_KEYWORDS_203.has(k)) continue;
      const childInNameMap = !inNameMap && PROPERTY_NAME_MAP_KEYWORDS_203.has(k);
      out[k] = grammarProjection203(src[k], inNameMap ? null : k, childInNameMap);
    }
    return out;
  }

  // ---- any remaining leaf scalar is data: erased to its kind. Unrecognised extension keywords
  //      degrade to §201's coarse-but-structural behaviour rather than crash.
  return kindOf(node);
}

/** The identity itself. Sixteen hex characters, matching the width §198/§199/§201/§202 use. */
export function effectiveGrammarIdentity203(schema: unknown): string {
  return sha256(canonicalJson203(grammarProjection203(schema))).slice(0, 16);
}

/** Which schema a caller measured. Recorded, never guessed -- limit L4. */
export type MeasuredSchemaStage203 =
  | 'WIRE_SCHEMA_BEFORE_TRANSPORT_ADAPTATION'
  | 'SENT_SCHEMA_AS_TRANSMITTED';

export interface GrammarProjectionDescription203 {
  readonly version: string;
  readonly measuredSchemaStage: MeasuredSchemaStage203;
  readonly identity: string;
  readonly projectionBytes: number;
  readonly isProxy: string;
  readonly claims: typeof GRAMMAR_MEASUREMENT_CLAIMS_203;
}

/** The identity plus everything a reader needs in order not to over-read it. */
export function describeGrammarProjection203(
  schema: unknown, measuredSchemaStage: MeasuredSchemaStage203,
): GrammarProjectionDescription203 {
  const projection = canonicalJson203(grammarProjection203(schema));
  return {
    version: EFFECTIVE_GRAMMAR_IDENTITY_203_VERSION,
    measuredSchemaStage,
    identity: sha256(projection).slice(0, 16),
    projectionBytes: Buffer.byteLength(projection, 'utf8'),
    isProxy: EFFECTIVE_GRAMMAR_IDENTITY_203_IS_A_PROXY,
    claims: GRAMMAR_MEASUREMENT_CLAIMS_203,
  };
}

// ===========================================================================================
// 3. THE COMPOSED REJECTION-CACHE KEY (G5)
// ===========================================================================================

/**
 * §202 established that a grammar identity alone under-keys a rejection cache: a rejection is an
 * observation about (provider, model, schema-grammar, rejection class) under one run's frozen
 * treatment. This constructor binds all four. It does NOT include the run scope: run scoping is the
 * CACHE's containment (a cache instance refuses to outlive its run scope), not part of the key --
 * §202's rejection cache already enforces that by construction and this module does not weaken it.
 *
 * SAFETY DIRECTION, stated once and tested: for a REJECTION cache the dangerous direction is the
 * FALSE MERGE -- a request whose grammar the provider would ACCEPT sharing a key with a recorded
 * rejection, so the harness suppresses a request it never actually tested. Every uncertain design
 * decision in this module therefore resolves toward SPLITTING (D2, D3, D5). The false split merely
 * costs one cache miss.
 */
export interface GrammarRejectionScope203 {
  /** Transport / vendor, e.g. 'anthropic'. */
  readonly provider: string;
  /** Exact model identity the rejection was observed under. */
  readonly model: string;
  /** Deterministic rejection class, e.g. the §199 grammar-size signature. Never free prose. */
  readonly rejectionSignature: string;
}

export interface GrammarRejectionKey203 {
  readonly version: string;
  readonly key: string;
  readonly identity: string;
  readonly scope: GrammarRejectionScope203;
  readonly measuredSchemaStage: MeasuredSchemaStage203;
}

const scopeDefect = (name: string, v: string): string | null =>
  (typeof v !== 'string' || v.trim().length === 0) ? `${name} is blank` : null;

/** Blank scope members are refused loudly: an under-scoped key silently over-merges. */
export function grammarRejectionKey203(
  schema: unknown, scope: GrammarRejectionScope203, measuredSchemaStage: MeasuredSchemaStage203,
): GrammarRejectionKey203 {
  const defects = [
    scopeDefect('provider', scope.provider),
    scopeDefect('model', scope.model),
    scopeDefect('rejectionSignature', scope.rejectionSignature),
  ].filter((d): d is string => d !== null);
  if (defects.length > 0) {
    throw new Error(`GRAMMAR_REJECTION_KEY_SCOPE_DEFECT: ${defects.join('; ')}`);
  }
  const identity = effectiveGrammarIdentity203(schema);
  // STRUCTURAL ENCODING, NEVER A STRING JOIN. §203 Agent F demonstrated (AB203-5, by
  // execution) that the §202 cache key's delimiter join lets two distinct components collide
  // into ONE suppression key -- the false-MERGE direction for a rejection cache. JSON-encoding
  // the component ARRAY makes every component boundary explicit, so no component's content can
  // imitate another component's boundary.
  const key = sha256(JSON.stringify([
    EFFECTIVE_GRAMMAR_IDENTITY_203_VERSION,
    scope.provider, scope.model, scope.rejectionSignature,
    measuredSchemaStage, identity,
  ])).slice(0, 16);
  return { version: EFFECTIVE_GRAMMAR_IDENTITY_203_VERSION, key, identity, scope, measuredSchemaStage };
}

// ===========================================================================================
// 4. PARTITIONING -- so a cohort's classes are a measurement and not an assertion
// ===========================================================================================

export interface GrammarPartitionMember203 {
  readonly memberId: string;
  readonly identity: string;
}

export interface GrammarPartition203 {
  readonly classCount: number;
  readonly classes: ReadonlyArray<{ readonly identity: string; readonly memberIds: readonly string[] }>;
  readonly identityByMemberId: Readonly<Record<string, string>>;
}

/** Group members by identity. Classes ordered by first appearance so a report is stable. */
export function partitionByGrammarIdentity203(
  members: readonly GrammarPartitionMember203[],
): GrammarPartition203 {
  const order: string[] = [];
  const byIdentity = new Map<string, string[]>();
  const identityByMemberId: Record<string, string> = {};
  for (const m of members) {
    identityByMemberId[m.memberId] = m.identity;
    const existing = byIdentity.get(m.identity);
    if (existing === undefined) { order.push(m.identity); byIdentity.set(m.identity, [m.memberId]); }
    else existing.push(m.memberId);
  }
  return {
    classCount: order.length,
    classes: order.map(identity => ({ identity, memberIds: byIdentity.get(identity) ?? [] })),
    identityByMemberId,
  };
}

// ===========================================================================================
// 5. THE RULES AND THE LIMITS, AS DATA
// ===========================================================================================

export interface EquivalenceRule203 {
  readonly id: string;
  readonly rule: string;
  readonly why: string;
  readonly errorItPrevents: string;
}

export const EFFECTIVE_GRAMMAR_IDENTITY_203_RULES: readonly EquivalenceRule203[] = [
  {
    id: 'R1_GRAMMAR_LITERAL_KEPT',
    rule: 'type, format, pattern, const, $ref and every numeric/length/arity/contains bound are kept '
      + 'verbatim; a `type` ARRAY is sorted because it denotes a set (D1).',
    why: 'each decides which strings are accepted.',
    errorItPrevents: 'the retired §201 false equivalences: {type:"string"} vs {type:"number"}, '
      + 'pattern "^a$" vs "^[0-9]{40}$".',
  },
  {
    id: 'R2_SUBSCHEMA_OR_BOOLEAN',
    rule: 'additionalProperties, additionalItems, unevaluatedProperties and unevaluatedItems are '
      + 'verbatim when boolean and recursed when a subschema.',
    why: 'boolean false is what closes an object or array; unevaluated* were unclassified in §202 '
      + 'and their booleans were erased (G2).',
    errorItPrevents: 'collapsing an open object and a closed one into one class.',
  },
  {
    id: 'R3_ANNOTATIONS_DROPPED_WHOLE',
    rule: 'description, title, $comment, examples, default, deprecated, readOnly, writeOnly, '
      + '$schema and $id are removed -- KEY AND VALUE (D4).',
    why: 'natural language handed to the model is not part of the accepted language; presence is no '
      + 'more a grammar fact than content (§202\'s correction to §201, retained).',
    errorItPrevents: 'a prompt-wording edit manufacturing a false grammar difference. Cost recorded '
      + 'as limit L2.',
  },
  {
    id: 'R4_ENUM_ARITY_AND_KINDS_NOT_VALUES',
    rule: 'an enum becomes its member COUNT plus the sorted set of member KINDS; member values are '
      + 'erased.',
    why: 'MEASURED on the recorded §199 cohort: this is the only candidate rule (values / lengths / '
      + 'arity+kinds) that reproduces the observed 10/2 provider partition and suppresses SG-02 '
      + 'after SG-01\'s rejection. Value and length sensitivity each reproduce the §200 defect.',
    errorItPrevents: 'per-row scenario identifiers splitting one grammar into twelve identities.',
  },
  {
    id: 'R5_REQUIRED_IS_A_SET',
    rule: '`required` keeps member NAMES verbatim and normalises ORDER.',
    why: 'members are property names (grammar); order denotes nothing (set).',
    errorItPrevents: 'a builder emitting one set in a different order manufacturing a false '
      + 'difference, while the §198 capability split stays visible as eleven names vs twelve.',
  },
  {
    id: 'R6_DEPENDENT_REQUIRED_NAMES_KEPT',
    rule: '`dependentRequired` keeps its map keys and its array members as property names, arrays '
      + 'order-normalised (G1).',
    why: 'under §202 the name arrays fell to the generic leaf rule and were erased to @string, '
      + 'merging different dependency grammars.',
    errorItPrevents: 'a false MERGE in a grammar-relevant position -- the dangerous direction.',
  },
  {
    id: 'R7_PROPERTY_NAME_MAPS_SUSPEND_KEYWORD_MEANING',
    rule: 'inside properties / patternProperties / definitions / $defs / dependentSchemas, keys are '
      + 'PROPERTY NAMES and keyword rules are suspended for exactly one level.',
    why: 'a property may legitimately be called `type`, `required` or `description`.',
    errorItPrevents: 'a property named after a keyword being annotated away or frozen verbatim.',
  },
  {
    id: 'R8_ALTERNATIVES_KEEP_ORDER_AND_ARITY',
    rule: 'anyOf / oneOf / allOf arrays keep order and arity (D2); each alternative is recursed as '
      + 'a schema.',
    why: 'whether the provider compiles unions order-insensitively has never been observed; for a '
      + 'rejection cache the unsure case must SPLIT.',
    errorItPrevents: 'a reordered union inheriting a recorded rejection it never earned -- accepted '
      + 'as a false-split cost instead (limit L7).',
  },
  {
    id: 'R9_UNRECOGNISED_DEGRADES_TO_STRUCTURE',
    rule: 'anything unclassified keeps object keys (sorted), array order and arity, and erases leaf '
      + 'scalars to their KIND.',
    why: 'an unrecognised extension keyword should degrade to coarse-but-structural behaviour '
      + 'rather than crash mid-run.',
    errorItPrevents: 'a schema-vocabulary change turning the identity into an exception source.',
  },
];

export interface EquivalenceLimit203 {
  readonly id: string;
  readonly limit: string;
  readonly direction: 'COARSER_THAN_THE_PROVIDER' | 'FINER_THAN_THE_PROVIDER' | 'UNKNOWN_DIRECTION';
  readonly consequence: string;
  readonly handledBy: string;
}

export const EFFECTIVE_GRAMMAR_IDENTITY_203_LIMITS: readonly EquivalenceLimit203[] = [
  {
    id: 'L1_ENUM_MEMBER_CONTENT_INVISIBLE',
    limit: 'enum member VALUES and LENGTHS are erased. Two schemas whose enums differ only in '
      + 'member content or length carry one identity here.',
    direction: 'COARSER_THAN_THE_PROVIDER',
    consequence: 'if some future provider metric is content- or length-sensitive, a row could be '
      + 'suppressed whose grammar would have been accepted.',
    handledBy: 'measured, not assumed: on the recorded §199 cohort provider behaviour followed enum '
      + 'structure (10 accepts across 10 value digests and 6 length profiles; 2 rejects differing '
      + 'in both), and every content/length-sensitive alternative fails to suppress SG-02. Residual '
      + 'risk contained by the run-scoped cache.',
  },
  {
    id: 'L2_DESCRIPTION_LENGTH_INVISIBLE',
    limit: 'descriptions are dropped, so the §199 remediation Option A ("materially shorten the '
      + 'vNext schema descriptions") produces the SAME identity.',
    direction: 'COARSER_THAN_THE_PROVIDER',
    consequence: 'a cache identity established under long descriptions would wrongly suppress a '
      + 'request rebuilt with short ones.',
    handledBy: 'the cache is RUN-SCOPED by construction (§202 rejection cache): within one run the '
      + 'treatment is frozen by preregistration; a new treatment starts an empty cache.',
  },
  {
    id: 'L3_PROVIDER_SIZE_METRIC_UNKNOWN',
    limit: 'the provider\'s grammar-size metric has never been observed; this identity is faithful '
      + 'to STRUCTURE and cannot be faithful to a function nobody has.',
    direction: 'UNKNOWN_DIRECTION',
    consequence: 'agreement with provider behaviour is measured on one cohort of twelve and is not '
      + 'proved in general.',
    handledBy: 'EFFECTIVE_GRAMMAR_IDENTITY_203_IS_A_PROXY and GRAMMAR_MEASUREMENT_CLAIMS_203, '
      + 'returned as fields by describeGrammarProjection203.',
  },
  {
    id: 'L4_WHICH_SCHEMA_IS_MEASURED_IS_THE_CALLERS_CHOICE',
    limit: '§199 keyed its contract id on the WIRE schema; the provider compiles the SENT schema.',
    direction: 'UNKNOWN_DIRECTION',
    consequence: 'measuring the wrong stage keys the cache on something the provider never saw.',
    handledBy: 'the caller declares MeasuredSchemaStage203; it is recorded in the description AND '
      + 'bound into grammarRejectionKey203, so keys from different stages can never collide.',
  },
  {
    id: 'L5_ARITY_VARIANCE_INSIDE_A_COHORT_CLASS',
    limit: 'the §199 partition is 10/2 partly because all twelve rows declare exactly three '
      + 'allowedHazardFamilies. A cohort varying that count splits further.',
    direction: 'FINER_THAN_THE_PROVIDER',
    consequence: 'the cache covers fewer subsequent rows than the 10/2 figure suggests; 10/2 is a '
      + 'property of THIS cohort, not of the identity function.',
    handledBy: 'reported as a cohort measurement, asserted by the §203 suite.',
  },
  {
    id: 'L6_NO_PROVIDER_EXERCISE',
    limit: 'nothing in §203 has been exercised against a provider; every result is replay against '
      + 'the recorded §199 log.',
    direction: 'UNKNOWN_DIRECTION',
    consequence: 'the cache\'s effect on a live run is INFERRED from replay, not measured.',
    handledBy: 'stated wherever the replay result is reported. §203 made zero provider calls.',
  },
  {
    id: 'L7_ALTERNATIVE_ORDER_KEPT',
    limit: 'anyOf/oneOf/allOf order splits identities although a union is semantically unordered.',
    direction: 'FINER_THAN_THE_PROVIDER',
    consequence: 'a reordered but semantically identical union misses the cache and is re-issued.',
    handledBy: 'deliberate (D2): for a rejection cache the unsure case must split; the false-split '
      + 'cost is one cache miss.',
  },
  {
    id: 'L8_NULLABLE_REPRESENTATIONS_SPLIT',
    limit: '{type:["string","null"]} and {type:"string",nullable:true} carry different identities.',
    direction: 'FINER_THAN_THE_PROVIDER',
    consequence: 'a representation migration restarts the cache cold for affected schemas.',
    handledBy: 'deliberate (D3): their provider equivalence has never been observed.',
  },
];
