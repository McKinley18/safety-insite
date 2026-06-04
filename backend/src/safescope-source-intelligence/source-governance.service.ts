import { Injectable } from '@nestjs/common';

@Injectable()
export class SourceGovernanceService {
  getGovernanceRules() {
    return [
      "No unreviewed source ingestion.",
      "No source intelligence overriding standards.",
      "No duplicate URLs.",
      "No missing evidence.",
      "Preview before database write.",
      "All changes must be auditable."
    ];
  }
}
