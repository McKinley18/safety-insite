const BASE_URL = process.env.SENTINEL_API_URL || "http://localhost:4000";

type TestCase = {
  name: string;
  payload: {
    description: string;
    hazardCategory?: string;
    source: "MSHA" | "OSHA_CONSTRUCTION" | "OSHA_GENERAL_INDUSTRY";
    limit: number;
  };
  expectedTopCitations: string[];
};

const tests: TestCase[] = [
  {
    name: "MSHA conveyor tail pulley guarding",
    payload: {
      description:
        "unguarded moving conveyor tail pulley with exposed pinch point near walkway",
      hazardCategory: "Machine Guarding",
      source: "MSHA",
      limit: 8,
    },
    expectedTopCitations: [
      "30 CFR 56.14107(a)",
      "30 CFR 56.14107",
      "30 CFR 57.14107",
      "30 CFR 77.400",
    ],
  },
  {
    name: "OSHA construction scaffold missing guardrails",
    payload: {
      description:
        "employee working on scaffold platform without guardrails or fall protection",
      hazardCategory: "Fall Protection",
      source: "OSHA_CONSTRUCTION",
      limit: 8,
    },
    expectedTopCitations: ["1926.451", "29 CFR 1926.451"],
  },
];

async function run() {
  let failed = 0;

  for (const test of tests) {
    const response = await fetch(`${BASE_URL}/applicable-standards/suggest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(test.payload),
    });

    if (!response.ok) {
      failed++;
      console.error(`❌ ${test.name}: HTTP ${response.status}`);
      console.error(await response.text());
      continue;
    }

    const data = await response.json();
    const top = data?.matches?.[0];

    if (!top) {
      failed++;
      console.error(`❌ ${test.name}: no matches returned`);
      continue;
    }

    if (!test.expectedTopCitations.includes(top.citation)) {
      failed++;
      console.error(`❌ ${test.name}`);
      console.error(
        `   Expected one of:      ${test.expectedTopCitations.join(", ")}`,
      );
      console.error(`   Actual top citation:   ${top.citation}`);
      console.error(`   Actual top heading:    ${top.heading}`);
      continue;
    }

    console.log(
      `✅ ${test.name}: ${top.citation} (${top.confidence}% confidence)`,
    );
  }

  if (failed > 0) {
    console.error(`\n${failed} regression test(s) failed.`);
    process.exit(1);
  }

  console.log("\nAll applicable standards regression checks passed.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
