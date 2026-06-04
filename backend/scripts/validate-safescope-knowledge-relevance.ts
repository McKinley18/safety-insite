import { dataSource } from "../src/database/data-source";
import { SafeScopeKnowledgeDocument } from "../src/safescope-knowledge/entities/safescope-knowledge-document.entity";
import { SafeScopeKnowledgeChunk } from "../src/safescope-knowledge/entities/safescope-knowledge-chunk.entity";
import { SafeScopeKnowledgeIngestionRun } from "../src/safescope-knowledge/entities/safescope-knowledge-ingestion-run.entity";

type RelevanceScenario = {
  name: string;
  queryTerms: string[];
  requiredAny: string[];
  forbiddenTop?: string[];
  expectedSourceTypes?: string[];
};

const scenarios: RelevanceScenario[] = [
  {
    name: "Machine guarding",
    queryTerms: ["machine", "guarding", "unguarded", "moving", "parts"],
    requiredAny: ["guard", "machine", "moving", "nip", "pulley", "conveyor"],
    forbiddenTop: ["dipping", "coating", "spray", "1910.125"],
    expectedSourceTypes: ["regulation", "fatality_alert", "fatality_report", "standard_interpretation"],
  },
  {
    name: "Lockout tagout",
    queryTerms: ["lockout", "tagout", "hazardous", "energy", "maintenance"],
    requiredAny: ["lockout", "tagout", "energy", "1910.147", "deenergize"],
    forbiddenTop: ["dipping", "coating", "spray", "1910.125"],
    expectedSourceTypes: ["regulation", "standard_interpretation", "fatality_report"],
  },
  {
    name: "Fall protection",
    queryTerms: ["fall", "protection", "unprotected", "edge", "anchorage"],
    requiredAny: ["fall", "edge", "guardrail", "anchorage", "1926.501", "1910.28"],
    forbiddenTop: ["dipping", "coating", "spray", "1910.125"],
    expectedSourceTypes: ["regulation", "fatality_alert", "fatality_report"],
  },
  {
    name: "Mobile equipment struck-by",
    queryTerms: ["mobile", "equipment", "pedestrian", "struck", "traffic"],
    requiredAny: ["mobile", "equipment", "traffic", "pedestrian", "haulage", "struck"],
    forbiddenTop: ["dipping", "coating", "spray", "1910.125"],
    expectedSourceTypes: ["regulation", "fatality_alert", "fatality_report", "best_practice_guidance"],
  },
  {
    name: "Confined space",
    queryTerms: ["confined", "space", "atmospheric", "testing", "permit"],
    requiredAny: ["confined", "space", "permit", "atmosphere", "1910.146", "1926.120"],
    forbiddenTop: ["dipping", "coating", "spray", "1910.125"],
    expectedSourceTypes: ["regulation", "standard_interpretation"],
  },
  {
    name: "Electrical exposed energized conductors",
    queryTerms: ["electrical", "exposed", "energized", "conductors"],
    requiredAny: ["electrical", "energized", "conductor", "wiring", "1910.303", "1926.404"],
    forbiddenTop: ["dipping", "coating", "spray", "1910.125"],
    expectedSourceTypes: ["regulation", "standard_interpretation", "fatality_report"],
  },
];

function normalize(value: unknown) {
  return String(value || "").toLowerCase();
}

function scoreChunk(chunk: SafeScopeKnowledgeChunk) {
  const haystack = normalize([
    chunk.citation,
    chunk.sectionHeading,
    chunk.chunkSummary,
    chunk.chunkText,
    chunk.document?.title,
    chunk.document?.citation,
    chunk.document?.sourceType,
    ...(chunk.hazardTags || []),
    ...(chunk.equipmentTags || []),
    ...(chunk.taskTags || []),
    ...(chunk.standardTags || []),
    ...(chunk.lessonTags || []),
  ].join(" "));

  return haystack;
}

async function main() {
  await dataSource.initialize();

  const docRepo = dataSource.getRepository(SafeScopeKnowledgeDocument);
  const chunkRepo = dataSource.getRepository(SafeScopeKnowledgeChunk);
  const runRepo = dataSource.getRepository(SafeScopeKnowledgeIngestionRun);

  console.log("\nSafeScope Knowledge Relevance Validation");
  console.log("========================================");

  const docCount = await docRepo.count();
  const chunkCount = await chunkRepo.count();
  const runCount = await runRepo.count();

  console.log(`Documents: ${docCount}`);
  console.log(`Chunks: ${chunkCount}`);
  console.log(`Ingestion runs: ${runCount}`);

  const sourceTypeRows = await docRepo
    .createQueryBuilder("doc")
    .select("doc.sourceType", "sourceType")
    .addSelect("COUNT(*)", "count")
    .groupBy("doc.sourceType")
    .orderBy("doc.sourceType", "ASC")
    .getRawMany();

  const sourceTypes = new Set(sourceTypeRows.map((row) => String(row.sourceType)));

  console.log("\nSource types:");
  for (const row of sourceTypeRows) {
    console.log(`- ${row.sourceType}: ${row.count}`);
  }

  let failures = 0;

  for (const scenario of scenarios) {
    const params = Object.fromEntries(
      scenario.queryTerms.map((term, index) => [`term${index}`, `%${term.toLowerCase()}%`]),
    );

    const where = scenario.queryTerms
      .map((_, index) => {
        return [
          `LOWER(chunk.chunkText) LIKE :term${index}`,
          `LOWER(COALESCE(chunk.chunkSummary, '')) LIKE :term${index}`,
          `LOWER(COALESCE(chunk.citation, '')) LIKE :term${index}`,
          `LOWER(COALESCE(document.title, '')) LIKE :term${index}`,
          `LOWER(COALESCE(document.citation, '')) LIKE :term${index}`,
        ].join(" OR ");
      })
      .map((clause) => `(${clause})`)
      .join(" OR ");

    const candidates = await chunkRepo
      .createQueryBuilder("chunk")
      .leftJoinAndSelect("chunk.document", "document")
      .where(where, params)
      .take(30)
      .getMany();

    const ranked = candidates
      .map((chunk) => {
        const haystack = scoreChunk(chunk);
        const positiveHits = scenario.requiredAny.filter((term) =>
          haystack.includes(term.toLowerCase()),
        ).length;

        const queryHits = scenario.queryTerms.filter((term) =>
          haystack.includes(term.toLowerCase()),
        ).length;

        const forbiddenHits = (scenario.forbiddenTop || []).filter((term) =>
          haystack.includes(term.toLowerCase()),
        ).length;

        const authorityBonus = Math.max(0, 8 - Number(chunk.authorityTier || 5));
        const score = positiveHits * 20 + queryHits * 8 + authorityBonus - forbiddenHits * 80;

        return { chunk, score, positiveHits, queryHits, forbiddenHits };
      })
      .sort((a, b) => b.score - a.score);

    const top = ranked[0];
    const topText = top ? scoreChunk(top.chunk) : "";
    const hasRequiredSignal = top && top.positiveHits > 0;
    const hasForbiddenTop = top && top.forbiddenHits > 0;
    const hasExpectedSourceType = (scenario.expectedSourceTypes || []).some((type) =>
      sourceTypes.has(type),
    );

    const passed = Boolean(top && hasRequiredSignal && !hasForbiddenTop);

    if (!passed) failures += 1;

    console.log(`\n${passed ? "✅" : "❌"} ${scenario.name}`);
    console.log(`Candidates: ${candidates.length}`);
    console.log(
      `Top: ${
        top
          ? `${top.chunk.citation || top.chunk.document?.citation || top.chunk.document?.title} | source=${top.chunk.document?.sourceType} | score=${top.score}`
          : "none"
      }`,
    );

    if (!hasExpectedSourceType) {
      console.log(
        `⚠ Missing supporting source type coverage. Expected one of: ${(scenario.expectedSourceTypes || []).join(", ")}`,
      );
    }

    if (hasForbiddenTop) {
      console.log("❌ Top result contains forbidden unrelated terms.");
    }

    if (!hasRequiredSignal) {
      console.log("❌ Top result does not contain required relevance signals.");
    }
  }

  if (runCount === 0) {
    console.log("\n⚠ No ingestion run history exists. Add ingestion-run logging next.");
  }

  if (failures > 0) {
    console.log(`\n❌ Knowledge relevance validation failed: ${failures} scenario(s) need attention.`);
    await dataSource.destroy();
    process.exit(1);
  }

  console.log("\n✅ Knowledge relevance validation passed.");
  await dataSource.destroy();
}

main().catch(async (error) => {
  console.error(error);
  try {
    await dataSource.destroy();
  } catch {}

  process.exit(1);
});
