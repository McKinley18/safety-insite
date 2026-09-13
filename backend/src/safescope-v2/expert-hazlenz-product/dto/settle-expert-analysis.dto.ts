import { Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, IsArray, IsIn, IsOptional, IsString, MaxLength, MinLength,
  ValidateNested,
} from 'class-validator';

import { HUMAN_CLASSIFICATIONS, SETTLEMENT_DECISIONS } from '../expert-settlement-contract';

/**
 * §264 — THE COMPLETE SET OF FIELDS A REVIEWER MAY SEND WHEN SETTLING AN EXPERT CLASSIFICATION.
 *
 * ---------------------------------------------------------------------------------------------
 * THE SERVER OWNS THE SUBJECT. THE CLIENT SENDS A DECISION ABOUT IT.
 *
 * There is no field here for an analysis snapshot, raw Expert output, a candidate identity, a
 * provider or model name, a declaration id, a control id, an admission verdict, the original
 * `confirmationRequired` value, a posture, a driver role, a hazard, a citation, a control text or a
 * reviewer id. The rejection is structural, exactly as in §262: the global `ValidationPipe` runs
 * `whitelist + forbidNonWhitelisted`, so a property that is not declared here cannot be sent at all.
 *
 * The reviewer identity in particular is taken from the authenticated principal and is not
 * expressible in the body — a reviewer id a client could send is a reviewer id a client could forge,
 * and the signature on a safety decision is the one thing that must be the server's.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY `replacements` IS NOT FREE-FORM.
 *
 * §264 prohibits arbitrary JSON editing through this action. A replacement addresses one subject
 * entry by the `refKind:ref` pair the analysis already carries, and carries one value from a
 * two-member closed vocabulary. It cannot reach anything else, because nothing else is addressable:
 * the server validates every entry against the subject it derived for itself, and refuses a
 * reference the analysis does not actually ask about.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY A RATIONALE IS ALWAYS REQUIRED, INCLUDING ON A CONFIRMATION.
 *
 * §260 requires one for an override, following the existing material-risk precedent of at least ten
 * characters. §264 requires one for a confirmation too. A confirmation is not a lesser act: it is a
 * person putting their name to "work may continue on this basis", and a record of that decision
 * with no stated reason is the record hardest to defend later. The cost is one sentence.
 */
export class ClassificationReplacementDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  refKind: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  ref: string;

  @IsIn(HUMAN_CLASSIFICATIONS as unknown as string[])
  classification: string;
}

export class SettleExpertAnalysisDto {
  /**
   * Distinguishes a network retry from a competing new decision. A replay under the same key
   * resolves to the row it already wrote; a different key against a settled analysis is refused.
   */
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  idempotencyKey: string;

  @IsIn(SETTLEMENT_DECISIONS as unknown as string[])
  decision: string;

  @IsString()
  @MinLength(10)
  @MaxLength(4000)
  rationale: string;

  /** Required for `classification_changed`, and rejected on a confirmation. */
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ClassificationReplacementDto)
  replacements?: ClassificationReplacementDto[];

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  comment?: string;
}
