import { writeFile } from "node:fs/promises";

const outputPath = new URL("./HAZLENZ_NOVEL_CASES.json", import.meta.url);
const baseUrl = process.env.AUDIT_API_BASE_URL || "http://127.0.0.1:4010";

const domains = [
  ["electrical", "osha_general_industry", "An employee is resetting an energized 480-volt panel with its deadfront removed and live bus exposed.", "The 480-volt panel is closed, latched, labeled, and no energized parts are exposed.", "A closed electrical cabinet has a faded exterior label; voltage and employee task are unknown.", ["1910.303", "1910.333"], ["1926."], "de-energize, guard live parts, and restrict access"],
  ["machine_guarding", "osha_general_industry", "A packaging-line operator reaches beside a moving sprocket where the interlocked guard has been tied open.", "The sprocket guard is secured and its interlock stopped the machine during the observed test.", "A worker says a mixer guard was open yesterday, but today it is installed and no task was observed.", ["1910.212", "1910.219"], ["1926.652"], "stop the machine and restore effective guarding"],
  ["hazardous_energy_loto", "osha_general_industry", "A mechanic has both hands inside a jammed baler while hydraulic pressure remains and no lock is applied.", "The baler is deenergized, each authorized employee applied a personal lock, and stored pressure was relieved.", "The baler is stopped for a jam; whether power is isolated or anyone will enter the danger zone is not known.", ["1910.147"], ["1910.212"], "isolate all energy and verify zero energy"],
  ["mobile_equipment", "msha", "At a quarry, an unattended loader is parked on a grade without chocks and the brake condition is unknown.", "At a quarry, an unattended loader on a grade has the parking brake set and wheels securely chocked.", "A loader is parked at a facility entrance; the site jurisdiction and slope are not documented.", ["56.14207"], ["1910.178"], "secure unattended equipment against movement"],
  ["powered_industrial_trucks", "osha_general_industry", "A forklift travels through a blind warehouse intersection at speed without sounding its horn while pedestrians cross.", "A forklift stopped at the blind intersection, sounded its horn, and pedestrians were physically separated.", "A forklift is near workers, but travel direction, separation, and operating conduct were not observed.", ["1910.178"], ["56.14207"], "separate pedestrians and enforce safe truck operation"],
  ["fall_protection", "osha_construction", "A roofer works 18 feet above the lower level outside the warning line with no guardrail, net, or personal fall arrest.", "A roofer remains behind a complete guardrail system with top rail, midrail, and toe board intact.", "A worker is visible near a roof edge, but distance to edge, height, and protection are not discernible.", ["1926.501"], ["1910.147"], "remove exposure and install compliant fall protection"],
  ["scaffolds", "osha_construction", "Workers use a tubular scaffold 22 feet high with an open platform edge and no guardrail or personal fall arrest.", "The scaffold is fully planked, inspected, accessed by ladder, and protected by complete guardrails.", "Scaffold components are staged on the ground; erection status and employee access are unknown.", ["1926.451"], ["1910.178"], "stop scaffold use until inspected and protected"],
  ["excavations", "osha_construction", "A laborer is inside a seven-foot vertical trench with no trench box, shoring, or sloping; spoil is at the lip.", "No one entered the seven-foot trench; a rated shield is installed and spoil is set back more than two feet.", "A trench appears deep in a photo, but depth, soil, entry, and protective system cannot be confirmed.", ["1926.652", "1926.651"], ["1910.146"], "remove entrants and provide a competent-person-approved protective system"],
  ["confined_spaces", "osha_general_industry", "A worker climbs into a wastewater vault with limited entry before atmospheric testing or an attendant is provided.", "The permit-space entry has documented atmospheric tests, ventilation, attendant, rescue provisions, and entry authorization.", "A covered vault is present, but no entry is occurring and its configuration and hazards are unknown.", ["1910.146"], ["1926.652"], "prevent entry until permit-space controls are verified"],
  ["respiratory_exposure", "osha_general_industry", "Employees spray isocyanate coating in an enclosed booth while the exhaust is off and no respirators are worn.", "Spray-booth exhaust is operating within design parameters and employees wear fit-tested respirators selected by the program.", "A solvent odor is reported after a shift; concentration, task, duration, and ventilation are not known.", ["1910.134", "1910.107"], ["1926.1153"], "stop exposure and implement engineering and respiratory controls"],
  ["silica", "osha_construction", "A mason dry-cuts concrete indoors for two hours with no water, local exhaust, exposure assessment, or respirator.", "Concrete cutting uses an integrated water-delivery system continuously and the operator follows the applicable control method.", "Dust is visible near concrete work, but the tool, duration, material silica content, and controls are unknown.", ["1926.1153"], ["1910.95"], "use specified engineering controls and assess exposure"],
  ["noise", "osha_general_industry", "Dosimetry shows operators at 94 dBA TWA for the shift, but there is no hearing-conservation or audiometric program.", "Documented dosimetry is below the action level and the quieter process remains in normal operation.", "A press is described as very loud, but no measurement, duration, or employee exposure data exist.", ["1910.95"], ["1926.1153"], "reduce noise and implement required hearing conservation"],
  ["hazard_communication", "osha_general_industry", "An open secondary spray bottle at an employee workstation contains an unknown chemical and has no workplace label.", "The secondary container is closed and labeled with product identity and hazard information matching the SDS.", "An unlabeled empty bottle is in a discard bin; residue and intended reuse are unknown.", ["1910.1200"], ["1910.147"], "identify the substance, close the container, and restore labeling"],
  ["walking_working_surfaces", "osha_general_industry", "Coolant from a tipped drum crosses the only employee aisle and several employees are walking through it.", "A small release is wholly inside locked secondary containment with no employee or walkway exposure.", "A dark mark is visible on the floor; whether it is liquid, a stain, or in a travel path is unknown.", ["1910.22"], ["1910.1200"], "isolate the aisle and remove the slip exposure"],
  ["fire_protection", "osha_general_industry", "Stored cartons completely block access to the only portable fire extinguisher in the production area.", "The extinguisher is mounted, inspected, visible, and immediately accessible with a clear approach.", "An extinguisher is behind a pallet in a photograph, but alternate access and required travel distance are unknown.", ["1910.157"], ["1926.451"], "restore immediate access to fire protection"],
  ["compressed_gas", "osha_general_industry", "An oxygen cylinder stands unsecured beside a welding station with its valve protection cap removed while not connected.", "Stored cylinders are upright, capped, segregated as required, and restrained by approved chains.", "A tall metal vessel is visible but cannot be identified as a compressed-gas cylinder.", ["1910.101"], ["1926.652"], "secure and protect compressed-gas cylinders"],
  ["ppe", "osha_general_industry", "A grinder throws metal particles toward the operator's face; the documented PPE assessment requires eye protection, but none is worn.", "The grinder has its guard and the operator wears required safety glasses plus a face shield.", "A worker is near a grinder that is off; the task, particle exposure, and PPE assessment are unknown.", ["1910.132", "1910.133"], ["1910.95"], "stop exposure and provide hazard-assessment-based eye and face PPE"],
  ["rigging", "osha_construction", "A synthetic sling with a deep cut and exposed core yarns is supporting a suspended precast panel over workers.", "The tagged sling passed inspection, is within capacity, and personnel are excluded from the suspended-load zone.", "A sling lies beside a crane; condition, load, and planned use are not documented.", ["1926.251"], ["1910.146"], "land the load, remove the sling, and control the suspended-load zone"],
  ["cranes", "osha_construction", "A crane operator swings a suspended load directly over laborers while the signal person is out of view.", "The lift follows the plan, qualified signaling is maintained, and barricades keep employees out of the fall zone.", "A crane boom is raised at an idle site; no load, power-line clearance, or employee exposure is known.", ["1926.1417", "1926.1425"], ["1910.178"], "stop the lift and clear employees from the fall zone"],
  ["conveyors", "msha", "At a mine plant, a worker shovels spillage beneath a running belt beside an unguarded return roller.", "The mine conveyor is locked out and blocked against motion before cleanup; all accessible moving parts are guarded.", "Material is below a stopped mine conveyor, but lockout status and worker access are not known.", ["56.14107", "56.12016"], ["1910.178"], "stop, isolate, and guard conveyor hazards"],
  ["housekeeping", "osha_construction", "Scrap lumber with protruding nails and loose cords obstructs the active access route to the work area.", "Scrap is removed continuously, nails are bent or pulled, and access routes are clear.", "Unused lumber is stacked near but not within a route; stability and nail condition are not visible.", ["1926.25"], ["1910.146"], "clear access routes and remove or control sharp debris"],
  ["emergency_egress", "osha_general_industry", "A locked security gate blocks the only marked exit route during the occupied shift.", "Both exit routes are unlocked, illuminated, marked, and free of stored material.", "A door bears an exit sign, but whether it is required, locked, or obstructed cannot be determined.", ["1910.36", "1910.37"], ["1926.652"], "immediately restore an unlocked unobstructed exit route"],
  ["hot_work", "osha_general_industry", "Welding is underway beside exposed cardboard and an open flammable-liquid pail with no fire watch.", "Before welding, combustibles were moved, the pail was closed, an extinguisher was staged, and a fire watch is present.", "A hot-work permit is posted, but no work is occurring and permit controls were not inspected.", ["1910.252"], ["1910.147"], "stop hot work and control combustibles and ignition"],
  ["storage", "osha_general_industry", "Boxes are stacked unevenly above head height and visibly leaning into an occupied picking aisle.", "Boxed material is interlocked, stable, within rack capacity, and clear of aisles and sprinklers.", "A tall stack is photographed without scale; stability, rack rating, and employee access are unknown.", ["1910.176"], ["1926.451"], "barricade and restack material securely"],
  ["ergonomics", "osha_general_industry", "Workers report shoulder fatigue while repetitively lifting 25-pound cartons, but no injury, frequency study, or feasible control assessment exists.", "An adjustable lift table keeps routine lifts near waist height and rotation limits repetition.", "A worker bends once to pick up a light object; frequency, force, and duration are unknown.", [], ["1910.147", "1910.1200"], "perform an ergonomic assessment without inventing a specific mandatory citation"],
  ["environmental_only", "osha_general_industry", "A stormwater outfall is discolored outside the employee work area; no worker exposure or safety condition is described.", "The permitted outfall is clear and sampling records show compliance; no employee safety exposure exists.", "Vegetation near a property boundary appears stressed, with no identified substance or worker exposure.", [], ["1910.22", "1910.1200"], "route environmental concerns separately and avoid a safety violation conclusion"],
  ["multiple_hazards", "osha_general_industry", "A worker clears a powered mixer with the guard removed while standing in leaked oil and wearing no required eye protection.", "The mixer is locked out, guarded, the floor is dry, and required eye protection is worn.", "A mixer area appears cluttered, but machine state, guard condition, liquid, and worker task conflict between witnesses.", ["1910.147", "1910.212", "1910.22"], ["1926.652"], "prioritize energy isolation, then guarding and walking-surface controls"],
  ["primary_secondary", "osha_construction", "A worker is inside an unprotected eight-foot trench while a ladder is 40 feet away and spoil rests at the edge.", "The trench shield is installed, spoil is set back, and a secured ladder is within the required travel distance.", "A trench and ladder are visible, but employee entry and dimensions are not known.", ["1926.652", "1926.651"], ["1910.146"], "treat cave-in protection as primary and access/spoil as secondary"],
  ["jurisdiction_ambiguity", "all", "At a crushing facility, an employee services a conveyor without lockout; records do not establish whether the facility is a mine or general-industry plant.", "At a facility of unknown jurisdiction, the conveyor is deenergized, locked, blocked, and guarded during service.", "A conveyor is mentioned without facility type, task, energy state, or exposure.", [], ["56.12016", "1910.147"], "clarify jurisdiction before promoting a jurisdiction-specific citation"],
  ["contradictory_evidence", "osha_general_industry", "The observer saw a panel door open with live parts exposed, but the supervisor states the panel remained closed; no photo or voltage record resolves the conflict.", "A photograph and inspection record both show the panel closed and intact with no exposed parts.", "One witness says the panel was open and another says it was closed; neither account is corroborated.", [], ["1910.303"], "preserve the contradiction and require verification"],
  ["chemical_storage", "osha_general_industry", "A flammable-liquid cabinet door is propped open and several uncapped solvent containers are stored inside.", "Approved closed containers are stored within a self-closing flammable-liquid cabinet below capacity.", "A yellow cabinet contains containers, but contents, container closure, and cabinet rating are unknown.", ["1910.106"], ["1910.1200"], "close containers and restore compliant flammable-liquid storage"],
  ["stairs", "osha_general_industry", "Employees use a fixed stair flight with an open side and the required handrail missing.", "The fixed stair has continuous handrails and complete stair-rail protection on each exposed side.", "Three steps lead to a platform; dimensions, open sides, and required rail configuration are unknown.", ["1910.28", "1910.29"], ["1926.451"], "restrict use and install compliant stair and handrail protection"],
  ["welding_cylinders", "osha_construction", "Oxygen and fuel-gas cylinders are stored together, unsecured, without caps beside an active construction hot-work area.", "Construction welding cylinders are secured upright, capped when stored, and separated as required.", "Two cylinders are visible on a cart, but attachment, service state, caps, and contents are unclear.", ["1926.350"], ["1910.101"], "secure, cap, and separate cylinders as applicable"],
  ["mine_ground_control", "msha", "At a metal mine travelway, fresh loose rock hangs overhead and miners continue beneath it without scaling or barricades.", "The mine travelway was examined, loose ground scaled down, and the affected area barricaded until safe.", "A rough mine back is photographed, but competent examination and loose-ground condition are not known.", ["56.3200"], ["1926.652"], "withdraw miners and correct or support hazardous ground"],
];

const variants = [
  ["clear_violation", 0, true, false, "high", true],
  ["safe_controlled", 1, false, false, "low", false],
  ["insufficient_or_contradictory", 2, false, true, "uncertain", false],
];

const cases = [];
let sequence = 1;
for (const [domain, scope, violation, safe, ambiguous, required, prohibited, control] of domains) {
  for (const [kind, textIndex, violationExpected, clarificationRequired, riskDirection, immediateAction] of variants) {
    const observation = [violation, safe, ambiguous][textIndex];
    const specialAmbiguousJurisdiction = domain === "jurisdiction_ambiguity" && kind !== "safe_controlled";
    const specialContradiction = domain === "contradictory_evidence" && kind !== "safe_controlled";
    cases.push({
      id: `N${String(sequence++).padStart(3, "0")}`,
      domain,
      kind,
      observation,
      request: {
        text: observation,
        scopes: scope === "all" ? ["all"] : [scope],
        structuredObservation: {
          narrative: observation,
          jurisdiction:
            scope === "msha" ? "msha" :
            scope === "osha_construction" ? "osha-construction" :
            scope === "osha_general_industry" ? "osha-general-industry" : "unknown",
          evidenceSource: specialContradiction ? ["worker-report"] : ["visual"],
          unknownFacts: clarificationRequired ? ["applicability-critical facts remain unverified"] : [],
          unresolvedContradictions: specialContradiction ? [{
            field: "observed condition",
            originalValue: "unsafe condition present",
            answerValue: "unsafe condition absent",
            reason: "Two uncorroborated accounts conflict"
          }] : []
        }
      },
      expected: {
        jurisdiction: scope === "all" ? "unknown_or_clarify" : scope,
        primaryHazardCategory: domain,
        acceptableAlternateCategory: domain === "primary_secondary" ? "excavations" : null,
        requiredCitationFamily: violationExpected && !specialAmbiguousJurisdiction && !specialContradiction ? required : [],
        prohibitedCitationFamily: violationExpected ? prohibited : [...new Set([...required, ...prohibited])],
        citationShouldRemainCandidate: clarificationRequired || specialAmbiguousJurisdiction || specialContradiction,
        clarificationRequired: clarificationRequired || specialAmbiguousJurisdiction || specialContradiction,
        keyMissingEvidence: clarificationRequired ? "Facts named in the observation are not established." : null,
        expectedControlFocus: control,
        expectedRiskDirection: riskDirection,
        shutdownOrImmediateActionWarranted: violationExpected && immediateAction,
        why: violationExpected
          ? "The observation directly describes exposure and a failed control."
          : clarificationRequired
            ? "Applicability-critical facts are missing or contradictory."
            : "The observation affirmatively describes effective controls and no active exposure."
      },
      actual: null,
      scoring: null
    });
  }
}

function values(output) {
  const standards = [
    ...(Array.isArray(output?.suggestedStandards) ? output.suggestedStandards : []),
    ...(Array.isArray(output?.primaryStandards) ? output.primaryStandards : []),
    ...(Array.isArray(output?.standards) ? output.standards : []),
  ];
  return {
    classification: output?.classification ?? null,
    jurisdiction: output?.jurisdiction ?? output?.structuredObservation?.jurisdiction ?? null,
    primaryCitation: output?.primaryCitation ?? null,
    citations: [...new Set(standards.map((s) => String(s?.citation || s?.standard || "")).filter(Boolean))],
    confidence: output?.confidence ?? output?.confidenceIntelligence?.overallConfidence ?? null,
    requiresHumanReview: output?.requiresHumanReview ?? null,
    clarificationQuestions: output?.clarifyingQuestions ?? output?.clarificationQuestions ?? [],
    risk: output?.risk ?? null,
    generatedActions: output?.generatedActions ?? [],
    ambiguityWarnings: output?.ambiguityWarnings ?? [],
    responseKeys: output && typeof output === "object" ? Object.keys(output) : [],
  };
}

function includesFamily(citations, family) {
  const haystack = citations.join(" ").toLowerCase();
  return haystack.includes(String(family).toLowerCase());
}

for (let index = 0; index < cases.length; index += 1) {
  const testCase = cases[index];
  const started = Date.now();
  try {
    const response = await fetch(`${baseUrl}/safescope-v2/classify`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-dev-organization-id": "audit-novel-evaluation"
      },
      body: JSON.stringify(testCase.request),
    });
    const body = await response.json().catch(() => ({}));
    const actual = values(body);
    actual.httpStatus = response.status;
    actual.elapsedMs = Date.now() - started;
    testCase.actual = actual;
    const expected = testCase.expected;
    const allCitations = [...actual.citations, actual.primaryCitation].filter(Boolean);
    const requiredOk = expected.requiredCitationFamily.length === 0 ||
      expected.requiredCitationFamily.some((family) => includesFamily(allCitations, family));
    const prohibitedHit = expected.prohibitedCitationFamily.some((family) => includesFamily(allCitations, family));
    const clarificationObserved = Array.isArray(actual.clarificationQuestions) && actual.clarificationQuestions.length > 0;
    const safeSuppressed = testCase.kind !== "safe_controlled" || allCitations.length === 0;
    testCase.scoring = {
      httpOk: response.ok,
      requiredCitationSatisfied: requiredOk,
      prohibitedCitationPromoted: prohibitedHit,
      clarificationExpected: expected.clarificationRequired,
      clarificationObserved,
      clarificationCorrect: expected.clarificationRequired === clarificationObserved,
      safeStateSuppressed: safeSuppressed,
      acceptable: response.ok && requiredOk && !prohibitedHit &&
        (testCase.kind !== "safe_controlled" || safeSuppressed),
    };
  } catch (error) {
    testCase.actual = { error: String(error), elapsedMs: Date.now() - started };
    testCase.scoring = { httpOk: false, acceptable: false };
  }
  if ((index + 1) % 10 === 0) {
    process.stdout.write(`completed ${index + 1}/${cases.length}\n`);
  }
  // Endpoint is explicitly limited to 30/minute. Stay safely below it.
  await new Promise((resolve) => setTimeout(resolve, 2100));
}

await writeFile(outputPath, JSON.stringify({
  metadata: {
    generatedAt: new Date().toISOString(),
    methodology: "102 novel cases: 34 independently written hazard families × clear violation, safe/controlled, and insufficient/contradictory variants.",
    sourceExclusion: "Wording was authored for this audit after inspecting repository dataset locations; no case was copied from golden tests, gauntlets, seed files, or prior verification artifacts.",
    endpoint: `${baseUrl}/safescope-v2/classify`,
    limitations: [
      "Automated scoring checks citation-family presence and suppression; nuanced legal correctness requires expert review.",
      "The running service includes pre-existing uncommitted HazLenz source changes.",
      "The local expert bypass was used only in a separate audit backend process and did not alter subscription data."
    ]
  },
  cases
}, null, 2));

process.stdout.write(`wrote ${cases.length} cases to ${outputPath.pathname}\n`);
