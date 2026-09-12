# §248 — Driver-Role Hosted Confirmation: Final Report

**No provider call was made. Spend: USD 0.00. Database operations: 0.**

## Terminal

    EXPERT_HAZLENZ_DRIVER_ROLE_CONFIRMATION_INVALID —
    PRODUCT_OWNER_REVIEW_REQUIRED

Execution was stopped at the frozen pre-spend gate. Four of the seven preconditions fail, and the
authorization is explicit: if any condition fails, STOP BEFORE SPEND.

## Required report fields

| Field | Value |
|---|---|
| Cases executed | **0 / 6** |
| Provider calls | **0** |
| Retries | 0 |
| Spend | **USD 0.00** |
| Hard ceiling | as frozen; untouched |
| Pre-spend identity | **FAIL** — 6 of 10 checks pass, 4 fail |
| Candidate Identity v2 | 17 / 17 by file digest, but **element 5, 6, 7 and 17 name builders the executable path does not call** |
| Role-presence coherence | not measured |
| Frozen success floor | 5 / 6, unchanged and not applied |
| Unsafe under-restriction | not measured |
| Manufactured cessation drivers in negated cases | not measured |
| Controlling-vs-follow-up errors | not measured |
| K6-invalid outputs | not measured |
| Deterministic semantic inventions | 0 |
| Authority regressions | 0 |
| Posture errors | not measured |
| Over-restrictions | not measured |
| Under-restrictions | not measured |
| Driver-role hosted confirmation | **NOT EXECUTED** |
| §243 result changed | **NO** |
| Successor candidate frozen | **NO** |
| Database operations | 0 |
| Commit / push / tag / deploy | NONE |

Every "not measured" above is exactly that. None is a pass, and none may later be read as one.

## Why the gate stopped the run

The confirmation exists to answer one question: does the new driver-role representation materially
improve role selection on fresh cases. **That representation is not on the executable path, so the
six calls would not have measured it.**

The check was made against what the canonical path would actually transmit, not against what a
contract module is capable of:

| Property of the assembled request | Frozen precondition | Actual |
|---|---|---|
| `anyOf` discriminated union present | required | **absent** |
| `roleJustification` on the basis entry | required | **absent** |
| system prompt carries the justification instruction | required | **absent** |
| expressible role/carrier pairs | 6 | **10** |
| inadmissible pairs expressible | 0 | **4** |
| strict schema enabled | required | present |

Six calls transmitted under that request would have measured the §239 contract — the same contract
§243 already measured — while the evidence package would have carried a §248 heading. That is an
execution-integrity break, and it is the one thing a pre-spend gate exists to catch.

## Root cause, and it is mine

§247 created `expert-247-posture-contract.ts` and its projection in the production tree and proved
them at contract level with 33 passing assertions. **It never wired them into the executable path.**

    expert-hazlenz-analysis.ts:143   build239SystemPrompt(...)
    expert-hazlenz-analysis.ts:145   buildExpert239WireSchema(...)
    anthropic-expert-provider.ts:191,199   the same §239 bytes

The §247 report field "Driver-role representation: IMPLEMENTED" and "K6: 6 admissible / 0
inadmissible" were true of the contract module and false of the transmitted request. I did not draw
that distinction, and the product owner authorized a hosted confirmation on the strength of it.

## The identity defect this exposes

Candidate Identity v2 reported 17 of 17 and still did not catch this. Elements 5, 6, 7 and 17 name
`build247SystemPrompt`, `buildExpert247WireSchema` and the §247 module. The entry point calls the
§239 builders. **The identity bound the intended builders rather than the invoked ones**, and element
3's proof checks only that the entry point imports from `./contract/`, never which contract version
it calls.

This is the §245 failure class recurring inside the v2 identity that was built to prevent it: a
semantic artifact bound or measured without confirming that the executable path invokes it. The
lesson did not generalise far enough — §246 applied it to the contract *tree* and not to the contract
*version*.

## What I did not do, deliberately

I did not wire §247 onto the path and then execute. Precondition 7 forbids a semantic source change
after instrument freeze, and the authorization forbids remediating during execution. Repairing a
precondition myself and then spending against the instrument I had just repaired would defeat the
gate rather than satisfy it. The repair is small and well understood, but it is a change to the
frozen configuration and belongs to the product owner.

I did not redesign the instrument, add cases, alter thresholds, or touch §243 or §247.

## Evidence produced and withheld

Produced: `SECTION-248-PRE-SPEND-IDENTITY.json` with all ten precondition results and the transmitted
request properties, this report, and the manifest. The verifier itself,
`backend/scripts/verify-248-pre-spend.ts`, contains no network primitive and cannot transmit.

Withheld, because nothing ran: raw provider outputs, request-envelope and schema identities for
transmitted calls, role judgments, posture consequences, the six gate calculations, the K6 check,
the call and spend ledger, and the decision calculation. Producing any of them would assert work that
did not happen.

## What the product owner now has to decide

The bounded remediation is written and unit-proved; it is simply not activated. The minimum repair is
to point the production entry point and the adapter at `build247SystemPrompt` and
`buildExpert247WireSchema`, re-derive Candidate Identity v2 so elements 5, 6, 7 and 17 resolve to the
builders the entry point actually calls, and strengthen the element-3 proof to assert the invoked
contract version rather than the imported directory. That is a semantic-configuration change to a
frozen instrument and needs authorization.

The frozen six-case instrument, its preregistered truth and its threshold are untouched and remain
executable once the path carries what they were written to test.

§243 stands at D HOLD RELEASE. No successor candidate has been frozen. No provider call has been made.

STOP.
