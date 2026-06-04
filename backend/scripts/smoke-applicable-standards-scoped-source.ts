import { config } from "dotenv";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import { ApplicableStandardsService } from "../src/applicable-standards/applicable-standards.service";

config();

const cases = [
  {
    name: "MNM surface guarding routes to Part 56",
    source: "MSHA_MNM_SURFACE",
    description:
      "Surface metal nonmetal mine conveyor tail pulley has missing guard exposing rotating parts and pinch point.",
    expected: /30 CFR 56\.14107/i,
    rejected: /30 CFR 57\.14107|30 CFR 75\.1722|30 CFR 77\.400/i,
  },
  {
    name: "MNM underground guarding routes to Part 57",
    source: "MSHA_MNM_UNDERGROUND",
    description:
      "Underground metal nonmetal mine conveyor tail pulley has missing guard exposing rotating parts and pinch point.",
    expected: /30 CFR 57\.14107/i,
    rejected: /30 CFR 56\.14107|30 CFR 75\.1722|30 CFR 77\.400/i,
  },
  {
    name: "Coal underground guarding routes to Part 75",
    source: "MSHA_COAL_UNDERGROUND",
    description:
      "Underground coal mine conveyor drive pulley and exposed moving machine parts were not guarded from contact.",
    expected: /30 CFR 75\.1722/i,
    rejected: /30 CFR 56\.14107|30 CFR 57\.14107|30 CFR 77\.400/i,
  },
  {
    name: "MNM surface electrical lockout routes to Part 56",
    source: "MSHA_MNM_SURFACE",
    description:
      "Surface metal nonmetal mine electrically powered equipment was being mechanically repaired before it was deenergized and locked out.",
    expected: /30 CFR 56\.12016/i,
    rejected: /30 CFR 57\.12016|30 CFR 75\.511/i,
  },
  {
    name: "MNM underground electrical lockout routes to Part 57",
    source: "MSHA_MNM_UNDERGROUND",
    description:
      "Underground metal nonmetal mine electrically powered equipment was being mechanically repaired before it was deenergized and locked out.",
    expected: /30 CFR 57\.12016/i,
    rejected: /30 CFR 56\.12016|30 CFR 75\.511/i,
  },
];

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const service = app.get(ApplicableStandardsService);

  const results = [];

  for (const item of cases) {
    const matches = await service.suggest(
      item.description,
      undefined,
      item.source,
      5,
    );

    const top = matches[0];
    const topCitation = String(top?.citation || "");
    const passed =
      Boolean(top) &&
      item.expected.test(topCitation) &&
      !item.rejected.test(topCitation);

    results.push({
      name: item.name,
      passed,
      source: item.source,
      top: top
        ? {
            citation: top.citation,
            heading: top.heading,
            score: top.score,
            matchingReasons: top.matchingReasons,
          }
        : null,
    });
  }

  const valid = results.every((r) => r.passed);

  console.log(
    JSON.stringify(
      {
        valid,
        caseCount: results.length,
        passedCount: results.filter((r) => r.passed).length,
        failedCount: results.filter((r) => !r.passed).length,
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
