import { dataSource } from '../../database/data-source';
import { Standard } from '../entities/standard.entity';
import { CorrectiveActionTemplate } from '../entities/corrective-action-template.entity';
import { StandardsSeedService } from '../standards-seed.service';

async function run() {
  const ds = await dataSource.initialize();

  const standardRepo = ds.getRepository(Standard);
  const correctiveTemplateRepo = ds.getRepository(CorrectiveActionTemplate);

  const service = new StandardsSeedService(
    standardRepo,
    correctiveTemplateRepo,
  );

  await service.seedDefaults();

  await ds.destroy();
}

run();
