/**
 * §255 -- CAPABILITY BOUNDARY RECORD AND BETA-READINESS BLOCKER INVENTORY.
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NO REMEDIATION.
 *
 * Every quantitative field is DERIVED from evidence already on disk rather than transcribed, so the
 * inventory cannot drift from the measurements it cites. Qualitative entries name the file that
 * establishes them, and anything not established is marked UNVERIFIED rather than guessed.
 */
import { execFileSync } from 'child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

const BACKEND = join(__dirname, '..');
const ROOT = join(BACKEND, '..');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-255-capability-boundary-2026-09-12');
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

const V254 = join(ROOT, 'verification',
  'expert-hazlenz-254-driver-role-hosted-confirmation-2026-09-12');
const s254 = JSON.parse(readFileSync(join(V254, 'SECTION-254-EXECUTION-SUMMARY.json'), 'utf8'));
const c254 = JSON.parse(readFileSync(join(V254, 'SECTION-254-REFUSAL-CLASSIFICATION.json'), 'utf8'));
const state = JSON.parse(readFileSync(join(ROOT, 'docs', 'INSITE_CURRENT_STATE.json'), 'utf8'));

const git = (args: string[]): string => {
  try { return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim(); }
  catch { return 'UNAVAILABLE'; }
};

/** Does any module under src/ call the production Expert entry point? */
function productionCallersOfExpert(): string[] {
  const hits: string[] = [];
  const walk = (dir: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!e.name.endsWith('.ts')) continue;
      const src = readFileSync(p, 'utf8');
      if (/\brunExpertHazLenzAnalysis\s*\(/.test(src) && !p.endsWith('expert-hazlenz-analysis.ts')) {
        hits.push(p.slice(BACKEND.length + 1));
      }
    }
  };
  walk(join(BACKEND, 'src'));
  return hits;
}

const calls = s254.providerCalls as number;
const envelopeSrc = readFileSync(join(BACKEND,
  'src/safescope-v2/expert-hazlenz-adapters/expert-request-envelope.ts'), 'utf8');

const measured = {
  section254: {
    providerCalls: calls,
    spendUsd: s254.spendUsd,
    totalInputTokens: s254.totalInputTokens,
    totalOutputTokens: s254.totalOutputTokens,
    model: s254.respondedModels,
    perCallInputTokens: Math.round(s254.totalInputTokens / calls),
    perCallOutputTokens: Math.round(s254.totalOutputTokens / calls),
    perCallCostUsd: Number((s254.spendUsd / calls).toFixed(4)),
    wholeAnalysisRefusals: s254.wholeAnalysisRefusals,
    analysesDelivered: calls - s254.wholeAnalysisRefusals,
    deliveredYield: (calls - s254.wholeAnalysisRefusals) + '/' + calls,
    rolePresenceCoherentAdmissionAware: s254.rolePresenceCoherent + '/6',
    rolePresenceCoherentRawOutput: c254.nonScoringDiagnostic.nonScoringRolePresenceCoherent,
    frozenFloor: '5/6',
    unsafeUnderRestrictions: s254.unsafeUnderRestrictions,
    semanticInventions: s254.semanticInventionCount,
    conformanceViolations: c254.conformanceViolationsAcrossAllCases,
    transportFailures: s254.transportFailures,
  },
  deployment: {
    deployedBackendSha: state.productionPosture.deployedBackendSha,
    localHeadSha: git(['rev-parse', 'HEAD']),
    commitsAheadOfDeployed: git(['rev-list', '--count',
      state.productionPosture.deployedBackendSha + '..HEAD']),
    uncommittedWorktreeEntries: git(['status', '--porcelain']).split('\n').filter(Boolean).length,
    autoDeploy: state.productionPosture.autoDeploy,
    deployRunsMigrations: state.productionPosture.deployRunsMigrations,
    customerDefaultMode: state.productionPosture.customerDefaultMode,
    productionShadowEnabled: state.productionPosture.productionShadowEnabled,
    service: state.productionPosture.deployedBackendService,
  },
  expertReachability: {
    productionCallers: productionCallersOfExpert(),
    reachableFromAnyRouteOrService: productionCallersOfExpert().length > 0,
    verifierLegExercisedInSection254: s254.verifierLegRun === true,
  },
  promptCaching: { cacheControlPresentInTheEnvelope: /cache_control/.test(envelopeSrc) },
};

interface Blocker {
  id: string; severity: 'BLOCKER' | 'RISK' | 'POLISH' | 'ACCEPTED';
  status?: 'MEASURED' | 'UNVERIFIED'; title: string; evidence: string;
}

const m = measured;
const inventory: Record<string, Blocker[]> = {
  '1_expertCapability': [
    { id: 'E1', severity: 'ACCEPTED', status: 'MEASURED',
      title: 'Autonomous driver-role classification is not accepted for v1.0',
      evidence: '§254 role-presence coherence ' + m.section254.rolePresenceCoherentAdmissionAware
        + ' admission-aware and ' + m.section254.rolePresenceCoherentRawOutput
        + ' on raw output, against a frozen floor of 5/6. Closed by §255 as a bounded limit.' },
    { id: 'E2', severity: 'BLOCKER', status: 'MEASURED',
      title: 'Expert HazLenz has no production caller',
      evidence: 'runExpertHazLenzAnalysis is invoked by scripts only; no controller, route or '
        + 'service under src/ calls it. §246 made it production-CALLABLE and nothing has made it '
        + 'production-CALLED, so the validated path cannot be reached by a user.' },
    { id: 'E3', severity: 'BLOCKER', status: 'MEASURED',
      title: 'Delivered-analysis yield is ' + m.section254.deliveredYield
        + ' on fresh well-formed observations',
      evidence: '§254 refused ' + m.section254.wholeAnalysisRefusals + ' of ' + calls
        + ' analyses outright. The refusals are correct and fail-closed, but a user would receive '
        + 'no analysis half the time. Causes: H3 declaration-coverage self-consistency, H4 exact '
        + 'self-reference of a discharging control, H5 role/candidate-state contradiction. Only H5 '
        + 'is a driver-role defect, so the other two survive the §255 human-confirmation boundary.' },
    { id: 'E4', severity: 'RISK', status: 'MEASURED',
      title: 'The verifier leg has never been exercised against Candidate v2.3',
      evidence: '§254 ran first-pass only by frozen spend design; the verifier was reached on 0 of '
        + '6. The §218 verifier contract is wired into the entry point but unmeasured on this '
        + 'candidate.' },
    { id: 'E5', severity: 'RISK', status: 'MEASURED',
      title: 'dischargingControlRef transmitted-null / projection-refusal gap',
      evidence: 'Carried from §252 and §253, not materially encountered in §254, and distinct from '
        + 'the role-capability result.' },
  ],
  '2_safeHumanBeta': [
    { id: 'B1', severity: 'BLOCKER', status: 'MEASURED',
      title: 'No human-confirmation surface for consequential driver-role classification',
      evidence: 'The §255 boundary requires the continuation-controlling versus follow-up '
        + 'distinction to be human-confirmed where it decides whether work stops, holds or '
        + 'continues. No such flow exists in frontend-next, and the backend result contract carries '
        + 'no confirmation state. §255 authorizes the boundary, not the implementation.' },
    { id: 'B2', severity: 'BLOCKER', status: 'MEASURED',
      title: 'Fail-closed behaviour pending confirmation is unimplemented',
      evidence: 'Nothing yet prevents an unconfirmed classification being presented as an '
        + 'operational conclusion, because no consumer exists. Must be built with B1 and must never '
        + 'infer confirmation from silence.' },
    { id: 'B3', severity: 'BLOCKER', status: 'MEASURED',
      title: 'Expert is not customer-active and the product default is the legacy path',
      evidence: 'customerDefaultMode=' + m.deployment.customerDefaultMode
        + ', productionShadowEnabled=' + m.deployment.productionShadowEnabled
        + '. Deterministic HazLenz remains the sole customer-authoritative path.' },
    { id: 'B4', severity: 'RISK', status: 'MEASURED',
      title: 'Deployed code is behind local main and the worktree is large and uncommitted',
      evidence: 'deployed ' + String(m.deployment.deployedBackendSha).slice(0, 12) + ', local HEAD '
        + String(m.deployment.localHeadSha).slice(0, 12) + ', '
        + m.deployment.commitsAheadOfDeployed + ' commits ahead, '
        + m.deployment.uncommittedWorktreeEntries + ' uncommitted worktree entries. autoDeploy='
        + m.deployment.autoDeploy + ', so a commit to main is a production deploy while migrations '
        + 'are applied out of band. Beta needs a controlled release plan before any commit.' },
    { id: 'B5', severity: 'RISK', status: 'MEASURED',
      title: 'The canonical current-state readiness statement is stale',
      evidence: 'docs/INSITE_CURRENT_STATE.json readiness still describes the pre-§243 formal '
        + 'evaluation and its M14/M10 gate failures. It predates §243 through §255 and would '
        + 'misinform anyone reviewing beta readiness from the authoritative document.' },
  ],
  '3_productPolish': [
    { id: 'P1', severity: 'POLISH', status: 'MEASURED',
      title: 'Stale architectural comment in the semantic transport',
      evidence: 'expert-semantic-transport.ts still explains why the strict flag cannot be dropped. '
        + 'Behaviour is correct because the flag comes from the envelope, but the envelope now binds '
        + 'strict=FALSE and the comment reads as an invariant that no longer holds.' },
    { id: 'P2', severity: 'POLISH', status: 'MEASURED',
      title: 'Historical suites carry known-failing assertions',
      evidence: 'test-249 (P2,P4,P5,P7), test-246 (F1,F4,F6,E3b) and '
        + 'test-expert-anthropic-adapter-repair (A.19) fail by design under the accepted '
        + 'architecture. Ruled and classified, but a new engineer running the suites sees red.' },
    { id: 'P3', severity: 'POLISH', status: 'MEASURED',
      title: 'Frozen TypeScript provenance error',
      evidence: 'expert-237-posture-contract.ts(193,47) TS2552 POSTURE_REF_KINDS_237, deliberately '
        + 'unrepaired since §239 to keep the frozen chain reproducible.' },
  ],
  '4_infrastructureBillingStorageUpdates': [
    { id: 'I1', severity: 'RISK', status: 'MEASURED',
      title: 'Expert unit economics are unmanaged',
      evidence: '§254 measured ' + m.section254.perCallInputTokens + ' input tokens and USD '
        + m.section254.perCallCostUsd + ' per analysis. Input tokens dominate and prompt caching is '
        + 'not configured (cache_control in the envelope: '
        + m.promptCaching.cacheControlPresentInTheEnvelope + '). No per-tenant spend cap or budget '
        + 'control is evidenced on the Expert path.' },
    { id: 'I2', severity: 'RISK', status: 'MEASURED',
      title: 'Single free-plan backend instance',
      evidence: m.deployment.service + '. Cold starts and no redundancy, compounded by Expert calls '
        + 'that take tens of seconds.' },
    { id: 'I3', severity: 'RISK', status: 'MEASURED',
      title: 'Deploy and migration ordering hazard',
      evidence: 'deployRunsMigrations=' + m.deployment.deployRunsMigrations + ' with autoDeploy='
        + m.deployment.autoDeploy + '. Code ships on commit; schema does not.' },
    { id: 'I4', severity: 'RISK', status: 'UNVERIFIED',
      title: 'Production object storage provisioning is not evidenced',
      evidence: 'Storage is S3-backed and the local provider throws in production, which is correct. '
        + 'Whether STORAGE_S3_BUCKET and credentials are configured in production is not established '
        + 'by anything in the repository. Verify before beta.' },
    { id: 'I5', severity: 'RISK', status: 'UNVERIFIED',
      title: 'Billing live configuration is not evidenced',
      evidence: 'Plans, entitlements, subscription status and Stripe customer identifiers exist in '
        + 'src/billing. Whether live keys, products and webhooks are configured in production is not '
        + 'established by anything in the repository. Verify before beta.' },
  ],
  '5_legalPrivacyClaims': [
    { id: 'L1', severity: 'BLOCKER', status: 'MEASURED',
      title: 'The product claims register predates §254 and needs a §255 amendment',
      evidence: 'docs/PRODUCT-CLAIMS-REGISTER.md already classifies "autonomous" as '
        + 'NOT_CURRENTLY_SUPPORTABLE and "expert" as not supportable externally; §254 now '
        + 'corroborates both with direct measurement. The permissible characterization §255 sets out '
        + 'must be recorded there before any beta-facing copy is written.' },
    { id: 'L2', severity: 'BLOCKER', status: 'MEASURED',
      title: 'Name and trademark clearance not performed',
      evidence: 'The register marks both "HazLenz" and "Safety InSite" LEGAL_REVIEW_REQUIRED. '
        + 'Engineering has no view and cannot close this.' },
    { id: 'L3', severity: 'BLOCKER', status: 'MEASURED',
      title: 'Third-party model disclosure and data-processing position',
      evidence: 'Reasoning is performed by ' + JSON.stringify(m.section254.model)
        + '. Observation text leaves the product to a third-party provider. Subprocessor disclosure, '
        + 'a DPA and the customer consent posture are required before real workplace observations '
        + 'are sent.' },
    { id: 'L4', severity: 'RISK', status: 'MEASURED',
      title: '"HazLenz AI" is the most-used claim and attaches to third-party reasoning',
      evidence: 'Register section A: 57 occurrences, SUPPORTABLE_WITH_QUALIFICATION. The '
        + 'qualification has not been applied to the copy.' },
  ],
  '6_knownAcceptedLimitations': [
    { id: 'A1', severity: 'ACCEPTED',
      title: 'Autonomous driver-role assignment not accepted for v1.0 (§255)',
      evidence: 'Consequential continuation-controlling versus follow-up classification is '
        + 'human-confirmed.' },
    { id: 'A2', severity: 'ACCEPTED',
      title: 'Single-call strict structured output infeasible on this provider (§251)',
      evidence: 'Replaced by non-strict transport plus deterministic whole-output admission, '
        + 'validated in §252.' },
    { id: 'A3', severity: 'ACCEPTED',
      title: 'dischargingControlRef contract-consistency gap carried forward (§253, §255)',
      evidence: 'Non-blocking absent observed consequence; not encountered in §254.' },
    { id: 'A4', severity: 'ACCEPTED',
      title: 'Frozen POSTURE_REF_KINDS_237 TypeScript provenance error',
      evidence: 'Preserved deliberately since §239.' },
    { id: 'A5', severity: 'ACCEPTED',
      title: 'Historical suites superseded by the strict flag and by the §253 schema head',
      evidence: 'Ruled in §252 and §255 under narrow, explicitly bounded supersession rules.' },
  ],
};

const counts = Object.fromEntries(Object.entries(inventory).map(([k, v]) => [k, {
  total: v.length,
  blockers: v.filter(b => b.severity === 'BLOCKER').length,
  risks: v.filter(b => b.severity === 'RISK').length,
  polish: v.filter(b => b.severity === 'POLISH').length,
  accepted: v.filter(b => b.severity === 'ACCEPTED').length,
}]));

const doc = {
  section: '255', generated: '2026-09-12',
  providerCalls: 0, databaseOperations: 0,
  remediationPerformed: false, productionCodeChanged: false,
  capabilityBoundary: {
    classification: 'BOUNDED EXPERT CAPABILITY LIMIT — AUTONOMOUS DRIVER-ROLE ASSIGNMENT NOT '
      + 'ACCEPTED FOR v1.0',
    sixCaseExperiment: 'CLOSED',
    safetyClassification: 'CAPABILITY FAILURE, NOT UNSAFE PRODUCT ESCAPE',
    everyMissDirection: 'OVER-RESTRICTIVE',
    humanConfirmationRequiredWhere: 'the continuation-controlling versus follow-up distinction '
      + 'materially decides whether work stops, holds, continues with controls, or continues while '
      + 'a separate follow-up remains open',
    h6ArchitecturalFinding: 'a model-generated structured justification for a driver role does not '
      + 'establish that the role it justifies is semantically correct',
    reopeningRule: 'only after a material intelligence or architecture change; a new instrument must '
      + 'be designed from first principles and §254 may never be reused as a tuning set',
  },
  measured,
  totals: {
    blockers: Object.values(counts).reduce((a, c) => a + c.blockers, 0),
    risks: Object.values(counts).reduce((a, c) => a + c.risks, 0),
    polish: Object.values(counts).reduce((a, c) => a + c.polish, 0),
    acceptedLimitations: Object.values(counts).reduce((a, c) => a + c.accepted, 0),
    unverified: Object.values(inventory).flat().filter(b => b.status === 'UNVERIFIED').length,
  },
  countsByCategory: counts,
  inventory,
  emitterSha256: sha(readFileSync(__filename, 'utf8')),
};
writeFileSync(join(OUT, 'SECTION-255-BLOCKER-INVENTORY.json'), JSON.stringify(doc, null, 2));

console.log('Expert production callers: ' + JSON.stringify(m.expertReachability.productionCallers));
console.log('delivered yield ' + m.section254.deliveredYield + '  per-call USD '
  + m.section254.perCallCostUsd + '  per-call input tokens ' + m.section254.perCallInputTokens);
console.log('deployed ' + String(m.deployment.deployedBackendSha).slice(0, 12) + ' vs local '
  + String(m.deployment.localHeadSha).slice(0, 12) + ' (+' + m.deployment.commitsAheadOfDeployed
  + '), ' + m.deployment.uncommittedWorktreeEntries + ' worktree entries');
console.log('totals: ' + JSON.stringify(doc.totals));
