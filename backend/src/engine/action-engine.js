const fs = require('fs');
const path = require('path');

const conditionPath = path.join(process.cwd(), 'test-data/action-library/corrective-action-library.json');
const familyPath = path.join(process.cwd(), 'test-data/action-library/family-action-library.json');

const CONDITION_ACTIONS = fs.existsSync(conditionPath)
  ? JSON.parse(fs.readFileSync(conditionPath, 'utf-8'))
  : [];

const FAMILY_ACTIONS = fs.existsSync(familyPath)
  ? JSON.parse(fs.readFileSync(familyPath, 'utf-8'))
  : {};

function generateCorrectiveAction(classification) {
  if (!classification || classification.conditionId === "NO_MATCH") {
    return baseNoMatch();
  }

  // L1: CONDITION MATCH
  const conditionMatch = CONDITION_ACTIONS.find(
    a => a.conditionId === classification.conditionId
  );

  if (conditionMatch) {
    return buildResponse(conditionMatch, "condition");
  }

  // L2: FAMILY MATCH
  const familyMatch = FAMILY_ACTIONS[classification.family];

  if (familyMatch) {
    return buildResponse(familyMatch, "family");
  }

  // L3: FALLBACK
  return baseFallback();
}

function buildResponse(source, level) {
  return {
    regulatoryIntent: source.regulatoryIntent,
    correctiveActions: source.correctiveActions,
    verificationSteps: source.verificationSteps,
    rootCausePrompts: source.rootCausePrompts,
    suggestedSeverity: source.suggestedSeverity ?? 3,
    suggestedLikelihood: source.suggestedLikelihood ?? 3,
    suggestedExposure: source.suggestedExposure ?? 3,
    suggestedPriority: source.suggestedPriority ?? "medium",
    defaultDaysToComplete: source.defaultDaysToComplete ?? null,
    prioritySource: `Sentinel Safety ${level}-level mapping`,
    requiresRiskAssessment: true,
    riskAssessment: emptyRisk()
  };
}

function baseNoMatch() {
  return {
    regulatoryIntent: null,
    correctiveActions: [],
    verificationSteps: [],
    rootCausePrompts: [],
    suggestedPriority: "none",
    prioritySource: "NO_MATCH",
    requiresRiskAssessment: false,
    riskAssessment: emptyRisk()
  };
}

function baseFallback() {
  return {
    regulatoryIntent: "Correct hazardous condition and prevent exposure.",
    correctiveActions: [
      "Evaluate hazard with competent person.",
      "Implement controls to eliminate or reduce risk.",
      "Verify correction.",
      "Document completion."
    ],
    verificationSteps: [
      "Hazard reviewed",
      "Correction completed"
    ],
    rootCausePrompts: [
      "Why did hazard occur?",
      "What prevents recurrence?"
    ],
    suggestedPriority: "medium",
    prioritySource: "fallback",
    requiresRiskAssessment: true,
    riskAssessment: emptyRisk()
  };
}

function emptyRisk() {
  return {
    severity: null,
    likelihood: null,
    exposure: null,
    customerRiskScore: null,
    finalPriority: null
  };
}

module.exports = { generateCorrectiveAction };
