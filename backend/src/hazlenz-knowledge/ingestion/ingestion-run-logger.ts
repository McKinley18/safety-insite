import { Repository } from "typeorm";
import {
  SafeScopeKnowledgeIngestionRun,
  SafeScopeKnowledgeIngestionStatus,
} from "../entities/safescope-knowledge-ingestion-run.entity";

export type IngestionRunLoggerInput = {
  sourceName: string;
  agency: string;
  sourceType: string;
  sourceId?: string | null;
  metadataJson?: Record<string, any>;
};

export type CompleteIngestionRunInput = {
  discoveredCount?: number;
  ingestedCount?: number;
  pendingReviewCount?: number;
  approvedCount?: number;
  skippedCount?: number;
  warnings?: string[];
  metadataJson?: Record<string, any>;
};

export async function startIngestionRun(
  runRepo: Repository<SafeScopeKnowledgeIngestionRun>,
  input: IngestionRunLoggerInput,
) {
  return runRepo.save(
    runRepo.create({
      sourceId: input.sourceId || null,
      sourceName: input.sourceName,
      agency: input.agency,
      sourceType: input.sourceType,
      status: "running",
      discoveredCount: 0,
      ingestedCount: 0,
      pendingReviewCount: 0,
      approvedCount: 0,
      skippedCount: 0,
      warnings: [],
      errorMessage: null,
      metadataJson: input.metadataJson || {},
      startedAt: new Date(),
      completedAt: null,
    }),
  );
}

export async function completeIngestionRun(
  runRepo: Repository<SafeScopeKnowledgeIngestionRun>,
  run: SafeScopeKnowledgeIngestionRun,
  input: CompleteIngestionRunInput,
) {
  const warnings = input.warnings || [];
  run.status = warnings.length ? "completed_with_warnings" : "completed";
  run.discoveredCount = input.discoveredCount ?? run.discoveredCount;
  run.ingestedCount = input.ingestedCount ?? run.ingestedCount;
  run.pendingReviewCount = input.pendingReviewCount ?? run.pendingReviewCount;
  run.approvedCount = input.approvedCount ?? run.approvedCount;
  run.skippedCount = input.skippedCount ?? run.skippedCount;
  run.warnings = warnings;
  run.errorMessage = null;
  run.metadataJson = {
    ...(run.metadataJson || {}),
    ...(input.metadataJson || {}),
  };
  run.completedAt = new Date();

  return runRepo.save(run);
}

export async function failIngestionRun(
  runRepo: Repository<SafeScopeKnowledgeIngestionRun>,
  run: SafeScopeKnowledgeIngestionRun | null,
  error: unknown,
  metadataJson: Record<string, any> = {},
) {
  if (!run) return null;

  run.status = "failed";
  run.errorMessage =
    error instanceof Error ? error.message : String(error || "Unknown ingestion failure");
  run.metadataJson = {
    ...(run.metadataJson || {}),
    ...metadataJson,
  };
  run.completedAt = new Date();

  return runRepo.save(run);
}
