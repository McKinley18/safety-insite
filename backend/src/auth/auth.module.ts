import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { getJwtSecret } from './jwt-secret.util';
import { User } from '../users/user.entity';
import { OrganizationsModule } from '../organizations/organizations.module';
import { BillingModule } from '../billing/billing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
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
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
