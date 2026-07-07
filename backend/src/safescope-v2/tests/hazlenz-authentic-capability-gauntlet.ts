/**
 * HazLenz Authentic Capability Gauntlet
 *
 * This is a capability evaluation, not a snapshot test.
 * It runs the real HazLenz classify endpoint against messy inspection observations
 * and measures whether HazLenz can reason through hazard family, mechanism, standards,
 * evidence gaps, and corrective actions without overfitting exact wording.
 *
 * The test is intentionally strenuous: it should expose shallow keyword matching,
 * bad jurisdiction inference, weak standards pruning, and weak corrective-action quality.
 */

import * as path from "node:path";

const REPORT_DIR = process.env.HAZLENZ_GAUNTLET_REPORT_DIR
  ? path.resolve(process.env.HAZLENZ_GAUNTLET_REPORT_DIR)
  : path.resolve(__dirname, "../../../tmp");

const OUTPUT_JSON = process.env.OUTPUT_JSON
  ? path.resolve(process.env.OUTPUT_JSON)
  : path.join(REPORT_DIR, "hazlenz-authentic-capability-gauntlet.json");

const OUTPUT_MD = process.env.OUTPUT_MD
  ? path.resolve(process.env.OUTPUT_MD)
  : path.join(REPORT_DIR, "hazlenz-authentic-capability-gauntlet.md");

async function main(): Promise<void> {
  process.env.SENTINEL_API_URL = process.env.HAZLENZ_API_URL || process.env.SENTINEL_API_URL || "http://localhost:4000";
  process.env.HAZLENZ_GAUNTLET_REPORT_DIR = REPORT_DIR;
  process.env.OUTPUT_JSON = OUTPUT_JSON;
  process.env.OUTPUT_MD = OUTPUT_MD;
  if (process.env.LIMIT) {
    process.env.LIMIT = String(Number(process.env.LIMIT));
  }

  const fieldGauntlet = await import("./hazlenz-field-gauntlet");
  await fieldGauntlet.main();
}

main().catch((error) => {
  console.error("Fatal capability gauntlet error:", error);
  process.exit(1);
});
