import { Module } from '@nestjs/common';
import { SafeScopeOrchestratorService } from './safescope-orchestrator.service';

@Module({
  providers: [SafeScopeOrchestratorService],
  exports: [SafeScopeOrchestratorService],
})
export class SafeScopeOrchestratorContractModule {}
