# VALIDATION EFFICIENCY PLAN

The default development loop must use the **lowest ladder level capable of answering the engineering
question in front of it.** Formal frozen acceptance is the most expensive instrument in the
programme and must not become the ordinary loop.

Nothing in this plan was executed in §223.

---

## 1. The ladder

| level | what it is | cost | when it is the right answer |
|---|---|---|---|
| **1** | targeted unit or regression suite for the one module being changed | seconds, $0 | "did my change break the thing it touches?" — the answer for the overwhelming majority of edits |
| **2** | the affected subsystem's suites: first pass, verifier, authority/settlement, or governed evidence | tens of seconds, $0 | "did my change break a neighbour inside the same boundary?" |
| **3** | local integrated pipeline against recorded provider outputs — the §221 assembly run in replay | minutes, $0 | "does the whole path still produce the designed authoritative outcome?" |
| **4** | hosted targeted confirmation, a handful of calls on a narrow question | minutes, single-digit dollars | "does the provider actually do the thing?" — only when a local instrument provably cannot answer it |
| **5** | formal frozen acceptance: preregistration, freeze, execution, product-owner adjudication, gate computation | days of wall-clock, product-owner time, tens of dollars | a capability claim that will be relied on |

**Level 4 is the escalation that gets skipped and should not be.** The historical pattern has been to
answer a persisting behaviour with a prompt change followed by a hosted probe. That is a level-4
instrument used as a level-1 loop, and it does not diagnose; it samples.

**Level 5 is not a bigger level 4.** It requires a frozen preregistration authored before any call,
and its denominators cannot be revised afterwards. §221's six coverage-insufficient gates are the
standing demonstration: a gate listed in a case's exercised set with no judgment slot authored for it
can never report a pass, and the freeze makes that unrepairable in place.

---

## 2. What is missing today

There is no aggregated runner for any level. The twenty protected suites and 1,600 assertions that
§221 reports were invoked as twenty separate npm scripts out of a surface of 358. An engineer
choosing what to run must already know the answer.

**Recommendation.** Add four composite scripts and nothing else:

```
test:hazlenz:l1        # takes a module name, runs its focused suite
test:hazlenz:l2        # takes a subsystem: first-pass | verifier | authority | governed
test:hazlenz:l3        # the full protected set, replay only, zero provider calls
verify:hazlenz:digests # every .sha256 under verification/, one pass
```

These compose existing scripts. No suite is rewritten and no assertion changes.

---

## 3. Specific waste, and what to do about it

**Repeated full-suite execution.** Today the only trustworthy option is "run everything", so that is
what gets run. Levels 1 and 2 fix this by making a smaller correct choice available.

**Repeated historical digest checks.** §221 verified every `.sha256` across the §213, §215, §217,
§218, §219 and §220 directories. That is right before a freeze and wasteful during development. Make
it one script (`verify:hazlenz:digests`), run it at level 3 and above, and never at level 1.

**Repeated schema serialization.** The 19 KB wire schema is rebuilt per case per run. Build it once
per cohort and assert the digest, rather than re-serializing inside each assertion.

**Unnecessary provider context.** See `PROMPT_CONTEXT_OPTIMIZATION.md`. The finding there is that the
prompt has no slack; the slack is in the development context, not the wire.

**Duplicate fixtures.** 18 fixture modules, 10,889 lines, under `src/.../expert-hazlenz/fixtures/`.
Several probe sets (`hosted-linkage-probe-v2`, `linkage-confirmation-probe-v3`,
`clarification-recall-probe-v5`, `threshold-arbitration-probe-v6`, `unsupported-settlement-probe-v7`,
`retention-bridge-probe-v8`, `hardened-development-set-v9`) are versioned successors of one another.
Move them to `backend/validation/fixtures/` and mark which are current.

**Redundant harness initialization.** 95 local digest helpers and repeated ledger bootstrapping
across harness entry points. One shared harness utility module.

**Repeated manual commands.** The §221 execution required a resume path added mid-run after an
executor crash. Resume is now a proven pattern; make it standard in the shared harness rather than
re-implemented per section.

**Unnecessary generated evidence.** `verification/` holds 8,770 files on disk against 3,410 tracked,
and 2,091 macOS duplicate-copy files. Generated artifacts should be written once, digested, and
covered by a manifest — not duplicated.

---

## 4. Archive policy

Active product truth and historical development evidence must be separable without either being lost.

**Historical evidence is immutable.** Nothing under `verification/` is edited, renamed or deleted. A
superseded record is superseded by a new record that names it, never rewritten in place.

**Proposed structure.**

```
validation/archive/<section>-<slug>-<date>/     unchanged content, moved wholesale
validation/archive/INDEX.md                     one row per section
```

Each index row carries: section · date · purpose · terminal · result · the important defect
discovered · superseded-by · artifact digest.

The index is what makes the archive discoverable without loading it. An engineer asking "where was
the property-authority boundary established?" reads one table row, not a directory.

**Do not perform bulk movement yet.** 283 directories, 1.9 GB and 47 `.sha256` manifests are
involved; the move must be digest-verified directory by directory, and it needs its own
authorization.

---

## 5. The default loop

```
edit a module
  -> level 1 on that module
  -> level 2 on its subsystem if the edit crosses a contract
  -> stop
```

Level 3 before proposing a change for review. Level 4 only when a local instrument provably cannot
answer the question, and with the question written down first. Level 5 only on product-owner
authorization, with the preregistration frozen before any call — and with the §221 gate-coverage
authoring gap explicitly checked for, by asserting that every gate listed in a case's exercised set
has at least one judgment slot authored for that case.
