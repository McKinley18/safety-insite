import { SAFESCOPE_SOURCE_REGISTRY } from "../sources/safescope-source-registry";
import { getGovernanceConfig } from "../ingestion/ingestion-control-plane";
import { Msha30CfrConnector } from "../ingestion/connectors/msha-30-cfr.connector";

function verify() {
  console.log("MSHA 30 CFR Ingestion Verification:");

  const source = SAFESCOPE_SOURCE_REGISTRY.find(
    (s) => s.sourceKey === "msha-30-cfr-standards",
  );
  if (!source) {
    console.error("msha-30-cfr-standards not found in registry.");
    process.exit(1);
  }

  console.log(`Source found: ${source.displayName}`);
  const config = getGovernanceConfig(
    source.sourceKey,
    source.requiresApproval,
    source.sourceType,
    source.agency,
  );
  console.log("Control Plane Status:", config.connectorStatus);

  const connector = new Msha30CfrConnector();
  console.log("Connector initialized.");

  // Static governance verification
  const errors: string[] = [];
  if (
    config.connectorStatus !== "source_list_connector" &&
    config.connectorStatus !== "active_connector"
  ) {
    errors.push(
      "Connector status should be source_list_connector or active_connector",
    );
  }

  if (errors.length > 0) {
    console.error("\nVerification Failed:");
    errors.forEach((e) => console.error(` - ${e}`));
    process.exit(1);
  } else {
    console.log("\nMSHA 30 CFR verification passed.");
  }
}

verify();
