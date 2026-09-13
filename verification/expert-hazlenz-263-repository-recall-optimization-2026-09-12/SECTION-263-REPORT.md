# §263 — Repository recall and command-efficiency optimization

Terminal: **EXPERT_HAZLENZ_REPOSITORY_RECALL_OPTIMIZED — HUMAN_CONFIRMATION_ACTION_AUTHORIZATION_REQUIRED**

Zero provider calls. Zero production database operations. Zero files moved. Zero evidence deleted.
Zero production source changed. §259 candidate identity unchanged.

## 1. What the inventory found

| | |
|---|---|
| evidence packages | 326 |
| script files | 1,005 |
| npm scripts | 362 |
| scripts writing into **accepted historical evidence** | **252** |
| scripts whose write behaviour a static reader cannot resolve | **101** |

Before this section, knowing which of those 1,005 scripts was safe to run required having been
present when it was written. §258 got it wrong and did not notice.

The full inventory, including the misleading entry points, is in
`SECTION-263-RECALL-SURFACE-INVENTORY.md`.

## 2. The most important finding: the documentation already existed and was wrong

§229 had already built `docs/hazlenz/current/` with a current-state document, an invariants
document and a context index. All three described a pre-§246 world:

- `SOURCE_OF_TRUTH_MAP.md` states Expert HazLenz "has no NestJS consumer at all".
- `CONTEXT_INDEX.md` names `backend/scripts/lib/` as the home of the live contract.
- `EXPERT_HAZLENZ_CURRENT_STATE.md` lists **"Active blockers: None"**.
- `HAZLENZ_INVARIANTS.md` invariant 30 states "Expert HazLenz has no production activation".

Every one of those has been false since §246, and the last is now false in a safety-relevant way.

**So §263 refreshed those documents rather than adding new ones beside them.** Creating
`docs/hazlenz/CURRENT_STATE.md` next to `docs/hazlenz/current/EXPERT_HAZLENZ_CURRENT_STATE.md` would
have been exactly the competing-register defect this section forbids.

Invariant 30's **rule** was not changed. Its stale status clause was corrected, with the reason
recorded inline: Expert is now activated and is still not customer-authoritative, because §262
withholds every downstream consequence. Those are different things, and the distinction is the
product's safety position.

## 3. The command surface

```
npm run hazlenz:status              what state are we in       (reads; computes nothing)
npm run hazlenz:verify              is that state true         (read-only, writes nothing)
npm run hazlenz:evidence            did accepted evidence change
npm run hazlenz:test                tier 1                     60 + 141
npm run hazlenz:integration:test    tier 2                     69 + 94, own disposable database
npm run hazlenz:build               tier 3
npm run hazlenz:check               after a small change       (0 + 1 + build)
npm run hazlenz:precommit           before a commit            (0 + 1 + 3 + 2 + evidence)
npm run hazlenz:scripts:classify    regenerate the registry
```

`hazlenz:precommit` runs the whole local chain in **22 seconds**. No existing script was removed or
renamed; ten were added.

`hazlenz:integration:test` is the one that removes the most recall: it generates a
`test_insite_*` name, creates the database, migrates it from zero, forces `NODE_ENV=test` and
`DEV_AUTH_BYPASS=false`, runs both suites, and drops the database whether they passed or failed.
The inherited `DATABASE_URL` — which in this repository names the **development** database — is read
for connection parameters only, and it says so out loud on every run.

`DEV_AUTH_BYPASS=false` is forced rather than documented. The developer `.env` enables the bypass,
and §262 discovered that an authorization suite run under it measures the bypass instead of the
route: the unauthenticated case is answered by the entitlement gate and passes for the wrong reason.

## 4. Read-only verification, with four outcomes

```
Candidate identity                  PASS                      22 elements, drift 0
Identity constant in the build      PASS                      the compiled-in identity equals the recomputation
Protected modules                   PASS                      29/29 present, 1 digest newer than the §229 snapshot
Accepted evidence drift             PASS                      0 new (5533 members over 88 manifests)
Current-state manifest              PASS                      agrees with the recomputed identity
Provider transport (live)           UNVERIFIED_LIVE           no provider is called by any §263 command
Object storage / report generation  ENVIRONMENTALLY_BLOCKED   no STORAGE_* is set
Billing and deployment              UNVERIFIED_LIVE           no live environment is contacted
```

Unknowns are neither passed nor failed. The command opens no file for writing — there is no
`--write` and no output path, because a verifier that can write to what it verifies stops being
evidence.

## 5. The evidence-integrity guard, and what it found

Two independent checks: every tracked file under `verification/` against HEAD, and all 5,533 member
digests across all 88 package manifests.

**It is not vacuous.** A deliberate one-line mutation of `SECTION-259-REPORT.md` was caught by both
mechanisms at once, and the guard returned to PASS after restoration with git reporting no residue.

It found nine pre-existing conditions, all of which predate §263 and none of which §263 repaired:

- **Eight in-package digest mismatches** (§234, §236, §238, §249 judgment and identity artifacts,
  and four consolidation-manifest members). For every one, the working tree equals HEAD and neither
  equals the recorded digest — the disagreement was committed. They are baselined **by name** in
  `verification/current/EVIDENCE-BASELINE.json`, not excluded in code, so a ninth would fail.
  §263 does not correct them: editing a frozen manifest to agree with bytes it failed to describe
  would destroy the only record that they ever disagreed.
- **One deleted tracked evidence file.** `ecfr-1910-146.xml` is absent, and an untracked
  `ecfr-1910-146 4.xml` in the same directory is **byte-identical to the deleted file in HEAD**.
  No regulatory source evidence was lost; a file manager duplicated the name. §263 does not rename
  it — that is a deliberate act for the product owner.

A third bucket, 66 **external pointer drifts**, is reported and is not a fault: those manifest lines
name live source files whose digests record what they were when the section froze.

## 6. The mutating-script registry is derived, not remembered

`verification/current/MUTATING-SCRIPTS.json` is produced by a re-runnable static classifier, and it
checks itself: **it refuses to emit a registry unless it reproduces the two mutators §259
established by observation.**

That guard earned itself twice.

- **A false negative.** The first version missed `verify-252-admission-matrix`, whose output path is
  assembled as `join(__dirname,'..','..','verification','expert-hazlenz-252-…')` — no single string
  literal contains `verification/`. Bare package-name literals are now matched against the real
  directory listing. Detections went from 50 to 252.
- **A false positive.** The classifier then flagged its own source, and the read-only verifier, as
  `PROVIDER_CALLING` — because detection patterns and explanatory comments match themselves. A
  registry whose loudest warnings sit on its own safety tooling is one people learn to ignore.
  Comments and regex literals are now stripped before matching, and the ground-truth check confirms
  that did not become under-reading.

Its limitation is stated rather than hidden: 101 scripts write through paths a static reader cannot
resolve. They are recorded `UNKNOWN_WRITE_BEHAVIOR` and treated as sandbox-required. That is the
honest state, not a completed audit.

## 7. A defect this section's own work exposed

Making the integration tier run §261 and §262 against **one** database surfaced a latent
test-isolation bug: §262's spend-accounting assertion counted provider seams across the whole
`expert_analysis_executions` table, and §261's fixtures set `providerId: 'anthropic'` on rows no
provider ever produced. The assertion is now scoped to the executions that suite creates.

A test fix. No product behaviour changed, and all eight §262 acceptance cases passed before and
after.

## 8. What did not happen

No file was moved. No evidence package, fixture, report or manifest was deleted or edited. No
historical commit was squashed. No historical npm script was removed. No candidate-defining source
was touched, and no production source of any kind was changed — the entire section is tooling,
documentation and one test assertion.

The Expert system prompt and governed context were **not** shortened. Prompt and token compaction is
a separate safety-sensitive workstream because it can affect capability, and §263 was explicitly
told to identify such opportunities rather than take them.

## 9. Limitations

1. The registry is a static read; 101 scripts remain unresolved and are sandbox-required by default.
2. `PROTECTED-IDENTITIES.json` is a §229 snapshot with one stale digest. §263 did not rewrite it.
3. The guard's external-pointer bucket is informational, so a genuine corruption of a file outside
   its own package would be reported there and would not fail the guard.
4. Verification ran on a worktree that also contains unrelated uncommitted §117 changes to
   `evidence-foundation.ts` and `shared-evidence-facts.ts`. They are not in the §263 commit.
5. Nine disposable databases from August 2026 sections remain on the local server. They are not
   §263's to drop; the new wrapper is what prevents future ones.
