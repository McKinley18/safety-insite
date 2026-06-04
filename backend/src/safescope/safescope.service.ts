import { Injectable } from '@nestjs/common';
import { MatcherService } from './engine/matcher.service';
import { AiService } from './ai/ai.service';
import { StandardsService } from './standards/standards.service';

@Injectable()
export class SafeScopeService {
  constructor(
    private matcher: MatcherService,
    private ai: AiService,
    private standardsService: StandardsService
  ) {}

  async analyze(input: any) {
    const standards = this.standardsService.findAll();

    const matches = await this.matcher.match(input, standards);

    const ai = this.ai.enhance(input, matches);

    return {
      calculatedRisk: input.calculatedRisk,
      matches,
      ai,
    };
  }
}
