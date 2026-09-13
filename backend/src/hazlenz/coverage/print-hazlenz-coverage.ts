import { KNOWLEDGE_MANIFEST } from "../knowledge-index/hazlenz-knowledge-index.seed";
import { HAZLENZ_KNOWLEDGE_SHARDS } from "../knowledge-shards/hazlenz-knowledge-shards.seed";
import { HAZLENZ_COVERAGE_BACKLOG } from "./hazlenz-coverage-backlog.seed";

const shardByKey = new Map(
  HAZLENZ_KNOWLEDGE_SHARDS.map((shard) => [shard.shardKey, shard]),
);

const activeRows = KNOWLEDGE_MANIFEST.map((entry) => {
  const shardKey = [
    entry.jurisdiction,
    entry.hazardFamily,
    entry.equipmentFamily,
    entry.taskMechanism,
  ].join("/");

  const shard = shardByKey.get(shardKey);

  return {
    jurisdiction: entry.jurisdiction,
    hazardFamily: entry.hazardFamily,
    equipmentFamily: entry.equipmentFamily,
    taskMechanism: entry.taskMechanism,
    shardKey,
    routeIndex: "yes",
    warmShard: shard ? "yes" : "no",
    bundleIds: entry.bundleIds.join(", "),
    sourceKeys: entry.sourceKeys.join(", "),
    citations: shard?.citations.join(", ") || "",
    evidencePrompts: shard?.evidenceNeeded.length || 0,
    controlPatterns: shard?.correctiveActionPatterns.length || 0,
    coverageStatus: shard ? "active_route_and_warm_shard" : "route_only",
  };
});

const backlogRows = HAZLENZ_COVERAGE_BACKLOG.map((item) => ({
  priority: item.priority,
  jurisdiction: item.jurisdiction,
  partOrSubpart: item.partOrSubpart,
  hazardFamily: item.hazardFamily,
  equipmentFamily: item.equipmentFamily,
  taskMechanism: item.taskMechanism,
  candidateCitations: item.candidateCitations.join(", "),
  status: item.status,
  title: item.title,
}));

console.log("\n=== ACTIVE HAZLENZ COVERAGE ===");
console.table(activeRows);

console.log("\n=== HAZLENZ COVERAGE BACKLOG ===");
console.table(backlogRows);

const summary = {
  activeRouteEntries: KNOWLEDGE_MANIFEST.length,
  warmShards: HAZLENZ_KNOWLEDGE_SHARDS.length,
  routeOnly: activeRows.filter((row) => row.warmShard === "no").length,
  activeRouteAndWarmShard: activeRows.filter((row) => row.warmShard === "yes").length,
  backlogItems: HAZLENZ_COVERAGE_BACKLOG.length,
  criticalBacklogItems: HAZLENZ_COVERAGE_BACKLOG.filter((item) => item.priority === "critical").length,
  highBacklogItems: HAZLENZ_COVERAGE_BACKLOG.filter((item) => item.priority === "high").length,
  activeJurisdictions: Array.from(new Set(activeRows.map((row) => row.jurisdiction))).sort(),
  activeHazardFamilies: Array.from(new Set(activeRows.map((row) => row.hazardFamily))).sort(),
  backlogHazardFamilies: Array.from(new Set(backlogRows.map((row) => row.hazardFamily))).sort(),
};

console.log("\n=== COVERAGE SUMMARY ===");
console.log(JSON.stringify(summary, null, 2));
