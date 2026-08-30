/**
 * EXPERT HAZLENZ -- the replay provider. THE ONLY PROVIDER THE NO-CALL HARNESS USES.
 *
 * It returns a scripted result and performs no network operation of any kind. There is no URL, no
 * fetch, no client library and no credential read in this file or anything it imports, which is
 * what makes `PROVIDER_CALLS = 0` a property of the code rather than a claim in a report.
 *
 * WHY A SCRIPTED PROVIDER RATHER THAN A MOCK OF THE RUNNER. The failure semantics are the thing
 * under test, and they live in `expert-runner.ts` and `expert-normalization.ts`. Stubbing the
 * runner would test the stub. Scripting the transport exercises the real sequence -- retry ceiling,
 * identity check, boundary, layer status -- against every failure the taxonomy names.
 *
 * `throwOnCall` exists because a provider that throws is a real and common shape (a client library
 * that rejects rather than returning an error object), and the runner's promise never to throw is
 * only meaningful if something tests it.
 */

import type { ExpertAnalysisInput } from './expert-contract.types';
import type { ExpertProvider, ExpertProviderResult } from './expert-provider';

export interface ReplayScript {
  providerId?: string;
  qualifiedModelIdentity?: string | null;
  /**
   * One entry per attempt. The runner's ceiling is two attempts, so a two-entry script can express
   * "fails then succeeds". A script shorter than the attempt count repeats its last entry.
   */
  results: ExpertProviderResult[];
  /** When set, the provider throws instead of returning, on every attempt. */
  throwOnCall?: Error;
}

export class ReplayExpertProvider implements ExpertProvider {
  readonly providerId: string;
  readonly qualifiedModelIdentity: string | null;
  /** Observable so a test can assert the retry ceiling was respected. */
  calls = 0;

  private readonly script: ReplayScript;

  constructor(script: ReplayScript) {
    this.script = script;
    this.providerId = script.providerId ?? 'replay-no-network';
    this.qualifiedModelIdentity = script.qualifiedModelIdentity ?? null;
  }

  async analyze(_input: ExpertAnalysisInput): Promise<ExpertProviderResult> {
    this.calls += 1;
    if (this.script.throwOnCall) throw this.script.throwOnCall;
    const index = Math.min(this.calls - 1, this.script.results.length - 1);
    const result = this.script.results[index];
    if (!result) {
      return { ok: false, kind: 'NOT_CONFIGURED', detail: 'replay script exhausted' };
    }
    return result;
  }
}

/** Convenience for the common case: one successful raw payload, no identity checking. */
export function replaySuccess(raw: unknown, modelIdentity: string | null = null): ReplayExpertProvider {
  return new ReplayExpertProvider({ results: [{ ok: true, raw, modelIdentity }] });
}
