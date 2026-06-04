import 'reflect-metadata';
import { dataSource } from '../src/database/data-source';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';
import { RegulatoryParagraph } from '../src/regulatory/entities/regulatory-paragraph.entity';

async function test() {
  const ds = await dataSource.initialize();
  const secRepo = ds.getRepository(RegulatorySection);
  const paraRepo = ds.getRepository(RegulatoryParagraph);
  
  const parts = ['46', '47', '48', '50', '56', '57', '62', '77'];
  for (const p of parts) {
      const sCount = await secRepo.count({ where: { part: p } });
      const pCount = await paraRepo.createQueryBuilder('p')
          .innerJoin(RegulatorySection, 's', 's.citation = p.sectionCitation')
          .where('s.part = :p', { p })
          .getCount();

      console.log(`Part ${p}: Sections: ${sCount}, Paragraphs: ${pCount}`);
      if (sCount === 0) process.exit(1);
  }
  
  // Verification for 56/57 specifically
  const p56Paras = await paraRepo.createQueryBuilder('p').innerJoin(RegulatorySection, 's', 's.citation = p.sectionCitation').where('s.part = :p', { p: '56' }).getCount();
  const p57Paras = await paraRepo.createQueryBuilder('p').innerJoin(RegulatorySection, 's', 's.citation = p.sectionCitation').where('s.part = :p', { p: '57' }).getCount();
  
  if (p56Paras > 100 && p57Paras > 100) {
      console.log('MSHA Core Test PASSED: Paragraphs restored.');
  } else {
      console.error('MSHA Core Test FAILED: Paragraph count too low.');
      process.exit(1);
  }
  
  await ds.destroy();
}
test();
