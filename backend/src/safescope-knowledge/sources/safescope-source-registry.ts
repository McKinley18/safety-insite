import { SafeScopeSourceRegistryEntry } from "./safescope-source-registry.types";

export const SAFESCOPE_SOURCE_REGISTRY: SafeScopeSourceRegistryEntry[] = [
  {
    sourceKey: "msha-30-cfr-standards",
    displayName: "MSHA 30 CFR Standards",
    agency: "MSHA",
    sourceType: "regulation",
    authorityTier: 1,
    allowedUse: "primary_regulatory_authority",
    baseUrl: "https://www.ecfr.gov/current/title-30",
    description:
      "Primary MSHA regulatory standards used for final citation matching and compliance applicability.",
    jurisdictionTags: [
      "msha",
      "mining",
      "metal-nonmetal",
      "coal",
      "surface",
      "underground",
    ],
    hazardTags: [],
    equipmentTags: [],
    taskTags: [],
    standardTags: ["30 CFR"],
    defaultLessonTags: ["primary authority", "regulatory standard"],
    requiresApproval: true,
    approvedForAutoIngestion: true,
    refreshCadence: "monthly",
    ingestionNotes:
      "Ingest standards by part/subpart/section. Preserve citation, heading, standard text, effective date, and jurisdiction.",
    reviewerNotes:
      "Tier 1 authority. May support primary standards if scope and applicability are established.",
  },
  {
    sourceKey: "msha-program-policy-manual",
    displayName: "MSHA Program Policy Manual",
    agency: "MSHA",
    sourceType: "policy_manual",
    authorityTier: 2,
    allowedUse: "official_guidance",
    baseUrl: "https://www.msha.gov/regulations/program-policy-manual",
    description:
      "Official MSHA policy guidance supporting interpretation and enforcement context.",
    jurisdictionTags: ["msha", "mining"],
    hazardTags: [],
    equipmentTags: [],
    taskTags: [],
    standardTags: ["MSHA PPM"],
    defaultLessonTags: ["official policy guidance", "interpretation support"],
    requiresApproval: true,
    approvedForAutoIngestion: false,
    refreshCadence: "quarterly",
    ingestionNotes:
      "Use for interpretive support only. Link guidance to specific CFR sections where possible.",
    reviewerNotes:
      "Tier 2 guidance. Should not replace CFR text, but can explain how a standard is interpreted.",
  },
  {
    sourceKey: "msha-fatality-reports",
    displayName: "MSHA Fatality Reports",
    agency: "MSHA",
    sourceType: "fatality_alert",
    authorityTier: 3,
    allowedUse: "incident_learning",
    baseUrl: "https://www.msha.gov/data-and-reports/fatality-reports/search",
    description:
      "MSHA fatality alerts and fatal accident reports used for incident learning, prevention patterns, and evidence questions.",
    jurisdictionTags: ["msha", "mining", "fatality learning"],
    hazardTags: [
      "machine guarding",
      "powered haulage",
      "electrical",
      "fall hazard",
      "ground control",
      "confined space",
      "hazardous energy",
    ],
    equipmentTags: [
      "conveyor",
      "mobile equipment",
      "loader",
      "truck",
      "electrical equipment",
    ],
    taskTags: [
      "maintenance",
      "cleanup",
      "travel",
      "inspection",
      "repair",
      "operation",
    ],
    standardTags: [
      "workplace examination",
      "machine guarding",
      "lockout tagout",
      "powered haulage",
    ],
    defaultLessonTags: [
      "fatality prevention",
      "incident learning",
      "critical controls",
    ],
    requiresApproval: true,
    approvedForAutoIngestion: true,
    refreshCadence: "weekly",
    ingestionNotes:
      "Extract title, date, mine type, accident classification, narrative, best practices, equipment, task, causal lessons, and related standards.",
    reviewerNotes:
      "Tier 3 incident learning. Supports reasoning and prevention, but does not replace primary regulatory standards.",
  },
  {
    sourceKey: "msha-safety-alerts",
    displayName: "MSHA Safety Alerts and Safety Materials",
    agency: "MSHA",
    sourceType: "best_practice_guidance",
    authorityTier: 4,
    allowedUse: "supporting_best_practice",
    baseUrl:
      "https://www.msha.gov/safety-and-health/safety-and-health-materials",
    description:
      "MSHA safety materials, alerts, and hazard prevention resources used as supporting best-practice intelligence.",
    jurisdictionTags: ["msha", "mining"],
    hazardTags: [],
    equipmentTags: [],
    taskTags: [],
    standardTags: [],
    defaultLessonTags: [
      "best practice",
      "hazard prevention",
      "training support",
    ],
    requiresApproval: true,
    approvedForAutoIngestion: false,
    refreshCadence: "monthly",
    ingestionNotes:
      "Use to enrich controls, evidence questions, training reminders, and prevention guidance.",
    reviewerNotes:
      "Tier 4 supporting guidance. Do not treat as a citation unless tied to an enforceable standard.",
  },
  {
    sourceKey: "osha-ecfr-1910",
    displayName: "OSHA 29 CFR 1910 General Industry Standards",
    agency: "OSHA",
    sourceType: "regulation",
    authorityTier: 1,
    allowedUse: "primary_regulatory_authority",
    baseUrl:
      "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1910",
    description:
      "Primary OSHA General Industry regulatory standards for citation matching and applicability reasoning.",
    jurisdictionTags: ["osha", "general industry", "1910"],
    hazardTags: [],
    equipmentTags: [],
    taskTags: [],
    standardTags: ["29 CFR 1910"],
    defaultLessonTags: ["primary authority", "regulatory standard"],
    requiresApproval: true,
    approvedForAutoIngestion: true,
    refreshCadence: "monthly",
    ingestionNotes:
      "Ingest by subpart and section. Preserve standard text, citation, heading, and subpart context.",
    reviewerNotes:
      "Tier 1 authority. Use for final OSHA General Industry citation matching.",
  },
  {
    sourceKey: "osha-ecfr-1926",
    displayName: "OSHA 29 CFR 1926 Construction Standards",
    agency: "OSHA",
    sourceType: "regulation",
    authorityTier: 1,
    allowedUse: "primary_regulatory_authority",
    baseUrl:
      "https://www.ecfr.gov/current/title-29/subtitle-B/chapter-XVII/part-1926",
    description:
      "Primary OSHA Construction regulatory standards for citation matching and applicability reasoning.",
    jurisdictionTags: ["osha", "construction", "1926"],
    hazardTags: [],
    equipmentTags: [],
    taskTags: [],
    standardTags: ["29 CFR 1926"],
    defaultLessonTags: ["primary authority", "regulatory standard"],
    requiresApproval: true,
    approvedForAutoIngestion: true,
    refreshCadence: "monthly",
    ingestionNotes:
      "Ingest by subpart and section. Preserve construction scope and standard hierarchy.",
    reviewerNotes:
      "Tier 1 authority. Use for final OSHA Construction citation matching.",
  },
  {
    sourceKey: "osha-fatality-catastrophe-data",
    displayName: "OSHA Fatality and Catastrophe Data",
    agency: "OSHA",
    sourceType: "incident_database",
    authorityTier: 3,
    allowedUse: "incident_learning",
    baseUrl: "https://www.osha.gov/ords/imis/accidentsearch.html",
    description:
      "OSHA accident investigation and fatality/catastrophe information used for incident learning patterns.",
    jurisdictionTags: ["osha", "incident learning", "fatality", "catastrophe"],
    hazardTags: [],
    equipmentTags: [],
    taskTags: [],
    standardTags: [],
    defaultLessonTags: [
      "incident learning",
      "fatality prevention",
      "case pattern",
    ],
    requiresApproval: true,
    approvedForAutoIngestion: false,
    refreshCadence: "monthly",
    ingestionNotes:
      "Extract event type, industry, hazard, task, equipment, narrative, and standards where available.",
    reviewerNotes:
      "Tier 3 incident learning. Useful for prevention patterns and scenario expansion.",
  },
  {
    sourceKey: "niosh-face-reports",
    displayName: "NIOSH FACE Reports",
    agency: "NIOSH",
    sourceType: "fatal_accident_report",
    authorityTier: 3,
    allowedUse: "incident_learning",
    baseUrl: "https://www.cdc.gov/niosh/face/",
    description:
      "NIOSH Fatality Assessment and Control Evaluation reports used for detailed fatality prevention lessons.",
    jurisdictionTags: ["niosh", "cdc", "fatality learning"],
    hazardTags: [],
    equipmentTags: [],
    taskTags: [],
    standardTags: [],
    defaultLessonTags: [
      "fatality prevention",
      "control recommendations",
      "incident learning",
    ],
    requiresApproval: true,
    approvedForAutoIngestion: false,
    refreshCadence: "monthly",
    ingestionNotes:
      "Extract incident sequence, root causes, recommendations, controls, equipment, and task context.",
    reviewerNotes:
      "Tier 3 incident learning. Strong prevention value but not primary regulatory authority.",
  },
  {
    sourceKey: "niosh-mining-publications",
    displayName: "NIOSH Mining Safety and Health Publications",
    agency: "NIOSH",
    sourceType: "research_publication",
    authorityTier: 4,
    allowedUse: "supporting_best_practice",
    baseUrl: "https://www.cdc.gov/niosh/mining/",
    description:
      "NIOSH mining research and guidance used for supporting best practices, exposure controls, and prevention strategies.",
    jurisdictionTags: ["niosh", "mining", "research"],
    hazardTags: [],
    equipmentTags: [],
    taskTags: [],
    standardTags: [],
    defaultLessonTags: [
      "research support",
      "best practice",
      "prevention guidance",
    ],
    requiresApproval: true,
    approvedForAutoIngestion: false,
    refreshCadence: "quarterly",
    ingestionNotes:
      "Use for supporting control recommendations and risk context. Tag carefully by hazard and equipment.",
    reviewerNotes:
      "Tier 4 research/best practice. Should support, not replace, regulatory standards.",
  },
  {
    sourceKey: "csb-investigation-reports",
    displayName: "Chemical Safety Board Investigation Reports",
    agency: "CSB",
    sourceType: "fatal_accident_report",
    authorityTier: 3,
    allowedUse: "incident_learning",
    baseUrl: "https://www.csb.gov/investigations/",
    description:
      "CSB investigation reports used for chemical process safety, explosion, fire, and systemic incident learning.",
    jurisdictionTags: [
      "chemical safety",
      "process safety",
      "incident learning",
    ],
    hazardTags: ["fire", "explosion", "chemical release", "process safety"],
    equipmentTags: ["tank", "vessel", "reactor", "piping", "pressure system"],
    taskTags: [
      "maintenance",
      "hot work",
      "startup",
      "shutdown",
      "chemical processing",
    ],
    standardTags: [],
    defaultLessonTags: [
      "incident learning",
      "process safety",
      "critical controls",
    ],
    requiresApproval: true,
    approvedForAutoIngestion: false,
    refreshCadence: "monthly",
    ingestionNotes:
      "Use mainly for fire, explosion, chemical, confined space, hot work, and process safety lessons.",
    reviewerNotes:
      "Tier 3 incident learning. Strong for causal reasoning and controls, not primary OSHA/MSHA citation.",
  },
  {
    sourceKey: "osha-standard-interpretations",
    displayName: "OSHA Standard Interpretations",
    agency: "OSHA",
    sourceType: "standard_interpretation",
    authorityTier: 2,
    allowedUse: "official_guidance",
    baseUrl: "https://www.osha.gov/laws-regs/standardinterpretations",
    description:
      "Official OSHA letters of interpretation used to support applicability and explain ambiguous standard requirements.",
    jurisdictionTags: [
      "osha",
      "interpretation",
      "general industry",
      "construction",
    ],
    hazardTags: [],
    equipmentTags: [],
    taskTags: [],
    standardTags: ["OSHA interpretation"],
    defaultLessonTags: ["official guidance", "interpretation support"],
    requiresApproval: true,
    approvedForAutoIngestion: false,
    refreshCadence: "monthly",
    ingestionNotes: "Map each interpretation to the relevant OSHA citation.",
    reviewerNotes:
      "Tier 2 guidance. Use to support interpretation, not as standalone primary citation.",
  },
  {
    sourceKey: "osha-safety-health-topics",
    displayName: "OSHA Safety and Health Topics",
    agency: "OSHA",
    sourceType: "best_practice_guidance",
    authorityTier: 4,
    allowedUse: "supporting_best_practice",
    baseUrl: "https://www.osha.gov/safety-management/hazard-prevention",
    description:
      "OSHA hazard-specific guidance providing best practice recognition and control recommendations.",
    jurisdictionTags: ["osha", "hazard recognition", "best practice"],
    hazardTags: [],
    equipmentTags: [],
    taskTags: [],
    standardTags: ["OSHA topic"],
    defaultLessonTags: [
      "best practice",
      "hazard recognition",
      "control support",
    ],
    requiresApproval: true,
    approvedForAutoIngestion: false,
    refreshCadence: "monthly",
    ingestionNotes: "Use for hazard recognition and control context.",
    reviewerNotes:
      "Tier 4 best-practice guidance. Not an enforceable standard, but provides strong context.",
  },
  {
    sourceKey: "osha-directives",
    displayName: "OSHA Directives",
    agency: "OSHA",
    sourceType: "best_practice_guidance",
    authorityTier: 2,
    allowedUse: "official_guidance",
    baseUrl: "https://www.osha.gov/enforcement/directives",
    description:
      "Official OSHA directives providing enforcement policy and interpretation context.",
    jurisdictionTags: ["osha", "enforcement", "policy"],
    hazardTags: [],
    equipmentTags: [],
    taskTags: [],
    standardTags: ["OSHA directive"],
    defaultLessonTags: ["official policy", "enforcement guidance"],
    requiresApproval: true,
    approvedForAutoIngestion: false,
    refreshCadence: "quarterly",
    ingestionNotes: "Extract enforcement policy context for interpretations.",
    reviewerNotes:
      "Tier 2 guidance. Supports enforcement context, not primary regulatory authority.",
  },
  {
    sourceKey: "internal-supervisor-feedback",
    displayName: "Internal Supervisor Feedback and Site Memory",
    agency: "INTERNAL",
    sourceType: "internal_learning",
    authorityTier: 5,
    allowedUse: "internal_workspace_learning",
    baseUrl: "internal://supervisor-feedback",
    description:
      "Workspace-specific accepted/rejected classifications, standard selections, corrective actions, and closure outcomes.",
    jurisdictionTags: ["workspace learning", "site memory"],
    hazardTags: [],
    equipmentTags: [],
    taskTags: [],
    standardTags: [],
    defaultLessonTags: [
      "site memory",
      "feedback learning",
      "trend intelligence",
    ],
    requiresApproval: false,
    approvedForAutoIngestion: true,
    refreshCadence: "daily",
    ingestionNotes:
      "Use to influence ranking and trend intelligence. Never allow internal feedback to override regulatory authority.",
    reviewerNotes:
      "Tier 5 internal learning. Supports prioritization and recurrence detection only.",
  },
];

export function getSafeScopeSourceByKey(sourceKey: string) {
  return SAFESCOPE_SOURCE_REGISTRY.find(
    (source) => source.sourceKey === sourceKey,
  );
}

export function getSafeScopeSourcesByAuthorityTier(authorityTier: number) {
  return SAFESCOPE_SOURCE_REGISTRY.filter(
    (source) => source.authorityTier === authorityTier,
  );
}

export function getSafeScopeSourcesByAgency(agency: string) {
  const normalized = agency.toLowerCase();
  return SAFESCOPE_SOURCE_REGISTRY.filter(
    (source) => source.agency.toLowerCase() === normalized,
  );
}

export function getApprovedAutoIngestionSources() {
  return SAFESCOPE_SOURCE_REGISTRY.filter(
    (source) => source.approvedForAutoIngestion,
  );
}
