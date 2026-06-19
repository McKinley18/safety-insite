import "reflect-metadata";
import { DataSource } from "typeorm";
import * as fs from "fs";
import * as path from "path";
import { HAZLENZ_COVERAGE_BACKLOG } from "./hazlenz-coverage-backlog.seed";
import { HAZLENZ_KNOWLEDGE_SHARDS } from "../knowledge-shards/hazlenz-knowledge-shards.seed";

type ColdStandardRow = {
  citation: string;
  agency_code: string;
  scope_code: string;
  part_number: string;
  source_key: string | null;
  title: string;
  standard_text?: string;
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

function generateEvidenceNeededDraft(item: typeof HAZLENZ_COVERAGE_BACKLOG[0]): string[] {
  const equip = item.equipmentFamily && item.equipmentFamily !== "unknown" ? item.equipmentFamily : "applicable equipment/systems";
  const mechanism = item.taskMechanism && item.taskMechanism !== "unknown" ? item.taskMechanism : "operational activity";
  const hazard = item.hazardFamily && item.hazardFamily !== "unknown" ? item.hazardFamily : "safety hazard category";
  
  return [
    `Identify the specific ${equip} or workplace location involved.`,
    `Confirm whether physical or administrative safety controls for ${mechanism} are in place and operational.`,
    `Review training records, inspection checklists, or maintenance documentation relevant to ${hazard}.`,
    `Verify conformance with standard citations: ${item.candidateCitations.join(", ")}.`,
    `[Advisory Only] Qualified safety personnel must verify specific evidence requirements on-site.`
  ];
}

function generateCorrectiveActionPatternsDraft(item: typeof HAZLENZ_COVERAGE_BACKLOG[0]): string[] {
  const equip = item.equipmentFamily && item.equipmentFamily !== "unknown" ? item.equipmentFamily : "equipment";
  const mechanism = item.taskMechanism && item.taskMechanism !== "unknown" ? item.taskMechanism : "hazard exposure";
  const hazard = item.hazardFamily && item.hazardFamily !== "unknown" ? item.hazardFamily : "hazard category";

  return [
    `Restrict access to or isolate any hazardous conditions related to ${mechanism} immediately.`,
    `Inspect, repair, or replace any defective components of the affected ${equip} before returning to service.`,
    `Implement engineering, administrative, or PPE controls to minimize risks from ${mechanism}.`,
    `Instruct workers on safe practices regarding ${hazard} and verify procedural compliance.`,
    `Document corrective actions completed and ensure compliance with citations: ${item.candidateCitations.join(", ")}.`,
    `[Advisory Only] Corrective action details must be reviewed and approved by qualified safety managers or engineers.`
  ];
}

function generateApplicabilityDraft(item: typeof HAZLENZ_COVERAGE_BACKLOG[0]): string[] {
  const equip = item.equipmentFamily && item.equipmentFamily !== "unknown" ? item.equipmentFamily : "equipment/tools";
  const mechanism = item.taskMechanism && item.taskMechanism !== "unknown" ? item.taskMechanism : "work process";

  return [
    `Applies to operations within jurisdiction: ${item.jurisdiction}.`,
    `Applies when task, activity, or condition involves ${equip} or associated subsystems.`,
    `Applies when workers are exposed to ${mechanism} risks during normal or maintenance operations.`,
    `Relevant for hazard family: ${item.hazardFamily}.`,
    `[Advisory Only] Scope of applicability must be validated by a qualified inspector or safety professional.`
  ];
}

async function run() {
  const ds = buildDataSource();
  console.log(`Connecting to database...`);
  await ds.initialize();
  console.log(`Database connected successfully.`);

  // Load active standards
  console.log(`Querying active standards from standards_master...`);
  const standards = (await ds.query(`
    SELECT citation, agency_code, scope_code, part_number, source_key, title, standard_text
    FROM standards_master
    WHERE is_active = true
  `)) as ColdStandardRow[];
  console.log(`Loaded ${standards.length} active cold standards.`);

  // Map standards by normalized citation
  const standardByCitation = new Map<string, ColdStandardRow>();
  for (const std of standards) {
    standardByCitation.set(normalizeCitation(std.citation), std);
  }

  // Map active warm shards citations
  const shardCitationSet = new Set(
    HAZLENZ_KNOWLEDGE_SHARDS.flatMap((shard) => shard.citations).map(
      normalizeCitation,
    ),
  );

  const outputDir = path.join(__dirname, "generated-candidates");
  if (!fs.existsSync(outputDir)) {
    console.log(`Creating output directory: ${outputDir}`);
    fs.mkdirSync(outputDir, { recursive: true });
  }

  let totalBacklogItems = HAZLENZ_COVERAGE_BACKLOG.length;
  let itemsAlreadyFullyWarm = 0;
  let candidateShardsGenerated = 0;

  const missingColdStandards = new Set<string>();
  const citationsCoveredByGeneratedCandidates = new Set<string>();
  const generatedFilesList: string[] = [];

  for (const item of HAZLENZ_COVERAGE_BACKLOG) {
    // Check if fully warm
    const isFullyWarm = item.candidateCitations.every((citation) =>
      shardCitationSet.has(normalizeCitation(citation)),
    );

    if (isFullyWarm) {
      itemsAlreadyFullyWarm++;
      continue;
    }

    // Identify cold standards found and missing
    const coldStandardsFound: ColdStandardRow[] = [];
    for (const citation of item.candidateCitations) {
      const normalized = normalizeCitation(citation);
      const matched = standardByCitation.get(normalized);
      if (matched) {
        coldStandardsFound.push({
          citation: matched.citation,
          agency_code: matched.agency_code,
          scope_code: matched.scope_code,
          part_number: matched.part_number,
          source_key: matched.source_key,
          title: matched.title,
        });
      } else {
        missingColdStandards.add(citation);
      }
    }

    // Generate candidate data
    const shardKeyCandidate = `${item.jurisdiction}/${item.hazardFamily}/${item.equipmentFamily}/${item.taskMechanism}`;
    const bundleIdCandidate = `bundle-${item.jurisdiction}-${item.hazardFamily}-${item.equipmentFamily}-${item.taskMechanism}`
      .toLowerCase()
      .replace(/_/g, "-");

    const candidateFilename = `candidate-${item.jurisdiction}-${item.hazardFamily}-${item.equipmentFamily}-${item.taskMechanism}.json`
      .toLowerCase()
      .replace(/_/g, "-");

    const candidateFilePath = path.join(outputDir, candidateFilename);

    const candidateData = {
      shardKeyCandidate,
      bundleIdCandidate,
      jurisdiction: item.jurisdiction,
      hazardFamily: item.hazardFamily,
      equipmentFamily: item.equipmentFamily,
      taskMechanism: item.taskMechanism,
      citations: item.candidateCitations,
      sourceKeys: item.sourceKeys,
      coldStandardsFound,
      evidenceNeededDraft: generateEvidenceNeededDraft(item),
      correctiveActionPatternsDraft: generateCorrectiveActionPatternsDraft(item),
      applicabilityDraft: generateApplicabilityDraft(item),
      reviewerNotes: `Draft candidate generated for backlog item: "${item.title}". Priority: ${item.priority}. Backlog Status: ${item.status}. Requires qualified human review and approval.`,
      approvalStatus: "draft_requires_human_review",
    };

    fs.writeFileSync(candidateFilePath, JSON.stringify(candidateData, null, 2), "utf8");
    candidateShardsGenerated++;
    generatedFilesList.push(candidateFilename);

    // Track citations covered by generated candidates
    for (const citation of item.candidateCitations) {
      citationsCoveredByGeneratedCandidates.add(citation);
    }
  }

  // Calculate citations still uncovered
  const allBacklogCitations = new Set(
    HAZLENZ_COVERAGE_BACKLOG.flatMap((item) => item.candidateCitations)
  );

  const citationsStillUncovered: string[] = [];
  for (const citation of allBacklogCitations) {
    const normalized = normalizeCitation(citation);
    const inActiveWarm = shardCitationSet.has(normalized);
    const inGeneratedCandidate = Array.from(citationsCoveredByGeneratedCandidates)
      .map(normalizeCitation)
      .includes(normalized);

    if (!inActiveWarm && !inGeneratedCandidate) {
      citationsStillUncovered.push(citation);
    }
  }

  console.log("\n=== HAZLENZ WARM SHARD CANDIDATE GENERATOR REPORT ===");
  console.log(`Total Backlog Items:                 ${totalBacklogItems}`);
  console.log(`Items Already Fully Warm:           ${itemsAlreadyFullyWarm}`);
  console.log(`Candidate Shards Generated:         ${candidateShardsGenerated}`);
  console.log(`Unique Missing Cold Standards:      ${missingColdStandards.size}`);
  if (missingColdStandards.size > 0) {
    console.log(`Missing Citations:                  ${Array.from(missingColdStandards).join(", ")}`);
  }
  console.log(`Citations Covered by Candidates:    ${citationsCoveredByGeneratedCandidates.size}`);
  console.log(`Citations Still Uncovered:          ${citationsStillUncovered.length}`);
  if (citationsStillUncovered.length > 0) {
    console.log(`Uncovered Citations:                ${citationsStillUncovered.join(", ")}`);
  }

  console.log("\n=== GENERATED CANDIDATE FILES ===");
  for (const file of generatedFilesList) {
    console.log(`- ${file}`);
  }

  await ds.destroy();
}

run().catch(async (err) => {
  console.error("Generator failed:", err);
  process.exit(1);
});
