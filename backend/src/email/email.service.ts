import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendWorkspaceInvite(data: {
    to: string;
    companyName: string;
    inviteLink: string;
    role: string;
  }) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV INVITE EMAIL]', data);
      return { ok: true, devMode: true };
    }

    // Production provider goes here next: Resend, SendGrid, Postmark, etc.
    return { ok: false, message: 'Email provider not configured.' };
  }
}
