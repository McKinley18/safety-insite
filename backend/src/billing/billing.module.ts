
import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { BillingController } from './billing.controller';

import { BillingService } from './billing.service';

import { User } from '../users/user.entity';

import { Organization } from '../organizations/entities/organization.entity';

@Module({

  imports: [TypeOrmModule.forFeature([User, Organization])],

  controllers: [BillingController],

  providers: [BillingService],

})

export class BillingModule {}

