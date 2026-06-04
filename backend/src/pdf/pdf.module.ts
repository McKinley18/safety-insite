import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PdfController } from './pdf.controller';

import { OrganizationsModule } from '../organizations/organizations.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [
    OrganizationsModule,
    ReportsModule, // 🔥 THIS FIXES YOUR ERROR
  ],
  providers: [PdfService],
  controllers: [PdfController],
})
export class PdfModule {}
