# TEST TIERS

One canonical command per tier. Established at **§263** to stop ordinary development from depending
on remembering §-numbered script filenames.

The rule that governs which tier to run: **use the lowest tier that can answer the engineering
question in front of you.** Formal frozen acceptance is not the default development loop.

---

## TIER 0 — STATIC / IDENTITY

No database, no network, no writes. Seconds.

```
npm run hazlenz:verify
```

Candidate identity recomputed from live sources (22 elements), 29 protected modules, evidence
integrity, and agreement with the current-state manifest. Reports `PASS`, `FAIL`, `UNVERIFIED_LIVE`
and `ENVIRONMENTALLY_BLOCKED` as four distinct outcomes; it never converts an unknown into either of
the first two.

## TIER 1 — UNIT / PURE DETERMINISTIC

No database. Pure logic: the confirmation rule and the no-call harness.

```
npm run hazlenz:test
```

`test:261-confirmation-rule` (60) — the confirmation rule over closed-vocabulary structured fields.
`test:expert-nocall-harness` (141) — includes the source-level proof that the Expert engine
directory contains no vendor name, endpoint, network primitive or credential.

## TIER 2 — LOCAL INTEGRATION

Disposable database, replay transport, the real HTTP route.

```
npm run hazlenz:integration:test
```

Creates its own `test_insite_*` database, migrates it from zero, forces `NODE_ENV=test` and
`DEV_AUTH_BYPASS=false`, runs `test:261-expert-persistence-foundation` (69),
`test:262-expert-authoritative-route` (94), `test:264-expert-human-confirmation` (78) and
`test:265-expert-product-acceptance` (76), then drops the database whether the suite passed or
failed.

§265 added the last of those. It re-establishes the §260 acceptance set **through the read surface
the frontend actually uses** — which is a different assertion from §262's "the write returned the
right thing" — and adds the downstream cases L, M and N. Case K is **not** here: it is a browser
rendering rule, it is executed by the frontend suite below, and claiming it in a server suite would
be the weaker evidence pretending to be the stronger.

`DEV_AUTH_BYPASS=false` is forced rather than left to the operator: the developer `.env` enables the
bypass, and an authorization suite run under it measures the bypass instead of the route.

## TIER 3 — BUILD

```
npm run hazlenz:build
```

`npm run build` and `npm run build:render`, the two production TypeScript paths.

## TIER 3F — FRONTEND (added at §265)

**No `hazlenz:*` command runs this tier**, because it lives in the other workspace. From
`frontend-next/`:

```
npm run test:expert-presentation          59 assertions, including acceptance case K
npm run check:expert-authority-boundary   8 structural checks over the Expert frontend source
npx tsc --noEmit -p tsconfig.json
npm run build
```

The first is behavioural: given a server response, does the browser report what the server said. The
second is structural and covers what the first cannot — the ABSENCE of a second authority derivation
elsewhere in the feature. A component that quietly computed `state === "CONFIRMED"` would pass every
assertion in the first and is caught by the second.

`npm run lint` is **not** a gate in this workspace and never has been: it reports 520 pre-existing
errors across the app. The four files §265 added lint clean.

## TIER 4 — LIVE ENVIRONMENT

**No §263 command runs this tier**, and none contacts a live environment.

Object storage, report generation, billing, deployment and one hosted provider call. Currently:
storage is ENVIRONMENTALLY BLOCKED, everything else is UNVERIFIED LIVE. `hazlenz:verify` names them
so their silence is not read as a pass.

## TIER 5 — HISTORICAL FORENSIC

Old §-numbered replay and characterization scripts. **Sandbox only.**

There is deliberately no convenience command. 252 of these write into accepted historical evidence
packages and 101 more have write behaviour a static reader could not resolve. Consult
`verification/current/MUTATING-SCRIPTS.json` first, and run them against a copy.

Run this tier only to investigate provenance, reproduce a historical defect, audit a frozen
decision, or change an invariant one of them established.

---

## COMPOSITE COMMANDS

| command | tiers | when |
|---|---|---|
| `npm run hazlenz:check` | 0 + 1 + build | after a small product change |
| `npm run hazlenz:precommit` | 0 + 1 + 2 + 3 + evidence guard | before an authorized commit |

Neither calls a provider, touches a production database, pushes, tags or deploys.

## WHAT NOT TO DO

Do not rerun every historical characterization suite on every change. That is what Tier 5 is
separated for, and running it casually is how §258 mutated two frozen packages without noticing.
