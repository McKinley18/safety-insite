export type HazardSeverity = "low" | "medium" | "high" | "critical";

export type HazardSignal = {
  term: string;
  weight: number;
};

export type HazardProfile = {
  id: string;
  label: string;
  family: string;
  strongSignals: HazardSignal[];
  moderateSignals: HazardSignal[];
  weakSignals: HazardSignal[];
  negativeSignals: HazardSignal[];
  contextBoosts: HazardSignal[];
  commonConsequences: string[];
  requiredControls: string[];
  defaultSeverity: HazardSeverity;
  defaultSeverityScore: 1 | 2 | 3 | 4 | 5;
  defaultLikelihoodScore: 1 | 2 | 3 | 4 | 5;
  humanReviewTriggers: string[];
};

export const HAZARD_TAXONOMY: HazardProfile[] = [
  {
    id: "personal_protective_equipment",
    label: "Personal Protective Equipment",
    family: "Personal Protective Equipment",
    strongSignals: [
      { term: "safety glasses", weight: 10 },
      { term: "eye protection", weight: 10 },
      { term: "goggles", weight: 9 },
      { term: "face shield", weight: 9 },
      { term: "steel chip", weight: 9 },
      { term: "eye injury", weight: 9 }
    ],
    moderateSignals: [
      { term: "protective eyewear", weight: 6 },
      { term: "flying particles", weight: 6 }
    ],
    weakSignals: [],
    negativeSignals: [
      { term: "silica", weight: -50 },
      { term: "dust", weight: -50 },
      { term: "noise", weight: -18 },
      { term: "crusher", weight: -18 },
      { term: "grinder", weight: -18 },
      { term: "jackhammer", weight: -18 },
      { term: "hearing protection", weight: -14 },
      { term: "earplugs", weight: -14 },
      { term: "earmuffs", weight: -14 }
    ],
    contextBoosts: [],
    commonConsequences: ["eye injury", "vision loss"],
    requiredControls: ["use approved safety glasses", "wear face shield"],
    defaultSeverity: "high",
    defaultSeverityScore: 3,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["eye protection missing", "inadequate eye shielding"]
  },
  {
    id: "drowning_hazards",
    label: "Drowning Hazards",
    family: "Drowning Hazards",
    strongSignals: [
      { term: "drowned", weight: 10 },
      { term: "drowning", weight: 10 },
      { term: "sediment pond", weight: 10 },
      { term: "settling pond", weight: 10 },
      { term: "personal flotation device", weight: 10 },
      { term: "PFD", weight: 10 }
    ],
    moderateSignals: [
      { term: "water hazard", weight: 6 },
      { term: "pond", weight: 5 },
      { term: "flotation", weight: 5 }
    ],
    weakSignals: [],
    negativeSignals: [{ term: "guarding", weight: -50 }, { term: "fall protection", weight: -50 }],
    contextBoosts: [],
    commonConsequences: ["drowning", "asphyxiation"],
    requiredControls: ["provide flotation devices", "install pond edge markers"],
    defaultSeverity: "critical",
    defaultSeverityScore: 4,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["unprotected water hazard", "missing PFD"]
  },
  {
    id: "ground_control",
    label: "Ground Control / Highwall / Roof Fall",
    family: "Ground Control",
    strongSignals: [
      { term: "highwall collapse", weight: 10 },
      { term: "roof fall", weight: 10 },
      { term: "fall of ground", weight: 10 },
      { term: "bench collapse", weight: 9 },
      { term: "highwall failure", weight: 9 }
    ],
    moderateSignals: [
      { term: "scaling failure", weight: 6 },
      { term: "face slough", weight: 6 },
      { term: "roof support collapse", weight: 6 }
    ],
    weakSignals: [],
    negativeSignals: [],
    contextBoosts: [],
    commonConsequences: ["entrapment", "crush injury"],
    requiredControls: ["scaling procedures", "roof support"],
    defaultSeverity: "critical",
    defaultSeverityScore: 4,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["highwall instability", "unprotected face"]
  },
  {
    id: "machine_guarding",
    label: "Machine Guarding",
    family: "Machine",
    strongSignals: [
      { term: "unguarded rotating shaft", weight: 10 },
      { term: "unguarded shaft", weight: 9 },
      { term: "missing guard", weight: 9 },
      { term: "guard removed", weight: 8 },
      { term: "moving parts", weight: 8 },
      { term: "pinch point", weight: 8 },
      { term: "conveyor drive", weight: 8 },
      { term: "tail pulley", weight: 8 },
      { term: "exposed rotating", weight: 8 },
      { term: "within reach of moving parts", weight: 10 }
    ],
    moderateSignals: [
      { term: "guard", weight: 4 },
      { term: "pulley", weight: 5 },
      { term: "chain", weight: 4 },
      { term: "gear", weight: 4 },
      { term: "belt drive", weight: 5 },
      { term: "rotating", weight: 5 },
      { term: "nip point", weight: 6 }
    ],
    weakSignals: [
      { term: "machine", weight: 2 },
      { term: "equipment", weight: 1 },
      { term: "drive", weight: 2 }
    ],
    negativeSignals: [
      { term: "electrical panel", weight: -6 },
      { term: "live wire", weight: -8 },
      { term: "chemical container", weight: -5 },
      { term: "clutter", weight: -12 },
      { term: "housekeeping", weight: -12 },
      { term: "boxes", weight: -12 },
      { term: "scrap", weight: -12 },
      { term: "hallway", weight: -10 },
      { term: "travel path", weight: -10 },
      { term: "trip hazard", weight: -14 }
    ],
    contextBoosts: [
      { term: "operating", weight: 3 },
      { term: "running", weight: 3 },
      { term: "employee exposed", weight: 3 },
      { term: "worker exposed", weight: 3 }
    ],
    commonConsequences: ["amputation", "entanglement", "crushing injury"],
    requiredControls: ["fixed guarding", "interlocked guarding", "lockout/tagout before repair", "pre-use inspection"],
    defaultSeverity: "high",
    defaultSeverityScore: 4,
    defaultLikelihoodScore: 4,
    humanReviewTriggers: ["unguarded moving part", "possible amputation exposure", "equipment running"]
  },
  {
    id: "electrical",
    label: "Electrical",
    family: "Electrical",
    strongSignals: [
      { term: "live wire", weight: 10 },
      { term: "exposed conductor", weight: 10 },
      { term: "exposed wiring", weight: 9 },
      { term: "open electrical panel", weight: 9 },
      { term: "energized circuit", weight: 9 },
      { term: "arc flash", weight: 10 },
      { term: "damaged insulation", weight: 8 },
      { term: "missing knockout", weight: 7 }
    ],
    moderateSignals: [
      { term: "electrical", weight: 5 },
      { term: "wire", weight: 4 },
      { term: "cord", weight: 4 },
      { term: "conductor", weight: 5 },
      { term: "panel", weight: 4 },
      { term: "breaker", weight: 4 },
      { term: "voltage", weight: 5 }
    ],
    weakSignals: [
      { term: "exposed", weight: 1 },
      { term: "power", weight: 2 }
    ],
    negativeSignals: [
      { term: "exposed rotating", weight: -8 },
      { term: "exposed moving parts", weight: -8 },
      { term: "unguarded shaft", weight: -8 },
      { term: "conveyor drive", weight: -6 }
    ],
    contextBoosts: [
      { term: "energized", weight: 5 },
      { term: "shock", weight: 5 },
      { term: "burn", weight: 3 },
      { term: "qualified electrician", weight: 3 }
    ],
    commonConsequences: ["electric shock", "electrocution", "arc flash burn", "fire"],
    requiredControls: ["de-energize", "lockout/tagout", "qualified electrical repair", "approved enclosure", "maintain working clearance"],
    defaultSeverity: "critical",
    defaultSeverityScore: 5,
    defaultLikelihoodScore: 4,
    humanReviewTriggers: ["energized exposure", "shock potential", "arc flash potential"]
  },
  {
    id: "walking_working_surfaces",
    label: "Walking/Working Surfaces",
    family: "Housekeeping",
    strongSignals: [
      { term: "blocked walkway", weight: 8 },
      { term: "oil spill", weight: 8 },
      { term: "slip hazard", weight: 8 },
      { term: "trip hazard", weight: 8 },
      { term: "walkway obstruction", weight: 8 },
      { term: "unsafe access", weight: 8 }
    ],
    moderateSignals: [
      { term: "debris", weight: 5 },
      { term: "clutter", weight: 5 },
      { term: "blocked", weight: 4 },
      { term: "spill", weight: 5 },
      { term: "aisle", weight: 4 },
      { term: "access blocked", weight: 6 }
    ],
    weakSignals: [
      { term: "housekeeping", weight: 3 },
      { term: "cleanup", weight: 2 }
    ],
    negativeSignals: [],
    contextBoosts: [
      { term: "travelway", weight: 4 },
      { term: "pedestrian", weight: 3 },
      { term: "emergency exit", weight: 4 }
    ],
    commonConsequences: ["slip", "trip", "fall", "delayed emergency egress"],
    requiredControls: ["remove obstruction", "clean spill", "maintain clear access", "mark walkway"],
    defaultSeverity: "medium",
    defaultSeverityScore: 3,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["blocked emergency route", "repeated housekeeping issue"]
  },
  {
    id: "falls",
    label: "Fall Protection",
    family: "Fall",
    strongSignals: [
      { term: "unguarded edge", weight: 10 },
      { term: "missing guardrail", weight: 10 },
      { term: "open edge", weight: 9 },
      { term: "unprotected side", weight: 9 },
      { term: "no fall protection", weight: 10 },
      { term: "working at height", weight: 8 }
    ],
    moderateSignals: [
      { term: "ladder", weight: 4 },
      { term: "mezzanine", weight: 6 },
      { term: "platform", weight: 5 },
      { term: "roof", weight: 5 },
      { term: "elevated", weight: 5 },
      { term: "guardrail", weight: 4 }
    ],
    weakSignals: [
      { term: "fall", weight: 3 },
      { term: "height", weight: 3 }
    ],
    negativeSignals: [],
    contextBoosts: [
      { term: "six feet", weight: 4 },
      { term: "above lower level", weight: 5 },
      { term: "near edge", weight: 5 }
    ],
    commonConsequences: ["fall to lower level", "fatal injury", "fracture"],
    requiredControls: ["guardrail", "personal fall arrest", "cover openings", "ladder secured"],
    defaultSeverity: "critical",
    defaultSeverityScore: 5,
    defaultLikelihoodScore: 4,
    humanReviewTriggers: ["fall to lower level", "unprotected edge", "missing guardrail"]
  },
  {
    id: "mobile_equipment",
    label: "Mobile Equipment / Traffic",
    family: "Powered Mobile Equipment",
    strongSignals: [
      { term: "forklift near pedestrians", weight: 10 },
      { term: "no traffic control", weight: 9 },
      { term: "backing alarm not working", weight: 9 },
      { term: "pedestrian struck by", weight: 10 },
      { term: "haul truck traffic", weight: 8 }
    ],
    moderateSignals: [
      { term: "forklift", weight: 5 },
      { term: "loader", weight: 5 },
      { term: "haul truck", weight: 6 },
      { term: "mobile equipment", weight: 6 },
      { term: "spotter", weight: 4 },
      { term: "pedestrian", weight: 4 },
      { term: "vehicle", weight: 4 }
    ],
    weakSignals: [
      { term: "traffic", weight: 3 },
      { term: "backup", weight: 3 }
    ],
    negativeSignals: [],
    contextBoosts: [
      { term: "blind spot", weight: 4 },
      { term: "intersection", weight: 3 },
      { term: "congested area", weight: 3 }
    ],
    commonConsequences: ["struck-by injury", "crushing injury", "fatality"],
    requiredControls: ["traffic control plan", "separate pedestrians", "working backup alarm", "spotter", "high visibility PPE"],
    defaultSeverity: "high",
    defaultSeverityScore: 4,
    defaultLikelihoodScore: 4,
    humanReviewTriggers: ["pedestrian exposure", "backup alarm failure", "blind spot"]
  },
  {
    id: "hazard_communication",
    label: "Hazard Communication",
    family: "Hazard Communication",
    strongSignals: [
      { term: "unlabeled chemical", weight: 10 },
      { term: "missing chemical label", weight: 9 },
      { term: "secondary container unlabeled", weight: 9 },
      { term: "no sds", weight: 8 }
    ],
    moderateSignals: [
      { term: "chemical container", weight: 5 },
      { term: "sds", weight: 5 },
      { term: "hazcom", weight: 6 },
      { term: "safety data sheet", weight: 6 },
      { term: "hazcom training", weight: 7 },
      { term: "training records", weight: 7 },
      { term: "missing training", weight: 7 }
    ],
    weakSignals: [
      { term: "chemical", weight: 3 },
      { term: "label", weight: 3 },
      { term: "training", weight: 4 },
      { term: "records", weight: 3 }
    ],
    negativeSignals: [],
    contextBoosts: [
      { term: "unknown substance", weight: 5 },
      { term: "corrosive", weight: 4 },
      { term: "flammable", weight: 4 }
    ],
    commonConsequences: ["chemical exposure", "improper emergency response", "incompatible storage"],
    requiredControls: ["label container", "provide SDS", "train employees", "verify chemical identity"],
    defaultSeverity: "medium",
    defaultSeverityScore: 3,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["unknown chemical", "corrosive exposure", "missing SDS"]
  },
{
    id: "confined_space",
    label: "Confined Space",
    family: "Confined Space",
    strongSignals: [
      { term: "permit required confined space", weight: 10 },
      { term: "confined space entry", weight: 10 },
      { term: "tank entry", weight: 8 },
      { term: "vessel entry", weight: 8 },
      { term: "atmospheric testing not performed", weight: 10 },
      { term: "no attendant", weight: 8 }
    ],
    moderateSignals: [
      { term: "confined space", weight: 7 },
      { term: "permit space", weight: 7 },
      { term: "oxygen deficient", weight: 7 },
      { term: "engulfment", weight: 7 },
      { term: "entry permit", weight: 6 }
    ],
    weakSignals: [
      { term: "tank", weight: 2 },
      { term: "vessel", weight: 2 },
      { term: "entry", weight: 2 }
    ],
    negativeSignals: [],
    contextBoosts: [
      { term: "inside", weight: 3 },
      { term: "rescue plan", weight: 4 },
      { term: "ventilation", weight: 3 }
    ],
    commonConsequences: ["asphyxiation", "toxic exposure", "engulfment", "fatality"],
    requiredControls: ["entry permit", "atmospheric testing", "attendant", "rescue plan", "ventilation"],
    defaultSeverity: "critical",
    defaultSeverityScore: 5,
    defaultLikelihoodScore: 4,
    humanReviewTriggers: ["permit space entry", "atmospheric hazard", "rescue readiness"]
  },
  {
    id: "fire_explosion",
    label: "Fire / Explosion",
    family: "Fire",
    strongSignals: [
      { term: "flammable vapors near ignition source", weight: 10 },
      { term: "fuel leak near hot work", weight: 10 },
      { term: "combustible dust accumulation", weight: 9 },
      { term: "fire extinguisher missing", weight: 8 },
      { term: "explosion hazard", weight: 10 },
      { term: "natural gas odor", weight: 9 },
      { term: "gas odor", weight: 8 },
      { term: "gas leak", weight: 8 }
    ],
    moderateSignals: [
      { term: "flammable", weight: 5 },
      { term: "combustible", weight: 5 },
      { term: "ignition source", weight: 6 },
      { term: "hot work", weight: 6 },
      { term: "sparks", weight: 5 },
      { term: "fire extinguisher", weight: 5 },
      { term: "extinguisher", weight: 5 },
      { term: "sprinkler", weight: 5 },
      { term: "boiler room", weight: 5 },
      { term: "smell of gas", weight: 6 }
    ],
    weakSignals: [
      { term: "fire", weight: 3 },
      { term: "fuel", weight: 3 }
    ],
    negativeSignals: [],
    contextBoosts: [
      { term: "near welding", weight: 4 },
      { term: "storage area", weight: 2 },
      { term: "poor ventilation", weight: 3 }
    ],
    commonConsequences: ["burn injury", "explosion", "property loss", "fatality"],
    requiredControls: ["remove ignition source", "control flammables", "provide fire extinguisher", "hot work permit", "ventilation"],
    defaultSeverity: "critical",
    defaultSeverityScore: 5,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["flammable atmosphere", "combustible dust", "hot work exposure"]
  },
  {
    id: "loto_stored_energy",
    label: "Lockout / Stored Energy",
    family: "LOTO",
    strongSignals: [
      { term: "unexpected startup", weight: 10 },
      { term: "lockout not applied", weight: 10 },
      { term: "stored energy not released", weight: 10 },
      { term: "maintenance without lockout", weight: 10 },
      { term: "equipment energized during maintenance", weight: 10 }
    ],
    moderateSignals: [
      { term: "lockout", weight: 6 },
      { term: "tagout", weight: 6 },
      { term: "stored energy", weight: 7 },
      { term: "hydraulic pressure", weight: 6 },
      { term: "pneumatic pressure", weight: 6 },
      { term: "maintenance", weight: 4 }
    ],
    weakSignals: [
      { term: "service", weight: 2 },
      { term: "repair", weight: 2 },
      { term: "jam", weight: 3 }
    ],
    negativeSignals: [],
    contextBoosts: [
      { term: "unguarded moving parts", weight: 4 },
      { term: "zero energy", weight: 4 },
      { term: "blocked equipment", weight: 3 }
    ],
    commonConsequences: ["crushing injury", "amputation", "electrocution", "fatality"],
    requiredControls: ["lockout/tagout", "verify zero energy", "release stored energy", "authorized employee procedure"],
    defaultSeverity: "critical",
    defaultSeverityScore: 5,
    defaultLikelihoodScore: 4,
    humanReviewTriggers: ["maintenance exposure", "unexpected startup", "stored energy"]
  },
  {
    id: "respirable_dust_silica",
    label: "Respirable Dust / Silica",
    family: "Industrial Hygiene",
    strongSignals: [
      { term: "visible silica dust", weight: 9 },
      { term: "respirable dust exposure", weight: 10 },
      { term: "dry cutting concrete", weight: 9 },
      { term: "no dust control", weight: 8 },
      { term: "dust collector not working", weight: 8 }
    ],
    moderateSignals: [
      { term: "silica", weight: 7 },
      { term: "respirable dust", weight: 7 },
      { term: "dust cloud", weight: 6 },
      { term: "sweeping dust", weight: 5 },
      { term: "crusher dust", weight: 5 },
      { term: "crusher", weight: 5 },
      { term: "grinder", weight: 5 },
      { term: "aggregate plant", weight: 5 },
      { term: "material handling", weight: 4 }
    ],
    weakSignals: [
      { term: "dust", weight: 3 },
      { term: "respirator", weight: 2 }
    ],
    negativeSignals: [],
    contextBoosts: [
      { term: "no water suppression", weight: 4 },
      { term: "no ventilation", weight: 3 },
      { term: "employees breathing dust", weight: 4 }
    ],
    commonConsequences: ["silicosis", "lung disease", "respiratory irritation"],
    requiredControls: ["wet methods", "local exhaust ventilation", "dust collection", "respiratory protection", "exposure assessment"],
    defaultSeverity: "high",
    defaultSeverityScore: 4,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["silica exposure", "visible dust cloud", "failed dust controls"]
  },
  {
    id: "noise_exposure",
    label: "Noise Exposure",
    family: "Industrial Hygiene",
    strongSignals: [
      { term: "noise exposure", weight: 10 },
      { term: "hearing conservation", weight: 10 },
      { term: "crusher noise", weight: 10 },
      { term: "loud equipment", weight: 9 },
      { term: "noise survey", weight: 9 },
      { term: "dosimetry", weight: 9 }
    ],
    moderateSignals: [
      { term: "noise", weight: 6 },
      { term: "loud", weight: 5 },
      { term: "decibel", weight: 6 },
      { term: "dba", weight: 6 },
      { term: "sound level", weight: 6 },
      { term: "hearing protection", weight: 5 },
      { term: "earplugs", weight: 5 },
      { term: "earmuffs", weight: 5 },
      { term: "grinder", weight: 6 },
      { term: "crusher", weight: 6 },
      { term: "jackhammer", weight: 6 },
      { term: "saw", weight: 5 }
    ],
    weakSignals: [
      { term: "hearing", weight: 2 },
      { term: "sound", weight: 2 }
    ],
    negativeSignals: [
      { term: "safety glasses", weight: -20 },
      { term: "eye protection", weight: -20 }
    ],
    contextBoosts: [
      { term: "audiogram", weight: 4 },
      { term: "monitoring", weight: 3 },
      { term: "hearing protection", weight: 3 }
    ],
    commonConsequences: ["hearing loss", "tinnitus", "communication interference"],
    requiredControls: ["measure noise", "control source", "provide hearing protection", "hearing conservation program"],
    defaultSeverity: "medium",
    defaultSeverityScore: 3,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["extended high-noise exposure", "hearing protection reliance", "employee symptoms"]
  },
  {
    id: "emergency_egress",
    label: "Emergency Egress",
    family: "Emergency Preparedness",
    strongSignals: [
      { term: "emergency exit blocked", weight: 10 },
      { term: "exit door locked", weight: 10 },
      { term: "exit route obstructed", weight: 9 },
      { term: "no exit signage", weight: 8 }
    ],
    moderateSignals: [
      { term: "exit", weight: 4 },
      { term: "egress", weight: 6 },
      { term: "blocked exit", weight: 8 },
      { term: "exit sign", weight: 5 },
      { term: "emergency route", weight: 6 }
    ],
    weakSignals: [
      { term: "door", weight: 2 },
      { term: "route", weight: 2 }
    ],
    negativeSignals: [],
    contextBoosts: [
      { term: "during shift", weight: 3 },
      { term: "occupied", weight: 3 },
      { term: "fire", weight: 4 }
    ],
    commonConsequences: ["delayed evacuation", "entrapment", "fatality during emergency"],
    requiredControls: ["clear exit route", "unlock exit door", "maintain exit signage", "inspect emergency routes"],
    defaultSeverity: "critical",
    defaultSeverityScore: 5,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["blocked exit", "locked exit", "occupied building"]
  },
  {
    id: "trenching_shoring",
    label: "Trenching & Shoring",
    family: "Trenching & Shoring",
    strongSignals: [
      { term: "trench", weight: 10 },
      { term: "excavation", weight: 9 },
      { term: "shoring", weight: 10 },
      { term: "sloping", weight: 9 },
      { term: "benching", weight: 9 },
      { term: "trench box", weight: 10 },
      { term: "excavation depth", weight: 8 },
      { term: "cave-in", weight: 10 },
      { term: "digging", weight: 8 }
    ],
    moderateSignals: [
      { term: "clay", weight: 5 },
      { term: "sandy", weight: 5 },
      { term: "excavated", weight: 5 },
      { term: "soil", weight: 6 }
    ],
    weakSignals: [
      { term: "dig", weight: 3 },
      { term: "ground", weight: 2 },
      { term: "dirt", weight: 1 }
    ],
    negativeSignals: [],
    contextBoosts: [
      { term: "cave-in potential", weight: 5 },
      { term: "deep excavation", weight: 4 }
    ],
    commonConsequences: ["cave-in engulfment", "suffocation", "fatality"],
    requiredControls: ["trench box", "shoring system", "sloping or benching", "ladder for egress", "keep spoils 2ft back"],
    defaultSeverity: "critical",
    defaultSeverityScore: 5,
    defaultLikelihoodScore: 4,
    humanReviewTriggers: ["unprotected trench deeper than 5ft", "excavation cave-in hazard"]
  },
  {
    id: "lifting_rigging",
    label: "Lifting & Rigging",
    family: "Lifting & Rigging",
    strongSignals: [
      { term: "wire rope sling", weight: 10 },
      { term: "crane lifting", weight: 10 },
      { term: "damaged sling", weight: 9 },
      { term: "frayed sling", weight: 9 },
      { term: "overhead crane", weight: 9 },
      { term: "spreader bar", weight: 9 },
      { term: "lifting frame", weight: 8 },
      { term: "hoisting hook", weight: 9 },
      { term: "rigging", weight: 9 }
    ],
    moderateSignals: [
      { term: "sling", weight: 6 },
      { term: "hoisting", weight: 6 },
      { term: "crane", weight: 5 },
      { term: "shackle", weight: 5 },
      { term: "lifting", weight: 5 }
    ],
    weakSignals: [
      { term: "hook", weight: 3 },
      { term: "cable", weight: 2 }
    ],
    negativeSignals: [],
    contextBoosts: [
      { term: "overhead lift", weight: 4 },
      { term: "cracked weld", weight: 5 }
    ],
    commonConsequences: ["dropped load", "struck-by fatality", "rigging failure"],
    requiredControls: ["remove damaged rigging", "install hook safety latch", "conduct daily rigging inspection", "do not stand under load"],
    defaultSeverity: "high",
    defaultSeverityScore: 4,
    defaultLikelihoodScore: 4,
    humanReviewTriggers: ["damaged hoisting line", "loose overhead load", "missing hook safety latch"]
  },
  {
    id: "material_handling",
    label: "Material Handling",
    family: "Material Handling",
    strongSignals: [
      { term: "spill kit blocked", weight: 9 },
      { term: "scrap metal rack", weight: 8 },
      { term: "timber stack leaning", weight: 9 },
      { term: "unstable lumber", weight: 9 },
      { term: "banding strap", weight: 8 },
      { term: "raw materials stacked", weight: 9 }
    ],
    moderateSignals: [
      { term: "storage rack", weight: 5 },
      { term: "pallet stack", weight: 5 },
      { term: "lumber stack", weight: 6 },
      { term: "spill kit", weight: 5 }
    ],
    weakSignals: [
      { term: "stack", weight: 2 },
      { term: "box", weight: 1 },
      { term: "rack", weight: 2 }
    ],
    negativeSignals: [],
    contextBoosts: [
      { term: "load securement", weight: 4 }
    ],
    commonConsequences: ["falling materials injury", "blocked emergency access spill kit", "trip from loose bands"],
    requiredControls: ["restack raw materials safely", "clear emergency spill kit", "organize scrap metal racks"],
    defaultSeverity: "medium",
    defaultSeverityScore: 3,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["unstable material stack", "blocked safety response gear"]
  },
  {
    id: "scaffolds",
    label: "Scaffolds",
    family: "Scaffolds",
    strongSignals: [
      { term: "scaffold legs resting on stacked bricks", weight: 10 },
      { term: "scaffold platform missing guardrails", weight: 10 },
      { term: "scaffold platform", weight: 9 },
      { term: "scaffold outrigger", weight: 9 },
      { term: "supported scaffold", weight: 9 },
      { term: "mobile scaffold", weight: 9 },
      { term: "rolling scaffold", weight: 9 }
    ],
    moderateSignals: [
      { term: "scaffold", weight: 6 },
      { term: "scaffolding", weight: 6 },
      { term: "scaffold frame", weight: 6 },
      { term: "scaffold platform", weight: 6 },
      { term: "scaffold plank", weight: 6 },
      { term: "mudsill", weight: 5 },
      { term: "baseplate", weight: 5 },
      { term: "outrigger", weight: 5 },
      { term: "cross brace", weight: 4 },
      { term: "scaffold access", weight: 5 },
      { term: "scaffold deck", weight: 5 }
    ],
    weakSignals: [
      { term: "plank", weight: 3 },
      { term: "deck", weight: 2 },
      { term: "base", weight: 2 }
    ],
    negativeSignals: [],
    contextBoosts: [],
    commonConsequences: ["fall from height", "scaffold collapse", "struck-by falling object"],
    requiredControls: ["install mudsills and baseplates", "install scaffold guardrails", "secure work platform", "provide safe ladder access"],
    defaultSeverity: "high",
    defaultSeverityScore: 4,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["scaffold platform without guardrails", "scaffold on unstable base"]
  },
  {
    id: "compressed_gas_cylinders",
    label: "Compressed Gas Cylinders",
    family: "Compressed Gas Cylinders",
    strongSignals: [
      { term: "oxygen and acetylene stored directly touching", weight: 10 },
      { term: "unsecured gas cylinder", weight: 10 },
      { term: "protective valve cap missing", weight: 9 },
      { term: "high pressure cylinder", weight: 9 },
      { term: "cylinder rack loose", weight: 9 }
    ],
    moderateSignals: [
      { term: "gas cylinder", weight: 6 },
      { term: "oxygen cylinder", weight: 6 },
      { term: "acetylene cylinder", weight: 6 },
      { term: "compressed gas", weight: 6 },
      { term: "cylinder cap", weight: 5 },
      { term: "cylinder valve", weight: 5 },
      { term: "regulator", weight: 4 },
      { term: "manifold", weight: 4 },
      { term: "chained upright", weight: 5 },
      { term: "unsecured cylinder", weight: 6 },
      { term: "cylinder storage", weight: 5 },
      { term: "fuel gas cylinder", weight: 6 }
    ],
    weakSignals: [
      { term: "cylinder", weight: 3 },
      { term: "gas", weight: 0 },
      { term: "cap", weight: 2 }
    ],
    negativeSignals: [
      { term: "natural gas", weight: -20 },
      { term: "gas odor", weight: -18 },
      { term: "smell of gas", weight: -18 },
      { term: "smells like gas", weight: -18 },
      { term: "gas smell", weight: -18 },
      { term: "gas leak", weight: -18 },
      { term: "gas line", weight: -16 },
      { term: "no cylinder", weight: -24 },
      { term: "no cylinders", weight: -24 },
      { term: "without cylinder", weight: -24 },
      { term: "not a cylinder", weight: -24 },
      { term: "heater cycles", weight: -12 },
      { term: "heater cycle", weight: -12 },
      { term: "boiler room", weight: -12 }
    ],
    contextBoosts: [],
    commonConsequences: ["cylinder projectile", "explosion", "toxic or flammable gas release"],
    requiredControls: ["secure cylinders upright", "install protective valve caps", "separate incompatible gas cylinders"],
    defaultSeverity: "high",
    defaultSeverityScore: 4,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["unsecured gas cylinder", "damaged cylinder valve"]
  },
  {
    id: "compressed_air_hose_safety",
    label: "Compressed Air / Hose Safety",
    family: "Compressed Air / Hose Safety",
    strongSignals: [
      { term: "air compressor hose without safety whipcheck", weight: 10 },
      { term: "air nozzle pressure", weight: 9 },
      { term: "clothing blowdown", weight: 9 },
      { term: "damaged hose clamp connector", weight: 9 },
      { term: "receiver tank missing pressure relief", weight: 9 }
    ],
    moderateSignals: [
      { term: "compressed air hose", weight: 6 },
      { term: "high pressure air line", weight: 6 },
      { term: "whipcheck", weight: 6 },
      { term: "whip check", weight: 6 },
      { term: "safety chain", weight: 5 },
      { term: "hose coupling", weight: 5 },
      { term: "hose connector", weight: 5 },
      { term: "compressor hose", weight: 6 },
      { term: "air line connector", weight: 6 },
      { term: "pneumatic line", weight: 6 },
      { term: "hose restraint", weight: 6 }
    ],
    weakSignals: [
      { term: "hose", weight: 3 },
      { term: "air", weight: 2 },
      { term: "clamp", weight: 2 }
    ],
    negativeSignals: [],
    contextBoosts: [],
    commonConsequences: ["whipping hose impact", "flying particles under pressure", "pressure vessel rupture"],
    requiredControls: ["install whipcheck safety device", "reduce nozzle pressure below 30 psi", "inspect hose clamps regularly", "install pressure relief valve"],
    defaultSeverity: "high",
    defaultSeverityScore: 4,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["unsecured air hose", "excessive nozzle pressure"]
  },
  {
    id: "chemical_storage",
    label: "Chemical Storage",
    family: "Chemical Storage",
    strongSignals: [
      { term: "acid and base drums stored on same rack", weight: 10 },
      { term: "secondary containment tub full of water", weight: 10 },
      { term: "cracked outer jacket on corrosive chemical tote", weight: 9 },
      { term: "reactive chemicals without drainage containment", weight: 9 },
      { term: "spigot showing continuous slow drip", weight: 9 }
    ],
    moderateSignals: [
      { term: "chemical storage", weight: 6 },
      { term: "drum storage", weight: 6 },
      { term: "solvent drum", weight: 6 },
      { term: "acid drum", weight: 6 },
      { term: "containment", weight: 5 },
      { term: "secondary containment", weight: 6 },
      { term: "incompatible chemicals", weight: 6 },
      { term: "corrosive storage", weight: 6 },
      { term: "flammable storage cabinet", weight: 6 },
      { term: "chemical pallet", weight: 5 },
      { term: "leaking drum", weight: 6 },
      { term: "transfer piping containment", weight: 6 }
    ],
    weakSignals: [
      { term: "chemical", weight: 3 },
      { term: "drum", weight: 2 },
      { term: "pallet", weight: 2 }
    ],
    negativeSignals: [],
    contextBoosts: [],
    commonConsequences: ["chemical spill", "incompatible chemical reaction", "environmental contamination"],
    requiredControls: ["segregate incompatible chemicals", "drain containment tub", "replace leaking container", "use chemical secondary containment"],
    defaultSeverity: "medium",
    defaultSeverityScore: 3,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["incompatible chemical contact", "leaking chemical drum"]
  },
  {
    id: "welding_cutting_hot_work",
    label: "Welding / Cutting / Hot Work",
    family: "Welding / Cutting / Hot Work",
    strongSignals: [
      { term: "welding generator lead showing damaged insulation", weight: 10 },
      { term: "arc welding performed without safety flash screen", weight: 10 },
      { term: "oxyacetylene torch missing flashback arrestor", weight: 9 },
      { term: "hot work executed without active fire watch", weight: 9 },
      { term: "welding sparks falling directly on trash", weight: 9 },
      { term: "damaged gas hose on cutting torch", weight: 9 }
    ],
    moderateSignals: [
      { term: "welding", weight: 6 },
      { term: "cutting", weight: 5 },
      { term: "torch", weight: 5 },
      { term: "grinder sparks", weight: 5 },
      { term: "hot work permit", weight: 6 },
      { term: "fire watch", weight: 6 },
      { term: "welding screen", weight: 6 },
      { term: "arc flash from welding", weight: 6 },
      { term: "welding leads", weight: 6 },
      { term: "oxygen acetylene torch", weight: 6 },
      { term: "brazing", weight: 5 },
      { term: "burning operation", weight: 5 }
    ],
    weakSignals: [
      { term: "sparks", weight: 3 },
      { term: "leads", weight: 2 },
      { term: "hose", weight: 2 }
    ],
    negativeSignals: [],
    contextBoosts: [],
    commonConsequences: ["fire initiation", "welding flash eye injury", "electric shock from welding machine"],
    requiredControls: ["assign fire watch", "install welding safety screen", "install flashback arrestor", "replace damaged welding cables"],
    defaultSeverity: "high",
    defaultSeverityScore: 4,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["hot work without fire watch", "exposed welding leads"]
  },
  {
    id: "scaffolds",
    label: "Scaffolds",
    family: "Scaffolds",
    strongSignals: [
      { term: "scaffold legs resting on stacked bricks", weight: 10 },
      { term: "scaffold platform missing guardrails", weight: 10 },
      { term: "scaffold platform", weight: 9 },
      { term: "scaffold outrigger", weight: 9 },
      { term: "supported scaffold", weight: 9 },
      { term: "mobile scaffold", weight: 9 },
      { term: "rolling scaffold", weight: 9 }
    ],
    moderateSignals: [
      { term: "scaffold", weight: 6 },
      { term: "scaffolding", weight: 6 },
      { term: "scaffold frame", weight: 6 },
      { term: "scaffold platform", weight: 6 },
      { term: "scaffold plank", weight: 6 },
      { term: "mudsill", weight: 5 },
      { term: "baseplate", weight: 5 },
      { term: "outrigger", weight: 5 },
      { term: "cross brace", weight: 4 },
      { term: "scaffold access", weight: 5 },
      { term: "scaffold deck", weight: 5 }
    ],
    weakSignals: [
      { term: "plank", weight: 3 },
      { term: "deck", weight: 2 },
      { term: "base", weight: 2 }
    ],
    negativeSignals: [],
    contextBoosts: [],
    commonConsequences: ["fall from height", "scaffold collapse", "struck-by falling object"],
    requiredControls: ["install mudsills and baseplates", "install scaffold guardrails", "secure work platform", "provide safe ladder access"],
    defaultSeverity: "high",
    defaultSeverityScore: 4,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["scaffold platform without guardrails", "scaffold on unstable base"]
  },
  {
    id: "compressed_air_hose_safety",
    label: "Compressed Air / Hose Safety",
    family: "Compressed Air / Hose Safety",
    strongSignals: [
      { term: "air compressor hose without safety whipcheck", weight: 10 },
      { term: "air nozzle pressure", weight: 9 },
      { term: "clothing blowdown", weight: 9 },
      { term: "damaged hose clamp connector", weight: 9 },
      { term: "receiver tank missing pressure relief", weight: 9 }
    ],
    moderateSignals: [
      { term: "compressed air hose", weight: 6 },
      { term: "high pressure air line", weight: 6 },
      { term: "whipcheck", weight: 6 },
      { term: "whip check", weight: 6 },
      { term: "safety chain", weight: 5 },
      { term: "hose coupling", weight: 5 },
      { term: "hose connector", weight: 5 },
      { term: "compressor hose", weight: 6 },
      { term: "air line connector", weight: 6 },
      { term: "pneumatic line", weight: 6 },
      { term: "hose restraint", weight: 6 }
    ],
    weakSignals: [
      { term: "hose", weight: 3 },
      { term: "air", weight: 2 },
      { term: "clamp", weight: 2 }
    ],
    negativeSignals: [],
    contextBoosts: [],
    commonConsequences: ["whipping hose impact", "flying particles under pressure", "pressure vessel rupture"],
    requiredControls: ["install whipcheck safety device", "reduce nozzle pressure below 30 psi", "inspect hose clamps regularly", "install pressure relief valve"],
    defaultSeverity: "high",
    defaultSeverityScore: 4,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["unsecured air hose", "excessive nozzle pressure"]
  },
  {
    id: "chemical_storage",
    label: "Chemical Storage",
    family: "Chemical Storage",
    strongSignals: [
      { term: "acid and base drums stored on same rack", weight: 10 },
      { term: "secondary containment tub full of water", weight: 10 },
      { term: "cracked outer jacket on corrosive chemical tote", weight: 9 },
      { term: "reactive chemicals without drainage containment", weight: 9 },
      { term: "spigot showing continuous slow drip", weight: 9 }
    ],
    moderateSignals: [
      { term: "chemical storage", weight: 6 },
      { term: "drum storage", weight: 6 },
      { term: "solvent drum", weight: 6 },
      { term: "acid drum", weight: 6 },
      { term: "containment", weight: 5 },
      { term: "secondary containment", weight: 6 },
      { term: "incompatible chemicals", weight: 6 },
      { term: "corrosive storage", weight: 6 },
      { term: "flammable storage cabinet", weight: 6 },
      { term: "chemical pallet", weight: 5 },
      { term: "leaking drum", weight: 6 },
      { term: "transfer piping containment", weight: 6 }
    ],
    weakSignals: [
      { term: "chemical", weight: 3 },
      { term: "drum", weight: 2 },
      { term: "pallet", weight: 2 }
    ],
    negativeSignals: [],
    contextBoosts: [],
    commonConsequences: ["chemical spill", "incompatible chemical reaction", "environmental contamination"],
    requiredControls: ["segregate incompatible chemicals", "drain containment tub", "replace leaking container", "use chemical secondary containment"],
    defaultSeverity: "medium",
    defaultSeverityScore: 3,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["incompatible chemical contact", "leaking chemical drum"]
  },
  {
    id: "welding_cutting_hot_work",
    label: "Welding / Cutting / Hot Work",
    family: "Welding / Cutting / Hot Work",
    strongSignals: [
      { term: "welding generator lead showing damaged insulation", weight: 10 },
      { term: "arc welding performed without safety flash screen", weight: 10 },
      { term: "oxyacetylene torch missing flashback arrestor", weight: 9 },
      { term: "hot work executed without active fire watch", weight: 9 },
      { term: "welding sparks falling directly on trash", weight: 9 },
      { term: "damaged gas hose on cutting torch", weight: 9 }
    ],
    moderateSignals: [
      { term: "welding", weight: 6 },
      { term: "cutting", weight: 5 },
      { term: "torch", weight: 5 },
      { term: "grinder sparks", weight: 5 },
      { term: "hot work permit", weight: 6 },
      { term: "fire watch", weight: 6 },
      { term: "welding screen", weight: 6 },
      { term: "arc flash from welding", weight: 6 },
      { term: "welding leads", weight: 6 },
      { term: "oxygen acetylene torch", weight: 6 },
      { term: "brazing", weight: 5 },
      { term: "burning operation", weight: 5 }
    ],
    weakSignals: [
      { term: "sparks", weight: 3 },
      { term: "leads", weight: 2 },
      { term: "hose", weight: 2 }
    ],
    negativeSignals: [],
    contextBoosts: [],
    commonConsequences: ["fire initiation", "welding flash eye injury", "electric shock from welding machine"],
    requiredControls: ["assign fire watch", "install welding safety screen", "install flashback arrestor", "replace damaged welding cables"],
    defaultSeverity: "high",
    defaultSeverityScore: 4,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["hot work without fire watch", "exposed welding leads"]
  },
  {
    id: "first_aid_eyewash_safety_shower_access",
    label: "First Aid / Eyewash / Safety Shower Access",
    family: "First Aid / Eyewash / Safety Shower Access",
    strongSignals: [
      { term: "safety eyewash station blocked by", weight: 10 },
      { term: "drench shower pull rod bent", weight: 10 },
      { term: "eyewash plumbing valve showing", weight: 9 },
      { term: "missing visual weekly inspection tags on eyewash", weight: 9 },
      { term: "first aid box completely empty", weight: 9 },
      { term: "eyewash station basin covered in thick grease", weight: 9 }
    ],
    moderateSignals: [
      { term: "eyewash", weight: 6 },
      { term: "eye wash", weight: 6 },
      { term: "safety shower", weight: 6 },
      { term: "emergency shower", weight: 6 },
      { term: "first aid station", weight: 5 },
      { term: "blocked eyewash", weight: 8 },
      { term: "blocked safety shower", weight: 8 },
      { term: "inspection tag", weight: 4 },
      { term: "weekly activation", weight: 5 },
      { term: "emergency wash station", weight: 6 },
      { term: "drench shower", weight: 6 }
    ],
    weakSignals: [
      { term: "shower", weight: 3 },
      { term: "basin", weight: 2 },
      { term: "valve", weight: 2 }
    ],
    negativeSignals: [],
    contextBoosts: [],
    commonConsequences: ["delayed chemical exposure emergency washing", "delayed first aid treatment"],
    requiredControls: ["clear access to eyewash", "replace corroded valve", "conduct weekly eyewash inspection", "replenish first aid supplies"],
    defaultSeverity: "high",
    defaultSeverityScore: 4,
    defaultLikelihoodScore: 3,
    humanReviewTriggers: ["blocked safety shower eyewash", "corroded emergency valve"]
  }
];
