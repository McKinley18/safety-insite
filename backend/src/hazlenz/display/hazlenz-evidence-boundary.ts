import { ClassifyDto } from '../dto/classify.dto';
import { readPersonNegation } from '../evidence/person-negation-semantics';

type StandardDecisionStatus =
  | 'applicable_after_human_review'
  | 'candidate_pending_evidence'
  | 'informational_reference';

function answerPreservesUncertainty(answer: unknown): boolean {
  const values = [
    (answer as any)?.answer,
    (answer as any)?.value,
    ...((answer as any)?.selectedOptions || []),
  ];
  return values.some((value) => /^(not sure|unknown|unable to determine|n\/a)$/i.test(String(value || '').trim()));
}

function standardCandidates(result: any): Array<Record<string, unknown>> {
  const records = [
    ...(Array.isArray(result?.primaryStandards) ? result.primaryStandards : []),
    ...(Array.isArray(result?.suggestedStandards) ? result.suggestedStandards : []),
    ...(Array.isArray(result?.standards) ? result.standards : []),
    // standardDecisions is the canonical, non-display-stripped citation list. The
    // controller invokes enforceHazLenzEvidenceBoundary twice (see
    // hazlenz.controller.ts classify()), with sanitizeHazLenzDisplayOutput
    // removing primaryStandards/suggestedStandards/standards in between (they are
    // deliberately hidden duplicate display fields). Without this source, the
    // second pass sees those three arrays empty and rebuilds standardDecisions
    // from nothing, discarding a correctly-resolved citation.
    ...(Array.isArray(result?.standardDecisions) ? result.standardDecisions : []),
  ];
  const seen = new Set<string>();
  const output: Array<Record<string, unknown>> = [];
  for (const record of records) {
    const citation = String(record?.citation || record?.standard || '').trim();
    if (!citation || seen.has(citation)) continue;
    seen.add(citation);
    output.push({
      citation,
      title: record?.title || null,
      standardText: record?.standardText || record?.text || null,
      source: record?.source || record?.authority || null,
      applicabilityStatus: record?.applicabilityStatus || record?.candidateStatus || null,
      // KG-3C. This projection is a fixed allowlist, and the controller applies this boundary
      // TWICE, so anything not listed here is silently dropped from the report-facing
      // `standardDecisions` on the second pass. `corpusBacked` was already being lost this way
      // before KG-3C -- which is why it never appeared in any API response despite being set.
      // The backing annotation must survive, because a consumer that cannot see it would have to
      // fall back to inferring authority from `sourceKey` or from the presence of text, which is
      // exactly the false-equivalence this slice removes. Carried through unchanged; no citation,
      // status, ordering or membership is affected.
      backingStatus: record?.backingStatus ?? null,
      contentDisclosure: record?.contentDisclosure ?? null,
      corpusBacked: record?.corpusBacked ?? null,
      sourceKey: record?.sourceKey ?? null,
      // KG-4A. Same reasoning as the KG-3C note above, one slice later. These four fields are
      // written by `hydrateFindingScopedStandards()` and would otherwise be dropped on the second
      // pass -- and `knowledgeReleaseId` in particular MUST survive, because it is the per-finding
      // record of which findings actually consumed governed content, and a mixed-provenance
      // analysis cannot be represented truthfully without it.
      //
      // Spread with `...(x !== undefined ? {...} : {})` rather than `?? null`, so that a LEGACY
      // payload gains no new keys at all -- not even null-valued ones. That is what keeps the
      // default response byte-identical to the pre-KG-4A one, which `test:kg4a-default-off`
      // asserts directly.
      ...(record?.governedDeliveryState !== undefined ? { governedDeliveryState: record.governedDeliveryState } : {}),
      ...(record?.governedFallbackReason !== undefined ? { governedFallbackReason: record.governedFallbackReason } : {}),
      ...(record?.governedTextUnavailable !== undefined ? { governedTextUnavailable: record.governedTextUnavailable } : {}),
      ...(record?.knowledgeReleaseId !== undefined ? { knowledgeReleaseId: record.knowledgeReleaseId } : {}),
    });
  }
  const primary = String(result?.primaryCitation || '').trim();
  if (primary && !seen.has(primary)) {
    // A citation recovered from `primaryCitation` alone has no corpus record behind it here, so
    // it is CITATION_ONLY by construction rather than by an absent field.
    output.unshift({
      citation: primary, title: null, standardText: null, source: null,
      backingStatus: 'CITATION_ONLY', contentDisclosure: 'NONE', corpusBacked: false, sourceKey: null,
    });
  }
  return output;
}

export function enforceHazLenzEvidenceBoundary(result: any, request: ClassifyDto): any {
  if (!result || typeof result !== 'object') return result;

  const observation = request.structuredObservation || {};
  const contradictions = observation.unresolvedContradictions || [];
  const unknownFacts = observation.unknownFacts || [];
  const uncertainAnswer = (request.clarificationAnswers || []).some(answerPreservesUncertainty);
  const safeEnergyState = ['deenergized', 'locked-out', 'stopped'].includes(String(observation.energyState || ''));
  const controlsPresent = observation.controlsPresent || [];
  const controlsMissing = observation.controlsMissing || [];
  /**
   * §300 / HZ-10 -- WHAT "NOBODY" ACTUALLY NEGATES, AT THE SECOND SITE THAT ASKED.
   *
   * ==================== THE DEFECT THIS REPLACES ====================
   *
   * This was an alternation whose members included the BARE words `nobody` and `no one`, anchored
   * to nothing about exposure -- byte-for-byte the same error §299 repaired in
   * `shared-evidence-facts.ts`, in a module downstream of everything §299 exercised. So every §299
   * proof passed while this stood, and the §300 HZ-9 live production run is what found it.
   *
   * ITS CONSEQUENCE WAS WORSE THAN HZ-4's. `affirmativelyNoExposure` alone sets
   * `affirmativelyControlled`, which sets `assessmentDisposition = 'controlled_condition'`, sets
   * `mustDemote` (emptying primaryCitation, primaryStandards, suggestedStandards and standards) and
   * OVERWRITES `result.risk` with riskScore 0 / Controlled / imminentDanger false /
   * requiresShutdown false. Measured in production on the §298 observation -- a worker three feet
   * from an unguarded twelve-foot opening with a ten-foot drop, no harness, no anchor points -- the
   * response came back CONTROLLED, riskScore 0, no shutdown required. Rewording only those two
   * words, with every hazard fact identical, returns Critical / 20 / imminentDanger true /
   * requiresShutdown true. HZ-4 suppressed the regulatory BASIS while the hazard stayed Critical;
   * this zeroed the HAZARD.
   *
   * ==================== THE REPAIR, AND WHY IT IS AN IMPORT ====================
   *
   * `readPersonNegation()` is reused rather than reimplemented. A third copy of the rule is how
   * there came to be a second one: §299 repaired the family in one module and nothing held the
   * others to it. `scripts/check-bare-person-negation.ts` now fails the build if a bare
   * `nobody`/`no one` alternation reappears anywhere in `backend/src`, so this cannot recur
   * silently a third time.
   *
   * ==================== WHAT IS DELIBERATELY KEPT ====================
   *
   * Only the PERSON-QUANTIFIER members moved. The rest of the alternation is unchanged because it
   * is not the same kind of claim:
   *
   *   "no ... exposure"                an explicit denial of exposure itself, not a quantifier
   *   "unoccupied"                     a genuine statement that nobody is there
   *   hypothetical / training example  the non-observation markers, the sibling of
   *   / "appears only" / quoted word   `quotedOrNonObservation` in the extractor
   *
   * Narrowing those would be a different change with different evidence behind it, and §300 scopes
   * this to the defect that was measured.
   */
  const personNegationDeniesExposure = readPersonNegation(request.text).negatesEmployeeExposure;
  const affirmativelyNoExposure =
    personNegationDeniesExposure ||
    /\b(no (?:active |current )?(?:employee |worker )?exposure|unoccupied|hypothetical|training example|appears only|word ['"][^'"]+['"] appears only)\b/i.test(request.text);
  /**
   * The second alternation carried the same two bare words and they are replaced the same way.
   *
   * The remaining members -- fenced, barricaded, locked, secured, passed, within, fully, complete,
   * closed -- are left alone and are NOT person quantifiers. They are also far more strongly gated:
   * this branch requires the structured observation to affirmatively state that controls ARE
   * present and that NONE are missing, which is a human assertion about controls rather than a word
   * appearing in prose. They are recorded here as a known coarseness, not repaired under §300.
   */
  const affirmativelyControlled =
    affirmativelyNoExposure ||
    (controlsPresent.length > 0 &&
      controlsMissing.length === 0 &&
      (safeEnergyState || personNegationDeniesExposure || /\b(no active exposure|no employee access|unoccupied|fenced|barricaded|locked|removed from service|passed|within|fully|complete|secured|restrained|closed)\b/i.test(request.text)));
  const evidenceIncomplete = contradictions.length > 0 || unknownFacts.length > 0 || uncertainAnswer;
  const mustDemote = affirmativelyControlled || evidenceIncomplete;
  const primary = String(result.primaryCitation || '').trim();
  const candidates = standardCandidates(result);
  const electricalOnlyObservation =
    /\b(electrical|cord|conductor|breaker|panel|wiring|temporary power|damaged insulation)\b/i.test(request.text) &&
    !/\b(fall|elevated|height|edge|opening|roof|scaffold|ladder|guardrail|platform)\b/i.test(request.text);
  if (electricalOnlyObservation) {
    const itemCitation = (item: any) => typeof item === 'string' ? item : String(item?.citation || item?.standard || '');
    const removeUnsupportedFall = (item: any) => !/1926\.501/i.test(itemCitation(item));
    if (/1926\.501/i.test(primary)) {
      result.candidatePrimaryCitation = primary;
      result.primaryCitation = '';
    }
    result.primaryStandards = (result.primaryStandards || []).filter(removeUnsupportedFall);
    result.suggestedStandards = (result.suggestedStandards || []).filter(removeUnsupportedFall);
    result.standards = (result.standards || []).filter(removeUnsupportedFall);
    result.standardDecisions = (result.standardDecisions || []).filter(removeUnsupportedFall);
    for (const key of ['suggestedCitations', 'supportingCitations', 'needsMoreEvidenceCitations', 'excludedCitations']) {
      if (Array.isArray(result.standardsTraceability?.[key])) {
        result.standardsTraceability[key] = result.standardsTraceability[key].filter(removeUnsupportedFall);
      }
    }
    if (Array.isArray(result.inspectionIntelligence?.candidateStandards)) {
      result.inspectionIntelligence.candidateStandards = result.inspectionIntelligence.candidateStandards.filter(removeUnsupportedFall);
    }
  }
  const status: StandardDecisionStatus =
    mustDemote ? 'candidate_pending_evidence' : 'applicable_after_human_review';

  result.assessmentDisposition =
    contradictions.length > 0 ? 'contradictory_evidence' :
    affirmativelyControlled ? 'controlled_condition' :
    evidenceIncomplete ? 'insufficient_evidence' : 'hazard_requires_human_review';
  result.regulatoryConclusion = {
    advisoryOnly: true,
    qualifiedHumanReviewRequired: true,
    violationDetermination: mustDemote ? 'not_determined' : 'pending_qualified_review',
    evidenceStatus:
      contradictions.length > 0 ? 'contradictory' :
      affirmativelyControlled ? 'controlled' :
      evidenceIncomplete ? 'incomplete' : 'sufficient_for_advisory_candidate',
  };
  result.standardDecisions = candidates.map((candidate) => ({
    ...candidate,
    status,
    // Vocabulary-consistent applicability signal (confirmed/probable/candidate/
    // needs-more-evidence/not-applicable) used by downstream consumers such as
    // ApplicableStandardsService.hydrateStandardReferences and the independent
    // standards audit -- distinct from `status` above, which is this module's
    // own human-facing review-state label.
    applicabilityStatus: mustDemote
      ? 'needs-more-evidence'
      : (candidate as any)?.applicabilityStatus === 'confirmed'
        ? 'confirmed'
        : 'probable',
    rationale: mustDemote
      ? 'Applicability is not promoted because the submitted evidence is controlled, incomplete, uncertain, or contradictory.'
      : 'The citation is advisory and must be confirmed against the facts, jurisdiction, and authoritative text by a qualified reviewer.',
  }));

  if (mustDemote && primary) {
    result.candidatePrimaryCitation = primary;
    result.primaryCitation = '';
  }
  if (mustDemote) {
    result.primaryStandards = [];
    result.suggestedStandards = [];
    result.standards = [];
  }
  if (affirmativelyControlled) {
    result.risk = {
      riskScore: 0,
      riskBand: 'Controlled',
      imminentDanger: false,
      fatalityPotential: 'not_established',
      requiresShutdown: false,
      reasoning: ['Submitted evidence describes controls in place and does not establish active uncontrolled exposure.'],
    };
    result.generatedActions = [{
      title: 'Verify the controlled condition',
      description: 'Document the observed controls and have a qualified reviewer confirm they remain effective before closing the observation.',
      priority: 'LOW',
      source: 'HAZLENZ_EVIDENCE_BOUNDARY',
      referenceStandards: [],
      advisoryGuardrails: {
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        requiresQualifiedReview: true,
      },
    }];
  }

  return result;
}

/** Normalize common field synonyms before the governed reasoning pipeline. */
export function normalizeHazardObservationText(text: string): string {
  return String(text || '')
    .replace(/\b(torch cutting|flame cutting|brazing|torch work|torch)\b/gi, 'hot work')
    .replace(/\boxy[- ]fuel\b/gi, 'fuel gas hot work');
}
