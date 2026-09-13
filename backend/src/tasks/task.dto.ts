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

/**
 * §276 / D-007. Editing a task in place.
 *
 * Every field is optional so a caller may move a due date without restating the title,
 * but the DTO declares nothing the server owns -- id, ownership, version, status and the
 * inspection/action links are not addressable here. The global whitelisting pipe rejects
 * anything else outright.
 */
export class UpdateTaskDto {
  @IsString() @IsOptional() @MinLength(2) @MaxLength(200)
  title?: string;

  @IsString() @IsOptional() @MaxLength(5000)
  description?: string;

  @IsDateString() @IsOptional()
  dueDate?: string;

  @IsIn(['low', 'medium', 'high', 'urgent']) @IsOptional()
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export class UpdateTaskStatusDto {
  @IsIn(['open', 'completed', 'cancelled'])
  status: 'open' | 'completed' | 'cancelled';
}
