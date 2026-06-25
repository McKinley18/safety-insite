import {
  SafeScopeJurisdiction,
  SafeScopeReasoningDomain,
} from '../reasoning-orchestrator/reasoning-orchestrator.types';
import {
  InspectionCandidateStandard,
  InspectionHazardCandidate,
  InspectionIntelligenceResult,
} from './inspection-intelligence.types';
import {
  InspectionIntelligenceRule,
  inspectionActions as actions,
} from './inspection-intelligence-rule.types';
import { INSPECTION_INTELLIGENCE_EXPANSION_RULES } from './inspection-intelligence-expansion.rules';
import { MineContextService } from './mine-context.service';
import { MineType } from './mine-context.types';
import { MshaInspectionIntelligenceService } from './msha-inspection-intelligence.service';
import { InspectionConditionAssessment } from './inspection-condition-assessment.types';
import { InspectionConditionAssessmentService } from './inspection-condition-assessment.service';
import { VagueInputIntelligenceService } from './vague-input-intelligence.service';
import { VagueInputAnalysis } from './vague-input-intelligence.types';
import { StandardApplicabilityService } from './standard-applicability.service';
import { EXPERT_APPLICABILITY_RULES } from './standard-applicability.rules';


const RULES: InspectionIntelligenceRule[] = [
  ...INSPECTION_INTELLIGENCE_EXPANSION_RULES,
  {
    id: 'compressed-gas-cylinder', domain: 'compressed_gas',
    matches: [/\b(oxygen|compressed gas|acetylene)\s+cylinders?\b/, /\bcylinders?\b.*\b(unsecured|not secured|missing (?:valve )?(?:protection )?caps?|walkway)\b/],
    initiating: 'A compressed-gas cylinder is unsecured, exposed to traffic, or lacks verified valve protection.',
    failure: 'Impact or a fall can damage the valve and release stored pressure, allowing uncontrolled movement or a projectile event.',
    exposure: 'People in the travel path may be struck; released gas may create oxidizer, fire, or atmospheric exposure depending on contents.',
    consequences: 'Crushing or struck-by injury, severe impact injury, fire intensification, or hazardous-atmosphere effects.',
    related: [{ domain: 'mobile_equipment', rationale: 'Traffic or pedestrian contact can initiate cylinder damage.', possible: true }, { domain: 'fire_protection', rationale: 'Oxygen can intensify combustion when a fuel and ignition source are present.', possible: true }],
    questions: ['Is the cylinder upright and secured with an approved restraint?', 'Is the valve cap installed and is vehicle or pedestrian contact credible?', 'What gas is present, and are fuel-gas separation and ignition controls relevant?'],
    controls: actions('Keep people and traffic clear and secure the cylinder upright immediately.', 'Relocate it to a protected designated storage area with valve protection.', 'Provide fixed racks or approved restraints and impact protection where traffic can reach cylinders.', 'Inspect cylinder-storage practices and train affected handlers on securing, caps, and segregation.', 'Photograph the restraint, cap, storage location, and impact protection after correction.'),
    standards: { osha_general_industry: [{ citation: '29 CFR 1910.101(b)', evidence: ['cylinder contents', 'restraint condition', 'valve protection', 'storage/use configuration'] }], osha_construction: [{ citation: '29 CFR 1926.350(a)', evidence: ['construction activity', 'cylinder use or storage status', 'upright securing method', 'valve cap status'] }] },
  },
  {
    id: 'open-oil', domain: 'hazardous_materials', matches: [/\b(open|uncovered)\b.*\b(used[- ]|waste[- ])?oil\b.*\b(container|drum|pail|bucket)\b/, /\b(used[- ]|waste[- ])?oil\b.*\b(container|drum|pail|bucket)\b.*\b(open|uncovered)\b/],
    initiating: 'A used-oil container is open or uncovered in a work area.', failure: 'Oil can spill, splash, leak, or be released during handling.', exposure: 'Workers can contact oil or track it onto walking surfaces; a release may reach soil or drains.', consequences: 'Slip-and-fall injury, skin exposure, environmental contamination, and possible fire involvement if combustible conditions exist.',
    related: [{ domain: 'walking_working_surfaces', rationale: 'Released oil can contaminate walking surfaces.' }, { domain: 'environmental_release', rationale: 'Oil may migrate to a drain, soil, or water.', possible: true }, { domain: 'fire_protection', rationale: 'A fire concern depends on oil properties and nearby ignition sources.', possible: true }],
    questions: ['Is oil present outside the container or on a walking surface?', 'Is the container labeled, compatible, closed when not adding oil, and in secondary containment?', 'Are drains, soil, combustibles, or ignition sources nearby?'],
    controls: actions('Close the container and isolate and clean any release using the site spill procedure.', 'Barricade contaminated walking surfaces and place the container in compatible secondary containment.', 'Provide a compatible closed container and protected used-oil storage/transfer arrangement.', 'Review used-oil labeling, inspection, housekeeping, and spill-response responsibilities with affected workers.', 'Verify closure, labeling, containment, clean walking surfaces, and proper disposition of cleanup material.'),
    standards: { osha_general_industry: [{ citation: '29 CFR 1910.22(a)(2)', evidence: ['oil on walking-working surface', 'employee access', 'cleanup condition'] }], osha_construction: [{ citation: '29 CFR 1926.25(a)', evidence: ['construction work area', 'waste accumulation or spill', 'employee access'] }] },
  },
  {
    id: 'spill-release-walking-surface', domain: 'walking_working_surfaces', matches: [/\b(open|uncovered|leaking|spill(?:ed)?|release|residue|open container)\b.*\b(used[- ]oil|waste[- ]oil|oil|oily waste|oily residue|liquid)\b.*\b(floor|walkway|aisle|travelway|pedestrian|maintenance area|maintenance bay|shop floor|work area|drain)\b/, /\b(used[- ]oil|waste[- ]oil|oil|oily waste|oily residue|liquid)\b.*\b(open|uncovered|leaking|spill(?:ed)?|release|residue)\b.*\b(floor|walkway|aisle|travelway|pedestrian|maintenance area|maintenance bay|shop floor|work area|drain)\b/, /\b(oily|residue|spill(?:ed)?|leak(?:ing)?|release)\b.*\b(floor|walkway|aisle|travelway|pedestrian|maintenance area|maintenance bay|shop floor|work area|drain)\b/, /\b(floor|walkway|aisle|travelway|pedestrian|maintenance area|maintenance bay|shop floor|work area|drain)\b.*\b(oily|residue|spill(?:ed)?|leak(?:ing)?|release)\b/],
    initiating: 'An open or leaking oil/liquid container releases material onto a floor, walkway, or drain path.', failure: 'The liquid spreads across the walking surface or migrates toward the drain.', exposure: 'Employees walking through the area contact the contaminated surface or track the liquid farther.', consequences: 'Same-level slip or fall, strain, and possible environmental release or contamination.',
    related: [{ domain: 'environmental_release', rationale: 'Material can migrate toward drains, soil, or water.', possible: true }, { domain: 'hazardous_materials', rationale: 'The stored liquid may need identity and containment review.', possible: true }],
    questions: ['What liquid or oily material is released, and how far has it spread across the floor or route?', 'Is the affected area a designated walkway, aisle, travelway, or pedestrian path?', 'Can the release reach a drain or other migration path, and what containment is present?'],
    controls: actions('Stop the release, clean the area, and barricade the contaminated path.', 'Move the source away from the route and place it in compatible secondary containment.', 'Correct the source, drainage, and housekeeping process that allowed the release to reach the route.', 'Assign inspection and response frequencies for releases and tracked contamination.', 'Verify the route is clear, dry, and protected from recurrence after cleanup.'),
    standards: { osha_general_industry: [{ citation: '29 CFR 1910.22(a)(2)', evidence: ['oil or liquid on walking-working surface', 'employee access', 'cleanup and containment status'] }], osha_construction: [{ citation: '29 CFR 1926.25(a)', evidence: ['construction work area', 'spill or leak', 'employee access'] }], msha: [{ citation: '30 CFR 56.20003(a)', evidence: ['mine travelway or workplace', 'spill or release', 'miner exposure'] }] },
  },
  {
    id: 'conveyor-guard-cleanup', domain: 'machine_guarding_loto', matches: [/\b(conveyor|tail pulley|head pulley)\b.*\b(missing|removed|without|no)\b.*\bguard/, /\b(tail pulley|conveyor)\b.*\b(cleanup|cleaning|clearing|maintenance|servicing)\b/],
    initiating: 'A conveyor nip point is accessible while cleanup or servicing exposure may occur.', failure: 'The missing guard permits contact and unexpected startup or stored motion can draw a person into moving parts.', exposure: 'Hands, clothing, tools, or body parts can enter the pulley, belt, shaft, or pinch point during cleanup.', consequences: 'Entanglement, caught-in injury, crushing, amputation, or fatal trauma.',
    related: [{ domain: 'machine_guarding', rationale: 'The accessible pulley or drive requires guarding analysis.' }, { domain: 'lockout_tagout', rationale: 'Cleanup or servicing may require hazardous-energy isolation.' }],
    questions: ['Was the conveyor energized, capable of startup, or subject to stored motion during cleanup?', 'Which pulley, shaft, nip point, and guard opening are accessible?', 'What jurisdiction applies, and what lockout, blocking, and zero-energy verification occurred?'],
    controls: actions('Stop cleanup and conveyor operation, isolate energy, and prevent access to the exposed point.', 'Lock out, tag, block, and verify zero energy under the site procedure before temporary access.', 'Install an effective fixed/interlocked guard that prevents contact and allows required inspection and maintenance.', 'Review guarding inspections and task-specific LOTO procedures with authorized and affected employees.', 'Document guard dimensions/integrity and a witnessed zero-energy and safe-restart verification.'),
    standards: { msha: [{ citation: '30 CFR 56.14107(a)', evidence: ['mine type/part applicability', 'accessible moving machine part', 'location and exposure'] }, { citation: '30 CFR 56.12016', evidence: ['maintenance or mechanical work', 'power disconnection', 'lock/tag and restart prevention'] }], osha_general_industry: [{ citation: '29 CFR 1910.212(a)(1)', evidence: ['machine and accessible danger zone', 'guard condition', 'employee exposure'] }, { citation: '29 CFR 1910.147', evidence: ['servicing activity', 'unexpected energization potential', 'energy-control procedure'] }], osha_construction: [{ citation: '29 CFR 1926.300(b)(2)', evidence: ['construction equipment use', 'exposed moving parts', 'employee access'] }] },
  },
  {
    id: 'open-panel', domain: 'electrical', matches: [/\b(open breaker slot|missing (panel )?cover|open electrical panel|exposed (live |energized )?(bus|parts|terminals))\b/],
    initiating: 'An electrical enclosure has an open slot, missing cover, or accessible energized parts.', failure: 'The enclosure no longer prevents accidental contact or entry of conductive material.', exposure: 'A person can directly contact energized parts or initiate an arc while approaching or working near the opening.', consequences: 'Shock, electrocution, arc-flash burn, secondary fall, or fire.',
    questions: ['Are energized parts exposed, and what voltage and equipment type are involved?', 'Can unqualified persons access the panel?', 'Has a qualified electrical person assessed de-energization, cover compatibility, and enclosure integrity?'],
    controls: actions('Restrict access and have a qualified person de-energize or establish an electrically safe condition.', 'Install a listed temporary barrier only under qualified electrical direction until permanent repair.', 'Install the correct dead-front, filler plate, or enclosure cover and restore the equipment rating.', 'Review electrical-panel inspection and access-control responsibilities; authorize only qualified electrical work.', 'Record qualified inspection, voltage/status verification, correct cover installation, and enclosure closure.'),
    standards: { osha_general_industry: [{ citation: '29 CFR 1910.303(g)(2)(i)', evidence: ['nominal voltage', 'exposed live parts', 'access by qualified/unqualified persons', 'guarding method'] }], osha_construction: [{ citation: '29 CFR 1926.403(i)(2)(i)', evidence: ['construction applicability', 'voltage', 'exposed live parts', 'guarding/access'] }], msha: [{ citation: '30 CFR 56.12032', evidence: ['mine type/part applicability', 'inspection or cover defect', 'potential shock or fire hazard'] }] },
  },
  {
    id: 'damaged-wet-cord', domain: 'electrical', matches: [/\b(damaged|frayed|cut|exposed)\b.*\b(extension |power )?cord\b.*\b(wet|water|damp)\b/, /\b(wet|water|damp)\b.*\b(damaged|frayed|cut|exposed)\b.*\bcord\b/],
    initiating: 'A damaged flexible cord is used or located where moisture may be present.', failure: 'Damaged insulation and wet conditions can defeat insulation and grounding protections or create leakage current.', exposure: 'A person may contact the cord, connected tool, water, or conductive surface; routing may also create a trip path.', consequences: 'Shock, electrocution, burns, secondary fall, or a trip injury if the cord crosses travel.', related: [{ domain: 'walking_working_surfaces', rationale: 'Cord routing can create a trip hazard when it crosses a walkway.', possible: true }],
    questions: ['Is the cord energized, what damage is visible, and has it been removed from service?', 'Is the location wet, damp, outdoors, or otherwise conductive, and is GFCI protection verified?', 'Is the cord temporary wiring and does it cross a pedestrian route?'],
    controls: actions('De-energize and remove the damaged cord from service; keep people out of the wet contact area.', 'Use an inspected wet-location-rated cord and verified GFCI protection only after the area is made safe.', 'Replace damaged wiring and provide permanent, correctly rated power and protected routing.', 'Implement pre-use cord/GFCI inspections and temporary-wiring controls for wet work.', 'Document cord replacement, GFCI functional test, dry-area correction, and protected routing.'),
    standards: { osha_general_industry: [{ citation: '29 CFR 1910.334(a)(2)(ii)', evidence: ['cord damage', 'energized/use status', 'removal from service'] }, { citation: '29 CFR 1910.305(g)', evidence: ['flexible-cord use', 'location rating', 'temporary/permanent use'] }], osha_construction: [{ citation: '29 CFR 1926.404(b)(1)(ii)', evidence: ['construction receptacle use', 'GFCI or assured grounding program', 'wet exposure'] }] },
  },
  {
    id: 'damaged-flexible-cord', domain: 'electrical', matches: [/\b(damaged|frayed|cut|exposed insulation|exposed conductor)\b.*\b(extension |flexible |power )?cord\b/, /\b(extension |flexible |power )?cord\b.*\b(damaged|frayed|cut|exposed insulation|exposed conductor)\b/],
    initiating: 'A flexible cord has visible damage while remaining available for use.',
    failure: 'Damaged insulation, strain relief, or conductors can permit energized contact, fault current, arcing, or fire.',
    exposure: 'Employees handling the cord or connected equipment may contact an energized conductor or conductive surface.',
    consequences: 'Shock, electrocution, burns, arc injury, secondary fall, or fire.',
    questions: ['What damage, voltage, energized/use status, cord type, and connected equipment are involved?', 'Was the cord removed from service and is the use temporary, construction, wet, or otherwise severe?', 'What inspection, grounding/GFCI, routing, and replacement evidence is available?'],
    controls: actions('De-energize and remove the damaged cord from service.', 'Provide inspected temporary power with appropriate grounding/GFCI and protected routing.', 'Replace the cord or install permanent correctly rated wiring for recurring service.', 'Maintain pre-use inspection, removal criteria, and temporary-wiring controls for the observed work.', 'Document defect disposition, replacement rating, protective-device test, and safe routing.'),
    standards: { osha_general_industry: [{ citation: '29 CFR 1910.334(a)(2)(ii)', evidence: ['cord defect', 'energized/use status', 'inspection and removal from service'] }, { citation: '29 CFR 1910.305(g)', evidence: ['flexible-cord use and location', 'temporary/permanent use', 'cord rating and protection'] }], osha_construction: [{ citation: '29 CFR 1926.405(a)(2)(ii)(I)', evidence: ['construction activity', 'temporary wiring/cord use', 'damage and employee exposure'] }] },
  },
  {
    id: 'mobile-pedestrian', domain: 'mobile_equipment', matches: [/\b(forklift|loader|haul truck|mobile equipment)\b.*\b(pedestrian|worker|employee|miner)s?\b.*\b(no |without |lack).{0,30}(separation|barrier|traffic control|spotter)/, /\b(pedestrian|worker|employee|miner)s?\b.*\b(forklift|loader|haul truck|mobile equipment)\b/],
    initiating: 'Mobile equipment and pedestrians occupy the same operating area without verified separation.', failure: 'Blind spots, reversing, turning, speed, or communication failure can place equipment in a pedestrian path.', exposure: 'Pedestrians can enter the travel or swing zone without the operator seeing or stopping for them.', consequences: 'Struck-by, pinned-between, run-over, or crushing injury.',
    questions: ['What equipment, route, blind spots, speed, and pedestrian frequency are involved?', 'Are physical separation, exclusion zones, right-of-way, alarms, mirrors/cameras, or a spotter in use?', 'Are operators authorized and are pedestrians trained for the traffic plan?'],
    controls: actions('Stop or restrict equipment movement until pedestrians are separated from the operating zone.', 'Use barricades, an exclusion zone, controlled crossings, and a dedicated spotter where needed.', 'Redesign routes with physical separation, visibility improvements, protected crossings, and proximity controls.', 'Maintain a site traffic plan with operator authorization, pedestrian rules, communication, and enforcement.', 'Observe a full operating cycle and document separation, visibility, alarms, crossings, and worker understanding.'),
    standards: { osha_general_industry: [{ citation: '29 CFR 1910.178', evidence: ['powered industrial truck type', 'operating area', 'pedestrian exposure', 'operator authorization'] }], osha_construction: [{ citation: '29 CFR 1926.602', evidence: ['construction equipment type', 'route and visibility', 'pedestrian exposure', 'equipment controls'] }], msha: [{ citation: '30 CFR 56.9100', evidence: ['mine traffic context', 'rules/signals', 'pedestrian and equipment interaction'] }] },
  },
  {
    id: 'mobile-blind-corner-control', domain: 'traffic_control', matches: [/\b(forklift|loader|truck|mobile equipment|traffic route)\b.*\bblind corner\b.*\b(no|without|missing)\b.*\b(sign|warning|mirror|traffic control)/, /\bblind corner\b.*\b(no warning|no traffic control|missing sign|missing mirror)\b/],
    initiating: 'A mobile-equipment route includes a blind corner without a verified warning or visibility control.',
    failure: 'Restricted sight distance can prevent operators or other route users from detecting conflicting traffic in time.',
    exposure: 'Vehicles, equipment, or people approaching the corner may enter the same conflict zone without warning.',
    consequences: 'Collision, struck-by, caught-between, or property-damage injury.',
    questions: ['Which users and equipment approach the corner, at what speed and frequency?', 'Are mirrors, signs, alarms, stop controls, right-of-way rules, lighting, or one-way routing present?', 'Does physical pedestrian separation remain effective through the corner and crossings?'],
    controls: actions('Restrict approach speed and conflicting movement until visibility/warning controls are restored.', 'Use temporary stop control, warning, and controlled right-of-way at the corner.', 'Redesign the corner with sight-distance improvements, mirrors/signals, protected routes, or one-way flow.', 'Update the traffic plan and verify operator and pedestrian understanding of the corner controls.', 'Observe representative movements and document sight distance, controls, speed, separation, and compliance.'),
    standards: { osha_general_industry: [{ citation: '29 CFR 1910.178', evidence: ['powered industrial truck applicability', 'route geometry and sight distance', 'traffic interaction', 'warning/operating controls'] }], osha_construction: [{ citation: '29 CFR 1926.602', evidence: ['construction equipment operation', 'blind-corner route', 'warning and traffic controls'] }], msha: [{ citation: '30 CFR 56.9100', evidence: ['mine traffic route', 'blind-corner interaction', 'traffic rules/signals and exposure'] }] },
  },
  {
    id: 'platform-fall', domain: 'fall_protection', matches: [/\b(elevated|raised|aerial)\b.*\b(platform|work platform|surface)\b.*\b(no|without|missing)\b.*\b(guardrail|fall arrest|fall protection)/, /\b(unprotected edge|floor opening)\b/, /\b(exposed|employee exposure|worker exposure)\b.*\b(elevated|unguarded)\b.*\bedge\b/],
    initiating: 'A worker is exposed to an elevated edge or opening without a verified protective system.', failure: 'Loss of balance, a misstep, surface failure, or task force can carry the worker beyond the edge.', exposure: 'The worker can fall to a lower level or through an opening.', consequences: 'Severe or fatal fall injury, including head, spinal, or multiple-trauma injury.',
    questions: ['What is the measured fall distance, platform type, edge/opening geometry, and task?', 'Are compliant guardrails, covers, travel restraint, or personal fall arrest present and suitable?', 'If PFAS is used, are anchorage, connector, clearance, rescue, and inspection verified?'],
    controls: actions('Stop exposed work and restrict access to the edge or opening.', 'Install a compliant temporary guardrail/cover or use a verified restraint/arrest system under competent supervision.', 'Provide permanent guardrails, rated covers, or an engineered fall-protection system appropriate to the platform.', 'Document fall-protection planning, equipment inspection, worker authorization/training, and rescue arrangements.', 'Measure and photograph the completed system and document competent-person or qualified-person verification.'),
    standards: { osha_general_industry: [{ citation: '29 CFR 1910.28(b)', evidence: ['walking-working surface type', 'fall distance', 'edge/opening exposure', 'protection used'] }], osha_construction: [{ citation: '29 CFR 1926.501', evidence: ['construction activity', 'fall distance', 'surface/edge type', 'protection used'] }], msha: [{ citation: '30 CFR 56.15005', evidence: ['mine work context', 'falling hazard', 'safety belt/line or alternative protection'] }] },
  },
  {
    id: 'chemical-drain', domain: 'hazard_communication', matches: [/\b(unlabeled|no label|open)\b.*\b(chemical|container|bottle|drum)\b.*\b(drain|sewer)/, /\b(chemical|container|bottle|drum)\b.*\b(unlabeled|no label|open)\b/],
    initiating: 'A chemical container is open or lacks verified identity near a potential release pathway.', failure: 'The substance can spill, emit vapor, be misused, or enter a drain because identity and closure controls are absent.', exposure: 'Workers may contact or inhale an unknown substance and a release may migrate to wastewater or the environment.', consequences: 'Chemical burn, irritation, poisoning, incompatible reaction, fire depending on properties, or environmental contamination.', related: [{ domain: 'environmental_release', rationale: 'The nearby drain is a credible migration pathway.' }, { domain: 'fire_protection', rationale: 'Flammability is a possible concern until the substance is identified.', possible: true }],
    questions: ['What is the substance, concentration, container use, and corresponding SDS?', 'Is the container required to be closed and labeled, and is it compatible and intact?', 'Can a release reach the drain, and what drain protection and spill controls are present?'],
    controls: actions('Stop use, protect the drain, isolate the container, and identify the substance before handling.', 'Close and place the container in compatible secondary containment with controlled access.', 'Provide compatible closed storage/dispensing and engineered drain or spill containment where releases are credible.', 'Correct the HazCom inventory/label/SDS process and train workers on transfer, closure, and spill response.', 'Verify identity, workplace label, SDS access, closure, compatibility, containment, and drain protection.'),
    standards: { osha_general_industry: [{ citation: '29 CFR 1910.1200(f)', evidence: ['chemical identity', 'workplace container status', 'label elements/exemption', 'employee exposure'] }], osha_construction: [{ citation: '29 CFR 1926.59', evidence: ['construction use', 'hazardous chemical identity', 'label/SDS status', 'employee exposure'] }] },
  },
  {
    id: 'blocked-egress', domain: 'emergency_preparedness', matches: [/\b(blocked|obstructed|locked)\b.*\b(emergency )?(exit|egress|exit route)/, /\b(exit|egress|exit route)\b.*\b(blocked|obstructed|locked)/],
    initiating: 'An exit route, exit access, or emergency exit is obstructed or unavailable.', failure: 'The obstruction delays or prevents occupants from reaching a safe discharge during an emergency.', exposure: 'People may queue, reverse direction, enter smoke/fire conditions, or be unable to evacuate.', consequences: 'Smoke inhalation, burns, crushing/panic injury, or delayed emergency response.',
    questions: ['Which part of the exit route is affected and is an alternate route continuously available?', 'Is the exit unlocked, marked, illuminated, and adequate for expected occupancy?', 'How long has the obstruction existed and who verifies routes each shift?'],
    controls: actions('Remove the obstruction immediately or close the affected area until compliant egress is restored.', 'Mark and control the route and provide a verified alternate only under the emergency plan.', 'Redesign storage/layout or install protective controls so required exit width and access remain permanent.', 'Assign documented exit-route inspections and storage/housekeeping accountability.', 'Walk the full route to discharge and document clear width, operability, marking, lighting, and inspection.'),
    standards: { osha_general_industry: [{ citation: '29 CFR 1910.37(a)(3)', evidence: ['exit-route segment', 'obstruction', 'required capacity/access', 'occupant exposure'] }], osha_construction: [{ citation: '29 CFR 1926.34(c)', evidence: ['construction workplace', 'exit availability', 'obstruction and occupancy'] }] },
  },
  {
    id: 'housekeeping', domain: 'walking_working_surfaces', matches: [/\b(poor housekeeping|debris|clutter|materials|boxes|cords)\b.*\b(slip|trip|walkway|aisle|travelway)/, /\b(slip|trip) hazard\b.*\b(housekeeping|debris|clutter|walkway|aisle)/, /\b(walkway|aisle|travelway|passageway)\b.*\b(slip|trip) hazard\b/],
    initiating: 'Debris, clutter, material, or contamination is present in a walking or working path.', failure: 'The surface no longer provides clear, orderly, stable footing.', exposure: 'A person can catch a foot, slip, alter their path, or fall into adjacent equipment or objects.', consequences: 'Slip, trip, same-level fall, sprain, fracture, or secondary contact injury.',
    questions: ['What material or condition creates the hazard and what route/area is affected?', 'How frequently do workers use the area and is lighting or visibility limited?', 'Is the condition temporary, recurring, or caused by inadequate storage or leak control?'],
    controls: actions('Remove or clean the immediate obstruction and warn or barricade until the route is safe.', 'Provide temporary routing and designated staging or cleanup controls.', 'Correct storage, drainage, leak, flooring, or cable-routing causes and provide durable designated locations.', 'Set inspection/cleanup frequency and assign housekeeping ownership for the affected process.', 'Photograph the clear, dry route and verify it remains clear during normal operations.'),
    standards: { osha_general_industry: [{ citation: '29 CFR 1910.22(a)', evidence: ['walking-working surface', 'specific obstruction/contamination', 'employee access'] }], osha_construction: [{ citation: '29 CFR 1926.25(a)', evidence: ['construction work area', 'debris/waste', 'employee route'] }], msha: [{ citation: '30 CFR 56.20003(a)', evidence: ['mine workplace/passageway', 'material accumulation', 'slip/trip exposure'] }] },
  },
  {
    id: 'rotating-shaft', domain: 'machine_guarding', matches: [/\b(exposed|unguarded|no guard|missing guard)\b.*\b(rotating shaft|coupling|drive shaft)/, /\b(rotating shaft|coupling|drive shaft)\b.*\b(exposed|unguarded|no guard|missing guard)/],
    initiating: 'A rotating shaft or coupling is accessible without an effective guard.', failure: 'Rotation can catch clothing, hair, gloves, or a body part and pull the person into the machine.', exposure: 'A worker can reach or inadvertently enter the rotating-part danger zone.', consequences: 'Entanglement, caught-in injury, amputation, crushing, or fatal trauma.',
    questions: ['Is the part rotating during operation and within reach of any worker task or travel path?', 'What guard is missing or deficient and what openings/access remain?', 'Are adjustment, lubrication, cleanup, or servicing tasks performed nearby?'],
    controls: actions('Stop the machine or prevent access to the rotating-part danger zone.', 'Apply energy isolation for any work and use a secured temporary barrier pending repair.', 'Install a fixed or interlocked guard that prevents contact with the full rotating hazard.', 'Add guarding inspections and task-specific LOTO requirements to operating and maintenance procedures.', 'Verify guard security/openings and observe operation and servicing access before return to use.'),
    standards: { osha_general_industry: [{ citation: '29 CFR 1910.219(c)', evidence: ['shaft/coupling type', 'location/height', 'guard condition', 'employee access'] }], osha_construction: [{ citation: '29 CFR 1926.300(b)(2)', evidence: ['construction equipment use', 'exposed moving part', 'employee access'] }], msha: [{ citation: '30 CFR 56.14107(a)', evidence: ['accessible moving machine part', 'mine applicability', 'employee exposure'] }] },
  },
  {
    id: 'confined-space-ambiguity', domain: 'confined_space', matches: [/\b(tank|vault|pit|vessel|manhole|confined space|permit space)\b.*\b(entry|enter|inside|access|unknown|unclear)/, /\b(confined|permit)[ -]?space\b/],
    initiating: 'A space may have limited entry/exit or another confined-space characteristic, but classification facts are incomplete.', failure: 'Entry without classification can bypass atmospheric, engulfment, configuration, isolation, attendant, or rescue controls.', exposure: 'An entrant may encounter a hazardous atmosphere, engulfment, entrapment, or uncontrolled energy with difficult self-rescue.', consequences: 'Asphyxiation, poisoning, fire/explosion, engulfment, crushing, or fatal rescue escalation.',
    questions: ['Is the space large enough to enter, has limited entry/exit, and is it not designed for continuous occupancy?', 'Does it contain or potentially contain atmospheric, engulfment, configuration, energy, or other serious hazards?', 'Has a qualified person classified the space and verified testing, isolation, entry, attendant, and rescue requirements?'],
    controls: actions('Do not enter until the space and hazards are classified by a qualified person.', 'Control access and perform documented atmospheric evaluation and energy/process isolation planning.', 'Eliminate or engineer out hazards where feasible and provide required ventilation, isolation, access, and retrieval systems.', 'Implement the applicable permit/alternate-entry program with roles, training, communication, and rescue capability.', 'Retain classification, permit/test results, isolation verification, equipment inspections, and post-entry review.'),
    standards: { osha_general_industry: [{ citation: '29 CFR 1910.146', evidence: ['space configuration', 'entry/exit', 'occupancy design', 'actual/potential hazards', 'entry activity'] }], osha_construction: [{ citation: '29 CFR 1926.1203', evidence: ['construction activity', 'space identification', 'competent-person evaluation', 'entry and hazards'] }] },
  },
  {
    id: 'hot-work-combustibles', domain: 'welding_cutting_hot_work', matches: [/\b(hot work|welding|cutting|brazing|grinding)\b.*\b(combustible|flammable|cardboard|wood|fuel|vapou?r)/],
    initiating: 'Hot work produces an ignition source near combustible or potentially flammable material.', failure: 'Sparks, slag, heat, or flame can ignite nearby material or a vapor atmosphere.', exposure: 'Fire or explosion can reach the worker and surrounding occupants and propagate beyond the work area.', consequences: 'Burns, smoke inhalation, explosion trauma, property damage, or fatal injury.',
    questions: ['What hot-work process, combustible/flammable material, distance, and enclosure/opening conditions are present?', 'Were atmosphere testing, material removal/protection, fire watch, extinguishers, and permit controls required and used?', 'Could sparks or heat travel to concealed or adjacent spaces?'],
    controls: actions('Stop hot work and remove or protect combustibles and any flammable atmosphere.', 'Establish the required fire watch, barriers/blankets, extinguishing equipment, and controlled hot-work area.', 'Relocate the work or combustibles, isolate fuel sources, and engineer spark/heat containment and ventilation.', 'Use a site-specific hot-work permit/program with authorization, area inspection, fire-watch duties, and training.', 'Document pre-work/atmospheric checks, permit controls, fire-watch duration, and post-work fire inspection.'),
    standards: { osha_general_industry: [{ citation: '29 CFR 1910.252(a)(2)(iv)', evidence: ['hot-work process', 'combustible proximity', 'removal/protection feasibility', 'fire watch/permit conditions'] }], osha_construction: [{ citation: '29 CFR 1926.352(a)', evidence: ['construction hot work', 'combustible material', 'removal/guarding', 'fire prevention controls'] }] },
  },
  {
    id: 'loto-ambiguity', domain: 'lockout_tagout', matches: [/\b(maintenance|servicing|cleaning|clearing|unjam|jam)\b.*\b(energized|running|energy|lockout|loto|startup|stored)/, /\b(lockout|loto)\b.*\b(unclear|unknown|not verified|missing|without)/],
    initiating: 'Maintenance or servicing may expose a worker to unexpected energization, startup, motion, or stored energy.', failure: 'Incomplete isolation, lock/tag application, dissipation, blocking, or verification permits hazardous energy release.', exposure: 'A worker in the danger zone may be contacted by moving parts, electrical energy, pressure, gravity, heat, or stored force.', consequences: 'Caught-in, crushing, amputation, shock, burn, injection, or fatal injury.',
    questions: ['What task qualifies as servicing and what electrical, mechanical, hydraulic, pneumatic, gravity, thermal, or stored energy is present?', 'Which isolation points, locks/tags, blocks, dissipation steps, and zero-energy tests were used?', 'Could normal production controls or an exception apply, and has an authorized employee verified that basis?'],
    controls: actions('Stop servicing and keep workers clear until all hazardous energy is controlled.', 'Apply the equipment-specific lockout/tagout procedure, block motion, dissipate stored energy, and verify isolation.', 'Provide lockable isolation devices and engineered means to bleed, block, restrain, or disconnect each energy source.', 'Correct the energy-control procedure and periodic inspection and retrain authorized/affected employees on the observed gap.', 'Document each isolation point, individual lock/tag, stored-energy control, zero-energy test, and safe restoration.'),
    standards: { osha_general_industry: [{ citation: '29 CFR 1910.147', evidence: ['servicing task', 'hazardous energy sources', 'unexpected startup/release potential', 'procedure and isolation steps'] }], osha_construction: [{ citation: '29 CFR 1926.417', evidence: ['construction electrical work', 'circuit/equipment de-energization', 'tag/lock controls'] }], msha: [{ citation: '30 CFR 56.12016', evidence: ['mechanical work on powered equipment', 'power disconnection', 'lock/tag and restart prevention'] }] },
  },
  {
    id: 'ladder', domain: 'ladders', matches: [/\b(ladder|stepladder|extension ladder)\b.*\b(damaged|broken|defective|misuse|top step|not secured|wrong angle|unstable)/, /\b(damaged|broken|defective)\b.*\bladder\b/],
    initiating: 'A ladder is damaged, unstable, incorrectly configured, or used contrary to its design.', failure: 'The ladder, footing, support, or user position can shift, collapse, or allow loss of balance.', exposure: 'The user can fall from the ladder or the ladder can strike nearby people or equipment.', consequences: 'Fall injury, fracture, head/spinal trauma, or secondary electrical/contact injury.',
    questions: ['What ladder type, length, duty rating, defect, setup, and task are involved?', 'Is the ladder on stable footing, secured where required, correctly angled/extended, and clear of electrical exposure?', 'Was it inspected before use and has a defective ladder been tagged and removed from service?'],
    controls: actions('Stop use and tag/remove a damaged or improperly set ladder from service.', 'Provide a suitable inspected ladder or other access system and secure the area/setup.', 'Replace defective equipment and provide a stable designed access platform where recurring work makes ladders unsuitable.', 'Correct ladder selection, inspection, setup, three-point-contact, and prohibited-use practices for the observed task.', 'Document defect disposition and inspect the replacement ladder, footing, securing, angle/extension, and user setup.'),
    standards: { osha_general_industry: [{ citation: '29 CFR 1910.23(b)', evidence: ['ladder type', 'defect/use condition', 'inspection/removal status', 'employee use'] }], osha_construction: [{ citation: '29 CFR 1926.1053(b)', evidence: ['construction use', 'ladder type/setup', 'defect or misuse', 'employee exposure'] }], msha: [{ citation: '30 CFR 56.11011', evidence: ['mine ladder use', 'construction/maintenance condition', 'secure footing/support'] }] },
  },
];

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function matchesRule(text: string, rule: InspectionIntelligenceRule): boolean {
  return rule.matches.some((pattern) => pattern.test(text));
}

function citationAllowedForMineType(citation: string, mineType: MineType): boolean {
  if (mineType === 'not_mine') return !/^30 CFR\b/.test(citation);
  if (/^29 CFR\b/.test(citation)) return false;
  const part = citation.match(/30 CFR (\d+)/)?.[1];
  if (!part) return true;
  if (part === '62') return true;
  if (mineType === 'surface_metal_nonmetal') return ['46', '48', '56'].includes(part);
  if (mineType === 'underground_metal_nonmetal') return ['48', '57'].includes(part);
  if (mineType === 'surface_coal') return ['48', '71', '77'].includes(part);
  if (mineType === 'underground_coal') return ['48', '70', '75'].includes(part);
  if (mineType === 'unclear_mine') return false;
  return true;
}

const DOMAIN_SEVERITY: Partial<Record<SafeScopeReasoningDomain, number>> = {
  electrical: 100,
  machine_guarding_loto: 98,
  confined_space: 96,
  excavation_trenching: 94,
  fall_protection: 92,
  ground_control: 92,
  cranes_rigging_hoisting: 90,
  mobile_equipment: 88,
  powered_haulage: 88,
  welding_cutting_hot_work: 86,
  fire_protection: 85,
  machine_guarding: 84,
  compressed_gas: 82,
  hazardous_materials: 78,
  environmental_release: 76,
  hazard_communication: 72,
  walking_working_surfaces: 65,
  training_procedure_gap: 55,
};

function ruleScore(
  rule: InspectionIntelligenceRule,
  text: string,
  jurisdiction: SafeScopeJurisdiction,
  classifiedDomain: SafeScopeReasoningDomain,
): number {
  let score = DOMAIN_SEVERITY[rule.domain] || 70;
  if (rule.domain === classifiedDomain) score += 8;
  if ((rule.confidence || 'high') === 'high') score += 8;
  if (rule.confidence === 'moderate' && /\b(unclear|unknown|not verified|not confirmed|insufficient|possible|maybe)\b/.test(text)) score += 12;
  if (/\b(missing|unguarded|unsecured|exposed|damaged|blocked|leaking|inoperative|without|not verified)\b/.test(text)) score += 8;
  if (/\b(worker|employee|miner|pedestrian)s?\b.*\b(near|beside|inside|under|within reach|exposed)|\b(cleanup|maintenance|servicing|entry)\b/.test(text)) score += 6;
  if (jurisdiction === 'msha' && rule.id.startsWith('msha-')) score += 7;
  return score;
}

function buildMechanismOfInjury(input: {
  primaryRule?: InspectionIntelligenceRule;
  orderedRules: InspectionIntelligenceRule[];
  conditionAssessment: InspectionConditionAssessment;
  vagueInputAnalysis: VagueInputAnalysis;
  correctiveActions: InspectionIntelligenceResult['correctiveActions'];
  baseEvidenceGapQuestions: string[];
  standardApplicabilityQuestions: string[];
}): InspectionIntelligenceResult['mechanismOfInjury'] {
  const isVague = Boolean(input.vagueInputAnalysis?.isVague);
  const isControlled = input.conditionAssessment.status === 'controlled';
  const isNoHazardSignal = input.conditionAssessment.status === 'no_hazard_signal';

  const initiatingCondition = isVague
    ? unique([
      ...(input.vagueInputAnalysis.observedFacts || []),
      ...(input.vagueInputAnalysis.missingCriticalFacts || []).slice(0, 3),
    ])
    : input.primaryRule
      ? unique(input.orderedRules.map((rule) => rule.initiating))
      : isControlled
        ? unique([
          ...(input.conditionAssessment.controlEvidence || []),
          'The observation describes the relevant control as present and effective.',
        ])
        : isNoHazardSignal
          ? ['The observation uses administrative or conversational wording without a distinct physical hazard condition.']
          : ['The observation identifies a hazard signal, but the initiating condition remains under-specified.'];

  const failureMode = isVague
    ? unique(input.vagueInputAnalysis.inferredPossibilities || [])
    : input.primaryRule
      ? unique(input.orderedRules.map((rule) => rule.failure))
      : isControlled
        ? ['No uncontrolled failure or release mode is established by the observation.']
        : isNoHazardSignal
          ? ['No active failure mode is established from the current wording alone.']
          : ['A release, failure, or exposure mechanism is suspected but not yet specific enough to state with confidence.'];

  const exposurePathway = isVague
    ? ['Employee proximity, travel path, or task exposure is not yet confirmed.']
    : input.primaryRule
      ? unique(input.orderedRules.map((rule) => rule.exposure))
      : isControlled
        ? ['No current employee exposure pathway is established while the described control remains effective.']
        : isNoHazardSignal
          ? ['No worker exposure pathway is established from the current wording alone.']
          : ['The exposure path is not yet specific enough to distinguish direct contact from indirect pathway exposure.'];

  const potentialConsequences = isVague
    ? ['Possible injury, illness, or environmental harm depending on unconfirmed details.']
    : input.primaryRule
      ? unique(input.orderedRules.map((rule) => rule.consequences))
      : isControlled
        ? ['No injury or environmental consequence is inferred from a controlled condition alone.']
        : isNoHazardSignal
          ? ['No consequence is supported without a physical hazard condition.']
          : ['The likely consequence cannot be ranked without more condition, exposure, and control evidence.'];

  const evidenceGaps = unique([
    ...input.standardApplicabilityQuestions,
    ...input.baseEvidenceGapQuestions,
    ...(isVague ? (input.vagueInputAnalysis.missingCriticalFacts || []) : []),
    ...(isVague ? (input.vagueInputAnalysis.immediateSafetyQuestions || []) : []),
    ...(isControlled ? ['Confirm the control remains effective during actual exposure or task conditions.'] : []),
  ]).slice(0, 12);

  const controlThemes = unique([
    ...(input.conditionAssessment.controlEvidence || []),
    ...(isVague ? (input.vagueInputAnalysis.conservativeInterimControls || []) : input.correctiveActions.immediate),
    ...(input.correctiveActions.permanentEngineering || []),
    ...(input.correctiveActions.administrativeProgramTraining || []),
  ]).slice(0, 10);

  return {
    initiatingCondition,
    failureMode,
    exposurePathway,
    potentialConsequences,
    evidenceGaps,
    controlThemes,
  };
}

export class InspectionIntelligenceService {
  constructor(
    private readonly mineContextService = new MineContextService(),
    private readonly mshaInspectionIntelligenceService = new MshaInspectionIntelligenceService(),
    private readonly conditionAssessmentService = new InspectionConditionAssessmentService(),
    private readonly standardApplicabilityService = new StandardApplicabilityService(),
  ) {}

  analyze(input: {
    observation: string;
    rawObservation?: string;
    jurisdiction: SafeScopeJurisdiction;
    primaryDomain: SafeScopeReasoningDomain;
    primaryCitation?: string;
  }): InspectionIntelligenceResult {
    const text = input.observation.toLowerCase();
    const standardAppResults = this.standardApplicabilityService.evaluate(
      input.rawObservation || input.observation,
      input.jurisdiction
    );
    const conditionAssessment = this.conditionAssessmentService.assess(text);
    const miningContext = this.mineContextService.assess(text);

    const mshaAnalysis = this.mshaInspectionIntelligenceService.analyze(text, miningContext);
    const matched = [...mshaAnalysis.rules, ...RULES.filter((rule) => matchesRule(text, rule))]
      .filter((rule, index, values) => values.findIndex((candidate) => candidate.id === rule.id) === index)
      .filter((rule) => !conditionAssessment.controlledDomains.includes(rule.domain))
      .sort((left, right) => ruleScore(right, text, input.jurisdiction, input.primaryDomain) - ruleScore(left, text, input.jurisdiction, input.primaryDomain));
    const ordered = ['controlled', 'no_hazard_signal'].includes(conditionAssessment.status) ? [] : matched;
    const primaryRule = ordered[0];

    const vagueInputService = new VagueInputIntelligenceService();
    const vagueInputAnalysis = vagueInputService.analyze(input.rawObservation || input.observation, input.primaryDomain);

    let hazardCandidates: InspectionHazardCandidate[] = [];
    if (vagueInputAnalysis.isVague) {
      hazardCandidates = vagueInputAnalysis.likelyHazardFamilies.map((fam, idx) => ({
        domain: fam.domain,
        role: idx === 0 ? 'primary' : 'possible_related',
        confidence: fam.confidence as any,
        rationale: fam.rationale
      }));
    } else {
      const candidateConfidence = conditionAssessment.status === 'insufficient_evidence' ? 'low' : undefined;
      if (primaryRule) {
        hazardCandidates.push({ domain: primaryRule.domain, role: 'primary', confidence: candidateConfidence || primaryRule.confidence || 'high', rationale: primaryRule.initiating });
      } else if (conditionAssessment.status === 'insufficient_evidence') {
        (conditionAssessment.likelyDomains.length > 0 ? conditionAssessment.likelyDomains : [input.primaryDomain]).forEach((domain, index) => {
          hazardCandidates.push({ domain, role: index === 0 ? 'primary' : 'possible_related', confidence: 'low', rationale: 'The observation suggests this hazard family, but condition, exposure, and control facts are insufficient.' });
        });
      } else if (conditionAssessment.status === 'uncontrolled') {
        hazardCandidates.push({ domain: input.primaryDomain, role: 'primary', confidence: 'moderate', rationale: 'The existing deterministic classifier identified this as the leading hazard family; more condition detail is needed.' });
      }
      ordered.slice(1).forEach((rule) => {
        if (!hazardCandidates.some((candidate) => candidate.domain === rule.domain)) {
          hazardCandidates.push({ domain: rule.domain, role: 'secondary', confidence: candidateConfidence || rule.confidence || 'high', rationale: rule.initiating });
        }
      });
      ordered.forEach((rule) => (rule.related || []).forEach((related) => {
        if (!conditionAssessment.controlledDomains.includes(related.domain) && !hazardCandidates.some((candidate) => candidate.domain === related.domain)) {
          hazardCandidates.push({ domain: related.domain, role: related.possible ? 'possible_related' : 'secondary', confidence: related.possible ? 'moderate' : 'high', rationale: related.rationale });
        }
      }));
    }

    const jurisdictionQuestion = input.jurisdiction === 'unclear'
      ? ['What site type and work activity determine whether OSHA General Industry, OSHA Construction, or MSHA applies?']
      : [];
    const genericQuestions = [
      'How close are employees to the condition, how often are they exposed, and is exposure temporary or ongoing?',
      'What controls are currently in place, and has a qualified safety professional verified their condition and applicability?',
    ];
    const conditionQuestions = conditionAssessment.status === 'insufficient_evidence'
      ? ['What specific observed defect, exposure pathway, task, and failed or missing control support this concern?']
      : conditionAssessment.status === 'controlled'
        ? ['Is there evidence that any described control is absent, damaged, bypassed, or ineffective during exposure?']
        : conditionAssessment.status === 'no_hazard_signal'
          ? ['Is there a separate physical condition or employee exposure beyond the administrative or conversational wording?']
          : [];
    const baseEvidenceGapQuestions = unique([
      ...jurisdictionQuestion,
      ...miningContext.evidenceQuestions,
      ...conditionQuestions,
      ...ordered.flatMap((rule) => rule.questions),
      ...genericQuestions,
    ]).slice(0, 12);

    const mergedEvidenceGapQuestions = unique([
      ...standardAppResults.followUpQuestions,
      ...(vagueInputAnalysis.isVague ? vagueInputAnalysis.immediateSafetyQuestions : baseEvidenceGapQuestions)
    ]).slice(0, 12);

    const jurisdictions: Array<Exclude<SafeScopeJurisdiction, 'unclear'>> = input.jurisdiction === 'unclear'
      ? ['osha_general_industry', 'osha_construction', 'msha']
      : [input.jurisdiction];
    const candidateStandards: InspectionCandidateStandard[] = [];
    if (!vagueInputAnalysis.isVague && conditionAssessment.citationEligible) {
      const governedCitations = new Set(EXPERT_APPLICABILITY_RULES.map(r => r.standardCitation.toLowerCase().replace(/\s+/g, '')));
      const hasConfinedSpaceEvidence =
        /\b(confined space|permit space|permit-required|manhole|vault)\b/i.test(text) ||
        (/\b(tank|vessel|silo|bin)\b/i.test(text) &&
          /\b(entry|enter|inside|worker inside|atmosphere|oxygen deficient|toxic atmosphere|engulfment|permit)\b/i.test(text));
      const hasHotWorkEvidence = /\b(hot work|welding|cutting|brazing|torch|fuel gas)\b/i.test(text);

      ordered.forEach((rule) => jurisdictions.forEach((jurisdiction) => {
        (rule.standards[jurisdiction] || []).forEach((standard) => {
          if (jurisdiction === 'msha' && !citationAllowedForMineType(standard.citation, miningContext.mineType)) return;

          const normCit = standard.citation.toLowerCase().replace(/\s+/g, '');
          if (/1910\.146|1926\.1203|(?:56|57)\.18001/.test(normCit) && !hasConfinedSpaceEvidence) return;
          if (/1926\.350/.test(normCit) && !hasHotWorkEvidence) return;
          if (governedCitations.has(normCit)) {
            const isSuggested = standardAppResults.suggestedStandards.some(
              (c) => c.toLowerCase().replace(/\s+/g, '') === normCit
            );
            if (!isSuggested) return;
          }

          if (!candidateStandards.some((candidate) => candidate.citation === standard.citation)) {
            candidateStandards.push({ citation: standard.citation, titleSummary: standard.summary || `Candidate requirements related to ${rule.domain.replace(/_/g, ' ')}.`, jurisdiction, status: 'candidate_standard', rationale: `Candidate only: ${rule.initiating}`, evidenceNeeded: standard.evidence });
          }
        });
      }));
    }
    if (
      !vagueInputAnalysis.isVague
      && input.primaryCitation
      && conditionAssessment.citationEligible
      && !conditionAssessment.controlledDomains.includes(input.primaryDomain)
      && !candidateStandards.some((candidate) => candidate.citation === input.primaryCitation)
      && input.jurisdiction !== 'unclear'
      && (input.jurisdiction === 'msha' ? /^30 CFR\b/.test(input.primaryCitation) : /^29 CFR\b/.test(input.primaryCitation))
      && (input.jurisdiction !== 'msha' || citationAllowedForMineType(input.primaryCitation, miningContext.mineType))
    ) {
      const normCit = input.primaryCitation.toLowerCase().replace(/\s+/g, '');
      const governedCitations = new Set(EXPERT_APPLICABILITY_RULES.map(r => r.standardCitation.toLowerCase().replace(/\s+/g, '')));
      let allowPrimary = true;
      if (governedCitations.has(normCit)) {
        allowPrimary = standardAppResults.suggestedStandards.some(
          (c) => c.toLowerCase().replace(/\s+/g, '') === normCit
        );
      }
      if (allowPrimary) {
        candidateStandards.unshift({ citation: input.primaryCitation, titleSummary: 'Candidate requirement identified by the existing deterministic citation resolver.', jurisdiction: input.jurisdiction, status: 'candidate_standard', rationale: 'Candidate produced by the existing deterministic citation resolver.', evidenceNeeded: ['Confirm jurisdiction, equipment/task scope, employee exposure, and the observed condition before applicability is finalized.'] });
      }
    }

    const empty = ['Insufficient observation detail; obtain condition, task, exposure, and control evidence.'];
    const actionRules = conditionAssessment.status === 'uncontrolled' ? ordered : [];
    let correctiveActions = actionRules.reduce<InspectionIntelligenceResult['correctiveActions']>((result, rule) => ({
      immediate: unique([...result.immediate, ...rule.controls.immediate]),
      interim: unique([...result.interim, ...rule.controls.interim]),
      permanentEngineering: unique([...result.permanentEngineering, ...rule.controls.permanentEngineering]),
      administrativeProgramTraining: unique([...result.administrativeProgramTraining, ...rule.controls.administrativeProgramTraining]),
      verificationFollowUp: unique([...result.verificationFollowUp, ...rule.controls.verificationFollowUp]),
    }), { immediate: [], interim: [], permanentEngineering: [], administrativeProgramTraining: [], verificationFollowUp: [] });

    if (vagueInputAnalysis.isVague) {
      correctiveActions = {
        immediate: vagueInputAnalysis.immediateControls || vagueInputAnalysis.conservativeInterimControls,
        interim: vagueInputAnalysis.interimControls || vagueInputAnalysis.conservativeInterimControls,
        permanentEngineering: vagueInputAnalysis.permanentEngineeringControls || [],
        administrativeProgramTraining: [],
        verificationFollowUp: ['Collect photos or measurements after interim controls are applied and verify safe conditions.']
      };
    }

    const mechanismOfInjury = buildMechanismOfInjury({
      primaryRule,
      orderedRules: ordered,
      conditionAssessment,
      vagueInputAnalysis,
      correctiveActions,
      baseEvidenceGapQuestions,
      standardApplicabilityQuestions: standardAppResults.followUpQuestions,
    });

    return {
      miningContext: {
        ...miningContext,
        citationLimitations: unique([...miningContext.citationLimitations, ...mshaAnalysis.citationLimitations]),
      },
      conditionAssessment,
      vagueInputAnalysis,
      hazardCandidates,
      mechanismOfInjury,
      mechanismChain: {
        initiatingCondition: vagueInputAnalysis.isVague ? vagueInputAnalysis.observedFacts : (primaryRule ? unique(ordered.map((rule) => rule.initiating)) : conditionAssessment.status === 'controlled' ? ['The observation describes the relevant control as present and effective.'] : empty),
        releaseOrFailureMode: vagueInputAnalysis.isVague ? vagueInputAnalysis.inferredPossibilities : (primaryRule ? unique(ordered.map((rule) => rule.failure)) : conditionAssessment.status === 'controlled' ? ['No uncontrolled failure or release mode is established by the observation.'] : empty),
        exposurePathway: vagueInputAnalysis.isVague ? ['Employee proximity, travel path, or tasks conducted near the concern area.'] : (primaryRule ? unique(ordered.map((rule) => rule.exposure)) : conditionAssessment.status === 'controlled' ? ['No current employee exposure pathway is established while the described control remains effective.'] : empty),
        consequences: vagueInputAnalysis.isVague ? ['Possible injury or hazard involvement depending on unconfirmed details.'] : (primaryRule ? unique(ordered.map((rule) => rule.consequences)) : conditionAssessment.status === 'controlled' ? ['No injury or environmental consequence is inferred from a controlled condition alone.'] : empty),
        evidenceGaps: unique([
          ...standardAppResults.followUpQuestions,
          ...(vagueInputAnalysis.isVague ? vagueInputAnalysis.missingCriticalFacts : baseEvidenceGapQuestions)
        ]).slice(0, 12),
        controls: vagueInputAnalysis.isVague ? vagueInputAnalysis.conservativeInterimControls : unique([...conditionAssessment.controlEvidence, ...correctiveActions.immediate, ...correctiveActions.permanentEngineering]),
      },
      candidateStandards,
      evidenceGapQuestions: mergedEvidenceGapQuestions,
      correctiveActions,
      guardrails: { advisoryOnly: true, candidateStandardsOnly: true, doesNotDeclareViolation: true, requiresQualifiedReview: true },
      standardApplicability: standardAppResults,
      evidenceGate: {
        evaluationResults: standardAppResults.evaluationResults,
      },
    };
  }
}
