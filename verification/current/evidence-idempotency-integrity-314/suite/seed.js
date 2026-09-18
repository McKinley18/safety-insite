/**
 * §314 rig seeder. Registers a synthetic user through the REAL AuthService (real bcrypt hash, real
 * agreement acceptance, real token minting) and prints the access token. Registration over HTTP is
 * throttled as production abuse control; that control is not what §314 is testing, so the account
 * is created through the same service the route calls rather than by weakening the throttle.
 */
process.chdir('/Users/mckinley/Desktop/Safety_InSite/backend');
module.paths.unshift('/Users/mckinley/Desktop/Safety_InSite/backend/node_modules');
// §314 RIG GUARD. The application loads backend/.env, whose DATABASE_URL is the DEVELOPMENT
// database. This refuses to boot unless the resolved target is the disposable rig database, so a
// forgotten `. app.env` fails loudly instead of touching development data.
{
  const u = process.env.DATABASE_URL || '';
  if (!/127\.0\.0\.1:15432\/idemtest/.test(u)) {
    console.log(JSON.stringify({ error: 'S314 RIG GUARD: DATABASE_URL is not the disposable rig database. Refusing.' }));
    process.exit(2);
  }
}
const { NestFactory } = require('@nestjs/core');
(async () => {
  const { AppModule } = require('/Users/mckinley/Desktop/Safety_InSite/backend/dist/app.module');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const { AuthService } = require('/Users/mckinley/Desktop/Safety_InSite/backend/dist/auth/auth.service');
  const { AgreementsService } = require('/Users/mckinley/Desktop/Safety_InSite/backend/dist/agreements/agreements.service');
  const auth = app.get(AuthService);
  const agreements = app.get(AgreementsService);
  const required = require('/Users/mckinley/Desktop/Safety_InSite/backend/dist/agreements/agreement-registry');
  const projected = agreements.projectedLegalAgreements();
  const need = required.agreementsRequiredAtRegistration(projected);
  const result = await auth.register({
    email: process.argv[2],
    password: 'S314-proof!x9',
    name: 'S314 Synthetic',
    acceptedAgreements: need.map(a => ({ agreementId: a.agreementId, agreementVersion: a.version })),
  });
  const session = await auth.login(process.argv[2], 'S314-proof!x9');
  console.log(JSON.stringify({
    token: session.accessToken || session.access_token || session.token,
    userId: result.userId,
  }));
  await app.close();
})().catch(e => { console.log(JSON.stringify({ error: String(e && e.message) })); process.exit(1); });
