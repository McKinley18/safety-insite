import {IsArray, IsEmail, IsIn, IsOptional, IsString, Matches, MinLength} from 'class-validator';

/**
 * §291 (SU-1). What the CLIENT asserts it accepted. The server validates every field of this
 * against its own registry before anything is written, so nothing here is trusted as evidence --
 * it is a claim to be checked, not a record to be stored.
 */
export class AgreementAcceptanceInput {
  @IsString()
  agreementId: string;

  @IsString()
  agreementVersion: string;
}

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/[A-Z]/, { message: 'Must contain uppercase letter' })
  @Matches(/[a-z]/, { message: 'Must contain lowercase letter' })
  @Matches(/[0-9]/, { message: 'Must contain number' })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, { message: 'Must contain special character' })
  password: string;

  @IsOptional()
  @IsIn(['individual'])
  type?: 'individual';

  @IsOptional()
  @IsString()
  promoCode?: string;
  @IsOptional()
  @IsIn(['free', 'pro', 'basic', 'plus', 'company'])
  selectedPlan?: 'free' | 'pro' | 'basic' | 'plus' | 'company';

  @IsOptional()
  @IsIn(['free', 'pro', 'basic', 'plus', 'company'])
  planCode?: 'free' | 'pro' | 'basic' | 'plus' | 'company';

  /**
   * §291 (SU-1). Optional on the DTO and REQUIRED by the service. The distinction is deliberate:
   * a missing acceptance must produce the service's explanatory message naming the agreement and
   * version that is required, not a generic class-validator complaint about a missing property.
   */
  @IsOptional()
  @IsArray()
  acceptedAgreements?: AgreementAcceptanceInput[];
}
