import { SAFESCOPE_SOURCE_REGISTRY } from "../sources/safescope-source-registry";
import { getSourceGovernance } from "../sources/source-governance-helper";
import { getSourceRole } from "../sources/source-role-helper";

const expectedSourceKeys = [
  "niosh-mining-publications",
  "niosh-numbered-publications",
  "niosh-health-hazard-evaluations",
  "niosh-alerts",
  "niosh-criteria-documents",
  "niosh-face-reports",
  "csb-investigation-reports",
  "osha-fatality-catastrophe-data",
  "msha-fatality-reports",
  "osha-safety-health-topics",
  "osha-publications",
  "osha-compliance-assistance",
  "osha-directives",
  "osha-standard-interpretations",
  "msha-safety-alerts",
  "msha-program-policy-manual",
  "msha-compliance-assistance",
  "msha-health-topic-pages",
  "ansi-assp-standards-metadata",
  "nfpa-standards-metadata",
  "astm-standards-metadata",
  "iso-standards-metadata",
  "acgih-tlv-metadata",
  "internal-supervisor-feedback",
  "internal-site-memory",
  "internal-corrective-action-history",
  "internal-repeat-findings",
  "internal-training-records",
  "internal-near-misses",
];

const sources = SAFESCOPE_SOURCE_REGISTRY;
const keys = sources.map((source) => source.sourceKey);
const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);

if (duplicates.length) {
  throw new Error(
    `Duplicate source keys found: ${Array.from(new Set(duplicates)).join(", ")}`,
  );
}

const sourceByKey = new Map(
  sources.map((source) => [source.sourceKey, source]),
);
const missing = expectedSourceKeys.filter((key) => !sourceByKey.has(key));

if (missing.length) {
  throw new Error(`Missing expected source keys: ${missing.join(", ")}`);
}

const byTier: Record<string, string[]> = {};
const byAuthorityRole: Record<string, string[]> = {};
const byReasoningUse: Record<string, string[]> = {};
const licenseCheck: string[] = [];
const needsApproval: string[] = [];

for (const source of sources) {
  const role = getSourceRole(source.sourceType, source.authorityTier);
  const governance = getSourceGovernance({
    sourceType: source.sourceType,
    sourceRole: role,
    authorityTier: source.authorityTier,
  });

  if (!governance?.authorityRole || !governance?.reasoningUse) {
    throw new Error(`Missing governance mapping for ${source.sourceKey}`);
  }

  if (
    source.sourceKey.includes("standards-metadata") &&
    governance.trustLimits.canCiteAsStandard
  ) {
    throw new Error(
      `Consensus metadata cannot cite as standard: ${source.sourceKey}`,
    );
  }

  if (
    source.sourceKey.startsWith("internal-") &&
    governance.trustLimits.canCiteAsStandard
  ) {
    throw new Error(
      `Internal source cannot cite as standard: ${source.sourceKey}`,
    );
  }

  if (
    (source.sourceType.includes("fatality") ||
      source.sourceType.includes("incident")) &&
    governance.reasoningUse === "primary_compliance_basis"
  ) {
    throw new Error(
      `Fatality/case source cannot be primary compliance basis: ${source.sourceKey}`,
    );
  }

  if (
    source.sourceKey.startsWith("niosh-") &&
    governance.authorityRole === "enforceable_regulation"
  ) {
    throw new Error(
      `Federal research cannot be enforceable regulation: ${source.sourceKey}`,
    );
  }

  byTier[`Tier ${source.authorityTier}`] =
    byTier[`Tier ${source.authorityTier}`] || [];
  byTier[`Tier ${source.authorityTier}`].push(source.sourceKey);

  byAuthorityRole[governance.authorityRole] =
    byAuthorityRole[governance.authorityRole] || [];
  byAuthorityRole[governance.authorityRole].push(source.sourceKey);

  byReasoningUse[governance.reasoningUse] =
    byReasoningUse[governance.reasoningUse] || [];
  byReasoningUse[governance.reasoningUse].push(source.sourceKey);

  if (governance.trustLimits.requiresLicenseCheck) {
    licenseCheck.push(source.sourceKey);
  }

  if (source.requiresApproval || !source.approvedForAutoIngestion) {
    needsApproval.push(source.sourceKey);
  }
}

console.log("SafeScope Source Expansion Registry Verification");
console.log(`Total registry count: ${sources.length}`);

console.log("\nSources by authority tier:");
for (const [tier, items] of Object.entries(byTier).sort()) {
  console.log(`- ${tier}: ${items.length} ${items.join(", ")}`);
}

console.log("\nSources by governance authorityRole:");
for (const [role, items] of Object.entries(byAuthorityRole).sort()) {
  console.log(`- ${role}: ${items.length} ${items.join(", ")}`);
}

console.log("\nSources by reasoningUse:");
for (const [use, items] of Object.entries(byReasoningUse).sort()) {
  console.log(`- ${use}: ${items.length} ${items.join(", ")}`);
}

console.log("\nExpected upgrade source keys:");
for (const key of expectedSourceKeys) {
  const source = sourceByKey.get(key);
  console.log(`- ${key}: ${source ? source.displayName : "MISSING"}`);
}

console.log("\nSources requiring license check:");
console.log(licenseCheck.length ? licenseCheck.join(", ") : "None");

console.log("\nSources requiring approval / not auto-approved:");
console.log(needsApproval.length ? needsApproval.join(", ") : "None");

console.log("\nSource expansion registry verification passed.");
