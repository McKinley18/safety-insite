/**
 * The only provider that exists at L3-1: one that performs no inference and always reports
 * UNAVAILABLE.
 *
 * It exists so the interface can be exercised by tests and so nothing is tempted to wire the
 * existing lexical engine in behind the interface and call it semantic reasoning (L3-INV-10).
 * It synthesizes no hazard, and it is not registered with the customer path.
 */
import type { HazLenzReasoningProvider, ReasoningProviderResult } from './hazlenz-reasoning-provider';
import type { ReasoningInput } from './reasoning-contract.types';

export class UnavailableReasoningProvider implements HazLenzReasoningProvider {
  readonly providerId = 'unavailable-no-inference';

  async analyzeObservation(_input: ReasoningInput): Promise<ReasoningProviderResult> {
    return {
      ok: false,
      kind: 'UNAVAILABLE',
      detail: 'No Level-3 reasoning provider is configured. L3-1 performs no inference.',
    };
  }
}
