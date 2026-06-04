import { Injectable } from "@nestjs/common";
import { ExecutiveService } from "../executive/executive.service";
const PDFDocument = require('pdfkit');
const path = require('path');

@Injectable()
export class PdfService {
  constructor(private readonly executiveService: ExecutiveService) {}

  async generateExecutivePdf(data: any): Promise<Buffer> {
    const intel = await this.executiveService.generateExecutiveSummary(data.id);

    const doc = new PDFDocument({ margin: 50 });

    const renderSection = (doc: any, title: string, body: string) => {
  doc.fontSize(12).fillColor("#1f4e79").text(title);

  doc.moveDown(0.3);

  doc
    .fontSize(11)
    .fillColor("#000000")
    .text(body || "", {
      width: 500,
      align: "left",
    });

  doc.moveDown(1);
};

    const buffers: any[] = [];

    doc.on('data', buffers.push.bind(buffers));

    const logoPath = path.join(process.cwd(), 'src/assets/logo.png');

    // ===== HEADER =====
    try {
    // outline (draw slightly larger behind)
    doc.image(logoPath, 49, 44, { width: 37 });

    // main logo
    doc.image(logoPath, 50, 45, { width: 35 });
    } catch (e) {
      console.warn('Logo not found');
    }

    doc
      .fontSize(20)
      .fillColor('#1f4e79')
      .text('Sentinel Safety', 95, 60);

    doc
      .fontSize(10)
      .fillColor('#666666')
      .text('See Risk. Prevent Harm.', 95, 80);

    doc
      .strokeColor('#cccccc')
      .lineWidth(1)
      .moveTo(50, 90)
      .lineTo(550, 90)
      .stroke();

    doc.x = 50;
    doc.y = 100;


const section = (title: string, body: string) => {
      doc
        .fontSize(12)
        .fillColor('#1f4e79')
        .text(title);

      doc.moveDown(0.3);

      doc
        .fontSize(11)
        .fillColor('#000000')
        .text(body || '');

      doc.moveDown(1);
    };


    renderSection(doc, 'Overview', intel.overview);
    renderSection(doc, 'Risk Evaluation', intel.riskEvaluation);
    renderSection(doc, "Top Risk Priorities", intel.riskPriorities);
    renderSection(doc, "Immediate Actions Required", intel.immediateAction);
    renderSection(doc, "Priority Actions", intel.prioritizedActions);

    renderSection(doc, 'Standards', intel.standards);
    renderSection(doc, 'Corrective Actions', intel.correctiveActions);
    renderSection(doc, 'Compliance Note', intel.complianceNote);

    doc.end();

    return await new Promise((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
    });
  }
}
