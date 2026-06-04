export type ContextualControls = {
  immediateControls: string[];
  permanentControls: string[];
  verificationSteps: string[];
  restartCriteria: string[];
  competentPersonReview: boolean;
};

const includesAny = (text: string, terms: string[]) =>
  terms.some((term) => text.includes(term));

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
    immediateControls: [...new Set(immediateControls)].slice(0, 5),
    permanentControls: [...new Set(permanentControls)].slice(0, 5),
    verificationSteps: [...new Set(verificationSteps)].slice(0, 5),
    restartCriteria: [...new Set(restartCriteria)].slice(0, 4),
    competentPersonReview,
  };
}
