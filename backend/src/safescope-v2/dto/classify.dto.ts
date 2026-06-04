import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

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
  @IsString()
  riskProfileId?: "simple_4x4" | "standard_5x5" | "advanced_6x6";

  @IsOptional()
  @IsString()
  workspaceId?: string;

  @IsOptional()
  @IsArray()
  priorFindings?: any[];
}


export type SafeScopeRiskProfileId = "simple_4x4" | "standard_5x5" | "advanced_6x6";
