import { DataSource } from "typeorm";
import { config } from "dotenv";
import { HazLenzKnowledgeDocument } from "../entities/hazlenz-knowledge-document.entity";
import { HazLenzKnowledgeChunk } from "../entities/hazlenz-knowledge-chunk.entity";
import { HazLenzKnowledgeSource } from "../entities/hazlenz-knowledge-source.entity";
import { HazLenzKnowledgeIngestionRun } from "../entities/hazlenz-knowledge-ingestion-run.entity";
import { HazLenzKnowledgeRetrievalLog } from "../entities/hazlenz-knowledge-retrieval-log.entity";
import { HazLenzKnowledgeService } from "../hazlenz-knowledge.service";

config();

async function run() {
  const dataSource = new DataSource({
    type: "postgres",
    url:
      process.env.DATABASE_URL ||
      "postgres://mckinley@localhost:5432/sentinel_safety",
    entities: [
      HazLenzKnowledgeDocument,
      HazLenzKnowledgeChunk,
      HazLenzKnowledgeSource,
      HazLenzKnowledgeIngestionRun,
      HazLenzKnowledgeRetrievalLog,
    ],
    synchronize: false,
  });

  await dataSource.initialize();

  const service = new HazLenzKnowledgeService(
    dataSource.getRepository(HazLenzKnowledgeDocument),
    dataSource.getRepository(HazLenzKnowledgeChunk),
    dataSource.getRepository(HazLenzKnowledgeRetrievalLog),
    dataSource.getRepository(HazLenzKnowledgeSource),
    dataSource.getRepository(HazLenzKnowledgeIngestionRun),
  );

  const scenarios = [
    {
      query: "machine guarding robotic shuttle system 1910.212",
      agency: "OSHA" as const,
      limit: 5,
    },
    {
      query:
        "winter weather visibility mobile equipment pre-shift inspection defroster",
      agency: "MSHA" as const,
      sourceTypes: ["best_practice_guidance"],
      limit: 5,
    },
  ];

  for (const scenario of scenarios) {
    const result: any = await service.search({
      ...scenario,
      approvedOnly: true,
    });

    console.log("\n---");
    console.log(`Query: ${scenario.query}`);
    console.log(`Confidence: ${result.confidence}`);
    console.log("Counts:", JSON.stringify(result.sourceSynthesis?.counts));
    console.log(
      "Summary:",
      result.sourceSynthesis?.finalReasoningSummary || "MISSING",
    );
    console.log(
      "Caution:",
      result.sourceSynthesis?.complianceCaution || "MISSING",
    );
    console.log(
      "First Match:",
      result.matches?.[0]
        ? `${result.matches[0].title} | ${result.matches[0].sourceRoleLabel}`
        : "none",
    );
  }

  await dataSource.destroy();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
