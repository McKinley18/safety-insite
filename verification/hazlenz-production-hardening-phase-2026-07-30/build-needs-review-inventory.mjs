import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../hazlenz-regulatory-release-phase/", import.meta.url);
const sources = [
  ["original", "ORIGINAL_CORPUS_RERUN.json"],
  ["holdout", "HOLDOUT_CORPUS_RERUN.json"],
  ["expanded", "EXPANDED_CORPUS_RESULTS.json"],
];
const classify = (item) => {
  const reason = (item.reasons || []).join(" ").toLowerCase();
  const actual = item.actual || {};
  const missing = (actual.applicabilityDecisions || []).flatMap((d) => d.missingPredicates || []);
  const clusters = [];
  if (/family absent/.test(reason)) clusters.push("regulatory_family_absent");
  if (/clarification/.test(reason)) clusters.push("clarification_missing_or_unresolved");
  if (/predicate|candidate|standard unavailable/.test(reason) || missing.length) clusters.push("material_predicate_missing");
  if (/jurisdiction/.test(reason)) clusters.push("jurisdiction_uncertain");
  if (/safe|corrected|control/.test(reason)) clusters.push("safe_state_unresolved");
  if (/standard|citation|promot|rank/.test(reason)) clusters.push("standard_selection_or_hydration");
  if (/risk/.test(reason)) clusters.push("risk_provisional");
  if (!clusters.length) clusters.push("legitimate_reviewer_only_or_other");
  return [...new Set(clusters)];
};
const records = [];
for (const [corpus, file] of sources) {
  const parsed = JSON.parse(await readFile(new URL(file, root), "utf8"));
  for (const item of parsed.results.filter((row) => row.verdict === "NEEDS REVIEW")) {
    records.push({
      corpus, id: item.id, jurisdiction: item.jurisdiction, family: item.domain,
      lifeCritical: Boolean(item.expected?.lifeCritical),
      clusters: classify(item),
      reasons: item.reasons,
      requiredCitationFamilies: item.expected?.requiredCitationFamilies || [],
      missingPredicates: (item.actual?.applicabilityDecisions || []).flatMap((d) => d.missingPredicates || []),
      clarificationPresent: (item.actual?.clarificationQuestions || []).length > 0,
      definitiveCitations: item.actual?.definitiveCitations || [],
      candidateCitations: item.actual?.candidateCitations || [],
    });
  }
}
const clusterCounts = {};
for (const record of records) for (const cluster of record.clusters) clusterCounts[cluster] = (clusterCounts[cluster] || 0) + 1;
await writeFile(new URL("NEEDS_REVIEW_RESULTS.json", import.meta.url), JSON.stringify({
  generatedFrom: sources.map(([, file]) => file), total: records.length, clusterCounts, records,
}, null, 2) + "\n");
console.log(JSON.stringify({ total: records.length, clusterCounts }));
