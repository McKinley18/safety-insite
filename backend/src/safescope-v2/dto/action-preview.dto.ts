import { IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class ActionPreviewDto {
  @IsString()
  text!: string;

  @IsString()
  classification!: string;

  @IsOptional()
  @IsNumber()
  riskScore?: number;

  @IsOptional()
  @IsString()
  riskBand?: 'Low' | 'Moderate' | 'High' | 'Critical';

  @IsOptional()
  @IsBoolean()
  requiresShutdown?: boolean;

  @IsOptional()
  @IsBoolean()
  imminentDanger?: boolean;

  @IsOptional()
  @IsString()
  fatalityPotential?: 'low' | 'medium' | 'high';

  @IsOptional()
  @IsArray()
  reasoning?: string[];

  @IsOptional()
  @IsArray()
  standards?: { citation: string; rationale?: string }[];

  @IsOptional()
  @IsString()
  location?: string;
}
