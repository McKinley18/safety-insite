import { Injectable } from "@nestjs/common";
import { calculateRisk } from "../../engine/risk.engine";

@Injectable()
export class ExecutiveService {
  generateExecutiveSummary(report: any) {
    const text = report?.description || "";

    // ✅ SAFE risk calculation (aligned with engine)
    const risk = calculateRisk({
      text,
      industry: report?.industry || "msha",
      hazards: report?.hazards || [],
    });

    const hazards = report?.hazards || [];

    // Rank hazards (simple scoring fallback)
    const ranked = hazards.map((h: string, i: number) => {
      return `${i + 1}. ${h.replace(/_/g, " ")} — ${risk.riskBand}`;
    });

    // Controls (optional safe fallback)
    const controls = report?.controls || [];
    const missingControls = controls.map((c: string, i: number) => {
      return `${i + ranked.length + 1}. Missing ${c.replace(/_/g, " ")} — REQUIRED`;
    });

    const primaryHazard = hazards[0] || "hazard";

    return {
      reportId: report.id,

      overview: `Inspection identified: ${primaryHazard.replace(/_/g, " ")}.`,

      riskEvaluation: `${primaryHazard.replace(/_/g, " ")} presents a ${risk.riskBand.toLowerCase()}-risk condition (Score: ${risk.riskScore}).`,

      riskPriorities: [...ranked, ...missingControls].join("\n"),

      immediateAction:
        risk.riskBand === "CRITICAL"
          ? "IMMEDIATE ACTION REQUIRED: Stop work and correct hazard."
          : "Corrective action required.",

      prioritizedActions:
        risk.riskBand === "CRITICAL"
          ? "1. Stop work immediately\n2. Isolate hazard\n3. Apply controls\n4. Verify compliance"
          : "1. Inspect hazard\n2. Apply corrective action\n3. Verify condition",

      standards: (report?.standards || [])
        .map((s: any) => `${s.citation} — ${s.name || "Standard"}`)
        .join("\n"),

      correctiveActions: "",
      complianceNote: "",

      metadata: {
        riskScore: risk.riskScore,
        riskBand: risk.riskBand,
        severity: risk.severity,
        findingsCount: hazards.length,
      },

      findings: [],
    };
  }
}
