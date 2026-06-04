import axios from 'axios';
import { DataSource, Repository } from 'typeorm';
import { Standard } from '../standard.entity';
import { parseStringPromise } from 'xml2js';

type IngestRecord = {
  citation: string;
  agency: string;
  title?: string;
  text?: string;
  part?: string | null;
  category?: string | null;
  isActive?: boolean;
  [key: string]: unknown;
};

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'mckinley',
  password: '',
  database: 'sentinel_safety',
  entities: [Standard],
  synchronize: false,
});

const YEAR = '2023';

const TITLES = [
  { title: '30', agency: 'MSHA', volumes: 3 },
  { title: '29', agency: 'OSHA', volumes: 9 },
];

function buildUrl(title: string, volume: number) {
  return `https://www.govinfo.gov/content/pkg/CFR-${YEAR}-title${title}-vol${volume}/xml/CFR-${YEAR}-title${title}-vol${volume}.xml`;
}

function clean(s: string) {
  return (s || '').replace(/\s+/g, ' ').trim();
}

function textOf(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(textOf).join(' ');
  if (typeof node === 'object') {
    return Object.values(node).map(textOf).join(' ');
  }
  return '';
}

// 🔥 NEW: DEEP SECTION EXTRACTION
function extractAllSections(root: any, agency: string) {
  const results: any[] = [];

  function walk(node: any, part: string | null = null) {
    if (!node) return;

    // Detect PART
    if (node.PARTNO) {
      part = clean(textOf(node.PARTNO));
    }

    // Detect SECTION (handles many shapes)
    if (node.SECTNO || node.SUBJECT || node.P) {
      const citationRaw = clean(textOf(node.SECTNO));
      const citation = citationRaw.replace(/§/g, '').replace(/\s+/g, '');

      if (citation && citation.match(/\d+\./)) {
        results.push({
          citation,
          agency,
          title: clean(textOf(node.SUBJECT || node.HD)),
          text: clean(textOf(node.P)),
          part,
          category: null,
          isActive: true,
        });
      }
    }

    // recurse everything
    if (typeof node === 'object') {
      for (const key in node) {
        const val = node[key];

        if (Array.isArray(val)) {
          val.forEach(v => walk(v, part));
        } else if (typeof val === 'object') {
          walk(val, part);
        }
      }
    }
  }

  walk(root);
  return results;
}

function mapToStandardPayload(record: IngestRecord): Partial<Standard> {
  return {
    citation: record.citation,
    agency: record.agency,
    title: record.title ?? record.citation,
    text: record.text ?? '',
    part: record.part ?? undefined,
    subpart: undefined,
    category: record.category ?? undefined,
    isActive: record.isActive ?? true,
  };
}

async function upsert(repo: Repository<Standard>, record: IngestRecord) {
  const existing = await repo.findOne({
    where: { citation: record.citation, agency: record.agency },
  });

  if (existing) {
    await repo.update(existing.id, mapToStandardPayload(record));
    return 'update';
  } else {
    await repo.save(repo.create(mapToStandardPayload(record)));
    return 'insert';
  }
}

async function run() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Standard);

  for (const t of TITLES) {
    let total = 0;

    for (let v = 1; v <= t.volumes; v++) {
      console.log(`\n📡 ${t.agency} Title ${t.title} Volume ${v}`);

      try {
        const url = buildUrl(t.title, v);
        const xml = await axios.get(url).then(r => r.data);

        const parsed = await parseStringPromise(xml, { explicitArray: false });
        const sections = extractAllSections(parsed, t.agency);

        console.log(`➡ Found ${sections.length} sections`);

        for (const s of sections) {
          const res = await upsert(repo, s);
          if (res === 'insert') total++;
        }

      } catch (e) {
        console.log(`⚠ Skipped volume ${v}`);
      }
    }

    console.log(`\n✔ ${t.agency} total inserted: ${total}`);
  }

  console.log('\n✅ FULL CFR INGEST COMPLETE');
  process.exit(0);
}

run();
