import { STANDARDS_INTELLIGENCE_SEED } from "./standards-intelligence.seed";

console.log(
  "Standards intelligence records:",
  STANDARDS_INTELLIGENCE_SEED.length,
);

const missing = STANDARDS_INTELLIGENCE_SEED.filter((standard) => {
  return (
    !standard.sourceKey ||
    !standard.sourceType ||
    !standard.allowedUse ||
    standard.authorityTier !== 1
  );
});

if (missing.length) {
  console.error(
    "Standards missing source registry metadata:",
    missing.map((standard) => standard.citation),
  );
  process.exit(1);
}

for (const standard of STANDARDS_INTELLIGENCE_SEED.slice(0, 12)) {
  console.log(
    `${standard.citation} | ${standard.sourceKey} | ${standard.sourceType} | tier ${standard.authorityTier} | ${standard.allowedUse}`,
  );
}

console.log("Standards source metadata verification passed.");
