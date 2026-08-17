import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateInspectionDto {
  @IsUUID()
  siteId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;
}

export class UpdateInspectionDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsInt()
  @Min(1)
  version: number;
}

export class TransitionInspectionDto {
  @IsIn(['in_review', 'completed', 'archived', 'draft'])
  status: 'in_review' | 'completed' | 'archived' | 'draft';

  @IsInt()
  @Min(1)
  version: number;
}

export class CreateObservationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  rawText: string;

  @IsString()
  @IsOptional()
  @MaxLength(32)
  evidenceSource?: string;
}

export class UpdateObservationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  rawText: string;

  @IsInt()
  @Min(1)
  version: number;
}

export class CreateAnalysisSnapshotDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  engineVersion: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  traceId?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  idempotencyKey: string;

  @IsInt()
  @Min(1)
  requestVersion: number;

  @IsObject()
  resultSnapshot: Record<string, unknown>;
}

export class CreateHumanReviewDto {
  @IsUUID()
  @IsOptional()
  findingId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(128)
  idempotencyKey?: string;

  @IsUUID()
  @IsOptional()
  analysisId?: string;

  @IsIn(['accepted', 'edited', 'overridden', 'dismissed'])
  decision: 'accepted' | 'edited' | 'overridden' | 'dismissed';

  @IsString()
  @MinLength(3)
  @MaxLength(5000)
  rationale: string;

  @IsObject()
  @IsOptional()
  reviewedConclusion?: Record<string, unknown>;
}

export class FinalizeFindingDto {
  @IsUUID()
  reviewId: string;

  @IsString()
  @IsOptional()
  @MaxLength(160)
  hazardCategory?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(120)
  segmentKey?: string;

  @IsObject()
  @IsOptional()
  sourceCandidate?: Record<string, unknown>;

  @IsIn(['single', 'split', 'merged'])
  @IsOptional()
  reviewerDisposition?: 'single' | 'split' | 'merged';

  @IsString()
  @MinLength(3)
  @MaxLength(10000)
  conclusion: string;

  /**
   * V5-C01: optional per-finding risk override. When omitted, the finding keeps
   * whichever risk was already computed for it at reconciliation time (system_generated,
   * independent per hazard -- see InspectionService.computeFindingRisk). Never applies to
   * sibling findings, even when they share the same review.
   */
  @IsObject()
  @IsOptional()
  riskAssessment?: Record<string, unknown>;
}

export class AssignInspectionDto {
  @IsUUID()
  userId: string;

  @IsIn(['collaborator', 'reviewer'])
  role: 'collaborator' | 'reviewer';
}
