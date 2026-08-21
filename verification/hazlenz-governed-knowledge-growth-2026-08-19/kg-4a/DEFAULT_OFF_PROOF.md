# KG-4A Phase 21 — the mandatory default-off proof

`npm run test:kg4a-default-off` — **51/51**. Deliberately the most adversarial suite in the slice: it
assumes the implementer wanted the cutover on and tries to catch them.

## 1. Exactly one seam, enumerated

Source scan over **573 customer-path files** (`safescope-v2`, `applicable-standards`, `inspection`,
`reports`, `safescope`), comments stripped so prose references are not mistaken for imports:

* **No customer module imports a governed data module directly** — `governed-corpus-lookup`,
  `release-record-review.service`, `regulatory-release-lifecycle.service`, `approval-contract`,
  `governed-resolution`: **0 importers**.
* The only cutover modules a customer path imports:

| File | Imports |
|---|---|
| `safescope-v2/safescope-v2.controller.ts` | `standards/cutover/governed-cutover-context` |
| `safescope-v2/safescope-v2.service.ts` | `standards/cutover/governed-cutover-context` |
| `applicable-standards/applicable-standards.service.ts` | `standards/cutover/governed-cutover-context` |
| `inspection/inspection.service.ts` | `standards/cutover/cutover-mode` |

`cutover-mode.ts` is the **pure configuration contract** — it parses environment variables and answers
*"is this principal enabled"*. It has no database access and **imports nothing at all** (asserted), so
importing it is not a path to governed data; it is a path to the answer *"no"*. `inspection.service.ts`
needs it for the anti-spoofing gate, which must live where the write happens.

* Cutover configuration is read in **exactly one file**.
* **No request body, query, param or header can select a mode** — 0 matches.

## 2. The seam is inert under ordinary configuration

For each environment below, `resolveCutoverEnablement()` → `LEGACY` **and**
`GovernedCutoverContext.create()` → **`null`** (the seam does not exist at runtime):

| Environment | Result |
|---|---|
| completely empty | LEGACY / null |
| typical dev (`NODE_ENV=development`) | LEGACY / null |
| typical test | LEGACY / null |
| typical production | LEGACY / null |
| **mode set, no allowlist** | LEGACY / null |
| **allowlist set, no mode** | LEGACY / null |
| **misspelled mode + full allowlist** | LEGACY / null |
| **production governed mode without the acknowledgement** | LEGACY / null |

Plus: no shipped config file (`.env*`, `render.yaml`, `docker-compose.yml`, `Dockerfile` — 6 checked)
sets any governed cutover variable; the ambient environment resolves to LEGACY.

## 3. Behaviourally identical to pre-KG-4A

Against a clone **with an active release carrying 41 approvals** — so an enabled seam would have had
governed data to find — for four realistic queries (electrical, guarding, fall, MSHA traffic):

* `suggest(...)` with no cutover argument is **byte-identical** (`JSON.stringify` equality) to
  `suggest(..., null)`;
* the default payload contains **no `governedDeliveryState`**, **no `knowledgeReleaseId`** — no new
  keys at all, not even null-valued ones;
* **nothing** is reported as `APPROVED_GOVERNED_CONTENT`; `corpusBacked` is `false` for every result.

## 4. The falsification check — the proof is not vacuous

Same database, same user, same approved citation:

* with an explicit mode **and** allowlist → the context **is** created, pins
  `federal-core-2026-08-20.5`, and returns **verified governed content** for `1910.212(a)(1)`;
* with default configuration → **there is no context at all**.

So §3's silence is a real default-off, not an empty corpus.

## 5. What was NOT done

* No release was activated for customer use. The KG-3F canonical corpus still has **no active
  release** — asserted after every mutating run.
* No production system, deployment, remote branch or the SafeScope development database was touched.
* No commit, no push, no deploy.
* Every activation happened **inside a disposable clone**, owned and dropped by the suite that made it.
