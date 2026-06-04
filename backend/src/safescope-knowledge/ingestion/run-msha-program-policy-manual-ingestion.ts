import { DataSource } from "typeorm";
import { config } from "dotenv";
import { SafeScopeKnowledgeDocument } from "../entities/safescope-knowledge-document.entity";
import { SafeScopeKnowledgeChunk } from "../entities/safescope-knowledge-chunk.entity";
import { SafeScopeKnowledgeSource } from "../entities/safescope-knowledge-source.entity";
import { SafeScopeKnowledgeIngestionRun } from "../entities/safescope-knowledge-ingestion-run.entity";
import { SafeScopeKnowledgeRetrievalLog } from "../entities/safescope-knowledge-retrieval-log.entity";
import { MshaProgramPolicyManualConnector } from "./connectors/msha-program-policy-manual.connector";
import { buildSourceRegistryMetadata } from "../sources/source-registry-metadata";
import {
  completeIngestionRun,
  failIngestionRun,
  startIngestionRun,
} from "./ingestion-run-logger";

const MSHA_PPM_METADATA = buildSourceRegistryMetadata("msha-program-policy-manual");

config();

function authorityWeight(authorityTier: number) {
  return Number(Math.max(0.1, 1 - (authorityTier - 1) * 0.15).toFixed(2));
}

function chunkSummary(text: string) {
  return text.split(/[.!?]/).slice(0, 2).join(". ").trim().slice(0, 280);
}

function chunkText(text: string, max = 4500) {
  const chunks: string[] = [];
  const clean = text.replace(/\s+/g, " ").trim();

  for (let index = 0; index < clean.length; index += max) {
    chunks.push(clean.slice(index, index + max));
  }

  return chunks.length ? chunks : [clean];
}

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

  const documentRepo = dataSource.getRepository(SafeScopeKnowledgeDocument);
  const chunkRepo = dataSource.getRepository(SafeScopeKnowledgeChunk);
  const runRepo = dataSource.getRepository(SafeScopeKnowledgeIngestionRun);

  const ingestionRun = await startIngestionRun(runRepo, {
    sourceName: MSHA_PPM_METADATA.sourceName || "MSHA Program Policy Manual",
    agency: MSHA_PPM_METADATA.agency,
    sourceType: MSHA_PPM_METADATA.sourceType,
    metadataJson: {
      connector: "MshaProgramPolicyManualConnector",
      requiresApproval: MSHA_PPM_METADATA.requiresApproval,
      authorityTier: MSHA_PPM_METADATA.authorityTier,
      governedUse: "official_guidance_only",
    },
  });

  try {
    const connector = new MshaProgramPolicyManualConnector();
    const discovered = await connector.discover();

    let created = 0;
    let updated = 0;
    let pending = 0;
    let approvedPreserved = 0;
    const warnings: string[] = [];

    if (!discovered.length) {
      warnings.push("No MSHA Program Policy Manual documents were discovered.");
    }

    for (const item of discovered) {
      const citation = item.externalId.toUpperCase();
      const existing = await documentRepo.findOne({ where: { citation } });

      let approvalStatus: any = MSHA_PPM_METADATA.requiresApproval
        ? "pending_review"
        : "approved";
      let reviewedAt: string | null = null;

      if (existing) {
        if (existing.approvalStatus === "approved") {
          approvalStatus = "approved";
          reviewedAt = existing.reviewedAt || null;
          approvedPreserved += 1;
        }
        updated += 1;
      } else {
        created += 1;
        if (approvalStatus === "pending_review") pending += 1;
      }

      const doc = existing || documentRepo.create();

      doc.citation = citation;
      doc.title = item.title;
      doc.agency = MSHA_PPM_METADATA.agency as any;
      doc.sourceType = MSHA_PPM_METADATA.sourceType as any;
      doc.authorityTier = MSHA_PPM_METADATA.authorityTier;
      doc.sourceUrl = item.sourceUrl;
      doc.publishedAt = item.publishedAt || null;
      doc.summary = item.summary;
      doc.rawText = item.rawText;
      doc.approvalStatus = approvalStatus;
      doc.reviewedAt = reviewedAt;
      doc.hazardTags = item.metadata.hazardTags || [];
      doc.equipmentTags = item.metadata.equipmentTags || [];
      doc.taskTags = item.metadata.taskTags || [];
      doc.standardTags = item.metadata.standardTags || ["MSHA PPM"];
      doc.lessonTags = item.metadata.lessonTags || [];

      const saved = await documentRepo.save(doc);

      await chunkRepo.delete({ documentId: saved.id });

      const chunks = chunkText(item.rawText);

      for (const [index, text] of chunks.entries()) {
        await chunkRepo.save(
          chunkRepo.create({
            documentId: saved.id,
            document: saved,
            chunkIndex: index,
            sectionHeading:
              index === 0
                ? "MSHA Program Policy Manual official guidance"
                : `MSHA Program Policy Manual official guidance part ${index + 1}`,
            chunkText: text,
            chunkSummary: chunkSummary(text),
            citation: saved.citation,
            authorityTier: saved.authorityTier,
            hazardTags: saved.hazardTags || [],
            equipmentTags: saved.equipmentTags || [],
            taskTags: saved.taskTags || [],
            standardTags: saved.standardTags || [],
            lessonTags: saved.lessonTags || [],
            confidenceWeight: authorityWeight(saved.authorityTier),
          }),
        );
      }
    }

    await completeIngestionRun(runRepo, ingestionRun, {
      discoveredCount: discovered.length,
      ingestedCount: created,
      pendingReviewCount: pending,
      approvedCount: approvedPreserved,
      skippedCount: updated,
      warnings,
      metadataJson: {
        created,
        updated,
        pending,
        approvedPreserved,
      },
    });

    console.log(`Discovered: ${discovered.length}`);
    console.log(`Created: ${created}`);
    console.log(`Updated: ${updated}`);
    console.log(`PendingReview: ${pending}`);
    console.log(`ApprovedPreserved: ${approvedPreserved}`);
  } catch (error) {
    await failIngestionRun(runRepo, ingestionRun, error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
