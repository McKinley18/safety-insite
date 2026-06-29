import { SafescopeV2Module } from './safescope-v2/safescope-v2.module';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { ReportsModule } from './reports/reports.module';
import { StandardsModule } from './standards/standards.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { SitesModule } from './sites/sites.module';
import { HealthModule } from './health/health.module';
import { RegulatoryModule } from './regulatory/regulatory.module';
import { ActionEngineModule } from './action-engine/action-engine.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { GovernanceModule } from './governance/governance.module';
import { OutcomesModule } from './outcomes/outcomes.module';
import { TransparencyModule } from './transparency/transparency.module';
import { PdfModule } from './pdf/pdf.module';
import { BillingModule } from './billing/billing.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SafeScopeKnowledgeModule } from './safescope-knowledge/safescope-knowledge.module';
import { SafeScopeModule } from './safescope/safescope.module';
import { UploadModule } from './upload/upload.module';
import { MaintenanceSeedController } from './maintenance/maintenance-seed.controller';

function getDatabaseSslConfig() {
  const value = String(process.env.DB_SSL || '').toLowerCase();

  if (value === 'true' || value === 'require') {
    return { rejectUnauthorized: false };
  }

  if (value === 'false' || value === 'disable') {
    return false;
  }

  if (process.env.DATABASE_URL?.includes('sslmode=require')) {
    return { rejectUnauthorized: false };
  }

  return false;
}

@Module({
  controllers: [MaintenanceSeedController],
  imports: [SafescopeV2Module,
    SafeScopeKnowledgeModule, 
    // 🔷 ENVIRONMENT CONFIGURATION: IT standard for secret management
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        return {
          type: 'postgres',
          url: databaseUrl || undefined,
          host: databaseUrl ? undefined : configService.get<string>('DB_HOST'),
          port: databaseUrl ? undefined : configService.get<number>('DB_PORT'),
          username: databaseUrl ? undefined : configService.get<string>('DB_USERNAME'),
          password: databaseUrl ? undefined : (configService.get<string>('DB_PASSWORD') ?? ''),
          database: databaseUrl ? undefined : configService.get<string>('DB_NAME'),
          ssl: getDatabaseSslConfig(),
          autoLoadEntities: true,
          synchronize: configService.get<string>('TYPEORM_SYNCHRONIZE') === 'true',
        };
      },
    }),

    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),

    AuthModule,
    ReportsModule,
    StandardsModule,
    OrganizationsModule,
    SitesModule,
    HealthModule,
    RegulatoryModule,
    ActionEngineModule,
    IntelligenceModule,
    GovernanceModule,
    OutcomesModule,
    TransparencyModule,
    PdfModule,
    BillingModule,
    DashboardsModule,
    AnalyticsModule,
    SafeScopeModule,
    UploadModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
