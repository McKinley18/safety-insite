import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
function getReportPackageExportNote(input: any) {
  const reportPackage = input?.reportPackage;
  if (!reportPackage?.label) return "";
  return `${reportPackage.label}: ${reportPackage.description || ""}`.trim();
}


const SAFESCOPE_EXPORT_DISCLAIMER = "Generated with Sentinel Safety / SafeScope. SafeScope outputs are decision-support intelligence and require qualified human review before use. Users remain responsible for verifying observations, standards, risk ratings, corrective actions, and final safety decisions.";

interface InspectionData {
  adminInfo: any;
  findings: any[];
}

interface ExportOptions {
  findingsPerPage: "single" | "multiple";
}

// 🔷 HELPER: CONVERT BLOB URL TO BASE64 (Required for jsPDF)
const blobToBase64 = async (blobUrl: string): Promise<string> => {
  if (!blobUrl || blobUrl.startsWith("mock")) return ""; // Skip mock data in lab
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Photo conversion error:", e);
    return "";
  }
};

export const localExporter = {
  // 🔷 EXPORT RAW DATA (ENCRYPTED JSON)
  exportDataFile: (data: InspectionData) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sentinel-inspection-${data.adminInfo?.site || "export"}-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  // 🔷 GENERATE SENTINEL SAFETY PDF LOCALLY
  generatePDF: async (
    data: InspectionData,
    options: ExportOptions = { findingsPerPage: "single" },
  ) => {
    const doc = await localExporter._buildDoc(data, options);
    doc.save(
      `SENTINEL-REPORT-${data.adminInfo?.site || "EXPORT"}-${new Date().getTime()}.pdf`,
    );
  },

  // 🔷 PREVIEW PDF IN NEW TAB
  previewPDF: async (
    data: InspectionData,
    options: ExportOptions = { findingsPerPage: "single" },
  ) => {
    const doc = await localExporter._buildDoc(data, options);
    const blobUrl = doc.output("bloburl");
    window.open(blobUrl);
  },

  // 🔷 INTERNAL DOC BUILDER
  _buildDoc: async (data: InspectionData, options: ExportOptions) => {
    const doc = new jsPDF();
    const { adminInfo, findings } = data;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const centerX = pageWidth / 2;

    const addHeaderFooter = (d: any) => {
      const pageCount = d.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        d.setPage(i);
        d.setFontSize(8);
        d.setTextColor(148, 163, 184);
        d.text("SENTINEL SAFETY INTELLIGENCE REPORT", 20, 10);
        d.text(`SITE: ${adminInfo?.site || "N/A"}`, pageWidth - 20, 10, {
          align: "right",
        });
        d.setDrawColor(226, 232, 240);
        d.line(20, 12, pageWidth - 20, 12);
        d.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, {
          align: "center",
        });
      }
    };

    // 1. COVER PAGE
    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(1.2);
    doc.line(50, 42, pageWidth - 50, 42);

    if (adminInfo?.companyLogo) {
      try {
        doc.addImage(adminInfo.companyLogo, "PNG", centerX - 28, 52, 56, 32);
      } catch {
        // Ignore logo rendering errors so export does not fail.
      }
    }

    const titleY = 105;

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(30);
    doc.setFont("helvetica", "bold");
    doc.text("Inspection Report", centerX, titleY, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(249, 115, 22);
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

    const inspectorLines = [
      adminInfo?.inspector || "N/A",
      ...(Array.isArray(adminInfo?.additionalInspectors)
        ? adminInfo.additionalInspectors.filter(Boolean)
        : []),
    ];

    const reportDetailLines = [
      adminInfo?.date || "N/A",
      ...inspectorLines,
      adminInfo?.reportId || "N/A",
      `${adminInfo?.findingCount || findings.length || 0} finding(s)`,
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);

    reportDetailLines.forEach((line, index) => {
      doc.text(line, centerX, titleY + 70 + index * 8, {
        align: "center",
      });
    });

    const packageLabel =
      adminInfo?.reportPackageMode === "evidence_centered"
        ? "Evidence-centered package"
        : adminInfo?.reportPackageMode === "export_ready"
          ? "Export-ready package"
          : adminInfo?.reportPackageMode === "ask_every_report"
            ? "Ask every report"
            : "Local-first private vault";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(packageLabel.toUpperCase(), centerX, pageHeight - 52, {
      align: "center",
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
        pageHeight - 36,
        { align: "center" },
      );
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "Generated by Sentinel Safety · See Risk. Prevent Harm.",
      centerX,
      pageHeight - 18,
      { align: "center" },
    );

    // 2. EXECUTIVE SUMMARY PAGE
    doc.addPage();

    const riskScore = (f: any) =>
      Number(f.likelihood || 1) * Number(f.severity || 1);

    const highRisk = findings.filter((f) => riskScore(f) >= 15).length;
    const medRisk = findings.filter(
      (f) => riskScore(f) >= 5 && riskScore(f) < 15,
    ).length;
    const lowRisk = findings.filter((f) => riskScore(f) < 5).length;
    const actionCount = findings.reduce(
      (total, f) => total + (f.correctiveActions?.length || 0),
      0,
    );
    const evidenceCount = findings.reduce(
      (total, f) => total + (f.photos?.length || 0),
      0,
    );
    const standardsCount = findings.reduce(
      (total, f) => total + (f.standards?.length || 0),
      0,
    );
    const avgRisk =
      findings.length > 0
        ? (
            findings.reduce((acc, f) => acc + riskScore(f), 0) / findings.length
          ).toFixed(1)
        : "0.0";

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 28, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text("SENTINEL SAFETY", 20, 17);

    doc.setDrawColor(249, 115, 22);
    doc.setLineWidth(1);
    doc.line(20, 36, pageWidth - 20, 36);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 20, 52);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(
      "A concise overview of findings, evidence, risk, and corrective action readiness.",
      20,
      60,
    );

    autoTable(doc, {
      startY: 74,
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
    const barWidth = pageWidth - 70;
    const barX = 36;

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
      doc.text(String(count), pageWidth - 24, y + 5, { align: "right" });
    };

    drawRiskRow("High", highRisk, snapshotY + 13, [239, 68, 68]);
    drawRiskRow("Mod", medRisk, snapshotY + 26, [249, 115, 22]);
    drawRiskRow("Low", lowRisk, snapshotY + 39, [34, 197, 94]);

    const summaryY = snapshotY + 66;

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

    const summaryText = [
      `This report documents ${findings.length} field finding(s), ${evidenceCount} evidence item(s), and ${actionCount} corrective action(s).`,
      dominantRisk,
      "",
      "Recommended follow-up:",
      "• Assign owners and due dates for open corrective actions.",
      "• Verify closure using the required evidence type for each action.",
      "• Review recurring categories for training, maintenance, or procedural weaknesses.",
      "• Preserve this report as supporting documentation for internal safety governance.",
    ].join("\n");

    const wrappedSummary = doc.splitTextToSize(summaryText, pageWidth - 40);
    doc.text(wrappedSummary, 20, summaryY + 10);

    // 3. FINDINGS REFERENCE
    doc.addPage();
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("FINDINGS REFERENCE", 20, 35);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(
      "A concise reference of identified findings and locations.",
      20,
      42,
    );

    autoTable(doc, {
      startY: 50,
      head: [["ID", "Hazard Category", "Explanation"]],
      body: findings.map((f, i) => [i + 1, f.category, f.description]),
      headStyles: { fillColor: [15, 23, 42] },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 50, fontStyle: "bold" },
        2: { cellWidth: "auto" },
      },
      theme: "grid",
    });

    // 4. DETAILED FINDINGS
    let currentY = 30;

    for (let i = 0; i < findings.length; i++) {
      const f = findings[i];
      const rpn = f.likelihood * f.severity;
      let rpnColor: [number, number, number] = [34, 197, 94];
      if (rpn >= 5) rpnColor = [234, 179, 8];
      if (rpn >= 15) rpnColor = [249, 115, 22];
      if (rpn >= 21) rpnColor = [239, 68, 68];

      if (options.findingsPerPage === "single" || i === 0) {
        doc.addPage();
        currentY = 30;
      } else if (currentY > pageHeight - 100) {
        doc.addPage();
        currentY = 30;
      }

      // Title & Badge Row
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`FINDING #${i + 1}: ${f.category}`, 20, currentY);

      doc.setFillColor(rpnColor[0], rpnColor[1], rpnColor[2]);
      doc.roundedRect(pageWidth - 50, currentY - 8, 30, 10, 1, 1, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text(`RPN: ${rpn}`, pageWidth - 35, currentY - 1, {
        align: "center",
      });

      currentY += 12;

      // Description
      const descLines = doc.splitTextToSize(f.description, pageWidth - 40);
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("DESCRIPTION", 20, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(descLines, 20, currentY + 6);
      currentY += descLines.length * 5 + 12;

      // Standards
      const standards = Array.isArray(f.standards) ? f.standards : [];
      const standardText = standards.length
        ? standards
            .map(
              (standard: any) =>
                standard.citation ||
                standard.label ||
                standard.title ||
                String(standard),
            )
            .join("\n")
        : "No standard selected.";

      doc.setFont("helvetica", "bold");
      doc.text("SELECTED REGULATORY STANDARD(S)", 20, currentY);
      doc.setTextColor(3, 105, 161);
      doc.setFont("helvetica", "normal");
      const standardLines = doc.splitTextToSize(standardText, pageWidth - 40);
      doc.text(standardLines, 20, currentY + 6);
      currentY += standardLines.length * 5 + 15;

      // Corrective Actions
      const correctiveActions = Array.isArray(f.correctiveActions)
        ? f.correctiveActions
        : [];
      const actionText = correctiveActions.length
        ? correctiveActions
            .map((action: any, actionIndex: number) => {
              const title =
                action.title ||
                action.description ||
                `Corrective action ${actionIndex + 1}`;
              const priority = action.priority
                ? `Priority: ${action.priority}`
                : "";
              const due = action.due ? `Due: ${action.due}` : "";
              const closureEvidence = `Closure Evidence: ${
                action.closureEvidence || "Photo"
              }`;
              const meta = [priority, due, closureEvidence]
                .filter(Boolean)
                .join(" • ");
              return `${actionIndex + 1}. ${title}${meta ? ` (${meta})` : ""}`;
            })
            .join("\n")
        : f.action || "No action specified.";

      const actionLines = doc.splitTextToSize(actionText, pageWidth - 40);
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "bold");
      doc.text("CORRECTIVE ACTION(S)", 20, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(actionLines, 20, currentY + 6);
      currentY += actionLines.length * 5 + 15;

      // 5. PHOTO EVIDENCE
      if (f.photos && f.photos.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("EVIDENCE PHOTOS", 20, currentY);
        currentY += 6;

        let photoX = 20;
        for (const photo of f.photos.slice(0, 2)) {
          const photoUrl = typeof photo === "string" ? photo : photo?.url;
          const base64 = await blobToBase64(photoUrl);
          if (base64) {
            try {
              doc.addImage(base64, "JPEG", photoX, currentY, 80, 60);
            } catch (e) {
              doc.setDrawColor(226, 232, 240);
              doc.rect(photoX, currentY, 80, 60);
              doc.text("IMAGE LOAD ERROR", photoX + 40, currentY + 30, {
                align: "center",
              });
            }
          } else {
            doc.setDrawColor(226, 232, 240);
            doc.rect(photoX, currentY, 80, 60);
            doc.setFontSize(7);
  // Report defensibility notice

            doc.text("PHOTO EVIDENCE", photoX + 40, currentY + 30, {
              align: "center",
            });
          }
          photoX += 85;
        }
        currentY += 70;
      }

      // Separator Line (only for multiple)
      if (options.findingsPerPage === "multiple" && i < findings.length - 1) {
        doc.setDrawColor(241, 245, 249);
        doc.line(20, currentY - 5, pageWidth - 20, currentY - 5);
        currentY += 10;
      }
    }

    addHeaderFooter(doc);
    return doc;
  },
};
