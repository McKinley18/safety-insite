import { resolveCanonicalHazardFamily } from '../safescope-v2/taxonomy/canonical-taxonomy-aliases';

export type ContextualControls = {
  immediateControls: string[];
  permanentControls: string[];
  verificationSteps: string[];
  restartCriteria: string[];
  competentPersonReview: boolean;
};

const includesAny = (text: string, terms: string[]) =>
  terms.some((term) => text.includes(term));

export function extractTargetEntity(observation: string, equipment?: string): string {
  if (equipment && equipment.trim().length > 0) {
    return equipment.trim();
  }
  if (!observation) return '';

  const obs = observation.toLowerCase().trim();

  // Try to find known safety equipment/components
  const knownTargets = [
    'conveyor tail pulley',
    'conveyor belt',
    'tail pulley',
    'conveyor',
    'bench grinder',
    'grinder',
    'drive shaft',
    'fan blades',
    'fan',
    'hydraulic press',
    'press',
    'junction box',
    'electrical panel',
    'circuit breaker',
    'breaker panel',
    'breaker',
    'flexible cord',
    'extension cord',
    'power cord',
    'power tool',
    'ladder',
    'scaffold',
    'trench',
    'excavation',
    'shipping pallet',
    'pallet',
    'open edge',
    'mezzanine',
    'travelway',
    'aisleway',
    'aisle',
    'walking surface',
    'silica dust',
    'respirable dust',
    'dust',
    'chemical container',
    'container',
    'oxygen cylinder',
    'compressed gas cylinder',
    'gas cylinder',
    'cylinder',
    'confined space',
    'oil accumulation',
    'oil spill',
    'spill'
  ];

  for (const target of knownTargets) {
    if (obs.includes(target)) {
      const idx = obs.indexOf(target);
      return observation.substring(idx, idx + target.length);
    }
  }

  // If no known targets match, check prefix words
  const prefixWords = ['unguarded', 'damaged', 'blocked', 'missing', 'exposed', 'frayed', 'broken', 'unsecured', 'possible'];
  const words = observation.split(/\s+/);
  if (words.length > 1) {
    const firstWordLower = words[0].toLowerCase().replace(/[^a-z]/g, '');
    if (prefixWords.includes(firstWordLower)) {
      const nextWords = words.slice(1, 4).join(' ');
      return nextWords.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    }
  }

  return words.slice(0, 3).join(' ').replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
}

export function tailorAction(action: string, targetEntity: string): string {
  if (!targetEntity) return action;

  const actLower = action.toLowerCase();
  const target = targetEntity.trim();
  const targetLower = target.toLowerCase();

  if (actLower.includes(targetLower)) {
    return action;
  }

  if (actLower === 'stop access' || actLower === 'restrict access' || actLower.includes('restrict access to')) {
    return `Restrict access to the affected ${target} area immediately to eliminate exposure.`;
  }
  if (actLower === 'stop entry' || actLower === 'stop work' || actLower.includes('stop affected work')) {
    return `Stop work and prevent entry in the vicinity of the ${target} until safety controls are validated.`;
  }
  if (actLower.includes('install guard') || actLower.includes('repair guard') || actLower.includes('guard exposed') || actLower.includes('nip point') || actLower.includes('point of operation')) {
    return `Install or repair fixed physical guarding on the ${target} to fully enclose all hazards and prevent contact.`;
  }
  if (actLower.includes('de-energize') || actLower.includes('isolate energy') || actLower.includes('isolate hazardous energy')) {
    return `De-energize, isolate, and verify zero-energy state for all power feeds connected to the ${target}.`;
  }
  if (actLower.includes('lock out') || actLower.includes('lockout tagout') || actLower.includes('lockout/tagout') || actLower.includes('apply lockout')) {
    return `Apply standard Lockout/Tagout (LOTO) and place energy isolation locks before performing tasks on the ${target}.`;
  }
  if (actLower.includes('install protective system') || actLower.includes('slope') || actLower.includes('shore') || actLower.includes('shield')) {
    return `Implement protective shoring, sloping, or shield box systems for the ${target} before allowing entry.`;
  }
  if (actLower.includes('secure ladder') || actLower.includes('remove ladder') || actLower.includes('extend ladder')) {
    return `Securely anchor the ${target} at the top, stabilize the base, or remove it from service until fully corrected.`;
  }
  if (actLower.includes('clean spill') || actLower.includes('remove loose material') || actLower.includes('remove obstruction') || actLower.includes('restore clear travelway')) {
    return `Clean, clear, and restore the ${target} area to eliminate slip, trip, and fall hazards.`;
  }
  if (actLower.includes('label chemical') || actLower.includes('label container') || actLower.includes('identify chemical') || actLower.includes('hazard communication label')) {
    return `Label the ${target} container with GHS-compliant warnings and ensure Safety Data Sheet (SDS) accessibility.`;
  }
  if (actLower.includes('test atmosphere') || actLower.includes('evaluate confined space')) {
    return `Perform pre-entry multi-gas atmospheric testing and establish continuous ventilation in the ${target}.`;
  }
  if (actLower.includes('wet methods') || actLower.includes('dust collection') || actLower.includes('silica')) {
    return `Utilize wet methods, water suppression, or dust collection systems to control respirable hazards from the ${target}.`;
  }
  if (actLower.includes('verify guard before') || actLower.includes('document post-correction')) {
    return `Perform functional verification of guards and document safety sign-off before restarting the ${target}.`;
  }

  const genericVerbs = ['inspect', 'repair', 'verify', 'evaluate', 'correct', 'check', 'maintain', 'improve', 'separate'];
  const firstWord = actLower.split(' ')[0];
  if (genericVerbs.includes(firstWord)) {
    return `${action.trim().replace(/[.]+$/, '')} for the ${target}.`;
  }

  return action;
}

export function buildContextualControls(input: {
  classification: string;
  text: string;
  requiresShutdown?: boolean;
  imminentDanger?: boolean;
}): ContextualControls {
  const text = (input.text || '').toLowerCase();
  const hazardFamily = resolveCanonicalHazardFamily(input.classification, input.text);

  const immediateControls: string[] = [];
  const permanentControls: string[] = [];
  const verificationSteps: string[] = [];
  const restartCriteria: string[] = [];
  let competentPersonReview = Boolean(input.imminentDanger || input.requiresShutdown);

  const targetEntity = extractTargetEntity(input.text);

  if (input.requiresShutdown) {
    immediateControls.push('Stop affected work and isolate the exposure area until controls are verified.');
    restartCriteria.push('Do not resume work until the hazard is corrected and supervisor verification is documented.');
  }

  if (hazardFamily === 'electrical') {
    immediateControls.push('Keep personnel clear of the affected electrical exposure.');
    permanentControls.push('Repair or replace damaged electrical components using a qualified electrician.');
    verificationSteps.push('Verify the circuit, conductor, or equipment is safe before returning to service.');
    competentPersonReview = true;

    if (includesAny(text, ['live', 'energized', 'hanging', 'exposed'])) {
      immediateControls.push('De-energize and lock out the affected circuit where feasible.');
      verificationSteps.push('Confirm zero-energy state or safe guarded condition before work continues.');
    }

    if (includesAny(text, ['panel', 'breaker slot', 'breaker opening', 'missing cover', 'open slot'])) {
      immediateControls.push('Restrict access to the open electrical panel until the enclosure is restored.');
      permanentControls.push('Install a listed breaker filler, dead-front component, or enclosure cover for the open slot.');
      verificationSteps.push('Have a qualified electrical person verify the panel enclosure and energized-parts protection.');
    }

    if (includesAny(text, ['walkway', 'doorway', 'traffic', 'travelway'])) {
      immediateControls.push('Barricade or reroute pedestrian traffic away from the electrical exposure.');
      permanentControls.push('Route wiring away from travel paths or protect it from mechanical damage.');
    }
  }

  if (hazardFamily === 'fall_protection') {
    immediateControls.push('Restrict access to the fall exposure area.');
    permanentControls.push('Install compliant guardrails, covers, barricades, or fall protection systems.');
    verificationSteps.push('Verify edge protection or fall protection is installed before exposure resumes.');
    competentPersonReview = true;

    if (includesAny(text, ['open edge', 'guardrail', 'mezzanine', 'second floor'])) {
      immediateControls.push('Place temporary barricades at the unprotected edge.');
      restartCriteria.push('Access may resume only after edge protection is installed and inspected.');
    }
  }

  if (hazardFamily === 'mobile_equipment') {
    immediateControls.push('Separate mobile equipment from pedestrians until traffic controls are established.');
    permanentControls.push('Implement traffic control plan, exclusion zones, signage, and operator communication controls.');
    verificationSteps.push('Verify alarms, visibility controls, and travel routes before normal operation resumes.');

    if (includesAny(text, ['pedestrian', 'traffic', 'forklift', 'vehicle'])) {
      immediateControls.push('Establish a pedestrian exclusion zone around active equipment movement.');
      permanentControls.push('Define marked travel lanes and pedestrian walkways.');
    }
  }

  if (hazardFamily === 'machine_guarding') {
    immediateControls.push('Stop use of affected equipment until guarding is restored.');
    permanentControls.push('Repair, replace, or install machine guarding for exposed moving parts.');
    verificationSteps.push('Verify guarding prevents contact with moving parts before restart.');
    restartCriteria.push('Equipment may restart only after guard inspection and functional verification.');
    permanentControls.push('Apply lockout/tagout before servicing, cleaning, adjustment, or guard installation.');
    competentPersonReview = true;
  }

  if (hazardFamily === 'walking_working_surfaces') {
    immediateControls.push('Clean or isolate the affected walking-working surface.');
    permanentControls.push('Correct the source of the spill, obstruction, or poor housekeeping condition.');
    verificationSteps.push('Verify the walking-working surface is clean, dry, and passable.');

    if (includesAny(text, ['oil', 'spill', 'slip'])) {
      immediateControls.push('Barricade or mark the affected walking surface until cleanup is complete.');
      immediateControls.push('Apply absorbent or spill control material immediately.');
      permanentControls.push('Investigate and correct the leak or release source.');
      verificationSteps.push('Confirm the spill residue is removed and the surface has safe traction before reopening.');
    }
  }

  if (hazardFamily === 'personal_protective_equipment') {
    immediateControls.push('Stop affected task until required PPE is provided and used.');
    permanentControls.push('Verify PPE selection matches the actual exposure and task.');
    verificationSteps.push('Confirm affected personnel are trained and equipped before resuming work.');
    if (includesAny(text, ['grinding', 'flying particles', 'face shield', 'eye protection'])) {
      permanentControls.push('Provide task-appropriate safety glasses or goggles and face protection for flying-particle exposure.');
    }
  }

  if (hazardFamily === 'hazard_communication') {
    immediateControls.push('Remove unknown or unlabeled chemical containers from active use.');
    immediateControls.push('Identify the container contents before assigning hazard information or returning it to use.');
    permanentControls.push('Apply a compliant workplace label after contents and hazards are verified.');
    permanentControls.push('Verify the applicable SDS is available to affected employees.');
    verificationSteps.push('Confirm container identity, hazards, and storage compatibility.');
  }

  if (hazardFamily === 'compressed_gas') {
    immediateControls.push('Secure the cylinder upright with an approved chain, strap, rack, or cart.');
    immediateControls.push('Move the unsecured cylinder out of the pedestrian travel path until properly stored.');
    permanentControls.push('Provide a designated cylinder storage location protected from impact and traffic exposure.');
    permanentControls.push('Protect the cylinder valve and install the valve cap when the cylinder is not connected for use.');
    verificationSteps.push('Verify cylinder identity, restraint, upright position, valve protection, and storage compatibility.');
    if (includesAny(text, ['oxygen']) && includesAny(text, ['acetylene', 'fuel gas', 'propane'])) {
      permanentControls.push('Verify required separation or an approved fire barrier between oxygen and fuel-gas cylinders.');
    }
    competentPersonReview = true;
  }

  if (hazardFamily === 'lockout_tagout') {
    immediateControls.push('Stop servicing or jam-clearing work until hazardous energy is isolated.');
    permanentControls.push('Identify and isolate every electrical, mechanical, hydraulic, pneumatic, gravity, or stored-energy source.');
    permanentControls.push('Apply lockout/tagout and release, block, or restrain stored energy.');
    verificationSteps.push('Perform and document a try/test verification of zero energy before work resumes.');
    competentPersonReview = true;
  }

  if (hazardFamily === 'fire_protection' || hazardFamily === 'welding_cutting_hot_work') {
    immediateControls.push('Pause hot work or control ignition sources until combustible and flammable exposures are removed or protected.');
    permanentControls.push('Relocate combustibles and flammable materials or provide approved shielding and storage controls.');
    permanentControls.push('Establish the applicable hot-work permit and trained fire-watch controls.');
    verificationSteps.push('Verify the work area, fire watch, extinguishing equipment, and post-work fire check before closure.');
    competentPersonReview = true;
  }

  if (hazardFamily === 'emergency_egress') {
    immediateControls.push('Remove stacked material and restore the full exit route immediately.');
    permanentControls.push('Prohibit storage in the exit route and maintain required route width, lighting, and door access.');
    verificationSteps.push('Walk the entire evacuation path and verify the exit is unobstructed and operable.');
  }

  if (hazardFamily === 'confined_space') {
    immediateControls.push('Stop entry and prevent unauthorized access until the space and entry hazards are evaluated.');
    permanentControls.push('Classify the space and implement permit, isolation, ventilation, attendant, and rescue controls as applicable.');
    verificationSteps.push('Test the atmosphere with calibrated equipment before entry and monitor as conditions require.');
    competentPersonReview = true;
  }

  if (hazardFamily === 'excavation_trenching') {
    immediateControls.push('Remove workers from the unprotected trench until a competent person evaluates it.');
    permanentControls.push('Install an appropriate sloping, shoring, or shielding protective system.');
    verificationSteps.push('Verify soil, depth, spoil setback, water, access/egress, and daily competent-person inspection.');
    competentPersonReview = true;
  }

  if (hazardFamily === 'respirable_dust_silica') {
    immediateControls.push('Limit access to the visible dust exposure while source controls are established.');
    permanentControls.push('Use wet cutting or effective local exhaust/dust collection for the task.');
    permanentControls.push('Evaluate exposure and provide respiratory protection only as required by the control plan and qualified review.');
    verificationSteps.push('Verify dust controls operate during the task and document exposure/respirator program requirements.');
  }

  if (hazardFamily === 'noise_exposure') {
    immediateControls.push('Limit time near the noise source and provide suitable hearing protection pending exposure evaluation.');
    permanentControls.push('Evaluate sound level and dose, then apply feasible source, enclosure, isolation, or maintenance controls.');
    verificationSteps.push('Verify hearing-protection selection and hearing-conservation requirements against measured exposure.');
  }

  if (hazardFamily === 'heat_stress') {
    immediateControls.push('Provide drinking water, shade or cooling, and recovery rest based on heat conditions and workload.');
    permanentControls.push('Implement heat acclimatization, work/rest scheduling, buddy monitoring, and emergency response procedures.');
    verificationSteps.push('Document heat conditions, worker symptoms, hydration/rest access, and supervisor monitoring.');
  }

  if (hazardFamily === 'cold_stress') {
    immediateControls.push('Provide a warm, dry recovery area and limit exposure based on cold, wind, wetness, and workload.');
    permanentControls.push('Implement cold-weather work/rest, protective clothing, buddy monitoring, and emergency response controls.');
    verificationSteps.push('Document conditions, exposure duration, warming access, clothing, and cold-injury symptoms.');
  }

  if (hazardFamily === 'ergonomics') {
    immediateControls.push('Reduce the load, lift frequency, or awkward floor-level reach until the task is reassessed.');
    permanentControls.push('Provide lift aids, raise the pickup height, redesign the task, or use a planned team lift.');
    verificationSteps.push('Verify load weight, frequency, posture, and effectiveness of the revised handling method.');
  }

  if (hazardFamily === 'cranes_rigging_hoisting') {
    immediateControls.push('Remove the damaged sling from service and stop the lift.');
    permanentControls.push('Use inspected, identified, and adequately rated rigging selected by a qualified rigger.');
    verificationSteps.push('Document pre-use rigging inspection, load weight, capacity, configuration, and exclusion zone.');
    competentPersonReview = true;
  }

  if (hazardFamily === 'dropped_objects') {
    immediateControls.push('Establish an exclusion zone below the elevated platform until loose items are secured.');
    permanentControls.push('Secure tools and materials with containers, tethering, toe boards, or equivalent falling-object controls.');
    verificationSteps.push('Inspect elevated storage and verify no unsecured object can enter the area below.');
  }

  if (hazardFamily === 'ground_control') {
    immediateControls.push('Barricade the highwall fall zone and keep personnel and equipment clear.');
    permanentControls.push('Have a competent person examine the condition and scale, stabilize, or establish a safe setback as required.');
    verificationSteps.push('Document the ground examination and correction before reopening the work area.');
    competentPersonReview = true;
  }

  if (hazardFamily === 'water_drowning') {
    immediateControls.push('Provide suitable personal flotation and prevent unprotected access to the water edge.');
    permanentControls.push('Install barriers or fall prevention and maintain immediately available ring buoys, retrieval, and rescue capability.');
    verificationSteps.push('Verify flotation, rescue equipment, access controls, and rescue arrangements before work continues.');
  }

  if (hazardFamily === 'environmental_release') {
    immediateControls.push('Close the container and protect or block the floor-drain release pathway.');
    permanentControls.push('Provide compatible secondary containment and correct the storage or container condition.');
    verificationSteps.push('Confirm released material is recovered, the drain is protected, and disposal/reporting needs receive qualified review.');
  }

  return {
    immediateControls: [...new Set(immediateControls)].map(c => tailorAction(c, targetEntity)).slice(0, 5),
    permanentControls: [...new Set(permanentControls)].map(c => tailorAction(c, targetEntity)).slice(0, 5),
    verificationSteps: [...new Set(verificationSteps)].map(c => tailorAction(c, targetEntity)).slice(0, 5),
    restartCriteria: [...new Set(restartCriteria)].map(c => tailorAction(c, targetEntity)).slice(0, 4),
    competentPersonReview,
  };
}
