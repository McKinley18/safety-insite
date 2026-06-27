process.env.RENDER = "true";
process.env.NODE_ENV = "production";
process.env.HAZLENZ_DISABLE_FULL_INTELLIGENCE_ON_RENDER = "true";

import { EvidenceFusionService } from "../evidence/evidence-fusion.service";
import { SafescopeV2Service } from "../safescope-v2.service";
import { WorkspaceGovernanceAccessService } from "../workspace-governance-access/workspace-governance-access.service";

type Scenario = {
  name: string;
  text: string;
  scopes: string[];
  evidenceTexts: string[];
  expectedTop?: RegExp;
  forbidden?: RegExp[];
  vague?: boolean;
};

function makeStandard(citation: string, title: string, rationale: string, jurisdiction = citation.startsWith("30 CFR") ? "msha" : "osha_general_industry") {
  return {
    citation,
    title,
    titleSummary: title,
    summary: title,
    agencyCode: citation.startsWith("30 CFR") ? "MSHA" : "OSHA",
    jurisdiction,
    score: 760,
    confidence: 0.92,
    candidateStatus: "candidate_standard",
    status: "candidate_standard",
    matchingReasons: [rationale],
    evidenceNeeded: ["Confirm scope, exposure, and controls."],
    advisoryOnly: true,
    requiresQualifiedReview: true,
    source: ["standard_return_contract_regression"],
  };
}

function mockStandardsService() {
  return {
    async suggest(description: string) {
      const text = `${description || ""}`.toLowerCase();

      if (/\b(tail pulley|conveyor)\b/.test(text) && /\b(cleanup|spilled|cleanup)\b/.test(text) && /\b(mine|miner|aggregate|crusher|screen|haul road)\b/.test(text)) {
        return [
          makeStandard("30 CFR 56.14107", "Moving machine parts", "Direct match: conveyor guarding and caught-in exposure in mine context."),
          makeStandard("30 CFR 56.12016", "Work on electrically powered equipment; deenergizing and lockout", "Supporting servicing context."),
        ];
      }

      if (/\b(loader|forklift|truck|mobile equipment|haul truck|traffic|pedestrian|separation|spotter|backing)\b/.test(text) && /\b(mine|aggregate|crusher|screen|haul road)\b/.test(text)) {
        return [
          makeStandard("30 CFR 56.9100", "Traffic control and rules governing movement of mobile equipment", "Direct match: mine traffic and pedestrian exposure."),
        ];
      }

      if (/\b(lockout|loto|tagout|maintenance|servicing|unexpected startup|stored energy|energized equipment)\b/.test(text) && /\b(mine|aggregate|crusher|screen|plant)\b/.test(text)) {
        return [
          makeStandard("30 CFR 56.12016", "Work on electrically powered equipment; deenergizing and lockout", "Direct match: hazardous energy control during servicing."),
        ];
      }

      if (/\b(open|spill|spilled|leak|leaking|release|residue|used oil|waste oil|oily waste)\b/.test(text) && /\b(floor|walkway|aisle|travelway|walking surface|shop floor|maintenance area|maintenance bay|drain)\b/.test(text)) {
        return [
          makeStandard("29 CFR 1910.22(a)(2)", "Walking-working surfaces free of hazards", "Direct match: contaminated walking surface or release pathway."),
          makeStandard("29 CFR 1910.22(a)(3)", "Walking-working surfaces kept clear", "Supporting housekeeping and clear access."),
        ];
      }

      if (/\b(unlabeled|no label|missing label|unknown contents|used oil|waste oil|chemical|container|tank|drum|bucket|can|pail|jug|tote|bottle)\b/.test(text)) {
        return [
          makeStandard("29 CFR 1910.1200(f)(6)", "Workplace labeling (hazard communication)", "Direct match: workplace labeling for a primary container or tank."),
          makeStandard("29 CFR 1910.1200(f)(1)", "Labeling of stationary process containers", "Direct match: chemical identity or label deficiency."),
        ];
      }

      if (/\b(open breaker slot|missing panel cover|open electrical panel|exposed energized parts|live parts)\b/.test(text)) {
        return [
          makeStandard("29 CFR 1910.303(g)(2)(i)", "Electrical equipment guarding/access to live parts", "Direct match: exposed energized parts and missing enclosure cover."),
          makeStandard("29 CFR 1910.303(g)(1)", "Working space about electric equipment", "Supporting access clearance context."),
        ];
      }

      if (/\b(blocked electrical panel|panel blocked|working clearance|storage in front of panel)\b/.test(text)) {
        return [
          makeStandard("29 CFR 1910.303(g)(1)", "Space about electric equipment", "Direct match: blocked electrical working space."),
        ];
      }

      if (/\b(damaged cord|wet area|damp floor|frayed cord|wet location|portable grinder)\b/.test(text)) {
        return [
          makeStandard("29 CFR 1910.334(a)(2)(ii)", "Portable electric equipment and cord conditions", "Direct match: damaged cord in wet area."),
          makeStandard("29 CFR 1910.305(g)(1)", "Flexible cords and cables", "Supporting cord condition context."),
        ];
      }

      if (/\b(scrap|hoses?|debris|clutter)\b/.test(text) && /\b(walkway|aisle|travelway|pedestrian walkway|walking surface|shop floor)\b/.test(text)) {
        return [
          makeStandard("29 CFR 1910.22(a)(3)", "Walking-working surfaces kept clear", "Direct match: trip/housekeeping condition across a walkway."),
          makeStandard("29 CFR 1910.22(a)(2)", "Walking-working surfaces free of hazards", "Supporting same-level slip/trip exposure."),
        ];
      }

      if (/\b(oxygen cylinders?|compressed gas|valve protection cap|acetylene cylinders?)\b/.test(text)) {
        return [
          makeStandard("29 CFR 1910.101", "Compressed gases (general requirements)", "Direct match: cylinder storage and valve protection."),
        ];
      }

      if (/\b(platform|guardrail|edge|fall arrest|unguarded platform|fall protection)\b/.test(text)) {
        return [
          makeStandard("29 CFR 1910.28", "Duty to have fall protection and falling object protection", "Direct match: elevated edge without guardrail."),
          makeStandard("29 CFR 1926.501", "Fall protection", "Construction-supporting context where applicable."),
        ];
      }

      if (/\b(ladder)\b/.test(text)) {
        return [
          makeStandard("29 CFR 1910.23", "Ladders", "Direct match: ladder condition or use issue."),
        ];
      }

      if (/\b(exit|egress)\b/.test(text) && /\b(blocked|obstructed|stored material|stored pallets)\b/.test(text)) {
        return [
          makeStandard("29 CFR 1910.37", "Maintenance, safeguards, and operational features for exit routes", "Direct match: blocked exit route."),
        ];
      }

      if (/\b(hot work|combustible|fire watch)\b/.test(text)) {
        return [
          makeStandard("29 CFR 1910.252", "Welding, cutting, and brazing", "Direct match: hot-work controls near combustibles."),
        ];
      }

      if (/\b(crusher dust|silica dust|respirable dust|drill dust)\b/.test(text)) {
        return [
          makeStandard("30 CFR 56.5005", "Dust control", "Direct match: mine dust control and respirable exposure."),
          makeStandard("1926.1153", "Respirable crystalline silica", "Construction fallback context when applicable."),
        ];
      }

      if (/\b(noise|loud|crushing equipment|crusher|screen)\b/.test(text)) {
        return [
          makeStandard("30 CFR 62.110", "Noise exposure control", "Direct match: mine noise exposure and hearing conservation."),
          makeStandard("1910.95", "Occupational noise exposure", "OSHA fallback where non-mine context applies."),
        ];
      }

      return [
        makeStandard("29 CFR 1910.1200(f)(1)", "Hazard communication", "Fallback labeling or identity review."),
      ];
    },
  } as any;
}

function mockActionEngine() {
  return {
    async generateActionsFromReport() {
      return [];
    },
  } as any;
}

function mockKnowledgeRouter() {
  return {
    route(input: { text: string }) {
      const text = (input.text || "").toLowerCase();
      const mine = /\b(mine|aggregate|crusher|screen|haul road)\b/.test(text);
      const electrical = /\b(panel|breaker|cord|electrical|energized)\b/.test(text);
      return {
        jurisdiction: mine ? "msha" : "osha_general_industry",
        hazardFamily: mine ? "mining" : electrical ? "electrical" : "walking_working_surfaces",
        equipmentFamily: electrical ? "electrical" : "general",
        taskMechanism: mine ? "mine_operations" : "general_inspection",
        shardKey: "hazlenz-standard-return-contract",
        bundleIds: [],
        sourceKeys: [],
        confidence: 0.92,
        reasons: ["standard return contract regression"],
      };
    },
  } as any;
}

function mockKnowledgeShardService() {
  return {
    getShardSummary() {
      return { matchedShardCount: 0, citations: [], evidenceNeeded: [], correctiveActionPatterns: [] };
    },
  } as any;
}

function readPath(input: any, path: string) {
  return path.split(".").reduce((value, key) => {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) {
      return value.flatMap((item) => {
        if (item === undefined || item === null) return [];
        const next = item[key];
        return next === undefined || next === null ? [] : [next];
      });
    }
    return value[key];
  }, input);
}

function collectCitationValues(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(collectCitationValues);
  if (typeof value === "string") return [value];
  if (typeof value !== "object") return [];

  const direct = [
    value.citation,
    value.standard,
    value.standardNumber,
    value.code,
    value.reference,
    value.id,
    value.title,
    value.heading,
  ].filter(Boolean).map((item) => String(item));

  const nested = [
    value.referenceStandards,
    value.suggestedCitations,
    value.primaryApplicableStandards,
    value.topDefensible,
    value.candidateStandards,
    value.matchedRules,
    value.matchingReasons,
  ].flatMap(collectCitationValues);

  return [...direct, ...nested];
}

function collectFrontFacingCitations(response: any) {
  const paths = [
    "suggestedStandards",
    "primaryStandards",
    "supportingStandards",
    "candidateStandards",
    "standardDecisions",
    "standards",
    "standardsTraceability.suggestedCitations",
    "standardApplicability.suggestedStandards",
    "standardApplicability.matchedRules",
    "applicabilityIntelligence.primaryApplicableStandards",
    "standardsReasoning.topDefensible",
    "inspectionIntelligence.candidateStandards",
    "standardsMatchExplanations",
    "generatedActions.referenceStandards",
    "baseGeneratedActions.referenceStandards",
  ];

  const seen = new Set<string>();
  const citations: string[] = [];

  for (const path of paths) {
    for (const item of collectCitationValues(readPath(response, path))) {
      const text = String(item || "").trim();
      if (!text) continue;
      if (!/\d/.test(text)) continue;
      const normalized = text.toLowerCase().replace(/\s+/g, "");
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      citations.push(text);
    }
  }

  return citations;
}

const service = new SafescopeV2Service(
  mockActionEngine(),
  new EvidenceFusionService(),
  mockStandardsService(),
  undefined as any,
  {} as any,
  {} as any,
  {} as any,
  new WorkspaceGovernanceAccessService(),
  mockKnowledgeRouter(),
  mockKnowledgeShardService(),
);

const sufficientScenarios: Scenario[] = [
  {
    name: "MSHA conveyor tail pulley missing guard during cleanup",
    text: "At the aggregate mine, the conveyor tail pulley is missing a guard during cleanup.",
    scopes: ["msha_mnm_surface"],
    evidenceTexts: ["aggregate mine", "conveyor tail pulley", "cleanup"],
    expectedTop: /30 CFR 56\.14107/,
  },
  {
    name: "MSHA front-end loader near pedestrians",
    text: "A front-end loader is operating near pedestrians at the aggregate mine with no traffic control evidence.",
    scopes: ["msha_mnm_surface"],
    evidenceTexts: ["front-end loader", "pedestrians", "no traffic control", "aggregate mine"],
    expectedTop: /30 CFR 56\.9100/,
  },
  {
    name: "MSHA energized maintenance without LOTO",
    text: "Maintenance is being performed on electrically powered equipment in the mine without lockout.",
    scopes: ["msha_mnm_surface"],
    evidenceTexts: ["maintenance", "electrically powered equipment", "without lockout"],
    expectedTop: /30 CFR 56\.12016/,
  },
  {
    name: "OSHA unlabeled chemical container",
    text: "An unlabeled chemical container is stored in the maintenance shop.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["unlabeled chemical container", "maintenance shop"],
    expectedTop: /1910\.1200/,
    forbidden: [/1910\.146/],
  },
  {
    name: "OSHA tank no label",
    text: "Tank has no label and the contents are unknown.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["tank", "no label", "unknown contents"],
    expectedTop: /1910\.1200/,
    forbidden: [/1910\.146/, /1910\.147/],
  },
  {
    name: "Used oil container open near walkway",
    text: "An open container of used oil is sitting on the shop floor near a pedestrian walkway.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["open used oil container", "shop floor", "pedestrian walkway"],
    expectedTop: /1910\.22/,
    forbidden: [/1910\.101/, /1910\.147/],
  },
  {
    name: "Open breaker slot",
    text: "Open breaker slot and missing panel cover expose energized parts in a warehouse.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["open breaker slot", "missing panel cover", "energized parts"],
    expectedTop: /1910\.303\(g\)\(2\)\(i\)/,
    forbidden: [/1910\.306/, /1910\.331/, /1910\.301/],
  },
  {
    name: "Blocked electrical panel",
    text: "Stored pallets block the electrical panel working space in the warehouse.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["stored pallets", "electrical panel", "working space"],
    expectedTop: /1910\.303\(g\)\(1\)/,
    forbidden: [/1910\.132/, /1910\.331/],
  },
  {
    name: "Damaged extension cord wet area",
    text: "A damaged extension cord lies on a damp floor in the maintenance area.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["damaged extension cord", "damp floor", "maintenance area"],
    expectedTop: /1910\.334\(a\)\(2\)\(ii\)|1910\.305\(g\)/,
    forbidden: [/1910\.1200/],
  },
  {
    name: "Scrap and hoses across walkway",
    text: "Scrap material and hoses are lying across a designated pedestrian walkway.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["scrap material", "hoses", "pedestrian walkway"],
    expectedTop: /1910\.22\(a\)\(3\)|1910\.22/,
    forbidden: [/1910\.178/, /1910\.101/],
  },
  {
    name: "Unsecured oxygen cylinder",
    text: "An oxygen cylinder is standing unsecured near a shop aisle where mobile equipment passes.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["oxygen cylinder", "unsecured", "shop aisle", "mobile equipment"],
    expectedTop: /1910\.101/,
    forbidden: [/1910\.22\(a\)\(3\)/, /1910\.147/],
  },
  {
    name: "Missing cylinder valve cap",
    text: "Acetylene cylinders are stored upright but several are missing valve protection caps.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["acetylene cylinders", "missing valve protection caps"],
    expectedTop: /1910\.101/,
  },
  {
    name: "Unprotected platform edge",
    text: "Employee is working on an elevated platform without a guardrail or fall arrest.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["elevated platform", "without guardrail", "fall arrest"],
    expectedTop: /1910\.28|1926\.501/,
  },
  {
    name: "Damaged ladder in use",
    text: "Employee continues using a damaged ladder with a broken rung.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["damaged ladder", "broken rung"],
    expectedTop: /1910\.23|1926\.1053/,
  },
  {
    name: "Blocked exit route",
    text: "Emergency exit route is blocked by stored pallets and boxes.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["emergency exit", "stored pallets", "boxes"],
    expectedTop: /1910\.37|1910\.36/,
  },
  {
    name: "Hot work near combustibles",
    text: "Hot work is underway near combustible material without fire watch evidence.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["hot work", "combustible material", "no fire watch"],
    expectedTop: /1910\.252/,
  },
  {
    name: "Crusher dust silica",
    text: "Crusher dust and silica exposure at the surface aggregate mine has no sampling evidence.",
    scopes: ["msha_mnm_surface"],
    evidenceTexts: ["crusher dust", "silica", "no sampling evidence"],
    expectedTop: /30 CFR 56\.5002|30 CFR 56\.5005|1926\.1153/,
  },
  {
    name: "Crusher noise",
    text: "Crusher noise exposes miners at a surface aggregate mine without hearing conservation evidence.",
    scopes: ["msha_mnm_surface"],
    evidenceTexts: ["crusher noise", "hearing conservation evidence"],
    expectedTop: /30 CFR 62\.110|1910\.95/,
  },
];

const vagueScenarios: Scenario[] = [
  {
    name: "vague area unsafe",
    text: "Area looks unsafe.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["area looks unsafe"],
    vague: true,
  },
  {
    name: "vague equipment issue",
    text: "Equipment issue.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["equipment issue"],
    vague: true,
  },
];

async function runScenario(scenario: Scenario) {
  const response = await service.classify(
    scenario.text,
    scenario.scopes,
    scenario.evidenceTexts,
    "standard_5x5",
  );

  const frontFacingCitations = collectFrontFacingCitations(response);
  const standardDecisions = Array.isArray(response.standardDecisions) ? response.standardDecisions : [];
  const standardDecisionTexts = standardDecisions.map((decision: any) =>
    `${decision?.citation || ""} ${decision?.title || ""} ${decision?.authority || ""}`.trim(),
  );
  const topCitation = frontFacingCitations[0] || String(response.primaryStandards?.[0]?.citation || response.suggestedStandards?.[0]?.citation || "");
  const responseText = JSON.stringify(response);

  let passed = Boolean(response.classification) &&
    response.requiresHumanReview === true &&
    responseText.length > 0 &&
    response.inspectionIntelligence?.guardrails?.advisoryOnly === true &&
    response.inspectionIntelligence?.guardrails?.doesNotDeclareViolation === true &&
      !/violation confirmed|citation issued|\bnoncompliant\b|definite violation|must cite/i.test(responseText);

  if (scenario.vague) {
    passed =
      passed &&
      (response.evidenceGapQuestions?.length || 0) > 0 &&
      standardDecisions.length > 0 &&
      standardDecisions.every((decision: any) => decision.authority === "needs_more_evidence" || decision.authority === "advisory") &&
      !standardDecisions.some((decision: any) => /^(review|candidate|suggested candidate standard|fallback candidate standard|standard family|applicable standard|unknown|none|n\/a|na)$/i.test(String(decision.citation || decision.title || "")));
  } else {
    passed =
      passed &&
      frontFacingCitations.some((citation) => scenario.expectedTop!.test(citation)) &&
      !(scenario.forbidden || []).some((pattern) => pattern.test(JSON.stringify(frontFacingCitations))) &&
      (response.primaryStandards?.length || 0) >= 0 &&
      standardDecisions.some((decision: any) => scenario.expectedTop!.test(`${decision.citation} ${decision.title || ""}`)) &&
      standardDecisions.every((decision: any) => !/^(review|candidate|suggested candidate standard|fallback candidate standard|standard family|applicable standard|unknown|none|n\/a|na)$/i.test(String(decision.citation || decision.title || "")));
  }

  if (passed) {
    console.log(`PASS ${scenario.name}`);
  } else {
    console.error(`FAIL ${scenario.name}`, {
      classification: response.classification,
      topCitation,
      frontFacingCitations,
      suggestedStandards: response.suggestedStandards,
      primaryStandards: response.primaryStandards,
      standardDecisions,
      standardDecisionTexts,
      standardsTraceability: response.standardsTraceability,
      evidenceGapQuestions: response.evidenceGapQuestions,
    });
    return 1;
  }

  return 0;
}

async function run() {
  let failures = 0;
  for (const scenario of [...sufficientScenarios, ...vagueScenarios]) {
    failures += await runScenario(scenario);
  }

  if (failures > 0) process.exit(1);
  console.log(`HazLenz standard return contract regression: ${sufficientScenarios.length + vagueScenarios.length} passed, 0 failed`);
}

run();
