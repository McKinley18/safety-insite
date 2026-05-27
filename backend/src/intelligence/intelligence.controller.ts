import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { IntelligenceService } from './intelligence.service';
import { StandardsService } from '../standards/standards.service';
import { JwtGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('intelligence')
export class IntelligenceController {
  constructor(
    private intelligence: IntelligenceService,
    private standards: StandardsService,
  ) {}

  @Post('analyze')
  analyze(@Body() body: { text: string }) {
    const classification = this.intelligence.classify(body.text);
    const standards = this.standards.match(body.text);

    return {
      classification,
      standards,
    };
  }
}
