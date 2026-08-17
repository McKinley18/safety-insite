import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { BillingController } from "./billing.controller";
import { BillingService } from "./billing.service";
import { User } from "../users/user.entity";
import { Organization } from "../organizations/entities/organization.entity";
import { UserSubscription } from "./user-subscription.entity";
import { EntitlementGrant } from "./entitlement-grant.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Organization, UserSubscription, EntitlementGrant])],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
