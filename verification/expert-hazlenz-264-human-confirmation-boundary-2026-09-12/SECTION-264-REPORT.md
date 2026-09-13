# §264 — Human confirmation and override

Terminal: **EXPERT_HAZLENZ_HUMAN_CONFIRMATION_BOUNDARY_IMPLEMENTED — FRONTEND_EXPERT_WORKFLOW_AUTHORIZATION_REQUIRED**

Zero provider calls. Zero production database operations. §259 candidate identity unchanged, 22
elements, drift 0. All eight analysis states are now reachable.

## 1. What a reviewer is actually asked

Not "do you accept this analysis". The subject is the **named `requiredBy` entries that triggered
the confirmation rule**, each keyed by its `refKind:ref` pair, and the answer space has exactly two
members:

- `CONTROLS_WHETHER_WORK_CONTINUES`
- `DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES`

They map one-to-one onto the two §239 driver roles the rule fires on. The internal vocabulary is
never exposed, per §260 section 9, and the reviewer re-authors nothing.

**The subject is re-derived from the immutable stored posture by the same rule version that produced
the flag.** §261 computes the confirmation flag once and never recomputes it, so a later rule change
cannot alter what a reviewer was asked. Re-deriving the *subject* under a newer rule would break
that guarantee quietly — the flag would still say "confirmation required" while the entries put in
front of the human had changed. A version mismatch is therefore a refusal, not a re-derivation.

## 2. One route, two outcomes

```
POST /inspections/observations/:id/expert-analyses/:analysisId/settlement
  JwtGuard · EntitlementGuard('fullSafeScope') · RolesGuard · Throttle 60/60s
```

Confirm and override are not two workflows. They share one eligibility rule, one concurrency
guarantee, one audit path and one state-machine edge; two endpoints would duplicate all four and
give the eligibility check two places to drift.

The throttle is *looser* than the execution route's 10/60s, deliberately: a settlement costs no
provider legs and no deterministic analysis. A reviewer clearing a backlog should not be rate-limited
as though each decision cost two hosted calls.

The analysis id is never a bare key — it is resolved as `{ id, observationId }` only after the
observation has been authorized, so an id from another workspace answers NotFound and discloses
nothing.

## 3. The Expert result is not touched

`resultSnapshot`, `engineVersion`, `producer`, `expertExecutionId`, `confirmationRequired`,
`idempotencyKey`, `requestVersion` and the entire execution record are untouched by settlement. The
transition writes `analysisState` and `settlementReviewId` and nothing else.

Both acceptance cases assert the snapshot is **byte-for-byte identical** before and after, and case
C additionally asserts the whole execution row is unchanged. The Expert proposal and the human
decision stay separately attributable, and the original stays reconstructable.

## 4. Persistence reuses the existing review model

`human_reviews` gains two decision values — `classification_confirmed` and
`classification_changed` — rather than a competing Expert review subsystem, and rather than
overloading the existing four. `accepted` means a reviewer accepted a *finding*; conflating that
with settling an operational classification would destroy the distinction §255 exists to draw.

Two constraints carry the authority:

- `uq_human_review_analysis_settlement` — at most **one** settlement per analysis.
- `ck_hazlenz_analysis_settlement` — `ANALYSIS_CONFIRMED`/`ANALYSIS_OVERRIDDEN` **requires** a real
  review row and `server_authored`. Setting the state name by hand does not make an analysis
  confirmed, exactly as §261 made `producer` unforgeable one column over. Proven in SQL.

## 5. Concurrency: one settlement, and a defect found on the way

Three guards: an advisory lock, the one-settlement unique index, and a conditional
`UPDATE ... WHERE analysisState = ANALYSIS_AWAITING_CONFIRMATION` whose row count decides the winner.
No last-write-wins anywhere.

The HTTP race passed immediately — but it passed because the loser arrived *after* the winner
committed and was stopped by the pre-transaction read. That leaves the guard that actually matters
untested, so a second race drives the service directly, where both callers read the same pending
state before either commits.

That race found a real defect: the loser received an **untranslated unique-constraint violation**,
which Nest renders as a 500. The guarantee held perfectly — one settlement, one review row — and the
loser was told the server had broken rather than that someone else had decided. §264 requires a
deterministic already-settled result, so the violation is now translated into a conflict, and the
two in-transaction guards carry distinguishable wording so an operator can tell which one fired
without reproducing the race.

## 6. Retry is not re-decision, and the order matters

A replay under the same `idempotencyKey` returns the row it already wrote: no second review, no
second audit event, no second transition. A *different* key against a settled analysis is a
competing decision and is refused.

The replay check runs **before** the state eligibility check. The first implementation had it after,
which rejected every successful request's own retry with "not awaiting confirmation" — precisely the
case idempotency exists to handle, and the caller could not distinguish a lost response from a
rejected decision.

## 7. The effective decision

One deterministic function, total over the state vocabulary with no default branch:

| state | source | settled |
|---|---|---|
| `ANALYSIS_AVAILABLE` | `EXPERT_ADMITTED_NO_CONFIRMATION_REQUIRED` | yes |
| `ANALYSIS_CONFIRMED` | `HUMAN_CONFIRMED_AS_AUTHORED` | yes |
| `ANALYSIS_OVERRIDDEN` | `HUMAN_REPLACED` | yes |
| `ANALYSIS_AWAITING_CONFIRMATION` | `NONE_AWAITING_HUMAN_CONFIRMATION` | **no** |
| `ANALYSIS_REFUSED` | `NONE_REFUSED` | **no** |
| `ANALYSIS_UNRESOLVED` | `NONE_UNRESOLVED_TRUTH_PRESERVED` | **no** |
| `ANALYSIS_FAILED` | `NONE_EXPERT_UNAVAILABLE` | **no** |
| `ANALYSIS_RUNNING` | `NONE_RUNNING` | **no** |

Five distinct reasons for "no conclusion", each with its own sentence, so a consumer cannot flatten
them into "nothing to show" and none can be misread as "no hazards". A settled *state* carrying no
settlement *record* aborts rather than producing a conclusion.

## 8. Nothing downstream was activated

Zero findings are reconciled from a confirmed analysis, an overridden analysis, or a pending one.
The response says `findingsReconciled: false` rather than leaving a client to infer it. §264 exposes
the authority derivation; it switches nothing on.

## 9. Three test defects found and fixed

The suite was wrong before the product was, in ways that would have produced false confidence:

1. The concurrency case raced **two unrelated individual accounts**. The loser was answered 404
   because it had no access to the workspace at all — so the case measured tenant isolation a second
   time and concurrency not at all. It now races two members of one organization.
2. The reachability probe for that case sent an **empty rationale** and read the resulting 400 as
   proof of access. Vacuous: the validation pipe rejects before authorization runs, so the probe
   would have passed even if the reviewer could not see the workspace. It now performs a real
   settlement.
3. Six authentications from one address silently exceeded the **5-per-minute `/auth/login`
   throttle**, leaving one reviewer with no token — and the resulting 404 looked exactly like a
   tenant refusal three assertions later. Each auth call now uses its own address, and the harness
   aborts on a missing token rather than continuing with an unauthenticated principal.

## 10. One correction to the §263 guard

The evidence-integrity guard treated `verification/current/` as frozen evidence, so §264 failed it
for keeping the current-state surface current. That is the guard being wrong: `verification/current/`
is the **living index** §263 built precisely so it would be updated, and an index that trips the
corruption alarm when updated is an index that goes stale.

It is now excluded from the frozen-evidence check and reported on its own line. The guard was
re-proven non-vacuous afterwards: a deliberate mutation of the §262 report was caught by both
mechanisms, and PASS returned after restoration with no residue.

## 11. Limitations

1. **No consumer reads `effectiveDecision` yet.** The property that downstream features agree about
   authority is designed, not demonstrated.
2. **A settled analysis cannot be re-opened.** There is no un-confirm and no revision of a human
   decision; the only path forward is a new Expert analysis with its own settlement. Whether a
   reviewer may revise their own decision is a product question §264 did not decide.
3. **Confirming a superseded analysis is refused outright** — the fail-closed reading of "do not
   accept a stale decision without detection". A product that wanted to permit it with a warning
   would need a different answer.
4. **Governed citation remains unexercised**, unchanged from §262.
5. Verification ran on a worktree carrying unrelated uncommitted §117 changes, as in §262 and §263.
   They are not in this commit.
