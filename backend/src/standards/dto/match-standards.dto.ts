import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class MatchStandardsDto {
  @IsString()
  observation: string;

  @IsOptional()
  @IsString()
  locationType?: string;

  @IsOptional()
  @IsString()
  equipmentType?: string;

  @IsOptional()
  @IsString()
  activityType?: string;

  @IsOptional()
  @IsIn(['general_industry', 'construction', 'mining', 'mixed'])
  siteType?: 'general_industry' | 'construction' | 'mining' | 'mixed';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  detectedLabels?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  limit?: number;

  @IsOptional()
  @IsBoolean()
  includeLowConfidence?: boolean;
}
