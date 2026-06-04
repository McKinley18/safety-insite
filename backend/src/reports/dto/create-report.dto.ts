import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateReportDto {
  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  inspector?: string;

  @IsOptional()
  @IsString()
  site?: string;

  @IsOptional()
  @IsBoolean()
  confidential?: boolean;

  @IsOptional()
  @IsArray()
  findings?: any[];

  @IsOptional()
  frontendReportJson?: any;

  @IsOptional()
  report?: any;
}
