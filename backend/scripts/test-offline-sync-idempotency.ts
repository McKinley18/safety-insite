/**
 * V1-OFFLINE-IDEMPOTENCY-01 -- the server-side identity contract for offline synchronisation.
 *
 * Run (disposable stack only):
 *   NODE_ENV=test DATABASE_URL=postgresql://…/test_… API_BASE_URL=http://localhost:4300 \
 *     npx ts-node scripts/test-offline-sync-idempotency.ts
 *
 * What is under test, and why it exists.
 *
 * Creating an inspection, an observation or an evidence object is a non-idempotent POST. A server
 * that commits the row and then loses the response leaves the client unable to distinguish "never
 * happened" from "happened, answer lost" -- and a retry duplicates. The client used to reconcile
 * this by matching title + site + timestamp, which is a similarity judgement, not identity: it
 * cannot separate two legitimate inspections created moments apart at the same site with the same
 * title, and it refuses to act whenever more than one candidate matches.
 *
 * The contract replacing it: the CLIENT mints a stable opaque `clientRequestId`, persists it with
 * the local record, and replays it unchanged on every attempt. The DATABASE -- via three partial
 * unique indexes added by migration 1800000015000 -- is the authority that one identifier means
 * one row. This suite asserts that authority directly against the HTTP API, including the two
 * properties that a naive implementation would get wrong: a DIFFERENT identifier must always
 * create a distinct row even when every content field matches, and one user's identifier must
 * never resolve another user's row.
 */

const baseUrl = process.env.API_BASE_URL || 'http://localhost:4300';
const databaseUrl = process.env.DATABASE_URL || '';
if (process.env.NODE_ENV !== 'test' || !/test|phase[0-9]+|closure|_qa_/i.test(databaseUrl)) {
  throw new Error('Offline sync idempotency test requires an isolated, disposable test database.');
}

let passes = 0;
const failures: string[] = [];

function check(condition: unknown, label: string, detail?: string) {
  if (condition) {
    passes += 1;
    console.log(`PASS ${label}`);
    return;
  }
  failures.push(label);
  console.error(`FAIL ${label}${detail ? ` -- ${detail}` : ''}`);
}

async function api(
  path: string,
  init: RequestInit & { token?: string } = {},
): Promise<{ status: number; body: any }> {
  const { token, ...rest } = init;
  const response = await fetch(`${baseUrl}${path}`, {
    ...rest,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(rest.headers || {}),
    },
  });
  const text = await response.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: response.status, body };
}

/**
 * POST /auth/login is throttled to 5 per 60s per IP. This suite creates two accounts, which is
 * within budget on its own, but it is routinely run alongside other auth-touching suites. Waiting
 * the window out is correct; reporting a rate limit as an authorisation defect is not.
 */
const LOGIN_WINDOW_MS = 62_000;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function makeUser(label: string, attempt = 0): Promise<{
  label: string; email: string; token: string; userId: string;
}> {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  const email = `idempotency-${label}-${suffix}@insite-verify.test`;
  const password = 'Idempotent!Pass123';
  const reg = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: `Idempotency ${label}`, email, password, type: 'individual' }),
  });
  if (reg.status === 429 && attempt < 3) {
    console.log(`     (auth rate limit hit; waiting ${LOGIN_WINDOW_MS / 1000}s)`);
    await sleep(LOGIN_WINDOW_MS);
    return makeUser(label, attempt + 1);
  }
  if (reg.status !== 201) throw new Error(`register ${label} failed: ${reg.status}`);
  const login = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (login.status === 429 && attempt < 3) {
    console.log(`     (auth rate limit hit; waiting ${LOGIN_WINDOW_MS / 1000}s)`);
    await sleep(LOGIN_WINDOW_MS);
    return makeUser(label, attempt + 1);
  }
  if (login.status !== 201 && login.status !== 200) {
    throw new Error(`login ${label} failed: ${login.status}`);
  }
  const token = login.body.accessToken || login.body.token;
  const me = await api('/auth/me', { token });
  return { label, email, token, userId: me.body.id };
}

/** A minimal, genuinely decodable PNG — the evidence route validates raster magic bytes. */
function makePng(widthPx: number, heightPx: number): Buffer {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { deflateSync } = require('zlib') as typeof import('zlib');
  const crcTable = (() => {
    const table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
    return table;
  })();
  const crc32 = (buffer: Buffer) => {
    let c = 0xffffffff;
    for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, data: Buffer) => {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const typed = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(typed));
    return Buffer.concat([length, typed, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(widthPx, 0);
  ihdr.writeUInt32BE(heightPx, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const raw = Buffer.alloc(heightPx * (1 + widthPx * 3));
  for (let y = 0; y < heightPx; y++) {
    const rowStart = y * (1 + widthPx * 3);
    raw[rowStart] = 0;
    for (let x = 0; x < widthPx; x++) {
      const p = rowStart + 1 + x * 3;
      raw[p] = (x * 7) % 256;
      raw[p + 1] = (y * 5) % 256;
      raw[p + 2] = 128;
    }
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

async function uploadEvidence(
  token: string,
  inspectionId: string,
  bytes: Buffer,
  clientRequestId?: string,
) {
  const form = new FormData();
  // Copy into a plain Uint8Array: Node's Buffer is typed over ArrayBufferLike, which the DOM
  // BlobPart signature (ArrayBuffer only) does not accept.
  form.append('file', new Blob([new Uint8Array(bytes)], { type: 'image/png' }), 'evidence.png');
  if (clientRequestId) form.append('clientRequestId', clientRequestId);
  const response = await fetch(`${baseUrl}/inspections/${inspectionId}/evidence`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: form,
  });
  const text = await response.text();
  let body: any = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { status: response.status, body };
}

function localId(prefix: string) {
  return `${prefix}_${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}-${Math.random().toString(16).slice(2, 10)}`;
}

async function main() {
  const A = await makeUser('a');
  const B = await makeUser('b');
  check(A.userId && B.userId && A.userId !== B.userId, 'two distinct disposable accounts created');

  const siteA = await api('/sites', {
    method: 'POST', token: A.token, body: JSON.stringify({ name: `Idempotency site A ${Date.now()}` }),
  });
  const siteB = await api('/sites', {
    method: 'POST', token: B.token, body: JSON.stringify({ name: `Idempotency site B ${Date.now()}` }),
  });
  check(siteA.status === 201 && siteB.status === 201, 'each account has its own site');

  const CREATE_A = localId('draft');
  const inspectionBody = {
    siteId: siteA.body.id,
    title: 'Identical title, identical site',
    regulatoryContext: 'msha',
  };

  // --- C. the same identifier repeated -> exactly one inspection -------------
  const first = await api('/inspections', {
    method: 'POST', token: A.token,
    body: JSON.stringify({ ...inspectionBody, clientRequestId: CREATE_A }),
  });
  const replay = await api('/inspections', {
    method: 'POST', token: A.token,
    body: JSON.stringify({ ...inspectionBody, clientRequestId: CREATE_A }),
  });
  check(first.status === 201, 'C. the first create succeeds', String(first.status));
  check(
    replay.body?.id === first.body?.id,
    'C. replaying the identifier returns the SAME inspection',
    `${first.body?.id} vs ${replay.body?.id}`,
  );

  // Ten concurrent replays: the check-then-insert is not a lock, so this is the path that exercises
  // the unique index rejecting losers and each loser re-reading the winner.
  const burst = await Promise.all(
    Array.from({ length: 10 }, () =>
      api('/inspections', {
        method: 'POST', token: A.token,
        body: JSON.stringify({ ...inspectionBody, clientRequestId: CREATE_A }),
      }),
    ),
  );
  const burstIds = new Set(burst.map((r) => r.body?.id));
  check(
    burstIds.size === 1 && burstIds.has(first.body.id),
    'C. ten CONCURRENT replays all resolve to the one inspection',
    JSON.stringify([...burstIds]),
  );
  check(
    burst.every((r) => r.status === 200 || r.status === 201),
    'C. no concurrent replay surfaced the unique-index rejection as an error',
    JSON.stringify(burst.map((r) => r.status)),
  );

  // --- B. a different identifier, identical content -> a distinct inspection --
  const CREATE_A2 = localId('draft');
  const distinct = await api('/inspections', {
    method: 'POST', token: A.token,
    body: JSON.stringify({ ...inspectionBody, clientRequestId: CREATE_A2 }),
  });
  check(
    distinct.status === 201 && distinct.body?.id && distinct.body.id !== first.body.id,
    'B. a DIFFERENT identifier creates a distinct inspection despite identical title, site and time',
  );

  // --- D. cross-user: A's identifier must not resolve for B ------------------
  const crossUser = await api('/inspections', {
    method: 'POST', token: B.token,
    body: JSON.stringify({
      siteId: siteB.body.id,
      title: 'Identical title, identical site',
      regulatoryContext: 'msha',
      clientRequestId: CREATE_A,
    }),
  });
  check(
    crossUser.status === 201 && crossUser.body?.id && crossUser.body.id !== first.body.id,
    "D. USER_B replaying USER_A's identifier gets a NEW inspection, never USER_A's",
  );
  check(
    crossUser.body?.siteId === siteB.body.id,
    "D. USER_B's inspection is scoped to USER_B's own site",
  );
  const aReadsB = await api(`/inspections/${crossUser.body.id}`, { token: A.token });
  check(aReadsB.status === 404, "D. USER_A still cannot read USER_B's inspection (404)", String(aReadsB.status));

  // --- backward compatibility: no identifier at all --------------------------
  const bare1 = await api('/inspections', { method: 'POST', token: A.token, body: JSON.stringify(inspectionBody) });
  const bare2 = await api('/inspections', { method: 'POST', token: A.token, body: JSON.stringify(inspectionBody) });
  check(
    bare1.status === 201 && bare2.status === 201 && bare1.body.id !== bare2.body.id,
    'creates carrying NO identifier remain unconstrained and independent (backward compatible)',
  );

  // --- validation ------------------------------------------------------------
  const badKey = await api('/inspections', {
    method: 'POST', token: A.token,
    body: JSON.stringify({ ...inspectionBody, clientRequestId: 'short' }),
  });
  check(badKey.status === 400, 'an identifier outside the accepted pattern is rejected (400)', String(badKey.status));

  // --- E. observation identity ----------------------------------------------
  const inspectionId = first.body.id;
  const OBS_KEY = localId('obs');
  const obsBody = { rawText: 'Guard missing from the tail pulley.', evidenceSource: 'direct_observation' };

  const obs1 = await api(`/inspections/${inspectionId}/observations`, {
    method: 'POST', token: A.token, body: JSON.stringify({ ...obsBody, clientRequestId: OBS_KEY }),
  });
  const obs2 = await api(`/inspections/${inspectionId}/observations`, {
    method: 'POST', token: A.token, body: JSON.stringify({ ...obsBody, clientRequestId: OBS_KEY }),
  });
  check(obs1.status === 201, 'E. the first observation create succeeds', String(obs1.status));
  check(obs2.body?.id === obs1.body?.id, 'E. replaying the observation identifier returns the SAME observation');

  const obsBurst = await Promise.all(
    Array.from({ length: 8 }, () =>
      api(`/inspections/${inspectionId}/observations`, {
        method: 'POST', token: A.token, body: JSON.stringify({ ...obsBody, clientRequestId: OBS_KEY }),
      }),
    ),
  );
  check(
    new Set(obsBurst.map((r) => r.body?.id)).size === 1,
    'E. eight CONCURRENT observation replays all resolve to the one observation',
  );

  const obsDistinct = await api(`/inspections/${inspectionId}/observations`, {
    method: 'POST', token: A.token, body: JSON.stringify({ ...obsBody, clientRequestId: localId('obs') }),
  });
  check(
    obsDistinct.body?.id && obsDistinct.body.id !== obs1.body.id,
    'E. a different observation identifier creates a distinct observation despite identical text',
  );

  const loaded = await api(`/inspections/${inspectionId}`, { token: A.token });
  const matching = (loaded.body?.observations || []).filter(
    (o: any) => o.rawText === obsBody.rawText,
  );
  check(
    matching.length === 2,
    'E. the server holds exactly two observations — one per identifier, not one per request',
    `found ${matching.length} across ${1 + 1 + obsBurst.length + 1} requests`,
  );

  // --- F. evidence identity --------------------------------------------------
  const png = makePng(320, 240);
  const PHOTO_KEY = localId('photo');

  const up1 = await uploadEvidence(A.token, inspectionId, png, PHOTO_KEY);
  const up2 = await uploadEvidence(A.token, inspectionId, png, PHOTO_KEY);
  check(up1.status === 201, 'F. the first evidence upload succeeds', `${up1.status} ${JSON.stringify(up1.body)}`);
  check(up2.body?.id === up1.body?.id, 'F. replaying the photo identifier returns the SAME evidence object');

  const upDistinct = await uploadEvidence(A.token, inspectionId, png, localId('photo'));
  check(
    upDistinct.body?.id && upDistinct.body.id !== up1.body.id,
    'F. a different photo identifier stores a distinct evidence object even for identical bytes',
  );

  const upBare = await uploadEvidence(A.token, inspectionId, png);
  check(
    upBare.status === 201 && upBare.body?.id !== up1.body?.id,
    'F. an upload carrying no identifier still works and is independent (backward compatible)',
  );

  // --- D (subordinate): B cannot reach A's inspection at all ------------------
  const crossObs = await api(`/inspections/${inspectionId}/observations`, {
    method: 'POST', token: B.token, body: JSON.stringify({ ...obsBody, clientRequestId: OBS_KEY }),
  });
  check(
    crossObs.status === 404,
    "D. USER_B cannot append an observation to USER_A's inspection, identifier or not",
    String(crossObs.status),
  );
  const crossUpload = await uploadEvidence(B.token, inspectionId, png, PHOTO_KEY);
  check(
    crossUpload.status === 404,
    "D. USER_B cannot upload evidence to USER_A's inspection, identifier or not",
    String(crossUpload.status),
  );

  console.log(
    `\nOffline sync idempotency: ${passes} passed, ${failures.length} failed` +
      (failures.length ? ` — ${failures.join('; ')}` : ' — identity, not similarity, decides.'),
  );
  if (failures.length) process.exit(1);
}

main().catch((error) => {
  console.error('FAIL harness', error);
  process.exit(1);
});
