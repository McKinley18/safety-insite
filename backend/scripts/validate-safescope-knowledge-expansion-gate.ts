import { dataSource } from "../src/database/data-source";
import { SafeScopeKnowledgeDocument } from "../src/safescope-knowledge/entities/safescope-knowledge-document.entity";
import { SafeScopeKnowledgeChunk } from "../src/safescope-knowledge/entities/safescope-knowledge-chunk.entity";
import { SafeScopeKnowledgeIngestionRun } from "../src/safescope-knowledge/entities/safescope-knowledge-ingestion-run.entity";

type RequiredCoverage = {
  sourceType: string;
  minimumDocuments: number;
  purpose: string;
  requiredNow: boolean;
};

const requiredCoverage: RequiredCoverage[] = [
  {
    sourceType: "regulation",
    minimumDocuments: 100,
    purpose: "Primary enforceable standards basis",
    requiredNow: true,
  },
  {
    sourceType: "standard_interpretation",
    minimumDocuments: 1,
    purpose: "Official applicability support",
    requiredNow: false,
  },
  {
    sourceType: "policy_manual",
    minimumDocuments: 1,
    purpose: "Agency policy and enforcement interpretation support",
    requiredNow: false,
  },
  {
    sourceType: "fatality_report",
    minimumDocuments: 5,
    purpose: "Fatality learning and high-severity scenario recognition",
    requiredNow: false,
  },
  {
    sourceType: "fatality_alert",
    minimumDocuments: 5,
    purpose: "Fatality alert prevention patterns",
    requiredNow: false,
  },
  {
    sourceType: "best_practice_guidance",
    minimumDocuments: 3,
    purpose: "Corrective action and prevention support",
    requiredNow: false,
  },
  {
    sourceType: "research_publication",
    minimumDocuments: 1,
    purpose: "Health-risk and exposure reasoning support",
    requiredNow: false,
  },
  {
    sourceType: "incident_database",
    minimumDocuments: 1,
    purpose: "Trend, recurrence, and incident-pattern learning",
    requiredNow: false,
  },
  {
    sourceType: "training_material",
    minimumDocuments: 5,
    purpose: "Starter hazard recognition support",
    requiredNow: true,
  },
];

async function main() {
  await dataSource.initialize();

  const docRepo = dataSource.getRepository(SafeScopeKnowledgeDocument);
  const chunkRepo = dataSource.getRepository(SafeScopeKnowledgeChunk);
  const runRepo = dataSource.getRepository(SafeScopeKnowledgeIngestionRun);

  console.log("\nSafeScope Knowledge Expansion Gate");
  console.log("==================================");

  const documentCount = await docRepo.count();
  const chunkCount = await chunkRepo.count();
  const ingestionRunCount = await runRepo.count();

  console.log(`Documents: ${documentCount}`);
  console.log(`Chunks: ${chunkCount}`);
  console.log(`Ingestion runs: ${ingestionRunCount}`);

  const sourceTypeRows = await docRepo
    .createQueryBuilder("doc")
    .select("doc.sourceType", "sourceType")
    .addSelect("COUNT(*)", "count")
    .groupBy("doc.sourceType")
    .orderBy("doc.sourceType", "ASC")
    .getRawMany();

  const sourceTypeCounts = new Map<string, number>();

  for (const row of sourceTypeRows) {
    sourceTypeCounts.set(String(row.sourceType), Number(row.count));
  }

  console.log("\nCoverage by source type:");
  for (const item of requiredCoverage) {
    const count = sourceTypeCounts.get(item.sourceType) || 0;
    const meetsMinimum = count >= item.minimumDocuments;
    const status = meetsMinimum ? "✅" : item.requiredNow ? "❌" : "⚠";

    console.log(
      `${status} ${item.sourceType}: ${count}/${item.minimumDocuments} — ${item.purpose}`,
    );
  }

  const hardFailures = requiredCoverage.filter((item) => {
    const count = sourceTypeCounts.get(item.sourceType) || 0;
    return item.requiredNow && count < item.minimumDocuments;
  });

  const expansionGaps = requiredCoverage.filter((item) => {
    const count = sourceTypeCounts.get(item.sourceType) || 0;
    return !item.requiredNow && count < item.minimumDocuments;
  });

  console.log("\nExpansion gaps to close:");
  if (!expansionGaps.length) {
    console.log("✅ No expansion gaps remain.");
  } else {
    for (const gap of expansionGaps) {
      console.log(
        `- ${gap.sourceType}: add at least ${gap.minimumDocuments - (sourceTypeCounts.get(gap.sourceType) || 0)} more document(s).`,
      );
    }
  }

  if (ingestionRunCount === 0) {
    console.log("\n⚠ Ingestion run logging is missing. This should be added before production knowledge expansion.");
  }

  if (hardFailures.length) {
    console.log("\n❌ Knowledge expansion gate failed on required baseline coverage.");
    await dataSource.destroy();
    process.exit(1);
  }

  console.log("\n✅ Required baseline coverage passed.");
  console.log("⚠ Supporting-source expansion is still incomplete until warning gaps are closed.");

  await dataSource.destroy();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await dataSource.destroy();
  } catch {}

  process.exit(1);
});
