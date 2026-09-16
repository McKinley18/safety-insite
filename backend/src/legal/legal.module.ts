import { Global, Module } from '@nestjs/common';

import { LegalController } from './legal.controller';
import { LegalPublicationService } from './legal-publication.service';

/**
 * §308 (LG-3) — THE LEGAL PUBLICATION MODULE.
 *
 * GLOBAL, because the agreements module needs `LegalPublicationService` to derive which documents
 * registration must bind to, and a legal-publication dependency is the kind of thing that should
 * have exactly one instance: two copies would resolve the registry twice and could, in principle,
 * disagree about what is in force.
 */
@Global()
@Module({
  controllers: [LegalController],
  providers: [LegalPublicationService],
  exports: [LegalPublicationService],
})
export class LegalModule {}
