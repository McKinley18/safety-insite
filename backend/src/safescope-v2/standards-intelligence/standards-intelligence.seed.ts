import { StandardsIntelligenceRecord } from "./standards-intelligence.types";
import { buildSourceRegistryMetadata } from "../../safescope-knowledge/sources/source-registry-metadata";
import { V1_STANDARDS_EXPANSION } from "./standards-intelligence.v1-expansion";

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
    // KG-3E remediation (Phase 2). KG-3D classified this CONTENT_DIFF_REQUIRED because the stored
    // text omits 56.14107(b), the seven-foot exemption that materially limits the rule. That is
    // correct, and it is a subtler defect than it looks: the citation is the PARAGRAPH (a), and
    // paragraph (a) genuinely does not contain the exemption -- (b) does. So the stored text was
    // not wrong about (a); it was wrong about the law, because a reader shown (a) alone concludes
    // that guarding is always required. The fix is the technique KG-3D used for 1910.36/1910.37:
    // state (a) accurately and NAME the limiting sibling paragraph rather than silently absorbing
    // or silently omitting it.
    //
    // The prior text was also broader than the regulation in a way that matters for selection. It
    // said parts must be guarded where they "create contact, pinch-point, entanglement, or
    // caught-in exposure" -- HazLenz taxonomy vocabulary, not MSHA's. The regulation enumerates the
    // covered parts and limits the catch-all to "similar moving parts that can cause injury". The
    // enumeration and that qualifier are restored.
    //
    // `title` is the SECTION heading; MSHA gives paragraph (a) no separate heading of its own, so
    // the section heading is the only codified heading available. The summary is explicit about
    // which paragraph states which rule so the granularity stays truthful.
    citation: "30 CFR 56.14107(a)",
    agency: "MSHA",
    scope: "mining",
    part: "56",
    subpart: "M",
    title: "Moving machine parts",
    plainLanguageSummary:
      "Moving machine parts must be guarded to protect persons from contacting gears, sprockets, chains, drive, head, tail and takeup pulleys, flywheels, couplings, shafts, fan blades, and similar moving parts that can cause injury (30 CFR 56.14107(a)). That duty is limited by the next paragraph: guards are not required where the exposed moving parts are at least seven feet away from walking or working surfaces (30 CFR 56.14107(b)). Distance from a walking or working surface is therefore part of establishing whether the guarding requirement applies at all, not merely a mitigating factor.",
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
    sourceUrl:
      "https://www.ecfr.gov/current/title-30/chapter-I/subchapter-N/part-56/subpart-M/section-56.14107",
    retrievalDate: "2026-08-20",
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
    // KG-3E Phase 5. Also SOURCE_REFRESH_REQUIRED under KG-3D, and also carrying a content defect
    // that only became visible once a source was attached. The stored text hedged with "where
    // applicable" -- not in the rule -- and omitted three of the section's four duties: the warning
    // notice posted at the power switch, the requirement that it be SIGNED by the individuals doing
    // the work, and the restriction on who may remove the locks.
    citation: "30 CFR 56.12016",
    agency: "MSHA",
    scope: "msha",
    part: "56",
    subpart: "K",
    title: "Work on electrically powered equipment",
    plainLanguageSummary:
      "Electrically powered equipment must be deenergized before mechanical work is done on it, and power switches must be locked out or other measures taken that will prevent the equipment from being energized without the knowledge of the individuals working on it. Suitable warning notices must be posted at the power switch and signed by the individuals who are to do the work, and such locks or preventive devices may be removed only by the persons who installed them or by authorized personnel (30 CFR 56.12016).",
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
    sourceUrl:
      "https://www.ecfr.gov/current/title-30/chapter-I/subchapter-N/part-56/subpart-M/section-56.12016",
    retrievalDate: "2026-08-20",
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
    // KG-3E Phase 5. Accurate as written but unreviewable without a source, and thin: it omitted the
    // guarding-method examples the rule itself gives and the (a)(2) rule that a guard must not create
    // a hazard of its own. Provenance attached and the operative content completed.
    citation: "1910.212(a)(1)",
    agency: "OSHA",
    scope: "osha-general-industry",
    part: "1910",
    subpart: "O",
    title: "Machine guarding - types of guarding methods",
    plainLanguageSummary:
      "One or more methods of machine guarding must be provided to protect the operator and other employees in the machine area from hazards such as those created by point of operation, ingoing nip points, rotating parts, and flying chips and sparks; the rule gives barrier guards, two-hand tripping devices and electronic safety devices as examples of guarding methods (29 CFR 1910.212(a)(1)). Guards must be affixed to the machine where possible and secured elsewhere if attachment to the machine is not possible, and the guard must not itself offer an accident hazard (1910.212(a)(2)). Point-of-operation guarding requirements are addressed separately at 1910.212(a)(3).",
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
    sourceUrl:
      "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1910/subpart-O/section-1910.212",
    retrievalDate: "2026-08-20",
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
    // KG-3E remediation (Phase 2). KG-3D classified this CONTENT_DIFF_REQUIRED on two grounds and
    // both were confirmed against the source: the title dropped the codified "(lockout/tagout)"
    // parenthetical, and the summary restated 1910.147(a)(3) PURPOSE language ("to prevent
    // unexpected energization...") rather than the operative duty. The operative duty is (c)(1) --
    // establish an energy control PROGRAM of procedures, training and periodic inspections -- and a
    // citation whose governed text never mentions a program cannot support a finding that the
    // employer lacked one.
    //
    // The scope limits matter as much as the duty here, because LOTO is the standard most often
    // cited where it does not apply. Three are stated explicitly: normal production operations are
    // outside the standard unless a guard is removed/bypassed or a body part enters the point of
    // operation or danger zone ((a)(2)(ii)); the minor-servicing exception for routine, repetitive,
    // integral work performed under alternative effective protection (Note to (a)(2)(ii)); and the
    // cord-and-plug exception ((a)(2)(iii)(A)). Construction and agriculture are excluded outright
    // ((a)(1)(ii)(A)) -- which is why the construction-regime record for this hazard family is a
    // different citation, and why cross-regime substitution here would be a legal error, not a
    // coverage improvement.
    citation: "29 CFR 1910.147",
    agency: "OSHA",
    scope: "osha-general-industry",
    part: "1910",
    subpart: "J",
    title: "The control of hazardous energy (lockout/tagout)",
    plainLanguageSummary:
      "Before any employee performs servicing or maintenance on a machine or equipment where unexpected energizing, start up, or release of stored energy could occur and cause injury, the employer must establish an energy control program consisting of energy control procedures, employee training and periodic inspections, and the machine or equipment must be isolated from its energy source and rendered inoperative (29 CFR 1910.147(c)(1)). Where an energy isolating device is capable of being locked out, the program must use lockout unless the employer can demonstrate that a tagout system provides full employee protection as set out in 1910.147(c)(3); where the device cannot be locked out, a tagout system must be used (1910.147(c)(2)). The standard covers servicing and maintenance, not normal production operations: work during normal production is covered only if an employee must remove or bypass a guard or other safety device, or must place part of the body into the point of operation or an associated danger zone (1910.147(a)(2)(ii)). Minor tool changes and adjustments and other minor servicing activities that are routine, repetitive and integral to production are excepted when performed under alternative measures providing effective protection (Note to 1910.147(a)(2)(ii)), and work on cord-and-plug connected equipment is excepted where unplugging controls the hazard and the plug is under the exclusive control of the employee performing the work (1910.147(a)(2)(iii)(A)). This standard does not cover construction or agriculture employment (1910.147(a)(1)(ii)(A)).",
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
    sourceUrl:
      "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1910/subpart-J/section-1910.147",
    retrievalDate: "2026-08-20",
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
    // KG-3E remediation (Phase 2). KG-3D classified this CONTENT_DIFF_REQUIRED and refused to
    // approve it: "fall protection... at applicable elevations or conditions" names a topic but
    // states no requirement. It omits the 6-foot trigger, which is the operative fact in nearly
    // every construction fall finding, and it omits the three permitted system types entirely.
    // This is the most-emitted citation in the product, so the thinness was doing the most damage
    // here of anywhere in the corpus.
    //
    // The replacement states the operative rule and preserves the qualifications that limit it.
    // Two distinctions are deliberate and were checked against the source rather than assumed:
    //   * (b)(4)(i) is "MORE THAN 6 feet", not "6 feet or more" like (b)(1) and most of paragraph
    //     (b). Flattening the two into one threshold would misstate the law for holes.
    //   * (b)(4)(ii)-(iii) carry NO height threshold at all -- tripping into or stepping through a
    //     hole must be protected by covers regardless of the drop.
    // The scope carve-outs in 1926.500(a)(2) are named rather than absorbed, for the same reason
    // KG-3D named 1910.37(a)(3) in 1910.36: scaffolds, cranes, steel erection and ladders are
    // governed by their own subparts, and a fall finding on a scaffold is not a 1926.501 finding.
    citation: "29 CFR 1926.501",
    agency: "OSHA",
    scope: "osha-construction",
    part: "1926",
    subpart: "M",
    title: "Duty to have fall protection",
    plainLanguageSummary:
      "Construction employers must provide fall protection for employees exposed to falls, and all fall protection required by this section must conform to the criteria in 29 CFR 1926.502 (1926.501(a)(1)). The employer must first determine that the walking/working surfaces employees will work on have the strength and structural integrity to support them safely, and may allow work on those surfaces only when they do (1926.501(a)(2)). The general construction trigger is six feet: each employee on a walking/working surface with an unprotected side or edge 6 feet (1.8 m) or more above a lower level must be protected by a guardrail system, safety net system, or personal fall arrest system (1926.501(b)(1)), and the same 6-foot threshold governs steep roofs (1926.501(b)(11)) and any walking/working surface not otherwise addressed (1926.501(b)(15)). Two hole provisions differ and should not be flattened into the 6-foot rule: falling THROUGH a hole, including a skylight, must be protected where the hole is more than 6 feet above a lower level (1926.501(b)(4)(i)), while protection from tripping in or stepping into or through a hole, and from objects falling through it, is required by covers at ANY height (1926.501(b)(4)(ii)-(iii)). Fall protection for employees on scaffolds, cranes and derricks, steel erection, and stairways and ladders is governed by subparts L, CC, R and X respectively, not by this section (29 CFR 1926.500(a)(2)).",
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
    sourceUrl:
      "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1926/subpart-M/section-1926.501",
    retrievalDate: "2026-08-20",
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
    // KG-3D, Phases 9-11. HazLenz emits the SECTION `29 CFR 1910.303` for general-industry
    // exposed-live-parts findings, but the corpus held only the child paragraph
    // `1910.303(b)(1)`, so the emitted citation resolved to CITATION_ONLY.
    //
    // Adjudication -- CORPUS_TOO_NARROW, not a matching bug:
    //  * `1910.303(b)(1)` is the EXAMINATION rule ("Electric equipment shall be free from
    //    recognized hazards..."). The predicate HazLenz actually evaluates -- live parts,
    //    reachable/exposed, not guarded or deenergized -- is the GUARDING rule at
    //    `1910.303(g)(2)(i)`. They are different requirements, so letting the child answer for
    //    the parent by string prefix would have attached an examination requirement to a
    //    guarding finding. The hydrator's existing refusal to promote a subsectioned row into
    //    the base-key map is therefore correct and was left alone.
    //  * Promoting the EMITTED citation to `1910.303(g)(2)(i)` was considered and REJECTED:
    //    paragraph (g) applies only to equipment operating at 600 volts nominal or less to
    //    ground, and (g)(2)(i) only at 50 volts or more. No HazLenz predicate establishes
    //    voltage, so the finding evidence does not support the paragraph. Citing the section is
    //    what the evidence actually carries.
    //
    // The remedy is therefore to source the section-level content the product already intends to
    // cite. This adds corpus COVERAGE; it changes no citation-selection logic.
    citation: "29 CFR 1910.303",
    agency: "OSHA",
    scope: "osha-general-industry",
    part: "1910",
    subpart: "S",
    title: "Electrical - general requirements",
    plainLanguageSummary:
      "Section 1910.303 sets OSHA's general requirements for electric equipment and installations in general industry. Electric equipment must be free from recognized hazards that are likely to cause death or serious physical harm to employees (29 CFR 1910.303(b)(1)), and listed or labeled equipment must be installed and used in accordance with any instructions included in the listing or labeling (1910.303(b)(2)). For equipment operating at 600 volts, nominal, or less to ground: sufficient access and working space must be provided and maintained about all electric equipment to permit ready and safe operation and maintenance (1910.303(g)(1)); live parts of electric equipment operating at 50 volts or more must be guarded against accidental contact by approved cabinets or other approved enclosures, or by the other means that paragraph allows (1910.303(g)(2)(i)); and entrances to rooms and other guarded locations containing exposed live parts must be marked with conspicuous warning signs forbidding unqualified persons to enter (1910.303(g)(2)(iii)). Installations over 600 volts, nominal, are addressed separately at 1910.303(h).",
    hazardFamilies: ["Electrical", "Electric Shock"],
    equipmentTags: ["panel", "electrical panel", "junction box", "conductor", "cabinet", "enclosure", "disconnect"],
    taskTags: ["general industry", "facility operations", "electrical maintenance"],
    exposureTags: ["exposed live parts", "open panel", "missing cover", "energized equipment"],
    // Deliberately no bare "guard"/"guarding" token here. `suggest()` matches search terms with a
    // substring ILIKE over the whole concatenated keyword blob, so a "guard live parts" tag made
    // this electrical record match any observation containing the word "guard" -- it was returned
    // for "rotating shaft on the mixer has no guard", which is machine guarding (1910.212), not
    // electrical. The regulation's own verb is guarding "by use of approved cabinets or other
    // forms of approved enclosures", so the enclosure vocabulary carries the same meaning without
    // colliding with mechanical-guarding language.
    controlTags: ["enclose live parts", "install cover", "approved enclosure", "warning sign", "working space"],
    consequenceTags: ["electric shock", "electrocution", "arc flash"],
    searchBoostTerms: ["exposed live parts", "open electrical panel", "missing panel cover", "junction box open", "1910.303"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "critical",
    sourceUrl: "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1910/subpart-S/section-1910.303",
    retrievalDate: "2026-08-19",
    evidenceRequirements: [
      { question: "Is general-industry work occurring?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Are live parts of electric equipment exposed or reachable without being guarded by an approved enclosure or deenergized?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Is the operating voltage of the equipment known? Voltage determines which paragraph of 1910.303 applies and is required before citing a specific paragraph rather than the section.", requiredForPrimary: false, missingEvidenceImpact: "medium" },
    ],
    exclusionRules: [
      { reason: "General-industry scope not established.", excludeWhenMissingAny: ["1910", "general industry", "facility", "plant", "warehouse"] },
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
    // KG-3D remediation. This record previously existed ONLY in the starter seed
    // (safescope-standards.seed.ts), which carries no source fields at all, so finalization
    // synthesized `starter-unverified:osha:1910.36` for it -- the single placeholder-provenance
    // record HazLenz actually emits. Adding it here routes it through
    // withSourceRegistryMetadata(), giving it the registered `osha-ecfr-1910` tier-1 provenance
    // the other 22 records already carry, and the sync's normalized-citation matcher UPDATES the
    // existing row rather than inserting a duplicate ("1910.36" and "29 CFR 1910.36" both
    // normalize to "191036").
    //
    // The starter text also stated the law incorrectly: "Exit routes must be permanent,
    // unobstructed, and adequate for emergency egress." "Unobstructed" is NOT in 1910.36 -- it is
    // 1910.37(a)(3) ("Exit routes must be free and unobstructed"). 1910.36 is titled "Design and
    // construction requirements for exit routes" and covers permanence, number, discharge,
    // unlocked doors, side-hinged doors, capacity, height/width and outdoor routes. The summary
    // below is a HazLenz-authored paraphrase (per the P1 label-integrity contract, standards_master
    // never stores verbatim CFR text) verified paragraph by paragraph against the retrieved eCFR
    // source, and it names the neighbouring section rather than absorbing its requirement.
    citation: "29 CFR 1910.36",
    agency: "OSHA",
    scope: "osha-general-industry",
    part: "1910",
    subpart: "E",
    title: "Design and construction requirements for exit routes",
    plainLanguageSummary:
      "Exit routes in general industry must meet OSHA's design and construction requirements: each exit route must be a permanent part of the workplace (29 CFR 1910.36(a)(1)); at least two exit routes must normally be available and located as far apart as practical, with more required where the number of employees, size, occupancy or arrangement of the workplace demands it, and a single exit route permitted only where all employees could still evacuate safely (1910.36(b)); each exit discharge must lead directly outside or to a street, walkway, refuge area, public way or open space large enough for the occupants likely to use it (1910.36(c)); employees must be able to open an exit route door from the inside at all times without keys, tools or special knowledge (1910.36(d)(1)); and exit routes must meet minimum capacity, height and width requirements (1910.36(f), (g)). The separate requirement that exit routes be kept free and unobstructed is at 29 CFR 1910.37(a)(3), not in this section.",
    hazardFamilies: ["Emergency Egress", "Fire Protection"],
    equipmentTags: ["exit", "exit door", "exit route", "egress route", "stairway", "building"],
    taskTags: ["general industry", "occupied workplace", "facility operations"],
    exposureTags: ["blocked exit", "locked exit", "obstructed egress", "chained exit"],
    controlTags: ["clear exit route", "maintain egress", "unlock exit door", "unobstructed egress"],
    consequenceTags: ["entrapment", "fire", "delayed evacuation"],
    searchBoostTerms: ["exit", "egress", "exit route", "emergency exit", "exit blocked", "exit locked", "chained", "1910.36"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "critical",
    sourceUrl: "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1910/subpart-E/section-1910.36",
    retrievalDate: "2026-08-19",
    evidenceRequirements: [
      { question: "Is the workplace occupied by employees at the time observed?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Is a required exit route or exit route door locked, blocked, or otherwise unusable for emergency egress?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "General-industry scope not established.", excludeWhenMissingAny: ["1910", "general industry", "facility", "plant", "warehouse"] },
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
    // KG-3E Phase 5 provenance repair. This pointed at `govinfo.gov/.../CFR-2023-title30-vol1`,
    // the 2023 ANNUAL PRINT EDITION of 30 CFR. Two problems: the registered source for this
    // record is `msha-30-cfr-standards`, whose registry baseUrl is `ecfr.gov/current/title-30`,
    // so the recorded URL contradicted its own source registration; and KG-3D actually verified
    // this record against eCFR (its retained source-evidence file is an eCFR document), so the
    // URL did not name the source the review was performed against. The eCFR text was confirmed
    // byte-identical to what KG-3D retrieved, so this is a PROVENANCE repair, not a content change.
    //
    // It does NOT alter the record checksum. The release manifest projection
    // (RELEASE_MANIFEST_SELECT_COLUMNS) covers source_key but NOT source_url or retrieval_date, so
    // repointing the URL leaves the checksum -- and therefore any existing reviewer approval --
    // intact. That is convenient here but is itself a governance gap, recorded in
    // kg-3e/FINDING-approval-binding-excludes-source-url.md: a record's evidence pointer can be
    // changed after approval without the approval being re-examined.
    sourceUrl:
      "https://www.ecfr.gov/current/title-30/chapter-I/subchapter-O/part-62/subpart-B/section-62.120",
    retrievalDate: "2026-08-20",
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
    // KG-3E Phase 5 provenance repair. This pointed at `govinfo.gov/.../CFR-2023-title30-vol1`,
    // the 2023 ANNUAL PRINT EDITION of 30 CFR. Two problems: the registered source for this
    // record is `msha-30-cfr-standards`, whose registry baseUrl is `ecfr.gov/current/title-30`,
    // so the recorded URL contradicted its own source registration; and KG-3D actually verified
    // this record against eCFR (its retained source-evidence file is an eCFR document), so the
    // URL did not name the source the review was performed against. The eCFR text was confirmed
    // byte-identical to what KG-3D retrieved, so this is a PROVENANCE repair, not a content change.
    //
    // It does NOT alter the record checksum. The release manifest projection
    // (RELEASE_MANIFEST_SELECT_COLUMNS) covers source_key but NOT source_url or retrieval_date, so
    // repointing the URL leaves the checksum -- and therefore any existing reviewer approval --
    // intact. That is convenient here but is itself a governance gap, recorded in
    // kg-3e/FINDING-approval-binding-excludes-source-url.md: a record's evidence pointer can be
    // changed after approval without the approval being re-examined.
    sourceUrl:
      "https://www.ecfr.gov/current/title-30/chapter-I/subchapter-O/part-62/subpart-B/section-62.130",
    retrievalDate: "2026-08-20",
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
    // KG-3E Phase 5 provenance repair. This pointed at `govinfo.gov/.../CFR-2023-title30-vol1`,
    // the 2023 ANNUAL PRINT EDITION of 30 CFR. Two problems: the registered source for this
    // record is `msha-30-cfr-standards`, whose registry baseUrl is `ecfr.gov/current/title-30`,
    // so the recorded URL contradicted its own source registration; and KG-3D actually verified
    // this record against eCFR (its retained source-evidence file is an eCFR document), so the
    // URL did not name the source the review was performed against. The eCFR text was confirmed
    // byte-identical to what KG-3D retrieved, so this is a PROVENANCE repair, not a content change.
    //
    // It does NOT alter the record checksum. The release manifest projection
    // (RELEASE_MANIFEST_SELECT_COLUMNS) covers source_key but NOT source_url or retrieval_date, so
    // repointing the URL leaves the checksum -- and therefore any existing reviewer approval --
    // intact. That is convenient here but is itself a governance gap, recorded in
    // kg-3e/FINDING-approval-binding-excludes-source-url.md: a record's evidence pointer can be
    // changed after approval without the approval being re-examined.
    sourceUrl:
      "https://www.ecfr.gov/current/title-30/chapter-I/subchapter-G/part-47/subpart-D/section-47.41",
    retrievalDate: "2026-08-20",
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
    // KG-3E Phase 5. KG-3D classified this SOURCE_REFRESH_REQUIRED -- accurate but unreviewable for
    // want of a recorded source. Sourcing it exposed a second and worse defect: the stored text
    // ("may be relevant when defects... are observed, requiring qualified review") stated NO
    // requirement, and "may be relevant" is not regulatory language. The title already named the
    // duty -- removing unsafe or defective trucks from service -- but the summary never stated it.
    // Same failure mode as 1926.501, found only because a source was finally attached.
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
    plainLanguageSummary: "If at any time a powered industrial truck is found to be in need of repair, defective, or in any way unsafe, the truck must be taken out of service until it has been restored to safe operating condition (29 CFR 1910.178(p)(1)). The remaining paragraphs of 1910.178(p) address fuelling and fuel-system hazards: fuel tanks must not be filled while the engine is running and spillage must be avoided ((p)(2)); spilled oil or fuel must be carefully washed away or completely evaporated and the fuel tank cap replaced before restarting the engine ((p)(3)); no truck may be operated with a leak in the fuel system until the leak has been corrected ((p)(4)); and open flames must not be used for checking electrolyte level in storage batteries or gasoline level in fuel tanks ((p)(5)).",
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
    sourceUrl:
      "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1910/subpart-N/section-1910.178",
    retrievalDate: "2026-08-20",
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

  // ===========================================================================================
  // KG-3E, Phase 3 -- the citations HazLenz emits that had NO governed record at all.
  //
  // KG-3D measured seven of them and called them the largest single gap to cutover. Each was
  // adjudicated independently against the authoritative eCFR text and against the HazLenz
  // predicate that emits it; the adjudications are recorded in
  // verification/.../kg-3e/phase3-uncovered-citation-adjudications.md.
  //
  // SIX are added below. The seventh, `30 CFR 56.14132(a)`, is deliberately NOT added: paragraph
  // (a) governs manually-operated HORNS, while the predicate that emits it describes reversing
  // with no backup alarm and no spotter -- which is paragraph (b)(1). Backing the emitted citation
  // would put approved horn-maintenance text behind a backup-alarm finding. The truthful
  // section-level record is added instead, and the emitted paragraph is left resolving to nothing.
  //
  // Granularity discipline follows KG-3D's 1910.303 finding: a record is written at the paragraph
  // level ONLY where the predicate establishes every element that paragraph requires. Where a
  // paragraph carries a qualifier the observation does not establish, the record stays at section
  // level and NAMES the qualifier as something the finding must establish.
  // ===========================================================================================

  {
    // Paragraph-level is correct here: the predicate establishes construction regime, a scaffold,
    // 18 ft (clearing the "more than 10 feet" threshold), an employee on it, and no protection.
    // NOT promoted to (g)(1)(i)-(vii), which prescribe the system by scaffold TYPE -- the
    // observation does not establish scaffold type, so a roman-numeral citation would assert a
    // fact the evidence does not carry.
    citation: "29 CFR 1926.451(g)(1)",
    agency: "OSHA",
    scope: "osha-construction",
    part: "1926",
    subpart: "L",
    title: "General requirements — Fall protection",
    plainLanguageSummary:
      "Each employee on a scaffold more than 10 feet (3.1 m) above a lower level must be protected from falling to that lower level (29 CFR 1926.451(g)(1)). The type of protection required depends on the type of scaffold: 1926.451(g)(1)(i)-(vii) prescribe personal fall arrest systems, guardrail systems, or a combination, for each scaffold type, and fall protection for scaffold erectors and dismantlers is addressed separately at 1926.451(g)(2). Fall protection for employees installing suspension scaffold support systems on floors, roofs and other elevated surfaces is governed by subpart M rather than this paragraph (Note to 1926.451(g)(1)).",
    hazardFamilies: ["Fall Protection", "Scaffolds"],
    equipmentTags: ["scaffold", "scaffold platform", "guardrail", "toeboard", "planking", "work platform"],
    taskTags: ["construction", "scaffold work", "masonry", "elevated work"],
    exposureTags: ["open side", "unprotected edge", "scaffold platform", "fall distance", "above lower level"],
    controlTags: ["guardrail system", "personal fall arrest", "scaffold guardrail"],
    consequenceTags: ["fall", "fatality", "fracture"],
    searchBoostTerms: ["scaffold", "scaffold platform", "scaffold fall", "guardrail", "1926.451", "ten feet"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "critical",
    sourceUrl:
      "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1926/subpart-L/section-1926.451",
    retrievalDate: "2026-08-20",
    evidenceRequirements: [
      { question: "Is construction work occurring?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Is the work surface a scaffold, and is an employee on it?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Is the scaffold platform more than 10 feet above the lower level?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "Construction scaffold scope not established.", excludeWhenMissingAny: ["scaffold", "construction", "1926"] },
    ],
    crossDomainLinks: ["Fall Protection"],
  },

  {
    // The cleanest evidence-to-rule fit of the seven: the predicate negates BOTH statutory
    // exceptions explicitly -- 6 feet clears the 5-foot exception, and "not stable rock" clears
    // the other. Paragraph level is fully supported.
    citation: "29 CFR 1926.652(a)(1)",
    agency: "OSHA",
    scope: "osha-construction",
    part: "1926",
    subpart: "P",
    title: "Requirements for protective systems — Protection of employees in excavations",
    plainLanguageSummary:
      "Each employee in an excavation must be protected from cave-ins by an adequate protective system designed in accordance with 29 CFR 1926.652(b) or (c), except in two cases: where the excavation is made entirely in stable rock, or where the excavation is less than 5 feet (1.52 m) deep and examination of the ground by a competent person provides no indication of a potential cave-in (1926.652(a)(1)(i)-(ii)). Protective systems must also have the capacity to resist without failure all loads intended or reasonably expected to be applied to them (1926.652(a)(2)). Sloping, benching, shoring and shielding options are specified in 1926.652(b) and (c).",
    hazardFamilies: ["Excavation / Trenching", "Caught-In/Between"],
    equipmentTags: ["trench", "excavation", "trench box", "shoring", "shield", "sloping", "benching"],
    taskTags: ["construction", "excavation", "trenching", "utility work", "pipe laying"],
    exposureTags: ["unprotected trench", "trench depth", "cave-in", "spoil pile", "unsupported wall"],
    controlTags: ["protective system", "trench box", "shoring", "sloping", "benching", "competent person"],
    consequenceTags: ["cave-in", "burial", "crushing", "asphyxiation", "fatality"],
    searchBoostTerms: ["trench", "excavation", "cave-in", "trench box", "shoring", "1926.652", "five feet"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "critical",
    sourceUrl:
      "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1926/subpart-P/section-1926.652",
    retrievalDate: "2026-08-20",
    evidenceRequirements: [
      { question: "Is construction work occurring?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Is an employee inside the excavation?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "What is the excavation depth, and is it made entirely in stable rock?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "Construction excavation scope not established.", excludeWhenMissingAny: ["trench", "excavation", "construction", "1926"] },
    ],
    crossDomainLinks: ["Ground Control"],
  },

  {
    // SECTION level deliberately. The handrail requirement is 1910.28(b)(11)(ii), but that
    // paragraph is conditioned on "at least 3 treads and at least 4 risers", which a bare
    // observation of a missing handrail does not establish. Citing the paragraph would assert a
    // tread/riser count nobody observed -- the 1910.303 error, applied prospectively. The summary
    // names the condition as something the finding must establish.
    citation: "29 CFR 1910.28",
    agency: "OSHA",
    scope: "osha-general-industry",
    part: "1910",
    subpart: "D",
    title: "Duty to have fall protection and falling object protection",
    plainLanguageSummary:
      "Section 1910.28 requires general-industry employers to protect each employee exposed to fall and falling-object hazards on walking-working surfaces, and 1910.28(b) sets the protection required for each situation. For stairways, 1910.28(b)(11) requires that each employee exposed to an unprotected side or edge of a stairway landing 4 feet (1.2 m) or more above a lower level be protected by a guardrail or stair rail system (1910.28(b)(11)(i)), and that each flight of stairs having at least 3 treads and at least 4 risers be equipped with stair rail systems and handrails (1910.28(b)(11)(ii)) — so the number of treads and risers is part of establishing whether the handrail requirement applies to a particular flight. Ship stairs and alternating tread type stairs must have handrails on both sides (1910.28(b)(11)(iii)). Construction and dimensional requirements for stairways themselves are at 29 CFR 1910.25, and the criteria for stair rail systems and handrails are at 1910.29, not in this section. Fall protection for employees on scaffolds is governed by 29 CFR part 1926 subpart L (1910.28(b)(12)(i)).",
    hazardFamilies: ["Fall Protection", "Walking/Working Surfaces"],
    equipmentTags: ["stairway", "stairs", "handrail", "stair rail", "landing", "walking surface", "floor hole", "platform"],
    taskTags: ["general industry", "facility operations", "warehouse", "plant"],
    exposureTags: ["missing handrail", "unprotected edge", "stairway landing", "fall exposure", "descending stairs"],
    controlTags: ["handrail", "stair rail system", "guardrail system", "cover"],
    consequenceTags: ["fall", "fracture", "fatality"],
    searchBoostTerms: ["handrail", "stair rail", "stairway", "stairs", "1910.28", "walking working surface"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "high",
    sourceUrl:
      "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1910/subpart-D/section-1910.28",
    retrievalDate: "2026-08-20",
    evidenceRequirements: [
      { question: "Is OSHA General Industry applicable?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Are employees exposed to the fall hazard on this surface?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "For a stairway: how many treads and risers does the flight have, or is a landing 4 feet or more above a lower level?", requiredForPrimary: false, missingEvidenceImpact: "medium" },
    ],
    exclusionRules: [
      { reason: "General-industry scope not established.", excludeWhenMissingAny: ["1910", "general industry", "facility", "plant", "warehouse", "stairway", "stairs"] },
    ],
    crossDomainLinks: ["Walking/Working Surfaces"],
  },

  {
    // SECTION level. 92 dBA over a full shift exceeds Table G-16 (which allows 90 dBA for 8 hours)
    // AND clears the 85 dBA hearing-conservation trigger, so both (b)(1) and (c)(1) are supported.
    // The control hierarchy in (b)(1) is preserved deliberately: engineering and administrative
    // controls first, PPE only on their failure. A summary offering hearing protection as an equal
    // option would misstate the rule.
    citation: "29 CFR 1910.95",
    agency: "OSHA",
    scope: "osha-general-industry",
    part: "1910",
    subpart: "G",
    title: "Occupational noise exposure",
    plainLanguageSummary:
      "Protection against the effects of noise exposure must be provided when sound levels exceed those in Table G-16 of 29 CFR 1910.95, measured on the A scale at slow response — Table G-16 permits 90 dBA for 8 hours, 92 dBA for 6 hours, 95 dBA for 4 hours, and so on (1910.95(a)). Where employees are subjected to sound exceeding those levels, feasible administrative or engineering controls must be used first, and personal protective equipment is required only if those controls fail to bring exposure within the table (1910.95(b)(1)). Separately and at a lower threshold, the employer must administer a continuing, effective hearing conservation program whenever employee noise exposure equals or exceeds an 8-hour time-weighted average of 85 dBA, or equivalently a dose of fifty percent, computed without regard to any attenuation from hearing protectors (1910.95(c)(1)).",
    hazardFamilies: ["Noise Exposure", "Occupational Health"],
    equipmentTags: ["press", "compressor", "grinder", "blower", "pump", "machine", "production line"],
    taskTags: ["general industry", "production", "machine operation", "facility operations"],
    exposureTags: ["noise exposure", "dBA", "TWA", "time-weighted average", "dose", "hearing loss", "full shift"],
    controlTags: ["engineering controls", "administrative controls", "hearing conservation program", "audiometric testing", "hearing protection"],
    consequenceTags: ["hearing loss", "noise-induced hearing loss"],
    searchBoostTerms: ["noise", "dBA", "TWA", "85 dBA", "90 dBA", "hearing conservation", "1910.95", "hearing protection"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "high",
    sourceUrl:
      "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1910/subpart-G/section-1910.95",
    retrievalDate: "2026-08-20",
    evidenceRequirements: [
      { question: "Is OSHA General Industry applicable?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "What is the employee's measured 8-hour time-weighted average exposure in dBA, or dose?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "General-industry scope not established.", excludeWhenMissingAny: ["1910", "general industry", "facility", "plant", "warehouse"] },
    ],
    crossDomainLinks: ["Personal Protective Equipment"],
  },

  {
    // SECTION level. The operative paragraph is (f)(6) -- WORKPLACE labeling -- not (f)(1), which
    // is SHIPPED containers and falls on the manufacturer/importer/distributor rather than the
    // employer. The (f)(7)/(f)(8) alternatives are preserved because signs, placards, process
    // sheets and batch tickets are a lawful route to compliance, and omitting them would overstate
    // the duty as "every container must bear an individual label".
    citation: "29 CFR 1910.1200",
    agency: "OSHA",
    scope: "osha-general-industry",
    part: "1910",
    subpart: "Z",
    title: "Hazard communication",
    plainLanguageSummary:
      "Employers must ensure that each container of hazardous chemicals in the workplace is labeled, tagged or marked with either the full shipped-container information required by 29 CFR 1910.1200(f)(1)(i)-(v), or with the product identifier plus words, pictures or symbols giving at least general information about the chemical's hazards which, together with the other information available under the employer's hazard communication program, conveys the specific physical and health hazards (1910.1200(f)(6)). This workplace-labeling duty is distinct from 1910.1200(f)(1), which places the duty to label containers leaving the workplace on the chemical manufacturer, importer or distributor. Employers may use signs, placards, process sheets, batch tickets, operating procedures or other written materials in lieu of affixing labels to individual stationary process containers, provided the alternative identifies the containers and conveys the required information (1910.1200(f)(7)), and portable containers into which chemicals are transferred for the immediate use of the employee performing the transfer need not be labeled (1910.1200(f)(8)).",
    hazardFamilies: ["Hazard Communication", "Chemical Exposure"],
    equipmentTags: ["container", "drum", "pail", "tote", "jug", "bottle", "tank", "secondary container", "spray bottle"],
    taskTags: ["general industry", "chemical handling", "chemical transfer", "storage"],
    exposureTags: ["unlabeled container", "missing label", "unknown contents", "unknown chemical", "no GHS label"],
    controlTags: ["label container", "GHS label", "product identifier", "hazard communication program", "safety data sheet"],
    consequenceTags: ["chemical exposure", "chemical burn", "poisoning", "misuse"],
    searchBoostTerms: ["label", "unlabeled", "hazcom", "hazard communication", "GHS", "container label", "1910.1200", "SDS"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "high",
    sourceUrl:
      "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1910/subpart-Z/section-1910.1200",
    retrievalDate: "2026-08-20",
    evidenceRequirements: [
      { question: "Is OSHA General Industry applicable?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Does the container hold a hazardous chemical in the workplace?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Is the container labeled, or is an alternative under (f)(7) in place, or is it a portable container for immediate use under (f)(8)?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "General-industry scope not established.", excludeWhenMissingAny: ["1910", "general industry", "facility", "plant", "warehouse"] },
    ],
    crossDomainLinks: ["Chemical Exposure"],
  },

  {
    // SECTION level. The observation does not establish whether the saw is stationary or handheld,
    // and Table 1 treats them as separate entries with different respiratory-protection
    // requirements. Both entries require the SAME engineering control (integrated water delivery),
    // so the control duty holds either way -- but the record names both rather than picking one,
    // and preserves the (d) alternative route with its 50 ug/m3 PEL.
    citation: "29 CFR 1926.1153",
    agency: "OSHA",
    scope: "osha-construction",
    part: "1926",
    subpart: "Z",
    title: "Respirable crystalline silica",
    plainLanguageSummary:
      "For each employee engaged in a task identified on Table 1 of 29 CFR 1926.1153, the employer must fully and properly implement the engineering controls, work practices and respiratory protection that Table 1 specifies for that task, unless the employer instead assesses and limits exposure under 1926.1153(d) (1926.1153(c)(1)). For stationary masonry saws (Table 1 entry (i)) and for handheld power saws of any blade diameter (Table 1 entry (ii)), Table 1 requires a saw equipped with an integrated water delivery system that continuously feeds water to the blade, operated and maintained in accordance with the manufacturer's instructions to minimize dust emissions; the handheld entry additionally requires respiratory protection with an assigned protection factor of 10 when used indoors or in an enclosed area, and for more than four hours per shift outdoors. Where a task is not listed on Table 1, or where the employer does not fully and properly implement the Table 1 controls, the employer must instead ensure no employee is exposed above the permissible exposure limit of 50 micrograms per cubic metre of respirable crystalline silica as an 8-hour time-weighted average, and must assess exposures accordingly (1926.1153(d)(1)-(2)).",
    hazardFamilies: ["Respirable Crystalline Silica", "Chemical Exposure", "Occupational Health"],
    equipmentTags: ["masonry saw", "concrete saw", "handheld saw", "cut-off saw", "grinder", "concrete", "masonry", "block"],
    taskTags: ["construction", "cutting concrete", "sawing", "grinding", "demolition", "dry cutting"],
    exposureTags: ["visible dust", "dust cloud", "silica dust", "respirable dust", "no water suppression", "dry cutting"],
    controlTags: ["water delivery system", "wet cutting", "water suppression", "dust collection", "respiratory protection", "exposure assessment"],
    consequenceTags: ["silicosis", "lung disease", "respiratory illness"],
    searchBoostTerms: ["silica", "respirable crystalline silica", "masonry saw", "concrete cutting", "dry cutting", "dust", "1926.1153", "Table 1"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "high",
    sourceUrl:
      "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1926/subpart-Z/section-1926.1153",
    retrievalDate: "2026-08-20",
    evidenceRequirements: [
      { question: "Is construction work occurring?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Is the task one listed on Table 1, and is the material silica-bearing?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Is the Table 1 engineering control (integrated water delivery) in use, or is the employer relying on the alternative exposure-control route under (d)?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "Construction silica scope not established.", excludeWhenMissingAny: ["concrete", "masonry", "silica", "construction", "1926", "saw"] },
    ],
    crossDomainLinks: ["Chemical Exposure", "Personal Protective Equipment"],
  },

  {
    // KG-3E Phase 3, item 7. This is the SECTION record, added in place of the citation HazLenz
    // actually emits (`30 CFR 56.14132(a)`), which was refused -- see
    // phase3-uncovered-citation-adjudications.md. Paragraph (a) is HORN maintenance; the
    // obstructed-view reversing rule that the predicate describes is (b)(1), and (b)(1)(iv) makes
    // an observer one of the four permitted alternatives, which is why "no alarm AND no spotter"
    // is a (b)(1) violation and not an (a) one.
    //
    // This record does NOT back the emitted `56.14132(a)`: release citation identity keeps the
    // paragraph and the bare section distinct, so the emitted citation still resolves to nothing.
    // That is intentional and is asserted explicitly by the Phase 4 granularity contract -- a
    // section record must never stand in for a paragraph requirement.
    citation: "30 CFR 56.14132",
    agency: "MSHA",
    scope: "mining",
    part: "56",
    subpart: "M",
    title: "Horns and backup alarms",
    plainLanguageSummary:
      "Manually-operated horns or other audible warning devices provided on self-propelled mobile equipment as a safety feature must be maintained in functional condition (30 CFR 56.14132(a)). Separately, when the operator has an obstructed view to the rear, self-propelled mobile equipment must have one of the following: an automatic reverse-activated signal alarm; a wheel-mounted bell alarm sounding at least once for each three feet of reverse movement; a discriminating backup alarm covering the area of obstructed view; or an observer to signal when it is safe to back up (30 CFR 56.14132(b)(1)(i)-(iv)). Alarms must be audible above the surrounding noise level (56.14132(b)(2)), and an automatic reverse-activated strobe light may be used at night in lieu of an audible reverse alarm (56.14132(b)(3)). This standard does not apply to rail equipment (56.14132(c)). The obstructed-view condition is what triggers paragraph (b)(1); paragraph (a) concerns only the functional condition of horns that are provided.",
    hazardFamilies: ["Mobile Equipment", "Powered Haulage", "Struck-By"],
    equipmentTags: ["haul truck", "loader", "dozer", "mobile equipment", "backup alarm", "horn", "self-propelled equipment"],
    taskTags: ["mining", "hauling", "backing", "reversing", "equipment operation"],
    exposureTags: ["obstructed view", "backing", "reversing", "pedestrian", "no spotter", "blind spot"],
    controlTags: ["backup alarm", "reverse alarm", "observer", "spotter", "strobe light", "functional horn"],
    consequenceTags: ["struck-by", "run over", "fatality"],
    searchBoostTerms: ["backup alarm", "reverse alarm", "horn", "backing", "haul truck", "spotter", "56.14132"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "critical",
    sourceUrl:
      "https://www.ecfr.gov/current/title-30/chapter-I/subchapter-N/part-56/subpart-M/section-56.14132",
    retrievalDate: "2026-08-20",
    evidenceRequirements: [
      { question: "Is this an MSHA-regulated mine?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Does the operator have an obstructed view to the rear while reversing?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Is a reverse alarm, bell alarm, discriminating backup alarm, or an observer present?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "MSHA scope not established.", excludeWhenMissingAny: ["mine", "miner", "quarry", "MSHA", "30 CFR", "haul"] },
      { reason: "Rail equipment is excluded by 56.14132(c).", excludeWhenMissingAny: [] },
    ],
    crossDomainLinks: ["Powered Haulage", "Traffic Management"],
  },

  // ===========================================================================================
  // KG-4A, Phase 5 -- 30 CFR 56.14132(b)(1), the paragraph record KG-3E deferred.
  //
  // WHY KG-3E REFUSED A PARAGRAPH RECORD, AND WHY THAT REASON NO LONGER APPLIES.
  //
  // KG-3E adjudicated this citation while HazLenz was emitting `56.14132(a)`. It refused to back
  // that citation -- correctly: (a) is HORN maintenance and the predicate described reversing --
  // and added the SECTION record above instead, "leaving the emitted paragraph resolving to
  // nothing". Its stated bar for a paragraph-level record was explicit:
  //
  //     "a record is written at the paragraph level ONLY where the predicate establishes every
  //      element that paragraph requires."
  //
  // At the time the predicate established NONE of (b)(1)'s elements: the obstructed-view trigger
  // was hard-coded `true` and no rear-visibility evidence fact existed. KG-3F Phases 5-7 changed
  // exactly that. The trigger is now evidence-borne (`rearViewState`), the (b)(1)(iv) observer
  // alternative is evidence-borne (`reverseWarningAlternative`), and (b)(1) is emitted ONLY where
  // an obstructed rear view is established -- 16/16 in `test:kg3f-56-14132-predicate`. The bar
  // KG-3E set is now met, so the record it deferred is written here.
  //
  // GRANULARITY. The text below is (b)(1)'s introductory clause together with its own subdivisions
  // (i)-(iv). That is completeness, not absorption: (i)-(iv) are subdivisions OF (b)(1), and the
  // requirement "shall have--" is meaningless without them. What the record must NOT do is absorb
  // its SIBLINGS, so (b)(2), (b)(3) and (c) are named as qualifications with their own citations
  // rather than stated as this paragraph's rule, and (a) is explicitly disclaimed rather than
  // silently included -- the same discipline KG-3D applied to 1910.303.
  //
  // WHY ALL FOUR ALTERNATIVES ARE STATED. (b)(1)(iv) makes an OBSERVER a compliant method. A
  // record that mentioned only alarms would let "no backup alarm" read as a violation of a rule
  // the operator may be complying with -- the precise error KG-3F removed from the predicate.
  // ===========================================================================================
  {
    citation: "30 CFR 56.14132(b)(1)",
    agency: "MSHA",
    scope: "mining",
    part: "56",
    subpart: "M",
    // A justified narrowing of the codified section heading "Horns and backup alarms": this
    // record covers only the backup-alarm half, and says so.
    title: "Backup alarms where the operator has an obstructed view to the rear",
    plainLanguageSummary:
      "When the operator of self-propelled mobile equipment has an obstructed view to the rear, the equipment must have one of the following: an automatic reverse-activated signal alarm; a wheel-mounted bell alarm which sounds at least once for each three feet of reverse movement; a discriminating backup alarm that covers the area of obstructed view; or an observer to signal when it is safe to back up (30 CFR 56.14132(b)(1)(i)-(iv)). Any one of the four satisfies this paragraph. The obstructed view to the rear is the condition that triggers the paragraph: where the operator's rear view is clear, this paragraph does not apply. Alarms must be audible above the surrounding noise level (56.14132(b)(2)), and an automatic reverse-activated strobe light may be used at night in lieu of an audible reverse alarm (56.14132(b)(3)). This standard does not apply to rail equipment (56.14132(c)). Paragraph (a), which requires that manually-operated horns or other audible warning devices provided as a safety feature be maintained in functional condition, is a separate requirement and is not addressed by this paragraph.",
    hazardFamilies: ["Mobile Equipment", "Powered Haulage", "Struck-By"],
    equipmentTags: ["haul truck", "loader", "dozer", "mobile equipment", "backup alarm", "self-propelled equipment"],
    taskTags: ["mining", "hauling", "backing", "reversing", "equipment operation"],
    exposureTags: ["obstructed view", "backing", "reversing", "pedestrian", "no spotter", "blind spot"],
    controlTags: ["backup alarm", "reverse alarm", "observer", "spotter", "strobe light", "bell alarm"],
    consequenceTags: ["struck-by", "run over", "fatality"],
    searchBoostTerms: ["backup alarm", "reverse alarm", "backing", "obstructed view", "spotter", "56.14132(b)(1)"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "critical",
    sourceUrl:
      "https://www.ecfr.gov/current/title-30/chapter-I/subchapter-N/part-56/subpart-M/section-56.14132",
    retrievalDate: "2026-08-20",
    evidenceRequirements: [
      { question: "Is this an MSHA-regulated mine?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Does the operator have an obstructed view to the rear while reversing?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Is a reverse-activated alarm, wheel-mounted bell alarm, discriminating backup alarm, or an observer present?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "MSHA scope not established.", excludeWhenMissingAny: ["mine", "miner", "quarry", "MSHA", "30 CFR", "haul"] },
      { reason: "Rail equipment is excluded by 56.14132(c).", excludeWhenMissingAny: [] },
      { reason: "The paragraph applies only where the rear view is obstructed.", excludeWhenMissingAny: [] },
    ],
    crossDomainLinks: ["Powered Haulage", "Traffic Management"],
  },

  // ===========================================================================================
  // KG-3E, Phase 6 -- the last three placeholder-source records.
  //
  // These are the records KG-3D left carrying `starter-unverified:` provenance. Like 1910.36
  // before them, they exist ONLY in the starter seed (safescope-standards.seed.ts), which carries
  // no source fields, so finalization synthesized a placeholder source key for each. Adding them
  // here routes them through withSourceRegistryMetadata() and the sync's normalized-citation
  // matcher UPDATES the existing rows rather than inserting duplicates.
  //
  // KG-3D's lesson from 1910.36 was applied rather than assumed: placeholder provenance is not
  // necessarily the only defect. Each record's stored text was compared against the authoritative
  // source, and in all three cases the text stated the TOPIC rather than the operative
  // requirement -- the same failure mode that made 1926.501 unapprovable.
  //
  // None of these three is emitted by the finding-scoped selection engine. All three are
  // nevertheless reachable through `suggest()`, which searches the corpus directly, so their
  // provenance is customer-visible and does matter.
  // ===========================================================================================

  {
    // Stored text was "Keep walking-working surfaces clean, orderly, and free of hazards." -- a
    // fair gloss of (a)(1) and (a)(3), but it silently dropped (a)(2), the wet-process drainage
    // and dry-standing-place duty, and it dropped the "to the extent feasible" qualifier that
    // limits both (a)(2) obligations. Restored with the qualifiers intact.
    citation: "29 CFR 1910.22(a)",
    agency: "OSHA",
    scope: "osha-general-industry",
    part: "1910",
    subpart: "D",
    title: "General requirements — Surface conditions",
    plainLanguageSummary:
      "Employers must ensure that all places of employment, passageways, storerooms, service rooms and walking-working surfaces are kept in a clean, orderly and sanitary condition (29 CFR 1910.22(a)(1)); that the floor of each workroom is maintained in a clean and, to the extent feasible, dry condition, with drainage maintained and, to the extent feasible, dry standing places such as false floors, platforms and mats provided where wet processes are used (1910.22(a)(2)); and that walking-working surfaces are maintained free of hazards such as sharp or protruding objects, loose boards, corrosion, leaks, spills, snow and ice (1910.22(a)(3)). The separate duties to support the maximum intended load, to provide safe means of access and egress, and to inspect, maintain and repair walking-working surfaces are at 1910.22(b), (c) and (d) respectively, not in this paragraph.",
    hazardFamilies: ["Walking/Working Surfaces", "Slips, Trips and Falls"],
    equipmentTags: ["floor", "walkway", "passageway", "aisle", "storeroom", "workroom", "walking surface"],
    taskTags: ["general industry", "housekeeping", "facility operations", "wet process"],
    exposureTags: ["spill", "wet floor", "standing water", "debris", "clutter", "protruding object", "loose board", "ice", "snow"],
    controlTags: ["housekeeping", "drainage", "dry standing place", "mats", "clean surface", "remove hazard"],
    consequenceTags: ["slip", "trip", "fall", "fracture"],
    searchBoostTerms: ["housekeeping", "wet floor", "spill", "slip", "trip", "walking working surface", "1910.22", "clutter"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "medium",
    sourceUrl:
      "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1910/subpart-D/section-1910.22",
    retrievalDate: "2026-08-20",
    evidenceRequirements: [
      { question: "Is OSHA General Industry applicable?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Is the surface condition a hazard of the kind listed in 1910.22(a)(3), or a housekeeping/wet-floor condition under (a)(1)-(a)(2)?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "General-industry scope not established.", excludeWhenMissingAny: ["1910", "general industry", "facility", "plant", "warehouse", "floor", "walkway"] },
    ],
    crossDomainLinks: ["Walking/Working Surfaces"],
  },

  {
    // The record KG-3D's 1910.303 adjudication turned on. Two defects beyond provenance:
    //
    //  1. The title, "Electrical equipment examination and use", conflated paragraph (b)
    //     ("Examination, installation, and use of equipment") with paragraph (b)(1)
    //     ("Examination"). The citation is (b)(1), so the title must not claim the parent's scope.
    //  2. The stored text, "Electrical equipment must be safe and free from recognized hazards",
    //     omitted the eight considerations (b)(1)(i)-(viii) by which safety is actually determined.
    //
    // The summary states explicitly that this paragraph is EXAMINATION and that the guarding of
    // live parts is a different requirement at 1910.303(g)(2)(i). That is the whole substance of
    // KG-3D's finding, written into the record itself so the distinction survives independently of
    // whether anyone reads the verification note.
    citation: "29 CFR 1910.303(b)(1)",
    agency: "OSHA",
    scope: "osha-general-industry",
    part: "1910",
    subpart: "S",
    title: "Examination, installation, and use of equipment — Examination",
    plainLanguageSummary:
      "Electric equipment must be free from recognized hazards that are likely to cause death or serious physical harm to employees, and the safety of equipment is determined using the considerations listed in 29 CFR 1910.303(b)(1)(i)-(viii): suitability for installation and use in conformity with subpart S; mechanical strength and durability, including the adequacy of protection provided by parts designed to enclose and protect other equipment; wire-bending and connection space; electrical insulation; heating effects under all conditions of use; arcing effects; classification by type, size, voltage, current capacity and specific use; and other factors contributing to the practical safeguarding of employees using or likely to come into contact with the equipment. This paragraph is the EXAMINATION requirement. It is not the guarding requirement: the duty to guard live parts operating at 50 volts or more against accidental contact is a separate rule at 29 CFR 1910.303(g)(2)(i), which applies only to installations operating at 600 volts, nominal, or less to ground.",
    hazardFamilies: ["Electrical"],
    equipmentTags: ["electrical equipment", "conductor", "wiring", "fitting", "device", "appliance", "fixture"],
    taskTags: ["general industry", "electrical maintenance", "equipment inspection", "installation"],
    exposureTags: ["damaged equipment", "recognized hazard", "unsuitable equipment", "unlisted equipment", "deteriorated insulation"],
    controlTags: ["examine equipment", "verify listing", "remove from service", "replace damaged equipment"],
    consequenceTags: ["electric shock", "electrocution", "arc flash", "fire"],
    searchBoostTerms: ["electrical equipment", "recognized hazard", "examination", "listed equipment", "1910.303(b)(1)", "damaged electrical"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "high",
    sourceUrl:
      "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1910/subpart-S/section-1910.303",
    retrievalDate: "2026-08-20",
    evidenceRequirements: [
      { question: "Is OSHA General Industry applicable?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Is the concern the CONDITION or suitability of electric equipment, rather than exposure to unguarded live parts?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "General-industry electrical scope not established.", excludeWhenMissingAny: ["1910", "general industry", "electrical", "equipment"] },
    ],
    crossDomainLinks: ["Electrical"],
  },

  {
    // Stored text, "Control confined space entry with permits, testing, attendants, and rescue
    // planning", named four program elements but stated no duty and no trigger -- the same defect
    // that made 1926.501 unapprovable. The operative structure is (c)(1)-(c)(4): evaluate, inform,
    // then EITHER prevent entry OR implement a written permit space program.
    //
    // The scope exclusion in (a) is stated explicitly because it is the cross-regime guard for
    // this record: 1910.146 does not apply to construction, and construction confined spaces are
    // governed by 29 CFR part 1926 subpart AA.
    citation: "29 CFR 1910.146",
    agency: "OSHA",
    scope: "osha-general-industry",
    part: "1910",
    subpart: "J",
    title: "Permit-required confined spaces",
    plainLanguageSummary:
      "Employers must evaluate the workplace to determine whether any spaces are permit-required confined spaces (29 CFR 1910.146(c)(1)). If the workplace contains permit spaces, the employer must inform exposed employees of their existence, location and danger by posting danger signs or other equally effective means (1910.146(c)(2)). If the employer decides employees will not enter permit spaces, it must take effective measures to prevent entry and still comply with 1910.146(c)(1), (c)(2), (c)(6) and (c)(8) (1910.146(c)(3)). If the employer decides employees will enter, it must develop and implement a written permit space program complying with this section, available for inspection by employees and their authorized representatives (1910.146(c)(4)); the required program elements — permits, atmospheric testing, attendants, entry supervisors, and rescue and emergency services — are set out in 1910.146(d) through (k). Alternate procedures are available under 1910.146(c)(5) only where the employer can demonstrate that the sole hazard is an actual or potential hazardous atmosphere and that continuous forced air ventilation alone will keep the space safe for entry. This section does not apply to agriculture, construction, or shipyard employment (1910.146(a)); confined spaces in construction are governed by 29 CFR part 1926 subpart AA.",
    hazardFamilies: ["Confined Space", "Atmospheric Hazards"],
    equipmentTags: ["tank", "vessel", "silo", "pit", "vault", "manhole", "sewer", "hopper", "confined space"],
    taskTags: ["general industry", "confined space entry", "cleaning", "inspection", "maintenance"],
    exposureTags: ["permit space", "hazardous atmosphere", "oxygen deficient", "engulfment", "no attendant", "no permit", "unposted space"],
    controlTags: ["entry permit", "atmospheric testing", "attendant", "entry supervisor", "rescue services", "forced air ventilation", "danger sign"],
    consequenceTags: ["asphyxiation", "engulfment", "poisoning", "fatality"],
    searchBoostTerms: ["confined space", "permit space", "permit-required", "manhole", "tank entry", "1910.146", "attendant"],
    authorityTier: 1,
    applicabilityBandDefault: "primary",
    severityDefault: "critical",
    sourceUrl:
      "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1910/subpart-J/section-1910.146",
    retrievalDate: "2026-08-20",
    evidenceRequirements: [
      { question: "Is OSHA General Industry applicable? (This section excludes construction, agriculture and shipyard employment.)", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Does the space meet the definition of a permit-required confined space?", requiredForPrimary: true, missingEvidenceImpact: "high" },
      { question: "Did an employee enter, or is entry planned?", requiredForPrimary: true, missingEvidenceImpact: "high" },
    ],
    exclusionRules: [
      { reason: "General-industry scope not established; construction confined spaces are subpart AA.", excludeWhenMissingAny: ["1910", "general industry", "facility", "plant", "confined space", "tank", "vessel"] },
    ],
    crossDomainLinks: ["Atmospheric Hazards", "Emergency Response"],
  },
];

/**
 * InSite v1.0 governed source expansion, 2026-08-28. Appended rather than merged into
 * `RAW_STANDARDS_INTELLIGENCE_SEED` so that no historical governed record is edited, moved or
 * re-ordered by the addition: the 35 records KG-3D/3E/4A adjudicated keep their exact positions
 * and their exact content, and the new records are additive and separately reviewable.
 * Both sets pass through the SAME `withSourceRegistryMetadata` projection, so a new record is
 * indistinguishable in shape from an original one downstream.
 */
export const STANDARDS_INTELLIGENCE_SEED: StandardsIntelligenceRecord[] = [
  ...RAW_STANDARDS_INTELLIGENCE_SEED,
  ...V1_STANDARDS_EXPANSION,
].map(withSourceRegistryMetadata);
