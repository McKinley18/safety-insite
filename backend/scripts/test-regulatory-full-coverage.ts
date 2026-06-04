import 'reflect-metadata';
import { dataSource } from '../src/database/data-source';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';
import { RegulatoryPart } from '../src/regulatory/entities/regulatory-part.entity';

async function test() {
  const ds = await dataSource.initialize();
  const sectRepo = ds.getRepository(RegulatorySection);
  const partRepo = ds.getRepository(RegulatoryPart);
  
  const oshaParts = ['1904', '1910', '1926'];
  for (const p of oshaParts) {
      const sCount = await sectRepo.count({ where: { part: p, agencyCode: 'OSHA' } });
      const pData = await partRepo.findOne({ where: { part: p, agencyCode: 'OSHA' } });
      console.log(`OSHA Part ${p}: Sections: ${sCount}, Pack: ${pData?.customerPack || 'NULL'}`);
      if (sCount === 0 || !pData?.customerPack) process.exit(1);
  }

  // Search Verification
  const search = async (part: string, q: string) => await sectRepo.count({ where: { agencyCode: 'OSHA', part, heading: require('typeorm').ILike(`%${q}%`) } });
  
  if (await search('1910', 'guard') > 0 && await search('1926', 'fall') > 0 && await search('1904', 'record') > 0) {
      console.log('OSHA Core Test PASSED');
  } else {
      console.error('OSHA Core Test FAILED: Missing search results.');
      process.exit(1);
  }
  
  await ds.destroy();
}
test();
