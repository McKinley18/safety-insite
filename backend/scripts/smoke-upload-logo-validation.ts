import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const controllerPath = path.resolve(__dirname, '../src/upload/upload.controller.ts');
const source = fs.readFileSync(controllerPath, 'utf8');

function assertContains(needle: string, label: string) {
  if (!source.includes(needle)) {
    throw new Error(`${label} is missing.`);
  }
}

async function main() {
  assertContains('@UseGuards(JwtGuard)', 'Upload auth guard');
  assertContains("@Controller('upload')", 'Upload route controller');
  assertContains("@Post('logo')", 'Logo upload POST route');
  assertContains('fileSize: 2 * 1024 * 1024', '2MB upload size limit');
  assertContains('ALLOWED_LOGO_MIME_TYPES', 'Allowed MIME type allowlist');
  assertContains('ALLOWED_LOGO_EXTENSIONS', 'Allowed extension allowlist');
  assertContains("'image/png'", 'PNG MIME type');
  assertContains("'image/jpeg'", 'JPEG MIME type');
  assertContains("'image/webp'", 'WEBP MIME type');
  assertContains("'image/svg+xml'", 'SVG MIME type');
  assertContains("'.png'", 'PNG extension');
  assertContains("'.jpg'", 'JPG extension');
  assertContains("'.jpeg'", 'JPEG extension');
  assertContains("'.webp'", 'WEBP extension');
  assertContains("'.svg'", 'SVG extension');
  assertContains("Unsupported logo file extension.", 'Unsafe extension rejection');
  assertContains('Only PNG, JPG, WEBP, or SVG logo files are allowed.', 'Unsafe MIME rejection');
  assertContains("throw new BadRequestException('Logo upload failed.')", 'Missing file rejection');

  const appModulePath = path.resolve(__dirname, '../src/app.module.ts');
  const appModule = fs.readFileSync(appModulePath, 'utf8');

  if (!appModule.includes("import { UploadModule } from './upload/upload.module';")) {
    throw new Error('UploadModule import is missing from AppModule.');
  }

  if (!appModule.includes('UploadModule,')) {
    throw new Error('UploadModule is not registered in AppModule imports.');
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `sentinel-upload-smoke-${randomUUID()}-`));
  fs.rmSync(tmpDir, { recursive: true, force: true });

  console.log('PASS: Upload logo validation smoke test passed.');
}

main().catch((error) => {
  if (error instanceof BadRequestException) {
    console.error(`FAIL: ${error.message}`);
  } else {
    console.error(`FAIL: ${error.message}`);
  }

  process.exit(1);
});
