/**
 * §310 (SC-3) — THE AUTHORITATIVE DEPLOYED ROUTE TABLE.
 *
 *   npm run routes:deployed          (needs a disposable database; see routes:deployed:db)
 *   npm run routes:deployed:db       (creates one, prints the table, drops it)
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THIS EXISTS AS A COMMITTED SCRIPT RATHER THAN A THROWAWAY.
 *
 * §310 had to answer "which deployed routes reach a table that does not exist". Reading controllers
 * gave an answer that was WRONG — it missed `POST /action-engine/generate/:reportId`, which reads a
 * legacy report through a `forwardRef`-injected `ReportsService`, is not namespaced `legacy/`, and
 * is not named after a report. Nothing about its source made it findable by searching for report
 * repositories. It was found by asking Nest what it had actually registered.
 *
 * The general lesson is worth keeping: a controller in source is not a deployed route (three
 * modules in this repository were never registered in `AppModule`, so their paths 404 — the route
 * does not exist), and a route's path does not tell you what its handler touches. Only the router
 * knows what is deployed.
 *
 * It also makes route-surface change reviewable. A section that retires or adds endpoints can diff
 * this table instead of asserting.
 */
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

const PROTECTED = ['safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'neondb'];

(async () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('§310 route table REFUSED: DATABASE_URL is unset.');
  const database = new URL(url).pathname.replace(/^\//, '');
  if (PROTECTED.includes(database) || new URL(url).hostname.includes('neon.tech')) {
    throw new Error(`§310 route table REFUSED: ${database} is not a disposable database.`);
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { AppModule } = require('../src/app.module');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: false });
  await app.init();

  const router = app.getHttpAdapter().getInstance()._router
    ?? (app.getHttpAdapter().getInstance() as any).router;
  const routes: string[] = [];
  for (const layer of router.stack ?? []) {
    if (!layer.route) continue;
    for (const method of Object.keys(layer.route.methods)) {
      if (layer.route.methods[method]) routes.push(`${method.toUpperCase()} ${layer.route.path}`);
    }
  }
  routes.sort();

  console.log(`TOTAL ROUTES ${routes.length}`);
  for (const route of routes) console.log(route);

  await app.close();
  process.exit(0);
})().catch((error) => { console.error(error); process.exit(1); });
