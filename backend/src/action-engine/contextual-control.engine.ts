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
  const classification = input.classification;

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

  if (classification === 'Electrical') {
    immediateControls.push('Keep personnel clear of the affected electrical exposure.');
    permanentControls.push('Repair or replace damaged electrical components using a qualified electrician.');
    verificationSteps.push('Verify the circuit, conductor, or equipment is safe before returning to service.');
    competentPersonReview = true;

    if (includesAny(text, ['live', 'energized', 'hanging', 'exposed'])) {
      immediateControls.push('De-energize and lock out the affected circuit where feasible.');
      verificationSteps.push('Confirm zero-energy state or safe guarded condition before work continues.');
    }

    if (includesAny(text, ['walkway', 'doorway', 'traffic', 'travelway'])) {
      immediateControls.push('Barricade or reroute pedestrian traffic away from the electrical exposure.');
      permanentControls.push('Route wiring away from travel paths or protect it from mechanical damage.');
    }
  }

  if (classification === 'Fall') {
    immediateControls.push('Restrict access to the fall exposure area.');
    permanentControls.push('Install compliant guardrails, covers, barricades, or fall protection systems.');
    verificationSteps.push('Verify edge protection or fall protection is installed before exposure resumes.');
    competentPersonReview = true;

    if (includesAny(text, ['open edge', 'guardrail', 'mezzanine', 'second floor'])) {
      immediateControls.push('Place temporary barricades at the unprotected edge.');
      restartCriteria.push('Access may resume only after edge protection is installed and inspected.');
    }
  }

  if (classification === 'Powered Mobile Equipment') {
    immediateControls.push('Separate mobile equipment from pedestrians until traffic controls are established.');
    permanentControls.push('Implement traffic control plan, exclusion zones, signage, and operator communication controls.');
    verificationSteps.push('Verify alarms, visibility controls, and travel routes before normal operation resumes.');

    if (includesAny(text, ['pedestrian', 'traffic', 'forklift', 'vehicle'])) {
      immediateControls.push('Establish a pedestrian exclusion zone around active equipment movement.');
      permanentControls.push('Define marked travel lanes and pedestrian walkways.');
    }
  }

  if (classification === 'Machine') {
    immediateControls.push('Stop use of affected equipment until guarding is restored.');
    permanentControls.push('Repair, replace, or install machine guarding for exposed moving parts.');
    verificationSteps.push('Verify guarding prevents contact with moving parts before restart.');
    restartCriteria.push('Equipment may restart only after guard inspection and functional verification.');
    competentPersonReview = true;
  }

  if (classification === 'Housekeeping') {
    immediateControls.push('Clean or isolate the affected walking-working surface.');
    permanentControls.push('Correct the source of the spill, obstruction, or poor housekeeping condition.');
    verificationSteps.push('Verify the walking-working surface is clean, dry, and passable.');

    if (includesAny(text, ['oil', 'spill', 'slip'])) {
      immediateControls.push('Apply absorbent or spill control material immediately.');
      permanentControls.push('Investigate and correct the leak or release source.');
    }
  }

  if (classification === 'PPE') {
    immediateControls.push('Stop affected task until required PPE is provided and used.');
    permanentControls.push('Verify PPE selection matches the actual exposure and task.');
    verificationSteps.push('Confirm affected personnel are trained and equipped before resuming work.');
  }

  if (classification === 'Hazard Communication') {
    immediateControls.push('Remove unknown or unlabeled chemical containers from active use.');
    permanentControls.push('Apply compliant labels and verify SDS availability.');
    verificationSteps.push('Confirm container identity, hazards, and storage compatibility.');
  }

  return {
    immediateControls: [...new Set(immediateControls)].map(c => tailorAction(c, targetEntity)).slice(0, 5),
    permanentControls: [...new Set(permanentControls)].map(c => tailorAction(c, targetEntity)).slice(0, 5),
    verificationSteps: [...new Set(verificationSteps)].map(c => tailorAction(c, targetEntity)).slice(0, 5),
    restartCriteria: [...new Set(restartCriteria)].map(c => tailorAction(c, targetEntity)).slice(0, 4),
    competentPersonReview,
  };
}
