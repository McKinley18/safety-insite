import * as assert from 'node:assert/strict';
import { validateRasterImage } from '../src/upload/image-upload.security';

function file(name: string, type: string, bytes: number[]): Express.Multer.File {
  return { originalname: name, mimetype: type, buffer: Buffer.from(bytes) } as Express.Multer.File;
}
function rejected(input: Express.Multer.File) {
  assert.throws(() => validateRasterImage(input));
}

assert.equal(validateRasterImage(file('logo.jpg', 'image/jpeg', [0xff, 0xd8, 0xff, 0x00])).extension, '.jpg');
assert.equal(validateRasterImage(file('logo.png', 'image/png', [137, 80, 78, 71, 13, 10, 26, 10])).extension, '.png');
rejected(file('spoof.png', 'image/png', [0xff, 0xd8, 0xff]));
rejected(file('renamed.png', 'image/png', [...Buffer.from('<svg><script>alert(1)</script></svg>')]));
rejected(file('active.jpg', 'image/jpeg', [...Buffer.from('<html><script>alert(1)</script>')]));
rejected(file('../escape.svg', 'image/svg+xml', [...Buffer.from('<svg/>')]));
rejected(file('unsupported.gif', 'image/gif', [71, 73, 70]));
rejected(file('empty.png', 'image/png', []));
console.log('PASS: raster upload signature, MIME, extension, active-content, traversal, and empty-file checks');
