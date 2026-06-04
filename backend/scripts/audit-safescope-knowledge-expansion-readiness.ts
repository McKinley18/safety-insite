import { dataSource } from "../src/database/data-source";
import { SafeScopeKnowledgeDocument } from "../src/safescope-knowledge/entities/safescope-knowledge-document.entity";
import { SafeScopeKnowledgeChunk } from "../src/safescope-knowledge/entities/safescope-knowledge-chunk.entity";
import { SafeScopeKnowledgeIngestionRun } from "../src/safescope-knowledge/entities/safescope-knowledge-ingestion-run.entity";

const expectedSourceTypes = [
  "regulation",
  "standard_interpretation",
  "policy_manual",
  "fatality_report",
  "fatality_alert",
  "best_practice_guidance",
  "incident_database",
  "research_publication",
  "training_material",
];

const expectedQueries = [
  "machine guarding conveyor unguarded moving parts",
  "lockout tagout hazardous energy maintenance",
  "fall protection unprotected edge anchorage",
  "mobile equipment pedestrian struck by traffic control",
  "confined space atmospheric testing permit entry",
  "electrical exposed energized conductors",
  "winter weather mobile equipment visibility defroster",
  "fatality conveyor entanglement return idler",
];

async function main() {
  await dataSource.initialize();

  const docRepo = dataSource.getRepository(SafeScopeKnowledgeDocument);
  const chunkRepo = dataSource.getRepository(SafeScopeKnowledgeChunk);
  const runRepo = dataSource.getRepository(SafeScopeKnowledgeIngestionRun);

  console.log("\nSafeScope Knowledge Expansion Readiness Audit");
  console.log("============================================");

  const docCount = await docRepo.count();
  const chunkCount = await chunkRepo.count();
  const runCount = await runRepo.count();

  console.log(`\nTotal documents: ${docCount}`);
  console.log(`Total chunks: ${chunkCount}`);
  console.log(`Ingestion runs: ${runCount}`);

  const bySourceType = await docRepo
    .createQueryBuilder("doc")
    .select("doc.sourceType", "sourceType")
    .addSelect("COUNT(*)", "count")
    .groupBy("doc.sourceType")
    .orderBy("doc.sourceType", "ASC")
    .getRawMany();

  console.log("\nDocuments by source type:");
  for (const row of bySourceType) {
    console.log(`- ${row.sourceType}: ${row.count}`);
  }

  console.log("\nExpected source type coverage:");
  const sourceTypeSet = new Set(bySourceType.map((row) => row.sourceType));
  for (const sourceType of expectedSourceTypes) {
    console.log(`${sourceTypeSet.has(sourceType) ? "✅" : "❌"} ${sourceType}`);
  }

  const byApproval = await docRepo
    .createQueryBuilder("doc")
    .select("doc.approvalStatus", "approvalStatus")
    .addSelect("COUNT(*)", "count")
    .groupBy("doc.approvalStatus")
    .orderBy("doc.approvalStatus", "ASC")
    .getRawMany();

  console.log("\nDocuments by approval status:");
  for (const row of byApproval) {
    console.log(`- ${row.approvalStatus}: ${row.count}`);
  }

  console.log("\nSearch smoke checks:");
  for (const query of expectedQueries) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

    const matches = await chunkRepo
      .createQueryBuilder("chunk")
      .leftJoinAndSelect("chunk.document", "document")
      .where(
        terms
          .slice(0, 4)
          .map((term, index) => `LOWER(chunk.chunkText) LIKE :term${index}`)
          .join(" OR "),
        Object.fromEntries(
          terms.slice(0, 4).map((term, index) => [`term${index}`, `%${term}%`]),
        ),
      )
      .take(5)
      .getMany();

    const top = matches[0];

    console.log(
      `${matches.length ? "✅" : "❌"} ${query} -> ${matches.length} match(es)${
        top ? ` | top: ${top.citation || top.document?.citation || top.document?.title}` : ""
      }`,
    );
  }

  const recentRuns = await runRepo.find({
    order: { createdAt: "DESC" },
    take: 10,
  });

  console.log("\nRecent ingestion runs:");
  if (!recentRuns.length) {
    console.log("❌ No ingestion run records found.");
  }

  for (const run of recentRuns) {
    console.log(
      `- ${run.sourceName} | ${run.status} | discovered=${run.discoveredCount} ingested=${run.ingestedCount} approved=${run.approvedCount} pending=${run.pendingReviewCount} skipped=${run.skippedCount}`,
    );
  }

  await dataSource.destroy();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await dataSource.destroy();
  } catch {}

  process.exit(1);
});
