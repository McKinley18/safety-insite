import { writeFile } from "node:fs/promises";

const createdAt = new Date().toISOString();
let sequence = 1;
const cases = [];

function add(group, jurisdiction, domain, observation, expected, extra = {}) {
  cases.push({
    id: `C${String(sequence++).padStart(3, "0")}`,
    group,
    jurisdiction,
    domain,
    observation,
    scopes:
      jurisdiction === "msha" ? ["msha"] :
      jurisdiction === "osha_general_industry" ? ["osha_general_industry"] :
      jurisdiction === "osha_construction" ? ["osha_construction"] : ["all"],
    expected: {
      disposition: expected.disposition,
      hazardFamilies: expected.hazards || [domain],
      requiredCitationFamilies: expected.required || [],
      prohibitedCitationFamilies: expected.prohibited || [],
      clarificationRequired: expected.clarify ?? expected.disposition === "insufficient",
      immediateControl: expected.control || "verify facts and keep the condition under qualified human review",
      riskDirection: expected.risk || "uncertain",
      lifeCritical: Boolean(expected.lifeCritical),
      rationale: expected.rationale,
    },
    structuredObservation: {
      narrative: observation,
      jurisdiction:
        jurisdiction === "osha_general_industry" ? "osha-general-industry" :
        jurisdiction === "osha_construction" ? "osha-construction" :
        jurisdiction === "msha" ? "msha" : "unknown",
      evidenceSource: extra.evidenceSource || ["visual"],
      energyState: extra.energyState || "unknown",
      controlsPresent: extra.controlsPresent || [],
      controlsMissing: extra.controlsMissing || [],
      unknownFacts: extra.unknownFacts || [],
      unresolvedContradictions: extra.contradictions || [],
      userConfirmedFacts: extra.userConfirmedFacts || [],
    },
    tags: extra.tags || [],
    clarificationAnswers: extra.clarificationAnswers || [],
    priorStructuredObservation: extra.priorStructuredObservation || undefined,
  });
}

const jurisdictionSets = {
  msha: [
    ["mobile_equipment_brakes", "30 CFR 56.14101", "Haul truk #18 rolled two feet after the operator applied the service brake on the quarry ramp; a miner was spotting from the downhill side.", "Pre-op records show both brake systems passed, the truck is parked level with brake set, and nobody is in its travel path.", "Operator wrote 'brakes felt soft' but no test result, grade, movement, or exposure was documented.", "remove the truck from service and protect the downhill area"],
    ["conveyor_guarding", "30 CFR 56.14107", "At the mill, the tail pulley is turning with the side guard missing and a cleanup worker is shoveling within arm's reach.", "Tail and return pulleys are enclosed by secured guards; cleanup occurred only after lockout verification.", "Photo shows material near a belt, but the belt state, guard boundary, and worker distance can't be made out.", "stop access and restore effective moving-part guards"],
    ["mine_lockout", "30 CFR 56.12016", "Crusher mechanic has a wrench inside the drive housing while the disconnect remains on and no personal lock is fitted.", "Each mechanic applied a personal lock, tried the start control, released stored energy, and signed the isolation card.", "Crusher is stopped for a repair; no one confirmed disconnect position, stored energy, or entry into the danger zone.", "isolate every energy source and verify zero energy"],
    ["ground_control", "30 CFR 56.3200", "Fresh slabs are drumming and loose above the active underground travelway; two miners keep walking below them.", "Loose ground was scaled, the area examined, and the barricade remained until a competent examiner released it.", "The back looks rough in a dim photo; sounding, examination, and travel status are unknown.", "withdraw miners and scale, support, or barricade unsafe ground"],
    ["berm_edge", "30 CFR 56.9300", "A loaded haul unit travels a dump-road edge where the berm is flattened below mid-axle height beside a 35-foot drop.", "The elevated roadway has a continuous substantial berm above mid-axle height and a documented examination.", "An edge windrow is visible, but vehicle axle height, drop, route use, and continuity aren't shown.", "close the edge lane until an adequate berm is restored"],
    ["highwall", "30 CFR 56.3130", "Loader operator works beneath a freshly undercut highwall with loose blocks and no examination after overnight rain.", "The highwall was examined after the rain, loose material removed, and equipment kept beyond the fall zone.", "Loader is near a rock face; distance, undercut, recent weather, and examination status are missing.", "remove people and equipment from the highwall fall zone"],
    ["seat_belt", "30 CFR 56.14131", "Quarry pickup is moving on a rough haul road while the driver has the installed seat belt buckled behind the seat.", "Driver and passenger are belted before movement and the belts were inspected serviceable.", "A parked pickup has a twisted belt; occupancy, movement, and belt usability weren't observed.", "stop vehicle movement until occupants use serviceable belts"],
    ["electrical_grounding", "30 CFR 56.12025", "Portable mine pump has a cut cord with bare copper touching the wet sump rim while a miner holds the metal frame.", "Pump is unplugged, tagged out, dry-stored, and the replacement cord passed grounding and continuity checks.", "A taped pump cord is photographed on a shelf; conductor damage, service status, and grounding are unknown.", "deenergize and remove damaged electrical equipment from service"],
    ["compressed_cylinders", "30 CFR 56.4601", "Two uncapped oxygen cylinders stand loose in the mobile shop aisle where loaders pass within inches.", "Stored cylinders are capped, upright, restrained, identified, and separated from vehicle traffic.", "Tall cylinders appear behind the shop, but contents, caps, restraints, and storage status are unclear.", "secure, cap, identify, and protect cylinders from impact"],
    ["mine_housekeeping", "30 CFR 56.20003", "Wet fines and a broken hose cover the only stairs to the control room; miners are stepping over both during shift change.", "The stairway is dry, illuminated, and clear; hoses are routed overhead and daily cleanup is recorded.", "Dark material appears on unused stairs; whether wet, active, or in a required travelway is unknown.", "barricade and clear the travelway before use"],
  ],
  osha_general_industry: [
    ["machine_guarding", "1910.212", "Operator feeds sheet stock six inches from an exposed rotating coupling because the fabricated guard was removed for alignment.", "The coupling is fully enclosed, guard fasteners are in place, and the machine was run-tested without access to motion.", "A coupling is visible in a maintenance photo; machine state, guard design, and employee reach are not known.", "stop operation and prevent access to the rotating coupling"],
    ["loto", "1910.147", "Tech reaches into an automatic palletizer to free a jam; control power is on and pneumatic pressure remains at 90 psi.", "Palletizer disconnect is locked by the entrant, air is bled, blocks installed, and zero-energy verification is documented.", "Palletizer stopped mid-cycle, but nobody knows whether the employee will enter or energy has been isolated.", "apply energy control and verify isolation before entry"],
    ["electrical", "1910.303", "Warehouse panel cover is absent and energized bus bars are reachable from the packing aisle.", "Panel deadfront and door are secured, working clearance is marked, and no live parts are exposed.", "Cabinet door is ajar in a photo; voltage, inner deadfront, energization, and aisle access are uncertain.", "guard live parts and restrict the electrical working space"],
    ["forklift", "1910.178", "Forklift backs blind out of a trailer at speed with no spotter or horn while two pickers cross the dock lane.", "Truck stops at the blind exit, sounds the horn, uses a spotter, and pedestrians remain behind a barrier.", "Forklift and pedestrians share a photo, but travel, separation, visibility, and conduct aren't established.", "separate pedestrians and control blind travel"],
    ["hazcom", "1910.1200", "Production worker is spraying from a reused drink bottle containing an unidentified corrosive with no label or SDS match.", "Secondary bottle carries product identity and hazards matching the accessible SDS and is kept closed between uses.", "An empty unlabeled bottle sits in recycling; residue, intended reuse, and prior contents are unknown.", "stop use and identify, label, and document the chemical"],
    ["walking_surfaces", "1910.22", "Clear hydraulic oil covers the main aisle at a blind corner and employees are walking through it.", "A minor leak is captured inside locked secondary containment outside all walking and working surfaces.", "A shiny patch appears on concrete; no one verified liquid, traction, route use, or extent.", "isolate the route and clean the slipping hazard"],
    ["noise", "1910.95", "Personal dosimetry measured 93 dBA TWA for press operators, but there is no hearing conservation or audiometry.", "Validated monitoring is below the action level and quieter tooling remains maintained.", "Workers call the press 'crazy loud'; no measurement, duration, or exposure profile is available.", "control exposure and implement required hearing conservation"],
    ["permit_space", "1910.146", "Employee enters a permit-marked mixing pit before atmospheric testing, with no attendant or rescue arrangement.", "Entry permit lists hazards, acceptable readings, ventilation, attendant, communications, and rescue availability.", "A covered pit exists, but entry, configuration, hazards, and permit classification are not established.", "prevent entry until permit-space evaluation and controls are complete"],
    ["egress", "1910.36", "The sole marked exit is chained shut from inside during an occupied night shift.", "Two required exits are unlocked, illuminated, marked, and continuously unobstructed.", "A pallet is near an exit-marked door, but required width, alternate routes, and actual obstruction aren't known.", "immediately restore an unlocked usable exit route"],
    ["respiratory", "1910.134", "Employees sand cured isocyanate coating inside a vessel with exhaust off and wear unfit-tested nuisance masks.", "Local exhaust is verified effective and workers use medically cleared, fit-tested respirators selected from exposure data.", "A solvent smell was reported yesterday; substance, concentration, task, duration, and ventilation are unavailable.", "stop exposure and establish engineering and respiratory protection"],
  ],
  osha_construction: [
    ["fall_roof", "1926.501", "Roofer installs membrane 16 feet above grade three feet from the edge with no guardrail, net, restraint, or arrest system.", "The roofer remains inside a complete guardrail system and uses the controlled access required by the site plan.", "A hardhat is visible near a roof edge; distance, lower-level height, activity, and protection can't be judged.", "remove the worker from exposure and provide compliant fall protection"],
    ["trench", "1926.652", "Laborer is waist-deep in an eight-foot vertical trench with no shield, slope, or shoring and spoil piled at the lip.", "The trench uses a rated shield, daily competent-person inspection, spoil setback, and safe access; nobody works outside the shield.", "Photo lacks scale; depth, soil, entry, protective system, and competent-person findings are missing.", "remove entrants and install an approved protective system"],
    ["scaffold", "1926.451", "Mason works from a 19-foot scaffold platform with the building-side gap open and no guardrail or personal fall arrest.", "Scaffold is fully planked, inspected, properly accessed, and protected on every exposed side.", "Scaffold frames are being unloaded on grade; erection, access, platform height, and use are unknown.", "stop scaffold use until access, decking, and fall protection are verified"],
    ["silica", "1926.1153", "Worker dry-saws concrete block indoors all morning with no water feed, local exhaust, assessment, or respirator.", "The saw's integrated water system runs continuously and the operator follows the applicable task-table controls.", "Dust hangs near masonry work, but material, tool, duration, location, and controls aren't known.", "use specified engineering controls and assess residual exposure"],
    ["crane_fall_zone", "1926.1425", "A precast wall panel is suspended directly over laborers guiding it by hand from beneath.", "Only qualified riggers enter the controlled fall zone for the permitted task and all others remain barricaded out.", "Crane boom is raised with no visible load; lift status, fall zone, and worker exposure are unknown.", "land the load and clear personnel from the fall zone"],
    ["rigging", "1926.251", "A nylon sling with exposed red core yarns supports a steel stair flight above an occupied level.", "Tagged slings passed documented inspection, are within capacity, protected from edges, and the area below is excluded.", "A sling lies beside bundled steel; condition, selection, load, and intended use aren't documented.", "land the load and destroy or quarantine the damaged sling"],
    ["stairs", "1926.1052", "Crew uses temporary stairs with four risers and open 12-foot sides but no stair rail or handrail.", "Temporary stairs have uniform treads, handrails, and stair-rail systems on all exposed sides.", "Three temporary steps are visible; rise, open sides, height, and use are unconfirmed.", "restrict access and install required stair protection"],
    ["housekeeping", "1926.25", "Nail-studded form lumber and extension cords block the only access route to the active floor.", "Scrap is removed throughout the shift, nails are pulled or bent, and access paths remain clear.", "Lumber is stacked beside a path; protruding nails, stability, and actual obstruction are not visible.", "clear the access route and control sharp debris"],
    ["power_lines", "1926.1408", "Crane boom operates about six feet from an energized 13.8-kV line with no utility confirmation, spotter, or encroachment control.", "Utility-confirmed deenergization and grounding are documented before crane setup inside the possible encroachment area.", "Crane and line appear in one image without scale, voltage, work zone, or planned boom radius.", "stop crane movement and establish the required power-line controls"],
    ["hot_work", "1926.352", "Welder cuts steel next to open thinner cans and dry wood debris with no extinguisher or fire watch.", "Combustibles are removed or protected, containers closed, extinguishing equipment staged, and a fire watch assigned.", "A hot-work permit hangs near stored boxes, but no welding is occurring and controls weren't inspected.", "stop hot work until combustibles and fire protection are controlled"],
  ],
};

for (const [jurisdiction, rows] of Object.entries(jurisdictionSets)) {
  for (const [domain, citation, unsafe, safe, uncertain, control] of rows) {
    const otherPrefix =
      jurisdiction === "msha" ? ["1910.", "1926."] :
      jurisdiction === "osha_general_industry" ? ["30 CFR 56.", "1926."] :
      ["30 CFR 56.", "1910."];
    add("jurisdiction_core", jurisdiction, domain, unsafe, {
      disposition: "hazard",
      required: [citation],
      prohibited: otherPrefix,
      clarify: false,
      control,
      risk: "high",
      lifeCritical: /lockout|electrical|ground|fall|trench|crane|power|egress|permit/.test(domain),
      rationale: "The narrative directly establishes the failed control, active task, exposure, and jurisdiction.",
    }, { energyState: /lockout/.test(domain) ? "energized" : "operating", controlsMissing: [control] });
    add("jurisdiction_core", jurisdiction, domain, safe, {
      disposition: "safe_controlled",
      prohibited: [citation, ...otherPrefix],
      clarify: false,
      control,
      risk: "low",
      rationale: "Affirmative evidence establishes the control and no active uncontrolled exposure.",
    }, { energyState: /lockout|electrical/.test(domain) ? "locked-out" : "stopped", controlsPresent: [control] });
    add("jurisdiction_core", jurisdiction, domain, uncertain, {
      disposition: "insufficient",
      prohibited: [citation, ...otherPrefix],
      clarify: true,
      control,
      risk: "uncertain",
      rationale: "Applicability-critical task, exposure, condition, or control facts are absent.",
    }, { unknownFacts: ["task or exposure", "control status", "applicability predicate"] });
  }
}

const ambiguous = [
  ["jurisdiction", "Conveyor is being repaired at a rock-processing yard; records do not show whether the yard is under mine jurisdiction or a standalone manufacturing plant.", ["30 CFR 56.12016", "1910.147"]],
  ["non_safety", "Rainwater ponded in an unused landscaped area beyond the employee fence; no access, contamination, or work activity is described.", ["1910.22", "1926.25"]],
  ["cosmetic", "The paint on a closed electrical cabinet is scratched and faded; the enclosure, labels, and internal components were not inspected.", ["1910.303", "30 CFR 56.12030"]],
  ["safe_loto", "Mixer has been disconnected, each entrant's lock is present, stored pressure reads zero, and the key remains with the authorized employee.", ["1910.147", "30 CFR 56.12016"]],
  ["safe_excavation", "An eight-foot excavation is fenced with no entry permitted; design review is pending and no employee has entered.", ["1926.652"]],
  ["empty_container", "An unlabeled but visibly clean, empty disposable bottle is inside the waste compactor; reuse is prohibited.", ["1910.1200"]],
  ["inactive_machine", "Old drill press is unplugged, tagged for disposal, and stored in a locked surplus cage with no employee access.", ["1910.212", "1910.147"]],
  ["environmental", "Vegetation is discolored along an offsite drainage ditch; no substance or occupational exposure is identified.", ["1910.1200", "1910.22"]],
  ["ergonomics", "A worker lifted one twelve-pound carton from knee height; frequency, duration, symptoms, and job demands are unknown.", ["1910.176", "1926.25"]],
  ["identity", "A tall red cylinder is visible through a warehouse window; contents, pressure, ownership, and use cannot be determined.", ["1910.101", "1926.350"]],
  ["temporal", "A supervisor says an exit was blocked last month; today's inspection shows it open, and no contemporaneous evidence remains.", ["1910.36", "1910.37"]],
  ["reported_only", "Anonymous note says 'forklifts fly around here,' with no time, location, operator, speed, near miss, or corroboration.", ["1910.178"]],
  ["stain", "Brown discoloration on concrete is dry and has no measurable change in traction; its source is unknown.", ["1910.22"]],
  ["no_entry", "A permit-space placard is on a sealed tank that has no scheduled entry and a locked access hatch.", ["1910.146"]],
  ["stored_scaffold", "Scaffold frames are bundled on a delivery truck and no erection or employee access has begun.", ["1926.451"]],
  ["no_load_crane", "An idle crane is parked with boom down, no load attached, and an exclusion fence around it.", ["1926.1417", "1926.1425"]],
  ["mine_unknown", "Dust is visible at a stone facility, but jurisdiction, material composition, exposure duration, and controls are not documented.", ["30 CFR 56.5001", "1910.1000", "1926.1153"]],
  ["chemical_unknown", "A sealed manufacturer-labeled carton is on a pallet; the label cannot be read from the inspection location.", ["1910.1200", "1910.106"]],
  ["ppe_no_task", "Worker carries safety glasses in hand while walking through a break room; no hazardous task is occurring.", ["1910.132", "1910.133"]],
  ["maintenance_complete", "Guard replacement work is complete, the machine remains locked out, and operations has not accepted it back into service.", ["1910.212", "1910.147"]],
];
for (const [domain, text, prohibited] of ambiguous) {
  add("ambiguous_safe_insufficient", "unknown", domain, text, {
    disposition: /safe_|no_|inactive|stored|maintenance/.test(domain) ? "safe_controlled" : "insufficient",
    prohibited,
    clarify: !/safe_|no_|inactive|stored|maintenance/.test(domain),
    risk: "low_or_uncertain",
    rationale: "The observation does not establish an active occupational exposure or the predicates for a definitive citation.",
  }, { unknownFacts: ["jurisdiction or exposure predicates"], controlsPresent: /safe_|no_|inactive|stored|maintenance/.test(domain) ? ["access controlled"] : [] });
}

const adversarial = [
  ["keyword_negation", "No employee entered the trench, no cave-in exposure occurred, and the area was fenced; the word 'trench' appears only on the permit.", ["1926.652"]],
  ["quoted_claim", "A training poster says 'LOCKOUT SAVES LIVES'; no equipment servicing or hazardous energy condition was observed.", ["1910.147", "30 CFR 56.12016"]],
  ["historical", "The corrected action record describes a missing guard from 2024; the current machine has an interlocked enclosure and passed testing.", ["1910.212"]],
  ["hypothetical", "If the new roof ever exceeds six feet, the plan says fall protection will be selected; no elevated work has started.", ["1926.501"]],
  ["double_negation", "It is not true that the exit is blocked: the route is open, unlocked, illuminated, and measured to required width.", ["1910.36", "1910.37"]],
  ["brand_name", "A folder named 'Confined Space' sits on a desk; no space, entry, or atmospheric hazard is present.", ["1910.146"]],
  ["chemical_word", "The break-room menu lists 'hot and spicy chemicals-free salsa'; no workplace chemical or exposure exists.", ["1910.1200"]],
  ["mine_word", "The office whiteboard reads 'mine the data'; the facility is a software office with no mining activity.", ["30 CFR 56.", "30 CFR 57."]],
  ["construction_word", "Accountants are 'building a report' at desks; no construction activity or physical hazard is described.", ["1926."]],
  ["energized_denial", "Electrician verified absence of voltage, applied grounds, and documented deenergization; nobody is performing energized work.", ["1910.333"]],
  ["fall_word", "Sales 'fell short' of quota; all employees are seated in a ground-floor conference room.", ["1910.28", "1926.501"]],
  ["noise_metaphor", "Manager called the schedule 'noisy,' but sound surveys and observations show no occupational noise source.", ["1910.95"]],
  ["silica_label", "A sealed SDS binder tab says 'silica'; no material handling, dust, or employee exposure occurred.", ["1926.1153", "1910.1053"]],
  ["forklift_toy", "A toy forklift model sits in a display case in the visitor lobby.", ["1910.178"]],
  ["firewall", "IT ticket says 'firewall blocked access'; it describes network traffic, not fire protection or emergency egress.", ["1910.157", "1910.36"]],
];
for (const [domain, text, prohibited] of adversarial) {
  add("adversarial", "unknown", domain, text, {
    disposition: "non_safety",
    prohibited,
    clarify: false,
    risk: "none",
    rationale: "Hazard keywords are negated, historical, quoted, hypothetical, or non-occupational and must not trigger standards.",
  }, { tags: ["adversarial_keyword_trap"] });
}

const clarificationWorkflows = [
  ["electrical_voltage", "Worker is beside an open panel; photo cannot show whether the inner deadfront is installed or anything is energized.", "Are energized parts exposed?", "Yes—480 V bus is exposed and within reach.", "1910.303"],
  ["trench_depth", "Employee appears in an excavation but scale, depth, soil, and protective system are unknown.", "What is the depth and protective system?", "Measured depth is 7 ft with vertical walls and no shield, slope, or shoring.", "1926.652"],
  ["mine_jurisdiction", "Mechanic services a conveyor at a stone yard whose regulatory jurisdiction is not in the record.", "Is this work under MSHA or OSHA?", "The conveyor is at an active MSHA metal/nonmetal mine.", "30 CFR 56.12016"],
  ["chemical_identity", "Operator pours from an unlabeled secondary bottle; contents and intended use are unknown.", "What substance is in the bottle?", "It contains corrosive parts cleaner used by employees; the SDS is available but no workplace label exists.", "1910.1200"],
  ["roof_height", "Installer works near an edge; height and distance cannot be estimated.", "What is the fall distance and edge position?", "The employee is two feet from an unguarded edge 14 feet above grade.", "1926.501"],
  ["noise_measurement", "Press area is described as loud with no exposure data.", "What measured exposure applies?", "Personal dosimetry for the full shift was 92 dBA TWA.", "1910.95"],
  ["permit_space", "Worker prepares to open a vault; configuration and hazards are unknown.", "Does the vault meet confined-space and permit-space criteria?", "It has limited entry, is not designed for occupancy, and may accumulate hydrogen sulfide.", "1910.146"],
  ["forklift_motion", "Forklift is close to pedestrians in a still photo.", "Was the truck moving and were pedestrians separated?", "It reversed through the occupied crossing without a horn or barrier.", "1910.178"],
  ["machine_operation", "A saw guard appears raised, but task and machine state are unknown.", "Was the saw operating with employee access to the blade?", "Yes, the operator was cutting stock with the running blade exposed.", "1910.212"],
  ["not_sure_answer", "Dust is visible during wall cutting; material and controls are unknown.", "Is the wall concrete or silica-containing masonry?", "Not sure.", "1926.1153"],
];
for (const [domain, text, question, answer, citation] of clarificationWorkflows) {
  const notSure = answer === "Not sure.";
  add("clarification_workflow", domain === "mine_jurisdiction" ? "unknown" : domain === "trench_depth" || domain === "roof_height" || domain === "not_sure_answer" ? "osha_construction" : "osha_general_industry", domain, text, {
    disposition: "insufficient",
    required: notSure ? [] : [citation],
    prohibited: notSure ? [citation] : [],
    clarify: true,
    risk: notSure ? "uncertain" : "high_after_answer",
    rationale: notSure ? "The answer preserves uncertainty." : "The clarification supplies the previously missing applicability predicate.",
  }, {
    tags: ["multi_turn"],
    unknownFacts: [question],
    clarificationAnswers: [{ questionId: domain, answer, answeredAt: "2026-07-29T12:00:00.000Z" }],
    priorStructuredObservation: { narrative: text, jurisdiction: "unknown", unknownFacts: [question] },
    userConfirmedFacts: notSure ? [] : [{ field: question, value: answer, sourceQuestionId: domain }],
  });
}

const contradictions = [
  ["panel_state", "Inspector saw an open energized panel, while timestamped maintenance video shows the same panel closed and deenergized; identity match is unresolved.", "1910.303"],
  ["guard_state", "Operator says the guard was removed during production; supervisor's photo shows it installed, but the photo time is unknown.", "1910.212"],
  ["trench_entry", "Foreman reports nobody entered the trench; badge video appears to show a worker below grade, but depth and date are disputed.", "1926.652"],
  ["lockout", "Mechanic says a personal lock was applied; the isolation log has no entry and another witness says the disconnect stayed on.", "1910.147"],
  ["mine_brakes", "Operator reports brake failure; maintenance test records a pass one hour later, with no record of repair between tests.", "30 CFR 56.14101"],
  ["chemical_label", "Inspector notes no label; a worker presents a labeled bottle but cannot establish it is the same container.", "1910.1200"],
  ["fall_protection", "Drone image appears to show a harness; ground observer says no tie-off, and the anchorage is outside the frame.", "1926.501"],
  ["forklift_speed", "Worker reports excessive speed; telematics identifies a different truck and no timestamp matches the observation.", "1910.178"],
  ["atmosphere", "Entry permit records acceptable oxygen; handheld monitor photo shows 17.8%, but device calibration and location are unknown.", "1910.146"],
  ["conveyor_energy", "Control screen says stopped; field witness reports belt motion, and neither source confirms disconnect isolation.", "30 CFR 56.12016"],
];
for (const [domain, text, citation] of contradictions) {
  add("contradictory_evidence", domain.startsWith("mine_") || domain.startsWith("conveyor_") ? "msha" : domain === "trench_entry" || domain === "fall_protection" ? "osha_construction" : "osha_general_industry", domain, text, {
    disposition: "insufficient",
    prohibited: [citation],
    clarify: true,
    risk: "uncertain",
    rationale: "Material evidence conflicts and cannot support a definitive violation until reconciled.",
  }, {
    evidenceSource: ["visual", "worker-report", "document"],
    contradictions: [{ field: domain, originalValue: "unsafe", answerValue: "controlled", reason: "Independent evidence sources conflict." }],
    tags: ["contradiction"],
  });
}

const nearPairs = [
  ["roof_edge", "osha_construction", "Worker is 4 feet from an unguarded roof edge 11 feet above grade installing membrane.", "Worker is 18 feet from the same edge inside a compliant warning-line and monitoring arrangement.", "1926.501"],
  ["trench_depth", "osha_construction", "Worker enters a 6-foot vertical trench with no protective system.", "Worker enters a stable-rock excavation 4 feet deep with no indication of a cave-in hazard.", "1926.652"],
  ["machine_guard", "osha_general_industry", "Lathe runs while the operator can reach an exposed rotating coupling.", "Lathe is unplugged and locked in a disposal cage with the coupling exposed.", "1910.212"],
  ["secondary_container", "osha_general_industry", "Cleaner remains in an unlabeled spray bottle for use by the next shift.", "Employee transfers cleaner to a portable bottle for immediate use during the same task and keeps control of it.", "1910.1200"],
  ["panel", "osha_general_industry", "Energized panel has its deadfront removed and live parts are reachable.", "Panel outer door is open, but the secured deadfront fully encloses all live parts.", "1910.303"],
  ["mine_vehicle", "msha", "Unattended loader is parked on a grade without chocks and begins creeping.", "Unattended loader is on level ground with parking brake set and no movement.", "30 CFR 56.14207"],
  ["mine_conveyor", "msha", "Miner cleans under a moving belt beside an unguarded return roller.", "Miner cleans the same area after personal lockout, blocking, and zero-motion verification.", "30 CFR 56.14107"],
  ["scaffold_height", "osha_construction", "Employee works on an open-sided scaffold platform 14 feet above grade.", "Employee assembles components on a platform 6 feet above grade with complete guardrails.", "1926.451"],
  ["crane_load", "osha_construction", "Laborers stand under a suspended steel beam during travel.", "Laborers stand in the same area after the beam is landed, disconnected, and stable.", "1926.1425"],
  ["noise_twa", "osha_general_industry", "Validated full-shift exposure is 92 dBA TWA and no hearing conservation program exists.", "Validated full-shift exposure is 78 dBA TWA with no unusual impulse noise.", "1910.95"],
];
for (const [domain, jurisdiction, unsafe, controlled, citation] of nearPairs) {
  add("near_neighbor", jurisdiction, `${domain}_applicable`, unsafe, {
    disposition: "hazard", required: [citation], clarify: false, risk: "high",
    rationale: "The changed fact establishes exposure above the relevant applicability threshold or removes the control.",
  }, { tags: ["near_neighbor", `${domain}_pair`] });
  add("near_neighbor", jurisdiction, `${domain}_not_applicable`, controlled, {
    disposition: "safe_controlled", prohibited: [citation], clarify: false, risk: "low",
    rationale: "The paired factual change removes the exposure or supplies the required control.",
  }, { tags: ["near_neighbor", `${domain}_pair`], controlsPresent: ["paired control is affirmatively present"] });
}

if (cases.length !== 165) throw new Error(`Expected 165 cases, built ${cases.length}`);

await writeFile(
  new URL("./HAZLENZ_AUTHENTIC_CORPUS.json", import.meta.url),
  `${JSON.stringify({
    metadata: {
      createdAt,
      count: cases.length,
      methodology: "Independently authored field-language corpus: 30 MSHA, 30 OSHA general industry, 30 OSHA construction, 20 ambiguous/safe/insufficient, 15 adversarial, 10 clarification, 10 contradiction, and 10 two-case near-neighbor pairs.",
      scoringPrinciple: "Expectations are based on stated predicates, not current HazLenz output. Citation-family scoring is a release screen, not legal adjudication.",
    },
    cases,
  }, null, 2)}\n`,
);

console.log(JSON.stringify({ written: true, count: cases.length, groups: cases.reduce((m, c) => ({ ...m, [c.group]: (m[c.group] || 0) + 1 }), {}) }));
