import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class SuggestStandardsDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  hazardCategory?: string;

  @IsOptional()
  @IsIn(["MSHA", "OSHA_CONSTRUCTION", "OSHA_GENERAL_INDUSTRY"])
  source?: "MSHA" | "OSHA_CONSTRUCTION" | "OSHA_GENERAL_INDUSTRY";

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(25)
  limit?: number;
}
