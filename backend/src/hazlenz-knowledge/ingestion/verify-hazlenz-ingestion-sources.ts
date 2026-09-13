import { HAZLENZ_SOURCE_REGISTRY } from "../sources/hazlenz-source-registry";

function verify() {
  const tiers: Record<number, string[]> = {};

  for (const source of HAZLENZ_SOURCE_REGISTRY) {
    if (!tiers[source.authorityTier]) tiers[source.authorityTier] = [];
    tiers[source.authorityTier].push(
      `${source.displayName} (${source.sourceKey})`,
    );
  }

  console.log("HazLenz Knowledge Source Ingestion Coverage:");
  for (let i = 1; i <= 5; i++) {
    console.log(`\nTier ${i}:`);
    (tiers[i] || []).forEach((s) => console.log(` - ${s}`));
  }
}

verify();
