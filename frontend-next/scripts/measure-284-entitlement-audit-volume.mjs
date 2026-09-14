// §284 — THE BOUNDED SYNTHETIC CASE FOR ENTITLEMENT-DENIAL AUDIT VOLUME.
//
// One Free account, one observation, a fixed number of REFUSED requests, and a count of the
// `security_audit_events` rows they produced. Run it against the same disposable stack before and
// after the policy change and the two numbers are directly comparable.
//
// It deliberately drives the API rather than a browser. The question is what the SERVER writes
// when it refuses, and a browser would add the client's own suppression to the measurement — which
// is a different (and separately measured) effect.
//
// Usage:
//   API_URL=... VAL_EMAIL=... VAL_PASSWORD=... DB_URL=... READS=25 MUTATIONS=3 \
//     node scripts/measure-284-entitlement-audit-volume.mjs
import { execFileSync } from "node:child_process";

const API_URL = process.env.API_URL || "http://localhost:4000";
const EMAIL = process.env.VAL_EMAIL;
const PASSWORD = process.env.VAL_PASSWORD;
const DB_URL = process.env.DB_URL;
const READS = Number(process.env.READS || 25);
const MUTATIONS = Number(process.env.MUTATIONS || 3);

if (!DB_URL) throw new Error("DB_URL is required — the row count is read from the database.");

const sql = (query) =>
  execFileSync("psql", [DB_URL, "-At", "-c", query], { encoding: "utf8" }).trim();

const login = await (await fetch(`${API_URL}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
})).json();
const token = login.accessToken || login.access_token || login.token;
if (!token) throw new Error("no token");
const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());

const inspections = await (await fetch(`${API_URL}/inspections`, {
  headers: { Authorization: `Bearer ${token}` },
})).json();
const list = Array.isArray(inspections) ? inspections : inspections.data || inspections.items || [];
// The account has more than one inspection and not all of them have observations -- picking
// list[0] blind would measure whichever one happened to sort first. Take the first that has one.
let observationId = null;
for (const row of list) {
  const detail = await (await fetch(`${API_URL}/inspections/${row.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })).json();
  const first = (detail.observations || [])[0];
  if (first) { observationId = first.id; break; }
}
if (!observationId) throw new Error("no observation on any inspection for this account");

const countRows = () =>
  Number(sql(`select count(*) from security_audit_events where "actorUserId" = '${claims.userId}'`));
const byAction = () =>
  Object.fromEntries(
    sql(`select action, count(*) from security_audit_events where "actorUserId" = '${claims.userId}' group by action order by 2 desc`)
      .split("\n").filter(Boolean).map((line) => {
        const [action, count] = line.split("|");
        return [action, Number(count)];
      }),
  );

const before = { total: countRows(), byAction: byAction() };

const statuses = { reads: [], mutations: [] };
for (let i = 0; i < READS; i += 1) {
  const response = await fetch(
    `${API_URL}/inspections/observations/${observationId}/expert-analyses/current`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  statuses.reads.push(response.status);
}
for (let i = 0; i < MUTATIONS; i += 1) {
  const response = await fetch(
    `${API_URL}/inspections/observations/${observationId}/expert-analyses`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ idempotencyKey: `audit-284-${i}` }),
    },
  );
  statuses.mutations.push(response.status);
}

// The write is not on the response path, so give it a moment to land before counting.
await new Promise((resolve) => setTimeout(resolve, 1500));

const after = { total: countRows(), byAction: byAction() };

const result = {
  account: EMAIL,
  plan: claims.planCode || claims.subscriptionTier || "unknown",
  refusedReads: READS,
  refusedMutations: MUTATIONS,
  readStatuses: [...new Set(statuses.reads)],
  mutationStatuses: [...new Set(statuses.mutations)],
  rowsBefore: before.total,
  rowsAfter: after.total,
  rowsWrittenByThisCase: after.total - before.total,
  byActionBefore: before.byAction,
  byActionAfter: after.byAction,
};
console.log(JSON.stringify(result, null, 2));
