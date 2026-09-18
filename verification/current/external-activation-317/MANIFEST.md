# §317 — EXTERNAL-USER ACTIVATION: EVIDENCE PACKAGE

| File | What it is |
|---|---|
| `SECTION-317-EXTERNAL-ACTIVATION.json` | The machine-readable summary. Every number in the report is derived from here. |
| `HZ-11-EXTERNAL-ACTIVATION-ASSUMPTIONS.md` | The assumption audit: the five findings that can affect an external participant, and every assumption class checked and found clear **with the reason**. |
| `FRESH-USER-HARD-GATE.md` | The journey from nothing to a finished report, step by step, with the operator interventions required at each step. |
| `CPF2-CPF3-CLOSURE.md` | Each registered adjustment recorded as closed or deliberately deferred, and what the closure does **not** cover. |
| `ENTITLEMENT-ACTIVATION-BOUNDARY.md` | Free, comped and paid, all three, without making the owner's decision. Includes the one place a direct database mutation is genuinely required. |
| `EXPERT-ACTIVATION-BOUNDARY.md` | The four conditions before Expert can run, the production ceilings, and the refusal UX. |
| `LOCKOUT-AND-RECOVERY.md` | Whether a participant can be permanently locked out, and the minimum safe temporary support procedure — **designed, not built**. |
| `PAYMENT-SURFACE-STATE.md` | Every customer-visible payment surface classified READY / SAFE_BUT_INACTIVE / BLOCKED / MISLEADING. |
| `CLAIMS-INVENTORY-317.md` | Input to CM-1: surface, claim, current wording, evidence dependency. **Not** the claims audit. |
| `gate/section-317-gate.json` | 33 cases, all passing, on the repaired build. |
| `gate/section-317-gate-PRE-REPAIR.json` | The **watched-to-fail** run: the same gate against a build in which only the two behavioural repairs were reverted. Exactly `EXP-2` and `RP-1` fail; nothing else moves. |
| `review-free/`, `review-pro/` | The page review: 128 page/theme/width visits per tier at 390/768/1280/1440 in both themes, on a production build. |
| `claim-surfaces.json` | The captured text of every public claim-bearing surface, with disclosures opened. |
| `regressions.log` | The seven backend regression suites. |
| `screenshots/` | The targeted captures behind the named findings. |

## WHAT IS NOT HERE, AND WHY

The 256 full-page sweep screenshots are **not committed** — roughly 110 MB. Each measurement record
in `cpf2-cpf3-measurements.json` carries the path of its own screenshot, and both sweeps are
reproduced by one command each:

```
APP_URL=… API_URL=… VAL_EMAIL=… VAL_PASSWORD=… TIER=… OUT_DIR=… \
  node frontend-next/scripts/review-317-external-activation.mjs
```

A representative set at 390px in light theme is committed for each tier.

## REPRODUCING THE GATE

```
createdb <disposable> && DATABASE_URL=… npm run migration:run          # in backend/
DATABASE_URL=… DEV_AUTH_BYPASS=false EXPERT_EXECUTION_ENABLED=false \
  STORAGE_PROVIDER=local_test EMPLOYER_PRO_PROMO_CODES=<code> npx ts-node -T src/main.ts
npm run build && npx next start -p <port>                              # in frontend-next/
APP_URL=… API_URL=… PROMO_CODE=<code> OUT_DIR=… \
  node frontend-next/scripts/validate-317-external-activation.mjs
```

The gate **refuses to run** unless the server has already refused an Expert request on the API. That
is not a courtesy: it is what keeps a run from driving the Expert control against a server that
would actually reach a provider and spend money.
