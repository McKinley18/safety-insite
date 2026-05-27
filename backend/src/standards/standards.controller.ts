import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { StandardsService } from './standards.service';
import { JwtGuard } from '../auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('standards')
export class StandardsController {
  constructor(private readonly standardsService: StandardsService) {}

  @Post('match')
  match(@Body() body: { text: string }) {
    return this.standardsService.match(body.text);
  }
}
