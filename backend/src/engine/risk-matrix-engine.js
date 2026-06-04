const fs = require('fs');
const path = require('path');

const defaultMatrixPath = path.join(process.cwd(), 'test-data/risk-matrix/default-risk-matrix.json');

function loadDefaultMatrix() {
  return JSON.parse(fs.readFileSync(defaultMatrixPath, 'utf-8'));
}

function clampNumber(value, min = 1, max = 5) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(min, Math.min(max, n));
}

function findBand(score, matrix) {
  return matrix.bands.find(band => score >= band.min && score <= band.max) || null;
}

function calculateRisk(input = {}, matrix = loadDefaultMatrix()) {
  const severity = clampNumber(input.severity);
  const likelihood = clampNumber(input.likelihood);
  const exposure = clampNumber(input.exposure);

  if (!severity || !likelihood || !exposure) {
    return {
      matrixId: matrix.matrixId,
      complete: false,
      severity,
      likelihood,
      exposure,
      customerRiskScore: null,
      finalPriority: null,
      dueDate: null,
      requiredApprover: null,
      escalationRule: null,
      notificationRule: null
    };
  }

  const customerRiskScore = severity * likelihood * exposure;
  const band = findBand(customerRiskScore, matrix);

  const now = new Date();
  let dueDate = null;

  if (band && Number.isFinite(Number(band.defaultDaysToComplete))) {
    dueDate = new Date(now);
    dueDate.setDate(now.getDate() + Number(band.defaultDaysToComplete));
  }

  const escalationRule =
    band?.priority === 'critical'
      ? matrix.rules.criticalEscalationRule
      : band?.priority === 'high'
      ? matrix.rules.highEscalationRule
      : band?.priority === 'medium'
      ? matrix.rules.mediumEscalationRule
      : matrix.rules.lowEscalationRule;

  return {
    matrixId: matrix.matrixId,
    complete: true,
    severity,
    likelihood,
    exposure,
    customerRiskScore,
    finalPriority: band?.priority || 'medium',
    dueDate: dueDate ? dueDate.toISOString() : null,
    requiredApprover: band?.requiredApprover || 'supervisor',
    escalationRule,
    notificationRule: escalationRule
  };
}

function applyRiskAssessment(classification, riskInput = {}, matrix = loadDefaultMatrix()) {
  const defaults = {
    severity: classification?.suggestedSeverity,
    likelihood: classification?.suggestedLikelihood,
    exposure: classification?.suggestedExposure
  };

  const merged = {
    severity: riskInput.severity ?? defaults.severity,
    likelihood: riskInput.likelihood ?? defaults.likelihood,
    exposure: riskInput.exposure ?? defaults.exposure
  };

  return calculateRisk(merged, matrix);
}

module.exports = {
  loadDefaultMatrix,
  calculateRisk,
  applyRiskAssessment
};
