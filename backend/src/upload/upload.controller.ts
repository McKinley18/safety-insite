import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EntitlementGuard, RequireEntitlement } from '../auth/entitlements/entitlement.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { validateRasterImage } from './image-upload.security';
import { StorageService } from '../storage/storage.service';
import { isOrganizationManager, requireAuthenticatedUser } from '../common/authenticated-user';

const ALLOWED_LOGO_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
]);

const ALLOWED_LOGO_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
]);

export function validateLogoFile(file: Express.Multer.File): string {
  return validateRasterImage(file).extension;
}

@UseGuards(JwtGuard, EntitlementGuard)
@RequireEntitlement('teamMembers')
@Controller('upload')
export class UploadController {
  constructor(private readonly storage: StorageService) {}

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
          cb(new BadRequestException('Only PNG, JPG, or WEBP logo files are allowed.'), false);
          return;
        }

        cb(null, true);
      },
      storage: memoryStorage(),
    }),
  )
  async uploadLogo(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Logo upload failed.');
    const user = requireAuthenticatedUser(req.user);
    if (!user.organizationId || !isOrganizationManager(user)) {
      throw new ForbiddenException('Organization manager access is required.');
    }
    validateLogoFile(file);
    const object = await this.storage.store({
      user, category: 'branding', parentType: 'organization', parentId: user.organizationId,
      organizationId: user.organizationId, ownerUserId: null, contentType: file.mimetype,
      downloadName: file.originalname, body: file.buffer,
    });
    return { objectId: object.id, downloadPath: `/files/${object.id}` };
  }
}
