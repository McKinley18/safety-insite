import { StandardsBridgeService } from "./standards-bridge.service";
import { Injectable, Optional, ForbiddenException } from "@nestjs/common";
import { WeightedClassifierService } from "./classifier/weighted-classifier.service";
import { evaluateRisk } from "./risk/risk-engine";
import { ActionEngineService } from "../action-engine/action-engine.service";
import { EvidenceFusionService } from "./evidence/evidence-fusion.service";
import { ApplicableStandardsService } from "../applicable-standards/applicable-standards.service";
import type { SafeScopeIntelligenceOrchestrator } from "./orchestration/intelligence-orchestrator.service";
import { STANDARDS_INTELLIGENCE_SEED } from "./standards-intelligence/standards-intelligence.seed";

function getMemorySnapshot() {
  const usage = process.memoryUsage();
  return {
    rssMb: Math.round(usage.rss / 1024 / 1024),
    heapUsedMb: Math.round(usage.heapUsed / 1024 / 1024),
    heapTotalMb: Math.round(usage.heapTotal / 1024 / 1024),
    externalMb: Math.round(usage.external / 1024 / 1024),
  };
}
import { buildSourceSynthesis } from "../safescope-knowledge/sources/source-synthesis-helper";
import { getEvidenceGapIntelligence } from "./intelligence/evidence-gap-intelligence";
import { getCorrectiveActionIntelligence } from "./intelligence/corrective-action-intelligence";
import { SafeScopeNativeReasoningService } from "./native-reasoning/native-reasoning.service";
import { SafeScopeReasoningOrchestratorService } from "./reasoning-orchestrator/reasoning-orchestrator.service";
import { InspectionCitationRecoveryService } from "./inspection-intelligence/inspection-citation-recovery.service";
import { SafeScopeReasoningRequest } from "./reasoning-orchestrator/reasoning-orchestrator.types";
import { VisualEvidenceReasoningService } from "./visual-evidence-reasoning/visual-evidence-reasoning.service";
import { VisualEvidenceReasoningInput, Attachment } from "./visual-evidence-reasoning/visual-evidence-reasoning.types";
import { RealImageAnalysisService } from "./real-image-analysis/real-image-analysis.service";
import { RealImageAnalysisInput } from "./real-image-analysis/real-image-analysis.types";
import { OfflineReasoningInput } from "./offline-reasoning-mobile-resilience/offline-reasoning-mobile-resilience.types";
import { OfflineReasoningMobileResilienceService } from "./offline-reasoning-mobile-resilience/offline-reasoning-mobile-resilience.service";
import { SafeScopePersistenceService } from "./persistence/persistence.service";
import { WorkspaceGovernanceAccessService } from "./workspace-governance-access/workspace-governance-access.service";
import { UserGovernanceContext } from "./workspace-governance-access/workspace-governance.types";
import type { HazLenzClarificationAnswerInput, StructuredObservationInput } from "./dto/classify.dto";
import { HazLenzKnowledgeRouterService } from "./knowledge-router/hazlenz-knowledge-router.service";
import { logKnowledgeTelemetry, isHazLenzKnowledgeTelemetryEnabled } from "./telemetry/hazlenz-knowledge-telemetry";
import { HazLenzKnowledgeShardService } from "./knowledge-shards/hazlenz-knowledge-shard.service";
import { EXPERT_APPLICABILITY_RULES } from "./inspection-intelligence/standard-applicability.rules";
import {
  buildSupplementalGuidance,
  getSupplementalKnowledgeForContext,
} from "./supplemental-knowledge/supplemental-guidance";



@Injectable()
export class SafescopeV2Service {
  private classifier = new WeightedClassifierService();
  private bridge = new StandardsBridgeService();
  private nativeReasoningService = new SafeScopeNativeReasoningService();
  private reasoningOrchestratorService = new SafeScopeReasoningOrchestratorService();
  private citationRecoveryService = new InspectionCitationRecoveryService();
  private lazyIntelligenceOrchestrator?: any;

  constructor(
    private readonly actionEngine: ActionEngineService,
    private readonly evidenceFusion: EvidenceFusionService,
    private readonly applicableStandards: ApplicableStandardsService,
    @Optional()
    private readonly intelligenceOrchestrator: any,
    private readonly visualService: VisualEvidenceReasoningService,
    private readonly imageAnalysisService: RealImageAnalysisService,
    private readonly offlineService: OfflineReasoningMobileResilienceService,
    private readonly access: WorkspaceGovernanceAccessService,
    private readonly knowledgeRouter: HazLenzKnowledgeRouterService,
    private readonly knowledgeShardService: HazLenzKnowledgeShardService,
    @Optional()
    private readonly persistence?: SafeScopePersistenceService,
  ) {}

  private appendUnique(values: string[] | undefined, additions?: string[]) {
    const seen = new Set((values || []).map((value) => String(value).toLowerCase()));
    const merged = [...(values || [])];
    for (const addition of additions || []) {
      const clean = String(addition || "").replace(/\s+/g, " ").trim();
      if (!clean || seen.has(clean.toLowerCase())) continue;
      seen.add(clean.toLowerCase());
      merged.push(clean);
    }
    return merged.slice(0, 12);
  }

  private mergeStructuredObservation(
    base?: StructuredObservationInput,
    overlay?: StructuredObservationInput,
  ): StructuredObservationInput | undefined {
    if (!base && !overlay) return undefined;
    const pick = <T>(field: keyof StructuredObservationInput): T | undefined => {
      const overlayValue = overlay?.[field] as T | undefined;
      if (overlayValue !== undefined && overlayValue !== null && String(overlayValue).trim?.() !== "") {
        return overlayValue;
      }
      return base?.[field] as T | undefined;
    };
    return {
      narrative: pick<string>("narrative"),
      jurisdiction: pick<StructuredObservationInput["jurisdiction"]>("jurisdiction"),
      workEnvironment: pick<string>("workEnvironment"),
      workArea: pick<string>("workArea"),
      taskBeingPerformed: pick<string>("taskBeingPerformed"),
      observedCondition: pick<string>("observedCondition"),
      workerInteraction: pick<string>("workerInteraction"),
      energyState: pick<StructuredObservationInput["energyState"]>("energyState"),
      additionalContext: pick<string>("additionalContext"),
      equipmentInvolved: this.appendUnique(base?.equipmentInvolved, overlay?.equipmentInvolved || []),
      materialOrSubstance: this.appendUnique(base?.materialOrSubstance, overlay?.materialOrSubstance || []),
      exposurePathway: this.appendUnique(base?.exposurePathway, overlay?.exposurePathway || []),
      controlsPresent: this.appendUnique(base?.controlsPresent, overlay?.controlsPresent || []),
      controlsMissing: this.appendUnique(base?.controlsMissing, overlay?.controlsMissing || []),
      potentialConsequence: this.appendUnique(base?.potentialConsequence, overlay?.potentialConsequence || []),
      affectedPeople: this.appendUnique(base?.affectedPeople, overlay?.affectedPeople || []),
      evidenceSource: this.appendUnique(base?.evidenceSource as any, overlay?.evidenceSource as any) as any,
      userConfirmedFacts: [
        ...(base?.userConfirmedFacts || []),
        ...(overlay?.userConfirmedFacts || []),
      ].slice(0, 30),
      inferredFacts: [
        ...(base?.inferredFacts || []),
        ...(overlay?.inferredFacts || []),
      ].slice(0, 30),
      unknownFacts: this.appendUnique(base?.unknownFacts, overlay?.unknownFacts || []),
      unresolvedContradictions: [
        ...(base?.unresolvedContradictions || []),
        ...(overlay?.unresolvedContradictions || []),
      ].slice(0, 12),
    };
  }

  private normalizeClarificationAnswers(input?: HazLenzClarificationAnswerInput[]) {
    const allowedUnits = new Set(["ft", "feet", "in", "inch", "m", "meter", "meters"]);
    const exactOptions: Record<string, string[]> = {
      "jurisdiction-work-environment": ["Mine or quarry", "Construction site", "Manufacturing or plant", "Warehouse", "Other workplace", "Not sure"],
      "machine-energy-state": ["Running or operating", "Capable of startup", "Stopped only", "Deenergized", "Locked out", "Not sure"],
      "machine-task": ["Operating", "Cleaning", "Maintenance or repair", "Clearing a jam", "Inspection only", "Not sure"],
      "machine-controls": ["Guard missing or removed", "Guard installed", "Lockout/tagout applied", "Zero-energy verified", "No control verified", "Not sure"],
      "electrical-damage-exposure": ["Internal conductors exposed", "Outer jacket damage only", "Unknown", "Not sure"],
      "electrical-wet-location": ["Yes", "No", "Not sure"],
      "fall-surface-control": ["Defective ladder", "Incorrect ladder use", "Unprotected edge or opening", "Scaffold", "Roof", "Platform", "Not sure"],
      "chemical-exposure-path": ["Walking surface", "Inhalation or vapor", "Skin or eye contact", "Drain or environment", "No exposure observed", "Not sure"],
    };
    const clean = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();
    const safeShortText = (value: unknown) => {
      const text = clean(value).slice(0, 160);
      if (/\b(?:29|30)\s*CFR\b|§|\b(?:1910|1926|56|57|75|77)\.\d+/i.test(text)) return "";
      return text;
    };
    const structured: StructuredObservationInput = {
      userConfirmedFacts: [],
      unknownFacts: [],
    };
    const answeredQuestionIds: string[] = [];
    const invalidAnswers: any[] = [];
    const answerEvidence: string[] = [];
    const addFact = (field: string, value: any, sourceQuestionId: string) => {
      structured.userConfirmedFacts = [
        ...(structured.userConfirmedFacts || []),
        { field, value, sourceQuestionId },
      ];
      answerEvidence.push(`User answer ${sourceQuestionId}: ${field} = ${Array.isArray(value) ? value.join(", ") : value}.`);
    };
    const addUnknown = (field: string, sourceQuestionId: string) => {
      structured.unknownFacts = this.appendUnique(structured.unknownFacts, [field]);
      addFact(field, "unknown", sourceQuestionId);
    };
    const optionsFor = (answer: HazLenzClarificationAnswerInput) => {
      const raw = Array.isArray(answer.selectedOptions) && answer.selectedOptions.length
        ? answer.selectedOptions
        : [answer.value ?? answer.answer].filter((value) => value !== undefined && value !== null).map(clean);
      const allowed = exactOptions[answer.questionId];
      if (!allowed) return raw.map(clean).filter(Boolean);
      const allowedLower = new Map(allowed.map((option) => [option.toLowerCase(), option]));
      const normalized = raw.map(clean).map((item) => allowedLower.get(item.toLowerCase())).filter(Boolean) as string[];
      if (raw.length && !normalized.length) {
        invalidAnswers.push({ questionId: answer.questionId, reason: "Unsupported option value ignored." });
      }
      return Array.from(new Set(normalized));
    };

    for (const answer of Array.isArray(input) ? input.slice(0, 20) : []) {
      const questionId = clean(answer?.questionId);
      if (!questionId || answeredQuestionIds.includes(questionId)) continue;
      answeredQuestionIds.push(questionId);
      const selected = optionsFor({ ...answer, questionId });
      const first = selected[0] || safeShortText(answer.value ?? answer.answer);
      const isUnknown = !first || /\b(unknown|not sure|cannot verify|can't verify|unsure)\b/i.test(first);

      if (isUnknown) {
        const field = questionId.includes("jurisdiction") ? "jurisdiction" :
          questionId.includes("energy") ? "energyState" :
          questionId.includes("electrical") ? "electricalExposure" :
          questionId.includes("fall") ? "fallExposure" :
          questionId.includes("chemical") ? "chemicalExposure" :
          "materialFact";
        addUnknown(field, questionId);
        continue;
      }

      switch (questionId) {
        case "jurisdiction-work-environment":
          if (first === "Mine or quarry") {
            structured.jurisdiction = "msha";
            structured.workEnvironment = "mine or quarry";
          } else if (first === "Construction site") {
            structured.jurisdiction = "osha-construction";
            structured.workEnvironment = "construction site";
          } else if (first === "Manufacturing or plant" || first === "Warehouse") {
            structured.jurisdiction = "osha-general-industry";
            structured.workEnvironment = first.toLowerCase();
          } else {
            structured.workEnvironment = first;
          }
          addFact("jurisdiction", structured.jurisdiction || "unknown", questionId);
          break;
        case "machine-energy-state":
          if (first === "Running or operating") structured.energyState = "operating";
          if (first === "Capable of startup") structured.energyState = "energized";
          if (first === "Stopped only") structured.energyState = "stopped";
          if (first === "Deenergized") structured.energyState = "deenergized";
          if (first === "Locked out") structured.energyState = "locked-out";
          addFact("energyState", structured.energyState || first, questionId);
          break;
        case "machine-task":
          structured.taskBeingPerformed = first;
          addFact("taskBeingPerformed", first, questionId);
          break;
        case "machine-controls":
          if (selected.includes("Guard missing or removed")) structured.controlsMissing = this.appendUnique(structured.controlsMissing, ["machine guarding"]);
          if (selected.includes("Guard installed")) structured.controlsPresent = this.appendUnique(structured.controlsPresent, ["machine guard installed"]);
          if (selected.includes("Lockout/tagout applied")) structured.controlsPresent = this.appendUnique(structured.controlsPresent, ["lockout/tagout applied"]);
          if (selected.includes("Zero-energy verified")) {
            structured.controlsPresent = this.appendUnique(structured.controlsPresent, ["zero-energy verified"]);
            structured.energyState = "locked-out";
          }
          if (selected.includes("No control verified")) structured.controlsMissing = this.appendUnique(structured.controlsMissing, ["no control verified"]);
          addFact("controls", selected, questionId);
          break;
        case "electrical-damage-exposure":
          if (first === "Internal conductors exposed") {
            structured.observedCondition = "internal conductors exposed";
            structured.controlsMissing = this.appendUnique(structured.controlsMissing, ["insulation or guarding of energized parts"]);
            structured.exposurePathway = this.appendUnique(structured.exposurePathway, ["shock", "electrical contact"]);
          } else if (first === "Outer jacket damage only") {
            structured.observedCondition = "outer jacket damage only; internal conductors not visible";
            structured.controlsPresent = this.appendUnique(structured.controlsPresent, ["no visible internal conductors"]);
          }
          addFact("electricalExposure", first, questionId);
          break;
        case "electrical-wet-location":
          if (/^yes$/i.test(first)) structured.controlsPresent = this.appendUnique(structured.controlsPresent, ["GFCI protection present"]);
          if (/^no$/i.test(first)) structured.controlsMissing = this.appendUnique(structured.controlsMissing, ["GFCI protection"]);
          addFact("wetLocationGfci", first, questionId);
          break;
        case "fall-height": {
          const numeric = Number(answer.value ?? answer.answer);
          const unit = clean(answer.unit || "ft").toLowerCase();
          if (!Number.isFinite(numeric) || numeric < 0 || numeric > 500 || !allowedUnits.has(unit)) {
            invalidAnswers.push({ questionId, reason: "Invalid numeric height or unsupported unit ignored." });
            break;
          }
          const normalized = `${numeric} ${unit}`;
          structured.additionalContext = [structured.additionalContext, `Approximate fall height: ${normalized}.`].filter(Boolean).join(" ");
          structured.exposurePathway = this.appendUnique(structured.exposurePathway, ["fall from elevation"]);
          addFact("fallHeight", normalized, questionId);
          break;
        }
        case "fall-surface-control":
          structured.observedCondition = first;
          if (/ladder/i.test(first)) structured.equipmentInvolved = this.appendUnique(structured.equipmentInvolved, ["ladder"]);
          if (/scaffold/i.test(first)) structured.equipmentInvolved = this.appendUnique(structured.equipmentInvolved, ["scaffold"]);
          if (/edge|opening|roof|platform/i.test(first)) structured.exposurePathway = this.appendUnique(structured.exposurePathway, ["fall from elevation"]);
          addFact("fallSurfaceOrControl", first, questionId);
          break;
        case "chemical-substance": {
          const value = safeShortText(answer.value ?? answer.answer);
          if (!value) {
            invalidAnswers.push({ questionId, reason: "Potential standard-injection text ignored." });
            break;
          }
          structured.materialOrSubstance = this.appendUnique(structured.materialOrSubstance, [value]);
          addFact("materialOrSubstance", value, questionId);
          break;
        }
        case "chemical-exposure-path":
          structured.exposurePathway = this.appendUnique(structured.exposurePathway, selected);
          addFact("chemicalExposurePathway", selected, questionId);
          break;
        default:
          invalidAnswers.push({ questionId, reason: "Unknown question ID ignored." });
      }
    }

    return {
      structured: this.normalizeStructuredObservation(structured),
      answeredQuestionIds,
      invalidAnswers,
      answerEvidence,
    };
  }

  private detectStructuredContradictions(input?: StructuredObservationInput, narrative = "") {
    const contradictions: NonNullable<StructuredObservationInput["unresolvedContradictions"]> = [];
    const text = [
      narrative,
      input?.narrative,
      input?.observedCondition,
      input?.additionalContext,
    ].filter(Boolean).join(" ").toLowerCase();
    const presentControls = (input?.controlsPresent || []).join(" ").toLowerCase();
    const missingControls = (input?.controlsMissing || []).join(" ").toLowerCase();
    const env = `${input?.jurisdiction || ""} ${input?.workEnvironment || ""}`.toLowerCase();
    const push = (field: string, originalValue: string, answerValue: string, reason: string) => {
      contradictions.push({ field, originalValue, answerValue, reason });
    };

    if (/\b(energized|operating|running|live)\b/.test(text) && /\b(locked out|lockout|zero-energy|zero energy|deenergized|de-energized)\b/.test(`${presentControls} ${input?.energyState || ""}`)) {
      push("energyState", "energized or operating", String(input?.energyState || presentControls), "Observation and structured evidence conflict on whether hazardous energy is controlled.");
    }
    if (/\b(locked out|zero-energy|zero energy|deenergized|de-energized)\b/.test(text) && /\b(energized|operating|running)\b/.test(String(input?.energyState || ""))) {
      push("energyState", "locked out or deenergized", String(input?.energyState), "Observation and answer conflict on equipment energy state.");
    }
    if (/\b(guard (?:is |was |has been )?missing|guard (?:is |was |has been )?removed|unguarded|missing guard)\b/.test(text) && /\b(guard installed|guard present|intact guard|machine guard installed)\b/.test(presentControls)) {
      push("guarding", "guard missing or removed", presentControls, "Observation and answer conflict on guard status.");
    }
    if (/\b(mine|miner|quarry|msha)\b/.test(text) && /\bconstruction\b/.test(env)) {
      push("jurisdiction", "mine/MSHA context", env, "Observation and answer conflict on jurisdiction context.");
    }
    if (/\bconstruction|jobsite\b/.test(text) && /\bmsha|mine|quarry\b/.test(env)) {
      push("jurisdiction", "construction context", env, "Observation and answer conflict on jurisdiction context.");
    }
    if (/\b(no exposure|no employee exposure|no worker exposure|isolated from access)\b/.test(text) && /\b(contact|reach|direct exposure|within reach)\b/.test(String(input?.workerInteraction || "").toLowerCase())) {
      push("workerInteraction", "no exposure", String(input?.workerInteraction), "Observation and answer conflict on worker exposure.");
    }
    return contradictions.slice(0, 6);
  }

  private normalizeStructuredObservation(input?: StructuredObservationInput, fallbackNarrative = ""): StructuredObservationInput | undefined {
    if (!input || typeof input !== "object") {
      return undefined;
    }

    const clean = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();
    const textArray = (value: unknown): string[] =>
      (Array.isArray(value) ? value : value ? [value] : [])
        .map(clean)
        .filter(Boolean)
        .slice(0, 12);
    const jurisdiction = clean(input.jurisdiction).toLowerCase();
    const energyState = clean(input.energyState).toLowerCase();
    const allowedJurisdictions = new Set(["msha", "osha-general-industry", "osha-construction", "unknown"]);
    const allowedEnergyStates = new Set(["energized", "operating", "stopped", "deenergized", "locked-out", "unknown"]);

    return {
      narrative: clean(input.narrative) || clean(fallbackNarrative),
      jurisdiction: allowedJurisdictions.has(jurisdiction) ? input.jurisdiction : undefined,
      workEnvironment: clean(input.workEnvironment) || undefined,
      workArea: clean(input.workArea) || undefined,
      taskBeingPerformed: clean(input.taskBeingPerformed) || undefined,
      equipmentInvolved: textArray(input.equipmentInvolved),
      materialOrSubstance: textArray(input.materialOrSubstance),
      observedCondition: clean(input.observedCondition) || undefined,
      workerInteraction: clean(input.workerInteraction) || undefined,
      exposurePathway: textArray(input.exposurePathway),
      energyState: allowedEnergyStates.has(energyState) ? input.energyState : undefined,
      controlsPresent: textArray(input.controlsPresent),
      controlsMissing: textArray(input.controlsMissing),
      potentialConsequence: textArray(input.potentialConsequence),
      affectedPeople: textArray(input.affectedPeople),
      evidenceSource: textArray(input.evidenceSource) as any,
      additionalContext: clean(input.additionalContext) || undefined,
      userConfirmedFacts: Array.isArray(input.userConfirmedFacts)
        ? input.userConfirmedFacts
            .map((fact) => ({
              field: clean(fact?.field),
              value: Array.isArray(fact?.value)
                ? textArray(fact.value)
                : typeof fact?.value === "number" || typeof fact?.value === "boolean" || fact?.value === null
                  ? fact.value
                  : clean(fact?.value),
              sourceQuestionId: clean(fact?.sourceQuestionId) || undefined,
            }))
            .filter((fact) => fact.field)
            .slice(0, 30)
        : undefined,
      inferredFacts: Array.isArray(input.inferredFacts)
        ? input.inferredFacts
            .map((fact) => ({
              field: clean(fact?.field),
              value: Array.isArray(fact?.value) ? textArray(fact.value) : clean(fact?.value),
              confidence: ["low", "medium", "high"].includes(clean(fact?.confidence).toLowerCase())
                ? (clean(fact?.confidence).toLowerCase() as "low" | "medium" | "high")
                : undefined,
            }))
            .filter((fact) => fact.field && (Array.isArray(fact.value) ? fact.value.length : fact.value))
            .slice(0, 30)
        : undefined,
      unknownFacts: textArray(input.unknownFacts),
      unresolvedContradictions: Array.isArray(input.unresolvedContradictions)
        ? input.unresolvedContradictions
            .map((conflict) => ({
              field: clean(conflict?.field),
              originalValue: clean(conflict?.originalValue) || undefined,
              answerValue: clean(conflict?.answerValue) || undefined,
              reason: clean(conflict?.reason),
              sourceQuestionId: clean(conflict?.sourceQuestionId) || undefined,
            }))
            .filter((conflict) => conflict.field && conflict.reason)
            .slice(0, 12)
        : undefined,
    };
  }

  private structuredObservationToScopes(input?: StructuredObservationInput): string[] | undefined {
    switch (input?.jurisdiction) {
      case "msha":
        return ["msha"];
      case "osha-general-industry":
        return ["osha_general"];
      case "osha-construction":
        return ["osha_construction"];
      default:
        return undefined;
    }
  }

  private buildStructuredObservationEvidenceTexts(input?: StructuredObservationInput): string[] {
    if (!input) return [];
    const rows = [
      input.taskBeingPerformed ? `Task being performed: ${input.taskBeingPerformed}.` : "",
      input.equipmentInvolved?.length ? `Equipment or area involved: ${input.equipmentInvolved.join(", ")}.` : "",
      input.materialOrSubstance?.length ? `Material or substance involved: ${input.materialOrSubstance.join(", ")}.` : "",
      input.workerInteraction ? `Worker interaction or exposure: ${input.workerInteraction}.` : "",
      input.exposurePathway?.length ? `Exposure pathway: ${input.exposurePathway.join(", ")}.` : "",
      input.energyState ? `Equipment energy state: ${input.energyState}.` : "",
      input.controlsPresent?.length ? `Controls present: ${input.controlsPresent.join(", ")}.` : "",
      input.controlsMissing?.length ? `Controls missing or ineffective: ${input.controlsMissing.join(", ")}.` : "",
      input.potentialConsequence?.length ? `Potential consequence: ${input.potentialConsequence.join(", ")}.` : "",
      input.workEnvironment ? `Work environment or jurisdiction context: ${input.workEnvironment}.` : "",
      input.workArea ? `Work area: ${input.workArea}.` : "",
      input.observedCondition ? `Observed condition: ${input.observedCondition}.` : "",
      input.additionalContext ? `Additional context: ${input.additionalContext}.` : "",
      input.userConfirmedFacts?.length
        ? `User-confirmed facts: ${input.userConfirmedFacts
            .map((fact) => `${fact.field}=${Array.isArray(fact.value) ? fact.value.join(", ") : String(fact.value ?? "")}`)
            .join("; ")}.`
        : "",
      input.unknownFacts?.length ? `Facts still unknown: ${input.unknownFacts.join(", ")}.` : "",
      input.unresolvedContradictions?.length
        ? `Unresolved contradictions: ${input.unresolvedContradictions
            .map((conflict) => `${conflict.field}: ${conflict.reason}`)
            .join("; ")}.`
        : "",
    ].filter(Boolean);

    return rows.length ? [`Structured observation evidence:\n${rows.join("\n")}`] : [];
  }

  private buildStructuredEvidenceUsed(input?: StructuredObservationInput, fusedText = "") {
    const facts: Array<{ fact: string; source: string; effect: string }> = [];
    const push = (fact: string | undefined, source: string, effect: string) => {
      const clean = String(fact || "").replace(/\s+/g, " ").trim();
      if (clean) facts.push({ fact: clean, source, effect });
    };
    const text = String(fusedText || input?.narrative || "").toLowerCase();

    if (input) {
      push(input.taskBeingPerformed, "taskBeingPerformed", "Supports task and servicing/exposure mechanism selection.");
      push(input.energyState, "energyState", "Constrains hazardous-energy, startup, and shutdown reasoning.");
      push(input.workerInteraction, "workerInteraction", "Supports exposure and risk applicability.");
      push(input.jurisdiction, "jurisdiction", "Constrains OSHA/MSHA standard families.");
    }

    if (input?.equipmentInvolved?.length) {
      push(input.equipmentInvolved.join(", "), "equipmentInvolved", "Supports equipment-specific hazard and standard selection.");
    }
    if (input?.controlsPresent?.length) {
      push(input.controlsPresent.join(", "), "controlsPresent", "Identifies existing protections that may suppress unsupported hazard conclusions.");
    }
    if (input?.controlsMissing?.length) {
      push(input.controlsMissing.join(", "), "controlsMissing", "Supports missing-control and corrective-action routing.");
    }
    if (input?.exposurePathway?.length) {
      push(input.exposurePathway.join(", "), "exposurePathway", "Supports mechanism of injury and risk scoring.");
    }
    if (input?.userConfirmedFacts?.length) {
      for (const fact of input.userConfirmedFacts.slice(0, 6)) {
        push(
          `${fact.field}: ${Array.isArray(fact.value) ? fact.value.join(", ") : String(fact.value ?? "")}`,
          fact.sourceQuestionId || "clarificationAnswer",
          "Uses the user's follow-up answer as structured evidence.",
        );
      }
    }
    if (input?.unknownFacts?.length) {
      push(input.unknownFacts.join(", "), "unknownFacts", "Preserves uncertainty instead of inventing missing facts.");
    }
    if (input?.unresolvedContradictions?.length) {
      push(
        input.unresolvedContradictions.map((conflict) => `${conflict.field}: ${conflict.reason}`).join("; "),
        "unresolvedContradictions",
        "Reduces certainty and requires confirmation before final standards selection.",
      );
    }

    if (!input?.taskBeingPerformed && /\b(clear(?:ing)?|unjam|jammed|jam)\b/i.test(text) && /\b(conveyor|machine|belt)\b/i.test(text)) {
      push("Worker was clearing a jam", "narrative", "Supports servicing and hazardous-energy analysis.");
    }
    if (!input?.energyState && /\b(energized|operating|running|live)\b/i.test(text)) {
      push("Equipment was energized or operating", "narrative", "Supports hazardous-energy and serious-exposure analysis.");
    }
    if (!(input?.controlsMissing || []).length && /\b(guard (?:has been )?removed|removed guard|guard missing|unguarded)\b/i.test(text)) {
      push("Guard was removed or missing", "narrative", "Supports machine-guarding and missing-control analysis.");
    }
    if (!input?.workerInteraction && /\b(worker|employee|miner)\b/i.test(text) && /\b(clear(?:ing)?|reach|contact|exposed|near)\b/i.test(text)) {
      push("Worker interaction or exposure was described", "narrative", "Supports exposure and risk applicability.");
    }
    return facts.slice(0, 10);
  }

  private buildStructuredClarifyingQuestions(input: {
    fusedText: string;
    structuredObservation?: StructuredObservationInput;
    existingQuestions?: any[];
    answeredQuestionIds?: string[];
    unresolvedContradictions?: NonNullable<StructuredObservationInput["unresolvedContradictions"]>;
  }) {
    const text = String(input.fusedText || "").toLowerCase();
    const structured = input.structuredObservation;
    const questions: any[] = [];
    const answered = new Set((input.answeredQuestionIds || []).map((id) => String(id || "").trim()).filter(Boolean));
    const add = (question: any) => {
      if (questions.length >= 4) return;
      if (answered.has(question.id)) return;
      if (questions.some((item) => item.id === question.id || item.question === question.question)) return;
      questions.push({
        required: question.priority === "critical",
        impactedDecisions: question.impactedDecisions || [question.requiredFor || "standard-applicability"],
        expectedEvidenceFields: question.expectedEvidenceFields || [],
        couldPromoteStandard: Boolean(question.couldPromoteStandard ?? question.requiredFor === "standard-applicability"),
        couldSuppressStandard: Boolean(question.couldSuppressStandard ?? question.requiredFor === "standard-applicability"),
        couldChangeShutdown: Boolean(question.couldChangeShutdown),
        ...question,
      });
    };

    for (const conflict of input.unresolvedContradictions || []) {
      add({
        id: `confirm-${conflict.field}`,
        question: `Please confirm the ${conflict.field}: ${conflict.originalValue || "the observation"} or ${conflict.answerValue || "the follow-up answer"}?`,
        shortLabel: `Confirm ${conflict.field}`,
        reason: conflict.reason,
        answerType: "single-select",
        options: [conflict.originalValue || "Original observation is correct", conflict.answerValue || "Follow-up answer is correct", "Not sure"],
        requiredFor: "standard-applicability",
        priority: "critical",
        impactedDecisions: ["hazard-classification", "risk", "standard-applicability", "corrective-action"],
        expectedEvidenceFields: [conflict.field],
        couldPromoteStandard: true,
        couldSuppressStandard: true,
        couldChangeShutdown: conflict.field === "energyState" || conflict.field === "workerInteraction",
      });
    }

    const jurisdictionKnown = structured?.jurisdiction && structured.jurisdiction !== "unknown";
    const hasCompleteMachineEnergyEvidence =
      /\b(conveyor|machine|belt|guard|jam|pulley|shaft)\b/i.test(text) &&
      /\b(energized|operating|running|locked[- ]out|deenergized|de-energized|zero[- ]energy|energy isolation)\b/i.test(text) &&
      /\b(clear(?:ing)?|unjam|jammed|maintenance|servicing|repair|worker|employee|miner)\b/i.test(text) &&
      /\b(guard (?:has been )?removed|removed guard|guard missing|lockout not applied|no lockout|without lockout|verified lockout|energy isolation)\b/i.test(text);
    const hasElectricalExposureAnswer =
      /\b(internal conductors? (?:are )?(?:not )?visible|energized conductors? (?:are )?visible|exposed conductors?|outer jacket damage only|jacket damage only)\b/i.test(text);
    const hasWetLocationEvidence =
      /\b(wet|damp|water|moisture)\b/i.test(text) &&
      !/\b(not wet|not in a wet|dry|no wet|no damp)\b/i.test(text);
    const hasActiveMachineEnergyExposure =
      hasCompleteMachineEnergyEvidence &&
      /\b(energized|operating|running|unexpected startup)\b/i.test(text) &&
      /\b(clear(?:ing)?|unjam|jammed|maintenance|servicing|repair)\b/i.test(text);

    if (!jurisdictionKnown && !hasCompleteMachineEnergyEvidence && !/\b(mine|miner|quarry|construction|jobsite|warehouse|manufacturing|plant|mill|pit)\b/i.test(text)) {
      add({
        id: "jurisdiction-work-environment",
        question: "Where did this occur: mine, construction site, manufacturing plant, warehouse, or another workplace?",
        reason: "Jurisdiction determines whether MSHA, OSHA General Industry, or OSHA Construction standards are in scope.",
        answerType: "single-select",
        options: ["Mine or quarry", "Construction site", "Manufacturing or plant", "Warehouse", "Other workplace", "Not sure"],
        requiredFor: "jurisdiction",
        priority: "critical",
        impactedDecisions: ["jurisdiction", "standard-applicability"],
        expectedEvidenceFields: ["jurisdiction", "workEnvironment"],
      });
    }

    if (/\b(conveyor|machine|guard|jam|pulley|belt|shaft|moving part|nip point)\b/i.test(text)) {
      if ((!structured?.energyState || structured.energyState === "unknown") && !/\b(energized|operating|running|locked[- ]out|deenergized|de-energized|zero[- ]energy)\b/i.test(text)) {
        add({
          id: "machine-energy-state",
          question: "Was the equipment running, capable of unexpected startup, stopped, deenergized, or locked out?",
          reason: "Energy state separates active hazardous-energy exposure from controlled isolation or out-of-service review.",
          answerType: "single-select",
          options: ["Running or operating", "Capable of startup", "Stopped only", "Deenergized", "Locked out", "Not sure"],
          requiredFor: "standard-applicability",
          priority: "critical",
          impactedDecisions: ["hazard-classification", "risk", "imminent-danger", "standard-applicability", "corrective-action"],
          expectedEvidenceFields: ["energyState"],
          couldChangeShutdown: true,
        });
      }
      if (!structured?.taskBeingPerformed && !/\b(clear(?:ing)?|unjam|jammed|maintenance|servicing|repair|operating|cleaning)\b/i.test(text) && /\b(jam|guard|machine|conveyor)\b/i.test(text)) {
        add({
          id: "machine-task",
          question: "Was the worker operating, cleaning, maintaining, repairing, or clearing a jam?",
          reason: "The task determines whether machine guarding, lockout/tagout, or both are the primary control families.",
          answerType: "single-select",
          options: ["Operating", "Cleaning", "Maintenance or repair", "Clearing a jam", "Inspection only", "Not sure"],
          requiredFor: "hazard-classification",
          priority: "important",
          impactedDecisions: ["hazard-classification", "standard-applicability", "corrective-action"],
          expectedEvidenceFields: ["taskBeingPerformed"],
        });
      }
      if (!(structured?.controlsPresent || []).join(" ").match(/guard|lockout|tagout|loto|energy isolation/i) && !(structured?.controlsMissing || []).join(" ").match(/guard|lockout|tagout|loto|energy isolation/i) && !/\b(guard (?:has been )?removed|removed guard|guard missing|lockout applied|locked[- ]out|lockout not applied|no lockout|energy isolation|zero[- ]energy)\b/i.test(text)) {
        add({
          id: "machine-controls",
          question: "Was a guard removed, missing, damaged, bypassed, or was lockout/tagout applied and verified?",
          reason: "Control status determines whether HazLenz should treat the observation as an active exposure or a verification item.",
          answerType: "multi-select",
          options: ["Guard missing or removed", "Guard installed", "Lockout/tagout applied", "Zero-energy verified", "No control verified", "Not sure"],
          requiredFor: "standard-applicability",
          priority: "critical",
          impactedDecisions: ["hazard-classification", "risk", "standard-applicability", "corrective-action"],
          expectedEvidenceFields: ["controlsPresent", "controlsMissing", "energyState"],
          couldChangeShutdown: true,
        });
      }
    }

    if (/\b(cord|wire|electrical|conductor|receptacle|panel|breaker)\b/i.test(text)) {
      if (!hasElectricalExposureAnswer) {
        add({
          id: "electrical-damage-exposure",
          question: "Were internal conductors or energized parts exposed, or was the damage limited to the outer jacket?",
          reason: "Visible conductor exposure changes electrical shock risk and citation applicability.",
          answerType: "single-select",
          options: ["Internal conductors exposed", "Outer jacket damage only", "Unknown", "Not sure"],
          requiredFor: "standard-applicability",
          priority: "critical",
          impactedDecisions: ["hazard-classification", "risk", "standard-applicability", "corrective-action"],
          expectedEvidenceFields: ["observedCondition", "exposurePathway", "controlsPresent", "controlsMissing"],
        });
      }
      if (hasWetLocationEvidence) {
        add({
          id: "electrical-wet-location",
          question: "Was GFCI protection present for the wet or damp location?",
          reason: "Wet-location controls affect electrical risk and corrective actions.",
          answerType: "yes-no",
          options: ["Yes", "No", "Not sure"],
          requiredFor: "risk",
          priority: "important",
          impactedDecisions: ["risk", "standard-applicability", "corrective-action"],
          expectedEvidenceFields: ["controlsPresent", "controlsMissing"],
        });
      }
    }

    if (/\b(ladder|edge|opening|roof|platform|scaffold|fall protection|six feet|6 feet)\b/i.test(text)) {
      const hasFallHeightEvidence = /\b\d+\s*(?:ft|feet|foot)\b/i.test(text) ||
        /\b(?:six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty)\s*(?:ft|feet|foot)\b/i.test(text);
      if (!hasFallHeightEvidence) {
        add({
          id: "fall-height",
          question: "What was the approximate working height or fall distance?",
          reason: "Height determines whether fall-protection standards are likely applicable.",
          answerType: "number",
          requiredFor: "standard-applicability",
          priority: "critical",
          impactedDecisions: ["risk", "standard-applicability"],
          expectedEvidenceFields: ["additionalContext", "exposurePathway"],
        });
      }
      add({
        id: "fall-surface-control",
        question: "Was the issue a defective ladder, incorrect ladder use, an unprotected edge/opening, scaffold, roof, or platform?",
        reason: "Fall and ladder standards depend on the access method and specific misuse or defect.",
        answerType: "single-select",
        options: ["Defective ladder", "Incorrect ladder use", "Unprotected edge or opening", "Scaffold", "Roof", "Platform", "Not sure"],
        requiredFor: "hazard-classification",
        priority: "important",
        impactedDecisions: ["hazard-classification", "standard-applicability", "corrective-action"],
        expectedEvidenceFields: ["observedCondition", "equipmentInvolved", "exposurePathway"],
      });
    }

    if (/\b(spill|leak|chemical|solvent|acid|drum|container|unlabeled|vapou?r|fume)\b/i.test(text)) {
      if (!(structured?.materialOrSubstance || []).length) {
        add({
          id: "chemical-substance",
          question: "What substance was involved, and was the container labeled or identified?",
          reason: "Chemical identity determines whether the issue is primarily HazCom, spill control, or exposure control.",
          answerType: "short-text",
          requiredFor: "standard-applicability",
          priority: "critical",
          impactedDecisions: ["hazard-classification", "risk", "standard-applicability", "corrective-action"],
          expectedEvidenceFields: ["materialOrSubstance", "observedCondition"],
        });
      }
      add({
        id: "chemical-exposure-path",
        question: "Were inhalation, skin contact, vapor, ingestion, drain, or walking-surface exposure pathways possible?",
        reason: "Exposure pathway separates a housekeeping spill from chemical health or emergency-response hazards.",
        answerType: "multi-select",
        options: ["Walking surface", "Inhalation or vapor", "Skin or eye contact", "Drain or environment", "No exposure observed", "Not sure"],
        requiredFor: "risk",
        priority: "important",
        impactedDecisions: ["hazard-classification", "risk", "standard-applicability", "corrective-action"],
        expectedEvidenceFields: ["exposurePathway"],
      });
    }

    const structuredControlText = [
      ...(structured?.controlsPresent || []),
      ...(structured?.controlsMissing || []),
      structured?.energyState || "",
    ].join(" ");
    const hasHeatContext = /\b(heat|humidity|shade|hydration|water|acclimatization|work-rest|heat stress)\b/i.test(text);
    const existing = (Array.isArray(input.existingQuestions) ? input.existingQuestions : [])
      .filter((item: any) => {
        const question = typeof item === "string" ? item : item?.question || item?.prompt || item?.evidenceGapId || "";
        if (/\b(cool drinking water|heat|shade|hydration|acclimatization)\b/i.test(question) && !hasHeatContext) {
          return false;
        }
        if (/\b(internal conductors?|energized parts?|outer jacket)\b/i.test(question) && hasElectricalExposureAnswer) {
          return false;
        }
        if (/\b(lockout|tagout|loto|energy isolation|hazardous energy|zero-energy|zero energy)\b/i.test(question) && (
          hasActiveMachineEnergyExposure ||
          /\b(lockout|tagout|loto|locked out|not applied|no lockout|verified lockout|energy isolation|energy sources? (?:were )?isolated|zero-energy|zero energy)\b/i.test(structuredControlText)
        )) {
          return false;
        }
        if (/\b(guard|guarding)\b/i.test(question) && /\b(guard installed|guard present|guard removed|guard missing|guard bypassed)\b/i.test(structuredControlText)) {
          return false;
        }
        return true;
      })
      .map((item: any, index: number) => typeof item === "string"
        ? {
            id: `existing-${index}`,
            question: item,
            reason: "HazLenz identified this missing fact during deterministic evidence review.",
            answerType: "short-text",
            requiredFor: "standard-applicability",
            priority: "important",
          }
        : {
            ...item,
            answerType: item?.answerType === "boolean" ? "yes-no" : item?.answerType || "short-text",
            requiredFor: item?.requiredFor || "standard-applicability",
            reason: item?.reason || item?.reasonForQuestion || "HazLenz identified this missing fact during deterministic evidence review.",
            priority: item?.priority || "important",
          })
      .filter((item: any) => item?.question);

    return [...questions, ...existing].slice(0, 4);
  }

  async evaluateVisualEvidence(input: VisualEvidenceReasoningInput, user?: UserGovernanceContext) {
    if (user) {
        const decision = this.access.can(user, 'run_classification');
        if (!decision.allowed) throw new ForbiddenException(decision.reason);
    }
    return this.visualService.evaluate(input);
  }

  async evaluateRealImage(input: RealImageAnalysisInput, user?: UserGovernanceContext) {
    if (user) {
        const decision = this.access.can(user, 'run_classification');
        if (!decision.allowed) throw new ForbiddenException(decision.reason);
    }
    return this.imageAnalysisService.evaluate(input);
  }

  async evaluateOffline(input: OfflineReasoningInput, user?: UserGovernanceContext) {
    if (user) {
        const decision = this.access.can(user, 'run_classification');
        if (!decision.allowed) throw new ForbiddenException(decision.reason);
    }
    const result = this.offlineService.evaluate(input);
    if (this.persistence) {
        await this.persistence.save({
            type: "reasoning_trace_snapshot",
            status: "offline_captured",
            payload: result,
            metadata: { observationText: input.observationText, isOffline: true, syncRequired: true },
            workspaceId: input.workspaceId || user?.workspaceId,
            inspectionId: input.localInspectionId,
            observationId: input.localObservationId,
            traceId: result.offlineTraceId
        });
    }
    return result;
  }
  async classify(
    text: string,
    scopes?: string[],
    evidenceTexts?: string[],
    riskProfileId?: "simple_4x4" | "standard_5x5" | "advanced_6x6",
    workspaceId?: string,
    priorFindings?: any[],
    visualAttachments?: Attachment[],
    user?: UserGovernanceContext,
    debugMetadata?: boolean,
    structuredObservationInput?: StructuredObservationInput,
    clarificationAnswers?: HazLenzClarificationAnswerInput[],
    priorStructuredObservationInput?: StructuredObservationInput,
  ) {
    if (user) {
        const decision = this.access.can(user, 'run_classification');
        if (!decision.allowed) throw new ForbiddenException(decision.reason);
    }

      const memoryBefore = getMemorySnapshot();
      const normalizedPriorStructuredObservation = this.normalizeStructuredObservation(priorStructuredObservationInput, text);
      const normalizedStructuredObservation = this.normalizeStructuredObservation(structuredObservationInput, text);
      const normalizedAnswerState = this.normalizeClarificationAnswers(clarificationAnswers);
      const structuredObservationBase = this.mergeStructuredObservation(
        normalizedPriorStructuredObservation,
        normalizedStructuredObservation,
      );
      let structuredObservation = this.mergeStructuredObservation(
        structuredObservationBase,
        normalizedAnswerState.structured,
      );
      const unresolvedContradictions = this.detectStructuredContradictions(structuredObservation, text);
      structuredObservation = this.mergeStructuredObservation(
        structuredObservation,
        { unresolvedContradictions } as StructuredObservationInput,
      );
      const structuredEvidenceTexts = this.buildStructuredObservationEvidenceTexts(structuredObservation);
      const structuredScope = this.structuredObservationToScopes(structuredObservation);

      const evidenceFusion = this.evidenceFusion.synthesize([
        text,
        ...structuredEvidenceTexts,
        ...(normalizedAnswerState.answerEvidence || []),
        ...(evidenceTexts || []),
      ]);
      const fusedText = evidenceFusion.combinedNarrative;
      const result = this.classifier.classify(fusedText);
      const promotedPrimary = result as any;
      this.calibrateHazLenzConfidence(fusedText, promotedPrimary);

      // Calculate risk using the risk engine
      const risk = evaluateRisk({
        text: fusedText,
        classification: promotedPrimary.classification,
        riskProfileId: riskProfileId || "standard_5x5",
      });
      promotedPrimary.risk = risk;

      // Route the observation first so HazLenz opens the most relevant knowledge directory.
      const normalizedScopes = this.normalizeScopes(structuredScope?.length ? structuredScope : scopes, fusedText);
      const advisoryReasoning = this.reasoningOrchestratorService.reason({
        hazardObservation: fusedText,
        scopes: normalizedScopes,
        industryContext: normalizedScopes.join(' '),
        workspaceId,
      });
      const knowledgeRoute = this.knowledgeRouter.route({
        text: fusedText,
        scopes: normalizedScopes,
      });

      const knowledgeShardSummary = this.knowledgeShardService.getShardSummary({
        shardKey: knowledgeRoute.shardKey,
        bundleIds: knowledgeRoute.bundleIds,
        sourceKeys: knowledgeRoute.sourceKeys,
      });

      if (isHazLenzKnowledgeTelemetryEnabled()) {
        logKnowledgeTelemetry("SafescopeV2Service.classify_knowledge_route", {
          jurisdiction: knowledgeRoute.jurisdiction,
          hazardFamily: knowledgeRoute.hazardFamily,
          equipmentFamily: knowledgeRoute.equipmentFamily,
          taskMechanism: knowledgeRoute.taskMechanism,
          shardKey: knowledgeRoute.shardKey,
          candidateBundleIds: knowledgeRoute.bundleIds,
          sourceKeys: knowledgeRoute.sourceKeys,
          confidence: knowledgeRoute.confidence,
          reasons: knowledgeRoute.reasons,
          matchedShardCount: knowledgeShardSummary.matchedShardCount,
          focusedCitations: knowledgeShardSummary.citations,
          previewOnly: true,
        });
      }

      // Suggest standards using the applicable standards service, then enforce selected jurisdiction scope.
      const source = this.scopeToSource(normalizedScopes);
      const diagnostics: Record<string, any> = {};
      if (debugMetadata) {
        diagnostics.memoryBeforeClassify = memoryBefore;
      }
      const rawSuggestedStandards = await this.applicableStandards.suggest(
        fusedText,
        promotedPrimary.classification,
        source,
        10,
        knowledgeRoute,
        debugMetadata ? diagnostics : undefined,
      );

      const standardAppResults = advisoryReasoning?.inspectionIntelligence?.standardApplicability;
      const governedCitations = new Set(EXPERT_APPLICABILITY_RULES.map(r => r.standardCitation.toLowerCase().replace(/\s+/g, '')));
      const applicabilityEvaluationResults = Array.isArray(standardAppResults?.evaluationResults)
        ? standardAppResults.evaluationResults
        : [];
      const applicabilityMatchedRules = Array.isArray(standardAppResults?.matchedRules) && standardAppResults.matchedRules.length
        ? standardAppResults.matchedRules
        : applicabilityEvaluationResults
            .filter((result: any) => result?.isSufficient && !result?.excludedByDoNotSelect)
            .map((result: any) => {
              const match = EXPERT_APPLICABILITY_RULES.find((rule) =>
                String(rule.id || '') === String(result?.ruleId || '') ||
                String(rule.standardCitation || '').toLowerCase().replace(/\s+/g, '') === String(result?.citation || '').toLowerCase().replace(/\s+/g, ''),
              );
              return {
                id: match?.id || String(result?.ruleId || result?.citation || '').trim(),
                citation: String(result?.citation || match?.standardCitation || '').trim(),
                standardTitle: match?.standardTitle || String(result?.citation || '').trim(),
                title: match?.standardTitle || String(result?.citation || '').trim(),
                titleSummary: match?.standardTitle || String(result?.citation || '').trim(),
                summary: match?.standardTitle || String(result?.citation || '').trim(),
                hazardFamily: match?.hazardFamily || String(result?.hazardFamily || '').trim() || undefined,
                jurisdiction: match?.jurisdiction || (result as any)?.jurisdiction,
                status: 'candidate_standard',
                candidateStatus: 'candidate_standard',
                source: ['standard_applicability'],
                matchingReasons: [`Sufficient applicability rule matched: ${(match?.standardTitle || result?.citation || '').trim()}.`],
                evidenceNeeded: Array.isArray(result?.missingFacts) && result.missingFacts.length
                  ? result.missingFacts
                  : match?.followUpQuestions || [],
              };
            })
            .filter(Boolean);
      const mineType = String(advisoryReasoning?.inspectionIntelligence?.miningContext?.mineType || '').toLowerCase();
      const mineContextDetected = Boolean(advisoryReasoning?.inspectionIntelligence?.miningContext?.detected);
      const mineTypeAllowsCitation = (citation: string) => {
        const normalizedCitation = String(citation || '').trim();
        if (!normalizedCitation) return false;
        if (!/^30 CFR\b/.test(normalizedCitation)) return true;
        if (!mineContextDetected || mineType === 'not_mine') return true;
        if (mineType === 'unclear_mine') return false;
        const part = normalizedCitation.match(/^30 CFR (\d+)/)?.[1];
        if (!part) return true;
        if (part === '62') return true;
        if (mineType === 'surface_metal_nonmetal') return ['46', '48', '56'].includes(part);
        if (mineType === 'underground_metal_nonmetal') return ['48', '57'].includes(part);
        if (mineType === 'surface_coal') return ['48', '71', '77'].includes(part);
        if (mineType === 'underground_coal') return ['48', '70', '75'].includes(part);
        return true;
      };
      const applicabilitySuggestedStandards = Array.isArray(applicabilityMatchedRules)
        ? applicabilityMatchedRules
            .map((rule: any) => {
              const citation = String(rule?.citation || '').trim();
              if (!citation) return null;
              return {
                citation,
                title: rule.standardTitle || citation,
                titleSummary: rule.standardTitle || citation,
                summary: rule.standardTitle || citation,
                score: 1000,
                confidence: 0.96,
                status: 'candidate_standard',
                candidateStatus: 'candidate_standard',
                standardFamily: String(rule.hazardFamily || '').toLowerCase() || undefined,
                hazardFamily: String(rule.hazardFamily || '').toLowerCase() || undefined,
                jurisdiction: rule.jurisdiction,
                source: ['standard_applicability'],
                matchingReasons: [`Sufficient applicability rule matched: ${rule.standardTitle}.`],
                evidenceNeeded: Array.isArray(standardAppResults?.followUpQuestions) && standardAppResults.followUpQuestions.length
                  ? standardAppResults.followUpQuestions.slice(0, 5)
                  : [`Confirm the observed condition, exposure path, and control status for ${rule.standardTitle}.`],
              };
            })
            .filter((standard: any) => Boolean(standard) && mineTypeAllowsCitation(String(standard?.citation || '')))
        : [];
      if (Array.isArray(standardAppResults?.matchedRules) && !standardAppResults.matchedRules.length && applicabilityMatchedRules.length) {
        standardAppResults.matchedRules = applicabilityMatchedRules as any[];
      }
      if (Array.isArray(standardAppResults?.suggestedStandards) && !standardAppResults.suggestedStandards.length && applicabilitySuggestedStandards.length) {
        standardAppResults.suggestedStandards = applicabilitySuggestedStandards.map((standard: any) => String(standard?.citation || '')).filter(Boolean);
      }

      const mineTypeCompatibleStandards = [...rawSuggestedStandards, ...applicabilitySuggestedStandards]
        .filter((standard) => mineTypeAllowsCitation(String(standard?.citation || standard?.standard || standard?.id || '')));

      const scopedStandards = this.applyStandardsScopeFit(
        mineTypeCompatibleStandards,
        normalizedScopes,
      ).map((standard) => {
        const normCit = (standard.citation || standard.standard || '').toLowerCase().replace(/\s+/g, '');
        if (governedCitations.has(normCit)) {
          const isSuggested = standardAppResults?.suggestedStandards?.some(
            (c: string) => c.toLowerCase().replace(/\s+/g, '') === normCit
          );
          if (!isSuggested) {
            return {
              ...standard,
              candidateStatus: "needs_more_evidence",
              evidenceExclusionReason: "Candidate does not satisfy the Expert Applicability sufficiency gate requirements.",
            };
          }
        }
        return standard;
      }).sort((a, b) => (b.score || 0) - (a.score || 0));

      let suggestedStandards = scopedStandards
        .filter((standard) =>
          standard.scopeFit !== "mismatch" &&
          standard.candidateStatus !== "needs_more_evidence"
        )
        .slice(0, 5);

      let excludedStandards = scopedStandards
        .filter((standard) =>
          standard.scopeFit === "mismatch" ||
          standard.candidateStatus === "needs_more_evidence"
        )
        .map((standard) => ({
          ...standard,
          exclusionReason:
            standard.evidenceExclusionReason ||
            standard.scopeExclusionReason ||
            "Candidate lacks sufficient evidence fit for active suggestion.",
        }));


      const isVague = Boolean(advisoryReasoning.inspectionIntelligence?.vagueInputAnalysis?.isVague);
      if (isVague) {
        const newlyExcluded = suggestedStandards.map((standard: any) => ({
          ...standard,
          scopeFit: "mismatch",
          candidateStatus: "needs_more_evidence",
          exclusionReason: "Observation is too vague to suggest active standard candidates. More physical details are required.",
          scopeExclusionReason: "Observation is too vague to suggest active standard candidates. More physical details are required.",
        }));
        excludedStandards = [...excludedStandards, ...newlyExcluded];
        suggestedStandards = [];
      }

      const citationRecovery = this.citationRecoveryService.recover({
        observation: fusedText,
        suggestedStandards,
        excludedStandards,
        inspectionIntelligence: advisoryReasoning.inspectionIntelligence,
        scopes: normalizedScopes,
      });
      suggestedStandards = citationRecovery.suggestedStandards;
      excludedStandards = citationRecovery.excludedStandards;
      let supportingStandards = citationRecovery.supportingStandards;
      const familyHint = String(
          advisoryReasoning?.inspectionIntelligence?.standardApplicability?.matchedRules?.[0]?.hazardFamily ||
          advisoryReasoning?.inspectionIntelligence?.hazardCandidates?.find((candidate: any) => candidate?.role === 'primary')?.domain ||
          (advisoryReasoning?.inspectionIntelligence?.candidateStandards?.[0] as any)?.hazardFamily ||
          promotedPrimary.classification ||
          '',
        ).toLowerCase();
      const standardFamilyPattern = (() => {
        if (familyHint.includes('electrical')) {
          return /(?:1910\.(?:303|305|331|333|334|306)|1926\.(?:403|404|405)|(?:56|57)\.(?:12004|12013|12016|12032|12034|12037)|electrical|cord|cable|wire|panel|breaker|enclosure|live parts?|energized)/i;
        }
        if (familyHint.includes('hazard_communication') || familyHint.includes('hazcom') || familyHint.includes('chemical')) {
          return /(?:1910\.1200|1926\.59|47\.|hazard communication|hazcom|chemical|container|label|sds|spill|leak|release|drain|used oil|waste oil|unknown substance|unknown contents)/i;
        }
        if (familyHint.includes('walking_working_surfaces') || familyHint.includes('housekeeping') || familyHint.includes('slip_trip_fall')) {
          return /(?:1910\.(?:22|23|28|29)|1926\.25|(?:56|57)\.(?:20003|11001)|walking-working surfaces|housekeeping|floor|walkway|aisle|travelway|slip|trip|fall|hole|opening|guardrail|ladder|egress|debris|spill|release|residue)/i;
        }
        if (familyHint.includes('machine_guarding')) {
          return /(?:1910\.(?:212|219|147)|1926\.300|(?:56|57)\.(?:14107|12016)|machine guarding|guard|guarding|conveyor|rotating|shaft|pulley|nip|point of operation|moving parts?|lockout|tagout|servicing|unexpected startup|hazardous energy)/i;
        }
        if (familyHint.includes('mobile_equipment')) {
          return /(?:1910\.178|1926\.(?:601|602)|30 CFR 56\.9100|mobile equipment|forklift|loader|haul truck|truck|vehicle|pedestrian|backing|traffic|spotter|berm|route|blind corner)/i;
        }
        if (familyHint.includes('fall_protection') || familyHint.includes('ladder')) {
          return /(?:1910\.(?:23|28|29)|1926\.(?:501|1053)|(?:56|57)\.110(?:03|11)|guardrail|platform|edge|roof|fall protection|fall arrest|aerial lift|scaffold|ladder)/i;
        }
        if (familyHint.includes('scaffold')) {
          return /(?:1926\.451|1926\.502|1926\.503|1926\.454|scaffold|scaffolding|guardrail|midrail|toprail|plank|mudsill|toe board|toeboard)/i;
        }
        if (familyHint.includes('compressed_gas')) {
          return /(?:1910\.101|1926\.350|(?:56|57)\.1600[56]|compressed gas|cylinder|oxygen|acetylene|valve cap|regulator)/i;
        }
        if (familyHint.includes('confined_space')) {
          return /(?:1910\.146|1926\.1203|confined space|permit space|tank|vessel|manhole|atmosphere|oxygen deficiency|entry)/i;
        }
        if (familyHint.includes('industrial_hygiene') || familyHint.includes('health_') || familyHint.includes('noise_exposure') || familyHint.includes('respirable_dust_silica')) {
          return /(?:1910\.95|1926\.52|62\.110|1910\.1053|1926\.1153|silica|dust|noise|hearing|hearing conservation|dosimetry|fume|vapour|vapor|heat|cold|respirator|welding|solvent|ventilation)/i;
        }
        if (familyHint.includes('welding_cutting_hot_work') || familyHint.includes('fire_explosion') || familyHint.includes('fire_protection')) {
          return /(?:1910\.252|1926\.352|(?:56|57)\.46|hot work|welding|cutting|brazing|torch|combustible|ignition|fire watch|fuel gas|gas odor|gas leak|explosion)/i;
        }
        return null;
      })();
      const isFamilyRelevantStandard = (standard: any) => {
        if (!standardFamilyPattern) return true;
        const citation = String(typeof standard === 'string' ? standard : (standard?.citation || standard?.standard || standard?.id || '')).toLowerCase();
        const title = String(typeof standard === 'string' ? standard : (standard?.title || standard?.titleSummary || standard?.summary || '')).toLowerCase();
        const directObservationFit = (() => {
          if (/1910\.1200|1910\.151|1910\.132/i.test(citation)) {
            return /\b(battery acid|acid|corrosive|solvent|degreaser|parts cleaner)\b.*\b(spill|loose cap|caps loose|leak|splash|cart|staged|moved|ventilation|small room|enclosed room|poor ventilation|no ventilation|without ventilation)\b/i.test(fusedText);
          }
          if (/1926\.1101|1926\.62|1910\.1001|1910\.1025/i.test(citation)) {
            return /\b(asbestos|lead)\b.*\b(insulation|dust|demolition|demo|renovation|prep|suspect|suspicion)\b/i.test(fusedText);
          }
          if (/(?:56|57)\.14107|(?:56|57)\.18002|(?:56|57)\.11012/i.test(citation)) {
            return /\b(conveyor|belt|tail pulley|head pulley|workplace exam|workplace examination|crusher|screen|platform|catwalk|edge)\b/i.test(fusedText);
          }
          if (/1910\.178/i.test(citation)) {
            return /\bforklift\b.*\b(damaged|defect(?:ive)?|worn|leaking|in service|out of service)\b/i.test(fusedText);
          }
          return false;
        })();
        return standardFamilyPattern.test(`${citation} ${title}`) || directObservationFit;
      };
      suggestedStandards = suggestedStandards.filter(isFamilyRelevantStandard);
      supportingStandards = supportingStandards.filter(isFamilyRelevantStandard);
      excludedStandards = excludedStandards.filter(isFamilyRelevantStandard);
      let needsMoreEvidenceStandards = (citationRecovery.needsMoreEvidenceStandards || []).filter(isFamilyRelevantStandard);
      let sanitizedInspectionIntelligence = advisoryReasoning.inspectionIntelligence
        ? {
            ...(advisoryReasoning.inspectionIntelligence || {}),
            candidateStandards: Array.isArray(advisoryReasoning.inspectionIntelligence?.candidateStandards)
              ? advisoryReasoning.inspectionIntelligence.candidateStandards.filter(isFamilyRelevantStandard)
              : advisoryReasoning.inspectionIntelligence?.candidateStandards,
            standardApplicability: advisoryReasoning.inspectionIntelligence?.standardApplicability
              ? {
                  ...(advisoryReasoning.inspectionIntelligence.standardApplicability || {}),
                  matchedRules: Array.isArray(advisoryReasoning.inspectionIntelligence.standardApplicability?.matchedRules)
                    ? advisoryReasoning.inspectionIntelligence.standardApplicability.matchedRules.filter(isFamilyRelevantStandard)
                    : advisoryReasoning.inspectionIntelligence.standardApplicability?.matchedRules,
                  suggestedStandards: Array.isArray(advisoryReasoning.inspectionIntelligence.standardApplicability?.suggestedStandards)
                    ? advisoryReasoning.inspectionIntelligence.standardApplicability.suggestedStandards.filter(isFamilyRelevantStandard)
                    : advisoryReasoning.inspectionIntelligence.standardApplicability?.suggestedStandards,
                  needsMoreEvidenceStandards: Array.isArray((advisoryReasoning.inspectionIntelligence.standardApplicability as any)?.needsMoreEvidenceStandards)
                    ? (advisoryReasoning.inspectionIntelligence.standardApplicability as any).needsMoreEvidenceStandards.filter(isFamilyRelevantStandard)
                    : (advisoryReasoning.inspectionIntelligence.standardApplicability as any)?.needsMoreEvidenceStandards,
                  excludedStandards: Array.isArray((advisoryReasoning.inspectionIntelligence.standardApplicability as any)?.excludedStandards)
                    ? (advisoryReasoning.inspectionIntelligence.standardApplicability as any).excludedStandards.filter(isFamilyRelevantStandard)
                    : (advisoryReasoning.inspectionIntelligence.standardApplicability as any)?.excludedStandards,
                }
              : advisoryReasoning.inspectionIntelligence.standardApplicability,
          }
        : advisoryReasoning.inspectionIntelligence;
      const scopeCompatibleCandidateCount = scopedStandards.filter(
        (standard) => standard.scopeFit !== "mismatch"
      ).length;

      // Generate corrective actions using the action engine
      const actionInput: any = {
        id: "safescope-v2-eval-" + Date.now(),
        category: promotedPrimary.classification || "General",
        description: fusedText,
        riskScore: risk?.riskScore || 0,
        riskLevel: (risk?.riskBand || "LOW") as any,
        confidence: promotedPrimary.confidence || 0.5,
        patterns: [],
        location: "Field Location",
        override: false,
        isVague,
        safeScope: {
          classification: promotedPrimary.classification,
          riskBand: (risk?.riskBand || "Low") as any,
          requiresShutdown: risk?.requiresShutdown,
          imminentDanger: risk?.imminentDanger,
          fatalityPotential: risk?.fatalityPotential ? "high" : "low",
          reasoning: risk?.reasoning || [],
          standards: suggestedStandards.map(s => ({ citation: s.citation, rationale: s.matchingReasons?.join(", ") })),
          isVague,
        }
      };
      const generatedActions = await this.actionEngine.generateActionsFromReport(actionInput);

      const historicalReferenceCount = Array.isArray(priorFindings)
        ? priorFindings.length
        : 0;

      const reasoningSourceHierarchy = {
        primaryBasis: [
          "HazLenz AI governed classifier and reasoning brain",
          "approved knowledge and source governance",
          "regulatory scope filtering",
          "standards applicability service",
          "scenario, equipment, task, mechanism, and evidence reasoning",
        ],
        secondaryReferenceOnly: [
          "prior saved findings",
          "workspace learning",
          "site memory",
          "trend intelligence",
          "correlation intelligence",
          "reviewer feedback history",
        ],
        prohibitedHistoricalInfluence: [
          "prior findings cannot create a standard match by themselves",
          "prior findings cannot override approved knowledge or source governance",
          "prior findings cannot remove high-risk review requirements",
          "prior findings cannot finalize compliance or violation decisions",
        ],
      };

      const reasoningBasis = {
        primaryReasoningSource: "safescope_governed_brain",
        standardsMatchPrimarySource: "approved_applicability_and_scope_filtered_standards",
        workspaceHistoryRole: "supporting_reference_only",
        priorFindingsUsed: historicalReferenceCount > 0,
        priorFindingReferenceCount: historicalReferenceCount,
        priorFindingsCanCreateStandards: false,
        priorFindingsCanOverrideGovernance: false,
        sourceHierarchyEnforced: true,
        advisoryOnly: true,
        requiresQualifiedReview: true,
        explanation:
          "HazLenz AI generates classifications, standards candidates, risk reasoning, and corrective actions from its governed brain and approved/source-governed applicability logic first. Prior saved findings and workspace history may support context, trend awareness, confidence tuning, evidence questions, and review priority, but they cannot create or override standards matches.",
      };

      const memorySnapshot = getMemorySnapshot;

      const buildDegradedHazLenzIntelligence = (fallbackReason: string, classification?: string) => {
        const lowerClass = (classification || "").toLowerCase();
        let evidenceGaps = [
          "Confirm physical exposure condition, distance to hazard, and employee travelways.",
          "Verify if any warning signs or administrative controls are in place.",
          "Attach photos and supervisor notes for qualified review before relying on the result.",
        ];
        let classReason = "Core classification, risk, standards candidates, and corrective actions were still generated.";

        if (lowerClass.includes("guarding") || lowerClass.includes("machine")) {
          evidenceGaps = [
            "Verify if the guard is securely fastened, requires a tool for removal, and completely prevents contact with moving parts.",
            "Confirm standard guarding dimensions, distance from pinch points, and visibility requirements.",
            "Attach photos and supervisor notes showing physical guard placement and pinch points.",
          ];
          classReason = "Assessed exposure risk to rotating parts, pulleys, or belts, prioritizing physical barrier guarding regulations.";
        } else if (lowerClass.includes("loto") || lowerClass.includes("lockout") || lowerClass.includes("tagout")) {
          evidenceGaps = [
            "Verify if a machine-specific LOTO procedure exists, is current, and is actively posted at the equipment location.",
            "Confirm that all energy sources (electrical, pneumatic, hydraulic, kinetic) are isolated and locked out.",
            "Check if workers have verified zero energy state before starting maintenance or service work.",
          ];
          classReason = "Assessed hazardous energy isolation requirements, prioritizing lockout/tagout procedures and zero-energy verification.";
        } else if (lowerClass.includes("electrical")) {
          evidenceGaps = [
            "Confirm panel cover status, box integrity, cover screws, and presence of open breaker slots.",
            "Verify proper approach boundaries, PPE requirements, and enclosure ratings (e.g. NEMA ratings).",
            "Identify if qualified electrician authorization, warning labels, or LOTO isolation was in place.",
          ];
          classReason = "Assessed shock, electrocution, or arc flash hazards, focusing on live parts exposure and protective enclosure requirements.";
        } else if (lowerClass.includes("fall") || lowerClass.includes("leading edge")) {
          evidenceGaps = [
            "Verify actual fall height to lower level, anchorage point strength, and presence of guardrails or safety nets.",
            "Confirm that personnel have been trained on fall protection and are actively wearing inspected harnesses/lanyards.",
            "Check floor opening covers for proper securing, labeling ('HOLE'), and load-bearing capacity.",
          ];
          classReason = "Assessed height-related fall risk, focusing on guardrails, personal fall arrest systems, and hole protection.";
        } else if (lowerClass.includes("mobile") || lowerClass.includes("berm") || lowerClass.includes("equipment") || lowerClass.includes("pedestrian")) {
          evidenceGaps = [
            "Verify presence and height of safety berms or edge controls along haul roads and dump points.",
            "Confirm pedestrian-equipment segregation plan, high-visibility vest usage, and backup alarm functionality.",
            "Check equipment inspection logs, horn operation, and seatbelt usage compliance.",
          ];
          classReason = "Assessed mobile machinery operation hazards, pedestrian interaction, and ground control or berm requirements.";
        } else if (lowerClass.includes("hazcom") || lowerClass.includes("chemical") || lowerClass.includes("label") || lowerClass.includes("hazard communication")) {
          evidenceGaps = [
            "Verify if the container is properly labeled with chemical identity, hazards, and GHS pictograms.",
            "Confirm availability and location of the Safety Data Sheet (SDS) for this specific chemical substance.",
            "Check presence of eye wash station, chemical-resistant gloves, and proper secondary containment.",
            "Confirm what substance is stored inside the container/tank, and whether it is a chemical or secondary container."
          ];
          classReason = "Assessed chemical safety risk, focusing on container labeling, hazard communication, and SDS availability.";
        } else if (lowerClass.includes("housekeeping") || lowerClass.includes("trip") || lowerClass.includes("clutter") || lowerClass.includes("walking") || lowerClass.includes("working") || lowerClass.includes("surfaces") || lowerClass.includes("slip")) {
          if (lowerClass.includes("oil") || lowerClass.includes("container")) {
            evidenceGaps = [
              "Is the container labeled?",
              "Is the container closed or covered?",
              "Is there visible oil on the floor?",
              "Is it in or near a travelway?",
              "Is secondary containment present?",
              "Are there nearby drains, soil, or stormwater pathways?",
              "Is the container managed as used oil/waste per site procedure?",
              "Has cleanup or spill prevention been completed?"
            ];
            classReason = "Assessed open used-oil container or spill hazard near walking paths, analyzing release modes, exposure pathways, and slip risks.";
          } else {
            evidenceGaps = [
              "Verify if travelways, walkways, and emergency exits are clear of clutter, cords, or debris.",
              "Identify source of any spills (oil, water, dust) and check if cleanup materials or warning signs are deployed.",
              "Check lighting levels and walking surface conditions (uneven ground, cracks, ice) in the hazard area.",
            ];
            classReason = "Assessed slip, trip, and fall-on-same-level hazards, focusing on clean walkways and clear emergency exits.";
          }
        } else if (lowerClass.includes("traffic") || lowerClass.includes("pedestrian") || lowerClass.includes("vehicle") || lowerClass.includes("speed")) {
          evidenceGaps = [
            "Are pedestrian walkways physically separated from vehicle lanes?",
            "Are speed limits clearly posted and enforced?",
            "Are backup alarms and strobe lights functioning on all equipment?",
            "Are spotters or flaggers present in blind or high-risk zones?",
            "Are workers wearing high-visibility safety vests?"
          ];
          classReason = "Assessed mobile equipment traffic control and pedestrian interaction hazards, prioritizing physical segregation controls.";
        } else if (lowerClass.includes("compressed_gas") || lowerClass.includes("cylinder") || lowerClass.includes("gas") || lowerClass.includes("valve cap")) {
          evidenceGaps = [
            "Are cylinders secured upright with chains or racks?",
            "Are valve protective caps installed when not in active use?",
            "Are oxygen and fuel gas cylinders separated by 20 feet or a 5-foot 1/2-hour fire barrier?",
            "Are cylinder contents and hazards clearly labeled?"
          ];
          classReason = "Assessed compressed gas cylinder storage and handling hazards, focusing on restraint systems, valve caps, and storage segregation.";
        } else if (lowerClass.includes("hydraulic") || lowerClass.includes("pneumatic") || lowerClass.includes("pressure") || lowerClass.includes("whip check")) {
          evidenceGaps = [
            "Are whip checks or safety cables installed on all high-pressure connections?",
            "Has stored pressure been verified bled to zero before opening lines?",
            "Are mechanical blocks or stands installed under hydraulically raised components?",
            "Have high-pressure hoses been inspected for wear, leaks, or damage?"
          ];
          classReason = "Assessed hydraulic and pneumatic energy release hazards, focusing on pressure isolation, mechanical blocks, and whip check restraints.";
        }

        return {
          degraded: true,
          fullIntelligenceAvailable: false,
          fallbackReason,
          additionalHazards: [],
          evidenceGaps,
          reasoningSummary: [
            "HazLenz AI returned a production-safe advisory result while advanced review was unavailable.",
            classReason,
            "Output remains advisory-only and requires qualified review.",
          ],
          governance: {
            advisoryOnly: true,
            requiresQualifiedReview: true,
            degradedMode: true,
          },
        };
      };

      let intelligence: any;

      const renderRuntime =
        Boolean(process.env.RENDER) ||
        Boolean(process.env.RENDER_SERVICE_ID) ||
        Boolean(process.env.RENDER_EXTERNAL_URL);

      const productionRuntime = process.env.NODE_ENV === "production";
      const fullRenderIntelligenceDisabled =
        process.env.HAZLENZ_DISABLE_FULL_INTELLIGENCE_ON_RENDER === "true";
      const configuredRenderHeapLimitMb = Number(
        process.env.HAZLENZ_MAX_HEAP_BEFORE_FULL_INTELLIGENCE_MB || 420,
      );
      const renderHeapGuardTriggered =
        productionRuntime &&
        renderRuntime &&
        Number.isFinite(configuredRenderHeapLimitMb) &&
        configuredRenderHeapLimitMb > 0 &&
        memoryBefore.heapUsedMb >= configuredRenderHeapLimitMb;

      if (
        productionRuntime &&
        renderRuntime &&
        (fullRenderIntelligenceDisabled || renderHeapGuardTriggered)
      ) {
        if (process.env.NODE_ENV === "development" || debugMetadata) {
          console.warn("[HazLenz classify] skipping full intelligence orchestrator on Render production", {
            reason: renderHeapGuardTriggered
              ? "pre_import_heap_guard"
              : "runtime_configuration",
            textLength: fusedText.length,
            standards: suggestedStandards.length,
            actions: Array.isArray(generatedActions) ? generatedActions.length : 0,
            memory: memorySnapshot(),
          });
        }

        intelligence = buildDegradedHazLenzIntelligence(
          renderHeapGuardTriggered
            ? `HazLenz AI advanced review was skipped because heap usage reached the configured ${configuredRenderHeapLimitMb} MB pre-import guard. Core classification, risk, standards candidates, and corrective actions were still generated.`
            : "HazLenz AI advanced review was disabled by runtime configuration. Core classification, risk, standards candidates, and corrective actions were still generated.",
          promotedPrimary?.classification
        );
      } else {
        try {
          if (process.env.NODE_ENV === "development" || debugMetadata) {
            console.log("[HazLenz classify] intelligence orchestrator start", {
              textLength: fusedText.length,
              standards: suggestedStandards.length,
              actions: Array.isArray(generatedActions) ? generatedActions.length : 0,
              memory: memorySnapshot(),
            });
          }

          let orchestrator = this.intelligenceOrchestrator || this.lazyIntelligenceOrchestrator;
          if (!orchestrator) {
            const { SafeScopeIntelligenceOrchestrator } = await import("./orchestration/intelligence-orchestrator.service");
            this.lazyIntelligenceOrchestrator = new SafeScopeIntelligenceOrchestrator(
              this.persistence,
              undefined,
              this.access,
            );
            orchestrator = this.lazyIntelligenceOrchestrator;
          }

          intelligence = await orchestrator.evaluate({
            fusedText,
            promotedPrimary,
            classifierResult: result,
            evidenceTexts,
            visualAttachments,
            expandedContext: { knowledgeRoute, scopes: normalizedScopes },
            primaryStandardsResult: { suggestedStandards },
            generatedActions,
            additionalHazards: [],
            priorFindings,
            workspaceId: workspaceId || user?.workspaceId,
            supervisorValidations: [],
          });

          if (process.env.NODE_ENV === "development" || debugMetadata) {
            console.log("[HazLenz classify] intelligence orchestrator complete", {
              memory: memorySnapshot(),
            });
          }
        } catch (error) {
          console.error("[HazLenz classify] intelligence orchestrator failed; returning degraded advisory fallback", {
            error,
            memory: memorySnapshot(),
          });

          intelligence = buildDegradedHazLenzIntelligence(
            "HazLenz AI advanced review was unavailable. Core classification, risk, standards candidates, and corrective actions were still generated.",
            promotedPrimary?.classification
          );
        }
      }

      if (debugMetadata) {
        diagnostics.memoryAfterClassify = memorySnapshot();
        diagnostics.fullIntelligenceMemoryGuard = {
          renderRuntime,
          productionRuntime,
          configuredHeapLimitMb: configuredRenderHeapLimitMb,
          heapUsedBeforeClassifyMb: memoryBefore.heapUsedMb,
          triggered: renderHeapGuardTriggered,
        };
      }

      const hasServicingEnergyEvidence =
        /\b(lockout|loto|tagout|locked out|energy isolation|isolated|de-energized|deenergized|hazardous energy|unexpected startup|stored energy)\b/i.test(fusedText) ||
        (/\b(maintenance|servicing|repair|clearing jam|unjamming|cleaning|adjusting|troubleshooting|work on)\b/i.test(fusedText) &&
          /\b(energized|powered|running|moving|startup|start up|conveyor|machine|equipment|motor|circuit|electrical)\b/i.test(fusedText));
      const hasConfinedSpaceEvidence =
        /\b(confined space|permit space|permit-required|manhole|vault|pit)\b/i.test(fusedText) ||
        (/\b(tank|vessel|silo|bin)\b/i.test(fusedText) &&
          /\b(entry|enter|inside|worker inside|atmosphere|oxygen deficient|toxic atmosphere|engulfment|permit)\b/i.test(fusedText));
      const hasMobileEquipmentEvidence =
        /\b(forklift|loader|haul truck|truck|mobile equipment|powered industrial truck|vehicle|dozer|skid steer|excavator|backhoe|front-end loader|front end loader)\b/i.test(fusedText) &&
        (
          /\b(pedestrian|walkway|aisle|travelway|traffic|stockpile|haul road|blind corner|separation|spotter|traffic control|right of way|same aisle|same route|no traffic control)\b/i.test(fusedText) ||
          /\b(backup alarm|horn|audible warning|elevated forks|raised forks|forks elevated|load elevated|damaged forklift|defect|defective|in service|remains in service|leaking hydraulic|worn tires)\b/i.test(fusedText)
        );
      const hasCylinderEvidence =
        /\b(oxygen|acetylene|argon|propane|compressed gas|gas cylinder|cylinders?|cylinder)\b/i.test(fusedText);
      const hasHotWorkEvidence =
        /\b(hot work|welding|cutting|brazing|torch|fuel gas)\b/i.test(fusedText);
      const hasHornEvidence =
        /\b(horn|horns|backup alarm|backup alarms|audible warning)\b/i.test(fusedText);
      const hasSpecificPurposeEquipmentEvidence =
        /\b(sign|outline lighting|crane|hoist|elevator|dumbwaiter|escalator|moving walk|welder|welding machine|x-ray|induction heating|dielectric heating|electrolytic cell)\b/i.test(fusedText);
      const hasElectricalPhysicalEvidence =
        /\b(panel|breaker|enclosure|cover plate|filler plate|energized parts?|live parts?|conductor|cord|wiring|power strip|receptacle)\b/i.test(fusedText);
      const hasWalkingSurfaceReleaseEvidence =
        /\b(used[- ]oil|waste[- ]oil|oily waste|oily residue|oil spill|spill|spilled|leak|leaking|release|residue|residual)\b/i.test(fusedText) &&
        /\b(floor|walkway|aisle|travelway|walking surface|pedestrian|maintenance area|maintenance bay|shop floor|work area|drain|floor drain|storm drain|soil|water)\b/i.test(fusedText);
      const hasHazComIdentityEvidence =
        /\b(unlabeled|no label|missing label|no workplace marking|workplace marking|unknown liquid|unknown chemical|unidentified liquid|chemical identity|sds|hazcom|hazard communication|secondary container|spray bottle)\b/i.test(fusedText);


      const hasSpecificPanelDefectEvidence =
        /\b(open breaker slot|missing (?:panel )?cover|missing dead[- ]front|missing filler|filler plate|knockout|open slot|empty space in (?:the )?electrical panel|breaker or blank should be|blank should be|unused opening|exposed (?:live |energized )?(?:parts|bus|busbar|terminals?)|uncovered electrical panel|open electrical panel)\b/i.test(fusedText);


      const buildAdditionalInformationNeeded = () => {
        const items: Array<{ category: string; question: string; reason: string }> = [];

        const add = (category: string, question: string, reason: string) => {
          const key = `${category}|${question}`.toLowerCase();
          if (items.some((item) => `${item.category}|${item.question}`.toLowerCase() === key)) return;
          items.push({ category, question, reason });
        };

        const lower = fusedText.toLowerCase();
        const administrativeOnlyText =
          /\b(meeting|scheduled|schedule|training record|record is current|binder|calendar|account|login|log in)\b/i.test(lower) &&
          !/\b(open|missing|damaged|exposed|leaking|spill|unguarded|blocked|unsecured|no label|unlabeled|unknown liquid|energized|live parts|pedestrian exposure)\b/i.test(lower);

        if (administrativeOnlyText) {
          return [];
        }

        if (isVague || /\b(panel|breaker|electrical|cord|wire|wiring)\b/i.test(lower)) {
          add("Electrical condition", "What electrical equipment is involved, and what visible defect was observed?", "Needed to separate blocked access, damaged cord, exposed energized parts, and general electrical concerns.");
          add("Energy/exposure", "Are energized or live parts exposed, and can unqualified persons access the area?", "Needed before HazLenz can treat an electrical standard as more than a candidate.");
          add("Qualified review", "Has a qualified electrical person evaluated the condition?", "Electrical findings commonly require qualified verification before final report language.");
        }

        if (/\b(container|drum|bucket|pail|jug|tank|chemical|label|unlabeled|no label|no workplace marking|workplace marking|unknown liquid|unidentified liquid|spray bottle|sds|used oil|waste oil)\b/i.test(lower)) {
          add("Chemical identity", "What is the container holding, and is the chemical identity known?", "Needed to separate HazCom labeling, spill/release, storage, and environmental concerns.");
          add("Label/SDS", "Is a workplace label present and is the SDS available?", "Needed to support a HazCom candidate standard.");
          add("Release/exposure", "Is there a leak, spill, residue, drain pathway, or employee exposure?", "Needed to determine whether housekeeping, environmental, or exposure controls also apply.");
        }

        if (/\b(oil|spill|leak|residue|floor|walkway|aisle|trip|slip|blocked access)\b/i.test(lower)) {
          add("Walking surface", "Is the walking-working surface wet, oily, obstructed, damaged, or otherwise affected?", "Needed to support walking-working surface applicability.");
          add("Exposure", "Do employees walk through or work in the affected area?", "Needed to estimate likelihood and exposure pathway.");
          add("Control status", "Has the area been barricaded, cleaned, or otherwise controlled?", "Needed to assess immediate control adequacy.");
        }

        if (/\b(guard|guarding|machine|conveyor|pulley|shaft|nip point|moving part)\b/i.test(lower)) {
          add("Equipment", "What machine, conveyor, pulley, shaft, or moving part is involved?", "Needed to select the correct guarding standard and mechanism of injury.");
          add("Exposure", "Can a person reach the moving part during operation, cleanup, or maintenance?", "Needed to determine caught-in exposure.");
          add("Energy/task", "Was the equipment operating, capable of startup, or under lockout/tagout?", "Needed to separate guarding from hazardous-energy-control concerns.");
        }

        if (/\b(forklift|truck|loader|vehicle|mobile equipment|pedestrian|traffic|blind corner)\b/i.test(lower)) {
          add("Equipment movement", "What mobile equipment is operating and where is it traveling?", "Needed to distinguish PIT, mobile equipment, and traffic-control issues.");
          add("Pedestrian exposure", "Are pedestrians, miners, or workers sharing the travel path?", "Needed to evaluate struck-by exposure.");
          add("Traffic controls", "Are spotters, barriers, signs, right-of-way rules, or separation controls in place?", "Needed to assess control adequacy.");
        }

        if (/\b(ladder|platform|roof|edge|fall|guardrail|fall arrest|scaffold)\b/i.test(lower)) {
          add("Fall exposure", "What height, surface, ladder, platform, or edge is involved?", "Needed to separate ladder condition, fall protection, and walking-working surface issues.");
          add("Protection status", "Are guardrails, covers, fall arrest, ladder securement, or other controls present?", "Needed to support the likely fall-protection standard.");
          add("Task", "What work was being performed and how long was the exposure?", "Needed for risk and corrective-action confidence.");
        }

        const existingQuestions = [
          ...(Array.isArray((intelligence as any)?.evidenceGapQuestions) ? (intelligence as any).evidenceGapQuestions : []),
          ...(Array.isArray((intelligence as any)?.inspectionIntelligence?.evidenceGapQuestions) ? (intelligence as any).inspectionIntelligence.evidenceGapQuestions : []),
        ];

        for (const q of existingQuestions) {
          const question = typeof q === "string" ? q : q?.question || q?.prompt || "";
          if (question) {
            add("HazLenz evidence gap", String(question), "Generated by HazLenz to improve confidence before final report use.");
          }
        }

        return items.slice(0, 6);
      };


      const sanitizeVagueGeneratedAction = (action: any) => {
        if (!isVague || hasSpecificPanelDefectEvidence || !action) return action;

        const vagueElectricalConcern =
          /\b(panel|breaker|electrical)\b/i.test(fusedText) &&
          !hasSpecificPanelDefectEvidence;

        if (!vagueElectricalConcern) return action;

        const forbiddenSpecificElectricalLanguage =
          /\b(filler|knockout|dead[- ]front|open slot|approved covers?|blanks?|enclosure parts?|replace damaged wiring|exposed electrical equipment)\b/i;

        const sanitizeText = (value: any) => {
          if (typeof value !== "string") return value;
          if (!forbiddenSpecificElectricalLanguage.test(value)) return value;

          return "Restrict access to the electrical area and have a qualified electrical person verify the condition before work continues.";
        };

        const sanitized = {
          ...action,
          title: sanitizeText(action.title),
          text: sanitizeText(action.text),
          action: sanitizeText(action.action),
          description: sanitizeText(action.description),
          summary: sanitizeText(action.summary),
        };

        if (Array.isArray(action.steps)) {
          sanitized.steps = action.steps
            .map(sanitizeText)
            .filter((step: any) => typeof step !== "string" || !forbiddenSpecificElectricalLanguage.test(step));
        }

        if (Array.isArray(action.referenceStandards)) {
          sanitized.referenceStandards = action.referenceStandards;
        }

        return sanitized;
      };

      const sanitizedGeneratedActions = (generatedActions || []).map((action: any) => sanitizeVagueGeneratedAction({
        ...action,
        referenceStandards: (Array.isArray(action?.referenceStandards) ? action.referenceStandards : []).filter((standard: any) => {
          const citation = String(standard?.citation || standard?.standard || standard?.id || standard || "").trim();
          if (!citation) return false;
          if (/1910\.147|(?:56|57)\.12016/i.test(citation) && !hasServicingEnergyEvidence) return false;
          if (/1910\.146|1926\.1203|(?:56|57)\.18001/i.test(citation) && !hasConfinedSpaceEvidence) return false;
          if (/(?:1910\.178|1926\.60[12]|(?:56|57)\.9100)/i.test(citation) && !hasMobileEquipmentEvidence) return false;
          if (/(?:56\.93[0-9]|56\.14132\(a\)|1910\.178\(l\)|1926\.601\(b\)\(14\))/i.test(citation) && !hasHornEvidence) return false;
          if (/(?:1910\.101|1926\.350|(?:56|57)\.1600[56])/i.test(citation) && !hasCylinderEvidence) return false;
          if (/1910\.306/i.test(citation) && !hasSpecificPurposeEquipmentEvidence) return false;
          if (/(?:1910\.301|1910\.331)/i.test(citation) && hasElectricalPhysicalEvidence) return false;
          return true;
        }),
      }));

      const enhancedGeneratedActions = this.buildEnhancedGeneratedActions(
        sanitizedGeneratedActions,
        intelligence,
        actionInput.id,
        knowledgeShardSummary,
        fusedText,
        isVague,
      );
      const sanitizedEnhancedGeneratedActions = (enhancedGeneratedActions || []).map((action: any) => sanitizeVagueGeneratedAction({
        ...action,
        referenceStandards: (Array.isArray(action?.referenceStandards) ? action.referenceStandards : []).filter((standard: any) => {
          const citation = String(standard?.citation || standard?.standard || standard?.id || standard || "").trim();
          if (!citation) return false;
          if (/1910\.147|(?:56|57)\.12016/i.test(citation) && !hasServicingEnergyEvidence) return false;
          if (/1910\.146|1926\.1203|(?:56|57)\.18001/i.test(citation) && !hasConfinedSpaceEvidence) return false;
          if (/(?:1910\.178|1926\.60[12]|(?:56|57)\.9100)/i.test(citation) && !hasMobileEquipmentEvidence) return false;
          if (/(?:56\.93[0-9]|56\.14132\(a\)|1910\.178\(l\)|1926\.601\(b\)\(14\))/i.test(citation) && !hasHornEvidence) return false;
          if (/(?:1910\.101|1926\.350|(?:56|57)\.1600[56])/i.test(citation) && !hasCylinderEvidence) return false;
          if (/1926\.350/i.test(citation) && !hasHotWorkEvidence) return false;
          if (/1910\.306/i.test(citation) && !hasSpecificPurposeEquipmentEvidence) return false;
          if (/(?:1910\.301|1910\.331)/i.test(citation) && hasElectricalPhysicalEvidence) return false;
          if (/1910\.1200/i.test(citation) && hasWalkingSurfaceReleaseEvidence && !hasHazComIdentityEvidence) return false;
          return true;
        }),
      }));

      const aiEvidenceContract = {
        inputsUsed: [
          "hazard_observation_text",
          ...(evidenceTexts?.length ? ["evidence_texts"] : []),
          ...(visualAttachments?.length ? ["visual_attachments"] : []),
          ...(priorFindings?.length ? ["prior_findings_reference_only"] : []),
        ],
        standardsSourcesUsed: suggestedStandards
          .map((standard: any) => standard.citation || standard.standard || standard.id)
          .filter(Boolean),
        missingInputs: [
          ...(fusedText.toLowerCase().includes("location") ? [] : ["specific_location"]),
          ...(evidenceTexts?.length || visualAttachments?.length ? [] : ["supporting_photo_or_evidence_note"]),
        ],
        unsupportedClaims: [],
        reviewTriggers: [
          "qualified_review_required",
          ...(risk?.requiresShutdown ? ["shutdown_or_immediate_control_review"] : []),
          ...(excludedStandards.length ? ["standards_scope_filter_review"] : []),
        ],
        canFinalizeWithoutHumanReview: false,
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true,
      };

      const aiReadiness = {
        readyForDecisionSupport: true,
        readyForAutonomousComplianceDecision: false,
        marketingPosition: "AI-assisted safety review and decision-support engine",
        advisoryOnly: true,
        requiresQualifiedReview: true,
        limitations: [
          "Does not declare violations.",
          "Does not create citations.",
          "Does not replace qualified safety or regulatory review.",
          "Standards applicability depends on confirmed jurisdiction, task, exposure, and evidence.",
        ],
      };

      const aiCapabilityProfile = {
        classification: "AI-assisted safety review engine",
        capabilities: [
          "hazard classification",
          "risk reasoning",
          "standards candidate support",
          "evidence gap identification",
          "corrective action recommendation",
          "source-governed advisory reasoning",
        ],
        missingForValidatedAi: [
          "independent third-party validation",
          "production-scale field accuracy study",
          "live source update governance approval workflow",
        ],
      };

      const nativeReasoning = {
        enabled: true,
        mode: "offline_capable",
        engine: "safescope_native",
        mechanismIntelligence: {
          enabled: true,
          engine: "safescope_mechanism_intelligence",
          source: "scenario_equipment_task_mechanism_reasoning",
          primaryEnergySources: [
            "mechanical_motion",
            "gravity",
            "electrical_energy",
            "mobile_equipment_kinetic_energy",
          ],
          injuryMechanisms: [
            "caught_in_or_between",
            "struck_by",
            "fall_to_lower_level",
            "electrical_contact",
            "exposure",
          ],
          credibleAccidentPathways: [
            "employee exposure to uncontrolled hazardous energy or motion",
            "failed or missing barrier allows contact with hazard source",
            "unclear task/equipment state requires qualified verification",
          ],
          canInventCitations: false,
          canOverrideStandards: false,
          canReduceHumanReview: false,
          sourceBoundary:
            "Mechanism intelligence explains plausible harm pathways only; it cannot invent citations, override standards, or reduce qualified human review.",
          advisoryOnly: true,
          requiresQualifiedReview: true,
        },
        evidenceGapReasoning: {
          enabled: true,
          source: "evidence_gap_questions_and_field_output",
          advisoryOnly: true,
          requiresQualifiedReview: true,
        },
        correctiveActionReasoning: {
          enabled: true,
          source: "dca_corrective_action_brain",
          advisoryOnly: true,
          doesNotGuaranteeAbatement: true,
          requiresQualifiedReview: true,
        },
        standardsReasoning: {
          enabled: true,
          source: "scope_filtered_applicability_and_traceability",
          advisoryOnly: true,
          doesNotCreateCitation: true,
          requiresQualifiedReview: true,
        },
      };

      const learningMemory = {
        engine: "safescope_learning_memory",
        canSelfModifyRules: false,
        canOverrideStandards: false,
        canReduceHumanReview: false,
        memoryBoundary:
          "Learning memory may preserve reviewer patterns and confidence signals for future review support, but it cannot self-modify rules, override standards, invent citations, or reduce qualified human review.",
      };

      const learningGovernance = {
        allowedInfluence: [
          "adjust_confidence",
          "surface_review_patterns",
          "suggest_evidence_questions",
          "prioritize_human_review",
        ],
        prohibitedInfluence: [
          "create_citations",
          "invented_citations",
          "auto_finalize_compliance_decisions",
          "invent_citations",
          "declare_violations",
          "override_regulations",
          "remove_qualified_review_requirement",
        ],
        advisoryOnly: true,
        requiresQualifiedReview: true,
        finalGovernanceRule:
          "HazLenz AI may support classification, risk reasoning, standards review, evidence questions, and corrective action recommendations, but it must not invent citations, declare violations, finalize compliance decisions, or remove qualified human review.",
      };

      const requiresHumanReview = true;

      const standardsTraceability = {
        primaryMatcher: "ApplicableStandardsService",
        primaryMatcherRole:
          "Produces the initial suggested standards from approved knowledge chunks or the active standards repository.",
        scopeFilter: "SafescopeV2Service.applyStandardsScopeFit",
        scopeFilterRole:
          "Promotes standards matching the selected jurisdiction and excludes mismatched MSHA/OSHA scopes.",
        defensibilityRanker: "StandardsReasoningService",
        defensibilityRankerRole:
          "Ranks already-suggested standards for operational defensibility using context, exposure, risk, and reputable-source support.",
        scenarioStandardMapper: "StandardFamilyMapperService",
        scenarioStandardMapperRole:
          "Maps scenario intelligence to standard families for review and supporting context.",
        citationReview: "CitationReviewBrainService",
        citationReviewRole:
          "Reviews citation-level candidates and evidence gaps for advisory applicability support.",
        sourceBackedGovernance: "SourceBackedApplicabilityGovernanceService",
        sourceBackedGovernanceRole:
          "Evaluates whether source-backed applicability is sufficiently supported and what reviewer limits apply.",
        approvedKnowledgeRetrieval: "ApprovedKnowledgeRetrievalOutputV1Service",
        approvedKnowledgeRetrievalRole:
          "Retrieves approved knowledge records for supporting field output and source context where available.",
        priorFindingsRole: "reference_only",
        priorFindingsCanCreateStandards: false,
        priorFindingsCanOverrideStandards: false,
        finalSuggestedStandardsSource:
          "applicable_standards_scope_filtered_then_v2_reasoning_context",
        selectedScopes: normalizedScopes,
        sourceMode: source || "auto_or_unspecified",
        rawCandidateCount: rawSuggestedStandards.length,
        scopeFilteredCandidateCount: scopeCompatibleCandidateCount,
        supportingCandidateCount: supportingStandards.length,
        needsMoreEvidenceCandidateCount: needsMoreEvidenceStandards.length,
        excludedCandidateCount: excludedStandards.length,
        suggestedCitations: suggestedStandards.map((standard: any) => standard.citation).filter(Boolean),
        supportingCitations: supportingStandards.map((standard: any) => standard.citation).filter(Boolean),
        needsMoreEvidenceCitations: needsMoreEvidenceStandards.map((standard: any) => standard.citation).filter(Boolean),
        excludedCitations: excludedStandards.map((standard: any) => standard.citation).filter(Boolean),
        v2ContextAvailable: {
          standardsReasoning: Boolean((intelligence as any).standardsReasoning),
          standardFamilyCandidates: Boolean((intelligence as any).standardFamilyCandidates),
          citationLevelCandidates: Boolean((intelligence as any).citationLevelCandidates),
          sourceBackedApplicability: Boolean((intelligence as any).sbag),
          approvedKnowledgeRetrieval: Boolean((intelligence as any).retrieval),
        },
        advisoryGuardrails: {
          advisoryOnly: true,
          doesNotDeclareViolation: true,
          doesNotCreateCitation: true,
          requiresQualifiedReview: true,
          finalComplianceDecisionByHuman: true,
        },
      };

      const standardsMatchExplanations = this.buildStandardsMatchExplanations(
        suggestedStandards,
        fusedText,
        (intelligence as any)?.observationUnderstanding
      );
      const isDisplayableCitationLike = (value: any) => {
        const text = String(
          value?.citation ||
            value?.standard ||
            value?.standardNumber ||
            value?.code ||
            value?.reference ||
            value?.title ||
            value?.heading ||
            value || ""
        ).trim();
        if (!text) return false;
        if (/^(review|pending|candidate standard|suggested candidate standard|fallback candidate standard|standard family|applicable standard|no specific standard selected yet|needs more evidence|review candidate standard)$/i.test(text)) {
          return false;
        }
        return /\b(?:\d+\s*CFR\s*\d+(?:\.\d+)?(?:\([a-z0-9]+\))*|\d+\.\d+(?:\([a-z0-9]+\))*)\b/i.test(text);
      };
      const buildDisplayStandard = (value: any) => {
        const citation = String(
          value?.citation ||
            value?.standard ||
            value?.standardNumber ||
            value?.code ||
            value?.reference ||
            value || ""
        ).trim();
        if (!isDisplayableCitationLike(value)) return null;
        if (typeof value === "string") {
          return { citation, title: citation, titleSummary: citation, summary: citation, status: "candidate_standard", candidateStatus: "candidate_standard", source: ["standards_traceability"] };
        }
        return {
          ...value,
          citation,
        };
      };
      const shouldSurfacePrimaryStandard = (citation: string) => {
        if (/1910\.147|(?:56|57)\.12016/i.test(citation) && !hasServicingEnergyEvidence) return false;
        if (/1910\.146|1926\.1203|(?:56|57)\.18001/i.test(citation) && !hasConfinedSpaceEvidence) return false;
        if (/(?:1910\.178|1926\.60[12]|(?:56|57)\.9100)/i.test(citation) && !hasMobileEquipmentEvidence) return false;
        if (/(?:56\.93[0-9]|56\.14132\(a\)|1910\.178\(l\)|1926\.601\(b\)\(14\))/i.test(citation) && !hasHornEvidence) return false;
        if (/(?:1910\.101|1926\.350|(?:56|57)\.1600[56])/i.test(citation) && !hasCylinderEvidence) return false;
        if (/1910\.253/i.test(citation) && !hasHotWorkEvidence) return false;
        if (/1926\.350/i.test(citation) && !hasHotWorkEvidence) return false;
        if (/1910\.306/i.test(citation) && !hasSpecificPurposeEquipmentEvidence) return false;
        if (/(?:1910\.301|1910\.331)/i.test(citation) && hasElectricalPhysicalEvidence) return false;
        if (/1910\.1200/i.test(citation) && hasWalkingSurfaceReleaseEvidence && !hasHazComIdentityEvidence) return false;
        return true;
      };
      const hasContradictoryElectricalSafeEvidence =
        /\b(panel|breaker|electrical|enclosure)\b/i.test(fusedText) &&
        /\b(cover is intact|cover intact|access is clear|clear access|no live parts|no exposed parts|no energized parts|fully closed|closed and latched)\b/i.test(fusedText);
      const hasConcreteObservedDefectOrExposure =
        /\b(missing|removed|unguarded|defeated|open|exposed|damaged|frayed|cut|not working|inoperative|blocked|obstructed|leaking|spill|spilled|residue|clutter|cord|trip|slip|uneven|riser|stair|stairs|tread|hole|opening|guardrail|handrail|forklift|pedestrian|backup alarm|seatbelt|berm|edge|fall hazard)\b/i.test(fusedText);

      const primaryStandards = (() => {
        const candidateStandards = (advisoryReasoning.inspectionIntelligence?.candidateStandards || []).map(buildDisplayStandard).filter(Boolean);
        const traceabilityStandards = (standardsTraceability.suggestedCitations || []).map((citation: string) => buildDisplayStandard({ citation, title: citation, summary: citation, status: "candidate_standard", candidateStatus: "candidate_standard", source: ["standards_traceability"] })).filter(Boolean);
        const supportingStandardsDisplay = (supportingStandards || []).map(buildDisplayStandard).filter(Boolean);
        const keepSurfaceableStandards = (standards: any[] = []) =>
          standards
            .map(buildDisplayStandard)
            .filter(Boolean)
            .filter((standard: any) => shouldSurfacePrimaryStandard(String(standard?.citation || "")))
            .filter((standard: any, index: number, values: any[]) => {
              const key = String(standard?.citation || "").toLowerCase().replace(/\s+/g, "");
              return values.findIndex((item) => String(item?.citation || "").toLowerCase().replace(/\s+/g, "") === key) === index;
            });
        const applicabilityFallbackStandards = (() => {
          const explicitApplicabilityStandards = applicabilitySuggestedStandards.length
            ? applicabilitySuggestedStandards
            : applicabilityEvaluationResults
                .filter((result: any) => result?.isSufficient && !result?.excludedByDoNotSelect)
                .map((result: any) => {
                  const citation = String(result?.citation || result?.standard || result?.id || '').trim();
                  if (!citation) return null;
                  return buildDisplayStandard({
                    citation,
                    title: citation,
                    titleSummary: citation,
                    summary: citation,
                    status: 'candidate_standard',
                    candidateStatus: 'candidate_standard',
                    source: ['standard_applicability'],
                    matchingReasons: [`Sufficient applicability rule matched: ${citation}.`],
                    evidenceNeeded: Array.isArray(result?.missingFacts) && result.missingFacts.length
                      ? result.missingFacts
                      : [],
                  });
                })
                .filter(Boolean);
          if (explicitApplicabilityStandards.length) {
            return explicitApplicabilityStandards;
          }
          if (
            /\b(forklift|pallet truck|powered industrial truck|mobile equipment|vehicle)\b/i.test(fusedText) &&
            /\b(elevated forks|raised forks|forks elevated|load elevated|pallet truck)\b/i.test(fusedText)
          ) {
            return [
              buildDisplayStandard({
                citation: "29 CFR 1910.178",
                title: "Powered industrial trucks",
                titleSummary: "Powered industrial trucks",
                summary: "Candidate standard based on a pallet truck or forklift traveling with forks raised above the travel position.",
                status: "candidate_standard",
                candidateStatus: "candidate_standard",
                standardFamily: "mobile_equipment",
                hazardFamily: "mobile_equipment",
                source: ["semantic_evidence_generalization"],
                matchingReasons: ["A pallet truck or forklift is traveling with elevated forks above the travel position."],
              }),
            ].filter(Boolean);
          }
          return [];
        })();
      const semanticCandidateStandards = [
        ...(hasSpecificPanelDefectEvidence
            ? [buildDisplayStandard({
                citation: "29 CFR 1910.303(g)(2)(i)",
                title: "Guarding of live parts",
                summary: "Candidate standard based on an electrical panel opening, missing cover/blank, or potentially accessible energized parts.",
                status: "candidate_standard",
                candidateStatus: "candidate_standard",
                standardFamily: "electrical",
                source: ["semantic_evidence_generalization"],
              })]
            : []),
        ...((/\b(forklift|loader|haul truck|truck|vehicle|mobile equipment|traffic|pedestrian|backing|reverse|backup alarm|horn|blind corner|spotter|elevated forks|raised forks|forks elevated|load elevated|damaged forklift|hydraulic line|worn tires)\b/i.test(fusedText))
          ? (() => {
              const isMineMobileEquipment = Array.isArray(normalizedScopes) && normalizedScopes.some((scope: any) => String(scope).toLowerCase().includes('msha'));
              const standards = [
                /\b(pedestrian|traffic|spotter|blind corner|backing|reverse|aisle|route)\b/i.test(fusedText)
                  ? buildDisplayStandard({
                      citation: isMineMobileEquipment ? '30 CFR 56.9100' : '29 CFR 1910.178',
                      title: isMineMobileEquipment ? 'Traffic control and rules governing movement of mobile equipment' : 'Powered industrial trucks',
                      summary: isMineMobileEquipment
                        ? 'Candidate standard based on mobile equipment and pedestrian or traffic overlap without verified separation.'
                        : 'Candidate standard based on powered industrial truck traffic interacting with pedestrians or shared routes.',
                      status: 'candidate_standard',
                      candidateStatus: 'candidate_standard',
                      standardFamily: 'mobile_equipment',
                      hazardFamily: 'mobile_equipment',
                      source: ['semantic_evidence_generalization'],
                      matchingReasons: [
                        isMineMobileEquipment
                          ? 'Mobile equipment and pedestrian or traffic interaction is described in a mine context.'
                          : 'Powered industrial truck or mobile equipment and pedestrian/traffic interaction is described.',
                      ],
                    })
                  : null,
                /\b(backup alarm|horn|audible warning)\b/i.test(fusedText)
                  ? buildDisplayStandard({
                      citation: isMineMobileEquipment ? '30 CFR 56.14132(a)' : '29 CFR 1910.178',
                      title: isMineMobileEquipment ? 'Audible warning devices' : 'Powered industrial trucks',
                      summary: isMineMobileEquipment
                        ? 'Candidate standard based on a failed backup alarm or warning device on mine mobile equipment.'
                        : 'Candidate standard based on a failed backup alarm or warning device on powered industrial trucks.',
                      status: 'candidate_standard',
                      candidateStatus: 'candidate_standard',
                      standardFamily: 'mobile_equipment',
                      hazardFamily: 'mobile_equipment',
                      source: ['semantic_evidence_generalization'],
                      matchingReasons: [
                        isMineMobileEquipment
                          ? 'Backup alarm or warning device failure is described for mine mobile equipment.'
                          : 'Backup alarm or warning device failure is described for powered industrial trucks.',
                      ],
                    })
                  : null,
                /\b(damaged forklift|damaged|defect|leaking hydraulic|worn tires|remains in service|in service)\b/i.test(fusedText)
                  ? buildDisplayStandard({
                      citation: isMineMobileEquipment ? '30 CFR 56.14100' : '29 CFR 1910.178',
                      title: isMineMobileEquipment ? 'Safety defects; examination, correction and records' : 'Powered industrial trucks',
                      summary: isMineMobileEquipment
                        ? 'Candidate standard based on a mine mobile equipment defect that remains in service.'
                        : 'Candidate standard based on a powered industrial truck defect or degraded condition remaining in service.',
                      status: 'candidate_standard',
                      candidateStatus: 'candidate_standard',
                      standardFamily: 'mobile_equipment',
                      hazardFamily: 'mobile_equipment',
                      source: ['semantic_evidence_generalization'],
                      matchingReasons: [
                        isMineMobileEquipment
                          ? 'Mine mobile equipment defect remains in service or requires correction.'
                          : 'Powered industrial truck defect remains in service or requires correction.',
                      ],
                    })
                  : null,
                /\b(elevated forks|raised forks|forks elevated|load elevated)\b/i.test(fusedText)
                  ? buildDisplayStandard({
                      citation: isMineMobileEquipment ? '30 CFR 56.9100' : '29 CFR 1910.178',
                      title: isMineMobileEquipment ? 'Traffic control and rules governing movement of mobile equipment' : 'Powered industrial trucks',
                      summary: isMineMobileEquipment
                        ? 'Candidate standard based on mine mobile equipment traveling with forks raised above the travel position.'
                        : 'Candidate standard based on a powered industrial truck traveling with forks raised above the travel position.',
                      status: 'candidate_standard',
                      candidateStatus: 'candidate_standard',
                      standardFamily: 'mobile_equipment',
                      hazardFamily: 'mobile_equipment',
                      source: ['semantic_evidence_generalization'],
                      matchingReasons: [
                        isMineMobileEquipment
                          ? 'Mine mobile equipment is traveling with elevated forks above the travel position.'
                          : 'Powered industrial truck is traveling with elevated forks above the travel position.',
                      ],
                    })
                  : null,
              ].filter(Boolean);
              return standards;
            })()
          : []),
        ...(hasHazComIdentityEvidence && /\b(container|bottle|spray bottle|shop|chemical|liquid|unknown liquid|unidentified liquid|marking|label)\b/i.test(fusedText)
          ? [buildDisplayStandard({
                citation: "29 CFR 1910.1200(f)(1)",
                title: "Labels on shipped containers / workplace chemical identity",
                summary: "Candidate standard based on unknown chemical identity, missing workplace marking, or unlabeled secondary container evidence.",
                status: "candidate_standard",
                candidateStatus: "candidate_standard",
                standardFamily: "hazard_communication",
                source: ["semantic_evidence_generalization"],
              })]
            : []),
        ].filter(Boolean);

        const scopedStandardsDisplay = scopedStandards
          .map(buildDisplayStandard)
          .filter(Boolean);
        const filteredApplicabilityFallbackStandards = keepSurfaceableStandards(applicabilityFallbackStandards);
        const filteredSuggestedStandards = keepSurfaceableStandards(suggestedStandards || []);
        const filteredTraceabilityStandards = keepSurfaceableStandards(traceabilityStandards);
        const filteredCandidateStandards = keepSurfaceableStandards(candidateStandards);
        const filteredSemanticCandidateStandards = keepSurfaceableStandards(semanticCandidateStandards);
        const collected = filteredApplicabilityFallbackStandards.length
          ? filteredApplicabilityFallbackStandards
          : filteredSuggestedStandards.length
            ? filteredSuggestedStandards
            : filteredTraceabilityStandards.length
              ? filteredTraceabilityStandards
              : filteredCandidateStandards.length
                ? filteredCandidateStandards
                : filteredSemanticCandidateStandards;
        const baseCollected = collected.length ? collected : supportingStandardsDisplay;
        const seen = new Set<string>();
        const surfaceableBase = baseCollected.filter((standard: any) => {
          const key = String(standard?.citation || "").toLowerCase().replace(/\s+/g, "");
          if (!key || seen.has(key) || !shouldSurfacePrimaryStandard(String(standard?.citation || ""))) return false;

          if (hasContradictoryElectricalSafeEvidence) {
            const family = String(standard?.standardFamily || standard?.hazardFamily || "").toLowerCase();
            const status = String(standard?.candidateStatus || standard?.status || "").toLowerCase();
            if (family.includes("electrical") && status.includes("supporting_context")) return false;
          }

          seen.add(key);
          return true;
        }).slice(0, 5);

        const semanticFallback = filteredSemanticCandidateStandards
          .filter((standard: any) => {
            const key = String(standard?.citation || "").toLowerCase().replace(/\s+/g, "");
            if (!key || seen.has(key) || !shouldSurfacePrimaryStandard(String(standard?.citation || ""))) return false;

            if (hasContradictoryElectricalSafeEvidence) {
              const family = String(standard?.standardFamily || standard?.hazardFamily || "").toLowerCase();
              const status = String(standard?.candidateStatus || standard?.status || "").toLowerCase();
              if (family.includes("electrical") && status.includes("supporting_context")) return false;
            }

            seen.add(key);
            return true;
          })
          .slice(0, 5);

        if (surfaceableBase.length) {
          return surfaceableBase;
        }

        return semanticFallback;
      })();
      const sanitizeApplicabilityStandards = (standards: any[] = []) =>
        standards
          .map(buildDisplayStandard)
          .filter((standard: any) => standard && shouldSurfacePrimaryStandard(String(standard?.citation || "")))
          .filter((standard: any, index: number, values: any[]) => values.findIndex((item) => String(item?.citation || "").toLowerCase().replace(/\s+/g, "") === String(standard?.citation || "").toLowerCase().replace(/\s+/g, "")) === index);
      const sanitizedApplicabilityIntelligence = (intelligence as any)?.applicabilityIntelligence
        ? {
            ...(intelligence as any).applicabilityIntelligence,
            primaryApplicableStandards: sanitizeApplicabilityStandards((intelligence as any).applicabilityIntelligence?.primaryApplicableStandards || []),
            supportingStandards: sanitizeApplicabilityStandards((intelligence as any).applicabilityIntelligence?.supportingStandards || []),
            excludedStandards: sanitizeApplicabilityStandards((intelligence as any).applicabilityIntelligence?.excludedStandards || []),
          }
        : (intelligence as any)?.applicabilityIntelligence;
      const likelyGuardingReview =
        (
          /guard/i.test(String(promotedPrimary.classification || '')) ||
          String(knowledgeRoute?.hazardFamily || '').toLowerCase() === 'machine_guarding'
        ) &&
        suggestedStandards.length === 0 &&
        (needsMoreEvidenceStandards.length > 0 || Boolean(advisoryReasoning.inspectionIntelligence?.vagueInputAnalysis?.isVague));
      const guardingReviewQuestions = [
        'What equipment, opening, edge, or moving part is missing the guard?',
        'Is the equipment operating or energized, and are workers exposed to a nip point, rotating part, fall edge, or floor opening?',
        'Is this OSHA General Industry, OSHA Construction, or MSHA?',
      ];

      const classifierHazardCategory = (() => {
        const classification = promotedPrimary.classification || '';
        const nameLower = classification.toLowerCase();
        if (
          nameLower.includes('compressed gas') ||
          nameLower.includes('cylinder') ||
          fusedText.includes('cylinder') ||
          fusedText.includes('compressed gas') ||
          fusedText.includes('oxygen')
        ) {
          return 'compressed_gas';
        }
        if (nameLower.includes('electrical')) {
          return 'electrical';
        }
        if (nameLower.includes('guarding') || nameLower.includes('machine')) {
          return 'machine_guarding';
        }
        if (nameLower.includes('loto') || nameLower.includes('lockout')) {
          return 'machine_guarding_loto';
        }
        if (nameLower.includes('fall')) {
          return 'fall_protection';
        }
        if (
          nameLower.includes('housekeeping') ||
          nameLower.includes('slip') ||
          nameLower.includes('trip') ||
          nameLower.includes('working surfaces')
        ) {
          return 'slip_trip_fall';
        }
        if (nameLower.includes('mobile') || nameLower.includes('traffic')) {
          return 'mobile_equipment';
        }
        if (nameLower.includes('confined')) {
          return 'confined_space';
        }
        if (nameLower.includes('materials') || nameLower.includes('communication') || nameLower.includes('hazcom')) {
          return 'hazardous_materials';
        }
        return promotedPrimary.family || 'unknown';
      })();

      // Determine root-level hazardCategory (primary hazard domain)
      const isGenericClassifierCategory = (value: string) => {
        const normalized = String(value || '').toLowerCase();
        return !normalized || ['unknown', 'unclassified', 'other', 'general', 'misc', 'miscellaneous'].includes(normalized);
      };

      const hazardCategoryLabelFor = (normalizedCategory: string, fallback: string) => {
        if (normalizedCategory.includes('electrical')) return 'Electrical';
        if (normalizedCategory.includes('machine_guarding_loto') || normalizedCategory.includes('lockout')) return 'Lockout / Stored Energy';
        if (normalizedCategory.includes('machine_guarding')) return 'Machine Guarding';
        if (normalizedCategory.includes('scaffold')) return 'Scaffolds';
        if (normalizedCategory.includes('fall_protection') || normalizedCategory.includes('falls')) return 'Fall Protection';
        if (normalizedCategory.includes('slip_trip_fall') || normalizedCategory.includes('walking_working_surfaces') || normalizedCategory.includes('housekeeping')) return 'Walking/Working Surfaces';
        if (normalizedCategory.includes('mobile_equipment')) return 'Mobile Equipment / Traffic';
        if (normalizedCategory.includes('confined_space')) return 'Confined Space';
        if (normalizedCategory.includes('compressed_gas')) return 'Compressed Gas Cylinders';
        if (normalizedCategory.includes('hazardous_materials') || normalizedCategory.includes('hazard_communication') || normalizedCategory.includes('hazcom')) return 'Hazard Communication';
        if (normalizedCategory.includes('noise_exposure') || normalizedCategory.includes('industrial_hygiene') || normalizedCategory.includes('health_') || normalizedCategory.includes('respirable_dust_silica')) return 'Industrial Hygiene';
        if (normalizedCategory.includes('fire_protection')) return 'Fire Protection';
        if (normalizedCategory.includes('welding_cutting_hot_work') || normalizedCategory.includes('fire_explosion')) return 'Welding / Cutting / Hot Work';
        return fallback;
      };

      const hasExplicitConveyorGuardEnergyContext =
        /\b(conveyor|belt|tail pulley|head pulley)\b/i.test(fusedText) &&
        (
          /\bguard(?:ing)?\b.*\b(missing|removed|has been removed|was removed|not in place|absent)\b/i.test(fusedText) ||
          /\b(missing|removed|unguarded|no guard|guard missing|guard removed|not in place|absent)\b.*\bguard(?:ing)?\b/i.test(fusedText)
        ) &&
        /\b(clearing (?:a )?jam|clear(?:ing)? jam|jammed|unjam|unjamming|servicing|maintenance|repair|energized|powered|running|moving|lockout|tagout|loto)\b/i.test(fusedText);

      const rootHazardCategory = (() => {
        const inspectionIntelligence = advisoryReasoning?.inspectionIntelligence as any;
        const applicabilityHazardFamily = Array.isArray(inspectionIntelligence?.standardApplicability?.matchedRules)
          ? inspectionIntelligence.standardApplicability.matchedRules.find((rule: any) => rule?.isSufficient && !isGenericClassifierCategory(rule?.hazardFamily))?.hazardFamily
          : undefined;
        const scenarioFamilyId = String(
          inspectionIntelligence?.scenarioIntelligence?.scenarioFamilyId ||
          ''
        ).toLowerCase();
        const scenarioHazardCategory = String(
          inspectionIntelligence?.scenarioIntelligence?.hazardCategory ||
          ''
        ).toLowerCase();
        const shouldPreferMachineGuardingScenario = (
          /conveyor|rotating_shaft|point_of_operation/.test(scenarioFamilyId) ||
          scenarioHazardCategory.includes('machine_guarding')
        );
        if (applicabilityHazardFamily && !isGenericClassifierCategory(applicabilityHazardFamily)) {
          const applicabilityHazardFamilyLower = String(applicabilityHazardFamily).toLowerCase();
          if (
            shouldPreferMachineGuardingScenario &&
            /(walking_working_surfaces|slip_trip_fall|housekeeping)/.test(applicabilityHazardFamilyLower)
          ) {
            // Preserve machine-guarding scenarios that would otherwise be downgraded
            // to generic housekeeping because the observation also mentions spillage or a walkway.
          } else {
            return applicabilityHazardFamily;
          }
        }
        if (scenarioHazardCategory && !isGenericClassifierCategory(scenarioHazardCategory)) {
          if (
            shouldPreferMachineGuardingScenario &&
            /(walking_working_surfaces|slip_trip_fall|housekeeping)/.test(String(applicabilityHazardFamily || '').toLowerCase())
          ) {
            return scenarioHazardCategory;
          }
        }
        if (hasExplicitConveyorGuardEnergyContext) {
          return 'machine_guarding_loto';
        }
        if (classifierHazardCategory && !isGenericClassifierCategory(classifierHazardCategory)) {
          return classifierHazardCategory;
        }
        if (intelligence?.scenarioIntelligence?.hazardCategory && !isGenericClassifierCategory(intelligence.scenarioIntelligence.hazardCategory)) {
          return intelligence.scenarioIntelligence.hazardCategory;
        }
        if (knowledgeRoute?.hazardFamily && !isGenericClassifierCategory(knowledgeRoute.hazardFamily)) {
          return knowledgeRoute.hazardFamily;
        }
        if (Array.isArray(advisoryReasoning?.inspectionIntelligence?.hazardCandidates)) {
          const primaryCandidate = advisoryReasoning.inspectionIntelligence.hazardCandidates.find((candidate: any) =>
            candidate?.role === 'primary' && candidate?.domain && candidate.domain !== 'unknown',
          );
          if (primaryCandidate?.domain && !isGenericClassifierCategory(primaryCandidate.domain)) {
            return primaryCandidate.domain;
          }
        }
        const applicabilitySuggestedStandard = advisoryReasoning?.inspectionIntelligence?.standardApplicability?.suggestedStandards?.[0];
        if (typeof applicabilitySuggestedStandard === 'string' && /1910\.305|1910\.334|56\.12013|56\.12032/i.test(applicabilitySuggestedStandard)) {
          return 'electrical';
        }
        return isGenericClassifierCategory(classifierHazardCategory) ? 'unknown' : classifierHazardCategory || 'unknown';
      })();
      const normalizedRootHazardCategory = String(rootHazardCategory || '').toLowerCase();

      // Determine root-level candidateStandardFamily
      const rootStandardFamily = (() => {
        if (intelligence?.scenarioIntelligence?.candidateStandardFamily && intelligence.scenarioIntelligence.candidateStandardFamily !== 'unknown') {
          return intelligence.scenarioIntelligence.candidateStandardFamily;
        }
        if (normalizedRootHazardCategory.includes('compressed_gas')) return 'compressed_gas_cylinders';
        if (normalizedRootHazardCategory.includes('electrical')) return 'electrical';
        if (normalizedRootHazardCategory.includes('machine_guarding_loto') || normalizedRootHazardCategory.includes('lockout')) return 'machine_guarding_loto';
        if (normalizedRootHazardCategory.includes('machine_guarding')) return 'machine_guarding';
        if (normalizedRootHazardCategory.includes('scaffold')) return 'scaffolds';
        if (normalizedRootHazardCategory.includes('fall_protection') || normalizedRootHazardCategory.includes('falls')) return 'fall_protection';
        if (normalizedRootHazardCategory.includes('slip_trip_fall') || normalizedRootHazardCategory.includes('walking_working_surfaces') || normalizedRootHazardCategory.includes('housekeeping')) return 'walking_working_surfaces';
        if (normalizedRootHazardCategory.includes('mobile_equipment')) return 'mobile_equipment';
        if (normalizedRootHazardCategory.includes('powered_haulage')) return 'powered_haulage';
        if (normalizedRootHazardCategory.includes('ground_control')) return 'ground_control';
        if (normalizedRootHazardCategory.includes('material_handling')) return 'material_handling';
        if (normalizedRootHazardCategory.includes('mine_examination')) return 'mine_examination';
        if (normalizedRootHazardCategory.includes('confined_space')) return 'confined_space';
        if (normalizedRootHazardCategory.includes('hazardous_materials') || normalizedRootHazardCategory.includes('hazard_communication') || normalizedRootHazardCategory.includes('hazcom')) return 'hazcom';
        if (normalizedRootHazardCategory.includes('noise_exposure') || normalizedRootHazardCategory.includes('industrial_hygiene') || normalizedRootHazardCategory.includes('health_') || normalizedRootHazardCategory.includes('respirable_dust_silica')) return 'industrial_hygiene';
        if (normalizedRootHazardCategory.includes('fire_protection')) return 'fire_protection';
        if (normalizedRootHazardCategory.includes('welding_cutting_hot_work') || normalizedRootHazardCategory.includes('fire_explosion')) return 'welding_cutting_hot_work';
        return 'unknown';
      })();

      const effectiveClassification = (() => {
        const rawClassification = String(promotedPrimary.classification || '').trim();
        const hasPrimaryConveyorGuardingExposure =
          hasExplicitConveyorGuardEnergyContext &&
          /\b(moving belt|moving conveyor|pinch point|nip point|tail pulley|head pulley)\b/i.test(fusedText) &&
          /\b(clean|cleanup|cleaning|material|worker|employee|miner)\b/i.test(fusedText) &&
          !/\b(jam|jammed|clearing (?:a )?jam|clear(?:ing)? jam|unjam|unjamming|lockout|tagout|loto|unexpected startup|without lockout|no lockout|lockout not applied)\b/i.test(fusedText);
        const hasStrongApplicabilityOverride = Boolean(
          Array.isArray(advisoryReasoning?.inspectionIntelligence?.standardApplicability?.matchedRules) &&
          advisoryReasoning.inspectionIntelligence.standardApplicability.matchedRules.some((rule: any) => rule?.isSufficient && !isGenericClassifierCategory(rule?.hazardFamily)),
        );
        if (hasPrimaryConveyorGuardingExposure) {
          return 'Machine Guarding';
        }
        if (hasStrongApplicabilityOverride) {
          return hazardCategoryLabelFor(normalizedRootHazardCategory, rawClassification || 'Unclassified');
        }
        if (
          hasExplicitConveyorGuardEnergyContext &&
          normalizedRootHazardCategory.includes('machine_guarding_loto')
        ) {
          return 'Lockout / Stored Energy';
        }
        if (rawClassification && !/^(unclassified|unknown|other|general|misc|miscellaneous)$/i.test(rawClassification)) {
          return rawClassification;
        }
        if (normalizedRootHazardCategory.includes('electrical')) return 'Electrical';
        if (normalizedRootHazardCategory.includes('machine_guarding_loto') || normalizedRootHazardCategory.includes('lockout')) return 'Lockout / Stored Energy';
        if (normalizedRootHazardCategory.includes('machine_guarding')) return 'Machine Guarding';
        if (normalizedRootHazardCategory.includes('scaffold')) return 'Scaffolds';
        if (normalizedRootHazardCategory.includes('fall_protection') || normalizedRootHazardCategory.includes('falls')) return 'Fall Protection';
        if (normalizedRootHazardCategory.includes('slip_trip_fall') || normalizedRootHazardCategory.includes('walking_working_surfaces') || normalizedRootHazardCategory.includes('housekeeping')) return 'Walking/Working Surfaces';
        if (normalizedRootHazardCategory.includes('mobile_equipment')) return 'Mobile Equipment / Traffic';
        if (normalizedRootHazardCategory.includes('confined_space')) return 'Confined Space';
        if (normalizedRootHazardCategory.includes('compressed_gas')) return 'Compressed Gas Cylinders';
        if (normalizedRootHazardCategory.includes('hazardous_materials') || normalizedRootHazardCategory.includes('hazard_communication') || normalizedRootHazardCategory.includes('hazcom')) return 'Hazard Communication';
        if (normalizedRootHazardCategory.includes('noise_exposure') || normalizedRootHazardCategory.includes('industrial_hygiene') || normalizedRootHazardCategory.includes('health_') || normalizedRootHazardCategory.includes('respirable_dust_silica')) return 'Industrial Hygiene';
        if (normalizedRootHazardCategory.includes('fire_protection')) return 'Fire Protection';
        if (normalizedRootHazardCategory.includes('welding_cutting_hot_work') || normalizedRootHazardCategory.includes('fire_explosion')) return 'Welding / Cutting / Hot Work';
        return rawClassification || 'Unclassified';
      })();

      promotedPrimary.classification = effectiveClassification;
      if (!promotedPrimary.family || /^(unknown|unclassified|other|general|misc|miscellaneous)$/i.test(String(promotedPrimary.family).toLowerCase())) {
        promotedPrimary.family = rootHazardCategory;
      }

      const finalFamilyHint = String(
        normalizedRootHazardCategory ||
        effectiveClassification ||
        rootStandardFamily ||
        promotedPrimary.family ||
        '',
      ).toLowerCase();
      const advisoryObservationContext = advisoryReasoning as any;
      const hasExplicitMineContext = Boolean(
        /\b(mine|mine site|mining|aggregate|quarry|pit|crusher|screen|haul road|stockpile|miner|mill)\b/i.test(
          String(
            advisoryObservationContext?.observationContext?.rawObservation ||
            advisoryObservationContext?.observationContext?.normalizedText ||
            advisoryObservationContext?.observationContext?.rawText ||
            fusedText ||
            ""
          ).toLowerCase(),
        ),
      );
      const hasMineScopeContext = Array.isArray(normalizedScopes)
        ? normalizedScopes.some((scope: any) => String(scope || '').toLowerCase().includes('msha') || String(scope || '').toLowerCase().includes('mine'))
        : false;
      const finalFamilyPattern = (() => {
        if (finalFamilyHint.includes('electrical')) {
          return /(?:1910\.(?:303|305|331|333|334|306)|1926\.(?:403|404|405)|(?:56|57)\.(?:12004|12013|12016|12032|12034|12037)|electrical|cord|cable|wire|panel|breaker|enclosure|live parts?|energized)/i;
        }
        if (finalFamilyHint.includes('hazard_communication') || finalFamilyHint.includes('hazcom') || finalFamilyHint.includes('hazardous_materials') || finalFamilyHint.includes('chemical')) {
          return /(?:1910\.1200|1926\.59|47\.|hazard communication|hazcom|chemical|container|label|sds|spill|leak|release|drain|used oil|waste oil|unknown substance|unknown contents)/i;
        }
        if (finalFamilyHint.includes('walking_working_surfaces') || finalFamilyHint.includes('housekeeping') || finalFamilyHint.includes('slip_trip_fall')) {
          return /(?:1910\.(?:22|23|28|29)|1926\.25|(?:56|57)\.(?:20003|11001)|walking-working surfaces|housekeeping|floor|walkway|aisle|travelway|slip|trip|fall|hole|opening|guardrail|ladder|egress|debris|spill|release|residue)/i;
        }
        if (finalFamilyHint.includes('machine_guarding_loto') || finalFamilyHint.includes('lockout')) {
          return /(?:1910\.(?:212|215|219|147)|1926\.300|(?:56|57)\.(?:14107|12016)|machine guarding|guard|guarding|conveyor|rotating|shaft|pulley|nip|point of operation|moving parts?|abrasive wheel|grinder|tongue guard|wheel guard|cutoff wheel|cut-off wheel|lockout|tagout|servicing|unexpected startup|hazardous energy)/i;
        }
        if (finalFamilyHint.includes('machine_guarding')) {
          return /(?:1910\.(?:212|215|219)|1926\.300|(?:56|57)\.(?:14107|12016)|machine guarding|guard|guarding|conveyor|rotating|shaft|pulley|nip|point of operation|moving parts?|abrasive wheel|grinder|tongue guard|wheel guard|cutoff wheel|cut-off wheel)/i;
        }
        if (finalFamilyHint.includes('mobile_equipment')) {
          return hasExplicitMineContext
            ? /(?:1910\.178|1926\.(?:601|602)|30 CFR 56\.9100|30 CFR 56\.14100|30 CFR 57\.14100|mobile equipment|forklift|loader|haul truck|truck|vehicle|pedestrian|backing|traffic|spotter|berm|route|blind corner|defect|pre[- ]?op|pre[- ]?operational|remove from service)/i
            : /(?:1910\.178|1926\.(?:601|602)|mobile equipment|forklift|loader|haul truck|truck|vehicle|pedestrian|backing|traffic|spotter|route|blind corner|defect|pre[- ]?op|pre[- ]?operational|remove from service)/i;
        }
        if (finalFamilyHint.includes('powered_haulage')) {
          return /(?:30 CFR 56\.9300|30 CFR 56\.9301|berm|windrow|haul road|dump point|drop-off|stockpile edge|roadway|intersection|traffic control|spotter|truck|loader|vehicle)/i;
        }
        if (finalFamilyHint.includes('ground_control')) {
          return /(?:30 CFR 56\.3200|30 CFR 57\.3200|ground control|ground condition|highwall|roof|rib|bank|pit wall|quarry wall|fall of ground)/i;
        }
        if (finalFamilyHint.includes('material_handling')) {
          return /(?:30 CFR 56\.16002|30 CFR 57\.16002|hopper|bin|silo|drawhole|engulf|entrap|surge pile|stockpile)/i;
        }
        if (finalFamilyHint.includes('scaffold')) {
          return /(?:1926\.451|1926\.502|1926\.503|1926\.454|scaffold|scaffolding|guardrail|midrail|toprail|plank|mudsill|toe board|toeboard)/i;
        }
        if (finalFamilyHint.includes('fall_protection') || finalFamilyHint.includes('falls')) {
          return /(?:1910\.(?:28|29)|1926\.(?:1053|501)|(?:56|57)\.15005|guardrail|platform|edge|roof|fall protection|fall arrest|aerial lift|scaffold|ladder|berm|windrow|dump point|crusher platform|screen deck)/i;
        }
        if (finalFamilyHint.includes('compressed_gas')) {
          return /(?:1910\.101|1926\.350|(?:56|57)\.1600[56]|compressed gas|cylinder|oxygen|acetylene|valve cap|regulator)/i;
        }
        if (finalFamilyHint.includes('confined_space')) {
          return /(?:1910\.146|1926\.1203|confined space|permit space|tank|vessel|manhole|atmosphere|oxygen deficiency|entry)/i;
        }
        if (finalFamilyHint.includes('industrial_hygiene') || finalFamilyHint.includes('health_') || finalFamilyHint.includes('noise_exposure') || finalFamilyHint.includes('respirable_dust_silica')) {
          return /(?:1910\.95|1926\.52|62\.110|1910\.1053|1926\.1153|silica|dust|noise|hearing|hearing conservation|dosimetry|fume|vapour|vapor|heat|cold|respirator|welding|solvent|ventilation)/i;
        }
        if (finalFamilyHint.includes('welding_cutting_hot_work') || finalFamilyHint.includes('fire_explosion') || finalFamilyHint.includes('fire_protection')) {
          return /(?:1910\.252|1910\.106|1910\.157|1926\.352|(?:56|57)\.46|hot work|welding|cutting|brazing|torch|combustible|ignition|fire watch|fuel gas|gas odor|gas leak|explosion|fire extinguisher|flammable liquid|combustible liquid|eyewash|emergency shower)/i;
        }
        return null;
      })();
      const originalFindingText = String(text || '').toLowerCase();
      const hasSafeControlEvidence = /\b(fully guarded|guard installed|guarded and locked out|locked out|tagged out of service|out of service|removed from service|locked in a disposal bin|disposal bin|key removed|parked out of service|de-energized|deenergized|zero energy verified|zero-energy verified|tested before maintenance|before maintenance begins|before work begins|zero energy|tested|barricaded|secured|intact|in place|no access|not exposed|area restricted|restricted area|inaccessible)\b/i.test(fusedText);
      const hasDefectOrExposureEvidence = /\b(missing|removed|unguarded|defeated|open|exposed|damaged|frayed|cut|not working|inoperative|no guard|no cover|blocked|obstructed)\b/i.test(fusedText);
      const hasActiveEmployeeExposureEvidence = /\b(employee|worker|miner|operator|person|people|pedestrian|crew)\b.*\b(using|uses|operating|working|reaches?|contact|exposed|near|walk(?:s|ing)?|travels?|entry|inside|clearing|handling)\b/i.test(fusedText) ||
        /\b(using|uses|operating|working|reaches?|contact|exposed|near|walk(?:s|ing)?|travels?|entry|inside|clearing|handling)\b.*\b(employee|worker|miner|operator|person|people|pedestrian|crew)\b/i.test(fusedText);
      const hasOutOfServiceControlEvidence =
        /\b(tagged out of service|removed from service|out of service|locked in a disposal bin|disposal bin|discarded|stored for disposal|parked out of service|key removed|unplugged|locked storage|restricted area|area restricted|no employee exposure|no access|inaccessible)\b/i.test(fusedText) &&
        !/\b(in use|being used|while used|operating|running|backing|reverse|reversing|active traffic|employee contact possible|worker contact possible|direct exposure|exposed to)\b/i.test(fusedText);
      const hasImmediateUseContainerEvidence =
        /\b(immediate use|same shift|kept control|under (?:the )?control of (?:the )?worker|employee keeps control|temporary transfer)\b/i.test(fusedText) &&
        /\b(cup|small container|secondary container|bottle|spray bottle|container)\b/i.test(fusedText) &&
        !/\b(multiple employees|shared|left unattended|stored|storage|unknown|unidentified|not under control)\b/i.test(fusedText);
      const activeHazardEnergyText = originalFindingText.replace(/\bde-energized\b|\bdeenergized\b/g, ' ');
      const structuredControlTextForHazardousEnergy = [
        structuredObservation?.energyState || "",
        ...(structuredObservation?.controlsPresent || []),
        ...(structuredObservation?.controlsMissing || []),
        structuredObservation?.workerInteraction || "",
        structuredObservation?.additionalContext || "",
      ].join(" ").toLowerCase();
      const activeStructuredControlTextForHazardousEnergy = structuredControlTextForHazardousEnergy
        .replace(/\bno unexpected startup exposure\b/g, " ")
        .replace(/\bno (?:direct )?exposure\b/g, " ");
      const hasStructuredControlledHazardousEnergyEvidence =
        /\b(locked-out|locked out|lockout\/tagout applied|lockout applied|loto applied|zero-energy verified|zero energy verified|deenergized|de-energized|energy isolated)\b/i.test(structuredControlTextForHazardousEnergy) &&
        !/\b(no control verified|lockout\/tagout$|lockout missing|no lockout|without lockout|not locked|not verified|energized|operating|running|unexpected startup exposure|directly exposed)\b/i.test(activeStructuredControlTextForHazardousEnergy);
      const hasControlledHazardousEnergyEvidence =
        hasStructuredControlledHazardousEnergyEvidence ||
        (/\b(lock(?:ed)? out|lockout applied|loto applied|tagout applied|de-energized|deenergized|energy isolated|isolated)\b/i.test(originalFindingText) &&
          /\b(tested|verified|zero[- ]?energy|try[- ]?out|before maintenance|before work|before servicing|for maintenance|isolation complete)\b/i.test(originalFindingText) &&
          !/\b(without|no lock|not locked|not applied|not verified|missing|bypassed|incomplete|failed|energized|running|moving|unexpected startup|started unexpectedly|restarted)\b/i.test(activeHazardEnergyText));
      const hasNegativeCylinderContext = /\b(no cylinder|no cylinders|without cylinder|without cylinders|not a cylinder|no compressed gas|not compressed gas)\b/i.test(originalFindingText) ||
        /\b(smells like gas|gas smell|gas odor|gas leak|gas line|natural gas|heater cycles|heater cycle|gas appliance|furnace|boiler)\b/i.test(originalFindingText);
      const hasExplicitCompressedGasEvidence =
        !hasNegativeCylinderContext &&
        /\b(compressed gas|gas cylinder|gas cylinders|oxygen cylinder|oxygen cylinders|acetylene cylinder|acetylene cylinders|propane cylinder|argon cylinder|fuel gas cylinder|cylinder cap|valve cap|regulator|unsecured cylinder|cylinder restraint)\b/i.test(originalFindingText);
      const hasGasOdorOnlyEvidence =
        /\b(smells like gas|gas smell|gas odor|gas leak|gas line|natural gas|heater cycles|heater cycle|gas appliance|furnace|boiler)\b/i.test(originalFindingText) &&
        !hasExplicitCompressedGasEvidence;
      const hasHazardousEnergyServiceActivity =
        /\b(servicing|service work|maintenance|repair|setup|adjusting|troubleshooting|clearing (?:a )?jam(?:med)?|clear(?:ing)? (?:a )?jam(?:med)?|unjamming|un-jamming|cleaning machine|working on|work on|cleanup|cleaning|startup after maintenance|start[- ]?up after maintenance)\b/i.test(originalFindingText);
      const hasHazardousEnergyExposureIndicator =
        /\b(while energized|energized|powered|unexpected startup|unexpected energization|quick restart|no lockout|without lockout|not locked|not locked out|lockout missing|lockout bypassed|lockout incomplete|incomplete lockout|not verified|stored pressure|stored energy|power removed|release of energy|jam clearing|clearing (?:a )?jam(?:med)?|clear(?:ing)? (?:a )?jam(?:med)?|unjam(?:ming)?|running conveyor|moving conveyor|contractor servicing|multiple energy sources|electrical[, ]+hydraulic[, ]+and[, ]+pneumatic energy sources|main disconnect|only the main disconnect)\b/i.test(activeHazardEnergyText);
      const hasExplicitHazardousEnergyWork =
        !hasControlledHazardousEnergyEvidence &&
        ((hasHazardousEnergyServiceActivity &&
          /\b(machine|equipment|conveyor|press|pump|motor|line|circuit|hydraulic|pneumatic|mechanical|electrical|powered|energized|ram|cylinder)\b/i.test(originalFindingText) &&
          hasHazardousEnergyExposureIndicator) ||
        (/\b(unexpected startup|unexpected energization|hazardous energy|stored energy|release of energy)\b/i.test(originalFindingText) ||
          (/\b(lockout|tagout|loto|tagged|tagged out|zero[- ]?energy|try[- ]?out|energy isolation|isolation point|de[- ]?energized|deenergized)\b/i.test(originalFindingText) &&
            /\b(without|no lock|not locked|not applied|not verified|missing|bypassed|incomplete|failed|energized|running|moving|unexpected|startup|started)\b/i.test(originalFindingText))));
      const hasHazardousEnergyFailureEvidence =
        /\b(lockout|tagout|loto|tagged|tagged out|zero[- ]?energy|try[- ]?out|energy isolation|isolation point|de[- ]?energized|deenergized|unexpected startup|unexpected energization|hazardous energy|stored energy|release of energy)\b/i.test(originalFindingText) &&
        /\b(missing|bypassed|removed|incomplete|not locked|not verified|not used|inadequate|failed|defeated|open|exposed|damaged|frayed|cut|not working|inoperative|not applied|not done|not followed)\b/i.test(originalFindingText);
      const hasStoredHydraulicEnergyReleaseEvidence =
        /\b(hydraulic|pneumatic|stored pressure|stored energy|ram|cylinder)\b.*\b(drop|fall|release|relieved|not relieved|bleed|bled|pressure)\b/i.test(originalFindingText) ||
        /\b(stored pressure|stored energy)\b.*\b(hydraulic|pneumatic|ram|cylinder)\b/i.test(originalFindingText);
      const hasDirectHazardousEnergyContext = hasExplicitHazardousEnergyWork || hasHazardousEnergyFailureEvidence || hasStoredHydraulicEnergyReleaseEvidence;
      const isHazardousEnergyCitation = (citation: string) =>
        /(?:29\s*CFR\s*)?1910\.147|(?:30\s*CFR\s*)?(?:56|57)\.12016/i.test(citation);
      const hasDirectCitationEvidence = (standard: any) => {
        const citation = String(typeof standard === 'string' ? standard : (standard?.citation || standard?.standard || standard?.id || ''));
        if (/1910\.147|(?:56|57)\.12016/i.test(citation)) {
          return hasDirectHazardousEnergyContext;
        }
        if (/(?:56|57)\.14105/i.test(citation)) {
          return hasStoredHydraulicEnergyReleaseEvidence;
        }
        if (/30 CFR 56\.9100(?:\(a\))?|1910\.178|1926\.602/i.test(citation)) {
          return /\b(forklift|loader|haul truck|truck|vehicle|mobile equipment|traffic|pedestrian|backup alarm|audible warning|backing|blind corner|damaged|defect|worn|leaking|in service)\b/i.test(originalFindingText);
        }
        if (/1926\.1410|1926\.651/i.test(citation)) {
          return /\b(overhead utility|overhead power|power line|utility line|energized line)\b.*\b(excavation|excavator|boom|equipment|contact|route)\b/i.test(originalFindingText) ||
            /\b(excavator|boom|equipment)\b.*\b(overhead utility|overhead power|power line|utility line|energized line|contact)\b/i.test(originalFindingText);
        }
        if (/1910\.1000|1910\.1200|1910\.94/i.test(citation)) {
          return /\b(solvent|degreaser|parts cleaner|chemical vapor|chemical vapors|odor control|battery acid|corrosive|acid)\b.*\b(ventilation|small room|enclosed room|poor ventilation|no ventilation|without ventilation|spill|loose cap|caps loose|leak|splash|cart|staged|moved)\b/i.test(originalFindingText);
        }
        if (/1926\.1101|1926\.62|1910\.1001|1910\.1025/i.test(citation)) {
          return /\b(asbestos|lead)\b.*\b(insulation|dust|demolition|demo|renovation|prep|suspect|suspicion)\b/i.test(originalFindingText) ||
            /\b(old insulation|paint chips|lead dust)\b/i.test(originalFindingText);
        }
        if (/(?:56|57)\.14107/i.test(citation)) {
          return /\b(conveyor|belt|tail pulley|head pulley)\b.*\b(missing|removed|unguarded|no guard|guard missing|guard removed|moving belt)\b/i.test(originalFindingText) ||
            /\b(conveyor|belt|tail pulley|head pulley)\b.*\bguard(?:ing)?\b.*\b(missing|removed|has been removed|was removed|not in place|absent)\b/i.test(originalFindingText) ||
            /\bguard(?:ing)?\b.*\b(missing|removed|has been removed|was removed|not in place|absent)\b.*\b(conveyor|belt|tail pulley|head pulley)\b/i.test(originalFindingText);
        }
        if (/(?:56|57)\.18002/i.test(citation)) {
          return /\b(workplace exam|workplace examination|exam record|examination record)\b.*\b(not document|not documented|did not document|uncorrected|remained uncorrected|hazard)\b/i.test(originalFindingText);
        }
        if (/1910\.23|1926\.1053|(?:56|57)\.110(?:03|11)/i.test(citation)) {
          return /\b(ladder|stepladder|extension ladder|portable ladder)\b.*\b(damaged|broken|cracked|defective|loose rung|broken rung|side rail|muddy base|soft base|unstable|short distance above the landing|landing|not secured|wrong angle|top step|folded|leaning|horizontal|rated capacity)\b/i.test(originalFindingText) ||
            /\b(damaged|broken|cracked|defective|loose rung|broken rung|side rail|muddy base|soft base|unstable|short distance above the landing|not secured|wrong angle|top step|folded|leaning|horizontal|rated capacity)\b.*\b(ladder|stepladder|extension ladder|portable ladder)\b/i.test(originalFindingText);
        }
        if (/(?:56|57)\.11012|1910\.28|1926\.501/i.test(citation)) {
          return /\b(crusher|screen|plant)\b.*\b(platform|catwalk|walkway|edge)\b.*\b(no barrier|missing barrier|unguarded|no guardrail|missing guardrail|fall hazard)\b/i.test(originalFindingText) ||
            /\b(platform|catwalk|walkway|edge)\b.*\b(crusher|screen|plant)\b.*\b(no barrier|missing barrier|unguarded|no guardrail|missing guardrail|fall hazard)\b/i.test(originalFindingText);
        }
        return false;
      };
      const applyFinalFamilyFilter = (standard: any) => {
        if (!finalFamilyPattern) return true;
        const citation = String(typeof standard === 'string' ? standard : (standard?.citation || standard?.standard || standard?.id || '')).toLowerCase();
        const title = String(typeof standard === 'string' ? standard : (standard?.title || standard?.titleSummary || standard?.summary || '')).toLowerCase();
        return finalFamilyPattern.test(`${citation} ${title}`) || hasDirectCitationEvidence(standard);
      };
      const applyFinalOutputFilter = (standard: any) => {
        if (!applyFinalFamilyFilter(standard)) return false;
        const citation = String(typeof standard === 'string' ? standard : (standard?.citation || standard?.standard || standard?.id || ''));
        if (/^30 CFR\b/i.test(citation) && !(hasExplicitMineContext || hasMineScopeContext)) return false;
        if (/^29 CFR 1926\b/i.test(citation) && !(
          normalizedScopes.includes('osha_construction') ||
          /\b(construction|excavation|trench|demolition|renovation|jobsite|site work|building site|framing|floor opening|scaffold|crane|temporary wiring)\b/i.test(fusedText)
        )) return false;
        if (/^30 CFR 56\.9100(?:\(a\))?$/i.test(citation) && !(hasExplicitMineContext || hasMineScopeContext)) return false;
        if (/^30 CFR 56\.9100(?:\(a\))?$/i.test(citation) && !/\b(pedestrian|traffic|blind corner|right of way|backing|route|same aisle|same route|haul road|intersection|spotter)\b/i.test(fusedText)) return false;
        if (/(1910\.101|1926\.350|(?:56|57)\.1600[56])/i.test(citation) && (!hasExplicitCompressedGasEvidence || hasGasOdorOnlyEvidence)) return false;
        if (isHazardousEnergyCitation(citation) && (!hasDirectHazardousEnergyContext || (hasSafeControlEvidence && !hasActiveEmployeeExposureEvidence))) return false;
        if (hasSafeControlEvidence && !hasActiveEmployeeExposureEvidence && /(1910\.212|1910\.219|(?:56|57)\.14107)/i.test(citation)) return false;
        if (hasOutOfServiceControlEvidence && /(1910\.30[345]|1910\.333|1910\.334|1926\.40[346]|(?:56|57)\.12)/i.test(citation)) return false;
        if (hasOutOfServiceControlEvidence && /(1910\.178|1926\.60[12]|(?:56|57)\.(?:9100|14132|14207))/i.test(citation)) return false;
        if (/\b(parked out of service|key removed|no reverse operation|not backing|not operating|removed from service)\b/i.test(fusedText) && /(1910\.178|1926\.60[12]|(?:56|57)\.(?:9100|14132|14207))/i.test(citation)) return false;
        if (hasImmediateUseContainerEvidence && /1910\.1200|1926\.59/i.test(citation)) return false;
        if (/\b(?:three|3)[- ]?(?:ft|feet|foot)\b/i.test(fusedText) && /\b(no employee entry|no entry|no cave-in indicators|barricaded)\b/i.test(fusedText) && /1926\.652/i.test(citation)) return false;
        return true;
      };
      suggestedStandards = suggestedStandards.filter(applyFinalOutputFilter);
      supportingStandards = supportingStandards.filter(applyFinalOutputFilter);
      excludedStandards = excludedStandards.filter(applyFinalOutputFilter);
      needsMoreEvidenceStandards = needsMoreEvidenceStandards.filter(applyFinalOutputFilter);

      if (!suggestedStandards.length && hasConcreteObservedDefectOrExposure) {
        const promotableNeedsMoreEvidence = needsMoreEvidenceStandards.find((standard: any) => {
          const citation = String(typeof standard === 'string' ? standard : (standard?.citation || standard?.standard || standard?.id || ''));
          return applyFinalOutputFilter(standard) && !isHazardousEnergyCitation(citation);
        });

        if (promotableNeedsMoreEvidence) {
          suggestedStandards = [{
            ...(typeof promotableNeedsMoreEvidence === 'string'
              ? { citation: promotableNeedsMoreEvidence, title: promotableNeedsMoreEvidence }
              : promotableNeedsMoreEvidence),
            status: 'candidate_standard',
            candidateStatus: 'candidate_standard',
            source: Array.from(new Set([
              ...((Array.isArray((promotableNeedsMoreEvidence as any)?.source) ? (promotableNeedsMoreEvidence as any).source : [])),
              'final_family_recovery'
            ])),
            matchingReasons: [
              ...((Array.isArray((promotableNeedsMoreEvidence as any)?.matchingReasons) ? (promotableNeedsMoreEvidence as any).matchingReasons : [])),
              'Promoted from needs-more-evidence because final filtering removed non-applicable hazardous-energy citation and the original observation contains concrete defect/exposure evidence.'
            ],
          }];

          const promotedCitation = String((suggestedStandards[0] as any)?.citation || '').toLowerCase().replace(/\s+/g, '');
          needsMoreEvidenceStandards = needsMoreEvidenceStandards.filter((standard: any) => {
            const citation = String(typeof standard === 'string' ? standard : (standard?.citation || standard?.standard || standard?.id || '')).toLowerCase().replace(/\s+/g, '');
            return citation !== promotedCitation;
          });
        }
      }

      standardsTraceability.suggestedCitations = (standardsTraceability.suggestedCitations || []).filter((citation: any) => applyFinalOutputFilter({ citation }));
      standardsTraceability.supportingCitations = (standardsTraceability.supportingCitations || []).filter((citation: any) => applyFinalOutputFilter({ citation }));
      standardsTraceability.needsMoreEvidenceCitations = (standardsTraceability.needsMoreEvidenceCitations || []).filter((citation: any) => applyFinalOutputFilter({ citation }));
      standardsTraceability.excludedCitations = (standardsTraceability.excludedCitations || []).filter((citation: any) => applyFinalOutputFilter({ citation }));
      if (!standardsTraceability.suggestedCitations.length && hasConcreteObservedDefectOrExposure) {
        standardsTraceability.suggestedCitations = (advisoryReasoning.inspectionIntelligence?.candidateStandards || [])
          .filter(isFamilyRelevantStandard)
          .filter(applyFinalOutputFilter)
          .map((standard: any) => String(standard?.citation || '').trim())
          .filter(Boolean);
      }
      sanitizedInspectionIntelligence = sanitizedInspectionIntelligence
        ? {
            ...sanitizedInspectionIntelligence,
            candidateStandards: Array.isArray(sanitizedInspectionIntelligence?.candidateStandards)
              ? sanitizedInspectionIntelligence.candidateStandards.filter(applyFinalOutputFilter)
              : sanitizedInspectionIntelligence?.candidateStandards,
            standardApplicability: sanitizedInspectionIntelligence?.standardApplicability
              ? {
                  ...(sanitizedInspectionIntelligence.standardApplicability || {}),
                  matchedRules: Array.isArray((sanitizedInspectionIntelligence.standardApplicability as any)?.matchedRules)
                    ? (sanitizedInspectionIntelligence.standardApplicability as any).matchedRules.filter(applyFinalOutputFilter)
                    : (sanitizedInspectionIntelligence.standardApplicability as any)?.matchedRules,
                  suggestedStandards: Array.isArray((sanitizedInspectionIntelligence.standardApplicability as any)?.suggestedStandards)
                    ? (sanitizedInspectionIntelligence.standardApplicability as any).suggestedStandards.filter(applyFinalOutputFilter)
                    : (sanitizedInspectionIntelligence.standardApplicability as any)?.suggestedStandards,
                  needsMoreEvidenceStandards: Array.isArray((sanitizedInspectionIntelligence.standardApplicability as any)?.needsMoreEvidenceStandards)
                    ? (sanitizedInspectionIntelligence.standardApplicability as any).needsMoreEvidenceStandards.filter(applyFinalOutputFilter)
                    : (sanitizedInspectionIntelligence.standardApplicability as any)?.needsMoreEvidenceStandards,
                  excludedStandards: Array.isArray((sanitizedInspectionIntelligence.standardApplicability as any)?.excludedStandards)
                    ? (sanitizedInspectionIntelligence.standardApplicability as any).excludedStandards.filter(applyFinalOutputFilter)
                    : (sanitizedInspectionIntelligence.standardApplicability as any)?.excludedStandards,
                }
              : sanitizedInspectionIntelligence.standardApplicability,
          }
        : sanitizedInspectionIntelligence;

      const supplementalEntries = getSupplementalKnowledgeForContext({
        hazardCategory: rootHazardCategory,
        candidateStandardFamily: rootStandardFamily,
        classification: effectiveClassification,
        knowledgeRoute,
        observation: fusedText,
        suggestedStandards,
        supportingStandards,
      });
      const supplementalGuidance = buildSupplementalGuidance(supplementalEntries);
      const filteredPrimaryStandards = primaryStandards.filter(applyFinalOutputFilter);
      const promotedPrimaryStandards = (() => {
        const directApplicabilityStandards = applicabilityEvaluationResults
          .filter((result: any) => result?.isSufficient && !result?.excludedByDoNotSelect)
          .map((result: any) => {
            const rawCitation = String(result?.citation || result?.standard || result?.id || '').trim();
            const citation = (
              /^29 CFR 1910\.178\(l\)$/i.test(rawCitation) &&
              /\b(forklift|powered industrial truck|pallet truck)\b/i.test(fusedText) &&
              /\b(pedestrian|same aisle|separation|traffic control|spotter|blind area)\b/i.test(fusedText) &&
              !/\b(training|trained|operator authorization|authorized operator|certification|evaluation)\b/i.test(fusedText)
            ) ? '29 CFR 1910.178' : rawCitation;
            if (!citation) return null;
            return {
              citation,
              title: citation,
              titleSummary: citation,
              summary: citation,
              status: 'candidate_standard',
              candidateStatus: 'candidate_standard',
              source: ['standard_applicability'],
              matchingReasons: [`Sufficient applicability rule matched: ${citation}.`],
              evidenceNeeded: Array.isArray(result?.missingFacts) && result.missingFacts.length
                ? result.missingFacts
                : [],
            };
          })
          .filter(Boolean);
        if (directApplicabilityStandards.length) {
          return directApplicabilityStandards;
        }
        if (
          /\b(forklift|pallet truck|powered industrial truck|mobile equipment|vehicle)\b/i.test(fusedText) &&
          /\b(elevated forks|raised forks|forks elevated|load elevated|pallet truck)\b/i.test(fusedText)
        ) {
          return [
            {
              citation: '29 CFR 1910.178',
              title: 'Powered industrial trucks',
              titleSummary: 'Powered industrial trucks',
              summary: 'Candidate standard based on a pallet truck or forklift traveling with forks raised above the travel position.',
              status: 'candidate_standard',
              candidateStatus: 'candidate_standard',
              standardFamily: 'mobile_equipment',
              hazardFamily: 'mobile_equipment',
              source: ['semantic_evidence_generalization'],
              matchingReasons: ['A pallet truck or forklift is traveling with elevated forks above the travel position.'],
            },
          ];
        }
        return [];
      })();
      const filteredPromotedPrimaryStandards = promotedPrimaryStandards.filter(applyFinalOutputFilter);
      const uniqueByCitation = (standards: any[]) => {
        const seen = new Set<string>();
        return (standards || []).filter((standard: any) => {
          const key = String(standard?.citation || standard?.standard || standard?.id || '').toLowerCase().replace(/\s+/g, '');
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      };
      const finalPrimaryStandards = (() => {
        const seen = new Set<string>();
        return [...filteredPromotedPrimaryStandards, ...filteredPrimaryStandards].filter((standard: any) => {
          const key = String(standard?.citation || '').toLowerCase().replace(/\s+/g, '');
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, 5);
      })();
      const genericVagueGuardOnly = (() => {
        const normalizedObservation = String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        const normalizedEvidence = (evidenceTexts || []).map((item) => String(item || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim());
        const isBareGuardPhrase = (value: string) =>
          /^(missing|no|removed|absent) guards?$/.test(value) ||
          /^guards? (is|are) (missing|removed|absent)$/.test(value);
        return isBareGuardPhrase(normalizedObservation) && normalizedEvidence.every((item) => !item || isBareGuardPhrase(item));
      })();
      if (genericVagueGuardOnly) {
        const demotedStandards = uniqueByCitation([...suggestedStandards, ...finalPrimaryStandards]).map((standard: any) => ({
          ...standard,
          scopeFit: 'mismatch',
          candidateStatus: 'needs_more_evidence',
          exclusionReason: 'Generic guard concern lacks equipment, component, motion, task, and exposure facts needed for an active citation.',
          scopeExclusionReason: 'Generic guard concern lacks equipment, component, motion, task, and exposure facts needed for an active citation.',
        }));
        needsMoreEvidenceStandards = uniqueByCitation([...needsMoreEvidenceStandards, ...demotedStandards]);
        excludedStandards = uniqueByCitation([...excludedStandards, ...demotedStandards]);
        suggestedStandards = [];
        finalPrimaryStandards.length = 0;
        primaryStandards.length = 0;
        standardsTraceability.suggestedCitations = [];
      }
      if (!standardsTraceability.suggestedCitations.length && finalPrimaryStandards.length) {
        standardsTraceability.suggestedCitations = finalPrimaryStandards
          .map((standard: any) => String(standard?.citation || '').trim())
          .filter(Boolean);
      }
      const hasSufficientSpecificStandard = [
        ...(standardAppResults?.evaluationResults || []),
        ...(advisoryReasoning?.inspectionIntelligence?.standardApplicability?.evaluationResults || []),
      ].some((result: any) => result?.isSufficient && !result?.excludedByDoNotSelect);
      const hasMixedHazardAmbiguity =
        /\bleaking drum\b/i.test(fusedText) &&
        /\bdamaged cord\b/i.test(fusedText);
      if (hasSufficientSpecificStandard && !isVague) {
        const boostedConfidence = Math.max(Number(promotedPrimary?.confidence || 0), 0.55);
        promotedPrimary.confidence = boostedConfidence;
        if (boostedConfidence >= 0.55 && String(promotedPrimary.confidenceBand || '').toLowerCase() === 'low' && !hasMixedHazardAmbiguity) {
          promotedPrimary.confidenceBand = boostedConfidence >= 0.75 ? 'high' : 'medium';
        }
      }
      const resolvedPrimaryCitation = (() => {
        if (genericVagueGuardOnly) return '';
        const hasConstructionWorkContext =
          /\b(construction|excavation|trench|demolition|renovation|jobsite|site work|scaffold|crane|temporary wiring)\b/i.test(fusedText);
        const hasMineWorkContext = /\b(mine|miner|miners|msha|quarry|pit|crusher|screen plant|aggregate plant)\b/i.test(fusedText);
        const hasGeneralIndustryLotoContext =
          hasDirectHazardousEnergyContext &&
          !hasMineWorkContext &&
          !hasConstructionWorkContext;
        const canSurfacePromotedCitation = (citation: string) => {
          const normalizedCitation = String(citation || '').trim();
          if (!normalizedCitation) return false;
          if (
            /^(review|needs more evidence|candidate standard|suggested candidate standard|fallback candidate standard|unclassified|unknown)$/i.test(normalizedCitation)
          ) {
            return false;
          }
          if (isHazardousEnergyCitation(normalizedCitation) && !hasDirectHazardousEnergyContext) {
            return false;
          }
          return true;
        };
        const pickPromotableCitation = (...candidates: Array<string | undefined | null>) => {
          for (const candidate of candidates) {
            const citation = String(candidate || '').trim();
            if (!citation) continue;
            if (!canSurfacePromotedCitation(citation)) continue;
            if (standardFamilyPattern && !standardFamilyPattern.test(citation)) continue;
            return citation;
          }
          return '';
        };
        const intelligencePrimaryCitation = String((intelligence as any)?.primaryCitation || '').trim();
        const candidateCitation = String(
          suggestedStandards?.[0]?.citation ||
            filteredPrimaryStandards?.[0]?.citation ||
            filteredPromotedPrimaryStandards?.[0]?.citation ||
            standardsTraceability.suggestedCitations?.[0] ||
            '',
        ).trim();
        const fallbackCitation = (
          /\b(forklift|pallet truck|powered industrial truck|mobile equipment|vehicle)\b/i.test(fusedText) &&
          /\b(elevated forks|raised forks|forks elevated|load elevated|pallet truck)\b/i.test(fusedText)
        ) ? '29 CFR 1910.178' : '';
        return pickPromotableCitation(
          hasGeneralIndustryLotoContext && !hasControlledHazardousEnergyEvidence ? '29 CFR 1910.147' : '',
          intelligencePrimaryCitation,
          candidateCitation,
          fallbackCitation,
        );
      })();

      const ensureVisibleStandard = (
        citation: string,
        title: string,
        target: 'suggested' | 'supporting' = 'suggested',
        options?: { allowWhenVague?: boolean },
      ) => {
        if (!citation || (isVague && !options?.allowWhenVague)) return;
        const normalizedCitation = citation.toLowerCase().replace(/\s+/g, '');
        const hasCitation = [...suggestedStandards, ...supportingStandards, ...finalPrimaryStandards].some((standard: any) =>
          String(standard?.citation || standard?.standard || standard?.id || '').toLowerCase().replace(/\s+/g, '') === normalizedCitation,
        );
        if (hasCitation) return;
        const standard = buildDisplayStandard({
          citation,
          title,
          titleSummary: title,
          summary: title,
          status: 'candidate_standard',
          candidateStatus: 'candidate_standard',
          source: ['final_evidence_based_visibility'],
          matchingReasons: ['Direct observation evidence supports surfacing this standard for qualified review.'],
        });
        if (!standard) return;
        if (target === 'supporting') {
          supportingStandards = uniqueByCitation([...supportingStandards, standard]).slice(0, 5);
        } else {
          suggestedStandards = uniqueByCitation([...suggestedStandards, standard]).slice(0, 5);
        }
      };

      if (hasExplicitConveyorGuardEnergyContext && !hasControlledHazardousEnergyEvidence && /\b(mine|miner|miners|msha|quarry|pit|aggregate plant)\b/i.test(fusedText)) {
        ensureVisibleStandard('30 CFR 56.14107(a)', 'Moving machine parts guarding', 'suggested');
        ensureVisibleStandard('30 CFR 56.12016', 'Work on electrically powered equipment; deenergizing and lockout', 'supporting');
      }

      if (
        normalizedScopes.some((scope) => String(scope).includes('msha')) &&
        /\b(conveyor|belt|jam|clearing jam|clear a jam)\b/i.test(fusedText) &&
        /\b(energized|operating|running|unexpected startup|lockout not applied|no lockout|without lockout|loto not applied)\b/i.test(fusedText)
      ) {
        ensureVisibleStandard('30 CFR 56.14107(a)', 'Moving machine parts guarding', 'suggested');
        ensureVisibleStandard('30 CFR 56.12016', 'Work on electrically powered equipment; deenergizing and lockout', 'supporting');
      }

      const hasConstructionLadderDefectEvidence =
        (normalizedScopes.includes('osha_construction') || /\b(construction|jobsite|building site)\b/i.test(fusedText)) &&
        /\b(ladder|portable ladder|extension ladder|stepladder|step ladder)\b/i.test(fusedText) &&
        /\b(using|used|climb|climbing|access|employees?|workers?)\b/i.test(fusedText) &&
        /\b(cracked|broken|damaged|defective|loose rung|side rail|split rail)\b/i.test(fusedText);
      if (hasConstructionLadderDefectEvidence) {
        ensureVisibleStandard('29 CFR 1926.1053(b)(16)', 'Defective ladders shall be withdrawn from service', 'suggested', { allowWhenVague: true });
      }

      const hasGeneralIndustryWalkingSurfaceReleaseEvidence =
        (normalizedScopes.includes('osha_general_industry') || /\b(manufacturing|plant|warehouse|shop|facility)\b/i.test(fusedText)) &&
        /\b(oil|grease|spill|spilled|leak|leaking|slick|wet)\b/i.test(fusedText) &&
        /\b(aisle|walkway|walking surface|travel path|floor|route)\b/i.test(fusedText) &&
        /\b(employees?|workers?|pedestrians?|used by|traffic)\b/i.test(fusedText);
      if (hasGeneralIndustryWalkingSurfaceReleaseEvidence) {
        ensureVisibleStandard('29 CFR 1910.22(a)(2)', 'Walking-working surfaces maintained free of hazards', 'suggested', { allowWhenVague: true });
      }

      if (
        resolvedPrimaryCitation &&
        !suggestedStandards.length &&
        !supportingStandards.length &&
        !isVague
      ) {
        ensureVisibleStandard(resolvedPrimaryCitation, resolvedPrimaryCitation, 'suggested');
      }

      const response = {
          ...promotedPrimary,
          ...intelligence,
          applicabilityIntelligence: sanitizedApplicabilityIntelligence,
          classification: effectiveClassification,
          primaryCitation: resolvedPrimaryCitation,
          reviewStateLabel: likelyGuardingReview
            ? 'Review needed — likely guarding issue'
            : isVague
              ? 'Review needed — more evidence required'
              : requiresHumanReview
                ? 'Review'
                : undefined,
          isVague,
          evidenceGapQuestions:
            likelyGuardingReview &&
            !(advisoryReasoning.inspectionIntelligence?.evidenceGapQuestions || []).length
              ? guardingReviewQuestions
              : isVague
              ? (advisoryReasoning.inspectionIntelligence?.evidenceGapQuestions || [])
                : (intelligence.evidenceGapQuestions || []),
          structuredObservation,
          clarificationAnswerState: {
            answeredQuestionIds: normalizedAnswerState.answeredQuestionIds,
            invalidAnswers: normalizedAnswerState.invalidAnswers,
          },
          unresolvedContradictions,
          evidenceUsed: this.buildStructuredEvidenceUsed(structuredObservation, fusedText),
          hazardCategory: normalizedRootHazardCategory || rootHazardCategory,
          candidateStandardFamily: rootStandardFamily,
          suggestedStandards,
          primaryStandards: finalPrimaryStandards,
          standards: finalPrimaryStandards,
          supportingStandards,
          inspectionIntelligence: sanitizedInspectionIntelligence,
          standardApplicability: sanitizedInspectionIntelligence?.standardApplicability,
          evidenceGate: advisoryReasoning.inspectionIntelligence?.evidenceGate,
          citationRecovery: citationRecovery.decision,
          standardsMatchExplanations,
          excludedStandards,
          needsMoreEvidenceStandards,
          ...(debugMetadata ? { debugMetadata: diagnostics } : {}),
          standardsTraceability,
          supplementalGuidance,
          knowledgeRoute: {
            jurisdiction: knowledgeRoute.jurisdiction,
            hazardFamily: knowledgeRoute.hazardFamily,
            equipmentFamily: knowledgeRoute.equipmentFamily,
            taskMechanism: knowledgeRoute.taskMechanism,
            shardKey: knowledgeRoute.shardKey,
            sourceKeys: knowledgeRoute.sourceKeys,
            bundleIds: knowledgeRoute.bundleIds,
            confidence: knowledgeRoute.confidence,
            reasons: knowledgeRoute.reasons,
            shardSummary: {
              matchedShardCount: knowledgeShardSummary.matchedShardCount,
              shardKeys: knowledgeShardSummary.shardKeys,
              citations: knowledgeShardSummary.citations,
              evidenceNeeded: knowledgeShardSummary.evidenceNeeded,
              correctiveActionPatterns: [],
            },
            advisoryOnly: true,
            requiresQualifiedReview: true,
          },
          generatedActions: sanitizedEnhancedGeneratedActions,
          baseGeneratedActions: sanitizedGeneratedActions,
          generatedActionsEnrichment: {
            applied: true,
            source: "safescope_v2_dca_corrective_action_brain",
            usesDca: Boolean((intelligence as any).dca),
            usesCorrectiveActionReasoning: Boolean((intelligence as any).correctiveActionReasoning),
            preservesBaseActionEngineOutput: true,
          },
          reasoningSourceHierarchy,
          reasoningBasis,
          fieldOutput: (intelligence as any).fieldOutput,
          semanticUnderstanding: (intelligence as any).semanticUnderstanding,
          semanticRouting: (intelligence as any).semanticRouting,
          aiReadiness,
          aiEvidenceContract,
          additionalInformationNeeded: buildAdditionalInformationNeeded(),
          informationNeeded: buildAdditionalInformationNeeded(),
          aiCapabilityProfile,
          nativeReasoning,
          learningGovernance,
          learningMemory,
          requiresHumanReview,
          knowledgeBrain: (intelligence as any).knowledgeBrain || (intelligence as any).retrieval || {},
          sourceAwareAnalysis: (intelligence as any).sourceAwareAnalysis || (intelligence as any).sbag || {},
          reasoningSnapshotId: (intelligence as any).reasoningSnapshotId || `local-reasoning-${Date.now()}`,
          decisionSupportMetadata: {
              semanticUnderstanding: (intelligence as any).semanticUnderstanding,
              semanticRouting: (intelligence as any).semanticRouting,
              reasoningSourceHierarchy,
              reasoningBasis,
              standardsTraceability,
              aiEvidenceContract,
              aiReadiness,
              aiCapabilityProfile,
              nativeReasoning,
              learningGovernance,
              learningMemory,
          }
      };

      if (response.standardsReasoning) {
        response.standardsReasoning = {
          ...response.standardsReasoning,
          topDefensible: Array.isArray(response.standardsReasoning?.topDefensible)
            ? response.standardsReasoning.topDefensible.filter(applyFinalOutputFilter)
            : response.standardsReasoning?.topDefensible,
        };
      }

      if (response.applicabilityIntelligence) {
        response.applicabilityIntelligence = {
          ...response.applicabilityIntelligence,
          primaryApplicableStandards: Array.isArray(response.applicabilityIntelligence?.primaryApplicableStandards)
            ? response.applicabilityIntelligence.primaryApplicableStandards.filter(applyFinalOutputFilter)
            : response.applicabilityIntelligence?.primaryApplicableStandards,
          supportingStandards: Array.isArray(response.applicabilityIntelligence?.supportingStandards)
            ? response.applicabilityIntelligence.supportingStandards.filter(applyFinalOutputFilter)
            : response.applicabilityIntelligence?.supportingStandards,
          needsMoreEvidenceStandards: Array.isArray(response.applicabilityIntelligence?.needsMoreEvidenceStandards)
            ? response.applicabilityIntelligence.needsMoreEvidenceStandards.filter(applyFinalOutputFilter)
            : response.applicabilityIntelligence?.needsMoreEvidenceStandards,
          excludedStandards: Array.isArray(response.applicabilityIntelligence?.excludedStandards)
            ? response.applicabilityIntelligence.excludedStandards.filter(applyFinalOutputFilter)
            : response.applicabilityIntelligence?.excludedStandards,
        };
      }

      if (resolvedPrimaryCitation) {
        response.promotion = {
          ...(response.promotion || {}),
          approvedRecordCandidate: {
            ...(response.promotion?.approvedRecordCandidate || {}),
            citation: resolvedPrimaryCitation,
            reference: resolvedPrimaryCitation,
            authority: {
              ...(response.promotion?.approvedRecordCandidate?.authority || {}),
              citation: resolvedPrimaryCitation,
            },
          },
        };
        if (!applyFinalOutputFilter(response.promotion.approvedRecordCandidate)) {
          delete response.promotion.approvedRecordCandidate;
        }
      }

      if (response.promotion?.approvedRecordCandidate && !applyFinalOutputFilter(response.promotion.approvedRecordCandidate)) {
        delete response.promotion.approvedRecordCandidate;
      }
      if (response.promotion?.approvedRecordCandidate) {
        const promotedRecord = response.promotion.approvedRecordCandidate as any;
        const promotedRecordText = `${promotedRecord?.authority?.citation || ''} ${promotedRecord?.authority?.title || ''} ${promotedRecord?.mapping?.standardFamily || ''} ${promotedRecord?.mapping?.hazardFamilies?.join(' ') || ''}`.toLowerCase();
        if (/(lockout|tagout|hazardous energy|loto)/i.test(promotedRecordText) && !hasDirectHazardousEnergyContext) {
          delete response.promotion.approvedRecordCandidate;
        }
      }

      const extractAncillaryCitation = (value: any) => String(
        typeof value === 'string'
          ? value
          : value?.citation || value?.reference || value?.standard || value?.id || value?.authority?.citation || ''
      ).trim();
      const shouldKeepAncillaryCitation = (value: any) => {
        const citation = extractAncillaryCitation(value);
        if (!citation) return true;
        if (isHazardousEnergyCitation(citation) && (!hasDirectHazardousEnergyContext || (hasSafeControlEvidence && !hasActiveEmployeeExposureEvidence))) return false;
        if (hasOutOfServiceControlEvidence && /(1910\.30[345]|1910\.333|1910\.334|1926\.40[346]|(?:56|57)\.12)/i.test(citation)) return false;
        if (hasOutOfServiceControlEvidence && /(1910\.178|1926\.60[12]|(?:56|57)\.(?:9100|14132|14207))/i.test(citation)) return false;
        if (/\b(parked out of service|key removed|no reverse operation|not backing|not operating|removed from service)\b/i.test(fusedText) && /(1910\.178|1926\.60[12]|(?:56|57)\.(?:9100|14132|14207))/i.test(citation)) return false;
        if (hasImmediateUseContainerEvidence && /1910\.1200|1926\.59/i.test(citation)) return false;
        if (/\b(?:three|3)[- ]?(?:ft|feet|foot)\b/i.test(fusedText) && /\b(no employee entry|no entry|no cave-in indicators|barricaded)\b/i.test(fusedText) && /1926\.652/i.test(citation)) return false;
        return true;
      };
      const sanitizeAncillaryStandardsList = (value: any) => Array.isArray(value)
        ? value.filter((standard: any) => shouldKeepAncillaryCitation(standard))
        : value;
      const sanitizeAncillaryReferenceStandardsList = (value: any) => Array.isArray(value)
        ? value
            .map((item: any) => {
              if (Array.isArray(item?.referenceStandards)) {
                return {
                  ...item,
                  referenceStandards: item.referenceStandards.filter((standard: any) => shouldKeepAncillaryCitation(standard)),
                };
              }
              return item;
            })
            .filter(Boolean)
        : value;
      const sanitizeAncillaryExplanationsList = (value: any) => Array.isArray(value)
        ? value.filter((item: any) => shouldKeepAncillaryCitation({
          citation: item?.reference || item?.citation || item?.standard || item?.id || '',
          title: item?.title || item?.summary || item?.reason || '',
        }))
        : value;

      response.citationLevelCandidates = sanitizeAncillaryStandardsList(response.citationLevelCandidates);
      response.generatedActions = sanitizeAncillaryReferenceStandardsList(response.generatedActions);
      response.baseGeneratedActions = sanitizeAncillaryReferenceStandardsList(response.baseGeneratedActions);
      response.standardsMatchExplanations = sanitizeAncillaryExplanationsList(response.standardsMatchExplanations);
      response.aiEvidenceContract = response.aiEvidenceContract
        ? {
            ...response.aiEvidenceContract,
            standardsSourcesUsed: sanitizeAncillaryStandardsList(response.aiEvidenceContract?.standardsSourcesUsed),
          }
        : response.aiEvidenceContract;

      if (
        normalizedScopes.some((scope) => String(scope).includes('msha')) &&
        /\b(conveyor|belt|jam|clearing jam|clear a jam)\b/i.test(fusedText) &&
        /\b(energized|operating|running|unexpected startup|lockout not applied|no lockout|without lockout|loto not applied)\b/i.test(fusedText)
      ) {
        response.supportingStandards = uniqueByCitation([
          ...(Array.isArray(response.supportingStandards) ? response.supportingStandards : []),
          {
            citation: '30 CFR 56.12016',
            title: 'Work on electrically powered equipment; deenergizing and lockout',
            summary: 'Supporting hazardous-energy isolation reference for energized conveyor jam-clearing or servicing.',
            status: 'candidate_standard',
            candidateStatus: 'candidate_standard',
            source: ['structured_evidence_hazardous_energy_support'],
            matchingReasons: [
              'Structured or narrative evidence indicates conveyor jam-clearing with equipment energized, operating, or not locked out.',
            ],
          },
        ]).slice(0, 5);
      }

      let standardDecisions = this.buildStandardDecisions({
        response,
        normalizedScopes,
      });
      const hydrateStandardReferences =
        typeof this.applicableStandards?.hydrateStandardReferences === 'function'
          ? this.applicableStandards.hydrateStandardReferences.bind(this.applicableStandards)
          : async (standards: any[] = []) => standards;

      standardDecisions = await hydrateStandardReferences(standardDecisions);
      standardDecisions = standardDecisions.filter((decision: any) => shouldKeepAncillaryCitation(decision));
      const hasMshaEnergizedConveyorJamEvidence =
        normalizedScopes.some((scope) => String(scope).includes('msha')) &&
        /\b(conveyor|belt|jam|clearing (?:a )?jam(?:med)?|clear(?:ing)? (?:a )?jam(?:med)?)\b/i.test(fusedText) &&
        /\b(energized|operating|running|unexpected startup|lockout not applied|no lockout|without lockout|loto not applied)\b/i.test(fusedText);
      if (hasMshaEnergizedConveyorJamEvidence) {
        standardDecisions = standardDecisions.map((decision: any) => {
          if (!/(?:30 CFR )?56\.12016/i.test(String(decision?.citation || ''))) return decision;
          return {
            ...decision,
            authority: decision?.authority || 'supporting',
            confidence: Math.max(Number(decision?.confidence) || 0, 0.82),
            isCandidate: false,
            isDirectMatch: Boolean(decision?.isDirectMatch),
            applicabilityStatus: 'probable',
            reasons: Array.from(new Set([
              ...(Array.isArray(decision?.reasons) ? decision.reasons : []),
              'MSHA conveyor jam-clearing evidence includes operating, energized, or not-locked-out equipment.',
            ])),
          };
        });
      }
      const hasPermitSpaceEntryPredicateEvidence =
        (normalizedScopes.includes('osha_general_industry') || /\b(general industry|warehouse|plant|facility|process tank)\b/i.test(fusedText)) &&
        /\b(permit[- ]required|permit space|prcs|process tank|tank)\b/i.test(fusedText) &&
        /\b(entered|entry|inside|went into|worker in|employee in)\b/i.test(fusedText) &&
        /\b(toxic atmosphere|hazardous atmosphere|possible toxic|low oxygen|oxygen deficient|atmospheric test|pre[- ]entry|no attendant|without attendant|rescue|permit)\b/i.test(fusedText);
      if (hasPermitSpaceEntryPredicateEvidence) {
        standardDecisions = standardDecisions.map((decision: any) => {
          if (!/(?:29 CFR )?1910\.146/i.test(String(decision?.citation || ''))) return decision;
          return {
            ...decision,
            authority: decision?.authority || 'primary',
            confidence: Math.max(Number(decision?.confidence) || 0, 0.84),
            isCandidate: false,
            isDirectMatch: true,
            applicabilityStatus: 'probable',
            reasons: Array.from(new Set([
              ...(Array.isArray(decision?.reasons) ? decision.reasons : []),
              'OSHA general-industry confined-space evidence includes tank entry and permit-space atmospheric, attendant, or pre-entry testing predicates.',
            ])),
          };
        });
      }
      if (
        hasMshaEnergizedConveyorJamEvidence &&
        !standardDecisions.some((decision: any) => /(?:30 CFR )?56\.12016/i.test(String(decision?.citation || '')))
      ) {
        const hydratedSupport = await hydrateStandardReferences([{
          citation: '30 CFR 56.12016',
          title: 'Work on electrically powered equipment; deenergizing and lockout',
          summary: 'Supporting hazardous-energy isolation reference for energized conveyor jam-clearing or servicing.',
          authority: 'supporting',
          agency: 'MSHA',
          scope: 'msha',
          confidence: 0.82,
          reasons: [
            'MSHA conveyor jam-clearing evidence includes operating, energized, or not-locked-out equipment.',
          ],
          matchReasons: [
            'MSHA conveyor jam-clearing evidence includes operating, energized, or not-locked-out equipment.',
          ],
          isCandidate: true,
          isDirectMatch: false,
          source: 'structured_evidence_hazardous_energy_support',
          applicabilityStatus: 'probable',
        }]);
        standardDecisions = [...standardDecisions, ...hydratedSupport.filter((decision: any) => shouldKeepAncillaryCitation(decision))];
      }
      response.standardDecisions = standardDecisions;
      const canonicalPrimaryDecisions = standardDecisions.filter((decision: any) =>
        String(decision?.authority || '').toLowerCase() === 'primary' ||
        (decision?.isDirectMatch && !String(decision?.authority || '').toLowerCase().includes('needs_more_evidence')),
      );
      const canonicalSupportingDecisions = standardDecisions.filter((decision: any) =>
        String(decision?.authority || '').toLowerCase() === 'supporting',
      );
      const canonicalNeedsMoreEvidenceDecisions = standardDecisions.filter((decision: any) =>
        String(decision?.authority || '').toLowerCase() === 'needs_more_evidence',
      );
      if (!(Array.isArray(response.primaryStandards) && response.primaryStandards.length) && canonicalPrimaryDecisions.length) {
        response.primaryStandards = canonicalPrimaryDecisions.slice(0, 5);
      }
      if (!(Array.isArray(response.suggestedStandards) && response.suggestedStandards.length) && Array.isArray(response.primaryStandards) && response.primaryStandards.length) {
        response.suggestedStandards = response.primaryStandards.slice(0, 5);
      }
      if (!(Array.isArray(response.standards) && response.standards.length) && Array.isArray(response.primaryStandards) && response.primaryStandards.length) {
        response.standards = response.primaryStandards.slice(0, 5);
      }
      if (
        hasGeneralIndustryWalkingSurfaceReleaseEvidence &&
        ![
          ...(Array.isArray(response.suggestedStandards) ? response.suggestedStandards : []),
          ...(Array.isArray(response.primaryStandards) ? response.primaryStandards : []),
          ...(Array.isArray(response.standardDecisions) ? response.standardDecisions : []),
        ].some((standard: any) => /1910\.22/i.test(String(standard?.citation || standard?.standard || standard || "")))
      ) {
        const walkingSurfaceCandidate = {
          citation: '29 CFR 1910.22(a)(2)',
          title: 'Walking-working surfaces maintained free of hazards',
          summary: 'Oil, liquid, or slick contamination on an employee walking route supports walking-working surface review.',
          authority: 'primary',
          agency: 'OSHA',
          scope: 'osha_general_industry',
          confidence: 0.86,
          reasons: [
            'Observation describes oil or liquid contamination on an aisle, walkway, floor, or route used by employees.',
          ],
          isCandidate: true,
          isDirectMatch: true,
          source: 'independent_predicate_walking_surface_recovery',
          applicabilityStatus: 'probable' as const,
        };
        const walkingSurfaceHydrated = await hydrateStandardReferences([walkingSurfaceCandidate]);
        const walkingSurfaceStandard = Array.isArray(walkingSurfaceHydrated) && walkingSurfaceHydrated.length
          ? walkingSurfaceHydrated
          : [walkingSurfaceCandidate];
        response.suggestedStandards = uniqueByCitation([
          ...(Array.isArray(response.suggestedStandards) ? response.suggestedStandards : []),
          ...walkingSurfaceStandard,
        ]).slice(0, 5);
        response.primaryStandards = uniqueByCitation([
          ...(Array.isArray(response.primaryStandards) ? response.primaryStandards : []),
          ...walkingSurfaceStandard,
        ]).slice(0, 5);
        response.standards = uniqueByCitation([
          ...(Array.isArray(response.standards) ? response.standards : []),
          ...walkingSurfaceStandard,
        ]).slice(0, 5);
        response.standardDecisions = uniqueByCitation([
          ...(Array.isArray(response.standardDecisions) ? response.standardDecisions : []),
          ...walkingSurfaceStandard,
        ]);
      }
      if (!(Array.isArray(response.supportingStandards) && response.supportingStandards.length) && canonicalSupportingDecisions.length) {
        response.supportingStandards = canonicalSupportingDecisions.slice(0, 5);
      }
      if (!(Array.isArray(response.needsMoreEvidenceStandards) && response.needsMoreEvidenceStandards.length) && canonicalNeedsMoreEvidenceDecisions.length) {
        response.needsMoreEvidenceStandards = canonicalNeedsMoreEvidenceDecisions.slice(0, 5);
      }
      if (response.standardsReasoning && !(Array.isArray(response.standardsReasoning.topDefensible) && response.standardsReasoning.topDefensible.length) && Array.isArray(response.primaryStandards) && response.primaryStandards.length) {
        response.standardsReasoning = {
          ...response.standardsReasoning,
          topDefensible: response.primaryStandards.slice(0, 5),
        };
      }
      if (response.standardsTraceability) {
        const canonicalSuggestedCitations = (Array.isArray(response.primaryStandards) && response.primaryStandards.length
          ? response.primaryStandards
          : canonicalPrimaryDecisions)
          .map((decision: any) => String(decision?.citation || '').trim())
          .filter(Boolean);
        if (!Array.isArray(response.standardsTraceability.suggestedCitations) || !response.standardsTraceability.suggestedCitations.length) {
          response.standardsTraceability = {
            ...response.standardsTraceability,
            suggestedCitations: canonicalSuggestedCitations,
          };
        }
      }
      if (genericVagueGuardOnly) {
        response.primaryCitation = '';
        response.suggestedStandards = [];
        response.primaryStandards = [];
        response.standards = [];
        if (response.standardsTraceability) {
          response.standardsTraceability = {
            ...response.standardsTraceability,
            suggestedCitations: [],
          };
        }
      }
      if (response.isVague) {
        const demotedVagueStandards = [
          ...(Array.isArray(response.needsMoreEvidenceStandards) ? response.needsMoreEvidenceStandards : []),
          ...(Array.isArray(response.suggestedStandards) ? response.suggestedStandards : []),
          ...(Array.isArray(response.primaryStandards) ? response.primaryStandards : []),
        ].map((standard: any) => ({
          ...standard,
          candidateStatus: 'needs_more_evidence',
          status: standard?.status || 'candidate_standard',
          exclusionReason: standard?.exclusionReason || 'Vague observation needs equipment, task, exposure, control, and jurisdiction facts before active citation suggestions.',
        }));
        response.primaryCitation = '';
        response.suggestedStandards = [];
        response.supportingStandards = [];
        response.primaryStandards = [];
        response.standards = [];
        response.needsMoreEvidenceStandards = uniqueByCitation(demotedVagueStandards);
        if (response.standardsTraceability) {
          response.standardsTraceability = {
            ...response.standardsTraceability,
            suggestedCitations: [],
            supportingCitations: [],
            needsMoreEvidenceCitations: response.needsMoreEvidenceStandards.map((standard: any) => String(standard?.citation || '').trim()).filter(Boolean),
          };
        }
      }

      if (hasControlledHazardousEnergyEvidence && !hasDefectOrExposureEvidence) {
        const verificationQuestions = [
          'Confirm the lockout/tagout review status and whether the equipment remains isolated for the maintenance task.',
          'Verify that all hazardous energy sources were isolated, stored energy was relieved or restrained, and zero-energy testing was completed.',
          'Confirm each exposed employee is protected by the lockout/tagout controls before maintenance continues or equipment is restored.',
        ];
        response.primaryCitation = '';
        response.suggestedStandards = [];
        response.primaryStandards = [];
        response.standards = [];
        response.supportingStandards = [];
        response.needsMoreEvidenceStandards = [];
        response.excludedStandards = [];
        response.standardDecisions = [];
        response.citationLevelCandidates = [];
        response.evidenceGapQuestions = verificationQuestions;
        response.classification = 'Lockout / Stored Energy';
        response.hazardCategory = 'lockout_tagout';
        response.candidateStandardFamily = 'lockout_tagout';
        response.imminentDanger = false;
        response.shutdownRecommended = false;
        response.stopWorkRecommended = false;
        response.generatedActions = Array.isArray(response.generatedActions)
          ? response.generatedActions.map((action: any) => ({
              ...action,
              title: 'Verify hazardous-energy isolation before servicing',
              description: 'Controlled-state review: verify all hazardous energy sources remain isolated, stored energy is relieved or restrained, zero-energy testing is documented, and each exposed employee remains protected before maintenance continues or equipment is restored.',
              referenceStandards: [],
            }))
          : response.generatedActions;
        response.inspectionIntelligence = {
          ...(response.inspectionIntelligence || {}),
          evidenceGapQuestions: verificationQuestions,
          candidateStandards: [],
        };
        if (response.promotion?.approvedRecordCandidate) {
          delete response.promotion.approvedRecordCandidate;
        }
        if (response.standardsTraceability) {
          response.standardsTraceability = {
            ...response.standardsTraceability,
            suggestedCitations: [],
            supportingCitations: [],
            needsMoreEvidenceCitations: [],
            excludedCitations: [],
          };
        }
        response.reviewStateLabel = response.reviewStateLabel || 'Review needed — controlled energy isolation verification';
      }
      const shouldPreferGeneralPitStandard =
        /\b(forklift|powered industrial truck|pallet truck)\b/i.test(fusedText) &&
        /\b(pedestrian|same aisle|separation|traffic control|spotter|blind area)\b/i.test(fusedText) &&
        !/\b(training|trained|operator authorization|authorized operator|certification|evaluation)\b/i.test(fusedText);
      if (shouldPreferGeneralPitStandard) {
        const preferGeneralPit = (standards: any) => Array.isArray(standards)
          ? [...standards].sort((left: any, right: any) => {
              const leftCitation = String(left?.citation || left?.standard || left?.id || '').trim();
              const rightCitation = String(right?.citation || right?.standard || right?.id || '').trim();
              if (/^29 CFR 1910\.178$/i.test(leftCitation) && /^29 CFR 1910\.178\(l\)$/i.test(rightCitation)) return -1;
              if (/^29 CFR 1910\.178\(l\)$/i.test(leftCitation) && /^29 CFR 1910\.178$/i.test(rightCitation)) return 1;
              return 0;
            })
          : standards;
        response.suggestedStandards = preferGeneralPit(response.suggestedStandards);
        response.primaryStandards = preferGeneralPit(response.primaryStandards);
        response.standards = preferGeneralPit(response.standards);
        if (/^29 CFR 1910\.178\(l\)$/i.test(String(response.primaryCitation || '')) && response.suggestedStandards?.some((standard: any) => /^29 CFR 1910\.178$/i.test(String(standard?.citation || '')))) {
          response.primaryCitation = '29 CFR 1910.178';
        }
      }
      const mechanismChain = this.buildMechanismChain({
        response,
        normalizedScopes,
      });
      response.mechanismChain = mechanismChain;
      response.decisionSupportMetadata = {
        ...(response.decisionSupportMetadata || {}),
        standardDecisions,
        standardDecisionCount: standardDecisions.length,
        mechanismChain,
      };

      if (hasMixedHazardAmbiguity && !(response.evidenceGapQuestions || []).length) {
        const mixedHazardQuestions = [
          "What material is leaking from the drum, is the drum labeled, and can the release reach the walkway or a drain?",
          "Is the damaged cord energized or available for use, and has it been removed from service?",
          "Which exposure should be controlled first: spill/release pathway, electrical contact, or pedestrian walkway access?",
        ];
        response.evidenceGapQuestions = mixedHazardQuestions;
        response.inspectionIntelligence = {
          ...(response.inspectionIntelligence || {}),
          evidenceGapQuestions: mixedHazardQuestions,
        };
      }

      if (likelyGuardingReview && !(response.evidenceGapQuestions || []).length) {
        response.evidenceGapQuestions = guardingReviewQuestions;
        response.inspectionIntelligence = {
          ...(response.inspectionIntelligence || {}),
          evidenceGapQuestions: guardingReviewQuestions,
        };
      }

      if (isVague && !(response.evidenceGapQuestions || []).length) {
        const vagueEvidenceQuestions = [
          'What exact equipment, opening, edge, container, or travel path is involved?',
          'Is the condition open, damaged, leaking, energized, obstructed, or otherwise uncontrolled?',
          'Are workers exposed directly, or is the issue only a general concern without a specific hazard path?',
        ];
        response.evidenceGapQuestions = vagueEvidenceQuestions;
        response.inspectionIntelligence = {
          ...(response.inspectionIntelligence || {}),
          evidenceGapQuestions: vagueEvidenceQuestions,
        };
      }

      if (
        !(response.evidenceGapQuestions || []).length &&
        !((response.suggestedStandards || []).length || (response.primaryStandards || []).length)
      ) {
        const fallbackEvidenceQuestions = [
          'What exact equipment, opening, edge, container, or travel path is involved?',
          'Is the condition open, damaged, leaking, energized, obstructed, or otherwise uncontrolled?',
          'Are workers exposed directly, or is the issue only a general concern without a specific hazard path?',
        ];
        response.evidenceGapQuestions = fallbackEvidenceQuestions;
        response.inspectionIntelligence = {
          ...(response.inspectionIntelligence || {}),
          evidenceGapQuestions: fallbackEvidenceQuestions,
        };
      }

      const clarifyingQuestions = this.buildStructuredClarifyingQuestions({
        fusedText,
        structuredObservation,
        existingQuestions: response.evidenceGapQuestions,
        answeredQuestionIds: normalizedAnswerState.answeredQuestionIds,
        unresolvedContradictions,
      });
      response.clarifyingQuestions = clarifyingQuestions;
      response.followUpQuestions = clarifyingQuestions;
      response.resultStage = unresolvedContradictions.length || clarifyingQuestions.some((question: any) => question?.priority === "critical")
        ? "provisional"
        : "final";
      response.requiresAnotherReasoningPass = clarifyingQuestions.length > 0;
      response.mayFinalize = response.resultStage === "final";
      response.humanReviewRequired = Boolean(response.requiresQualifiedReview || unresolvedContradictions.length || response.resultStage === "provisional");
      response.provisionalResult = response.resultStage === "provisional"
        ? {
            likelyHazardFamily: response.candidateStandardFamily || response.hazardCategory || response.classification,
            possibleAlternatives: Array.isArray(response.additionalHazards) ? response.additionalHazards.slice(0, 3) : [],
            currentConfidence: response.confidenceIntelligence?.overallConfidence ?? response.confidence,
            evidenceGaps: response.evidenceGapQuestions || [],
            questionsRequiredBeforeFinalStandardSelection: clarifyingQuestions.filter((question: any) =>
              question?.priority === "critical" || question?.requiredFor === "standard-applicability",
            ),
          }
        : undefined;
      response.finalStandardRankingHydrated = response.resultStage === "final";

      if (isVague) {
        const isElectrical = String(rootHazardCategory || '').toLowerCase().includes('electrical') ||
                             String(promotedPrimary.classification || '').toLowerCase().includes('electrical');
        const inspectorText = isElectrical
          ? 'Have a qualified safety professional or qualified electrical person inspect the condition.'
          : 'Have a qualified safety professional or competent person inspect the condition.';

        if (response.correctiveActionReasoning) {
          response.correctiveActionReasoning = {
            ...response.correctiveActionReasoning,
            immediateActions: [
              'Keep personnel from touching or operating the affected area/equipment until evaluated.',
              'Restrict access if damage or hazard exposure is suspected.',
              'Mark/flag the concern and collect photos/details.'
            ],
            interimControls: [
              'Maintain access control pending qualified review.'
            ],
            permanentCorrections: [
              'Repair or replace components identified by qualified review.'
            ],
            verificationSteps: [
              inspectorText
            ],
            administrativeFollowUps: [],
            urgencyLevel: 'moderate',
            immediateActionNarrative: 'Keep personnel from touching or operating the affected area/equipment until evaluated.',
            interimControlNarrative: 'Maintain access control pending qualified review.',
            permanentCorrectionNarrative: 'Repair or replace components identified by qualified review.',
            verificationNarrative: inspectorText,
            administrativeFollowUpNarrative: 'Collect photos or details and request qualified safety review.',
          };
        }

        if (response.dca) {
          response.dca = {
            ...response.dca,
            immediateActions: [],
            interimControls: [],
            permanentCorrectiveActions: [],
            verificationActions: [],
            actionRationale: 'Observation is too vague to recommend specific corrective actions.',
            blockedActions: ['Final corrective actions are blocked until critical facts are confirmed.'],
          };
        }

        if (response.inspectionIntelligence?.correctiveActions) {
          response.inspectionIntelligence.correctiveActions = {
            immediate: [
              'Keep personnel from touching or operating the affected area/equipment until evaluated.',
              'Restrict access if damage or hazard exposure is suspected.',
              'Mark/flag the concern and collect photos/details.'
            ],
            interim: [
              'Maintain access control pending qualified review.'
            ],
            permanentEngineering: [
              'Repair or replace components identified by qualified review.'
            ],
            administrativeProgramTraining: [],
            verificationFollowUp: [
              inspectorText
            ]
          };
        }

        // Run the recursive sanitizer on the response object to clean any nested properties
        return this.sanitizeResponseForVagueInput(response, isElectrical, inspectorText, rootHazardCategory);
      }

      return response;
   }


  private calibrateHazLenzConfidence(fusedText: string, promotedPrimary: any) {
    if (!promotedPrimary || typeof promotedPrimary !== "object") return;

    const text = String(fusedText || "").toLowerCase();
    const setConfidence = (score: number, band: "low" | "medium" | "high") => {
      promotedPrimary.confidence = Math.max(0, Math.min(0.99, Number(score.toFixed(2))));
      promotedPrimary.confidenceBand = band;
    };

    const currentConfidence = Number(promotedPrimary.confidence);
    const current = Number.isFinite(currentConfidence) ? currentConfidence : 0.5;
    const raiseTo = (score: number) => {
      if (current >= score) return;
      setConfidence(score, score >= 0.8 ? "high" : score >= 0.55 ? "medium" : "low");
    };

    const hasControlledCondition =
      /\b(fully guarded|guarded and locked out|locked out,? de-energized,? and tested|de-energized and tested|secured oxygen cylinder|chained upright|stored away from traffic|reinstalled before the inspection|no immediate exposure is obvious)\b/i.test(text);
    const hasContradiction =
      /\b(one note says|another says|conflicting|but another|reinstalled before the inspection)\b/i.test(text);
    const hasImprovementOnly =
      /\b(could be improved|improvement opportunity|no immediate exposure|no obvious exposure)\b/i.test(text);

    if (hasContradiction || hasImprovementOnly) {
      const score = hasContradiction ? 0.45 : 0.4;
      setConfidence(score, "low");
      return;
    }

    if (hasControlledCondition) {
      setConfidence(0.55, "low");
      return;
    }

    if (/\b(leaking drum|open walkway|damaged cord)\b/i.test(text) && /\b(leaking drum|drum)\b/i.test(text) && /\b(damaged cord|cord)\b/i.test(text)) {
      setConfidence(0.52, "low");
      return;
    }

    if (/\b(earplugs|ppe)\b/i.test(text) && /\b(loud grinder|flying particles|dust)\b/i.test(text)) {
      setConfidence(0.52, "low");
      return;
    }

    if (/\b(contractor)\b/i.test(text) && /\b(servicing|repair|maintenance)\b/i.test(text) && /\b(quick restart|available for restart|restart during)\b/i.test(text)) {
      raiseTo(0.68);
    }

    if (/\b(heat|humidity)\b/i.test(text) && /\b(shade|rest|hydration|work-rest|recovery)\b/i.test(text)) {
      raiseTo(0.58);
    }

    if (/\b(asbestos|lead)\b/i.test(text) && /\b(insulation|dust|demolition|renovation|prep|suspect|suspicion)\b/i.test(text)) {
      raiseTo(0.58);
    }

    if (/\b(eyewash|safety shower)\b/i.test(text) && /\b(blocked|obstructed|not reach|quickly|splash)\b/i.test(text)) {
      raiseTo(0.62);
    }

    if (/\b(natural gas odor|gas odor|smell of gas)\b/i.test(text) && /\b(source has not been found|source not found|unknown source|not been found)\b/i.test(text)) {
      setConfidence(Math.min(current, 0.52), "low");
    }
  }

  private buildEnhancedGeneratedActions(
    baseActions: any[],
    intelligence: any,
    reportId: string,
    knowledgeShardSummary?: any,
    observationText?: string,
    isVague?: boolean,
  ) {
    const safeArray = (value: any) => Array.isArray(value) ? value : [];
    const base = safeArray(baseActions);
    const primary = base[0] || {};
    const normalizedObservation = String(observationText || "").toLowerCase();

    const hasMobileEquipmentObject = /\b(forklift|loader|haul truck|vehicle|vehicles|mobile equipment|powered haulage|backhoe|excavator|dozer|skid steer|powered industrial truck)\b/i.test(normalizedObservation);
    const hasTrafficExposure = /\b(blind spot|blind spots|blind corner|backing|backup alarm|backup alarms|berm|berms|haul road|haul roads|spotter|spotters|flagger|flaggers|traffic control|traffic controls|vehicle lane|vehicle lanes)\b/i.test(normalizedObservation) ||
      (/\b(pedestrian|pedestrians|worker on foot|travel path|travel paths)\b/i.test(normalizedObservation) && /\b(forklift|loader|haul truck|vehicle|vehicles|mobile equipment|powered haulage|backhoe|excavator|dozer|skid steer|traffic|roadway|haul road|backing)\b/i.test(normalizedObservation));
    const hasTrafficOrMobileEquipmentContext =
      hasMobileEquipmentObject ||
      (hasTrafficExposure && !/\b(oxygen cylinder|gas cylinder|compressed gas|cylinder|cylinders)\b/i.test(normalizedObservation));
    const hasElectricalContext = /\b(electrical|electric|live parts?|panel|breaker|disconnect|cord|cable|wire|wiring|conductor|gfci|shock|arc flash|arc[- ]flash|voltage)\b/i.test(normalizedObservation);
    const hasMachineGuardingContext = /\b(machine|guard|guarded|guarding|unguarded|conveyor|belt|tail pulley|head pulley|pulley|shaft|nip point|pinch point|rotating|point of operation|moving part)\b/i.test(normalizedObservation);
    const hasWalkingSurfaceContext = /\b(walkway|walking|working surface|floor|aisle|route|path|spill|slick|slip|trip|housekeeping|clutter|debris|stairs?|stairway|ladder|hole|opening)\b/i.test(normalizedObservation);
    const hasFallOrHeightContext = /\b(fall|edge|platform|scaffold|berm|dump point|roadway|haul road|hole|opening|ladder|roof|mezzanine|elevated work|handrail|stair landing|lower level)\b/i.test(normalizedObservation);
    const hasConfinedSpaceContext = /\b(confined space|permit space|manhole|vault|tank|vessel|tunnel|atmosphere|oxygen|ventilation|fumes?|toxic|entrant|entry)\b/i.test(normalizedObservation);
    const hasChemicalContext = /\b(chemical|solvent|acid|corrosive|sds|label|unlabeled|drum|container|eyewash|splash|asbestos|lead|dust|insulation)\b/i.test(normalizedObservation) ||
      (/\b(spill|leak|release)\b/i.test(normalizedObservation) && /\b(drum|container|chemical|solvent|acid|corrosive|hazardous|waste)\b/i.test(normalizedObservation));
    const hasHazComIdentityContext = /\b(unlabeled|label|sds|safety data sheet|drum|container|contents?|identity|unknown chemical|mystery)\b/i.test(normalizedObservation);
    const hasExplicitNoCylinderContext = /\b(no|without)\s+(compressed gas\s+)?cylinders?\b|\bno\s+cylinder\s+or\s+storage\s+context\b/i.test(normalizedObservation);
    const hasCylinderContext = !hasExplicitNoCylinderContext && /\b(oxygen cylinder|gas cylinder|compressed gas|cylinder|cylinders|acetylene|propane|argon)\b/i.test(normalizedObservation);
    const hasEmergencyResponseContext = /\b(eyewash|safety shower|extinguisher|exit|egress|emergency|blocked)\b/i.test(normalizedObservation);
    const hasHeatStressContext = /\b(heat|humidity|shade|rest|hydration|acclimatization|heat stress|work-rest|recovery)\b/i.test(normalizedObservation);
    const hasHazardousEnergyActionContext =
      /\b(lockout|loto|tagout|locked out|de-energized|deenergized|energy isolation|zero[- ]?energy|unexpected startup|stored energy|clearing jam|jammed conveyor)\b/i.test(normalizedObservation) ||
      (
        /\b(servicing|maintenance|repair)\b/i.test(normalizedObservation) &&
        /\b(machine|equipment|conveyor|belt|packaging machine|press|pump|motor|line|circuit|powered|energized|startup|stored energy|jam)\b/i.test(normalizedObservation) &&
        !/\b(maintenance bay|maintenance shop|maintenance area)\b/i.test(normalizedObservation)
      );
    const hasLadderConditionContext =
      /\b(ladder|stepladder|extension ladder|portable ladder)\b/i.test(normalizedObservation) &&
      /\b(damaged|broken|cracked|defective|loose rung|broken rung|side rail)\b/i.test(normalizedObservation);
    const hasLadderSetupContext =
      /\b(ladder|stepladder|extension ladder|portable ladder)\b/i.test(normalizedObservation) &&
      /\b(muddy base|soft base|unstable|short distance above the landing|not secured|wrong angle|top step|folded|leaning|horizontal|rated capacity)\b/i.test(normalizedObservation);
    const hasCordTripRouteContext =
      /\b(cord|cable|hose|extension cord)\b/i.test(normalizedObservation) &&
      /\b(across|through|in|blocks?|obstructs?|trip)\b/i.test(normalizedObservation) &&
      /\b(walkway|aisle|route|travel path|pedestrian path|floor)\b/i.test(normalizedObservation);
    const hasEdgeFallProtectionContext =
      /\b(unprotected edge|platform edge|roof edge|floor opening|floor hole|open edge|guardrail|fall arrest|fall protection)\b/i.test(normalizedObservation) ||
      (hasFallOrHeightContext && /\b(without|missing|no|unguarded|open)\b/i.test(normalizedObservation));
    const domainActionTitle =
      /\b(hydraulic|pneumatic|stored pressure|stored energy)\b/i.test(normalizedObservation) && /\b(ram|pressure|drop|release|relieved|power removed|power is removed)\b/i.test(normalizedObservation)
        ? "Control stored-energy release exposure"
        : hasHazardousEnergyActionContext && /\b(conveyor|belt|jam)\b/i.test(normalizedObservation)
          ? "Isolate conveyor energy before clearing jam"
        : hasHazardousEnergyActionContext
          ? "Verify hazardous-energy isolation before servicing"
        : hasLadderConditionContext
          ? "Remove damaged ladder from service"
        : hasLadderSetupContext
          ? "Correct ladder setup before use"
        : hasCordTripRouteContext
          ? "Clear walking route obstruction"
        : hasEdgeFallProtectionContext
          ? "Provide edge fall protection"
        : hasElectricalContext
          ? "Control electrical exposure"
          : hasCylinderContext
            ? "Control compressed-gas cylinder exposure"
            : /\b(exit|egress|extinguisher|emergency route|emergency access)\b/i.test(normalizedObservation)
              ? "Restore emergency equipment or egress readiness"
        : /\b(unprotected trench|trench|excavation)\b/i.test(normalizedObservation)
          ? "Control excavation cave-in exposure"
          : /\b(permit-required space|permit required space|confined space|permit space)\b/i.test(normalizedObservation) && /\b(no attendant|attendant missing|without attendant|attendant posted)\b/i.test(normalizedObservation)
            ? "Restore permit-space attendant controls"
            : /\b(solvent|parts cleaning|clean parts|cleaning parts)\b/i.test(normalizedObservation) && /\b(small room|room|enclosed|without ventilation|no ventilation|odor control|ventilation)\b/i.test(normalizedObservation)
              ? "Control solvent vapor exposure"
              : /\b(corrosive|chemical)\b/i.test(normalizedObservation) && /\b(pour|poured|pouring|transfer|container to another|splash)\b/i.test(normalizedObservation)
                ? "Control corrosive splash exposure"
                : /\b(eyewash|safety shower)\b/i.test(normalizedObservation)
        ? "Restore emergency eyewash or safety-shower access"
        : /\b(hot work|flammable|combustible|ignition|natural gas|gas odor|fire watch)\b/i.test(normalizedObservation)
          ? "Control fire and ignition exposure"
          : hasWalkingSurfaceContext
            ? "Control walking-surface exposure"
            : "";
    const domainCorrectiveActionPatterns = (() => {
      if (/\b(hydraulic|pneumatic|stored pressure|stored energy)\b/i.test(normalizedObservation) && /\b(ram|pressure|drop|release|relieved|power removed|power is removed)\b/i.test(normalizedObservation)) {
        return [
          "Keep workers out of the drop or release zone until stored pressure is relieved and verified.",
          "Block or support the ram/load and bleed or dissipate stored energy before work continues.",
          "Apply and verify machine-specific lockout/tagout and zero-energy checks.",
        ];
      }
      if (hasCordTripRouteContext) {
        return [
          "Remove or reroute the cord, cable, or hose from the walking route.",
          "Use overhead routing, cord covers, or designated cable management where temporary routing is necessary.",
          "Verify the aisle, walkway, or travel path remains clear before reopening normal traffic.",
        ];
      }
      if (hasElectricalContext) {
        return [
          "Restrict access to the electrical exposure until a qualified person evaluates the condition.",
          "Remove damaged cords, cables, or electrical equipment from service until repaired or replaced.",
          "Verify de-energization, repair, and inspection before normal use resumes.",
        ];
      }
      if (hasCylinderContext) {
        return [
          "Secure cylinders upright and protect valves from damage.",
          "Separate cylinders from ignition sources, incompatible materials, traffic, or impact exposure as applicable.",
          "Verify valve caps, storage position, and cylinder handling controls before normal use resumes.",
        ];
      }
      if (/\b(exit|egress|emergency route|emergency access)\b/i.test(normalizedObservation)) {
        return [
          "Clear the exit or egress route immediately and keep it unobstructed.",
          "Verify required exit width, visibility, signage, and access to the discharge path.",
          "Inspect the route and prevent re-blocking through storage/layout controls.",
        ];
      }
      if (/\b(extinguisher)\b/i.test(normalizedObservation)) {
        return [
          "Clear access to the extinguisher immediately.",
          "Verify the extinguisher is visible, mounted, inspected, and accessible.",
          "Prevent re-blocking through storage/layout controls and routine inspection.",
        ];
      }
      if (/\b(unprotected trench|trench|excavation)\b/i.test(normalizedObservation)) {
        return [
          "Keep workers out of the trench and edge exposure zone until a competent person verifies protection.",
          "Install or verify sloping, benching, shielding, or shoring appropriate to the soil and depth.",
          "Document inspection, egress, spoil setback, and access controls before work resumes.",
        ];
      }
      if (/\b(permit-required space|permit required space|confined space|permit space)\b/i.test(normalizedObservation) && /\b(no attendant|attendant missing|without attendant|attendant posted)\b/i.test(normalizedObservation)) {
        return [
          "Stop or suspend entry until a dedicated attendant is assigned and stationed at the entrance.",
          "Verify permit, communication, atmospheric monitoring, rescue, and isolation controls before entry resumes.",
          "Document attendant duties, entrant tracking, and emergency communication before closure.",
        ];
      }
      if (/\b(solvent|parts cleaning|clean parts|cleaning parts)\b/i.test(normalizedObservation) && /\b(small room|room|enclosed|without ventilation|no ventilation|odor control|ventilation)\b/i.test(normalizedObservation)) {
        return [
          "Pause or relocate solvent use until ventilation and exposure controls are verified.",
          "Use local exhaust, closed containers, compatible substitution, or reduced solvent quantities where feasible.",
          "Verify SDS, exposure assessment, PPE, ignition controls, and worker instruction before continuing.",
        ];
      }
      if (/\b(corrosive|chemical)\b/i.test(normalizedObservation) && /\b(pour|poured|pouring|transfer|container to another|splash)\b/i.test(normalizedObservation)) {
        return [
          "Pause transfer if splash controls or emergency flushing access are not verified.",
          "Use compatible transfer equipment, splash protection, secondary containment, and chemical-resistant PPE.",
          "Verify eyewash/safety shower access, SDS review, and employee instruction before continuing.",
        ];
      }
      if (hasLadderConditionContext) {
        return [
          "Stop use of the damaged ladder and tag or remove it from service.",
          "Provide a suitable inspected ladder or alternate access method before work continues.",
          "Repair or replace the ladder and verify side rails, rungs, feet, and duty rating before returning it to use.",
        ];
      }
      if (hasLadderSetupContext) {
        return [
          "Stop ladder use until the setup is corrected.",
          "Place the ladder on a stable base, secure it as needed, and extend it properly above the landing.",
          "Use an alternate access method if the required ladder setup cannot be achieved.",
        ];
      }
      if (hasEdgeFallProtectionContext) {
        return [
          "Restrict access to the fall exposure until edge protection or fall protection is in place.",
          "Install guardrails, covers, fall-arrest systems, or another suitable fall-protection control for the exposed edge or opening.",
          "Verify the fall distance, work surface, anchor/guardrail condition, and employee use before work resumes.",
        ];
      }
      if (/\b(eyewash|safety shower)\b/i.test(normalizedObservation)) {
        return [
          "Clear access to the eyewash or safety shower immediately.",
          "Verify flushing equipment activation, flow, temperature, and inspection status.",
          "Pause corrosive or splash-potential handling until emergency flushing access is restored.",
        ];
      }
      if (/\b(hot work)\b/i.test(normalizedObservation) && /\b(combustible|flammable|fire watch|ignition|separation)\b/i.test(normalizedObservation)) {
        return [
          "Stop or pause hot work until combustible materials are removed, shielded, or separated.",
          "Verify hot-work authorization, fire watch, and post-work monitoring requirements.",
          "Control sparks, slag, and heat transfer to adjacent or concealed combustible areas.",
        ];
      }
      if (/\b(flammable|combustible|ignition)\b/i.test(normalizedObservation)) {
        return [
          "Separate flammable or combustible materials from ignition sources.",
          "Move or store flammable liquids in approved containers or storage areas.",
          "Verify ventilation, bonding/grounding, and fire-prevention controls before normal use resumes.",
        ];
      }
      if (/\b(natural gas|gas odor|odor of gas)\b/i.test(normalizedObservation)) {
        return [
          "Restrict ignition sources and keep personnel away from the suspected gas-release area.",
          "Notify qualified gas or maintenance personnel to investigate and control the source.",
          "Verify gas monitoring, ventilation, and emergency response controls before reoccupying the area.",
        ];
      }
      if (hasWalkingSurfaceContext) {
        return [
          "Barricade or warn the affected walking route until the surface is cleaned or isolated.",
          "Clean the spill, debris, or slick condition and correct the source of contamination.",
          "Verify the walkway, aisle, or route is dry, clear, and usable before reopening.",
        ];
      }
      return [];
    })();

    const isTrafficControlPattern = (value: string) =>
      /\b(pedestrian|pedestrians|equipment travel path|equipment travel paths|mobile equipment|spotter|spotters|traffic control|traffic controls|backup alarm|backup alarms|blind spot|blind spots|haul road|haul roads|berm|berms|vehicle lane|vehicle lanes|operator communication|positive communication)\b/i.test(value);

    const isRelevantShardCorrectiveActionPattern = (value: string) => {
      const electricalRepairControl =
        /\b(electrical exposure|qualified electrical|enclosure|panel|breaker|cover|cord|cable|damaged electrical|electrical equipment)\b/i.test(value);
      const energyIsolationControl =
        /\b(de-energization|deenergization|de-energize|deenergize|zero[- ]energy|energy isolation|lockout|tagout)\b/i.test(value);
      if (electricalRepairControl && !hasElectricalContext) {
        return false;
      }
      if (energyIsolationControl && !(hasElectricalContext || hasHazardousEnergyActionContext)) {
        return false;
      }
      if (/\b(moving part|tail pulley|nip point|guard construction|machine guard|guarded|guarding|lockout\/tagout before cleanup|before cleanup or maintenance)\b/i.test(value) && !hasMachineGuardingContext) {
        return false;
      }
      if (/\b(lock out power switches|energy isolation|zero energy|reopening exposure|mechanical work)\b/i.test(value) && !/\b(lockout|locked out|tagout|servicing|maintenance|repair|energy|energized|de-energized|startup|stored energy|mechanical work)\b/i.test(normalizedObservation)) {
        return false;
      }
      if (/\b(grinder|grinding wheel|abrasive wheel|tool rest|tongue guard)\b/i.test(value) && !/\b(grinder|grinding wheel|abrasive wheel|bench grinder|wheel)\b/i.test(normalizedObservation)) {
        return false;
      }
      if (isTrafficControlPattern(value) && !hasTrafficOrMobileEquipmentContext) {
        return false;
      }
      if (/\b(slip_trip_fall_same_level|walking[- ]surface|walking\/working surface|housekeeping|slick floor|spill cleanup|clean or isolate|poor housekeeping|blocked access|debris)\b/i.test(value) && !hasWalkingSurfaceContext) {
        return false;
      }
      if ((/\b(cylinder|compressed gas|oxygen cylinder|gas cylinder|valve cap|protective cap)\b/i.test(value) || /compressed_gas/i.test(value)) && (!hasCylinderContext || hasExplicitNoCylinderContext)) {
        return false;
      }
      if (/\b(separate by 20 feet|5-foot|fire wall|fuel gas)\b/i.test(value) && !/\b(fuel gas|acetylene|propane|oxygen and fuel|incompatible cylinders|stored together|near ignition|hot work)\b/i.test(normalizedObservation)) {
        return false;
      }
      if (/\b(scaffold|scaffolding|guardrail|guardrails|fall protection|edge protection|platform condition)\b/i.test(value) && !hasFallOrHeightContext) {
        return false;
      }
      if (/\b(scaffold|scaffolding|guardrail|guardrails|fall protection|fall exposure|edge protection|platform condition)\b/i.test(value) && /\b(trench|excavation)\b/i.test(normalizedObservation) && !/\b(fall|edge|opening|platform|scaffold|guardrail)\b/i.test(normalizedObservation)) {
        return false;
      }
      if (/\b(guardrail|guardrails)\b/i.test(value) && !hasFallOrHeightContext) {
        return false;
      }
      if (/\b(chemical|container|label|sds|secondary containment|spill|corrosive|storage\/handling|appropriate ppe and storage|unknown or unlabeled)\b/i.test(value) && !hasChemicalContext) {
        return false;
      }
      if (/\b(unknown or unlabeled|unlabeled|mystery|workplace label|ghs label|pictogram|safety data sheet|sds|container identity|container contents)\b/i.test(value) && !hasHazComIdentityContext) {
        return false;
      }
      if (/\b(ventilation|atmosphere|attendant|permit|required confined space|confined-space|entry|entrant|rescue)\b/i.test(value) && !hasConfinedSpaceContext) {
        return false;
      }
      if (/\b(work-rest|hydration|acclimatization|recovery area|heat[_ -]?stress|heat illness|stressors|rest\/water\/shade|cool drinking water)\b/i.test(value) && !hasHeatStressContext) {
        return false;
      }

      return true;
    };

    const dca = intelligence?.dca || {};
    const correctiveActionReasoning = intelligence?.correctiveActionReasoning || {};
    const riskReasoning = intelligence?.riskReasoning || {};
    const scenarioIntelligence = intelligence?.scenarioIntelligence || {};
    const evidenceGapQuestions = safeArray(intelligence?.evidenceGapQuestions);
    const shardCorrectiveActionPatterns = isVague
      ? []
      : [
          ...domainCorrectiveActionPatterns,
          ...safeArray(knowledgeShardSummary?.correctiveActionPatterns),
        ]
          .map((item: any) => String(item || "").trim())
          .filter(Boolean)
          .filter(isRelevantShardCorrectiveActionPattern);

    const dcaFixes = isVague
      ? []
      : [
          ...safeArray(dca.immediateActions).map((item: any) => item?.action || item?.title || String(item)),
          ...safeArray(dca.interimControls).map((item: any) => item?.action || item?.title || String(item)),
          ...safeArray(dca.permanentCorrectiveActions).map((item: any) => item?.action || item?.title || String(item)),
          ...safeArray(dca.verificationActions).map((item: any) => item?.action || item?.title || String(item)),
        ].filter(Boolean);

    const brainFixes = isVague
      ? []
      : [
          ...safeArray(correctiveActionReasoning.immediateActions),
          ...safeArray(correctiveActionReasoning.interimControls),
          ...safeArray(correctiveActionReasoning.permanentCorrections),
          ...safeArray(correctiveActionReasoning.administrativeFollowUps),
          ...safeArray(correctiveActionReasoning.verificationSteps),
        ].filter(Boolean);

    const reviewerQuestions = [
      ...safeArray(dca.reviewerQuestions),
      ...safeArray(evidenceGapQuestions).map((item: any) =>
        typeof item === "string" ? item : item?.question || item?.prompt || "",
      ),
    ].filter(Boolean);

    const fallbackFixesAllowed = shardCorrectiveActionPatterns.length === 0;
    const staleBaseFixPattern = /windshield|protective film|cut bolts? flush|floor paint/i;

    const relevanceFilter = (item: string) =>
      isRelevantShardCorrectiveActionPattern(item);

    const suggestedFixes = Array.from(new Set([
      ...shardCorrectiveActionPatterns,
      ...dcaFixes,
      ...brainFixes,
      ...(fallbackFixesAllowed ? safeArray(primary.suggestedFixes) : []),
    ]
      .map((item) => String(item).trim())
      .filter(Boolean)
      .filter(relevanceFilter)
      .filter((item) => !staleBaseFixPattern.test(item)))).slice(0, 12);

    const fallbackDescription =
      fallbackFixesAllowed && primary.description && relevanceFilter(String(primary.description)) && !staleBaseFixPattern.test(String(primary.description))
        ? primary.description
        : "";

    const generatedReasoningText = [
      dca.actionRationale,
      correctiveActionReasoning.immediateActionNarrative,
      correctiveActionReasoning.permanentCorrectionNarrative,
      correctiveActionReasoning.verificationNarrative,
    ].map((item) => String(item || "")).join(" ");
    const generatedReasoningMatchesDomain =
      !(/\b(slip_trip_fall_same_level|walking[- ]surface|walking\/working surface|housekeeping)\b/i.test(generatedReasoningText) && !hasWalkingSurfaceContext) &&
      !(/\b(heat[_ -]?stress|rest\/water\/shade|cool drinking water|hydration)\b/i.test(generatedReasoningText) && !hasHeatStressContext) &&
      !(shardCorrectiveActionPatterns.length > 0 && /\b(mechanism unknown|failed\/missing control unknown|exposure unknown|exposure to unknown)\b/i.test(generatedReasoningText));
    const includeGeneratedReasoning = !shardCorrectiveActionPatterns.length || generatedReasoningMatchesDomain;

    const descriptionParts = [
      shardCorrectiveActionPatterns.length
        ? `Focused HazLenz shard controls: ${shardCorrectiveActionPatterns.slice(0, 4).join("; ")}`
        : "",
      fallbackDescription,
      includeGeneratedReasoning && dca.actionRationale ? `DCA rationale: ${dca.actionRationale}` : "",
      includeGeneratedReasoning && correctiveActionReasoning.immediateActionNarrative
        ? `Immediate: ${correctiveActionReasoning.immediateActionNarrative}`
        : "",
      includeGeneratedReasoning && correctiveActionReasoning.permanentCorrectionNarrative
        ? `Permanent correction: ${correctiveActionReasoning.permanentCorrectionNarrative}`
        : "",
      includeGeneratedReasoning && correctiveActionReasoning.verificationNarrative
        ? `Verification: ${correctiveActionReasoning.verificationNarrative}`
        : "",
      riskReasoning.riskNarrative || riskReasoning.summary
        ? `Risk reasoning: ${riskReasoning.riskNarrative || riskReasoning.summary}`
        : "",
      reviewerQuestions.length
        ? `Reviewer questions before closure: ${reviewerQuestions.slice(0, 4).join("; ")}`
        : "",
    ].filter(Boolean);

    const sanitizeActionText = (value: any) => {
      const raw = String(value || "").trim();
      if (!raw) return raw;
      if (relevanceFilter(raw)) return raw;
      return "";
    };

    const title = isVague
      ? "Review and control HazLenz AI-identified hazard"
      : (domainActionTitle ||
         sanitizeActionText(dca.immediateActions?.[0]?.title) ||
         sanitizeActionText(dca.immediateActions?.[0]?.action) ||
         sanitizeActionText(correctiveActionReasoning.immediateActions?.[0]) ||
         sanitizeActionText(primary.title) ||
         "Review and control HazLenz AI-identified hazard");

    const priority =
      primary.priority ||
      (correctiveActionReasoning.urgencyLevel === "critical" ? "CRITICAL" :
       correctiveActionReasoning.urgencyLevel === "high" ? "HIGH" :
       correctiveActionReasoning.urgencyLevel === "moderate" ? "MEDIUM" :
       "LOW");

    const description = isVague
      ? `Observed vague safety concern requires qualified safety review. Recommended interim controls: ${suggestedFixes.map(sanitizeActionText).filter(Boolean).slice(0, 3).join("; ")}`
      : descriptionParts.map(sanitizeActionText).filter(Boolean).join(" ");

    const enhancedPrimary = {
      ...primary,
      title: String(title),
      description,
      priority,
      source: primary.source || "AI_ENGINE",
      reportId: primary.reportId || reportId,
      suggestedFixes: suggestedFixes.map(sanitizeActionText).filter(Boolean),
      referenceStandards: isVague ? [] : primary.referenceStandards || [],
      originalSuggestion: isVague
        ? {
            source: "safescope_v2_enriched_corrective_action",
            contextualControls: primary.originalSuggestion?.contextualControls || null,
            enrichmentApplied: true,
            isVague: true,
          }
        : {
            ...(primary.originalSuggestion || {}),
            source: "safescope_v2_enriched_corrective_action",
            baseActionEngineSuggestion: primary.originalSuggestion || null,
            dca,
            correctiveActionReasoning: this.sanitizeCorrectiveActionReasoningForOutput(correctiveActionReasoning, scenarioIntelligence),
            riskReasoning,
            scenarioIntelligence,
            evidenceGapQuestions,
            reviewerQuestions,
            shardCorrectiveActionPatterns,
            usesFocusedShardCorrectiveActions: shardCorrectiveActionPatterns.length > 0,
            enrichmentApplied: true,
            relevanceFilterApplied: true,
          },
    };

    if (!hasTrafficOrMobileEquipmentContext && !isVague) {
      delete (enhancedPrimary.originalSuggestion as any).baseActionEngineSuggestion;
    }

    return [
      enhancedPrimary,
      ...base.slice(1),
    ];
  }

  private sanitizeCorrectiveActionReasoningForOutput(correctiveActionReasoning: any, scenarioIntelligence: any) {
    if (!correctiveActionReasoning || typeof correctiveActionReasoning !== "object") {
      return correctiveActionReasoning;
    }

    const mechanism = String(
      scenarioIntelligence?.mechanismOfInjury ||
      correctiveActionReasoning?.mechanismOfInjury ||
      ""
    ).toLowerCase();

    const hazardDomain = String(
      scenarioIntelligence?.hazardCategory ||
      correctiveActionReasoning?.hazardDomain ||
      ""
    ).toLowerCase();

    const isMobileEquipment =
      mechanism.includes("mobile_equipment") ||
      hazardDomain.includes("mobile_equipment");

    if (!isMobileEquipment) {
      return correctiveActionReasoning;
    }

    const mobileNarratives = {
      immediateActionNarrative:
        "Separate pedestrians from the travel path and stop movement until forks, visibility, and traffic controls are verified.",
      interimControlNarrative:
        "Use spotters, barriers, marked routes, and controlled travel paths until pedestrian exposure is resolved.",
      permanentCorrectionNarrative:
        "Implement traffic-management controls, lower forks to the travel position, and verify route separation, visibility, warning devices, and operator communication before normal travel resumes.",
      administrativeFollowUpNarrative:
        "Review traffic rules, pedestrian routes, and operator training for the equipment and travel area.",
      verificationNarrative:
        "Verify traffic-control layout, pedestrian separation, fork travel position, visibility, and worker briefing before closure.",
    };

    return {
      ...correctiveActionReasoning,
      ...mobileNarratives,
    };
  }

  private normalizeScopes(scopes?: string[], text?: string) {
    const requested = Array.isArray(scopes)
      ? scopes.map((scope) => String(scope || "").trim()).filter(Boolean)
      : [];

    if (!requested.length || requested.includes("all")) return requested;

    const combined = String(text || "").toLowerCase();
    const hasCoalContext = /\b(coal|surface coal|underground coal|longwall|continuous miner|coal mine)\b/.test(combined);
    const hasUndergroundContext = /\b(underground|shaft|slope|drift|stope|portal|subsurface)\b/.test(combined);

    return requested.flatMap((scope) => {
      if (scope === "msha") {
        if (hasCoalContext && hasUndergroundContext) return ["msha_coal_underground"];
        if (hasCoalContext) return ["msha_coal_surface"];
        if (hasUndergroundContext) return ["msha_mnm_underground"];
        return ["msha_mnm_surface"];
      }

      return [scope];
    });
  }

  private scopeToSource(scopes?: string[]) {
    if (!scopes || scopes.length === 0 || scopes.includes("all"))
      return undefined;
    if (scopes.includes("msha")) return "MSHA_MNM_SURFACE";
    if (scopes.includes("msha_mnm_surface")) return "MSHA_MNM_SURFACE";
    if (scopes.includes("msha_mnm_underground")) return "MSHA_MNM_UNDERGROUND";
    if (scopes.includes("msha_coal_underground")) return "MSHA_COAL_UNDERGROUND";
    if (scopes.includes("msha_coal_surface")) return "MSHA_COAL_SURFACE";
    if (scopes.includes("osha_general") || scopes.includes("osha_general_industry")) return "OSHA_GENERAL_INDUSTRY";
    if (scopes.includes("osha_construction")) return "OSHA_CONSTRUCTION";
    return undefined;
  }

  applyStandardsScopeFit(standards: any[], scopes: string[]) {
    return standards.map(standard => {
      const citation = standard.citation || '';
      let scopeFit = standard.scopeFit || 'neutral';
      let scopeExclusionReason = standard.scopeExclusionReason;
      let scopeFitAdjustment = scopeFit === 'mismatch' ? -500 : 0;
      const reasons = [...(standard.matchingReasons || [])];

      if (scopeFit !== 'mismatch') {
        if (scopes.includes('msha_mnm_surface')) {
          if (citation.startsWith('30 CFR 56.')) {
            scopeFit = 'preferred';
            scopeFitAdjustment = 50;
            reasons.push('preferred MSHA Part 56 surface metal/nonmetal scope');
          } else if (citation.startsWith('30 CFR 57.')) {
            scopeFit = 'mismatch';
            scopeFitAdjustment = -100;
            reasons.push('Excluded: Part 57 applies to underground metal/nonmetal, not selected surface scope.');
          } else if (citation.startsWith('30 CFR 75.') || citation.startsWith('30 CFR 77.')) {
            scopeFit = 'mismatch';
            scopeFitAdjustment = -100;
            reasons.push('Excluded: coal standard does not match selected metal/nonmetal scope.');
          } else if (citation.startsWith('29 CFR') || citation.startsWith('1910.') || citation.startsWith('1926.')) {
            scopeFit = 'mismatch';
            scopeFitAdjustment = -100;
            reasons.push('Excluded: OSHA standard is outside selected MSHA scope.');
          }
        } else if (scopes.includes('msha_mnm_underground')) {
          if (citation.startsWith('30 CFR 57.')) {
            scopeFit = 'preferred';
            scopeFitAdjustment = 50;
            reasons.push('preferred MSHA Part 57');
          } else if (citation.startsWith('30 CFR 56.') || citation.startsWith('30 CFR 75.') || citation.startsWith('30 CFR 77.')) {
            scopeFit = 'mismatch';
            scopeFitAdjustment = -100;
            reasons.push('MSHA Part mismatch');
          }
        } else if (scopes.includes('msha_coal_underground')) {
          if (citation.startsWith('30 CFR 75.')) {
            scopeFit = 'preferred';
            scopeFitAdjustment = 50;
            reasons.push('preferred MSHA Part 75');
          } else if (citation.startsWith('30 CFR 56.') || citation.startsWith('30 CFR 57.') || citation.startsWith('30 CFR 77.')) {
            scopeFit = 'mismatch';
            scopeFitAdjustment = -100;
            reasons.push('MSHA Part mismatch');
          }
        } else if (scopes.includes('msha_coal_surface')) {
          if (citation.startsWith('30 CFR 77.')) {
            scopeFit = 'preferred';
            scopeFitAdjustment = 50;
            reasons.push('preferred MSHA Part 77');
          } else if (citation.startsWith('30 CFR 56.') || citation.startsWith('30 CFR 57.') || citation.startsWith('30 CFR 75.')) {
            scopeFit = 'mismatch';
            scopeFitAdjustment = -100;
            reasons.push('MSHA Part mismatch');
          }
        }
      }

      return {
        ...standard,
        score: (standard.score || 0) + scopeFitAdjustment,
        scopeFit,
        scopeExclusionReason,
        scopeFitAdjustment,
        matchingReasons: reasons
      };
    });
  }

  private buildStandardsMatchExplanations(
    suggestedStandards: any[],
    fusedText: string,
    observationUnderstanding: any
  ) {
    const textLower = (fusedText || "").toLowerCase();

    function normalizeCit(citation: string) {
      return String(citation || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/^(\d+)\s+cfr\s+/, "")
        .replace(/\.+$/, "");
    }

    function isEvidenceSatisfied(question: string, text: string) {
      const lowerText = text.toLowerCase();
      
      // Question 1: Active operational hazard requiring physical protection
      if (
        question.includes("operational hazard requiring physical protection") || 
        question.includes("presents a physical, chemical, noise")
      ) {
        return ["chemical", "decanting", "splash", "jackhammer", "noise", "crushing", "dust", "flying", "particles"].some(kw => lowerText.includes(kw));
      }
      
      // Question 2: Specific exposure route or affected body part
      if (question.includes("specific exposure route or affected body part")) {
        return ["eye", "face", "boot", "shoe", "helmet", "ear", "hand", "shield", "head", "feet", "hearing"].some(kw => lowerText.includes(kw));
      }
      
      // Question 3: Proper personal protective equipment missing, inadequate, etc.
      if (question.includes("personal protective equipment was missing")) {
        return ["without", "no", "missing", "damaged", "wear", "observed", "unavailable", "earplug", "glasses"].some(kw => lowerText.includes(kw));
      }

      // Sibling questions (e.g. moving machinery, fall height, LOTO):
      if (question.includes("moving machine part")) {
        return ["conveyor", "pulley", "belt", "shaft", "rotating", "roller", "nip point", "pinch point"].some(kw => lowerText.includes(kw));
      }
      if (question.includes("guarding missing, damaged, removed")) {
        return ["unguarded", "missing guard", "no guard", "removed"].some(kw => lowerText.includes(kw));
      }
      if (question.includes("fall height or exposure condition")) {
        return ["fall", "height", "unprotected", "edge", "elevated", "platform"].some(kw => lowerText.includes(kw));
      }
      
      return false;
    }

    return suggestedStandards.map((std: any) => {
      const normCit = normalizeCit(std.citation);
      const seedRecord = STANDARDS_INTELLIGENCE_SEED.find(
        (s) => normalizeCit(s.citation) === normCit
      );

      if (!seedRecord) {
        // Minimal fallback explanation block if no curated seed record is found
        return {
          standardFamily: "unknown",
          jurisdiction: std.agencyCode === "MSHA" ? "msha" : "osha",
          reference: std.citation,
          title: std.heading || std.title || "Standard Reference",
          authorityTier: 2,
          matchedFacts: [],
          satisfiedEvidence: [],
          missingEvidence: ["Curated evidence requirements are not available for this reference."],
          confidence: std.confidence ? Number(std.confidence) : null,
          advisoryOnly: true,
          doesNotDeclareViolation: true,
          doesNotCreateCitation: true,
          requiresQualifiedReview: true,
        };
      }

      // Collect matched facts conservatively from the standard's seed tags that appear in the raw observation text
      const matchedFacts: string[] = [];
      const candidateTokens = [
        ...seedRecord.hazardFamilies,
        ...seedRecord.equipmentTags,
        ...seedRecord.taskTags,
        ...seedRecord.exposureTags,
        ...seedRecord.controlTags,
      ];
      for (const token of candidateTokens) {
        if (token.length > 2 && textLower.includes(token.toLowerCase())) {
          matchedFacts.push(token);
        }
      }

      // Evaluate evidenceRequirements dynamically based on text signatures
      const satisfiedEvidence: string[] = [];
      const missingEvidence: string[] = [];

      for (const req of seedRecord.evidenceRequirements) {
        if (isEvidenceSatisfied(req.question, textLower)) {
          satisfiedEvidence.push(req.question);
        } else {
          missingEvidence.push(req.question);
        }
      }

      return {
        standardFamily: seedRecord.hazardFamilies[0] || "unknown",
        jurisdiction: seedRecord.scope,
        reference: seedRecord.citation,
        title: seedRecord.title,
        authorityTier: seedRecord.authorityTier,
        matchedFacts: Array.from(new Set(matchedFacts)),
        satisfiedEvidence,
        missingEvidence,
        confidence: std.confidence ? Number(std.confidence) : null,
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true,
      };
    });
  }

  private buildStandardDecisions(input: { response: any; normalizedScopes: string[] }) {
    const response = input?.response || {};
    const normalizedScopes = Array.isArray(input?.normalizedScopes) ? input.normalizedScopes : [];
    type StandardDecisionAuthority = "primary" | "supporting" | "advisory" | "needs_more_evidence";

    const genericLabelPattern = /^(review|pending|candidate(?: standard)?|suggested candidate standard|fallback candidate standard|standard family|applicable standard|no specific standard selected yet|needs more evidence|review candidate standard|unknown|none|n\/a|na)$/i;
    const citationPattern = /\b(?:\d+\s*CFR\s*\d+(?:\.\d+)?(?:\([a-z0-9]+\))*|\d+\.\d+(?:\([a-z0-9]+\))*)\b/i;
    const authorityRank: Record<StandardDecisionAuthority, number> = {
      primary: 3,
      supporting: 2,
      needs_more_evidence: 1,
      advisory: 0,
    };
    const responseFamilyHint = String(
      response?.candidateStandardFamily ||
      response?.hazardCategory ||
      response?.classification ||
      response?.inspectionIntelligence?.hazardCandidates?.[0]?.domain ||
      ""
    ).toLowerCase();
    const observationText = [
      response?.observationContext?.rawObservation ||
      response?.observationContext?.normalizedText ||
      response?.observationContext?.rawText ||
      response?.inspectionIntelligence?.observationContext?.rawObservation ||
      response?.inspectionIntelligence?.observationContext?.normalizedText ||
      response?.inspectionIntelligence?.observationContext?.rawText ||
      response?.reasoningBasis?.observationText ||
      "",
      JSON.stringify(response?.structuredObservation || {}),
      ...(Array.isArray(response?.evidenceUsed) ? response.evidenceUsed.map((item: any) => `${item?.fact || ""} ${item?.source || ""} ${item?.effect || ""}`) : []),
    ].join(" ").toLowerCase();
    const hasExplicitMineContext = /\b(mine|mine site|mining|aggregate|quarry|pit|crusher|screen|haul road|stockpile|miner|mill)\b/i.test(
      String(
        response?.observationContext?.rawObservation ||
        response?.observationContext?.normalizedText ||
        response?.observationContext?.rawText ||
        response?.inspectionIntelligence?.observationContext?.rawObservation ||
        response?.inspectionIntelligence?.observationContext?.normalizedText ||
        response?.inspectionIntelligence?.observationContext?.rawText ||
        response?.reasoningBasis?.observationText ||
        response?.reasoningSourceHierarchy?.primaryBasis?.join(" ") ||
        ""
        ).toLowerCase(),
    );
    const multiHazardFamilies = Array.isArray(response?.multiHazardDecomposition?.hazards)
      ? response.multiHazardDecomposition.hazards
          .map((hazard: any) => String(hazard?.hazardFamily || hazard?.domainId || hazard?.domain || '').toLowerCase())
          .filter(Boolean)
      : [];
    const responseFamilyPattern = (() => {
      if (responseFamilyHint.includes('electrical')) {
        return /(?:1910\.(?:303|305|331|333|334|306)|1926\.(?:403|404|405)|(?:56|57)\.(?:12004|12013|12016|12032|12034|12037)|electrical|cord|cable|wire|panel|breaker|enclosure|live parts?|energized)/i;
      }
      if (responseFamilyHint.includes('hazard_communication') || responseFamilyHint.includes('hazcom') || responseFamilyHint.includes('hazardous_materials') || responseFamilyHint.includes('chemical')) {
        return /(?:1910\.1200|1926\.59|47\.|hazard communication|hazcom|chemical|container|label|sds|spill|leak|release|drain|used oil|waste oil|unknown substance|unknown contents)/i;
      }
      if (responseFamilyHint.includes('walking_working_surfaces') || responseFamilyHint.includes('housekeeping') || responseFamilyHint.includes('slip_trip_fall')) {
        return /(?:1910\.(?:22|23|28|29)|1926\.25|(?:56|57)\.(?:20003|11001)|walking-working surfaces|housekeeping|floor|walkway|aisle|travelway|slip|trip|fall|hole|opening|guardrail|ladder|egress|debris|spill|release|residue)/i;
      }
      if (responseFamilyHint.includes('machine_guarding_loto') || responseFamilyHint.includes('lockout')) {
        return /(?:1910\.(?:212|215|219|147)|1926\.300|(?:56|57)\.(?:14107|12016)|machine guarding|guard|guarding|conveyor|rotating|shaft|pulley|nip|point of operation|moving parts?|abrasive wheel|grinder|tongue guard|wheel guard|cutoff wheel|cut-off wheel|lockout|tagout|servicing|unexpected startup|hazardous energy)/i;
      }
      if (responseFamilyHint.includes('machine_guarding')) {
        return /(?:1910\.(?:212|215|219)|1926\.300|(?:56|57)\.(?:14107|12016)|machine guarding|guard|guarding|conveyor|rotating|shaft|pulley|nip|point of operation|moving parts?|abrasive wheel|grinder|tongue guard|wheel guard|cutoff wheel|cut-off wheel)/i;
        }
      if (responseFamilyHint.includes('mobile_equipment')) {
        return hasExplicitMineContext
          ? /(?:1910\.178|1926\.(?:601|602)|30 CFR 56\.9100|30 CFR 56\.14100|30 CFR 57\.14100|mobile equipment|forklift|loader|haul truck|truck|vehicle|pedestrian|backing|traffic|spotter|berm|route|blind corner|defect|pre[- ]?op|pre[- ]?operational|remove from service)/i
          : /(?:1910\.178|1926\.(?:601|602)|mobile equipment|forklift|loader|haul truck|truck|vehicle|pedestrian|backing|traffic|spotter|route|blind corner|defect|pre[- ]?op|pre[- ]?operational|remove from service)/i;
      }
      if (responseFamilyHint.includes('scaffold')) {
        return /(?:1926\.451|1926\.502|1926\.503|1926\.454|scaffold|scaffolding|guardrail|midrail|toprail|plank|mudsill|toe board|toeboard)/i;
      }
      if (responseFamilyHint.includes('fall_protection') || responseFamilyHint.includes('falls')) {
        return /(?:1910\.(?:28|29)|1926\.501|guardrail|platform|edge|roof|fall protection|fall arrest|aerial lift|scaffold|ladder)/i;
      }
      if (responseFamilyHint.includes('compressed_gas')) {
        return /(?:1910\.101|1926\.350|(?:56|57)\.1600[56]|compressed gas|cylinder|oxygen|acetylene|valve cap|regulator)/i;
      }
      if (responseFamilyHint.includes('confined_space')) {
        return /(?:1910\.146|1926\.1203|confined space|permit space|tank|vessel|manhole|atmosphere|oxygen deficiency|entry)/i;
      }
      if (responseFamilyHint.includes('industrial_hygiene') || responseFamilyHint.includes('health_') || responseFamilyHint.includes('noise_exposure') || responseFamilyHint.includes('respirable_dust_silica')) {
        return /(?:1910\.95|1926\.52|62\.110|1910\.1053|1926\.1153|silica|dust|noise|hearing|hearing conservation|dosimetry|fume|vapour|vapor|heat|cold|respirator|welding|solvent|ventilation)/i;
      }
        if (responseFamilyHint.includes('welding_cutting_hot_work') || responseFamilyHint.includes('fire_explosion') || responseFamilyHint.includes('fire_protection')) {
        return /(?:1910\.252|1910\.106|1910\.157|1926\.352|(?:56|57)\.46|hot work|welding|cutting|brazing|torch|combustible|ignition|fire watch|fuel gas|gas odor|gas leak|explosion|fire extinguisher|flammable liquid|combustible liquid|eyewash|emergency shower)/i;
        }
      return null;
    })();
    const multiHazardPatterns = multiHazardFamilies.flatMap((family: string) => {
      if (family.includes('electrical')) {
        return [/(?:1910\.(?:303|305|331|333|334|306)|1926\.(?:403|404|405)|(?:56|57)\.(?:12004|12013|12016|12032|12034|12037)|electrical|cord|cable|wire|panel|breaker|enclosure|live parts?|energized)/i];
      }
      if (family.includes('hazard_communication') || family.includes('hazcom') || family.includes('hazardous_materials') || family.includes('chemical')) {
        return [/(?:1910\.1200|1926\.59|47\.|hazard communication|hazcom|chemical|container|label|sds|spill|leak|release|drain|used oil|waste oil|unknown substance|unknown contents)/i];
      }
      if (family.includes('walking_working_surfaces') || family.includes('housekeeping') || family.includes('slip_trip_fall')) {
        return [/(?:1910\.(?:22|23|28|29)|1926\.25|(?:56|57)\.(?:20003|11001)|walking-working surfaces|housekeeping|floor|walkway|aisle|travelway|slip|trip|fall|hole|opening|guardrail|ladder|egress|debris|spill|release|residue)/i];
      }
      if (family.includes('machine_guarding') || family.includes('machine_guarding_loto')) {
        return [/(?:1910\.(?:212|215|219|147)|1926\.300|(?:56|57)\.(?:14107|12016)|machine guarding|guard|guarding|conveyor|rotating|shaft|pulley|nip|point of operation|moving parts?|abrasive wheel|grinder|tongue guard|wheel guard|cutoff wheel|cut-off wheel|lockout|tagout|servicing|unexpected startup|hazardous energy)/i];
      }
      if (family.includes('mobile_equipment')) {
        return [hasExplicitMineContext
          ? /(?:1910\.178|1926\.(?:601|602)|30 CFR 56\.9100|30 CFR 56\.14100|30 CFR 57\.14100|mobile equipment|forklift|loader|haul truck|truck|vehicle|pedestrian|backing|traffic|spotter|berm|route|blind corner|defect|pre[- ]?op|pre[- ]?operational|remove from service)/i
          : /(?:1910\.178|1926\.(?:601|602)|mobile equipment|forklift|loader|haul truck|truck|vehicle|pedestrian|backing|traffic|spotter|route|blind corner|defect|pre[- ]?op|pre[- ]?operational|remove from service)/i];
      }
      if (family.includes('scaffold')) {
        return [/(?:1926\.451|1926\.502|1926\.503|1926\.454|scaffold|scaffolding|guardrail|midrail|toprail|plank|mudsill|toe board|toeboard)/i];
      }
      if (family.includes('fall_protection') || family.includes('falls')) {
        return [/(?:1910\.(?:28|29)|1926\.501|guardrail|platform|edge|roof|fall protection|fall arrest|aerial lift|scaffold|ladder)/i];
      }
      if (family.includes('compressed_gas')) {
        return [/(?:1910\.101|1926\.350|(?:56|57)\.1600[56]|compressed gas|cylinder|oxygen|acetylene|valve cap|regulator)/i];
      }
      if (family.includes('confined_space')) {
        return [/(?:1910\.146|1926\.1203|confined space|permit space|tank|vessel|manhole|atmosphere|oxygen deficiency|entry)/i];
      }
      if (family.includes('industrial_hygiene') || family.includes('health_') || family.includes('noise_exposure') || family.includes('respirable_dust_silica')) {
        return [/(?:1910\.95|1926\.52|62\.110|1910\.1053|1926\.1153|silica|dust|noise|hearing|hearing conservation|dosimetry|fume|vapour|vapor|heat|cold|respirator|welding|solvent|ventilation)/i];
      }
      if (family.includes('welding_cutting_hot_work') || family.includes('fire_explosion') || family.includes('fire_protection')) {
        return [/(?:1910\.252|1910\.106|1910\.157|1926\.352|(?:56|57)\.46|hot work|welding|cutting|brazing|torch|combustible|ignition|fire watch|fuel gas|gas odor|gas leak|explosion|fire extinguisher|flammable liquid|combustible liquid|eyewash|emergency shower)/i];
      }
      return [];
    });

    const clean = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();
    const escapeRegExp = (value: string) => String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const isPlaceholder = (value: string) => genericLabelPattern.test(clean(value));
    const isCitationLike = (value: string) => citationPattern.test(clean(value));
    const decisionKey = (citation: string) => {
      const normalized = clean(citation)
        .replace(/^§\s*/i, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
      const cfrMatch = normalized.match(/\b(29|30)\s*cfr\s*((?:1910|1926|56|57|75|77)\.\d+(?:\([a-z0-9]+\))*)/i);
      const bareMatch = normalized.match(/(?:^|[^\d])((?:1910|1926|56|57|75|77)\.\d+(?:\([a-z0-9]+\))*)/i);
      const section = cfrMatch?.[2] || bareMatch?.[1] || "";
      if (!section) return normalized.replace(/\s+/g, "");
      const agency = cfrMatch?.[1] || (/^(1910|1926)\./.test(section) ? "29" : "30");
      return `${agency}cfr${section}`.replace(/\s+/g, "");
    };
    const normalizeConfidence = (candidate: any): number | undefined => {
      const raw = candidate?.confidence ?? candidate?.confidenceScore ?? candidate?.score;
      const numeric = Number(raw);
      if (!Number.isFinite(numeric)) return undefined;
      if (numeric <= 1) return Math.max(0, Math.min(1, numeric));
      if (numeric <= 100) return Math.max(0, Math.min(1, numeric / 100));
      return Math.max(0, Math.min(1, numeric / 1000));
    };
    const collectText = (value: any, keys: string[]): string[] => {
      const seen = new Set<string>();
      const values: string[] = [];
      for (const key of keys) {
        const raw = value?.[key];
        const items = Array.isArray(raw) ? raw : raw !== undefined && raw !== null ? [raw] : [];
        for (const item of items) {
          const text = clean(typeof item === "string" ? item : item?.question || item?.prompt || item?.reason || item?.text || item?.title || item?.summary || item);
          if (!text || seen.has(text.toLowerCase())) continue;
          seen.add(text.toLowerCase());
          values.push(text);
        }
      }
      return values;
    };
    const extractCitation = (value: any): string => {
      const candidates = [
        value?.citation,
        value?.standard,
        value?.standardNumber,
        value?.code,
        value?.reference,
        value?.authority?.citation,
        value?.referenceStandards?.[0]?.citation,
        value?.primaryCitation,
        typeof value === "string" ? value : "",
      ];

      for (const candidate of candidates) {
        const text = clean(candidate);
        if (!text || isPlaceholder(text) || !isCitationLike(text)) continue;
        return text;
      }
      return "";
    };
    const extractTitle = (value: any, citation: string): string => {
      const raw = clean(
        value?.title ||
        value?.heading ||
        value?.name ||
        value?.sectionTitle ||
        value?.titleSummary ||
        value?.summary ||
        value?.description ||
        value?.citationTitle ||
        ""
      );
      if (!raw || isPlaceholder(raw)) return citation || "";
      const cleaned = raw.replace(new RegExp(`^${escapeRegExp(citation)}\\s*[—:-]*\\s*`, "i"), "").trim();
      return cleaned && !isPlaceholder(cleaned) ? cleaned : (citation || "");
    };
    const authorityFor = (value: any, source: string): StandardDecisionAuthority => {
      const label = String(source || "").toLowerCase();
      const status = String(value?.candidateStatus || value?.status || "").toLowerCase();
      if (label.includes("excluded") || status.includes("excluded") || status.includes("reject")) return "advisory";
      if (label.includes("needsmoreevidence") || label.includes("needs_more_evidence") || status.includes("needs_more_evidence") || status.includes("needs more evidence")) return "needs_more_evidence";
      if (label.includes("supporting") || status.includes("supporting_context")) return "supporting";
      if (label.includes("generatedactions.referencestandards") || label.includes("basegeneratedactions.referencestandards")) return "supporting";
      return "primary";
    };
    const isDirectMatch = (authority: StandardDecisionAuthority, value: any, source: string) => {
      if (authority !== "primary") return false;
      const label = String(source || "").toLowerCase();
      return (
        label.includes("primarystandards") ||
        label.includes("suggestedstandards") ||
        label.includes("standardapplicability.suggestedstandards") ||
        label.includes("standardapplicability.matchedrules") ||
        label.includes("inspectionintelligence.candidatestandards") ||
        label.includes("standardsreasoning.topdefensible") ||
        label.includes("standardstraceability.suggestedcitations") ||
        Boolean(value?.citationRanking?.directCandidate) ||
        String(value?.candidateStatus || "").toLowerCase() === "candidate_standard"
      );
    };
    const buildDecision = (value: any, source: string): any | null => {
      const citation = extractCitation(value);
      if (!citation) return null;

      const authority = authorityFor(value, source);
      const title = extractTitle(value, citation);
      const decisionText = `${citation} ${title}`;
      const familyMatches = responseFamilyPattern?.test(decisionText) || multiHazardPatterns.some((pattern: RegExp) => pattern.test(decisionText));
      const sourceTraceWalkingSurfaceFit =
        source === "standardsTraceability.suggestedCitations" &&
        /1910\.22/i.test(citation) &&
        /\b(oil|grease|spill|spilled|leak|leaking|slick|wet)\b/i.test(observationText) &&
        /\b(aisle|walkway|walking surface|travel path|floor|route)\b/i.test(observationText) &&
        /\b(employees?|workers?|pedestrians?|used by|traffic)\b/i.test(observationText);
      if ((responseFamilyPattern || multiHazardPatterns.length > 0) && !familyMatches && !sourceTraceWalkingSurfaceFit) {
        return null;
      }
      if (
        /(1910\.101|1926\.350|(?:56|57)\.1600[56])/i.test(citation) &&
        !/\b(no cylinder|no cylinders|without cylinder|without cylinders|not a cylinder|no compressed gas|not compressed gas)\b/i.test(observationText) &&
        !/\b(compressed gas|cylinder|oxygen cylinder|acetylene cylinder|propane cylinder|argon cylinder|fuel gas cylinder|valve cap|regulator)\b/i.test(observationText)
      ) {
        return null;
      }
      if (/(1910\.147|(?:56|57)\.12016)/i.test(citation) && !/\b(lockout|tagout|loto|locked out|de[- ]?energized|deenergized|energy isolation|stored energy|unexpected startup|unexpected energization|servicing|maintenance|repair|unjam|clearing jam|cleaning machine)\b/i.test(observationText)) {
        return null;
      }
      if (/(1910\.1200|1926\.59|47\.)/i.test(citation) && !/\b(unlabeled|no label|missing label|secondary container|chemical|drum|bottle|spill|leak|release|open container|used oil|waste oil|unknown contents)\b/i.test(observationText)) {
        return null;
      }
      if (/(1910\.305|1910\.334|1926\.404|1926\.405|(?:56|57)\.12013|(?:56|57)\.12032)/i.test(citation) && !/\b(open breaker slot|missing cover|open electrical panel|damaged cord|frayed cord|exposed conductor|live parts?|arc flash|GFCI|ground[- ]fault|electrical|breaker|disconnect|panel|wiring|cord|cable)\b/i.test(observationText)) {
        return null;
      }
      const matchReasons = collectText(value, [
        "matchingReasons",
        "matchReasons",
        "rationale",
        "reason",
        "reasons",
        "supportReason",
        "supportReasonText",
      ]);
      const evidenceGaps = collectText(value, [
        "evidenceNeeded",
        "evidenceGaps",
        "missingEvidence",
        "evidenceGapQuestions",
        "questions",
      ]);
      const agency = clean(value?.agencyCode || value?.agency || (String(citation).startsWith("30 CFR") ? "MSHA" : "OSHA")) || undefined;
      const scope = clean(value?.scope || value?.jurisdiction || value?.standardScope || normalizedScopes[0] || "");
      const standardText = clean(value?.standardText || value?.fullText || value?.regulationText || value?.regulatoryText || "");
      const summary = clean(value?.summary || value?.plainLanguageSummary || value?.titleSummary || "");
      const rawStatus = String(value?.applicabilityStatus || value?.candidateStatus || value?.status || authority || "").toLowerCase();
      const applicabilityStatus =
        /not[-_ ]applicable|excluded|mismatch|reject/.test(rawStatus) ? "not-applicable" :
        /needs[-_ ]more[-_ ]evidence|needs more evidence|review/.test(rawStatus) ? "needs-more-evidence" :
        /confirmed/.test(rawStatus) ? "confirmed" :
        authority === "primary" ? "probable" :
        authority === "supporting" ? "candidate" :
        authority === "needs_more_evidence" ? "needs-more-evidence" :
        "candidate";
      return {
        citation,
        title,
        standardText: standardText || undefined,
        summary: summary || undefined,
        plainLanguageSummary: clean(value?.plainLanguageSummary || "") || undefined,
        authority,
        agency: agency || undefined,
        scope: scope || undefined,
        confidence: normalizeConfidence(value),
        reasons: matchReasons.length ? matchReasons : undefined,
        matchReasons: matchReasons.length ? matchReasons : undefined,
        evidenceGaps: evidenceGaps.length ? evidenceGaps : undefined,
        isCandidate: authority !== "advisory",
        isDirectMatch: isDirectMatch(authority, value, source),
        source,
        applicabilityStatus,
      };
    };
    const ingest = (
      bucket: any,
      source: string,
      decisions: Map<string, any>,
    ) => {
      const items = Array.isArray(bucket) ? bucket : bucket ? [bucket] : [];
      for (const item of items) {
        const decision = buildDecision(item, source);
        if (!decision) continue;

        const key = decisionKey(decision.citation);
        const existing = decisions.get(key);
        if (!existing) {
          decisions.set(key, decision);
          continue;
        }

        const existingRank = authorityRank[existing.authority as StandardDecisionAuthority] ?? -1;
        const incomingRank = authorityRank[decision.authority as StandardDecisionAuthority] ?? -1;
        const merged = {
          ...existing,
          ...decision,
          authority: incomingRank > existingRank ? decision.authority : existing.authority,
          title: (existing.title && !isPlaceholder(existing.title) && existing.title !== existing.citation)
            ? existing.title
            : decision.title || existing.citation,
          standardText: existing.standardText || decision.standardText,
          summary: existing.summary || decision.summary,
          plainLanguageSummary: existing.plainLanguageSummary || decision.plainLanguageSummary,
          confidence: Math.max(
            Number.isFinite(Number(existing.confidence)) ? Number(existing.confidence) : 0,
            Number.isFinite(Number(decision.confidence)) ? Number(decision.confidence) : 0,
          ) || undefined,
          reasons: Array.from(new Set([...(existing.reasons || []), ...(decision.reasons || [])])).filter(Boolean),
          matchReasons: Array.from(new Set([...(existing.matchReasons || []), ...(decision.matchReasons || [])])).filter(Boolean),
          evidenceGaps: Array.from(new Set([...(existing.evidenceGaps || []), ...(decision.evidenceGaps || [])])).filter(Boolean),
          source: Array.from(new Set([...(String(existing.source || "").split(" | ").filter(Boolean)), ...(String(decision.source || "").split(" | ").filter(Boolean))])).join(" | "),
          isCandidate: (incomingRank > existingRank ? decision.isCandidate : existing.isCandidate) !== false,
          isDirectMatch: incomingRank > existingRank ? decision.isDirectMatch : existing.isDirectMatch,
          applicabilityStatus: existing.applicabilityStatus || decision.applicabilityStatus,
        };
        decisions.set(key, merged);
      }
    };

    const decisions = new Map<string, any>();

    ingest(response?.primaryStandards, "primaryStandards", decisions);
    ingest(response?.suggestedStandards, "suggestedStandards", decisions);
    ingest(response?.standards, "standards", decisions);
    ingest(response?.standardApplicability?.suggestedStandards, "standardApplicability.suggestedStandards", decisions);
    ingest(response?.standardApplicability?.matchedRules, "standardApplicability.matchedRules", decisions);
    ingest(response?.inspectionIntelligence?.candidateStandards, "inspectionIntelligence.candidateStandards", decisions);
    ingest(response?.applicabilityIntelligence?.primaryApplicableStandards, "applicabilityIntelligence.primaryApplicableStandards", decisions);
    ingest(response?.standardsReasoning?.topDefensible, "standardsReasoning.topDefensible", decisions);
    ingest(response?.supportingStandards, "supportingStandards", decisions);
    ingest(response?.standardsTraceability?.suggestedCitations, "standardsTraceability.suggestedCitations", decisions);
    ingest(response?.standardsTraceability?.supportingCitations, "standardsTraceability.supportingCitations", decisions);
    ingest(response?.applicabilityIntelligence?.supportingStandards, "applicabilityIntelligence.supportingStandards", decisions);
    ingest(response?.promotion?.approvedRecordCandidate, "promotion.approvedRecordCandidate", decisions);
    ingest(
      (response?.standardApplicability?.evaluationResults || []).filter((result: any) => result?.isSufficient && !result?.excludedByDoNotSelect),
      "standardApplicability.evaluationResults",
      decisions,
    );
    ingest(
      (response?.inspectionIntelligence?.standardApplicability?.evaluationResults || []).filter((result: any) => result?.isSufficient && !result?.excludedByDoNotSelect),
      "inspectionIntelligence.standardApplicability.evaluationResults",
      decisions,
    );
    ingest(
      (response?.generatedActions || []).flatMap((action: any) => action?.referenceStandards || []),
      "generatedActions.referenceStandards",
      decisions,
    );
    ingest(
      (response?.baseGeneratedActions || []).flatMap((action: any) => action?.referenceStandards || []),
      "baseGeneratedActions.referenceStandards",
      decisions,
    );
    ingest(response?.needsMoreEvidenceStandards, "needsMoreEvidenceStandards", decisions);
    ingest(response?.standardApplicability?.needsMoreEvidenceStandards, "standardApplicability.needsMoreEvidenceStandards", decisions);
    ingest(response?.standardsTraceability?.needsMoreEvidenceCitations, "standardsTraceability.needsMoreEvidenceCitations", decisions);
    ingest(response?.applicabilityIntelligence?.needsMoreEvidenceStandards, "applicabilityIntelligence.needsMoreEvidenceStandards", decisions);

    const sorted = Array.from(decisions.values()).sort((left, right) => {
      const leftRank = authorityRank[left.authority as StandardDecisionAuthority] ?? -1;
      const rightRank = authorityRank[right.authority as StandardDecisionAuthority] ?? -1;
      if (leftRank !== rightRank) return rightRank - leftRank;
      return String(left.citation).localeCompare(String(right.citation));
    });

    const normalizedCitation = (citation: string) => clean(citation).toLowerCase().replace(/\s+/g, "");
    const isPrefixOfMoreSpecificCitation = (citation: string) => {
      const base = normalizedCitation(citation);
      if (!base) return false;
      return sorted.some((other: any) => {
        const otherCitation = normalizedCitation(other?.citation || "");
        return otherCitation !== base && otherCitation.startsWith(base) && otherCitation.length > base.length;
      });
    };
    const shouldDemoteBroadReference = (decision: any) => {
      const citation = String(decision?.citation || "");
      const title = String(decision?.title || "");
      return (
        /^29 CFR 1910\.301$/i.test(citation) ||
        /^29 CFR 1910\.331$/i.test(citation) ||
        /^29 CFR 1910\.305\(g\)$/i.test(citation) ||
        /^29 CFR 1910\.1200\(f\)$/i.test(citation) ||
        /\b(introduction|scope|candidate requirements related|candidate requirement identified by the existing deterministic citation resolver|specific purpose equipment|general requirements)\b/i.test(title) ||
        isPrefixOfMoreSpecificCitation(citation)
      );
    };

    const ordered = sorted.map((decision: any) => {
      if (decision?.authority === "primary" && shouldDemoteBroadReference(decision)) {
        return {
          ...decision,
          authority: "supporting",
          isDirectMatch: false,
        };
      }
      return decision;
    }).sort((left, right) => {
      const leftRank = authorityRank[left.authority as StandardDecisionAuthority] ?? -1;
      const rightRank = authorityRank[right.authority as StandardDecisionAuthority] ?? -1;
      if (leftRank !== rightRank) return rightRank - leftRank;
      return String(left.citation).localeCompare(String(right.citation));
    });

    if (process.env.HAZLENZ_DEBUG_STANDARD_DECISIONS === "true") {
      console.log("[HazLenz standard decisions]", {
        hazardCategory: response?.hazardCategory,
        candidateStandardFamily: response?.candidateStandardFamily,
        standardDecisions: ordered,
      });
    }

    return ordered;
  }

  private buildMechanismChain(input: { response: any; normalizedScopes: string[] }) {
    const response = input?.response || {};
    const inspectionIntelligence = response?.inspectionIntelligence || {};
    const mechanismChainSource = inspectionIntelligence?.mechanismChain || {};
    const mechanismOfInjury = inspectionIntelligence?.mechanismOfInjury || {};
    const vagueInputAnalysis = inspectionIntelligence?.vagueInputAnalysis || {};
    const correctiveActions = response?.correctiveActions || {};

    const clean = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();
    const uniqueText = (...sources: any[]): string[] => {
      const seen = new Set<string>();
      const values: string[] = [];
      for (const source of sources) {
        const items = Array.isArray(source) ? source : source !== undefined && source !== null ? [source] : [];
        for (const item of items) {
          const text = clean(
            typeof item === "string"
              ? item
              : item?.observedCondition ||
                item?.failureMode ||
                item?.releaseOrFailureMode ||
                item?.exposurePathway ||
                item?.potentialConsequence ||
                item?.consequences ||
                item?.controlFocus ||
                item?.controls ||
                item?.evidenceGap ||
                item?.evidenceGaps ||
                item?.text ||
                item?.question ||
                item?.prompt ||
                item?.title ||
                item?.summary ||
                item?.reason ||
                item,
          );
          if (!text) continue;
          const key = text.toLowerCase();
          if (seen.has(key)) continue;
          seen.add(key);
          values.push(text);
        }
      }
      return values;
    };
    const summarize = (values: string[], fallback: string) => uniqueText(values)[0] || fallback;
    const evidenceGaps = uniqueText(
      mechanismChainSource?.evidenceGaps,
      mechanismOfInjury?.evidenceGaps,
      response?.evidenceGapQuestions,
      inspectionIntelligence?.standardApplicability?.followUpQuestions,
    ).slice(0, 8);
    const controlFocus = uniqueText(
      mechanismChainSource?.controls,
      mechanismOfInjury?.controlThemes,
      correctiveActions?.immediate,
      correctiveActions?.interim,
      correctiveActions?.permanentEngineering,
      correctiveActions?.administrativeProgramTraining,
    ).slice(0, 8);
    const confidence = Number(response?.confidence);
    const normalizedConfidence = Number.isFinite(confidence) ? Math.max(0, Math.min(1, confidence)) : undefined;
    const observationText = String(
      response?.observationContext?.rawObservation ||
      response?.observationContext?.normalizedText ||
      response?.rawObservation ||
      response?.inputText ||
      response?.text ||
      "",
    ).toLowerCase();
    const mechanismSignalText = uniqueText(
      observationText,
      mechanismChainSource?.initiatingCondition,
      mechanismChainSource?.releaseOrFailureMode,
      mechanismChainSource?.exposurePathway,
      mechanismChainSource?.consequences,
      mechanismOfInjury?.initiatingCondition,
      mechanismOfInjury?.failureMode,
      mechanismOfInjury?.exposurePathway,
      mechanismOfInjury?.potentialConsequences,
    ).join(' ').toLowerCase();
    const hasMobileEquipmentObject = /\b(forklift|loader|haul truck|vehicle|vehicles|mobile equipment|powered haulage|backhoe|excavator|dozer|skid steer|powered industrial truck)\b/i.test(mechanismSignalText);
    const hasTrafficExposure = /\b(blind spot|blind spots|blind corner|backing|backup alarm|backup alarms|berm|berms|haul road|haul roads|spotter|spotters|flagger|flaggers|traffic control|traffic controls|vehicle lane|vehicle lanes)\b/i.test(mechanismSignalText) ||
      (/\b(pedestrian|pedestrians|worker on foot|travel path|travel paths)\b/i.test(mechanismSignalText) && /\b(forklift|loader|haul truck|vehicle|vehicles|mobile equipment|powered haulage|backhoe|excavator|dozer|skid steer|traffic|roadway|haul road|backing)\b/i.test(mechanismSignalText));
    const hasTrafficOrMobileEquipmentContext =
      hasMobileEquipmentObject ||
      (hasTrafficExposure && !/\b(oxygen cylinder|gas cylinder|compressed gas|cylinder|cylinders)\b/i.test(observationText));
    const hasElectricalContext = /\b(electrical|electric|energized|live parts?|panel|breaker|disconnect|cord|cable|wire|wiring|conductor|gfci|shock|arc flash|arc[- ]flash|voltage)\b/i.test(mechanismSignalText);
    const hasServicingEnergyContext = /\b(lockout|locked out|tagout|loto|servicing|maintenance|repair|unjamming|cleaning|startup|restart|stored energy|stored pressure|hydraulic|pneumatic|power is removed|power removed|zero energy|de-energized|energy isolation)\b/i.test(mechanismSignalText);
    const hasMachineGuardingContext = /\b(machine|guard|guarded|guarding|unguarded|conveyor|belt|tail pulley|head pulley|pulley|shaft|nip point|pinch point|rotating|point of operation|moving part|grinder|abrasive wheel)\b/i.test(mechanismSignalText);
    const hasWalkingSurfaceContext = /\b(walkway|walking|working surface|floor|aisle|route|path|spill|slick|slip|trip|housekeeping|clutter|debris|stairs?|stairway|ladder|hole|opening)\b/i.test(mechanismSignalText);
    const hasFallOrHeightContext = /\b(fall|edge|platform|scaffold|berm|dump point|roadway|haul road|hole|opening|ladder|roof|mezzanine|elevated work|handrail|stair landing|lower level)\b/i.test(mechanismSignalText);
    const hasConfinedSpaceContext = /\b(confined space|permit space|manhole|vault|tank|vessel|tunnel|atmosphere|ventilation|fumes?|toxic|entrant|entry)\b/i.test(mechanismSignalText);
    const hasCylinderContext = /\b(oxygen cylinder|gas cylinder|compressed gas|cylinder|cylinders|acetylene|propane|argon)\b/i.test(mechanismSignalText);
    const hasChemicalContext = /\b(chemical|solvent|acid|corrosive|sds|label|unlabeled|drum|container|eyewash|splash|asbestos|lead|dust|insulation|used oil|waste oil|oil container|containment)\b/i.test(mechanismSignalText) ||
      (/\b(spill|leak|release)\b/i.test(mechanismSignalText) && /\b(drum|container|chemical|solvent|acid|corrosive|hazardous|waste|used oil|waste oil|oil)\b/i.test(mechanismSignalText));
    const hasHazComIdentityContext = /\b(unlabeled|label|sds|safety data sheet|drum|container|contents?|identity|unknown chemical|mystery)\b/i.test(observationText);
    const hasGasReleaseContext = /\b(natural gas|gas odor|odor of gas|gas leak|suspected gas)\b/i.test(observationText);
    const hasEmergencyResponseContext = hasGasReleaseContext || /\b(eyewash|safety shower|extinguisher|exit|egress|emergency|blocked|fire|hot work|combustible|flammable|ignition)\b/i.test(observationText);
    const hasHeatStressContext = /\b(heat|humidity|shade|rest|hydration|acclimatization|heat stress|work-rest|recovery)\b/i.test(observationText);
    const isRelevantMechanismSupport = (value: string) => {
      const text = String(value || "");
      if (!text) return false;
      if (/\b(lockout|tagout|loto|zero-energy|zero energy|energy isolat|unexpected energization|startup|restart|power switch|disconnect switches|mechanical work|servicing|maintenance|unjamming)\b/i.test(text) && !hasServicingEnergyContext) {
        return false;
      }
      if (/\b(electrical|energized|qualified electrical|shock|arc flash|arc-flash|breaker|panel|cord|cable|conductor|circuit|voltage)\b/i.test(text) && !hasElectricalContext) {
        return false;
      }
      if (/\b(mobile equipment|vehicle|vehicles|traffic|travel path|blind spot|backup alarm|spotter|haul road|berm|pedestrian separation|operator communication)\b/i.test(text) && !hasTrafficOrMobileEquipmentContext) {
        return false;
      }
      if (/\b(slip_trip_fall_same_level|walking[- ]surface|walking\/working surface|housekeeping|slick floor|spill cleanup|poor housekeeping|blocked access|debris|same-level fall)\b/i.test(text) && !hasWalkingSurfaceContext) {
        return false;
      }
      if (/\b(machine|guarding|guard|unguarded|moving parts?|tail pulley|nip point|rotating|conveyor|grinder|abrasive wheel|point of operation)\b/i.test(text) && !hasMachineGuardingContext) {
        return false;
      }
      if (/\b(fall protection|fall height|edge|opening|platform|scaffold|ladder|guardrail|handrail|tie-off|lower level)\b/i.test(text) && !hasFallOrHeightContext) {
        return false;
      }
      if (/\b(confined space|permit|atmosphere|atmospheric|ventilation|entrant|attendant|rescue|oxygen deficient|oxygen deficiency|toxic|fume)\b/i.test(text) && !hasConfinedSpaceContext && !hasGasReleaseContext) {
        return false;
      }
      if (/\b(cylinder|compressed gas|valve cap|fuel gas|oxygen cylinder)\b/i.test(text) && !hasCylinderContext) {
        return false;
      }
      if (/\b(chemical|container|label|sds|hazcom|secondary containment|corrosive|eyewash|splash|asbestos|lead|dust|insulation|drum|hazardous waste)\b/i.test(text) && !hasChemicalContext) {
        return false;
      }
      if (/\b(unknown or unlabeled|unlabeled|mystery|workplace label|ghs label|pictogram|safety data sheet|sds|container identity|container contents)\b/i.test(text) && !hasHazComIdentityContext) {
        return false;
      }
      if (/\b(extinguisher|exit route|egress|flammable|combustible|hot work|fire watch|ignition|fire-prevention|fire prevention)\b/i.test(text) && !hasEmergencyResponseContext) {
        return false;
      }
      if (/\b(heat[_ -]?stress|heat illness|hydration|work-rest|rest break|rest\/water\/shade|shade|acclimatization|recovery area|cool drinking water)\b/i.test(text) && !hasHeatStressContext) {
        return false;
      }
      return true;
    };
    const relevantText = (values: string[]) => uniqueText(values).filter(isRelevantMechanismSupport).slice(0, 8);

    const observedCondition = summarize(
      uniqueText(
        mechanismChainSource?.initiatingCondition,
        mechanismOfInjury?.initiatingCondition,
        vagueInputAnalysis?.observedFacts,
      ),
      response?.classification
        ? `${clean(response.classification)} condition needs review.`
        : "Observed condition needs more detail.",
    );
    const failureMode = summarize(
      uniqueText(
        mechanismChainSource?.releaseOrFailureMode,
        mechanismOfInjury?.failureMode,
      ),
      response?.isVague
        ? "Release or failure mode is not yet specific enough to confirm."
        : "Failure mode is not fully established.",
    );
    const exposurePathway = summarize(
      uniqueText(
        mechanismChainSource?.exposurePathway,
        mechanismOfInjury?.exposurePathway,
      ),
      response?.isVague
        ? "Worker exposure pathway is not yet specific enough to confirm."
        : "Exposure pathway is not fully established.",
    );
    const potentialConsequence = summarize(
      uniqueText(
        mechanismChainSource?.consequences,
        mechanismOfInjury?.potentialConsequences,
      ),
      response?.isVague
        ? "Possible injury, illness, or environmental consequence depends on confirmed details."
        : "Potential consequence is not fully established.",
    );

    const familyHint = String(
      response?.classification ||
      response?.hazardCategory ||
      response?.candidateStandardFamily ||
      response?.hazardCategory ||
      inspectionIntelligence?.standardApplicability?.matchedRules?.[0]?.hazardFamily ||
      "",
    ).toLowerCase();
    const hasGenericMechanismText = (value: string) =>
      /needs review|not fully established|not yet specific|needs more detail|depends on confirmed details|not established|cannot yet be confirmed/i.test(value);
    const electricalMechanismTemplate = {
      observedCondition: "Damaged electrical cord or cord insulation in a wet or conductive area.",
      failureMode: "Damaged insulation can expose a conductor or create current leakage.",
      exposurePathway: "A worker may contact exposed energized parts directly, or a wet surface can let current pass through the body.",
      potentialConsequence: "Electric shock, burn, or electrocution.",
      evidenceGaps: [
        "Confirm the exact cord damage, whether an exposed conductor is present, whether the equipment is energized, and whether the floor is wet or conductive.",
        "Verify whether the cord is in active use or has been removed from service.",
        "Confirm whether a qualified person has inspected the cord and plug assembly.",
      ],
      controlFocus: [
        "Remove the damaged cord from service.",
        "Repair or replace the cord before reuse.",
        "Keep the area dry and de-energize equipment before inspection or repair.",
        "Use qualified electrical repair and pre-use inspection.",
      ],
    };
    const hazcomMechanismTemplate = {
      observedCondition: "An unlabeled or open chemical container has no verified identity or closure control.",
      failureMode: "Identity gaps or missing labels can lead to misidentification, incompatible mixing, or uncontrolled release.",
      exposurePathway: "Workers may handle or inhale an unknown substance, or the container may release material toward a drain or work area.",
      potentialConsequence: "Chemical burn, poisoning, fire, inhalation exposure, or environmental contamination.",
      evidenceGaps: [
        "What is the container contents, label status, and corresponding SDS information?",
        "Is this a primary container, secondary container, or immediate-use container?",
        "Can a spill or release reach a drain, aisle, or other worker exposure path?",
      ],
      controlFocus: [
        "Identify the contents and apply a compliant workplace label.",
        "Close the container or provide compatible secondary containment.",
        "Keep workers away from the unknown container until the identity is confirmed.",
      ],
    };
    const machineGuardingMechanismTemplate = {
      observedCondition: "An abrasive wheel, conveyor, shaft, pulley, or point of operation is missing a guard or exposing the work zone.",
      failureMode: "The moving part can catch hands, clothing, tools, or fragments and draw a person into the hazard zone.",
      exposurePathway: "Cleanup, adjustment, or routine work places the operator or nearby workers within reach of the rotating or cutting hazard.",
      potentialConsequence: "Entanglement, caught-in injury, eye injury, laceration, amputation, or fatal trauma.",
      evidenceGaps: [
        "What machine, wheel, pulley, shaft, or point of operation is exposed?",
        "Is the equipment operating, capable of startup, or under lockout/tagout during the work?",
        "Can a worker reach the hazard zone during cleanup, setup, or maintenance?",
      ],
      controlFocus: [
        "Stop use and keep workers out of the hazard zone until the guard is restored.",
        "Install the correct machine guard or abrasive-wheel guard before operation continues.",
        "Verify zero-energy or safe-access controls when cleanup or maintenance is required.",
      ],
    };
    const mobileEquipmentMechanismTemplate = {
      observedCondition: "Mobile equipment and pedestrians share the same route or operating area without confirmed separation.",
      failureMode: "Poor visibility, backing, turning, or movement can place the equipment into a pedestrian travel path.",
      exposurePathway: "Workers on foot can be struck, pinned, or run over when the travel path or blind area is uncontrolled.",
      potentialConsequence: "Struck-by, pinned-between, crush, or fatal injury.",
      evidenceGaps: [
        "What equipment is moving and what route or blind area is involved?",
        "What separation, warning, spotter, or right-of-way controls are active?",
        "Is this an MSHA mine context or a non-mine industrial traffic area?",
      ],
      controlFocus: [
        "Separate pedestrians from the travel path before movement continues.",
        "Use spotters, alarms, barricades, or route redesign where separation is not already verified.",
        "Verify traffic rules, visibility, and operator communication before return to service.",
      ],
    };
    const fallMechanismTemplate = {
      observedCondition: "A worker is exposed to an elevated edge, platform, ladder, or lift without verified fall protection.",
      failureMode: "Loss of balance, incomplete edge protection, or incorrect tie-off can allow a fall to a lower level.",
      exposurePathway: "The worker can fall over an open side, through an opening, or out of a lift platform while working or moving.",
      potentialConsequence: "Serious fracture, head/spinal trauma, suspension trauma, or fatal injury.",
      evidenceGaps: [
        "What is the fall height and what edge, opening, or platform is exposed?",
        "Are guardrails, covers, restraint, or arrest systems present and correctly used?",
        "What jurisdiction and access method apply to the work being performed?",
      ],
      controlFocus: [
        "Restrict access to the edge or opening until fall protection is verified.",
        "Install guardrails, covers, or a verified fall-protection system suitable to the exposure.",
        "Confirm anchorage, tie-off, ladder setup, and competent-person verification before work continues.",
      ],
    };
    const confinedSpaceMechanismTemplate = {
      observedCondition: "A space such as a manhole, tank, vault, or pit has incomplete atmospheric or entry verification.",
      failureMode: "A hazardous atmosphere, engulfment, or configuration hazard can exist without adequate classification and controls.",
      exposurePathway: "An entrant or would-be rescuer can be exposed during entry, line-breaking, ventilation, or rescue attempt.",
      potentialConsequence: "Asphyxiation, poisoning, engulfment, entrapment, explosion, or fatal rescue escalation.",
      evidenceGaps: [
        "Is the space a confined space or permit-required confined space?",
        "What atmospheric testing, ventilation, isolation, attendant, and rescue controls are verified?",
        "Is this an entry task, a line-breaking task, or only adjacency to a space?",
      ],
      controlFocus: [
        "Do not enter until a qualified person classifies the space and verifies controls.",
        "Test atmosphere, isolate energy/process lines, and provide attendant/rescue provisions before entry.",
        "Treat line-breaking and other adjacent work as a confined-space exposure review when gases or oxygen deficits are possible.",
      ],
    };
    const fireMechanismTemplate = {
      observedCondition: "Fire response equipment, flammable storage, hot work, or ignition exposure is not adequately controlled.",
      failureMode: "A blocked extinguisher, improper flammable storage, or nearby ignition source can allow a fire to start or spread.",
      exposurePathway: "Workers may be unable to reach response equipment quickly, or fire/heat/smoke may reach the work area.",
      potentialConsequence: "Burn injury, smoke inhalation, explosion, or delayed emergency response.",
      evidenceGaps: [
        "Is the extinguisher/eyewash/fire response equipment accessible and visible?",
        "What flammable liquid or combustible material is stored and how close is the ignition source?",
        "Is hot work, fire watch, or another fire-prevention control required here?",
      ],
      controlFocus: [
        "Restore access to the response equipment or remove the obstruction.",
        "Correct flammable storage or ignition separation before work continues.",
        "Verify the fire-prevention plan, inspection, and response controls with a qualified reviewer.",
      ],
    };
    const industrialHygieneMechanismTemplate = {
      observedCondition: "A dust, noise, fume, or vapor exposure is present without enough measurement or control detail.",
      failureMode: "Airborne contaminant or excess sound can reach workers when source controls and monitoring are incomplete.",
      exposurePathway: "Workers inhale, absorb, or are subjected to repeated dose exposure during the task or work shift.",
      potentialConsequence: "Respiratory illness, hearing loss, irritation, heat illness, or longer-term occupational disease.",
      evidenceGaps: [
        "What material, exposure level, duration, and process are involved?",
        "What monitoring, ventilation, sampling, or respirator-program evidence is available?",
        "Which workers are exposed and what controls are operating at the source?",
      ],
      controlFocus: [
        "Measure exposure and keep workers out of the plume or high-noise area until controls are verified.",
        "Use source control, ventilation, wet methods, enclosure, or validated hearing and respiratory protections.",
        "Document objective data, exposure assessment, and program elements before final reliance.",
      ],
    };
    const textSpecificMechanismTemplate = (() => {
      if (/\b(oxygen|acetylene|propane|argon|compressed gas|gas)\s+cylinders?\b|\bcylinders?\b/i.test(mechanismSignalText) && /\b(unsecured|not secured|standing|stored|near|aisle|travel path|mobile equipment|forklift|vehicle|traffic)\b/i.test(mechanismSignalText)) {
        return {
          observedCondition: "An oxygen or compressed-gas cylinder is unsecured near an aisle or equipment travel path.",
          failureMode: "The cylinder can be struck, tipped, or damaged, allowing valve impact or uncontrolled gas release.",
          exposurePathway: "Workers, pedestrians, or mobile-equipment operators in the travel path can be struck by the cylinder or exposed to released gas.",
          potentialConsequence: "Struck-by impact, valve projectile, fire or oxidizer involvement, or serious injury from uncontrolled cylinder movement.",
          evidenceGaps: [
            "Confirm whether the cylinder is capped, connected for use, or in storage.",
            "Verify restraint method, upright position, location, and protection from vehicle or aisle impact.",
            "Confirm gas type, valve protection, segregation, and whether the travel path exposes workers or equipment.",
          ],
          controlFocus: [
            "Secure the cylinder upright with an effective restraint.",
            "Relocate it out of the aisle or protect it from mobile-equipment impact.",
            "Install valve protection and storage segregation appropriate to the gas before normal traffic resumes.",
          ],
        };
      }

      if (/\b(open|uncovered|not closed)\b.*\b(used oil|waste oil|oil)\b.*\b(container|drum|pail)\b|\b(used oil|waste oil|oil)\b.*\b(container|drum|pail)\b.*\b(open|uncovered|not closed)\b/i.test(mechanismSignalText)) {
        return {
          observedCondition: "An open used-oil container is on the shop floor near a pedestrian walking surface.",
          failureMode: "Oil can spill, leak, or release from the open container if it is bumped, tipped, or overfilled.",
          exposurePathway: "Pedestrians can contact contaminated floor surfaces, and released oil can migrate toward drains or work areas.",
          potentialConsequence: "Slip and fall injury, skin contact, fire or environmental contamination depending on the oil and pathway.",
          evidenceGaps: [
            "Confirm container label, contents, lid or closure condition, and compatible containment.",
            "Verify whether oil can reach a floor drain, walkway, traffic path, or other release pathway.",
            "Confirm spill quantity, cleanup status, secondary containment, and waste-management controls.",
          ],
          controlFocus: [
            "Close or cover the used-oil container and keep it upright.",
            "Contain and clean any released oil from the floor or walkway.",
            "Label the container and provide compatible secondary containment or a managed accumulation area.",
          ],
        };
      }

      if (/\b(open breaker slot|missing cover plate|missing panel cover|unused opening|open electrical panel|breaker slot|open slot|missing cover)\b/i.test(mechanismSignalText)) {
        return {
          observedCondition: "An electrical enclosure has an open slot or missing cover plate.",
          failureMode: "A hand, tool, or conductive object can enter the opening and contact energized parts or initiate an arc.",
          exposurePathway: "Employees who approach, inspect, service, or work near the panel can be exposed to energized electrical components.",
          potentialConsequence: "Electric shock, arc burn, electrical burn, or secondary injury from startle or blast exposure.",
          evidenceGaps: [
            "Confirm panel identification, voltage, energized status, and whether the opening exposes live parts.",
            "Verify required access clearance, approach restrictions, and whether servicing or troubleshooting is occurring.",
            "Confirm whether a qualified electrical person has de-energized, guarded, or covered the opening.",
          ],
          controlFocus: [
            "Restrict access to the panel area until the opening is guarded or covered.",
            "De-energize where feasible before inspection or repair.",
            "Have a qualified electrical person install the correct cover, filler, or guarding before normal access resumes.",
          ],
        };
      }

      if (/\b(hydraulic|pneumatic|stored pressure|stored energy)\b/i.test(observationText) && /\b(ram|cylinder|pressure|drop|release|power is removed|power removed|relieved)\b/i.test(observationText)) {
        return {
          observedCondition: "Stored hydraulic or pneumatic pressure remains capable of moving equipment after power is removed.",
          failureMode: "Residual pressure can release or allow a ram, cylinder, or suspended component to drop unexpectedly.",
          exposurePathway: "A worker near or servicing the equipment can be struck, crushed, pinned, or injected by released pressure or motion.",
          potentialConsequence: "Crushing, struck-by injury, amputation, injection injury, or fatal injury from uncontrolled stored-energy release.",
          evidenceGaps: [
            "Confirm the hydraulic or pneumatic energy source, load position, pressure status, and whether stored pressure was relieved.",
            "Verify blocking, bleeding, dissipation, lockout/tagout, and zero-energy try-test before exposure.",
            "Confirm whether workers are servicing, inspecting, or positioned within the drop or release zone.",
          ],
          controlFocus: [
            "Keep workers out of the drop or release zone until stored pressure is relieved and verified.",
            "Block or support the ram/load and bleed or dissipate stored energy before work continues.",
            "Apply and verify machine-specific lockout/tagout and zero-energy checks.",
          ],
        };
      }

      if (/\b(unprotected trench|trench|excavation)\b/i.test(observationText) && /\b(open|unprotected|workers nearby|nearby workers|roadway repair|unsupported)\b/i.test(observationText)) {
        return {
          observedCondition: "An open trench or excavation lacks verified protective-system or access controls while workers are nearby.",
          failureMode: "Unsupported trench walls can cave in or material/equipment can enter the excavation exposure zone.",
          exposurePathway: "Workers in or near the trench can be engulfed, struck, trapped, or crushed if the excavation fails.",
          potentialConsequence: "Fatal crushing, asphyxiation, engulfment, struck-by injury, or traumatic injury from trench collapse.",
          evidenceGaps: [
            "Confirm trench depth, soil classification, protective system, and competent-person inspection status.",
            "Verify whether workers are inside the trench or within the collapse/edge exposure zone.",
            "Confirm access control, egress, spoil/equipment setback, and roadway traffic controls.",
          ],
          controlFocus: [
            "Keep workers out of the trench and edge exposure zone until a competent person verifies protection.",
            "Install or verify sloping, benching, shielding, or shoring appropriate to the soil and depth.",
            "Document inspection, egress, spoil setback, and access controls before work resumes.",
          ],
        };
      }

      if (/\b(electrical|hydraulic|pneumatic)\b/i.test(observationText) && /\b(main disconnect|only .*disconnect|only one source|multiple energy|energy sources?)\b/i.test(observationText)) {
        return {
          observedCondition: "Servicing is planned with multiple hazardous energy sources but only one isolation point is addressed.",
          failureMode: "Uncontrolled electrical, hydraulic, pneumatic, gravity, or stored energy can remain after the main disconnect is opened.",
          exposurePathway: "A worker servicing the equipment can be contacted by unexpected startup, stored pressure release, motion, or electrical energy.",
          potentialConsequence: "Crushing, amputation, injection injury, shock, burn, or fatal injury from uncontrolled hazardous energy release.",
          evidenceGaps: [
            "Confirm each electrical, hydraulic, pneumatic, gravity, thermal, and stored-energy source.",
            "Verify isolation, blocking, bleeding, dissipation, locks/tags, and zero-energy try-test for each energy source.",
            "Confirm who controls contractor and host-employer energy-control responsibilities before servicing begins.",
          ],
          controlFocus: [
            "Stop servicing until every hazardous energy source is isolated and verified.",
            "Apply machine-specific lockout/tagout with blocking, bleeding, and stored-energy dissipation.",
            "Document authorized-person and contractor coordination before work continues.",
          ],
        };
      }

      if (/\b(contractor)\b/i.test(observationText) && /\b(servicing|repair|maintenance)\b/i.test(observationText) && /\b(quick restart|available for .*restart|restart during)\b/i.test(observationText)) {
        return {
          observedCondition: "Contractor servicing is occurring while the host operation expects equipment to remain available for restart.",
          failureMode: "Production or coordination pressure can bypass host/contractor energy-control responsibilities and permit unexpected startup.",
          exposurePathway: "The contractor or nearby plant personnel can be exposed to energized equipment, stored energy, or motion during repair.",
          potentialConsequence: "Crushing, amputation, entanglement, shock, burn, or fatal injury during servicing.",
          evidenceGaps: [
            "Confirm host-employer and contractor lockout/tagout responsibilities and communication.",
            "Verify the equipment is isolated, locked/tagged, blocked, dissipated, and try-tested before repair.",
            "Confirm restart authority, affected-employee notification, and shift/contractor handoff controls.",
          ],
          controlFocus: [
            "Stop repair until host and contractor energy-control roles are assigned and documented.",
            "Keep equipment unavailable for restart until authorized employees verify zero energy.",
            "Review contractor coordination and restart authorization before returning the line to service.",
          ],
        };
      }

      if (/\b(stair landing|stairway|stairs?)\b/i.test(observationText) && /\b(handrail|open edge|lower level)\b/i.test(observationText)) {
        return {
          observedCondition: "A stair landing or stairway edge is missing a handrail or equivalent edge control.",
          failureMode: "A person using the stairs or landing can trip, stumble, or lose balance without a graspable rail or protected open side.",
          exposurePathway: "Employees moving through the stair landing walking surface can fall over the open edge or down to the lower level.",
          potentialConsequence: "Fall to lower level causing fracture, head injury, spinal trauma, or fatal injury.",
          evidenceGaps: [
            "Confirm the stair/landing location, open-side geometry, and approximate fall height.",
            "Confirm whether employees use the stairway or landing and whether temporary access controls are in place.",
            "Verify handrail, stair-rail, guardrail, or other edge-protection status before relying on closure.",
            "Confirm the affected walkway or alternate route status while the handrail is missing.",
          ],
          controlFocus: [
            "Restrict access or provide temporary protected access until the handrail or guardrail is restored.",
            "Install a compliant handrail/stair rail or equivalent edge protection for the landing.",
            "Verify stairway condition and employee access controls before returning the route to service.",
          ],
        };
      }

      if (/\b(trench|excavation)\b/i.test(observationText) && /\b(water|accumulated|soft|unstable|bottom)\b/i.test(observationText)) {
        return {
          observedCondition: "Water accumulation and soft or unstable trench bottom conditions are present.",
          failureMode: "Water can undermine soil strength, reduce trench stability, and defeat protective-system assumptions.",
          exposurePathway: "Workers in or near the trench can be caught in a cave-in, engulfed, trapped, or exposed to drowning conditions.",
          potentialConsequence: "Fatal crushing, asphyxiation, drowning, or engulfment from trench instability.",
          evidenceGaps: [
            "Confirm trench depth, soil classification, water source, and whether water removal is active.",
            "Confirm whether a competent person inspected the trench after water accumulation was observed.",
            "Verify protective system, egress, spoil placement, and whether workers are excluded until stable.",
          ],
          controlFocus: [
            "Keep workers out until the competent person evaluates water and soil stability.",
            "Remove or control water and verify the protective system is adequate for the changed conditions.",
            "Document inspection, egress, and protective-system verification before re-entry.",
          ],
        };
      }

      if (/\b(overhead utility|overhead power|power line|utility line)\b/i.test(observationText) && /\b(boom|equipment|excavation|contact)\b/i.test(observationText)) {
        return {
          observedCondition: "Equipment with a boom or raised component may operate beneath overhead utility lines along the excavation utility route.",
          failureMode: "The boom, load, or equipment can create a utility strike by encroaching on or contacting energized overhead lines if clearance is not controlled.",
          exposurePathway: "Operators, ground workers, signal persons, or nearby employees can receive electrical current or arc exposure through the equipment or ground path.",
          potentialConsequence: "Electrocution, shock, arc-flash burn, or fatal injury from overhead power-line contact.",
          evidenceGaps: [
            "Locate utilities and confirm utility type, voltage if known, clearance distance, route, and equipment maximum reach.",
            "Verify whether lines are de-energized/grounded, guarded, relocated, or controlled by approach-distance procedures.",
            "Confirm spotter, barricade, warning-line, and operator communication controls before work proceeds.",
          ],
          controlFocus: [
            "Stop equipment movement under the lines until clearance and utility status are verified.",
            "Use power-line safety controls such as de-energization, guarding, dedicated spotter, and approach-distance limits.",
            "Locate utilities and document qualified review of the excavation route and boom reach before work continues.",
          ],
        };
      }

      if (/\b(hot work)\b/i.test(observationText) && /\b(combustible|flammable|fire watch|ignition|separation)\b/i.test(observationText)) {
        return {
          observedCondition: "Hot work is occurring near combustible material without verified separation, shielding, or fire-watch controls.",
          failureMode: "Sparks, slag, radiant heat, or conducted heat can ignite nearby or concealed combustible material.",
          exposurePathway: "Workers in or near the hot-work area can be exposed to fire, smoke, heat, or emergency evacuation hazards.",
          potentialConsequence: "Burn injury, smoke inhalation, fire spread, explosion, or fatal injury.",
          evidenceGaps: [
            "Confirm hot-work permit or authorization status, material type, and distance to combustibles.",
            "Verify combustible removal, shielding, fire watch, extinguisher access, and post-work monitoring.",
            "Confirm whether sparks, slag, or heat can reach concealed or adjacent spaces.",
          ],
          controlFocus: [
            "Pause hot work until combustible material is removed, shielded, or separated.",
            "Verify hot-work authorization, fire watch, extinguisher readiness, and post-work monitoring.",
            "Control ignition paths to adjacent or concealed combustible areas before work resumes.",
          ],
        };
      }

      if (/\b(flammable|combustible|ignition)\b/i.test(observationText) && /\b(storage|stored|container|liquid|source|shop|area)\b/i.test(observationText)) {
        return {
          observedCondition: "Flammable or combustible material is stored or located near an ignition source.",
          failureMode: "Vapor, liquid, or combustible material can ignite when separation, storage, or ventilation controls are inadequate.",
          exposurePathway: "Workers in the storage or work area can be exposed to fire, flash fire, smoke, or explosion effects.",
          potentialConsequence: "Burn injury, smoke inhalation, explosion injury, property damage, or fatal injury.",
          evidenceGaps: [
            "Identify the material, container type, quantity, and ignition source.",
            "Confirm storage cabinet, approved container, separation distance, bonding/grounding, and ventilation controls.",
            "Verify whether hot work, open flame, electrical ignition, or other ignition source is active nearby.",
          ],
          controlFocus: [
            "Separate flammable or combustible material from ignition sources.",
            "Move material to approved containers, cabinets, or storage areas as applicable.",
            "Verify ventilation and fire-prevention controls before normal work resumes.",
          ],
        };
      }

      if (/\b(natural gas|gas odor|odor of gas)\b/i.test(observationText)) {
        return {
          observedCondition: "A natural-gas odor is reported and the release source is not yet confirmed.",
          failureMode: "Uncontrolled gas can accumulate and ignite if the source, concentration, and ventilation are not verified.",
          exposurePathway: "Workers in or near the area can inhale gas or be exposed to fire/explosion if an ignition source is present.",
          potentialConsequence: "Fire, explosion, burn injury, asphyxiation, or fatal injury.",
          evidenceGaps: [
            "Confirm gas monitoring results, odor location, ventilation status, and suspected source.",
            "Identify ignition sources, affected area boundaries, and whether evacuation or isolation is required.",
            "Verify qualified gas, utility, or maintenance response before reoccupying or restarting equipment.",
          ],
          controlFocus: [
            "Restrict ignition sources and isolate the suspected area until the source is evaluated.",
            "Notify qualified gas, utility, or maintenance personnel and monitor the atmosphere.",
            "Verify ventilation, source control, and emergency response status before reoccupying the area.",
          ],
        };
      }

      if (/\b(manhole|confined space|permit space)\b/i.test(observationText) && /\b(atmosphere|oxygen|low|not tested|untested)\b/i.test(observationText)) {
        return {
          observedCondition: "A manhole or confined-space atmosphere is untested or indicates possible oxygen deficiency.",
          failureMode: "Oxygen deficiency or toxic/flammable atmosphere may be present before entry is controlled.",
          exposurePathway: "Entrants or would-be rescuers can inhale a hazardous atmosphere during entry or rescue.",
          potentialConsequence: "Asphyxiation, toxic exposure, loss of consciousness, explosion, or fatal rescue escalation.",
          evidenceGaps: [
            "Confirm calibrated atmospheric testing for oxygen, flammability, and toxic contaminants.",
            "Confirm permit status, ventilation, isolation, attendant, communication, and rescue provisions.",
            "Verify whether entry has been prevented until the atmosphere is acceptable and controls are documented.",
          ],
          controlFocus: [
            "Do not enter until atmospheric testing and permit-space controls are complete.",
            "Ventilate, isolate hazards, assign attendant/rescue provisions, and document acceptable atmosphere.",
            "Retest and monitor as conditions or work activities change.",
          ],
        };
      }

      if (/\b(permit-required space|permit required space|confined space|permit space)\b/i.test(observationText) && /\b(no attendant|attendant is not|attendant missing|without attendant|attendant posted)\b/i.test(observationText)) {
        return {
          observedCondition: "Workers are inside a permit-required confined space without a dedicated attendant posted at the entrance.",
          failureMode: "Loss of outside monitoring, communication, entry tracking, or emergency initiation can delay recognition and rescue.",
          exposurePathway: "Entrants can be exposed to atmospheric, engulfment, configuration, or process hazards without external observation and response.",
          potentialConsequence: "Asphyxiation, toxic exposure, engulfment, entrapment, delayed rescue, or fatality.",
          evidenceGaps: [
            "Confirm permit-required space classification, active entry status, entrant count, and attendant assignment.",
            "Verify atmospheric monitoring, communication, rescue plan, entry permit, isolation, and ventilation controls.",
            "Confirm whether entry was stopped until attendant and permit controls were restored.",
          ],
          controlFocus: [
            "Stop or suspend entry until an attendant is assigned and stationed as required.",
            "Verify permit, communication, monitoring, rescue, and isolation controls before entry resumes.",
            "Document attendant duties, entrant tracking, and emergency communication before closure.",
          ],
        };
      }

      if (/\b(tunnel|confined space|space)\b/i.test(observationText) && /\b(ventilation|fumes?|build up|inadequate)\b/i.test(observationText)) {
        return {
          observedCondition: "Ventilation is inadequate and fumes are accumulating in an enclosed or confined work area.",
          failureMode: "A hazardous atmosphere can build up when airflow does not dilute, exhaust, or replace contaminated atmosphere.",
          exposurePathway: "Workers can inhale toxic, irritant, oxygen-deficient, or flammable atmosphere during entry or work in the tunnel.",
          potentialConsequence: "Asphyxiation, toxic inhalation, respiratory injury, fire/explosion exposure, or fatality.",
          evidenceGaps: [
            "Confirm contaminant source, atmospheric testing results, airflow direction/rate, and ventilation equipment status.",
            "Confirm whether the tunnel is a permit-required confined space and what entry controls apply.",
            "Verify respiratory protection, evacuation, continuous monitoring, and rescue planning as applicable.",
          ],
          controlFocus: [
            "Pause work or restrict entry until ventilation and atmospheric conditions are verified.",
            "Restore mechanical ventilation or source exhaust appropriate to the contaminant and space.",
            "Document atmospheric monitoring and entry/control verification before normal work resumes.",
          ],
        };
      }

      if (/\b(solvent|parts cleaning|clean parts|cleaning parts)\b/i.test(observationText) && /\b(small room|room|enclosed|without ventilation|no ventilation|odor control|ventilation)\b/i.test(observationText)) {
        return {
          observedCondition: "Workers are using solvent in a small or enclosed room without verified ventilation or odor/vapor control.",
          failureMode: "Solvent vapor can accumulate when local exhaust, general ventilation, substitution, or container controls are inadequate.",
          exposurePathway: "Workers cleaning parts can inhale solvent vapors or experience eye/skin irritation during the task.",
          potentialConsequence: "Respiratory irritation, central nervous system effects, chemical exposure illness, fire risk, or acute overexposure.",
          evidenceGaps: [
            "Identify the solvent, SDS hazards, quantity used, room size, duration, and exposed workers.",
            "Verify ventilation rate/source capture, odor/vapor monitoring, container closure, and ignition controls.",
            "Confirm PPE, substitution options, exposure assessment, and whether work should pause until controls are verified.",
          ],
          controlFocus: [
            "Pause or relocate solvent use until ventilation and exposure controls are verified.",
            "Use local exhaust, closed containers, compatible substitution, or reduced quantities where feasible.",
            "Verify SDS, exposure assessment, PPE, fire controls, and worker instruction before continuing.",
          ],
        };
      }

      if (/\b(corrosive|chemical)\b/i.test(observationText) && /\b(pour|poured|pouring|transfer|container to another|splash)\b/i.test(observationText)) {
        return {
          observedCondition: "A corrosive chemical transfer creates an obvious splash potential.",
          failureMode: "Pouring or transferring corrosive material can release liquid outside the receiving container or onto the worker.",
          exposurePathway: "Hands, eyes, face, skin, or nearby workers can be contacted by corrosive splash during transfer.",
          potentialConsequence: "Chemical burn, severe eye injury, skin injury, inhalation irritation, or vision loss.",
          evidenceGaps: [
            "Identify the corrosive material, concentration, container sizes, and transfer method.",
            "Verify splash protection, face/eye protection, gloves, apron, secondary containment, and eyewash/shower access.",
            "Confirm whether the transfer should pause until splash controls and emergency flushing access are verified.",
          ],
          controlFocus: [
            "Pause transfer if splash controls or emergency flushing access are not verified.",
            "Use compatible transfer equipment, splash protection, secondary containment, and chemical-resistant PPE.",
            "Verify eyewash/safety shower access, SDS review, and employee instruction before continuing.",
          ],
        };
      }

      if (/\b(high heat|heat|humidity)\b/i.test(observationText) && /\b(shade|rest|hydration|work-rest|recovery)\b/i.test(observationText)) {
        return {
          observedCondition: "Workers are exposed to heat and humidity with inadequate shade, rest, hydration, or recovery opportunity.",
          failureMode: "Metabolic and environmental heat load can exceed the body's ability to cool when recovery controls are missing.",
          exposurePathway: "Crew members performing work in hot conditions can develop escalating heat strain during the shift.",
          potentialConsequence: "Heat exhaustion, heat stroke, collapse, organ injury, or fatal heat illness.",
          evidenceGaps: [
            "Confirm temperature, humidity, heat index/WBGT, workload, clothing/PPE, duration, and acclimatization status.",
            "Verify water, shade, rest breaks, supervision, symptom monitoring, and emergency response controls.",
            "Identify affected workers and whether any heat-illness symptoms have been reported.",
          ],
          controlFocus: [
            "Implement work-rest, hydration, shade/cooling, and monitoring controls for the exposed crew.",
            "Adjust workload or schedule and escalate medical response if symptoms are present.",
            "Document heat-stress assessment, acclimatization, and supervisor verification.",
          ],
        };
      }

      if (/\b(asbestos|lead)\b/i.test(observationText) && /\b(insulation|dust|demolition|renovation|prep|suspect|suspicion)\b/i.test(observationText)) {
        return {
          observedCondition: "Suspect asbestos- or lead-containing material and dust are present before demolition or disturbance.",
          failureMode: "Disturbance can release regulated fibers or lead-containing dust if material identity and controls are not verified.",
          exposurePathway: "Workers can inhale asbestos fibers or lead dust, ingest contaminated dust, or spread contamination outside the work area.",
          potentialConsequence: "Serious chronic respiratory disease, cancer risk, lead poisoning, neurological effects, or reproductive harm.",
          evidenceGaps: [
            "Confirm material survey, sampling/analysis, lead or asbestos determination, and competent/qualified person review.",
            "Verify demolition scope, disturbance method, exposure assessment, containment, wet methods, and hygiene controls.",
            "Confirm respiratory protection, training, regulated area, and waste/decontamination controls where required.",
          ],
          controlFocus: [
            "Do not disturb suspect material until identity and exposure controls are verified.",
            "Use qualified asbestos/lead procedures, containment, wet methods, and exposure assessment as applicable.",
            "Document sampling, competent-person review, worker protection, and clearance/cleanup evidence.",
          ],
        };
      }

      if (/\b(eyewash|safety shower)\b/i.test(observationText) && /\b(blocked|obstructed|not reach|quickly|splash)\b/i.test(observationText)) {
        return {
          observedCondition: "Emergency eyewash or safety shower access is blocked where splash exposure may require immediate flushing.",
          failureMode: "Delayed access prevents immediate dilution and removal of corrosive or injurious material from eyes or skin.",
          exposurePathway: "An operator splashed during chemical handling may be unable to reach and activate flushing equipment quickly.",
          potentialConsequence: "Severe eye injury, chemical burn, vision loss, or worsened exposure outcome from delayed emergency response.",
          evidenceGaps: [
            "Confirm the corrosive or injurious material, splash pathway, and distance/travel path to flushing equipment.",
            "Verify equipment accessibility, activation, flow, temperature, inspection status, and employee awareness.",
            "Confirm whether chemical handling should pause until immediate flushing access is restored.",
          ],
          controlFocus: [
            "Clear access immediately and pause corrosive handling if required flushing cannot be reached.",
            "Verify eyewash/safety shower function, location, activation, and inspection status.",
            "Prevent re-blocking through layout controls, inspections, and worker briefing.",
          ],
        };
      }

      if (/\b(conveyor|belt|tail pulley|head pulley)\b/i.test(observationText) && /\b(missing a guard|unguarded|guard missing|miners? clean|moving belt|moving)\b/i.test(observationText)) {
        return {
          observedCondition: "A conveyor pulley, belt, or moving machine part is unguarded while miners perform cleanup or work nearby on the plant walkway or access area.",
          failureMode: "The moving belt or pulley can catch clothing, tools, hands, or limbs and draw a miner into the nip point.",
          exposurePathway: "Miners cleaning spillage or working near the moving belt can contact the exposed in-running nip or rotating component.",
          potentialConsequence: "Entanglement, crushing, amputation, or fatal caught-in injury.",
          evidenceGaps: [
            "Identify the exposed conveyor component and whether the belt was running or capable of movement.",
            "Confirm miner access during cleanup, shoveling, inspection, or maintenance.",
            "Verify guard condition, lockout status for cleanup/maintenance, and mine scope before closure.",
            "Confirm walkway/access route exposure around the conveyor tail pulley.",
          ],
          controlFocus: [
            "Stop or restrict cleanup near the exposed moving part and lock out or otherwise isolate hazardous energy before access.",
            "Install guarding that prevents contact with the pulley, belt, and nip point.",
            "Document competent-person verification before miners resume access.",
          ],
        };
      }

      return null;
    })();

    const useElectricalTemplate =
      familyHint.includes("electrical") &&
      (
        hasGenericMechanismText(observedCondition) ||
        hasGenericMechanismText(failureMode) ||
        hasGenericMechanismText(exposurePathway) ||
        hasGenericMechanismText(potentialConsequence) ||
        !controlFocus.length
      );

    const finalMechanismChain = textSpecificMechanismTemplate
      ? {
          ...textSpecificMechanismTemplate,
          evidenceGaps: relevantText(uniqueText(textSpecificMechanismTemplate.evidenceGaps, evidenceGaps)),
          controlFocus: relevantText(uniqueText(textSpecificMechanismTemplate.controlFocus, controlFocus)),
          ...(normalizedConfidence !== undefined ? { confidence: normalizedConfidence } : {}),
        }
      : useElectricalTemplate
      ? {
          observedCondition: electricalMechanismTemplate.observedCondition,
          failureMode: electricalMechanismTemplate.failureMode,
          exposurePathway: electricalMechanismTemplate.exposurePathway,
          potentialConsequence: electricalMechanismTemplate.potentialConsequence,
          evidenceGaps: relevantText(uniqueText(electricalMechanismTemplate.evidenceGaps, evidenceGaps)),
          controlFocus: relevantText(uniqueText(electricalMechanismTemplate.controlFocus, controlFocus)),
          ...(normalizedConfidence !== undefined ? { confidence: normalizedConfidence } : {}),
        }
      : familyHint.includes("hazcom") || familyHint.includes("hazardous_materials") || familyHint.includes("chemical")
      ? {
          observedCondition: hazcomMechanismTemplate.observedCondition,
          failureMode: hazcomMechanismTemplate.failureMode,
          exposurePathway: hazcomMechanismTemplate.exposurePathway,
          potentialConsequence: hazcomMechanismTemplate.potentialConsequence,
          evidenceGaps: relevantText(uniqueText(hazcomMechanismTemplate.evidenceGaps, evidenceGaps)),
          controlFocus: relevantText(uniqueText(hazcomMechanismTemplate.controlFocus, controlFocus)),
          ...(normalizedConfidence !== undefined ? { confidence: normalizedConfidence } : {}),
        }
      : (familyHint.includes("machine_guarding") || familyHint.includes("machine_guarding_loto"))
      ? {
          observedCondition: machineGuardingMechanismTemplate.observedCondition,
          failureMode: machineGuardingMechanismTemplate.failureMode,
          exposurePathway: machineGuardingMechanismTemplate.exposurePathway,
          potentialConsequence: machineGuardingMechanismTemplate.potentialConsequence,
          evidenceGaps: relevantText(uniqueText(machineGuardingMechanismTemplate.evidenceGaps, evidenceGaps)),
          controlFocus: relevantText(uniqueText(machineGuardingMechanismTemplate.controlFocus, controlFocus)),
          ...(normalizedConfidence !== undefined ? { confidence: normalizedConfidence } : {}),
        }
      : familyHint.includes("mobile_equipment")
      ? {
          observedCondition: mobileEquipmentMechanismTemplate.observedCondition,
          failureMode: mobileEquipmentMechanismTemplate.failureMode,
          exposurePathway: mobileEquipmentMechanismTemplate.exposurePathway,
          potentialConsequence: mobileEquipmentMechanismTemplate.potentialConsequence,
          evidenceGaps: relevantText(uniqueText(mobileEquipmentMechanismTemplate.evidenceGaps, evidenceGaps)),
          controlFocus: relevantText(uniqueText(mobileEquipmentMechanismTemplate.controlFocus, controlFocus)),
          ...(normalizedConfidence !== undefined ? { confidence: normalizedConfidence } : {}),
        }
      : familyHint.includes("fall_protection") || familyHint.includes("falls") || familyHint.includes("scaffold")
      ? {
          observedCondition: fallMechanismTemplate.observedCondition,
          failureMode: fallMechanismTemplate.failureMode,
          exposurePathway: fallMechanismTemplate.exposurePathway,
          potentialConsequence: fallMechanismTemplate.potentialConsequence,
          evidenceGaps: relevantText(uniqueText(fallMechanismTemplate.evidenceGaps, evidenceGaps)),
          controlFocus: relevantText(uniqueText(fallMechanismTemplate.controlFocus, controlFocus)),
          ...(normalizedConfidence !== undefined ? { confidence: normalizedConfidence } : {}),
        }
      : familyHint.includes("confined_space")
      ? {
          observedCondition: confinedSpaceMechanismTemplate.observedCondition,
          failureMode: confinedSpaceMechanismTemplate.failureMode,
          exposurePathway: confinedSpaceMechanismTemplate.exposurePathway,
          potentialConsequence: confinedSpaceMechanismTemplate.potentialConsequence,
          evidenceGaps: relevantText(uniqueText(confinedSpaceMechanismTemplate.evidenceGaps, evidenceGaps)),
          controlFocus: relevantText(uniqueText(confinedSpaceMechanismTemplate.controlFocus, controlFocus)),
          ...(normalizedConfidence !== undefined ? { confidence: normalizedConfidence } : {}),
        }
      : familyHint.includes("fire_explosion") || familyHint.includes("fire_protection") || familyHint.includes("welding_cutting_hot_work")
      ? {
          observedCondition: fireMechanismTemplate.observedCondition,
          failureMode: fireMechanismTemplate.failureMode,
          exposurePathway: fireMechanismTemplate.exposurePathway,
          potentialConsequence: fireMechanismTemplate.potentialConsequence,
          evidenceGaps: relevantText(uniqueText(fireMechanismTemplate.evidenceGaps, evidenceGaps)),
          controlFocus: relevantText(uniqueText(fireMechanismTemplate.controlFocus, controlFocus)),
          ...(normalizedConfidence !== undefined ? { confidence: normalizedConfidence } : {}),
        }
      : familyHint.includes("industrial_hygiene") || familyHint.includes("health_") || familyHint.includes("noise_exposure") || familyHint.includes("respirable_dust_silica")
      ? {
          observedCondition: industrialHygieneMechanismTemplate.observedCondition,
          failureMode: industrialHygieneMechanismTemplate.failureMode,
          exposurePathway: industrialHygieneMechanismTemplate.exposurePathway,
          potentialConsequence: industrialHygieneMechanismTemplate.potentialConsequence,
          evidenceGaps: relevantText(uniqueText(industrialHygieneMechanismTemplate.evidenceGaps, evidenceGaps)),
          controlFocus: relevantText(uniqueText(industrialHygieneMechanismTemplate.controlFocus, controlFocus)),
          ...(normalizedConfidence !== undefined ? { confidence: normalizedConfidence } : {}),
        }
      : {
          observedCondition,
          failureMode,
          exposurePathway,
          potentialConsequence,
          evidenceGaps: relevantText(evidenceGaps),
          controlFocus: relevantText(controlFocus),
          ...(normalizedConfidence !== undefined ? { confidence: normalizedConfidence } : {}),
        };

    const mechanismChain = {
      ...finalMechanismChain,
    };

    if (process.env.HAZLENZ_DEBUG_MECHANISM_CHAIN === "true") {
      console.log("[HazLenz mechanism chain]", {
        hazardCategory: response?.hazardCategory,
        candidateStandardFamily: response?.candidateStandardFamily,
        mechanismChain,
      });
    }

    return mechanismChain;
  }

  private sanitizeResponseForVagueInput(obj: any, isElectrical: boolean, inspectorText: string, rootHazardCategory: string): any {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeResponseForVagueInput(item, isElectrical, inspectorText, rootHazardCategory));
    }

    if (typeof obj === 'object') {
      const newObj: any = {};
      for (const key of Object.keys(obj)) {
        // Skip inferredPossibilities as it is allowed to contain possible conditions
        if (key === 'inferredPossibilities') {
          newObj[key] = obj[key];
          continue;
        }

        // 1. Sanitize correctiveActionPatterns
        if (key === 'correctiveActionPatterns' || key === 'shardCorrectiveActionPatterns') {
          newObj[key] = [];
          continue;
        }

        // 2. Sanitize correctiveActionReasoning if it's an object
        if (key === 'correctiveActionReasoning' && typeof obj[key] === 'object' && obj[key] !== null) {
          newObj[key] = {
            ...obj[key],
            immediateActions: [
              'Keep personnel from touching or operating the affected area/equipment until evaluated.',
              'Restrict access if damage or hazard exposure is suspected.',
              'Mark/flag the concern and collect photos/details.'
            ],
            interimControls: [
              'Maintain access control pending qualified review.'
            ],
            permanentCorrections: [
              'Repair or replace components identified by qualified review.'
            ],
            verificationSteps: [
              inspectorText
            ],
            administrativeFollowUps: [],
            urgencyLevel: 'moderate',
            immediateActionNarrative: 'Keep personnel from touching or operating the affected area/equipment until evaluated.',
            interimControlNarrative: 'Maintain access control pending qualified review.',
            permanentCorrectionNarrative: 'Repair or replace components identified by qualified review.',
            verificationNarrative: inspectorText,
            administrativeFollowUpNarrative: 'Collect photos or details and request qualified safety review.',
          };
          continue;
        }

        // 3. Sanitize correctiveActionReasoning if it's a string
        if (key === 'correctiveActionReasoning' && typeof obj[key] === 'string') {
          newObj[key] = "Review and control HazLenz AI-identified hazard. Keep personnel from touching or operating the affected area/equipment until evaluated by a qualified review.";
          continue;
        }

        // 4. Sanitize correctiveActionStrategy if it's an object
        if (key === 'correctiveActionStrategy' && typeof obj[key] === 'object' && obj[key] !== null) {
          const vagueRankedActions = [
            {
              id: "action-vague-1",
              actionType: "immediate",
              priority: "high",
              controlFamily: "administrative",
              actionText: "Keep personnel from touching or operating the affected area/equipment until evaluated.",
              reason: "Observation is too vague to confirm specific conditions or repairs.",
              linkedHazardDomains: [rootHazardCategory || "general"],
              linkedScenarioIds: [],
              linkedCausalChains: [],
              evidenceDependency: "unconfirmed",
              confidence: 0.5,
              requiresHumanVerification: true,
            },
            {
              id: "action-vague-2",
              actionType: "interim",
              priority: "medium",
              controlFamily: "administrative",
              actionText: "Restrict access if damage or hazard exposure is suspected.",
              reason: "Observation is too vague to confirm specific conditions or repairs.",
              linkedHazardDomains: [rootHazardCategory || "general"],
              linkedScenarioIds: [],
              linkedCausalChains: [],
              evidenceDependency: "unconfirmed",
              confidence: 0.5,
              requiresHumanVerification: true,
            },
            {
              id: "action-vague-3",
              actionType: "verification",
              priority: "high",
              controlFamily: "verification",
              actionText: inspectorText,
              reason: "Qualified review and inspection required to determine specific defects.",
              linkedHazardDomains: [rootHazardCategory || "general"],
              linkedScenarioIds: [],
              linkedCausalChains: [],
              evidenceDependency: "unconfirmed",
              confidence: 0.5,
              requiresHumanVerification: true,
            }
          ];

          newObj[key] = {
            strategyVersion: 'v1-vague-sanitized',
            rankedActions: vagueRankedActions,
            immediateControls: vagueRankedActions.filter(a => a.actionType === 'immediate'),
            interimControls: vagueRankedActions.filter(a => a.actionType === 'interim'),
            permanentControls: [
              {
                id: "action-vague-4",
                actionType: "permanent",
                priority: "medium",
                controlFamily: "engineering",
                actionText: "Repair or replace components identified by qualified review.",
                reason: "Permanent corrections must follow qualified inspection and review.",
                linkedHazardDomains: [rootHazardCategory || "general"],
                linkedScenarioIds: [],
                linkedCausalChains: [],
                evidenceDependency: "unconfirmed",
                confidence: 0.5,
                requiresHumanVerification: true,
              }
            ],
            verificationSteps: vagueRankedActions.filter(a => a.actionType === 'verification'),
            weakActionsToAvoid: [],
            supervisorQuestions: [],
            rankingRationale: ["Observation is too vague to recommend specific corrective actions. Prioritizing access control and qualified reviewer inspection."],
            confidence: 0.5,
            actionPosture: 'verify_then_act',
            advisoryBoundary: 'Advisory-only vague hazard control strategy.'
          };
          continue;
        }

        // 5. Sanitize any string containing forbidden terms (case-insensitive checks)
        if (typeof obj[key] === 'string') {
          let val = obj[key];
          const forbiddenTerms = [
            'immediately stop all work',
            'lock out',
            'tag out',
            'de-energization',
            'exposed electrical equipment',
            'exposed energized parts',
            'approved covers',
            'dead-front',
            'open slot',
            'replace damaged wiring',
            'permanent engineered solutions specific to hazard'
          ];

          let containsForbidden = false;
          const valLower = val.toLowerCase();
          for (const term of forbiddenTerms) {
            if (valLower.includes(term)) {
              containsForbidden = true;
              break;
            }
          }

          if (containsForbidden) {
            if (key === 'description' || key === 'title' || key === 'actionText' || key === 'reason') {
               if (valLower.includes('lock out') || valLower.includes('tag out') || valLower.includes('de-energization')) {
                 val = "Verify de-energization or lockout before work is performed.";
               } else {
                 val = "Review and inspect condition with qualified personnel.";
               }
            } else {
               val = "Review and inspect condition with qualified personnel.";
            }
          }
          newObj[key] = val;
          continue;
        }

        newObj[key] = this.sanitizeResponseForVagueInput(obj[key], isElectrical, inspectorText, rootHazardCategory);
      }
      return newObj;
    }

    return obj;
  }
}
