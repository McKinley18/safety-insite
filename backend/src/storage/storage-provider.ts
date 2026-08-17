import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createHash } from 'crypto';
import { mkdir, readFile, unlink, writeFile } from 'fs/promises';
import { dirname, resolve, sep } from 'path';

export interface PrivateStorageProvider {
  readonly mode: 's3' | 'local_test';
  put(key: string, body: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}

export class LocalTestStorageProvider implements PrivateStorageProvider {
  readonly mode = 'local_test' as const;
  private readonly root: string;

  constructor(root: string) {
    if (process.env.NODE_ENV === 'production') throw new Error('Local test object storage is forbidden in production.');
    if (!root) throw new Error('STORAGE_LOCAL_ROOT is required for local test storage.');
    this.root = resolve(root);
  }

  private pathFor(key: string) {
    const target = resolve(this.root, key);
    if (!target.startsWith(`${this.root}${sep}`)) throw new Error('Invalid storage key.');
    return target;
  }

  async put(key: string, body: Buffer): Promise<void> {
    const target = this.pathFor(key);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, body, { flag: 'wx' });
  }
  get(key: string) { return readFile(this.pathFor(key)); }
  async delete(key: string): Promise<void> {
    await unlink(this.pathFor(key)).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
}

export class S3PrivateStorageProvider implements PrivateStorageProvider {
  readonly mode = 's3' as const;
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    this.bucket = process.env.STORAGE_S3_BUCKET || '';
    if (!this.bucket) throw new Error('STORAGE_S3_BUCKET is required.');
    this.client = new S3Client({
      region: process.env.STORAGE_S3_REGION || 'us-east-1',
      endpoint: process.env.STORAGE_S3_ENDPOINT || undefined,
      forcePathStyle: process.env.STORAGE_S3_FORCE_PATH_STYLE === 'true',
      maxAttempts: Math.max(1, Number(process.env.STORAGE_S3_MAX_ATTEMPTS || 3)),
      credentials: process.env.STORAGE_S3_ACCESS_KEY_ID ? {
        accessKeyId: process.env.STORAGE_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.STORAGE_S3_SECRET_ACCESS_KEY || '',
      } : undefined,
    });
  }
  async put(key: string, body: Buffer, contentType: string) {
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket, Key: key, Body: body, ContentType: contentType,
      ChecksumSHA256: createHash('sha256').update(body).digest('base64'),
    }));
  }
  async get(key: string) {
    const result = await this.client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }));
    if (!result.Body) throw new Error('Stored object has no body.');
    return Buffer.from(await result.Body.transformToByteArray());
  }
  async delete(key: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
