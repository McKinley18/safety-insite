import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { RegulatoryAgency } from '../src/regulatory/entities/regulatory-agency.entity';
import { RegulatoryPart } from '../src/regulatory/entities/regulatory-part.entity';
import { RegulatorySubpart } from '../src/regulatory/entities/regulatory-subpart.entity';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';
import { RegulatoryParagraph } from '../src/regulatory/entities/regulatory-paragraph.entity';
import { RegulatorySyncService } from '../src/regulatory/regulatory-sync.service';

async function run() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !databaseUrl.includes('hazlenz_standards_verify_20260816')) {
    throw new Error(
      `Refusing to run: DATABASE_URL must target the disposable verification DB. Got: ${databaseUrl}`,
    );
  }

  const ds = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: [RegulatoryAgency, RegulatoryPart, RegulatorySubpart, RegulatorySection, RegulatoryParagraph],
    synchronize: false,
  });
  await ds.initialize();

  const service = new RegulatorySyncService(
    ds.getRepository(RegulatorySection),
    ds.getRepository(RegulatoryPart),
    ds.getRepository(RegulatoryAgency),
    ds.getRepository(RegulatorySubpart),
    ds.getRepository(RegulatoryParagraph),
  );

  const targets: Array<[string, () => Promise<any>]> = [
    ['OSHA 1910', () => service.syncOsha1910()],
    ['OSHA 1926', () => service.syncOsha1926()],
    ['MSHA Part 56', () => service.syncPart56()],
  ];

  for (const [label, fn] of targets) {
    console.log(`Syncing ${label}...`);
    const result = await fn();
    console.log(label, result);
  }

  await ds.destroy();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
