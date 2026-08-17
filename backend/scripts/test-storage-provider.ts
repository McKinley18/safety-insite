import { mkdtemp, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { LocalTestStorageProvider } from '../src/storage/storage-provider';

async function main() {
  const root = await mkdtemp(join(tmpdir(), 'safety-insite-storage-'));
  process.env.NODE_ENV = 'test';
  const provider = new LocalTestStorageProvider(root);
  const body = Buffer.from('private-object-test');
  await provider.put('evidence/2026-07-27/test-object', body);
  if (!(await provider.get('evidence/2026-07-27/test-object')).equals(body)) throw new Error('Round trip failed.');
  let traversalRejected = false;
  try { await provider.put('../escape', body); } catch { traversalRejected = true; }
  if (!traversalRejected) throw new Error('Path traversal was not rejected.');
  await provider.delete('evidence/2026-07-27/test-object');
  let deleted = false;
  try { await readFile(join(root, 'evidence/2026-07-27/test-object')); } catch { deleted = true; }
  if (!deleted) throw new Error('Object deletion failed.');
  process.env.NODE_ENV = 'production';
  let productionRejected = false;
  try { new LocalTestStorageProvider(root); } catch { productionRejected = true; }
  if (!productionRejected) throw new Error('Local provider was accepted in production.');
  console.log(JSON.stringify({ passed: true, scenarios: 4, traversalRejected, productionRejected }));
}
main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
