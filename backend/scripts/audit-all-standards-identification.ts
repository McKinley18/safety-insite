import 'reflect-metadata';
import { dataSource } from '../src/database/data-source';
import { Standard } from '../src/standards/entities/standard.entity';
import { RegulatorySection } from '../src/regulatory/entities/regulatory-section.entity';
import { RegulatoryPart } from '../src/regulatory/entities/regulatory-part.entity';
import { ILike } from 'typeorm';

async function audit() {
  const ds = await dataSource.initialize();
  const stdRepo = ds.getRepository(Standard);
  const regRepo = ds.getRepository(RegulatorySection);
  const partRepo = ds.getRepository(RegulatoryPart);

  const stdCount = await stdRepo.count();
  const parts = await partRepo.find();

  console.log('--- DB COUNTS ---');
  console.log('Total Standards:', stdCount);
  for (const part of parts) {
      const sCount = await regRepo.count({ where: { part: part.part, agencyCode: part.agencyCode } });
      console.log(`Agency: ${part.agencyCode}, Part: ${part.part}, Pack: ${part.customerPack}, Sections: ${sCount}`);
  }

  const stds = await stdRepo.find();
  let passedStd = 0;
  for (const s of stds) {
    const matches = await stdRepo.find({ where: { source: s.source as any }, take: 20 });
    if (matches.find(m => m.citation === s.citation)) passedStd++;
  }

  const regs = await regRepo.find({ take: 500 });
  let passedReg = 0;
  for (const r of regs) {
    const found = await regRepo.findOne({ where: { citation: r.citation } });
    const query = r.heading ? r.heading.split(' ')[0] : '';
    const searched = query ? await regRepo.find({ where: { agencyCode: r.agencyCode, part: r.part, heading: ILike(`%${query}%`) } }) : [];
    if (found && (searched.length > 0 || !query)) passedReg++;
  }

  console.log('\n--- AUDIT RESULTS ---');
  console.log('Standards Pass Rate:', (passedStd/stdCount)*100, '%');
  console.log('Regulatory Sections Search Pass Rate:', (passedReg/regs.length)*100, '%');

  await ds.destroy();
}
audit();
