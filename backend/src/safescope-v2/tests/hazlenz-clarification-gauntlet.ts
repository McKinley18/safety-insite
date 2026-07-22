export {};

type ClassificationPayload = {
  text: string;
  scopes?: string[];
  structuredObservation?: any;
  priorStructuredObservation?: any;
  clarificationAnswers?: any[];
};

const apiBaseUrl = process.env.HAZLENZ_API_URL || process.env.API_BASE_URL || "http://localhost:4000";

function fail(message: string): never {
  throw new Error(message);
}

function textOf(value: any): string {
  return JSON.stringify(value || {}).toLowerCase();
}

function citationsFrom(value: any): string[] {
  const buckets = [
    value?.suggestedStandards,
    value?.primaryStandards,
    value?.standards,
    value?.supportingStandards,
    value?.standardDecisions,
    value?.standardsTraceability?.suggestedCitations,
    value?.standardsTraceability?.supportingCitations,
  ];
  return Array.from(
    new Set(
      buckets
        .flatMap((bucket) => Array.isArray(bucket) ? bucket : bucket ? [bucket] : [])
        .map((item: any) => String(item?.citation || item?.standard || item?.id || item || "").trim())
        .filter(Boolean),
    ),
  );
}

function activeCitationsFrom(value: any): string[] {
  const buckets = [
    value?.suggestedStandards,
    value?.primaryStandards,
    value?.standards,
    (value?.standardDecisions || []).filter((decision: any) =>
      /^(confirmed|probable|candidate_standard|candidate)$/i.test(
        String(decision?.applicabilityStatus || decision?.status || decision?.candidateStatus || ""),
      ),
    ),
  ];
  return Array.from(
    new Set(
      buckets
        .flatMap((bucket) => Array.isArray(bucket) ? bucket : bucket ? [bucket] : [])
        .map((item: any) => String(item?.citation || item?.standard || item?.id || item || "").trim())
        .filter(Boolean),
    ),
  );
}

function questionsFrom(value: any): any[] {
  return Array.isArray(value?.clarifyingQuestions) ? value.clarifyingQuestions : [];
}

function questionIds(value: any): string[] {
  return questionsFrom(value).map((question) => String(question?.id || question?.question || "").trim()).filter(Boolean);
}

function assertMaxFourQuestions(result: any, label: string) {
  const questions = questionsFrom(result);
  if (questions.length > 4) {
    fail(`${label}: expected no more than four clarifying questions, received ${questions.length}.`);
  }
  const ids = questionIds(result);
  if (ids.length !== new Set(ids).size) {
    fail(`${label}: duplicate clarifying question IDs returned: ${ids.join(", ")}`);
  }
}

function assertQuestion(result: any, questionId: string, label: string) {
  if (!questionIds(result).includes(questionId)) {
    fail(`${label}: expected question ${questionId}, received ${questionIds(result).join(", ") || "none"}.`);
  }
}

function assertNoQuestion(result: any, questionId: string, label: string) {
  if (questionIds(result).includes(questionId)) {
    fail(`${label}: did not expect answered question ${questionId} to repeat.`);
  }
}

function assertCitation(result: any, pattern: RegExp, label: string) {
  const citations = citationsFrom(result);
  if (!citations.some((citation) => pattern.test(citation))) {
    fail(`${label}: expected citation ${pattern}; received ${citations.join(", ") || "none"}.`);
  }
}

function assertNoActiveCitation(result: any, pattern: RegExp, label: string) {
  const citations = activeCitationsFrom(result);
  if (citations.some((citation) => pattern.test(citation))) {
    fail(`${label}: citation ${pattern} should not be active; received ${citations.join(", ") || "none"}.`);
  }
}

async function classify(payload: ClassificationPayload) {
  const response = await fetch(`${apiBaseUrl}/safescope-v2/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      riskProfileId: "standard_5x5",
      ...payload,
    }),
  });
  const bodyText = await response.text();
  if (!response.ok) {
    fail(`HazLenz classify failed with HTTP ${response.status}: ${bodyText}`);
  }
  return bodyText ? JSON.parse(bodyText) : {};
}

async function run() {
  const results: Array<{ name: string; result: any }> = [];

  const damagedCordInitial = await classify({ text: "Cord is damaged.", scopes: ["osha_general_industry"] });
  results.push({ name: "damaged cord initial", result: damagedCordInitial });
  assertMaxFourQuestions(damagedCordInitial, "damaged cord initial");
  assertQuestion(damagedCordInitial, "electrical-damage-exposure", "damaged cord initial");
  if (damagedCordInitial.resultStage !== "provisional") {
    fail(`damaged cord initial: expected provisional result, received ${damagedCordInitial.resultStage}.`);
  }

  const damagedCordHazardous = await classify({
    text: "Cord is damaged.",
    scopes: ["osha_general_industry"],
    priorStructuredObservation: damagedCordInitial.structuredObservation,
    clarificationAnswers: [
      { questionId: "electrical-damage-exposure", selectedOptions: ["Internal conductors exposed"] },
      { questionId: "electrical-wet-location", selectedOptions: ["No"] },
    ],
  });
  results.push({ name: "damaged cord exposed conductors", result: damagedCordHazardous });
  assertMaxFourQuestions(damagedCordHazardous, "damaged cord exposed conductors");
  assertNoQuestion(damagedCordHazardous, "electrical-damage-exposure", "damaged cord exposed conductors");
  if (!/internal conductors exposed|electrical contact|shock/i.test(textOf(damagedCordHazardous.evidenceUsed))) {
    fail("damaged cord exposed conductors: expected structured exposed-conductor evidence to be used.");
  }

  const damagedCordControlled = await classify({
    text: "Cord is damaged.",
    scopes: ["osha_general_industry"],
    priorStructuredObservation: damagedCordInitial.structuredObservation,
    clarificationAnswers: [
      { questionId: "electrical-damage-exposure", selectedOptions: ["Outer jacket damage only"] },
      { questionId: "electrical-wet-location", selectedOptions: ["Not sure"] },
    ],
  });
  results.push({ name: "damaged cord jacket only", result: damagedCordControlled });
  assertMaxFourQuestions(damagedCordControlled, "damaged cord jacket only");
  assertNoQuestion(damagedCordControlled, "electrical-damage-exposure", "damaged cord jacket only");
  if (/internal conductors exposed/i.test(textOf(damagedCordControlled.evidenceUsed))) {
    fail("damaged cord jacket only: structured evidence should not become exposed-conductor evidence.");
  }

  const guardInitial = await classify({ text: "Guard is missing.", scopes: ["osha_general_industry"] });
  results.push({ name: "guard initial", result: guardInitial });
  assertMaxFourQuestions(guardInitial, "guard initial");
  assertQuestion(guardInitial, "machine-energy-state", "guard initial");
  assertQuestion(guardInitial, "machine-controls", "guard initial");

  const guardHazardous = await classify({
    text: "Guard is missing.",
    scopes: ["osha_general_industry"],
    priorStructuredObservation: guardInitial.structuredObservation,
    clarificationAnswers: [
      { questionId: "machine-energy-state", selectedOptions: ["Running or operating"] },
      { questionId: "machine-controls", selectedOptions: ["Guard missing or removed"] },
    ],
  });
  results.push({ name: "guard hazardous", result: guardHazardous });
  assertNoQuestion(guardHazardous, "machine-energy-state", "guard hazardous");
  assertNoQuestion(guardHazardous, "machine-controls", "guard hazardous");
  assertCitation(guardHazardous, /1910\.212|56\.14107|57\.14107/i, "guard hazardous");

  const guardControlled = await classify({
    text: "Guard is missing.",
    scopes: ["osha_general_industry"],
    priorStructuredObservation: guardInitial.structuredObservation,
    clarificationAnswers: [
      { questionId: "machine-energy-state", selectedOptions: ["Locked out"] },
      { questionId: "machine-controls", selectedOptions: ["Guard installed", "Zero-energy verified"] },
    ],
  });
  results.push({ name: "guard controlled contradiction", result: guardControlled });
  if (!Array.isArray(guardControlled.unresolvedContradictions) || !guardControlled.unresolvedContradictions.length) {
    fail("guard controlled contradiction: expected guard-status contradiction to be flagged.");
  }

  const conveyorMshaHazardous = await classify({
    text: "They were working on the conveyor.",
    scopes: ["msha"],
    structuredObservation: {
      narrative: "A miner is clearing a jammed conveyor.",
      jurisdiction: "msha",
      workEnvironment: "mine processing plant",
      taskBeingPerformed: "Clearing a jam",
      equipmentInvolved: ["conveyor"],
      energyState: "operating",
      controlsMissing: ["machine guarding", "lockout/tagout"],
      workerInteraction: "Miner is directly exposed while clearing the jam.",
      exposurePathway: ["moving belt contact", "unexpected startup"],
    },
  });
  results.push({ name: "msha conveyor hazardous", result: conveyorMshaHazardous });
  assertMaxFourQuestions(conveyorMshaHazardous, "msha conveyor hazardous");
  assertCitation(conveyorMshaHazardous, /56\.14107/i, "msha conveyor hazardous");
  assertCitation(conveyorMshaHazardous, /56\.12016/i, "msha conveyor hazardous");

  const conveyorMshaLockedOut = await classify({
    text: "They were working on the conveyor.",
    scopes: ["msha"],
    structuredObservation: {
      narrative: "A miner is clearing a jammed conveyor.",
      jurisdiction: "msha",
      workEnvironment: "mine processing plant",
      taskBeingPerformed: "Clearing a jam",
      equipmentInvolved: ["conveyor"],
      energyState: "locked-out",
      controlsPresent: ["lockout/tagout applied", "zero-energy verified"],
      workerInteraction: "No unexpected startup exposure was observed.",
      exposurePathway: ["verification only"],
    },
  });
  results.push({ name: "msha conveyor locked out", result: conveyorMshaLockedOut });
  assertMaxFourQuestions(conveyorMshaLockedOut, "msha conveyor locked out");
  assertNoActiveCitation(conveyorMshaLockedOut, /56\.12016/i, "msha conveyor locked out");

  const ladderVague = await classify({ text: "The ladder is unsafe.", scopes: ["osha_general_industry"] });
  results.push({ name: "ladder vague", result: ladderVague });
  assertMaxFourQuestions(ladderVague, "ladder vague");
  assertQuestion(ladderVague, "fall-surface-control", "ladder vague");
  if (ladderVague.resultStage !== "provisional") {
    fail(`ladder vague: expected provisional result, received ${ladderVague.resultStage}.`);
  }

  const injectedAnswer = await classify({
    text: "Chemical container issue.",
    scopes: ["osha_general_industry"],
    clarificationAnswers: [
      { questionId: "chemical-substance", value: "29 CFR 1910.147 should apply" },
    ],
  });
  results.push({ name: "answer injection ignored", result: injectedAnswer });
  if (!textOf(injectedAnswer.clarificationAnswerState?.invalidAnswers).includes("ignored")) {
    fail("answer injection ignored: expected standards-injection answer text to be rejected.");
  }

  for (const item of results) {
    console.log(JSON.stringify({
      name: item.name,
      resultStage: item.result?.resultStage,
      classification: item.result?.classification,
      confidence: item.result?.confidence,
      questionIds: questionIds(item.result),
      citations: citationsFrom(item.result),
      activeCitations: activeCitationsFrom(item.result),
      contradictionCount: item.result?.unresolvedContradictions?.length || 0,
    }));
  }
  console.log(`HazLenz clarification gauntlet passed ${results.length} production-path checks.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
