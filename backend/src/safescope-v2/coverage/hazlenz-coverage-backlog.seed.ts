export type HazLenzCoveragePriority = "critical" | "high" | "medium" | "later";
export type HazLenzCoverageStatus =
  | "missing"
  | "route_needed"
  | "warm_shard_needed"
  | "source_ingestion_needed"
  | "review_needed"
  | "active";

export interface HazLenzCoverageBacklogItem {
  jurisdiction: "msha" | "osha_general_industry" | "osha_construction" | "unclear";
  partOrSubpart: string;
  hazardFamily: string;
  equipmentFamily: string;
  taskMechanism: string;
  candidateCitations: string[];
  sourceKeys: string[];
  title: string;
  whyItMatters: string;
  priority: HazLenzCoveragePriority;
  status: HazLenzCoverageStatus;
}

export const HAZLENZ_COVERAGE_BACKLOG: HazLenzCoverageBacklogItem[] = [
  {
    jurisdiction: "msha",
    partOrSubpart: "30 CFR Part 56",
    hazardFamily: "mobile_equipment",
    equipmentFamily: "mobile_equipment",
    taskMechanism: "struck_by",
    candidateCitations: ["30 CFR 56.14100", "30 CFR 56.14101", "30 CFR 56.14130", "30 CFR 56.9100", "30 CFR 56.9200", "30 CFR 56.9300"],
    sourceKeys: ["msha-30-cfr-56-14100", "msha-30-cfr-56-14101", "msha-30-cfr-56-14130", "msha-30-cfr-56-9100", "msha-30-cfr-56-9200", "msha-30-cfr-56-9300"],
    title: "MSHA mobile equipment, powered haulage, defects, seat belts, traffic, and berms",
    whyItMatters: "High-severity aggregate/mining exposure category. Needed for loaders, haul trucks, forklifts, pedestrian interaction, brakes, berms, and seat belt findings.",
    priority: "critical",
    status: "source_ingestion_needed",
  },
  {
    jurisdiction: "msha",
    partOrSubpart: "30 CFR Part 56",
    hazardFamily: "electrical",
    equipmentFamily: "electrical_panel",
    taskMechanism: "electrical_contact",
    candidateCitations: ["30 CFR 56.12004", "30 CFR 56.12016", "30 CFR 56.12017", "30 CFR 56.12018", "30 CFR 56.12028"],
    sourceKeys: ["msha-30-cfr-56-12004", "msha-30-cfr-56-12016", "msha-30-cfr-56-12017", "msha-30-cfr-56-12018", "msha-30-cfr-56-12028"],
    title: "MSHA electrical conductors, circuits, lockout, guarding, and grounding",
    whyItMatters: "Needed for open panels, missing covers, damaged cords, exposed energized parts, grounding, and work on power circuits at mines.",
    priority: "critical",
    status: "source_ingestion_needed",
  },
  {
    jurisdiction: "msha",
    partOrSubpart: "30 CFR Part 56",
    hazardFamily: "fall_protection",
    equipmentFamily: "platform",
    taskMechanism: "fall_from_height",
    candidateCitations: ["30 CFR 56.11001", "30 CFR 56.11002", "30 CFR 56.11012", "30 CFR 56.11014", "30 CFR 56.15005"],
    sourceKeys: ["msha-30-cfr-56-11001", "msha-30-cfr-56-11002", "msha-30-cfr-56-11012", "msha-30-cfr-56-11014", "msha-30-cfr-56-15005"],
    title: "MSHA ladders, platforms, walkways, conveyor crossings, and safety belts/lines",
    whyItMatters: "Needed for elevated work, missing handrails, unsafe access, conveyor crossing, fall arrest, and working near edges.",
    priority: "critical",
    status: "source_ingestion_needed",
  },
  {
    jurisdiction: "msha",
    partOrSubpart: "30 CFR Part 56",
    hazardFamily: "housekeeping",
    equipmentFamily: "unknown",
    taskMechanism: "housekeeping_slip_trip",
    candidateCitations: ["30 CFR 56.20003", "30 CFR 56.20011", "30 CFR 56.11001"],
    sourceKeys: ["msha-30-cfr-56-20003", "msha-30-cfr-56-20011", "msha-30-cfr-56-11001"],
    title: "MSHA housekeeping, travelways, and slipping/tripping hazards",
    whyItMatters: "Common inspection finding category. Needed for accumulations, blocked access, debris, spillage, and travelway hazards.",
    priority: "high",
    status: "source_ingestion_needed",
  },
  {
    jurisdiction: "msha",
    partOrSubpart: "30 CFR Part 56",
    hazardFamily: "fire_extinguisher",
    equipmentFamily: "unknown",
    taskMechanism: "unknown",
    candidateCitations: ["30 CFR 56.4200", "30 CFR 56.4201", "30 CFR 56.4202", "30 CFR 56.4101"],
    sourceKeys: ["msha-30-cfr-56-4200", "msha-30-cfr-56-4201", "msha-30-cfr-56-4202", "msha-30-cfr-56-4101"],
    title: "MSHA fire prevention, extinguishers, and flammable materials",
    whyItMatters: "Needed for missing extinguishers, blocked extinguishers, damaged extinguishers, fire hazards, and flammable storage.",
    priority: "high",
    status: "source_ingestion_needed",
  },
  {
    jurisdiction: "osha_general_industry",
    partOrSubpart: "29 CFR Part 1910",
    hazardFamily: "machine_guarding",
    equipmentFamily: "machine_guarding",
    taskMechanism: "guarding",
    candidateCitations: ["29 CFR 1910.212", "29 CFR 1910.219", "29 CFR 1910.147"],
    sourceKeys: ["osha-1910-212", "osha-1910-219", "osha-1910-147"],
    title: "OSHA general industry machine guarding and energy control",
    whyItMatters: "Needed for point-of-operation guarding, rotating parts, belts, pulleys, shafts, and lockout/tagout hazards outside mining.",
    priority: "critical",
    status: "source_ingestion_needed",
  },
  {
    jurisdiction: "osha_general_industry",
    partOrSubpart: "29 CFR Part 1910",
    hazardFamily: "walking_working_surfaces",
    equipmentFamily: "platform",
    taskMechanism: "fall_from_height",
    candidateCitations: ["29 CFR 1910.22", "29 CFR 1910.23", "29 CFR 1910.28", "29 CFR 1910.29", "29 CFR 1910.140"],
    sourceKeys: ["osha-1910-22", "osha-1910-23", "osha-1910-28", "osha-1910-29", "osha-1910-140"],
    title: "OSHA general industry walking-working surfaces and fall protection",
    whyItMatters: "Needed for housekeeping, ladders, stairs, guardrails, platforms, holes, openings, and fall protection in general industry.",
    priority: "critical",
    status: "source_ingestion_needed",
  },
  {
    jurisdiction: "osha_general_industry",
    partOrSubpart: "29 CFR Part 1910",
    hazardFamily: "ppe",
    equipmentFamily: "unknown",
    taskMechanism: "unknown",
    candidateCitations: ["29 CFR 1910.132", "29 CFR 1910.133", "29 CFR 1910.134", "29 CFR 1910.135", "29 CFR 1910.136", "29 CFR 1910.138", "29 CFR 1910.95"],
    sourceKeys: ["osha-1910-132", "osha-1910-133", "osha-1910-134", "osha-1910-135", "osha-1910-136", "osha-1910-138", "osha-1910-95"],
    title: "OSHA general industry PPE, respiratory protection, and hearing conservation",
    whyItMatters: "Needed for eye/face, hand, foot, head, respiratory, hearing, and general PPE assessment.",
    priority: "high",
    status: "source_ingestion_needed",
  },
  {
    jurisdiction: "osha_construction",
    partOrSubpart: "29 CFR Part 1926",
    hazardFamily: "excavation_trenching",
    equipmentFamily: "unknown",
    taskMechanism: "caught_in_between",
    candidateCitations: ["29 CFR 1926.650", "29 CFR 1926.651", "29 CFR 1926.652"],
    sourceKeys: ["osha-1926-650", "osha-1926-651", "osha-1926-652"],
    title: "OSHA construction excavation and trenching",
    whyItMatters: "High-fatality construction category. Needed for cave-in protection, spoil piles, access/egress, inspections, utilities, and competent-person review.",
    priority: "critical",
    status: "source_ingestion_needed",
  },
  {
    jurisdiction: "osha_construction",
    partOrSubpart: "29 CFR Part 1926",
    hazardFamily: "scaffolds",
    equipmentFamily: "platform",
    taskMechanism: "fall_from_height",
    candidateCitations: ["29 CFR 1926.451", "29 CFR 1926.452", "29 CFR 1926.454"],
    sourceKeys: ["osha-1926-451", "osha-1926-452", "osha-1926-454"],
    title: "OSHA construction scaffolds",
    whyItMatters: "Needed for scaffold platforms, guardrails, access, planking, competent-person inspection, training, and fall exposure.",
    priority: "high",
    status: "source_ingestion_needed",
  },
  {
    jurisdiction: "osha_construction",
    partOrSubpart: "29 CFR Part 1926",
    hazardFamily: "ladders",
    equipmentFamily: "ladder",
    taskMechanism: "fall_from_height",
    candidateCitations: ["29 CFR 1926.1053", "29 CFR 1926.1060"],
    sourceKeys: ["osha-1926-1053", "osha-1926-1060"],
    title: "OSHA construction ladders",
    whyItMatters: "Needed for ladder condition, access, angle, extension, securement, training, and fall exposure.",
    priority: "high",
    status: "source_ingestion_needed",
  }
];
