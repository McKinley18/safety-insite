import { IsEmail, IsOptional, IsString, MinLength, Matches } from 'class-validator';

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

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  promoCode?: string;
}
