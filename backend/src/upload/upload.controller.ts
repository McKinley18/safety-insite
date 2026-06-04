import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

const ALLOWED_LOGO_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
]);

const ALLOWED_LOGO_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg',
]);

function safeLogoFilename(originalName: string) {
  const ext = extname(originalName || '').toLowerCase();

  if (!ALLOWED_LOGO_EXTENSIONS.has(ext)) {
    throw new BadRequestException('Unsupported logo file extension.');
  }

  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `logo-${unique}${ext}`;
}

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('teamMembers')
@Controller('upload')
export class UploadController {
  @Post('logo')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1,
      },
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname || '').toLowerCase();

        if (
          !ALLOWED_LOGO_MIME_TYPES.has(file.mimetype) ||
          !ALLOWED_LOGO_EXTENSIONS.has(ext)
        ) {
          cb(new BadRequestException('Only PNG, JPG, WEBP, or SVG logo files are allowed.'), false);
          return;
        }

        cb(null, true);
      },
      storage: diskStorage({
        destination: './uploads/logos',
        filename: (_req: Express.Request, file: any, cb: (error: Error | null, filename: string) => void) => {
          try {
            cb(null, safeLogoFilename(file.originalname));
          } catch (error) {
            cb(error as Error, '');
          }
        },
      }),
    }),
  )
  uploadLogo(@UploadedFile() file: any) {
    if (!file?.filename) {
      throw new BadRequestException('Logo upload failed.');
    }

    return {
      path: `/uploads/logos/${file.filename}`,
    };
  }
}
