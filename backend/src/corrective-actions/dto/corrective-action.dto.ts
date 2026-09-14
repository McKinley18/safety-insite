import { IsString, IsNotEmpty, IsOptional, IsDateString, IsIn, Matches, MaxLength } from 'class-validator';
import { CLIENT_REQUEST_ID_PATTERN } from '../../inspection/dto/inspection.dto';

export class CreateCorrectiveActionDto {
  @IsString()
  @IsOptional()
  reportId?: string;

  @IsString()
  @IsOptional()
  inspectionId?: string;

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

  /**
   * §287 / D-053. Optional idempotency key. When supplied, a repeat of the same create from the
   * same user returns the action that already exists instead of raising a second one -- the
   * behaviour `POST /inspections` and `POST .../observations` have had since the canonical
   * foundation, and the one route in the product that lacked it.
   */
  @IsString()
  @IsOptional()
  @Matches(CLIENT_REQUEST_ID_PATTERN, {
    message: 'clientRequestId must be 8-128 characters of A-Z a-z 0-9 _ . : -',
  })
  clientRequestId?: string;
}

/**
 * §287 / D-051 — EDIT AN EXISTING CORRECTIVE ACTION.
 *
 * Every field here is OPTIONAL and absence means "leave it alone", so a client that wants to move
 * a due date does not have to resend a title it never displayed and risk overwriting a colleague's
 * edit with a stale copy.
 *
 * `statusCode` is deliberately NOT here. Status moves through `PATCH /actions/:id/status`, which
 * carries the closure semantics (who closed it, when, and the fact that closing is not verifying).
 * Allowing status to be set through a general field update would give the product two ways to
 * close an action, only one of which records the closure correctly.
 */
export class UpdateCorrectiveActionDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @MaxLength(10000)
  description?: string;

  @IsIn(['low', 'medium', 'high', 'urgent'])
  @IsOptional()
  priorityCode?: 'low' | 'medium' | 'high' | 'urgent';

  /**
   * A CALENDAR DAY. `YYYY-MM-DD` is parsed to LOCAL midnight by the shared `parseDueDate`, which
   * is the §275 repair: `new Date('2026-09-15')` is UTC midnight and therefore the previous
   * evening anywhere west of Greenwich.
   */
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(160)
  assignedToName?: string;

  @IsString()
  @IsOptional()
  assignedToUserId?: string;
}

/**
 * §287. The status transition, with its own DTO so the vocabulary is validated rather than trusted
 * from an inline body type. `closureNotes` stays OPTIONAL: §287's direction is explicit that
 * arbitrary evidence must not be made mandatory merely to satisfy the UI.
 */
export class UpdateCorrectiveActionStatusDto {
  @IsIn(['open', 'in_progress', 'closed', 'cancelled'])
  statusCode: 'open' | 'in_progress' | 'closed' | 'cancelled';

  @IsString()
  @IsOptional()
  @MaxLength(10000)
  closureNotes?: string;
}

export class CloseCorrectiveActionDto {
  @IsString()
  @IsNotEmpty()
  closureNotes: string;
}
