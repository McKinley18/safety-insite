import { StandardsIntelligenceService } from '../standards-intelligence/standards-intelligence.service';

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
  console.log("🏃 Running HazLenz AI PPE Standards Intelligence Benchmark...\n");

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

    // 3. Verify evidence requirements exist on the matched record
    const matchRecord = matches.find(m => m.standard.citation === sc.expectedCitation);
    const hasEvidenceRequirements = (matchRecord?.standard?.evidenceRequirements?.length || 0) > 0;
    assertions.push({
      label: "Evidence requirements are present in matched record",
      passed: hasEvidenceRequirements,
      actual: `${matchRecord?.standard?.evidenceRequirements?.length || 0} requirements found`,
    });

    // 4. Verify no prohibited language in any returned match
    const prohibitedKeywordsFound = scanForProhibitedKeywords(matches);
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
    console.log(`   - Evidence Req:   ${matchRecord?.standard?.evidenceRequirements?.[0]?.question || "None"}`);
    if (scenarioFailed) {
      console.log(`   Detailed Assertions:`);
      assertions.forEach(a => {
        console.log(`     [${a.passed ? "✅" : "❌"}] ${a.label} (Actual: ${a.actual})`);
      });
    }
    console.log("--------------------------------------------------\n");
  }

  console.log(`📊 PPE Benchmark Summary: ${passedCount} passed, ${failedCount} failed.`);
  if (failedCount > 0) {
    process.exit(1);
  }
}

runBenchmark().catch(err => {
  console.error(err);
  process.exit(1);
});
