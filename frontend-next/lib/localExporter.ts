import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
function getReportPackageExportNote(input: any) {
  const reportPackage = input?.reportPackage;
  if (!reportPackage?.label) return "";
  return `${reportPackage.label}: ${reportPackage.description || ""}`.trim();
}


const SAFESCOPE_EXPORT_DISCLAIMER = "Generated with AuditAlly / HazLenz AI. HazLenz AI outputs are decision-support intelligence and require qualified human review before use. Users remain responsible for verifying observations, standards, risk ratings, corrective actions, and final safety decisions.";

function normalizePdfPercent(value: any) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return numeric <= 1 ? Math.round(numeric * 100) : Math.round(numeric);
}

function getFindingStandardsForPdf(f: any) {
  return (
    (Array.isArray(f.selectedStandards) && f.selectedStandards.length
      ? f.selectedStandards
      : null) ||
    (Array.isArray(f.standards) && f.standards.length ? f.standards : null) ||
    (Array.isArray(f.safeScopeResult?.suggestedStandards) &&
    f.safeScopeResult.suggestedStandards.length
      ? f.safeScopeResult.suggestedStandards
      : [])
  );
}

function getFieldOutputActionsForPdf(f: any) {
  const actions = f.safeScopeResult?.fieldOutput?.correctiveActions;
  if (!Array.isArray(actions) || !actions.length) return [];

  return actions.map((action: any, index: number) => {
    if (typeof action === "string") {
      return {
        title: action,
        description: action,
        priority: f.safeScopeResult?.fieldOutput?.priority || "Medium",
        closureEvidence:
          f.safeScopeResult?.fieldOutput?.verificationEvidence?.[0] ||
          "Supervisor verification",
        source: "HazLenz AI field output",
      };
    }

    return {
      ...action,
      title: action.title || action.description || `Field output action ${index + 1}`,
      priority:
        action.priority ||
        f.safeScopeResult?.fieldOutput?.priority ||
        "Medium",
      closureEvidence:
        action.closureEvidence ||
        action.verification ||
        f.safeScopeResult?.fieldOutput?.verificationEvidence?.[0] ||
        "Supervisor verification",
      source: action.source || "HazLenz AI field output",
    };
  });
}

function getFindingActionsForPdf(f: any) {
  const fieldOutputActions = getFieldOutputActionsForPdf(f);
  if (fieldOutputActions.length) {
    return [
      ...fieldOutputActions,
      ...(Array.isArray(f.manualActions) ? f.manualActions : []),
    ];
  }

  return (
    (Array.isArray(f.correctiveActions) && f.correctiveActions.length
      ? f.correctiveActions
      : null) ||
    [
      ...(Array.isArray(f.selectedGeneratedActions)
        ? f.selectedGeneratedActions
        : []),
      ...(Array.isArray(f.manualActions) ? f.manualActions : []),
      ...(Array.isArray(f.safeScopeResult?.generatedActions)
        ? f.safeScopeResult.generatedActions
        : []),
    ]
  );
}

function getFindingRiskForPdf(f: any) {
  return (
    f.safeScopeResult?.risk?.riskBand ||
    f.safeScopeResult?.risk?.operationalRisk?.matrixBand ||
    f.riskBand ||
    f.riskScore ||
    "Not rated"
  );
}

function getFindingConfidenceForPdf(f: any) {
  return normalizePdfPercent(
    f.safeScopeResult?.confidenceIntelligence?.overallConfidence ??
      f.safeScopeResult?.confidence,
  );
}

function getFindingCategoryForPdf(f: any) {
  return (
    f.category ||
    f.hazardCategory ||
    f.safeScopeResult?.classification ||
    "Uncategorized"
  );
}

function getSafeScopeValidationStatusForPdf(f: any) {
  return (
    f.safeScopeValidationStatus ||
    f.safeScopeResult?.validationStatus ||
    f.safeScopeResult?.snapshotSummary?.validationStatus ||
    (f.safeScopeResult?.reasoningSnapshotId ? "generated" : f.safeScopeResult ? "local_unvalidated" : "manual")
  );
}

function formatSafeScopeValidationStatusForPdf(status: any) {
  const value = String(status || "manual");
  const labels: Record<string, string> = {
    manual: "Manual finding",
    local_unvalidated: "HazLenz AI local review needed",
    generated: "HazLenz AI generated - review needed",
    requires_review: "HazLenz AI review required",
    validated_accepted: "HazLenz AI accepted by reviewer",
    validated_modified: "HazLenz AI modified by reviewer",
    validated_rejected: "HazLenz AI rejected by reviewer",
    requires_escalation: "HazLenz AI escalated",
    requires_more_evidence: "More evidence required",
  };
  return labels[value] || value.replace(/_/g, " ");
}

function asPdfList(value: any): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean).map((item) => String(item));
}

function formatEquipmentReasoningModeForPdf(value: any) {
  const mode = String(value || "insufficient_equipment_context");

  const labels: Record<string, string> = {
    specific_with_archetype_support: "Specific match + archetype support",
    specific_task_mechanism: "Specific equipment mechanism",
    archetype_fallback: "Archetype fallback",
    insufficient_equipment_context: "Insufficient equipment context",
  };

  return labels[mode] || mode.replace(/_/g, " ");
}

function buildEquipmentReasoningNotesForPdf(safeScopeResult: any): string[] {
  const summary = safeScopeResult?.equipmentReasoningSummary;
  const taskContext = safeScopeResult?.equipmentTaskMechanismContext;
  const archetypeContext = safeScopeResult?.equipmentArchetypeContext;

  if (!summary && !taskContext?.matched && !archetypeContext?.matched) {
    return [];
  }

  const primarySpecific = taskContext?.primaryMatch;
  const primaryArchetype = archetypeContext?.primaryMatch;

  const mechanisms = asPdfList(
    primarySpecific?.harmMechanisms || primaryArchetype?.harmMechanisms,
  )
    .slice(0, 4)
    .map((item) => item.replace(/_/g, " "));

  const domains = asPdfList(
    primarySpecific?.likelyHazardDomains || primaryArchetype?.likelyHazardDomains,
  )
    .slice(0, 4)
    .map((item) => item.replace(/_/g, " "));

  const notes = [
    `Equipment reasoning mode: ${formatEquipmentReasoningModeForPdf(summary?.primaryReasoningMode)}`,
    `Primary equipment context: ${summary?.primaryEquipmentContext || "Unknown"}`,
    `Primary mechanism/archetype: ${summary?.primaryMechanismOrArchetype || "Unknown"}`,
  ];

  if (summary?.supportingContext?.length) {
    notes.push(`Supporting equipment context: ${summary.supportingContext.slice(0, 2).join("; ")}`);
  }

  if (mechanisms.length) {
    notes.push(`Equipment harm mechanism(s): ${mechanisms.join("; ")}`);
  }

  if (domains.length) {
    notes.push(`Equipment-related domain(s): ${domains.join("; ")}`);
  }

  const rankingReasons = asPdfList(summary?.rankingReasons).slice(0, 2);
  if (rankingReasons.length) {
    notes.push(`Equipment ranking basis: ${rankingReasons.join("; ")}`);
  }

  const evidenceQuestions = asPdfList(summary?.evidenceGaps).slice(0, 3);
  if (evidenceQuestions.length) {
    notes.push(`Equipment evidence question(s): ${evidenceQuestions.join("; ")}`);
  }

  const cautions = asPdfList(summary?.cautions).slice(0, 2);
  if (cautions.length) {
    notes.push(`Equipment caution(s): ${cautions.join("; ")}`);
  }

  notes.push(
    "Equipment reasoning is context-only and requires qualified review; it does not declare violations, create citations, or override regulations.",
  );

  return notes;
}

function getStandardCitationForPdf(standard: any) {
  return (
    standard?.citation ||
    standard?.standard ||
    standard?.label ||
    standard?.title ||
    String(standard)
  );
}

function getStandardSummaryForPdf(standard: any) {
  return (
    standard?.rationale ||
    standard?.summary ||
    standard?.heading ||
    standard?.reasoning ||
    ""
  );
}


function formatPdfDate(value?: string) {
  if (!value) return new Date().toLocaleDateString("en-US");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

interface InspectionData {
  adminInfo: any;
  findings: any[];
  reportPackage?: any;
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
    const reportPackage = data.reportPackage || {
      label: "Field Report",
      shortLabel: "Basic",
      includesExecutiveSummary: false,
      includesSafeScopeSummary: false,
      includesSafeScopeTraceability: false,
      includesEvidenceGaps: false,
      includesConfidence: false,
      includesRepeatIntelligence: false,
      includesCompanyMetadata: false,
      includesAssignments: false,
      includesTrendSummary: false,
    };
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const centerX = pageWidth / 2;

    const addHeaderFooter = (d: any) => {
      const pageCount = d.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        d.setPage(i);
        d.setFontSize(8);
        d.setTextColor(148, 163, 184);
        d.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, {
          align: "center",
        });
      }
    };

    // 1. COVER PAGE
    doc.setLineWidth(0.4);

    if (adminInfo?.companyLogo) {
      try {
        doc.addImage(adminInfo.companyLogo, "PNG", centerX - 28, 52, 56, 32);
      } catch {
        // Ignore logo rendering errors so export does not fail.
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

    const inspectorLines = [
      adminInfo?.inspector || "N/A",
      ...(Array.isArray(adminInfo?.additionalInspectors)
        ? adminInfo.additionalInspectors.filter(Boolean)
        : []),
    ];

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

    // 2. EXECUTIVE SUMMARY PAGE
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
      (total, f) => total + getFindingStandardsForPdf(f).length,
      0,
    );
    const avgRisk =
      findings.length > 0
        ? (
            findings.reduce((acc, f) => acc + riskScore(f), 0) / findings.length
          ).toFixed(1)
        : "0.0";

    if (reportPackage.includesExecutiveSummary) {
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
      body: findings.map((f, i) => [
        i + 1,
        getFindingCategoryForPdf(f),
        f.description || "No description provided.",
      ]),
      headStyles: { fillColor: [226, 232, 240], textColor: [15, 23, 42] },
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
      if (i === 0) {
        doc.addPage();
        currentY = 24;
      } else if (currentY > pageHeight - 72) {
        doc.addPage();
        currentY = 24;
      }

      const ensureFindingSpace = (needed = 34) => {
        if (currentY + needed > pageHeight - 18) {
          doc.addPage();
          currentY = 24;
        }
      };

      // Title & Badge Row
      ensureFindingSpace(34);
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`FINDING #${i + 1}: ${getFindingCategoryForPdf(f)}`, 20, currentY);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.4);
      doc.line(20, currentY + 5, pageWidth - 20, currentY + 5);

      currentY += 14;

      // Description
      ensureFindingSpace(32);
      const descLines = doc.splitTextToSize(
        f.description || "No description provided.",
        pageWidth - 40,
      );
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("DESCRIPTION", 20, currentY);
      doc.setFont("helvetica", "normal");
      doc.text(descLines, 20, currentY + 6);
      currentY += descLines.length * 5 + 12;

      // Standards
      ensureFindingSpace(34);
      const standards = getFindingStandardsForPdf(f);
      const standardText = standards.length
        ? standards
            .map((standard: any) => {
              const citation = getStandardCitationForPdf(standard);
              const summary = getStandardSummaryForPdf(standard);
              return summary ? `${citation} — ${summary}` : citation;
            })
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
      ensureFindingSpace(34);
      const correctiveActions = getFindingActionsForPdf(f);
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
      const confidence = getFindingConfidenceForPdf(f);
      const riskBand = getFindingRiskForPdf(f);
      const safeScopeNotes = [];

      if (f.safeScopeResult) {
        safeScopeNotes.push(
          `Classification: ${f.safeScopeResult.classification || getFindingCategoryForPdf(f)}`,
        );
        safeScopeNotes.push(`Risk: ${riskBand}`);
        safeScopeNotes.push(
          `HazLenz AI review status: ${formatSafeScopeValidationStatusForPdf(getSafeScopeValidationStatusForPdf(f))}`,
        );
        if (reportPackage.includesConfidence && confidence !== null) {
          safeScopeNotes.push(`Confidence: ${confidence}%`);
        }

        if (
          reportPackage.includesSafeScopeTraceability &&
          f.safeScopeResult.reasoningSnapshotId
        ) {
          safeScopeNotes.push(
            `Reasoning snapshot: ${f.safeScopeResult.reasoningSnapshotId}`,
          );
        }

        const fieldOutputWarnings = asPdfList(
          f.safeScopeResult.fieldOutput?.warnings,
        );
        const reviewTriggers = fieldOutputWarnings.length
          ? fieldOutputWarnings
          : f.safeScopeResult.confidenceIntelligence?.reviewTriggers || [];

        if (reportPackage.includesConfidence && reviewTriggers.length) {
          safeScopeNotes.push(
            `Supervisor review trigger(s): ${reviewTriggers.slice(0, 3).join("; ")}`,
          );
        }

        const fieldEvidenceGaps = asPdfList(
          f.safeScopeResult.fieldOutput?.evidenceGaps,
        );
        const evidenceGaps = fieldEvidenceGaps.length
          ? fieldEvidenceGaps
          : f.safeScopeResult.knowledgeBrain?.evidenceGaps || [];

        if (reportPackage.includesEvidenceGaps && evidenceGaps.length) {
          safeScopeNotes.push(
            `Evidence gap(s): ${evidenceGaps.slice(0, 4).join("; ")}`,
          );
        }

        const supervisorQuestions = asPdfList(
          f.safeScopeResult.fieldOutput?.supervisorQuestions,
        );
        if (reportPackage.includesEvidenceGaps && supervisorQuestions.length) {
          safeScopeNotes.push(
            `Supervisor question(s): ${supervisorQuestions.slice(0, 4).join("; ")}`,
          );
        }

        const decisionSummary =
          f.safeScopeResult.decisionExplainability?.decisionSummary ||
          f.safeScopeResult.executiveJudgment?.auditReadySummary ||
          f.safeScopeResult.explanation;

        if (reportPackage.includesSafeScopeSummary && decisionSummary) {
          safeScopeNotes.push(`HazLenz AI summary: ${decisionSummary}`);
        }

        if (reportPackage.includesRepeatIntelligence) {
          const duplicate = f.safeScopeResult.duplicateIntelligence;
          if (duplicate?.possibleDuplicate) {
            safeScopeNotes.push(
              `Repeat intelligence: ${duplicate.recommendedSplitOrMergeAction || "Possible repeat finding requires review."}`,
            );
          }
        }

        if (
          reportPackage.includesSafeScopeSummary ||
          reportPackage.includesSafeScopeTraceability ||
          reportPackage.includesEvidenceGaps
        ) {
          safeScopeNotes.push(
            ...buildEquipmentReasoningNotesForPdf(f.safeScopeResult),
          );
        }
      }

      if (reportPackage.includesSafeScopeSummary && safeScopeNotes.length) {
        ensureFindingSpace(42);
        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.text("SAFESCOPE REVIEW SUMMARY", 20, currentY);
        doc.setTextColor(71, 85, 105);
        doc.setFont("helvetica", "normal");

        const safeScopeLines = doc.splitTextToSize(
          safeScopeNotes.join("\n"),
          pageWidth - 40,
        );
        doc.text(safeScopeLines, 20, currentY + 6);
        currentY += safeScopeLines.length * 5 + 15;
      }


      // 5. PHOTO EVIDENCE
      if (f.photos && f.photos.length > 0) {
        ensureFindingSpace(84);
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

      // Separator between findings
      if (i < findings.length - 1) {
        if (currentY > pageHeight - 54) {
          doc.addPage();
          currentY = 24;
        } else {
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.line(20, currentY + 2, pageWidth - 20, currentY + 2);
          currentY += 12;
        }
      }
    }

    // --- HazLenz AI Reasoning Audit Trace Appendix ---
    if (reportPackage.includesSafeScopeTraceability) {
      const findingsWithTrace = findings.filter(
        (f) =>
          f.safeScopeResult?.auditReadyReasoningTrace ||
          f.safeScopeResult?.reasoningTrace ||
          f.safeScopeResult?.decisionExplainability?.reasoningTrace
      );

      if (findingsWithTrace.length > 0) {
        doc.addPage();
        let appendixY = 24;

        doc.setTextColor(15, 23, 42); // Navy
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("HazLenz AI Reasoning Audit Trace", 20, appendixY);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text(
          "Complete defensible reasoning trace for verified safety classifications.",
          20,
          appendixY + 7,
        );

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(20, appendixY + 12, pageWidth - 20, appendixY + 12);

        appendixY += 22;

        const ensureAppendixSpace = (needed: number) => {
          if (appendixY + needed > pageHeight - 18) {
            doc.addPage();
            appendixY = 24;
          }
        };

        for (let idx = 0; idx < findingsWithTrace.length; idx++) {
          const f = findingsWithTrace[idx];
          const trace =
            f.safeScopeResult.auditReadyReasoningTrace ||
            f.safeScopeResult.reasoningTrace ||
            f.safeScopeResult.decisionExplainability?.reasoningTrace;

          if (!trace) continue;

          ensureAppendixSpace(35);
          doc.setTextColor(15, 23, 42); // Navy
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text(`Finding #${findings.indexOf(f) + 1} Trace (Trace ID: ${trace.traceId || "N/A"})`, 20, appendixY);
          
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(148, 163, 184);
          doc.text(`Generated At: ${trace.generatedAt || formatPdfDate()} • Trace Version: ${trace.traceVersion || "v1"}`, 20, appendixY + 5);

          appendixY += 11;

          // Observation Summary
          ensureAppendixSpace(18);
          doc.setTextColor(71, 85, 105);
          doc.setFontSize(9);
          doc.setFont("helvetica", "bold");
          doc.text("Observation Summary", 20, appendixY);
          doc.setFont("helvetica", "normal");
          const summaryText = doc.splitTextToSize(trace.observationSummary || f.description || "N/A", pageWidth - 40);
          doc.text(summaryText, 20, appendixY + 5);
          appendixY += summaryText.length * 4.5 + 10;

          // Primary Decision Path
          if (Array.isArray(trace.primaryDecisionPath) && trace.primaryDecisionPath.length) {
            ensureAppendixSpace(20);
            doc.setFont("helvetica", "bold");
            doc.text("Primary Decision Path Steps", 20, appendixY);
            doc.setFont("helvetica", "normal");
            const decisionLines = doc.splitTextToSize(
              trace.primaryDecisionPath.map((step: string) => `• ${step}`).join("\n"),
              pageWidth - 40,
            );
            doc.text(decisionLines, 20, appendixY + 5);
            appendixY += decisionLines.length * 4.5 + 10;
          }

          // Supporting / Weakening Evidence
          if (
            (Array.isArray(trace.supportingEvidence) && trace.supportingEvidence.length) ||
            (Array.isArray(trace.weakeningEvidence) && trace.weakeningEvidence.length) ||
            (Array.isArray(trace.missingCriticalFacts) && trace.missingCriticalFacts.length) ||
            (Array.isArray(trace.detectedContradictions) && trace.detectedContradictions.length)
          ) {
            ensureAppendixSpace(20);
            doc.setFont("helvetica", "bold");
            doc.text("Evidence Weighting Analysis", 20, appendixY);
            doc.setFont("helvetica", "normal");
            
            const evidenceParts: string[] = [];
            if (Array.isArray(trace.supportingEvidence) && trace.supportingEvidence.length) {
              evidenceParts.push("Supporting Signals: " + trace.supportingEvidence.join("; "));
            }
            if (Array.isArray(trace.weakeningEvidence) && trace.weakeningEvidence.length) {
              evidenceParts.push("Weakening/Conflicting Signals: " + trace.weakeningEvidence.join("; "));
            }
            if (Array.isArray(trace.missingCriticalFacts) && trace.missingCriticalFacts.length) {
              evidenceParts.push("Missing Critical Facts: " + trace.missingCriticalFacts.join("; "));
            }
            if (Array.isArray(trace.detectedContradictions) && trace.detectedContradictions.length) {
              evidenceParts.push("Detected Contradictions: " + trace.detectedContradictions.join("; "));
            }

            const evidenceLines = doc.splitTextToSize(evidenceParts.join("\n"), pageWidth - 40);
            doc.text(evidenceLines, 20, appendixY + 5);
            appendixY += evidenceLines.length * 4.5 + 10;
          }

          // Jurisdiction & Regulatory Source
          if (trace.jurisdictionReasoning || (Array.isArray(trace.sourceReasoning) && trace.sourceReasoning.length)) {
            ensureAppendixSpace(20);
            doc.setFont("helvetica", "bold");
            doc.text("Regulatory Routing & Citation Mapping", 20, appendixY);
            doc.setFont("helvetica", "normal");
            
            const routingParts: string[] = [];
            if (trace.jurisdictionReasoning) {
              routingParts.push(`Jurisdiction Basis: ${trace.jurisdictionReasoning}`);
            }
            if (Array.isArray(trace.sourceReasoning) && trace.sourceReasoning.length) {
              routingParts.push(`Citations Evaluated:\n` + trace.sourceReasoning.map((src: string) => `  - ${src}`).join("\n"));
            }

            const routingLines = doc.splitTextToSize(routingParts.join("\n"), pageWidth - 40);
            doc.text(routingLines, 20, appendixY + 5);
            appendixY += routingLines.length * 4.5 + 10;
          }

          // Causal Chains
          if (Array.isArray(trace.causalChainReasoning) && trace.causalChainReasoning.length) {
            ensureAppendixSpace(20);
            doc.setFont("helvetica", "bold");
            doc.text("Cross-Domain Causal Risk Chains", 20, appendixY);
            doc.setFont("helvetica", "normal");
            const causalLines = doc.splitTextToSize(
              trace.causalChainReasoning.map((c: string) => `• ${c}`).join("\n"),
              pageWidth - 40,
            );
            doc.text(causalLines, 20, appendixY + 5);
            appendixY += causalLines.length * 4.5 + 10;
          }

          // Corrective Action & Residual Risk Reasoning
          if (trace.correctiveActionReasoning || trace.residualRiskReasoning) {
            ensureAppendixSpace(20);
            doc.setFont("helvetica", "bold");
            doc.text("Controls & Residual Risk Logic", 20, appendixY);
            doc.setFont("helvetica", "normal");
            
            const logicParts: string[] = [];
            if (trace.correctiveActionReasoning) {
              logicParts.push(`Corrective Action Basis: ${trace.correctiveActionReasoning}`);
            }
            if (trace.residualRiskReasoning) {
              logicParts.push(`Residual Risk Rationale: ${trace.residualRiskReasoning}`);
            }

            const logicLines = doc.splitTextToSize(logicParts.join("\n"), pageWidth - 40);
            doc.text(logicLines, 20, appendixY + 5);
            appendixY += logicLines.length * 4.5 + 10;
          }

          // Reviewer Gates & Checklist
          if (
            (Array.isArray(trace.humanReviewGates) && trace.humanReviewGates.length) ||
            (Array.isArray(trace.reviewerChecklist) && trace.reviewerChecklist.length)
          ) {
            ensureAppendixSpace(20);
            doc.setFont("helvetica", "bold");
            doc.text("Safety Professional Review & Checklist", 20, appendixY);
            doc.setFont("helvetica", "normal");
            
            const reviewParts: string[] = [];
            if (Array.isArray(trace.humanReviewGates) && trace.humanReviewGates.length) {
              reviewParts.push(`Human Review Gates Triggered: ${trace.humanReviewGates.join("; ")}`);
            }
            if (Array.isArray(trace.reviewerChecklist) && trace.reviewerChecklist.length) {
              reviewParts.push(`Reviewer Checklist Required:\n` + trace.reviewerChecklist.map((item: string) => `  [ ] ${item}`).join("\n"));
            }

            const reviewLines = doc.splitTextToSize(reviewParts.join("\n"), pageWidth - 40);
            doc.text(reviewLines, 20, appendixY + 5);
            appendixY += reviewLines.length * 4.5 + 10;
          }

          // Advisory Limits & Boundary
          ensureAppendixSpace(20);
          doc.setFont("helvetica", "bold");
          doc.text("Advisory Boundaries & System Limitations", 20, appendixY);
          doc.setFont("helvetica", "normal");
          
          const boundaryParts: string[] = [];
          if (trace.advisoryBoundary) {
            boundaryParts.push(`Advisory Boundary: ${trace.advisoryBoundary}`);
          }
          if (Array.isArray(trace.safeScopeLimitations) && trace.safeScopeLimitations.length) {
            boundaryParts.push(`HazLenz AI Limitations: ${trace.safeScopeLimitations.join("; ")}`);
          }

          const boundaryLines = doc.splitTextToSize(boundaryParts.join("\n"), pageWidth - 40);
          doc.text(boundaryLines, 20, appendixY + 5);
          appendixY += boundaryLines.length * 4.5 + 15;

          // Finding Separator in appendix
          if (idx < findingsWithTrace.length - 1) {
            ensureAppendixSpace(10);
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.3);
            doc.line(20, appendixY, pageWidth - 20, appendixY);
            appendixY += 10;
          }
        }
      }
    }

    addHeaderFooter(doc);
    return doc;
  },
};
