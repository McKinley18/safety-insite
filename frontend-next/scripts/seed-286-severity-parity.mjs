// §286 — THE SEVERITY-PARITY FIXTURE.
//
// ==================== WHY THIS FILE EXISTS ====================
//
// §285 reported the whole severity/risk dimension as **NOT_EXERCISED**, and was right to: every
// finding it seeded carried `riskSnapshot = NULL`, so the §276/§277 single-effective-severity rule
// and its parity across the workspace, the finding review, the report record and the PDF had no
// opportunity to fail. Recording that as a pass would have been vacuous.
//
// The hole was in the FIXTURE, not the product. The §280/§281 seeder writes an analysis snapshot
// and then persists findings straight through `POST .../findings` (finalizeFinding). Risk is not
// computed there. It is computed in `InspectionService.reconcileDecompositionFindings`, which runs
// inside `addAnalysis` and only when the snapshot carries `multiHazardDecomposition.hazards[]` with
// usable evidence text -- that is the path that calls `computeFindingRisk`, which calls the real,
// unmodified `evaluateRisk`. An analysis with no decomposition returns early and materializes
// nothing, so no finding ever entered the code under test.
//
// ==================== WHAT THIS FIXTURE THEREFORE DOES ====================
//
// It produces `riskSnapshot` THROUGH THE SAME MATERIALIZATION SEMANTICS THE PRODUCT USES. Nothing
// here hand-populates a database shape:
//
//   * the snapshot is posted to the ordinary authenticated `POST .../analyses` route;
//   * `reconcileDecompositionFindings` materializes one finding per decomposed hazard and calls
//     `computeFindingRisk` -> `evaluateRisk` for each, exactly as a real analysis would;
//   * the reviewer's band is applied through the ordinary `POST .../reviews` +
//     `POST .../findings` pair carrying `riskAssessment`, which is what the inspection workspace
//     sends, and which reaches `withReviewerConfirmedRisk`.
//
// The bands are therefore whatever the real risk engine computes from the evidence text. This
// fixture does NOT assert what those bands should be -- that would be a claim about the engine, and
// this is a presentation/parity instrument. It MEASURES the materialized band and then chooses the
// reviewer's cell relative to it, so "reviewer agrees" and "reviewer differs" are real conditions
// rather than assumed ones.
//
// ==================== WHAT IT IS NOT ====================
//
// The observation and hazard text is a STIMULUS. It is not evidence about HazLenz, no conclusion in
// it may be cited as an engine result, and no semantics are tuned. ZERO provider calls: the review
// stack runs with EXPERT_EXECUTION_ENABLED=false and no provider key in its environment.
//
// Usage: API_URL=... VAL_EMAIL=... VAL_PASSWORD=... node scripts/seed-286-severity-parity.mjs

const API = process.env.API_URL || "http://localhost:4000";
const EMAIL = process.env.VAL_EMAIL;
const PASSWORD = process.env.VAL_PASSWORD;

/**
 * @param {string} path
 * @param {RequestInit} [init]
 * @param {string} [token]
 * @returns {Promise<any>}
 */
export async function call(path, init = {}, token) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path} -> ${res.status} ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

/**
 * The Standard 5x5 bands, copied from backend/src/hazlenz/risk/risk-profiles.ts.
 *
 * Duplicated deliberately and narrowly: this instrument must be able to CHOOSE a reviewer cell that
 * lands in a named band, which means it needs the band boundaries. It never uses them to assert
 * what the product computed -- every measured band in the validator is read back off the product.
 */
const BANDS = [
  { label: "Low", min: 1, max: 4 },
  { label: "Moderate", min: 5, max: 9 },
  { label: "High", min: 10, max: 16 },
  { label: "Critical", min: 17, max: 25 },
];
const SEVERITY_LABELS = ["Minor", "Moderate", "Serious", "Major", "Critical"];
const LIKELIHOOD_LABELS = ["Rare", "Unlikely", "Possible", "Likely", "Frequent"];

/** @param {number} score */
export function bandFor(score) {
  return BANDS.find((band) => score >= band.min && score <= band.max)?.label || "Low";
}

/** A reviewer matrix cell (severity x likelihood) landing in `band`, as the workspace sends it. */
/** @param {string} band */
export function reviewerCellForBand(band) {
  for (let severity = 1; severity <= 5; severity++) {
    for (let likelihood = 1; likelihood <= 5; likelihood++) {
      const score = severity * likelihood;
      if (bandFor(score) !== band) continue;
      return {
        severity: SEVERITY_LABELS[severity - 1],
        likelihood: LIKELIHOOD_LABELS[likelihood - 1],
        exposure: "Potential",
        overallRisk: band,
        rationale: `Reviewer-confirmed on the Standard 5x5 matrix: severity ${severity} x likelihood ${likelihood} = ${score}.`,
      };
    }
  }
  throw new Error(`no matrix cell lands in band ${band}`);
}

/** Any band other than the one given, so "reviewer differs" is a real difference. */
/** @param {string} band */
export function otherBand(band) {
  return ["Critical", "High", "Moderate", "Low"].find((candidate) => candidate !== band);
}

/**
 * One decomposed hazard, in the shape `reconcileDecompositionFindings` reads.
 *
 * `domainId` becomes the finding's `hazardKey` via `stableHazardKey`, which is also the
 * `segmentKey` finalization addresses it by. `observationFragment` / `mechanism` /
 * `supportingSignals` are the ONLY evidence `computeFindingRisk` consumes, and an empty join of
 * them is what makes it return null -- which is how the unrated case below is produced honestly.
 *
 * @param {{
 *   domainId: string, hazardFamily: string, mechanism: string, fragment: string,
 *   signals?: string[], conditionState?: string,
 * }} input
 * @returns {Record<string, unknown>}
 */
export function hazard({ domainId, hazardFamily, mechanism, fragment, signals = [], conditionState = "CURRENT" }) {
  return {
    domainId,
    hazardFamily,
    mechanism,
    observationFragment: fragment,
    supportingSignals: signals,
    conditionState,
    standardCandidates: [],
    reviewerQuestions: [],
    evidenceGaps: [],
  };
}

/**
 * @param {Record<string, unknown>[]} hazards
 * @param {string} [profileId]
 */
export function snapshotWithHazards(hazards, profileId = "standard_5x5") {
  return {
    regulatoryContext: {
      value: "osha-general-industry",
      provenance: "USER_CONFIRMED",
      source: "inspection",
      basis: ["Set on the inspection at start"],
    },
    classification: "Reviewed condition",
    risk: { operationalRisk: { profileId } },
    multiHazardDecomposition: { hazards },
  };
}

/**
 * Create an inspection, one observation, and an analysis whose decomposition materializes findings
 * with a real `riskSnapshot`. Returns everything the validator needs to address them.
 */
/**
 * @param {string} token
 * @param {string} siteId
 * @param {{
 *   key: string, title: string, observation: string,
 *   hazards: Record<string, unknown>[], profileId?: string,
 * }} input
 */
export async function seedMaterializedInspection(
  token, siteId, { key, title, observation, hazards, profileId = "standard_5x5" },
) {
  const inspection = await call("/inspections", {
    method: "POST",
    body: JSON.stringify({
      siteId, title, regulatoryContext: "osha-general-industry",
      // The server constrains this to A-Z a-z 0-9 _ . : - so it cannot carry the human title.
      clientRequestId: `sev286-${key}-${Date.now()}`.slice(0, 120),
    }),
  }, token);

  const obs = await call(`/inspections/${inspection.id}/observations`, {
    method: "POST",
    body: JSON.stringify({
      rawText: observation, evidenceSource: "direct_observation",
      clientRequestId: `sev286-obs-${inspection.id}`.slice(0, 120),
    }),
  }, token);

  const analysis = await call(`/inspections/observations/${obs.id}/analyses`, {
    method: "POST",
    body: JSON.stringify({
      engineVersion: "synthetic-severity-parity-286",
      idempotencyKey: `sev286-${obs.id}`.slice(0, 120),
      requestVersion: 1,
      resultSnapshot: snapshotWithHazards(hazards, profileId),
    }),
  }, token);

  // Read the findings the SERVER materialized. Their risk snapshots are the product's own output.
  const full = await call(`/inspections/${inspection.id}`, {}, token);
  return { inspection: full, observationId: obs.id, analysisId: analysis.id, findings: full.findings || [] };
}

/** The ordinary review + finalize pair, with or without a reviewer risk cell. */
export async function reviewAndFinalize(token, observationId, analysisId, finding, { reviewerCell, decision = "accepted", rationale }) {
  const review = await call(`/inspections/observations/${observationId}/reviews`, {
    method: "POST",
    body: JSON.stringify({
      analysisId,
      findingId: finding.id,
      decision,
      rationale: rationale || "Synthetic §286 severity-parity fixture. Not an engine result.",
      idempotencyKey: `sev286-review-${finding.id}-${Date.now()}`.slice(0, 120),
      ...(reviewerCell ? { reviewedConclusion: { reviewerRisk: reviewerCell } } : {}),
    }),
  }, token);

  return call(`/inspections/observations/${observationId}/findings`, {
    method: "POST",
    body: JSON.stringify({
      reviewId: review.id,
      hazardCategory: finding.hazardCategory,
      conclusion: finding.conclusion || "Reviewed condition",
      segmentKey: finding.hazardKey,
      reviewerDisposition: "single",
      ...(reviewerCell ? { riskAssessment: reviewerCell } : {}),
    }),
  }, token);
}

export async function completeInspection(token, inspectionId) {
  let row = await call(`/inspections/${inspectionId}`, {}, token);
  if (row.status === "draft") {
    await call(`/inspections/${row.id}/transition`, {
      method: "POST", body: JSON.stringify({ status: "in_review", version: row.version }),
    }, token);
    row = await call(`/inspections/${row.id}`, {}, token);
  }
  await call(`/inspections/${row.id}/transition`, {
    method: "POST", body: JSON.stringify({ status: "completed", version: row.version }),
  }, token);
  return call(`/inspections/${inspectionId}`, {}, token);
}

/** The review site, created if the account has none. */
/**
 * @param {string} token
 * @param {string} [name]
 * @returns {Promise<any>}
 */
export async function ensureSite(token, name = "Northline Plant 2") {
  const sites = await call("/sites?limit=100", {}, token);
  const existing = (sites.data || sites || []).find((site) => site.name === name);
  return existing || call("/sites", { method: "POST", body: JSON.stringify({ name }) }, token);
}

export async function signIn() {
  const login = await call("/auth/login", {
    method: "POST", body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  return login.accessToken || login.access_token || login.token;
}

// Run standalone for a quick look at what the materialization path actually produces.
if (process.argv[1] && process.argv[1].endsWith("seed-286-severity-parity.mjs")) {
  const token = await signIn();
  const siteId = (await ensureSite(token)).id;
  const seeded = await seedMaterializedInspection(token, siteId, {
    key: "probe",
    title: "S286 severity materialization probe",
    observation: "Fixed guard removed from the conveyor nip point; operators reaching into the "
      + "in-running nip while the belt is energised.",
    hazards: [hazard({
      domainId: "machine-guarding",
      hazardFamily: "machine_guarding",
      mechanism: "Unguarded in-running nip point on an energised conveyor",
      fragment: "Fixed guard removed from the conveyor nip point while the belt was running.",
      signals: ["Operators observed reaching into the nip", "No interlock present"],
    })],
  });
  console.log(JSON.stringify(seeded.findings.map((f) => ({
    id: f.id, hazardKey: f.hazardKey, status: f.status, riskSnapshot: f.riskSnapshot,
  })), null, 2));
}
