import "reflect-metadata";
import { DataSource } from "typeorm";
import { HAZLENZ_COVERAGE_BACKLOG } from "./hazlenz-coverage-backlog.seed";
import { HAZLENZ_KNOWLEDGE_SHARDS } from "../knowledge-shards/hazlenz-knowledge-shards.seed";

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

async function run() {
  const ds = buildDataSource();
  await ds.initialize();

  const standards = (await ds.query(`
    SELECT citation, agency_code, scope_code, part_number, source_key, title
    FROM standards_master
    WHERE is_active = true
  `)) as ColdStandardRow[];

  const standardByCitation = new Map(
    standards.map((standard) => [
      normalizeCitation(standard.citation),
      standard,
    ]),
  );

  const shardCitationSet = new Set(
    HAZLENZ_KNOWLEDGE_SHARDS.flatMap((shard) => shard.citations).map(
      normalizeCitation,
    ),
  );

  const rows = HAZLENZ_COVERAGE_BACKLOG.map((item) => {
    const found = item.candidateCitations.filter((citation) =>
      standardByCitation.has(normalizeCitation(citation)),
    );

    const missing = item.candidateCitations.filter(
      (citation) => !standardByCitation.has(normalizeCitation(citation)),
    );

    const activeWarm = item.candidateCitations.filter((citation) =>
      shardCitationSet.has(normalizeCitation(citation)),
    );

    return {
      priority: item.priority,
      jurisdiction: item.jurisdiction,
      hazardFamily: item.hazardFamily,
      equipmentFamily: item.equipmentFamily,
      taskMechanism: item.taskMechanism,
      backlogTitle: item.title,
      candidateCount: item.candidateCitations.length,
      foundInColdDb: found.length,
      missingFromColdDb: missing.length,
      activeWarmShardCitations: activeWarm.length,
      needsShardPromotion: found.length > activeWarm.length ? "yes" : "no",
      foundCitations: found.join(", "),
      missingCitations: missing.join(", "),
      warmCitations: activeWarm.join(", "),
    };
  });

  console.log("\n=== HAZLENZ COLD → WARM BRIDGE REPORT ===");
  console.table(rows);

  const summary = {
    totalColdStandards: standards.length,
    backlogItems: HAZLENZ_COVERAGE_BACKLOG.length,
    backlogCandidateCitations: HAZLENZ_COVERAGE_BACKLOG.reduce(
      (sum, item) => sum + item.candidateCitations.length,
      0,
    ),
    foundBacklogCitationsInColdDb: rows.reduce(
      (sum, row) => sum + row.foundInColdDb,
      0,
    ),
    missingBacklogCitationsFromColdDb: rows.reduce(
      (sum, row) => sum + row.missingFromColdDb,
      0,
    ),
    activeWarmShardCitationsInBacklog: rows.reduce(
      (sum, row) => sum + row.activeWarmShardCitations,
      0,
    ),
    backlogItemsNeedingShardPromotion: rows.filter(
      (row) => row.needsShardPromotion === "yes",
    ).length,
  };

  console.log("\n=== BRIDGE SUMMARY ===");
  console.log(JSON.stringify(summary, null, 2));

  await ds.destroy();
}

run().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
