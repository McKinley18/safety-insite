import { IsArray, IsOptional, IsString, MinLength, IsBoolean, IsObject } from 'class-validator';
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
}

export class ClassifyDto {
  @IsString()
  @MinLength(2)
  text!: string;

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
}


export type SafeScopeRiskProfileId = "simple_4x4" | "standard_5x5" | "advanced_6x6";
