/**
 * §205 -- T1 REPAIR: TRUE APPEND SEMANTICS FOR ADJUDICATION ADDITIVE EVIDENCE.
 * ADJUDICATION / EVIDENCE-TOOLING INFRASTRUCTURE ONLY. NOT AN EXPERT SEMANTIC DEFECT.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * ==================== THE DEFECT (T1) ====================
 *
 * `recordAdditive` in `expert-202-adjudication-grouping.ts` performs
 *
 *     unit[field] = text;
 *
 * i.e. OVERWRITE, under a name and a surrounding contract that both say "additive". Every §204
 * batch therefore had to read the unit's current value and resubmit `prior + separator + new` by
 * hand. That mitigation held -- no §204 evidence was lost -- but it is a caller-side discipline
 * protecting an evidence-integrity invariant, which is exactly the kind of invariant that must not
 * depend on a caller remembering.
 *
 * ==================== WHY A NEW MODULE AND NOT AN EDIT IN PLACE ====================
 *
 * `ADJUDICATION-WORKSHEET-204.json` is recorded evidence for a completed 120/120 adjudication, and
 * its `reviewerNotes` fields currently hold text that the caller concatenated. If `recordAdditive`
 * were changed in place to append, replaying any historical batch would concatenate the already-
 * concatenated text a second time and silently corrupt the record it was meant to protect. So the
 * repair is a SUCCESSOR that:
 *
 *   1. stores additive evidence STRUCTURALLY, as an ordered list of entries carrying batch identity;
 *   2. derives the legacy flat `unit[field]` string from those entries as a READ VIEW, so every
 *      existing consumer keeps working unchanged;
 *   3. ADOPTS existing flat text as a single `LEGACY_FLAT` entry whose derived view is byte-identical
 *      to what was already there -- migration mutates nothing.
 *
 * The §202 function is left exactly as it is. Nothing rewrites the historical ledger; the ledger is
 * the independent record that made this defect recoverable in the first place.
 */

import {
  type AdditiveField, type ReviewUnitSummary, type Worksheet202,
  ADDITIVE_FIELDS, PRODUCT_OWNER_ATTRIBUTION,
} from './expert-202-adjudication-grouping';

export const ADDITIVE_APPEND_205_VERSION = 'hazlenz.expert.205.additive-append.v1' as const;

/**
 * The separator placed BETWEEN entries when the flat view is derived.
 *
 * It is the same rule the §204 caller applied by hand, so a two-entry derived view is byte-identical
 * to what caller-side concatenation would have produced. That equivalence is asserted by the suite,
 * not assumed, and it is what makes the flat field a genuine read view rather than a new format.
 */
export const ADDITIVE_ENTRY_SEPARATOR = `\n\n${'-'.repeat(78)}\n\n`;

/** The batch id recorded for text adopted from a pre-T1 flat field. Never used for a new append. */
export const LEGACY_ADOPTION_BATCH_ID = 'LEGACY_FLAT' as const;

export interface AdditiveEntry {
  /** 1-based, dense, and never reassigned. Order is the record; sorting by anything else is wrong. */
  readonly seq: number;
  readonly field: AdditiveField;
  readonly batchId: string;
  readonly text: string;
  readonly attribution: typeof PRODUCT_OWNER_ATTRIBUTION;
  readonly recordedAt: string;
  /** True only for text adopted from a pre-T1 flat field, so migration is visible forever. */
  readonly adoptedFromLegacyFlatField: boolean;
}

/** The unit shape after T1. The legacy fields remain and remain populated, as derived views. */
export interface AppendableReviewUnit extends ReviewUnitSummary {
  additiveEntries?: AdditiveEntry[];
}

export type AppendResult =
  | { readonly ok: true; readonly unit: AppendableReviewUnit; readonly entry: AdditiveEntry }
  | { readonly ok: false; readonly refusalCode: string; readonly detail: string };

/** Derive the flat read view for one field from the entry list, in `seq` order. */
export function deriveFlatView(
  entries: readonly AdditiveEntry[], field: AdditiveField,
): string | null {
  const mine = entries.filter(e => e.field === field).slice().sort((a, b) => a.seq - b.seq);
  if (mine.length === 0) return null;
  return mine.map(e => e.text).join(ADDITIVE_ENTRY_SEPARATOR);
}

/**
 * Adopt any pre-T1 flat text on a unit as a single `LEGACY_FLAT` entry.
 *
 * Idempotent, and byte-preserving by construction: one entry's derived view is that entry's text
 * with no separator, so `deriveFlatView` after adoption returns exactly the string that was already
 * in the field. Called automatically before every append, so no caller has to sequence a migration.
 */
export function adoptLegacyAdditiveText(
  unit: AppendableReviewUnit, recordedAt: string,
): AppendableReviewUnit {
  if (!Array.isArray(unit.additiveEntries)) unit.additiveEntries = [];
  for (const field of ADDITIVE_FIELDS) {
    const existing = unit[field];
    const alreadyHasEntries = unit.additiveEntries.some(e => e.field === field);
    if (typeof existing === 'string' && existing.length > 0 && !alreadyHasEntries) {
      unit.additiveEntries.push({
        seq: unit.additiveEntries.length + 1,
        field,
        batchId: LEGACY_ADOPTION_BATCH_ID,
        text: existing,
        attribution: PRODUCT_OWNER_ATTRIBUTION,
        recordedAt,
        adoptedFromLegacyFlatField: true,
      });
    }
  }
  return unit;
}

/**
 * TRUE APPEND. Adds one additive entry and refreshes the derived flat view.
 *
 * Refuses on exactly the §202 conditions -- attribution and field membership -- so no refusal the
 * frozen machinery performed is lost here, plus one T1-specific refusal for blank text, because an
 * empty append would create an entry that contributes a bare separator to the view and nothing else.
 *
 * NO CALLER-SIDE CONCATENATION IS REQUIRED OR PERMITTED. A caller that still passes
 * `prior + new` will store the prior text twice and the suite's `no-double-concatenation` case
 * exists to catch that in development.
 */
export function appendAdditive(
  worksheet: Worksheet202,
  unitId: string,
  field: AdditiveField,
  text: string,
  attribution: string,
  provenance: { readonly batchId: string; readonly recordedAt: string },
): AppendResult {
  if (attribution !== PRODUCT_OWNER_ATTRIBUTION) {
    return {
      ok: false,
      refusalCode: 'ATTRIBUTION_MUST_BE_PRODUCT_OWNER',
      detail: `attribution must be exactly "${PRODUCT_OWNER_ATTRIBUTION}"; received `
        + `${JSON.stringify(attribution)}.`,
    };
  }
  if (!(ADDITIVE_FIELDS as readonly string[]).includes(field)) {
    return {
      ok: false,
      refusalCode: 'UNKNOWN_ADDITIVE_FIELD',
      detail: `${JSON.stringify(field)} is not one of [${ADDITIVE_FIELDS.join(', ')}]`,
    };
  }
  if (typeof text !== 'string' || text.trim().length === 0) {
    return {
      ok: false,
      refusalCode: 'ADDITIVE_TEXT_BLANK',
      detail: 'an additive entry must carry non-blank text; a blank append would contribute a '
        + 'separator and no evidence',
    };
  }
  if (typeof provenance?.batchId !== 'string' || provenance.batchId.trim().length === 0) {
    return {
      ok: false,
      refusalCode: 'BATCH_IDENTITY_MISSING',
      detail: 'batch identity must remain visible on every additive entry',
    };
  }

  const unit = worksheet.reviewUnits.find(u => u.unitId === unitId) as
    AppendableReviewUnit | undefined;
  if (!unit) {
    return { ok: false, refusalCode: 'UNKNOWN_REVIEW_UNIT', detail: `no unit with id ${unitId}` };
  }

  adoptLegacyAdditiveText(unit, provenance.recordedAt);
  const entries = unit.additiveEntries as AdditiveEntry[];
  const entry: AdditiveEntry = {
    seq: entries.length + 1,
    field,
    batchId: provenance.batchId,
    text,
    attribution: PRODUCT_OWNER_ATTRIBUTION,
    recordedAt: provenance.recordedAt,
    adoptedFromLegacyFlatField: false,
  };
  entries.push(entry);
  unit[field] = deriveFlatView(entries, field);
  unit.additiveAttribution = PRODUCT_OWNER_ATTRIBUTION;
  return { ok: true, unit, entry };
}

/**
 * Replay verification. Given the text a unit held BEFORE a §205 append and the entries after it,
 * assert that no prior byte changed: the earlier text must still be an exact prefix of the derived
 * view, and every earlier entry must survive at its original `seq` with its original text.
 */
export function priorEvidenceIntact(
  priorFlatText: string | null,
  entriesAfter: readonly AdditiveEntry[],
  field: AdditiveField,
): { readonly intact: boolean; readonly reason: string } {
  const view = deriveFlatView(entriesAfter, field);
  if (priorFlatText === null || priorFlatText.length === 0) {
    return { intact: true, reason: 'no prior evidence existed for this field' };
  }
  if (view === null) return { intact: false, reason: 'prior evidence existed and the view is null' };
  if (!view.startsWith(priorFlatText)) {
    return { intact: false, reason: 'the prior text is no longer a prefix of the derived view' };
  }
  const occurrences = view.split(priorFlatText).length - 1;
  if (occurrences !== 1) {
    return {
      intact: false,
      reason: `the prior text appears ${occurrences} times in the derived view; caller-side `
        + 'concatenation was probably applied on top of true append',
    };
  }
  return { intact: true, reason: 'prior text survives exactly once, as a prefix' };
}

/** Asserted by the suite as literals. */
export function additiveAppendEffect(): {
  providerCalls: 0; databaseOperations: 0;
  overwritesPriorEvidence: false; mutatesHistoricalLedger: false;
  requiresCallerSideConcatenation: false; isAnExpertSemanticDefectRepair: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0,
    overwritesPriorEvidence: false, mutatesHistoricalLedger: false,
    requiresCallerSideConcatenation: false, isAnExpertSemanticDefectRepair: false,
  };
}
