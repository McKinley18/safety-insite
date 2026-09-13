/**
 * §252 -- DRIVE THE REAL PRODUCTION PATH WITH A RECORDED PROVIDER OUTPUT.
 *
 * Every §252 harness admits through `runExpertHazLenzAnalysis`, never through a local reassembly of
 * the pipeline. That is what makes "production and validation paths are identical" a property of the
 * code rather than a claim in a report: there is one composition, and the harness reaches it by
 * handing the entry point a tool input instead of a network response.
 *
 * Contains no network primitive and cannot transmit.
 */
import {
  runExpertHazLenzAnalysis, type ExpertHazLenzResult, type ExpertLegRequest, type ExpertLegResponse,
  type ExpertSemanticTransport,
} from '../../src/hazlenz/expert-hazlenz/expert-hazlenz-analysis';
import type { ExpertAnalysisInput } from '../../src/hazlenz/expert-hazlenz/expert-contract.types';
import type { VNextGovernedEvidenceRecord }
  from '../../src/hazlenz/expert-hazlenz/contract/expert-first-pass-instruction-vnext';

class ReplayTransport implements ExpertSemanticTransport {
  captured: ExpertLegRequest | null = null;
  constructor(private readonly firstPassInput: unknown) {}
  async send(r: ExpertLegRequest): Promise<ExpertLegResponse> {
    if (this.captured === null) this.captured = r;
    if (r.leg !== 'FIRST_PASS') {
      // The verifier leg is a second provider call. A replay harness never invents one.
      return { ok: false, toolInput: null, failureKind: 'VERIFIER_NOT_REPLAYED', detail: '' };
    }
    return { ok: true, toolInput: this.firstPassInput, failureKind: null, detail: null };
  }
}

export interface ReplayOutcome {
  readonly result: ExpertHazLenzResult;
  readonly firstPassRequest: ExpertLegRequest;
}

export async function admitThroughProductionPath(args: {
  input: ExpertAnalysisInput;
  observation: { sourceId: string; text: string };
  governedRecords?: readonly VNextGovernedEvidenceRecord[];
  toolInput: unknown;
}): Promise<ReplayOutcome> {
  const t = new ReplayTransport(args.toolInput);
  const result = await runExpertHazLenzAnalysis({
    input: args.input, observation: args.observation,
    governedRecords: args.governedRecords ?? [], governedEvidence: [],
  }, t);
  if (t.captured === null) throw new Error('§252 REPLAY ABORT: the entry point assembled no request');
  return { result, firstPassRequest: t.captured };
}
