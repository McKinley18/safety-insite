import { DataSource, ILike } from "typeorm";
import { config } from "dotenv";
import { SafeScopeKnowledgeDocument } from "../entities/safescope-knowledge-document.entity";
import { SafeScopeKnowledgeChunk } from "../entities/safescope-knowledge-chunk.entity";
import { fetch } from "undici";

config();

async function getGovInfoSections(title: string) {
  const url = `https://www.govinfo.gov/bulkdata/ECFR/title-${title}/ECFR-title${title}.xml`;
  const response = await fetch(url);
  const xml = await response.text();

  const sectionRegex =
    /<(?:DIV8|SECTION)[^>]*N="([^"]+)"[^>]*>([\s\S]*?)<\/(?:DIV8|SECTION)>/gi;
  const sections: { citation: string; part: string; chapter?: string }[] = [];

  // Need to find which Chapter these parts belong to for MSHA auditing
  // The XML structure usually nests parts within chapters.
  // For simplicity here, we assume Part-based mapping for Title 30 Chapter I.
  let match;
  while ((match = sectionRegex.exec(xml)) !== null) {
    const partMatch = match[1].split(".")[0].replace(/[^0-9]/g, "");
    sections.push({
      citation: `${title} CFR ${match[1]}`,
      part: partMatch,
    });
  }
  return sections;
}

function normalize(citation: string) {
  return citation
    .toUpperCase()
    .replace(/§\s*/g, "")
    .replace(/\s+/g, " ")
    .replace(/\.+$/, "")
    .trim();
}

async function run() {
  const ds = new DataSource({
    type: "postgres",
    url:
      process.env.DATABASE_URL ||
      "postgres://mckinley@localhost:5432/sentinel_safety",
    entities: [SafeScopeKnowledgeDocument, SafeScopeKnowledgeChunk],
    synchronize: false,
  });
  await ds.initialize();
  const chunkRepo = ds.getRepository(SafeScopeKnowledgeChunk);

  const titles = ["29", "30"];
  const mshaChapterIParts = ["56", "57", "75", "77"];
  const releaseCriticalSummary: Array<{
    name: string;
    expected: number;
    ingested: number;
    missing: number;
    coverage: string;
  }> = [];

  for (const title of titles) {
    console.log(`\nAuditing Title ${title}...`);
    const expected = await getGovInfoSections(title);
    const ingested = await chunkRepo
      .createQueryBuilder("c")
      .innerJoin("c.document", "d")
      .where("d.sourceType = 'regulation'")
      .andWhere("d.authorityTier = 1")
      .andWhere("d.sourceUrl ILIKE '%ecfr.gov%'")
      .andWhere("c.citation ILIKE :prefix", { prefix: `${title} CFR %` })
      .getMany();

    const ingestedCitations = new Set(
      ingested.map((c) => normalize(c.citation || "")),
    );

    const buckets: Record<string, typeof expected> = {};
    if (title === "29") {
      buckets["OSHA 1910"] = expected.filter((e) => e.part === "1910");
      buckets["OSHA 1926"] = expected.filter((e) => e.part === "1926");
      buckets["Other Title 29"] = expected.filter(
        (e) => e.part !== "1910" && e.part !== "1926",
      );
    } else {
      buckets["MSHA 56"] = expected.filter((e) => e.part === "56");
      buckets["MSHA 57"] = expected.filter((e) => e.part === "57");
      buckets["MSHA 75"] = expected.filter((e) => e.part === "75");
      buckets["MSHA 77"] = expected.filter((e) => e.part === "77");
      buckets["Other MSHA Chapter I"] = expected.filter(
        (e) => !mshaChapterIParts.includes(e.part) && Number(e.part) < 200,
      );
      buckets["Other Title 30"] = expected.filter((e) => Number(e.part) >= 200);
    }

    for (const [name, list] of Object.entries(buckets)) {
      const missing = list.filter(
        (e) => !ingestedCitations.has(normalize(e.citation)),
      );
      const ingestedCount = list.length - missing.length;
      const coverage =
        list.length > 0
          ? ((ingestedCount / list.length) * 100).toFixed(1)
          : "0.0";

      console.log(`\nBucket: ${name}`);
      console.log(
        `  Expected: ${list.length}, Ingested: ${ingestedCount}, Missing: ${missing.length}, Coverage: ${coverage}%`,
      );

      if (missing.length > 0) {
        console.log("  First 10 missing:");
        missing.slice(0, 10).forEach((m) => console.log(`   - ${m.citation}`));
      }

      if (
        [
          "OSHA 1910",
          "OSHA 1926",
          "MSHA 56",
          "MSHA 57",
          "MSHA 75",
          "MSHA 77",
        ].includes(name)
      ) {
        releaseCriticalSummary.push({
          name,
          expected: list.length,
          ingested: ingestedCount,
          missing: missing.length,
          coverage,
        });
      }
    }
  }

  console.log("\n--- Release-Critical Coverage Summary ---");
  for (const row of releaseCriticalSummary) {
    console.log(
      `${row.name}: Expected ${row.expected}, Ingested ${row.ingested}, Missing ${row.missing}, Coverage ${row.coverage}%`,
    );
  }

  await ds.destroy();
}

run().catch(console.error);
