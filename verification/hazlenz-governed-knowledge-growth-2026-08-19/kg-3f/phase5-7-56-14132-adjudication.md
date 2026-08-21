# KG-3F Phases 5–7 — `30 CFR 56.14132` predicate reconciliation

**Outcome: `SPLIT_HORN_AND_BACKUP_WARNING_RULES`, with exact `(b)(1)` only where its trigger is
established and a truthful section-level candidate otherwise.**

---

## Phase 5 — what the rule actually did

The emitting predicate, `evidence-foundation.ts`:

```ts
if (mineGate && has(e, 'backupAlarmState')) {
  const functional = has(e, 'backupAlarmState', 'functional');
  output.push(decision(e, '30 CFR 56.14132(a)', 'MSHA backup alarm', [
    ['MSHA jurisdiction',        mineJur,                    ids(e, 'jurisdiction')],
    ['reverse warning required', true,                       ids(e, 'backupAlarmState')],  // <-- ASSERTED
    ['audible warning failed',   functional ? false : true,  ids(e, 'backupAlarmState')],
  ], functional));
}
```

Three defects, all confirmed against the authoritative text:

1. **Wrong paragraph.** `(a)` governs *manually-operated horns or other audible warning devices
   **provided** … maintained in functional condition*. The predicate is about **backup alarms while
   reversing**, which is `(b)(1)`.
2. **The trigger was asserted, not established.** `'reverse warning required'` is hard-coded `true`.
   `(b)(1)` applies only *"when the operator has an obstructed view to the rear"*, and **no evidence
   fact for rear visibility existed anywhere in the extractor**. This is the same class of error
   KG-3D refused for `1910.303(g)(2)(i)`, where voltage was never established.
3. **Compliant alternatives ignored.** `(b)(1)(iv)` makes **an observer** one of four permitted
   methods, alongside a reverse-activated alarm, a wheel-mounted bell, and a discriminating backup
   alarm. The old rule treated a non-functional alarm as a violation regardless — so "no backup
   alarm but a spotter posted" was reported as a violation of a rule the operator was complying with.

The evidence vocabulary confirmed the gap: `backupAlarmState` had exactly two values (`failed`,
`functional`), and there was no rear-visibility or observer fact for this rule to consult.

There are four emission surfaces for this citation; the one measured by the emitted-coverage metric
is `evidence-foundation.ts` (the finding-scoped engine). The others
(`safescope-v2.service.ts`, `inspection-intelligence-expansion.rules.ts`,
`msha-inspection-intelligence.service.ts`) are recorded for the Phase 11–12 rule-to-corpus map and
were **not** changed in this slice.

## Phase 6 — the narrowest truthful correction

**Three evidence facts added** (`shared-evidence-facts.ts`), so both statutory conditions become
evidence-borne rather than assumed:

| Fact | Values | Purpose |
|---|---|---|
| `rearViewState` | `obstructed` \| `clear` | the `(b)(1)` trigger |
| `reverseWarningAlternative` | `observer_present` \| `absent` | the `(b)(1)(iv)` alternative |
| `hornState` | `inoperative` \| `functional` | the `(a)` rule |

The observer extractor tests the **negative form first**, so *"no spotter present"* registers as
`absent` and can never be mistaken for a compliant observer.

**The rule split.** `(a)` now fires only on horn evidence. The backing rule selects its citation from
the evidence:

```
obstructed === true   -> 30 CFR 56.14132(b)(1)   (exact paragraph, trigger established)
otherwise             -> 30 CFR 56.14132         (truthful section-level candidate)
satisfied when        -> a functional alarm OR an observer is present, OR the rear view is clear
```

Where visibility is unstated the obstructed-view predicate is recorded `UNKNOWN` — **an open
question, not evidence against the rule** — so the decision is `UNKNOWN` rather than a supported
violation.

## Phase 6 — test matrix (`npm run test:kg3f-56-14132-predicate`, **16/16**)

| Case | Observation | Result |
|---|---|---|
| **A** | backing, **obstructed** rear view, no alarm, no spotter | `(b)(1)` **SUPPORTED** — trigger recorded as established |
| **B** | backing, rear view explicitly **clear**, no alarm | `56.14132` **NOT_APPLICABLE** — no violation surfaced |
| **C** | obstructed, no alarm, **spotter posted** | `(b)(1)` **NOT_APPLICABLE** — observer satisfies (b)(1)(iv) |
| **D** | obstructed, **alarm sounded** | `(b)(1)` **NOT_APPLICABLE** |
| **E** | **horn inoperative** on a loader | `(a)` **SUPPORTED**; `(b)(1)` not emitted |
| **F** | backing, no alarm, no spotter, **visibility unstated** | `56.14132` **UNKNOWN**; obstructed view is the open question. `(a)` gone |
| **G** | generic haul truck on a haul road | **no 56.14132 citation at all** |

Case F is the tracked gold-set observation `MSHA-TRAFFIC-01`, whose hash-verified
`expectedCitations` is **`['56.14132']`** — the section. The corrected behaviour matches the gold
set's own expectation, which the previous `(a)` emission did not.

## Phase 7 — emitted coverage, recomputed

```
emitted before: 23      emitted after: 23
  REMOVED: 30 CFR 56.14132(a)      (horn rule, wrongly emitted for a backing predicate)
  ADDED:   30 CFR 56.14132         (section — reviewed and APPROVED in KG-3E)
```

| Metric | KG-3E | KG-3F |
|---|---|---|
| Emitted citations | 23 | 23 |
| **Emitted approved-backed** | **22 (95.7%)** | **23 (100%)** |
| Emitted with no governed record | 1 | **0** |

**This is Outcome A from the brief, and it was reached by correcting the citation rather than by
fabricating a record.** No record was created for `56.14132(a)`; no content was approved to close a
percentage. The gap closed because HazLenz stopped emitting a citation it could not defend and
started emitting one that was already legitimately reviewed and approved in KG-3E.

`56.14132(b)(1)` is now emitted **only** when an obstructed rear view is established. It currently
has no governed record, so in that path it resolves `CITATION_ONLY` — correctly, and it is recorded
as a KG-3G sourcing candidate now that its predicate genuinely earns the paragraph.

## Regression

| Gate | Result |
|---|---|
| `test:kg3f-56-14132-predicate` (new) | **16/16** |
| `test:kg3f-retrieval-determinism` | **170/170** — re-run after this change |
| `test:kg3f-ranking-adversarial` | **54/54** |
| `test:kg3e-citation-granularity` | **48/48** |
| `test:evidence-foundation` | **passed, 35 assertions** — see note |
| `test:hazlenz-evidence-boundary` | pass |
| `test:guided-finding-response` | pass |
| Backend build | pass |
| `test:hazlenz-core` | **206 suites passing**, the two documented baseline failures only, **byte-identical** |

### The one corrected assertion, and why it is a correction rather than a weakening

`test-evidence-foundation.ts` asserted:

```ts
run('Loader backup alarm made no sound and unit remained in use.', 'msha').primaryCitation
  === '30 CFR 56.14132(a)'
```

**That assertion encoded the defect.** It required the horn paragraph for a backup-alarm
observation, and it required a *supported violation* from an observation that states nothing about
rear visibility — the precise thing the brief forbids: *"HazLenz must not equate 'no backup alarm'
with 'violation' if the regulation permits alternatives."*

It was replaced with **four** assertions that are strictly stronger:

1. `primaryCitation === ''` — no supported violation is asserted on unstated visibility;
2. the `56.14132` rule **is** evaluated (distinguishing "satisfied/unknown" from "never ran");
3. its status is `UNKNOWN`;
4. the obstructed-view trigger is the **named** open question driving that `UNKNOWN`.

The suite still reports **35 assertions**, unchanged from the KG-3D/KG-3E baseline.
