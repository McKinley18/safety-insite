// Regression coverage for the two documented §13.1 HazLenz Level-1 failures, both of which
// were LOTO cases and both of which produced customer-facing output that misdescribed a
// hazardous-energy finding.
//
// V1-HAZLENZ-DEGRADEDGAP-01 -- "Golden Hardening: 7. LOTO energized maintenance".
//   In degraded mode (which is the shipped Render path whenever
//   HAZLENZ_DISABLE_FULL_INTELLIGENCE_ON_RENDER is set or the pre-import heap guard fires)
//   the evidence questions were chosen from the RAW classifier label, ~3000 lines before the
//   classification is promoted. A lockout finding was therefore shipped as
//   `classification: "Lockout / Stored Energy"` while the questions underneath it asked
//   whether the GUARD was securely fastened and what the guarding dimensions were -- never
//   whether locks and tags had been applied or zero energy verified. The classification the
//   customer reads and the questions asked underneath it must describe the same hazard.
//
// V1-HAZLENZ-TAGOUTSTATE-01 -- "Production Path: FAIL tagged but not locked".
//   The classifier taxonomy had vocabulary for the lockout CONTROL ("lockout", "tagout") but
//   none for the tag-only STATE. "Equipment is tagged but not locked where locking is
//   possible" -- 29 CFR 1910.147(c)(2)(iii)/(c)(3), one of the most commonly written LOTO
//   deficiencies -- scored 1 point on the incidental word "equipment" and was filed as
//   Machine Guarding at 0.25 confidence.

process.env.RENDER = "true";
process.env.NODE_ENV = "production";
process.env.HAZLENZ_DISABLE_FULL_INTELLIGENCE_ON_RENDER = "true";

import { EvidenceFusionService } from "../evidence/evidence-fusion.service";
import { SafescopeV2Service } from "../safescope-v2.service";
import { WorkspaceGovernanceAccessService } from "../workspace-governance-access/workspace-governance-access.service";
import { WeightedClassifierService } from "../classifier/weighted-classifier.service";

let failures = 0;
function check(name: string, condition: boolean, detail?: unknown) {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    failures++;
    console.error(`FAIL ${name}`, detail !== undefined ? JSON.stringify(detail) : "");
  }
}

const service = new SafescopeV2Service(
  { async generateActionsFromReport() { return []; } } as any,
  new EvidenceFusionService(),
  {
    async suggest() {
      return [
        {
          citation: "29 CFR 1910.147",
          title: "The control of hazardous energy (lockout/tagout)",
          titleSummary: "The control of hazardous energy (lockout/tagout)",
          summary: "The control of hazardous energy (lockout/tagout)",
          agencyCode: "OSHA",
          jurisdiction: "osha_general_industry",
          score: 880,
          confidence: 0.92,
          candidateStatus: "candidate_standard",
          status: "candidate_standard",
          matchingReasons: ["Servicing and energy-isolation evidence supports LOTO."],
          evidenceNeeded: ["Confirm condition, exposure, and control status."],
          advisoryOnly: true,
          requiresQualifiedReview: true,
          source: ["hazlenz_loto_degraded_gap_alignment_regression"],
        },
      ];
    },
  } as any,
  undefined as any,
  {} as any,
  {} as any,
  {} as any,
  new WorkspaceGovernanceAccessService(),
  {
    route(input: { text: string; scopes?: string[] }) {
      const text = `${input.text || ""} ${(input.scopes || []).join(" ")}`.toLowerCase();
      if (/\b(lockout|loto|tagout|tagged|servicing|maintenance|unexpected startup|hazardous energy)\b/.test(text)) {
        return {
          jurisdiction: "osha_general_industry",
          hazardFamily: "machine_guarding_loto",
          equipmentFamily: "general_equipment",
          taskMechanism: "unexpected_startup",
          shardKey: "osha_general_industry/machine_guarding_loto/general",
          bundleIds: [],
          sourceKeys: [],
          confidence: 0.96,
          reasons: ["LOTO evidence detected"],
        };
      }
      return {
        jurisdiction: "osha_general_industry",
        hazardFamily: "unknown",
        equipmentFamily: "unknown",
        taskMechanism: "unknown",
        shardKey: "general/unknown",
        bundleIds: [],
        sourceKeys: [],
        confidence: 0.5,
        reasons: ["default routing"],
      };
    },
  } as any,
  { getShardSummary() { return { matchedShardCount: 0, citations: [] }; } } as any,
);

// The word the degraded gap set for a given hazard is recognisable by. These are the exact
// strings selectDegradedEvidenceProfile() emits, so an accidental re-route between hazard
// families is visible as a wrong marker rather than as a silent prose change.
const LOTO_GAP_MARKER = /machine-specific loto procedure|zero energy state|energy sources \(electrical/i;
const GUARDING_GAP_MARKER = /guard is securely fastened|guarding dimensions|guard placement/i;

async function run() {
  // ---- V1-HAZLENZ-DEGRADEDGAP-01 -----------------------------------------------------
  {
    const response: any = await service.classify(
      "Maintenance performed without lockout and stored energy not released on electrically-powered equipment while mechanic clears a jam on the running conveyor tail pulley.",
      ["msha"],
      [],
      "standard_5x5",
    );
    const gaps = (response.evidenceGaps || []).join(" ");
    check(
      "degraded LOTO finding is classified as hazardous energy",
      /lockout|stored energy|loto/i.test(String(response.classification || "")),
      { classification: response.classification },
    );
    check(
      "degraded LOTO finding asks LOTO evidence questions, not guarding questions",
      LOTO_GAP_MARKER.test(gaps) && !GUARDING_GAP_MARKER.test(gaps),
      { classification: response.classification, gaps: response.evidenceGaps },
    );
    check(
      "degraded reasoning summary describes hazardous-energy isolation, not barrier guarding",
      /hazardous energy isolation/i.test((response.reasoningSummary || []).join(" ")) &&
        !/barrier guarding/i.test((response.reasoningSummary || []).join(" ")),
      { reasoningSummary: response.reasoningSummary },
    );
  }

  {
    // Positive control: a genuine guarding finding with no hazardous-energy evidence must
    // still receive guarding questions. The repair reorders the LOTO branch ahead of the
    // guarding branch, so this is the case that proves it did not over-correct.
    const response: any = await service.classify(
      "At an aggregate mine, the tail pulley on a conveyor is missing guarding and miners walk near the pinch point during cleanup.",
      ["msha"],
      [],
      "standard_5x5",
    );
    const gaps = (response.evidenceGaps || []).join(" ");
    check(
      "genuine guarding finding still asks guarding evidence questions",
      GUARDING_GAP_MARKER.test(gaps) && !LOTO_GAP_MARKER.test(gaps),
      { classification: response.classification, gaps: response.evidenceGaps },
    );
  }

  {
    // The invariant itself, stated independently of any one scenario: in degraded mode the
    // evidence questions must have been selected from the classification that is actually
    // returned. degradedClassificationUsed records which classification chose them.
    for (const text of [
      "Maintenance performed without lockout and stored energy not released on electrically-powered equipment while mechanic clears a jam on the running conveyor tail pulley.",
      "At an aggregate mine, the tail pulley on a conveyor is missing guarding and miners walk near the pinch point during cleanup.",
      "In the warehouse, an electrical distribution panel has a missing cover and an open breaker slot exposing live 120V bus bars.",
      "Unlabeled plastic container filled with clear liquid found near maintenance workbench.",
    ]) {
      const response: any = await service.classify(text, ["osha_general_industry"], [], "standard_5x5");
      if (response.degraded !== true) continue;
      check(
        `degraded gaps were selected from the returned classification :: ${text.slice(0, 48)}`,
        String(response.degradedClassificationUsed || "") === String(response.classification || ""),
        { used: response.degradedClassificationUsed, returned: response.classification },
      );
    }
  }

  // ---- V1-HAZLENZ-TAGOUTSTATE-01 -----------------------------------------------------
  {
    const classifier = new WeightedClassifierService();

    for (const text of [
      "equipment is tagged but not locked where locking is possible while maintenance continues.",
      "the disconnect was tagged out but not locked out during the repair.",
      "servicing proceeded with tagout only on a switch that accepts a lock.",
      "the press was tagged without lockout while the operator cleared the die.",
    ]) {
      const result: any = classifier.classify(text);
      check(
        `tag-only state classifies as hazardous energy :: ${text.slice(0, 46)}`,
        /lockout|stored energy/i.test(String(result.classification || "")),
        { text, classification: result.classification, score: result.score, evidence: result.evidenceTokens },
      );
      check(
        `tag-only state is not returned at throwaway confidence :: ${text.slice(0, 46)}`,
        Number(result.confidence || 0) >= 0.7,
        { text, confidence: result.confidence, confidenceBand: result.confidenceBand },
      );
    }

    // Negative controls: the new vocabulary must not claim a LOTO hazard from a correctly
    // controlled state, nor from an unrelated out-of-service tag.
    const controlled: any = classifier.classify(
      "the line is locked out, de-energized, and zero energy was verified before maintenance begins.",
    );
    check(
      "verified-safe lockout language is not scored as a tag-only deficiency",
      !/tagged but not locked|tagout only|tagged out only|tagged without lockout/i.test(
        JSON.stringify(controlled.evidenceTokens || []),
      ),
      { classification: controlled.classification, evidence: controlled.evidenceTokens },
    );

    const ladder: any = classifier.classify(
      "the defective ladder was tagged out of service and removed from the work area.",
    );
    check(
      "an out-of-service equipment tag is not converted into a LOTO finding",
      !/lockout|stored energy/i.test(String(ladder.classification || "")),
      { classification: ladder.classification, evidence: ladder.evidenceTokens },
    );
  }

  {
    // End-to-end: the tag-only state must reach the customer as a hazardous-energy finding
    // carrying 1910.147, not as a guarding finding.
    const response: any = await service.classify(
      "Equipment is tagged but not locked where locking is possible while maintenance continues.",
      ["osha_general_industry"],
      ["tagged", "not locked", "maintenance"],
      "standard_5x5",
    );
    check(
      "tag-only state reaches the customer as a hazardous-energy family",
      /machine_guarding_loto|lockout|stored|hazardous_energy/i.test(String(response.hazardCategory || "")),
      { classification: response.classification, hazardCategory: response.hazardCategory },
    );
    check(
      "tag-only state still carries 29 CFR 1910.147",
      JSON.stringify(response.suggestedStandards || response.standards || []).includes("1910.147"),
      { suggestedStandards: response.suggestedStandards },
    );
  }

  console.log("=".repeat(60));
  if (failures > 0) {
    console.error(`HazLenz LOTO degraded-gap alignment regression: ${failures} FAILED`);
    process.exit(1);
  }
  console.log("HazLenz LOTO degraded-gap alignment regression: all invariants passed, 0 failed");
}

run().catch((error) => {
  console.error("HazLenz LOTO degraded-gap alignment regression crashed", error);
  process.exit(1);
});
