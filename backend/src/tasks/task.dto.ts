import { IsDateString, IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString() @MinLength(2) @MaxLength(200)
  title: string;

  @IsString() @IsOptional() @MaxLength(5000)
  description?: string;

  @IsDateString()
  dueDate: string;

  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @IsUUID() @IsOptional()
  assignedToUserId?: string;

  @IsUUID() @IsOptional()
  siteId?: string;

  @IsUUID() @IsOptional()
  inspectionId?: string;

  @IsUUID() @IsOptional()
  correctiveActionId?: string;
}

export class UpdateTaskStatusDto {
  @IsIn(['open', 'completed', 'cancelled'])
  status: 'open' | 'completed' | 'cancelled';
}
