/**
 * §202 -- EFFECTIVE GRAMMAR IDENTITY. AN ADDITIVE SUCCESSOR TO §201. ZERO PROVIDER CALLS.
 *
 * ==================== WHAT THIS IS, AND WHAT IT IS EMPHATICALLY NOT ====================
 *
 * THIS IS A PROXY. It is NOT the provider's compiled-grammar identity and no claim in this
 * repository may say that it is. The provider compiles a grammar inside its own service, from its
 * own JSON-Schema subset, under its own size metric; none of that is observable from here and none
 * of it is stable across provider versions. What this module computes is an EQUIVALENCE CLASS OVER
 * OUR OWN REQUESTS, designed so that two requests in one class are as alike as we can determine
 * offline in every respect a grammar compiler is known to read, and different in respects it is
 * known not to read.
 *
 * The only claim that may be made about it is the one that was measured: over the twelve recorded
 * §199 first-pass requests, this identity puts the ten capability-ABSENT rows in one class and the
 * two capability-PRESENT rows in another, which is exactly the partition the observed grammar-size
 * rejection followed. That is agreement on one cohort of twelve, not a proof of equality.
 *
 * ==================== THE DEFECT THIS FIXES, WHICH IS §201's AND NOT §200's ====================
 *
 * §200 recommended a stage-local memory keyed on `requestContractId`. §201 established that this
 * would not have caught SG-02: §199 set `requestContractId` to `sha(stableStringify(wireSchema))`
 * and the vNext wire schema is built PER ROW, so the two rows carrying the identical grammar-size
 * fault carried DIFFERENT contract ids -- d0713f36696e8bea and 243bb6766c05599f, verbatim from
 * CIRCUIT-BREAKER-LOG.jsonl and reproduced offline by this section's suite.
 *
 * §201 therefore introduced `grammarShapeOf`, which erases every leaf scalar VALUE to its
 * JavaScript type and keeps object keys, nesting and array arity. That was the right idea and its
 * measured partition of the §199 cohort is correct. But the erasure is applied BLINDLY, and a JSON
 * Schema's most grammar-relevant information lives precisely in leaf scalars:
 *
 *   MEASURED, by this section, against the §201 module as it stands:
 *     effectiveGrammarIdentity({type:'string'}) === effectiveGrammarIdentity({type:'number'})   TRUE
 *     ... additionalProperties:false  ===  additionalProperties:true                            TRUE
 *     ... pattern:'^a$'              ===  pattern:'^[0-9]{40}$'                                 TRUE
 *
 * Those are FALSE EQUIVALENCES, and they run in the dangerous direction. A coarse identity causes a
 * row to be SKIPPED that might have succeeded; that costs one unexercised row at $0.00 and is
 * recorded as unexercised. But a false equivalence on `type`, `pattern` or `additionalProperties`
 * means a genuinely DIFFERENT grammar is declared already-rejected, and the harness stops
 * exercising a capability it never actually tested. §201's own stated risk calculus assumed the
 * identity was faithful about structure; on these three keywords it is not.
 *
 * §201 also splits where it should not: `description` PRESENT vs ABSENT changes its identity
 * (measured TRUE for the difference), while `description` CONTENT does not. A description is an
 * annotation. Whether one is attached to a property is not a fact about the accepted language.
 *
 * ==================== THE RULES, STATED EXACTLY ====================
 *
 * The projection walks the schema and classifies every position into one of four kinds. The
 * classification is by SCHEMA KEYWORD, never by value shape, because "erase every leaf" cannot tell
 * the enum member `"OBS-SG-01"` (data) from the type name `"string"` (grammar).
 *
 *  1. GRAMMAR-LITERAL KEYWORDS -- value KEPT VERBATIM, whatever its shape.
 *     type, format, pattern, const, $ref, minLength, maxLength, minimum, maximum,
 *     exclusiveMinimum, exclusiveMaximum, multipleOf, minItems, maxItems, minProperties,
 *     maxProperties, uniqueItems, nullable, strict, contentEncoding, contentMediaType.
 *     Every one of these changes WHICH STRINGS ARE ACCEPTED. A grammar compiler that ignored them
 *     would be accepting a different language than the schema describes.
 *
 *  2. SUBSCHEMA-OR-BOOLEAN KEYWORDS -- additionalProperties, additionalItems.
 *     Kept verbatim when boolean (the common and load-bearing case: `false` closes the object and
 *     is what makes the §198 capability omission enforceable at the transport). Recursed when an
 *     object, because then it is a subschema and its own annotations should be erased too.
 *
 *  3. ANNOTATION KEYWORDS -- KEY AND VALUE DROPPED ENTIRELY.
 *     description, title, $comment, examples, default, deprecated, readOnly, writeOnly,
 *     $schema, $id, definitions-free prose. These are passed to the model as natural language and
 *     are not part of the accepted language. Dropping the KEY as well as the value is the
 *     correction to §201: presence and absence of an annotation are equally irrelevant.
 *
 *     THE COST OF THIS RULE, STATED PLAINLY AND NOT BURIED: the §199 capability-transport diagnosis
 *     lists "materially shorten the vNext schema descriptions" as remediation Option A. Under this
 *     projection, shortening every description changes NOTHING about the identity. If Option A were
 *     applied and the request then succeeded, a cache carrying an identity established before the
 *     change would wrongly suppress it. That is why `expert-202-rejection-cache.ts` is RUN-SCOPED by
 *     construction and refuses to be shared across run scopes: within one run the treatment is
 *     frozen by preregistration and cannot be shortened mid-flight, and a run under a new treatment
 *     starts with an empty cache. The limitation is real and it is handled by scoping, not by
 *     pretending the projection can see it.
 *
 *  4. ENUM -- ARITY AND MEMBER KINDS KEPT, MEMBER VALUES ERASED.
 *     `enum: ['OBS-SF-01']` and `enum: ['OBS-SG-01']` are ONE class: the scenario changed, the
 *     grammar did not. `enum` of three and `enum` of nine are DIFFERENT classes: a grammar with
 *     three literal alternatives is not a grammar with nine. This is the rule the §202 requirement
 *     names directly -- structure, property names, nesting, keywords and array arity are
 *     grammar-relevant; leaf scalar values are not.
 *
 *  5. `required` -- MEMBER NAMES KEPT, ORDER NORMALISED.
 *     Its members are PROPERTY NAMES, which are grammar-relevant, so they are kept verbatim. Its
 *     ORDER is not: `required` denotes a set. Sorting it means a builder that emits the same set in
 *     a different order does not manufacture a false difference. This is what makes the §198
 *     capability split visible in the identity -- eleven required names against twelve.
 *
 *  6. EVERYTHING ELSE -- object keys kept and sorted; array order and arity kept; any remaining
 *     leaf scalar erased to its KIND (`@string`, `@number`, `@boolean`, `@null`). After rules 1-5
 *     this branch is nearly unreachable in a well-formed JSON Schema, and it exists so that an
 *     unrecognised extension keyword degrades to §201's behaviour rather than to a crash.
 *
 * ==================== WHERE THIS IS UNCERTAIN, WRITTEN DOWN RATHER THAN IMPLIED ====================
 *
 * Held as data in `EFFECTIVE_GRAMMAR_IDENTITY_LIMITS` so that a reader of the evidence sees the
 * limits next to the result, and so a future section can assert that the list has not silently
 * shrunk. In prose, the four that matter most:
 *
 *   (a) ENUM MEMBER LENGTH IS INVISIBLE. The §199 diagnosis measured that an enum-constrained array
 *       of strings "adds disproportionately" to grammar complexity. Length plausibly contributes to
 *       the provider's size metric, and this projection erases it. Two schemas identical except
 *       that one enum's members are ten characters and the other's are two hundred are ONE class
 *       here and might be two for the provider.
 *   (b) DESCRIPTION LENGTH IS INVISIBLE -- see rule 3 and its stated cost.
 *   (c) THE PROVIDER'S SIZE METRIC IS UNKNOWN. §199 measured a 433-byte margin between an accepted
 *       and a rejected request and concluded byte size is NOT the metric. We do not know what is.
 *       An identity cannot be faithful to a function nobody has.
 *   (d) IT IS COMPUTED ON THE SCHEMA WE HAND THE TRANSPORT, and which schema that is matters. §199
 *       keyed its contract id on the WIRE schema, before `applyStrictSchemaWrapper` and
 *       `stripAnthropicUnsupportedKeywords`. The provider compiles the SENT schema. This module
 *       takes whichever it is given and does not choose; `describeGrammarProjection` records which
 *       one a caller used, and the §202 suite measures BOTH and reports that the §199 partition is
 *       10/2 either way.
 */

import { createHash } from 'crypto';

export const EFFECTIVE_GRAMMAR_IDENTITY_VERSION =
  'hazlenz.expert.202.effective-grammar-identity.v1' as const;

/**
 * The disclaimer, held in code so it cannot be dropped from a report by omission.
 *
 * Any artifact that quotes an identity from this module is expected to quote this alongside it.
 */
export const EFFECTIVE_GRAMMAR_IDENTITY_IS_A_PROXY: string =
  'PROXY, NOT THE PROVIDER\'S COMPILED-GRAMMAR IDENTITY. This value is an equivalence class over '
  + 'OUR OWN request schemas, computed offline from the schema keywords a grammar compiler is known '
  + 'to read. The provider\'s compiled grammar is built inside its service under a size metric we '
  + 'have never observed — §199 measured a 433-byte margin between an accepted and a rejected '
  + 'request and concluded that byte size is not that metric. Agreement with provider behaviour has '
  + 'been measured on exactly one cohort of twelve recorded §199 requests. It is agreement, not '
  + 'equality, and it must never be reported as equality.';

const sha256 = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

// ===========================================================================================
// 1. THE KEYWORD CLASSIFICATION
// ===========================================================================================

/** Rule 1. The value is kept verbatim because it decides which strings are accepted. */
export const GRAMMAR_LITERAL_KEYWORDS: ReadonlySet<string> = new Set([
  'type', 'format', 'pattern', 'const', '$ref',
  'minLength', 'maxLength', 'minimum', 'maximum',
  'exclusiveMinimum', 'exclusiveMaximum', 'multipleOf',
  'minItems', 'maxItems', 'minProperties', 'maxProperties',
  'uniqueItems', 'nullable', 'strict', 'contentEncoding', 'contentMediaType',
]);

/** Rule 2. Boolean form is grammar-literal; object form is a subschema and is recursed. */
export const SUBSCHEMA_OR_BOOLEAN_KEYWORDS: ReadonlySet<string> = new Set([
  'additionalProperties', 'additionalItems',
]);

/** Rule 3. Dropped whole — key and value. Natural-language annotation, not accepted language. */
export const ANNOTATION_KEYWORDS: ReadonlySet<string> = new Set([
  'description', 'title', '$comment', 'examples', 'default',
  'deprecated', 'readOnly', 'writeOnly', '$schema', '$id',
]);

/** Rule 4. Arity and member kinds survive; member values do not. */
export const ENUM_KEYWORD = 'enum' as const;

/** Rule 5. A set of property names: members kept verbatim, order normalised. */
export const NAME_SET_KEYWORDS: ReadonlySet<string> = new Set(['required']);

/**
 * A position where a KEYWORD NAME could also be a legitimate PROPERTY NAME.
 *
 * `properties` and `patternProperties` map property names to subschemas. A property genuinely named
 * `type` or `required` must NOT be classified as the keyword of that name. The walker tracks
 * whether it is inside such a map and suspends keyword classification for exactly one level, which
 * is the only place the two vocabularies can collide.
 */
export const PROPERTY_NAME_MAP_KEYWORDS: ReadonlySet<string> = new Set([
  'properties', 'patternProperties', 'definitions', '$defs', 'dependentSchemas',
]);

const kindOf = (v: unknown): string => {
  if (v === null) return '@null';
  if (Array.isArray(v)) return '@array';
  return `@${typeof v}`;
};

/** Key-sorted JSON. Internal fingerprint only; never compared against a frozen external hash. */
export function canonicalJson(value: unknown): string {
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
 * `keyword` is the schema keyword whose value this node is, or `null` at the root. `inNameMap` is
 * true when this node's OWN KEYS are property names rather than schema keywords -- see
 * `PROPERTY_NAME_MAP_KEYWORDS`.
 */
export function grammarProjection(
  node: unknown, keyword: string | null = null, inNameMap = false,
): unknown {
  // ---- rule 4: enum. Arity and member kinds; never member values.
  if (!inNameMap && keyword === ENUM_KEYWORD && Array.isArray(node)) {
    const kinds = Array.from(new Set(node.map(kindOf))).sort();
    return { '@enumAlternatives': node.length, '@enumMemberKinds': kinds };
  }

  // ---- rule 5: required. Names verbatim, order normalised, duplicates preserved as a count.
  if (!inNameMap && keyword !== null && NAME_SET_KEYWORDS.has(keyword) && Array.isArray(node)) {
    const names = node.map(m => (typeof m === 'string' ? m : kindOf(m))).sort();
    return { '@nameSet': names };
  }

  // ---- rule 1: grammar-literal. Verbatim, whatever the shape.
  if (!inNameMap && keyword !== null && GRAMMAR_LITERAL_KEYWORDS.has(keyword)) {
    return { '@literal': canonicalJson(node) };
  }

  // ---- rule 2: subschema-or-boolean.
  if (!inNameMap && keyword !== null && SUBSCHEMA_OR_BOOLEAN_KEYWORDS.has(keyword)
      && typeof node === 'boolean') {
    return { '@literal': canonicalJson(node) };
  }

  // ---- rule 6: arrays keep order and arity; every element is a schema position, not a keyword one.
  if (Array.isArray(node)) return node.map(v => grammarProjection(v, null, false));

  // ---- objects.
  if (node !== null && typeof node === 'object') {
    const src = node as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(src).sort()) {
      // rule 3: annotations are dropped whole. Suspended inside a property-name map, where a
      // property may legitimately be called `title` or `default`.
      if (!inNameMap && ANNOTATION_KEYWORDS.has(k)) continue;
      const childInNameMap = !inNameMap && PROPERTY_NAME_MAP_KEYWORDS.has(k);
      out[k] = grammarProjection(src[k], inNameMap ? null : k, childInNameMap);
    }
    return out;
  }

  // ---- rule 6: any remaining leaf scalar is data. Erased to its kind, as §201 did.
  return kindOf(node);
}

/** The identity itself. Sixteen hex characters, matching the width §198/§199/§201 already use. */
export function effectiveGrammarIdentity(schema: unknown): string {
  return sha256(canonicalJson(grammarProjection(schema))).slice(0, 16);
}

/** Which schema a caller measured. Recorded, never guessed — see limit (d). */
export type MeasuredSchemaStage = 'WIRE_SCHEMA_BEFORE_TRANSPORT_ADAPTATION' | 'SENT_SCHEMA_AS_TRANSMITTED';

export interface GrammarProjectionDescription {
  readonly version: string;
  readonly measuredSchemaStage: MeasuredSchemaStage;
  readonly identity: string;
  readonly projectionBytes: number;
  readonly isProxy: string;
}

/**
 * The identity plus everything a reader needs in order not to over-read it.
 *
 * Deliberately returns the disclaimer as a FIELD rather than leaving it to a report author, for the
 * same reason §198 returned `null` from `preInferenceSignature` instead of setting a flag: an
 * omission should be visible in the artifact rather than invisible in a habit.
 */
export function describeGrammarProjection(
  schema: unknown, measuredSchemaStage: MeasuredSchemaStage,
): GrammarProjectionDescription {
  const projection = canonicalJson(grammarProjection(schema));
  return {
    version: EFFECTIVE_GRAMMAR_IDENTITY_VERSION,
    measuredSchemaStage,
    identity: sha256(projection).slice(0, 16),
    projectionBytes: Buffer.byteLength(projection, 'utf8'),
    isProxy: EFFECTIVE_GRAMMAR_IDENTITY_IS_A_PROXY,
  };
}

// ===========================================================================================
// 3. PARTITIONING -- so a cohort's classes are a measurement and not an assertion
// ===========================================================================================

export interface GrammarPartitionMember {
  readonly memberId: string;
  readonly identity: string;
}

export interface GrammarPartition {
  readonly classCount: number;
  readonly classes: ReadonlyArray<{ readonly identity: string; readonly memberIds: readonly string[] }>;
  readonly identityByMemberId: Readonly<Record<string, string>>;
}

/** Group members by identity. Classes are ordered by first appearance so a report is stable. */
export function partitionByGrammarIdentity(
  members: readonly GrammarPartitionMember[],
): GrammarPartition {
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
// 4. THE RULES AND THE LIMITS, AS DATA
// ===========================================================================================

export interface EquivalenceRule {
  readonly id: string;
  readonly rule: string;
  readonly why: string;
  readonly errorItPrevents: string;
}

export const EFFECTIVE_GRAMMAR_IDENTITY_RULES: readonly EquivalenceRule[] = [
  {
    id: 'R1_GRAMMAR_LITERAL_KEPT',
    rule: 'the VALUE of type, format, pattern, const, $ref and every numeric/length/arity bound is '
      + 'kept verbatim.',
    why: 'each of them decides which strings are accepted. A projection that erased them would call '
      + 'two different languages one language.',
    errorItPrevents: 'FALSE EQUIVALENCE. §201 erased them: measured, {type:"string"} and '
      + '{type:"number"} carry the same §201 identity, and so do additionalProperties:false and '
      + 'additionalProperties:true. A cache keyed on that could declare a grammar already-rejected '
      + 'that was never tried.',
  },
  {
    id: 'R2_SUBSCHEMA_OR_BOOLEAN',
    rule: 'additionalProperties / additionalItems are verbatim when boolean and recursed when a '
      + 'subschema.',
    why: '`additionalProperties: false` is what closes the object, and it is what makes §198\'s '
      + 'capability OMISSION enforceable at the transport rather than only at the boundary.',
    errorItPrevents: 'collapsing an open object and a closed one into one class.',
  },
  {
    id: 'R3_ANNOTATIONS_DROPPED_WHOLE',
    rule: 'description, title, $comment, examples, default, deprecated, readOnly, writeOnly, '
      + '$schema and $id are removed — KEY AND VALUE.',
    why: 'they are natural language handed to the model, not part of the accepted language. '
      + 'Removing the key as well as the value is the §201 correction: §201 collapsed description '
      + 'CONTENT but split on description PRESENCE, which is the wrong way round.',
    errorItPrevents: 'a scenario-content difference — and any prompt-wording edit — manufacturing a '
      + 'false grammar difference. It is also the rule with the largest stated cost: see limit L2.',
  },
  {
    id: 'R4_ENUM_ARITY_NOT_VALUES',
    rule: 'an enum becomes its member COUNT plus the sorted set of member KINDS. Member values are '
      + 'erased.',
    why: 'the requirement is exactly this: array arity is grammar-relevant, leaf scalar values are '
      + 'not. Three literal alternatives and nine are different grammars; "OBS-SF-01" and '
      + '"OBS-SG-01" are the same grammar carrying different data.',
    errorItPrevents: 'the §200 defect itself — per-row source ids and per-row hazard-family values '
      + 'splitting one grammar into twelve identities.',
  },
  {
    id: 'R5_REQUIRED_IS_A_SET',
    rule: '`required` keeps its member NAMES verbatim and normalises their ORDER.',
    why: 'the members are property names, which are grammar-relevant; the order is not, because '
      + '`required` denotes a set.',
    errorItPrevents: 'a builder emitting the same set in a different order manufacturing a false '
      + 'difference — while still making the §198 capability split visible as eleven names against '
      + 'twelve.',
  },
  {
    id: 'R6_UNRECOGNISED_DEGRADES_TO_201',
    rule: 'anything not classified above keeps object keys (sorted), array order and arity, and '
      + 'erases a leaf scalar to its KIND.',
    why: 'an unrecognised extension keyword should degrade to §201\'s behaviour, which is coarse '
      + 'but safe, rather than crash or be silently dropped.',
    errorItPrevents: 'a schema-vocabulary change turning the identity function into a source of '
      + 'exceptions in the middle of a paid run.',
  },
  {
    id: 'R7_PROPERTY_NAME_MAPS_SUSPEND_KEYWORD_MEANING',
    rule: 'inside properties / patternProperties / definitions / $defs / dependentSchemas, the keys '
      + 'are PROPERTY NAMES and no keyword rule is applied to them for exactly one level.',
    why: 'a property may legitimately be called `type`, `required` or `description`.',
    errorItPrevents: 'a property named after a keyword being annotated away or frozen verbatim, '
      + 'which would be a silent corruption of the identity rather than a visible error.',
  },
];

export interface EquivalenceLimit {
  readonly id: string;
  readonly limit: string;
  readonly direction: 'COARSER_THAN_THE_PROVIDER' | 'FINER_THAN_THE_PROVIDER' | 'UNKNOWN_DIRECTION';
  readonly consequence: string;
  readonly handledBy: string;
}

export const EFFECTIVE_GRAMMAR_IDENTITY_LIMITS: readonly EquivalenceLimit[] = [
  {
    id: 'L1_ENUM_MEMBER_LENGTH_INVISIBLE',
    limit: 'enum member LENGTH is erased. Two schemas whose enums differ only in how long the '
      + 'member strings are carry one identity here.',
    direction: 'COARSER_THAN_THE_PROVIDER',
    consequence: 'a row could be skipped whose grammar was genuinely smaller and might have been '
      + 'accepted. Cost: one unexercised row at $0.00, recorded as NOT ISSUED.',
    handledBy: 'accepted deliberately. The §199 diagnosis measured a 433-byte margin and concluded '
      + 'byte size is not the provider metric, so a length-sensitive key would be guessing at a '
      + 'function nobody has.',
  },
  {
    id: 'L2_DESCRIPTION_LENGTH_INVISIBLE',
    limit: 'descriptions are dropped, so the §199 remediation Option A — "materially shorten the '
      + 'vNext schema descriptions" — produces the SAME identity.',
    direction: 'COARSER_THAN_THE_PROVIDER',
    consequence: 'a cache carrying an identity established under long descriptions would wrongly '
      + 'suppress a request built with short ones.',
    handledBy: 'the cache is RUN-SCOPED by construction: `expert-202-rejection-cache.ts` requires a '
      + 'runScopeId and refuses to merge across scopes. Within one run the treatment is frozen by '
      + 'preregistration and cannot be shortened mid-flight; a run under a new treatment starts '
      + 'empty.',
  },
  {
    id: 'L3_PROVIDER_SIZE_METRIC_UNKNOWN',
    limit: 'the provider\'s grammar-size metric has never been observed. This identity is faithful '
      + 'to STRUCTURE and cannot be faithful to a size function nobody has.',
    direction: 'UNKNOWN_DIRECTION',
    consequence: 'agreement with provider behaviour is measured on one cohort of twelve and is not '
      + 'proved in general.',
    handledBy: 'stated in EFFECTIVE_GRAMMAR_IDENTITY_IS_A_PROXY and returned as a field by '
      + 'describeGrammarProjection, so an artifact quoting an identity carries the caveat with it.',
  },
  {
    id: 'L4_WHICH_SCHEMA_IS_MEASURED_IS_THE_CALLER\'S_CHOICE',
    limit: '§199 keyed its contract id on the WIRE schema; the provider compiles the SENT schema '
      + '(after applyStrictSchemaWrapper and stripAnthropicUnsupportedKeywords).',
    direction: 'UNKNOWN_DIRECTION',
    consequence: 'measuring the wrong one would key the cache on something the provider never saw.',
    handledBy: 'the caller declares which via MeasuredSchemaStage and it is recorded in the '
      + 'description. The §202 suite measures BOTH over the §199 cohort and reports the partition '
      + 'for each; the SENT schema is the one the cache is expected to use, because it is the one '
      + 'the provider compiles.',
  },
  {
    id: 'L5_ARITY_VARIANCE_INSIDE_A_COHORT_CLASS',
    limit: 'the §199 partition is 10/2 partly because all twelve rows declare exactly three '
      + 'allowedHazardFamilies, so the hazardFamily enum has arity 3 throughout. A cohort whose '
      + 'rows varied that count would split further.',
    direction: 'FINER_THAN_THE_PROVIDER',
    consequence: 'a further split is CORRECT — a different enum arity is a different grammar — but '
      + 'it means the cache covers fewer subsequent rows than the 10/2 figure suggests. The 10/2 '
      + 'result is a property of THIS cohort, not of the identity function.',
    handledBy: 'reported as a measurement of the §199 cohort rather than as a general claim, and '
      + 'asserted by the §202 suite so a future cohort with varying arity is a visible change.',
  },
  {
    id: 'L6_NO_PROVIDER_EXERCISE',
    limit: 'nothing in §202 has been exercised against a provider. Every result here is replay '
      + 'against the recorded §199 log.',
    direction: 'UNKNOWN_DIRECTION',
    consequence: 'the cache\'s effect on a live run is INFERRED from replay, not measured.',
    handledBy: 'stated everywhere the replay result is reported. §202 made zero provider calls.',
  },
];
