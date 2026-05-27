import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { RiskService } from './risk.service';
import { JwtGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('risk')
export class RiskController {
  constructor(private service: RiskService) {}

  @Post('calculate')
  async calculate(@Body() body: { severity: number; likelihood: number }) {
    return this.service.calculate(body.severity, body.likelihood);
  }
}
