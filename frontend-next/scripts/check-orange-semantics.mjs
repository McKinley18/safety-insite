// §280 (D-036.3) — ORANGE MEANS ONE THING.
//
// ==================== WHAT WAS MEASURED ====================
//
// The accent (orange) button variant was carrying at least four unrelated meanings at once:
//
//   "View Reports"          secondary navigation on the dashboard
//   "Open Field Capture"    an alternative entry point on the inspection hub
//   "Add Task" / "+ Add task" / "Add Finding" / "Save to Cloud"   ordinary form actions
//   "Upgrade to Pro" / "Unlock reports" / "Unlock This Workflow"  a capability the account cannot reach
//
// A colour that means four things means none of them. Worse, this colour is the product's WARNING
// colour: it is what "overdue" and "needs attention" are painted in, so spending it on a benign
// navigation link spends the only signal the product has for a hazard that is not being dealt with.
//
// ==================== THE RULE ====================
//
// Orange is reserved for ATTENTION / WARNING / PENDING DECISION / UNRESOLVED / OVERDUE.
//
// "Locked behind a plan" is admitted under UNRESOLVED: the capability is not available and the
// user has a decision outstanding about it. Everything else that was orange is now primary or
// secondary.
//
// ==================== WHY THIS IS A GATE AND NOT A NOTE ====================
//
// A convention that lives only in a document is re-broken by the next person who wants a button to
// stand out, and the way it gets re-broken is one call site at a time, each of which looks
// harmless. This enumerates every accent call site and compares it to a REGISTER of approved ones.
// Adding a new orange control fails the check until it is registered, which makes the question
// "does this mean unresolved?" impossible to skip rather than merely written down somewhere.
//
// It is deliberately a register and not a pattern match: no regular expression can tell whether a
// button means "unresolved". A person can, once, and then it is recorded.
//
// Run: node scripts/check-orange-semantics.mjs

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["app", "components"];

/**
 * Every approved orange control, and the reason it is orange. Keyed by file, then by the visible
 * label or test id nearest the call site.
 */
const REGISTER = [
  {
    file: "app/inspection-workspace/page.tsx",
    count: 2,
    why: "Upgrade to Pro / Unlock reports — a capability this account cannot reach. UNRESOLVED.",
  },
  {
    file: "app/inspections/page.tsx",
    count: 1,
    why: "Unlock This Workflow — a workflow the plan does not include. UNRESOLVED.",
  },
  {
    file: "components/ui/LockedFeatureCard.tsx",
    count: 1,
    why: "The unlock call to action on every locked feature card. UNRESOLVED.",
  },
  {
    file: "components/billing/BillingSettingsPanel.tsx",
    count: 1,
    why: "The plan upgrade checkout. PENDING DECISION.",
  },
  {
    file: "components/inspection/expert/ExpertAnalysisPanel.tsx",
    count: 1,
    why: "§284 (S-15). See Pro — HazLenz Expert on an account whose plan does not include it. The "
      + "same class as the three entries above and registered for the same reason: a capability "
      + "this account cannot reach. UNRESOLVED. It is the ONLY control on that panel for a "
      + "non-entitled account, because §284 forbids offering an enabled Expert action that is "
      + "known to be unavailable.",
  },
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx$/.test(entry)) out.push(full);
  }
  return out;
}

/**
 * Comments stripped before counting.
 *
 * The first run of this check reported `app/command-center/page.tsx` as an unregistered orange
 * control. It was not one: the "hit" was a COMMENT explaining that the button used to be orange
 * and no longer is. An instrument that counts the word for a thing as the thing would make it
 * impossible to write down why a control was changed -- and it would have been scored as a
 * product defect on a control that had just been repaired.
 */
function stripComments(text) {
  return text
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "") // {/* JSX comment */}
    .replace(/\/\*[\s\S]*?\*\//g, "")              // /* block comment */
    .replace(/^[ \t]*\/\/.*$/gm, "");                // // line comment
}

const found = new Map();
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const text = stripComments(readFileSync(file, "utf8"));
    const matches = text.match(/variant="accent"/g);
    if (matches) found.set(file, matches.length);
  }
}

const failures = [];
const registered = new Map(REGISTER.map((entry) => [entry.file, entry]));

for (const [file, count] of found) {
  const entry = registered.get(file);
  if (!entry) {
    failures.push(
      `UNREGISTERED: ${file} uses the accent (orange) variant ${count}x. Orange means ` +
        `attention / warning / pending decision / unresolved / overdue. If this control means one ` +
        `of those, add it to REGISTER in this file with the reason. If it does not, use ` +
        `variant="primary" or variant="secondary".`,
    );
  } else if (entry.count !== count) {
    failures.push(
      `COUNT CHANGED: ${file} has ${count} accent controls, the register expects ${entry.count}. ` +
        `A new orange control needs the same decision the registered ones needed.`,
    );
  }
}

for (const entry of REGISTER) {
  if (!found.has(entry.file)) {
    failures.push(
      `STALE REGISTER ENTRY: ${entry.file} no longer uses the accent variant. Remove its entry, ` +
        `so the register keeps describing the product rather than its history.`,
    );
  }
}

console.log("§280 D-036.3 — orange semantics\n");
for (const entry of REGISTER) {
  const actual = found.get(entry.file) ?? 0;
  console.log(`  ${actual === entry.count ? "ok  " : "FAIL"} ${entry.file} (${actual}) — ${entry.why}`);
}
for (const [file, count] of found) {
  if (!registered.has(file)) console.log(`  FAIL ${file} (${count}) — not registered`);
}

console.log(
  `\n${found.size} file(s) use the accent variant; ${REGISTER.length} approved.` +
    ` Total accent controls: ${[...found.values()].reduce((a, b) => a + b, 0)}.`,
);

if (failures.length) {
  console.error(`\n${failures.length} problem(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("\nORANGE SEMANTICS: PASS — one meaning, and every use of it is a recorded decision.");
