import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApplicableStandardsService } from "./applicable-standards.service";
import { SuggestStandardsDto } from "./dto/applicable-standards.dto";
import { JwtGuard } from "../auth/guards/jwt.guard";

@UseGuards(JwtGuard)
@Controller("applicable-standards")
export class ApplicableStandardsController {
  constructor(private service: ApplicableStandardsService) {}

  @Post("suggest")
  async suggest(@Body() dto: SuggestStandardsDto) {
    try {
      return {
        matches: await this.service.suggest(
          dto.description,
          dto.hazardCategory,
          dto.source,
          dto.limit,
        ),
      };
    } catch (error: any) {
      console.error("Applicable standards suggest failed:", {
        message: error?.message,
        name: error?.name,
        code: error?.code,
        detail: error?.detail,
        stack: error?.stack,
      });
      throw error;
    }
  }
}
