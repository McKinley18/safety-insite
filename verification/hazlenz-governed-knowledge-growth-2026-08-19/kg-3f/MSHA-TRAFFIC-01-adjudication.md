# MSHA-TRAFFIC-01 — `PROTECTED_BASELINE_EXPECTATION_ADJUDICATION_REQUIRED`

**Classification:** intentional regulatory-correctness divergence from the protected baseline.
**Not** an unexplained regression, and **not** a retrieval, scoring or determinism defect.

**Decision: KEEP the corrected behavior.** The protected gold-set artifact is preserved
byte-for-byte; nothing in it was edited, weakened or re-scored.

---

## 1. The exact case

From `verification/insite-core-closure-standards-validation-2026-08-18/standards-gold-set/gold-set-script-v3.ts`
(sha256 `93184abc677cf7a50d5f9ac11c4317148618acd74a26fe20fb37e690df647cd3`, **unchanged**):

```ts
{
  id: 'MSHA-TRAFFIC-01', area: 'MSHA - traffic control', regime: 'msha',
  observation: 'A haul truck at the surface mine is backing without a functional backup alarm and no spotter present.',
  expectedCitations: ['56.14132'], mustNotReturn: [],
  authoritativeSource: 'govinfo.gov 30 CFR 56.14132(a)',
  rationale: 'MSHA jurisdiction + reverse warning required + audible warning failed satisfies 56.14132(a).',
}
```

## 2. Old expected behavior

`30 CFR 56.14132(a)` returned as a **confirmed** citation, landing in the scorer's
`returnedConfirmed` set and matching the expectation. Gold-set score **31/31**.

## 3. Corrected behavior (measured, this slice)

```
candidates: [ '30 CFR 56.14132' ]
decision 30 CFR 56.14132 = UNKNOWN
    predicate: MSHA jurisdiction                                            = SUPPORTED
    predicate: operator has an obstructed view to the rear                  = UNKNOWN
    predicate: no compliant reverse-warning method
               (alarm, bell, discriminating alarm, or observer)             = SUPPORTED
```

The truthful **section-level** citation is surfaced as a candidate with a named open question.
Nothing is asserted as a violation. Gold-set score **30/31**.

## 4. The authoritative regulatory reason

**30 CFR 56.14132(a)** governs *manually-operated horns or other audible warning devices provided on
self-propelled mobile equipment as a safety feature* — it requires that such devices, **where
provided**, be maintained in functional condition. It is not the backing rule.

**30 CFR 56.14132(b)(1)** is the backing rule, and it opens with its own applicability condition:

> *"When the operator has an obstructed view to the rear, self-propelled mobile equipment shall
> have…"* — followed by four alternatives at (b)(1)(i)–(iv), of which **(iv) is an observer to
> signal when it is safe to back up**.

Two independent errors were therefore encoded in the old expectation:

1. **Wrong paragraph.** The observation describes a *backing* hazard, which is (b)(1) territory;
   the expectation's own `rationale` attributes it to (a), the horn-maintenance paragraph.
2. **Unestablished statutory trigger.** (b)(1) applies *only* where the operator has an obstructed
   view to the rear. The observation is **silent on rear visibility**. The old predicate hard-coded
   *"reverse warning required" = true* — visible verbatim in the stored `rationale` — which is the
   assumption, not a finding.

The observation *does* rule out both a functional alarm and an observer, so the
"no compliant method" predicate is genuinely SUPPORTED. That is exactly why the case is instructive:
**two of three predicates are satisfied, and the one that is not is the one that decides whether the
rule applies at all.** Asserting a violation on that basis is regulatory overreach — it would tell a
customer they are in violation of a standard whose applicability condition the evidence never
established.

`UNKNOWN` is the intended behavior. Coverage is subordinate to regulatory correctness.

## 5. Proof the change is isolated

| evidence | result |
|---|---|
| gold-set artifact sha256 | `93184abc…647cd3` — **unchanged**, byte-for-byte |
| gold-set cases affected | **1 of 31** (MSHA-TRAFFIC-01 only) |
| other MSHA cases | unaffected — `MSHA-NOISE-01/02/03`, `MSHA-GUARD-01/02`, `MSHA-LOTO-01`, `MSHA-HAZCOM-01` all unchanged |
| `wrongRegimeMatches` under governed shadow | **0** |
| 56.14132 predicate matrix | **16/16** — (a) emitted for horn evidence only; (b)(1) only where obstruction is established; section-level when visibility is unstated; any one compliant alternative satisfies the rule |
| 9-layout determinism | **170/170** |
| mirrored ranking adversarial | **54/54** |
| citation granularity contract | **48/48** |
| governed shadow across 4 layouts | byte-identical, sha256 `29469550cea4d2fd…` |
| hazard-family readiness | `traffic control` = `READY_WITH_APPLICABILITY_UNCERTAINTY`, **not** blocked, **not** blind |
| emitted governed coverage | **23/23** — *improved* by this correction |

The correction **raised** truthful emitted coverage from 22/23 to 23/23: the incorrect
`56.14132(a)` emission (which had no governed record, and so was `CITATION_ONLY`) was replaced by
the truthful `30 CFR 56.14132` section record, which was already legitimately approved in KG-3E.
**No regulatory record was fabricated, and no incorrect paragraph was approved to reach 100%.**

## 6. Customer-visible rendering (Phase 15, real Chromium, all four themes)

The corrected state renders honestly — verified in light, dark, mobile and mobile-dark:

* header: *"CANDIDATE STANDARD — MORE EVIDENCE REQUIRED"*
* citation: `30 CFR 56.14132` (section, not paragraph)
* body text carries the *"Verified standard text"* badge — a claim about the **text**
* *"Why HazLenz selected this: Candidate only; missing: operator has an obstructed view to the rear."*
* **Confidence: Low**
* *"Details that would increase confidence: operator has an obstructed view to the rear"*
* **no** "verified text unavailable" notice — the `UNKNOWN` applicability result is **not**
  presented as a corpus failure

This is the two-axis separation working under its hardest case: approved regulatory **text**
alongside an unestablished **applicability** trigger, with neither implying the other.

## 7. Why the protected artifact was not edited

The gold-set case is a hash-verified, frozen governance artifact. It is preserved unmodified
because:

1. no existing formal versioning/supersession mechanism in this repository covers gold-set
   expectations, so editing it would be an unversioned rewrite of a protected baseline;
2. the stale expectation is *evidence* — its stored `rationale` records the exact reasoning error
   ("reverse warning required" asserted as a premise) that KG-3F removed from the engine, and that
   is worth keeping legible;
3. the divergence is fully explained here and is reproducible on demand.

**Required next action (product owner, not engineering):** formally supersede the MSHA-TRAFFIC-01
expectation through an explicit adjudication/versioning mechanism, or accept the standing 30/31 as
the correct score for this baseline. Until then this case carries
`PROTECTED_BASELINE_EXPECTATION_ADJUDICATION_REQUIRED`.

**What must not happen:** HazLenz must not be reverted to the legally weaker behavior in order to
restore a historical 31/31. That would reintroduce the assertion of an MSHA violation on an
unestablished statutory trigger.
