import 'dotenv/config';
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  GetBucketAclCommand,
  HeadBucketCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { S3PrivateStorageProvider } from '../src/storage/storage-provider';

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function client(accessKeyId = required('STORAGE_S3_ACCESS_KEY_ID'), bucket = required('STORAGE_S3_BUCKET')) {
  return {
    bucket,
    instance: new S3Client({
      region: process.env.STORAGE_S3_REGION || 'us-east-1',
      endpoint: required('STORAGE_S3_ENDPOINT'),
      forcePathStyle: process.env.STORAGE_S3_FORCE_PATH_STYLE === 'true',
      credentials: {
        accessKeyId,
        secretAccessKey: required('STORAGE_S3_SECRET_ACCESS_KEY'),
      },
      maxAttempts: 2,
    }),
  };
}

async function main() {
  const configured = client();
  try {
    await configured.instance.send(new HeadBucketCommand({ Bucket: configured.bucket }));
  } catch {
    await configured.instance.send(new CreateBucketCommand({ Bucket: configured.bucket }));
  }
  await configured.instance.send(new GetBucketAclCommand({ Bucket: configured.bucket }));

  const provider = new S3PrivateStorageProvider();
  const key = `evidence/phase6/${randomUUID()}`;
  const body = Buffer.from('phase6-private-s3-round-trip');
  await provider.put(key, body, 'image/jpeg');
  const retrieved = await provider.get(key);
  if (!retrieved.equals(body)) throw new Error('S3 round trip changed object bytes.');

  const endpoint = required('STORAGE_S3_ENDPOINT').replace(/\/+$/, '');
  const direct = await fetch(`${endpoint}/${configured.bucket}/${key}`);
  if (![401, 403].includes(direct.status)) {
    throw new Error(`Direct unauthenticated object access returned ${direct.status}.`);
  }

  const originalAccessKey = process.env.STORAGE_S3_ACCESS_KEY_ID;
  process.env.STORAGE_S3_ACCESS_KEY_ID = 'invalid-phase6-credential';
  let invalidCredentialsRejected = false;
  try {
    await new S3PrivateStorageProvider().get(key);
  } catch {
    invalidCredentialsRejected = true;
  } finally {
    process.env.STORAGE_S3_ACCESS_KEY_ID = originalAccessKey;
  }
  if (!invalidCredentialsRejected) throw new Error('Invalid S3 credentials were accepted.');

  const originalBucket = process.env.STORAGE_S3_BUCKET;
  process.env.STORAGE_S3_BUCKET = `missing-${randomUUID()}`;
  let missingBucketRejected = false;
  try {
    await new S3PrivateStorageProvider().get(key);
  } catch {
    missingBucketRejected = true;
  } finally {
    process.env.STORAGE_S3_BUCKET = originalBucket;
  }
  if (!missingBucketRejected) throw new Error('Missing S3 bucket was accepted.');

  await provider.delete(key);
  let notFoundAfterDelete = false;
  try {
    await provider.get(key);
  } catch {
    notFoundAfterDelete = true;
  }
  if (!notFoundAfterDelete) throw new Error('Deleted S3 object remained readable.');

  console.log(JSON.stringify({
    passed: true,
    scenarios: 6,
    endpointProtocol: new URL(endpoint).protocol,
    privateDirectAccessStatus: direct.status,
    invalidCredentialsRejected,
    missingBucketRejected,
    deleteVerified: true,
  }));

  if (process.env.STORAGE_S3_DELETE_TEST_BUCKET === 'true') {
    await configured.instance.send(new DeleteBucketCommand({ Bucket: configured.bucket }));
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
