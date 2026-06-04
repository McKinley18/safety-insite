import 'reflect-metadata';
import { dataSource } from '../src/database/data-source';
import { RegulatoryPart } from '../src/regulatory/entities/regulatory-part.entity';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';
import { RegulatoryParagraph } from '../src/regulatory/entities/regulatory-paragraph.entity';

async function verify() {
  const ds = await dataSource.initialize();
  const partRepo = ds.getRepository(RegulatoryPart);
  const sectRepo = ds.getRepository(RegulatorySection);
  const paraRepo = ds.getRepository(RegulatoryParagraph);

  const parts = await partRepo.find();
  
  console.log('--- SYNC STATS ---');
  for (const part of parts) {
      const sCount = await sectRepo.count({ where: { part: part.part, agencyCode: part.agencyCode } });
      const pCount = await paraRepo.createQueryBuilder('p')
          .innerJoin(RegulatorySection, 's', 's.citation = p.sectionCitation')
          .where('s.part = :part', { part: part.part })
          .andWhere('s.agencyCode = :agency', { agency: part.agencyCode })
          .getCount();
      console.log(`Agency: ${part.agencyCode}, Part: ${part.part}, Pack: ${part.customerPack}, Sections: ${sCount}, Paragraphs: ${pCount}`);
  }

  // Search Verification
  const search = async (agency: string, part: string, query: string) => {
    return await sectRepo.find({ where: { agencyCode: agency, part, heading: require('typeorm').ILike(`%${query}%`) } });
  }

  const queries = [
    { agency: 'MSHA', part: '56', q: 'guard' },
    { agency: 'MSHA', part: '77', q: 'electrical' },
    { agency: 'OSHA', part: '1910', q: 'guard' },
    { agency: 'OSHA', part: '1926', q: 'fall' },
    { agency: 'OSHA', part: '1904', q: 'record' }
  ];

  console.log('\n--- SEARCH VERIFICATION ---');
  for (const t of queries) {
    const res = await search(t.agency, t.part, t.q);
    console.log(`Search Agency: ${t.agency}, Part: ${t.part}, Query: '${t.q}', Results: ${res.length}`);
  }

  await ds.destroy();
}
verify();
