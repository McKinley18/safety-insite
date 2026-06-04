import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class PdfService {
  constructor(private orgService: OrganizationsService) {}

  async generate(report: any): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const logo = await this.loadLogo(report.organizationId);
    const html = this.buildHtml(report, logo);

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();
    return Buffer.from(pdf);
  }

  private async loadLogo(orgId: string): Promise<string> {
    const org = await this.orgService.findOne(orgId);

    if (!org?.logoPath) return '';

    const fullPath = `.${org.logoPath}`;

    if (fs.existsSync(fullPath)) {
      const file = fs.readFileSync(fullPath);
      return `data:image/png;base64,${file.toString('base64')}`;
    }

    return '';
  }

  private buildHtml(data: any, logo: string): string {
    const findings = data.findings || [];

    const findingsHtml = findings
      .map((f: any, i: number) => {
        const risk = f.severity * f.likelihood;

        return `
          <div style="margin-bottom:20px;padding:16px;border-left:5px solid #ccc;">
            <h3>Finding ${i + 1}</h3>
            <div><strong>Hazard:</strong> ${f.hazard}</div>
            <div><strong>Risk:</strong> ${risk}</div>
            <div><strong>Action:</strong> ${f.action}</div>
          </div>
        `;
      })
      .join('');

    return `
      <html>
        <body style="font-family:Arial;margin:0">

          <div style="height:1122px;display:flex;flex-direction:column;align-items:center;padding-top:240px;text-align:center">
            ${logo ? `<img src="${logo}" style="height:60px;margin-bottom:20px"/>` : ''}
            <h1>Inspection Report</h1>
            <p>${data.site}</p>
            <p>${data.inspector}</p>
          </div>

          <div style="page-break-before:always;"></div>

          <div style="padding:40px">
            <h2>Findings</h2>
            ${findingsHtml}
          </div>

        </body>
      </html>
    `;
  }
}
