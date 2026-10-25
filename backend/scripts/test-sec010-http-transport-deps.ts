/**
 * SECURITY_REMEDIATION_010 — the HTTP transport dependencies resolve to patched versions, and the
 * behaviour the application relies on (multipart upload, size/count limits, JSON bodies) still holds.
 *
 * Mirrors the production upload configuration in src/storage/files.controller.ts
 * (FileInterceptor + memoryStorage + a file-count limit). Needs no database and no network.
 *
 * Patched minimums: multer 2.5.0 (GHSA-q7qp-rjg7-q26m), body-parser 1.20.9 (GHSA-27r3-jxmh-p828),
 * follow-redirects 1.16.1 (GHSA-q3jh-wrc6-jgq8, GHSA-8r9p-f939-6h3c).
 */
import 'reflect-metadata';
import * as assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Body, Controller, Module, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

const MINIMUMS: Record<string, string> = {
  multer: '2.5.0',
  'body-parser': '1.20.9',
  'follow-redirects': '1.16.1',
  express: '4.22.3',
};

function installedVersion(name: string): string {
  return JSON.parse(readFileSync(join(__dirname, '..', 'node_modules', name, 'package.json'), 'utf8')).version;
}
function atLeast(actual: string, minimum: string): boolean {
  const a = actual.split('.').map(Number);
  const m = minimum.split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    if (a[i] !== m[i]) return a[i] > m[i];
  }
  return true;
}

@Controller('t')
class TransportProbeController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 1024, files: 1 } }))
  upload(@UploadedFile() file: Express.Multer.File) {
    return { size: file.size, name: file.originalname };
  }

  @Post('json')
  json(@Body() body: { a: number }) {
    return { a: body.a };
  }
}

@Module({ controllers: [TransportProbeController] })
class ProbeModule {}

async function main() {
  for (const [name, minimum] of Object.entries(MINIMUMS)) {
    const actual = installedVersion(name);
    assert.ok(atLeast(actual, minimum), `${name} ${actual} is below the patched minimum ${minimum}`);
  }

  const app = await NestFactory.create(ProbeModule, { logger: false });
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');
  try {
    const form = (bytes: number, field = 'file') => {
      const f = new FormData();
      f.append(field, new Blob([Buffer.alloc(bytes, 7)]), 'a.bin');
      return f;
    };

    const ok = await fetch(`${base}/t/upload`, { method: 'POST', body: form(512) });
    assert.equal(ok.status, 201, 'a within-limit upload is accepted');
    assert.deepEqual(await ok.json(), { size: 512, name: 'a.bin' }, 'the uploaded bytes arrive intact');

    const big = await fetch(`${base}/t/upload`, { method: 'POST', body: form(4096) });
    assert.equal(big.status, 413, 'an over-limit upload is refused with 413');

    const two = new FormData();
    two.append('file', new Blob([Buffer.alloc(10)]), 'a.bin');
    two.append('file', new Blob([Buffer.alloc(10)]), 'b.bin');
    const many = await fetch(`${base}/t/upload`, { method: 'POST', body: two });
    assert.ok(many.status >= 400 && many.status < 500, `a second file is refused (got ${many.status})`);

    const json = await fetch(`${base}/t/json`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ a: 1 }),
    });
    assert.deepEqual(await json.json(), { a: 1 }, 'JSON bodies still parse');

    const bad = await fetch(`${base}/t/json`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"a":',
    });
    assert.equal(bad.status, 400, 'malformed JSON is a 400, not a 500');
  } finally {
    await app.close();
  }
  console.log('PASS: SEC-010 HTTP transport dependencies are at patched versions and upload/JSON behaviour is intact');
}

main().catch((error) => {
  console.error('FAIL:', error);
  process.exit(1);
});
