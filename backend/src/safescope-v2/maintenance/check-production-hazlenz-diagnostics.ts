import axios from "axios";

// Configuration from environment variables
const TARGET_HOST = process.env.TARGET_HOST || "http://localhost:4000";
const JWT_TOKEN = process.env.DIAGNOSTIC_JWT_TOKEN;
const EMAIL = process.env.DIAGNOSTIC_USER_EMAIL;
const PASSWORD = process.env.DIAGNOSTIC_USER_PASSWORD;

async function run() {
  console.log("================================================================");
  console.log("          HAZLENZ DEPLOYMENT & PRODUCTION DIAGNOSTICS          ");
  console.log("================================================================");
  console.log(`Target Host: ${TARGET_HOST}`);
  console.log("----------------------------------------------------------------");

  // 1. Check Health & Version Endpoints
  console.log("\n[1/3] Checking Health Endpoints...");
  try {
    const healthRes = await axios.get(`${TARGET_HOST}/health`);
    console.log(`GET /health: Status ${healthRes.status}`);
    console.log("Payload:", JSON.stringify(healthRes.data, null, 2));
  } catch (err: any) {
    console.error(`❌ GET /health failed: ${err.message}`);
    if (err.response) {
      console.error("Payload:", err.response.data);
    }
  }

  try {
    const versionRes = await axios.get(`${TARGET_HOST}/health/version`);
    console.log(`\nGET /health/version: Status ${versionRes.status}`);
    console.log("Payload:", JSON.stringify(versionRes.data, null, 2));
  } catch (err: any) {
    console.error(`❌ GET /health/version failed: ${err.message}`);
    if (err.response) {
      console.error("Payload:", err.response.data);
    }
  }

  // 2. Authentication
  let token = JWT_TOKEN;
  if (!token && EMAIL && PASSWORD) {
    console.log("\n[2/3] Authenticating with credentials...");
    try {
      const loginRes = await axios.post(`${TARGET_HOST}/auth/login`, {
        email: EMAIL,
        password: PASSWORD,
      });
      token = loginRes.data.token;
      console.log("✅ Authentication successful.");
    } catch (err: any) {
      console.error(`❌ Authentication failed: ${err.message}`);
      if (err.response) {
        console.error("Response:", err.response.data);
      }
      process.exit(1);
    }
  } else if (token) {
    console.log("\n[2/3] Using provided DIAGNOSTIC_JWT_TOKEN.");
  } else {
    console.log("\n[2/3] No auth credentials supplied. Skipping classification tests.");
    console.log("To run classification tests, provide DIAGNOSTIC_JWT_TOKEN or DIAGNOSTIC_USER_EMAIL/DIAGNOSTIC_USER_PASSWORD.");
    return;
  }

  // 3. Classification Scenarios
  console.log("\n[3/3] Running Classification Scenarios...");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const scenarios = [
    {
      name: "MSHA Conveyor Guarding",
      payload: {
        text: "At an aggregate mine, the tail pulley on a conveyor is missing guarding and miners walk near the pinch point during cleanup.",
        scopes: ["msha"],
        debugMetadata: true,
      },
    },
    {
      name: "MSHA Mobile Equipment/No Berm",
      payload: {
        text: "A haul truck is operating on an elevated roadway with no berms or guard devices to prevent overtravel.",
        scopes: ["msha"],
        debugMetadata: true,
      },
    },
    {
      name: "OSHA GI Electrical Panel",
      payload: {
        text: "In the maintenance shop, an electrical panel has an open slot exposing live conductors and wiring.",
        scopes: ["osha_general_industry"],
        debugMetadata: true,
      },
    },
  ];

  for (const s of scenarios) {
    console.log("\n----------------------------------------------------------------");
    console.log(`Running scenario: ${s.name}`);
    console.log(`Narrative: "${s.payload.text}"`);
    console.log(`Scopes: ${JSON.stringify(s.payload.scopes)}`);
    console.log("----------------------------------------------------------------");

    try {
      const res = await axios.post(`${TARGET_HOST}/safescope-v2/classify`, s.payload, { headers });
      console.log(`HTTP Status: ${res.status}`);
      console.log(`Classification: ${res.data.classification || "none"}`);
      console.log(`Risk Level: ${res.data.risk?.riskLevel || res.data.risk?.riskBand || "none"}`);

      // Route Key Shard Info
      if (res.data.knowledgeRoute) {
        console.log(`Route Shard Key: ${res.data.knowledgeRoute.shardKey || "none"}`);
        console.log(`Focused Shard Citations: ${JSON.stringify(res.data.knowledgeRoute.shardSummary?.citations || [])}`);
      }

      // Top Suggested Standards
      const suggested = res.data.suggestedStandards || [];
      console.log(`\nTop ${suggested.length} Suggested Standards:`);
      suggested.forEach((std: any, i: number) => {
        console.log(`  [#${i + 1}] ${std.citation} (Score: ${std.score})`);
        if (std.matchingReasons) {
          console.log(`      Reasons: ${std.matchingReasons.join(", ")}`);
        }
      });

      // Excluded Standards
      const excluded = res.data.excludedStandards || [];
      if (excluded.length > 0) {
        console.log(`\nExcluded Standards count: ${excluded.length}`);
      }

      // Diagnostics metadata
      if (res.data.debugMetadata) {
        console.log("\nDiagnostics Fields (debugMetadata):");
        const meta = res.data.debugMetadata;
        if (meta.memoryBeforeClassify && meta.memoryAfterClassify) {
          console.log(`  📊 [Memory Before Classify] RSS: ${meta.memoryBeforeClassify.rssMb} MB, Heap Used: ${meta.memoryBeforeClassify.heapUsedMb} MB`);
          console.log(`  📊 [Memory After Classify]  RSS: ${meta.memoryAfterClassify.rssMb} MB, Heap Used: ${meta.memoryAfterClassify.heapUsedMb} MB`);
          const deltaRss = meta.memoryAfterClassify.rssMb - meta.memoryBeforeClassify.rssMb;
          const deltaHeap = meta.memoryAfterClassify.heapUsedMb - meta.memoryBeforeClassify.heapUsedMb;
          console.log(`  📊 [Memory Delta]           RSS Delta: ${deltaRss >= 0 ? '+' : ''}${deltaRss} MB, Heap Delta: ${deltaHeap >= 0 ? '+' : ''}${deltaHeap} MB`);
        }
        console.log(JSON.stringify(res.data.debugMetadata, null, 2));
      } else {
        console.log("\n⚠️ No debugMetadata returned in payload.");
      }

    } catch (err: any) {
      console.error(`❌ Scenario failed: ${err.message}`);
      if (err.response) {
        console.error("HTTP Status:", err.response.status);
        console.error("Payload:", err.response.data);
      }
    }
  }

  console.log("\n================================================================");
  console.log("                  DIAGNOSTICS CHECK COMPLETE                    ");
  console.log("================================================================");
}

run().catch((err) => {
  console.error("Unhandled error running diagnostics:", err);
  process.exit(1);
});
