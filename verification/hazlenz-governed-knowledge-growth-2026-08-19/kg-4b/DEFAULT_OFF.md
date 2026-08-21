# KG-4B Phase 19 — the authoritative default-off regression for the current architecture

`npm run test:kg4b-default-off` — **48/48**, against a server **genuinely running
`GOVERNED_CUTOVER_MODE=SHADOW`**.

## Why this supersedes the KG-3F check

`test:kg3f-customer-path-disconnection` still reports 9/9, but its scan excludes everything under
`standards/` — which is where KG-4A's resolver and KG-4B's shadow comparator live — so it can no
longer see the seam it was written to guard. **The KG-3F suite is left unmodified** (it is KG-3F
evidence); this suite states the current property, and `test:kg4a-default-off` remains the static
half of the same claim.

**What is new here over KG-4A**: KG-4A proved default-off statically and in-process. KG-4B proves it
against a running server with the mechanism *switched on* — the hardest case, because a
non-allowlisted customer must still be completely untouched.

## Configuration cannot drift into a governed or shadow mode

Twelve environments, each → `LEGACY` **and** `GovernedCutoverContext.create()` → `null`:

no mode · empty mode · whitespace mode · malformed mode (`SHADOW_MODE`) · truthy mode (`true`) ·
numeric mode (`1`) · **SHADOW without an allowlist** · **SHADOW with an empty allowlist** ·
**allowlist without a mode** · org allowlist without a mode · SHADOW in production without the
acknowledgement · GOVERNED_STRICT in production without the acknowledgement.

Startup still **refuses** production `SHADOW`, `GOVERNED_WITH_FALLBACK` and `GOVERNED_STRICT` without
`GOVERNED_CUTOVER_PRODUCTION_ACK`.

## A client cannot request SHADOW or any governed mode

* **0** files read a mode from a request body, query, param or header.
* Cutover configuration is read in exactly one file, `standards/cutover/cutover-mode.ts`, which
  **imports nothing** — so it cannot become a second route to governed data.
* Through the API, all five mode-selection attempts are **rejected with 400** by request validation.

## On a live SHADOW server, both accounts are untouched

| | non-allowlisted | allowlisted (SHADOW) |
|---|---|---|
| receives a real analysis | ✔ 201 | ✔ 201 |
| `governedDeliveryState` in payload | **absent** | **absent** |
| `governedFallbackReason` | **absent** | **absent** |
| `governedTextUnavailable` | **absent** | **absent** |
| `knowledgeReleaseId` | **absent** | **absent** |
| anything `APPROVED_GOVERNED_CONTENT` | **no** | **no** |

The allowlisted account **is** in SHADOW — the corpus run proves the resolver executed and emitted 83
comparisons — and its customer payload is still indistinguishable from the legacy one.
