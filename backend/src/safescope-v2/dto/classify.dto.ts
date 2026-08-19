import { IsArray, IsOptional, IsString, MinLength, IsBoolean, IsObject, IsUUID } from 'class-validator';
import { Attachment } from '../visual-evidence-reasoning/visual-evidence-reasoning.types';

export type StructuredObservationJurisdiction =
  | "msha"
  | "osha-general-industry"
  | "osha-construction"
  | "unknown";

export type StructuredObservationEnergyState =
  | "energized"
  | "operating"
  | "stopped"
  | "deenergized"
  | "locked-out"
  | "unknown";

export interface StructuredObservationInput {
  narrative?: string;
  jurisdiction?: StructuredObservationJurisdiction;
  workEnvironment?: string;
  workArea?: string;
  taskBeingPerformed?: string;
  equipmentInvolved?: string[];
  materialOrSubstance?: string[];
  observedCondition?: string;
  workerInteraction?: string;
  exposurePathway?: string[];
  energyState?: StructuredObservationEnergyState;
  controlsPresent?: string[];
  controlsMissing?: string[];
  potentialConsequence?: string[];
  affectedPeople?: string[];
  evidenceSource?: Array<"visual" | "worker-report" | "document" | "photo" | "measurement">;
  additionalContext?: string;
  userConfirmedFacts?: Array<{
    field: string;
    value: string | string[] | number | boolean | null;
    sourceQuestionId?: string;
  }>;
  inferredFacts?: Array<{
    field: string;
    value: string | string[];
    confidence?: "low" | "medium" | "high";
  }>;
  unknownFacts?: string[];
  unresolvedContradictions?: Array<{
    field: string;
    originalValue?: string;
    answerValue?: string;
    reason: string;
    sourceQuestionId?: string;
  }>;
}

export interface HazLenzClarificationAnswerInput {
  questionId: string;
  answer?: string | number | boolean | null;
  value?: string | number | boolean | null;
  selectedOptions?: string[];
  unit?: string;
  answeredAt?: string;
}

export interface EvidenceSnapshotInput {
  schemaVersion: string;
  facts: Array<Record<string, unknown>>;
  criticalUnknowns?: string[];
  contradictions?: Array<Record<string, unknown>>;
}

/**
 * Regulatory context HazLenz is evaluating under, with honest provenance. Attached to the
 * request by the controller when it resolves a persisted inspection (USER_CONFIRMED /
 * UNKNOWN), and echoed on the response -- where HazLenz may additionally report
 * HAZLENZ_INFERRED when the inspection context is unknown but the observation's own
 * wording strongly establishes a regime. Never presented as user-confirmed unless it is.
 */
export interface RegulatoryContextInput {
  value: StructuredObservationJurisdiction;
  provenance: 'USER_CONFIRMED' | 'HAZLENZ_INFERRED' | 'UNKNOWN';
  source?: 'inspection' | 'request' | 'observation_evidence';
  inspectionId?: string;
}

export class ClassifyDto {
  @IsString()
  @MinLength(2)
  text!: string;

  /**
   * Persisted inspection this observation belongs to. When present, the controller loads
   * the inspection's own regulatoryContext and uses it authoritatively (overriding any
   * jurisdiction/scopes the client happened to send), so every finding in the inspection
   * inherits the same context without the client having to resend a fragile string.
   */
  @IsOptional()
  @IsUUID()
  inspectionId?: string;

  /** Populated server-side from the inspection (see inspectionId); clients need not send it. */
  @IsOptional()
  @IsObject()
  regulatoryContext?: RegulatoryContextInput;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceTexts?: string[];

  @IsOptional()
  @IsArray()
  visualAttachments?: Attachment[];

  @IsOptional()
  @IsString()
  riskProfileId?: "simple_4x4" | "standard_5x5" | "advanced_6x6";

  @IsOptional()
  @IsString()
  workspaceId?: string;

  @IsOptional()
  @IsArray()
  priorFindings?: any[];

  @IsOptional()
  @IsBoolean()
  debugMetadata?: boolean;

  @IsOptional()
  @IsObject()
  structuredObservation?: StructuredObservationInput;

  @IsOptional()
  @IsArray()
  clarificationAnswers?: HazLenzClarificationAnswerInput[];

  @IsOptional()
  @IsObject()
  priorStructuredObservation?: StructuredObservationInput;

  @IsOptional()
  @IsObject()
  evidenceSnapshot?: EvidenceSnapshotInput;
}


export type SafeScopeRiskProfileId = "simple_4x4" | "standard_5x5" | "advanced_6x6";
