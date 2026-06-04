type Json = Record<string, any>;

const API_BASE_URL =
  process.env.SENTINEL_API_URL ||
  process.env.API_BASE_URL ||
  "http://localhost:4000";

const DEV_ORGANIZATION_ID =
  process.env.DEV_ORGANIZATION_ID ||
  process.env.X_DEV_ORGANIZATION_ID ||
  "workspace-alpha";

const AUTH_TOKEN = process.env.SENTINEL_AUTH_TOKEN || process.env.AUTH_TOKEN || "";

async function readJson(response: Response): Promise<Json> {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

function assert(condition: any, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function headers(workspaceId = DEV_ORGANIZATION_ID): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...(AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {}),
    ...(workspaceId ? { "x-dev-organization-id": workspaceId } : {}),
  };
}

async function main() {
  console.log("\nSentinel Safety Deployment Smoke Test");
  console.log("=====================================\n");
  console.log(`API_BASE_URL: ${API_BASE_URL}`);
  console.log(`Auth mode: ${AUTH_TOKEN ? "bearer token" : "dev organization header"}`);

  console.log("\n▶ Health check");
  const healthResponse = await fetch(`${API_BASE_URL}/health`);
  const health = await readJson(healthResponse);
  assert(healthResponse.ok, `Health check failed: ${healthResponse.status} ${JSON.stringify(health)}`);
  console.log("✅ Health check passed");

  console.log("\n▶ SafeScope classify");
  const classifyResponse = await fetch(`${API_BASE_URL}/safescope-v2/classify`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      text: "Missing guard on conveyor tail pulley with employee access to the nip point during cleanup at a surface aggregate mine.",
      scopes: ["msha_mnm_surface"],
      riskProfileId: "standard_5x5",
      evidenceTexts: ["Photo shows exposed tail pulley and cleanup area."],
    }),
  });

  const classify = await readJson(classifyResponse);
  assert(classifyResponse.ok, `SafeScope classify failed: ${classifyResponse.status} ${JSON.stringify(classify)}`);
  assert(!classify.fallbackMode, "SafeScope classify returned fallbackMode=true.");
  assert(classify.classification === "Machine Guarding", `Expected Machine Guarding, got ${classify.classification}`);
  assert(classify.reasoningSnapshotId, "SafeScope classify did not return reasoningSnapshotId.");

  const topCitation = classify.suggestedStandards?.[0]?.citation;
  assert(
    String(topCitation || "").includes("56.14107"),
    `Expected top MSHA MNM surface citation to include 56.14107, got ${topCitation}`,
  );

  console.log(`✅ SafeScope classify passed`);
  console.log(`Snapshot ID: ${classify.reasoningSnapshotId}`);
  console.log(`Top citation: ${topCitation}`);

  console.log("\n▶ Reasoning snapshot summary");
  const snapshotResponse = await fetch(
    `${API_BASE_URL}/safescope-v2/reasoning-snapshots/${classify.reasoningSnapshotId}`,
    { headers: headers() },
  );
  const snapshot = await readJson(snapshotResponse);
  assert(snapshotResponse.ok, `Snapshot summary failed: ${snapshotResponse.status} ${JSON.stringify(snapshot)}`);
  assert(snapshot.id === classify.reasoningSnapshotId, "Snapshot summary ID mismatch.");
  assert(snapshot.equipmentReasoningSummary, "Snapshot summary missing equipmentReasoningSummary.");
  console.log("✅ Reasoning snapshot summary passed");

  console.log("\n▶ Wrong workspace snapshot block");
  const blockedResponse = await fetch(
    `${API_BASE_URL}/safescope-v2/reasoning-snapshots/${classify.reasoningSnapshotId}`,
    { headers: headers("workspace-wrong") },
  );

  if (!AUTH_TOKEN) {
    assert(
      blockedResponse.status === 403,
      `Expected wrong workspace snapshot request to return 403, got ${blockedResponse.status}`,
    );
    console.log("✅ Wrong workspace snapshot block passed");
  } else {
    console.log("ℹ Skipped wrong-workspace header assertion because bearer-token auth is being used.");
  }

  console.log("\n▶ Supervisor validation");
  const validationResponse = await fetch(`${API_BASE_URL}/safescope-v2/supervisor-validations`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      reasoningSnapshotId: classify.reasoningSnapshotId,
      workspaceId: DEV_ORGANIZATION_ID,
      reviewerName: "Deployment Smoke Test",
      validationDecision: "accepted",
      reviewerNotes: "Automated smoke validation for deployment readiness.",
    }),
  });

  const validation = await readJson(validationResponse);
  assert(
    validationResponse.ok,
    `Supervisor validation failed: ${validationResponse.status} ${JSON.stringify(validation)}`,
  );
  assert(validation.reasoningSnapshotId === classify.reasoningSnapshotId, "Supervisor validation snapshot ID mismatch.");
  console.log("✅ Supervisor validation passed");

  console.log("\n=====================================");
  console.log("✅ Sentinel Safety deployment smoke test passed.");
  console.log("=====================================\n");
}

main().catch((error) => {
  console.error("\n❌ Sentinel Safety deployment smoke test failed.");
  console.error(error);
  process.exit(1);
});
