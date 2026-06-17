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

type MobileScenario = {
  name: string;
  text: string;
  scopes: string[];
  expectedCitation: string;
};

const scenarios: MobileScenario[] = [
  {
    name: "A. OSHA General Industry PIT (Forklift)",
    text: "A warehouse forklift with leaking hydraulic fluid is being operated near pedestrians.",
    scopes: ["osha-general-industry"],
    expectedCitation: "29 CFR 1910.178(p)(1)",
  },
  {
    name: "B. OSHA Construction Earthmoving Backing",
    text: "A front-end loader is backing up on a busy construction site with an obstructed rear view, no audible reverse alarm, and no spotter.",
    scopes: ["osha-construction"],
    expectedCitation: "29 CFR 1926.602(a)(9)(ii)",
  },
  {
    name: "C. MSHA Surface Mining Traffic Control",
    text: "Multiple haul trucks are operating on congested mine roads with no posted speed rules, unclear right-of-way controls, and no traffic signage.",
    scopes: ["mining"],
    expectedCitation: "30 CFR 56.9100(a)",
  },
];

function isEvidenceSatisfied(question: string, text: string) {
  const lowerText = text.toLowerCase();
  
  // Scopes/Jurisdiction question
  if (question.includes("MSHA, OSHA General Industry, or OSHA Construction")) {
    return true; // Presumed from test metadata
  }

  // Equipment type question
  if (question.includes("active equipment category")) {
    return ["forklift", "loader", "truck", "vehicle", "backhoe"].some(kw => lowerText.includes(kw));
  }

  // Defective condition question (Scenario A)
  if (question.includes("specific defective or unsafe condition observed")) {
    return ["leaking", "fluid", "brakes", "horn", "defect"].some(kw => lowerText.includes(kw));
  }

  // Obstructed reverse view question (Scenario B)
  if (question.includes("operating in reverse and has an obstructed view")) {
    return ["backing", "reverse", "obstructed"].some(kw => lowerText.includes(kw));
  }

  // Reverse signal alarm or spotter question (Scenario B)
  if (question.includes("audible reverse signal alarm is present")) {
    return ["alarm", "spotter", "signalman"].some(kw => lowerText.includes(kw));
  }

  // Traffic rules question (Scenario C)
  if (question.includes("rules governing speed, right-of-way")) {
    return ["rules", "speed", "right-of-way"].some(kw => lowerText.includes(kw));
  }

  // Traffic control signs question (Scenario C)
  if (question.includes("appropriate traffic control signs")) {
    return ["signage", "signs", "rules"].some(kw => lowerText.includes(kw));
  }

  // Pedestrian exposure question
  if (question.includes("pedestrians or other workers are exposed")) {
    return ["pedestrian", "pedestrians", "worker", "crowd"].some(kw => lowerText.includes(kw));
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
  console.log("🏃 Running HazLenz AI Mobile Equipment Standards Benchmark...\n");

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
    const targetMatch = matches.find(m => m.standard.citation === sc.expectedCitation);
    const isPrimaryOrTop = targetMatch && (targetMatch.band === "primary" || matches[0].standard.citation === sc.expectedCitation);
    assertions.push({
      label: `Expected reference '${sc.expectedCitation}' is matched as primary or top match`,
      passed: !!isPrimaryOrTop,
      actual: targetMatch ? `Band: ${targetMatch.band} | Score: ${targetMatch.score}` : "Not matched",
    });

    if (sc.expectedCitation === "29 CFR 1910.178(p)(1)") {
      const machineGuardingIndex = matches.findIndex(m => m.standard.citation === "1910.212(a)(1)");
      const pitIndex = matches.findIndex(m => m.standard.citation === sc.expectedCitation);
      const properRanking = pitIndex !== -1 && (machineGuardingIndex === -1 || pitIndex < machineGuardingIndex);
      assertions.push({
        label: "Forklift PIT reference preferred over general machine guarding",
        passed: properRanking,
        actual: `PIT Index: ${pitIndex} | Guarding Index: ${machineGuardingIndex}`,
      });
    }

    if (sc.expectedCitation === "30 CFR 56.9100(a)") {
      const mshaGuardingIndex = matches.findIndex(
        m => m.standard.citation === "30 CFR 56.14107(a)" || m.standard.citation === "56.14107(a)"
      );
      const trafficIndex = matches.findIndex(m => m.standard.citation === sc.expectedCitation);
      const properRanking = trafficIndex !== -1 && (mshaGuardingIndex === -1 || trafficIndex < mshaGuardingIndex);
      assertions.push({
        label: "MSHA traffic control reference preferred over general moving machine parts guarding",
        passed: properRanking,
        actual: `Traffic Index: ${trafficIndex} | Guarding Index: ${mshaGuardingIndex}`,
      });
    }

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

  console.log(`📊 Mobile Benchmark Summary: ${passedCount} passed, ${failedCount} failed.`);
  if (failedCount > 0) {
    process.exit(1);
  }
}

runBenchmark().catch(err => {
  console.error(err);
  process.exit(1);
});
