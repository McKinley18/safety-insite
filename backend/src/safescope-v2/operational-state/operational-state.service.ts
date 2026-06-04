export class OperationalStateService {
  evaluate(input: {
    text: string;
    classification: string;
    eventSequence?: any;
    energyTransferIntelligence?: any;
  }) {
    const text = String(input.text || "").toLowerCase();

    const states: string[] = [];
    const stateSignals: string[] = [];
    const stateRisks: string[] = [];

    if (text.includes("production") || text.includes("running") || text.includes("operating")) {
      states.push("production_or_active_operation");
      stateSignals.push("Active production or operating state indicated.");
      stateRisks.push("Active operation can increase exposure to moving, energized, or live hazards.");
    }

    if (text.includes("maintenance") || text.includes("repair") || text.includes("service")) {
      states.push("maintenance_or_service");
      stateSignals.push("Maintenance or service activity indicated.");
      stateRisks.push("Maintenance work can increase exposure because guards, covers, or normal controls may be removed.");
    }

    if (text.includes("cleaning") || text.includes("clearing") || text.includes("jam")) {
      states.push("cleaning_or_clearing");
      stateSignals.push("Cleaning, clearing, or jam-removal activity indicated.");
      stateRisks.push("Cleaning or jam clearing can create high-risk interaction with stored or moving energy.");
    }

    if (text.includes("startup") || text.includes("restart") || text.includes("start up")) {
      states.push("startup_or_restart");
      stateSignals.push("Startup or restart activity indicated.");
      stateRisks.push("Startup/restart can create unexpected energy release or worker-position risk.");
    }

    if (text.includes("shutdown") || text.includes("locked out") || text.includes("de-energized") || text.includes("isolated")) {
      states.push("shutdown_or_energy_control");
      stateSignals.push("Shutdown or energy-control state indicated.");
      stateRisks.push("Energy-control effectiveness should be verified before work proceeds.");
    }

    const primaryState = states[0] || "unknown";
    const stateConfidence = states.length ? "medium" : "low";

    return {
      primaryState,
      states: Array.from(new Set(states)),
      stateSignals: Array.from(new Set(stateSignals)),
      stateRisks: Array.from(new Set(stateRisks)),
      stateConfidence,
      stateAwarenessSummary:
        primaryState === "unknown"
          ? "Operational state is unclear. SafeScope needs more context about whether work was active, maintenance, cleaning, startup, shutdown, or emergency response."
          : `SafeScope inferred operational state as ${primaryState.replaceAll("_", " ")} based on narrative and energy-state signals.`,
    };
  }
}
