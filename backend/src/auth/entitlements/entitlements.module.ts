import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntitlementGrant } from '../../billing/entitlement-grant.entity';
import { EntitlementGuard } from './entitlement.guard';
import { EntitlementService } from './entitlement.service';
import { EntitlementOperationsController } from './entitlement-operations.controller';
import { SecurityAuditEvent } from '../../audit/entities/security-audit-event.entity';
import { User } from '../../users/user.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([EntitlementGrant, SecurityAuditEvent, User])],
  controllers: [EntitlementOperationsController],
  providers: [EntitlementService, EntitlementGuard],
  exports: [EntitlementService, EntitlementGuard, TypeOrmModule],
})
export class EntitlementsModule {}
