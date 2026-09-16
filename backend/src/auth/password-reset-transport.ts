/**
 * §306 (EM-2) — THE DELIVERY BOUNDARY, AND THE FOUR ANSWERS IT CAN GIVE.
 *
 * ===============================================================================================
 * WHY THIS IS A SEPARATE MODULE.
 *
 * §306 requires password-reset LOGIC to be independent of any email PROVIDER: the product hands a
 * bounded transactional message to one abstraction, and a provider implementation sits behind it.
 * Before §306 the two were the same class — `PasswordResetDeliveryService` both defined the
 * boundary and spoke Resend's HTTP API — so "swap the provider" and "change the reset flow" were
 * the same edit. The product name is also about to change, and a sending provider will be chosen
 * after that; nothing here may assume which one.
 *
 * ===============================================================================================
 * THE OUTCOME TYPE IS THE POINT.
 *
 * §306 distinguishes two contracts that had been collapsed into one:
 *
 *   THE PUBLIC RESPONSE      — deliberately identical whether or not an account exists, and
 *                              whether or not delivery worked. It must never become an oracle.
 *   THE INTERNAL RESULT      — must say exactly what happened, because "we cannot send email at
 *                              all" and "the provider rejected this address" are different
 *                              operational facts with different fixes.
 *
 * Before §306 the service threw a bare `Error` and `requestPasswordReset` swallowed it in a
 * `catch {}`. Every failure looked the same from the inside — which is the OB-1 pattern §305 closed
 * in account deletion, here again in delivery. So `send` returns a typed OUTCOME rather than
 * throwing, and the caller records it.
 *
 * ===============================================================================================
 * WHAT NEVER CROSSES THIS BOUNDARY.
 *
 * The reset token is in the URL, and the URL goes to the recipient. It does not go anywhere else:
 * no outcome, no log line and no operational event in this module carries the token, the URL or
 * the message body. The §306 suite captures stdout and stderr during a real reset and searches for
 * the exact token to prove it.
 */

export type PasswordResetDeliveryOutcome =
  | 'DELIVERED'
  | 'NOT_CONFIGURED'
  | 'PROVIDER_REJECTED'
  | 'NETWORK_FAILURE';

export interface PasswordResetMessage {
  readonly email: string;
  readonly resetUrl: string;
  readonly expiresMinutes: number;
  readonly subject: string;
  readonly text: string;
}

export interface PasswordResetTransport {
  readonly name: string;
  send(message: PasswordResetMessage): Promise<PasswordResetDeliveryOutcome>;
}

/**
 * THE PRODUCT NAME IS CONFIGURATION, NOT A CONSTANT.
 *
 * §306 forbids writing the temporary brand into recovery infrastructure, because the name changes
 * before external Beta. `PRODUCT_NAME` supplies it; the fallback is the current name so that an
 * unconfigured environment still sends something sensible rather than "undefined".
 */
export function productName(env: NodeJS.ProcessEnv = process.env): string {
  const configured = String(env.PRODUCT_NAME || '').trim();
  return configured || 'Safety InSite';
}

/**
 * THE MESSAGE, COMPOSED ONCE AND PROVIDER-INDEPENDENTLY.
 *
 * It says what was requested, what to do, how long it lasts, and what to do if the recipient did
 * not ask for it. It deliberately carries NO account detail beyond the address it is being sent to:
 * not the plan, not the organization, not the user id. A password-reset email is read by whoever
 * controls the mailbox, which during an account-recovery incident is not necessarily the customer.
 */
export function composePasswordResetMessage(input: {
  email: string; resetUrl: string; expiresMinutes: number; env?: NodeJS.ProcessEnv;
}): PasswordResetMessage {
  const brand = productName(input.env);
  return {
    email: input.email,
    resetUrl: input.resetUrl,
    expiresMinutes: input.expiresMinutes,
    subject: `Reset your ${brand} password`,
    text: [
      `A password reset was requested for your ${brand} account.`,
      '',
      'Use this link to choose a new password:',
      input.resetUrl,
      '',
      `The link is valid for ${input.expiresMinutes} minutes and can be used once.`,
      '',
      `If you did not request this, you can ignore this message — your password will not change.`,
    ].join('\n'),
  };
}

/* ============================================================================================
 * THE VERIFICATION CAPTURE TRANSPORT.
 *
 * §306 requires a deterministic transport that lets the harness inspect the generated message and
 * reset URL without sending real email, AND that it be impossible to activate accidentally in
 * production. Both halves matter: a capture transport reachable in production would turn real
 * password recovery into a silent in-memory recorder, and every customer locked out of their
 * account would get a cheerful generic response and no email, forever.
 *
 * The guard is a hard throw at selection time, asserted directly by the §306 suite rather than
 * assumed from reading this comment.
 * ========================================================================================== */

const capturedMessages: PasswordResetMessage[] = [];

/** Verification only: every message the capture transport has accepted. */
export function capturedPasswordResetMessages(): readonly PasswordResetMessage[] {
  return capturedMessages;
}

/** Verification only. */
export function resetCapturedPasswordResetMessages(): void {
  capturedMessages.length = 0;
}

/**
 * Verification only: force the next sends to fail in a specific way, so the suite can prove that
 * NOT_CONFIGURED, PROVIDER_REJECTED and NETWORK_FAILURE are genuinely distinguishable internally
 * while remaining indistinguishable publicly. Refuses outside NODE_ENV=test.
 */
let injectedFault: string | null = null;
export function setPasswordResetTransportFaultForVerification(mode: string | null): void {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('PASSWORD_RESET_306_ABORT: transport faults may only be injected under NODE_ENV=test');
  }
  injectedFault = mode;
}

/** Verification only: proves the capture transport refuses to exist in production. */
export function captureTransportIsProductionForbidden(): boolean {
  const saved = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    createCaptureTransport();
    return false;
  } catch {
    return true;
  } finally {
    process.env.NODE_ENV = saved;
  }
}

function createCaptureTransport(): PasswordResetTransport {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'The capture password-reset transport is forbidden in production. It records messages in '
      + 'memory instead of sending them, so selecting it in production would silently disable '
      + 'password recovery while still answering callers as though it worked.',
    );
  }
  return {
    name: 'capture',
    async send(message) {
      if (injectedFault === 'unconfigured') return 'NOT_CONFIGURED';
      if (injectedFault === 'reject') return 'PROVIDER_REJECTED';
      if (injectedFault === 'network-failure') return 'NETWORK_FAILURE';
      capturedMessages.push(message);
      return 'DELIVERED';
    },
  };
}

/* ============================================================================================
 * THE RESEND TRANSPORT.
 *
 * Kept behind the same interface as everything else and selected only by configuration, so the
 * eventual provider decision — which waits on the brand and the sending domain — is a one-line
 * change here and touches no auth logic.
 * ========================================================================================== */

function createResendTransport(): PasswordResetTransport {
  return {
    name: 'resend',
    async send(message) {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.PASSWORD_RESET_FROM_EMAIL;
      if (!apiKey || !from) return 'NOT_CONFIGURED';
      let response: Response;
      try {
        response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
          body: JSON.stringify({
            from, to: [message.email], subject: message.subject, text: message.text,
          }),
        });
      } catch {
        // A transport-level failure: DNS, TLS, timeout, no route. Distinct from a provider that
        // answered and said no — the first is usually ours, the second is usually theirs.
        return 'NETWORK_FAILURE';
      }
      return response.ok ? 'DELIVERED' : 'PROVIDER_REJECTED';
    },
  };
}

/**
 * A transport that exists so that "no provider is configured" is a first-class, reportable state
 * rather than a crash or a lie. Production with no credential lands here, and every request
 * truthfully records NOT_CONFIGURED.
 */
function createUnconfiguredTransport(reason: string): PasswordResetTransport {
  return {
    name: 'unconfigured',
    async send() { return 'NOT_CONFIGURED'; },
    ...({ reason } as Record<string, unknown>),
  } as PasswordResetTransport;
}

export function selectPasswordResetTransport(
  env: NodeJS.ProcessEnv = process.env,
): PasswordResetTransport {
  const configured = String(env.PASSWORD_RESET_PROVIDER || '').trim().toLowerCase();
  if (configured === 'capture') return createCaptureTransport();
  if (configured === 'resend') return createResendTransport();
  return createUnconfiguredTransport(
    configured ? `Unknown password-reset provider "${configured}".` : 'No password-reset provider configured.');
}

/**
 * WHAT READINESS SHOULD SAY ABOUT EMAIL.
 *
 * §306 asks that NOT_CONFIGURED, CONFIGURED and DEGRADED be distinguishable. This reports the
 * CAPABILITY — whether the product could send a reset message at all — and deliberately says
 * nothing about any individual delivery, which belongs to the operational event stream. It reads
 * only whether variables are PRESENT; no secret value is read, compared or returned.
 */
export interface PasswordResetEmailCapability {
  readonly state: 'CONFIGURED' | 'NOT_CONFIGURED' | 'DEGRADED';
  readonly provider: string;
  readonly missing: string[];
  readonly detail: string;
}

export function passwordResetEmailCapability(
  env: NodeJS.ProcessEnv = process.env,
): PasswordResetEmailCapability {
  const provider = String(env.PASSWORD_RESET_PROVIDER || '').trim().toLowerCase() || 'none';
  const missing: string[] = [];
  if (!env.PASSWORD_RESET_FRONTEND_URL && !env.FRONTEND_URL) missing.push('PASSWORD_RESET_FRONTEND_URL');

  if (provider === 'resend') {
    if (!env.RESEND_API_KEY) missing.push('RESEND_API_KEY');
    if (!env.PASSWORD_RESET_FROM_EMAIL) missing.push('PASSWORD_RESET_FROM_EMAIL');
    return missing.length
      ? {
        state: 'NOT_CONFIGURED', provider, missing,
        detail: 'A provider is selected but its credentials are absent, so password-reset messages '
          + 'cannot be sent. Recovery requests are accepted and answered generically, and no reset '
          + 'credential is left on the account.',
      }
      : { state: 'CONFIGURED', provider, missing: [], detail: 'Password-reset delivery is configured.' };
  }

  if (provider === 'capture') {
    return {
      state: 'DEGRADED', provider, missing,
      detail: 'The verification capture transport is selected. It records messages instead of '
        + 'sending them and is forbidden in production.',
    };
  }

  return {
    state: 'NOT_CONFIGURED', provider, missing: [...missing, 'PASSWORD_RESET_PROVIDER'],
    detail: 'No password-reset email provider is configured. This is the expected state until a '
      + 'sending domain is established; password recovery is engineering-complete and awaiting it.',
  };
}
