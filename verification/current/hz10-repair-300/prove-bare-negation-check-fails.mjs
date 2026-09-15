#!/usr/bin/env node
/**
 * §300 / HZ-10 — PROOF THAT THE BARE-PERSON-QUANTIFIER CHECK ACTUALLY FAILS.
 *
 * Builds throwaway source trees in a temp directory and points
 * `backend/scripts/check-bare-person-negation.ts` at them. The real source tree is never modified.
 *
 * The case that matters is the first one: the ACTUAL text of `hazlenz-evidence-boundary.ts` as it
 * stood when HZ-10 was live in production, recovered from git. A check that would not have caught
 * HZ-10 is not worth having, and asserting that it would is the whole point of this file.
 *
 * No database, no network, no provider call.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..", "..");
const CHECK = resolve(repoRoot, "backend/scripts/check-bare-person-negation.ts");
const TARGET = "backend/src/hazlenz/display/hazlenz-evidence-boundary.ts";

let failures = 0;

function run(files) {
  const root = mkdtempSync(join(tmpdir(), "bare-negation-"));
  for (const [rel, body] of Object.entries(files)) {
    const full = join(root, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, body);
  }
  return spawnSync("npx", ["ts-node", CHECK], {
    env: { ...process.env, BARE_NEGATION_SCAN_ROOT: root },
    cwd: resolve(repoRoot, "backend"),
    encoding: "utf8",
  });
}

function expect(name, files, shouldFail) {
  const r = run(files);
  const didFail = r.status !== 0;
  const correct = didFail === shouldFail;
  if (!correct) failures += 1;
  console.log(`${correct ? "ok   " : "FAIL "} ${name}`);
  console.log(`        exit ${r.status}, expected ${shouldFail ? "non-zero" : "zero"}`);
  if (!correct) console.log(r.stdout + r.stderr);
}

/**
 * The pre-repair file is whatever is committed at HEAD, because the §300 HZ-10 repair is in the
 * working tree and not yet committed when this first runs. Reading it from git rather than
 * hardcoding a SHA keeps this correct on re-runs after the commit only if the SHA is pinned — so
 * the pinned SHA below is used once the repair lands, and HEAD is the fallback before it does.
 */
const PINNED_PRE_REPAIR = process.env.HZ10_PRE_REPAIR_REF || "HEAD";
const preRepair = execFileSync("git", ["show", `${PINNED_PRE_REPAIR}:${TARGET}`],
  { cwd: repoRoot, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
const repaired = execFileSync("git", ["show", `:${TARGET}`],
  { cwd: repoRoot, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });

console.log("\n---- THE CASE THAT MATTERS: the real HZ-10 defect ----\n");
expect(`${TARGET} as it stood while HZ-10 was live in production`,
  { "hazlenz/display/hazlenz-evidence-boundary.ts": preRepair }, true);

console.log("\n---- the repaired file must pass ----\n");
expect(`${TARGET} as repaired at §300`,
  { "hazlenz/display/hazlenz-evidence-boundary.ts": repaired }, false);

console.log("\n---- a third copy reintroduced anywhere else ----\n");
expect("a new module matching the bare words in an alternation",
  { "hazlenz/somewhere/new-module.ts":
    "export const controlled = (t: string) => /\\b(fenced|nobody|no one|locked)\\b/i.test(t);\n" },
  true);
expect("the same, spelled 'no-one'",
  { "hazlenz/somewhere/new-module.ts":
    "export const controlled = (t: string) => /\\b(fenced|no-one|locked)\\b/i.test(t);\n" },
  true);

console.log("\n---- what must NOT be flagged ----\n");
expect("a comment explaining the defect",
  { "hazlenz/somewhere/doc.ts":
    "// This used to match the bare words `nobody` and `no one`, which was HZ-10.\n"
    + "export const x = 1;\n" },
  false);
expect("a block comment quoting an observation",
  { "hazlenz/somewhere/doc2.ts":
    "/**\n * The §298 note said \"Nobody working up there had a harness on\".\n */\nexport const y = 2;\n" },
  false);
expect("a fixture directory containing such sentences",
  { "hazlenz/expert-hazlenz/fixtures/corpus.ts":
    "export const CASES = [/\\b(nobody|no one)\\b/i];\n" },
  false);

console.log(`\n${failures === 0 ? "ALL CASES BEHAVED AS EXPECTED" : `${failures} CASE(S) DID NOT`}\n`);
process.exit(failures === 0 ? 0 : 1);
