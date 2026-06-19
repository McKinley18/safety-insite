import "reflect-metadata";
import { DataSource } from "typeorm";
import * as fs from "fs";
import * as path from "path";
import { HAZLENZ_COVERAGE_BACKLOG } from "./hazlenz-coverage-backlog.seed";

type ColdStandardRow = {
  citation: string;
  agency_code: string;
  scope_code: string;
  part_number: string;
  source_key: string | null;
  title: string;
};

function normalizeCitation(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/^29\s*cfr\s*/i, "")
    .replace(/^30\s*cfr\s*/i, "")
    .replace(/§/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function buildDataSource() {
  const databaseUrl =
    process.env.DATABASE_URL || "postgresql://user:password@db:5432/safescope";

  return new DataSource({
    type: "postgres",
    url: databaseUrl,
    synchronize: false,
    ssl: false,
  });
}

interface QAResult {
  filename: string;
  shardKey: string;
  passed: boolean;
  warnings: string[];
  errors: string[];
  citationsCount: number;
  sourcesCount: number;
  priority: string;
  jurisdiction: string;
  backlogTitle: string;
}

async function run() {
  const candidatesDir = path.join(__dirname, "generated-candidates");
  if (!fs.existsSync(candidatesDir)) {
    console.error(`Error: Generated candidates directory does not exist at ${candidatesDir}`);
    process.exit(1);
  }

  // Load all JSON files in generated-candidates
  const files = fs.readdirSync(candidatesDir).filter(f => f.endsWith(".json"));
  console.log(`Found ${files.length} candidate files to QA.`);

  // Attempt database connection
  let standardByCitation = new Map<string, ColdStandardRow>();
  let dbConnected = false;
  let ds: DataSource | null = null;
  try {
    ds = buildDataSource();
    console.log("Connecting to database for standards verification...");
    await ds.initialize();
    dbConnected = true;
    console.log("Connected to database successfully.");

    const standards = (await ds.query(`
      SELECT citation, agency_code, scope_code, part_number, source_key, title
      FROM standards_master
      WHERE is_active = true
    `)) as ColdStandardRow[];
    console.log(`Loaded ${standards.length} active cold standards for verification.`);

    for (const std of standards) {
      standardByCitation.set(normalizeCitation(std.citation), std);
    }
  } catch (err) {
    console.warn("Warning: Could not connect to database. Skipping active standards verification from DB. Using offline checks instead.");
  }

  const results: QAResult[] = [];

  for (const filename of files) {
    const filePath = path.join(candidatesDir, filename);
    const content = fs.readFileSync(filePath, "utf8");
    let candidate: any;
    const errors: string[] = [];
    const warnings: string[] = [];

    // Parse JSON
    try {
      candidate = JSON.parse(content);
    } catch (e) {
      errors.push("Invalid JSON format");
      results.push({
        filename,
        shardKey: "N/A",
        passed: false,
        warnings: [],
        errors,
        citationsCount: 0,
        sourcesCount: 0,
        priority: "unknown",
        jurisdiction: "unknown",
        backlogTitle: "unknown",
      });
      continue;
    }

    // Rule checks
    
    // 1. approvalStatus
    if (candidate.approvalStatus !== "draft_requires_human_review") {
      errors.push(`approvalStatus must be "draft_requires_human_review", got "${candidate.approvalStatus}"`);
    }

    // 2. Metadata existence
    const requiredStrings = ["jurisdiction", "hazardFamily", "equipmentFamily", "taskMechanism", "shardKeyCandidate", "bundleIdCandidate"];
    for (const field of requiredStrings) {
      if (!candidate[field] || typeof candidate[field] !== "string" || candidate[field].trim() === "") {
        errors.push(`Missing or empty metadata field: ${field}`);
      }
    }

    // 3. Citations
    if (!Array.isArray(candidate.citations) || candidate.citations.length === 0) {
      errors.push("citations must be a non-empty array");
    }

    // 4. Source Keys
    if (!Array.isArray(candidate.sourceKeys) || candidate.sourceKeys.length === 0) {
      errors.push("sourceKeys must be a non-empty array");
    }

    // 5. Cold Standards Found
    if (!Array.isArray(candidate.coldStandardsFound)) {
      errors.push("coldStandardsFound must be an array");
    } else {
      const citationsSet = new Set(candidate.citations.map(normalizeCitation));
      const foundCitationsSet = new Set(candidate.coldStandardsFound.map((c: any) => normalizeCitation(c.citation)));

      // Check if coldStandardsFound matches candidate citations
      for (const citation of candidate.citations) {
        if (!foundCitationsSet.has(normalizeCitation(citation))) {
          warnings.push(`Citation "${citation}" is missing corresponding entry in coldStandardsFound`);
        }
      }

      // Check for unexpected extra records in coldStandardsFound
      for (const entry of candidate.coldStandardsFound) {
        if (!citationsSet.has(normalizeCitation(entry.citation))) {
          warnings.push(`Unexpected citation "${entry.citation}" found in coldStandardsFound`);
        }
      }
    }

    // 6. DB standards check
    if (dbConnected && Array.isArray(candidate.citations)) {
      for (const citation of candidate.citations) {
        const normalized = normalizeCitation(citation);
        if (!standardByCitation.has(normalized)) {
          warnings.push(`Citation "${citation}" not found in active standards_master database`);
        }
      }
    }

    // 7. Draft completeness and usefulness
    const draftFields = ["evidenceNeededDraft", "correctiveActionPatternsDraft", "applicabilityDraft"];
    for (const field of draftFields) {
      const draftArray = candidate[field];
      if (!Array.isArray(draftArray) || draftArray.length === 0) {
        errors.push(`${field} must be a non-empty array`);
      } else {
        for (let i = 0; i < draftArray.length; i++) {
          const item = draftArray[i];
          if (typeof item !== "string" || item.trim().length <= 5) {
            errors.push(`${field}[${i}] is not a useful draft statement (too short or empty)`);
          }
        }
      }
    }

    // 8. Reviewer Notes
    if (candidate.reviewerNotes === undefined || candidate.reviewerNotes === null || typeof candidate.reviewerNotes !== "string" || candidate.reviewerNotes.trim() === "") {
      errors.push("reviewerNotes is missing or empty");
    }

    // 9. Forbidden Terms: "citation confirmed", "violation confirmed", "confirmed citation", "confirmed violation"
    const forbiddenPhrases = [
      "citation confirmed",
      "violation confirmed",
      "confirmed citation",
      "confirmed violation"
    ];
    const rawText = JSON.stringify(candidate).toLowerCase();
    for (const phrase of forbiddenPhrases) {
      if (rawText.includes(phrase)) {
        errors.push(`Candidate contains forbidden phrase: "${phrase}"`);
      }
    }

    // 10. No declaration of a violation / strict assertion
    // We check drafts and reviewer notes for "violation" or "violates" assertions.
    // However, the text of a cold standard title/description (which is a quote of the law) is allowed.
    // So we check: evidenceNeededDraft, correctiveActionPatternsDraft, applicabilityDraft, and reviewerNotes.
    const fieldsToInspectForViolations = [
      candidate.evidenceNeededDraft,
      candidate.correctiveActionPatternsDraft,
      candidate.applicabilityDraft,
      candidate.reviewerNotes ? [candidate.reviewerNotes] : []
    ].filter(Boolean);

    for (const fieldGroup of fieldsToInspectForViolations) {
      if (Array.isArray(fieldGroup)) {
        for (const statement of fieldGroup) {
          if (typeof statement === "string") {
            const lowerStatement = statement.toLowerCase();
            if (lowerStatement.includes("violation") || lowerStatement.includes("violates") || lowerStatement.includes("violating")) {
              // Ensure it's not a generic reference to "preventing a violation"
              if (!lowerStatement.includes("prevent") && !lowerStatement.includes("avoid")) {
                errors.push(`Draft text appears to declare/assert a violation: "${statement}"`);
              }
            }
          }
        }
      }
    }

    // 11. Preservation of Advisory posture
    // Check if [Advisory Only] or similar warning exists in drafts
    const hasAdvisoryPosture = draftFields.every(field => {
      const draftArray = candidate[field];
      if (Array.isArray(draftArray)) {
        return draftArray.some((item: string) => item.toLowerCase().includes("advisory only") || item.toLowerCase().includes("qualified safety"));
      }
      return false;
    });

    if (!hasAdvisoryPosture) {
      errors.push("Candidate fails to preserve advisory-only / qualified-review posture (missing [Advisory Only] warnings)");
    }

    // Find priority from backlog seed
    const backlogMatch = HAZLENZ_COVERAGE_BACKLOG.find(item => 
      item.jurisdiction === candidate.jurisdiction &&
      item.hazardFamily === candidate.hazardFamily &&
      item.equipmentFamily === candidate.equipmentFamily &&
      item.taskMechanism === candidate.taskMechanism
    );

    const priority = backlogMatch ? backlogMatch.priority : "unknown";
    const backlogTitle = backlogMatch ? backlogMatch.title : "unknown";

    results.push({
      filename,
      shardKey: candidate.shardKeyCandidate || "N/A",
      passed: errors.length === 0,
      warnings,
      errors,
      citationsCount: Array.isArray(candidate.citations) ? candidate.citations.length : 0,
      sourcesCount: Array.isArray(candidate.sourceKeys) ? candidate.sourceKeys.length : 0,
      priority,
      jurisdiction: candidate.jurisdiction || "unknown",
      backlogTitle,
    });
  }

  // Sort candidates by priority: critical -> high -> medium -> later -> unknown
  const priorityOrder: Record<string, number> = {
    critical: 1,
    high: 2,
    medium: 3,
    later: 4,
    unknown: 5
  };

  const sortedResults = [...results].sort((a, b) => {
    const pA = priorityOrder[a.priority] || 5;
    const pB = priorityOrder[b.priority] || 5;
    if (pA !== pB) return pA - pB;
    return a.shardKey.localeCompare(b.shardKey);
  });

  const totalCandidates = results.length;
  const passCount = results.filter(r => r.passed && r.warnings.length === 0).length;
  const warningCount = results.filter(r => r.passed && r.warnings.length > 0).length;
  const failCount = results.filter(r => !r.passed).length;

  console.log(`\n=== QA SUMMARY ===`);
  console.log(`Total Candidate Files:  ${totalCandidates}`);
  console.log(`Passed (Clean):        ${passCount}`);
  console.log(`Passed (With Warnings): ${warningCount}`);
  console.log(`Failed:                ${failCount}`);

  // Generate QA_REPORT.md
  const reportPath = path.join(candidatesDir, "QA_REPORT.md");
  let markdown = `# HazLenz Warm-Shard Candidate QA and Promotion Report

This report summarizes the bulk QA audit and promotion-readiness status for the generated HazLenz warm-shard candidates.

## Audit Summary

* **Total Candidate Files**: ${totalCandidates}
* **Pass Count (Clean)**: ${passCount}
* **Warning Count**: ${warningCount}
* **Fail Count**: ${failCount}

---

## Per-Candidate QA Details

| Candidate File / Shard Key | Priority | Status | Citations | Source Keys | Notes / Errors / Warnings |
|---|---|---|---|---|---|
`;

  for (const r of sortedResults) {
    let statusText = "🟢 PASS";
    if (!r.passed) {
      statusText = "🔴 FAIL";
    } else if (r.warnings.length > 0) {
      statusText = "🟡 WARN";
    }

    const issues = [...r.errors.map(e => `❌ ${e}`), ...r.warnings.map(w => `⚠️ ${w}`)].join("<br>");
    markdown += `| **${r.filename}**<br>\`${r.shardKey}\` | \`${r.priority}\` | ${statusText} | ${r.citationsCount} | ${r.sourcesCount} | ${issues || "All checks passed successfully."} |\n`;
  }

  markdown += `
---

## Recommended Promotion Order

Candidates are ordered below by backlog priority (Critical first, then High) and represent the recommended sequence for human-in-the-loop review and promotion.

### 1. Tier 1: Critical Priority Candidates
`;

  const criticals = sortedResults.filter(r => r.priority === "critical");
  if (criticals.length > 0) {
    criticals.forEach(c => {
      markdown += `* [ ] \`${c.shardKey}\` (File: [${c.filename}](file:///Users/mckinley/Sentinel_Safety/backend/src/safescope-v2/coverage/generated-candidates/${c.filename})) - *Backlog: ${c.backlogTitle}*\n`;
    });
  } else {
    markdown += `*No critical candidates remaining.*\n`;
  }

  markdown += `
### 2. Tier 2: High Priority Candidates
`;

  const highs = sortedResults.filter(r => r.priority === "high");
  if (highs.length > 0) {
    highs.forEach(c => {
      markdown += `* [ ] \`${c.shardKey}\` (File: [${c.filename}](file:///Users/mckinley/Sentinel_Safety/backend/src/safescope-v2/coverage/generated-candidates/${c.filename})) - *Backlog: ${c.backlogTitle}*\n`;
    });
  } else {
    markdown += `*No high candidates remaining.*\n`;
  }

  markdown += `
### 3. Tier 3: Medium/Later Priority Candidates
`;

  const rest = sortedResults.filter(r => r.priority !== "critical" && r.priority !== "high");
  if (rest.length > 0) {
    rest.forEach(c => {
      markdown += `* [ ] \`${c.shardKey}\` (File: [${c.filename}](file:///Users/mckinley/Sentinel_Safety/backend/src/safescope-v2/coverage/generated-candidates/${c.filename})) - *Priority: ${c.priority}*\n`;
    });
  } else {
    markdown += `*No medium or lower priority candidates remaining.*\n`;
  }

  markdown += `
---

## Risks Requiring Human Review

> [!IMPORTANT]
> 1. **Generic Drafts**: The generated evidence needed, corrective actions, and applicability criteria are generic safety statements. A qualified safety engineer must tailor them to align with domain practices before production use.
> 2. **Regulatory Posture**: Candidates must remain strictly advisory. Under no circumstances should they declare that a violation exists or is confirmed.
> 3. **Validation Warnings**: Any warning flagged above (e.g., citations missing corresponding standard records) must be verified against the eCFR source before shard promotion.
`;

  fs.writeFileSync(reportPath, markdown, "utf8");
  console.log(`\nReport successfully written to: ${reportPath}`);

  if (ds) {
    await ds.destroy();
  }

  if (failCount > 0) {
    process.exit(1);
  }
}

run().catch(async (err) => {
  console.error("QA script failed:", err);
  process.exit(1);
});
