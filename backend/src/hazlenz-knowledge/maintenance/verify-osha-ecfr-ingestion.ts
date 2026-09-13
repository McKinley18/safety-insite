import { OshaEcfConnector } from "../ingestion/connectors/osha-ecfr.connector";
import { buildSourceRegistryMetadata } from "../sources/source-registry-metadata";

async function verify(sourceKey: string, listFilename: string) {
  const metadata = buildSourceRegistryMetadata(sourceKey);
  const connector = new OshaEcfConnector(sourceKey, listFilename);
  const discovered = await connector.discover();

  console.log(`\nOSHA eCFR Ingestion Verification: ${sourceKey}`);
  console.log(`Source found: ${metadata.sourceName || sourceKey}`);
  console.log(`Discovered count: ${discovered.length}`);

  for (const item of discovered) {
    console.log(`- Title: ${item.title}`);
    console.log(`  Sections count: ${item.sections.length}`);
    for (const section of item.sections.slice(0, 8)) {
      console.log(
        `    - Citation: ${section.citation}, Heading: ${section.sectionHeading}`,
      );
    }
    console.log(`  RawText Length: ${item.rawText.length}`);
  }

  if (!discovered.length) {
    throw new Error(`No OSHA eCFR documents discovered for ${sourceKey}`);
  }

  const missingSections = discovered.filter((item) => !item.sections.length);
  if (missingSections.length) {
    throw new Error(`One or more OSHA documents had zero sections.`);
  }

  const blankCitation = discovered.some((item) =>
    item.sections.some((section) => /^29 CFR\s*$/.test(section.citation)),
  );
  if (blankCitation) {
    throw new Error("Blank OSHA citation detected.");
  }

  console.log(`\nOSHA eCFR verification passed: ${sourceKey}`);
}

async function run() {
  await verify("osha-ecfr-1910", "osha-ecfr-1910.json");
  await verify("osha-ecfr-1926", "osha-ecfr-1926.json");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
