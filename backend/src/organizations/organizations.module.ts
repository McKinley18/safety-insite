import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { Organization } from './entities/organization.entity';
import { Invitation } from './entities/invitation.entity';
import { User } from '../users/user.entity';
import { OrganizationMembership } from './entities/organization-membership.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Invitation, User, OrganizationMembership])],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService, TypeOrmModule],
})
export class OrganizationsModule {}
