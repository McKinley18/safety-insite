import { Type } from 'class-transformer';
import {
  ArrayMaxSize, IsArray, IsInt, IsOptional, IsString, MaxLength, Min, MinLength,
  ValidateNested,
} from 'class-validator';

/**
 * §262 — THE COMPLETE SET OF FIELDS A CLIENT MAY SEND TO THE AUTHORITATIVE EXPERT ROUTE.
 *
 * ---------------------------------------------------------------------------------------------
 * THE REJECTION IS STRUCTURAL, NOT A FILTER.
 *
 * §260 section 3 stated the boundary as a REJECTION list so that an added field fails closed. The
 * mechanism that delivers it is the global `ValidationPipe` in `main.ts`, configured
 * `whitelist: true, forbidNonWhitelisted: true`: a body carrying ANY property not declared below is
 * rejected with 400 before the controller runs. So the list of server-owned fields does not appear
 * here as a set of ignored properties — it appears as their ABSENCE, which is stronger. There is no
 * `producer`, no `analysisState`, no `confirmationRequired`, no `expertExecutionId`, no candidate
 * identity, no contract or engine version, no provider or model identity, no posture, no driver
 * role, no role justification, no unresolved fact declaration, no required control, no `controlId`,
 * no `declarationId`, no admission disposition, no conformance verdict and no result snapshot —
 * because a property that is not declared cannot be sent at all.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE TWO IDENTIFIERS ARE NOT AUTHORITY FIELDS.
 *
 * `idempotencyKey` and `requestVersion` are the same two the deterministic persistence route has
 * always accepted, and they name a REQUEST, not a conclusion. The key decides which execution a
 * retry resolves to; the version orders revisions of one observation's analysis. Neither can make a
 * result authoritative: the execution record is minted server-side under the key, and a client that
 * invents a key gets its own execution, not someone else's, because the unique index is scoped to
 * `(observationId, idempotencyKey)` and the observation was authorized first.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THE TWO CONTEXT FIELDS ARE GENUINELY USER-AUTHORED.
 *
 * `taskContext` is what the inspector says the work was — the same kind of content as the
 * observation itself, which the user already writes. `answeredClarifications` are answers a human
 * gave to questions the system asked. Both enter the Expert input as ordinary sources and neither
 * is written to a provenance, state or authority field.
 */
export class AnsweredClarificationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  clarificationId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  answer: string;
}

export class RequestExpertAnalysisDto {
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  idempotencyKey: string;

  /**
   * §267 — OPTIONAL, AND THE SHIPPED CLIENT NO LONGER SENDS IT.
   *
   * §266 measured the §265 client hardcoding `1` here while the observation's deterministic
   * analysis already held version 1, so every Expert request from the real workflow spent a
   * provider leg and then collided. The server now DERIVES the execution version at claim time,
   * under the advisory lock, before the transport is reachable.
   *
   * IT IS STILL DECLARED, AND NOT SILENTLY DROPPED. Removing the property entirely would make the
   * global `forbidNonWhitelisted` pipe reject an older client with a generic 400 that says nothing
   * about why. Declaring it optional lets the request be ADJUDICATED instead: a value equal to the
   * ordinal the server would allocate is accepted as agreement, and a stale or invented one is
   * refused pre-spend with a sentence that names the conflict. What is NOT permitted is obeying it,
   * which was the defect, or ignoring it, which would execute a request whose stated identity the
   * server privately disagreed with.
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  requestVersion?: number;

  /** The inspector's own task/area note. Carried as a source; never as a conclusion. */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  taskContext?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => AnsweredClarificationDto)
  answeredClarifications?: AnsweredClarificationDto[];
}
