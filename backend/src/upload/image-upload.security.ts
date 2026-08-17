import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

const MIME_BY_EXTENSION: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

export function validateRasterImage(file: Express.Multer.File): { extension: string; mimeType: string } {
  const extension = extname(file?.originalname || '').toLowerCase();
  const mimeType = MIME_BY_EXTENSION[extension];
  if (!file?.buffer?.length) throw new BadRequestException('Image file is empty.');
  if (!mimeType || file.mimetype !== mimeType) {
    throw new BadRequestException('Only PNG, JPG, or WEBP image files are allowed.');
  }
  const bytes = file.buffer;
  const png = bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const jpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const webp = bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  const valid = extension === '.png' ? png : extension === '.webp' ? webp : jpeg;
  if (!valid) throw new BadRequestException('File content does not match its image type.');
  return { extension: extension === '.jpeg' ? '.jpg' : extension, mimeType };
}
