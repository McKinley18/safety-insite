import { IsOptional, IsString, Matches } from 'class-validator';
import { CLIENT_REQUEST_ID_PATTERN } from '../../inspection/dto/inspection.dto';

/**
 * The non-file half of the multipart evidence upload.
 *
 * Only `clientRequestId` is accepted. The global ValidationPipe runs with
 * `forbidNonWhitelisted: true` (see main.ts), so any other form field is rejected rather than
 * silently ignored — a whitelist, not a suggestion.
 */
export class UploadEvidenceDto {
  @IsString()
  @IsOptional()
  @Matches(CLIENT_REQUEST_ID_PATTERN, {
    message: 'clientRequestId must be 8-128 characters of A-Z a-z 0-9 _ . : -',
  })
  clientRequestId?: string;
}
