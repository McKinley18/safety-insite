export type MshaFatalityDiscoveryItem = {
  externalId: string;
  title: string;
  sourceUrl: string;
  publishedAt?: string | null;
  summary: string;
  rawText: string;
  hazardTags: string[];
  equipmentTags: string[];
  taskTags: string[];
  lessonTags: string[];
};

export class MshaFatalityConnector {
  /**
   * Phase 1 connector scaffold.
   *
   * This intentionally does not scrape uncontrolled web pages yet.
   * It gives SafeScope a governed ingestion shape:
   * discover -> pending_review document -> human approval -> offline bundle.
   */
  async discover(): Promise<MshaFatalityDiscoveryItem[]> {
    return [
      {
        externalId: 'msha-starter-conveyor-fatality-learning',
        title: 'MSHA Fatality Learning Pattern: Conveyor Contact and Entanglement',
        sourceUrl: 'https://www.msha.gov/data-and-reports/fatality-reports/search',
        publishedAt: null,
        summary:
          'Fatality and serious injury patterns involving conveyors often include exposed moving parts, cleanup or maintenance near energized equipment, inadequate guarding, and failure to control hazardous energy.',
        rawText:
          'MSHA fatality learning patterns involving conveyors commonly include miners working near belts, pulleys, rollers, tail pieces, take-up areas, and other moving machine parts. SafeScope should treat accessible moving conveyor components as serious contact, entanglement, pinch-point, or caught-in hazards. Important review questions include whether the component was guarded, whether cleanup or maintenance was occurring, whether the equipment was energized, whether lockout/tagout or blocking was required, whether access to the area was controlled, and whether workplace examinations identified the condition. Recommended controls include guarding exposed moving parts, restricting access until corrected, de-energizing and locking/tagging before maintenance or cleanup, verifying guarding after correction, and documenting closure with photos and supervisor review.',
        hazardTags: [
          'machine guarding',
          'conveyor',
          'entanglement',
          'pinch point',
          'caught in',
        ],
        equipmentTags: [
          'conveyor',
          'belt',
          'tail pulley',
          'roller',
          'take up',
        ],
        taskTags: [
          'maintenance',
          'cleanup',
          'inspection',
          'normal operation',
        ],
        lessonTags: [
          'fatality learning',
          'unguarded moving parts',
          'hazardous energy',
          'access control',
        ],
      },
    ];
  }
}
