import { StandardsIntelligenceService } from "./standards-intelligence.service";
import { DataSource, Repository } from "typeorm";
import { Standard } from "../../standards/entities/standard.entity";

async function runVerification() {
  const ds = new DataSource({
    type: "postgres",
    url:
      process.env.DATABASE_URL ||
      "postgres://mckinley@localhost:5432/sentinel_safety",
    entities: [Standard],
    synchronize: false,
  });
  await ds.initialize();
  const repo = ds.getRepository(Standard);
  const service = new StandardsIntelligenceService(repo);

  const scenarios = [
    {
      name: "MSHA machine guarding - conveyor tail pulley",
      text: "Unguarded conveyor tail pulley accessible from walkway during cleanup.",
      classification: "Machine Guarding",
      scopes: ["msha"],
    },
    {
      name: "MSHA electrical - energized conductor",
      text: "Exposed energized electrical conductor inside open panel. Worker troubleshooting nearby with shock and arc flash exposure.",
      classification: "Electrical",
      scopes: ["msha"],
    },
    {
      name: "OSHA GI machine guarding",
      text: "Employee exposed to unguarded rotating shaft and belt drive on production machine.",
      classification: "Machine Guarding",
      scopes: ["osha-general-industry"],
    },
    {
      name: "OSHA construction fall protection",
      text: "Worker exposed to unprotected roof edge during construction work.",
      classification: "Fall Protection",
      scopes: ["osha-construction"],
    },
  ];

  for (const scenario of scenarios) {
    const matches = await service.match({
      text: scenario.text,
      classification: scenario.classification,
      scopes: scenario.scopes,
      limit: 5,
    });

    console.log("\n---");
    console.log(scenario.name);
    console.log("Input:", scenario.text);

    for (const match of matches.slice(0, 3)) {
      console.log(
        `${match.band.toUpperCase()} | ${match.standard.citation} | score=${match.score} | ${match.standard.title}`,
      );
      console.log("Reasons:", match.reasons.slice(0, 6).join("; "));

      if (match.missingEvidence.length) {
        console.log(
          "Missing evidence:",
          match.missingEvidence.slice(0, 3).join(" | "),
        );
      }

      if (match.exclusionWarnings.length) {
        console.log(
          "Warnings:",
          match.exclusionWarnings.slice(0, 3).join(" | "),
        );
      }
    }
  }
  await ds.destroy();
}

runVerification().catch(console.error);
