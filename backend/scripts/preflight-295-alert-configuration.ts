/**
 * §295 — CHECK A CANDIDATE ALERT CONFIGURATION BEFORE IT TOUCHES PRODUCTION.
 *
 * ZERO NETWORK. ZERO PROVIDER CALLS. ZERO PRODUCTION CONTACT. It sets the candidate values in this
 * process only and asks the PRODUCT'S OWN resolver what it makes of them.
 *
 * WHY THIS EXISTS. §294 made the email channel refuse to claim itself configured without a
 * structurally deliverable sender, which is the right behaviour and also a new way for a
 * configuration attempt to end in a shrug: the owner sets three values, the channel still reports
 * NOT_CONFIGURED, and the reason is only visible on /health/ready after a restart. Checking first
 * costs nothing and turns that round trip into a one-line answer.
 *
 * IT DELIBERATELY DOES NOT DUPLICATE THE RULE. It imports describeAlertConfiguration and
 * resolveEmailChannel and reports what they say. A preflight that restated the requirements would
 * be a third copy of exactly the thing MO-2 was about — two copies that could disagree.
 *
 * NO SECRET IS PRINTED. The credential is reported as present or absent and never echoed, and the
 * sender and recipient are echoed because they are configuration rather than secrets.
 *
 * USAGE — values come from the environment, so nothing lands in shell history or a file:
 *
 *   OPERATIONAL_ALERT_EMAIL=ops@example.com \
 *   RESEND_API_KEY=... \
 *   PASSWORD_RESET_FROM_EMAIL=alerts@yourdomain.com \
 *   npx ts-node scripts/preflight-295-alert-configuration.ts
 */
import {
  describeAlertConfiguration,
  isStructurallyDeliverableAddress,
  resolveEmailChannel,
} from '../src/observability/operational-alerts';

const present = (key: string): string => (process.env[key] ? 'set' : 'ABSENT');
const echo = (key: string): string => process.env[key] || 'ABSENT';

const config = describeAlertConfiguration();
const email = resolveEmailChannel();

console.log('\n§295 alert-configuration preflight — local, 0 network, 0 provider calls\n');
console.log('  OPERATIONAL_ALERT_WEBHOOK_URL   ', present('OPERATIONAL_ALERT_WEBHOOK_URL'));
console.log('  OPERATIONAL_ALERT_EMAIL         ', echo('OPERATIONAL_ALERT_EMAIL'));
console.log('  RESEND_API_KEY                  ', present('RESEND_API_KEY'), '(never printed)');
console.log('  OPERATIONAL_ALERT_FROM_EMAIL    ', echo('OPERATIONAL_ALERT_FROM_EMAIL'));
console.log('  PASSWORD_RESET_FROM_EMAIL       ', echo('PASSWORD_RESET_FROM_EMAIL'));

if (!email.ok && process.env.OPERATIONAL_ALERT_EMAIL) {
  console.log('\n  email channel                    NOT USABLE');
  console.log(`  why                              ${email.reason}`);
} else if (email.ok) {
  console.log('\n  email channel                    USABLE');
  console.log(`  would send from                  ${email.from}`);
  console.log(`  would send to                    ${email.to}`);
}

for (const key of ['OPERATIONAL_ALERT_EMAIL', 'OPERATIONAL_ALERT_FROM_EMAIL', 'PASSWORD_RESET_FROM_EMAIL']) {
  const value = process.env[key];
  if (!value) continue;
  const ok = isStructurallyDeliverableAddress(value);
  if (!ok) console.log(`\n  ${key} is NOT structurally deliverable — a reserved TLD such as `
    + '.invalid/.example/.test/.localhost, or not an address shape a provider will accept.');
}

console.log(`\n  /health/ready would report       ${config.state}`);
console.log(`  channel                          ${config.channel}`);
console.log(`  detail                           ${config.reason}`);

const usable = config.state !== 'NOT_CONFIGURED';
console.log(`\n${usable
  ? 'READY TO CONFIGURE — these values give a channel the product will use.'
  : 'DO NOT CONFIGURE YET — production would report NOT_CONFIGURED for the reason above.'}\n`);
process.exit(usable ? 0 : 1);
