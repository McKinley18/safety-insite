import { Injectable } from "@nestjs/common";
import { HazLenzKnowledgeIndexService } from "../knowledge-index/hazlenz-knowledge-index.service";
import {
  EquipmentFamily,
  HazardFamily,
  Jurisdiction,
  TaskMechanism,
} from "../knowledge-index/hazlenz-knowledge-index.types";

export interface HazLenzKnowledgeRouteDecision {
  jurisdiction: Jurisdiction;
  hazardFamily: HazardFamily;
  equipmentFamily: EquipmentFamily;
  taskMechanism: TaskMechanism;
  bundleIds: string[];
  sourceKeys: string[];
  confidence: number;
  reasons: string[];
  shardKey: string;
}

/**
 * Lightweight first-pass HazLenz knowledge router.
 *
 * Purpose:
 * - Keep HazLenz Review lean.
 * - Identify the likely knowledge directory before broader searching.
 * - Avoid opening every standards/knowledge source for every review.
 * - Preserve advisory-only behavior; this does not decide compliance.
 */
@Injectable()
export class HazLenzKnowledgeRouterService {
  constructor(private readonly index: HazLenzKnowledgeIndexService) {}

  route(input: {
    text: string;
    scopes?: string[];
  }): HazLenzKnowledgeRouteDecision {
    const text = String(input.text || "").toLowerCase();
    const scopes = Array.isArray(input.scopes) ? input.scopes : [];
    const reasons: string[] = [];

    const jurisdiction = this.resolveJurisdiction(scopes, text, reasons);
    const hazardFamily = this.resolveHazardFamily(text, reasons);
    const equipmentFamily = this.resolveEquipmentFamily(text, hazardFamily, reasons);
    const taskMechanism = this.resolveTaskMechanism(text, hazardFamily, equipmentFamily, reasons);

    let entries = this.index.resolveKnowledgeRoute({
      jurisdiction,
      hazardFamily,
      equipmentFamily,
      taskMechanism,
    });

    // Fall back progressively instead of broad-loading everything.
    if (entries.length === 0) {
      entries = this.index.resolveKnowledgeRoute({
        jurisdiction,
        hazardFamily,
      });
      if (entries.length > 0) {
        reasons.push("fallback: matched jurisdiction and hazard family");
      }
    }

    if (entries.length === 0) {
      entries = this.index.resolveKnowledgeRoute({
        jurisdiction,
      });
      if (entries.length > 0) {
        reasons.push("fallback: matched jurisdiction only");
      }
    }

    if (entries.length === 0) {
      entries = this.index.resolveKnowledgeRoute({
        jurisdiction: "unclear",
        hazardFamily: "other",
        equipmentFamily: "unknown",
        taskMechanism: "unknown",
      });
      reasons.push("fallback: no focused knowledge route matched");
    }

    const bundleIds = Array.from(new Set(entries.flatMap((entry) => entry.bundleIds)));
    const sourceKeys = Array.from(new Set(entries.flatMap((entry) => entry.sourceKeys)));

    return {
      jurisdiction,
      hazardFamily,
      equipmentFamily,
      taskMechanism,
      bundleIds,
      sourceKeys,
      confidence: this.scoreConfidence(reasons, bundleIds),
      reasons: Array.from(new Set(reasons)),
      shardKey: `${jurisdiction}/${hazardFamily}/${equipmentFamily}/${taskMechanism}`,
    };
  }

  private resolveJurisdiction(
    scopes: string[],
    text: string,
    reasons: string[],
  ): Jurisdiction {
    const normalizedScopes = scopes.map((scope) => String(scope).toLowerCase());

    if (
      normalizedScopes.includes("msha") ||
      normalizedScopes.some((scope) => scope.includes("msha")) ||
      /\bmine|mining|miner|haul road|crusher|plant|quarry|pit\b/i.test(text)
    ) {
      reasons.push("jurisdiction: MSHA/mining signal");
      return "msha";
    }

    if (
      normalizedScopes.includes("osha_construction") ||
      normalizedScopes.some((scope) => scope.includes("construction")) ||
      /\bconstruction|jobsite|scaffold|excavation|trench|roofing\b/i.test(text)
    ) {
      reasons.push("jurisdiction: OSHA construction signal");
      return "osha_construction";
    }

    if (
      normalizedScopes.includes("osha_general_industry") ||
      normalizedScopes.some((scope) => scope.includes("general")) ||
      /\bwarehouse|shop|manufacturing|maintenance shop|facility|general industry\b/i.test(text)
    ) {
      reasons.push("jurisdiction: OSHA general industry signal");
      return "osha_general_industry";
    }

    reasons.push("jurisdiction: unclear");
    return "unclear";
  }

  private resolveHazardFamily(text: string, reasons: string[]): HazardFamily {
    if (/\bconveyor|belt|tail pulley|head pulley|nip point|pinch point\b/i.test(text)) {
      reasons.push("hazard family: conveyor guarding / pinch-point signal");
      return "conveyors";
    }

    if (/\belectrical|breaker|panel|energized|voltage|open slot|cover plate|exposed wire|arc flash\b/i.test(text)) {
      reasons.push("hazard family: electrical signal");
      return "electrical";
    }

    if (/\bfall protection|guardrail|ladder|scaffold|platform|unprotected edge|fall arrest|height\b/i.test(text)) {
      reasons.push("hazard family: fall protection signal");
      return "fall_protection";
    }

    if (/\bforklift|loader|haul truck|mobile equipment|vehicle|truck|pedestrian|traffic|blind spot\b/i.test(text)) {
      reasons.push("hazard family: mobile equipment / traffic signal");
      return "mobile_equipment";
    }

    if (/\blockout|tagout|loto|de[- ]?energize|stored energy|energy isolation\b/i.test(text)) {
      reasons.push("hazard family: lockout/tagout signal");
      return "lockout_tagout";
    }

    if (/\bchemical|hazcom|sds|label|secondary container|acid|solvent|corrosive|flammable\b/i.test(text)) {
      reasons.push("hazard family: chemical exposure / HazCom signal");
      return "chemical_exposure";
    }

    if (/\bhousekeeping|spillage|debris|accumulation|slip|trip|walkway|travelway\b/i.test(text)) {
      reasons.push("hazard family: housekeeping signal");
      return "housekeeping";
    }

    reasons.push("hazard family: other");
    return "other";
  }

  private resolveEquipmentFamily(
    text: string,
    hazardFamily: HazardFamily,
    reasons: string[],
  ): EquipmentFamily {
    if (/\bconveyor|belt|tail pulley|head pulley|drive pulley\b/i.test(text)) {
      reasons.push("equipment family: conveyor");
      return "conveyor";
    }

    if (/\belectrical panel|breaker|panelboard|disconnect|junction box\b/i.test(text)) {
      reasons.push("equipment family: electrical panel");
      return "electrical_panel";
    }

    if (/\bforklift|loader|haul truck|truck|vehicle|mobile equipment\b/i.test(text)) {
      reasons.push("equipment family: mobile equipment");
      return "mobile_equipment";
    }

    if (/\bladder\b/i.test(text)) {
      reasons.push("equipment family: ladder");
      return "ladder";
    }

    if (/\bplatform|scaffold|catwalk|walkway\b/i.test(text)) {
      reasons.push("equipment family: platform");
      return "platform";
    }

    if (hazardFamily === "conveyors") return "conveyor";
    if (hazardFamily === "electrical") return "electrical_panel";
    if (hazardFamily === "mobile_equipment" || hazardFamily === "powered_haulage") return "mobile_equipment";

    reasons.push("equipment family: unknown");
    return "unknown";
  }

  private resolveTaskMechanism(
    text: string,
    hazardFamily: HazardFamily,
    equipmentFamily: EquipmentFamily,
    reasons: string[],
  ): TaskMechanism {
    if (/\bguard|unguarded|missing guard|exposed|nip point|pinch point\b/i.test(text)) {
      reasons.push("task mechanism: guarding");
      return "guarding";
    }

    if (/\bstruck by|struck-by|pedestrian|traffic|blind spot|backing|vehicle interaction\b/i.test(text)) {
      reasons.push("task mechanism: struck-by");
      return "struck_by";
    }

    if (/\bcaught|caught-in|caught between|entanglement|in-running\b/i.test(text)) {
      reasons.push("task mechanism: caught-in/between");
      return "caught_in_between";
    }

    if (/\belectrical|energized|shock|arc flash|open breaker|exposed conductor\b/i.test(text)) {
      reasons.push("task mechanism: electrical contact");
      return "electrical_contact";
    }

    if (/\bfall|unprotected edge|guardrail|height|scaffold|ladder\b/i.test(text)) {
      reasons.push("task mechanism: fall from height");
      return "fall_from_height";
    }

    if (/\bchemical|acid|solvent|corrosive|label|sds|secondary container\b/i.test(text)) {
      reasons.push("task mechanism: chemical exposure");
      return "chemical_exposure";
    }

    if (/\blockout|tagout|loto|stored energy|de[- ]?energize\b/i.test(text)) {
      reasons.push("task mechanism: energy isolation");
      return "energy_isolation";
    }

    if (/\bhousekeeping|slip|trip|spillage|debris|accumulation\b/i.test(text)) {
      reasons.push("task mechanism: housekeeping slip/trip");
      return "housekeeping_slip_trip";
    }

    if (hazardFamily === "conveyors" || equipmentFamily === "conveyor") return "guarding";
    if (hazardFamily === "electrical") return "electrical_contact";
    if (hazardFamily === "fall_protection") return "fall_from_height";
    if (hazardFamily === "chemical_exposure") return "chemical_exposure";
    if (hazardFamily === "lockout_tagout") return "energy_isolation";

    reasons.push("task mechanism: unknown");
    return "unknown";
  }

  private scoreConfidence(reasons: string[], bundleIds: string[]): number {
    let score = 45;

    score += Math.min(30, reasons.filter((reason) => !reason.startsWith("fallback")).length * 6);
    score += Math.min(15, bundleIds.length * 5);

    if (reasons.some((reason) => reason.includes("unclear"))) score -= 10;
    if (reasons.some((reason) => reason.startsWith("fallback"))) score -= 8;

    return Math.max(20, Math.min(95, score));
  }
}
