import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../../auth/entitlements/entitlement.guard';
import { ReasoningSnapshotService } from './reasoning-snapshot.service';

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('fullSafeScope')
@Controller('safescope-v2/reasoning-snapshots')
export class ReasoningSnapshotController {
  constructor(private readonly snapshots: ReasoningSnapshotService) {}

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.snapshots.findSummaryForUser(id, req.user);
  }

  @Get(':id/raw')
  findRaw(@Param('id') id: string, @Req() req: any) {
    return this.snapshots.findRawForUser(id, req.user);
  }
}
