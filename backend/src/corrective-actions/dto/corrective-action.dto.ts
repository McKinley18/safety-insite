import { IsString, IsNotEmpty, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CreateCorrectiveActionDto {
  @IsString()
  @IsNotEmpty()
  reportId: string;

  @IsString()
  @IsOptional()
  classificationId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  priorityCode: 'low' | 'medium' | 'high' | 'urgent';

  @IsString()
  @IsOptional()
  findingId?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsOptional()
  originalSuggestion?: any;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  siteId?: string;

  @IsString()
  @IsOptional()
  assignedToUserId: string;

  @IsString()
  @IsOptional()
  assignedToName: string;

  @IsDateString()
  @IsOptional()
  dueDate: string;
}

export class CloseCorrectiveActionDto {
  @IsString()
  @IsNotEmpty()
  closureNotes: string;
}
