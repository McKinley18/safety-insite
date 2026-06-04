import "reflect-metadata";
import { DataSource } from "typeorm";
import { Standard } from "../entities/standard.entity";
import * as dotenv from "dotenv";

dotenv.config();

const ds = new DataSource({
  type: "postgres",
  url:
    process.env.DATABASE_URL ||
    "postgres://mckinley@localhost:5432/sentinel_safety",
  entities: [Standard],
  synchronize: false,
});

interface Rule {
  hazard: string;
  terms: string[];
}

const HAZARD_RULES: Rule[] = [
  {
    hazard: "Machine Guarding",
    terms: [
      "moving machine parts",
      "machine guarding",
      "guard moving",
      "nip point",
      "point of operation",
      "mechanical power-transmission",
      "conveyor + guard",
      "conveyor + pulley",
      "conveyor + belt",
    ],
  },
  {
    hazard: "Electrical",
    terms: [
      "electrical equipment",
      "energized",
      "power circuit",
      "conductor",
      "electrical conductor",
      "voltage",
      "circuit",
      "fuse",
      "transformer",
      "grounding",
      "de-energized",
    ],
  },
  {
    hazard: "Lockout / Stored Energy",
    terms: [
      "lockout",
      "tagout",
      "de-energize",
      "deenergize",
      "block against motion",
      "stored energy",
      "repairs or maintenance + powered equipment",
    ],
  },
  {
    hazard: "Fall Protection",
    terms: [
      "fall protection",
      "unprotected side",
      "unprotected edge",
      "guardrail",
      "safety net",
      "personal fall arrest",
      "hole + fall",
      "opening + fall",
      "scaffold + fall",
      "ladder safety",
    ],
  },
  {
    hazard: "Mobile Equipment / Traffic",
    terms: [
      "mobile equipment",
      "powered haulage",
      "haul truck",
      "loader",
      "traffic",
      "backup alarm",
      "berm",
      "seat belt",
      "parking brake",
    ],
  },
  {
    hazard: "Hazard Communication",
    terms: [
      "hazard communication",
      "chemical",
      "sds",
      "safety data sheet",
      "label",
      "container label",
    ],
  },
];

const CONTROL_RULES: Rule[] = [
  { hazard: "Guarding", terms: ["guarding"] },
  { hazard: "Lockout/Tagout", terms: ["lockout", "tagout"] },
  { hazard: "De-energize", terms: ["de-energize"] },
  { hazard: "Inspection", terms: ["inspection"] },
  { hazard: "Fall Protection", terms: ["fall protection"] },
  { hazard: "Guardrail", terms: ["guardrail"] },
  { hazard: "PPE", terms: ["ppe"] },
  { hazard: "Respiratory protection", terms: ["respiratory protection"] },
  { hazard: "Ventilation", terms: ["ventilation"] },
  { hazard: "Training", terms: ["training"] },
  { hazard: "Workplace examination", terms: ["workplace examination"] },
];

async function run() {
  await ds.initialize();
  const repo = ds.getRepository(Standard);
  const standards = await repo.find();

  let genericCount = 0;

  for (const s of standards) {
    const titleText = (s.title + " " + s.standardText).toLowerCase();
    const hazardCodes: string[] = [];
    const keywords: string[] = [];
    const requiredControls: string[] = [];

    const isGeneric =
      [
        "scope",
        "definitions",
        "incorporation by reference",
        "reserved",
        "appendix",
      ].some((g) => titleText.includes(g)) ||
      (titleText.includes("general requirements") &&
        !HAZARD_RULES.some((r) => r.terms.some((t) => titleText.includes(t))));

    if (isGeneric) {
      s.severityWeight = 0;
      s.hazardCodes = ["Administrative / Definitions"];
      s.requiredControls = [];
      s.keywords = ["definitions", "scope"];
      genericCount++;
    } else {
      s.severityWeight = 1;

      for (const rule of HAZARD_RULES) {
        if (
          rule.terms.some(
            (t) =>
              titleText.includes(t.split(" + ")[0]) &&
              (t.split(" + ")[1]
                ? titleText.includes(t.split(" + ")[1])
                : true),
          )
        ) {
          hazardCodes.push(rule.hazard);
          keywords.push(
            ...rule.terms.filter((t) =>
              titleText.includes(t.replace(" + ", " ")),
            ),
          );
        }
      }

      for (const rule of CONTROL_RULES) {
        if (rule.terms.some((t) => titleText.includes(t))) {
          requiredControls.push(rule.hazard);
        }
      }

      s.hazardCodes = Array.from(new Set(hazardCodes));
      s.keywords = Array.from(new Set(keywords));
      s.requiredControls = Array.from(new Set(requiredControls));
    }

    if (!s.plainLanguageSummary || s.plainLanguageSummary.length < 10) {
      s.plainLanguageSummary = s.title.slice(0, 100);
    }

    await repo.save(s);
  }

  const withHazards = standards.filter(
    (s) =>
      s.hazardCodes &&
      s.hazardCodes.length > 0 &&
      !s.hazardCodes.includes("Administrative / Definitions"),
  ).length;
  console.log(`Enriched ${standards.length} standards.`);
  console.log(`Generic records marked: ${genericCount}`);
  console.log(`Records with hazardCodes: ${withHazards}`);
  console.log(
    `Records without hazardCodes: ${standards.length - withHazards - genericCount}`,
  );
  await ds.destroy();
}

run().catch(console.error);
