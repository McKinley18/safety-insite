import { chromium } from "playwright";
import pg from "pg";
import { createHash } from "node:crypto";

const appUrl = process.env.APP_URL || "http://localhost:3105";
const apiUrl = process.env.API_BASE_URL || "http://127.0.0.1:4105";
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const suffix = Date.now();
const password = "Phase5!BrowserPass123";
const emailA = `phase5-browser-a-${suffix}@example.test`;
const emailB = `phase5-browser-b-${suffix}@example.test`;
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const register = async (email) => {
    const response = await page.request.post(`${apiUrl}/auth/register`, {
      data: { email, password, name: email.split("@")[0], type: "individual" },
    });
    if (response.status() !== 201) throw new Error(`Registration failed: ${response.status()}`);
    return response.json();
  };
  const [userA] = await Promise.all([register(emailA), register(emailB)]);
  await db.query(
    `INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'test','expert','active',now(),now()+interval '2 hours',NULL,'Disposable browser release gate')`,
    [userA.userId],
  );
  await page.goto(`${appUrl}/login`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("you@example.com").fill(emailA);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/command-center/);
  const tokenA = await page.evaluate(() => localStorage.getItem("sentinel_auth_token"));
  if (!tokenA) throw new Error("UI login did not establish a session.");
  const loginB = await page.request.post(`${apiUrl}/auth/login`, { data: { email: emailB, password } });
  const tokenB = (await loginB.json()).token;
  const headersA = { authorization: `Bearer ${tokenA}` };
  const headersB = { authorization: `Bearer ${tokenB}` };

  await page.goto(`${appUrl}/inspections`, { waitUntil: "networkidle" });
  const siteName = `Phase 5 browser site ${suffix}`;
  await page.getByLabel("New site name").fill(siteName);
  await page.getByRole("button", { name: "Save site" }).click();
  await page.getByRole("status").filter({ hasText: "Site saved" }).waitFor();
  const sites = await (await page.request.get(`${apiUrl}/sites?limit=100`, { headers: headersA })).json();
  const site = sites.data.find((item) => item.name === siteName);
  if (!site) throw new Error("UI-created site was not persisted.");
  const inspection = await (await page.request.post(`${apiUrl}/inspections`, {
    headers: headersA, data: { siteId: site.id, title: "Phase 5 authenticated report gate" },
  })).json();
  const text = "A conveyor disconnect was locked open and zero energy was verified before guard replacement.";
  const observation = await (await page.request.post(`${apiUrl}/inspections/${inspection.id}/observations`, {
    headers: headersA, data: { rawText: text, evidenceSource: "direct_observation" },
  })).json();
  const hazlenzResponse = await page.request.post(`${apiUrl}/safescope-v2/classify`, {
    headers: headersA, data: { text, structuredObservation: { energyState: "locked-out", evidenceSource: ["visual"] } },
  });
  if (!hazlenzResponse.ok()) throw new Error(`Real HazLenz request failed: ${hazlenzResponse.status()}`);
  const hazlenz = await hazlenzResponse.json();
  const analysis = await (await page.request.post(`${apiUrl}/inspections/observations/${observation.id}/analyses`, {
    headers: headersA, data: {
      engineVersion: "phase5-browser-real-path",
      idempotencyKey: `phase5-browser-${suffix}`,
      requestVersion: 1,
      resultSnapshot: hazlenz,
    },
  })).json();
  const review = await (await page.request.post(`${apiUrl}/inspections/observations/${observation.id}/reviews`, {
    headers: headersA, data: { analysisId: analysis.id, decision: "accepted", rationale: "Qualified reviewer verified the observed lockout." },
  })).json();
  await page.request.post(`${apiUrl}/inspections/observations/${observation.id}/findings`, {
    headers: headersA, data: { reviewId: review.id, hazardCategory: "hazardous_energy", conclusion: "Controlled safe state verified." },
  });
  const inReview = await (await page.request.post(`${apiUrl}/inspections/${inspection.id}/transition`, {
    headers: headersA, data: { status: "in_review", version: 1 },
  })).json();
  const completed = await (await page.request.post(`${apiUrl}/inspections/${inspection.id}/transition`, {
    headers: headersA, data: { status: "completed", version: inReview.version },
  })).json();
  const first = await (await page.request.post(`${apiUrl}/inspections/${inspection.id}/reports`, { headers: headersA })).json();
  const firstDownload = await page.request.get(`${apiUrl}/inspection-reports/${first.reportId}/versions/1/download`, { headers: headersA });
  if (!firstDownload.ok() || Buffer.from(await firstDownload.body()).subarray(0, 5).toString() !== "%PDF-") {
    throw new Error("Authorized report download was not a PDF.");
  }
  const foreign = await page.request.get(`${apiUrl}/inspection-reports/${first.reportId}/versions/1/download`, { headers: headersB });
  if (foreign.status() !== 404) throw new Error(`Foreign report access returned ${foreign.status()}.`);
  const reopened = await (await page.request.post(`${apiUrl}/inspections/${inspection.id}/transition`, {
    headers: headersA, data: { status: "draft", version: completed.version },
  })).json();
  const changed = await (await page.request.patch(`${apiUrl}/inspections/${inspection.id}`, {
    headers: headersA, data: { title: "Phase 5 authenticated report gate — amended", version: reopened.version },
  })).json();
  const rereview = await (await page.request.post(`${apiUrl}/inspections/${inspection.id}/transition`, {
    headers: headersA, data: { status: "in_review", version: changed.version },
  })).json();
  await page.request.post(`${apiUrl}/inspections/${inspection.id}/transition`, {
    headers: headersA, data: { status: "completed", version: rereview.version },
  });
  const second = await (await page.request.post(`${apiUrl}/inspections/${inspection.id}/reports`, { headers: headersA })).json();
  if (second.version !== 2 || second.versionId === first.versionId) throw new Error("Second report version is not distinct.");
  await page.reload({ waitUntil: "networkidle" });
  const persisted = await db.query(
    `SELECT (SELECT count(*)::int FROM hazlenz_analyses WHERE id=$1) analyses,
       (SELECT count(*)::int FROM inspection_report_versions WHERE "reportId"=$2) versions,
       (SELECT count(*)::int FROM storage_objects WHERE "parentType"='report_version' AND "parentId" IN
         (SELECT id FROM inspection_report_versions WHERE "reportId"=$2)) artifacts`,
    [analysis.id, first.reportId],
  );
  if (persisted.rows[0].analyses !== 1 || persisted.rows[0].versions !== 2 || persisted.rows[0].artifacts !== 2) {
    throw new Error(`Persistence proof failed: ${JSON.stringify(persisted.rows[0])}`);
  }
  const artifactProof = await db.query(
    `SELECT v.version,v.sha256,o.provider,o."objectKey"
     FROM inspection_report_versions v JOIN storage_objects o ON o.id=v."storageObjectId"
     WHERE v."reportId"=$1 ORDER BY v.version`,
    [first.reportId],
  );
  if (artifactProof.rows.length !== 2 || artifactProof.rows.some((row) => row.provider !== "s3")) {
    throw new Error("Report artifacts were not durably persisted through S3.");
  }
  const firstAfterVersionTwo = await page.request.get(
    `${apiUrl}/inspection-reports/${first.reportId}/versions/1/download`,
    { headers: headersA },
  );
  const firstAfterBytes = Buffer.from(await firstAfterVersionTwo.body());
  if (createHash("sha256").update(firstAfterBytes).digest("hex") !== artifactProof.rows[0].sha256) {
    throw new Error("Version 1 changed after version 2 generation.");
  }

  await page.goto(`${appUrl}/reports`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Inspection reports" }).waitFor();
  await page.getByText("Version 2", { exact: true }).first().waitFor();
  await page.reload({ waitUntil: "networkidle" });
  await page.getByText("Version 1", { exact: true }).first().waitFor();

  const legacyPublic = await page.request.get(`${apiUrl}/pdf/${first.reportId}`);
  if (legacyPublic.status() !== 404) throw new Error(`Retired /pdf route returned ${legacyPublic.status()}.`);
  const uploadsPublic = await page.request.get(`${apiUrl}/uploads/evidence/guess.jpg`);
  if (uploadsPublic.status() !== 404) throw new Error(`Static upload guess returned ${uploadsPublic.status()}.`);
  const legacyUnauthenticated = await page.request.get(`${apiUrl}/legacy/pdf/${first.reportId}`);
  if (legacyUnauthenticated.status() !== 401) {
    throw new Error(`Legacy compatibility route returned ${legacyUnauthenticated.status()} without auth.`);
  }
  const legacyAuthenticated = await page.request.get(`${apiUrl}/legacy/pdf/${first.reportId}`, { headers: headersA });
  if (legacyAuthenticated.status() !== 410) {
    throw new Error(`Legacy authenticated PDF route returned ${legacyAuthenticated.status()}.`);
  }

  const directEndpoint = process.env.S3_DIRECT_ENDPOINT;
  const directBucket = process.env.S3_BUCKET;
  if (!directEndpoint || !directBucket) throw new Error("S3_DIRECT_ENDPOINT and S3_BUCKET are required.");
  const directObject = await fetch(
    `${directEndpoint.replace(/\/+$/, "")}/${directBucket}/${artifactProof.rows[0].objectKey}`,
  );
  if (directObject.status !== 403) throw new Error(`Direct object access returned ${directObject.status}.`);

  await page.evaluate(() => {
    localStorage.removeItem("sentinel_auth_token");
    localStorage.removeItem("sentinel_auth_user");
  });
  await page.goto(`${appUrl}/reports`, { waitUntil: "networkidle" });
  await page.waitForURL(/login/);
  await page.getByPlaceholder("you@example.com").fill(emailA);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/command-center/);
  await page.goto(`${appUrl}/reports`, { waitUntil: "networkidle" });
  await page.getByText("Version 2", { exact: true }).first().waitFor();

  console.log(JSON.stringify({
    passed: true, scenarios: 31, uiLogin: true, uiSiteCreation: true, realHazLenz: true,
    immutableVersions: 2, authorizedPdf: true, crossUserStatus: foreign.status(),
    mobileViewport: "390x844", persisted: persisted.rows[0], storageProvider: "s3",
    directObjectStatus: directObject.status, logoutLoginPersistence: true,
    retiredLegacyRoutes: true,
  }));
} finally {
  await browser.close();
  await db.end();
}
