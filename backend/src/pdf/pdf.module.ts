import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';

/**
 * §307 — THE RETIRED LEGACY PDF ROUTE, AND NOTHING BEHIND IT.
 *
 * `PdfController` has answered `410 Gone` unconditionally since legacy PDF generation was retired;
 * the report a customer receives is produced by `reports/pdf/pdf.service.ts` (pdfkit) through
 * `ExecutiveController`. The Puppeteer-backed `PdfService` this module used to provide was
 * therefore unreachable code — and it was the only importer of `puppeteer` anywhere in the
 * application, which made Chromium and its extraction toolchain part of the shipped production
 * artifact for a route that runs no code.
 *
 * That subtree carried four HIGH advisories with no forward fix available, rooted in
 * `extract-zip`'s unvalidated-symlink path traversal (GHSA-jmr9-qjv8-65gv, GHSA-7pqw-9j4j-h8q3)
 * reached through `@puppeteer/browsers`. §307's dependency policy refuses a HIGH production
 * finding whose applicability cannot be excluded — and an exception argued from "the route throws"
 * would have been a claim about reachability rather than a control. Deleting the dead provider
 * removes the dependency instead, so there is nothing left to argue about.
 *
 * The route's behaviour is unchanged: the controller still exists, still carries the same guards,
 * and still answers 410 with the same sentence.
 */
@Module({
  controllers: [PdfController],
})
export class PdfModule {}
