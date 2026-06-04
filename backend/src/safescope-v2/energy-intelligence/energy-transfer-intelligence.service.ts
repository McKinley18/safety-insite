export type EnergyTransferInput = {
  text: string;
  classification: string;
  operationalReasoning?: any;
  risk?: any;
};

function includesAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

export class EnergyTransferIntelligenceService {
  evaluate(input: EnergyTransferInput) {
    const text = String(input.text || "").toLowerCase();
    const classification = String(input.classification || "").toLowerCase();

    const energySources: string[] = [];
    const releaseMechanisms: string[] = [];
    const exposureInterfaces: string[] = [];
    const missingBarriers: string[] = [];
    const controlLogic: string[] = [];

    if (classification.includes("electrical") || includesAny(text, ["energized", "live", "voltage", "panel", "breaker", "conductor", "cord"])) {
      energySources.push("electrical");
      releaseMechanisms.push("Contact with energized components or arc-flash/arc-blast release.");
      controlLogic.push("Verify de-energization, guarding, covers, qualified-person access, and electrical work controls.");
    }

    if (classification.includes("machine") || includesAny(text, ["rotating", "moving", "shaft", "belt", "pulley", "chain", "pinch", "conveyor"])) {
      energySources.push("kinetic/mechanical");
      releaseMechanisms.push("Contact with rotating, moving, or driven machine parts.");
      controlLogic.push("Verify guarding, isolation, interlocks, safe access, and lockout/tagout where applicable.");
    }

    if (classification.includes("fall") || includesAny(text, ["height", "edge", "ladder", "platform", "roof", "elevated", "opening"])) {
      energySources.push("gravity");
      releaseMechanisms.push("Loss of support, edge exposure, opening exposure, or fall to lower level.");
      controlLogic.push("Verify guardrails, covers, fall protection, access control, and walking-working surface condition.");
    }

    if (classification.includes("mobile") || includesAny(text, ["truck", "loader", "forklift", "vehicle", "traffic", "backup", "pedestrian"])) {
      energySources.push("mobile equipment kinetic energy");
      releaseMechanisms.push("Vehicle movement, struck-by, caught-between, rollback, or blind-spot interaction.");
      controlLogic.push("Verify traffic controls, separation, alarms, visibility, berms, spotters, and operator procedures.");
    }

    if (includesAny(text, ["pressure", "compressed", "hydraulic", "pneumatic", "hose", "cylinder"])) {
      energySources.push("pressure/stored energy");
      releaseMechanisms.push("Unexpected release of hydraulic, pneumatic, or compressed stored energy.");
      controlLogic.push("Verify pressure relief, isolation, blocking, bleed-down, and zero-energy verification.");
    }

    if (includesAny(text, ["hot", "heat", "burn", "steam", "fire", "ignition", "welding"])) {
      energySources.push("thermal/fire");
      releaseMechanisms.push("Heat, flame, steam, ignition, or hot-surface exposure.");
      controlLogic.push("Verify hot-work controls, isolation, fire protection, cooling, shielding, and ignition-source control.");
    }

    if (includesAny(text, ["chemical", "acid", "caustic", "dust", "silica", "vapor", "gas", "fume", "oxygen deficiency", "oxygen deficient", "atmosphere", "atmospheric", "ventilation", "confined space"])) {
      energySources.push("chemical/industrial hygiene");
      releaseMechanisms.push("Inhalation, skin contact, eye contact, or chemical reaction exposure.");
      controlLogic.push("Verify labeling, containment, ventilation, SDS availability, exposure controls, and PPE compatibility.");
    }

    if (includesAny(text, ["near", "within reach", "contact", "access", "walkway", "working", "operating", "maintenance"])) {
      exposureInterfaces.push("Worker access or proximity creates a credible exposure interface.");
    } else {
      exposureInterfaces.push("Exposure interface requires confirmation.");
    }

    if (includesAny(text, ["missing guard", "unguarded", "open panel", "no cover", "unprotected", "not barricaded"])) {
      missingBarriers.push("Physical barrier or guarding may be missing or ineffective.");
    }

    if (includesAny(text, ["not locked", "no lockout", "bypassed", "disabled", "not isolated"])) {
      missingBarriers.push("Energy isolation or interlock control may be absent, bypassed, or ineffective.");
    }

    const severityAmplifiers: string[] = [];

    if (energySources.includes("electrical")) severityAmplifiers.push("Electrical energy can rapidly create fatal shock, burn, or arc-flash consequences.");
    if (energySources.includes("kinetic/mechanical")) severityAmplifiers.push("Mechanical energy can produce caught-in, crushing, amputation, or struck-by injuries.");
    if (energySources.includes("gravity")) severityAmplifiers.push("Gravity exposure can produce severe injury depending on fall distance and landing surface.");
    if (energySources.includes("mobile equipment kinetic energy")) severityAmplifiers.push("Mobile equipment mass and movement can amplify struck-by or caught-between severity.");
    if (energySources.includes("pressure/stored energy")) severityAmplifiers.push("Stored energy may release unexpectedly during maintenance or troubleshooting.");

    const dominantEnergySource = energySources[0] || "undetermined";
    const uncontrolledEnergyLikely = missingBarriers.length > 0 || input.risk?.requiresShutdown || energySources.length > 1;

    return {
      dominantEnergySource,
      energySources: Array.from(new Set(energySources)),
      uncontrolledEnergyLikely,
      releaseMechanisms: Array.from(new Set(releaseMechanisms)),
      exposureInterfaces: Array.from(new Set(exposureInterfaces)),
      missingBarriers: Array.from(new Set(missingBarriers)),
      severityAmplifiers: Array.from(new Set(severityAmplifiers)),
      controlLogic: Array.from(new Set(controlLogic)),
      energyTransferSummary:
        dominantEnergySource === "undetermined"
          ? "Energy source requires confirmation before final risk and control selection."
          : `Primary energy source appears to be ${dominantEnergySource}. SafeScope evaluated release mechanism, exposure interface, and barrier/control effectiveness.`,
    };
  }
}
