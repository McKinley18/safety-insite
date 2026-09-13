import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * §268 — ONE GATE FOR EVERY SUITE THAT WRITES INTO AN EVIDENCE PACKAGE.
 *
 * ===============================================================================================
 * THE DEFECT THIS CLOSES.
 *
 * §267 found that `hazlenz:precommit` could not pass twice. Its integration tier re-ran
 * `test-265-expert-product-acceptance.ts`, which rewrote its own FROZEN
 * `SECTION-265-READ-PAYLOAD-SHAPE.json` with fresh per-run UUIDs and timestamps, and its final
 * step `hazlenz:evidence` then correctly reported the `DIGEST_MISMATCH` its own earlier step had
 * just caused. Three runs produced three different digests.
 *
 * §267 fixed that one file with a suite-specific environment variable. §268 generalises it,
 * because the problem is not specific to §265: `test-267` and `test-268` also write into evidence
 * packages, and the refreshed `MUTATING-SCRIPTS.json` classifies all three as
 * `WRITES_HISTORICAL_OUTPUT`. §268's mutation safety rule says a script so classified must not be
 * invoked against accepted evidence by normal current verification — so the gate belongs in one
 * shared place with one name, not in three suites with three conventions.
 *
 * ===============================================================================================
 * WHAT IS AND IS NOT GATED.
 *
 * GATED      writing files into `verification/<package>/`.
 * NOT GATED  every assertion. Each suite runs in full and still fails the build on any failure.
 *            Removing the side effect does not remove the check; it is what lets
 *            `hazlenz:evidence` mean "something changed" rather than "a suite ran again".
 *
 * Regenerating a package is then a deliberate act — `HAZLENZ_WRITE_EVIDENCE=1` — which is
 * appropriate, because it also obliges whoever does it to recompute that package's `.sha256`
 * manifest.
 */
export const EVIDENCE_WRITE_VAR = 'HAZLENZ_WRITE_EVIDENCE';

export function evidenceWritesEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env[EVIDENCE_WRITE_VAR] === '1';
}

/**
 * Write one evidence file if — and only if — evidence writes were explicitly requested.
 *
 * Returns whether it wrote, and says so on stdout either way. A suite that silently skipped its
 * own evidence write would leave someone hunting for a file that was never going to appear.
 */
export function writeEvidenceFile(
  directory: string, filename: string, contents: string,
): boolean {
  if (!evidenceWritesEnabled()) {
    console.log(`evidence write SKIPPED (${EVIDENCE_WRITE_VAR} is not 1): ${filename}`);
    return false;
  }
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, filename), contents);
  console.log(`evidence written: ${join(directory, filename)}`);
  return true;
}
