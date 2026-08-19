import PDFDocument = require('pdfkit');

// Professional inspection-report PDF renderer (InSite Production Polish Phase 2).
// Renders directly from an immutable report snapshot (see CanonicalReportsService.snapshotInspection) —
// no risk/classification recalculation happens here; every value shown is read verbatim from the
// persisted snapshot. Internal orchestrator fields (mechanism chains, evidence-fact arrays,
// resultStage/mayFinalize flags, confidence/debug metadata) are intentionally never read by this file.

const INK = '#0F172A';
const MUTED = '#475569';
const FAINT = '#94A3B8';
const RULE = '#E2E8F0';
const PAPER_PANEL = '#F8FAFC';

const RISK_COLOR: Record<string, string> = {
  Critical: '#B91C1C',
  High: '#C2410C',
  Moderate: '#B45309',
  Low: '#15803D',
};

const PAGE = { size: 'LETTER' as const, margins: { top: 56, bottom: 56, left: 56, right: 56 } };
const CONTENT_WIDTH = 612 - PAGE.margins.left - PAGE.margins.right;

type Snapshot = Record<string, any>;

function fmtDate(value: any): string {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fmtDateShort(value: any): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function titleCase(value: string): string {
  return String(value || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function shortRef(id: string): string {
  return String(id || '').slice(0, 8).toUpperCase();
}

/**
 * The guided-review UI's reviewer-confirmed risk override (inspection-workspace's
 * "Confirm risk and finalize finding" flow) persists the chosen band under
 * riskSnapshot.overallRisk, not riskSnapshot.riskBand -- only the earlier,
 * system-generated snapshot (computeFindingRisk) uses riskBand. Without this fallback,
 * every finding whose risk was reviewer-confirmed through the primary workflow renders
 * as "Not rated" here, silently dropping it from the Critical/High counts and Risk
 * Distribution even though a qualified person recorded a real band.
 */
function findingRiskBand(riskSnapshot: Snapshot | null | undefined): string | undefined {
  const band = riskSnapshot?.riskBand || riskSnapshot?.overallRisk;
  return band && band !== 'Not established' ? band : undefined;
}

/**
 * Honest, never-fabricated standard summary for a finding, drawn only from what HazLenz
 * actually produced. executiveJudgment.topStandard is the single most-defensible citation
 * for the WHOLE observation/analysis, not per-hazard -- HazLenz's decomposition schema
 * (multiHazardDecomposition.hazards[]) carries no per-hazard citation at all. Attributing
 * it directly to a finding is only honest when the analysis backs exactly one finding; once
 * an observation decomposes into multiple hazards, stamping every one of them with the same
 * observation-level citation misrepresents it as finding-specific when it may only actually
 * apply to whichever single hazard was dominant. Omit it for the decomposed case rather than
 * fabricate a per-finding match the underlying data doesn't support.
 */
/**
 * Inspection-level regulatory context as recorded on the inspection. Only a user-set value
 * exists at inspection level; 'unknown' (or a legacy inspection created before the field
 * existed) is reported honestly, never displayed as an implied regime.
 *
 * Split into a short regime label (fits a single line in a summary panel) and the longer
 * provenance sentence, so the same honest wording can be laid out on two typographic levels
 * instead of one overlong table cell.
 */
function regulatoryContextLabel(value: unknown): string {
  const { regime, basis } = regulatoryContextParts(value);
  return `${regime} - ${basis}`;
}

function regulatoryContextParts(value: unknown): { regime: string; basis: string } {
  switch (String(value || 'unknown')) {
    case 'osha-general-industry':
      return { regime: 'OSHA - General Industry (29 CFR 1910)', basis: 'set for this inspection' };
    case 'osha-construction':
      return { regime: 'OSHA - Construction (29 CFR 1926)', basis: 'set for this inspection' };
    case 'msha':
      return { regime: 'MSHA (30 CFR)', basis: 'set for this inspection' };
    default:
      return {
        regime: 'Not established',
        basis: 'HazLenz evaluated standards as conditional candidates unless the observation itself established the governing agency',
      };
  }
}

function extractStandard(finding: Snapshot, analyses: Snapshot[], isDecomposedObservation: boolean): { citation: string; heading: string; text: string } | null {
  // A decomposed (multi-hazard) observation's analysis-level executiveJudgment/
  // standardsReasoning is scoped to the whole observation's primary classification,
  // not to any one finding -- showing it under every finding would stamp the SAME
  // standard across findings it does not belong to (or belongs to only one of
  // them). Each decomposed finding's own candidate standards, computed
  // independently from that finding's own evidence (Phase 5 finding-scoped
  // standards fix), live on finding.sourceCandidate.standardCandidates and are
  // the only standards data this function trusts for a decomposed finding.
  if (isDecomposedObservation) {
    const candidates: Snapshot[] = Array.isArray(finding.sourceCandidate?.standardCandidates)
      ? finding.sourceCandidate.standardCandidates
      : [];
    const direct = candidates.find((candidate) => candidate?.applicability === 'direct') ||
      candidates.find((candidate) => candidate?.applicability === 'candidate');
    if (!direct?.citation) return null;
    // A match evaluated under a HazLenz-INFERRED regime is real, evidence-based, but must
    // never read as if the user had confirmed the regime; the decision's own explanation
    // already says so, and this prefix makes it unmistakable at report level.
    const inferredPrefix = direct.jurisdictionProvenance === 'HAZLENZ_INFERRED'
      ? 'Jurisdiction inferred by HazLenz from the observation wording (not user-confirmed). '
      : '';
    // Corpus-backed path: when standards_master has a row for this citation the finding carries
    // its official title and plain-language summary (hydrated at analysis time); otherwise the
    // rule family and decision explanation are shown, which the UI/PDF label as HazLenz text.
    const summary = direct.plainLanguageSummary
      ? `${direct.plainLanguageSummary} HazLenz basis: ${direct.explanation || ''}`.trim()
      : (direct.explanation || '');
    return {
      citation: direct.citation,
      heading: direct.title || direct.family || '',
      text: direct.applicability === 'candidate'
        ? `Candidate only, qualified review required: ${inferredPrefix}${summary}`.trim()
        : `${inferredPrefix}${summary}`.trim(),
    };
  }
  const analysis = analyses.find((a) => a.id === finding.originatingAnalysisId) || analyses[0];
  const snap = analysis?.resultSnapshot || {};
  const top = snap.executiveJudgment?.topStandard || snap.standardsReasoning?.topDefensible?.[0] || null;
  const citation = top?.citation || snap.primaryCitation || '';
  if (!citation) return null;
  const heading = top?.heading || top?.title || '';
  const text = top?.summary || top?.reasoning || '';
  return { citation, heading, text };
}

function contentBottom(doc: PDFKit.PDFDocument): number {
  return doc.page.height - doc.page.margins.bottom;
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y + needed > contentBottom(doc)) {
    doc.addPage();
  }
}

function hr(doc: PDFKit.PDFDocument, y?: number) {
  const drawY = y ?? doc.y;
  doc.save().strokeColor(RULE).lineWidth(0.75)
    .moveTo(PAGE.margins.left, drawY).lineTo(612 - PAGE.margins.right, drawY).stroke().restore();
}

function sectionHeading(doc: PDFKit.PDFDocument, text: string) {
  ensureSpace(doc, 44);
  doc.font('Helvetica-Bold').fontSize(16).fillColor(INK).text(text, { width: CONTENT_WIDTH });
  doc.moveDown(0.15);
  hr(doc);
  doc.moveDown(0.6);
}

function body(doc: PDFKit.PDFDocument, text: string, opts: { color?: string; size?: number } = {}) {
  doc.font('Helvetica').fontSize(opts.size ?? 10).fillColor(opts.color ?? INK).text(text, { width: CONTENT_WIDTH, lineGap: 2 });
}

/** Simple grid table: header row + body rows, manual column layout (pdfkit has no built-in table). */
function simpleTable(
  doc: PDFKit.PDFDocument,
  columns: { header: string; width: number; align?: 'left' | 'right' | 'center' }[],
  rows: string[][],
) {
  const rowPad = 6;
  const startX = PAGE.margins.left;

  const drawHeader = () => {
    ensureSpace(doc, 24);
    const y = doc.y;
    doc.save().rect(startX, y, CONTENT_WIDTH, 20).fill(PAPER_PANEL).restore();
    let x = startX;
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(INK);
    for (const col of columns) {
      doc.text(col.header.toUpperCase(), x + 6, y + 6, { width: col.width - 10, align: col.align || 'left' });
      x += col.width;
    }
    doc.x = startX;
    doc.y = y + 20;
    hr(doc, doc.y);
    doc.y += 2;
  };

  drawHeader();

  for (const row of rows) {
    doc.font('Helvetica').fontSize(9).fillColor(INK);
    const heights = row.map((cell, i) => doc.heightOfString(cell || '—', { width: columns[i].width - 10 }));
    const rowHeight = Math.max(...heights, 12) + rowPad * 2;

    if (doc.y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      drawHeader();
    }

    const y = doc.y;
    let x = startX;
    for (let i = 0; i < row.length; i++) {
      doc.text(row[i] || '—', x + 6, y + rowPad, { width: columns[i].width - 10, align: columns[i].align || 'left' });
      x += columns[i].width;
    }
    doc.x = startX;
    doc.y = y + rowHeight;
    hr(doc, doc.y);
    doc.y += 2;
  }
  doc.x = startX;
  doc.moveDown(0.5);
}

function coverPage(doc: PDFKit.PDFDocument, snapshot: Snapshot, findingCount: number) {
  // Every cover block is centred inside the content column (not the full sheet) and stacked
  // from its own measured height, so a long site or inspection name wraps within the margins
  // and pushes what follows down instead of running to the paper edge and colliding with it.
  const left = PAGE.margins.left;
  const centred = { width: CONTENT_WIDTH, align: 'center' as const };

  doc.font('Helvetica-Bold').fontSize(10).fillColor('#1D72B8')
    .text('INSITE', left, 130, { ...centred, characterSpacing: 2 });

  doc.font('Helvetica-Bold').fontSize(28).fillColor(INK)
    .text('Inspection Report', left, 150, centred);

  doc.font('Helvetica').fontSize(11).fillColor(MUTED)
    .text('Field Safety Inspection Record', left, 186, centred);

  hr(doc, 220);

  const siteName = snapshot.site?.name || 'Field Inspection';
  doc.font('Helvetica-Bold').fontSize(16);
  const siteH = doc.heightOfString(siteName, centred);
  doc.fillColor(INK).text(siteName, left, 238, centred);

  const inspectionTitle = snapshot.inspection.title || 'Untitled Inspection';
  const titleY = 238 + siteH + 8;
  doc.font('Helvetica').fontSize(11);
  const titleH = doc.heightOfString(inspectionTitle, centred);
  doc.fillColor(MUTED).text(inspectionTitle, left, titleY, centred);

  const details = [
    `Inspection date: ${fmtDate(snapshot.inspection.completedAt)}`,
    `Inspector: ${snapshot.preparedBy?.name || 'Not recorded'}`,
    `Findings documented: ${findingCount}`,
    `Report generated: ${fmtDate(snapshot.capturedAt)}`,
  ];

  let y = titleY + titleH + 26;
  doc.font('Helvetica').fontSize(10).fillColor(MUTED);
  for (const line of details) {
    doc.text(line, left, y, centred);
    y += doc.heightOfString(line, centred) + 6;
  }

  // As in applyHeaderFooter: this line intentionally sits in the bottom margin area, below the
  // normal content boundary (page.height - margins.bottom) — drawing there with the boundary
  // still active would make pdfkit think the text overflows and silently insert a blank page.
  const originalBottomMargin = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;
  doc.font('Helvetica').fontSize(8).fillColor(FAINT)
    .text(`Record reference ${shortRef(snapshot.inspection.id)}`, 0, 740, { width: 612, align: 'center' });
  doc.page.margins.bottom = originalBottomMargin;
}

/** Equal-width summary tile: one figure over one caption, centred in a bordered card. */
function statCard(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, value: string, caption: string) {
  doc.save().roundedRect(x, y, w, h, 4).lineWidth(0.75).fillAndStroke(PAPER_PANEL, RULE).restore();
  const numeric = /^\d+$/.test(value);
  doc.font('Helvetica-Bold').fontSize(numeric ? 24 : 13).fillColor(INK)
    .text(value, x, y + (numeric ? 16 : 24), { width: w, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(7.5).fillColor(MUTED)
    .text(caption.toUpperCase(), x, y + h - 20, { width: w, align: 'center', characterSpacing: 0.6 });
}

/** Bordered panel with a ruled title; body is drawn by the caller inside the returned inset box. */
function panelFrame(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number, title: string) {
  doc.save().roundedRect(x, y, w, h, 4).lineWidth(0.75).fillAndStroke('#FFFFFF', RULE).restore();
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(INK)
    .text(title.toUpperCase(), x + 14, y + 13, { width: w - 28, characterSpacing: 0.6 });
  doc.save().strokeColor(RULE).lineWidth(0.75)
    .moveTo(x + 14, y + 31).lineTo(x + w - 14, y + 31).stroke().restore();
}

/**
 * Executive Summary — the single orienting page of the report.
 *
 * Composed on one symmetric grid so the page reads as a designed page rather than a stack of
 * widgets: four equal tiles across the full content width, then two equal-width, equal-height
 * panels sharing one gutter, then two full-width blocks. Every element starts at the left
 * margin and ends at the right margin, so all four vertical edges align down the page.
 *
 * It also carries the inspection-identity fields that used to occupy a separate "Inspection
 * Information" page. That page repeated the cover (site, inspection, date, inspector) and was
 * removed; the one field it uniquely carried — the inspection's regulatory context, which
 * governs how every standard in this report was selected — is retained here, where it sits
 * next to the findings it qualifies.
 */
function executiveSummary(doc: PDFKit.PDFDocument, snapshot: Snapshot, findings: Snapshot[], correctiveActions: Snapshot[]) {
  doc.addPage();
  sectionHeading(doc, 'Executive Summary');

  const byBand: Record<string, number> = { Critical: 0, High: 0, Moderate: 0, Low: 0 };
  let unrated = 0;
  for (const f of findings) {
    const band = findingRiskBand(f.riskSnapshot);
    if (band && byBand[band] !== undefined) byBand[band]++;
    else unrated++;
  }

  const openActions = correctiveActions.filter((a) => a.statusCode !== 'closed' && a.statusCode !== 'cancelled');
  const left = PAGE.margins.left;

  // Row 1 — four equal tiles, three equal gutters.
  const GUTTER = 12;
  const cardW = (CONTENT_WIDTH - GUTTER * 3) / 4;
  const cardH = 84;
  const cardY = doc.y;
  const cards: [string, string][] = [
    [String(findings.length), 'Findings'],
    [String(byBand.Critical + byBand.High), 'Critical / High'],
    [String(openActions.length), 'Open Actions'],
    [titleCase(snapshot.inspection.status), 'Status'],
  ];
  cards.forEach(([value, caption], i) => {
    statCard(doc, left + i * (cardW + GUTTER), cardY, cardW, cardH, value, caption);
  });
  doc.x = left;
  doc.y = cardY + cardH + 26;

  // Row 2 — two equal panels of identical height, sharing one gutter.
  const PANEL_GUTTER = 20;
  const panelW = (CONTENT_WIDTH - PANEL_GUTTER) / 2;
  const panelH = 240;
  const panelY = doc.y;
  const rightX = left + panelW + PANEL_GUTTER;

  panelFrame(doc, left, panelY, panelW, panelH, 'Risk Distribution');
  const maxCount = Math.max(byBand.Critical, byBand.High, byBand.Moderate, byBand.Low, 1);
  const bandLabelW = 56;
  const countW = 18;
  const barX = left + 14 + bandLabelW;
  const barMaxWidth = panelW - 28 - bandLabelW - countW - 10;
  const bandRowH = 40;
  const bandsTop = panelY + 54;
  (['Critical', 'High', 'Moderate', 'Low'] as const).forEach((bandName, i) => {
    const y = bandsTop + i * bandRowH;
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(MUTED).text(bandName, left + 14, y + 2, { width: bandLabelW });
    doc.save().rect(barX, y, barMaxWidth, 11).fill(PAPER_PANEL).restore();
    const w = Math.max((byBand[bandName] / maxCount) * barMaxWidth, byBand[bandName] > 0 ? 4 : 0);
    if (w > 0) doc.save().rect(barX, y, w, 11).fill(RISK_COLOR[bandName]).restore();
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(INK)
      .text(String(byBand[bandName]), barX + barMaxWidth + 6, y + 2, { width: countW, align: 'right' });
  });
  if (unrated > 0) {
    doc.font('Helvetica').fontSize(7.5).fillColor(FAINT)
      .text(`${unrated} finding(s) have no established risk rating.`, left + 14, panelY + panelH - 22, { width: panelW - 28 });
  }

  panelFrame(doc, rightX, panelY, panelW, panelH, 'Inspection Record');
  const context = regulatoryContextParts(snapshot.inspection.regulatoryContext);
  const record: [string, string][] = [
    ['Site / facility', snapshot.site?.name || 'Not recorded'],
    ['Inspection', snapshot.inspection.title || 'Untitled Inspection'],
    ['Inspection date', fmtDate(snapshot.inspection.completedAt)],
    ['Inspector', snapshot.preparedBy?.name || 'Not recorded'],
    ['Regulatory context', context.regime],
  ];
  // Fixed-height rows with a hairline between them: a long site or inspector name wraps to at
  // most two lines and is then ellipsised, so the panel's height can never be pushed out and
  // the value can never run into the label of the row beneath it.
  const recordRowH = (panelH - 52 - 12) / record.length;
  record.forEach(([key, value], i) => {
    const y = panelY + 50 + i * recordRowH;
    doc.font('Helvetica-Bold').fontSize(7).fillColor(FAINT)
      .text(key.toUpperCase(), rightX + 14, y, { width: panelW - 28, characterSpacing: 0.5 });
    doc.font('Helvetica').fontSize(9).fillColor(INK)
      .text(value, rightX + 14, y + 11, { width: panelW - 28, height: recordRowH - 15, ellipsis: true });
    if (i < record.length - 1) {
      doc.save().strokeColor('#F1F5F9').lineWidth(0.5)
        .moveTo(rightX + 14, y + recordRowH - 5).lineTo(rightX + panelW - 14, y + recordRowH - 5).stroke().restore();
    }
  });

  doc.x = left;
  doc.y = panelY + panelH + 26;

  // Row 3 — full-width assessment narrative, drawn from the snapshot's own counts.
  const assessmentY = doc.y;
  const assessment = assessmentNarrative(findings.length, byBand, unrated, correctiveActions.length, openActions.length);
  doc.font('Helvetica').fontSize(10);
  const assessmentTextH = doc.heightOfString(assessment, { width: CONTENT_WIDTH - 28, lineGap: 2.5 });
  const assessmentH = Math.max(assessmentTextH + 62, 104);
  panelFrame(doc, left, assessmentY, CONTENT_WIDTH, assessmentH, 'Assessment');
  doc.font('Helvetica').fontSize(10).fillColor(INK)
    .text(assessment, left + 14, assessmentY + 44, { width: CONTENT_WIDTH - 28, lineGap: 2.5 });
  doc.x = left;
  doc.y = assessmentY + assessmentH + 26;

  // Row 4 — full-width basis / limitations note. Carries the regulatory-context provenance
  // sentence and the advisory statement that governs every conclusion in this report.
  const basisY = doc.y;
  const basis = `Regulatory context: ${context.regime} — ${context.basis}. `
    + 'HazLenz AI output is advisory and requires qualified human review; this report reflects findings as reviewed at the time of generation.';
  doc.font('Helvetica').fontSize(8.5);
  const basisTextH = doc.heightOfString(basis, { width: CONTENT_WIDTH - 28, lineGap: 2 });
  const basisH = basisTextH + 50;
  panelFrame(doc, left, basisY, CONTENT_WIDTH, basisH, 'Basis and Limitations');
  doc.font('Helvetica').fontSize(8.5).fillColor(MUTED)
    .text(basis, left + 14, basisY + 42, { width: CONTENT_WIDTH - 28, lineGap: 2 });
  doc.x = left;
  doc.y = basisY + basisH;
}

/**
 * Assessment paragraph. Every clause is a count read straight off the snapshot — no severity
 * judgement is introduced here that the reviewed findings do not already carry.
 */
function assessmentNarrative(
  total: number,
  byBand: Record<string, number>,
  unrated: number,
  actionCount: number,
  openCount: number,
): string {
  if (total === 0) {
    return 'No findings were documented for this inspection. The areas reviewed are recorded in the inspection record above.';
  }
  const priority = byBand.Critical + byBand.High;
  const sentences: string[] = [];
  sentences.push(
    `This inspection documented ${total} finding${total === 1 ? '' : 's'}: `
    + [
      byBand.Critical ? `${byBand.Critical} Critical` : null,
      byBand.High ? `${byBand.High} High` : null,
      byBand.Moderate ? `${byBand.Moderate} Moderate` : null,
      byBand.Low ? `${byBand.Low} Low` : null,
      unrated ? `${unrated} not yet rated` : null,
    ].filter(Boolean).join(', ') + '.',
  );
  sentences.push(
    priority > 0
      ? `${priority} finding${priority === 1 ? '' : 's'} rated Critical or High require${priority === 1 ? 's' : ''} prioritized corrective action and should be assigned an owner and a closure date without delay.`
      : byBand.Moderate > 0
        ? 'No Critical or High findings were identified. The moderate-risk findings below should be tracked through corrective action and verified on closure.'
        : 'No Critical, High or Moderate findings were identified. The findings below should still be tracked through closure.',
  );
  if (actionCount > 0) {
    sentences.push(
      `${actionCount} corrective action${actionCount === 1 ? ' was' : 's were'} logged for this inspection, of which ${openCount} remain${openCount === 1 ? 's' : ''} open.`,
    );
  } else {
    sentences.push('No corrective actions have been logged for this inspection yet.');
  }
  if (unrated > 0) {
    sentences.push(`${unrated} finding${unrated === 1 ? '' : 's'} do${unrated === 1 ? 'es' : ''} not yet carry an established risk rating and should be rated by a qualified person before closure.`);
  }
  return sentences.join(' ');
}

function findingsSummary(doc: PDFKit.PDFDocument, findings: Snapshot[], correctiveActions: Snapshot[]) {
  doc.addPage();
  sectionHeading(doc, 'Findings Summary');
  body(doc, 'Concise reference of every finding documented in this inspection.', { color: MUTED, size: 9.5 });
  doc.moveDown(0.4);

  simpleTable(
    doc,
    [
      { header: '#', width: 28 },
      { header: 'Hazard', width: CONTENT_WIDTH * 0.32 },
      { header: 'Risk', width: CONTENT_WIDTH * 0.16 },
      { header: 'Status', width: CONTENT_WIDTH * 0.2 },
      { header: 'Action status', width: CONTENT_WIDTH - 28 - CONTENT_WIDTH * 0.32 - CONTENT_WIDTH * 0.16 - CONTENT_WIDTH * 0.2 },
    ],
    findings.map((f, i) => {
      const actions = correctiveActions.filter((a) => a.findingId === f.id);
      const actionStatus = actions.length === 0
        ? 'No action logged'
        : actions.every((a) => a.statusCode === 'closed')
          ? 'Closed'
          : 'Open';
      return [
        String(i + 1),
        titleCase(f.hazardCategory || f.hazardKey || 'Uncategorized'),
        findingRiskBand(f.riskSnapshot) || 'Not rated',
        titleCase(f.status),
        actionStatus,
      ];
    }),
  );
}

// ---------------------------------------------------------------------------
// Finding layout blocks.
//
// pdfkit paginates by overflow: it breaks wherever the cursor happens to cross the bottom
// margin, which is what stranded "RECOMMENDED CORRECTIVE ACTION" at the foot of a page with
// its content on the next one. Each part of a finding is therefore built as a Block that
// knows its own measured height BEFORE anything is drawn, and the writer decides the page
// break itself. Measurement and drawing use identical font/size/width/lineGap options, so the
// measured height is the height that is actually consumed.
// ---------------------------------------------------------------------------

interface Block {
  /** Full measured height in points, including the trailing gap. */
  height: number;
  /**
   * Long prose that may legitimately outrun a page. When such a block does not fit, it is
   * split at a word boundary and continued on the next page instead of being pushed whole
   * (which would leave a large hole). Short blocks (labels, rules, the notes area) are never
   * flowable: they move to the next page intact.
   */
  flowable?: boolean;
  draw: (doc: PDFKit.PDFDocument, onBreak: (doc: PDFKit.PDFDocument) => void) => void;
}

const LABEL_OPTS = { width: CONTENT_WIDTH, characterSpacing: 0.4 } as const;
/** Smallest space worth starting a flowable block in: its label plus about four lines. */
const MIN_FLOW_REMAINDER = 80;
/** Below this much space left, a continuing paragraph moves to the next page instead. */
const MIN_CONTINUATION_LINES = 26;

function measure(doc: PDFKit.PDFDocument, text: string, font: string, size: number, opts: PDFKit.Mixins.TextOptions): number {
  doc.font(font).fontSize(size);
  return doc.heightOfString(text, opts);
}

/**
 * Draws prose that may be taller than the space left, breaking it at a word boundary and
 * continuing on the next page under a continuation header. Returns nothing; leaves the cursor
 * directly under the last line drawn.
 */
function drawFlowingText(
  doc: PDFKit.PDFDocument,
  text: string,
  style: { font: string; size: number; color: string; lineGap: number },
  onBreak: (doc: PDFKit.PDFDocument) => void,
) {
  const opts = { width: CONTENT_WIDTH, lineGap: style.lineGap };
  let remaining = text;
  while (remaining.length > 0) {
    doc.font(style.font).fontSize(style.size).fillColor(style.color);
    const available = contentBottom(doc) - doc.y;
    if (available < MIN_CONTINUATION_LINES) {
      doc.addPage();
      onBreak(doc);
      continue;
    }
    if (doc.heightOfString(remaining, opts) <= available) {
      doc.text(remaining, PAGE.margins.left, doc.y, opts);
      doc.x = PAGE.margins.left;
      return;
    }
    // Largest whitespace-delimited prefix that still fits the remaining space.
    const tokens = remaining.split(/(\s+)/);
    let low = 1;
    let high = tokens.length;
    let best = 0;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const candidate = tokens.slice(0, mid).join('');
      if (doc.heightOfString(candidate, opts) <= available) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    if (best === 0) {
      // A single token wider than the page: let pdfkit break it rather than loop forever.
      doc.text(remaining, PAGE.margins.left, doc.y, opts);
      doc.x = PAGE.margins.left;
      return;
    }
    doc.text(tokens.slice(0, best).join(''), PAGE.margins.left, doc.y, opts);
    remaining = tokens.slice(best).join('').replace(/^\s+/, '');
    if (remaining.length > 0) {
      doc.addPage();
      onBreak(doc);
    }
  }
  doc.x = PAGE.margins.left;
}

/** Small-caps label over a paragraph. The label can never be separated from its first line. */
function fieldBlock(
  doc: PDFKit.PDFDocument,
  labelText: string,
  text: string,
  opts: { font?: string; size?: number; color?: string; gapAfter?: number; flowable?: boolean } = {},
): Block {
  const font = opts.font || 'Helvetica';
  const size = opts.size ?? 10;
  const color = opts.color || INK;
  const gapAfter = opts.gapAfter ?? 9;
  const labelH = measure(doc, labelText.toUpperCase(), 'Helvetica-Bold', 8.5, LABEL_OPTS);
  const bodyH = measure(doc, text, font, size, { width: CONTENT_WIDTH, lineGap: 2 });
  return {
    height: labelH + 3 + bodyH + gapAfter,
    flowable: opts.flowable,
    draw: (d, onBreak) => {
      d.font('Helvetica-Bold').fontSize(8.5).fillColor(MUTED)
        .text(labelText.toUpperCase(), PAGE.margins.left, d.y, LABEL_OPTS);
      d.y += 3;
      if (opts.flowable) {
        drawFlowingText(d, text, { font, size, color, lineGap: 2 }, onBreak);
      } else {
        d.font(font).fontSize(size).fillColor(color)
          .text(text, PAGE.margins.left, d.y, { width: CONTENT_WIDTH, lineGap: 2 });
      }
      d.x = PAGE.margins.left;
      d.y += gapAfter;
    },
  };
}

/**
 * "Risk:    Moderate" — label and value on one line, value in the band colour. Used for the
 * customer-facing risk line and the assignment line so both read as plain form fields rather
 * than as UI chrome.
 */
const INLINE_LABEL_W = 76;

function inlineBlock(
  doc: PDFKit.PDFDocument,
  labelText: string,
  valueText: string,
  opts: { valueFont?: string; valueSize?: number; valueColor?: string; gapAfter?: number; rule?: boolean } = {},
): Block {
  const valueFont = opts.valueFont || 'Helvetica';
  const valueSize = opts.valueSize ?? 10.5;
  const gapAfter = opts.gapAfter ?? 8;
  const valueW = CONTENT_WIDTH - INLINE_LABEL_W;
  const valueH = opts.rule ? 14 : measure(doc, valueText, valueFont, valueSize, { width: valueW });
  const labelH = measure(doc, labelText, 'Helvetica-Bold', 10, { width: INLINE_LABEL_W });
  return {
    height: Math.max(labelH, valueH) + gapAfter,
    draw: (d) => {
      const y = d.y;
      d.font('Helvetica-Bold').fontSize(10).fillColor(MUTED).text(labelText, PAGE.margins.left, y, { width: INLINE_LABEL_W });
      if (opts.rule) {
        // Blank writing rule for a field the product has no recorded value for.
        d.save().strokeColor('#CBD5E1').lineWidth(0.75)
          .moveTo(PAGE.margins.left + INLINE_LABEL_W, y + 11)
          .lineTo(PAGE.margins.left + INLINE_LABEL_W + 260, y + 11).stroke().restore();
      } else {
        d.font(valueFont).fontSize(valueSize).fillColor(opts.valueColor || INK)
          .text(valueText, PAGE.margins.left + INLINE_LABEL_W, y - 0.5, { width: valueW });
      }
      d.x = PAGE.margins.left;
      d.y = y + Math.max(labelH, valueH) + gapAfter;
    },
  };
}

/** Ruled writing area for handwritten follow-up notes taken against a finding in the field. */
function notesBlock(doc: PDFKit.PDFDocument, lineCount = 3): Block {
  const labelH = measure(doc, 'NOTES', 'Helvetica-Bold', 8.5, LABEL_OPTS);
  const lineGap = 19;
  return {
    height: labelH + 8 + lineCount * lineGap + 8,
    draw: (d) => {
      d.font('Helvetica-Bold').fontSize(8.5).fillColor(MUTED).text('NOTES', PAGE.margins.left, d.y, LABEL_OPTS);
      const top = d.y + 8;
      d.save().strokeColor('#CBD5E1').lineWidth(0.6);
      for (let i = 0; i < lineCount; i++) {
        const y = top + i * lineGap + lineGap - 4;
        d.moveTo(PAGE.margins.left, y).lineTo(PAGE.margins.left + CONTENT_WIDTH, y).stroke();
      }
      d.restore();
      d.x = PAGE.margins.left;
      d.y = top + lineCount * lineGap + 8;
    },
  };
}

function detailedFindings(doc: PDFKit.PDFDocument, findings: Snapshot[], analysesByObservation: Map<string, Snapshot[]>, correctiveActions: Snapshot[]) {
  doc.addPage();
  sectionHeading(doc, 'Detailed Findings');

  const findingCountByObservation = new Map<string, number>();
  for (const f of findings) {
    findingCountByObservation.set(f.observationId, (findingCountByObservation.get(f.observationId) || 0) + 1);
  }

  findings.forEach((f, index) => {
    const heading = `Finding ${index + 1} — ${titleCase(f.hazardCategory || f.hazardKey || 'Uncategorized')}`;
    const continuation = (d: PDFKit.PDFDocument) => {
      d.font('Helvetica-Oblique').fontSize(9).fillColor(FAINT)
        .text(`${heading} (continued)`, PAGE.margins.left, d.y, { width: CONTENT_WIDTH });
      d.x = PAGE.margins.left;
      d.y += 10;
    };

    // A multi-hazard observation decomposes into several findings; each one's own
    // evidence is the excerpt HazLenz actually attributed to it (sourceCandidate.
    // observationFragment), not the entire combined observation repeated verbatim
    // under every finding. Fall back to the full observation text only when no
    // finding-specific fragment exists (e.g. a single, non-decomposed observation,
    // where the fragment and the full text are effectively the same thing).
    const isDecomposedObservation = (findingCountByObservation.get(f.observationId) || 0) > 1;
    const findingEvidence = f.sourceCandidate?.observationFragment || f.conclusion;

    const blocks: Block[] = [];

    blocks.push(fieldBlock(doc, 'What was observed',
      findingEvidence || f.observationText || 'No observation text recorded.', { flowable: true }));

    if (isDecomposedObservation && findingEvidence && f.observationText) {
      // The full source observation is preserved for audit traceability -- it is
      // shown once per finding (not lost), but clearly labeled as the shared,
      // multi-hazard source rather than presented as if it were this finding's
      // own evidence.
      blocks.push(fieldBlock(doc, 'Full source observation (shared across this inspection’s findings)',
        f.observationText, { size: 8.5, color: MUTED, flowable: true }));
    }

    const risk = f.riskSnapshot;
    if (risk) {
      const band = findingRiskBand(risk);
      const detail = risk.operationalRisk
        ? `Severity ${risk.operationalRisk.severity}  ·  Likelihood ${risk.operationalRisk.likelihood}  ·  Risk score ${risk.operationalRisk.matrixScore}`
        : '';
      // Band and its severity/likelihood breakdown are one atom: a risk level separated from
      // the matrix that produced it invites the reader to treat the number on the next page as
      // belonging to a different finding.
      const riskLine = inlineBlock(doc, 'Risk:', band || 'Not rated', {
        valueFont: 'Helvetica-Bold',
        valueSize: 11,
        valueColor: (band && RISK_COLOR[band]) || MUTED,
        gapAfter: detail ? 2 : 9,
      });
      if (!detail) {
        blocks.push(riskLine);
      } else {
        const detailH = measure(doc, detail, 'Helvetica', 8.5, { width: CONTENT_WIDTH - INLINE_LABEL_W });
        blocks.push({
          height: riskLine.height + detailH + 9,
          draw: (d, onBreak) => {
            riskLine.draw(d, onBreak);
            d.font('Helvetica').fontSize(8.5).fillColor(MUTED)
              .text(detail, PAGE.margins.left + INLINE_LABEL_W, d.y, { width: CONTENT_WIDTH - INLINE_LABEL_W });
            d.x = PAGE.margins.left;
            d.y += 9;
          },
        });
      }
    }

    const analyses = analysesByObservation.get(f.observationId) || [];
    const standard = extractStandard(f, analyses, isDecomposedObservation);
    if (standard) {
      // Citation and its official title are one atom: a citation stranded from its title
      // reads as an unsupported reference.
      blocks.push(fieldBlock(doc, 'Applicable standard',
        standard.citation + (standard.heading ? ` — ${standard.heading}` : ''),
        { font: 'Helvetica-Bold', color: '#0369A1', gapAfter: standard.text ? 3 : 9 }));
      if (standard.text) {
        const summary = `HazLenz standard summary: ${standard.text}`;
        const summaryH = measure(doc, summary, 'Helvetica-Oblique', 9, { width: CONTENT_WIDTH, lineGap: 2 });
        blocks.push({
          height: summaryH + 9,
          flowable: true,
          draw: (d, onBreak) => {
            drawFlowingText(d, summary, { font: 'Helvetica-Oblique', size: 9, color: MUTED, lineGap: 2 }, onBreak);
            d.x = PAGE.margins.left;
            d.y += 9;
          },
        });
      }
    } else {
      blocks.push(fieldBlock(doc, 'Applicable standard', 'Not established for this specific finding.',
        { font: 'Helvetica-Oblique', size: 9.5, color: MUTED }));
    }

    const review = f.finalReview;
    if (review) {
      blocks.push(fieldBlock(doc, 'Qualified-person review',
        `${titleCase(review.decision)} — ${review.rationale || 'No rationale recorded.'}`,
        { size: 9.5, color: MUTED, flowable: true }));
    }

    const actions = correctiveActions.filter((a) => a.findingId === f.id);
    actions.forEach((action, actionIndex) => {
      const title = action.title || 'Corrective action';
      const titleH = measure(doc, title, 'Helvetica-Bold', 10, { width: CONTENT_WIDTH });
      const labelText = actions.length > 1
        ? `Recommended corrective action ${actionIndex + 1} of ${actions.length}`
        : 'Recommended corrective action';
      const labelH = measure(doc, labelText.toUpperCase(), 'Helvetica-Bold', 8.5, LABEL_OPTS);
      blocks.push({
        height: labelH + 3 + titleH + 4,
        draw: (d) => {
          d.font('Helvetica-Bold').fontSize(8.5).fillColor(MUTED)
            .text(labelText.toUpperCase(), PAGE.margins.left, d.y, LABEL_OPTS);
          d.y += 3;
          d.font('Helvetica-Bold').fontSize(10).fillColor(INK).text(title, PAGE.margins.left, d.y, { width: CONTENT_WIDTH });
          d.x = PAGE.margins.left;
          d.y += 4;
        },
      });
      // The action description is a multi-line Immediate/Permanent/Verification block; each
      // step is its own atom so a step is never cut in half.
      const steps = String(action.description || '').split(/\n+/).map((s) => s.trim()).filter(Boolean);
      steps.forEach((step, stepIndex) => {
        const stepH = measure(doc, step, 'Helvetica', 9.5, { width: CONTENT_WIDTH, lineGap: 2 });
        blocks.push({
          height: stepH + (stepIndex === steps.length - 1 ? 6 : 2),
          flowable: true,
          draw: (d, onBreak) => {
            drawFlowingText(d, step, { font: 'Helvetica', size: 9.5, color: INK, lineGap: 2 }, onBreak);
            d.x = PAGE.margins.left;
            d.y += stepIndex === steps.length - 1 ? 6 : 2;
          },
        });
      });
      const meta = [
        action.dueDate ? `Due: ${fmtDateShort(action.dueDate)}` : null,
        `Status: ${titleCase(action.statusCode)}`,
        action.priorityCode ? `Priority: ${titleCase(action.priorityCode)}` : null,
      ].filter(Boolean).join('   ·   ');
      const metaH = measure(doc, meta, 'Helvetica', 8.5, { width: CONTENT_WIDTH });
      blocks.push({
        height: metaH + 9,
        draw: (d) => {
          d.font('Helvetica').fontSize(8.5).fillColor(MUTED).text(meta, PAGE.margins.left, d.y, { width: CONTENT_WIDTH });
          d.x = PAGE.margins.left;
          d.y += 9;
        },
      });
    });

    // Assignment line. The product's assignee lives on the corrective action, not on the
    // finding itself, so the recorded owner is printed when one exists and a writing rule is
    // printed when none does -- no assignment data model is invented for the PDF.
    const assignee = actions.map((a) => a.assignedToName).find((name) => typeof name === 'string' && name.trim());
    const assignedLine = inlineBlock(doc, 'Assigned To:', assignee ? String(assignee).trim() : '', {
      rule: !assignee,
      gapAfter: 10,
    });
    const notes = notesBlock(doc, 3);
    // The assignment line and the notes area are the finding's field-use pair: they are written
    // on together, so they page together.
    blocks.push({
      height: assignedLine.height + notes.height,
      draw: (d, onBreak) => {
        assignedLine.draw(d, onBreak);
        notes.draw(d, onBreak);
      },
    });

    // Separator above every finding after the first, kept with the finding it introduces.
    const separatorH = index > 0 ? 20 : 0;
    const headingH = measure(doc, heading, 'Helvetica-Bold', 13, { width: CONTENT_WIDTH }) + 8;

    // A heading is never left at the foot of a page: the heading plus its first block must fit
    // together, or both move to the next page.
    if (doc.y + separatorH + headingH + Math.min(blocks[0].height, 72) > contentBottom(doc)) {
      doc.addPage();
    } else if (separatorH > 0) {
      doc.y += 6;
      hr(doc, doc.y);
      doc.y += 14;
    }

    doc.font('Helvetica-Bold').fontSize(13).fillColor(INK)
      .text(heading, PAGE.margins.left, doc.y, { width: CONTENT_WIDTH });
    doc.x = PAGE.margins.left;
    doc.y += 8;

    for (const block of blocks) {
      const available = contentBottom(doc) - doc.y;
      if (block.height > available) {
        if (block.flowable && available >= MIN_FLOW_REMAINDER) {
          block.draw(doc, continuation);
          continue;
        }
        doc.addPage();
        continuation(doc);
      }
      block.draw(doc, continuation);
    }
  });
}

// The generated title for a corrective action is a generic placeholder ("Verify and correct
// reviewed condition N"); the real actionable content lives in the multi-line description
// (Immediate/Permanent/Verification). The management-follow-up summary table has room for one
// line per action, so surface the Immediate step there instead of repeating the placeholder
// title -- a genuinely custom (reviewer-edited) title is still preferred when present.
function summaryActionText(a: Snapshot): string {
  if (a.title && !/^verify and correct reviewed condition/i.test(String(a.title).trim())) return a.title;
  const immediate = /Immediate:\s*([^\n]+)/i.exec(String(a.description || ''));
  if (immediate) return immediate[1].trim();
  return a.title || a.description || 'Corrective action';
}

function correctiveActionSummary(doc: PDFKit.PDFDocument, findings: Snapshot[], correctiveActions: Snapshot[]) {
  if (!correctiveActions.length) return;
  doc.addPage();
  sectionHeading(doc, 'Corrective Action Summary');
  body(doc, 'Consolidated view of all corrective actions from this inspection for management follow-up.', { color: MUTED, size: 9.5 });
  doc.moveDown(0.4);

  const findingNumberById = new Map(findings.map((f, i) => [f.id, i + 1]));

  simpleTable(
    doc,
    [
      { header: 'Finding', width: 50 },
      { header: 'Action', width: CONTENT_WIDTH * 0.34 },
      { header: 'Owner', width: CONTENT_WIDTH * 0.18 },
      { header: 'Due', width: CONTENT_WIDTH * 0.14 },
      { header: 'Status', width: CONTENT_WIDTH - 50 - CONTENT_WIDTH * 0.34 - CONTENT_WIDTH * 0.18 - CONTENT_WIDTH * 0.14 },
    ],
    correctiveActions.map((a) => [
      a.findingId && findingNumberById.has(a.findingId) ? `#${findingNumberById.get(a.findingId)}` : '—',
      summaryActionText(a),
      a.assignedToName || 'Unassigned',
      fmtDateShort(a.dueDate),
      titleCase(a.statusCode),
    ]),
  );
}

function applyHeaderFooter(doc: PDFKit.PDFDocument, snapshot: Snapshot) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    if (i === range.start) continue; // cover page carries no running header/footer

    doc.font('Helvetica').fontSize(8).fillColor(FAINT)
      .text(`InSite · ${snapshot.site?.name || 'Field Inspection'} · Inspection Report`, PAGE.margins.left, 30, { width: CONTENT_WIDTH });

    // Drawing below the content boundary (page.height - margins.bottom) would make pdfkit
    // think the text overflows and silently insert a fresh page to hold it. Footers live in
    // the margin area by design, so the bottom margin is temporarily relaxed for this draw only.
    const originalBottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.font('Helvetica').fontSize(8).fillColor(FAINT)
      .text(
        `Inspection date ${fmtDateShort(snapshot.inspection.completedAt)} · Generated ${fmtDateShort(snapshot.capturedAt)} · Page ${i - range.start} of ${range.count - 1}`,
        PAGE.margins.left,
        doc.page.height - 38,
        { width: CONTENT_WIDTH, align: 'center' },
      );
    doc.page.margins.bottom = originalBottomMargin;
  }
}

export function renderInspectionReportPdf(snapshot: Snapshot): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ ...PAGE, bufferPages: true, info: { Title: 'InSite Inspection Report' } });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const findings: Snapshot[] = (snapshot.observations || []).flatMap((o: Snapshot) =>
      (o.findings || []).map((f: Snapshot) => ({ ...f, observationText: o.rawText })),
    );
    const analysesByObservation = new Map<string, Snapshot[]>(
      (snapshot.observations || []).map((o: Snapshot) => [o.id, o.analyses || []]),
    );
    const correctiveActions: Snapshot[] = snapshot.correctiveActions || [];

    // Cover -> Executive Summary -> Findings -> Corrective actions. The former standalone
    // "Inspection Information" page repeated the cover and was removed; its one unique field
    // (regulatory context) now sits in the Executive Summary's Inspection Record panel, and the
    // advisory statement that used to trail the last page — where it could strand a nearly
    // empty page — is now part of that page's "Basis and Limitations" note.
    coverPage(doc, snapshot, findings.length);
    executiveSummary(doc, snapshot, findings, correctiveActions);
    findingsSummary(doc, findings, correctiveActions);
    detailedFindings(doc, findings, analysesByObservation, correctiveActions);
    correctiveActionSummary(doc, findings, correctiveActions);

    applyHeaderFooter(doc, snapshot);
    doc.end();
  });
}
