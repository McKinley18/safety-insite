export class ExposurePathService {
  evaluate(input: {
    classification: string;
    text: string;
    operationalState?: any;
    energyTransferIntelligence?: any;
    humanFactors?: any;
  }) {
    const text = String(input.text || "").toLowerCase();

    const exposurePathways: string[] = [];
    const exposureAmplifiers: string[] = [];
    const workerInterfaces: string[] = [];

    if (text.includes("dust") || text.includes("silica") || text.includes("respirable")) {
      exposurePathways.push("airborne inhalation pathway");
      workerInterfaces.push("respiratory interface");
    }

    if (text.includes("moving") || text.includes("rotating") || text.includes("pinch")) {
      exposurePathways.push("mechanical contact pathway");
      workerInterfaces.push("body-position interface");
    }

    if (text.includes("electrical") || text.includes("energized") || text.includes("arc")) {
      exposurePathways.push("electrical energy transfer pathway");
      workerInterfaces.push("electrical contact interface");
    }

    if (text.includes("fall") || text.includes("elevated")) {
      exposurePathways.push("gravity-driven fall pathway");
      workerInterfaces.push("elevation exposure interface");
    }

    if (text.includes("chemical") || text.includes("vapor") || text.includes("gas")) {
      exposurePathways.push("chemical exposure pathway");
      workerInterfaces.push("inhalation or skin-contact interface");
    }

    if (input.humanFactors?.visibilitySignals?.length) {
      exposureAmplifiers.push("Visibility limitations may increase exposure likelihood.");
    }

    if (input.operationalState?.primaryState === "maintenance_or_service") {
      exposureAmplifiers.push("Maintenance state may bypass normal operational safeguards.");
    }

    if (input.energyTransferIntelligence?.uncontrolledEnergyLikely) {
      exposureAmplifiers.push("Uncontrolled energy conditions may amplify injury severity.");
    }

    const exposureComplexity =
      exposurePathways.length >= 3
        ? "high"
        : exposurePathways.length >= 2
          ? "medium"
          : "low";

    return {
      exposurePathways,
      workerInterfaces,
      exposureAmplifiers,
      exposureComplexity,
      exposureSummary:
        "SafeScope mapped likely exposure pathways, worker interfaces, and amplification conditions contributing to hazard exposure.",
    };
  }
}
