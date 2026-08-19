import { writeFile } from "node:fs/promises";

const cases = [];
const expected = (disposition, required = [], prohibited = [], lifeCritical = false, clarificationRequired = false, rationale = "") => ({
  disposition, hazardFamilies: [], requiredCitationFamilies: required,
  prohibitedCitationFamilies: prohibited, clarificationRequired,
  immediateControl: "Use qualified human review and controls matched to confirmed evidence.",
  riskDirection: disposition === "hazard" ? "high" : disposition === "safe_controlled" ? "low" : "uncertain",
  lifeCritical, rationale,
});
function add(group, jurisdiction, domain, observation, outcome, pairId = null, answers = []) {
  const id = `H${String(cases.length + 1).padStart(3, "0")}`;
  cases.push({
    id, group, jurisdiction, domain, observation,
    scopes: jurisdiction === "msha" ? ["msha"] :
      jurisdiction === "osha-general-industry" ? ["osha-general-industry"] :
      jurisdiction === "osha-construction" ? ["osha-construction"] : ["all"],
    expected: outcome,
    structuredObservation: {
      narrative: observation, jurisdiction, evidenceSource: ["worker-report"],
      controlsPresent: [], controlsMissing: [], unknownFacts: [],
      unresolvedContradictions: [], userConfirmedFacts: [],
    },
    tags: pairId ? ["near-neighbor", pairId] : [],
    clarificationAnswers: answers,
  });
}

// 15 MSHA: the first ten form five factual near-neighbor pairs.
add("msha", "msha", "energy", "Millwright had both hands in the crusher drive while the disconnect stayed ON; no personal lok was fitted.", expected("hazard", ["56.12016"], ["1910.", "1926."], true), "P01");
add("msha", "msha", "energy", "Millwright opened the crusher after every source was locked out and zero energy was verified.", expected("safe_controlled", [], ["56.12016", "1910.", "1926."], false), "P01");
add("msha", "msha", "ground", "Drummy rock is hangin over the active miner walkway at the portal.", expected("hazard", ["56.3200"], ["1910.", "1926."], true), "P02");
add("msha", "msha", "ground", "Scaling crew removed the loose back, barricade remains, and nobody can enter until the competent check.", expected("safe_controlled", [], ["56.3200", "1910.", "1926."]), "P02");
add("msha", "msha", "electrical", "Bare live conductor is reachable beside a wet pump frame where the operator is standing.", expected("hazard", ["56.12025"], ["1910.", "1926."], true), "P03");
add("msha", "msha", "electrical", "Cord jacket is muddy but intact; power is disconnected and continuity test passed before use.", expected("safe_controlled", [], ["56.12025", "1910.", "1926."]), "P03");
add("msha", "msha", "guarding", "Tail pulley running, nip point open waist high where cleanup guy walks.", expected("hazard", ["56.14107"], ["1910.", "1926."], true), "P04");
add("msha", "msha", "guarding", "Tail pulley guard is bolted on and blocks reach to the nip while belt runs.", expected("safe_controlled", [], ["56.14107", "1910.", "1926."]), "P04");
add("msha", "msha", "mobile_equipment", "Loader backup alarm made no sound during pre-shift and machine is still being used around foot traffic.", expected("hazard", ["56.14132"], ["1910.", "1926."], true), "P05");
add("msha", "msha", "mobile_equipment", "Loader alarm sounded in the function test; unit is parked and no one is in travel lane.", expected("safe_controlled", [], ["56.14132", "1910.", "1926."]), "P05");
add("msha", "msha", "fall", "Miner is workin from an unprotected elevated crusher deck with a clear fall to the floor.", expected("hazard", ["56.15005"], ["1910.", "1926."], true));
add("msha", "msha", "housekeeping", "Oil pooled across the mine shop travelway and boots are tracking through it.", expected("hazard", ["56.20003"], ["1910.", "1926."]));
add("msha", "msha", "compressed_gas", "Oxygen cylinder is free standing next to the welding bench with no chain.", expected("hazard", ["56.16005"], ["1910.", "1926."]));
add("msha", "msha", "insufficient", "Hydraulic hose looks old in the pic. Can't tell if cracked, leaking, pressurized, or in service.", expected("insufficient", [], ["1910.", "1926."], false, true));
add("msha", "msha", "non_safety", "New blue paint on handrail is uneven but rail is solid and complete.", expected("non_safety", [], ["56.", "1910.", "1926."]));

// 15 OSHA general-industry scenarios; five near-neighbor pairs.
add("general_industry", "osha-general-industry", "electrical", "Live 480 bus is uncovered at shoulder height in the production room; employee can touch it.", expected("hazard", ["1910.303"], ["1926.", "56."], true), "P06");
add("general_industry", "osha-general-industry", "electrical", "Panel is deenergized, locked, tested dead, and the dead-front is back in place.", expected("safe_controlled", [], ["1910.303", "1926.", "56."]), "P06");
add("general_industry", "osha-general-industry", "egress", "Night shift's only marked exit has a padlock thru the latch.", expected("hazard", ["1910.36"], ["1926.", "56."], true), "P07");
add("general_industry", "osha-general-industry", "egress", "Both exits are unlocked, lit and clear for the occupied night shift.", expected("safe_controlled", [], ["1910.36", "1910.37", "1926.", "56."]), "P07");
add("general_industry", "osha-general-industry", "noise", "Dosimeter result is 88 dBA TWA for the press operator's full shift.", expected("hazard", ["1910.95"], ["1926.", "56."]), "P08");
add("general_industry", "osha-general-industry", "noise", "Calibrated dosimeter says 79 dBA TWA; no impact peaks and no unusual impulse noise.", expected("safe_controlled", [], ["1910.95", "1926.", "56."]), "P08");
add("general_industry", "osha-general-industry", "loto", "Operator reaches into the baler to pull a jam while it remains powered; no lock applied.", expected("hazard", ["1910.147"], ["1926.", "56."], true), "P09");
add("general_industry", "osha-general-industry", "loto", "Baler jam cleared only after disconnect lock, stored-energy release and try-start verification.", expected("safe_controlled", [], ["1910.147", "1926.", "56."]), "P09");
add("general_industry", "osha-general-industry", "hazcom", "Secondary bottle at mixing station has no name or hazard label and contains unknown solvent.", expected("hazard", ["1910.1200"], ["1926.", "56."]), "P10");
add("general_industry", "osha-general-industry", "hazcom", "Secondary bottle is labeled with product and hazards and matches the SDS at the station.", expected("safe_controlled", [], ["1910.1200", "1926.", "56."]), "P10");
add("general_industry", "osha-general-industry", "pit", "Open service pit beside the mechanic aisle has no cover or guard and workers pass within inches.", expected("hazard", ["1910.28"], ["1926.", "56."], true));
add("general_industry", "osha-general-industry", "forklift", "Forklift seat belt is torn through and supervisor said keep using it for this shift.", expected("hazard", ["1910.178"], ["1926.", "56."]));
add("general_industry", "osha-general-industry", "respiratory", "Worker says dust is bad; material, concentration, task, ventilation and respirator use aren't known.", expected("insufficient", [], ["1926.", "56."], false, true));
add("general_industry", "osha-general-industry", "fire", "Extinguisher cabinet is visible but photo does not show inspection tag, pressure gauge, or access.", expected("insufficient", [], ["1926.", "56."], false, true));
add("general_industry", "osha-general-industry", "ergonomics", "Packer says the tote feels awkward; no weight, frequency, symptoms or injury was reported.", expected("insufficient", [], ["1910.147", "1910.212", "1926.", "56."], false, true));

// 15 OSHA construction scenarios; five near-neighbor pairs.
add("construction", "osha-construction", "excavation", "Laborer is setting pipe in a 7-ft cut with vertical soil walls; no box, slope or shoring.", expected("hazard", ["1926.652"], ["1910.", "56."], true), "P11");
add("construction", "osha-construction", "excavation", "Four-foot cut is confirmed stable rock and no worker is exposed to a cave-in zone.", expected("safe_controlled", [], ["1926.652", "1910.", "56."]), "P11");
add("construction", "osha-construction", "power_lines", "Crane boom is 9 ft from an energized overhead line; no spotter or encroachment plan.", expected("hazard", ["1926.1408"], ["1910.", "56."], true), "P12");
add("construction", "osha-construction", "power_lines", "Utility verified line deenergized and visibly grounded before the crane entered the work zone.", expected("safe_controlled", [], ["1926.1408", "1910.", "56."]), "P12");
add("construction", "osha-construction", "fall_zone", "Two workers stand below a suspended HVAC section and are not guiding or connecting it.", expected("hazard", ["1926.1425"], ["1910.", "56."], true), "P13");
add("construction", "osha-construction", "fall_zone", "No one is below the hoisted panel; controlled tag line area is barricaded.", expected("safe_controlled", [], ["1926.1425", "1910.", "56."]), "P13");
add("construction", "osha-construction", "scaffold", "Mason works from 16-ft scaffold platform with the outside guardrail missing.", expected("hazard", ["1926.451"], ["1910.", "56."], true), "P14");
add("construction", "osha-construction", "scaffold", "Scaffold platform has toprail, midrail, toe board and current competent-person tag.", expected("safe_controlled", [], ["1926.451", "1910.", "56."]), "P14");
add("construction", "osha-construction", "silica", "Crew dry-cuts concrete block indoors; visible dust surrounds their breathing zone and no control is running.", expected("hazard", ["1926.1153"], ["1910.", "56."], true), "P15");
add("construction", "osha-construction", "silica", "Wet saw feed is operating and local exhaust captures dust during block cutting.", expected("safe_controlled", [], ["1926.1153", "1910.", "56."]), "P15");
add("construction", "osha-construction", "fall", "Roofer kneels at an open 14-ft edge with no guard, net, restraint or arrest system.", expected("hazard", ["1926.501"], ["1910.", "56."], true));
add("construction", "osha-construction", "hot_work", "Welder starts cutting beside cardboard and an open solvent pail; no fire watch is present.", expected("hazard", ["1926.352"], ["1910.", "56."]));
add("construction", "osha-construction", "confined_space", "Worker entered the tank, but permit-space classification, isolation and atmosphere test are unknown.", expected("insufficient", [], ["1910.", "56."], true, true));
add("construction", "osha-construction", "crane", "Hook looks rusty in phone photo; load rating, deformation, cracks and inspection result aren't known.", expected("insufficient", [], ["1910.", "56."], false, true));
add("construction", "osha-construction", "housekeeping", "Scrap lumber with upward nails blocks the active access path to framing work.", expected("hazard", ["1926.25"], ["1910.", "56."]));

// Ten additional safe/corrected conditions.
const safe = [
  ["machine_guard", "Old note says guard missing; current photo and operator confirm interlock guard installed and tested.", ["1910.212"]],
  ["exit", "Yesterday's cart was removed; marked exit route is now open, unlocked and illuminated.", ["1910.37"]],
  ["excavation", "Before entry the trench box was installed and competent person accepted the setup.", ["1926.652"]],
  ["energy", "Conveyor is locked out, blocked against motion, and zero energy was verified before hands entered.", ["56.12016", "1910.147"]],
  ["fall", "No worker approached the open edge; rigid guardrail was installed before access.", ["1926.501"]],
  ["chemical", "Empty rinsed water bottle is labeled WATER and contains no hazardous chemical.", ["1910.1200"]],
  ["electrical", "Disconnected cord was tagged out and placed in locked scrap bin before this review.", ["1910.303", "56.12025"]],
  ["noise", "Quiet office measurement 61 dBA; no impact or impulse source.", ["1910.95"]],
  ["crane", "Boom is stowed; overhead line was deenergized and grounded by the utility.", ["1926.1408"]],
  ["ground", "Loose slab was scaled down and access stayed barricaded until examination passed.", ["56.3200"]],
];
for (const [domain, observation, prohibited] of safe)
  add("safe_state", "unknown", domain, observation, expected("safe_controlled", [], prohibited));

// Ten ambiguous/insufficient observations.
const ambiguous = [
  ["jurisdiction", "Crew is changing a pump at a gravel property, but I don't know if this area is under mine or shop jurisdiction."],
  ["energy", "Someone was inside machine frame earlier. Can't tell if it was running or locked out."],
  ["fall", "Photo shows an edge; height, access and whether anyone was exposed are not visible."],
  ["chemical", "Clear liquid in jug, no smell noted. Contents and label are outside the picture."],
  ["excavation", "Fresh cut by the road. Depth, soil type, worker entry and protection aren't stated."],
  ["noise", "Area sounded loud for a minute; no meter result or duration."],
  ["guarding", "Round metal cover near a motor. Not sure if it is a guard or whether anything moves."],
  ["respiratory", "Dust on a shelf after shutdown; task, airborne concentration and employee presence unknown."],
  ["egress", "Door has a chain hanging nearby, but image doesn't show whether chain secures the door."],
  ["crane", "Boom in background close-ish to wires; distance, line status and crane activity unknown."],
];
for (const [domain, observation] of ambiguous)
  add("ambiguous", "unknown", domain, observation, expected("insufficient", [], [], false, true));

// Five explicit contradictions.
const contradictions = [
  ["energy", "Operator says disconnect is locked out; photo timestamp from same moment shows handle ON and no lock."],
  ["guarding", "Supervisor marked guard installed, but current image shows the rotating shaft open."],
  ["egress", "Checklist says exit clear; worker report says it is chained now."],
  ["excavation", "Foreman calls it stable rock while competent-person note classifies the wall as soil."],
  ["noise", "Log lists 79 dBA TWA and also states the same dosimeter measured 91 dBA TWA for that shift."],
];
for (const [domain, observation] of contradictions)
  add("contradiction", "unknown", domain, observation, expected("insufficient", [], [], false, true));

// Five adversarial attempts to trigger unsupported definitive promotions.
const adversarial = [
  ["quoted_loto", "Training card reads 'lockout violation 1910.147'; no servicing or equipment condition was observed.", ["1910.147"]],
  ["negated_egress", "It is not true that the exit is blocked; both doors are usable.", ["1910.36", "1910.37"]],
  ["poster_excavation", "Poster says 'trenches need a box' but there is no excavation at this work area.", ["1926.652"]],
  ["noise_number", "Shelf label is model 95-1910; this is not a noise measurement or exposure record.", ["1910.95"]],
  ["mine_word", "Office email says 'mine the data'; no mine site, miner, or physical hazard is described.", ["56.", "57."]],
];
for (const [domain, observation, prohibited] of adversarial)
  add("adversarial", "unknown", domain, observation, expected("non_safety", [], prohibited));

// Five multi-turn cases. Answers are explicit but differently worded from the original corpus.
add("clarification", "msha", "energy", "Mechanic is clearing rock from crusher throat; initial note did not say if energy was controlled.",
  expected("hazard", ["56.12016"], ["1910.", "1926."], true, true), null, [
    { questionId: "predicate-30-cfr-56-12016-hazardous-energy-present-or-capable", answer: "Yes" },
    { questionId: "predicate-30-cfr-56-12016-power-not-isolated-and-locked", answer: "No" },
  ]);
add("clarification", "osha-construction", "excavation", "Laborer may have entered a deep cut; entry and protection weren't in first note.",
  expected("hazard", ["1926.652"], ["1910.", "56."], true, true), null, [
    { questionId: "predicate-29-cfr-1926-652-a-1-worker-cave-in-exposure", answer: "Yes" },
    { questionId: "predicate-29-cfr-1926-652-a-1-protective-system-absent", answer: "Yes" },
  ]);
add("clarification", "osha-construction", "fall_zone", "Crew was near a suspended panel; their permitted task was not recorded.",
  expected("insufficient", ["1926.1425"], ["1910.", "56."], true, true), null, [
    { questionId: "predicate-29-cfr-1926-1425-permitted-task-exception-absent", answer: "Not sure" },
  ]);
add("clarification", "osha-general-industry", "egress", "Door is marked EXIT, but first note does not say if occupied or locked.",
  expected("insufficient", ["1910.36"], ["1926.", "56."], true, true));
add("clarification", "osha-construction", "power_lines", "Mobile crane set near overhead conductors; line status, distance and controls not recorded.",
  expected("insufficient", ["1926.1408"], ["1910.", "56."], true, true));

if (cases.length !== 80) throw new Error(`Expected 80 holdout cases, created ${cases.length}.`);
const payload = {
  metadata: {
    createdAt: new Date().toISOString(), count: cases.length,
    methodology: "80 independently reasoned holdout cases authored before execution; different wording from the closure corpus.",
    nearNeighborCaseCount: cases.filter((item) => item.tags.includes("near-neighbor")).length,
    groups: cases.reduce((out, item) => ({ ...out, [item.group]: (out[item.group] || 0) + 1 }), {}),
  },
  cases,
};
await writeFile(new URL("./HOLDOUT_CORPUS_EXPECTED.json", import.meta.url), `${JSON.stringify(payload, null, 2)}\n`);
console.log(JSON.stringify(payload.metadata));
