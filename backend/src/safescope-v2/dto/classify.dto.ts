import { IsArray, IsOptional, IsString, MinLength, IsBoolean } from 'class-validator';
import { Attachment } from '../visual-evidence-reasoning/visual-evidence-reasoning.types';

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
}


export type SafeScopeRiskProfileId = "simple_4x4" | "standard_5x5" | "advanced_6x6";
