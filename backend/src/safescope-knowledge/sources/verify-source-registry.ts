import {
  SAFESCOPE_SOURCE_REGISTRY,
  getApprovedAutoIngestionSources,
  getSafeScopeSourcesByAuthorityTier,
} from "./safescope-source-registry";

console.log("SafeScope Source Registry");
console.log("Total sources:", SAFESCOPE_SOURCE_REGISTRY.length);

for (const tier of [1, 2, 3, 4, 5]) {
  const sources = getSafeScopeSourcesByAuthorityTier(tier);
  console.log(
    `Tier ${tier}:`,
    sources.length,
    sources.map((source) => source.sourceKey).join(", "),
  );
}

const autoSources = getApprovedAutoIngestionSources();
console.log("Auto-ingestion approved:", autoSources.length);
for (const source of autoSources) {
  console.log(
    `- ${source.sourceKey} | ${source.displayName} | tier ${source.authorityTier}`,
  );
}

const invalid = SAFESCOPE_SOURCE_REGISTRY.filter((source) => {
  return (
    !source.sourceKey ||
    !source.displayName ||
    !source.baseUrl ||
    !source.description ||
    !source.allowedUse ||
    !source.sourceType ||
    !source.authorityTier
  );
});

if (invalid.length) {
  console.error(
    "Invalid source records:",
    invalid.map((source) => source.sourceKey),
  );
  process.exit(1);
}

console.log("Registry verification passed.");
