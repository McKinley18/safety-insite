import { Body, Controller, Delete, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { InspectionService } from '../inspection/inspection.service';
import { validateRasterImage } from '../upload/image-upload.security';
import { StorageService } from './storage.service';
import { UploadEvidenceDto } from './dto/upload-evidence.dto';

@UseGuards(JwtGuard)
@Controller()
export class FilesController {
  constructor(private readonly storage: StorageService, private readonly inspections: InspectionService) {}

  @Post('inspections/:inspectionId/evidence')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1 } }))
  async uploadEvidence(
    @Req() req: any,
    @Param('inspectionId') inspectionId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadEvidenceDto,
  ) {
    const inspection = await this.inspections.findAccessible(req.user, inspectionId, true);
    const validated = validateRasterImage(file);
    return this.storage.store({
      user: req.user, category: 'evidence', parentType: 'inspection', parentId: inspection.id,
      organizationId: inspection.organizationId, ownerUserId: inspection.ownerUserId,
      contentType: validated.mimeType, downloadName: file.originalname, body: file.buffer,
      // Optional. Replaying it returns the object an earlier attempt stored instead of storing the
      // same photo twice. This route is multipart, so the identifier arrives as a form FIELD.
      clientRequestId: body?.clientRequestId || null,
    });
  }

  @Get('files/:id')
  async download(@Req() req: any, @Param('id') id: string, @Res() response: Response) {
    const { object, body } = await this.storage.read(req.user, id);
    response.setHeader('Content-Type', object.contentType);
    response.setHeader('Content-Length', body.length);
    response.setHeader('Content-Disposition', `attachment; filename="${object.downloadName.replace(/"/g, '_')}"`);
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    response.send(body);
  }

  @Delete('files/:id')
  async delete(@Req() req: any, @Param('id') id: string) {
    await this.storage.tombstone(req.user, id);
    return { deleted: true };
  }
}
