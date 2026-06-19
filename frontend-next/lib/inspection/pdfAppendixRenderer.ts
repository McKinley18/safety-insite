import jsPDF from "jspdf";
import { formatPdfDate } from "./pdfFormattingHelpers";

export function renderAuditTraceAppendix(
  doc: jsPDF,
  findings: any[],
  pageWidth: number,
  pageHeight: number,
  formatPdfDateFn: typeof formatPdfDate
) {
  const findingsWithTrace = findings.filter(
    (f) =>
      f.safeScopeResult?.auditReadyReasoningTrace ||
      f.safeScopeResult?.reasoningTrace ||
      f.safeScopeResult?.decisionExplainability?.reasoningTrace
  );

  if (findingsWithTrace.length === 0) return;

  doc.addPage();
  let appendixY = 24;

  doc.setTextColor(15, 23, 42);
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
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Finding #${findings.indexOf(f) + 1} Trace (Trace ID: ${trace.traceId || "N/A"})`, 20, appendixY);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated At: ${trace.generatedAt || formatPdfDateFn()} • Trace Version: ${trace.traceVersion || "v1"}`, 20, appendixY + 5);

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

    // Evidence Weighting Analysis
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

    // Regulatory Routing & Citation Mapping
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
