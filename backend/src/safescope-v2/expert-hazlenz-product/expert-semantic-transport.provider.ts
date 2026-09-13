import { Provider } from '@nestjs/common';

import type {
  ExpertLegRequest, ExpertLegResponse, ExpertSemanticTransport,
} from '../expert-hazlenz/expert-hazlenz-analysis';
import {
  HostedExpertSemanticTransport,
} from '../expert-hazlenz-adapters/expert-semantic-transport';

/**
 * §262 — THE PROVIDER SEAM, AND THE ONE PLACE A NON-HOSTED TRANSPORT CAN BE SUBSTITUTED.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY A SEAM AT ALL.
 *
 * §262 authorizes ZERO provider calls and still requires the whole route to be proven: request,
 * authorization, execution claim, the frozen §259 entry point, admission, projection, confirmation
 * derivation, persistence, audit and response. That is only provable if the route can be driven
 * with a deterministic transport, and only honest if the substitution point is a single, named,
 * fail-closed boundary rather than an `if (test)` scattered through the service.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE OVERRIDE IS IN-PROCESS AND NOT AN ENVIRONMENT VARIABLE.
 *
 * An environment variable that swaps the Expert transport is a production switch that can fabricate
 * safety analyses: anyone who can set it can make the server author an Expert result that no
 * provider ever produced, and `producer = server_authored` would then be a lie told by the system's
 * own authority column. There is deliberately NO such variable. The override is a function call
 * that only code running inside this process can make, it is refused unless `NODE_ENV === 'test'`,
 * and nothing in the production graph calls it — the deployed binary reaches
 * `HostedExpertSemanticTransport` and nothing else.
 *
 * The guard is asserted at the moment of substitution rather than at the moment of use, so a
 * process that was never permitted to substitute cannot be left holding a substituted transport.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE COUNTER IS PART OF THE SEAM.
 *
 * §262 requires a simulated provider-entry count for concurrent duplicate requests. Counting inside
 * the seam counts every leg that ACTUALLY reached the transport, on the real path, rather than
 * counting invocations of a helper the production code does not use. A duplicate request that never
 * reaches here is proven not to have spent, because there is no other way out to a provider.
 */
export const EXPERT_SEMANTIC_TRANSPORT = 'EXPERT_SEMANTIC_TRANSPORT';

/** Legs that reached the transport in this process, by leg. Never reset by production code. */
export interface ExpertTransportEntryCounts {
  readonly total: number;
  readonly firstPass: number;
  readonly verifier: number;
}

/**
 * The lifetime count, which the verification reset does NOT clear.
 *
 * A suite that measures one window by resetting the counter would otherwise report that window's
 * figure as the whole run's, and a leg that escaped outside the window would be invisible in the
 * very number offered as proof that none did.
 */
export interface ExpertTransportLifetimeCounts extends ExpertTransportEntryCounts {
  readonly windowsReset: number;
}

let substituted: ExpertSemanticTransport | null = null;
let firstPassEntries = 0;
let verifierEntries = 0;
let lifetimeFirstPass = 0;
let lifetimeVerifier = 0;
let windowsReset = 0;

/**
 * The counting decorator. Wraps whichever transport is in force, so the count is a property of the
 * seam rather than of any particular implementation.
 */
class CountingExpertSemanticTransport implements ExpertSemanticTransport {
  async send(request: ExpertLegRequest): Promise<ExpertLegResponse> {
    if (request.leg === 'FIRST_PASS') { firstPassEntries += 1; lifetimeFirstPass += 1; }
    else { verifierEntries += 1; lifetimeVerifier += 1; }
    const active = substituted ?? hostedTransport();
    return active.send(request);
  }
}

let hosted: HostedExpertSemanticTransport | null = null;
function hostedTransport(): HostedExpertSemanticTransport {
  // Constructed lazily so that importing this module never reads a credential or builds an
  // envelope. A verification run that substitutes a transport must not construct the hosted one.
  hosted ??= new HostedExpertSemanticTransport();
  return hosted;
}

export function expertTransportEntryCounts(): ExpertTransportEntryCounts {
  return {
    total: firstPassEntries + verifierEntries,
    firstPass: firstPassEntries,
    verifier: verifierEntries,
  };
}

export function expertTransportLifetimeCounts(): ExpertTransportLifetimeCounts {
  return {
    total: lifetimeFirstPass + lifetimeVerifier,
    firstPass: lifetimeFirstPass,
    verifier: lifetimeVerifier,
    windowsReset,
  };
}

/**
 * SUBSTITUTE A DETERMINISTIC TRANSPORT. Local verification only.
 *
 * Refused outside `NODE_ENV === 'test'`. It deliberately does NOT also refuse when a hosted
 * credential is present: a developer's environment legitimately holds one, and refusing there would
 * mean the zero-spend suite could only run on machines that could not have spent anyway — which
 * would prove nothing about the machines that could. Substitution is what makes the spend
 * impossible, and it happens before the first request.
 */
export function substituteExpertSemanticTransportForVerification(
  transport: ExpertSemanticTransport | null,
): void {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('EXPERT_TRANSPORT_262_ABORT: the Expert transport may only be substituted under '
      + `NODE_ENV=test; this process reports ${JSON.stringify(process.env.NODE_ENV ?? null)}`);
  }
  substituted = transport;
}

/** Reset the seam's counters. Local verification only, under the same guard. */
export function resetExpertTransportEntryCountsForVerification(): void {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('EXPERT_TRANSPORT_262_ABORT: the Expert transport counters may only be reset '
      + 'under NODE_ENV=test');
  }
  firstPassEntries = 0;
  verifierEntries = 0;
  windowsReset += 1;
}

/** TRUE when a deterministic transport is in force. Recorded on the execution's provenance. */
export function expertTransportIsSubstituted(): boolean {
  return substituted !== null;
}

export const expertSemanticTransportProvider: Provider = {
  provide: EXPERT_SEMANTIC_TRANSPORT,
  useFactory: (): ExpertSemanticTransport => new CountingExpertSemanticTransport(),
};
