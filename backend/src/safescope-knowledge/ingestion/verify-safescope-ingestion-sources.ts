import { SAFESCOPE_SOURCE_REGISTRY } from "../sources/safescope-source-registry";

function verify() {
  const tiers: Record<number, string[]> = {};

  for (const source of SAFESCOPE_SOURCE_REGISTRY) {
    if (!tiers[source.authorityTier]) tiers[source.authorityTier] = [];
    tiers[source.authorityTier].push(
      `${source.displayName} (${source.sourceKey})`,
    );
  }

  console.log("SafeScope Knowledge Source Ingestion Coverage:");
  for (let i = 1; i <= 5; i++) {
    console.log(`\nTier ${i}:`);
    (tiers[i] || []).forEach((s) => console.log(` - ${s}`));
  }
}

verify();
