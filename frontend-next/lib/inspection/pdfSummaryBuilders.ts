import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatPdfDate } from "./pdfFormattingHelpers";

export function renderCoverPage(
  doc: jsPDF,
  adminInfo: any,
  findings: any[],
  centerX: number,
  pageWidth: number,
  pageHeight: number
) {
  doc.setLineWidth(0.4);

  if (adminInfo?.companyLogo) {
    try {
      doc.addImage(adminInfo.companyLogo, "PNG", centerX - 28, 52, 56, 32);
    } catch {
      // Ignore logo rendering errors
    }
  }

  const titleY = 88;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(30);
  doc.setFont("helvetica", "bold");
  doc.text("Inspection Report", centerX, titleY, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("FIELD SAFETY REVIEW", centerX, titleY + 10, {
    align: "center",
  });

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(42, titleY + 22, pageWidth - 42, titleY + 22);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(adminInfo?.company || "Organization Name", centerX, titleY + 38, {
    align: "center",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(71, 85, 105);
  doc.text(adminInfo?.site || "Field Inspection", centerX, titleY + 50, {
    align: "center",
  });

  const reportDetailLines = [
    `Date: ${formatPdfDate(adminInfo?.date)}`,
    `Lead Inspector: ${adminInfo?.inspector || "N/A"}`,
    ...(Array.isArray(adminInfo?.additionalInspectors) && adminInfo.additionalInspectors.length
      ? [`Additional Inspectors: ${adminInfo.additionalInspectors.filter(Boolean).join(", ")}`]
      : ["Additional Inspectors: None"]),
    `Confidentiality: ${
      adminInfo?.isConfidential
        ? adminInfo?.confidentialityMarkerText || "Privileged & Confidential"
        : "No"
    }`,
    `Report ID: ${adminInfo?.reportId || "N/A"}`,
    `${adminInfo?.findingCount || findings.length || 0} finding(s)`,
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);

  reportDetailLines.forEach((line, index) => {
    doc.text(line, centerX, titleY + 62 + index * 6, {
      align: "center",
    });
  });

  if (adminInfo?.isConfidential) {
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(
      String(
        adminInfo.confidentialityMarkerText || "Privileged & Confidential",
      ).toUpperCase(),
      pageWidth / 2,
      pageHeight - 52,
      { align: "center" },
    );
  }
}

export function renderExecutiveSummary(
  doc: jsPDF,
  findings: any[],
  reportPackage: any,
  pageWidth: number,
  riskScoreFn: (f: any) => number | null,
  standardsCountFn: (f: any) => number
) {
  const ratedRiskScores = findings
    .map(riskScoreFn)
    .filter((score): score is number => score !== null);

  const highRisk = ratedRiskScores.filter((score) => score >= 15).length;
  const medRisk = ratedRiskScores.filter((score) => score >= 5 && score < 15).length;
  const lowRisk = ratedRiskScores.filter((score) => score > 0 && score < 5).length;
  const actionCount = findings.reduce(
    (total, f) => total + (f.correctiveActions?.length || 0),
    0,
  );
  const evidenceCount = findings.reduce(
    (total, f) => total + (f.photos?.length || 0),
    0,
  );
  const standardsCount = findings.reduce(
    (total, f) => total + standardsCountFn(f),
    0,
  );
  const avgRisk =
    ratedRiskScores.length > 0
      ? (
          ratedRiskScores.reduce((acc, score) => acc + score, 0) / ratedRiskScores.length
        ).toFixed(1)
      : "Not rated";

  doc.addPage();
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Summary", 20, 28);

  autoTable(doc, {
    startY: 40,
    margin: { left: 20, right: 20 },
    theme: "plain",
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 3,
      textColor: [51, 65, 85],
    },
    body: [
      ["Total Findings", String(findings.length)],
      ["High / Critical Findings", String(highRisk)],
      ["Corrective Actions", String(actionCount)],
      ["Evidence Items", String(evidenceCount)],
      ["Selected Standards", String(standardsCount)],
      ["Average Risk Score", String(avgRisk)],
    ],
    columnStyles: {
      0: { fontStyle: "bold", textColor: [15, 23, 42], cellWidth: 72 },
      1: { halign: "right", fontStyle: "bold", cellWidth: 72 },
    },
  });

  const snapshotY = (doc as any).lastAutoTable.finalY + 18;

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Risk Snapshot", 20, snapshotY);

  const maxVal = Math.max(highRisk, medRisk, lowRisk, 1);
  const barWidth = Math.round((pageWidth - 70) * 0.46);
  const barX = 36;
  const barCountX = barX + barWidth + 12;

  const drawRiskRow = (
    label: string,
    count: number,
    y: number,
    color: [number, number, number],
  ) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(label, 20, y + 5);

    doc.setFillColor(241, 245, 249);
    doc.rect(barX, y, barWidth, 7, "F");

    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(barX, y, (count / maxVal) * barWidth, 7, "F");

    doc.setTextColor(15, 23, 42);
    doc.text(String(count), barCountX, y + 5);
  };

  drawRiskRow("High", highRisk, snapshotY + 11, [239, 68, 68]);
  drawRiskRow("Mod", medRisk, snapshotY + 21, [249, 115, 22]);
  drawRiskRow("Low", lowRisk, snapshotY + 31, [34, 197, 94]);

  const summaryY = snapshotY + 48;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Inspection Summary", 20, summaryY);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);

  const dominantRisk =
    highRisk > 0
      ? "High or critical findings are present and should be prioritized for review, ownership, and timely closure."
      : medRisk > 0
        ? "Moderate findings are present and should be assigned for corrective action and verification."
        : "Findings are currently low-risk based on available scoring and should still be tracked through closure.";

  const recommendedFollowUp = reportPackage.includesAssignments
    ? [
        "Recommended follow-up:",
        "• Assign owners and due dates for open corrective actions.",
        "• Verify closure using the required evidence type for each action.",
        "• Review recurring categories for training, maintenance, or procedural weaknesses.",
        "• Preserve this report as supporting documentation for internal safety governance.",
      ]
    : [
        "Recommended follow-up:",
        "• Verify corrective actions and closure evidence.",
        "• Review standards, risk ratings, and report language before distribution.",
        "• Preserve this report as supporting documentation.",
      ];

  const summaryText = [
    `This report documents ${findings.length} field finding(s), ${evidenceCount} evidence item(s), and ${actionCount} corrective action(s).`,
    dominantRisk,
    "",
    ...recommendedFollowUp,
  ].join("\n");

  const wrappedSummary = doc.splitTextToSize(summaryText, pageWidth - 40);
  doc.text(wrappedSummary, 20, summaryY + 10);
}
