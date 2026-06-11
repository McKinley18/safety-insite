import * as natural from 'natural';

export class ContradictionIntelligenceService {
  evaluate(input: {
    text: string;
    operationalState?: any;
    energyTransferIntelligence?: any;
    barrierIntelligence?: any;
    humanFactors?: any;
  }) {
    const text = String(input.text || "").toLowerCase();
    const contradictions: string[] = [];
    const ambiguities: string[] = [];

    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text) || [];
    const stemmed = tokens.map(t => natural.PorterStemmer.stem(t));

    const hasTerm = (terms: string[]) => terms.some(term => {
      if (text.includes(term.toLowerCase())) return true;
      const stemmedTerm = natural.PorterStemmer.stem(term.toLowerCase());
      return stemmed.includes(stemmedTerm);
    });

    const isDeenergized = hasTerm(["locked out", "de-energized", "loto applied", "isolated", "zero energy"]);
    const isEnergized = hasTerm(["running", "operating", "moving", "energized", "live", "active"]);
    
    if (isDeenergized && isEnergized) {
      contradictions.push("Energy-control language conflicts with active equipment or energized-state language.");
    }

    const isGuarded = hasTerm(["guarded", "guard in place", "securely covered", "barrier erected"]);
    const isUnguarded = hasTerm(["unguarded", "missing guard", "removed guard", "exposed part", "open hole"]);

    if (isGuarded && isUnguarded) {
      contradictions.push("Guarding status appears internally inconsistent.");
    }

    const isNoExposure = hasTerm(["no exposure", "no employee exposure", "isolated area", "not in use"]);
    const isWorkerExposed = hasTerm(["employee", "worker", "within reach", "near", "operator", "walking by"]);

    if (isNoExposure && isWorkerExposed) {
      contradictions.push("No-exposure statement conflicts with worker proximity or access language.");
    }

    const isClosed = hasTerm(["closed", "completed", "fixed", "repaired"]);
    const isOpen = hasTerm(["not verified", "not corrected", "still open", "remains", "unable to fix"]);

    if (isClosed && isOpen) {
      contradictions.push("Closure language conflicts with unresolved or unverified condition language.");
    }
    
    const isTiedOff = hasTerm(["tied off", "harnessed", "lanyard attached"]);
    const isNoAnchor = hasTerm(["no anchor", "nowhere to tie", "unanchored", "unsecured"]);
    
    if (isTiedOff && isNoAnchor) {
      contradictions.push("Fall protection usage language conflicts with missing anchor point language.");
    }

    // AI ambiguity detection based on missing subjects or unclear modifiers
    if (stemmed.includes("safe") && stemmed.includes("unsafe")) {
        ambiguities.push("Observation text simultaneously describes conditions as safe and unsafe without clear context.");
    }

    if (stemmed.length > 0 && !hasTerm(["worker", "employee", "operator", "miner", "contractor", "person", "someone"])) {
        if (hasTerm(["hazard", "dangerous", "risk"])) {
             ambiguities.push("Hazard is described, but exposed personnel (who is at risk) is not clearly identified.");
        }
    }

    const severity =
      contradictions.length >= 2
        ? "high"
        : contradictions.length === 1
          ? "medium"
          : "none";

    return {
      engine: 'safescope_contradiction_intelligence_v1',
      contradictionsDetected: contradictions.length > 0,
      contradictionSeverity: severity,
      contradictions,
      ambiguities,
      reviewImpact:
        contradictions.length > 0
          ? "Contradictions reduce decision confidence and require supervisor clarification before finalizing standards, risk, or corrective actions."
          : ambiguities.length > 0
            ? "Ambiguities detected. Clarification recommended for defensibility."
            : "No major internal contradictions or ambiguities detected from available narrative.",
    };
  }
}
