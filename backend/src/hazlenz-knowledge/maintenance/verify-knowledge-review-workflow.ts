import { DataSource } from "typeorm";
import { config } from "dotenv";
import { SafeScopeKnowledgeDocument } from "../entities/safescope-knowledge-document.entity";
import { SafeScopeKnowledgeChunk } from "../entities/safescope-knowledge-chunk.entity";
import { SafeScopeKnowledgeSource } from "../entities/safescope-knowledge-source.entity";
import { SafeScopeKnowledgeIngestionRun } from "../entities/safescope-knowledge-ingestion-run.entity";
import { SafeScopeKnowledgeRetrievalLog } from "../entities/safescope-knowledge-retrieval-log.entity";

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
  const repo = dataSource.getRepository(SafeScopeKnowledgeDocument);

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
