import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SafeScopeKnowledgeSource } from '../entities/safescope-knowledge-source.entity';
import { SafeScopeKnowledgeIngestionRun } from '../entities/safescope-knowledge-ingestion-run.entity';

const trustedSources = [
  {
    name: 'MSHA Fatality Reports',
    agency: 'MSHA',
    sourceType: 'fatality_report',
    trustLevel: 'official',
    defaultAuthorityTier: 3,
    baseUrl: 'https://www.msha.gov/data-and-reports/fatality-reports/search',
    description:
      'MSHA fatality reports and fatalgrams used for incident learning, hazard recognition, and prevention themes.',
    metadataJson: {
      ingestionMode: 'metadata_then_review',
      approvalRequired: true,
      offlineEligible: true,
    },
  },
  {
    name: 'MSHA Program Policy Manual',
    agency: 'MSHA',
    sourceType: 'policy',
    trustLevel: 'official',
    defaultAuthorityTier: 2,
    baseUrl: 'https://www.msha.gov/regulations/program-policy-manual',
    description:
      'MSHA policy and interpretive guidance used to support standards reasoning.',
    metadataJson: {
      ingestionMode: 'document_sections',
      approvalRequired: true,
      offlineEligible: true,
    },
  },
  {
    name: 'OSHA Accident Investigation Search',
    agency: 'OSHA',
    sourceType: 'accident_report',
    trustLevel: 'official',
    defaultAuthorityTier: 3,
    baseUrl: 'https://www.osha.gov/ords/imis/accidentsearch.html',
    description:
      'OSHA accident investigation summaries used for case-study and incident learning signals.',
    metadataJson: {
      ingestionMode: 'metadata_then_review',
      approvalRequired: true,
      offlineEligible: true,
    },
  },
  {
    name: 'OSHA Data Downloads',
    agency: 'OSHA',
    sourceType: 'dataset',
    trustLevel: 'official',
    defaultAuthorityTier: 3,
    baseUrl: 'https://www.osha.gov/data',
    description:
      'OSHA downloadable datasets for inspection, citation, severe injury, fatality, and enforcement trend analysis.',
    metadataJson: {
      ingestionMode: 'dataset_summary',
      approvalRequired: true,
      offlineEligible: false,
    },
  },
  {
    name: 'NIOSH Safety and Health Publications',
    agency: 'NIOSH',
    sourceType: 'research',
    trustLevel: 'research',
    defaultAuthorityTier: 4,
    baseUrl: 'https://www.cdc.gov/niosh/',
    description:
      'NIOSH research and publications used for hazard recognition, prevention guidance, and human-factors learning.',
    metadataJson: {
      ingestionMode: 'publication_review',
      approvalRequired: true,
      offlineEligible: true,
    },
  },
];

async function bootstrap() {
  ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env',
  });

  const configService = new ConfigService();
  const databaseUrl = configService.get<string>('DATABASE_URL');
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl || undefined,
    host: databaseUrl ? undefined : configService.get<string>('DB_HOST'),
    port: databaseUrl ? undefined : Number(configService.get<number>('DB_PORT') || 5432),
    username: databaseUrl ? undefined : configService.get<string>('DB_USERNAME'),
    password: databaseUrl ? undefined : configService.get<string>('DB_PASSWORD'),
    database: databaseUrl ? undefined : configService.get<string>('DB_NAME'),
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    synchronize:
      configService.get<string>('TYPEORM_SYNCHRONIZE') === 'true' ||
      (!isProduction && configService.get<string>('NODE_ENV') === 'development'),
    entities: [SafeScopeKnowledgeSource, SafeScopeKnowledgeIngestionRun],
  });

  await dataSource.initialize();

  const sourceRepo = dataSource.getRepository(SafeScopeKnowledgeSource);

  for (const item of trustedSources) {
    const existing = await sourceRepo.findOne({
      where: { name: item.name },
    });

    const source = existing || new SafeScopeKnowledgeSource();

    Object.assign(source, item);

    await sourceRepo.save(source);
    console.log(`Seeded source: ${item.name}`);
  }

  await dataSource.destroy();

  console.log(`SafeScope trusted sources seeded: ${trustedSources.length}`);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
