import { SAFESCOPE_SOURCE_REGISTRY } from "../sources/safescope-source-registry";
import {
  getGovernanceConfig,
  GovernanceConfig,
} from "../ingestion/ingestion-control-plane";

function verify() {
  console.log("SafeScope Knowledge Ingestion Control Plane Audit:");

  const sources = SAFESCOPE_SOURCE_REGISTRY;
  const configMap = sources.map((s) => ({
    ...s,
    config: getGovernanceConfig(
      s.sourceKey,
      s.requiresApproval,
      s.sourceType,
      s.agency,
    ),
  }));

  console.log(`Total registry count: ${sources.length}`);

  const stats = (key: keyof GovernanceConfig) => {
    return configMap.reduce(
      (acc, c) => {
        const val = String(c.config[key]);
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  };

  console.log("\nConnector Statuses:", stats("connectorStatus"));
  console.log("Ingestion Modes:", stats("ingestionMode"));
  console.log("Review Policies:", stats("reviewPolicy"));
  console.log("Database Roles:", stats("databaseRole"));

  console.log("\nSource Control Summary:");
  configMap.forEach((c) => {
    console.log(
      `- ${c.sourceKey}: ${c.config.connectorStatus} / ${c.config.ingestionMode} / ${c.config.reviewPolicy} / ${c.config.databaseRole} [${c.refreshCadence || "N/A"}]`,
    );
  });

  const errors: string[] = [];
  configMap.forEach((c) => {
    if (
      c.sourceKey.startsWith("ansi-") &&
      c.config.databaseRole !== "metadata_reference_only"
    )
      errors.push(
        `${c.sourceKey} consensus metadata must be metadata_reference_only`,
      );
    if (
      c.agency === "INTERNAL" &&
      c.config.databaseRole !== "feeds_internal_memory"
    )
      errors.push(
        `${c.sourceKey} internal source must be feeds_internal_memory`,
      );
  });

  if (errors.length > 0) {
    console.error("\nVerification Failed:");
    errors.forEach((e) => console.error(` - ${e}`));
    process.exit(1);
  } else {
    console.log("\nGovernance verification passed.");
  }
}

verify();
