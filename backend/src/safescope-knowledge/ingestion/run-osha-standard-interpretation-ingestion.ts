import { OshaStandardInterpretationConnector } from "./connectors/osha-standard-interpretation.connector";

async function run() {
  const connector = new OshaStandardInterpretationConnector();
  console.log("Starting OSHA Standard Interpretation ingestion...");

  const discovered = await connector.discover();

  console.log(`Summary:`);
  console.log(`Discovered: ${discovered.length}`);
  console.log(`Created: 0`);
  console.log(`Updated: 0`);
  console.log(`Skipped: 0`);
  console.log(`PendingReview: 0`);
}

run().catch(console.error);
