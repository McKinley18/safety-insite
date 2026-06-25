import { ApprovedKnowledgeRegistryIoService } from "../approved-knowledge-registry/approved-knowledge-registry-io.service";
import { HazLenzKnowledgeIndexService } from "../knowledge-index/hazlenz-knowledge-index.service";
import { STANDARDS_INTELLIGENCE_SEED } from "../standards-intelligence/standards-intelligence.seed";
import { STANDARDS_MAPPING } from "../standards-mapping.seed";
import { HAZLENZ_SUPPLEMENTAL_KNOWLEDGE_REGISTRY } from "../supplemental-knowledge/supplemental-knowledge.registry";
import { TAXONOMY } from "../taxonomy.seed";
import { standards as standardsSeed } from "../../standards/seed/standards.seed";
import { dataSource } from "../../database/data-source";
import { Standard } from "../../standards/standard.entity";
import { SafeScopeKnowledgeChunk } from "../../safescope-knowledge/entities/safescope-knowledge-chunk.entity";
import { HazardTaxonomy } from "../../intelligence-framework/entities/hazard-taxonomy.entity";
import { HazardStandardMapping } from "../../standards/entities/hazard-standard-mapping.entity";
import * as fs from "fs";
import * as path from "path";

type AuditIssue = { severity: "critical" | "warning"; message: string };

type FileRecordSummary = {
  label: string;
  count: number;
  files: string[];
};

function normalize(value: string) {
  return String(value || "").trim().toLowerCase();
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean).map((value) => String(value).trim())));
}

function readJsonCount(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return 0;
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (Array.isArray(data)) return data.length;
    if (Array.isArray(data?.records)) return data.records.length;
    if (Array.isArray(data?.chunks)) return data.chunks.length;
    if (Array.isArray(data?.items)) return data.items.length;
    return 0;
  } catch {
    return 0;
  }
}

function repoPath(...segments: string[]) {
  return path.resolve(__dirname, "../../../..", ...segments);
}

function countJsonSummaries(files: string[]): FileRecordSummary {
  return {
    label: files.join(", "),
    count: files.reduce((total, file) => total + readJsonCount(repoPath(file)), 0),
    files,
  };
}

function familiesCrosswalk(taxonomyFamily: string, mappingFamily: string) {
  const taxonomy = normalize(taxonomyFamily).replace(/\s+/g, "");
  const mapping = normalize(mappingFamily).replace(/\s+/g, "");
  if (!taxonomy || !mapping) return false;

  const aliases: Record<string, string[]> = {
    poweredmobileequipment: ["poweredmobileequipment", "mobileequipmenttraffic", "poweredindustrialtrucks", "mobileequipment"],
    mobileequipment: ["mobileequipment", "poweredmobileequipment", "mobileequipmenttraffic"],
    hazardcommunication: ["hazardcommunication", "hazcom", "chemicalstorage"],
    housekeeping: ["housekeeping", "walkingworkingsurfaces"],
    machine: ["machine", "machineguarding"],
    fall: ["fall", "fallprotection"],
    electrical: ["electrical"],
    ppe: ["ppe"],
    confinedspace: ["confinedspace"],
    trenching: ["trenching", "excavation"],
    rigging: ["liftingrigging", "rigging", "lifting"],
  };

  const candidateAliases = aliases[taxonomy] || [taxonomy];
  return candidateAliases.some((alias) => mapping.includes(alias) || alias.includes(mapping));
}

async function tryDbBackedCounts() {
  const shouldTry = process.argv.includes("--db") || String(process.env.HAZLENZ_AUDIT_DB_MODE || "").toLowerCase() === "1";
  if (!shouldTry) return null;

  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    const [standardsCount, chunkCount, taxonomyCount, mappingCount] = await Promise.all([
      dataSource.getRepository(Standard).count(),
      dataSource.getRepository(SafeScopeKnowledgeChunk).count(),
      dataSource.getRepository(HazardTaxonomy).count(),
      dataSource.getRepository(HazardStandardMapping).count(),
    ]);

    return {
      connected: true,
      standardsCount,
      chunkCount,
      taxonomyCount,
      mappingCount,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy().catch(() => undefined);
    }
  }
}

async function run() {
  const issues: AuditIssue[] = [];

  const curatedStandardsIntelligenceRecords = STANDARDS_INTELLIGENCE_SEED || [];
  const curatedCitations = curatedStandardsIntelligenceRecords.map((item) => normalize(item.citation));
  const uniqueCitations = unique(curatedCitations);
  const duplicateCitations = curatedCitations.filter((citation, index) => uniqueCitations.indexOf(citation) !== index);

  const missingFields = curatedStandardsIntelligenceRecords.filter((standard) => {
    return !standard.citation || !standard.title || !standard.plainLanguageSummary || !standard.sourceKey || !standard.sourceType || standard.authorityTier !== 1;
  });

  if (duplicateCitations.length) {
    issues.push({
      severity: "critical",
      message: `Duplicate standard citations detected in curated intelligence seed: ${unique(duplicateCitations).join(", ")}`,
    });
  }

  if (missingFields.length) {
    issues.push({
      severity: "critical",
      message: `Curated standards intelligence records missing required metadata: ${missingFields.slice(0, 8).map((item) => item.citation).join(", ")}`,
    });
  }

  const agencyCounts = curatedStandardsIntelligenceRecords.reduce<Record<string, number>>((acc, item) => {
    acc[item.agency] = (acc[item.agency] || 0) + 1;
    return acc;
  }, {});

  const taxonomyFamilies = Object.keys(TAXONOMY);
  const mappingFamilies = Object.keys(STANDARDS_MAPPING);
  const reachableMappingFamilies = mappingFamilies.filter((family) =>
    taxonomyFamilies.some((taxonomy) => familiesCrosswalk(taxonomy, family)),
  );
  const taxonomyCoverageGaps = taxonomyFamilies.filter((family) =>
    !mappingFamilies.some((mapping) => familiesCrosswalk(family, mapping)),
  );
  const mappingCoverageGaps = mappingFamilies.filter((family) =>
    !taxonomyFamilies.some((taxonomy) => familiesCrosswalk(taxonomy, family)),
  );

  if (taxonomyCoverageGaps.length) {
    issues.push({
      severity: "warning",
      message: `Taxonomy families without a standards-family route: ${taxonomyCoverageGaps.join(", ")}`,
    });
  }

  if (mappingCoverageGaps.length) {
    issues.push({
      severity: "warning",
      message: `Standards mapping families without a taxonomy route: ${mappingCoverageGaps.join(", ")}`,
    });
  }

  const knowledgeIndex = new HazLenzKnowledgeIndexService();
  const knowledgeSummary = knowledgeIndex.getIndexSummary();
  const registryIo = new ApprovedKnowledgeRegistryIoService();
  const registryCounts = registryIo.validateRegistry();

  const standardsMasterSources: FileRecordSummary = countJsonSummaries([
    "backend/src/standards/ingestion/osha.full.json",
    "backend/src/standards/ingestion/msha.full.json",
  ]);

  const standardsSeedCount = Array.isArray(standardsSeed) ? standardsSeed.length : 0;

  const regulationChunkSources: FileRecordSummary[] = [
    countJsonSummaries([
      "backend/src/standards/ingestion/osha.json",
      "backend/src/standards/ingestion/msha.json",
    ]),
  ];

  const registryCorpusFiles = [
    "safescope-data/approved-knowledge/registry/approved-knowledge-seed-records.v1.json",
    "safescope-data/approved-knowledge/registry/regulatory-expansion-v1.json",
    "safescope-data/approved-knowledge/registry/rec-msha-30-56-12.json",
  ];
  const registryCorpusCount = registryCorpusFiles.reduce((total, file) => total + readJsonCount(repoPath(file)), 0);

  const supplementalCounts = HAZLENZ_SUPPLEMENTAL_KNOWLEDGE_REGISTRY.reduce<Record<string, number>>((acc, item) => {
    acc[item.authorityTier] = (acc[item.authorityTier] || 0) + 1;
    return acc;
  }, {});

  const dbCounts = await tryDbBackedCounts();

  console.log("HazLenz knowledge completeness audit");
  console.log(`- curated standards-intelligence records: ${curatedStandardsIntelligenceRecords.length}`);
  console.log(`- curated unique citations: ${uniqueCitations.length}`);
  console.log(`- curated agency counts: ${Object.entries(agencyCounts).map(([agency, count]) => `${agency}=${count}`).join(", ")}`);
  console.log(`- standards master/source records (file-backed): ${standardsMasterSources.count}`);
  console.log(`- standards master/source files: ${standardsMasterSources.label}`);
  console.log(`- standards seed records: ${standardsSeedCount}`);
  console.log(`- regulation chunk records (file-backed): ${regulationChunkSources.map((summary) => summary.count).reduce((a, b) => a + b, 0)}`);
  console.log(`- regulation chunk files: ${regulationChunkSources.map((summary) => summary.label).join(" | ")}`);
  console.log(`- approved registry records: ${registryCounts.approvedCount}`);
  console.log(`- draft registry files discovered: ${registryCounts.draftCandidateCount}`);
  console.log(`- draft/seed registry corpus records: ${registryCorpusCount}`);
  console.log(`- supplemental knowledge entries: ${HAZLENZ_SUPPLEMENTAL_KNOWLEDGE_REGISTRY.length}`);
  console.log(`- supplemental tier counts: ${Object.entries(supplementalCounts).map(([tier, count]) => `${tier}=${count}`).join(", ")}`);
  console.log(`- knowledge index entries: ${knowledgeSummary.totalEntries}`);
  console.log(`- knowledge index jurisdictions: ${knowledgeSummary.jurisdictions.join(", ")}`);
  console.log(`- knowledge index hazard families: ${knowledgeSummary.hazardFamilies.join(", ")}`);
  console.log(`- taxonomy families with a standards route: ${reachableMappingFamilies.length}`);
  console.log(`- taxonomy families without a standards route: ${taxonomyCoverageGaps.length}`);
  console.log(`- standards mapping families without a taxonomy route: ${mappingCoverageGaps.length}`);
  console.log(`- registry invalid count: ${registryCounts.invalidCount}`);
  console.log(`- registry duplicate collisions: ${registryCounts.duplicateKeyCollisions}`);
  console.log(`- registry advisory guardrail failures: ${registryCounts.advisoryGuardrailFailures}`);

  if (dbCounts?.connected) {
    console.log(`- db standards rows: ${dbCounts.standardsCount}`);
    console.log(`- db knowledge chunk rows: ${dbCounts.chunkCount}`);
    console.log(`- db hazard taxonomy rows: ${dbCounts.taxonomyCount}`);
    console.log(`- db hazard-standard mapping rows: ${dbCounts.mappingCount}`);
  } else {
    console.log("- db-backed completeness mode: unavailable in this environment");
    if (dbCounts?.error) {
      console.log(`  ${dbCounts.error}`);
    }
    console.log("  Run: npm run audit:hazlenz-knowledge-completeness -- --db");
  }

  if (issues.length) {
    console.log("- completeness findings:");
    for (const issue of issues) {
      console.log(`  [${issue.severity.toUpperCase()}] ${issue.message}`);
    }
  } else {
    console.log("- completeness findings: none");
  }

  const criticalCount = issues.filter((issue) => issue.severity === "critical").length;
  if (criticalCount) {
    process.exitCode = 1;
  }
}

run();
