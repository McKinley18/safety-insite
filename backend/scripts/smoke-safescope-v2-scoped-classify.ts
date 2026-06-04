import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import { SafescopeV2Service } from "../src/safescope-v2/safescope-v2.service";

type Case = {
  name: string;
  text: string;
  scopes: string[];
  expectedTopAny: RegExp[];
  rejectTop: RegExp[];
};

const cases: Case[] = [
  {
    name: "MNM surface conveyor guarding classifies with Part 56",
    scopes: ["msha_mnm_surface"],
    text: "Surface metal nonmetal mine conveyor tail pulley has exposed moving machine parts and the guard is missing.",
    expectedTopAny: [/56\.14107/i],
    rejectTop: [/57\.14107/i, /75\.1722/i, /77\.400/i, /1910/i, /1926/i],
  },
  {
    name: "MNM underground conveyor guarding classifies with Part 57",
    scopes: ["msha_mnm_underground"],
    text: "Underground metal nonmetal mine conveyor tail pulley has exposed moving machine parts and the guard is missing.",
    expectedTopAny: [/57\.14107/i],
    rejectTop: [/56\.14107/i, /75\.1722/i, /77\.400/i, /1910/i, /1926/i],
  },
  {
    name: "Coal underground conveyor guarding classifies with Part 75",
    scopes: ["msha_coal_underground"],
    text: "Underground coal mine conveyor drive pulley and exposed moving machine parts were not guarded from contact.",
    expectedTopAny: [/75\.1722/i],
    rejectTop: [/56\.14107/i, /57\.14107/i, /77\.400/i, /1910/i, /1926/i],
  },
  {
    name: "MNM surface electrical lockout classifies with Part 56",
    scopes: ["msha_mnm_surface"],
    text: "Surface metal nonmetal mine electrically powered equipment was being mechanically repaired before it was deenergized and locked out.",
    expectedTopAny: [/56\.12016/i],
    rejectTop: [/57\.12016/i, /75\.511/i, /1910\.147/i, /1926/i],
  },
  {
    name: "MNM underground electrical lockout classifies with Part 57",
    scopes: ["msha_mnm_underground"],
    text: "Underground metal nonmetal mine electrically powered equipment was being mechanically repaired before it was deenergized and locked out.",
    expectedTopAny: [/57\.12016/i],
    rejectTop: [/56\.12016/i, /75\.511/i, /1910\.147/i, /1926/i],
  },
];

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const service = app.get(SafescopeV2Service);

  const results = [];

  for (const testCase of cases) {
    const result: any = await service.classify(testCase.text, testCase.scopes);

    const standards = result?.suggestedStandards || [];
    const top = standards[0] || null;
    const topText = `${top?.citation || ""} ${top?.rationale || ""} ${top?.heading || ""}`;

    const expectedMatched = testCase.expectedTopAny.some((pattern) =>
      pattern.test(topText),
    );

    const rejectedMatched = testCase.rejectTop.some((pattern) =>
      pattern.test(topText),
    );

    results.push({
      name: testCase.name,
      passed: expectedMatched && !rejectedMatched,
      classification: result?.classification,
      scopes: testCase.scopes,
      top,
      expectedMatched,
      rejectedMatched,
      standards: standards.slice(0, 5).map((standard: any) => ({
        citation: standard?.citation,
        score: standard?.score,
        source: standard?.source,
        matchingReasons: standard?.matchingReasons,
      })),
    });
  }

  const valid = results.every((result) => result.passed);

  console.log(
    JSON.stringify(
      {
        valid,
        caseCount: results.length,
        passedCount: results.filter((result) => result.passed).length,
        failedCount: results.filter((result) => !result.passed).length,
        results,
      },
      null,
      2,
    ),
  );

  await app.close();

  if (!valid) process.exit(1);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
