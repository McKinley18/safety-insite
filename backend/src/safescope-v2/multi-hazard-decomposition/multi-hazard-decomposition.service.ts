import { Injectable } from '@nestjs/common';
import { HazardDecomposition, MultiHazardDecompositionResult } from './multi-hazard-decomposition.types';
import { HazardTaxonomyCoverageService } from '../hazard-taxonomy-coverage/hazard-taxonomy-coverage.service';
import { hasAnyNonNegatedTerm } from '../reasoning-orchestrator/negation-context.util';

// Suspended-load evidence, declared ONCE. The finding-local detector and the
// output filter below both test the same two questions -- is a load overhead,
// and is a person under it -- and each previously carried its own copy of the
// pattern. The copies drifted: widening only the detector's exposure vocabulary
// created the finding and the filter then silently deleted it again, which is
// exactly the failure mode a duplicated predicate produces. One definition, two
// call sites.
const SUSPENDED_LOAD_EVIDENCE =
  /\b(?:suspended|hanging|overhead|lifted|load|hook|pallet|beam)\b/i;
// Establishes only that a PERSON is present. Field notes name that person by
// trade at least as often as by the word "worker" ("a rigger was standing...",
// "the millwright guided the beam"), and omitting the trades lost an
// unmistakable drop-zone exposure entirely.
const SUSPENDED_LOAD_EXPOSURE =
  /\b(?:beneath|under|below|drop\s+zone|fall\s+zone|occupied|worker|employee|spotter|person|pedestrian|work\s+area|instructed\s+to\s+remain|swings?\s+over|rigger|signal(?:ler|man|person)|banksman|operator|millwright|fitter|technician|contractor|mason|welder|electrician|labou?rer|crew)\b/i;

@Injectable()
export class MultiHazardDecompositionService {
  private taxonomyService = new HazardTaxonomyCoverageService();

  decompose(observationText: string, context: any = {}): MultiHazardDecompositionResult {
    const version = 'v1';
    const originalObservation = observationText;
    
    // 1. Split into fragments
    const splitRegex = /[.;,!]|\band\b|\balso\b|\bwhile\b/i;
    // The classify pipeline fuses the structured-observation metadata block ("Structured
    // observation evidence:\nWork area: third-floor deck. Task being performed: ...") into the
    // analysed text. Purely contextual rows (where / which equipment / which task / jurisdiction
    // context / bookkeeping) are not hazard observations and must not seed a finding of their own --
    // "Work area: third-floor deck" is not a walking-surface hazard. Rows that DO carry hazard
    // evidence (observed condition, controls missing, worker interaction, potential consequence,
    // additional context) are kept.
    // (Line breaks in the fused text may arrive as "\n" or as " | " separators, so both are
    // normalised away before the label check.)
    const contextualMetadataLine = /^(?:structured observation evidence\s*:?\s*)?(?:work area|work environment(?: or jurisdiction context)?|equipment or area involved|task being performed|evidence source|user-confirmed facts|facts still unknown|unresolved contradictions|material or substance involved)\s*:/i;
    const stripMetadataHeader = (f: string) => f.replace(/^[\s|]+/, '').replace(/^structured observation evidence\s*:?\s*\|?\s*/i, '').replace(/^[\s|]+/, '').trim();
    const fragments = observationText.split(splitRegex)
      .map(f => stripMetadataHeader(f))
      .filter(f => f.length > 5)
      .filter(f => !contextualMetadataLine.test(f));

    const hazards: HazardDecomposition[] = [];
    const routingNotes: string[] = [];

    // Shared hazardous-energy-control vocabulary. Field observers rarely write the literal
    // words "lockout"/"tagout": "no lock or tag applied", "without a lock", "not locked or
    // tagged", "no LOTO", "power connected", "still running" are the ordinary forms. Every
    // LOTO detector below (per-fragment and cross-clause) reads from these two patterns so
    // that recall does not depend on which synonym the observer happened to use.
    //   LOTO_CONTROL_ABSENT: the CONTROL is stated absent/not applied (an active deficiency,
    //   never to be confused with a negated deficiency such as "no lockout issue was found").
    //   LOTO_ENERGY_SOURCE: a hazardous-energy source is present/capable ("power connected",
    //   "running", "energized", named energy types...).
    const LOTO_CONTROL_ABSENT =
      /\b(?:no|not|never|without)\b[^.]{0,30}\b(?:lockout|lock\s*out|tagout|tag\s*out|LOTO|(?:personal\s+)?locks?(?:\s*(?:,|or|and|\/|nor)\s*(?:tags?|tagout))?|tags?)\b[^.]{0,25}\b(?:has\s+been\s+|have\s+been\s+|was\s+|were\s+|is\s+|are\s+|been\s+)?(?:applied|attached|installed|placed|in\s+place|hung|fitted|used|present)\b/i;
    const LOTO_CONTROL_ABSENT_ALT =
      /\b(?:lockout|lock\s*out|tagout|tag\s*out|LOTO|locks?|tags?)\b[^.]{0,20}\b(?:has\s+not\s+been|have\s+not\s+been|was\s+not|were\s+not|is\s+not|are\s+not|has\s+not|not)\b[^.]{0,20}\b(?:applied|attached|installed|placed|in\s+place|hung|fitted|used|present)\b/i;
    // "unlocked"/"un-locked" is the adjectival form of the same control absence
    // ("the agitator drive remained energized and unlocked"). It says the lock is
    // not applied just as plainly as "no lock was applied" does, and every caller
    // of lotoControlAbsent() additionally requires a servicing/intervention verb
    // AND a hazardous-energy source in the same scope, so an ordinary unlocked
    // door or cabinet cannot reach a LOTO finding through this alternative.
    const LOTO_CONTROL_ABSENT_BARE =
      /\b(?:without\s+(?:a\s+|any\s+)?(?:personal\s+)?(?:lock|tag|LOTO)(?:\s*(?:or|and|\/)\s*(?:tag|lock))?\b|not\s+(?:locked|tagged)(?:\s+(?:or|and)\s+(?:locked|tagged))?(?:\s+out)?\b|un-?locked\b|no\s+(?:personal\s+)?(?:lock|tag|LOTO)(?:\s*(?:or|and|\/)\s*(?:tag|lock))?\b(?![^.]{0,20}\b(?:deficienc|issue|problem|concern|violation|finding)))/i;
    const lotoControlAbsent = (value: string) =>
      LOTO_CONTROL_ABSENT.test(value) || LOTO_CONTROL_ABSENT_ALT.test(value) || LOTO_CONTROL_ABSENT_BARE.test(value);
    const LOTO_ENERGY_SOURCE =
      /\b(?:hydraulic|pneumatic|mechanical|gravity|spring|thermal|pressure|stored\s+energy|hazardous\s+energy|energ(?:ized|ised)|electrical|multiple\s+energy|disconnect|isolation|elevated|load|re-?energ|power(?:ed)?(?:\s+(?:connected|on|remains?|remained|still|is\s+(?:still\s+)?on|was\s+(?:still\s+)?on|supply|source|feed|not\s+(?:been\s+)?(?:isolated|disconnected|removed|locked)))|plugged\s+in|(?:is|was|were|are|remains?|remained|kept|left|still)\s+(?:running|operating|in\s+operation|cycling)|running|operating)\b/i;

    // 2. Process each fragment
    fragments.forEach((fragment, index) => {
        let route = this.taxonomyService.route(fragment);
        // "no lockout/tagout has been applied" (or "was applied"/"is applied")
        // describes the CONTROL as absent -- an active deficiency -- not a
        // negated hazard. It must be distinguished from genuinely safe negation
        // like "no lockout deficiency exists" or "no failure to isolate," which
        // negate the DEFICIENCY itself. Without this distinction, the general
        // "no...lockout" negation check below (added to suppress false
        // positives on genuinely safe LOTO language) would also suppress this
        // genuinely active case.
        const lockoutControlAbsent = lotoControlAbsent(fragment);
        const negatedLockoutDeficiency = (/\b(?:no|not|never)\b[^.]{0,50}\b(?:lockout|lock out|tagout|tag out|failure to isolate|uncontrolled stored energy|unexpected energization)\b/i.test(fragment) && !lockoutControlAbsent) ||
          /\b(?:historical|prior|previous|earlier)\b[^.]{0,80}\b(?:lockout|tagout|isolation)\b[^.]{0,80}\b(?:corrected|resolved|verified|confirmed)\b/i.test(fragment) ||
          /\b(?:lockout|tagout|isolation|energy control)\b[^.]{0,50}\b(?:was|were|is|has been)\b[^.]{0,30}\b(?:correctly applied|verified|confirmed|complete|effective)\b/i.test(fragment);
        const positiveLotoMechanism = /\b(?:servic\w*|maint\w*|repair\w*|clear\w*\s+(?:a\s+)?jam|interven\w*)\b/i.test(fragment) &&
          LOTO_ENERGY_SOURCE.test(fragment) &&
          (/\b(?:without\s+(?:lockout|(?:hazardous\s+)?(?:energy\s+)?isolation|isolating|energy\s+control)|not\s+(?:isolated|controlled|locked)|uncontrolled|remains?\s+uncontrolled|lock\s+(?:was\s+)?removed|re-?energ(?:ization|isation)|unexpected(?:ly)?\s+re-?energ|before\s+isolation|isolation\s+(?:was\s+)?incomplete|zero[- ]energy\s+(?:was\s+)?(?:not\s+verified|never\s+(?:completed|performed|verified))|pressure\s+(?:remains?|is\s+present|retained)|retains?\s+pressure|spring\s+remains?|can\s+drop|only\s+[^.]{0,50}\s+isolated|not\s+all\s+(?:energy|sources)|begins?\s+(?:maintenance|servicing)\s+before)\b/i.test(fragment) || lockoutControlAbsent);
        if (negatedLockoutDeficiency) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: false };
        }
        if (positiveLotoMechanism && !negatedLockoutDeficiency) {
          route = { domainId: 'lockout_tagout', confidence: 0.75, matchedSignals: ['servicing/intervention', 'hazardous energy source', 'energy control failure'], routeDisposition: 'categorize_only', requiresHumanReview: true };
        }
        const positiveEnergyControl = /\b(?:lockout|lock out|tagout|tag out|locked out|isolat(?:e|ed|ion)|zero[- ]energy|energy[- ]control|stored energy|unexpected start(?:up)?|servicing\s+[^.]{0,40}(?:without|no)\s+lockout|disconnect\s+secured)\b/i.test(fragment);
        const positiveElectrical = /\b(?:electrical|panel|wire|wiring|conductor|cord|cable|energized|live parts?|breaker|disconnect|arc(?:ing)?|shock)\b/i.test(fragment);
        if (route.domainId === 'lockout_tagout' && !positiveEnergyControl && !positiveLotoMechanism) {
            route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (route.domainId === 'electrical' && !positiveElectrical) {
            route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        const verifiedStoredEnergy = /\b(?:isolated|bled\s+off|bled|depressurized|de-pressurized|zero[- ]energy\s+(?:verified|confirmed)|lockout\s+(?:applied|verified)|locked\s+out|released|restrained|relieved\s+and\s+verified)\b/i.test(fragment) &&
          !/\b(?:before|without|not|never|has\s+not\s+been)\b[^.]{0,40}\b(?:relieved|bled|released|discharged|isolated|verified)\b/i.test(fragment);
        if (route.domainId === 'lockout_tagout' && verifiedStoredEnergy && !positiveLotoMechanism) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: false };
        }
        if (route.domainId === 'noise' && !/\b(?:noise|loud|sound\s+level|dba|decibel|hearing\s+(?:hazard|protection)|unable\s+to\s+communicate)\b/i.test(fragment)) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (route.domainId === 'suspended_loads' && !/\b(?:suspended|hanging|overhead|crane|hoist|rigged|lifted\s+load|load\s+(?:is|was)\s+not\s+secured)\b/i.test(fragment)) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (route.domainId === 'ppe' && !/\b(?:without|lack(?:ing)?|missing|no|improper(?:ly)?)\b[^.]{0,40}\b(?:ppe|personal\s+protective|glove|goggle|face\s+shield|respirator|hearing\s+protection|eye\s+protection)\b/i.test(fragment)) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        
        // Special handling for airborne exposure evidence that should promote to silica respirable dust family
        const airborneExposurePattern = /\b(?:worker|employee|person|individual)\b[^.]{0,80}\b(?:breathing\s+zone|respiratory\s+exposure|inhalation\s+contact|breathing\s+air|airborne\s+particle|dust\s+cloud|fume|vapor|gas|chemical\s+exposure)\b/i.test(fragment);
        const silicaEvidence = /\b(?:silica|respirable\s+dust|silica\s+dust|dust\s+exposure|inhalation|breathing\s+dust)\b/i.test(fragment);
        if (airborneExposurePattern && !silicaEvidence && route.domainId === 'unknown') {
          // Check if this is clearly an airborne exposure case without proper silica mention
          const clearAirbornePattern = /\b(?:dry\scutting|welding\s+fumes|grinding|chemical\sexposure|chemical\s+spray|chemical\s+cloud)\b/i.test(fragment);
          if (clearAirbornePattern) {
            route = { domainId: 'silica_respirable_dust', confidence: 0.6, matchedSignals: ['airborne exposure with suspected silica dust'], routeDisposition: 'categorize_only', requiresHumanReview: false };
          }
        } else if (
          airborneExposurePattern &&
          !silicaEvidence &&
          route.domainId === 'hot_work' &&
          route.confidence <= 0.2 &&
          /\bdry\s+cutting\s+(?:concrete|masonry|block)\b/i.test(fragment)
        ) {
          // A weak, coincidental hot_work pre-route (generic "work" substring only) must not block
          // unambiguous silica-generating evidence: dry cutting of a known silica-bearing material.
          route = { domainId: 'silica_respirable_dust', confidence: 0.6, matchedSignals: ['dry cutting of silica-bearing material supersedes weak generic hot_work pre-route'], routeDisposition: 'categorize_only', requiresHumanReview: false };
        }
        if (route.domainId === 'compressed_gas' && !/\b(?:compressed\s+gas|gas\s+cylinder|oxygen|acetylene|cylinder|valve\s+cap|regulator|receiver(?:\s+vessel)?|gas\s+leak|hose\s+rupture)\b/i.test(fragment)) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }

        // Family-relative false-current guards: a weak base-router match (generic
        // entity-word coincidence, confidence <= 0.4) must not become an ACTIVE
        // finding when the SAME fragment specifically negates, controls, removes,
        // or contradicts the condition required for that routed family. Unrelated
        // safe/negation language elsewhere does not qualify, and no other domain
        // is affected.
        if (
          route.domainId === 'compressed_gas' &&
          route.confidence <= 0.4 &&
          (/\b(?:secured|capped|not\s+leaking|no\s+leak|leak[- ]free)\b/i.test(fragment) ||
            /\bwithout\b[^.]{0,60}\b(?:cylinder|storage|release)\b[^.]{0,20}\bevidence\b/i.test(fragment))
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          route.domainId === 'confined_space' &&
          route.confidence <= 0.4 &&
          (/\b(?:no|not|without)\b[^.]{0,40}\bconfined[- ]?space\b/i.test(fragment) ||
            /\b(?:space|entry)\b[^.]{0,60}\b(?:unknown|not\s+established|not\s+confirmed|not\s+occurring)\b/i.test(fragment) ||
            /\b(?:space|entry)\b[^.]{0,40}\b(?:evaluated|controlled|verified)\b/i.test(fragment))
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          route.domainId === 'emergency_egress' &&
          route.confidence <= 0.4 &&
          (/\bexit\b[^.]{0,40}\b(?:clear|unlocked|usable|open)\b/i.test(fragment) ||
            /\begress\b[^.]{0,40}\b(?:clear|unobstructed|usable)\b/i.test(fragment) ||
            /\boutside\b[^.]{0,40}\b(?:egress|exit)\s+path\b/i.test(fragment))
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          route.domainId === 'respiratory_protection' &&
          route.confidence <= 0.4 &&
          (/\brespirat(?:ory|or)\b[^.]{0,40}\b(?:correctly\s+worn|functioning|properly\s+fitted|fit[- ]tested\s+and\s+worn)\b/i.test(fragment) ||
            /\b(?:agent|respiratory\s+requirement)\b[^.]{0,40}\bunknown\b/i.test(fragment))
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          route.domainId === 'fall_protection' &&
          route.confidence <= 0.4 &&
          (/\b(?:guardrail|guardrails|edge|platform)\b[^.]{0,40}\b(?:effective|secured|guarded|protected)\b/i.test(fragment) ||
            /\b(?:effective|secured)\b[^.]{0,40}\bguardrails?\b/i.test(fragment))
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          route.domainId === 'mobile_equipment' &&
          route.confidence <= 0.4 &&
          !/\b(?:forklift|loader|haul\s+truck|truck|vehicle|mobile\s+equipment|backing|struck\s+by|traffic|spotter)\b/i.test(fragment)
        ) {
          // A bare "pedestrian" mention (e.g. "pedestrian walkway is clear")
          // is not itself vehicle/pedestrian traffic-interaction evidence;
          // that requires an actual vehicle/equipment/traffic-conflict term
          // in the same fragment, matching the taxonomy domain's own stated
          // scope.
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          route.domainId === 'silica_respirable_dust' &&
          route.confidence <= 0.4 &&
          (/\bsilica(?:[- ]bearing)?(?:\s+material)?\b[^.]{0,40}\b(?:not\s+supported|not\s+established|not\s+confirmed|is\s+absent|not\s+identified)\b/i.test(fragment) ||
            /\bdust\s+control\b[^.]{0,40}\b(?:is\s+operating|operating|verified)\b/i.test(fragment) ||
            /\b(?:verified|confirmed)\b[^.]{0,40}\bcontrolled\b/i.test(fragment))
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          route.domainId !== 'silica_respirable_dust' &&
          route.confidence <= 0.4 &&
          !/\b(?:weld(?:ing)?|torch|braz(?:ing)?|flame|hot[- ]?work|fire\s+watch|spark)\b/i.test(fragment) &&
          /\b(?:dry[- ]?cut(?:s|ting)?|dry[- ]?grind(?:s|ing)?|masonry\s+saw|concrete\s+saw|(?:cutting|grinding|sawing|chipping|jackhammering)\s+(?:concrete|block|brick|stone|tile|masonry|mortar))\b/i.test(fragment)
        ) {
          // Dry-cutting/grinding masonry, concrete or block is a respirable-silica task, not hot
          // work: no flame, no sparks, no fire watch. A weak hot_work pre-route on such a fragment
          // (a bare taxonomy word coincidence) must not create a hot-work finding beside -- or
          // instead of -- the silica finding that owns the evidence.
          route = { domainId: 'silica_respirable_dust', confidence: 0.6, matchedSignals: ['dry cutting/grinding of silica-bearing material'], routeDisposition: 'categorize_only', requiresHumanReview: false };
        }
        if (
          route.domainId === 'machine_guarding' &&
          route.confidence <= 0.4 &&
          /\bguard\b[^.]{0,30}\b(?:status\s+)?(?:cannot\s+be\s+confirmed|unconfirmed|unknown|not\s+confirmed|not\s+established)\b/i.test(fragment)
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          (route.domainId === 'machine_guarding' || route.domainId === 'conveyors') &&
          route.confidence <= 0.4 &&
          /\b(?:servic\w*|maint\w*|repair\w*|interven\w*|clear\w*\s+(?:a\s+)?jam)\b/i.test(this.sentenceContaining(observationText, fragment)) &&
          !/\b(?:guard(?:s|ed|ing)?|unguarded|nip|pinch|point\s+of\s+operation|exposed\s+(?:shaft|belt|pulley|rotating|moving)|rotating|in-?running)\b/i.test(fragment)
        ) {
          // A bare machine-entity word (e.g. "conveyor") in a servicing/maintenance
          // fragment is a hazardous-energy-control context, not guarding evidence:
          // without any guarding vocabulary in the same fragment, the weak entity
          // coincidence must not manufacture a second, guarding-labelled finding
          // alongside the LOTO finding that actually owns this evidence.
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          route.domainId === 'electrical' &&
          route.confidence <= 0.4 &&
          /\belectrical\b[^.]{0,40}\bwithout\b[^.]{0,20}\bexposure\s+evidence\b/i.test(fragment)
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        // The same evidence-independence rule the 2026-08-27 precision phase applied
        // to material handling, walking/working surfaces, guarding, fall protection,
        // mobile equipment and excavation, extended to the two families the
        // hazardous-energy probe family showed still promote a bare entity word:
        // "the electrical safety training matrix" and "the annual lockout procedure
        // audit were both current" are administrative records, and "a spare motor
        // control centre bucket was stored on a shelf in the electrical room" names
        // a place. A weak router hit (generic entity-word coincidence, confidence
        // <= 0.4) must carry the family's own CONDITION evidence, not merely the
        // family's name. Routes that arrive with their own evidence -- the
        // finding-local electrical-exposure clause, positiveLotoMechanism, the
        // cross-clause hazardous-energy detector -- are above this confidence and
        // are untouched.
        if (
          route.domainId === 'electrical' &&
          route.confidence <= 0.4 &&
          !/\b(?:energi[sz]ed|live|powered|exposed|exposing|bare|uncovered|open|missing|removed|damaged|frayed|cracked|deteriorated|spliced|arc(?:ing|[- ]flash)?|shock|ungrounded|grounding|gfci|overload(?:ed)?|short(?:ed|ing)?|contact(?:ed)?|unguarded|unprotected|defective|inoperative)\b/i.test(fragment)
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          route.domainId === 'lockout_tagout' &&
          route.confidence <= 0.4 &&
          !lotoControlAbsent(fragment) &&
          !LOTO_ENERGY_SOURCE.test(fragment) &&
          !/\b(?:not|never|without|missing|removed|bypass(?:ed|ing)?|defeat(?:ed|ing)?|failed|incomplete|unverified)\b/i.test(fragment)
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          route.domainId === 'environmental_spill' &&
          route.confidence <= 0.4 &&
          (/\b(?:spill|obstruction)\b[^.]{0,30}\b(?:is\s+)?removed\b/i.test(fragment) ||
            /\b(?:decontaminat\w*|containment|contained|cleaned?|removal|removed)\b[^.]{0,50}\bverified\b/i.test(observationText) ||
            /\bverified\b[^.]{0,50}\b(?:decontaminat\w*|containment|contained|cleaned?|removal|removed)\b/i.test(observationText))
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          route.domainId === 'rigging_lifting' &&
          route.confidence <= 0.4 &&
          (/\brigging\b[^.]{0,30}\bcondition\s+is\s+unknown\b/i.test(fragment) ||
            /\brigging\b[^.]{0,60}\bverified\s+effective\b/i.test(observationText))
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          route.domainId === 'hazcom' &&
          route.confidence <= 0.4 &&
          (/\bchemical\b[^.]{0,30}\b(?:identity|exposure\s+route)\b[^.]{0,20}\bunknown\b/i.test(fragment) ||
            /\bchemical\s+hazard\b[^.]{0,30}\b(?:remains\s+separately\s+evaluated|separately\s+evaluated)\b/i.test(fragment))
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          route.domainId === 'compressed_gas' &&
          route.confidence <= 0.4 &&
          /\bleak\s+control\b[^.]{0,30}\b(?:are|is)\s+verified\b/i.test(observationText)
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }

        // Evidence-independence predicates for the remaining families whose
        // taxonomy signals are ordinary English nouns ("material", "walkway",
        // "floor", "fall", "guard", "forklift", "loader", "trench"). The router
        // scores a single bare substring hit at confidence 0.2 and two at 0.4,
        // so at confidence <= 0.4 the route rests entirely on entity-word
        // coincidence. Such a route is a hazard only if the SAME fragment also
        // carries evidence that is independently sufficient for that family:
        // a clause the inspector wrote to establish energy state, exposure,
        // proximity, material state or location for a DIFFERENT hazard must not
        // become a hazard of its own ("material was being fed", "the walkway
        // passes within two feet of the exposed pinch point", "the forklift
        // charging room"). Equally, a family signal inside an explicitly
        // verified-sound description ("the guard was correctly fitted", "the
        // handrail was continuous", "the trench has been backfilled") is a
        // statement of compliance, not a deficiency.
        //
        // This is deliberately family-keyed and confined to confidence <= 0.4,
        // matching the false-current guards above. It is not a global
        // confidence threshold: a route that reaches this layer with its own
        // family-specific evidence is untouched, and no family's strong,
        // independently preserved detection path is affected.
        const MATERIAL_HANDLING_EVIDENCE = /\b(?:stack\w*|storage|stored|storing|rack(?:s|ing|ed)?|pallet|shelv\w*|tier\w*|bundle|bale|unsecured|unstable|unrestrained|overhang\w*|topple|toppl\w*|leaning|protrud\w*|fell|falling\s+(?:object|material|load)|struck\s+by|manual(?:ly)?\s+handl\w*|lift\w*|carr(?:y|ied|ying)|hoist\w*|load\s+(?:limit|capacity|rating)|capacity|blocked|obstruct\w*|congest\w*|narrow(?:ed)?\s+aisle)\b/i;
        const WALKING_SURFACE_EVIDENCE = /\b(?:wet|slip\w*|slick|icy|ice|oil(?:y|ed)?|grease|greasy|spill\w*|uneven|damaged|broken|deteriorat\w*|hole|gap|unguarded|uncovered|unprotected|missing|obstruct\w*|blocked|congest\w*|clutter\w*|debris|scrap|trip(?:s|ped|ping|\s+hazard)?|protrud\w*|raised\s+edge|elevation\s+(?:change|transition)|fall\w*\s+(?:into|through)|no\s+(?:cover|guardrail|barrier|railing))\b/i;
        const FALL_EVIDENCE = /\b(?:height|elevat\w*|overhead|storey|story|metre|meter|feet|foot|edge|opening|hole|guardrail|handrail|railing|harness|lanyard|anchor|fall\s+(?:arrest|protection|hazard|exposure)|scaffold|ladder|roof|mezzanine|platform|leading\s+edge|drop[- ]?off|unprotected|unguarded|missing|damaged|broken|absent|removed)\b/i;
        const SOUND_CONDITION_ASSERTED = /\b(?:guard(?:s|ing|ed|rail|rails)?|handrail|railing|cover|barrier|edge\s+protection|interlock)\b[^.]{0,80}\b(?:correctly|properly|securely|fully)?\s*(?:fitted|installed|in\s+place|intact|secured|secure|present|sound|continuous|effective|adequate|compliant|closed|latched|free\s+of\s+damage|undamaged)\b/i;
        const DEFICIENCY_PRESENT = /\b(?:not|no|never|missing|removed|absent|bypass\w*|defeat\w*|damaged|broken|loose|deteriorat\w*|inadequate|insufficient|unguarded|unprotected|uncovered|open|failed|defective)\b/i;
        const MOBILE_EQUIPMENT_EVIDENCE = /\b(?:operat(?:ing|es|ed|ion)|driv(?:e|es|en|ing)|travel\w*|revers\w*|backing|manoeuvr\w*|maneuver\w*|haul(?:ing|ed|s)?|dump(?:ing|ed|s)?|tram(?:ming|med)?|struck|run\s+over|collid\w*|pedestrian|spotter|traffic|horn|alarm|seat\s?belt|brake|steering|mast|forks?|tine|blind\s+spot|speed|berm|windrow|barricade|right[- ]of[- ]way|crossing|rollover|overturn\w*|park(?:ed)?\s+on)\b/i;
        const EXCAVATION_COMPLETED = /\b(?:backfill\w*|paved\s+over|filled\s+in|reinstated|compacted\s+and|restored|closed\s+out)\b/i;

        if (
          route.confidence <= 0.4 &&
          (route.domainId === 'material_handling' || route.domainId === 'material_handling_storage') &&
          !MATERIAL_HANDLING_EVIDENCE.test(fragment)
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          route.confidence <= 0.4 &&
          (route.domainId === 'walking_working_surfaces' || route.domainId === 'slips_trips_falls' || route.domainId === 'housekeeping') &&
          !WALKING_SURFACE_EVIDENCE.test(fragment)
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          route.confidence <= 0.4 &&
          route.domainId === 'fall_protection' &&
          (!FALL_EVIDENCE.test(fragment) ||
            (SOUND_CONDITION_ASSERTED.test(fragment) && !DEFICIENCY_PRESENT.test(fragment)))
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          route.confidence <= 0.4 &&
          (route.domainId === 'machine_guarding' || route.domainId === 'conveyors' || route.domainId === 'guarding_interlocks') &&
          SOUND_CONDITION_ASSERTED.test(fragment) &&
          !DEFICIENCY_PRESENT.test(fragment)
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          route.confidence <= 0.4 &&
          (route.domainId === 'mobile_equipment' || route.domainId === 'forklifts' || route.domainId === 'powered_industrial_trucks' || route.domainId === 'powered_haulage') &&
          !MOBILE_EQUIPMENT_EVIDENCE.test(fragment)
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: true };
        }
        if (
          route.confidence <= 0.4 &&
          route.domainId === 'excavation_trenching' &&
          EXCAVATION_COMPLETED.test(fragment)
        ) {
          route = { domainId: 'unknown', confidence: 0, matchedSignals: [], routeDisposition: 'hold_for_review', requiresHumanReview: false };
        }

        if (route.domainId !== 'unknown') {
            const domain = this.taxonomyService.findDomainById(route.domainId);
            const existingIndex = hazards.findIndex(h => h.domainId === route.domainId);
            const existing = existingIndex >= 0 ? hazards[existingIndex] : undefined;

            // A domain slot is claimed by whichever fragment matches it first,
            // but "first" is incidental sentence order, not evidence strength.
            // A weak, contentless fragment (e.g. "during the shop floor
            // walkthrough", matching only on the bare word "floor") must not
            // permanently block a later fragment carrying the domain's real,
            // specific evidence (e.g. "a trip hazard was created by scrap
            // material") from ever being captured. Prefer the fragment with
            // the stronger (or equal) match confidence, replacing the earlier
            // claim in place -- the hazardId and array position stay stable so
            // this remains a durable identity, not order-dependent.
            if (existing && route.confidence < existing.confidence) {
                routingNotes.push(`Fragment "${fragment}" also matched ${route.domainId} (already captured by stronger evidence).`);
                return;
            }

            const nextHazard = {
                hazardId: existing ? existing.hazardId : `haz-${hazards.length + 1}`,
                domainId: route.domainId,
                hazardFamily: domain?.relatedStandardFamilies[0] || 'unknown',
                mechanism: route.matchedSignals[0],
                observationFragment: fragment,
                supportingSignals: route.matchedSignals,
                confidence: route.confidence,
                possibleOverlapWith: [],
                requiresHumanReview: route.requiresHumanReview,
                evidenceGaps: [],
                reviewerQuestions: route.requiresHumanReview ? [`Please verify the ${route.domainId} hazard in this fragment.`] : [],
                ...this.inferConditionState(fragment, originalObservation, route.domainId),
            };
            if (existing) {
                routingNotes.push(`Fragment "${fragment}" replaced a weaker earlier match for ${route.domainId}.`);
                hazards[existingIndex] = nextHazard;
            } else {
                hazards.push(nextHazard);
                routingNotes.push(`Decomposed fragment "${fragment}" routed to ${route.domainId}`);
            }
        }
    });

    // Preserve explicit compressed-air receiver/hose safety defects. These
    // are distinct from ordinary pneumatic actuator stored energy (which is
    // handled as hazardous-energy control/LOTO) and require a local vessel or
    // hose defect predicate before creating the compressed-gas family.
    fragments.forEach((fragment) => {
      const compressedAirDefect = ( /\bcompressed[- ]air\b[^.]{0,100}\b(?:receiver|hose|line)\b/i.test(fragment) ||
        /\bpneumatic\s+hose\b[^.]{0,60}\b(?:ruptur(?:e|ed|es)|leak(?:ing)?|damaged|defect|failure)\b/i.test(fragment) ) &&
        /\b(?:structural|pressure\s+defect|missing\s+pressure\s+relief|ruptur(?:e|ed|es)|leak(?:ing)?|damaged|defect|failure)\b/i.test(fragment);
      if (compressedAirDefect && !hazards.some((h) => h.domainId === 'compressed_gas' && h.observationFragment === fragment)) {
        hazards.push({
          hazardId: `haz-${hazards.length + 1}`,
          domainId: 'compressed_gas',
          hazardFamily: 'compressed_gas',
          mechanism: 'compressed-air vessel/hose defect',
          observationFragment: fragment,
          supportingSignals: ['compressed-air receiver/hose defect'],
          confidence: 0.7,
          possibleOverlapWith: [],
          requiresHumanReview: true,
          evidenceGaps: ['Confirm pressure rating, relief protection, containment, and isolation.'],
          reviewerQuestions: ['Confirm the compressed-air receiver or hose defect and pressure controls.'],
          ...this.inferConditionState(fragment, originalObservation, 'compressed_gas'),
        });
      }
    });

    // Preserve the hydraulic/pneumatic energy source as its own finding.
    // This is intentionally separate from LOTO: fluid-power energy can be
    // hazardous without a servicing obligation, while servicing under that
    // energy may legitimately produce both findings.
    const addHydraulicEnergyFinding = (fragment: string, explicitState?: HazardDecomposition['conditionState']) => {
      const energySource = /\b(?:hydraulic|pneumatic|fluid\s+power|accumulator|pressurized|pressurised|pressure|compressed[- ]air|cylinder)\b/i.test(fragment);
      const explicitNoHazard = /\b(?:no|without)\s+(?:leak|unexpected\s+movement|intervention|servicing|maintenance|employee\s+exposure|hazard)\b/i.test(fragment);
      // "remain(?:s|ed)?" (not just "remains?"): ordinary past-tense inspection
      // language ("pressure remained in the ram") must match, not only present tense.
      const hazardousEnergyEvidence = /\b(?:leak(?:ing)?|high[- ]pressure|injection|release|retain(?:s|ed)?\s+pressure|pressure\s+(?:is\s+|was\s+|been\s+)?retained|pressure\s+remain(?:s|ed)?|residual[- ]pressure|stored[- ]pressure|(?:hydraulic|pneumatic)\s+(?:stored|residual)?\s*energy\s+remain(?:s|ed)?|(?:stored|residual)\s+(?:hydraulic|pneumatic)\s+energy\s+remain(?:s|ed)?|charged|under\s+pressure|capable\s+of\s+(?:unexpected\s+)?movement|unexpected(?:ly)?\s+(?:move|stroke)|could\s+(?:move|stroke)|travel\s+path|hazard\s+zone|pressure\s+(?:release|loss|reliev(?:ed|e)|[^.]{0,30}reliev))\b/i.test(fragment);
      const plannedPressureControl = /\b(?:planned|scheduled|tomorrow|future)\b[^.]{0,80}\bpressure\b[^.]{0,40}\breliev/i.test(fragment);
      const safeState = (/\b(?:isolated|bled\s+to\s+zero|bled\s+off|depressurized|de-pressurized|discharged|zero[- ]energy\s+(?:verified|confirmed)|pressure\s+relieved|relieved\s+and\s+verified|locked\s+out)\b/i.test(fragment) ||
        /\bleak\s+control\b[^.]{0,30}\b(?:are|is)\s+verified\b/i.test(fragment)) &&
        !/\b(?:before|without|not|never|has\s+not\s+been)\b[^.]{0,50}\b(?:relieved|bled|discharged|isolated|verified)\b/i.test(fragment);
      const normalOperation = /\b(?:operating|running)\b[^.]{0,80}\b(?:normally|normal)\b/i.test(fragment) &&
        !/\b(?:leak|unexpected|exposure|hazard|retains?\s+pressure|pressure\s+remains?|capable\s+of\s+movement)\b/i.test(fragment);
      if (!energySource || (!hazardousEnergyEvidence && !plannedPressureControl) || explicitNoHazard || (safeState && !explicitState) || normalOperation) return;
      if (hazards.some(h => h.domainId === 'hydraulic_pneumatic_energy' && h.observationFragment === fragment)) return;
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'hydraulic_pneumatic_energy',
        hazardFamily: 'hydraulic_pneumatic_energy',
        mechanism: 'hazardous hydraulic/pneumatic stored energy',
        observationFragment: fragment,
        supportingSignals: ['fluid-power energy source', 'unsafe pressure or movement potential'],
        confidence: 0.78,
        possibleOverlapWith: ['lockout_tagout'],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm pressure status, exposure boundary, and effective relief or restraint.'],
        reviewerQuestions: ['Is the hydraulic or pneumatic energy currently pressurized, exposed, and effectively relieved or restrained?'],
        ...(explicitState ? { conditionState: explicitState, temporalEvidence: [explicitState.toLowerCase()] } : this.inferConditionState(fragment, originalObservation, 'hydraulic_pneumatic_energy')),
      });
      routingNotes.push(`Preserved finding-local hydraulic/pneumatic energy from "${fragment}"`);
    };

    fragments.forEach(fragment => {
      const historicalFragment = /\b(?:yesterday|historical|prior|previous|earlier)\b/i.test(originalObservation) &&
        /\b(?:isolated|repaired|resolved|restored|corrected|verified)\b/i.test(originalObservation);
      const plannedFragment = /\b(?:planned|scheduled|tomorrow|next\s+shift|future)\b/i.test(originalObservation);
      addHydraulicEnergyFinding(fragment, historicalFragment ? 'HISTORICAL' : plannedFragment ? 'PLANNED_FUTURE' : undefined);
    });
    const fullHydraulicEnergy = /\b(?:hydraulic|pneumatic|fluid\s+power|accumulator|pressurized|pressurised|pressure|compressed[- ]air|cylinder)\b/i.test(observationText) &&
      /\b(?:leak(?:ing)?|high[- ]pressure|injection|release|retain(?:s|ed)?\s+pressure|pressure\s+(?:is\s+|was\s+|been\s+)?retained|pressure\s+remain(?:s|ed)?|residual[- ]pressure|stored[- ]pressure|(?:hydraulic|pneumatic)\s+(?:stored|residual)?\s*energy\s+remain(?:s|ed)?|(?:stored|residual)\s+(?:hydraulic|pneumatic)\s+energy\s+remain(?:s|ed)?|charged|under\s+pressure|capable\s+of\s+(?:unexpected\s+)?movement|unexpected(?:ly)?\s+(?:move|stroke)|could\s+(?:move|stroke)|not\s+(?:isolated|controlled|relieved|bled)|without\s+(?:isolation|relief|bleed)|before\s+(?:supply\s+)?isolation|pressure\s+(?:release|loss|reliev(?:ed|e)|[^.]{0,30}reliev))\b/i.test(observationText);
    const fullNormalControlled = /\b(?:operating|running)\b[^.]{0,80}\b(?:normally|normal)\b/i.test(observationText) &&
      /\b(?:no|without)\b[^.]{0,80}\b(?:leak|unexpected\s+movement|exposure|intervention|servicing|maintenance|hazard)\b/i.test(observationText);
    const historicalHydraulic = fullHydraulicEnergy && /\b(?:yesterday|historical|prior|previous|earlier)\b/i.test(observationText) && /\b(?:isolated|repaired|resolved|restored|corrected|verified)\b/i.test(observationText);
    const plannedHydraulic = fullHydraulicEnergy && /\b(?:planned|scheduled|tomorrow|next\s+shift|future)\b/i.test(observationText);
    const plannedPressureObservation = /\b(?:hydraulic|pneumatic|accumulator|fluid\s+power)\b/i.test(observationText) &&
      /\b(?:planned|scheduled|tomorrow|next\s+shift|future)\b/i.test(observationText) &&
      /\bpressure\b[^.]{0,50}\breliev/i.test(observationText);
    if ((fullHydraulicEnergy || plannedPressureObservation) && !fullNormalControlled && !hazards.some(h => h.domainId === 'hydraulic_pneumatic_energy')) {
      addHydraulicEnergyFinding(observationText, historicalHydraulic ? 'HISTORICAL' : (plannedHydraulic || plannedPressureObservation) ? 'PLANNED_FUTURE' : undefined);
    }

    // Preserve hazardous-energy failures that do not use the literal words
    // lockout/tagout, provided the same fragment establishes servicing,
    // hazardous energy, and failed/incomplete control.
    fragments.forEach((fragment) => {
      const negated = /\b(?:no|not|never)\b[^.]{0,50}\b(?:lockout|tagout|failure to isolate|uncontrolled stored energy)\b/i.test(fragment) || /\b(?:historical|prior|previous|earlier)\b[^.]{0,80}\b(?:lockout|tagout|isolation)\b[^.]{0,80}\b(?:corrected|resolved|verified|confirmed)\b/i.test(fragment);
      const mechanism = /\b(?:servic\w*|maint\w*|repair\w*|interven\w*)\b/i.test(fragment) &&
        LOTO_ENERGY_SOURCE.test(fragment) &&
        (/\b(?:without\s+(?:lockout|(?:hazardous\s+)?(?:energy\s+)?isolation|isolating|energy\s+control)|not\s+(?:isolated|controlled|locked)|uncontrolled|remains?\s+uncontrolled|lock\s+(?:was\s+)?removed|re-?energ(?:ization|isation)|unexpected(?:ly)?\s+re-?energ|before\s+(?:supply\s+)?isolation|isolation\s+(?:was\s+)?incomplete|zero[- ]energy\s+(?:was\s+)?(?:not\s+verified|never\s+(?:completed|performed|verified))|pressure\s+(?:remains?|is\s+present|retained)|retains?\s+pressure|spring\s+remains?|can\s+drop|only\s+[^.]{0,50}\s+isolated|not\s+all\s+(?:energy|sources)|begins?\s+(?:maintenance|servicing)\s+before)\b/i.test(fragment) || lotoControlAbsent(fragment));
      if (mechanism && !negated && !hazards.some(h => h.domainId === 'lockout_tagout' && h.observationFragment === fragment)) {
        hazards.push({
          hazardId: `haz-${hazards.length + 1}`,
          domainId: 'lockout_tagout',
          hazardFamily: 'lockout_tagout',
          mechanism: 'hazardous energy control failure',
          observationFragment: fragment,
          supportingSignals: ['servicing/intervention', 'hazardous energy source', 'energy control failure'],
          confidence: 0.75,
          possibleOverlapWith: [],
          requiresHumanReview: true,
          evidenceGaps: ['Confirm all hazardous energy sources and isolation/zero-energy verification.'],
          reviewerQuestions: ['Were all energy sources isolated and verified before or during servicing?'],
          ...this.inferConditionState(fragment, originalObservation, 'lockout_tagout'),
        });
      }
    });
    // Component replacement/installation ("began replacing the starter", "was
    // installing a new contactor") is servicing under any hazardous-energy-control
    // rule, and "began work inside the enclosure" is the ordinary field phrasing
    // for the same thing. Their absence from this vocabulary is why an MCC bucket
    // opened with the disconnect closed and no lock applied produced no LOTO
    // finding at all. This predicate only OPENS the cross-clause detector; a
    // hazardous-energy source AND uncontrolled-energy evidence are still both
    // required before any finding is created.
    const crossClauseIntervention =/\b(?:servic\w*|maint\w*|repair\w*|interven\w*|clear\w*|unjam\w*|replac\w*|install\w*|reach\w*\s+into|disconnect\w*\s+(?:a\s+)?(?:hydraulic|pneumatic)|work\w*\s+(?:beneath|under)|(?:beg(?:an|ins|un)|start(?:ed|s|ing)?|perform(?:ed|ing|s)?)\s+(?:\w+\s+){0,2}work\b)/i.test(observationText);
    const crossClauseEnergy = /\b(?:hydraulic|pneumatic|compressed[- ]air|mechanical|gravity|spring|thermal|pressure|stored\s+energy|hazardous\s+energy|energ(?:ized|ised)|electrical|disconnect|isolation|elevated|raised|load|accumulator|cylinder|re-?energ(?:ization|isation|ized|ised|izes|ises)?)\b/i.test(observationText) ||
      LOTO_ENERGY_SOURCE.test(observationText);
    const crossClauseUncontrolledEnergy = /\b(?:lock\s+(?:was\s+)?removed|re-?energ(?:ization|isation)|unexpected(?:ly)?\s+re-?energ|re-?energ(?:izes|ises)|uncontrolled|without\s+(?:lockout|(?:hazardous\s+)?(?:energy\s+)?isolation|isolating|energy\s+control)|not\s+(?:been\s+|yet\s+)?(?:isolated|controlled|locked|restrained|discharged)|(?:pressure|energy)\s+remains?\b|remains?\s+(?:stored|pressurized|under\s+pressure)|capable\s+of\s+movement|spring\s+remains?|can\s+drop|unsupported|not\s+(?:been\s+)?discharged|before\s+(?:supply\s+)?isolation|before\s+(?:stored\s+)?(?:pressure|energy)\s+(?:is\s+)?(?:relieved|bled|released|discharged)|before\s+(?:stored\s+)?(?:pressure|energy)\s+has\s+been\s+(?:relieved|bled|released|discharged)|before\s+(?:hazardous\s+)?(?:stored\s+)?energy\s+isolation\s+is\s+applied|zero[- ]energy\s+(?:was\s+)?(?:not\s+verified|never\s+(?:completed|performed|verified))|verification\s+was\s+never\s+completed|absence\s+of\s+voltage\s+(?:was\s+|had\s+)?(?:not|never)\s+(?:been\s+)?(?:verified|tested|checked|confirmed|established))\b/i.test(observationText) ||
      lotoControlAbsent(observationText);
    const crossClauseSafeEnergy = /\b(?:isolated|bled\s+off|bled|depressurized|de-pressurized|zero[- ]energy\s+(?:verified|confirmed)|locked\s+out|lockout\s+(?:applied|verified)|released|restrained|relieved\s+and\s+verified)\b/i.test(observationText) && !crossClauseUncontrolledEnergy;
    const historicalLotoContext = crossClauseIntervention && crossClauseEnergy &&
      /\b(?:yesterday|historical|prior|previous|earlier)\b/i.test(observationText) &&
      /\b(?:isolated|repaired|resolved|restored|corrected|verified)\b/i.test(observationText);
    const plannedLotoContext = crossClauseIntervention && crossClauseEnergy &&
      /\b(?:planned|scheduled|tomorrow|next\s+shift|future)\b/i.test(observationText);
    // Same distinction as lockoutControlAbsent in the per-fragment loop above:
    // "no lockout/tagout has been applied" names the control as absent (an
    // active deficiency), not a negated hazard, and must not be excluded by
    // the general "no...lockout" safe-language check below.
    const crossClauseLockoutControlAbsent = lotoControlAbsent(observationText);
    const crossClauseLoto = crossClauseIntervention && crossClauseEnergy && crossClauseUncontrolledEnergy && !crossClauseSafeEnergy &&
      !historicalLotoContext && !plannedLotoContext &&
      (crossClauseLockoutControlAbsent || !/\b(?:no|not|never)\b[^.]{0,50}\b(?:lockout|tagout|failure to isolate|uncontrolled stored energy)\b/i.test(observationText)) &&
      !/\b(?:historical|prior|previous|earlier)\b[^.]{0,80}\b(?:lockout|tagout|isolation)\b[^.]{0,80}\b(?:corrected|resolved|verified|confirmed)\b/i.test(observationText);
    // Deliberately narrower than the servicing/intervention detection gate
    // above (servic*/maint*/repair*/interven*/clear*/unjam*): those verbs are
    // common to many unrelated hazard descriptions (e.g. "the handrail...was
    // repaired"), so including them in the SENTENCE-SELECTION filter pulled
    // an unrelated sentence's "repaired...verified secure" into the LOTO
    // fragment, which then made the whole finding's own inferConditionState()
    // read as SAFE_VERIFIED -- a real, demonstrated regression. The
    // intervention verb that actually matters for LOTO is always in the same
    // period-delimited sentence as its own energy/lockout term (confirmed
    // across every case this fix was tested against), so restricting fragment
    // selection to lockout/tagout/energy-specific terms is sufficient and
    // does not need the generic intervention verbs at all.
    // Sentence SELECTION stays deliberately tight (LOTO-specific vocabulary only, plus the
    // control-absent "no lock or tag" / "power connected" forms) so a sibling sentence about,
    // say, a damaged power cord or a locked exit door is never pulled into the LOTO finding's
    // evidence -- that would leak that sentence's standards onto this finding.
    // A LOTO sentence must ALSO carry the intervention/lock/isolation vocabulary -- a sibling
    // sentence that only says "energized" (e.g. a damaged, energized cord) belongs to the
    // electrical finding, not this one.
    const lotoSentenceQualifier = /\b(?:servic\w*|maint\w*|repair\w*|interven\w*|clear\w*|unjam\w*|lockout|lock\s*out|tagout|tag\s*out|LOTO|locks?|tags?|locked|tagged|isolat\w*)\b/i;
    const lotoKeywordPattern = /\b(?:lockout|lock\s*out|tagout|tag\s*out|LOTO|hazardous\s+energy|stored\s+energy|energ(?:ized|ised|y)|isolat\w*|de-?energ\w*|re-?energ\w*|(?:no|without|not)\s+(?:a\s+|any\s+|personal\s+)?(?:locks?|tags?)\b|not\s+(?:locked|tagged)\b|power\s+(?:connected|on|still|remains?|remained|is\s+(?:still\s+)?on|was\s+(?:still\s+)?on))\b/i;
    if (crossClauseLoto && !hazards.some(h => h.domainId === 'lockout_tagout')) {
      const lotoFragment = this.relevantSentenceFragment(observationText, lotoKeywordPattern, lotoSentenceQualifier);
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'lockout_tagout',
        hazardFamily: 'lockout_tagout',
        mechanism: 'hazardous energy control failure',
        observationFragment: lotoFragment,
        supportingSignals: ['servicing/intervention', 'hazardous energy source', 'energy control failure'],
        confidence: 0.75,
        possibleOverlapWith: [],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm all hazardous energy sources and isolation/zero-energy verification.'],
        reviewerQuestions: ['Were all energy sources isolated and verified before or during servicing?'],
        ...this.inferConditionState(lotoFragment, observationText, 'lockout_tagout'),
      });
    }
    if ((historicalLotoContext || plannedLotoContext) && !hazards.some(h => h.domainId === 'lockout_tagout')) {
      const lotoFragment = this.relevantSentenceFragment(observationText, lotoKeywordPattern, lotoSentenceQualifier);
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'lockout_tagout',
        hazardFamily: 'lockout_tagout',
        mechanism: 'hazardous energy control context',
        observationFragment: lotoFragment,
        supportingSignals: ['servicing/intervention', 'hazardous energy source', historicalLotoContext ? 'historical correction' : 'planned work'],
        confidence: 0.75,
        possibleOverlapWith: [],
        requiresHumanReview: true,
        evidenceGaps: [],
        reviewerQuestions: [],
        ...this.inferConditionState(lotoFragment, observationText, 'lockout_tagout'),
        conditionState: historicalLotoContext ? 'HISTORICAL' : 'PLANNED_FUTURE',
        temporalEvidence: [historicalLotoContext ? 'historical correction context' : 'planned future work'],
      });
    }

    // Preserve an independently evidenced suspended-load exposure. A crane,
    // hoist, sling, or rigging mention alone is not enough: the evidence must
    // establish a load suspended overhead and a person in/under the drop zone.
    const addSuspendedLoadFinding = (fragment: string, explicitState?: HazardDecomposition['conditionState']) => {
      const loadEvidence = SUSPENDED_LOAD_EVIDENCE.test(fragment);
      const exposureEvidence = SUSPENDED_LOAD_EXPOSURE.test(fragment);
      const explicitNoExposure = /\b(?:no|not|without)\b[^.]{0,80}\b(?:load\s+(?:is\s+)?suspended|person|employee|worker|one)\b/i.test(fragment) ||
        /\b(?:landed|fully\s+landed|secured\s+on\s+(?:a\s+)?stable\s+support|barricaded|area\s+below\s+is\s+clear|not\s+yet\s+lifted)\b/i.test(fragment);
      const unknownExposure = /\b(?:unknown|unclear|not\s+established|does\s+not\s+establish|not\s+known)\b/i.test(fragment);
      if (!loadEvidence || !exposureEvidence || explicitNoExposure || unknownExposure) return;
      if (hazards.some(h => h.domainId === 'suspended_loads' && h.observationFragment === fragment)) return;
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'suspended_loads',
        hazardFamily: 'suspended_loads',
        mechanism: 'suspended load drop/crush exposure',
        observationFragment: fragment,
        supportingSignals: ['suspended overhead load', 'person in drop zone'],
        confidence: 0.9,
        possibleOverlapWith: ['cranes_hoists_rigging'],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm load stability, exclusion-zone integrity, and employee position.'],
        reviewerQuestions: ['Is any employee presently beneath or within the drop zone of the suspended load?'],
        ...(explicitState ? { conditionState: explicitState, temporalEvidence: [explicitState.toLowerCase()] } : this.inferConditionState(fragment, originalObservation, 'suspended_loads')),
      });
      routingNotes.push(`Preserved finding-local suspended-load exposure from "${fragment}"`);
    };
    const historicalSuspended = /\b(?:yesterday|historical|prior|previous|earlier)\b/i.test(observationText) &&
      /\b(?:stopped|corrected|removed|cleared|resolved|secured)\b/i.test(observationText);
    const plannedSuspended = /\b(?:planned|scheduled|tomorrow|future|next\s+shift)\b/i.test(observationText) &&
      !/\b(?:currently|now|today|already)\b/i.test(observationText);
    fragments.forEach(fragment => addSuspendedLoadFinding(fragment, historicalSuspended ? 'HISTORICAL' : plannedSuspended ? 'PLANNED_FUTURE' : undefined));
    if (!hazards.some(h => h.domainId === 'suspended_loads')) {
      addSuspendedLoadFinding(observationText, historicalSuspended ? 'HISTORICAL' : plannedSuspended ? 'PLANNED_FUTURE' : undefined);
    }

    // Preserve a compressed-gas cylinder finding when the same clause names a gas
    // cylinder AND a restraint, valve-cap or segregation deficiency. The base
    // router is single-winner, so a clause that carries both a cylinder defect and
    // an adjacent hot-work signal ("unchained oxygen and acetylene cylinders with
    // their valve protection caps removed ... in the welding bay") routes to hot
    // work and the cylinder hazard is lost -- and an unrestrained cylinder with its
    // cap off is a life-critical missile hazard in its own right. A cylinder that
    // is secured and capped, or merely named, does not qualify.
    const addCompressedGasCylinderFinding = (fragment: string, explicitState?: HazardDecomposition['conditionState']) => {
      const cylinderIdentity =
        /\b(?:gas\s+cylinder|oxygen|acetylene|propane|argon|nitrogen|helium|co2|carbon\s+dioxide|compressed\s+gas)\b[^.]{0,40}\bcylinders?\b/i.test(fragment) ||
        /\bcylinders?\b[^.]{0,40}\b(?:oxygen|acetylene|propane|argon|nitrogen|helium|compressed\s+gas|fuel\s+gas)\b/i.test(fragment) ||
        /\b(?:oxygen|acetylene|propane|argon|fuel\s+gas|compressed\s+gas)\s+cylinders?\b/i.test(fragment) ||
        /\b(?:unchained|unsecured|unrestrained)\b[^.]{0,40}\bcylinders?\b/i.test(fragment) ||
        /\bcylinders?\b[^.]{0,40}\b(?:valve\s+(?:protection\s+)?cap|regulator)\b/i.test(fragment);
      const restraintDeficiency =
        /\b(?:unchained|unsecured|unrestrained|not\s+(?:chained|secured|restrained|capped|upright)|without\s+(?:a\s+)?(?:chain|restraint|cap)|lying\s+(?:down|on\s+(?:its|their)\s+side)|free[- ]standing|standing\s+(?:loose|against))\b/i.test(fragment) ||
        /\b(?:valve\s+(?:protection\s+)?caps?|caps?)\b[^.]{0,30}\b(?:removed|off|missing|not\s+(?:fitted|installed|in\s+place))\b/i.test(fragment) ||
        /\b(?:oxygen|oxidiz(?:er|ing))\b[^.]{0,60}\b(?:stored|standing)\b[^.]{0,40}\b(?:with|beside|next\s+to)\b[^.]{0,30}\b(?:acetylene|fuel\s+gas|flammable)\b/i.test(fragment);
      const verifiedSafe =
        /\b(?:chained|secured|restrained|capped|caps?\s+(?:fitted|in\s+place|installed)|stored\s+upright(?:\s+and\s+(?:chained|secured|capped))?|properly\s+segregated)\b/i.test(fragment) &&
        !/\b(?:not|without|no)\b[^.]{0,30}\b(?:chained|secured|restrained|capped)\b/i.test(fragment);
      const negated = /\b(?:no|not|without)\b[^.]{0,60}\b(?:cylinders?\s+(?:present|stored|in\s+use)|compressed\s+gas)\b/i.test(fragment);
      const uncertain = /\b(?:unknown|unclear|not\s+known|not\s+established|cannot\s+be\s+confirmed)\b/i.test(fragment);
      if (!cylinderIdentity || !restraintDeficiency || verifiedSafe || negated || uncertain) return;
      if (hazards.some(h => h.domainId === 'compressed_gas' && h.observationFragment === fragment)) return;
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'compressed_gas',
        hazardFamily: 'compressed_gas',
        mechanism: 'compressed-gas cylinder restraint, valve-cap or segregation deficiency',
        observationFragment: fragment,
        supportingSignals: ['identified gas cylinder', 'explicit restraint, valve-cap or segregation deficiency'],
        confidence: 0.85,
        possibleOverlapWith: ['hot_work', 'fire_explosion'],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm cylinder contents, restraint method, valve-cap status, upright storage, and separation of oxidizers from fuel gases.'],
        reviewerQuestions: ['Are the cylinders secured upright with valve protection caps fitted and oxidizers separated from fuel gases?'],
        ...(explicitState ? { conditionState: explicitState, temporalEvidence: [explicitState.toLowerCase()] } : this.inferConditionState(fragment, originalObservation, 'compressed_gas')),
      });
      routingNotes.push(`Preserved finding-local compressed-gas cylinder deficiency from "${fragment}"`);
    };
    fragments.forEach(fragment => addCompressedGasCylinderFinding(fragment));
    if (!hazards.some(h => h.domainId === 'compressed_gas')) addCompressedGasCylinderFinding(observationText);

    // Preserve a machine-guarding finding when the same clause names a guarding
    // COMPONENT and an explicit deficiency in it. The taxonomy router carries no
    // signal for abrasive-wheel guarding vocabulary (tool rest, work rest, tongue
    // guard, wheel), so "the pedestal grinder was operated with the tool rest
    // missing and a twelve millimetre gap at the wheel" generated no candidate at
    // all. A measured clearance that is being reported as CORRECT, or a guard
    // stated to be fitted, is not a deficiency and must not qualify -- that is the
    // distinction the frozen A-24 row exists to protect.
    const addGuardingComponentFinding = (fragment: string) => {
      const guardingComponent =
        /\b(?:tool\s+rest|work\s+rest|tongue\s+guard|wheel\s+guard|abrasive\s+wheel|grinding\s+wheel|barrier\s+guard|fixed\s+guard|interlock(?:ed|ing)?\s+guard|light\s+curtain|point\s+of\s+operation|nip\s+point|in-?running\s+nip|guard)\b/i.test(fragment);
      const componentDeficiency =
        /\b(?:tool\s+rest|work\s+rest|tongue\s+guard|wheel\s+guard|barrier\s+guard|fixed\s+guard|guard|light\s+curtain)\b[^.]{0,40}\b(?:missing|removed|absent|not\s+(?:installed|fitted|in\s+place|present)|broken|damaged|bypassed|defeated|jumpered)\b/i.test(fragment) ||
        /\b(?:missing|removed|absent|broken|bypassed|defeated|no)\b[^.]{0,40}\b(?:tool\s+rest|work\s+rest|tongue\s+guard|wheel\s+guard|barrier\s+guard|fixed\s+guard|guard|light\s+curtain)\b/i.test(fragment) ||
        /\b(?:gap|clearance|opening)\b[^.]{0,40}\b(?:at|on|to)\s+the\s+(?:wheel|blade|die|roll)\b/i.test(fragment) ||
        /\b(?:wheel|blade|die|roll)\b[^.]{0,30}\b(?:gap|clearance|opening)\b[^.]{0,30}\b(?:of|exceed\w*|greater|more\s+than)\b/i.test(fragment);
      const verifiedSafe =
        /\b(?:correctly|properly|securely)\s+(?:fitted|installed|adjusted|set|guarded)\b/i.test(fragment) ||
        /\b(?:guard|tool\s+rest|work\s+rest)\b[^.]{0,40}\b(?:was|is|were|are)\s+(?:set|adjusted|fitted|installed|in\s+place|intact)\b/i.test(fragment);
      const negated = /\b(?:no|not|without)\b[^.]{0,50}\b(?:guarding\s+deficienc|guard\s+(?:issue|problem|defect))\b/i.test(fragment);
      const uncertain = /\b(?:unknown|unclear|not\s+known|cannot\s+be\s+confirmed|not\s+established)\b/i.test(fragment);
      if (!guardingComponent || !componentDeficiency || verifiedSafe || negated || uncertain) return;
      if (hazards.some(h => h.domainId === 'machine_guarding' && h.observationFragment === fragment)) return;
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'machine_guarding',
        hazardFamily: 'machine_guarding',
        mechanism: 'required machine-guarding component missing, defeated or out of adjustment',
        observationFragment: fragment,
        supportingSignals: ['named machine-guarding component', 'explicit component deficiency'],
        confidence: 0.85,
        possibleOverlapWith: ['guarding_interlocks', 'personal_protective_equipment'],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm the machine, the required guard or rest, its adjustment tolerance, and employee access to the point of operation.'],
        reviewerQuestions: ['Which guarding component is missing or out of adjustment, and can an employee reach the point of operation?'],
        ...this.inferConditionState(fragment, originalObservation, 'machine_guarding'),
      });
      routingNotes.push(`Preserved finding-local machine-guarding component deficiency from "${fragment}"`);
    };
    fragments.forEach(fragment => addGuardingComponentFinding(fragment));

    // Preserve a current electrical finding when the same local clause
    // establishes an electrical source, energized/live state, and an
    // exposure/accessibility defect. Generic breaker, motor, outage, or
    // electrician language remains insufficient on its own.
    const electricalExposureFragment = fragments.find(fragment =>
      // "terminals" plural is at least as common as the singular in field notes
      // ("exposing live 480-volt terminals"); the sibling source words here are
      // already pluralised, and this one was not.
      /\b(?:panel|junction\s+box|disconnect|conductors?|terminals?|wiring|wires?|cable|bus|electrical)\b/i.test(fragment) &&
      // "Energized" state doesn't have to be spelled out: a bare/stripped
      // conductor found in service (not confirmed de-energized/locked out
      // elsewhere in the same clause) is ordinarily energized by default, and
      // real-world inspection language rarely states "energized" explicitly
      // when describing exposed conductors from damaged/stripped insulation.
      // Plural forms ("bare conductors", "exposed wires") must match too --
      // real inspection language uses them at least as often as the singular.
      (/\b(?:energized|energised|live|powered)\b/i.test(fragment) ||
        /\b(?:stripped insulation|insulation (?:stripped|removed|missing|damaged)|bare conductors?|bare wires?|exposed conductors?|exposed wires?|exposed wiring)\b/i.test(fragment)) &&
      /\b(?:exposed|exposing|open|accessible|bare|uncovered|damaged|unguarded|stripped)\b/i.test(fragment),
    );
    if (electricalExposureFragment && !hazards.some(hazard => hazard.domainId === 'electrical')) {
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'electrical',
        hazardFamily: 'electrical',
        mechanism: 'energized accessible electrical parts',
        observationFragment: electricalExposureFragment,
        supportingSignals: ['electrical source', 'energized/live state', 'exposure/accessibility defect'],
        confidence: 0.9,
        possibleOverlapWith: [],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm the energized state, boundary, and employee approach/contact exposure.'],
        reviewerQuestions: ['Are the exposed electrical parts energized and accessible during the observed task?'],
        ...this.inferConditionState(electricalExposureFragment, originalObservation, 'electrical'),
      });
      routingNotes.push('Preserved finding-local energized electrical exposure from a compound positive-evidence clause.');
    }

    // Preserve an independently evidenced hot-work mechanism when the fragment
    // router chooses a higher-scoring adjacent domain (for example, a cylinder).
    // Only active hot-work verbs qualify; a generic mention of “hot work” remains
    // review-only and is intentionally not promoted here.
    const hotWorkNegated =
      /\b(?:no|not|never)\s+(?:active\s+)?(?:hot[- ]?work|weld(?:ing)?|cut(?:ting)?|grind(?:ing)?)\b/i.test(observationText) ||
      /\b(?:hot[- ]?work|weld(?:ing)?|cut(?:ting)?|grind(?:ing)?)\b[^.]{0,100}\b(?:will\s+not|won't|not\s+(?:be\s+)?(?:performed|planned|scheduled|conducted)|canceled|cancelled|completed)\b/i.test(observationText) ||
      /\b(?:canceled|cancelled|selected\s+(?:a\s+)?cold[- ]work|cold[- ]work\s+method)\b[^.]{0,80}\b(?:hot[- ]?work|weld(?:ing)?|cut(?:ting)?|grind(?:ing)?)?\b/i.test(observationText) ||
      /\bhot[- ]?work\s+deficiency\b[^.]{0,40}\b(?:not|no)\b/i.test(observationText);
    const hotWorkUncertain = /\b(?:hot[- ]?work|weld(?:ing)?|cut(?:ting)?|grind(?:ing)?)\b[^.]{0,100}\b(?:may|might|uncertain|unclear|not\s+determined|undetermined)\b/i.test(observationText);
    const hotWorkFuture = !hotWorkUncertain && !hotWorkNegated && /\b(?:hot[- ]?work|weld(?:ing)?|cut(?:ting)?|grind(?:ing)?)\b[^.]{0,100}\b(?:planned|scheduled|will\s+(?:begin|start)|tomorrow|next\s+week|after\s+shutdown)\b/i.test(observationText);
    // A hot-work verb by itself (e.g. "grinding") is not evidence of a hot-work
    // hazard when the same observation explicitly describes the task being
    // performed with PPE correctly/properly/consistently in use and no
    // independent fire/spark/combustible signal is present -- that is a safe
    // routine-task description, not a deficiency report.
    const hotWorkSafePpeContext =
      /\b(?:wearing|worn|equipped with)\b[^.]{0,80}\b(?:correctly|properly|consistently)\b/i.test(observationText) &&
      !/\b(?:spark|fire|flame|combustible|flammable|fire\s+watch|ignition)\b/i.test(observationText);
    // "grinding"/"cutting" only count as hot work when they describe an ACTIVITY being performed
    // ("is grinding the weld", "cutting steel pipe"), never as a place noun ("the grinding area",
    // "cutting station") and never as a masonry/concrete dry-cutting silica task (which produces
    // dust, not flame/sparks, and is owned by the silica finding). Explicit hot-work vocabulary
    // (weld/torch/braze/flame/spark/hot work) needs no such qualification.
    const explicitHotWorkTerm = /\b(weld(?:ing)?|torch|braz(?:ing)?|flame[- ]?cut(?:ting)?|open\s+flame|hot[- ]?work)\b/i.test(observationText);
    const grindCutActivity =
      /\b(?:is|was|were|are|while|during|performing|doing|began|started|continu\w*|observed)\s+(?:\w+\s+){0,2}(?:grinding|cutting)\b/i.test(observationText) ||
      /\b(?:grinding|cutting)\s+(?:steel|metal|pipe|rebar|plate|angle\s+iron|a\s+weld|welds|the\s+weld|through|off)\b/i.test(observationText) ||
      /\b(?:angle|bench|hand|portable|abrasive|cut-?off)\s+grinder\b/i.test(observationText);
    const grindCutPlaceOrSilicaOnly =
      /\b(?:grinding|cutting)\s+(?:area|room|bay|station|booth|shop|department|table|line|floor|wheel|oil|fluid|board|zone)\b/i.test(observationText) ||
      /\b(?:dry[- ]?cut(?:ting)?|masonry|concrete|block|brick|stone|tile)\b/i.test(observationText);
    // "cutting" in the verb form above is also ordinary idiomatic English with
    // no physical sense at all -- "employees were cutting their lunch break
    // short", "cutting costs", "cutting corners", "cutting staff" -- which the
    // verb-form alternative read as an active hot-work operation. Only the
    // idiomatic object is excluded: a physical grinding or cutting task whose
    // workpiece happens to be unstated ("grinding nearby") remains hot work,
    // because sparks do not depend on the inspector naming the material.
    const grindCutIdiomaticObject =
      /\bcut(?:s|ting)?\s+(?:(?:their|his|her|its|our|the|a)\s+)?(?:lunch|break|shift|meeting|corner|corners|cost|costs|staff|hours?|time|budget|pay|price|prices)\b/i.test(observationText) ||
      /\bcut(?:s|ting)?\s+(?:\w+\s+){1,3}short\b/i.test(observationText);
    const activeHotWork = !hotWorkUncertain && !hotWorkNegated && !hotWorkFuture && !hotWorkSafePpeContext &&
      (explicitHotWorkTerm || (grindCutActivity && !grindCutIdiomaticObject && !grindCutPlaceOrSilicaOnly)) &&
      // "permit" was unscoped: a CONFINED-SPACE permit ("welding inside the empty
      // fuel tank ... with no entry permit") is not evidence that the hot work was
      // merely discussed rather than performed, yet it suppressed the finding for
      // an active weld inside a fuel tank. The exclusion's purpose -- keeping a
      // permit record from reading as an active operation -- is preserved by
      // requiring the permit to be a hot-work permit.
      !/\b(?:discussed|reviewed|hot[- ]?work\s+permit|selected|completed|canceled|cancelled|planned|scheduled)\b/i.test(observationText);
    if ((activeHotWork || hotWorkFuture) && !hotWorkNegated && !hazards.some(hazard => hazard.domainId === 'hot_work')) {
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'hot_work',
        hazardFamily: 'hot_work',
        mechanism: 'hot_work',
        observationFragment: this.relevantSentenceFragment(observationText, /\b(?:hot[- ]?work|weld(?:ing)?|cut(?:ting)?|torch|braz(?:ing)?|flame|grind(?:ing)?)\b/i),
        supportingSignals: ['active hot-work operation'],
        confidence: 0.4,
        possibleOverlapWith: [],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm hot-work controls, combustibles, and fire-watch status.'],
        reviewerQuestions: ['Please confirm the active hot-work operation and its controls.'],
      });
      routingNotes.push('Preserved independently evidenced active hot-work mechanism alongside adjacent hazards.');
    }
    if (hotWorkNegated) {
      for (let i = hazards.length - 1; i >= 0; i -= 1) if (hazards[i].domainId === 'hot_work') hazards.splice(i, 1);
    }

    // Preserve an independently evidenced welding-fume exposure finding only when an
    // active welding/cutting/brazing process co-occurs with explicit fume/breathing-zone
    // or fume-capture-failure evidence. Bare welding/cutting alone (no fume evidence) and
    // grinding/dust language alone (no welding/cutting/brazing verb) remain hot_work only.
    const weldingFumeProcessSignal = !hotWorkNegated && /\b(?:weld(?:ing)?|cut(?:ting)?|torch|braz(?:ing)?)\b/i.test(observationText);
    const weldingFumeUncertain = /\b(?:unknown|unclear|not\s+known|uncertain|undetermined)\b/i.test(observationText);
    const weldingFumeEvidence = /\bfumes?\b/i.test(observationText) && (
      /\bbreathing[- ]zone\b/i.test(observationText) ||
      /\b(?:without|lack(?:ing)?|no|ineffective|absent|disconnected|inoperative|failed)\b[^.]{0,40}\b(?:fume\s+capture|local\s+exhaust|fume\s+extraction)\b/i.test(observationText)
    );
    if (weldingFumeProcessSignal && weldingFumeEvidence && !weldingFumeUncertain && !hazards.some(hazard => hazard.domainId === 'welding_fumes')) {
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'welding_fumes',
        hazardFamily: 'welding_fumes',
        mechanism: 'welding_fumes',
        observationFragment: this.relevantSentenceFragment(observationText, /\b(?:weld(?:ing)?|cut(?:ting)?|torch|braz(?:ing)?|fumes?|breathing[- ]zone|fume\s+capture|local\s+exhaust)\b/i),
        supportingSignals: ['active welding/cutting/brazing process', 'explicit fume/breathing-zone or fume-capture-failure evidence'],
        confidence: 0.6,
        possibleOverlapWith: ['hot_work'],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm fume capture/local exhaust operability and breathing-zone exposure duration.'],
        reviewerQuestions: ['Is welding-fume capture or local exhaust operating and effective for this task?'],
      });
      routingNotes.push('Preserved independently evidenced welding-fume exposure alongside adjacent hazards.');
    }

    // Preserve an independently evidenced ventilation/air-quality deficiency finding
    // only when explicit ventilation/exhaust-failure or stagnant-contaminated-air
    // evidence exists. Generic indoor work, odor, dust, discomfort, or the mere
    // presence of a chemical does not qualify.
    const ventilationFailureEvidence =
      /\b(?:disconnected|inoperative|failed|broken|non[- ]?functioning|not\s+working|malfunctioning)\b[^.]{0,40}\b(?:exhaust|ventilation|fan|airflow)\b/i.test(observationText) ||
      /\b(?:exhaust|ventilation|fan)\b[^.]{0,40}\b(?:disconnected|inoperative|failed|broken|non[- ]?functioning|not\s+working|malfunctioning|off)\b/i.test(observationText) ||
      /\bstagnant\b[^.]{0,40}\b(?:contaminated\s+)?air\b/i.test(observationText) ||
      /\bineffective\b[^.]{0,40}\b(?:exhaust|ventilation|capture)\b/i.test(observationText);
    const ventilationUncertain = /\b(?:not\s+observable|unknown|unclear|not\s+known|uncertain|undetermined)\b/i.test(observationText);
    if (ventilationFailureEvidence && !ventilationUncertain && !hazards.some(hazard => hazard.domainId === 'ventilation_air_quality')) {
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'ventilation_air_quality',
        hazardFamily: 'ventilation_air_quality',
        mechanism: 'ventilation_air_quality',
        observationFragment: this.relevantSentenceFragment(observationText, /\b(?:exhaust|ventilation|fan|airflow|stagnant|air)\b/i),
        supportingSignals: ['explicit ventilation/exhaust failure or stagnant contaminated air evidence'],
        confidence: 0.6,
        possibleOverlapWith: ['hot_work', 'welding_fumes', 'hazcom'],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm ventilation/exhaust repair status and current air quality.'],
        reviewerQuestions: ['Is ventilation or local exhaust repaired and verified to control workplace air quality?'],
      });
      routingNotes.push('Preserved independently evidenced ventilation/air-quality deficiency alongside adjacent hazards.');
    }

    // Preserve a fire/explosion finding only when a flammable/combustible
    // material or atmosphere is locally paired with a credible ignition
    // source. Hot work and combustible dust remain distinct sibling findings.
    const addFireExplosionFinding = (fragment: string, explicitState?: HazardDecomposition['conditionState']) => {
      const material = /\b(?:flammable|combustible|explosive|fuel|gasoline|solvent|vapor|vapour|gas\s+leak|dust\s+cloud|flammable\s+liquid|fuel\s+vapor)\b/i.test(fragment);
      const ignition = /\b(?:open[- ]?flame|flame|spark(?:s|ing)?|ignition|hot\s+surface|active\s+heater|weld(?:ing)?|torch|grind(?:ing)?|electrical\s+spark(?:s)?|energized\s+ignition|arc)\b/i.test(fragment);
      const safe = /\b(?:isolated|ventilation\s+(?:cleared|verified)|atmosphere\s+(?:cleared|verified\s+safe)|ignition\s+sources?\s+removed|combustibles?\s+(?:removed|protected)|fire\s+watch\s+established|area\s+verified\s+safe|approved\s+closed\s+cabinet|(?:ignition|flammable)\s+condition\s+is\s+removed\s+and\s+verified)\b/i.test(fragment) ||
        /\b(?:ignition|flammable)\s+condition\s+is\s+removed\b/i.test(fragment) && /\bverified\b/i.test(originalObservation);
      const negated = /\b(?:no|not|without)\b[^.]{0,100}\b(?:flammable|combustible|explosive|release|leak|vapor|vapour|ignition|spark|flame)\b/i.test(fragment) ||
        /\b(?:nonflammable|non-combustible|water\s+vapor|water\s+vapour|historical\s+fire)\b/i.test(fragment);
      const unknownCondition = /\b(?:unknown|unclear|not\s+known|not\s+established|does\s+not\s+establish)\b/i.test(fragment);
      if (!material || !ignition || safe || negated || unknownCondition) return;
      if (hazards.some(h => h.domainId === 'fire_explosion' && h.observationFragment === fragment)) return;
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'fire_explosion',
        hazardFamily: 'fire_explosion',
        mechanism: 'flammable/combustible material with ignition source',
        observationFragment: fragment,
        supportingSignals: ['flammable or combustible material/atmosphere', 'credible ignition source'],
        confidence: 0.9,
        possibleOverlapWith: ['hot_work', 'combustible_dust'],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm material identity, concentration/release boundary, ignition source, and immediate controls.'],
        reviewerQuestions: ['Is the flammable or combustible material currently within the ignition source exposure boundary?'],
        ...(explicitState ? { conditionState: explicitState, temporalEvidence: [explicitState.toLowerCase()] } : this.inferConditionState(fragment, originalObservation, 'fire_explosion')),
      });
      routingNotes.push(`Preserved finding-local fire/explosion condition from "${fragment}"`);
    };
    const historicalFire = /\b(?:yesterday|historical|prior|previous|earlier)\b/i.test(observationText) && /\b(?:repaired|isolated|cleared|resolved|corrected|removed)\b/i.test(observationText);
    const plannedFire = /\b(?:planned|scheduled|tomorrow|future|next\s+shift)\b/i.test(observationText) && !/\b(?:currently|now|today|active)\b/i.test(observationText);
    fragments.forEach(fragment => addFireExplosionFinding(fragment, historicalFire ? 'HISTORICAL' : plannedFire ? 'PLANNED_FUTURE' : undefined));
    if (!hazards.some(h => h.domainId === 'fire_explosion')) addFireExplosionFinding(observationText, historicalFire ? 'HISTORICAL' : plannedFire ? 'PLANNED_FUTURE' : undefined);
    // Preserve combustible-dust evidence at the finding-local clause. Require
    // both a combustible particulate identity/process and an unsafe dust state;
    // ordinary or respirable dust, safe housekeeping, and unrelated ignition
    // evidence do not qualify.
    const dustClauses = observationText.split(/[.!]/).map(clause => clause.trim()).filter(Boolean);
    for (const clause of dustClauses) {
      const combustibleParticulate =
        /\bcombustible\s+(?:dust|powder|particulate|cloud)\b/i.test(clause) ||
        /\b(?:combustible|explosive)\b[^.]{0,80}\b(?:dust[- ]generating\s+(?:process|operation)|dust|powder|particulate|cloud)\b/i.test(clause) ||
        /\b(?:dust[- ]generating\s+(?:process|operation)|dust|powder|particulate)\b[^.]{0,80}\b(?:combustible|explosive)\b/i.test(clause);
      const unsafeDustState = /\b(?:accumulat(?:e|es|ed|ing|ion)|layer|cloud|suspend(?:ed|ing)|suspension|dispers(?:e|ed|ion)|confined|explosive|dust\s+hazard|lacks?\s+(?:effective\s+)?controls?|without\s+(?:effective\s+)?controls?)\b/i.test(clause);
      const safeOrNegated =
        /\b(?:noncombustible|non-combustible|demonstrated\s+noncombustible|no\s+particulate\s+(?:accumulation|suspension)|accumulation\s+(?:is\s+)?removed|dust\s+(?:is\s+)?removed|housekeeping\s+(?:is\s+)?verified|ignition\s+controls?\s+(?:are\s+)?verified|controls?\s+(?:are\s+)?effective|clean\s+process)\b/i.test(clause) ||
        /\b(?:unknown|unclear|not\s+known)\b[^.]{0,60}\b(?:dust\s+identity|combustibility|accumulation|suspension)\b/i.test(clause);
      if (!combustibleParticulate || !unsafeDustState || safeOrNegated) continue;
      if (hazards.some(hazard => hazard.domainId === 'combustible_dust' && hazard.observationFragment === clause)) continue;
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'combustible_dust',
        hazardFamily: 'combustible_dust',
        mechanism: 'combustible particulate accumulation/cloud',
        observationFragment: clause,
        supportingSignals: ['combustible particulate identity or process', 'unsafe dust accumulation, suspension, or control condition'],
        confidence: 0.82,
        possibleOverlapWith: ['fire_explosion'],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm dust composition, concentration, ignition controls, and housekeeping.'],
        reviewerQuestions: ['Is the dust combustible and currently suspended or accumulated at an explosion-hazard level?'],
        ...this.inferConditionState(clause, originalObservation, 'combustible_dust'),
      });
      routingNotes.push(`Preserved finding-local combustible-dust condition from "${clause}"`);
    }

    // Promote occupational noise only when the same local clause establishes
    // both a meaningfully hazardous noise condition and employee exposure.
    // Hearing protection is a control layer and does not erase an otherwise
    // explicit exposure; generic machinery/noise or PPE mentions do not qualify.
    const noiseClauses = observationText.split(/[.!]/).map(clause => clause.trim()).filter(Boolean);
    for (const clause of noiseClauses) {
      const measuredNoise = clause.match(/\b(\d+(?:\.\d+)?)\s*(?:dba|decibels?|db)\b/i);
      const hazardousNoise =
        /\b(?:clearly\s+)?(?:excessive|hazardous)\s+(?:(?:occupational|machine|equipment|process)\s+)?noise\b/i.test(clause) ||
        /\b(?:high|elevated)\s+(?:occupational\s+)?noise(?:\s+levels?)?\b/i.test(clause) ||
        /\b(?:sustained|continuous|prolonged)\s+(?:loud|high[- ]noise|noisy)\s+(?:equipment|machine|machinery|process|task|operation|work)\b/i.test(clause) ||
        /\bnoisy\s+(?:equipment|machine|machinery|process|task|operation)\b[^.]{0,80}\b(?:sustained|continuous|prolonged)\s+exposure\b/i.test(clause) ||
        /\bnoise\b[^.]{0,80}\b(?:unable\s+to\s+(?:communicate|hear)|cannot\s+(?:communicate|hear)|warning\s+signals?\s+(?:cannot|can't)\s+be\s+heard)\b/i.test(clause) ||
        (measuredNoise !== null && Number(measuredNoise[1]) >= 85);
      const employeeExposure =
        /\b(?:worker|workers|employee|employees|operator|operators|crew|personnel|miner|miners)\b[^.]{0,100}\b(?:operate|operates|operating|work|works|working|exposed|exposure|beside|near|within|subjected)\b/i.test(clause) ||
        /\b(?:operate|operates|operating|work|works|working|exposed|exposure|beside|near|within|subjected)\b[^.]{0,100}\b(?:worker|workers|employee|employees|operator|operators|crew|personnel|miner|miners)\b/i.test(clause) ||
        /\b(?:sustained|continuous|prolonged|occupational|employee|worker)\s+(?:noise\s+)?exposure\b/i.test(clause);
      const unknownOrNegated =
        /\b(?:noise\s+(?:level|exposure)|employee\s+exposure|worker\s+exposure|exposure)\s+(?:is\s+)?(?:unknown|unclear|not\s+established|not\s+described)\b/i.test(clause) ||
        /\bno\s+(?:excessive|hazardous|high)\s+noise\b/i.test(clause) ||
        /\b(?:no|without)\s+(?:worker|employee|personnel|occupant)\s+exposure\b/i.test(clause);
      const engineeringSafe =
        /\b(?:engineering|acoustic|source)\s+controls?\b[^.]{0,100}\b(?:reduce|reduced|control|controlled|verified|establish|established)\b/i.test(clause) &&
        /\b(?:below\s+(?:hazardous|action)\s+(?:level|threshold)|exposure\s+verification|no\s+(?:worker|employee)\s+exposure|establish(?:es|ed)?\s+control)\b/i.test(clause);
      const historicalNoise = /\b(?:yesterday|historical|previously|prior|earlier)\b/i.test(clause) && /\b(?:reduced|corrected|resolved|controlled|isolated)\b/i.test(clause);
      const plannedNoise = /\b(?:planned|scheduled|tomorrow|future|next\s+shift)\b/i.test(clause) && !/\b(?:currently|now|today|active)\b/i.test(clause);
      if (!hazardousNoise || !employeeExposure || unknownOrNegated || (engineeringSafe && !historicalNoise)) continue;
      const existingNoise = hazards.find(hazard => hazard.domainId === 'noise_exposure' && hazard.observationFragment === clause);
      if (existingNoise) {
        if (historicalNoise) {
          existingNoise.conditionState = 'HISTORICAL';
          existingNoise.temporalEvidence = ['historical exposure corrected'];
        } else if (plannedNoise) {
          existingNoise.conditionState = 'PLANNED_FUTURE';
          existingNoise.temporalEvidence = ['planned future exposure'];
        }
        continue;
      }
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'noise_exposure',
        hazardFamily: 'noise_exposure',
        mechanism: 'occupational noise exposure with hearing-loss potential',
        observationFragment: clause,
        supportingSignals: ['hazardous or excessive occupational noise', 'employee exposure in the noise environment'],
        confidence: measuredNoise ? 0.9 : 0.82,
        possibleOverlapWith: ['personal_protective_equipment'],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm sound level or dose, exposure duration, engineering controls, and hearing-protection effectiveness.'],
        reviewerQuestions: ['What sound level, duration, worker exposure, and engineering or hearing-protection controls apply?'],
        ...(historicalNoise
          ? { conditionState: 'HISTORICAL' as const, temporalEvidence: ['historical exposure corrected'] }
          : plannedNoise
            ? { conditionState: 'PLANNED_FUTURE' as const, temporalEvidence: ['planned future exposure'] }
            : this.inferConditionState(clause, originalObservation, 'noise_exposure')),
      });
      routingNotes.push(`Preserved finding-local occupational noise exposure from "${clause}"`);
    }

    // Promote thermal stress only when a local clause establishes both an
    // occupational heat/cold hazard and worker exposure, symptoms, or a
    // sustained task. Weather, equipment temperature, PPE, and uncertainty
    // alone remain insufficient.
    const thermalClauses = observationText.split(/[.!]/).map(clause => clause.trim()).filter(Boolean);
    for (const clause of thermalClauses) {
      const workerExposure = /\b(?:worker|workers|employee|employees|crew|operator|operators|miner|miners)\b/i.test(clause) && /\b(?:work|works|working|perform|performs|during|exposed|exposure|remain|remains|show|shows|has|have)\b/i.test(clause);
      const heatCondition = /\b(?:heat[- ]?exhaustion|heat\s+(?:stress|illness|stroke)|(?:extreme|excessive|hazardous)\s+(?:(?:environmental|process|radiant)\s+)?heat|hazardous\s+extreme\s+heat|high[- ]temperature\s+(?:work|area|environment)|radiant\s+(?:process\s+)?heat|hot\s+(?:area|environment))\b/i.test(clause);
      const heatExposure = /\b(?:heavy|prolonged|sustained|continuous)\s+(?:work|task|exposure)\b/i.test(clause) || /\b(?:dizzy|confused|faint|heat[- ]?exhaustion\s+symptoms?|heat\s+symptoms?)\b/i.test(clause) || /\bwithout\s+(?:cooling|water|hydration|rest|shade)\b/i.test(clause);
      const coldCondition = /\b(?:cold\s+(?:stress|exposure)|extreme\s+cold|hazardous\s+(?:environmental\s+)?cold|freezing\s+(?:work|conditions?|area|environment)|refrigerated\s+area|wet\s+freezing\s+work|hypothermia|frostbite)\b/i.test(clause);
      const coldExposure = /\b(?:prolonged|sustained|continuous)\s+(?:work|task|exposure)\b/i.test(clause) || /\b(?:wet\s+clothing|numb\s+(?:hands|feet)|confusion|without\s+(?:warming\s+(?:breaks?|shelter)|shelter))\b/i.test(clause);
      const uncertain = /\b(?:unknown|unclear|may|might|not\s+established)\b/i.test(clause) && /\b(?:exposure|duration|condition|temperature|heat|cold)\b/i.test(clause);
      const negated = /\b(?:no|not|without)\s+(?:hazardous\s+)?(?:heat|cold|thermal)\s+exposure\b/i.test(clause) || /\bno\s+(?:worker|employee)\s+exposure\b/i.test(clause);
      const historical = /\b(?:yesterday|historical|previously|prior|earlier)\b/i.test(clause) && /\b(?:corrected|resolved|reduced|controlled|eliminated|before\s+today)\b/i.test(clause);
      const planned = /\b(?:planned|scheduled|tomorrow|future|next\s+shift)\b/i.test(clause) && !/\b(?:currently|now|today|active)\b/i.test(clause);
      const safeHeat = /\b(?:engineering\s+cooling|cooling|hydration|rest|shade|monitoring)\b/i.test(clause) && /\b(?:verified\s+(?:effective|control)|reduced\s+.*below\s+.*hazardous|no\s+symptoms)\b/i.test(clause) && !historical;
      const safeCold = /\b(?:heated\s+shelter|warming|dry\s+clothing|rotation)\b/i.test(clause) && /\b(?:verified\s+(?:effective|control)|eliminated\s+hazardous|no\s+symptoms)\b/i.test(clause) && !historical;
      const addThermal = (family: 'heat_stress' | 'cold_stress', mechanism: string) => {
        const existing = hazards.find(hazard => hazard.domainId === family && hazard.observationFragment === clause);
        const state = historical ? 'HISTORICAL' as const : planned ? 'PLANNED_FUTURE' as const : undefined;
        if (existing) {
          if (state) { existing.conditionState = state; existing.temporalEvidence = [state.toLowerCase()]; }
          return;
        }
        hazards.push({hazardId:`haz-${hazards.length+1}`,domainId:family,hazardFamily:family,mechanism,observationFragment:clause,supportingSignals:['explicit hazardous thermal condition','worker exposure, sustained task, or thermal symptoms'],confidence:0.84,possibleOverlapWith:['personal_protective_equipment'],requiresHumanReview:true,evidenceGaps:['Confirm environmental conditions, workload, duration, controls, and worker symptoms.'],reviewerQuestions:['What thermal conditions, exposure duration, workload, controls, and worker effects apply?'],...(state?{conditionState:state,temporalEvidence:[state.toLowerCase()]}:this.inferConditionState(clause,originalObservation,family))});
      };
      if (!uncertain && !negated && workerExposure && heatCondition && (heatExposure || historical || planned) && !safeHeat) addThermal('heat_stress','occupational heat exposure with heat-illness potential');
      if (!uncertain && !negated && workerExposure && coldCondition && coldExposure && !safeCold) addThermal('cold_stress','occupational cold exposure with cold-injury potential');
    }

    // Promote unsafe stored/stacked material only when the same local clause
    // establishes both a storage/handling subject and a concrete instability,
    // restraint, rack, or falling-material defect. A pallet, rack, forklift,
    // crane, or suspended load mention alone is not a storage deficiency.
    const storageClauses = observationText.split(/[.!]/).map(clause => clause.trim()).filter(Boolean);
    for (const clause of storageClauses) {
      const storageSubject = /\b(?:pallet\s+stack|pallets?|stack(?:ed|ing)?\s+(?:lumber|boxes?|materials?)|lumber\s+(?:is\s+)?stacked|boxes?\s+(?:are\s+)?stacked|stored\s+(?:pipe|material)|storage\s+rack|stored\s+stack|material[- ]storage|storage\s+system|rack(?:ed|ing)?\s+material|rack\b[^.]{0,50}\b(?:damaged|overloaded|unstable|collapse)|rack\s+(?:is\s+)?(?:visibly\s+)?(?:damaged|overloaded|unstable|collapsing))\b/i.test(clause);
      const unsafeStorage = /\b(?:leaning|unstable|stacked\s+unevenly|unevenly\s+stacked|unsecured|not\s+(?:chocked|restrained|secured)|damaged\s+(?:storage\s+)?rack|rack\s+(?:is\s+)?(?:damaged|overloaded)|overloaded|shifting|collapse|could\s+fall|can\s+(?:fall|roll)|falling[- ]material|falling\s+material|unsafe\s+stack(?:ing)?|above\s+(?:a\s+)?safe\s+stable\s+configuration)\b/i.test(clause);
      const correctedStorage = /\b(?:previously|yesterday|prior|was)\b/i.test(clause) && /\b(?:restacked|secured|corrected|repaired|unloaded)\b/i.test(clause) && /\b(?:verified\s+stable|inspected|before\s+today|safe\s+service)\b/i.test(clause);
      const plannedStorage = /\b(?:material[- ]storage|storage\s+setup|storage\s+rack\s+installation)\b/i.test(clause) && /\b(?:planned|tomorrow|scheduled|has\s+not\s+yet\s+been\s+installed|not\s+yet\s+installed|has\s+not\s+begun)\b/i.test(clause);
      const safeStorage = /\b(?:stacked\s+evenly|properly\s+secured|stacked\s+securely|secured|intact\s+rated\s+rack|verified\s+stable|no\s+instability|designated\s+storage\s+area|stable\s+load|safe\s+storage\s+area)\b/i.test(clause) && !correctedStorage && !unsafeStorage;
      const unknownStorage = /\b(?:not\s+visible|not\s+established|unknown|unclear)\b/i.test(clause) && /\b(?:stability|securing|secured|condition)\b/i.test(clause);
      const negatedStorageDefect = /\b(?:not|no)\b[^.]{0,30}\b(?:damaged|overloaded|unstable|leaning|unsecured)\b/i.test(clause) && /\b(?:rack|stack|pallet|stored\s+material)\b/i.test(clause);
      const liftedOnly = /\b(?:suspended|being\s+lifted|crane\s+(?:lifts?|suspends?)|sling|rigging)\b/i.test(clause) && !/\b(?:adjacent|separate|stored\s+stack|storage\s+rack|pallet\s+stack)\b/i.test(clause);
      // correctedStorage's own regex only checks for generic "was...repaired...
      // verified...before today" temporal-correction language -- it has no
      // requirement that the clause is actually about stored/stacked material.
      // That generic phrasing is common across many unrelated hazard domains
      // (a repaired handrail, a repaired guard, a repaired panel), so without
      // also requiring storageSubject here, any historical-correction clause
      // was misrouted into material_handling_storage regardless of subject.
      if ((!storageSubject || !unsafeStorage) && !(correctedStorage && storageSubject) && !plannedStorage) continue;
      if (safeStorage || unknownStorage || negatedStorageDefect || liftedOnly) continue;
      if (hazards.some(hazard => hazard.domainId === 'material_handling_storage' && hazard.observationFragment === clause)) continue;
      const explicitState = plannedStorage ? 'PLANNED_FUTURE' : correctedStorage ? 'HISTORICAL' : undefined;
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'material_handling_storage',
        hazardFamily: 'material_handling_storage',
        mechanism: 'unstable stored or stacked material',
        observationFragment: clause,
        supportingSignals: [correctedStorage ? 'verified historical storage defect' : plannedStorage ? 'planned storage setup' : 'stored/stacked material', correctedStorage || plannedStorage ? explicitState!.toLowerCase() : 'concrete instability or restraint defect'],
        confidence: explicitState ? 0.75 : 0.88,
        possibleOverlapWith: ['cranes_hoists_rigging', 'suspended_loads', 'mobile_equipment'],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm the stack, rack, pallet, or stored material condition and the exposed aisle or work area.'],
        reviewerQuestions: ['Confirm material stability, restraint, storage-system condition, and exposure boundary.'],
        ...(explicitState ? {
          conditionState: explicitState,
          temporalEvidence: [explicitState.toLowerCase()],
          currentCondition: explicitState === 'HISTORICAL' ? 'The unsafe storage condition is described as corrected before the current observation.' : 'The storage setup is planned but has not been installed.',
          correctionStatus: explicitState === 'HISTORICAL' ? 'verified' : 'planned',
        } : this.inferConditionState(clause, originalObservation, 'material_handling_storage')),
      });
      routingNotes.push('Promoted finding-local stored/stacked material plus concrete instability evidence to material_handling_storage.');
    }

    // Promote a traffic-control finding only when a finding-local movement
    // interaction and a deficient traffic-control system are both evidenced.
    // Keep the control-system deficiency distinct from equipment condition and
    // powered-haulage movement, which may coexist as separate findings.
    const trafficClauses = observationText.split(/[.!]/).map(clause => clause.trim()).filter(Boolean);
    for (const clause of trafficClauses) {
      const interaction =
        /\b(?:vehicle|vehicles|forklift|forklifts|truck|trucks|haul\s+truck|haulage|mobile\s+equipment|back(?:s|ing)|moving\s+vehicles?)\b/i.test(clause) &&
        /\b(?:pedestrian|pedestrians|worker|workers|(?:occupied|active)\s+work\s+area|work\s+zone|travel\s+aisle|haul\s+route|pedestrian\s+route|intersection|crossing|route)\b/i.test(clause);
      const directTrafficOperation =
        /\b(?:workers?|pedestrians?)\s+(?:cross|share|use)\b[^.]{0,80}\b(?:haul\s+route|travel\s+aisle|route)\b/i.test(clause) ||
        /\b(?:traffic[- ]control|backing\s+hazard)\b/i.test(clause);
      // A traffic-management location (crossing, intersection, haul route/road,
      // pedestrian route) is itself vehicle/pedestrian traffic-interaction
      // evidence, even when the clause names no separate vehicle noun.
      const trafficLocationEvidence =
        /\b(?:crossing|intersection|haul\s+route|haul\s+road|pedestrian\s+route)\b/i.test(clause);
      const deficientControl =
        /\b(?:uncontrolled|no|without|missing|absent|lacks?|inadequate|ineffective)\b[^.]{0,120}\b(?:barrier|barriers|separation|walkway|traffic[- ]control|spotter|backing\s+control|signs?|signals?|right[- ]of[- ]way|controlled\s+crossing|barricades?|cones?|channelization|exclusion[- ]zone)\b/i.test(clause) ||
        /\b(?:uncontrolled)\s+(?:pedestrian\s+)?route\b/i.test(clause) ||
        /\b(?:blind\s+intersection)\b[^.]{0,100}\b(?:no|without|missing)\b[^.]{0,60}\b(?:signal|right[- ]of[- ]way|control)\b/i.test(clause);
      const correctedTrafficControl =
        /\b(?:previously|yesterday|prior|historical|was\s+corrected)\b/i.test(clause) && (
          /\b(?:now\s+has|installed|implement(?:ed|ing)|corrected)\b[^.]{0,120}\b(?:barriers?|designated\s+walkways?|spotter|exclusion[- ]zone|controlled\s+crossing|traffic[- ]control)\b/i.test(clause) ||
          /\b(?:barriers?|designated\s+walkways?|spotter|exclusion[- ]zone|controlled\s+crossing|traffic[- ]control)\b[^.]{0,120}\b(?:installed|implemented|corrected|verified\s+effective)\b/i.test(clause)
        );
      const plannedTrafficControl =
        /\b(?:traffic[- ]control|work\s+zone)\b/i.test(clause) &&
        /\b(?:tomorrow|planned|scheduled|has\s+not\s+begun|not\s+begun)\b/i.test(clause) &&
        /\b(?:vehicle\s+movement|traffic|work\s+zone)\b/i.test(clause);
      const controlsUnknown = /\b(?:does\s+not\s+establish|unknown|unclear|not\s+known)\b[^.]{0,100}\b(?:separation|signals?|controls?)\b/i.test(clause);
      const currentlyControlled =
        /\b(?:marked|designated|controlled|properly\s+separated|well[- ]controlled|adequate|effective)\b[^.]{0,120}\b(?:lane|route|barriers?|separation|walkways?|spotter|exclusion[- ]zone|signage|crossing|traffic\s+system)\b/i.test(clause) &&
        !deficientControl && !correctedTrafficControl;
      const markedPedestrianRouteWithoutSystemFailure =
        /\bmarked\s+pedestrian\s+(?:aisle|lane|route|walkway)\b/i.test(clause) &&
        !/\b(?:unmarked|no\s+marked|without\s+(?:a\s+)?marked|traffic[- ]control\s+system\s+(?:is\s+)?(?:absent|missing|ineffective)|uncontrolled\s+route)\b/i.test(clause);
      const inactiveEquipment = /\b(?:parked|isolated|not\s+interacting|not\s+operating|out\s+of\s+service)\b/i.test(clause);
      if ((!((interaction || directTrafficOperation || trafficLocationEvidence) && deficientControl) && !correctedTrafficControl && !plannedTrafficControl) || controlsUnknown || currentlyControlled || markedPedestrianRouteWithoutSystemFailure || inactiveEquipment) continue;
      if (hazards.some(hazard => hazard.domainId === 'traffic_control' && hazard.observationFragment === clause)) continue;
      const explicitState = plannedTrafficControl ? 'PLANNED_FUTURE' : correctedTrafficControl ? 'HISTORICAL' : undefined;
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'traffic_control',
        hazardFamily: 'traffic_control',
        mechanism: 'traffic interaction control deficiency',
        observationFragment: clause,
        supportingSignals: ['movement interaction', correctedTrafficControl ? 'verified historical traffic-control deficiency' : plannedTrafficControl ? 'planned traffic-control operation' : 'absent or ineffective traffic control'],
        confidence: explicitState ? 0.75 : 0.85,
        possibleOverlapWith: ['mobile_equipment', 'powered_haulage'],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm route, movement, exposed persons, and the effectiveness of separation, signaling, or spotter controls.'],
        reviewerQuestions: ['Confirm the finding-local vehicle/pedestrian interaction and traffic-control deficiency.'],
        ...(explicitState ? {
          conditionState: explicitState,
          temporalEvidence: [explicitState.toLowerCase()],
          currentCondition: explicitState === 'HISTORICAL' ? 'The traffic-control deficiency is described as corrected before the current observation.' : 'Traffic movement or work-zone activity is planned but has not begun.',
          correctionStatus: explicitState === 'HISTORICAL' ? 'verified' : 'planned',
        } : this.inferConditionState(clause, originalObservation, 'traffic_control')),
      });
      routingNotes.push('Promoted finding-local traffic interaction plus control-deficiency evidence to traffic_control.');
    }

    // Promote powered_haulage independently of traffic_control: it requires
    // either explicit haulage/conveyor equipment moving without a safe/
    // controlled route, or explicit haulage equipment with an exposed moving
    // danger zone (e.g. a conveyor nip/pinch point). Generic vehicle/mobile-
    // equipment mentions and the literal phrase "powered haulage" alone are
    // not required or sufficient; stopped/guarded/parked/isolated/controlled
    // equipment, and unknown-exposure ambiguity, must not construct this.
    for (const clause of observationText.split(/[.!]/).map(value => value.trim()).filter(Boolean)) {
      const haulageEquipment = /\b(?:haul\s+trucks?|conveyors?|haulage\s+(?:system|equipment|truck)|mobile\s+haulage)\b/i.test(clause);
      const unsafeRoute = /\b(?:without|no|lacks?|missing|absent)\b[^.]{0,40}\b(?:safe|controlled|designated)\b[^.]{0,20}\b(?:haul\s+route|haul\s+road|route)\b/i.test(clause);
      const exposedDangerZone = /\b(?:exposed|unguarded|uncontrolled)\b[^.]{0,30}\b(?:moving|pinch|nip|danger)\s*(?:zone|point)?\b/i.test(clause);
      const safeState = /\b(?:stopped|guarded|inaccessible|parked|isolated|controlled)\b/i.test(clause);
      const uncertain = /\bunknown\b|\bunclear\b|\bcannot\s+(?:be\s+)?determine\b/i.test(clause);
      if (!haulageEquipment || (!unsafeRoute && !exposedDangerZone) || safeState || uncertain) continue;
      if (hazards.some(hazard => hazard.domainId === 'powered_haulage' && hazard.observationFragment === clause)) continue;
      hazards.push({hazardId:`haz-${hazards.length+1}`,domainId:'powered_haulage',hazardFamily:'powered_haulage',mechanism:'powered haulage movement without a safe route, or exposed haulage-equipment danger zone',observationFragment:clause,supportingSignals:['explicit haulage/conveyor equipment','unsafe route or exposed moving danger zone'],confidence:0.85,possibleOverlapWith:['traffic_control','mobile_equipment'],requiresHumanReview:true,evidenceGaps:['Confirm the powered-haulage equipment, route, operating state, and exposed persons.'],reviewerQuestions:['Confirm the powered-haulage movement and route conditions.'],conditionState:'ACTIVE' as const,temporalEvidence:[]});
      routingNotes.push('Promoted finding-local powered-haulage movement or exposed danger-zone evidence.');
    }

    // A haul route is a meaningful mobile-equipment/traffic context even when
    // the observation does not identify a vehicle, movement, or worker
    // exposure. Preserve it as an UNKNOWN review candidate rather than
    // inventing an active struck-by condition or dropping the context.
    const unresolvedHaulRouteContext =
      /\b(?:haul route|haul road)\b/i.test(observationText) &&
      !/\b(?:forklift|loader|haul truck|truck|vehicle|mobile equipment|backing|struck by|pedestrian)\b/i.test(observationText) &&
      !/\b(?:no traffic|no vehicle|route closed|not operating|parked|secured|out of service)\b/i.test(observationText);
    if (unresolvedHaulRouteContext && !hazards.some(hazard => hazard.domainId === 'mobile_equipment')) {
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'mobile_equipment',
        hazardFamily: 'mobile_equipment',
        mechanism: 'haul-route interaction',
        observationFragment: this.relevantSentenceFragment(observationText, /\b(?:haul\s+route|haul\s+road)\b/i),
        supportingSignals: ['haul route context'],
        confidence: 0.2,
        possibleOverlapWith: [],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm vehicle/equipment movement, pedestrian exposure, traffic controls, and governing jurisdiction.'],
        reviewerQuestions: ['What vehicles or mobile equipment use the haul route, and are workers or pedestrians exposed?'],
        conditionState: 'UNKNOWN',
        currentCondition: 'A haul-route context is present, but the equipment and exposure state are not established.',
        correctionStatus: 'not_stated',
      });
      routingNotes.push('Retained unresolved haul-route context as an UNKNOWN mobile-equipment review candidate.');
    }

    // Preserve a mobile-equipment operational safety defect as its own
    // finding, distinct from pedestrian-interaction mobile_equipment and from
    // generic/stationary machine_guarding. Requires both an explicit mobile
    // machine/equipment noun and an explicit disabling safety-defect phrase
    // tied to current operation; parked/isolated/segregated equipment and
    // unknown-interaction ambiguity must not construct this.
    for (const clause of observationText.split(/[.!]/).map(value => value.trim()).filter(Boolean)) {
      const mobileEquipmentNoun = /\b(?:mobile\s+(?:machine|equipment)|self[- ]propelled\s+(?:machine|equipment)|mobile\s+machinery)\b/i.test(clause);
      const disablingDefect = /\bdisabling\s+safety\s+defect\b|\bsafety[- ]critical\s+component\b[^.]{0,40}\b(?:defect|failure|failed)\b|\bfailed\b[^.]{0,20}\bsafety\s+control\b/i.test(clause);
      const operationalContext = /\bduring\s+operation\b|\bwhile\s+operating\b|\boperating\b|\bin\s+operation\b/i.test(clause);
      const safeState = /\bparked\b|\bisolated\b|\binaccessible\b|\bsegregated\b|\bnot\s+operating\b|\bout\s+of\s+service\b/i.test(clause);
      const uncertain = /\bunknown\b|\bunclear\b|\bcannot\s+(?:be\s+)?determine\b/i.test(clause);
      if (!mobileEquipmentNoun || !disablingDefect || !operationalContext || safeState || uncertain) continue;
      if (hazards.some(hazard => hazard.domainId === 'mobile_equipment' && hazard.observationFragment === clause)) continue;
      hazards.push({hazardId:`haz-${hazards.length+1}`,domainId:'mobile_equipment',hazardFamily:'mobile_equipment',mechanism:'mobile equipment operating with a disabling safety defect',observationFragment:clause,supportingSignals:['explicit mobile equipment/machine evidence','disabling safety-defect evidence during operation'],confidence:0.85,possibleOverlapWith:['machine_guarding','powered_haulage'],requiresHumanReview:true,evidenceGaps:['Confirm the specific safety-critical component, defect condition, and continued operation.'],reviewerQuestions:['What safety-critical component is defective, and is the equipment still operating?'],conditionState:'ACTIVE' as const,temporalEvidence:[]});
      routingNotes.push('Promoted finding-local mobile-equipment disabling safety-defect evidence.');
    }

    // Preserve an ergonomic-strain finding as its own canonical
    // decomposition family (bypassing the primary-classifier's internal
    // 'ergonomics' domain and its RC23 external-normalization boundary
    // entirely), distinct from generic material handling or lifting
    // mentions. Requires force/load evidence AND posture/body-mechanics
    // evidence AND repetition/duration evidence together in the same
    // clause; single light/neutral lifts, generic manual-work mentions,
    // unknown task demands, and verified/redesigned exposure removal must
    // not construct this.
    for (const clause of observationText.split(/[.!]/).map(value => value.trim()).filter(Boolean)) {
      const forceEvidence = /\b(?:heavy\s+(?:load|box|boxes|material|object)|forceful\s+(?:grip|exertion|force)|lifts?\s+heavy|heavy\s+lifting)\b/i.test(clause);
      const postureEvidence = /\b(?:twisting|bending|awkward\s+posture|bent\s+wrist|reaching|awkward\s+position)\b/i.test(clause);
      const repetitionEvidence = /\b(?:repeatedly|repetitive|throughout\s+the\s+shift|frequent(?:ly)?|sustained|continuous(?:ly)?)\b/i.test(clause);
      const uncertain = /\bunknown\b|\bunclear\b|\bcannot\s+(?:be\s+)?determine\b/i.test(clause);
      const safeState = /\bverified\b|\bredesign(?:ed)?\b|\bremoves?\s+the\s+exposure\b/i.test(clause);
      if (!forceEvidence || !postureEvidence || !repetitionEvidence || uncertain || safeState) continue;
      if (hazards.some(hazard => hazard.domainId === 'ergonomic_strain' && hazard.observationFragment === clause)) continue;
      hazards.push({hazardId:`haz-${hazards.length+1}`,domainId:'ergonomic_strain',hazardFamily:'ergonomic_strain',mechanism:'combined force, posture, and repetition ergonomic-strain exposure',observationFragment:clause,supportingSignals:['force/load evidence','posture/body-mechanics evidence','repetition/duration evidence'],confidence:0.85,possibleOverlapWith:['material_handling_storage','training_procedure_supervision'],requiresHumanReview:true,evidenceGaps:['Confirm load weight, posture/body mechanics, task frequency, and duration.'],reviewerQuestions:['What is the load, posture, and frequency/duration of this task?'],conditionState:'ACTIVE' as const,temporalEvidence:[]});
      routingNotes.push('Promoted finding-local combined force/posture/repetition ergonomic-strain evidence.');
    }

    // Preserve an emergency eyewash/shower deficiency only when the same
    // clause establishes both corrosive splash/contact applicability and an
    // absent, inaccessible, obstructed, or inoperable flushing resource.
    for (const clause of observationText.split(/[.!]/).map(value => value.trim()).filter(Boolean)) {
      const flushingEquipment = /\b(?:eye[- ]?wash|emergency\s+shower|safety\s+shower|drench(?:ing)?\s+(?:equipment|facility)|quick\s+drench(?:ing)?)\b/i.test(clause);
      const corrosiveApplicability = /\b(?:corrosive|caustic|acid|alkali)\b/i.test(clause) && /\b(?:use|using|handling|station|process|task|splash|contact|exposure|transfer|dispens|decant)\w*\b/i.test(clause);
      const accessDeficiency = /\b(?:absent|missing|unavailable|inaccessible|blocked|obstructed|inoperable|not\s+(?:accessible|available|functional|operable)|fails?\s+to\s+operate)\b/i.test(clause);
      const uncertain = /\b(?:unknown|unclear|cannot\s+(?:be\s+)?determine|not\s+known|whether|could\s+not\s+confirm)\b/i.test(clause);
      const adequate = /\b(?:accessible|available|functional|operable|unobstructed|tested|verified\s+operational|immediately\s+accessible)\b/i.test(clause) && !accessDeficiency;
      const negated = /\bno\s+(?:corrosive\s+(?:use|process|handling)|splash\s+exposure)|\bno\s+(?:eye[- ]?wash|emergency\s+shower|emergency\s+equipment)\s+deficien|\b(?:eye[- ]?wash|shower)\b[^.]{0,40}\b(?:is|was)\s+not\s+(?:blocked|obstructed|inaccessible|inoperable|missing)\b/i.test(clause);
      const planned = /\b(?:planned|scheduled|tomorrow|before\s+(?:the\s+)?(?:task|work|operation)|has\s+not\s+(?:begun|started))\b/i.test(clause) && !/\b(?:currently|now|active|underway)\b/i.test(clause);
      const historical = /\b(?:yesterday|previously|prior|earlier|historical)\b/i.test(clause) && /\b(?:now|subsequently|before\s+today)\b[^.]{0,80}\b(?:cleared|installed|repaired|restored|tested|verified|made\s+accessible)\b/i.test(clause);
      if (!flushingEquipment || !corrosiveApplicability || !accessDeficiency || uncertain || planned || negated || (adequate && !historical)) continue;
      if (hazards.some(hazard => hazard.domainId === 'emergency_equipment' && hazard.observationFragment === clause)) continue;
      hazards.push({hazardId:`haz-${hazards.length+1}`,domainId:'emergency_equipment',hazardFamily:'emergency_equipment',mechanism:'applicable emergency flushing equipment is unavailable or inaccessible',observationFragment:clause,supportingSignals:['corrosive splash/contact applicability','explicit eyewash or shower access/operability deficiency'],confidence:0.88,possibleOverlapWith:['chemical_inhalation_contact','chemical_transfer','personal_protective_equipment'],requiresHumanReview:true,evidenceGaps:['Confirm corrosive exposure potential, flushing-equipment location, access time, flow, inspection, and operability.'],reviewerQuestions:['Is emergency flushing equipment applicable to this corrosive task, immediately accessible, and operational?'],conditionState:historical?'HISTORICAL' as const:'ACTIVE' as const,temporalEvidence:historical?['prior flushing-equipment deficiency subsequently corrected']:[]});
      routingNotes.push('Promoted finding-local emergency eyewash/shower applicability deficiency.');
    }

    // Preserve an emergency alarm/extinguisher deficiency as its own
    // emergency_equipment finding, distinct from the eyewash/shower path
    // above and from generic fire/emergency wording. Only a required alarm
    // or extinguisher explicitly reported missing/absent/unavailable, with
    // the same clause establishing that the applicable need is confirmed,
    // qualifies; equipment described as present, or an unrelated ordinary
    // equipment defect, or unknown applicability, must not construct this.
    for (const clause of observationText.split(/[.!]/).map(value => value.trim()).filter(Boolean)) {
      const alarmExtinguisherItem = /\b(?:emergency\s+alarm|fire\s+alarm|alarm|extinguisher)\b/i.test(clause);
      const deficiency = /\b(?:required)\b[^.]{0,40}\b(?:emergency\s+alarm|fire\s+alarm|alarm|extinguisher)\b[^.]{0,30}\b(?:is|are)?\s*(?:missing|absent|unavailable)\b/i.test(clause);
      const applicabilityEstablished = /\b(?:process\s+context|process|task|application)\b[^.]{0,40}\b(?:establishes?|indicates?|requires?|confirms?)\b[^.]{0,20}\b(?:the\s+)?need\b/i.test(clause);
      const uncertain = /\b(?:unknown|unclear|cannot\s+(?:be\s+)?determine|not\s+known)\b/i.test(clause);
      const adequate = /\b(?:present|accessible|available|inspected|verified)\b/i.test(clause);
      if (!alarmExtinguisherItem || !deficiency || !applicabilityEstablished || uncertain || adequate) continue;
      if (hazards.some(hazard => hazard.domainId === 'emergency_equipment' && hazard.observationFragment === clause)) continue;
      hazards.push({hazardId:`haz-${hazards.length+1}`,domainId:'emergency_equipment',hazardFamily:'emergency_equipment',mechanism:'required emergency alarm or extinguisher is missing where applicability is established',observationFragment:clause,supportingSignals:['required alarm/extinguisher explicitly missing','applicable need confirmed by process context'],confidence:0.87,possibleOverlapWith:['fire_explosion','emergency_egress'],requiresHumanReview:true,evidenceGaps:['Confirm the applicable emergency-equipment requirement, equipment location, inspection status, and access.'],reviewerQuestions:['Is the required emergency alarm or extinguisher present, accessible, and inspected for this task?'],conditionState:'ACTIVE' as const,temporalEvidence:[]});
      routingNotes.push('Promoted finding-local required emergency alarm/extinguisher deficiency.');
    }

    // Preserve a task-required PPE deficiency only when the same clause
    // establishes both an explicit affected task/exposure and required
    // protective equipment that is absent, missing, damaged, or not used.
    for (const clause of observationText.split(/[.!]/).map(value => value.trim()).filter(Boolean)) {
      // Field notes coordinate the two protections ("no eye or face protection"),
      // which the fixed "eye/face protection" spelling could not match.
      const ppeItem = /\b(?:(?:eye|face)(?:\s*(?:,|\/|or|and)\s*(?:eye|face))?\s+protection|face\s+shield|safety\s+glasses|goggles|gloves?|hearing\s+protection|earplugs?|earmuffs?|protective\s+clothing|hard\s+hat|helmet|fall\s+arrest|harness)\b/i.test(clause);
      const requiredDeficiency = /\b(?:without|required)\b[^.]{0,70}\b(?:eye(?:\/face)?\s+protection|face\s+shield|safety\s+glasses|goggles|gloves?|hearing\s+protection|earplugs?|earmuffs?|protective\s+clothing|hard\s+hat|helmet|fall\s+arrest|harness)\b[^.]{0,50}\b(?:absent|missing|not\s+(?:provided|worn|used|available)|damaged|defective)?|\b(?:required\s+)?(?:(?:eye|face)(?:\s*(?:,|\/|or|and)\s*(?:eye|face))?\s+protection|face\s+shield|safety\s+glasses|goggles|gloves?|hearing\s+protection|earplugs?|earmuffs?|protective\s+clothing|hard\s+hat|helmet|fall\s+arrest|harness)\b[^.]{0,45}\b(?:absent|missing|not\s+(?:provided|worn|used|available)|damaged|defective)\b|\b(?:no|not|never|neither|nor|without)\b[^.]{0,45}\b(?:(?:eye|face)(?:\s*(?:,|\/|or|and)\s*(?:eye|face))?\s+protection|face\s+shield|safety\s+glasses|goggles|gloves?|hearing\s+protection|earplugs?|earmuffs?|protective\s+clothing|hard\s+hat|helmet|fall\s+arrest|harness)\b/i.test(clause);
      const taskExposure = /\b(?:worker|workers|employee|operator|task|work|operation|handling|contact|splash|chemical|cutting|grinding|welding|noise|fall\s+exposure|overhead)\b/i.test(clause) && /\b(?:exposure|exposed|splash|contact|task|work|operation|operat(?:ed|ing)|handling|during|while|faces?|grind(?:s|ing)?|cut(?:s|ting)?|weld(?:s|ing)?)\b/i.test(clause);
      const uncertain = /\b(?:unknown|unclear|cannot\s+(?:be\s+)?determine|not\s+known|whether|records?\s+unavailable)\b/i.test(clause);
      const planned = /\b(?:scheduled|planned|tomorrow|before\s+(?:the\s+)?(?:task|work)|has\s+not\s+(?:begun|started)|not\s+yet\s+assigned)\b/i.test(clause) && !/\b(?:currently|now|continues?|underway)\b/i.test(clause);
      const adequate = /\b(?:required|appropriate)\b[^.]{0,50}\b(?:protection|ppe|gloves?|goggles|face\s+shield|hearing\s+protection|harness)\b[^.]{0,60}\b(?:is|are|was|were)?\s*(?:provided|available|worn|used|intact|verified|effective)|\b(?:wearing|using)\b[^.]{0,40}\b(?:required|appropriate)\b[^.]{0,40}\b(?:ppe|protection|gloves?|goggles|face\s+shield|harness)\b/i.test(clause);
      const negated = /\bno\s+(?:ppe|personal\s+protective\s+equipment)\s+deficien|\b(?:protection|ppe|gloves?|goggles|face\s+shield|harness)\b[^.]{0,35}\b(?:is|was|were)\s+not\s+(?:missing|absent|damaged|deficient)\b/i.test(clause);
      const historical = /\b(?:yesterday|previously|prior|earlier|historical)\b/i.test(clause) && /\b(?:now|subsequently|before\s+today)\b[^.]{0,80}\b(?:provided|replaced|issued|verified|corrected)\b/i.test(clause);
      if (!ppeItem || !requiredDeficiency || !taskExposure || uncertain || planned || negated || (adequate && !historical)) continue;
      if (hazards.some(hazard => hazard.domainId === 'personal_protective_equipment' && hazard.observationFragment === clause)) continue;
      hazards.push({hazardId:`haz-${hazards.length+1}`,domainId:'personal_protective_equipment',hazardFamily:'personal_protective_equipment',mechanism:'required task-specific PPE absent, damaged, or not used',observationFragment:clause,supportingSignals:['explicit required PPE deficiency','finding-local task or exposure'],confidence:0.86,possibleOverlapWith:['chemical_inhalation_contact','noise_exposure','fall_protection','hot_work'],requiresHumanReview:true,evidenceGaps:['Confirm task hazard, PPE requirement, equipment condition, availability, and use.'],reviewerQuestions:['Which PPE is required for this task, and is it available, serviceable, and correctly used?'],conditionState:historical?'HISTORICAL' as const:'ACTIVE' as const,temporalEvidence:historical?['prior PPE deficiency subsequently corrected']:[]});
      routingNotes.push('Promoted finding-local task-required PPE deficiency.');
    }

    // Preserve an atmospheric-hazard finding when the observation names a specific
    // atmospheric hazard and states that the required atmospheric evaluation was
    // not performed. The base router carries only the single entity word "gas" for
    // this family, so "the atmosphere had not been tested for oxygen deficiency or
    // hydrogen sulphide before entry" produced no candidate at all -- the omitted
    // test IS the hazard, and it is the one that kills entrants. An atmosphere that
    // was tested, or a stated result, does not qualify.
    for (const clause of observationText.split(/[.!]/).map(value => value.trim()).filter(Boolean)) {
      const atmosphericSubject = /\b(?:atmosphere|atmospheric|oxygen(?:\s+deficien\w*)?|o2\b|hydrogen\s+sulph?ide|h2s|carbon\s+monoxide|carbon\s+dioxide|methane|toxic\s+(?:gas|atmosphere|vapou?r)|flammable\s+(?:gas|atmosphere|vapou?r)|lower\s+explosive\s+limit|\blel\b|air\s+quality)\b/i.test(clause);
      const evaluationOmitted =
        /\b(?:no|not|never|without)\b[^.]{0,45}\b(?:test(?:ed|ing|s)?|monitor(?:ed|ing|s)?|sampl(?:e|ed|ing)|measur(?:e|ed|ement)|evaluat(?:e|ed|ion)|verif(?:y|ied|ication)|check(?:ed)?|reading)\b/i.test(clause) ||
        /\b(?:test(?:ing)?|monitor(?:ing)?|sampling|readings?)\b[^.]{0,45}\b(?:not\s+(?:performed|conducted|completed|done)|never\s+(?:performed|conducted|completed|done)|omitted)\b/i.test(clause);
      const evaluationSatisfied =
        /\b(?:atmosphere|air|oxygen|gas)\b[^.]{0,60}\b(?:was|were|been)\s+(?:tested|monitored|sampled|measured|verified)\b/i.test(clause) &&
        !/\b(?:no|not|never|without)\b[^.]{0,45}\b(?:tested|monitored|sampled|measured|verified)\b/i.test(clause);
      const atmosphericUncertain = /\b(?:unknown|unclear|cannot\s+(?:be\s+)?determine|not\s+known|undetermined)\b/i.test(clause);
      const atmosphericHistorical = /\b(?:yesterday|previously|prior|earlier|historical)\b/i.test(clause) &&
        /\b(?:now|subsequently|since)\b[^.]{0,80}\b(?:tested|monitored|verified|corrected)\b/i.test(clause);
      if (!atmosphericSubject || !evaluationOmitted || evaluationSatisfied || atmosphericUncertain) continue;
      if (hazards.some(hazard => hazard.domainId === 'atmospheric_hazard' && hazard.observationFragment === clause)) continue;
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'atmospheric_hazard',
        hazardFamily: 'atmospheric_hazard',
        mechanism: 'required atmospheric evaluation not performed for a named atmospheric hazard',
        observationFragment: clause,
        supportingSignals: ['named atmospheric hazard', 'required atmospheric test or monitoring stated as not performed'],
        confidence: 0.85,
        possibleOverlapWith: ['confined_space', 'ventilation_air_quality', 'respiratory_protection'],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm which atmospheric hazards apply, the instrument used, when the space was last tested, and continuous-monitoring status.'],
        reviewerQuestions: ['Was the atmosphere tested and continuously monitored for oxygen, flammable and toxic gases before and during entry?'],
        conditionState: atmosphericHistorical ? ('HISTORICAL' as const) : ('ACTIVE' as const),
        temporalEvidence: atmosphericHistorical ? ['prior untested atmosphere subsequently evaluated'] : [],
      });
      routingNotes.push('Promoted finding-local omitted atmospheric evaluation for a named atmospheric hazard.');
    }

    // Preserve a respiratory-protection deficiency as its own canonical family,
    // distinct from generic PPE, chemical exposure, or airborne-family findings.
    // Only an explicit respirator-specific deficiency (missing/damaged/not used)
    // qualifies; a respirator that is present and correctly functioning, or an
    // airborne hazard with no respirator evidence at all, must not construct this.
    for (const clause of observationText.split(/[.!]/).map(value => value.trim()).filter(Boolean)) {
      const respiratorItem = /\b(?:respirators?|respiratory[- ]protection|cartridge\s+respirator|full[- ]face\s+respirator|half[- ]mask\s+respirator|air[- ]purifying\s+respirator|papr)\b/i.test(clause);
      const respiratorDeficiency = /\b(?:without|required)\b[^.]{0,70}\b(?:respirators?|respiratory[- ]protection|cartridge\s+respirator)\b[^.]{0,50}\b(?:absent|missing|not\s+(?:provided|worn|used|available)|damaged|defective)?|\b(?:required\s+)?(?:cartridge\s+)?respirators?\b[^.]{0,45}\b(?:absent|missing|not\s+(?:provided|worn|used|available)|damaged|defective)\b|\b(?:no|not|never|neither|nor|without)\b[^.]{0,45}\b(?:respirators?|respiratory[- ]protection|cartridge\s+respirator|full[- ]face\s+respirator|half[- ]mask\s+respirator|air[- ]purifying\s+respirator|papr)\b/i.test(clause);
      const respiratorTaskExposure = /\b(?:worker|workers|employee|operator|task|work|operation|handling|contact|cutting|grinding|welding|exposure)\b/i.test(clause);
      const respiratorAdequate = /\brespirat(?:ory|or)\b/i.test(clause) && /\b(?:correctly\s+worn|functioning|properly\s+fitted|fit[- ]tested\s+and\s+(?:worn|functioning)|correctly\s+used|verified\s+effective)\b/i.test(clause);
      const respiratorUncertain = /\b(?:unknown|unclear|cannot\s+(?:be\s+)?determine|not\s+known|whether)\b/i.test(clause);
      const respiratorPlanned = /\b(?:scheduled|planned|tomorrow|before\s+(?:the\s+)?(?:task|work)|has\s+not\s+(?:begun|started))\b/i.test(clause) && !/\b(?:currently|now|continues?|underway)\b/i.test(clause);
      const respiratorHistorical = /\b(?:yesterday|previously|prior|earlier|historical)\b/i.test(clause) && /\b(?:now|subsequently|before\s+today)\b[^.]{0,80}\b(?:provided|replaced|issued|verified|corrected)\b/i.test(clause);
      if (!respiratorItem || !respiratorDeficiency || !respiratorTaskExposure || respiratorUncertain || respiratorPlanned || respiratorAdequate || (hazards.some(hazard => hazard.domainId === 'respiratory_protection' && hazard.observationFragment === clause))) continue;
      hazards.push({hazardId:`haz-${hazards.length+1}`,domainId:'respiratory_protection',hazardFamily:'respiratory_protection',mechanism:'required respiratory protection absent, damaged, or not used',observationFragment:clause,supportingSignals:['explicit required respirator deficiency','finding-local task or exposure'],confidence:0.86,possibleOverlapWith:['personal_protective_equipment','chemical_inhalation_contact','silica_respirable_dust'],requiresHumanReview:true,evidenceGaps:['Confirm task hazard, respirator requirement, fit-testing, and correct use.'],reviewerQuestions:['Is the required respiratory protection selected, fitted, functional, and correctly used for this task?'],conditionState:respiratorHistorical?'HISTORICAL' as const:'ACTIVE' as const,temporalEvidence:respiratorHistorical?['prior respirator deficiency subsequently corrected']:[]});
      routingNotes.push('Promoted finding-local required respiratory-protection deficiency.');
    }

    // Preserve a chemical inhalation/contact exposure as its own canonical
    // family, distinct from hazcom/labeling, chemical identity alone, or
    // generic chemical presence. Only an explicit inhalation, vapor/mist/fume,
    // or skin/eye splash-contact pathway affecting a specific person or body
    // part qualifies; sealed/contained chemicals with no exposure pathway, or
    // unknown chemical identity/route, must not construct this.
    for (const clause of observationText.split(/[.!]/).map(value => value.trim()).filter(Boolean)) {
      const chemicalAgent = /\b(?:chemical|solvent|acid|caustic|corrosive|toxic\s+(?:gas|liquid|substance)|hazardous\s+material)\b/i.test(clause);
      const exposurePathway = /\b(?:inhales?|inhalation|breathes?\s+in|vapor|mist|fume|splash(?:es|ed)?|contacts?|contact(?:ed|ing)?|expos(?:ed|ure))\b/i.test(clause);
      const personOrBodyTarget = /\b(?:worker|workers|employee|employees|operator|operators|technician|personnel|skin|eyes?)\b/i.test(clause);
      const noExposurePathway = /\b(?:sealed|contained|no\s+(?:employee\s+)?(?:exposure|contact\s+pathway)|removes?\s+the\s+current\s+exposure\s+pathway|separately\s+evaluated)\b/i.test(clause);
      const uncertain = /\bunknown\b|\bunclear\b|\bcannot\s+(?:be\s+)?determine\b|\bnot\s+known\b/i.test(clause);
      if (!chemicalAgent || !exposurePathway || !personOrBodyTarget || noExposurePathway || uncertain) continue;
      if (hazards.some(hazard => hazard.domainId === 'chemical_inhalation_contact' && hazard.observationFragment === clause)) continue;
      hazards.push({hazardId:`haz-${hazards.length+1}`,domainId:'chemical_inhalation_contact',hazardFamily:'chemical_inhalation_contact',mechanism:'chemical inhalation, vapor/mist/fume, or skin/eye contact exposure',observationFragment:clause,supportingSignals:['chemical/solvent agent evidence','explicit inhalation or skin/eye contact pathway'],confidence:0.85,possibleOverlapWith:['hazcom','respiratory_protection','ventilation_air_quality','personal_protective_equipment'],requiresHumanReview:true,evidenceGaps:['Confirm chemical identity, exposure pathway, duration, and control measures.'],reviewerQuestions:['What chemical is involved, what is the exposure pathway, and what controls are in place?'],conditionState:'ACTIVE' as const,temporalEvidence:[]});
      routingNotes.push('Promoted finding-local chemical inhalation/contact exposure.');
    }

    // Preserve a biological exposure as its own canonical family, distinct
    // from generic unsanitary/contamination language. Only an identified
    // biological agent or contaminated material (blood, body/bodily fluid,
    // sewage, mold, infectious waste, biohazard, pathogen, animal- or
    // vector-borne material) combined with a credible person exposure
    // pathway and an explicit control deficiency qualifies; unidentified
    // contamination, negated/absent exposure, or verified decontamination
    // must not construct this.
    for (const clause of observationText.split(/[.!]/).map(value => value.trim()).filter(Boolean)) {
      const bioAgent = /\b(?:blood|bloodborne|body[\s-]?fluid|bodily[\s-]?fluid|sewage|mold|infectious\s+waste|biohazard(?:ous)?|pathogen|contaminated[\s-]material|animal[\s-]borne|vector[\s-]borne)\b/i.test(clause);
      const exposureVerb = /\b(?:handles?|handling|cleans?|cleaning|contacts?|contacting|exposed\s+to)\b/i.test(clause);
      const controlDeficiency = /\bwithout\b[^.]{0,60}\b(?:containment|hygiene|controls?|ppe|protection|precautions?)\b/i.test(clause);
      const negatedExposure = /\bwithout\b[^.]{0,120}\bexposure\b/i.test(clause);
      const uncertain = /\bunknown\b|\bunclear\b|\bcannot\s+(?:be\s+)?determine\b|\bnot\s+known\b/i.test(clause);
      const safeState = /\bverified\b|\bdecontaminat\w*\b|\bremoval\s+of\s+exposure\b/i.test(clause);
      if (!bioAgent || !exposureVerb || !controlDeficiency || negatedExposure || uncertain || safeState) continue;
      if (hazards.some(hazard => hazard.domainId === 'biological_exposure' && hazard.observationFragment === clause)) continue;
      hazards.push({hazardId:`haz-${hazards.length+1}`,domainId:'biological_exposure',hazardFamily:'biological_exposure',mechanism:'biological agent or contaminated-material exposure without required controls',observationFragment:clause,supportingSignals:['identified biological agent or contaminated material','explicit person exposure pathway with control deficiency'],confidence:0.85,possibleOverlapWith:['environmental_spill','personal_protective_equipment'],requiresHumanReview:true,evidenceGaps:['Confirm biological agent identity, exposure pathway, containment, and hygiene controls.'],reviewerQuestions:['What biological agent or contaminated material is involved, and what containment or hygiene control is deficient?'],conditionState:'ACTIVE' as const,temporalEvidence:[]});
      routingNotes.push('Promoted finding-local biological exposure without required controls.');
    }

    // Preserve an illumination/visibility impairment as its own canonical
    // family, distinct from generic visual inspection, functioning lighting,
    // or unrelated obstruction/weather language. Only explicit inadequate
    // lighting, darkness, or glare that impairs seeing/visibility qualifies.
    for (const clause of observationText.split(/[.!]/).map(value => value.trim()).filter(Boolean)) {
      const directImpairment = /\b(?:too\s+dark|insufficient\s+(?:light|lighting|illumination)|inadequate\s+(?:light|lighting|illumination)|poor\s+(?:visibility|lighting)|dimly\s+lit|obscured\s+(?:sightline|view|visibility)|unable\s+to\s+see)\b/i.test(clause);
      const seeingPrevented = /\b(?:glare|darkness|shadows?)\b[^.]{0,60}\b(?:prevents?|prevented|blocks?|blocked|obscures?|obscured)\b[^.]{0,60}\b(?:see(?:ing)?|visibility|sightline)\b/i.test(clause);
      const uncertain = /\bunknown\b|\bunclear\b|\bcannot\s+(?:be\s+)?determine\w*\b|\bnot\s+known\b/i.test(clause);
      if ((!directImpairment && !seeingPrevented) || uncertain) continue;
      if (hazards.some(hazard => hazard.domainId === 'illumination_visibility' && hazard.observationFragment === clause)) continue;
      hazards.push({hazardId:`haz-${hazards.length+1}`,domainId:'illumination_visibility',hazardFamily:'illumination_visibility',mechanism:'inadequate lighting, darkness, or glare impairing visibility',observationFragment:clause,supportingSignals:['explicit lighting/visibility impairment evidence'],confidence:0.85,possibleOverlapWith:['traffic_control','mobile_equipment','walking_working_surfaces','slips_trips_falls_housekeeping'],requiresHumanReview:true,evidenceGaps:['Confirm lighting level, affected task/area, and duration of the visibility impairment.'],reviewerQuestions:['What lighting condition is impairing visibility, and for which task or area?'],conditionState:'ACTIVE' as const,temporalEvidence:[]});
      routingNotes.push('Promoted finding-local illumination/visibility impairment.');
    }

    // Preserve hazardous chemical-transfer operations only when the same
    // clause establishes both material movement/connection activity and a
    // concrete transfer-control or containment deficiency.
    for (const clause of observationText.split(/[.;!]/).map(value => value.trim()).filter(Boolean)) {
      const chemicalContext = /\b(?:chemical|solvent|acid|caustic|flammable\s+liquid|fuel|product|liquid|tanker|tote|drum|tank|vessel)\b/i.test(clause) || /\btransfer\b/i.test(clause);
      const transferActivity = /\b(?:transfer(?:ring|red|s)?|pump(?:ing|ed|s)?|unload(?:ing|ed|s)?|load(?:ing|ed|s)?|decant(?:ing|ed|s)?|dispens(?:ing|ed|es)?|drain(?:ing|ed|s)?|fill(?:ing|ed|s)?|empty(?:ing|ied|ies)?|connect(?:ing|ed|s)?|disconnect(?:ing|ed|s)?)\b/i.test(clause) && /\b(?:hose|line|connection|fitting|container|drum|tote|tank|vessel|tanker|chemical|solvent|acid|caustic|liquid|product)\b/i.test(clause);
      const transferHazard = /\b(?:open|uncontrolled|leak(?:s|ing|ed)?|damaged|incompatible|failed|loose|unsecured|missing|absent|without|no|required\s+containment\s+(?:is\s+)?absent|overfill|splash|release|ruptur(?:e|ed|ing)|not\s+(?:bonded|grounded|contained|secured))\b/i.test(clause) && /\b(?:hose|line|connection|fitting|transfer|decant|dispens|pump|fill|unload|load|containment|bonding|grounding|overfill|splash|release)\b/i.test(clause);
      const uncertain = /\b(?:unknown|unclear|cannot\s+(?:be\s+)?determine|not\s+known|whether|status\s+unknown|could\s+not\s+confirm)\b/i.test(clause);
      const planned = /\b(?:planned|scheduled|tomorrow|next\s+(?:shift|week)|has\s+not\s+(?:started|begun)|not\s+yet\s+started)\b/i.test(clause) && !transferHazard;
      const negatedHazard = /\bno\s+(?:chemical\s+)?transfer(?:\s+operation)?\s+(?:is\s+)?(?:occurring|underway|occurs?|described)|\bwith\s+no\s+transfer\s+(?:operation|underway)|\bwithout\s+(?:any\s+)?(?:chemical\s+)?transfer(?:\s+activity|\s+operation)?|\b(?:hose|connection|transfer)\b[^.]{0,50}\b(?:is|was|were)\s+not\s+(?:leaking|damaged|deficient|uncontrolled)|\bno\s+(?:leak|release|splash)\s+(?:occurred|exists?)\b|\bcontrols?\b[^.]{0,40}\b(?:adequate|effective|not\s+deficient)\b/i.test(clause);
      const safeTransfer = /\b(?:closed\s+transfer\s+system|verified\s+(?:sound|intact|compatible)|secondary\s+containment\s+(?:is\s+)?(?:present|effective)|bonding\s+and\s+grounding\s+(?:are\s+)?complete|completed\s+safely|without\s+(?:a\s+)?(?:leak|release)|automatic\s+shutoff\s+(?:is\s+)?functioning)\b/i.test(clause) && !/\b(?:but|however|yet|still|remains?)\b[^.]{0,80}\b(?:leak|release|splash|damaged|failed|uncontrolled)\b/i.test(clause);
      const historical = /\b(?:yesterday|previously|prior|earlier|historical)\b/i.test(clause) && /\b(?:repaired|replaced|corrected|verified|now\s+effective|before\s+today)\b/i.test(clause);
      if (!chemicalContext || !transferActivity || (!transferHazard && !historical && !planned) || uncertain || negatedHazard || (safeTransfer && !historical)) continue;
      if (hazards.some(hazard => hazard.domainId === 'chemical_transfer' && hazard.observationFragment === clause)) continue;
      const state = planned ? 'PLANNED_FUTURE' as const : historical ? 'HISTORICAL' as const : 'ACTIVE' as const;
      hazards.push({hazardId:`haz-${hazards.length+1}`,domainId:'chemical_transfer',hazardFamily:'chemical_transfer',mechanism:'hazardous chemical transfer or connection failure',observationFragment:clause,supportingSignals:['chemical/material transfer activity','transfer-related containment or control deficiency'],confidence:0.87,possibleOverlapWith:['chemical_release','chemical_inhalation_contact','fire_explosion','personal_protective_equipment'],requiresHumanReview:true,evidenceGaps:['Confirm substance, transfer path, connection integrity, containment, controls, and exposed persons.'],reviewerQuestions:['What material is being transferred, through what connection, and which transfer control is deficient?'],conditionState:state,temporalEvidence:state==='ACTIVE'?[]:[state.toLowerCase()]});
      routingNotes.push('Promoted finding-local hazardous chemical-transfer operation.');
    }

    // Preserve explicit chemical-release and powered-industrial-truck evidence
    // when a fragment is dominated by a generic floor, traffic, or housekeeping
    // route. These additions require a positive condition, not mere object
    // mentions, and therefore do not promote closed containers or parked trucks.
    const activeChemicalRelease =
      /\b(?:solvent|chemical|drum|container)\b[^.]{0,100}\b(?:actively\s+leak(?:ing)?|is\s+leak(?:ing)?|leak(?:ing)?\s+onto|spill(?:ed)?\s+(?:onto|on)|spill\s+observed|release\s+observed|uncontrolled\s+release)\b/i.test(observationText) &&
      !/\b(?:no|without|not|never|unknown)\s+(?:active\s+)?(?:leak|leakage|spill|release|release\s+status)\b/i.test(observationText) &&
      !/\b(?:release|leak|spill)\s+status\s+(?:is\s+)?unknown\b/i.test(observationText);
    if (activeChemicalRelease && !hazards.some(hazard => hazard.domainId === 'chemical_release')) {
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'chemical_release',
        hazardFamily: 'chemical_release',
        mechanism: 'release',
        observationFragment: this.relevantSentenceFragment(observationText, /\b(?:solvent|chemical|drum|container|leak(?:ing)?|spill(?:ed)?|release)\b/i),
        supportingSignals: ['positive chemical release evidence'],
        confidence: 0.65,
        possibleOverlapWith: [],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm substance identity, containment, pathway, and employee exposure.'],
        reviewerQuestions: ['Please confirm the active release and whether employees or drains are exposed.'],
      });
      routingNotes.push('Preserved independently evidenced active chemical release alongside adjacent walking-surface hazards.');
    }

    // A release involving a container whose label/SDS/identity is not stated
    // leaves a genuine hazard-communication applicability gap. Represent this
    // as a low-confidence review candidate rather than asserting a violation;
    // explicitly labeled/identified containers do not enter this branch.
    const chemicalIdentityUnconfirmed = activeChemicalRelease &&
      !/\b(?:labeled|labelled|label|sds|safety data|identified|known\s+(?:contents?|substance))\b/i.test(observationText);
    if (chemicalIdentityUnconfirmed && !hazards.some(hazard => hazard.domainId === 'hazcom')) {
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'hazcom',
        hazardFamily: 'hazard_communication',
        mechanism: 'identity',
        observationFragment: this.relevantSentenceFragment(observationText, /\b(?:solvent|chemical|drum|container|leak(?:ing)?|spill(?:ed)?|release|label(?:ed|led)?|sds|identif\w*)\b/i),
        supportingSignals: ['chemical identity/label evidence not established'],
        confidence: 0.2,
        possibleOverlapWith: ['chemical_release'],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm the substance identity, label, SDS, and employee hazard communication.'],
        reviewerQuestions: ['Please confirm the substance identity and label/SDS status before selecting a standard.'],
      });
      routingNotes.push('Retained a review-only hazard-communication candidate because chemical identity and labeling were not established.');
    }

    // An unlabeled or unknown-content container is a distinct hazard-communication
    // evidence gap even when no release is established. Keep it separate from
    // chemical-release reasoning so the engine does not invent an exposure event.
    const identityOrLabelGap =
      /\b(?:unlabeled|unlabelled|unknown\s+(?:contents?|identity|substance)|missing\s+(?:label|sds)|no\s+(?:label|sds))\b/i.test(observationText) &&
      /\b(?:container|drum|bottle|tote|chemical|solvent)\b/i.test(observationText);
    if (identityOrLabelGap && !hazards.some(hazard => hazard.domainId === 'hazcom')) {
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'hazcom',
        hazardFamily: 'hazard_communication',
        mechanism: 'label',
        observationFragment: this.relevantSentenceFragment(observationText, /\b(?:unlabeled|unlabelled|unknown|label|sds|container|drum|bottle|tote|chemical|solvent)\b/i),
        supportingSignals: ['unresolved identity or labeling evidence'],
        confidence: 0.55,
        possibleOverlapWith: [],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm container identity, label, safety data, and contents before handling.'],
        reviewerQuestions: ['Please confirm the substance identity and labeling/SDS status.'],
      });
      routingNotes.push('Preserved unresolved chemical identity or labeling evidence as a separate hazard-communication finding.');
    }

    // A powered-industrial-truck word used only to NAME A PLACE ("the forklift
    // charging room", "the forklift battery bay") or a person ("the loader
    // operator's break trailer") is a location or role descriptor, not evidence
    // that a truck is operating or defective. The truck must itself appear in
    // an operating, movement or defect context before this preservation path
    // manufactures a struck-by finding on top of the hazard actually observed.
    const poweredTruckOperationEvidence =
      /\b(?:operat(?:ing|es|ed|ion)|driv(?:e|es|en|ing)|travel\w*|revers\w*|backing|manoeuvr\w*|maneuver\w*|haul(?:ing|ed|s)?|load(?:ing|ed)?|carry\w*|rais(?:e|ed|ing)|lower\w*|struck|run\s+over|collid\w*|tip(?:ped|ping)?|overturn\w*|rollover|pedestrian|spotter|traffic|horn|alarm|seat\s?belt|brake|steering|mast|forks?|tine|blind\s+spot|speed|barricade|crossing|aisle|ramp|dock)\b/i.test(observationText);
    const explicitPoweredTruck = /\b(?:powered industrial truck|forklift)\b/i.test(observationText) &&
      poweredTruckOperationEvidence &&
      !/\b(?:parked|stored|secured|out of service|not operating)\b/i.test(observationText);
    if (explicitPoweredTruck && !hazards.some(hazard => hazard.domainId === 'powered_industrial_trucks')) {
      const poweredTruckFragment = fragments.find(fragment => /\b(?:powered industrial truck|forklift|haul truck)\b/i.test(fragment)) || observationText;
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'powered_industrial_trucks',
        hazardFamily: 'powered_industrial_trucks',
        mechanism: 'struck_by',
        observationFragment: poweredTruckFragment,
        supportingSignals: ['explicit powered industrial truck evidence'],
        confidence: 0.65,
        possibleOverlapWith: [],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm traffic controls, pedestrian separation, operator status, and equipment condition.'],
        reviewerQuestions: ['Please confirm the traffic-control and pedestrian-exposure conditions.'],
      });
      routingNotes.push('Preserved explicit powered-industrial-truck evidence alongside generic mobile-equipment routing.');
    }

    // Preserve excavation/trenching as its own finding whenever the local
    // fragment contains direct excavation evidence. An excavation may also
    // expose a fall edge, but fall protection must not replace the excavation
    // family or absorb its temporal state.
    for (const fragment of fragments) {
      // "shield" was previously accepted here as a bare excavation trigger, for
      // the trench-shield (trench-box) protective system. In field language a
      // bare shield is almost never that: a face shield, welding shield, splash
      // shield, arc-flash shield or heat shield is PPE or machine/thermal
      // guarding, and "shielding" is ordinarily a verb. The alias produced a
      // 0.85-confidence excavation finding on all of those -- scoring HIGHER
      // than a genuine unshored trench -- so the trigger now requires the
      // excavation sense to be stated. "shoring" is unaffected.
      if (!/\b(?:trench|excavat(?:ion|ing)|open\s+cut|spoil\s+(?:pile|at)|trench\s+wall|cave[- ]?in|shor(?:e|ing)|(?:trench|excavation)\s+shield(?:ing)?|shield\s+box|trench\s+(?:access|egress))\b/i.test(fragment)) continue;
      if (/\b(?:no|without|never)\s+(?:trench|excavat(?:ion|ing)|open\s+cut)\b/i.test(fragment)) continue;
      // A completed, backfilled or reinstated excavation is a closed condition,
      // not an active cave-in hazard.
      if (/\b(?:backfill\w*|paved\s+over|filled\s+in|reinstated|compacted\s+and|restored|closed\s+out)\b/i.test(fragment)) continue;
      if (hazards.some(hazard => hazard.domainId === 'excavation_trenching' && hazard.observationFragment === fragment)) continue;
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'excavation_trenching',
        hazardFamily: 'excavation_trenching',
        mechanism: 'excavation/trench condition',
        observationFragment: fragment,
        supportingSignals: ['direct excavation or trench evidence'],
        confidence: 0.85,
        possibleOverlapWith: ['fall_protection'],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm depth, soil/ground conditions, protective system, access/egress, and nearby loads.'],
        reviewerQuestions: ['Please confirm excavation depth, protective system, and access/egress conditions.'],
        ...this.inferConditionState(fragment, originalObservation, 'excavation_trenching'),
      });
      routingNotes.push('Preserved finding-local excavation/trenching evidence alongside any independent fall-edge finding.');
    }

    // Preserve independently stated fall/opening exposure when no excavation
    // is present or when the router initially assigns the fragment elsewhere.
    for (const fragment of fragments) {
      if (!/\b(?:floor\s+opening|open\s+edge|unguarded\s+opening|fall(?:ing)?\s+into|elevated\s+platform|platform\s+near\s+an\s+edge|fall\s+exposure)\b/i.test(fragment)) continue;
      if (/\b(?:no|without|never)\s+(?:fall\s+exposure|fall\s+hazard|person|worker|employee)\b/i.test(fragment)) continue;
      // The same opening/edge/platform this fragment names must not become an
      // ACTIVE deficiency when it is explicitly described as effectively
      // covered, guarded, secured, or otherwise protected.
      if (/\b(?:floor\s+opening|open\s+edge|unguarded\s+opening|elevated\s+platform|platform\s+near\s+an\s+edge|edge|platform|opening)\b[^.]{0,40}\b(?:covered|guarded|secured|protected|effective(?:ly)?)\b/i.test(fragment)) continue;
      // An opening described as fitted with a cover, lid, grating or plate that
      // is closed/latched/in place is protected. The clause above only matched
      // the participle "covered" within 40 characters, so ordinary phrasing
      // ("the floor opening was fitted with a hinged cover that was closed")
      // was read as an active fall exposure.
      if (/\b(?:opening|hole|edge|platform)\b[^.]{0,80}\b(?:cover|lid|grating|plate|guardrail|barrier)\b[^.]{0,60}\b(?:closed|latched|secured|in\s+place|fitted|installed|effective)\b/i.test(fragment)) continue;
      if (/\b(?:fitted|provided|equipped)\s+with\s+(?:a\s+|an\s+)?(?:\w+\s+){0,2}(?:cover|lid|grating|plate|guardrail|barrier)\b/i.test(fragment) &&
        !/\b(?:not|no|missing|removed|absent|damaged|broken|open|unsecured)\b/i.test(fragment)) continue;
      if (/\b(?:covered|guarded|secured|protected|effective(?:ly)?)\b[^.]{0,40}\b(?:guardrail|guardrails|cover|opening)\b/i.test(fragment)) continue;
      if (hazards.some(hazard => hazard.domainId === 'fall_protection' && hazard.observationFragment === fragment)) continue;
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'fall_protection',
        hazardFamily: 'fall_protection',
        mechanism: 'fall/opening exposure',
        observationFragment: fragment,
        supportingSignals: ['direct fall or opening evidence'],
        confidence: 0.8,
        possibleOverlapWith: ['excavation_trenching'],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm fall distance, edge protection, and worker exposure.'],
        reviewerQuestions: ['Please confirm the fall/opening exposure and edge controls.'],
        ...this.inferConditionState(fragment, originalObservation, 'fall_protection'),
      });
    }

    // Preserve a stairway/handrail deficiency as its own evidence, distinct
    // from a guardrail-system deficiency. A handrail (a stair/ramp handhold,
    // governed by the walking-working-surfaces stairway provisions) and a
    // guardrail (an edge/platform barrier system) are not the same fixture and
    // must not be equated: this block requires the word "handrail" itself and
    // keeps its own mechanism/supportingSignals text distinct from the
    // guardrail-oriented block above, so a bare handrail deficiency (with no
    // accompanying "fall hazard"/"edge"/"platform" wording) is not silently
    // dropped, and so downstream standards matching can tell handrail
    // evidence apart from guardrail evidence rather than defaulting both to
    // the same generic fall-protection language.
    for (const fragment of fragments) {
      if (!/\bhand\s*rail(?:s)?\b/i.test(fragment)) continue;
      const handrailDeficiency = /\bhand\s*rail(?:s)?\b[^.]{0,40}\b(?:missing|damaged|loose|broken|absent|not\s+provided|deteriorated|bent|detached|unstable)\b/i.test(fragment) ||
        /\b(?:missing|damaged|loose|broken|absent|no|not\s+provided|deteriorated|bent|detached|unstable)\b[^.]{0,40}\bhand\s*rail(?:s)?\b/i.test(fragment);
      if (!handrailDeficiency) continue;
      // A negated deficiency ("no missing handrail," "no damaged handrail") or
      // an affirmative safe assertion ("handrail is securely installed and
      // intact") is not itself evidence of a deficiency -- same negation-scope
      // principle used throughout this file, applied locally here since this
      // block's own positive-match regex above would otherwise also match the
      // deficiency word inside that negated phrasing.
      if (/\bno\s+(?:missing|damaged|loose|broken|deteriorated|bent|detached|unstable)\b[^.]{0,20}\bhand\s*rail/i.test(fragment)) continue;
      if (/\bhand\s*rail(?:s)?\b[^.]{0,40}\b(?:is|are|was|were)\s+(?:securely\s+)?(?:installed|intact|in\s+place|present|secure|sound)\b/i.test(fragment) &&
        !/\b(?:not|isn't|wasn't|weren't|no\s+longer)\b[^.]{0,20}\b(?:securely\s+)?(?:installed|intact|in\s+place|present|secure|sound)\b/i.test(fragment)) continue;
      if (hazards.some(hazard => hazard.domainId === 'fall_protection' && hazard.observationFragment === fragment)) continue;
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'fall_protection',
        hazardFamily: 'fall_protection',
        mechanism: 'stairway/handrail deficiency',
        observationFragment: fragment,
        supportingSignals: ['direct stairway/handrail deficiency evidence'],
        confidence: 0.75,
        possibleOverlapWith: ['walking_working_surfaces'],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm the stairway/handrail condition, location, and worker exposure.'],
        reviewerQuestions: ['Please confirm the handrail condition and the stairway or ramp it serves.'],
        ...this.inferConditionState(fragment, originalObservation, 'fall_protection'),
      });
      routingNotes.push('Preserved finding-local stairway/handrail deficiency, distinct from a guardrail-system finding.');
    }

    // Preserve explicit training, required-procedure, supervision, or
    // qualification deficiencies as clause-local organizational findings.
    // Physical hazards and incidents never imply this family by themselves.
    for (const clause of observationText.split(/[.!]/).map(value => value.trim()).filter(Boolean)) {
      const uncertain = /\b(?:unknown|unclear|cannot\s+(?:be\s+)?confirm(?:ed)?|cannot\s+determine|records?\s+(?:are|is)\s+unavailable|not\s+known|whether)\b/i.test(clause);
      const futureSafe = /\b(?:scheduled|planned)\b[^.]{0,100}\b(?:before|prior\s+to)\b[^.]{0,80}\b(?:begins?|assigned|starts?|work|task)\b/i.test(clause);
      const explicitAdequate = /\b(?:completed|current|verified|adequate|qualified|available|followed|in\s+use|provided|reviewed)\b[^.]{0,80}\b(?:training|competenc|qualification|procedure|instruction|supervision|oversight|review|briefing)|\b(?:training|competenc|qualification|procedure|instruction|supervision|oversight|review|briefing)\b[^.]{0,80}\b(?:completed|current|verified|adequate|qualified|available|followed|in\s+use|provided|reviewed)/i.test(clause);
      const negatedDeficiency = /\bwithout\s+evidence\s+of\b[^.]{0,60}\b(?:training|procedure|supervision)\b[^.]{0,30}\b(?:failure|deficien)|\b(?:no|not)\b[^.]{0,40}\b(?:training\s+deficien|untrained|procedure\s+(?:deficien|missing)|supervision\s+(?:deficien|absent)|unqualified)\b|\b(?:procedure|supervision|training)\b[^.]{0,30}\b(?:was|is)\s+not\s+(?:missing|deficient|absent)\b/i.test(clause);
      const relevantWork = /\b(?:task|work|operation|procedure|equipment|machine|entry|excavation|lockout|isolation|employee|worker|operator|assigned|performs?|proceeds?|continues?|directs?)\b/i.test(clause);
      const trainingFailure = /\b(?:never|not)\s+trained\b|\b(?:required(?:\s+task[- ]specific)?|task[- ]specific|refresher)\s+training\b[^.]{0,70}\b(?:(?:was|is|has\s+been)\s+)?(?:not\s+provided|missing|incomplete|overdue|not\s+completed)|\b(?:lacks?|lacked|without)\b[^.]{0,50}\brequired\s+training\b|\bassigned\b[^.]{0,80}\bdespite\b[^.]{0,50}\bincomplete\s+(?:required\s+)?training\b/i.test(clause);
      const procedureFailure = /\brequired\b[^.]{0,40}\b(?:procedure|instruction|procedural\s+review)\b[^.]{0,60}\b(?:unavailable|missing|absent|not\s+provided|not\s+followed)|\b(?:without|no|lacks?|lacked)\b[^.]{0,30}\b(?:the\s+)?required\b[^.]{0,40}\b(?:procedure|instruction|procedural\s+review)\b|\b(?:deviat(?:e|es|ing)|contrary)\b[^.]{0,60}\b(?:required\s+)?(?:procedure|instruction|control)\b/i.test(clause);
      const supervisionFailure = /\b(?:required|competent[- ]person)\b[^.]{0,40}\b(?:supervision|oversight|supervisory\s+review)\b[^.]{0,50}\b(?:absent|missing|not\s+provided)|\bwithout\b[^.]{0,40}\b(?:required\s+)?(?:supervision|oversight|supervisory\s+review)\b|\bsupervisor\b[^.]{0,60}\b(?:directs?|authorizes?)\b[^.]{0,60}\b(?:contrary\s+to|without)\b[^.]{0,50}\b(?:required\s+)?(?:procedure|control|review)\b/i.test(clause);
      const qualificationFailure = /\b(?:unqualified|not\s+qualified|lacks?\s+(?:the\s+)?required\s+(?:qualification|certification))\b[^.]{0,80}\b(?:worker|employee|operator|task|work|performs?)?\b/i.test(clause);
      const explicitFailure = trainingFailure || procedureFailure || supervisionFailure || qualificationFailure;
      const adequateWithoutDeficiency = explicitAdequate && !/\b(?:not|never|without|missing|absent|incomplete|overdue|contrary|unavailable|deficien)\b/i.test(clause);
      if (!explicitFailure || !relevantWork || uncertain || futureSafe || negatedDeficiency || (adequateWithoutDeficiency && !/\b(?:previously|yesterday|historical|prior|earlier)\b/i.test(clause))) continue;
      const historical = /\b(?:previously|yesterday|historical|prior|earlier)\b/i.test(clause) && /\b(?:subsequently|now|before\s+resuming|before\s+today)\b[^.]{0,100}\b(?:completed|provided|issued|reviewed|established|verified|corrected)\b/i.test(clause);
      hazards.push({hazardId:`haz-${hazards.length+1}`,domainId:'training_procedure_supervision',hazardFamily:'training_procedure_supervision',mechanism:trainingFailure?'required training deficiency':procedureFailure?'required procedure or instruction deficiency':supervisionFailure?'required supervision or review deficiency':'required qualification deficiency',observationFragment:clause,supportingSignals:['explicit organizational-control deficiency','relevant work or task context'],confidence:0.86,possibleOverlapWith:[],requiresHumanReview:true,evidenceGaps:['Confirm the applicable requirement, affected worker/task, and current competency or control status.'],reviewerQuestions:['Which required training, procedure, supervision, or qualification is deficient for this task?'],...(historical?{conditionState:'HISTORICAL' as const,temporalEvidence:['prior deficiency subsequently corrected']}:{conditionState:'ACTIVE' as const,temporalEvidence:[]})});
    }

    // Preserve a contractor-coordination failure only when the same local
    // observation establishes both a multi-employer interface and an explicit
    // breakdown in shared responsibilities, communication, or controls.
    const coordinationText = observationText;
    const hostActor = /\b(?:host(?:\s+employer)?|site\s+operator|operator|owner|prime\s+contractor)\b/i.test(coordinationText);
    const contractorActor = /\b(?:contractor|subcontractor|outside\s+crew|outside\s+employer|vendor\s+crew)\b/i.test(coordinationText);
    const multipleEmployers = /\b(?:two|multiple)\s+employers?\b/i.test(coordinationText) || /\b(?:host|operator|owner|contractor|subcontractor)\b[^.]{0,100}\b(?:and|with|between)\b[^.]{0,100}\b(?:host|operator|owner|contractor|subcontractor)\b/i.test(coordinationText);
    const coordinationInterface = (hostActor && contractorActor) || multipleEmployers;
    const coordinationFailure = /\b(?:conflicting|incompatible|undefined|unassigned|unclear)\b[^.]{0,100}\b(?:responsibilit|role|procedure|control|ownership|authority|boundary)|\b(?:responsibilit|role|procedure|control|ownership|authority)\w*\b[^.]{0,40}\bconflict(?:s|ing)?\b|\b(?:failed|failure|fails?)\s+to\s+(?:communicate|coordinate|exchange|assign|inform)|\b(?:without|no)\b[^.]{0,80}\b(?:communicat|coordinat|assigned\s+(?:owner|responsibility)|shared\s+control)|\b(?:not\s+informed|wasn't\s+informed|were\s+not\s+informed)\b|\b(?:disagree|believe)\b[^.]{0,100}\b(?:owns?|controls?|responsib)|\bneither\b[^.]{0,100}\b(?:assigned|owns?|responsib)|\b(?:simultaneous|interacting|shared)\b[^.]{0,100}\bwithout\s+coordinat/i.test(coordinationText);
    const coordinationUncertain = /\b(?:unknown|unclear|not\s+known|records?\s+(?:do|does)\s+not\s+establish|cannot\s+determine|whether)\b/i.test(coordinationText) && !/\b(?:conflicting|failed|failure|without|not\s+informed|disagree|neither)\b/i.test(coordinationText);
    const coordinationAdequate = /\b(?:adequate|effective|verified|clearly|explicitly|established|completed|provided|acknowledged|understood|compatible|agreed)\b[^.]{0,100}\b(?:coordinat|responsibilit|role|boundary|briefing|plan|communicat|procedure)|\b(?:coordinat|responsibilit|role|boundary|briefing|plan|communicat|procedure)\b[^.]{0,100}\b(?:adequate|effective|verified|clearly|explicitly|established|completed|provided|acknowledged|understood|compatible|agreed)/i.test(coordinationText) && !coordinationFailure;
    const coordinationFuture = /\b(?:planned|scheduled|next\s+(?:week|month|shift)|tomorrow|future)\b/i.test(coordinationText) && !coordinationFailure;
    const historicalCoordination = coordinationInterface && coordinationFailure && /\b(?:yesterday|previously|historical|prior|earlier|last\s+(?:week|month|year))\b/i.test(coordinationText) && /\b(?:subsequently|then|now|before\s+today)\b[^.]{0,100}\b(?:clarified|coordinated|assigned|communicated|corrected|verified)/i.test(coordinationText);
    if (coordinationInterface && coordinationFailure && !coordinationUncertain && !coordinationAdequate && !coordinationFuture) {
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'contractor_coordination',
        hazardFamily: 'contractor_coordination',
        mechanism: 'multi-employer responsibility, communication, or shared-control failure',
        observationFragment: coordinationText,
        supportingSignals: ['multi-employer interface', 'explicit coordination or control failure'],
        confidence: 0.86,
        possibleOverlapWith: [],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm employer roles, shared controls, communicated hazards, and responsibility ownership.'],
        reviewerQuestions: ['Which employer owns each shared control, and what coordination or communication evidence applies?'],
        ...(historicalCoordination ? { conditionState: 'HISTORICAL' as const, temporalEvidence: ['prior coordination failure subsequently corrected'] } : { conditionState: 'ACTIVE' as const, temporalEvidence: [] }),
      });
      routingNotes.push('Preserved finding-local contractor coordination failure.');
    }

    // A corrective-action verification failure is a lifecycle finding, not a
    // generic companion to a physical hazard. Promote it only when the same
    // observation establishes both a prior correction/closure state and
    // evidence that the intended correction failed, persisted, or recurred.
    const lifecycleText = observationText;
    const priorLifecycle = /\b(?:corrective\s+action|action|repair|remediation|correction|fix|replacement|work\s+order|closure|close(?:d)?|sign(?:ed)?[- ]?off|marked|documented|recorded|verified|inspection)\b/i.test(lifecycleText) &&
      /\b(?:marked|documented|recorded|reported|claimed|signed)[- ]?(?:off)?\s*(?:as\s+)?(?:complete|completed|closed|corrected|resolved|repaired|effective)|\b(?:was|were|had\s+been|has\s+been)\s+(?:marked\s+)?(?:complete|completed|closed|corrected|resolved|repaired|verified|signed[- ]?off)|\b(?:action|repair|remediation|correction|fix|replacement|work\s+order)\s+(?:was\s+|had\s+been\s+|has\s+been\s+)?(?:completed|closed|performed|implemented|verified|signed[- ]?off)|\bverification\s+(?:passed|approved|completed)|\bprior\s+(?:corrective\s+action|repair|correction|remediation|closure|verification)\b/i.test(lifecycleText);
    const failedLifecycle = /\b(?:but|however|yet|despite|although)\b[^.]{0,140}\b(?:still|remains?|persist(?:s|ed)?|recur(?:s|red)?|returned|same|missing|not\s+(?:corrected|resolved|implemented|effective)|never\s+(?:corrected|resolved|implemented))\b|\b(?:still|same)\b[^.]{0,100}\b(?:hazard|defect|condition|leak|damage|guard|issue)\b[^.]{0,60}\b(?:remains?|persist(?:s|ed)?|present|missing|recur(?:s|red)?)\b|\b(?:reinspection|follow[- ]?up\s+inspection|later\s+inspection|verification)\b[^.]{0,120}\b(?:proves?|finds?|found|shows?|confirmed)\b[^.]{0,100}\b(?:still|never|not|remains?|persist|missing|failed)|\b(?:recur(?:red|s)?|returned)\b[^.]{0,100}\b(?:after|following)\b[^.]{0,80}\b(?:correction|repair|action|closure|verification|completion)\b/i.test(lifecycleText);
    const unresolvedOrUnknown = /\b(?:unknown|unclear|cannot\s+determine|not\s+known|unavailable)\b[^.]{0,100}\b(?:prior|repair|correction|closure|same\s+condition|completed)\b/i.test(lifecycleText);
    const futureOrOpen = /\b(?:planned|scheduled|will\s+be|next\s+(?:week|month|shift)|tomorrow|not\s+yet\s+due|awaiting\s+completion|in\s+progress|open\s+action)\b/i.test(lifecycleText) && !failedLifecycle;
    const successfulClosure = /\b(?:independently\s+verified|follow[- ]?up\s+inspection\s+(?:confirmed|verified)|verified\s+(?:as\s+)?effective|confirmed\s+(?:as\s+)?resolved|fix\s+remains\s+effective)\b/i.test(lifecycleText) &&
      /\b(?:resolved|effective|corrected|no\s+recurrence|has\s+not\s+recurred|remains\s+effective)\b/i.test(lifecycleText);
    const historicalFailure = /\b(?:yesterday|previously|historical|last\s+(?:week|month|year)|earlier)\b/i.test(lifecycleText) &&
      /\b(?:failed|false|premature|remained|persisted|recurred)\b/i.test(lifecycleText) && successfulClosure;
    if ((priorLifecycle && failedLifecycle && !unresolvedOrUnknown && !futureOrOpen && !successfulClosure) || historicalFailure) {
      hazards.push({
        hazardId: `haz-${hazards.length + 1}`,
        domainId: 'corrective_action_verification_failure',
        hazardFamily: 'corrective_action_verification_failure',
        mechanism: 'prior corrective action failed implementation, verification, or sustained effectiveness',
        observationFragment: lifecycleText,
        supportingSignals: ['prior correction or closure state', 'persisting, recurring, or disproven correction'],
        confidence: 0.86,
        possibleOverlapWith: [],
        requiresHumanReview: true,
        evidenceGaps: ['Confirm the prior action record, closure basis, verification evidence, and identity of the recurring condition.'],
        reviewerQuestions: ['What prior action or closure record applies, and what evidence proves that correction failed or the same condition recurred?'],
        ...(historicalFailure
          ? { conditionState: 'HISTORICAL' as const, temporalEvidence: ['prior verification failure subsequently corrected and verified'] }
          : { conditionState: 'ACTIVE' as const, temporalEvidence: [] }),
      });
      routingNotes.push('Preserved finding-local corrective-action lifecycle failure.');
    }

    // 3. Final result
    const filteredHazards = hazards.filter((hazard) => {
      const fragment = hazard.observationFragment || '';
      if (hazard.domainId === 'hot_work' && (hotWorkNegated || hotWorkUncertain)) return false;
      if (hazard.domainId === 'hot_work' && !activeHotWork && !this.isTrueHotWorkFragment(fragment)) return false;
      // Only guards the weak, generic base-router match (single "dust" entity
      // hit, confidence <= 0.4); the dedicated silica-specialization promotion
      // above always carries confidence 0.6 and is never subject to this filter.
      if (hazard.domainId === 'silica_respirable_dust' && (hazard.confidence ?? 0) <= 0.4 && !/\b(?:silica|respirable\s+dust|dust\s+exposure|dust\s+cloud|dust\s+control|inhalation|breathing\s+dust)\b/i.test(fragment)) return false;
      // Negation and verified controls apply to the routed fragment, not the
      // entire observation, so a valid sibling hazard is never globally lost.
      if (hazard.domainId === 'fall_protection' && /\b(?:no employee|no worker|no person)\b[^.]{0,60}\b(?:fall exposure|fall hazard|exposure area)\b/i.test(fragment)) return false;
      if (hazard.domainId === 'chemical_release' && /\b(?:no active leak|no leak|no release|sealed|closed and intact)\b/i.test(fragment)) return false;
      if (hazard.domainId === 'powered_industrial_trucks' && /\b(?:parked|stored|secured|out of service|not operating)\b/i.test(fragment)) return false;
      if (hazard.domainId === 'machine_guarding' && /\b(?:guard(?:ing)?\s+(?:is|was|has been)?\s*(?:installed|interlocked|fixed|intact)|fixed guard|interlocked guard|intact guard)\b/i.test(fragment) && !/\b(?:missing|removed|unguarded|bypassed)\b/i.test(fragment)) return false;
      if (hazard.domainId === 'machine_guarding' && /\b(?:guardrail|platform edge|fall protection|fall arrest)\b/i.test(fragment) && !/\b(?:machine|conveyor|shaft|pulley|point of operation|rotating)\b/i.test(fragment)) return false;
      if (hazard.domainId === 'suspended_loads') {
        const load = SUSPENDED_LOAD_EVIDENCE.test(fragment);
        const exposure = SUSPENDED_LOAD_EXPOSURE.test(fragment);
        const negated = /\b(?:no|not|without)\b[^.]{0,80}\b(?:load\s+(?:is\s+)?suspended|person|employee|worker|one)\b/i.test(fragment) || /\b(?:landed|secured\s+on\s+(?:a\s+)?stable\s+support|barricaded|area\s+below\s+is\s+clear|not\s+yet\s+lifted|unknown|unclear|not\s+established|does\s+not\s+establish)\b/i.test(fragment);
        if (!load || !exposure || negated) return false;
      }
      if (hazard.domainId === 'fire_explosion') {
        const material = /\b(?:flammable|combustible|explosive|fuel|gasoline|solvent|vapor|vapour|gas\s+leak|dust\s+cloud|flammable\s+liquid|fuel\s+vapor)\b/i.test(fragment);
        const ignition = /\b(?:open[- ]?flame|flame|spark(?:s|ing)?|ignition|hot\s+surface|active\s+heater|weld(?:ing)?|torch|grind(?:ing)?|electrical\s+spark(?:s)?|energized\s+ignition|arc)\b/i.test(fragment);
        const negated = /\b(?:no|not|without)\b[^.]{0,100}\b(?:flammable|combustible|explosive|release|leak|vapor|vapour|ignition|spark|flame)\b/i.test(fragment) || /\b(?:nonflammable|non-combustible|water\s+vapor|water\s+vapour|unknown|unclear|not\s+established)\b/i.test(fragment);
        if (!material || !ignition || negated || (/\b(?:ignition|flammable)\s+condition\s+is\s+removed\b/i.test(fragment) && /\bverified\b/i.test(originalObservation))) return false;
      }
      if (hazard.domainId === 'electrical' && /\b(?:not energized|no exposed|not exposed|de-energized and isolated|deenergized and isolated|physically isolated)\b/i.test(fragment) && !/\b(?:adjacent|but|however)\b[^.]{0,40}\b(?:exposed|energized)\b/i.test(fragment)) return false;
      if (hazard.domainId === 'machine_guarding_loto' && /\b(?:de-energized|deenergized|zero[- ]energy|isolated|disconnect is open)\b/i.test(fragment) && !/\b(?:unexpected startup|capable of startup|without lockout|no lockout|energized)\b/i.test(fragment)) return false;
      if (hazard.domainId === 'excavation_trenching' && /\b(?:no|without|never)\s+(?:trench|excavat(?:ion|ing)|open\s+cut)\b/i.test(fragment)) return false;
      return true;
    });
    // Contradicted hazardous-energy control -- LAST-RESORT preservation, deliberately evaluated
    // after every other detector and filter so it can only ADD a hazard that would otherwise be
    // lost, never displace a properly fragment-scoped one.
    //
    // Every LOTO detector above requires the observation to state a control FAILURE in
    // recognised words. An observation that instead states the control as APPLIED and then
    // contradicts it ("machine is locked and tagged out -- worker reports the disconnect may
    // still be energized"; "lockout is complete; electrician measured voltage at the work
    // point"; "the operator says the machine was locked out, but the disconnect was found in the
    // ON position and no lock or tag was present") satisfied none of them, and the per-fragment
    // gates then zeroed the route for lacking a recognised failure phrase. The hazard vanished
    // entirely -- no domain, no standard, no question -- which is the most dangerous outcome this
    // engine can produce, because conflicting evidence silently yielded a clean result.
    //
    // A contradiction reduces confidence; it must never delete the hazard. The contradiction
    // itself is carried as the evidence gap and reviewer question so the finding and the report
    // show WHY the state is unresolved. Verified-complete isolation with no contradicting clause
    // does not match and stays controlled.
    if (!filteredHazards.some(h => h.domainId === 'lockout_tagout' || h.domainId === 'hydraulic_pneumatic_energy')) {
      // The claim must be AFFIRMED, not merely mentioned. "hazardous energy has NOT been
      // isolated or locked out" contains the words of a control claim while asserting its
      // absence -- that is an ordinary LOTO deficiency already owned by the detectors above, and
      // treating it as a contradiction here would attach a second, whole-observation finding on
      // top of a correctly scoped one. The shared negation-window utility (the same one the
      // classifier and the evidence extractor use) makes exactly that distinction: it excludes
      // "locked out" inside "has not been isolated or locked out" while still affirming it in
      // "the operator says the machine was locked out, but the disconnect was found ON".
      const energyControlClaimed = hasAnyNonNegatedTerm(observationText, [
        'locked out', 'locked and tagged out', 'tagged out', 'lockout is complete',
        'lockout complete', 'lockout was applied', 'lock applied', 'lock is applied',
        'lock is installed', 'deenergized', 'de-energized', 'isolated',
        'zero-energy verification completed', 'zero energy verification completed',
      ]);
      const CONTRADICTION =
        /\b(?:could\s+not\s+verify|can(?:no|')t\s+verify|unable\s+to\s+verify|did\s+not\s+verify|not\s+(?:been\s+)?verified|never\s+(?:been\s+)?verified|unverified|not\s+(?:yet\s+)?confirmed|may\s+still\s+be\s+energ\w*|might\s+still\s+be\s+energ\w*|(?:is|are|was|were|remains?)\s+still\s+energ\w*|still\s+live\b|measured\s+voltage|voltage\s+(?:was\s+)?(?:measured|found|present|detected|read)|stored\s+(?:hydraulic|pneumatic|electrical|mechanical|spring)?\s*(?:pressure|energy)\s+(?:remains?|is\s+(?:still\s+)?present|was\s+not\s+relieved)|pressure\s+remains?|disconnect\s+(?:was\s+)?(?:found\s+)?(?:in\s+the\s+)?ON\b|power\s+(?:was\s+)?never\s+verified|no\s+lock\s+or\s+tag\s+(?:was\s+)?(?:present|applied|attached))\b/i;
      if (energyControlClaimed && CONTRADICTION.test(observationText)) {
        // Scope the finding to the clauses that actually carry the claim and the contradiction,
        // so a co-occurring unrelated hazard's text is not absorbed into this finding.
        const relevant = fragments.filter(f => CONTRADICTION.test(f) ||
          /\b(?:lock|tag|lockout|LOTO|isolat\w*|de-?energ\w*|zero[- ]energy|disconnect)\b/i.test(f));
        filteredHazards.push({
          hazardId: `haz-${filteredHazards.length + 1}`,
          domainId: 'lockout_tagout',
          hazardFamily: 'lockout_tagout',
          mechanism: 'hazardous energy control claimed but contradicted or unverified',
          observationFragment: (relevant.length ? relevant.join('. ') : observationText).trim(),
          supportingSignals: ['energy control claimed', 'contradicting or unverified evidence in the same observation'],
          confidence: 0.5,
          possibleOverlapWith: [],
          requiresHumanReview: true,
          evidenceGaps: [
            'The observation both claims hazardous-energy control and contradicts it; the isolation state is unresolved.',
            'Confirm every energy source was isolated and that a zero-energy state was verified at the work point.',
          ],
          reviewerQuestions: [
            'Was a zero-energy state verified at the point of work after the isolating devices were locked and tagged?',
          ],
          conditionState: 'ACTIVE',
        } as HazardDecomposition);
        routingNotes.push('lockout_tagout preserved on contradicted energy-control evidence (not resolved to controlled)');
      }
    }

    const annotatedHazards = filteredHazards.map((hazard) => ({
      // Preserve explicit decomposition decisions (for example a historical
      // or planned stored-energy context) over the generic fragment fallback.
      ...this.inferConditionState(hazard.observationFragment, originalObservation, hazard.domainId),
      ...hazard,
    }));
    const isMultiHazard = annotatedHazards.length > 1;
    const hazardCount = annotatedHazards.length;
    const primaryHazard = annotatedHazards[0];

    return {
      version,
      originalObservation,
      isMultiHazard,
      hazardCount,
      primaryHazard,
      hazards: annotatedHazards,
      decompositionConfidence: annotatedHazards.length > 0 ? 0.9 : 0,
      routingNotes,
      evidenceGaps: annotatedHazards.length === 0 ? ['No clear hazards identified in text.'] : [],
      reviewerQuestions: isMultiHazard ? ['Multiple hazards detected. Review each for accuracy.'] : [],
      advisoryBoundary: 'SafeScope multi-hazard decomposition is advisory only.'
    };
  }
  private isTrueHotWorkFragment(fragment: string): boolean {
    const normalized = fragment.toLowerCase();

    if (/\b(?:no|not|never)\s+(?:active\s+)?(?:hot[- ]?work|weld(?:ing)?|cut(?:ting)?|grind(?:ing)?)\b/i.test(normalized) ||
      /\b(?:hot[- ]?work|weld(?:ing)?|cut(?:ting)?|grind(?:ing)?)\b[^.]{0,100}\b(?:will\s+not|won't|not\s+(?:be\s+)?(?:performed|planned|scheduled|conducted)|canceled|cancelled|completed)\b/i.test(normalized) ||
      /\b(?:discussed|reviewed|selected\s+(?:a\s+)?cold[- ]work|cold[- ]work\s+method|may\s+be\s+required|not\s+determined)\b/i.test(normalized)) return false;

    return /\b(weld|welding|cut|cutting|torch|grind|grinding|braz|brazing|solder|soldering|open flame|flame|spark|sparks|hot[- ]work|hot[- ]work permit)\b/i.test(normalized);
  }

  private isFalsePositiveHotWorkFragment(fragment: string): boolean {
    const normalized = fragment.toLowerCase();

    const genericWorkOnly =
      /\b(worker|workers|work|working|clean|cleaning|cleanup|material|housekeeping)\b/i.test(normalized);

    return genericWorkOnly && !this.isTrueHotWorkFragment(normalized);
  }

  /**
   * Several cross-clause hazard detectors below (LOTO, hot work, welding fumes,
   * ventilation, chemical release/transfer, hazcom, haul-route) legitimately need
   * to look across sentence boundaries to find their evidence (e.g. "clears a jam"
   * in one clause and "without lockout" in another), so they test against the
   * whole observationText rather than one pre-split fragment. But persisting the
   * ENTIRE observation as that finding's observationFragment means every other,
   * unrelated sentence in the observation (a separate safe condition, a separate
   * hazard, a separate historical note) is misrepresented as this finding's own
   * evidence -- shown verbatim in the finding's review panel and PDF report.
   * This narrows that fragment down to just the sentences that actually contain
   * the signal the detector matched on, so a multi-topic observation doesn't
   * bleed unrelated sentences into one finding's evidence. Falls back to the full
   * text only in the (should not normally happen) case where no single sentence
   * contains the signal -- e.g. the signal spans a mid-sentence clause boundary
   * the sentence splitter does not recognize.
   */
  /** The period-delimited sentence of `observationText` that contains `fragment` (or the fragment itself). */
  private sentenceContaining(observationText: string, fragment: string): string {
    const needle = String(fragment || '').toLowerCase();
    const sentence = String(observationText || '').split(/(?<=[.!?])\s+/).find(item => item.toLowerCase().includes(needle));
    return sentence || fragment;
  }

  private relevantSentenceFragment(observationText: string, keywordPattern: RegExp, mustAlsoMatch?: RegExp): string {
    const sentences = observationText
      .split(/(?<=[.!?])\s+/)
      .map(sentence => sentence.trim())
      .filter(Boolean);
    const relevant = sentences.filter(sentence => keywordPattern.test(sentence));
    // When a secondary qualifier is supplied, prefer the sentences that ALSO satisfy it (e.g. the
    // LOTO sentence that names the servicing/lock/isolation, not a sibling sentence that merely
    // says "energized" about a damaged cord); fall back to the keyword-only set only when the
    // qualifier eliminates everything.
    const qualified = mustAlsoMatch ? relevant.filter(sentence => mustAlsoMatch.test(sentence)) : relevant;
    const chosen = qualified.length ? qualified : relevant;
    return chosen.length ? chosen.join(' ') : observationText;
  }

  private inferConditionState(fragment: string, fullObservation = '', domainId = ''): Pick<HazardDecomposition, 'conditionState' | 'temporalEvidence' | 'currentCondition' | 'correctionStatus'> {
    const text = String(fragment || '').toLowerCase();
    const fullText = String(fullObservation || fragment).toLowerCase();
    // Temporal cues must originate in the finding fragment. The full
    // observation is retained for provenance, but sibling clauses must not
    // change this finding's state.
    const temporalText = text;
    const temporalEvidence = temporalText.match(/\b(?:yesterday|earlier|previously|prior|this morning|before the inspection|before inspection|last shift|since)\b[^.]{0,100}/gi) || [];
    const currentExposure = /\b(?:still|currently|remains|now)\b[^.]{0,100}\b(?:exposed|unguarded|missing|leak(?:ing)?|spill(?:ed)?|open|energized|operating|arcing|arc|welding|hot[- ]?work|combustible)\b/i.test(text) ||
      /\b(?:operating|running)\b[^.]{0,60}\b(?:now|currently)\b[^.]{0,80}\b(?:missing|unguarded|exposed|open|energized)\b/i.test(text) ||
      /\b(?:missing|unguarded|exposed|open)\b/i.test(text) && !/\b(?:was|were|had been)\b[^.]{0,40}\b(?:missing|unguarded|exposed|open)\b/i.test(text) ||
      /\b(?:opening|belt|conductors?|floor|surface)\b[^.]{0,80}\b(?:still|remains|exposed|open|covered in oil)\b/i.test(text) ||
      !/\b(?:dry|clear|cleared|no\s+(?:current\s+)?(?:leak|exposure|residue|slippery\s+condition))\b/i.test(text) && /\b(?:surface|floor)\b[^.]{0,80}\b(?:slick|slippery|wet|covered in oil)\b/i.test(text);
    const intermittent = !/\b(?:may|might)\s+fail\b/i.test(temporalText) && /\b(?:intermittent(?:ly)?|occasionally|recurr(?:s|ing)|several times (?:a|per)\s+(?:week|shift|day)|repeatedly|fails?\s+(?:on|during)\s+(?:startup|start-up|shutdown|shift change)|only\s+during\s+(?:startup|start-up|shutdown|shift change)|during\s+(?:startup|start-up|shutdown|shift change))\b/i.test(temporalText) &&
      (domainId === 'guarding_interlocks' || domainId === 'machine_guarding' || domainId === 'electrical' || /\b(?:interlock|guard|electrical|arc|panel|conductor|startup|start-up|emergency\s+stop|line\s+shut(?:s)?\s+down|forklift|pedestrian|shift\s+change)\b/i.test(temporalText));
    const futureActivity = /\b(?:scheduled|planned|will begin|will start|intend(?:s|ed)? to begin|next week|next month|tomorrow|in two days)\b[^.]{0,120}\b(?:work|excavat|energ(?:ize|ized)|hot[- ]?work|erect|start|begin|task|operation|permit|torch|weld|restart|maintenance|barricade|barrier)/i.test(temporalText) ||
      /\b(?:weld(?:ing)?|cut(?:ting)?|grind(?:ing)?|hot[- ]?work)\b[^.]{0,100}\b(?:will\s+(?:begin|start)|after\s+shutdown|planned|scheduled)\b/i.test(temporalText) ||
      /\b(?:work|excavat(?:ion|ing)?|hot[- ]?work|energ(?:ize|ized)|erection|torch|weld|restart|maintenance|barricade|barrier)\b[^.]{0,100}\b(?:scheduled|planned|next week|next month|tomorrow|in two days|not yet|has not begun|hasn't begun)\b/i.test(temporalText);
    const futureCorrection = /\b(?:will|planned to|scheduled to|intend(?:s|ed)? to)\s+(?:be\s+)?(?:repaired|replaced|restored|fixed|secured|closed)\b/i.test(text);
    const reportedCorrection = /\b(?:reported|said|claimed|may have|might have)\b[^.]{0,80}\b(?:repaired|replaced|restored|fixed|secured|closed)\b/i.test(text);
    const familyContext = domainId === 'electrical' ? /\b(?:electrical|conductors?|panel|cabinet|wire|cord)\b/i.test(text) :
      domainId === 'machine_guarding' || domainId === 'machine_guarding_loto' || domainId === 'guarding_interlocks' ? /\b(?:guard|guarding|conveyor|belt|shaft|pulley|machine|interlock)\b/i.test(text) :
      domainId === 'chemical_release' || domainId === 'hazcom' ? /\b(?:leak|spill|release|chemical|solvent|drum|container|oil)\b/i.test(text) : true;
    // Hazard vocabulary is not itself evidence of a hazard: "no missing
    // guardrails" and "guardrails are fully secured" describe the absence of
    // a deficiency, not its presence, and must not default to ACTIVE the way
    // an unrecognized fragment otherwise would. This stays scoped to the
    // finding-local fragment (the same `text` every other check here uses)
    // and requires the deficiency-adjective or the positive-state assertion
    // to be the thing negated/affirmed, not any unrelated "no"/"not" in the
    // fragment.
    const negatedPositiveSafeAssertion = /\b(?:not|never|wasn't|weren't|isn't|aren't|failed\s+to\s+be|without\s+being|no\s+longer)\b[^.]{0,20}\b(?:properly|correctly|adequately|securely|fully)?\s*(?:secured|installed|guarded|protected|maintained|anchored|covered|fastened|bolted|attached|in\s+place|intact|present|functional|undamaged)\b/i.test(text);
    const explicitSafeOrNegatedDeficiency =
      /\bno\s+(?:missing|damaged|unsecured|defective|broken|loose|deteriorated|corroded|frayed|cracked|unguarded|exposed)\b/i.test(text) ||
      /\bno\s+[a-z][a-z\s-]{0,25}\b(?:were|was)\s+observed\b/i.test(text) ||
      /\bno\s+deficienc(?:y|ies)\b[^.]{0,30}\b(?:observed|found|noted|identified)?/i.test(text) ||
      // Covers both adverb+participle order ("properly secured") and
      // adjective-noun-participle order ("proper shoring installed").
      (/\b(?:properly|correctly|adequately|securely|fully)\s+(?:secured|installed|guarded|protected|maintained|anchored|covered|fastened|bolted|attached|in\s+place)\b/i.test(text) && !negatedPositiveSafeAssertion) ||
      (/\bproper\b[^.]{0,20}\b(?:installed|in\s+place|present)\b/i.test(text) && !negatedPositiveSafeAssertion) ||
      (/\b(?:guardrails?|covers?|shoring|guard)\b[^.]{0,30}\b(?:is|are|was|were)\s+(?:complete|intact|in\s+place|present|installed)\b/i.test(text) && !negatedPositiveSafeAssertion) ||
      /\bfully\s+prevented\s+access\b/i.test(text) ||
      /\binspected\s+by\s+a\s+competent\s+person\b/i.test(text);
    const verifiedCorrection = /\b(?:was|were|has been|have been)\s+(?:repaired|replaced|restored|backfilled|filled|fixed|secured|closed|removed from service)\b/i.test(text) ||
      /\b(?:repaired|replaced|restored|fixed|secured|closed|removed from service|replacement)\b[^.]{0,100}\b(?:before (?:the )?inspection|current(?:ly)?|verified|tested|confirmed|inspected|tagged|in place)\b/i.test(text) ||
      /\b(?:de[- ]energized|deenergized|locked out|zero[- ]energy|isolated)\b[^.]{0,80}\b(?:verified|tested|confirmed)\b/i.test(text) ||
      // LOTO verification language ("zero-energy state was verified with a
      // tester") legitimately appears in a clause separate from the one
      // naming the lockout/tagout procedure itself (e.g. joined by "and",
      // which fragment-splitting treats as a boundary). Falling back to the
      // full observation here is deliberately narrow: it is gated to the
      // lockout_tagout domain, requires the same strong verified-isolation
      // phrase as the fragment-scoped check above, and still requires no
      // contradicting current-exposure language in this finding's own
      // fragment.
      (domainId === 'lockout_tagout' && /\b(?:de[- ]energized|deenergized|locked out|zero[- ]energy|isolated)\b[^.]{0,80}\b(?:verified|tested|confirmed)\b/i.test(fullText)) ||
      /\b(?:surface|floor)\b[^.]{0,80}\b(?:dry|clear|cleared|no\s+(?:current\s+)?(?:residue|slippery\s+condition))\b/i.test(text) ||
      explicitSafeOrNegatedDeficiency;
    const unresolvedHaulRoute =
      domainId === 'mobile_equipment' &&
      /\b(?:haul route|haul road)\b/i.test(text) &&
      !/\b(?:forklift|loader|haul truck|truck|vehicle|mobile equipment|backing|struck by|pedestrian)\b/i.test(text) &&
      !/\b(?:no traffic|no vehicle|route closed|not operating|parked|secured|out of service)\b/i.test(text);
    const historicalNoCurrentExposure = domainId === 'electrical' &&
      !/\b(?:unsure|uncertain|unknown|not sure|may|might)\b/i.test(temporalText) &&
      /\b(?:prior|previously|yesterday|last week|last month|historical|arc[- ]?flash|arc event|reported)\b/i.test(temporalText) &&
      /\b(?:no|not|without)\b[^.]{0,80}\b(?:current|now|today|exposed|energized|live|damaged|visible|inspection|photo)/i.test(temporalText) &&
      !/\b(?:still|remains|currently|now)\b[^.]{0,80}\b(?:exposed|energized|arcing|damaged|open)/i.test(temporalText);
    // The prior-event clause ("an arc flash was reported last month") and the
    // no-current-exposure clause ("no current exposure, and the panel has
    // since been cleared") commonly land in different fragments once split
    // on commas/"and" -- the fragment that actually routes to the electrical
    // domain may only carry one half. Fall back to the full observation for
    // this one electrical/historical pattern, narrowly, the same way the
    // lockout_tagout verification check above does.
    const historicalNoCurrentExposureFullText = domainId === 'electrical' &&
      !historicalNoCurrentExposure &&
      !/\b(?:unsure|uncertain|unknown|not sure|may|might)\b/i.test(fullText) &&
      /\b(?:prior|previously|yesterday|last week|last month|historical|arc[- ]?flash|arc event|reported)\b/i.test(fullText) &&
      /\b(?:no|not|without)\b[^.]{0,80}\b(?:current|now|today|exposed|energized|live|damaged|visible|inspection|photo)/i.test(fullText) &&
      !/\b(?:still|remains|currently|now)\b[^.]{0,80}\b(?:exposed|energized|arcing|damaged|open)/i.test(fullText) &&
      !currentExposure;
    const uncertainHistoricalElectrical = domainId === 'electrical' &&
      /\b(?:prior|previously|yesterday|last week|last month|historical|reported)\b/i.test(temporalText) &&
      /\b(?:unsure|uncertain|unknown|not sure|may|might)\b/i.test(temporalText) &&
      !/\b(?:currently|now|today|still|remains)\b[^.]{0,80}\b(?:exposed|energized|live|open|damaged|arcing)\b/i.test(temporalText);
    const historicalReportedNoCurrentInspection =
      /\b(?:prior|previously|yesterday|last\s+(?:week|month|shift)|historical|reported)\b/i.test(temporalText) &&
      /\b(?:missing|removed|unguarded|open|damaged|failed|defect)\b/i.test(temporalText) &&
      /\b(?:current\s+(?:condition|status)|currently)\b[^.]{0,60}\b(?:not\s+(?:inspected|verified|known)|unknown|unavailable)/i.test(temporalText) &&
      !/\b(?:still|remains|currently|now)\b[^.]{0,80}\b(?:exposed|energized|live|open|unguarded|missing|damaged|failed)\b/i.test(temporalText);
    const historicalReportedEvent =
      /\b(?:prior|previously|yesterday|last\s+(?:week|month|shift)|historical|reported)\b/i.test(temporalText) &&
      /\b(?:reports?|reported|was|were|had\s+been)\b/i.test(temporalText) &&
      /\b(?:missing|removed|unguarded|open|damaged|failed|defect)\b/i.test(temporalText) &&
      !/\b(?:currently|now|today|still|remains|operating|running)\b/i.test(temporalText);
    const contradiction = !historicalNoCurrentExposure && !/\bno\s+(?:current\s+)?(?:leak|exposure|release|residue)\b/i.test(text) && /\b(?:replaced|repaired|restored|closed|secured)\b[^.]{0,80}\b(?:but|however)\b[^.]{0,80}\b(?:still|remains|exposed|open|unguarded|leak(?:ing)?)\b/i.test(text);
    if (intermittent) return { conditionState: 'INTERMITTENT', temporalEvidence, currentCondition: 'Condition is reported during a recurring operation or time window.', correctionStatus: 'not_stated' };
    if (futureActivity && !currentExposure && !futureCorrection) return { conditionState: 'PLANNED_FUTURE', temporalEvidence, currentCondition: 'The hazardous activity is planned but not yet underway.', correctionStatus: 'planned' };
    if (futureCorrection) return { conditionState: 'ACTIVE', temporalEvidence, currentCondition: 'Correction is planned, not yet verified.', correctionStatus: 'planned' };
    if (historicalNoCurrentExposure || historicalNoCurrentExposureFullText) return { conditionState: 'HISTORICAL', temporalEvidence, currentCondition: 'A prior electrical event is documented, but current exposure is not established.', correctionStatus: 'reported' };
    if (uncertainHistoricalElectrical) return { conditionState: 'HISTORICAL', temporalEvidence, currentCondition: 'A prior electrical event is uncertain and does not establish a current exposure.', correctionStatus: 'reported' };
    if (historicalReportedNoCurrentInspection) return { conditionState: 'HISTORICAL', temporalEvidence, currentCondition: 'A prior condition is reported, but current status was not inspected or verified.', correctionStatus: 'reported' };
    if (historicalReportedEvent) return { conditionState: 'HISTORICAL', temporalEvidence, currentCondition: 'A prior condition is reported without current exposure evidence.', correctionStatus: 'reported' };
    if (reportedCorrection && !verifiedCorrection) return { conditionState: 'UNKNOWN', temporalEvidence, currentCondition: 'Correction was reported but current status is unverified.', correctionStatus: 'reported' };
    if (domainId === 'excavation_trenching' && /\b(?:may|might|unknown|unclear|not known|not established)\b/i.test(text) && !currentExposure) return { conditionState: 'UNKNOWN', temporalEvidence, currentCondition: 'Excavation status or protective controls are not established.', correctionStatus: 'not_stated' };
    if (contradiction) return { conditionState: 'CONTRADICTORY', temporalEvidence, currentCondition: 'Correction and current exposure evidence conflict.', correctionStatus: 'reported' };
    if (verifiedCorrection && temporalEvidence.length && !currentExposure) return { conditionState: 'HISTORICAL', temporalEvidence, currentCondition: 'The hazardous condition is described as corrected before the current observation.', correctionStatus: 'verified' };
    if (verifiedCorrection && !currentExposure) return { conditionState: 'SAFE_VERIFIED', temporalEvidence, currentCondition: 'Current control or correction is explicitly verified.', correctionStatus: 'verified' };
    if (unresolvedHaulRoute) return { conditionState: 'UNKNOWN', temporalEvidence, currentCondition: 'Haul-route context is present but equipment, exposure, and controls are not established.', correctionStatus: 'not_stated' };
    return { conditionState: 'ACTIVE', temporalEvidence, currentCondition: currentExposure ? 'Current exposure remains described.' : undefined, correctionStatus: 'not_stated' };
  }

}
