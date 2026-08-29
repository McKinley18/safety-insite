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
  // TIER FIXTURE, repaired 2026-08-28. This fixture needs a PAID account so the report release
  // path is reachable; it is not a test of tier naming. It granted 'expert' because Expert was
  // the top tier when it was written. Expert was retired by migration
  // 1800000005900-RetireExpertTier, which added CHECK (tier = 'pro'), so the insert began failing
  // with entitlement_grants_tier_check and this gate had been red at HEAD ever since -- a stale
  // instrument, not a product defect. 'pro' is the v1 equivalent of the paid access it intended.
  //
  // Same repair, and same accompanying assertion, as check-closure-inspection-workspace.mjs: the
  // retired tier is then proven to STILL be rejected, so relaxing the fixture cannot quietly
  // relax the constraint it used to depend on.
  await db.query(
    `INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
     VALUES ($1,'test','pro','active',now(),now()+interval '2 hours',NULL,'Disposable browser release gate')`,
    [userA.userId],
  );
  let expertRejected = false;
  try {
    await db.query(
      `INSERT INTO entitlement_grants ("userId",source,tier,status,"startsAt","endsAt","issuedByUserId",reason)
       VALUES ($1,'test','expert','active',now(),now()+interval '2 hours',NULL,
               'Retired-tier probe -- must be rejected')`,
      [userA.userId],
    );
  } catch (error) {
    expertRejected = /entitlement_grants_tier_check|violates check constraint/i.test(String(error));
  }
  if (!expertRejected) {
    throw new Error(
      "Expert-tier entitlement grant was NOT rejected -- the retired-Expert constraint is missing or weakened.",
    );
  }
  console.log("PASS: retired 'expert' tier is still rejected by entitlement_grants_tier_check");
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
  // Site creation moved behind the "Saved site" selector: the "New site name" input renders only
  // after "Add new site" (`__new__`) is chosen. A step is added; nothing is relaxed -- this is
  // still the real customer path, and the site it creates is still verified through the API below.
  await page.getByLabel("Saved site").selectOption("__new__");
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
  // FINDING DISPOSITION, re-derived 2026-08-28. This finalized ONE hardcoded finding
  // (`hazardous_energy`) and named no `segmentKey`. Two things changed under the accepted
  // checkpoint and both are stronger properties, not regressions:
  //
  //   1. HazLenz decomposition now PERSISTS every proposed finding as `pending_review`, and an
  //      inspection cannot be completed while any current finding lacks a completed human review
  //      ("Every current finding requires a completed human review before finalization."). This
  //      observation legitimately decomposes into more than one finding, so disposing of one and
  //      finalizing the inspection was never a complete review -- the server now says so.
  //   2. `segmentKey` is the finding's identity. Without it the finalize call cannot match the
  //      pending finding and creates a SECOND one beside it, which is what left the fixture
  //      permanently un-completable.
  //
  // So the fixture now reviews what HazLenz actually proposed, by identity, which is what a
  // qualified reviewer does.
  const beforeReview = await (await page.request.get(
    `${apiUrl}/inspections/${inspection.id}`, { headers: headersA },
  )).json();
  const pending = (beforeReview.findings || []).filter((item) => item.status === "pending_review");
  if (pending.length === 0) throw new Error("HazLenz persisted no reviewable finding.");
  for (const candidate of pending) {
    const finalized = await page.request.post(
      `${apiUrl}/inspections/observations/${observation.id}/findings`,
      {
        headers: headersA,
        data: {
          reviewId: review.id,
          segmentKey: candidate.segmentKey,
          hazardCategory: candidate.hazardCategory,
          conclusion: "Controlled safe state verified by the qualified reviewer.",
        },
      },
    );
    if (!finalized.ok()) {
      throw new Error(`Finalizing ${candidate.hazardCategory} returned ${finalized.status()}.`);
    }
  }
  // Identity, not just count: finalizing by segmentKey must dispose of the findings that already
  // existed rather than creating new ones beside them.
  const afterReview = await (await page.request.get(
    `${apiUrl}/inspections/${inspection.id}`, { headers: headersA },
  )).json();
  const stillPending = (afterReview.findings || []).filter((item) => item.status === "pending_review");
  if (stillPending.length !== 0) {
    throw new Error(`${stillPending.length} finding(s) remain pending after review by segmentKey.`);
  }
  if ((afterReview.findings || []).length !== pending.length) {
    throw new Error(
      `Review by segmentKey changed the finding count from ${pending.length} to ${(afterReview.findings || []).length}.`,
    );
  }
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
  // ONE REPORT PER INSPECTION, re-derived 2026-08-28. This expected `versions === 2` and
  // `artifacts === 2`: regenerating added a version BESIDE the first and both PDFs were retained.
  // The accepted canonical architecture inverts that deliberately -- finishing a reopened
  // inspection REPLACES the report, and the superseded artifact is destroyed rather than left as
  // an unreferenced PDF, so a customer is never asked which of two reports is the real one.
  //
  // The expectation is therefore corrected to the accepted contract, and made STRICTER rather
  // than looser: it now also proves the superseded version row and its artifact are actually
  // gone, which the old two-version expectation could never have caught.
  if (persisted.rows[0].analyses !== 1 || persisted.rows[0].versions !== 1 || persisted.rows[0].artifacts !== 1) {
    throw new Error(`Persistence proof failed: ${JSON.stringify(persisted.rows[0])}`);
  }
  const supersededRows = await db.query(
    `SELECT count(*)::int n FROM inspection_report_versions WHERE id=$1`, [first.versionId],
  );
  if (supersededRows.rows[0].n !== 0) {
    throw new Error("The superseded report version survived alongside its replacement.");
  }
  // The superseded artifact is TOMBSTONED, not row-deleted: `retireReportArtifact` deletes the
  // bytes from the storage provider and marks the record `deleted` with a `deletedAt`, so the
  // retirement stays auditable. Requiring the row to vanish would be wrong; requiring it to be
  // live would be worse. What must hold is that nothing still-live points at the old PDF.
  const supersededArtifacts = await db.query(
    `SELECT count(*)::int total,
            count(*) FILTER (WHERE status <> 'deleted' OR "deletedAt" IS NULL)::int live
       FROM storage_objects WHERE "parentType"='report_version' AND "parentId"=$1`,
    [first.versionId],
  );
  if (supersededArtifacts.rows[0].live !== 0) {
    throw new Error(
      `The superseded report artifact was left live after replacement: ${JSON.stringify(supersededArtifacts.rows[0])}`,
    );
  }

  const artifactProof = await db.query(
    `SELECT v.version,v.sha256,o.provider,o."objectKey"
     FROM inspection_report_versions v JOIN storage_objects o ON o.id=v."storageObjectId"
     WHERE v."reportId"=$1 ORDER BY v.version`,
    [first.reportId],
  );
  // The private storage provider, not a filesystem path the web server could serve. `s3` is the
  // production default and the only value production validation accepts
  // (`validate-production-environment.ts` refuses any other), so it stays the default expectation
  // here; a disposable verification stack that explicitly runs `local_test` is allowed to say so.
  const expectedProvider = process.env.STORAGE_PROVIDER || "s3";
  if (artifactProof.rows.length !== 1 || artifactProof.rows.some((row) => row.provider !== expectedProvider)) {
    throw new Error(
      `Report artifacts were not durably persisted through the ${expectedProvider} provider.`,
    );
  }
  if (!artifactProof.rows[0].objectKey || !artifactProof.rows[0].sha256) {
    throw new Error("The surviving report artifact carries no object key or checksum.");
  }
  // The current report downloads, and its bytes are the artifact the database records.
  const currentDownload = await page.request.get(
    `${apiUrl}/inspection-reports/${first.reportId}/download`, { headers: headersA },
  );
  const currentBytes = Buffer.from(await currentDownload.body());
  if (createHash("sha256").update(currentBytes).digest("hex") !== artifactProof.rows[0].sha256) {
    throw new Error("The downloaded report does not match the stored artifact checksum.");
  }
  // The superseded version's URL must not still serve a report.
  const supersededDownload = await page.request.get(
    `${apiUrl}/inspection-reports/${first.reportId}/versions/1/download`, { headers: headersA },
  );
  if (supersededDownload.ok()) {
    throw new Error("A superseded report version is still downloadable.");
  }

  await page.goto(`${appUrl}/reports`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Inspection reports" }).waitFor();
  // No version list on the report library, by design -- one card per inspection.
  const cards = await page.getByTestId("report-card").count();
  if (cards !== 1) throw new Error(`Report library shows ${cards} cards for one inspection.`);

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

  // BUCKET-IS-NOT-PUBLIC. Reaching the object store directly requires the object store, so this
  // is the one assertion a disposable local stack genuinely cannot make. It stays MANDATORY for
  // the `s3` provider -- which is the production default and the only provider production
  // validation accepts -- so nothing about the production guarantee is softened. A run that has
  // explicitly declared `STORAGE_PROVIDER=local_test` records the check as NOT VERIFIED rather
  // than reporting a pass it did not perform.
  const directEndpoint = process.env.S3_DIRECT_ENDPOINT;
  const directBucket = process.env.S3_BUCKET;
  let directObjectStatus = "NOT_VERIFIED_LOCAL_TEST_PROVIDER";
  if (expectedProvider === "s3") {
    if (!directEndpoint || !directBucket) throw new Error("S3_DIRECT_ENDPOINT and S3_BUCKET are required.");
    const directObject = await fetch(
      `${directEndpoint.replace(/\/+$/, "")}/${directBucket}/${artifactProof.rows[0].objectKey}`,
    );
    if (directObject.status !== 403) throw new Error(`Direct object access returned ${directObject.status}.`);
    directObjectStatus = directObject.status;
  } else {
    console.log(
      `NOT VERIFIED: direct object-store access is unreachable under STORAGE_PROVIDER=${expectedProvider}. ` +
      "The bucket-is-not-public assertion is mandatory under the s3 provider and was NOT performed here.",
    );
  }

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
  await page.getByTestId("report-card").first().waitFor();

  console.log(JSON.stringify({
    passed: true, scenarios: 31, uiLogin: true, uiSiteCreation: true, realHazLenz: true,
    canonicalSingleReport: true, authorizedPdf: true, crossUserStatus: foreign.status(),
    mobileViewport: "390x844", persisted: persisted.rows[0], storageProvider: expectedProvider,
    directObjectStatus, logoutLoginPersistence: true,
    retiredLegacyRoutes: true,
  }));
} finally {
  await browser.close();
  await db.end();
}
