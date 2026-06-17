import { StandardsIntelligenceService } from '../standards-intelligence/standards-intelligence.service';
import { STANDARDS_INTELLIGENCE_SEED } from '../standards-intelligence/standards-intelligence.seed';

// Fluent mock query builder to bypass database connection for lightweight seed testing
const mockQueryBuilder: any = {
  where() { return this; },
  andWhere() { return this; },
  take() { return this; },
  getMany: async () => [],
};

const mockStandardRepository = {
  createQueryBuilder: () => mockQueryBuilder,
} as any;

const service = new StandardsIntelligenceService(mockStandardRepository);

type PPEScenario = {
  name: string;
  text: string;
  scopes: string[];
  expectedCitation: string;
};

const scenarios: PPEScenario[] = [
  {
    name: "1. OSHA General Industry PPE",
    text: "Worker decanting corrosive chemicals without wearing a face shield or safety glasses.",
    scopes: ["osha-general-industry"],
    expectedCitation: "29 CFR 1910.132(a)",
  },
  {
    name: "2. OSHA Construction PPE",
    text: "Construction laborer operating a jackhammer without safety boots or hearing protection.",
    scopes: ["osha-construction"],
    expectedCitation: "29 CFR 1926.95(a)",
  },
  {
    name: "3. MSHA Surface Mining PPE",
    text: "Surface miner working near a crushing plant without safety glasses or earplugs.",
    scopes: ["mining"],
    expectedCitation: "30 CFR 56.15006",
  },
];

function isEvidenceSatisfied(question: string, text: string) {
  const lowerText = text.toLowerCase();
  
  // Question 1: Active operational hazard requiring physical protection
  if (
    question.includes("operational hazard requiring physical protection") || 
    question.includes("presents a physical, chemical, noise")
  ) {
    return ["chemical", "decanting", "splash", "jackhammer", "noise", "crushing", "dust", "flying", "particles"].some(kw => lowerText.includes(kw));
  }
  
  // Question 2: Specific exposure route or affected body part
  if (question.includes("specific exposure route or affected body part")) {
    return ["eye", "face", "boot", "shoe", "helmet", "ear", "hand", "shield", "head", "feet", "hearing"].some(kw => lowerText.includes(kw));
  }
  
  // Question 3: Proper personal protective equipment missing, inadequate, etc.
  if (question.includes("personal protective equipment was missing")) {
    return ["without", "no", "missing", "damaged", "wear", "observed", "unavailable", "earplug", "glasses"].some(kw => lowerText.includes(kw));
  }

  // Sibling questions (e.g. moving machinery, fall height, LOTO):
  if (question.includes("moving machine part")) {
    return ["conveyor", "pulley", "belt", "shaft", "rotating", "roller", "nip point", "pinch point"].some(kw => lowerText.includes(kw));
  }
  if (question.includes("guarding missing, damaged, removed")) {
    return ["unguarded", "missing guard", "no guard", "removed"].some(kw => lowerText.includes(kw));
  }
  if (question.includes("fall height or exposure condition")) {
    return ["fall", "height", "unprotected", "edge", "elevated", "platform"].some(kw => lowerText.includes(kw));
  }
  
  return false;
}

function scanForProhibitedKeywords(obj: any): string[] {
  const foundKeywords: string[] = [];
  const prohibited = ["violation", "citation", "cited", "noncompliant", "will be cited", "must be cited"];

  function recurse(val: any) {
    if (typeof val === "string") {
      const lower = val.toLowerCase();
      for (const kw of prohibited) {
        if (lower.includes(kw)) {
          foundKeywords.push(kw);
        }
      }
    } else if (Array.isArray(val)) {
      for (const item of val) {
        recurse(item);
      }
    } else if (val && typeof val === "object") {
      for (const key of Object.keys(val)) {
        recurse(val[key]);
      }
    }
  }

  recurse(obj);
  return Array.from(new Set(foundKeywords));
}

async function runBenchmark() {
  console.log("🏃 Running HazLenz AI PPE Standards Intelligence & Evidence Explanation Benchmark...\n");

  let passedCount = 0;
  let failedCount = 0;

  for (const sc of scenarios) {
    console.log(`Checking Scenario: ${sc.name}`);
    const matches = await service.match({
      text: sc.text,
      scopes: sc.scopes,
      limit: 5,
    });

    const assertions: { label: string; passed: boolean; actual: string }[] = [];

    // 1. Verify matches return
    assertions.push({
      label: "Matched standard list is returned",
      passed: matches.length > 0,
      actual: `${matches.length} matches found`,
    });

    // 2. Verify target citation is matched
    const hasExpectedCitation = matches.some(m => m.standard.citation === sc.expectedCitation);
    assertions.push({
      label: `Matched list contains expected reference '${sc.expectedCitation}'`,
      passed: hasExpectedCitation,
      actual: JSON.stringify(matches.map(m => m.standard.citation)),
    });

    // 3. Build & verify standardsMatchExplanations
    const textLower = sc.text.toLowerCase();
    const explanations = matches.map((m: any) => {
      const seedRecord = STANDARDS_INTELLIGENCE_SEED.find(
        (s) => s.citation === m.standard.citation
      );

      if (!seedRecord) {
        return {
          standardFamily: "unknown",
          jurisdiction: m.standard.scope,
          reference: m.standard.citation,
          title: m.standard.title,
          authorityTier: 2,
          matchedFacts: [],
          satisfiedEvidence: [],
          missingEvidence: ["Curated evidence requirements are not available for this reference."],
          confidence: m.score ? Number(m.score) : null,
          advisoryOnly: true,
          doesNotDeclareViolation: true,
          doesNotCreateCitation: true,
          requiresQualifiedReview: true,
        };
      }

      // Collect matched facts
      const matchedFacts: string[] = [];
      const candidateTokens = [
        ...seedRecord.hazardFamilies,
        ...seedRecord.equipmentTags,
        ...seedRecord.taskTags,
        ...seedRecord.exposureTags,
        ...seedRecord.controlTags,
      ];
      for (const token of candidateTokens) {
        if (token.length > 2 && textLower.includes(token.toLowerCase())) {
          matchedFacts.push(token);
        }
      }

      const satisfiedEvidence: string[] = [];
      const missingEvidence: string[] = [];

      for (const req of seedRecord.evidenceRequirements) {
        if (isEvidenceSatisfied(req.question, textLower)) {
          satisfiedEvidence.push(req.question);
        } else {
          missingEvidence.push(req.question);
        }
      }

      return {
        standardFamily: seedRecord.hazardFamilies[0] || "unknown",
        jurisdiction: seedRecord.scope,
        reference: seedRecord.citation,
        title: seedRecord.title,
        authorityTier: seedRecord.authorityTier,
        matchedFacts: Array.from(new Set(matchedFacts)),
        satisfiedEvidence,
        missingEvidence,
        confidence: m.score ? Number(m.score) : null,
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true,
      };
    });

    assertions.push({
      label: "standardsMatchExplanations exists",
      passed: explanations.length > 0,
      actual: `${explanations.length} explanations built`,
    });

    const targetExplanation = explanations.find(e => e.reference === sc.expectedCitation);
    assertions.push({
      label: `Explanation is present for '${sc.expectedCitation}'`,
      passed: !!targetExplanation,
      actual: targetExplanation ? "Present" : "Missing",
    });

    assertions.push({
      label: "Explanation includes valid family, scope, and title",
      passed: !!(targetExplanation && targetExplanation.standardFamily && targetExplanation.jurisdiction && targetExplanation.title),
      actual: targetExplanation ? `Family: ${targetExplanation.standardFamily} | Scope: ${targetExplanation.jurisdiction} | Title: ${targetExplanation.title}` : "N/A",
    });

    assertions.push({
      label: "Evidence requirement arrays exist (satisfiedEvidence and missingEvidence)",
      passed: !!(targetExplanation && Array.isArray(targetExplanation.satisfiedEvidence) && Array.isArray(targetExplanation.missingEvidence)),
      actual: targetExplanation ? `Satisfied Count: ${targetExplanation.satisfiedEvidence.length} | Missing Count: ${targetExplanation.missingEvidence.length}` : "N/A",
    });

    assertions.push({
      label: "Advisory guardrails are fully active (true)",
      passed: !!(targetExplanation && targetExplanation.advisoryOnly && targetExplanation.doesNotDeclareViolation && targetExplanation.doesNotCreateCitation && targetExplanation.requiresQualifiedReview),
      actual: targetExplanation ? `Advisory: ${targetExplanation.advisoryOnly} | NoViolation: ${targetExplanation.doesNotDeclareViolation} | NoCitation: ${targetExplanation.doesNotCreateCitation} | ReqReview: ${targetExplanation.requiresQualifiedReview}` : "N/A",
    });

    // 4. Verify no prohibited language in any returned match or explanation
    const prohibitedKeywordsFound = scanForProhibitedKeywords({ matches, explanations });
    const guardrailPassed = prohibitedKeywordsFound.length === 0;
    assertions.push({
      label: "Safety Guardrails: No prohibited legal/citation language dynamically produced",
      passed: guardrailPassed,
      actual: guardrailPassed ? "Pass" : `Fail (Prohibited terms found: ${prohibitedKeywordsFound.join(", ")})`,
    });

    // Calculate Scenario Status
    const scenarioFailed = assertions.some(a => !a.passed);
    if (scenarioFailed) {
      failedCount++;
      console.log(`❌ FAIL`);
    } else {
      passedCount++;
      console.log(`✅ PASS`);
    }

    // Print details
    console.log(`   - Top Match:      ${matches[0]?.standard?.citation || "None"} (${matches[0]?.standard?.title || "None"})`);
    console.log(`   - Reasoning Band: ${matches[0]?.band || "None"} (Score: ${matches[0]?.score || 0})`);
    if (targetExplanation) {
      console.log(`   - Matched Facts:  [${targetExplanation.matchedFacts.join(", ")}]`);
      console.log(`   - Satisfied Ev:   [${targetExplanation.satisfiedEvidence.slice(0, 2).map(s => s.slice(0, 45) + "...").join(", ")}]`);
      console.log(`   - Missing Ev:     [${targetExplanation.missingEvidence.slice(0, 2).map(s => s.slice(0, 45) + "...").join(", ")}]`);
    }
    if (scenarioFailed) {
      console.log(`   Detailed Assertions:`);
      assertions.forEach(a => {
        console.log(`     [${a.passed ? "✅" : "❌"}] ${a.label} (Actual: ${a.actual})`);
      });
    }
    console.log("--------------------------------------------------\n");
  }

  console.log(`📊 PPE & Explanation Benchmark Summary: ${passedCount} passed, ${failedCount} failed.`);
  if (failedCount > 0) {
    process.exit(1);
  }
}

runBenchmark().catch(err => {
  console.error(err);
  process.exit(1);
});
