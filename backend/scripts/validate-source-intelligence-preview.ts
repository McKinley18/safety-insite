import { SourceIngestionService } from '../src/safescope-source-intelligence/source-ingestion.service';
import * as fs from 'fs';
import * as path from 'path';

const previewPath = path.join(process.cwd(), '..', 'SAFE_SCOPE_SOURCE_INTELLIGENCE_INGESTION_PREVIEW.json');
const preview = JSON.parse(fs.readFileSync(previewPath, 'utf8'));

const service = new SourceIngestionService();
const result = service.validateIngestionPreview(preview);

console.log(JSON.stringify(result, null, 2));
process.exit(result.valid ? 0 : 1);
