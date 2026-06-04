import { IsIn, IsOptional, IsString } from 'class-validator';

export class StandardFeedbackDto {
  @IsOptional()
  @IsString()
  reportId?: string;

  @IsString()
  standardId: string;

  @IsString()
  citation: string;

  @IsIn(['accepted', 'rejected', 'changed', 'flagged'])
  action: 'accepted' | 'rejected' | 'changed' | 'flagged';

  @IsOptional()
  @IsString()
  replacementCitation?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
