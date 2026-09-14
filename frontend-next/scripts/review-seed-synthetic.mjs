// §279 — SEED SYNTHETIC REVIEW DATA THROUGH THE REAL API, AS A REAL USER.
//
// Nothing here touches the database directly. Every row is created by the same authenticated
// HTTP calls the product itself makes, which is the only way the seed can be wrong in the same
// way the product is wrong -- a seed written straight into Postgres can produce a state the
// application can never actually reach, and then the review measures a fiction.
//
// Registers the review account if it does not exist, signs in, and creates a site, a populated
// inspection with several observations, and an EMPTY inspection so the empty state is reachable
// as itself rather than by deleting things.
//
// ZERO provider calls: no analysis is requested. The review stack runs with
// EXPERT_EXECUTION_ENABLED=false and no provider key in its environment.
//
// Usage: API_URL=http://localhost:4000 VAL_EMAIL=... VAL_PASSWORD=... node scripts/review-seed-synthetic.mjs

const API = process.env.API_URL || "http://localhost:4000";
const EMAIL = process.env.VAL_EMAIL || "review-279b@example.test";
const PASSWORD = process.env.VAL_PASSWORD || "Review279b!aA";

async function call(path, init = {}, token) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) throw new Error(`${init.method || "GET"} ${path} -> ${res.status} ${text.slice(0, 300)}`);
  return body;
}

const OBSERVATIONS = [
  "Guard missing from the infeed nip point on the number two conveyor in the packaging line. "
    + "The interlock switch is present but the fixed guard panel has been removed and is leaning "
    + "against the adjacent column. Operators were feeding cartons by hand within reach of the nip.",
  "Extension cord run across the main walkway from the maintenance bay to a portable work light. "
    + "The cord is taped to the floor with duct tape and the strain relief at the plug is split, "
    + "exposing roughly 15mm of the inner conductors.",
  "Two employees were working from a rolling scaffold at approximately 4.5 metres to replace a "
    + "light fitting. Neither was tied off and the guardrail on the open side had been removed to "
    + "pass the fitting up. The casters were not locked.",
  "Chemical storage cabinet in the wash bay is unlabelled and contains four decanted containers "
    + "of what the operator described as 'the acid cleaner'. No secondary labels, no SDS binder "
    + "in the area, and the eyewash station in the bay had a missing inspection tag.",
];

(async () => {
  // Register, tolerating an account that already exists.
  try {
    await call("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Review Inspector",
        email: EMAIL,
        password: PASSWORD,
      }),
    });
    console.log("registered", EMAIL);
  } catch (error) {
    console.log("register skipped:", String(error).slice(0, 160));
  }

  const login = await call("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const token = login.accessToken || login.access_token || login.token;
  if (!token) throw new Error(`no token in login response: ${JSON.stringify(login).slice(0, 300)}`);
  console.log("signed in");

  const sites = await call("/sites?limit=100", {}, token);
  const existing = (sites.data || sites || []).find((s) => s.name === "Northline Plant 2");
  const site = existing || await call("/sites", {
    method: "POST",
    body: JSON.stringify({ name: "Northline Plant 2" }),
  }, token);
  console.log("site", site.id, site.name);

  const populated = await call("/inspections", {
    method: "POST",
    body: JSON.stringify({
      siteId: site.id,
      title: "Packaging line walkthrough",
      regulatoryContext: "osha-general-industry",
      clientRequestId: `review-279b-populated-${Date.now()}`,
    }),
  }, token);
  console.log("populated inspection", populated.id);

  for (const [index, rawText] of OBSERVATIONS.entries()) {
    const obs = await call(`/inspections/${populated.id}/observations`, {
      method: "POST",
      body: JSON.stringify({
        rawText,
        evidenceSource: "direct_observation",
        clientRequestId: `review-279b-obs-${index}-${populated.id}`,
      }),
    }, token);
    console.log("  observation", index + 1, obs.id);
  }

  const empty = await call("/inspections", {
    method: "POST",
    body: JSON.stringify({
      siteId: site.id,
      title: "Loading dock — not yet started",
      regulatoryContext: "osha-general-industry",
      clientRequestId: `review-279b-empty-${Date.now()}`,
    }),
  }, token);
  console.log("empty inspection", empty.id);

  console.log(JSON.stringify({
    email: EMAIL,
    siteId: site.id,
    populatedInspectionId: populated.id,
    emptyInspectionId: empty.id,
    observations: OBSERVATIONS.length,
    providerCalls: 0,
  }, null, 2));
})();
