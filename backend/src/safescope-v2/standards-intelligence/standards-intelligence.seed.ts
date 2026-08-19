import { StandardsIntelligenceRecord } from "./standards-intelligence.types";
import { buildSourceRegistryMetadata } from "../../safescope-knowledge/sources/source-registry-metadata";

const MSHA_STANDARDS_SOURCE_METADATA = buildSourceRegistryMetadata(
  "msha-30-cfr-standards",
);
const OSHA_1910_SOURCE_METADATA = buildSourceRegistryMetadata("osha-ecfr-1910");
const OSHA_1926_SOURCE_METADATA = buildSourceRegistryMetadata("osha-ecfr-1926");

function sourceMetadataForCitation(citation: string) {
  const normalized = String(citation || "").toLowerCase();

  if (normalized.includes("1926")) {
    return OSHA_1926_SOURCE_METADATA;
  }

  if (normalized.includes("1910")) {
    return OSHA_1910_SOURCE_METADATA;
  }

  if (
    normalized.includes("30 cfr") ||
    normalized.includes("56.") ||
    normalized.includes("57.")
  ) {
    return MSHA_STANDARDS_SOURCE_METADATA;
  }

  return MSHA_STANDARDS_SOURCE_METADATA;
}

function withSourceRegistryMetadata<
  T extends { citation: string; agency: string; authorityTier: number },
>(standard: T): T {
  const source = sourceMetadataForCitation(standard.citation);

  return {
    ...standard,
    sourceKey: source.sourceKey,
    sourceName: source.sourceName,
    sourceType: source.sourceType,
    authorityTier: source.authorityTier,
    allowedUse: source.allowedUse,
    requiresApproval: source.requiresApproval,
    approvedForAutoIngestion: source.approvedForAutoIngestion,
    jurisdictionTags: source.jurisdictionTags,
  };
}

const RAW_STANDARDS_INTELLIGENCE_SEED: StandardsIntelligenceRecord[] = [
  {
    citation: "30 CFR 56.14107(a)",
    agency: "MSHA",
    scope: "mining",
    part: "56",
    subpart: "M",
    title: "Moving machine parts",
    plainLanguageSummary:
      "Moving machine parts must be guarded when they can contact miners or create contact, pinch-point, entanglement, or caught-in exposure.",
    hazardFamilies: ["Machine Guarding", "Caught-In/Between", "Entanglement"],
    equipmentTags: [
      "conveyor",
      "tail pulley",
      "head pulley",
      "belt",
      "roller",
      "idler",
      "shaft",
      "sprocket",
      "chain",
      "fan",
      "rotating part",
    ],
    taskTags: [
      "cleanup",
      "maintenance",
      "inspection",
      "normal operation",
      "repair",
      "adjustment",
    ],
    exposureTags: [
      "accessible",
      "reachable",
      "walkway",
      "travelway",
      "platform",
      "work area",
      "near worker",
      "line of fire",
    ],
    controlTags: [
      "guarding",
      "fixed guard",
      "barrier",
      "restricted access",
      "lockout",
      "tagout",
      "verify guard",
    ],
    consequenceTags: [
      "entanglement",
      "amputation",
      "crushing",
      "fatality",
      "caught-in",
    ],
    searchBoostTerms: [
      "unguarded",
      "missing guard",
      "damaged guard",
      "tail pulley",
      "pinch point",
      "moving parts",
      "conveyor",
    ],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "critical",
    evidenceRequirements: [
      {
        question: "Is a moving machine part present?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question:
          "Can a miner or employee contact the moving part from a walkway, work area, platform, or maintenance position?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question:
          "Is guarding missing, damaged, removed, bypassed, or inadequate?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question:
          "Was cleanup, maintenance, inspection, or normal work occurring near the equipment?",
        requiredForPrimary: false,
        missingEvidenceImpact: "medium",
      },
      {
        question:
          "Was energy isolation or lockout/tagout needed before correction?",
        requiredForPrimary: false,
        missingEvidenceImpact: "medium",
      },
    ],
    exclusionRules: [
      {
        reason: "No moving machinery or machine part is described.",
        excludeWhenMissingAny: [
          "conveyor",
          "pulley",
          "belt",
          "shaft",
          "roller",
          "sprocket",
          "chain",
          "rotating",
          "moving part",
        ],
      },
    ],
    crossDomainLinks: [
      "Lockout / Stored Energy",
      "Electrical",
      "Powered Haulage",
      "Workplace Examination",
    ],
  },
  {
    citation: "30 CFR 57.14107(a)",
    agency: "MSHA",
    scope: "mining",
    part: "57",
    subpart: "M",
    title: "Moving machine parts",
    plainLanguageSummary:
      "Underground metal/nonmetal moving machine parts must be guarded when contact exposure exists.",
    hazardFamilies: ["Machine Guarding", "Caught-In/Between", "Entanglement"],
    equipmentTags: [
      "conveyor",
      "tail pulley",
      "belt",
      "roller",
      "idler",
      "shaft",
      "sprocket",
      "chain",
      "rotating part",
    ],
    taskTags: [
      "cleanup",
      "maintenance",
      "inspection",
      "normal operation",
      "repair",
    ],
    exposureTags: [
      "accessible",
      "reachable",
      "walkway",
      "travelway",
      "work area",
    ],
    controlTags: ["guarding", "fixed guard", "barrier", "lockout", "tagout"],
    consequenceTags: ["entanglement", "amputation", "crushing", "fatality"],
    searchBoostTerms: [
      "unguarded",
      "missing guard",
      "tail pulley",
      "moving parts",
      "conveyor",
    ],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "critical",
    evidenceRequirements: [
      {
        question:
          "Is the operation underground metal/nonmetal or otherwise under Part 57?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Is a moving machine part accessible to miners?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question:
          "Is guarding missing, damaged, removed, bypassed, or inadequate?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
    ],
    exclusionRules: [
      {
        reason: "No underground/Part 57 context is established.",
        excludeWhenMissingAny: ["underground", "part 57", "metal/nonmetal"],
      },
    ],
    crossDomainLinks: [
      "Lockout / Stored Energy",
      "Electrical",
      "Powered Haulage",
    ],
  },
  {
    citation: "30 CFR 56.14105",
    agency: "MSHA",
    scope: "mining",
    part: "56",
    subpart: "M",
    title: "Procedures during repairs or maintenance",
    plainLanguageSummary:
      "Machinery or equipment must be blocked against hazardous motion and power must be off when repairs or maintenance expose miners to hazardous motion.",
    hazardFamilies: [
      "Lockout / Stored Energy",
      "Machine Guarding",
      "Maintenance Safety",
    ],
    equipmentTags: [
      "conveyor",
      "belt",
      "crusher",
      "screen",
      "mobile equipment",
      "machinery",
      "powered equipment",
    ],
    taskTags: [
      "maintenance",
      "repair",
      "cleanup",
      "jam clearing",
      "adjustment",
      "troubleshooting",
    ],
    exposureTags: [
      "unexpected startup",
      "hazardous motion",
      "stored energy",
      "energized",
      "operating equipment",
    ],
    controlTags: [
      "lockout",
      "tagout",
      "block against motion",
      "de-energize",
      "verify zero energy",
    ],
    consequenceTags: ["caught-in", "crushing", "entanglement", "fatality"],
    searchBoostTerms: [
      "maintenance",
      "repair",
      "cleaning",
      "jam",
      "lockout",
      "tagout",
      "energized",
      "started unexpectedly",
    ],
    authorityTier: 1,
    applicabilityBandDefault: "supporting",
    severityDefault: "critical",
    evidenceRequirements: [
      {
        question:
          "Was repair, maintenance, cleanup, jam clearing, or adjustment occurring?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question:
          "Could equipment start, move, roll, rotate, or release stored energy?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question:
          "Was the equipment locked/tagged out, de-energized, or blocked against motion?",
        requiredForPrimary: false,
        missingEvidenceImpact: "high",
      },
    ],
    exclusionRules: [
      {
        reason:
          "No repair, maintenance, cleanup, or hazardous-motion work activity is described.",
        excludeWhenMissingAny: [
          "maintenance",
          "repair",
          "cleanup",
          "cleaning",
          "jam",
          "adjustment",
          "service",
        ],
      },
    ],
    crossDomainLinks: ["Machine Guarding", "Electrical", "Conveyor Safety"],
  },
  {
    citation: "30 CFR 56.12016",
    agency: "MSHA",
    scope: "msha",
    part: "56",
    subpart: "K",
    title: "Work on electrically powered equipment",
    plainLanguageSummary:
      "Electrical work or work on electrically powered equipment requires safe de-energization, lockout, and protection from electrical exposure where applicable.",
    hazardFamilies: ["Electrical", "Lockout / Stored Energy"],
    equipmentTags: [
      "electrical equipment",
      "panel",
      "conductor",
      "wire",
      "cable",
      "motor",
      "disconnect",
      "breaker",
    ],
    taskTags: [
      "electrical work",
      "maintenance",
      "troubleshooting",
      "repair",
      "inspection",
    ],
    exposureTags: [
      "energized",
      "live",
      "shock exposure",
      "arc flash",
      "exposed conductor",
    ],
    controlTags: [
      "de-energize",
      "lockout",
      "tagout",
      "qualified person",
      "verify absence of voltage",
    ],
    consequenceTags: [
      "shock",
      "electrocution",
      "arc flash",
      "burn",
      "fatality",
    ],
    searchBoostTerms: [
      "energized conductor",
      "live wire",
      "open panel",
      "electrical",
      "voltage",
      "breaker",
      "arc flash",
    ],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "critical",
    evidenceRequirements: [
      {
        question:
          "Is electrical equipment, conductor, cable, wire, panel, or energized component involved?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question:
          "Is the component energized, live, exposed, damaged, or being worked on?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Was a qualified person required for the work?",
        requiredForPrimary: false,
        missingEvidenceImpact: "medium",
      },
    ],
    exclusionRules: [
      {
        reason:
          "Energized-state wording alone is not enough without an electrical component or electrical work context.",
        excludeWhenMissingAny: [
          "electrical",
          "conductor",
          "wire",
          "cable",
          "panel",
          "breaker",
          "voltage",
          "live",
          "arc flash",
        ],
      },
    ],
    crossDomainLinks: ["Lockout / Stored Energy", "Machine Guarding"],
  },
  {
    citation: "1910.212(a)(1)",
    agency: "OSHA",
    scope: "osha-general-industry",
    part: "1910",
    subpart: "O",
    title: "Machine guarding - types of guarding methods",
    plainLanguageSummary:
      "Machines must have guarding to protect employees from hazards such as points of operation, ingoing nip points, rotating parts, flying chips, and sparks.",
    hazardFamilies: ["Machine Guarding", "Caught-In/Between"],
    equipmentTags: [
      "machine",
      "conveyor",
      "shaft",
      "belt",
      "pulley",
      "sprocket",
      "gear",
      "point of operation",
    ],
    taskTags: ["operation", "maintenance", "cleanup", "inspection"],
    exposureTags: [
      "point of operation",
      "ingoing nip point",
      "rotating part",
      "accessible",
    ],
    controlTags: ["machine guarding", "barrier", "device", "safeguard"],
    consequenceTags: ["amputation", "caught-in", "laceration", "crushing"],
    searchBoostTerms: [
      "machine guarding",
      "point of operation",
      "nip point",
      "rotating parts",
      "unguarded",
    ],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "high",
    evidenceRequirements: [
      {
        question:
          "Is this OSHA General Industry rather than MSHA or construction?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Is there employee exposure to a machine hazard?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
    ],
    exclusionRules: [
      {
        reason: "Excluded when selected scope is MSHA-only.",
        keywordsAny: ["msha only", "mine site", "30 cfr"],
      },
    ],
    crossDomainLinks: ["Lockout / Stored Energy"],
  },
  {
    citation: "1910.219",
    agency: "OSHA",
    scope: "osha-general-industry",
    part: "1910",
    subpart: "O",
    title: "Mechanical power-transmission apparatus",
    plainLanguageSummary:
      "Mechanical power-transmission equipment such as belts, pulleys, shafts, gears, and sprockets must be guarded where employee exposure exists.",
    hazardFamilies: ["Machine Guarding", "Power Transmission"],
    equipmentTags: [
      "belt",
      "pulley",
      "shaft",
      "gear",
      "sprocket",
      "chain",
      "coupling",
    ],
    taskTags: ["operation", "maintenance", "inspection"],
    exposureTags: [
      "accessible",
      "rotating part",
      "nip point",
      "power transmission",
    ],
    controlTags: ["guarding", "barrier", "enclosure"],
    consequenceTags: ["entanglement", "amputation", "crushing"],
    searchBoostTerms: [
      "pulley",
      "belt",
      "shaft",
      "sprocket",
      "power transmission",
      "unguarded",
    ],
    authorityTier: 1,
    applicabilityBandDefault: "supporting",
    severityDefault: "high",
    evidenceRequirements: [
      {
        question: "Is OSHA General Industry applicable?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Is power-transmission apparatus involved?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
    ],
    exclusionRules: [
      {
        reason: "Excluded when selected scope is MSHA-only.",
        keywordsAny: ["msha only", "mine site", "30 cfr"],
      },
    ],
    crossDomainLinks: ["Machine Guarding"],
  },
  {
    citation: "29 CFR 1910.147",
    agency: "OSHA",
    scope: "osha-general-industry",
    part: "1910",
    subpart: "J",
    title: "The control of hazardous energy",
    plainLanguageSummary:
      "Servicing and maintenance activities require control of hazardous energy to prevent unexpected energization, startup, or release of stored energy.",
    hazardFamilies: ["Lockout / Stored Energy"],
    equipmentTags: [
      "machine",
      "equipment",
      "conveyor",
      "press",
      "motor",
      "mechanical equipment",
    ],
    taskTags: [
      "servicing",
      "maintenance",
      "repair",
      "cleaning",
      "jam clearing",
      "adjustment",
    ],
    exposureTags: [
      "unexpected startup",
      "energization",
      "stored energy",
      "hazardous energy",
    ],
    controlTags: [
      "lockout",
      "tagout",
      "energy isolation",
      "zero energy verification",
    ],
    consequenceTags: ["caught-in", "crushing", "electrocution", "fatality"],
    searchBoostTerms: [
      "lockout",
      "tagout",
      "loto",
      "unexpected startup",
      "stored energy",
      "servicing",
    ],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "critical",
    evidenceRequirements: [
      {
        question: "Is OSHA General Industry applicable?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Was servicing or maintenance being performed?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question:
          "Could unexpected energization, startup, or stored energy release occur?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
    ],
    exclusionRules: [
      {
        reason:
          "Normal production operation without servicing or maintenance may not trigger LOTO.",
        excludeWhenMissingAny: [
          "maintenance",
          "servicing",
          "repair",
          "cleaning",
          "jam",
          "adjustment",
        ],
      },
    ],
    crossDomainLinks: ["Machine Guarding", "Electrical"],
  },
  {
    citation: "29 CFR 1926.501",
    agency: "OSHA",
    scope: "osha-construction",
    part: "1926",
    subpart: "M",
    title: "Duty to have fall protection",
    plainLanguageSummary:
      "Construction employers must provide fall protection where employees are exposed to fall hazards at applicable elevations or conditions.",
    hazardFamilies: ["Fall Protection", "Walking/Working Surfaces"],
    equipmentTags: [
      "roof",
      "scaffold",
      "ladder",
      "platform",
      "floor opening",
      "edge",
    ],
    taskTags: ["construction", "roofing", "elevated work", "scaffold work"],
    exposureTags: [
      "unprotected edge",
      "floor hole",
      "elevation",
      "fall distance",
    ],
    controlTags: [
      "guardrail",
      "fall arrest",
      "fall restraint",
      "cover",
      "warning line",
    ],
    consequenceTags: ["fall", "fatality", "fracture"],
    searchBoostTerms: [
      "fall protection",
      "unprotected edge",
      "floor hole",
      "guardrail",
      "six feet",
    ],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "critical",
    evidenceRequirements: [
      {
        question: "Is construction work occurring?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "What is the fall height or exposure condition?",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
    ],
    exclusionRules: [
      {
        reason: "Construction scope not established.",
        excludeWhenMissingAny: [
          "construction",
          "1926",
          "roofing",
          "scaffold",
          "contractor",
        ],
      },
    ],
    crossDomainLinks: ["Scaffolds", "Ladders", "Walking/Working Surfaces"],
  },
  // ---- Added 2026-08-18 (inspection-context closure). Each of the four records below backs a
  // rule added to evidence-foundation.ts evaluate() the same day. Titles are the section /
  // paragraph headings published on osha.gov (fetched 2026-08-18; see
  // verification/insite-core-closure-standards-validation-2026-08-18/CONSTRUCTION_RULE_SOURCES.md
  // for the captured regulatory text). plainLanguageSummary is, per this catalog's convention, a
  // HazLenz-authored plain-language summary of that captured text -- it is labelled as such in the
  // UI and is never presented as verbatim regulation language.
  {
    citation: "29 CFR 1926.59",
    agency: "OSHA",
    scope: "osha-construction",
    part: "1926",
    subpart: "D",
    title: "Hazard Communication",
    plainLanguageSummary:
      "The hazard communication requirements applicable to construction work under 29 CFR 1926.59 are identical to those set forth at 29 CFR 1910.1200: containers of hazardous chemicals in the workplace must be labeled with the product identifier and hazard information, and employers must maintain the hazard communication program, safety data sheets, and training that 1910.1200 requires.",
    hazardFamilies: ["Hazard Communication", "Chemical Exposure"],
    equipmentTags: ["container", "drum", "bottle", "solvent", "chemical"],
    taskTags: ["construction", "painting", "coating", "chemical handling"],
    exposureTags: ["unlabeled container", "unknown contents", "hazard label missing"],
    controlTags: ["label", "safety data sheet", "hazard communication program", "training"],
    consequenceTags: ["chemical exposure", "misidentification"],
    searchBoostTerms: ["hazard communication", "unlabeled", "no label", "1926.59", "1910.1200", "construction chemical"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "high",
    sourceUrl: "https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.59",
    retrievalDate: "2026-08-18",
    evidenceRequirements: [
      { question: "Is construction work occurring?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Is a workplace chemical container missing identity or hazard labeling?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "Construction scope not established.", excludeWhenMissingAny: ["construction", "1926", "jobsite", "contractor"] },
    ],
    crossDomainLinks: ["Chemical Exposure", "SDS Labeling"],
  },
  {
    citation: "29 CFR 1926.52",
    agency: "OSHA",
    scope: "osha-construction",
    part: "1926",
    subpart: "D",
    title: "Occupational noise exposure",
    plainLanguageSummary:
      "In construction, protection against the effects of noise exposure must be provided when sound levels exceed those in Table D-2 of 29 CFR 1926.52 measured on the A-scale at slow response (90 dBA for an 8-hour duration); when employees are subjected to sound levels exceeding Table D-2, feasible administrative or engineering controls must be used, and where sound levels exceed the table values a continuing, effective hearing conservation program must be administered.",
    hazardFamilies: ["Noise Exposure", "Occupational Health"],
    equipmentTags: ["saw", "jackhammer", "generator", "compressor", "demolition equipment"],
    taskTags: ["construction", "demolition", "concrete cutting", "heavy equipment operation"],
    exposureTags: ["noise exposure", "dBA", "time-weighted average", "hearing loss"],
    controlTags: ["engineering controls", "administrative controls", "hearing protection", "hearing conservation program"],
    consequenceTags: ["hearing loss"],
    searchBoostTerms: ["noise", "dBA", "TWA", "Table D-2", "90 dBA", "hearing conservation", "1926.52"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "high",
    sourceUrl: "https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.52",
    retrievalDate: "2026-08-18",
    evidenceRequirements: [
      { question: "Is construction work occurring?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "What is the measured full-shift (8-hour) sound level in dBA?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "Construction scope not established.", excludeWhenMissingAny: ["construction", "1926", "jobsite", "contractor"] },
    ],
    crossDomainLinks: ["Personal Protective Equipment"],
  },
  {
    citation: "29 CFR 1926.416(a)(1)",
    agency: "OSHA",
    scope: "osha-construction",
    part: "1926",
    subpart: "K",
    title: "Electrical safety-related work practices - General requirements: protection of employees from contact with electric power circuits",
    plainLanguageSummary:
      "No employer may permit an employee to work in such proximity to any part of an electric power circuit that the employee could contact the circuit in the course of work, unless the employee is protected against electric shock by deenergizing the circuit and grounding it, or by guarding it effectively by insulation or other means (29 CFR 1926.416(a)(1)).",
    hazardFamilies: ["Electrical", "Electric Shock"],
    equipmentTags: ["extension cord", "cord", "circuit", "conductor", "temporary power", "power tool"],
    taskTags: ["construction", "temporary wiring", "power tool use"],
    exposureTags: ["exposed conductor", "energized circuit", "contact with electric power circuit"],
    controlTags: ["deenergize and ground", "insulation", "guarding", "GFCI"],
    consequenceTags: ["electric shock", "electrocution"],
    searchBoostTerms: ["exposed conductors", "energized", "electric power circuit", "1926.416", "damaged cord construction"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "critical",
    sourceUrl: "https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.416",
    retrievalDate: "2026-08-18",
    evidenceRequirements: [
      { question: "Is construction work occurring?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Could an employee contact part of an energized electric power circuit that is not deenergized/grounded or effectively guarded?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "Construction scope not established.", excludeWhenMissingAny: ["construction", "1926", "jobsite", "contractor"] },
    ],
    crossDomainLinks: ["Electrical"],
  },
  {
    citation: "29 CFR 1926.300(b)(2)",
    agency: "OSHA",
    scope: "osha-construction",
    part: "1926",
    subpart: "I",
    title: "Tools - Hand and Power, General requirements - Guarding: moving parts of equipment exposed to contact",
    plainLanguageSummary:
      "Belts, gears, shafts, pulleys, sprockets, spindles, drums, fly wheels, chains, or other reciprocating, rotating or moving parts of equipment must be guarded if such parts are exposed to contact by employees or otherwise create a hazard (29 CFR 1926.300(b)(2)); power operated tools designed to accommodate guards must be equipped with such guards when in use ((b)(1)).",
    hazardFamilies: ["Machine Guarding", "Caught-In/Between"],
    equipmentTags: ["belt", "pulley", "gear", "shaft", "sprocket", "flywheel", "chain", "mixer", "saw", "power tool"],
    taskTags: ["construction", "equipment operation", "power tool use"],
    exposureTags: ["moving part exposed", "guard missing", "contact with moving parts"],
    controlTags: ["guard", "guarding"],
    consequenceTags: ["caught-in", "amputation", "entanglement"],
    searchBoostTerms: ["guard missing", "unguarded", "belt", "pulley", "moving parts", "1926.300"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "critical",
    sourceUrl: "https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.300",
    retrievalDate: "2026-08-18",
    evidenceRequirements: [
      { question: "Is construction work occurring?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Is a moving part of equipment exposed to employee contact with its guard absent or ineffective?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "Construction scope not established.", excludeWhenMissingAny: ["construction", "1926", "jobsite", "contractor"] },
    ],
    crossDomainLinks: ["Machine Guarding"],
  },
  {
    citation: "29 CFR 1926.34(a)",
    agency: "OSHA",
    scope: "osha-construction",
    part: "1926",
    subpart: "C",
    title: "Means of egress - General",
    plainLanguageSummary:
      "In every building or structure on a construction site, exits must be so arranged and maintained as to provide free and unobstructed egress from all parts of the building or structure at all times when it is occupied (29 CFR 1926.34(a)); means of egress must be continually maintained free of all obstructions or impediments to full instant use in case of fire or other emergency (1926.34(c)).",
    hazardFamilies: ["Emergency Egress", "Fire Protection"],
    equipmentTags: ["exit", "exit door", "egress route", "stairway", "building"],
    taskTags: ["construction", "occupied structure", "renovation"],
    exposureTags: ["blocked exit", "locked exit", "obstructed egress"],
    controlTags: ["unobstructed egress", "unlocked exit", "exit marking"],
    consequenceTags: ["entrapment", "fire", "delayed evacuation"],
    searchBoostTerms: ["egress", "exit blocked", "exit locked", "chained", "obstructed", "1926.34"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "high",
    sourceUrl: "https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.34",
    retrievalDate: "2026-08-18",
    evidenceRequirements: [
      { question: "Is construction work occurring in an occupied building or structure?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Is a required exit or egress route locked, blocked, or obstructed?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "Construction scope not established.", excludeWhenMissingAny: ["construction", "1926", "jobsite", "contractor"] },
    ],
    crossDomainLinks: ["Fire Protection"],
  },
  {
    citation: "30 CFR 62.120",
    agency: "MSHA",
    scope: "mining",
    part: "62",
    subpart: "B",
    title: "Action level",
    plainLanguageSummary:
      "If during any work shift a miner's noise exposure equals or exceeds the action level (an 8-hour time-weighted average sound level of 85 dBA, or equivalently a dose of 50 percent, per 30 CFR 62.101), the mine operator must enroll the miner in a hearing conservation program that complies with 30 CFR 62.150.",
    hazardFamilies: ["Noise Exposure", "Occupational Health"],
    equipmentTags: ["crusher", "screen", "mill", "haul truck", "drill", "compressor"],
    taskTags: ["mining", "crushing", "screening", "drilling"],
    exposureTags: ["noise exposure", "dBA", "TWA8", "dose", "hearing loss"],
    controlTags: ["hearing conservation program", "audiometric testing", "hearing protection"],
    consequenceTags: ["hearing loss"],
    searchBoostTerms: ["noise", "dBA", "TWA", "action level", "85 dBA", "hearing conservation", "62.120"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "high",
    sourceUrl: "https://www.govinfo.gov/content/pkg/CFR-2023-title30-vol1/xml/CFR-2023-title30-vol1-part62.xml",
    retrievalDate: "2026-08-18",
    evidenceRequirements: [
      { question: "Is this an MSHA-regulated mine?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "What is the miner's measured 8-hour TWA (dBA) or dose?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "MSHA scope not established.", excludeWhenMissingAny: ["mine", "miner", "quarry", "MSHA", "30 CFR"] },
    ],
    crossDomainLinks: ["Personal Protective Equipment"],
  },
  {
    citation: "30 CFR 62.130",
    agency: "MSHA",
    scope: "mining",
    part: "62",
    subpart: "B",
    title: "Permissible exposure level",
    plainLanguageSummary:
      "The mine operator must assure that no miner is exposed during any work shift to noise that exceeds the permissible exposure level (a TWA8 of 90 dBA, or equivalently a dose of 100 percent, per 30 CFR 62.101). If a miner's exposure exceeds the permissible exposure level, the operator must use all feasible engineering and administrative controls to reduce the exposure to the permissible exposure level and enroll the miner in a hearing conservation program that complies with 30 CFR 62.150; no miner may be exposed at any time to sound levels exceeding 115 dBA.",
    hazardFamilies: ["Noise Exposure", "Occupational Health"],
    equipmentTags: ["crusher", "screen", "mill", "haul truck", "drill", "compressor"],
    taskTags: ["mining", "crushing", "screening", "drilling"],
    exposureTags: ["noise exposure", "dBA", "TWA8", "dose", "hearing loss"],
    controlTags: ["engineering controls", "administrative controls", "hearing conservation program", "hearing protection"],
    consequenceTags: ["hearing loss"],
    searchBoostTerms: ["noise", "dBA", "TWA", "permissible exposure level", "90 dBA", "62.130"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "high",
    sourceUrl: "https://www.govinfo.gov/content/pkg/CFR-2023-title30-vol1/xml/CFR-2023-title30-vol1-part62.xml",
    retrievalDate: "2026-08-18",
    evidenceRequirements: [
      { question: "Is this an MSHA-regulated mine?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "What is the miner's measured 8-hour TWA (dBA) or dose?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "MSHA scope not established.", excludeWhenMissingAny: ["mine", "miner", "quarry", "MSHA", "30 CFR"] },
    ],
    crossDomainLinks: ["Personal Protective Equipment"],
  },
  {
    citation: "30 CFR 47.41(a)",
    agency: "MSHA",
    scope: "mining",
    part: "47",
    subpart: "E",
    title: "Requirement for container labels",
    plainLanguageSummary:
      "The mine operator must ensure that each container of a hazardous chemical has a label (30 CFR 47.41(a)); missing or unreadable labels must be replaced immediately and existing container labels must not be removed or defaced.",
    hazardFamilies: ["Hazard Communication", "Chemical Exposure"],
    equipmentTags: ["container", "drum", "bottle", "solvent", "chemical", "tank"],
    taskTags: ["mining", "chemical handling", "maintenance"],
    exposureTags: ["unlabeled container", "unknown contents", "hazard label missing"],
    controlTags: ["label", "safety data sheet", "HazCom program", "training"],
    consequenceTags: ["chemical exposure", "misidentification"],
    searchBoostTerms: ["hazard communication", "unlabeled", "no label", "container label", "47.41", "MSHA HazCom"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "high",
    sourceUrl: "https://www.govinfo.gov/content/pkg/CFR-2023-title30-vol1/xml/CFR-2023-title30-vol1-part47.xml",
    retrievalDate: "2026-08-18",
    evidenceRequirements: [
      { question: "Is this an MSHA-regulated mine?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Is a container of a hazardous chemical missing its label?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "MSHA scope not established.", excludeWhenMissingAny: ["mine", "miner", "quarry", "MSHA", "30 CFR"] },
    ],
    crossDomainLinks: ["Chemical Exposure", "SDS Labeling"],
  },
  {
    citation: "29 CFR 1910.132(a)",
    agency: "OSHA",
    scope: "osha-general-industry",
    part: "1910",
    subpart: "I",
    title: "Personal protective equipment - General requirements",
    plainLanguageSummary: "General personal protective equipment (PPE) criteria and provision standards may be relevant when an active operational hazard is present, requiring qualified review of body part exposure, specific task context, and whether proper protective gear was worn or observed missing.",
    hazardFamilies: ["Personal Protective Equipment", "PPE"],
    equipmentTags: ["ppe", "glasses", "goggles", "shield", "boot", "shoe", "helmet", "earplug", "earmuff", "gloves"],
    taskTags: ["decanting", "chemical handling", "grinding", "welding", "cutting", "maintenance", "jackhammering"],
    exposureTags: ["splash", "flying particles", "chemical", "noise", "dust", "impact", "injury"],
    controlTags: ["ppe", "safety glasses", "goggles", "face shield", "safety boots", "steel toe", "earplugs", "earmuffs", "hard hat", "gloves"],
    consequenceTags: ["injury", "chemical burn", "impact", "hearing loss", "blindness"],
    searchBoostTerms: ["ppe", "glasses", "goggles", "shield", "face shield", "decanting", "chemical", "jackhammer", "earplugs", "safety glasses", "safety boots", "boots", "hearing protection"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "medium",
    evidenceRequirements: [
      {
        question: "Requires confirmation of whether the designated task or environment presents a physical, chemical, noise, or particle impact hazard.",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Requires confirmation of the specific exposure route or affected body part (e.g., eyes, face, head, feet, hearing, hands).",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Supports qualified review of whether the proper personal protective equipment was missing, inadequate, damaged, unavailable, or not observed.",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Requires confirmation of whether other protective barriers or engineering controls (e.g., local ventilation, physical shields) are present.",
        requiredForPrimary: false,
        missingEvidenceImpact: "low",
      },
      {
        question: "Supports qualified review of whether MSHA, OSHA General Industry, or OSHA Construction jurisdiction applies.",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      }
    ],
    exclusionRules: [],
    crossDomainLinks: ["Industrial Hygiene", "Chemical Hazards", "Welding / Hot Work"],
  },
  {
    citation: "29 CFR 1926.95(a)",
    agency: "OSHA",
    scope: "osha-construction",
    part: "1926",
    subpart: "E",
    title: "Criteria for personal protective equipment",
    plainLanguageSummary: "Construction personal protective equipment (PPE) criteria and provision standards may be relevant when an active construction-phase operational hazard is present, requiring qualified review of body part exposure, specific construction task context, and whether proper protective gear was worn or observed missing.",
    hazardFamilies: ["Personal Protective Equipment", "PPE"],
    equipmentTags: ["ppe", "glasses", "goggles", "shield", "boot", "shoe", "helmet", "earplug", "earmuff", "gloves"],
    taskTags: ["construction", "jackhammering", "drilling", "grinding", "welding", "cutting", "demolition"],
    exposureTags: ["exposure", "splash", "flying particles", "noise", "dust", "impact", "injury"],
    controlTags: ["ppe", "safety glasses", "safety boots", "steel toe", "earplugs", "earmuffs", "hard hat", "gloves"],
    consequenceTags: ["injury", "impact", "hearing loss", "laceration"],
    searchBoostTerms: ["ppe", "safety glasses", "jackhammer", "safety boots", "earplugs", "construction", "goggles", "hearing protection"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "medium",
    evidenceRequirements: [
      {
        question: "Requires confirmation of whether the designated task or environment presents a physical, chemical, noise, or particle impact hazard.",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Requires confirmation of the specific exposure route or affected body part (e.g., eyes, face, head, feet, hearing, hands).",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Supports qualified review of whether the proper personal protective equipment was missing, inadequate, damaged, unavailable, or not observed.",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Requires confirmation of whether other protective barriers or engineering controls (e.g., local ventilation, physical shields) are present.",
        requiredForPrimary: false,
        missingEvidenceImpact: "low",
      },
      {
        question: "Supports qualified review of whether MSHA, OSHA General Industry, or OSHA Construction jurisdiction applies.",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      }
    ],
    exclusionRules: [],
    crossDomainLinks: ["Scaffolds", "Tools - Hand and Power", "Welding / Hot Work"],
  },
  {
    citation: "30 CFR 56.15006",
    agency: "MSHA",
    scope: "mining",
    part: "56",
    subpart: "N",
    title: "Protective equipment - clothing",
    plainLanguageSummary: "MSHA surface mining special protective equipment and clothing standards may be relevant when an active mining operational hazard is present, requiring qualified review of body part exposure, specific mining task context, and whether proper protective gear was worn or observed missing.",
    hazardFamilies: ["Personal Protective Equipment", "PPE"],
    equipmentTags: ["ppe", "glasses", "goggles", "shield", "boot", "shoe", "helmet", "earplug", "earmuff", "gloves"],
    taskTags: ["mining", "crushing", "drilling", "maintenance", "operation", "welding"],
    exposureTags: ["exposure", "flying particles", "noise", "dust", "impact", "injury"],
    controlTags: ["ppe", "safety glasses", "earplugs", "earmuffs", "hard hat", "gloves", "safety boots"],
    consequenceTags: ["injury", "impact", "hearing loss"],
    searchBoostTerms: ["ppe", "safety glasses", "miner", "earplugs", "earmuffs", "crushing", "goggles", "hearing protection"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "medium",
    evidenceRequirements: [
      {
        question: "Requires confirmation of whether the designated task or environment presents a physical, chemical, noise, or particle impact hazard.",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Requires confirmation of the specific exposure route or affected body part (e.g., eyes, face, head, feet, hearing, hands).",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Supports qualified review of whether the proper personal protective equipment was missing, inadequate, damaged, unavailable, or not observed.",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Requires confirmation of whether other protective barriers or engineering controls (e.g., local ventilation, physical shields) are present.",
        requiredForPrimary: false,
        missingEvidenceImpact: "low",
      },
      {
        question: "Supports qualified review of whether MSHA, OSHA General Industry, or OSHA Construction jurisdiction applies.",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      }
    ],
    exclusionRules: [],
    crossDomainLinks: ["Workplace Examination", "Ground Control", "Powered Haulage"],
  },
  {
    citation: "29 CFR 1910.178(p)(1)",
    agency: "OSHA",
    scope: "osha-general-industry",
    part: "1910",
    subpart: "N",
    // Verified against OSHA's own published text (osha.gov): paragraph (p) is
    // "Operation of the truck," and (p)(1) specifically requires a powered
    // industrial truck found to be in need of repair, defective, or in any
    // way unsafe to be taken out of service until restored to safe operating
    // condition. "General requirements" is actually paragraph (a) of this
    // same section -- a different provision -- and was corrected here rather
    // than left pointing at the wrong regulatory text.
    title: "Powered industrial trucks - Operation of the truck: removing unsafe or defective trucks from service",
    plainLanguageSummary: "General industry powered industrial truck safety criteria may be relevant when defects or unsafe conditions are observed on an operating forklift, requiring qualified review of equipment condition, task safety, and operator controls.",
    hazardFamilies: ["Powered Industrial Trucks", "PIT", "Mobile Equipment"],
    equipmentTags: ["forklift", "truck", "loader", "vehicle", "lift", "brakes", "controls"],
    taskTags: ["traveling", "loading", "unloading", "operating", "moving", "transporting"],
    exposureTags: ["leak", "defective", "fluid", "pedestrian", "interaction", "struck by", "strike"],
    controlTags: ["inspect", "maintenance", "taking out of service", "horns", "alarms", "spotter"],
    consequenceTags: ["injury", "crush", "impact", "fatality"],
    searchBoostTerms: ["forklift", "hydraulic", "leak", "fluid", "defective", "pedestrians", "pedestrian", "brakes", "horns", "alarms", "out of service"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "medium",
    evidenceRequirements: [
      {
        question: "Requires confirmation of whether MSHA, OSHA General Industry, or OSHA Construction jurisdiction applies.",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Requires confirmation of the active equipment category (forklift, earthmoving loader, haul truck, etc.).",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Requires confirmation of the specific defective or unsafe condition observed (e.g., leaking hydraulic fluid, compromised brakes, or missing horn).",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Requires confirmation of whether pedestrians or other workers are exposed in close proximity to the vehicle's travel path.",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Supports qualified review of whether other safety controls (such as regular pre-shift inspection logs or dedicated pedestrian lanes) are active.",
        requiredForPrimary: false,
        missingEvidenceImpact: "low",
      }
    ],
    exclusionRules: [],
    crossDomainLinks: ["Workplace Examination", "Powered Haulage", "Ground Control"],
  },
  {
    citation: "29 CFR 1926.602(a)(9)(ii)",
    agency: "OSHA",
    scope: "osha-construction",
    part: "1926",
    subpart: "O",
    title: "Material handling equipment - Earthmoving equipment",
    plainLanguageSummary: "Construction mechanized earthmoving equipment standards may be relevant when a loader or backhoe with an obstructed rear view is operated in reverse, requiring qualified review of backup alarm functionality or spotter presence.",
    hazardFamilies: ["Earthmoving Equipment", "Mobile Equipment", "Material Handling"],
    equipmentTags: ["loader", "backhoe", "dozer", "grader", "scraper", "truck", "tractor"],
    taskTags: ["backing", "reversing", "operating", "excavating", "loading", "grading"],
    exposureTags: ["obstructed view", "blind spot", "pedestrian", "interaction", "struck by", "worker"],
    controlTags: ["reverse alarm", "backup alarm", "spotter", "signalman", "barricade"],
    consequenceTags: ["injury", "crush", "impact", "runover", "fatality"],
    searchBoostTerms: ["loader", "back-up", "reverse", "backup alarm", "alarm", "spotter", "obstructed", "blind spot", "signal"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "medium",
    evidenceRequirements: [
      {
        question: "Requires confirmation of whether MSHA, OSHA General Industry, or OSHA Construction jurisdiction applies.",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Requires confirmation of the active equipment category (forklift, earthmoving loader, haul truck, etc.).",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Requires confirmation of whether the vehicle is operating in reverse and has an obstructed view to the rear.",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Requires confirmation of whether an audible reverse signal alarm is present and fully functional, or if a designated spotter/signalman is present.",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Supports qualified review of whether other safety controls (such as regular pre-shift inspection logs or dedicated pedestrian lanes) are active.",
        requiredForPrimary: false,
        missingEvidenceImpact: "low",
      }
    ],
    exclusionRules: [],
    crossDomainLinks: ["Workplace Examination", "Powered Haulage", "Ground Control"],
  },
  {
    citation: "30 CFR 56.9100(a)",
    agency: "MSHA",
    scope: "mining",
    part: "56",
    subpart: "H",
    title: "Rules of the road - Traffic control",
    plainLanguageSummary: "Surface mining traffic safety and right-of-way rules may be relevant on active haulage roads and mine properties, requiring qualified review of speed limits, signs, and vehicle traffic coordination.",
    hazardFamilies: ["Traffic Control", "Rules of the Road", "Powered Haulage", "Mobile Equipment"],
    equipmentTags: ["haul truck", "loader", "dozer", "grader", "utility vehicle", "pickup"],
    taskTags: ["hauling", "traveling", "dumping", "operating", "driving"],
    exposureTags: ["congested", "dust", "collision", "right of way", "headlights", "berm"],
    controlTags: ["speed limits", "signs", "stop sign", "yield sign", "traffic plan", "radio"],
    consequenceTags: ["collision", "run-off", "rollover", "fatality"],
    searchBoostTerms: ["haul truck", "congested", "mine roads", "speed", "right-of-way", "signs", "signage", "rules of the road", "headlights"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "high",
    evidenceRequirements: [
      {
        question: "Requires confirmation of whether MSHA, OSHA General Industry, or OSHA Construction jurisdiction applies.",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Requires confirmation of the active equipment category (forklift, earthmoving loader, haul truck, etc.).",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Requires confirmation of whether traffic rules governing speed, right-of-way, and direction of movement have been formally established.",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Requires confirmation of whether appropriate traffic control signs (speed limits, stop/yield signs) are posted and visible on haulage roads.",
        requiredForPrimary: true,
        missingEvidenceImpact: "high",
      },
      {
        question: "Supports qualified review of whether other safety controls (such as regular pre-shift inspection logs or dedicated pedestrian lanes) are active.",
        requiredForPrimary: false,
        missingEvidenceImpact: "low",
      }
    ],
    exclusionRules: [],
    crossDomainLinks: ["Workplace Examination", "Ground Control", "Powered Haulage"],
  },
];

export const STANDARDS_INTELLIGENCE_SEED: StandardsIntelligenceRecord[] =
  RAW_STANDARDS_INTELLIGENCE_SEED.map(withSourceRegistryMetadata);
