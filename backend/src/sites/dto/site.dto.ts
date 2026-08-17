import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSiteDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(160)
  name: string;
}

export class UpdateSiteDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(160)
  name?: string;
}
