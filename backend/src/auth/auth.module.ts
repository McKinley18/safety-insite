import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { TokenValidityService } from './token-validity.service';
import { getJwtSecret } from './jwt-secret.util';
import { User } from '../users/user.entity';
import { OrganizationsModule } from '../organizations/organizations.module';
import { BillingModule } from '../billing/billing.module';
import { PasswordResetDeliveryService } from './password-reset-delivery.service';
import { OrganizationMembership } from '../organizations/entities/organization-membership.entity';
import { EntitlementGrant } from '../billing/entitlement-grant.entity';
import { InspectionAssignment } from '../inspection/entities/inspection-assignment.entity';
import { SecurityAuditEvent } from '../audit/entities/security-audit-event.entity';
import { Notification } from '../notifications/notification.entity';
import { RefreshToken } from './entities/refresh-token.entity';

// Global: TokenValidityService must be injectable into JwtGuard from every
// feature module (sites, inspections, HazLenz, reports, etc.) without each
// of those ~40 modules importing AuthModule individually.
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      OrganizationMembership,
      EntitlementGrant,
      InspectionAssignment,
      SecurityAuditEvent,
      Notification,
      RefreshToken,
    ]),
    OrganizationsModule,
    BillingModule,
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PasswordResetDeliveryService, TokenValidityService],
  exports: [TokenValidityService],
})
export class AuthModule {}
