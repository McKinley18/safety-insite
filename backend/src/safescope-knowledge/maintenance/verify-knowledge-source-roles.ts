import { DataSource } from "typeorm";
import { config } from "dotenv";
import { SafeScopeKnowledgeDocument } from "../entities/safescope-knowledge-document.entity";
import { SafeScopeKnowledgeChunk } from "../entities/safescope-knowledge-chunk.entity";
import { getSourceRole, ROLE_LABELS } from "../sources/source-role-helper";

config();

async function run() {
  const dataSource = new DataSource({
    type: "postgres",
    url:
      process.env.DATABASE_URL ||
      "postgres://mckinley@localhost:5432/sentinel_safety",
    entities: [SafeScopeKnowledgeDocument, SafeScopeKnowledgeChunk],
    synchronize: false,
  });

  await dataSource.initialize();
  const repo = dataSource.getRepository(SafeScopeKnowledgeDocument);

  const docs = await repo.find({ take: 10 });

  console.log("Verified Knowledge Source Roles:");
  for (const d of docs) {
    const role = getSourceRole(d.sourceType, d.authorityTier);
    console.log(`- ${d.title.slice(0, 50)}...`);
    console.log(`  SourceType: ${d.sourceType}, Tier: ${d.authorityTier}`);
    console.log(`  Role: ${role} (${ROLE_LABELS[role]})`);
    console.log(
      `  Primary: ${d.authorityTier === 1 && d.sourceType === "regulation"}`,
    );
  }

  await dataSource.destroy();
}

run().catch(console.error);
