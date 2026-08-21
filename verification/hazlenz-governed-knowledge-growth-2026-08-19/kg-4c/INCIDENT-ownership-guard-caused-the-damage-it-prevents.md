# KG-4C incident — the ownership guard caused the exact damage it was built to prevent

**Classification:** `VERIFICATION_INFRASTRUCTURE_DEFECT — DAMAGE CAUSED, DETECTED, RESTORED, PROVEN`
**Severity:** high — an evidence database was destroyed and rebuilt.
**Production impact:** none. No production system, database, configuration or deployment was involved.
**Recorded prominently because it is the most important methodological result of KG-4C**, in the same
way KG-4B's four instrumentation defects were the most important result of that slice.

---

## 1. What happened

KG-4C section 19 asked for a guard that makes a mutating suite fail *before its first mutation* when
it cannot prove it owns its database. The known hazard was named in the KG-4B status:
`test:regulatory-release-lifecycle` replaces every release row in whatever database it is pointed at.

The guard was written, its own suite passed 26/26, and it was wired into
`test:regulatory-release-lifecycle`. It was then exercised against the real hazard —
`test_kg4b_shadow_20260820`, KG-4B's shadow corpus — expecting a refusal.

It did not refuse. It **claimed** the database and the suite then ran to completion:

```
releases in kg4b corpus BEFORE: 1
[db-ownership] suite=test:regulatory-release-lifecycle database=test_kg4b_shadow_20260820 claim=NEW
releases in kg4b corpus AFTER:  5
```

`federal-core-2026-07-30.1` and its 35 release records were deleted and replaced by five KG-2 fixture
releases holding 11 records.

## 2. Root cause

**The guard treated an absent ownership marker as permission to claim.**

```
if (no marker) -> create marker naming this suite -> PROCEED
```

Every *pre-existing* database is unmarked. That is not an edge case — it is the entire population
the guard exists to protect. Every KG evidence corpus from KG-1 to KG-4B is unmarked. So the rule
"unmarked means claimable" handed the destructive suite precisely the databases it must never touch,
while refusing only databases that had already been through the new guard.

The mechanism was inverted relative to its own stated intent. The module header said, correctly:

> a database that was never claimed has no marker at all — so the DEFAULT answer for any
> pre-existing database, including every KG evidence corpus, is "not yours"

The code did the opposite of its own documentation.

## 3. Why the guard's test suite did not catch it

Because the test asserted the defect was correct:

```ts
check(unownedOutcome === 'MUTATED',
  'an UNCLAIMED disposable database is claimable by the first suite that asks');
```

The suite passed 26/26 while the mechanism was backwards. **This is the same failure class KG-3F
found in `test-evidence-foundation.ts`**, where an assertion required `30 CFR 56.14132(a)` for a
backup-alarm observation and thereby encoded the very defect the slice was correcting. A test written
from the implementation rather than from the requirement will ratify whatever the implementation does.

It is also the KG-4B lesson restated: *a broken instrument manufactures a confident, coherent-looking,
completely wrong answer.* Here the instrument was the guard's own verification.

## 4. Damage assessment

| Table | State after the incident |
|---|---|
| `regulatory_releases` | `federal-core-2026-07-30.1` **deleted**; 5 KG-2 fixtures inserted |
| `regulatory_release_records` | 35 records **deleted**; 11 fixture records inserted |
| `knowledge_release_events` | **deleted** (8 rows) |
| `regulatory_release_record_reviews` | **intact — 35 approval decisions survived** |
| `standards_master` | 35 rows intact in count, **one row mutated**: `30 CFR 56.9100(a)` had its `standard_text` tampered by the suite's "tampered release refused" fixture, which does not restore it |

The append-only decision log surviving is what made a faithful restoration possible, and is a direct
vindication of the KG-3F decision that reviewer decisions are append-only and bound by checksum.

## 5. Restoration, and how it was proven

1. Removed the five KG-2 fixture releases, their records, and the lifecycle events.
2. Found the mutated `standards_master` row by diffing against a clean seed
   (`test_kg4c_regression_20260821`) — exactly one row differed — and restored its `standard_text`.
3. Re-finalized the release from the repaired live corpus.
4. Re-activated the release through the real `RegulatoryReleaseLifecycleService.activate()` gates,
   not by raw SQL.

Restoration is asserted by measurement, not by inspection:

| Check | Result |
|---|---|
| `recordCount` | **35** |
| `manifestChecksum` | **`14a34feaa670d5d0d289d7249b38466e0cac5626f58e54bc6aba9d8a9c2ece5b`** — byte-identical to KG-4A/KG-4B |
| Surviving approvals re-binding to regenerated records by checksum | **35 / 35** |
| Effective review state | **`reviewer_approved` × 35** — restored without appending a single new decision |
| `npm run test:kg4b-shadow-adversarial` | **84 / 84** — the KG-4B baseline |
| `npm run test:kg4b-shadow-determinism` | **18 / 18**, digest `0bce5a71a9d2664293834b5eeaa443eb…` — the KG-4B digest |

The determinism digest reproducing exactly is the strongest available evidence: it is computed over
52 probes across 7 physically rewritten clones of this corpus. A corpus that differed anywhere those
probes reach could not reproduce it.

**No new reviewer decision was created during the restoration.** Appending 35 fresh approvals would
have been the easy repair and would have silently rewritten the evidence — the decision log now
contains exactly the 35 decisions KG-4B made.

## 6. The fix

Three changes, each addressing a distinct part of the failure:

1. **An unmarked database is REFUSED** (`UNCLAIMED_DATABASE`). Claiming one requires a deliberate,
   database-specific authorization: either `initializeOwnership: true` from a suite that created the
   database in-process, or `KG_TEST_DB_INITIALIZE_OWNERSHIP` set to the **exact** database name.
   Naming the database is the safety property — a boolean flag survives a copy-pasted command line
   pointed at a different `DATABASE_URL`; a name does not.

2. **A refused claim performs zero writes.** The first fix still ran `CREATE TABLE IF NOT EXISTS`
   before deciding, so a refusal left a marker table on somebody else's evidence database. The
   marker table is now probed read-only and created only after the claim is authorized.

3. **The test assertion was corrected**, and the reason it was wrong is recorded in the suite itself
   so a future reader cannot mistake the corrected assertion for an arbitrary tightening.

## 7. Proof the fix works, against the real hazard

Against a **marked** database (KG-4B's corpus, marker restored to `kg-4b-evidence-corpus`):

```
releases/records BEFORE: 1/35
REFUSED BEFORE MUTATION [OWNED_BY_ANOTHER_SUITE] database=test_kg4b_shadow_20260820:
  Marker names 'kg-4b-evidence-corpus'. Create your own disposable database instead.
No mutation was attempted.
releases/records AFTER:  1/35
```

Against an **unmarked** real evidence corpus (`test_kg3f_remediation_20260820`), which is the general
case and the one that actually failed:

```
marker table before: 0
releases/records before: 9/269
REFUSED BEFORE MUTATION [UNCLAIMED_DATABASE] database=test_kg3f_remediation_20260820: ...
No mutation was attempted.
marker table after:  0
releases/records after:  9/269
```

Zero writes. Not a marker table, not a row.

`npm run test:kg4c-db-ownership` → **31 / 31**, including both refusal paths, the exact-name
requirement, the mis-named-token refusal, and a canary row proving the target is untouched after a
refusal.

## 8. What this changes about the KG-4C result

The section 19 deliverable is stronger than it would have been had the guard worked first time,
because it has now been tested against the real hazard rather than against a fixture. But the honest
statement is that **the guard was shipped broken, the verification ratified it, and it took causing
the damage to find out.**

Two rules follow, and both are recorded as KG-4C protected lessons:

* **A guard must be exercised against the real hazard before it is trusted** — not against a
  reconstruction of the hazard built by the same person, in the same session, from the same
  misunderstanding.
* **An assertion that describes what the code does is not a test.** Every assertion in a safety
  mechanism's suite must be traceable to the REQUIREMENT. The requirement here was "fail before
  mutating a database you do not own"; the assertion said "claim it", and no amount of green output
  was going to reveal that.

## 9. Residual state

* `test_kg4b_shadow_20260820` carries an ownership marker naming `kg-4b-evidence-corpus`, added
  during restoration. It did not exist in KG-4B. It is a single-row metadata table in a disposable
  verification database, it is not read by any production or verification code path other than the
  guard, and its presence is what now makes that corpus explicitly protected rather than merely
  unmarked. Recorded here rather than removed.
* All other KG evidence databases remain unmarked and are protected by the `UNCLAIMED_DATABASE`
  refusal.
