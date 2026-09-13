import { DataSource } from "typeorm";
import { config } from "dotenv";
import { HazLenzKnowledgeDocument } from "../entities/hazlenz-knowledge-document.entity";
import { HazLenzKnowledgeChunk } from "../entities/hazlenz-knowledge-chunk.entity";
import { HazLenzKnowledgeSource } from "../entities/hazlenz-knowledge-source.entity";
import { HazLenzKnowledgeIngestionRun } from "../entities/hazlenz-knowledge-ingestion-run.entity";
import { HazLenzKnowledgeRetrievalLog } from "../entities/hazlenz-knowledge-retrieval-log.entity";

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
  const repo = dataSource.getRepository(HazLenzKnowledgeDocument);

  const total = await repo.count();
  const pending = await repo.count({
    where: { approvalStatus: "pending_review" } as any,
  });
  const approved = await repo.count({
    where: { approvalStatus: "approved" } as any,
  });
  const rejected = await repo.count({
    where: { approvalStatus: "rejected" } as any,
  });

  console.log(`Total documents: ${total}`);
  console.log(`Pending review: ${pending}`);
  console.log(`Approved: ${approved}`);
  console.log(`Rejected: ${rejected}`);

  const recent = await repo.find({
    where: { approvalStatus: "pending_review" } as any,
    order: { createdAt: "DESC" },
    take: 5,
  });

  console.log("\nRecent pending documents:");
  recent.forEach((d) =>
    console.log(
      `- ${d.title} [${d.sourceType}] (Tier ${d.authorityTier}) - ${d.sourceUrl}`,
    ),
  );

  await dataSource.destroy();
}

run().catch(console.error);
