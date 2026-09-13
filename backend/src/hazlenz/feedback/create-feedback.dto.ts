import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSafeScopeFeedbackDto {
  @IsOptional()
  @IsString()
  workspaceId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  reportId?: string;

  @IsOptional()
  @IsString()
  findingId?: string;

  @IsString()
  classification!: string;

  @IsString()
  citation!: string;

  @IsIn(['accepted', 'rejected', 'flagged', 'changed'])
  action!: 'accepted' | 'rejected' | 'flagged' | 'changed';

  @IsOptional()
  @IsString()
  replacementCitation?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsNumber()
  confidenceBefore?: number;

  @IsOptional()
  @IsString()
  riskProfileId?: string;

  @IsOptional()
  @IsString()
  reviewerRole?: string;
}
