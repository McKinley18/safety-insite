import { Injectable } from '@nestjs/common';

import {
  PasswordResetDeliveryOutcome,
  composePasswordResetMessage,
  selectPasswordResetTransport,
} from './password-reset-transport';

/**
 * §306 (EM-2) — PASSWORD-RESET DELIVERY: COMPOSE, HAND OVER, REPORT WHAT HAPPENED.
 *
 * ===============================================================================================
 * WHAT CHANGED AT §306, AND WHY.
 *
 * This class used to BE the Resend integration: it built the message, spoke Resend's HTTP API, and
 * threw a bare `Error` on any problem. `requestPasswordReset` caught that error and discarded it.
 * Three consequences, all of which §306 names:
 *
 *   1. auth logic depended on provider semantics, so changing provider meant editing the reset flow;
 *   2. the message — including the product name — was written into the provider call, and the
 *      product name is about to change;
 *   3. "no credential configured", "the provider rejected this address" and "the network failed"
 *      were indistinguishable from the inside. That is the same shape as OB-1, which §305 closed in
 *      account deletion: a bare catch that leaves an operator with nothing.
 *
 * Now: the message is composed provider-independently with the brand read from configuration, the
 * transport is selected by configuration, and `send` returns a typed OUTCOME instead of throwing.
 * Nothing here decides what the CALLER tells the user — that stays deliberately generic, and lives
 * in `requestPasswordReset`.
 *
 * ===============================================================================================
 * STILL TRUE, AND STILL DELIBERATE.
 *
 * Configuration problems are reported, never thrown at construction. This is an eagerly-instantiated
 * singleton in AuthModule, so throwing here would take the whole backend down at boot over one
 * deferred integration rather than degrading the single feature that depends on it.
 */
@Injectable()
export class PasswordResetDeliveryService {
  private readonly transport = selectPasswordResetTransport();

  /**
   * Hands one bounded transactional message to the transport and returns what happened.
   *
   * It does not throw: a delivery problem is an OUTCOME, because the caller has to do the same
   * thing for the user either way and a different thing for the operator in each case.
   */
  async send(input: {
    email: string; resetUrl: string; expiresMinutes: number;
  }): Promise<PasswordResetDeliveryOutcome> {
    const message = composePasswordResetMessage(input);
    try {
      return await this.transport.send(message);
    } catch {
      /*
       * A transport that threw rather than returning an outcome is itself a fault, and an unknown
       * one. It is reported as a network failure rather than swallowed, because the one thing that
       * must not happen is the caller believing a message went out.
       */
      return 'NETWORK_FAILURE';
    }
  }

  /** The transport actually in use, for readiness reporting. Never a credential. */
  get transportName(): string {
    return this.transport.name;
  }

  /**
   * THE RESET URL IS BUILT FROM CONFIGURATION ONLY.
   *
   * Nothing the caller sent participates: no Host, no X-Forwarded-Host, no Origin, no Referer. That
   * is what makes Host-header injection a non-event here, and §306 proves it by issuing a request
   * carrying all three of those headers pointed at an attacker domain and asserting the resulting
   * URL is still on the configured origin.
   *
   * HTTPS is required in production. The token is placed with `searchParams.set`, which encodes it,
   * and any query, fragment or path already on the configured base is discarded rather than
   * inherited.
   */
  buildResetUrl(token: string): string {
    const configured = process.env.PASSWORD_RESET_FRONTEND_URL || process.env.FRONTEND_URL;
    if (!configured) throw new Error('PASSWORD_RESET_FRONTEND_URL or FRONTEND_URL is required.');
    const base = new URL(configured);
    if (process.env.NODE_ENV === 'production' && base.protocol !== 'https:') {
      throw new Error('Production password-reset URL must use HTTPS.');
    }
    base.pathname = '/reset-password';
    base.search = '';
    base.hash = '';
    base.searchParams.set('token', token);
    return base.toString();
  }
}
