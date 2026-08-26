/**
 * L3 RUN-2 SINGLE-USE SEALED ACCEPTANCE — THE RUN DRIVER, WITH `D-K` WIRED.
 *
 * IT IS A DRIVER, NOT A PIPELINE. Every reasoning stage is the SHIPPED, FROZEN one, composed by
 * the SHIPPED `runValidatedReasoning`:
 *
 *   holdout row `observation` (verbatim)
 *     -> buildReasoningInput            reasoning-input-builder.ts  @ 2865ae91  (D-81, mandatory)
 *     -> OllamaReasoningProvider        L3_SYSTEM_PROMPT b8cc50fc, buildProposalSchema a522cf5a,
 *                                       buildUserPrompt -- all shipped, unmodified
 *     -> anthropic-ollama-shim.js       @ 76d3e039  ->  api.anthropic.com, claude-sonnet-5
 *     -> bindProposal                   reasoning-prompt.ts  @ 426302a4
 *     -> validateReasoningProposal      deterministic-safety-validator.ts  @ 942ac7cc
 *     -> bindEvidenceSemantically       semantic-evidence-binding.ts  @ c1f9d29d
 *   composed by runValidatedReasoning (reasoning-runner.ts), whose RETRY CEILING OF ONE is the
 *   frozen policy. NO RETRY POLICY IS INVENTED HERE, and a SEMANTIC retry is not reachable.
 *
 * WHAT IS DIFFERENT FROM THE SPENT RUN-1 DRIVER, AND ONLY THIS:
 *   1. It reads the FROZEN RUN-2 holdout `f887cfd1…` (93 rows), not the retired Run-1 one.
 *   2. It DECLARES `providerEvaluated` on every scorer record, per `D-G.3`. The Run-1 driver did
 *      not, which is the representational defect `D-95` established — the scorer had no predicate
 *      for whether a provider had answered.
 *   3. Row scheduling goes through `executeRequiredEvaluations`, which wires the frozen `D-K`
 *      abort. On a run in which every required evaluation is provider-evaluated, `D-K` is dormant
 *      and this driver schedules all 93 rows exactly as the Run-1 driver did.
 *
 * IT CHANGES NOTHING ELSE. No prompt, schema, validator, binder, input builder, shim, scorer,
 * threshold, denominator, truth field or gate is touched. Field derivation is carried forward
 * UNCHANGED from section 6 of the Run-1 pre-execution gate declaration
 * `f54e649aa9c65fe3dcd62dc27cb8d65e72050d529910cf2ca3303a0d71031b97`.
 *
 * HARD PRECONDITIONS, ASSERTED BEFORE THE FIRST ROW IS TRANSMITTED -- each THROWS:
 *   - holdout sha256 == f887cfd1...            (the frozen Run-2 artifact, unmodified)
 *   - holdout row count == 93
 *   - configured model == 'claude-sonnet-5'    (no fallback exists in this file)
 *   - L3_SYSTEM_PROMPT sha256 == b8cc50fc...
 *   - serialised run schema == a522cf5a...     (asserted on the first row's own schema)
 *   - locked cohort harness sha256 == 73f74131...
 *
 * THIS FILE DOES NOT AUTHORIZE ITS OWN EXECUTION. Running it transmits Run-2 rows and flips
 * RUN2_HOLDOUT_SPENT to TRUE permanently, whatever the result (section 29.8, `D-H`). Explicit user
 * authorization is a separate act.
 */
import { readFileSync, writeFileSync, appendFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { createHash } from 'crypto';
import type { ReasoningInput, L3RegulatoryContextValue } from '../../../backend/src/safescope-v2/reasoning-l3/reasoning-contract.types';
import { buildReasoningInput } from '../../../backend/src/safescope-v2/reasoning-l3/reasoning-input-builder';
import { L3_PROMPT_VERSION, L3_SYSTEM_PROMPT, buildProposalSchema } from '../../../backend/src/safescope-v2/reasoning-l3/reasoning-prompt';
import { OllamaReasoningProvider, L3_2_INFERENCE_CONFIG } from '../../../backend/src/safescope-v2/reasoning-l3/ollama-reasoning-provider';
import { runValidatedReasoning, type L3RunResult } from '../../../backend/src/safescope-v2/reasoning-l3/reasoning-runner';
import { NON_RETRYABLE_VALIDATION_REASONS, RETRYABLE_VALIDATION_REASONS } from '../../../backend/src/safescope-v2/reasoning-l3/validation-result.types';
import { DkGlobalAbort, type DkClassification } from '../guard/dk-abort-guard';
import { executeRequiredEvaluations } from '../guard/acceptance-execution-loop';

const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const ROOT = join(__dirname, '..', '..', '..');
const HOLDOUT = join(ROOT, 'verification', 'hazlenz-l3-run2-acceptance-holdout-2026-08-25', 'holdout', 'holdout-l3-acceptance-run2.json');
const COHORT = join(ROOT, 'backend', 'scripts', 'ablate-l32g-state-separation.ts');

const FROZEN_HOLDOUT_SHA = 'f887cfd1fb7ed030c9b95866775094f64c79222a7145c8ca4c95e1f956b05f8f';
const FROZEN_SCHEMA_SHA  = 'a522cf5aa2d556824100139adf4951e75b9135c42f6d0c771009cc97e99da385';
const FROZEN_PROMPT_SHA  = 'b8cc50fce71950db0188103c352fde0243938d9210e2a219341b9255d9bcbacf';
const FROZEN_COHORT_SHA  = '73f74131b4f8cbb31ad57ba972e1e0edbcaaa275d27558866d8bc2a4e71c6521';
const AUTHORIZED_MODEL   = 'claude-sonnet-5';
const EXPECTED_ROWS      = 93;
const RUN2_ACCEPTANCE_ARTIFACT_IDENTITY = '9c74ffd46e0993e097c393c5e26594501716b68078599e678ef2f4052f36acdc';
/** Field derivation is inherited verbatim from Run-1 section 6; recorded, not re-decided. */
const INHERITED_FIELD_DERIVATION_SHA = 'f54e649aa9c65fe3dcd62dc27cb8d65e72050d529910cf2ca3303a0d71031b97';

/** The 24 allowed hazard families, READ from the digest-locked cohort harness, never retyped. */
function fam(): string[] {
  const src = readFileSync(COHORT, 'utf8');
  if (sha(src) !== FROZEN_COHORT_SHA) throw new Error('locked cohort harness digest mismatch');
  const block = src.slice(src.indexOf('\nconst FAM = ['));
  return JSON.parse(block.slice(block.indexOf('['), block.indexOf(']') + 1).replace(/'/g, '"').replace(/,\s*\]/, ']'));
}

async function main() {
  const PROCESS_LABEL = process.env.PROCESS_LABEL || 'A';
  const OUT = process.env.OUT;
  const SPEND_LOG = process.env.SPEND_LOG;
  const DK_ABORT_FLAG = process.env.DK_ABORT_FLAG;
  const DK_ABORT_LOG = process.env.DK_ABORT_LOG;
  if (!OUT) throw new Error('OUT is required');
  // The global abort file is REQUIRED. Without it the process pair cannot coordinate, and a run
  // that cannot honour `D-K` must not start -- precondition 4 of the Run-2 freeze section 9.
  if (!DK_ABORT_FLAG) throw new Error('DK_ABORT_FLAG is required: D-K cannot be honoured without the global abort path');

  // ---- hard preconditions, all BEFORE any transmission --------------------------------------
  const holdoutBytes = readFileSync(HOLDOUT);
  const holdoutSha = sha(holdoutBytes);
  if (holdoutSha !== FROZEN_HOLDOUT_SHA) throw new Error(`holdout digest mismatch: ${holdoutSha}`);
  const holdout = JSON.parse(holdoutBytes.toString('utf8'));
  const rows: any[] = holdout.rows;
  if (rows.length !== EXPECTED_ROWS) throw new Error(`expected ${EXPECTED_ROWS} rows, found ${rows.length}`);
  if (sha(L3_SYSTEM_PROMPT) !== FROZEN_PROMPT_SHA) throw new Error('L3_SYSTEM_PROMPT digest mismatch');
  if (L3_2_INFERENCE_CONFIG.model !== AUTHORIZED_MODEL) {
    throw new Error(`configured model is not the authorized model: ${L3_2_INFERENCE_CONFIG.model}`);
  }
  const FAM = fam();

  const provider = new OllamaReasoningProvider(L3_2_INFERENCE_CONFIG);
  const abort = new DkGlobalAbort(DK_ABORT_FLAG, DK_ABORT_LOG);

  /** Section 6 of the frozen declaration: regime for a row, using DECLARED truth only. */
  const contextFor = (r: any) => (r.regime
    ? { value: r.regime as L3RegulatoryContextValue, provenance: 'USER_CONFIRMED' as const }
    : { value: 'unknown' as L3RegulatoryContextValue, provenance: 'UNKNOWN' as const });

  const out: any = {
    phase: 'L3 RUN-2 SINGLE-USE SEALED ACCEPTANCE',
    processLabel: PROCESS_LABEL,
    pid: process.pid,
    startedAt: new Date().toISOString(),
    run2AcceptanceArtifactIdentity: RUN2_ACCEPTANCE_ARTIFACT_IDENTITY,
    inheritedFieldDerivationSha256: INHERITED_FIELD_DERIVATION_SHA,
    holdoutId: holdout.holdoutId,
    holdoutSha256: holdoutSha,
    expectedRows: rows.length,
    provider: 'Anthropic',
    requestedModel: L3_2_INFERENCE_CONFIG.model,
    promptVersion: L3_PROMPT_VERSION,
    systemPromptSha256: sha(L3_SYSTEM_PROMPT),
    runSchemaSha256: null as string | null,
    endpoint: L3_2_INFERENCE_CONFIG.endpoint,
    temperature: L3_2_INFERENCE_CONFIG.temperature,
    seed: L3_2_INFERENCE_CONFIG.seed,
    numCtx: L3_2_INFERENCE_CONFIG.numCtx,
    timeoutMs: L3_2_INFERENCE_CONFIG.timeoutMs,
    allowedHazardFamilies: FAM.length,
    dkAbortWired: true,
    dkAbortFlagPath: DK_ABORT_FLAG,
    spendInitiatedAt: null as string | null,
    firstObservationTransmittedAt: null as string | null,
    providerCalls: 0,
    rows: [] as any[],
  };

  const report = await executeRequiredEvaluations<any, L3RunResult, any>({
    rows,
    processLabel: PROCESS_LABEL,
    abort,

    build: (row) => {
      const built = buildReasoningInput({
        analysisId: `l3-run2-acceptance-${row.rowId}`,
        observationText: row.observation,        // S-4 verbatim carriage, byte-for-byte
        regulatoryContext: contextFor(row),
        allowedHazardFamilies: FAM as any,
      });
      // The run schema is asserted on the FIRST row's own schema, then recorded.
      if (out.runSchemaSha256 === null) {
        const s = sha(JSON.stringify(buildProposalSchema(built.input)));
        if (s !== FROZEN_SCHEMA_SHA) throw new Error(`run schema digest mismatch: ${s}`);
        out.runSchemaSha256 = s;
      }
      return built;
    },

    // ---- PHASE 5 SPEND TRANSITION ----------------------------------------------------------
    // Recorded BEFORE the first observation leaves this process, and NEVER reverted. `D-H`: this
    // transition follows from TRANSMISSION alone and is independent of scorability and of `D-K`.
    onSpendInitiated: (row) => {
      out.spendInitiatedAt = new Date().toISOString();
      if (SPEND_LOG) {
        appendFileSync(SPEND_LOG, JSON.stringify({
          ts: out.spendInitiatedAt, processLabel: PROCESS_LABEL, pid: process.pid,
          event: 'HOLDOUT_SPEND_INITIATED', HOLDOUT_SPEND_INITIATED: true,
          aboutToTransmit: row.rowId, holdoutSha256: holdoutSha,
        }) + '\n');
      }
    },

    issue: async (row, index, built) => {
      const input: ReasoningInput = built.input;
      const t0 = Date.now();
      const run = await runValidatedReasoning(provider, input);
      (built as any).__ms = Date.now() - t0;
      out.providerCalls += run.attempts;

      if (index === 1 && !out.firstObservationTransmittedAt) {
        out.firstObservationTransmittedAt = new Date(t0).toISOString();
        if (SPEND_LOG) {
          appendFileSync(SPEND_LOG, JSON.stringify({
            ts: out.firstObservationTransmittedAt, processLabel: PROCESS_LABEL, pid: process.pid,
            event: 'HOLDOUT_SPENT', HOLDOUT_SPENT: true,
            GAUNTLET_OFFSET_1: 'RETIRED', REALISM_OFFSET_0: 'RETIRED',
            transmitted: row.rowId, irreversible: true,
          }) + '\n');
        }
      }
      return run;
    },

    record: (row, index, built, run, classification: DkClassification) => {
      const validation = run.validation;
      const issueCodes: string[] = (validation?.issues ?? []).map((i: any) => i.code);
      const validatedHazards: any[] = validation?.validated?.hazards ?? [];
      const proposalLevel: any[] = validation?.validated?.unresolvedDecisions ?? [];

      // ---- declaration s.6 field derivation, CARRIED FORWARD UNCHANGED ----------------------
      const providerFailed = validation === null;
      const schemaShapeIssue = issueCodes.some((c) => (RETRYABLE_VALIDATION_REASONS as readonly string[]).includes(c));
      const schemaValid = !providerFailed && !schemaShapeIssue && run.outcome.kind !== 'MALFORMED_OUTPUT';

      const candidateBorneClarification = validatedHazards.some((h) => !!h.clarification);
      const raisedClarification = candidateBorneClarification || proposalLevel.length > 0;

      const assertedState = validatedHazards.some((h) => h.conditionState === 'ACTIVE')
        ? 'ACTIVE'
        : (validatedHazards.length > 0 ? validatedHazards[0].conditionState : null);

      const nonRetryable = issueCodes.filter((c) => (NON_RETRYABLE_VALIDATION_REASONS as readonly string[]).includes(c));

      const owedAHazard = row.expect.conditionState === 'ACTIVE' || row.expect.highConsequence === true;
      const safetyConsequentialRejection = !!validation && validation.state !== 'VALID' && owedAHazard;

      return {
        // ---- SCORER INPUT (the frozen result-record contract) -------------------------------
        rowId: row.rowId,
        schemaValid,
        retries: Math.max(0, run.attempts - 1),
        candidates: validatedHazards.map((h) => ({ candidateKey: h.candidateKey, hazardFamily: h.hazardFamily, conditionState: h.conditionState })),
        raisedClarification,
        assertedState,
        nonRetryableValidationReasons: nonRetryable,
        safetyConsequentialRejection,
        decisionBoundaryCodes: issueCodes,

        // ---- D-G.3 DECLARATION (the tenth field; fail-closed if absent) ---------------------
        providerEvaluated: classification.providerEvaluated,
        providerFailureKind: classification.failureKind,
        providerFailureClass: classification.failureClass,

        // ---- EXECUTION EVIDENCE (recorded, not scored) --------------------------------------
        executionIndex: index,
        provenanceClass: row.provenanceClass,
        sourceId: row.sourceId,
        familyVariant: row.familyVariant,
        pole: row.pole,
        regulatoryContext: contextFor(row),
        redactionVersion: built.redactionVersion,
        redactionCount: built.redactions.length,
        redactionsPerRule: built.redactions.map((r: any) => ({ rule: r.rule, count: r.count })),
        attempts: run.attempts,
        providerId: run.providerId,
        outcomeKind: run.outcome.kind,
        totalMs: run.totalMs,
        latencyMs: (built as any).__ms,
        telemetry: provider.lastTelemetry
          ? { promptTokens: provider.lastTelemetry.promptTokens, outputTokens: provider.lastTelemetry.outputTokens,
              binding: provider.lastTelemetry.binding, failureKind: provider.lastTelemetry.failureKind }
          : null,
        validationState: validation?.state ?? null,
        validationIssueCodes: issueCodes,
        validatedHazardCount: validatedHazards.length,
        validatedAssertsActive: validatedHazards.some((h) => h.conditionState === 'ACTIVE'),
        validatedStates: validatedHazards.map((h) => h.conditionState),
        candidateBorneClarification,
        proposalLevelClarificationCount: proposalLevel.length,
        // D-58: the SEMANTIC-BINDER tier, recorded separately and NEVER merged with VALIDATED.
        semanticTier: run.semantic
          ? {
              boundHazardCount: run.semantic.boundHazards.length,
              boundStates: run.semantic.boundHazards.map((h: any) => h.conditionState),
              boundAssertsActive: run.semantic.boundHazards.some((h: any) => h.conditionState === 'ACTIVE'),
              rejected: run.semantic.rejected.map((r: any) => ({ candidateKey: r.candidateKey, codes: r.codes })),
              demoted: run.semantic.demoted.map((d: any) => ({ candidateKey: d.candidateKey, from: d.from, to: d.to, code: d.code })),
              issueCodes: run.semantic.issues.map((i: any) => i.code),
            }
          : null,
        // Truth carried forward for auditability. NOT used by the driver to change any behaviour.
        expect: row.expect,
      };
    },

    onRowComplete: (row, index) => {
      process.stdout.write(`${row.rowId} `);
      if (index % 10 === 0) process.stdout.write('\n');
    },
  });

  out.rows = report.records;
  out.notIssuedRowIds = report.notIssuedRowIds;
  out.requestsScheduled = report.requestsScheduled;
  out.dkFired = report.dkFired;
  out.dkFiredInThisProcess = report.dkFiredLocally;
  out.dkAbort = report.dkAbort;
  out.allRequiredEvaluationsObtained = report.allRequiredEvaluationsObtained;
  out.finishedAt = new Date().toISOString();
  out.completedRows = out.rows.length;

  // `D-K.3` on fire. Recorded, never inferred, and never capable of reverting spend.
  if (report.dkFired) {
    out.terminalHint = 'L3_ACCEPTANCE_NOT_SCORABLE — INCOMPLETE_PROVIDER_EVALUATION';
    out.SCORABLE = false;
    out.HOLDOUT_SPENT = out.spendInitiatedAt !== null;
    out.MODEL_ACCEPTANCE_RESULT = 'NOT_ESTABLISHED';
    out.automaticRerun = 'NONE';
    out.corpusRestored = false;
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`\nprocess ${PROCESS_LABEL} pid ${process.pid}: ${out.completedRows}/${EXPECTED_ROWS} rows, `
    + `${report.requestsScheduled} scheduled, ${out.providerCalls} provider calls, `
    + `D-K ${report.dkFired ? `FIRED at ${report.dkAbort?.abortRowId} (${report.dkAbort?.failureKind})` : 'dormant'} -> ${OUT}`);
}

main().catch((e) => { console.error('FATAL: ' + (e?.stack || e)); process.exit(1); });
