import { Injectable, Logger } from '@nestjs/common';

export interface PasswordResetDelivery {
  send(input: { email: string; resetUrl: string; expiresMinutes: number }): Promise<void>;
}

@Injectable()
export class PasswordResetDeliveryService implements PasswordResetDelivery {
  private readonly logger = new Logger(PasswordResetDeliveryService.name);
  private readonly mode = process.env.PASSWORD_RESET_PROVIDER || (process.env.NODE_ENV === 'production' ? '' : 'development');
  // Configuration problems are recorded, not thrown, at construction time.
  // PasswordResetDeliveryService is an eagerly-instantiated singleton
  // provider in AuthModule -- throwing here would crash the entire backend
  // at boot over a single deferred integration, not just the password-reset
  // feature. requestPasswordReset() in auth.service.ts already wraps
  // send() in a try/catch and returns an honest generic response either
  // way, so deferring the failure to send()-time degrades gracefully with
  // no behavior change for callers.
  private readonly configurationError: Error | null =
    process.env.NODE_ENV === 'production' ? this.checkProductionConfiguration() : null;

  async send(input: { email: string; resetUrl: string; expiresMinutes: number }): Promise<void> {
    if (this.configurationError) {
      this.logger.warn(`Password-reset delivery unavailable: ${this.configurationError.message}`);
      throw this.configurationError;
    }
    if (this.mode === 'test') return;
    if (this.mode === 'development') {
      if (process.env.NODE_ENV === 'production') throw new Error('Development password-reset delivery is forbidden in production.');
      return;
    }
    if (this.mode !== 'resend') throw new Error('Password-reset delivery provider is not configured.');
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.PASSWORD_RESET_FROM_EMAIL,
        to: [input.email],
        subject: 'Reset your Safety InSite password',
        text: `Reset your Safety InSite password within ${input.expiresMinutes} minutes: ${input.resetUrl}`,
      }),
    });
    if (!response.ok) {
      this.logger.error(`Password reset provider failed with HTTP ${response.status}.`);
      throw new Error('Password reset delivery failed.');
    }
  }

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

  private checkProductionConfiguration(): Error | null {
    try {
      if (this.mode !== 'resend') throw new Error('PASSWORD_RESET_PROVIDER=resend is required in production.');
      for (const key of ['RESEND_API_KEY', 'PASSWORD_RESET_FROM_EMAIL', 'PASSWORD_RESET_FRONTEND_URL']) {
        if (!process.env[key]) throw new Error(`${key} is required for production password reset.`);
      }
      this.buildResetUrl('configuration-check');
      return null;
    } catch (error) {
      return error as Error;
    }
  }
}
