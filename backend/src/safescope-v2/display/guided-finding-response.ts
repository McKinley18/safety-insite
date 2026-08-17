import { createHash } from 'crypto';
import { ClassifyDto } from '../dto/classify.dto';

type DecisionStatus = 'SUPPORTED' | 'UNKNOWN' | 'CONTRADICTED' | 'NOT_APPLICABLE' | 'NOT_SUPPORTED';

type ApplicabilityDecision = {
  citation?: string;
  family?: string;
  status?: DecisionStatus;
  confidence?: number;
  explanation?: string;
  missingPredicates?: string[];
  contradictoryEvidence?: string[];
  requiredPredicates?: Array<{ name?: string; status?: DecisionStatus }>;
  source?: { authority?: string; bundle?: string; version?: string };
};

const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const list = <T>(value: unknown): T[] => Array.isArray(value) ? value : [];
const unique = (values: string[]) => [...new Set(values.map(value => value.trim()).filter(Boolean))];

function standardRecords(response: any) {
  return [
    ...list<any>(response?.primaryStandards),
    ...list<any>(response?.suggestedStandards),
    ...list<any>(response?.standards),
  ];
}

function matchingRecord(response: any, citation: string) {
  const normalized = citation.toLowerCase().replace(/^(?:29|30)\s+cfr\s+/, '');
  return standardRecords(response).find(record => {
    const value = text(record?.citation || record?.standard || record?.reference).toLowerCase();
    return value === citation.toLowerCase() ||
      value.replace(/^(?:29|30)\s+cfr\s+/, '') === normalized;
  }) || {};
}

function confidenceLabel(value: number, status: DecisionStatus): 'High' | 'Moderate' | 'Low' {
  if (status !== 'SUPPORTED') return 'Low';
  if (value >= 0.85) return 'High';
  if (value >= 0.65) return 'Moderate';
  return 'Low';
}

function questionContract(response: any) {
  const seen = new Set<string>();
  return list<any>(response?.clarificationQuestions || response?.clarifyingQuestions)
    .filter(question => {
      const id = text(question?.id);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .slice(0, 3)
    .map(question => ({
      id: text(question.id),
      question: text(question.question || question.prompt),
      reason: text(question.reason) || 'The answer may change applicability, risk, or the recommended control.',
      answerType: text(question.answerType) || 'single-select',
      options: unique(list<string>(question.options).length
        ? list<string>(question.options)
        : ['Yes', 'No', 'Unknown', 'Not applicable']),
      materialTo: unique(list<string>(question.impactedDecisions).length
        ? list<string>(question.impactedDecisions)
        : ['standard-applicability']),
    }));
}

function riskContract(response: any, hasUnknown: boolean) {
  const raw = response?.risk || {};
  const level = text(raw?.riskBand || response?.riskBand || response?.riskLevel || response?.riskRating) ||
    (hasUnknown ? 'Not established' : 'Moderate');
  const normalized = level.toLowerCase();
  const severity = text(raw?.severity || raw?.severityLevel) ||
    (/critical|high/.test(normalized) ? 'Serious' : /controlled|low/.test(normalized) ? 'Minor' : 'Not established');
  const likelihood = text(raw?.likelihood || raw?.likelihoodLevel) ||
    (hasUnknown ? 'Not established' : /critical|high/.test(normalized) ? 'Possible' : 'Unlikely');
  const exposure = text(raw?.exposure || raw?.frequency) || (hasUnknown ? 'Not established' : 'Potential');
  const provisional = hasUnknown || /not established|unknown|insufficient/.test(normalized);
  const rationale = unique([
    ...list<string>(raw?.reasoning),
    text(raw?.rationale),
  ])[0] || (provisional
    ? 'Material exposure or control facts remain unconfirmed.'
    : `The available evidence supports a ${level.toLowerCase()} advisory risk level.`);
  return {
    severity,
    likelihood,
    exposure,
    existingControls: unique(list<string>(raw?.existingControls)),
    immediacy: text(raw?.immediacy) || (/critical|high/.test(normalized) ? 'Prompt action' : 'Planned correction'),
    potentialConsequence: text(raw?.potentialConsequence || raw?.consequence) || 'Confirm during qualified review.',
    overallRisk: level,
    riskLevel: level,
    provisional,
    rationale,
    reviewerConfirmed: false,
    reviewerOverrideReasonRequired: true,
  };
}

function actionText(response: any) {
  const reasoning = response?.correctiveActionReasoning || {};
  const actions = list<any>(response?.generatedActions);
  return {
    immediate: text(reasoning?.immediateActionNarrative) ||
      text(reasoning?.immediateActions?.[0]) ||
      text(actions[0]?.description || actions[0]?.action),
    permanent: text(reasoning?.permanentCorrectionNarrative) ||
      text(reasoning?.permanentCorrections?.[0]) ||
      text(actions[1]?.description || actions[1]?.action),
    verification: text(reasoning?.verificationNarrative) ||
      text(reasoning?.verificationSteps?.[0]) ||
      text(actions[2]?.description || actions[2]?.action),
  };
}

function correctiveAction(response: any, family: string, riskLevel: string, hasUnknown: boolean) {
  const existing = actionText(response);
  const lower = family.toLowerCase();
  const defaults = /guard|moving machine/.test(lower) ? {
    immediate: 'Restrict access to the contact point until a qualified person verifies effective guarding.',
    permanent: 'Restore a guard that prevents contact with the moving component under expected operating conditions.',
    verification: 'Verify the guard is secure and effective before returning the equipment or area to normal use.',
  } : /energy|lockout/.test(lower) ? {
    immediate: 'Pause servicing access until all hazardous energy sources are identified and controlled.',
    permanent: 'Apply the approved energy-control procedure, including isolation and control of stored energy.',
    verification: 'A qualified person should verify isolation and the effectiveness of the energy controls before work resumes.',
  } : /excavation|ground/.test(lower) ? {
    immediate: 'Restrict entry into the exposed area until a qualified person evaluates the condition.',
    permanent: 'Install or restore the protective system appropriate to the confirmed ground and exposure conditions.',
    verification: 'Document the competent or qualified person’s examination before permitting access.',
  } : {
    immediate: hasUnknown
      ? 'Preserve the condition and restrict avoidable exposure until the missing material facts are verified.'
      : 'Control immediate exposure to the reviewed condition.',
    permanent: 'Implement an engineering or physical correction matched to the confirmed hazard and applicable requirement.',
    verification: 'A qualified reviewer should verify the correction and document objective completion evidence.',
  };
  return {
    immediateAction: existing.immediate || defaults.immediate,
    permanentCorrection: existing.permanent || defaults.permanent,
    verificationStep: existing.verification || defaults.verification,
    responsibleRole: 'Qualified responsible person',
    urgency: /critical|high/i.test(riskLevel) ? 'Urgent' : hasUnknown ? 'Pending evidence review' : 'Prompt',
    suggestedDueDate: null,
    rationale: `Actions are advisory and tied to the ${family || 'observed hazard'} evidence and proposed risk.`,
    hierarchyPreference: ['elimination', 'substitution', 'engineering', 'administrative', 'PPE'],
  };
}

export function attachGuidedFindingResponse(response: any, request: ClassifyDto) {
  if (!response || typeof response !== 'object') return response;
  const controlledState =
    String(response?.family || response?.classification || response?.hazardCategory || '').toLowerCase().replace(/[\s-]+/g, '_') === 'controlled_condition' ||
    /\bcontrolled\b|\bverified safe\b|\bresolved\b/i.test(String(response?.assessmentDisposition?.status || response?.assessmentDisposition?.label || ''));
  // A controlled/verified-safe result must not be reintroduced as an active
  // candidate by the compatibility adapter. Historical behavior selected the
  // first UNKNOWN applicability decision (often hazardous energy) even when
  // the condition assessment had explicitly established effective controls.
  const decisions = controlledState ? [] : list<ApplicabilityDecision>(response.applicabilityDecisions);
  const primaryDecision = decisions.find(item => item.status === 'SUPPORTED') ||
    decisions.find(item => item.status === 'UNKNOWN');
  const additional = decisions.filter(item =>
    item !== primaryDecision && ['SUPPORTED', 'UNKNOWN'].includes(String(item.status)));
  const primaryStatus: DecisionStatus = primaryDecision?.status || 'UNKNOWN';
  const citation = text(primaryDecision?.citation || response.primaryCitation);
  const record = matchingRecord(response, citation);
  const confidence = Number.isFinite(primaryDecision?.confidence)
    ? Number(primaryDecision?.confidence)
    : Number(response?.evidenceConfidence?.score || 0.2);
  const supporting = unique(list<any>(primaryDecision?.requiredPredicates)
    .filter(predicate => predicate.status === 'SUPPORTED')
    .map(predicate => text(predicate.name)));
  const missing = unique([
    ...list<string>(primaryDecision?.missingPredicates),
    ...list<string>(response?.evidenceSnapshot?.criticalUnknowns),
  ]);
  const questions = questionContract(response);
  const risk = riskContract(response, primaryStatus !== 'SUPPORTED' || missing.length > 0);
  const family = text(primaryDecision?.family || response.classification || response.hazardCategory) ||
    'Safety observation';
  const primaryStandard = citation ? {
    citation,
    title: text(record?.title || record?.heading) || family,
    agency: text(record?.agency || record?.agencyCode) ||
      (citation.includes('30 CFR') ? 'MSHA' : citation.includes('29 CFR') ? 'OSHA' : 'Unconfirmed'),
    simplifiedRequirement: text(record?.plainLanguageSummary || record?.summary) ||
      'Review the authoritative requirement and confirmed facts before finalization.',
    whyOffered: primaryDecision?.status === 'SUPPORTED'
      ? `HazLenz found submitted evidence supporting ${supporting.join(', ') || family.toLowerCase()}.`
      : `HazLenz retained this as a candidate because ${missing.join(', ') || 'material applicability facts'} remain unconfirmed.`,
    confidence,
    confidenceLabel: confidenceLabel(confidence, primaryStatus),
    applicability: primaryStatus === 'SUPPORTED' ? 'direct' : 'candidate',
    evidenceSupporting: supporting,
    evidenceMissing: missing,
    contradictoryEvidence: unique(list<string>(primaryDecision?.contradictoryEvidence)),
    sourceStatus: record?.reviewerApproved === true
      ? 'approved-versioned-regulation'
      : text(primaryDecision?.source?.authority) === 'regulation'
        ? 'provisional-versioned-regulation'
        : 'source-review-required',
    confidenceLimitReason: record?.reviewerApproved === true
      ? null
      : 'Regulatory source approval or release coverage limits confidence.',
    sourceRelease: primaryDecision?.source || null,
  } : null;
  const contractPayload = {
    contractVersion: 'guided-finding-v1',
    engineVersion: text(response.engineVersion || response.version) || 'hazlenz-production',
    rulesRelease: text(response?.evidenceSnapshot?.offlineBundle?.version) || 'unknown',
    observedCondition: text(request.structuredObservation?.observedCondition || request.text),
    hazardCategory: family,
    conditionState: text(response?.conditionState) || 'UNKNOWN',
    conditionStateEvidence: response?.conditionStateEvidence || null,
    primaryStandard,
    additionalStandards: additional.slice(0, 2).map(item => ({
      citation: text(item.citation),
      title: text(item.family),
      applicability: item.status === 'SUPPORTED' ? 'direct' : 'candidate',
      whyOffered: text(item.explanation),
      evidenceMissing: unique(list<string>(item.missingPredicates)),
    })),
    clarificationQuestions: questions,
    riskAssessment: risk,
    correctiveAction: correctiveAction(response, family, risk.riskLevel, risk.provisional),
    findingCandidates: [primaryDecision, ...additional]
      .filter((item): item is ApplicabilityDecision => Boolean(item?.citation))
      .slice(0, 3)
      .map(item => ({
        citation: text(item.citation),
        family: text(item.family),
        applicability: item.status === 'SUPPORTED' ? 'direct' : 'candidate',
        evidenceFactIds: unique(list<any>(item.requiredPredicates)
          .flatMap(predicate => list<string>(predicate.factIds))),
      })),
    multiHazardReview: {
      requiresSplitReview: [primaryDecision, ...additional]
        .filter(item => item?.status === 'SUPPORTED')
        .map(item => text(item?.family).toLowerCase())
        .filter(Boolean)
        .filter((value, index, values) => values.indexOf(value) === index).length > 1,
      instruction: 'Split materially distinct hazard mechanisms into separate findings; merge duplicate obligations.',
    },
    reviewStatus: {
      status: 'qualified-review-required',
      reviewerConfirmed: false,
      editableFields: ['facts', 'standard', 'risk', 'correctiveAction'],
    },
    limitations: [
      'HazLenz is advisory and does not replace a qualified safety professional.',
      'Candidate standards are not confirmed violations.',
      'Applicability depends on verified facts, jurisdiction, and the current authoritative source.',
    ],
    provenance: {
      evidenceSnapshotId: text(response?.evidenceSnapshot?.id) || null,
      rulesRelease: text(response?.evidenceSnapshot?.offlineBundle?.version) || null,
      deterministicInputHash: createHash('sha256').update(JSON.stringify({
        text: request.text,
        scopes: request.scopes || [],
        structuredObservation: request.structuredObservation || null,
        evidenceSnapshot: request.evidenceSnapshot || null,
        clarificationAnswers: request.clarificationAnswers || [],
      })).digest('hex'),
    },
  };
  response.guidedFinding = contractPayload;
  return response;
}
