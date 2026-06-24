#!/usr/bin/env node

const http = require("http");

const API_URL = process.env.HAZLENZ_API_URL || "http://localhost:4000/safescope-v2/classify";
const MAX_BYTES = Number(process.env.HAZLENZ_MAX_RESPONSE_BYTES || 75000);

const payload = {
  text: "A conveyor tail pulley is missing its guard and workers clean material near the moving belt pinch point.",
  scopes: ["msha"],
  evidenceTexts: [
    "Conveyor tail pulley exposed",
    "Guard missing",
    "Workers clean near moving belt",
    "Pinch point exposed",
  ],
};

const hiddenFields = [
  "pendingReviewerCandidates",
  "draftKnowledgeWarnings",
  "retrieval",
  "knowledgeBrain",
  "inspectionIntelligence",
  "decisionSupportMetadata",
];

const legacyVisibleNames = [
  "SafeScope",
  "Sentinel Safety",
  "ReviewCore",
  "GuideGuard",
  "SightSignal",
  "AuditAlly",
];

function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const body = JSON.stringify(data);

    const req = http.request(
      {
        method: "POST",
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let raw = "";

        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          resolve({ statusCode: res.statusCode, raw });
        });
      },
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function collectDomainIds(value, output = []) {
  if (!value || typeof value !== "object") return output;

  if (Array.isArray(value)) {
    for (const item of value) collectDomainIds(item, output);
    return output;
  }

  if (typeof value.domainId === "string") {
    output.push(value.domainId);
  }

  for (const nested of Object.values(value)) {
    collectDomainIds(nested, output);
  }

  return output;
}

(async () => {
  const { statusCode, raw } = await postJson(API_URL, payload);
  const responseBytes = Buffer.byteLength(raw, "utf8");

  assert(statusCode >= 200 && statusCode < 300, `Expected 2xx response, got ${statusCode}. Body: ${raw.slice(0, 500)}`);
  assert(responseBytes <= MAX_BYTES, `Expected response under ${MAX_BYTES} bytes, got ${responseBytes}.`);

  const data = JSON.parse(raw);

  assert(data.classification === "Machine Guarding", `Expected Machine Guarding, got ${data.classification}`);
  assert(data.risk?.riskBand === "Critical", `Expected Critical risk, got ${data.risk?.riskBand}`);

  const suggestedCitations = data.standardsTraceability?.suggestedCitations || [];
  assert(
    suggestedCitations.includes("30 CFR 56.14107(a)"),
    `Expected 30 CFR 56.14107(a), got ${JSON.stringify(suggestedCitations)}`,
  );

  const actionCount = Array.isArray(data.generatedActions) ? data.generatedActions.length : 0;
  assert(actionCount >= 1, "Expected at least one generated corrective action.");

  for (const field of hiddenFields) {
    assert(!(field in data), `Hidden field should not be present in normal output: ${field}`);
  }

  for (const name of legacyVisibleNames) {
    assert(!raw.includes(name), `Legacy visible name leaked in response: ${name}`);
  }

  const domainIds = collectDomainIds(data);
  assert(!domainIds.includes("hot_work"), `Conveyor cleanup falsely routed to hot_work. Domains: ${domainIds.join(", ")}`);

  console.log("✅ HazLenz field output smoke test passed");
  console.log(`classification: ${data.classification}`);
  console.log(`risk: ${data.risk?.riskBand}`);
  console.log(`standards: ${suggestedCitations.join(", ")}`);
  console.log(`actions: ${actionCount}`);
  console.log(`responseBytes: ${responseBytes}`);
})();
