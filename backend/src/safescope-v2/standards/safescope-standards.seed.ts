import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Standard } from '../../standards/entities/standard.entity';

const ds = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'mckinley',
  password: '',
  database: 'sentinel_safety',
  entities: [Standard],
  synchronize: false,
});

const standards: Partial<Standard>[] = [
  {
    agencyCode: 'MSHA',
    citation: '30 CFR 56.14107(a)',
    partNumber: '56',
    title: 'Moving machine parts shall be guarded',
    standardText: 'Moving machine parts shall be guarded to protect persons from contacting gears, sprockets, chains, drive, head, tail, and takeup pulleys, flywheels, couplings, shafts, fan blades, and similar moving parts.',
    plainLanguageSummary: 'Guard moving machine parts that could contact employees.',
    scopeCode: 'mining',
    hazardCodes: ['machine_guarding'],
    requiredControls: ['fixed guarding', 'machine guarding', 'prevent contact with moving parts'],
    keywords: ['guard', 'machine guarding', 'moving parts', 'conveyor', 'pulley', 'shaft', 'drive', 'chain', 'gear'],
    severityWeight: 4,
    isActive: true,
  },
  {
    agencyCode: 'OSHA',
    citation: '1910.212(a)(1)',
    partNumber: '1910',
    title: 'Machine guarding',
    standardText: 'One or more methods of machine guarding shall be provided to protect the operator and other employees from hazards including point of operation, ingoing nip points, rotating parts, flying chips and sparks.',
    plainLanguageSummary: 'Provide guards to protect employees from machine hazards.',
    scopeCode: 'general_industry',
    hazardCodes: ['machine_guarding'],
    requiredControls: ['machine guarding', 'point of operation guarding', 'nip point guarding'],
    keywords: ['machine guarding', 'guard', 'point of operation', 'nip point', 'rotating parts', 'moving parts'],
    severityWeight: 4,
    isActive: true,
  },
  {
    agencyCode: 'OSHA',
    citation: '1910.219',
    partNumber: '1910',
    title: 'Mechanical power-transmission apparatus',
    standardText: 'Mechanical power-transmission apparatus shall be guarded where required to prevent employee contact with belts, pulleys, shafts, gears, chains, and other transmission components.',
    plainLanguageSummary: 'Guard belts, pulleys, shafts, gears, and similar power-transmission parts.',
    scopeCode: 'general_industry',
    hazardCodes: ['machine_guarding'],
    requiredControls: ['guard belts', 'guard pulleys', 'guard shafts', 'guard gears'],
    keywords: ['belt', 'pulley', 'shaft', 'gear', 'chain', 'power transmission', 'mechanical power'],
    severityWeight: 4,
    isActive: true,
  },
  {
    agencyCode: 'OSHA',
    citation: '1910.303(b)(1)',
    partNumber: '1910',
    title: 'Electrical equipment examination and use',
    standardText: 'Electrical equipment shall be free from recognized hazards that are likely to cause death or serious physical harm.',
    plainLanguageSummary: 'Electrical equipment must be safe and free from recognized hazards.',
    scopeCode: 'general_industry',
    hazardCodes: ['electrical'],
    requiredControls: ['approved electrical equipment', 'repair damaged wiring', 'enclose energized parts'],
    keywords: ['electrical', 'wire', 'conductor', 'energized', 'panel', 'shock', 'arc flash'],
    severityWeight: 5,
    isActive: true,
  },
  {
    agencyCode: 'OSHA',
    citation: '1910.147',
    partNumber: '1910',
    title: 'The control of hazardous energy',
    standardText: 'This standard covers the servicing and maintenance of machines and equipment in which unexpected energization or startup could cause injury.',
    plainLanguageSummary: 'Use lockout/tagout to control hazardous energy during service or maintenance.',
    scopeCode: 'general_industry',
    hazardCodes: ['loto_stored_energy'],
    requiredControls: ['lockout/tagout', 'verify zero energy', 'release stored energy'],
    keywords: ['lockout', 'tagout', 'stored energy', 'maintenance', 'unexpected startup', 'zero energy'],
    severityWeight: 5,
    isActive: true,
  },
  {
    agencyCode: 'OSHA',
    citation: '1910.146',
    partNumber: '1910',
    title: 'Permit-required confined spaces',
    standardText: 'Permit-required confined space requirements include evaluation, permits, atmospheric testing, attendants, rescue, and entry controls.',
    plainLanguageSummary: 'Control confined space entry with permits, testing, attendants, and rescue planning.',
    scopeCode: 'general_industry',
    hazardCodes: ['confined_space'],
    requiredControls: ['entry permit', 'atmospheric testing', 'attendant', 'rescue plan'],
    keywords: ['confined space', 'permit space', 'tank entry', 'attendant', 'atmospheric testing', 'rescue'],
    severityWeight: 5,
    isActive: true,
  },
  {
    agencyCode: 'OSHA',
    citation: '1910.22(a)',
    partNumber: '1910',
    title: 'Walking-working surfaces',
    standardText: 'All places of employment, passageways, storerooms, service rooms, and walking-working surfaces shall be kept clean, orderly, and sanitary.',
    plainLanguageSummary: 'Keep walking-working surfaces clean, orderly, and free of hazards.',
    scopeCode: 'general_industry',
    hazardCodes: ['walking_working_surfaces'],
    requiredControls: ['clean walking surface', 'remove obstruction', 'maintain access'],
    keywords: ['walkway', 'walking surface', 'slip', 'trip', 'spill', 'blocked', 'housekeeping'],
    severityWeight: 3,
    isActive: true,
  },
  {
    agencyCode: 'OSHA',
    citation: '1910.36',
    partNumber: '1910',
    title: 'Exit routes',
    standardText: 'Exit routes must be permanent, unobstructed, and adequate for emergency egress.',
    plainLanguageSummary: 'Maintain clear and usable exit routes.',
    scopeCode: 'general_industry',
    hazardCodes: ['emergency_egress'],
    requiredControls: ['clear exit route', 'maintain egress', 'unlock exit door'],
    keywords: ['exit', 'egress', 'blocked exit', 'exit route', 'emergency exit', 'locked exit'],
    severityWeight: 5,
    isActive: true,
  },
];

async function run() {
  await ds.initialize();
  const repo = ds.getRepository(Standard);

  for (const standard of standards) {
    const existing = await repo.findOne({
      where: {
        agencyCode: standard.agencyCode,
        citation: standard.citation,
      },
    });

    if (existing) {
      Object.assign(existing, standard);
      await repo.save(existing);
      console.log(`Updated ${standard.citation}`);
    } else {
      await repo.save(repo.create(standard));
      console.log(`Inserted ${standard.citation}`);
    }
  }

  console.log(`Seeded ${standards.length} SafeScope standards.`);
  await ds.destroy();
}

run().catch(async (error) => {
  console.error(error);
  await ds.destroy().catch(() => undefined);
  process.exit(1);
});
