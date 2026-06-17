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

type WalkingScenario = {
  name: string;
  text: string;
  scopes: string[];
  expectedCitation: string;
};

const scenarios: WalkingScenario[] = [
  {
    name: "A. OSHA GI platform/open edge",
    text: "Employee is working on an elevated fixed platform with an open side and no guardrail.",
    scopes: ["osha-general-industry"],
    expectedCitation: "29 CFR 1910.28",
  },
  {
    name: "B. OSHA GI ladder setup",
    text: "Worker is using a portable ladder on an uneven surface and the ladder is not secured or stabilized.",
    scopes: ["osha-general-industry"],
    expectedCitation: "29 CFR 1910.23",
  },
  {
    name: "C. OSHA Construction leading edge",
    text: "Construction employee is working near an unprotected leading edge more than six feet above a lower level with no guardrail, safety net, or fall arrest system noted.",
    scopes: ["osha-construction"],
    expectedCitation: "29 CFR 1926.501",
  },
  {
    name: "D. MSHA Surface Mining elevated work",
    text: "Miner is working on an elevated screen deck where there is danger of falling and no safety line or fall protection is described.",
    scopes: ["mining"],
    expectedCitation: "30 CFR 56.15005",
  },
  {
    name: "E. False-positive same-level housekeeping",
    text: "Water is present on a flat warehouse walkway causing a slip hazard, but no elevation, open edge, hole, ladder, or fall-to-lower-level exposure is described.",
    scopes: ["osha-general-industry"],
    expectedCitation: "29 CFR 1910.22",
  },
];

function isEvidenceSatisfied(question: string, text: string) {
  const lowerText = text.toLowerCase();
  
  // Platform edge questions
  if (question.includes("4 feet or more above a lower level")) {
    return lowerText.includes("elevated");
  }
  if (question.includes("open side, edge, or floor hole")) {
    return lowerText.includes("open side") || lowerText.includes("edge") || lowerText.includes("hole");
  }

  // Ladder questions
  if (question.includes("ladder type")) {
    return lowerText.includes("ladder");
  }
  if (question.includes("stabilized, secured")) {
    return lowerText.includes("not secured") || lowerText.includes("stabilized");
  }

  // Construction questions
  if (question.includes("construction work")) {
    return lowerText.includes("construction");
  }
  if (question.includes("6 feet or more above a lower level")) {
    return lowerText.includes("six feet") || lowerText.includes("6 feet");
  }

  // MSHA questions
  if (question.includes("danger of falling from elevation")) {
    return lowerText.includes("danger of falling");
  }

  // Housekeeping questions
  if (question.includes("walkway, passageway, or work area")) {
    return lowerText.includes("walkway");
  }
  if (question.includes("surface condition clean, orderly")) {
    return lowerText.includes("water");
  }
  
  return false;
}

function scanForProhibitedKeywords(obj: any): string[] {
  const foundKeywords: string[] = [];
  const prohibited = ["violation", "citation", "cited", "noncompliant", "must be cited", "will be cited"];

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
  console.log("🏃 Running HazLenz AI Walking-Working Surfaces Benchmark...\n");

  let passedCount = 0;
  let failedCount = 0;

  for (const sc of scenarios) {
    console.log(`Checking Scenario: ${sc.name}`);
    const matches = await service.match({
      text: sc.text,
      scopes: sc.scopes,
      limit: 5,
    });
    
    console.log("Matches Found:", matches.map(m => `${m.standard.citation} (Score: ${m.score}, Band: ${m.band})`));

    const assertions: { label: string; passed: boolean; actual: string }[] = [];

    // 1. Verify matches return
    assertions.push({
      label: "Matched standard list is returned",
      passed: matches.length > 0,
      actual: `${matches.length} matches found`,
    });

    // 2. Verify target citation is matched
    const targetMatch = matches.find(m => m.standard.citation === sc.expectedCitation);
    const isPrimaryOrTop = targetMatch && (
      targetMatch.band === "primary" || 
      (sc.expectedCitation === "29 CFR 1910.22" && matches[0].standard.citation === sc.expectedCitation) ||
      matches[0].standard.citation === sc.expectedCitation
    );
    assertions.push({
      label: `Expected reference '${sc.expectedCitation}' is matched as primary or top match`,
      passed: !!isPrimaryOrTop,
      actual: targetMatch ? `Band: ${targetMatch.band} | Score: ${targetMatch.score}` : "Not matched",
    });

    // 3. Build & verify standardsMatchExplanations
    const textLower = sc.text.toLowerCase();
    const explanations = matches.map((m: any) => {
      const seedRecord = STANDARDS_INTELLIGENCE_SEED.find(
        (s) => s.citation === m.standard.citation
      );

      if (!seedRecord) return { standardFamily: "unknown" }; // Minimal fallback

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
        satisfiedEvidence,
        missingEvidence,
        advisoryOnly: true,
        doesNotDeclareViolation: true,
        doesNotCreateCitation: true,
        requiresQualifiedReview: true,
      };
    });

    // 4. Verify no prohibited language
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

    if (scenarioFailed) {
      console.log(`   Detailed Assertions:`);
      assertions.forEach(a => {
        console.log(`     [${a.passed ? "✅" : "❌"}] ${a.label} (Actual: ${a.actual})`);
      });
    }
    console.log("--------------------------------------------------\n");
  }

  console.log(`📊 Walking-Working Surfaces Benchmark Summary: ${passedCount} passed, ${failedCount} failed.`);
  if (failedCount > 0) {
    process.exit(1);
  }
}

runBenchmark().catch(err => {
  console.error(err);
  process.exit(1);
});
