import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { ReasoningSnapshotService } from './reasoning-snapshot.service';

@UseGuards(JwtGuard)
@Controller('safescope-v2/reasoning-snapshots')
export class ReasoningSnapshotController {
  constructor(private readonly snapshots: ReasoningSnapshotService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.snapshots.findOne(id);
  }
}
