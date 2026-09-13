/**
 * §276 — CALENDAR RECONCILIATION REGRESSION (D-007). A RELEASE GATE. TIER 2, REAL HTTP.
 *
 * ==================== WHAT THIS FAILS ON ====================
 *
 * It fails if server-persisted corrective actions or tasks exist and the calendar returns
 * zero. That is the §275 measurement, verbatim: **nine** rows on the server, **0 EVENTS,
 * 0 OPEN, 0 OVERDUE** on the Safety Calendar page whose own subtitle promises "corrective
 * actions, follow-ups, reminders, and due work in one lightweight schedule".
 *
 * The browser half of D-007 -- that the page composes the server read rather than three
 * device-local stores -- is asserted by
 * `frontend-next/scripts/check-276-calendar-reconciliation.mjs`, because a server suite
 * cannot prove what a browser renders and claiming otherwise would be the weaker evidence
 * pretending to be the stronger.
 *
 * ZERO PROVIDER CALLS. Database operations only against a disposable `test_*` database,
 * created and dropped by the §263 wrapper.
 *
 * Run: npm run test:276-calendar-reconciliation   (inside with-disposable-db)
 */
import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from '../src/app.module';

const PROTECTED_DATABASE_NAMES = [
  'safescope', 'sentinel_dev', 'sentinel_safety', 'postgres', 'template0', 'template1',
];

function provenDisposableTarget(): void {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('§276 REFUSED: DATABASE_URL is unset.');
  const parsed = new URL(url);
  const database = parsed.pathname.replace(/^\//, '');
  console.log(`resolved target host=${parsed.hostname} database=${database}`);
  if (PROTECTED_DATABASE_NAMES.includes(database)) {
    throw new Error(`§276 REFUSED: ${database} is a protected database.`);
  }
  if (!/^test_[a-z0-9_]+$/i.test(database)) {
    throw new Error(`§276 REFUSED: ${database} is not a disposable test_* database.`);
  }
  if (process.env.NODE_ENV !== 'test') throw new Error('§276 REFUSED: NODE_ENV must be test.');
  if (String(process.env.DEV_AUTH_BYPASS || '').toLowerCase() === 'true') {
    throw new Error('§276 REFUSED: DEV_AUTH_BYPASS is enabled; the ownership cases would '
      + 'measure the bypass rather than the route.');
  }
  console.log('target proven disposable\n');
}

let pass = 0; let fail = 0; const failures: string[] = [];
const ok = (id: string, cond: boolean, d = ''): void => {
  if (cond) { pass++; console.log(`ok    ${id}${d ? '  [' + d + ']' : ''}`); }
  else { fail++; failures.push(id); console.log(`FAIL  ${id}${d ? '  [' + d + ']' : ''}`); }
};

let baseUrl = '';
type Json = Record<string, any>;
async function call(
  path: string,
  options: { method?: string; body?: unknown; token?: string; ip?: string } = {},
): Promise<{ status: number; body: Json }> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (options.token) headers.authorization = `Bearer ${options.token}`;
  if (options.ip) headers['x-forwarded-for'] = options.ip;
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET', headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await response.text();
  let body: Json = {};
  try { body = text ? JSON.parse(text) : {}; } catch { body = { text }; }
  return { status: response.status, body };
}

/** A local calendar day key `n` days from today, built from LOCAL components. */
function dayKey(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function main(): Promise<void> {
  provenDisposableTarget();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: false });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
  }));
  app.getHttpAdapter().getInstance().set('trust proxy', 1);
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as { port: number } | null;
  if (address === null) throw new Error('§276 ABORT: the test server reported no address');
  baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`application listening on ${baseUrl}\n`);

  const suffix = `${Date.now()}`;
  const password = 'Section276!StrongPass123';
  let authIp = 0;
  const register = async (tag: string) => {
    const email = `s276-${tag}-${suffix}@example.test`;
    await call('/auth/register', {
      method: 'POST', ip: `10.276.9.${(authIp += 1)}`,
      body: { email, password, name: `s276-${tag}`, type: 'individual' },
    });
    const login = await call('/auth/login', {
      method: 'POST', ip: `10.276.9.${(authIp += 1)}`, body: { email, password },
    });
    if (!login.body?.token) {
      throw new Error(`§276 ABORT: ${tag} did not receive a token (${login.status}).`);
    }
    return { email, token: login.body.token as string, userId: login.body.user.id as string };
  };

  const owner = await register('owner');
  const other = await register('other');
  const grant = (userId: string) => execFileSync(
    'npx', ['ts-node', 'scripts/grant-test-entitlement.ts', userId, '2'],
    { env: { ...process.env, NODE_ENV: 'test' }, stdio: 'pipe' });
  grant(owner.userId); grant(other.userId);

  const site = await call('/sites', {
    method: 'POST', token: owner.token, body: { name: `s276-site-${suffix}` },
  });
  const inspection = await call('/inspections', {
    method: 'POST', token: owner.token,
    body: { siteId: site.body.id, title: `s276-${suffix}`, regulatoryContext: 'osha-general-industry' },
  });
  const inspectionId = inspection.body.id as string;

  // =====================================================================================
  // BASELINE. A new account's calendar is empty, and it is empty because nothing is due --
  // not because the read failed. Every later assertion is measured as a DELTA from here,
  // so a suite that silently lost its session cannot score an empty page as a pass.
  // =====================================================================================
  const empty = await call('/calendar', { token: owner.token });
  ok('B1 a new account calendar reads 200', empty.status === 200, `status ${empty.status}`);
  ok('B2 and is empty', Array.isArray(empty.body) && empty.body.length === 0,
    `${Array.isArray(empty.body) ? empty.body.length : 'not an array'} events`);

  // =====================================================================================
  // SCENARIO A — a standalone task with a due date appears on the calendar.
  // =====================================================================================
  const taskDay = dayKey(7);
  const standalone = await call('/tasks', {
    method: 'POST', token: owner.token,
    body: { title: 'S276 standalone task', dueDate: taskDay, priority: 'high' },
  });
  ok('A1 a standalone task is created', standalone.status === 201 || standalone.status === 200,
    `status ${standalone.status}`);
  const standaloneId = standalone.body.id as string;

  let cal = await call('/calendar', { token: owner.token });
  ok('A2 it appears on the calendar', cal.body.length === 1, `${cal.body.length} events`);
  ok('A3 on the day it was given', cal.body[0]?.date === taskDay, `${cal.body[0]?.date} vs ${taskDay}`);
  ok('A4 and the calendar may manage it', cal.body[0]?.editable === true, String(cal.body[0]?.editable));

  // =====================================================================================
  // SCENARIO B and C — corrective actions created from inspection findings appear, on
  // their own dates. This is the §275 failure: nine such rows, zero events.
  //
  // The actions are created with the SAME due date the workflow gives their follow-up
  // task. Before §276 the workflow sent no due date at all, so the action was persisted
  // undated and could not reach a dated surface even once the read path existed.
  // =====================================================================================
  const actionDayOne = dayKey(3);
  const actionDayTwo = dayKey(5);
  const actionOne = await call('/actions', {
    method: 'POST', token: owner.token,
    body: {
      inspectionId, title: 'S276 corrective action one', description: 'first',
      priorityCode: 'urgent', dueDate: actionDayOne,
    },
  });
  const actionTwo = await call('/actions', {
    method: 'POST', token: owner.token,
    body: {
      inspectionId, title: 'S276 corrective action two', description: 'second',
      priorityCode: 'high', dueDate: actionDayTwo,
    },
  });
  ok('B1 corrective action one is created', actionOne.status === 201 || actionOne.status === 200,
    `status ${actionOne.status}`);
  ok('C1 corrective action two is created', actionTwo.status === 201 || actionTwo.status === 200,
    `status ${actionTwo.status}`);

  cal = await call('/calendar', { token: owner.token });
  const actionEvents = cal.body.filter((e: Json) => e.kind === 'corrective_action');

  /**
   * THE GATE. Server-persisted corrective actions exist; the calendar must not return zero.
   */
  ok('D007-GATE persisted corrective actions reach the calendar', actionEvents.length === 2,
    `${actionEvents.length} of 2 — server rows were persisted; a zero here is the §275 defect`);
  ok('C2 each is on its own date',
    actionEvents.some((e: Json) => e.date === actionDayOne)
    && actionEvents.some((e: Json) => e.date === actionDayTwo),
    actionEvents.map((e: Json) => e.date).join(','));
  ok('B2 an inspection-generated action is NOT calendar-editable',
    actionEvents.every((e: Json) => e.editable === false),
    actionEvents.map((e: Json) => String(e.editable)).join(','));
  ok('B3 it carries its inspection',
    actionEvents.every((e: Json) => e.inspectionId === inspectionId), '');

  // =====================================================================================
  // SCENARIO G — several events on one day are all present, none collapsed.
  // =====================================================================================
  const crowdedDay = dayKey(9);
  for (const n of [1, 2, 3]) {
    await call('/tasks', {
      method: 'POST', token: owner.token,
      body: { title: `S276 same-day task ${n}`, dueDate: crowdedDay, priority: 'medium' },
    });
  }
  cal = await call('/calendar', { token: owner.token });
  ok('G1 three events on one day are all returned',
    cal.body.filter((e: Json) => e.date === crowdedDay).length === 3,
    `${cal.body.filter((e: Json) => e.date === crowdedDay).length}`);

  // =====================================================================================
  // SCENARIO D — editing a due date MOVES the event. The old day must clear.
  // =====================================================================================
  const movedDay = dayKey(14);
  const moved = await call(`/tasks/${standaloneId}`, {
    method: 'PATCH', token: owner.token, body: { dueDate: movedDay },
  });
  ok('D1 the edit is accepted', moved.status === 200, `status ${moved.status}`);
  cal = await call('/calendar', { token: owner.token });
  ok('D2 the event is on the new day',
    cal.body.some((e: Json) => e.sourceId === standaloneId && e.date === movedDay), '');
  ok('D3 and the OLD day no longer carries it',
    !cal.body.some((e: Json) => e.sourceId === standaloneId && e.date === taskDay), '');
  ok('D4 it was moved, not duplicated',
    cal.body.filter((e: Json) => e.sourceId === standaloneId).length === 1,
    `${cal.body.filter((e: Json) => e.sourceId === standaloneId).length} copies`);

  // =====================================================================================
  // SCENARIO E — completing work updates its calendar presentation without removing the
  // record. A completed item that vanishes cannot be reviewed, and "was this done?" is a
  // question a compliance calendar has to be able to answer.
  // =====================================================================================
  const completed = await call(`/tasks/${standaloneId}/status`, {
    method: 'PATCH', token: owner.token, body: { status: 'completed' },
  });
  ok('E1 completion is accepted', completed.status === 200, `status ${completed.status}`);
  cal = await call('/calendar', { token: owner.token });
  const completedEvent = cal.body.find((e: Json) => e.sourceId === standaloneId);
  ok('E2 the event is still present', Boolean(completedEvent), '');
  ok('E3 and reads completed', completedEvent?.status === 'completed', String(completedEvent?.status));
  ok('E4 with the instant it was completed', Boolean(completedEvent?.completedAt), '');

  // =====================================================================================
  // SCENARIO F — an overdue item is returned with a PAST date. "Overdue" itself is derived
  // by the reader against the day it is reading on, so the server's obligation is to
  // report the date truthfully rather than to store a label that goes stale overnight.
  // =====================================================================================
  const pastDay = dayKey(-4);
  const overdue = await call('/tasks', {
    method: 'POST', token: owner.token,
    body: { title: 'S276 overdue task', dueDate: pastDay, priority: 'urgent' },
  });
  cal = await call('/calendar', { token: owner.token });
  const overdueEvent = cal.body.find((e: Json) => e.sourceId === overdue.body.id);
  ok('F1 a past-due task is returned', Boolean(overdueEvent), '');
  ok('F2 with its real past date', overdueEvent?.date === pastDay, `${overdueEvent?.date} vs ${pastDay}`);
  ok('F3 and is still open', overdueEvent?.status === 'open', String(overdueEvent?.status));

  // =====================================================================================
  // CANCELLED WORK IS NOT DUE. A cancelled row must leave the calendar; asking a person to
  // act on something nobody expects to happen is a false obligation.
  // =====================================================================================
  const cancelTarget = await call('/tasks', {
    method: 'POST', token: owner.token,
    body: { title: 'S276 cancelled task', dueDate: dayKey(11), priority: 'low' },
  });
  await call(`/tasks/${cancelTarget.body.id}/status`, {
    method: 'PATCH', token: owner.token, body: { status: 'cancelled' },
  });
  cal = await call('/calendar', { token: owner.token });
  ok('X1 a cancelled task leaves the calendar',
    !cal.body.some((e: Json) => e.sourceId === cancelTarget.body.id), '');

  // =====================================================================================
  // AN UNDATED CORRECTIVE ACTION. It is excluded, because a calendar is dated -- and that
  // exclusion is exactly why the workflow now has to send a due date rather than relying
  // on the calendar to invent one.
  // =====================================================================================
  const undated = await call('/actions', {
    method: 'POST', token: owner.token,
    body: {
      inspectionId, title: 'S276 undated action', description: 'no due date',
      priorityCode: 'medium',
    },
  });
  cal = await call('/calendar', { token: owner.token });
  ok('X2 an undated corrective action is not placed on a day',
    !cal.body.some((e: Json) => e.sourceId === undated.body.id), '');

  // =====================================================================================
  // SCENARIO K — the date-only boundary. A task due on a given day reports THAT day, and a
  // corrective action due at 20:00 local on the same day reports the same day. §275 found
  // these two disagreeing by one: the action rendered on the following day.
  // =====================================================================================
  const boundaryDay = dayKey(21);
  const boundaryTask = await call('/tasks', {
    method: 'POST', token: owner.token,
    body: { title: 'S276 boundary task', dueDate: boundaryDay, priority: 'medium' },
  });
  const eveningOffset = (() => {
    const minutes = -new Date().getTimezoneOffset();
    const sign = minutes >= 0 ? '+' : '-';
    const abs = Math.abs(minutes);
    return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
  })();
  const boundaryAction = await call('/actions', {
    method: 'POST', token: owner.token,
    body: {
      inspectionId, title: 'S276 boundary action', description: 'due 20:00 local',
      priorityCode: 'medium', dueDate: `${boundaryDay}T20:00:00${eveningOffset}`,
    },
  });
  cal = await call('/calendar', { token: owner.token });
  const bTask = cal.body.find((e: Json) => e.sourceId === boundaryTask.body.id);
  const bAction = cal.body.find((e: Json) => e.sourceId === boundaryAction.body.id);
  ok('K1 a date-only task lands on the day it names', bTask?.date === boundaryDay,
    `${bTask?.date} vs ${boundaryDay}`);
  ok('K2 an action due 20:00 LOCAL lands on the same day, not the next',
    bAction?.date === boundaryDay, `${bAction?.date} vs ${boundaryDay}`);

  // =====================================================================================
  // SCENARIO L — the calendar's contents come from the SERVER. A second, clean principal
  // with no device state of any kind reads the owner's account and sees nothing of it,
  // while the owner still sees everything. That is the property §275's page could not have:
  // its contents did not depend on the server at all.
  // =====================================================================================
  const ownerCal = await call('/calendar', { token: owner.token });
  const otherCal = await call('/calendar', { token: other.token });
  ok('L1 the owner sees the persisted schedule', ownerCal.body.length >= 8,
    `${ownerCal.body.length} events`);
  ok('L2 a different account sees none of it', otherCal.body.length === 0,
    `${otherCal.body.length} events`);

  // =====================================================================================
  // WORKSPACE ISOLATION ON THE MUTATION ROUTES. A direct id must not leak existence.
  // =====================================================================================
  const foreignPatch = await call(`/tasks/${standaloneId}`, {
    method: 'PATCH', token: other.token, body: { title: 'taken' },
  });
  const foreignDelete = await call(`/tasks/${standaloneId}`, { method: 'DELETE', token: other.token });
  const foreignStatus = await call(`/tasks/${standaloneId}/status`, {
    method: 'PATCH', token: other.token, body: { status: 'cancelled' },
  });
  ok('I1 a foreign edit is refused as not-found', foreignPatch.status === 404, `status ${foreignPatch.status}`);
  ok('I2 a foreign delete is refused as not-found', foreignDelete.status === 404, `status ${foreignDelete.status}`);
  ok('I3 a foreign status change is refused as not-found', foreignStatus.status === 404,
    `status ${foreignStatus.status}`);
  const anonymous = await call('/calendar');
  ok('I4 an unauthenticated calendar read is refused', anonymous.status === 401, `status ${anonymous.status}`);

  // =====================================================================================
  // DELETION BOUNDARY. A standalone task is the user's own and may be deleted here. Work
  // generated by an inspection is part of that inspection's record and is not.
  // =====================================================================================
  const inspectionTask = await call('/tasks', {
    method: 'POST', token: owner.token,
    body: {
      title: 'S276 inspection follow-up', dueDate: dayKey(4), priority: 'high', inspectionId,
    },
  });
  const refusedDelete = await call(`/tasks/${inspectionTask.body.id}`, {
    method: 'DELETE', token: owner.token,
  });
  ok('Y1 inspection-generated work cannot be deleted from the calendar',
    refusedDelete.status === 400, `status ${refusedDelete.status}`);
  ok('Y2 and it is marked not-editable on the calendar',
    (await call('/calendar', { token: owner.token })).body
      .find((e: Json) => e.sourceId === inspectionTask.body.id)?.editable === false, '');

  const allowedDelete = await call(`/tasks/${overdue.body.id}`, { method: 'DELETE', token: owner.token });
  ok('Y3 a standalone task can be deleted', allowedDelete.status === 200, `status ${allowedDelete.status}`);
  ok('Y4 and it leaves the calendar',
    !(await call('/calendar', { token: owner.token })).body
      .some((e: Json) => e.sourceId === overdue.body.id), '');

  // =====================================================================================
  // SCENARIO H and I — a re-read and a fresh process see the same thing. The route holds no
  // state between calls, so a repeated read IS the refresh assertion; the full-restart half
  // is executed against the running stack in the §276 walkthrough.
  // =====================================================================================
  const reread = await call('/calendar', { token: owner.token });
  const rereadAgain = await call('/calendar', { token: owner.token });
  ok('H1 a repeated read returns the same schedule',
    JSON.stringify(reread.body) === JSON.stringify(rereadAgain.body), '');

  await app.close();

  console.log(`\n${pass} passed, ${fail} failed.`);
  if (fail > 0) {
    console.error(`\nFAILED: ${failures.join(', ')}`);
    console.error(
      'D-007 is the defect this gate exists to hold closed: server-persisted due work that '
      + 'never reaches the calendar. §275 measured 9 server rows against 0 displayed events.',
    );
    process.exit(1);
  }
  console.log('§276 D-007 calendar reconciliation: PASS');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
