import { DataSource } from "typeorm";
import { config } from "dotenv";
import { SafeScopeKnowledgeDocument } from "../entities/safescope-knowledge-document.entity";
import { SafeScopeKnowledgeChunk } from "../entities/safescope-knowledge-chunk.entity";
import { SafeScopeKnowledgeSource } from "../entities/safescope-knowledge-source.entity";
import { SafeScopeKnowledgeIngestionRun } from "../entities/safescope-knowledge-ingestion-run.entity";
import { SafeScopeKnowledgeRetrievalLog } from "../entities/safescope-knowledge-retrieval-log.entity";
import { SafeScopeKnowledgeService } from "../safescope-knowledge.service";

config();

async function run() {
  const dataSource = new DataSource({
    type: "postgres",
    url:
      process.env.DATABASE_URL ||
      "postgres://mckinley@localhost:5432/sentinel_safety",
    entities: [
      SafeScopeKnowledgeDocument,
      SafeScopeKnowledgeChunk,
      SafeScopeKnowledgeSource,
      SafeScopeKnowledgeIngestionRun,
      SafeScopeKnowledgeRetrievalLog,
    ],
    synchronize: false,
  });

  await dataSource.initialize();

  const service = new SafeScopeKnowledgeService(
    dataSource.getRepository(SafeScopeKnowledgeDocument),
    dataSource.getRepository(SafeScopeKnowledgeChunk),
    dataSource.getRepository(SafeScopeKnowledgeRetrievalLog),
    dataSource.getRepository(SafeScopeKnowledgeSource),
    dataSource.getRepository(SafeScopeKnowledgeIngestionRun),
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
