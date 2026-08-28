import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { INSPECTION_REGULATORY_CONTEXTS, InspectionRegulatoryContext } from '../inspection.entity';

/**
 * Shape of a client-minted idempotency identity. Opaque to the server: it is compared, never
 * parsed. Bounded and character-restricted so it can never carry structure the server might be
 * tempted to interpret, and never be used as an authorisation input.
 */
export const CLIENT_REQUEST_ID_PATTERN = /^[A-Za-z0-9_.:-]{8,128}$/;

export class CreateInspectionDto {
  @IsUUID()
  siteId: string;

  /**
   * Optional. When present, repeating this create with the same identifier returns the inspection
   * already created for THIS user rather than creating a second one. Omitting it keeps the
   * pre-existing, non-idempotent behaviour for the online path.
   */
  @IsString()
  @IsOptional()
  @Matches(CLIENT_REQUEST_ID_PATTERN, {
    message: 'clientRequestId must be 8-128 characters of A-Z a-z 0-9 _ . : -',
  })
  clientRequestId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  /**
   * Inspection-level regulatory context, chosen once at setup and inherited by every
   * finding. Omitted/undefined keeps the default 'unknown' ("Let HazLenz determine").
   */
  @IsIn(INSPECTION_REGULATORY_CONTEXTS as unknown as string[])
  @IsOptional()
  regulatoryContext?: InspectionRegulatoryContext;
}

export class UpdateInspectionDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  /**
   * Changing the inspection's regulatory context after analyses exist does not silently
   * rewrite them; the client is expected to re-run HazLenz so findings re-inherit it.
   */
  @IsIn(INSPECTION_REGULATORY_CONTEXTS as unknown as string[])
  @IsOptional()
  regulatoryContext?: InspectionRegulatoryContext;

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

  /** Optional; see CreateInspectionDto.clientRequestId. Scoped to this inspection and this user. */
  @IsString()
  @IsOptional()
  @Matches(CLIENT_REQUEST_ID_PATTERN, {
    message: 'clientRequestId must be 8-128 characters of A-Z a-z 0-9 _ . : -',
  })
  clientRequestId?: string;

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

/**
 * A hazard the INSPECTOR identified that HazLenz did not propose.
 *
 * Deliberately small. The inspector has already written the observation; this answers only
 * "what did HazLenz miss?", and the existing observation supplies the evidence. `detail` exists
 * for the case where the observation genuinely does not contain the missed hazard's evidence, and
 * is optional precisely so the common case costs one field.
 *
 * There is no citation, confidence or risk input here, and there never should be: a finding is not
 * granted regulatory support because a customer named a hazard.
 */
export class CreateUserAuthoredFindingDto {
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  hazardTitle: string;

  @IsString()
  @IsOptional()
  @MaxLength(10000)
  detail?: string;
}
