import { DataSource } from "typeorm";
import { config } from "dotenv";
import { SafeScopeKnowledgeDocument } from "../entities/safescope-knowledge-document.entity";
import { SafeScopeKnowledgeChunk } from "../entities/safescope-knowledge-chunk.entity";
import { SafeScopeKnowledgeSource } from "../entities/safescope-knowledge-source.entity";
import { SafeScopeKnowledgeIngestionRun } from "../entities/safescope-knowledge-ingestion-run.entity";
import { SafeScopeKnowledgeRetrievalLog } from "../entities/safescope-knowledge-retrieval-log.entity";
import { Msha30CfrConnector } from "./connectors/msha-30-cfr.connector";
import { buildSourceRegistryMetadata } from "../sources/source-registry-metadata";

config();

function authorityWeight(authorityTier: number) {
  return Number(Math.max(0.1, 1 - (authorityTier - 1) * 0.15).toFixed(2));
}

function isNonCitableContextSection(sectionHeading = "") {
  const normalized = sectionHeading.toLowerCase();
  return (
    normalized.includes("reserved") || normalized.includes("table of contents")
  );
}

function truncateForColumn(value = "", maxLength = 220) {
  return value.length > maxLength
    ? value.slice(0, maxLength - 3) + "..."
    : value;
}

function isNonCitableRegulatorySection(sectionHeading?: string) {
  const heading = sectionHeading || "";
  return (
    /table of contents/i.test(heading) ||
    /\[reserved\]/i.test(heading) ||
    /\breserved\b/i.test(heading) ||
    /\bscope\b/i.test(heading) ||
    /\bdefinitions?\b/i.test(heading)
  );
}

function sectionStandardTags(
  documentTags: string[] = [],
  citation?: string,
  sectionHeading = "",
) {
  if (isNonCitableRegulatorySection(sectionHeading)) {
    return [];
  }

  if (isNonCitableContextSection(sectionHeading)) return [];

  return Array.from(
    new Set([...documentTags, ...(citation ? [citation] : [])]),
  );
}

async function run() {
  const metadata = buildSourceRegistryMetadata("msha-30-cfr-standards");
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

  const connector = new Msha30CfrConnector();
  const discovered = await connector.discover();

  let created = 0,
    updated = 0,
    pending = 0,
    approvedPreserved = 0;

  for (const item of discovered) {
    const citation = item.externalId.toUpperCase();
    const existing = await documentRepo.findOne({ where: { citation } });

    let approvalStatus: any = metadata.requiresApproval
      ? "pending_review"
      : "approved";
    let reviewedAt: string | null = null;

    if (existing) {
      if (existing.approvalStatus === "approved") {
        approvalStatus = "approved";
        reviewedAt = existing.reviewedAt || null;
        approvedPreserved++;
      }
      updated++;
    } else {
      created++;
      if (approvalStatus === "pending_review") pending++;
    }

    const doc = existing || documentRepo.create();
    doc.citation = citation;
    doc.title = item.title;
    doc.agency = metadata.agency as any;
    doc.sourceType = metadata.sourceType as any;
    doc.authorityTier = metadata.authorityTier;
    doc.sourceUrl = item.sourceUrl;
    doc.summary = item.summary;
    doc.rawText = item.rawText;
    doc.approvalStatus = approvalStatus;
    doc.reviewedAt = reviewedAt;
    doc.hazardTags = item.metadata.hazardTags || [];
    doc.standardTags = item.metadata.standardTags || [];

    const saved = await documentRepo.save(doc);

    // Keep existing chunks that are approved, else update/re-ingest
    for (const [index, sec] of item.sections.entries()) {
      const existingChunk = await chunkRepo.findOne({
        where: { documentId: saved.id, citation: sec.citation },
      });
      if (existingChunk) {
        existingChunk.chunkText = sec.sectionText;
        existingChunk.chunkSummary = sec.sectionText.slice(0, 200) + "...";
        existingChunk.sectionHeading = truncateForColumn(sec.sectionHeading);
        existingChunk.standardTags = sectionStandardTags(
          saved.standardTags || [],
          sec.citation,
          sec.sectionHeading,
        );
        await chunkRepo.save(existingChunk);
      } else {
        await chunkRepo.save(
          chunkRepo.create({
            documentId: saved.id,
            chunkIndex: index,
            sectionHeading: truncateForColumn(sec.sectionHeading),
            chunkText: sec.sectionText,
            chunkSummary: sec.sectionText.slice(0, 200) + "...",
            citation: sec.citation,
            authorityTier: saved.authorityTier,
            confidenceWeight: authorityWeight(saved.authorityTier),
            hazardTags: saved.hazardTags,
            standardTags: sectionStandardTags(
              saved.standardTags || [],
              sec.citation,
              sec.sectionHeading,
            ),
          }),
        );
      }
    }
  }

  console.log(`Discovered: ${discovered.length}`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`PendingReview: ${pending}`);
  console.log(`ApprovedPreserved: ${approvedPreserved}`);

  await dataSource.destroy();
}

run().catch(console.error);
