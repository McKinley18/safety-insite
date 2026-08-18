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
function extractStandard(finding: Snapshot, analyses: Snapshot[], isDecomposedObservation: boolean): { citation: string; heading: string; text: string } | null {
  if (isDecomposedObservation) return null;
  const analysis = analyses.find((a) => a.id === finding.originatingAnalysisId) || analyses[0];
  const snap = analysis?.resultSnapshot || {};
  const top = snap.executiveJudgment?.topStandard || snap.standardsReasoning?.topDefensible?.[0] || null;
  const citation = top?.citation || snap.primaryCitation || '';
  if (!citation) return null;
  const heading = top?.heading || top?.title || '';
  const text = top?.summary || top?.reasoning || '';
  return { citation, heading, text };
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y + needed > doc.page.height - doc.page.margins.bottom) {
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

function subHeading(doc: PDFKit.PDFDocument, text: string) {
  ensureSpace(doc, 26);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(INK).text(text, { width: CONTENT_WIDTH });
  doc.moveDown(0.25);
}

function label(doc: PDFKit.PDFDocument, text: string) {
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor(MUTED).text(text.toUpperCase(), { width: CONTENT_WIDTH, characterSpacing: 0.4 });
}

function body(doc: PDFKit.PDFDocument, text: string, opts: { color?: string; size?: number } = {}) {
  doc.font('Helvetica').fontSize(opts.size ?? 10).fillColor(opts.color ?? INK).text(text, { width: CONTENT_WIDTH, lineGap: 2 });
}

function riskBadge(doc: PDFKit.PDFDocument, band: string | undefined): void {
  const color = (band && RISK_COLOR[band]) || MUTED;
  const text = String(band || 'Not rated').toUpperCase();
  doc.font('Helvetica-Bold').fontSize(9);
  const w = doc.widthOfString(text) + 16;
  const x = doc.x;
  const y = doc.y;
  doc.save().roundedRect(x, y, w, 16, 3).fill(color).restore();
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF').text(text, x, y + 4, { width: w, align: 'center' });
  doc.x = x;
  doc.y = y + 16;
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
  const centerX = 612 / 2;
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#1D72B8')
    .text('INSITE', 0, 130, { width: 612, align: 'center', characterSpacing: 2 });

  doc.font('Helvetica-Bold').fontSize(28).fillColor(INK)
    .text('Inspection Report', 0, 150, { width: 612, align: 'center' });

  doc.font('Helvetica').fontSize(11).fillColor(MUTED)
    .text('Field Safety Inspection Record', 0, 186, { width: 612, align: 'center' });

  hr(doc, 220);

  doc.font('Helvetica-Bold').fontSize(16).fillColor(INK)
    .text(snapshot.site?.name || 'Field Inspection', 0, 236, { width: 612, align: 'center' });

  doc.font('Helvetica').fontSize(11).fillColor(MUTED)
    .text(snapshot.inspection.title || 'Untitled Inspection', 0, 258, { width: 612, align: 'center' });

  const details = [
    `Inspection date: ${fmtDate(snapshot.inspection.completedAt)}`,
    `Inspector: ${snapshot.preparedBy?.name || 'Not recorded'}`,
    `Findings documented: ${findingCount}`,
    `Report generated: ${fmtDate(snapshot.capturedAt)}`,
  ];

  let y = 300;
  doc.font('Helvetica').fontSize(10).fillColor(MUTED);
  for (const line of details) {
    doc.text(line, 0, y, { width: 612, align: 'center' });
    y += 16;
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

  simpleTable(
    doc,
    [
      { header: 'Metric', width: CONTENT_WIDTH * 0.6 },
      { header: 'Value', width: CONTENT_WIDTH * 0.4, align: 'right' },
    ],
    [
      ['Total findings', String(findings.length)],
      ['Critical / High risk findings', String(byBand.Critical + byBand.High)],
      ['Open corrective actions', String(openActions.length)],
      ['Inspection status', titleCase(snapshot.inspection.status)],
    ],
  );

  doc.moveDown(0.4);
  subHeading(doc, 'Risk Distribution');
  const maxCount = Math.max(byBand.Critical, byBand.High, byBand.Moderate, byBand.Low, 1);
  const barX = PAGE.margins.left + 90;
  const barMaxWidth = CONTENT_WIDTH - 130;

  (['Critical', 'High', 'Moderate', 'Low'] as const).forEach((bandName) => {
    ensureSpace(doc, 20);
    const y = doc.y;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(MUTED).text(bandName, PAGE.margins.left, y + 3, { width: 80 });
    doc.save().rect(barX, y, barMaxWidth, 12).fill(PAPER_PANEL).restore();
    const w = Math.max((byBand[bandName] / maxCount) * barMaxWidth, byBand[bandName] > 0 ? 4 : 0);
    if (w > 0) doc.save().rect(barX, y, w, 12).fill(RISK_COLOR[bandName]).restore();
    doc.font('Helvetica-Bold').fontSize(9).fillColor(INK).text(String(byBand[bandName]), barX + barMaxWidth + 8, y + 3, { width: 24 });
    doc.x = PAGE.margins.left;
    doc.y = y + 18;
  });

  if (unrated > 0) {
    doc.font('Helvetica').fontSize(8.5).fillColor(FAINT).text(`${unrated} finding(s) do not yet have an established risk rating.`);
  }

  doc.moveDown(0.6);
  subHeading(doc, 'Summary');
  const dominant = byBand.Critical + byBand.High > 0
    ? 'This inspection identified findings requiring prioritized corrective action. Critical and High findings should be assigned an owner and closure date without delay.'
    : byBand.Moderate > 0
      ? 'This inspection identified moderate-risk findings that should be tracked through corrective action and verified on closure.'
      : 'Findings from this inspection are currently rated low risk based on available evidence and should still be tracked through closure.';
  body(doc, dominant);
}

function inspectionInformation(doc: PDFKit.PDFDocument, snapshot: Snapshot) {
  doc.addPage();
  sectionHeading(doc, 'Inspection Information');
  simpleTable(
    doc,
    [
      { header: 'Field', width: CONTENT_WIDTH * 0.35 },
      { header: 'Detail', width: CONTENT_WIDTH * 0.65 },
    ],
    [
      ['Site / facility', snapshot.site?.name || 'Not recorded'],
      ['Inspection', snapshot.inspection.title || 'Untitled Inspection'],
      ['Inspection date', fmtDate(snapshot.inspection.completedAt)],
      ['Inspector', snapshot.preparedBy?.name || 'Not recorded'],
      ['Status', titleCase(snapshot.inspection.status)],
    ],
  );
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

function detailedFindings(doc: PDFKit.PDFDocument, findings: Snapshot[], analysesByObservation: Map<string, Snapshot[]>, correctiveActions: Snapshot[]) {
  doc.addPage();
  sectionHeading(doc, 'Detailed Findings');

  const findingCountByObservation = new Map<string, number>();
  for (const f of findings) {
    findingCountByObservation.set(f.observationId, (findingCountByObservation.get(f.observationId) || 0) + 1);
  }

  findings.forEach((f, index) => {
    if (index > 0) {
      ensureSpace(doc, 100);
      doc.moveDown(0.3);
      hr(doc);
      doc.moveDown(0.6);
    }

    ensureSpace(doc, 40);
    doc.font('Helvetica-Bold').fontSize(13).fillColor(INK)
      .text(`Finding ${index + 1} — ${titleCase(f.hazardCategory || f.hazardKey || 'Uncategorized')}`, { width: CONTENT_WIDTH });
    doc.moveDown(0.4);

    ensureSpace(doc, 30);
    label(doc, 'What was observed');
    body(doc, f.observationText || 'No observation text recorded.');
    doc.moveDown(0.5);

    ensureSpace(doc, 30);
    label(doc, 'Finding');
    // f.conclusion is HazLenz's internal one-or-two-word hazard-mechanism tag (e.g. "guard",
    // "cord") -- accurate as an internal classifier value but meaningless standing alone in a
    // customer-facing report. sourceCandidate.observationFragment is the actual excerpt of the
    // observation text that produced this specific finding, which reads as a real sentence.
    body(doc, f.sourceCandidate?.observationFragment || f.conclusion || 'No finding conclusion recorded.');
    doc.moveDown(0.5);

    const risk = f.riskSnapshot;
    if (risk) {
      ensureSpace(doc, 40);
      label(doc, 'Risk');
      doc.moveDown(0.15);
      riskBadge(doc, findingRiskBand(risk));
      const detail = risk.operationalRisk
        ? `Severity ${risk.operationalRisk.severity} · Likelihood ${risk.operationalRisk.likelihood} · Score ${risk.operationalRisk.matrixScore}`
        : '';
      if (detail) {
        doc.font('Helvetica').fontSize(9).fillColor(MUTED).text(detail);
      }
      doc.moveDown(0.5);
    }

    const analyses = analysesByObservation.get(f.observationId) || [];
    const isDecomposedObservation = (findingCountByObservation.get(f.observationId) || 0) > 1;
    const standard = extractStandard(f, analyses, isDecomposedObservation);
    ensureSpace(doc, 40);
    label(doc, 'Applicable standard');
    if (standard) {
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#0369A1').text(standard.citation + (standard.heading ? ` — ${standard.heading}` : ''), { width: CONTENT_WIDTH });
      if (standard.text) {
        doc.font('Helvetica-Oblique').fontSize(9).fillColor(MUTED).text(`HazLenz standard summary: ${standard.text}`, { width: CONTENT_WIDTH });
      }
    } else {
      doc.font('Helvetica-Oblique').fontSize(9.5).fillColor(MUTED).text('Not established for this specific finding.', { width: CONTENT_WIDTH });
    }
    doc.moveDown(0.5);

    const review = f.finalReview;
    if (review) {
      ensureSpace(doc, 30);
      label(doc, 'Qualified-person review');
      body(doc, `${titleCase(review.decision)} — ${review.rationale || 'No rationale recorded.'}`, { size: 9.5, color: MUTED });
      doc.moveDown(0.5);
    }

    const actions = correctiveActions.filter((a) => a.findingId === f.id);
    if (actions.length) {
      ensureSpace(doc, 30);
      label(doc, 'Recommended corrective action');
      doc.moveDown(0.15);
      for (const action of actions) {
        ensureSpace(doc, 40);
        doc.font('Helvetica-Bold').fontSize(10).fillColor(INK).text(action.title || 'Corrective action');
        body(doc, action.description || '', { size: 9.5 });
        const meta = [
          action.assignedToName ? `Owner: ${action.assignedToName}` : null,
          action.dueDate ? `Due: ${fmtDateShort(action.dueDate)}` : null,
          `Status: ${titleCase(action.statusCode)}`,
          action.priorityCode ? `Priority: ${titleCase(action.priorityCode)}` : null,
        ].filter(Boolean).join('   ·   ');
        doc.font('Helvetica').fontSize(8.5).fillColor(MUTED).text(meta);
        doc.moveDown(0.35);
      }
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

    coverPage(doc, snapshot, findings.length);
    executiveSummary(doc, snapshot, findings, correctiveActions);
    inspectionInformation(doc, snapshot);
    findingsSummary(doc, findings, correctiveActions);
    detailedFindings(doc, findings, analysesByObservation, correctiveActions);
    correctiveActionSummary(doc, findings, correctiveActions);

    doc.font('Helvetica').fontSize(8).fillColor(FAINT).moveDown(1);
    ensureSpace(doc, 30);
    body(doc, 'HazLenz AI output is advisory and requires qualified human review. This report reflects findings as reviewed at the time of generation.', { color: FAINT, size: 8 });

    applyHeaderFooter(doc, snapshot);
    doc.end();
  });
}
