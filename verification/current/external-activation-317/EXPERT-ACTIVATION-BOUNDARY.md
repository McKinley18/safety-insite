# §317 — WHAT A NEWLY ENTITLED EXTERNAL USER MUST SATISFY BEFORE EXPERT HAZLENZ CAN RUN

**Zero provider calls were made. Zero Expert analyses were executed. Spend: $0.00.**

The gate enforces that rather than intending it: `validate-317-external-activation.mjs` establishes
the server's refusal on the API *before* it will drive the Expert control in a browser, and aborts
the whole run if the server would actually execute. The kill switch is evaluated before the
pre-spend claim (§268), so a refused request writes no execution row and cannot reach a transport;
the refusal body carries `providerCallsMade: 0` and that field was asserted.

---

## THE FOUR CONDITIONS, IN THE ORDER THE SERVER APPLIES THEM

| # | Condition | Where | Refusal a participant sees |
|---|---|---|---|
| 1 | **Authentication** | `JwtGuard` | `401` |
| 2 | **Entitlement `fullSafeScope`** | `EntitlementGuard` + `@RequireEntitlement('fullSafeScope')` on all three Expert routes | `402 PAID_SUBSCRIPTION_REQUIRED`. The panel renders the §284 plan notice — no enabled control, no error styling — and stops re-asking after a server-authoritative refusal. |
| 3 | **Kill switch `EXPERT_EXECUTION_ENABLED`** | `expert-operational-controls.ts`, evaluated after authorization and before the claim | `503 EXPERT_EXECUTION_DISABLED` — *"Expert analysis is temporarily unavailable. Your deterministic HazLenz analysis is unaffected and this observation can still be reviewed, finalized and reported. No analysis was run and nothing was charged."* |
| 4 | **Both ceilings** | same module, same moment | `503 WORKSPACE_ANALYSIS_CEILING_REACHED` or `WORKSPACE_COST_CEILING_REACHED` — *"This workspace has reached its Expert analysis limit for now. Deterministic HazLenz analysis is unaffected. No analysis was run and nothing was charged."* |

There is **no fifth condition**. No manual activation, no per-account enablement, no allowlist, no
operator step. A newly entitled external participant with headroom under both ceilings can run
Expert immediately.

---

## THE CEILINGS, AS THEY STAND IN PRODUCTION

| Setting | Production | Code default |
|---|---|---|
| `EXPERT_EXECUTION_ENABLED` | `true` (§298, ACTIVE since 2026-09-15) | enabled outside production; **must be explicitly `true` or `false` in production or boot fails** |
| `EXPERT_DAILY_ANALYSIS_LIMIT_PER_WORKSPACE` | **1** | 50 |
| `EXPERT_DAILY_COST_LIMIT_USD_PER_WORKSPACE` | **1** | 25 |
| window | 24 h | 24 h |
| provider legs per analysis | 2 (authoring + verifier) | — |

Scope of the ceiling for an individual: **per user.** `readWorkspaceExpertUsage` filters on
`execution."requestedByUserId"` when `organizationId` is NULL, so one Beta participant cannot
consume another's allowance. Re-verified at §317 against the source, not inherited from §316.

**Preserved.** §317 changed neither ceiling and made no production configuration change.

---

## THE UX WHEN EXPERT IS UNAVAILABLE — AND THE DEFECT §317 FOUND IN IT

Before §317: the server refused correctly and **the interface showed nothing at all.** Measured on
the real product with the kill switch off — 503, the sentence above, `providerCallsMade: 0`, and no
change on screen at 0.5s, 1s, 2s, 4s and 7s after the click. The button remained enabled. The only
reading available to an inspector is that the product is broken, and their next move is to press it
again.

Root cause and repair are recorded in `HZ-11-EXTERNAL-ACTIVATION-ASSUMPTIONS.md` (EA-1). After the
repair the server's own sentence is relayed verbatim in a `role="alert"` region, and it survives the
reconciling read that follows it. Gate case `EXP-2`; it fails on the pre-repair build.

**This matters more than the ceiling value.** At 1 analysis per user per 24 hours, every external
Beta participant meets this path on their second observation of the day. Raising the ceiling would
have moved the silence, not removed it.

---

## WHAT THE PRODUCT OWNER STILL HAS TO DECIDE

1. Whether Expert remains enabled at all during external Beta.
2. If it does, the per-user 24-hour analysis count and USD ceiling.

Both are set by environment variable with no code change. §297/OPS-2 applies: change, deploy, then
read the live values back from the running service, polled to a stable answer rather than sampled
once.
