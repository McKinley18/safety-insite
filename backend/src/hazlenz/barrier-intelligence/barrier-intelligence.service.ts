export class BarrierIntelligenceService {
  evaluate(input: {
    text: string;
    classification: string;
    energyTransferIntelligence?: any;
    controlIntelligence?: any;
    operationalReasoning?: any;
  }) {
    const text = String(input.text || "").toLowerCase();

    const barrierTypes: string[] = [];
    const failedOrMissingBarriers: string[] = [];
    const verificationNeeds: string[] = [];

    if (text.includes("guard") || text.includes("barrier") || text.includes("cover")) {
      barrierTypes.push("physical_guarding");
    }

    if (text.includes("interlock") || text.includes("bypassed") || text.includes("disabled")) {
      barrierTypes.push("interlock_or_safeguard");
    }

    if (text.includes("lockout") || text.includes("de-energized") || text.includes("isolated")) {
      barrierTypes.push("energy_isolation");
    }

    if (text.includes("procedure") || text.includes("training") || text.includes("signage")) {
      barrierTypes.push("administrative_control");
    }

    if (text.includes("ppe") || text.includes("glove") || text.includes("respirator") || text.includes("eye protection")) {
      barrierTypes.push("ppe");
    }

    if (text.includes("missing") || text.includes("unguarded") || text.includes("no guard") || text.includes("no cover")) {
      failedOrMissingBarriers.push("Physical guard, cover, or barrier may be missing.");
    }

    if (text.includes("bypassed") || text.includes("disabled")) {
      failedOrMissingBarriers.push("Interlock or safeguard may be bypassed or disabled.");
    }

    if (text.includes("not locked") || text.includes("no lockout") || text.includes("energized")) {
      failedOrMissingBarriers.push("Energy isolation may be absent or incomplete.");
    }

    if (input.energyTransferIntelligence?.missingBarriers?.length) {
      failedOrMissingBarriers.push(...input.energyTransferIntelligence.missingBarriers);
    }

    if (!barrierTypes.length) {
      verificationNeeds.push("Identify what barrier or control currently separates the worker from the hazard.");
    }

    if (failedOrMissingBarriers.length) {
      verificationNeeds.push("Verify whether the missing or failed barrier directly controls the energy source and exposure pathway.");
    }

    if (input.controlIntelligence?.verificationNeeded) {
      verificationNeeds.push("Field verification is needed before closure.");
    }

    const barrierAdequacy =
      failedOrMissingBarriers.length >= 2
        ? "weak"
        : failedOrMissingBarriers.length === 1
          ? "questionable"
          : barrierTypes.length
            ? "present_but_verify"
            : "unknown";

    return {
      barrierTypes: Array.from(new Set(barrierTypes)),
      failedOrMissingBarriers: Array.from(new Set(failedOrMissingBarriers)),
      barrierAdequacy,
      verificationNeeds: Array.from(new Set(verificationNeeds)),
      barrierReasoning:
        barrierAdequacy === "weak"
          ? "Multiple barrier weaknesses may exist. Corrective action should address the failed barrier and verify effectiveness."
          : barrierAdequacy === "questionable"
            ? "At least one barrier weakness is indicated. Verification is needed before closure."
            : barrierAdequacy === "present_but_verify"
              ? "A barrier or control is referenced, but field effectiveness should be verified."
              : "Barrier status is not clear from available evidence.",
    };
  }
}
