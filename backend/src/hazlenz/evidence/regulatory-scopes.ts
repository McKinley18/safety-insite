/**
 * Maps the inspection-level regulatory context onto BOTH jurisdiction vocabularies the classify
 * pipeline consumes (structuredObservation.jurisdiction for the evidence-fact / applicability
 * engine, and `scopes` for the classifier's standards search), so the two engines can never
 * disagree about which regime governs the inspection.
 *
 * EXTRACTED IN §262 SO THERE IS ONE DEFINITION, NOT TWO. It was a module-local function in
 * `hazlenz.controller.ts`, reachable only by the classify route. §262 adds a second server-side
 * caller -- the authoritative Expert execution path, which must resolve the SAME scopes from the
 * SAME persisted inspection fact -- and a copied mapping is how two callers end up disagreeing about
 * which regime governs one inspection. The body is unchanged; only its address is.
 */
export function scopesForRegulatoryContext(context: string): string[] | undefined {
  switch (context) {
    case 'msha': return ['msha'];
    case 'osha-general-industry': return ['osha_general_industry'];
    case 'osha-construction': return ['osha_construction'];
    default: return undefined;
  }
}
