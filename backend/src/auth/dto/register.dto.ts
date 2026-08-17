import {IsEmail, IsIn, IsOptional, IsString, Matches, MinLength} from 'class-validator';

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
}
