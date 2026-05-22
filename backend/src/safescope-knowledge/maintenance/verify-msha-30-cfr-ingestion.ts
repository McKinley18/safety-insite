import { Msha30CfrConnector } from "../ingestion/connectors/msha-30-cfr.connector";
import { SAFESCOPE_SOURCE_REGISTRY } from "../sources/safescope-source-registry";
import { getGovernanceConfig } from "../ingestion/ingestion-control-plane";

async function verify() {
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
  console.log("Attempting discovery...");

  const results = await connector.discover();
  console.log(`Discovered count: ${results.length}`);

  for (const item of results) {
    console.log(`- Title: ${item.title}`);
    console.log(`  Sections count: ${item.sections.length}`);
    item.sections.slice(0, 5).forEach((sec) => {
      console.log(
        `    - Citation: ${sec.citation}, Heading: ${sec.sectionHeading}`,
      );
    });
    console.log(`  RawText Length: ${item.rawText.length}`);
  }

  if (results.length < 3 && results.length > 0) {
    console.warn("Warning: Fewer than 3 results discovered.");
  }

  console.log("\nMSHA 30 CFR verification finished.");
}

verify().catch(console.error);
