import { SafescopeV2Module } from './safescope-v2/safescope-v2.module';
import { Module } from '@nestjs/common';
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
import { SafeScopeKnowledgeModule } from './safescope-knowledge/safescope-knowledge.module';
import { MaintenanceSeedController } from './maintenance/maintenance-seed.controller';

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
      imports: [SafescopeV2Module, ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const isProduction = configService.get<string>('NODE_ENV') === 'production';

        return {
          type: 'postgres',
          url: databaseUrl || undefined,
          host: databaseUrl ? undefined : configService.get<string>('DB_HOST'),
          port: databaseUrl ? undefined : configService.get<number>('DB_PORT'),
          username: databaseUrl ? undefined : configService.get<string>('DB_USERNAME'),
          password: databaseUrl ? undefined : configService.get<string>('DB_PASSWORD'),
          database: databaseUrl ? undefined : configService.get<string>('DB_NAME'),
          ssl: isProduction ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          synchronize: configService.get<string>('TYPEORM_SYNCHRONIZE') === 'true',
        };
      },
    }),

    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
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
  ],
})
export class AppModule {}
