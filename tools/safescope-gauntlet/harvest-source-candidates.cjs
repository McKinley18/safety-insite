const https = require("https");
const http = require("http");
const fs = require("fs");

const seedPath = "SAFE_SCOPE_SOURCE_HARVEST_SEEDS.json";
const outputPath = "SAFE_SCOPE_HARVESTED_SOURCE_CANDIDATES.json";
const auditPath = "SAFE_SCOPE_HARVESTED_SOURCE_CANDIDATES_AUDIT.md";

if (!fs.existsSync(seedPath)) {
  console.log("No seed file found. Please create SAFE_SCOPE_SOURCE_HARVEST_SEEDS.json.");
  process.exit(0);
}

const seeds = JSON.parse(fs.readFileSync(seedPath, "utf8"));
const candidates = [];
const audit = [];

function fetchUrl(url, redirectCount = 0) {
  return new Promise((resolve) => {
    if (redirectCount > 6) {
      return resolve({ status: 0, data: "", finalUrl: url, error: "Too many redirects" });
    }

    let parsed;
    try {
      parsed = new URL(url);
    } catch (error) {
      return resolve({ status: 0, data: "", finalUrl: url, error: "Invalid URL: " + url });
    }

    const client = parsed.protocol === "http:" ? http : https;

    const requestOptions = {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port: parsed.port || undefined,
      path: parsed.pathname + parsed.search,
      headers: {
        "User-Agent": "Mozilla/5.0 SafeScopeSourceHarvester/1.0 (+https://github.com/McKinley18/sentinel_safety)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf;q=0.8,*/*;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "close"
      }
    };

    const req = client.get(requestOptions, (res) => {
      const status = res.statusCode || 0;

      if (status >= 300 && status < 400 && res.headers.location) {
        const nextUrl = new URL(res.headers.location, parsed).toString();
        res.resume();
        return resolve(fetchUrl(nextUrl, redirectCount + 1));
      }

      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve({ status, data, finalUrl: url, error: null });
      });
    });

    req.on("error", (error) => {
      resolve({ status: 0, data: "", finalUrl: url, error: error.message });
    });

    req.setTimeout(25000, () => {
      req.destroy(new Error("Request timed out"));
    });
  });
}

function visibleText(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function inferAuthority(seed) {
  const agency = seed.sourceAgency;
  if (agency === "NIOSH") return { sourceAuthorityType: "official_research", citationAuthority: "indirect" };
  if (agency === "CSB") return { sourceAuthorityType: "official_investigative", citationAuthority: "indirect" };
  if (agency === "OSHA" || agency === "MSHA") return { sourceAuthorityType: "regulatory_enforcement", citationAuthority: "direct" };
  return { sourceAuthorityType: "supplemental_statistics", citationAuthority: "none" };
}

function allowedUse(seed) {
  if (seed.sourceAgency === "BLS" || seed.sourceAgency === "NSC") {
    return ["trend_context", "executive_summary_context", "analytics_benchmarking"];
  }
  if (seed.sourceAgency === "OSHA" || seed.sourceAgency === "MSHA") {
    return ["source_intelligence", "citation_hint_support", "control_recommendation", "gauntlet_scenario"];
  }
  return ["source_intelligence", "control_recommendation", "gauntlet_scenario"];
}

function titleFromText(text, fallback) {
  const clean = String(text || "").trim();
  if (!clean) return fallback;
  return clean.slice(0, 140);
}

async function run() {
  const seenUrls = new Set();

  for (const [index, seed] of seeds.entries()) {
    if (!seed.sourceUrl) {
      audit.push({ seedId: seed.seedId, status: 0, reason: "Missing sourceUrl" });
      continue;
    }

    if (seenUrls.has(seed.sourceUrl)) {
      audit.push({ seedId: seed.seedId, url: seed.sourceUrl, status: 0, reason: "Duplicate seed URL" });
      continue;
    }
    seenUrls.add(seed.sourceUrl);

    const result = await fetchUrl(seed.sourceUrl);

    if (result.status !== 200) {
      audit.push({
        seedId: seed.seedId,
        url: seed.sourceUrl,
        status: result.status,
        error: result.error || null,
        reason: "Non-200 or fetch failure",
      });
      continue;
    }

    const text = visibleText(result.data);
    const badText = /page not found|404|search results|accident search results/i.test(text);

    if (badText) {
      audit.push({ seedId: seed.seedId, url: seed.sourceUrl, status: 200, reason: "Rejected page-not-found/search-results text" });
      continue;
    }

    if (text.split(/\s+/).length < 75) {
      audit.push({ seedId: seed.seedId, url: seed.sourceUrl, status: 200, reason: "Too little extracted text" });
      continue;
    }

    const authority = inferAuthority(seed);
    const candidateNumber = String(index + 1).padStart(4, "0");

    candidates.push({
      candidateId: `HARVEST-${candidateNumber}`,
      sourceAgency: seed.sourceAgency,
      sourceAuthorityType: authority.sourceAuthorityType,
      citationAuthority: authority.citationAuthority,
      allowedUse: allowedUse(seed),
      sourceType: seed.sourceType,
      sourceTitle: titleFromText(text, seed.notes || seed.sourceUrl),
      sourceUrl: seed.sourceUrl,
      finalUrl: result.finalUrl,
      sourceDate: "",
      hazardDescription: seed.notes || "",
      hazardCategory: seed.expectedHazardCategory || "Uncategorized",
      secondaryHazardCategories: [],
      equipmentInvolved: "",
      rootCauseThemes: [],
      controlFailures: [],
      recommendedControls: [],
      citationHints: [],
      verificationStatus: "pending_review",
      httpStatus: 200,
      verificationEvidence: text.split(/\s+/).slice(0, 120).join(" "),
      matchingScenarioId: null,
      matchConfidence: null,
      notes: `Harvested from ${seed.seedId}; requires manual review before verified-pool merge.`,
    });
  }

  fs.writeFileSync(outputPath, JSON.stringify(candidates, null, 2) + "\n");

  const auditMarkdown = [
    "# SAFE_SCOPE_HARVESTED_SOURCE_CANDIDATES_AUDIT.md",
    "",
    `Seed count: ${seeds.length}`,
    `Harvested candidate count: ${candidates.length}`,
    `Rejected seed count: ${audit.length}`,
    "",
    "## Rejections",
    "",
    "```json",
    JSON.stringify(audit, null, 2),
    "```",
    "",
  ].join("\n");

  fs.writeFileSync(auditPath, auditMarkdown);
  console.log("Harvest complete.");
  console.log(`Seed count: ${seeds.length}`);
  console.log(`Harvested candidate count: ${candidates.length}`);
  console.log(`Rejected seed count: ${audit.length}`);
}

run();
