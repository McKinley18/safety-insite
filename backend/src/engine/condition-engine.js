const fs = require("fs");

const LIBRARY_PATH = "test-data/condition-library/hazard-condition-library.json";
const SUPPRESSORS_PATH = "test-data/condition-library/004_no_match_suppressors.json";

function norm(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9\s/.-]/g, " ").replace(/\s+/g, " ").trim();
}

function loadJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function phraseMatched(text, rawTerm) {
  const term = norm(rawTerm);
  if (!term) return false;

  const pattern = new RegExp(`(^|\\b)${escapeRegex(term)}($|\\b)`, "i");
  return pattern.test(text);
}

function phraseHits(text, terms = []) {
  return terms
    .map(norm)
    .filter(Boolean)
    .filter(term => phraseMatched(text, term));
}

function isNegatedSafePhrase(text, term) {
  const t = norm(term);
  const negatedPatterns = [
    `not ${t}`,
    `no ${t}`,
    `without ${t}`,
    `un${t}`,
    `not properly ${t}`
  ];
  return negatedPatterns.some(p => text.includes(p));
}

function safeSuppressorHits(text, terms = []) {
  return terms
    .map(norm)
    .filter(Boolean)
    .filter(term => phraseMatched(text, term) && !isNegatedSafePhrase(text, term));
}

function hasAny(text, terms = []) {
  return phraseHits(text, terms).length > 0;
}

function hasSafeSuppressor(text, terms = []) {
  return safeSuppressorHits(text, terms).length > 0;
}

function inferScopeBoost(text, condition) {
  const miningSignals = ["mine", "mining", "crusher", "screen deck", "screen plant", "pit", "quarry", "haul road", "stockpile", "berm", "plant area", "plant", "conveyor", "pre-op inspection"];
  const constructionSignals = ["construction", "jobsite", "roof", "scaffold", "trench", "excavation", "crane", "steel erection", "masonry", "welding area"];
  const giSignals = ["warehouse", "factory", "production line", "maintenance room", "maintenance shop", "shipping", "loading dock", "forklift", "MCC", "office", "work area"];

  const scopeSignals = {
    mining: phraseHits(text, miningSignals).length,
    construction: phraseHits(text, constructionSignals).length,
    general_industry: phraseHits(text, giSignals).length
  };

  const own = scopeSignals[condition.scope] || 0;
  const competing = Object.entries(scopeSignals)
    .filter(([scope]) => scope !== condition.scope)
    .reduce((sum, [, count]) => sum + count, 0);

  return own * 25 - competing * 35;
}

function scoreCondition(text, condition) {
  const suppressorHits = safeSuppressorHits(text, condition.safeSuppressors || []);
  if (suppressorHits.length) {
    return { score: -999, reason: [`safe suppressor:${suppressorHits.join(",")}`] };
  }

  const equipmentHits = phraseHits(text, condition.equipmentTerms || []);
  const failureHits = phraseHits(text, condition.failureTerms || []);
  const contextHits = phraseHits(text, condition.contextTerms || []);
  const negativeHits = phraseHits(text, condition.negativeSignals || []);

  let score = 0;
  const reasons = [];

  if (equipmentHits.length) {
    score += equipmentHits.length * 25;
    reasons.push(`equipment:${equipmentHits.join(",")}`);
  }

  if (failureHits.length) {
    score += failureHits.length * 55;
    reasons.push(`failure:${failureHits.join(",")}`);
  }

  if (contextHits.length) {
    score += contextHits.length * 12;
    reasons.push(`context:${contextHits.join(",")}`);
  }

  if (negativeHits.length) {
    score -= negativeHits.length * 60;
    reasons.push(`negative:${negativeHits.join(",")}`);
  }

  const scopeBoost = inferScopeBoost(text, condition);
  score += scopeBoost;
  if (scopeBoost) reasons.push(`scopeBoost:${scopeBoost}`);

  if (!failureHits.length) score -= 35;
  if (!equipmentHits.length && !contextHits.length) score -= 15;

  const priority = Number(condition.priority || 0);
  score += priority;

  // Precision disambiguators
  if (text.includes("exit route") && condition.family === "emergency_egress") score += 40;
  if (text.includes("emergency light") && condition.family === "emergency_egress") score += 40;
  if (text.includes("fire extinguisher") && condition.family === "fire_safety") score += 40;
  if ((text.includes("compressed gas cylinder") || text.includes("oxygen cylinder") || text.includes("acetylene cylinder")) && condition.family === "compressed_gas") score += 50;
  if (text.includes("defect not corrected") && condition.family === "tools_equipment") score += 45;
  if (text.includes("hard hat") && condition.equipmentTerms && condition.equipmentTerms.includes("hard hat")) score += 45;
  if (text.includes("no fire watch") && condition.family === "fire_safety") score += 35;
  if (text.includes("backup alarm") && condition.citation === "56.14132(a)") score += 50;
  if (text.includes("not chocked") && condition.citation === "56.14207") score += 50;

  // Scope-authoritative precision boosts for realistic library-derived phrasing
  if ((text.includes("leading edge") || text.includes("deck edge")) && condition.conditionId === "V2_OSHA_CONSTRUCTION_FALL_LEADING_EDGE") score += 60;
  if ((text.includes("hearing protection") || text.includes("earplugs") || text.includes("noise area")) && condition.family === "noise") score += 70;
  if ((text.includes("respirator") || text.includes("mask") || text.includes("spray operation") || text.includes("fumes")) && condition.family === "respiratory") score += 70;
  if ((text.includes("no fire watch") || text.includes("sparks near combustibles") || text.includes("combustibles nearby")) && condition.family === "welding_cutting") score += 35;
  if ((text.includes("hole") || text.includes("opening") || text.includes("manway")) && condition.family === "fall_protection") score += 60;
  if ((text.includes("unguarded edge") || text.includes("no fall protection") || text.includes("not tied off")) && condition.family === "fall_protection") score += 55;
  if ((text.includes("exit sign") || text.includes("emergency light") || text.includes("not illuminated")) && condition.family === "emergency_egress") score += 65;
  if ((text.includes("fire extinguisher") || text.includes("extinguisher")) && condition.family === "fire_safety") score += 55;
  if ((text.includes("missing guard") || text.includes("damaged guard")) && condition.conditionId === "OSHA_CONSTRUCTION_HAND_POWER_TOOLS_DEFECTIVE") score += 60;

  // Final disambiguators from 10k library-derived benchmark
  if ((text.includes("hot work") || text.includes("sparks near combustibles") || text.includes("combustibles nearby") || text.includes("no fire watch")) && condition.conditionId === "MSHA_FIRE_HOT_WORK_NO_FIRE_WATCH") score += 90;
  if ((text.includes("respirator not used") || text.includes("mask") || text.includes("cartridge") || text.includes("spray operation") || text.includes("fumes")) && condition.family === "respiratory") score += 100;
  if ((text.includes("hearing protection not worn") || text.includes("earplugs not worn") || text.includes("noise area")) && condition.family === "noise") score += 100;
  if ((text.includes("unexpected startup") || text.includes("no lock applied") || text.includes("stored energy")) && condition.family === "lockout_tagout") score += 100;
  if ((text.includes("cap missing") || text.includes("cylinder")) && condition.family === "compressed_gas") score += 90;
  if ((text.includes("hazard not corrected") || text.includes("site inspection")) && condition.family === "site_controls") score += 100;
  if ((text.includes("missing rung") || text.includes("damaged rung")) && condition.family === "ladder_safety") score += 100;
  if ((text.includes("inspection expired") || text.includes("fire extinguisher") || text.includes("extinguisher")) && condition.conditionId === "OSHA_GI_FIRE_EGRESS_EXTINGUISHER") score += 35;
  if ((text.includes("top of equipment") || text.includes("platform") || text.includes("unguarded edge")) && condition.family === "fall_protection") score += 75;

  // True NO_MATCH coverage gaps from 10k library-derived benchmark
  if ((text.includes("unsafe condition left open") || text.includes("inspection not performed")) && condition.family === "site_controls") score += 115;
  if ((text.includes("pit") && (text.includes("no permit") || text.includes("no attendant") || text.includes("no atmospheric test") || text.includes("ventilation missing"))) && condition.family === "confined_space") score += 115;
  if ((text.includes("defective") || text.includes("unstable")) && condition.family === "ladder_safety") score += 115;
  if ((text.includes("fire protection") && (text.includes("missing") || text.includes("blocked"))) && condition.family === "fire_safety") score += 115;
  if ((text.includes("scrap material") || text.includes("poor housekeeping") || text.includes("debris") || text.includes("trip hazard")) && condition.family === "housekeeping") score += 115;
  if (text.includes("inadequate illumination") && condition.family === "illumination") score += 115;
  if ((text.includes("no shielding") || text.includes("welding")) && condition.family === "welding_cutting") score += 80;
  if ((text.includes("clearing jam while energized") || text.includes("while energized")) && condition.family === "lockout_tagout") score += 115;

  // Material storage must outrank generic ladder "unstable"
  if ((text.includes("unstable stack") || text.includes("stored material") || text.includes("pallet") || text.includes("lumber") || text.includes("storage area")) && condition.conditionId === "OSHA_CONSTRUCTION_MATERIAL_STORAGE_UNSTABLE") score += 140;
  if ((text.includes("unstable stack") || text.includes("stored material") || text.includes("pallet") || text.includes("lumber") || text.includes("storage area")) && condition.family === "ladder_safety") score -= 120;

  // Blocked aisle at shipping is housekeeping, not emergency egress
  if ((text.includes("blocked aisle") || text.includes("shipping")) && condition.conditionId === "OSHA_GI_HOUSEKEEPING_WALKING_SURFACE") score += 140;
  if ((text.includes("blocked aisle") || text.includes("shipping")) && condition.family === "emergency_egress") score -= 120;

  // Manway/open hole unguarded is fall protection, not machine guarding
  if ((text.includes("manway") || text.includes("open hole") || text.includes("opening")) && text.includes("unguarded") && condition.conditionId === "V1_MSHA_OPEN_HOLE_UNGUARDED") score += 160;
  if ((text.includes("manway") || text.includes("open hole") || text.includes("opening")) && text.includes("unguarded") && condition.family === "machine_guarding") score -= 140;

  // OSHA/MSHA field validation upgrades
  if (
    (
      text.includes("elevated platform edge") ||
      text.includes("platform edge") ||
      text.includes("unguarded elevated platform") ||
      text.includes("unguarded edge at screen deck")
    ) &&
    !(
      text.includes("conveyor") ||
      text.includes("pulley") ||
      text.includes("roller") ||
      text.includes("shaft") ||
      text.includes("nip point")
    ) &&
    (text.includes("unguarded") || text.includes("without fall protection")) &&
    condition.conditionId === "V1_MSHA_WORKING_AT_HEIGHT_NO_PROTECTION"
  ) {
    score += 190;
    reasons.push("failure:unguarded elevated edge");
  }

  if (
    (text.includes("backup alarm") || text.includes("back up alarm") || text.includes("reverse alarm")) &&
    (text.includes("not working") || text.includes("inoperative") || text.includes("failed")) &&
    condition.citation === "56.14132(a)"
  ) {
    score += 220;
    reasons.push("failure:backup alarm not working");
  }

  if (
    (text.includes("fire extinguisher") || text.includes("extinguisher")) &&
    (text.includes("inspection tag expired") || text.includes("tag expired") || text.includes("expired")) &&
    condition.citation === "1910.157(c)(1)"
  ) {
    score += 220;
    reasons.push("failure:fire extinguisher inspection expired");
  }

  if (
    (text.includes("spraying coating") || text.includes("paint booth") || text.includes("spray operation")) &&
    (text.includes("without respirator") || text.includes("no respirator") || text.includes("respirator not used")) &&
    condition.family === "respiratory"
  ) {
    score += 220;
    reasons.push("failure:respirator not used");
  }

  if (
    (text.includes("stored lumber") || text.includes("stacked unstable") || text.includes("material area") || text.includes("jobsite material")) &&
    condition.conditionId === "OSHA_CONSTRUCTION_MATERIAL_STORAGE_UNSTABLE"
  ) {
    score += 220;
    reasons.push("failure:unstable material storage");
  }

  if (
    (text.includes("stored lumber") || text.includes("stacked unstable") || text.includes("material area") || text.includes("jobsite material")) &&
    condition.family === "ladder_safety"
  ) {
    score -= 180;
  }

  if (
    (text.includes("leading edge") || text.includes("construction deck")) &&
    (text.includes("exposed") || text.includes("without fall protection")) &&
    condition.conditionId === "V2_OSHA_CONSTRUCTION_FALL_LEADING_EDGE"
  ) {
    score += 220;
    reasons.push("failure:leading edge exposure");
  }

  if (
    (text.includes("catwalk") || text.includes("screen deck")) &&
    (text.includes("open edge") || text.includes("no handrail") || text.includes("missing handrail")) &&
    condition.conditionId === "V1_MSHA_WORKING_AT_HEIGHT_NO_PROTECTION"
  ) {
    score += 230;
    reasons.push("failure:catwalk open edge/no handrail");
  }

  if (
    (text.includes("electrical cabinet") || text.includes("cabinet door") || text.includes("energized parts")) &&
    (text.includes("left open") || text.includes("exposing") || text.includes("exposed")) &&
    condition.family === "electrical"
  ) {
    score += 230;
    reasons.push("failure:energized parts exposed");
  }

  if (
    text.includes("compressed air") &&
    (text.includes("without eye protection") || text.includes("no eye protection") || text.includes("not wearing eye protection")) &&
    condition.family === "ppe"
  ) {
    score += 230;
    reasons.push("failure:eye protection not used");
  }

  if (
    (text.includes("belt drive") || text.includes("drive belt")) &&
    (text.includes("no guard") || text.includes("exposed") || text.includes("unguarded")) &&
    condition.family === "machine_guarding"
  ) {
    score += 230;
    reasons.push("failure:belt drive exposed/no guard");
  }

  if (
    (text.includes("respirator") || text.includes("dusty cleanup") || text.includes("dust exposure")) &&
    (text.includes("not worn") || text.includes("without respirator") || text.includes("no respirator")) &&
    condition.family === "respiratory"
  ) {
    score += 260;
    reasons.push("failure:respirator not worn");
  }

  if (
    (text.includes("respirator") || text.includes("dusty cleanup")) &&
    (text.includes("not worn") || text.includes("without respirator") || text.includes("no respirator")) &&
    condition.family === "ppe"
  ) {
    score -= 160;
  }

  if (
    (text.includes("roof edge") || text.includes("elevated edge") || text.includes("leading edge")) &&
    (text.includes("without harness") || text.includes("not tied off") || text.includes("no harness")) &&
    condition.family === "fall_protection"
  ) {
    score += 260;
    reasons.push("failure:fall protection not used");
  }

  if (
    (text.includes("stairway") || text.includes("stairs")) &&
    (text.includes("missing handrail") || text.includes("no handrail")) &&
    (condition.family === "safe_access" || condition.citation === "1926.1052(c)")
  ) {
    score += 240;
    reasons.push("failure:stairway handrail missing");
  }

  if (
    (text.includes("stairway") || text.includes("stairs")) &&
    (text.includes("missing handrail") || text.includes("no handrail")) &&
    condition.family === "fire_safety"
  ) {
    score -= 180;
  }

  // Field validation gap: open electrical panel / energized conductors
  if (
    (
      text.includes("electrical panel left open") ||
      text.includes("panel left open") ||
      text.includes("control panel left open") ||
      text.includes("energized conductors exposed") ||
      text.includes("energized components exposed") ||
      text.includes("live parts exposed")
    ) &&
    condition.family === "electrical"
  ) {
    score += 180;
    reasons.push("failure:energized conductors exposed");
  }

  return { score, reason: reasons };
}


function detectScopeHint(text) {
  const value = String(text || '').toLowerCase();

  if (/\b(jobsite|construction site|masonry|sewer|concrete work|steel work|crane lift|elevated work)\b/.test(value)) {
    return 'construction';
  }

  if (/\b(pit|crusher|crusher tower|processing plant|mine|haul road|plant area)\b/.test(value)) {
    return 'mining';
  }

  if (/\b(warehouse|maintenance shop|maintenance room|compressor room|paint room|janitorial|work area|facility)\b/.test(value)) {
    return 'general_industry';
  }

  // Plain "plant" is ambiguous: leave unresolved unless benchmark/customer context says otherwise.
  return null;
}

function classifyObservation(observation, options = {}) {
  const text = norm(observation);
  const library = options.library || loadJson(LIBRARY_PATH);
  const suppressors = options.suppressors || loadJson(SUPPRESSORS_PATH);

  if (hasSafeSuppressor(text, suppressors)) {
    return {
      conditionId: "NO_MATCH",
      citation: "NO_MATCH",
      scope: "NO_MATCH",
      agency: "NONE",
      family: "other",
      confidence: 100,
      reviewRequired: false,
      reasons: ["global safe suppressor matched"],
      candidates: []
    };
  }

  const scopeHint = (options.context && options.context.industryScope) || detectScopeHint(observation);
  const candidateConditions = scopeHint
    ? library.conditions.filter((condition) => condition.scope === scopeHint)
    : library.conditions;

  const scored = candidateConditions
    .map(condition => {
      const result = scoreCondition(text, condition);
      return { condition, score: result.score, reasons: result.reason };
    })
    .filter(item => item.score >= 60 && item.reasons.some(r => r.startsWith("failure:")))
    .sort((a, b) => b.score - a.score);

  if (!scored.length) {
    return {
      conditionId: "NO_MATCH",
      citation: "NO_MATCH",
      scope: "NO_MATCH",
      agency: "NONE",
      family: "other",
      confidence: 0,
      reviewRequired: true,
      reasons: ["no condition exceeded zero score"],
      candidates: []
    };
  }

  const best = scored[0];
  const second = scored[1];
  const confidence = Math.max(0, Math.min(99, Math.round(best.score)));
  const floor = Number(best.condition.confidenceFloor || 90);
  const margin = second ? best.score - second.score : best.score;

  const reviewRequired = confidence < floor || margin < 15;

  const secondaryMatches = scored
    .slice(1)
    .filter(item => item.score >= 75 && item.condition.family !== best.condition.family)
    .slice(0, 3)
    .map(item => ({
      conditionId: item.condition.conditionId,
      citation: item.condition.citation,
      scope: item.condition.scope,
      family: item.condition.family,
      confidence: Math.min(99, Math.round(item.score)),
      reasons: item.reasons
    }));

  return {
    conditionId: best.condition.conditionId,
    citation: best.condition.citation,
    scope: best.condition.scope,
    agency: best.condition.agency,
    family: best.condition.family,
    primaryFamily: best.condition.family,
    secondaryFamilies: secondaryMatches.map(m => m.family),
    confidence,
    reviewRequired,
    reasons: best.reasons,
    secondaryMatches,
    candidates: scored.slice(0, 5).map(item => ({
      conditionId: item.condition.conditionId,
      citation: item.condition.citation,
      scope: item.condition.scope,
      family: item.condition.family,
      score: Math.round(item.score),
      reasons: item.reasons
    }))
  };
}

module.exports = {
  classifyObservation,
  scoreCondition,
  norm
};

if (require.main === module) {
  const observations = process.argv.slice(2);
  for (const observation of observations) {
    console.log(JSON.stringify({ observation, result: classifyObservation(observation) }, null, 2));
  }
}
