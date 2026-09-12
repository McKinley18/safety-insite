# EXPERT HAZLENZ — PRESERVATION CHECKPOINT + HOSTED TRANSPORT PROBE (2026-08-29)

> ### `EXPERT_HAZLENZ_HOSTED_TRANSPORT_PROBE_BLOCKED — VALID_HOSTED_PROVIDER_CREDENTIAL_REQUIRED`
> ### Preservation commit `37a5d1b5` created LOCALLY · **NOT pushed** · **NOT deployed**
> ### Hosted calls **0** · provider calls of any kind **0** · cost **$0.00**
> ### `EXPERT_HAZLENZ_PROVIDER_VALIDATED = FALSE` · `EXPERT_HAZLENZ_CUSTOMER_ACTIVE = FALSE`

```
HEAD        37a5d1b50abe836eb19dd24ee18ad10557bda131   (local only)
origin/main de655d2f6e4c0ff7b0de17f9ccfbd3668138a936   (unmoved)
ahead 1 / behind 0
```

**Two things were authorized and one of them could not be reached.** The preservation
commit was created and verified. The hosted transport probe stopped at Phase 2, before
any spend, because no valid hosted provider credential exists on this machine.

---

## 1. What was preserved — one commit, 75 files

`37a5d1b5`, parent `de655d2f`, **75 files, +12,783 / −43**. Message:
`feat(hazlenz): establish and repair expert routing foundation`.

| group | contents |
|---|---|
| Expert core | 12 files under `backend/src/safescope-v2/expert-hazlenz/` — contract types (`analysis.v2`), normalization boundary, authority matrix, three-authority merge, provider interface, runner, prompt (`prompt.v3`), routing metrics, evaluation plan, replay provider, two fixture sets |
| provider adapter | `backend/src/safescope-v2/expert-hazlenz-adapters/ollama-expert-provider.ts` — a SIBLING directory, because the §99 no-call guard forbids network primitives, endpoints, credentials and vendor names inside the core |
| suites | 5 `test:expert-*` scripts |
| probes | 3 `probe:*` scripts (namespaced `probe:` because they make real provider calls and must not read as tests) |
| tracked production | `backend/package.json` only, **+8 script lines** |
| evidence | the three §§99–101 verification directories, 51 files |
| documents | `INSITE_ENGINEERING_BLUEPRINT.md`, `INSITE_CURRENT_STATE.json` |

**The documents carried §§94–98 and D-109/D-110 in with §§99–101, and that is stated rather
than hidden.** Those sections were also uncommitted and are contiguous with §§99–101 inside
the same two files. They document work **already deployed as `de655d2f`**. Splitting the
appended block would have committed a blueprint that jumps from §93 to §99 while §§99–101
cite §98 throughout — an incoherent document, for no gain. No code was carried in with them:
every source file in the commit is Expert.

### 1.1 Pre-existing worktree material excluded, and still present

| excluded | why |
|---|---|
| `frontend-next/tsconfig.json` | the known `NEXT_DIST_DIR` build contamination. sha256 **`73990cd1…`**, byte-identical to the value §99 recorded — untouched by this operation and left unstaged |
| `verification/…/kg-3e/source-evidence/ecfr-1910-146.xml` (deleted) | a pre-existing unstaged deletion, left exactly as found |
| `backend/scripts/lib/test-database-ownership.{js,d.ts,js.map}` | compiled artifacts dated 2026-08-28, from an earlier phase; the `.ts` source is already tracked |
| 2,156 further untracked entries | logos, ` 2.ts` duplicates, other phases' verification output |

No reset, restore, clean, stash, rebase or force-push. The four stashes and 24 tags are unmoved.

### 1.2 The staged diff was scanned before committing

75 files scanned for `sk-`/`sk-ant-`/`AKIA`/`ghp_`/`xox`/`AIza` prefixes, private-key headers,
`Authorization`/`x-api-key` headers carrying a value, connection strings with embedded
credentials, cookies, and `process.env` dumps. **Six matches, all benign and each checked by
hand:** three are the substring inside `…validate-ri`**`sk-a`**`ssessment-adapter` in
`package.json`, and three are `onrender.com` — the public production URL, already present at
HEAD in both documents. **No secret, credential, token or provider response containing
confidential data is in the commit.**

---

## 2. Why the hosted probe is BLOCKED and not FAILED or INCONCLUSIVE

`FAILED` would blame a provider. `INCONCLUSIVE` would mean transport worked but a defect
would corrupt evaluation. **Neither happened, because no call was made and no provider could
be selected.** The full inspection is in `credentials/CREDENTIAL_STATES.txt`; the summary:

| credential | state |
|---|---|
| `ANTHROPIC_API_KEY` | **ABSENT** |
| `OPENAI_API_KEY` | **OBVIOUS_STUB** — 11 characters |
| Gemini / Google / Vertex | **ABSENT** |
| Mistral · Groq · Together · DeepSeek · xAI · Cohere · OpenRouter · Fireworks · Perplexity | **ABSENT** |
| `AI_GATEWAY_API_KEY` | **ABSENT** |
| `VERCEL_OIDC_TOKEN` | **PRESENT → UNUSABLE (EXPIRED)** |

**No credential value was printed, logged, hashed or persisted.** Presence, length, and — for
the one JWT — its own `exp` claim.

### 2.1 The one candidate that had to be evaluated rather than dismissed

A Vercel OIDC token authenticates Vercel AI Gateway, which would have been a real hosted path,
and `vercel whoami` confirms the CLI is authenticated as `mckinley18`. So it was checked
properly. Its own claims settle it: `iat 1781750401`, `exp 1781793601`, now `1788055244` —
**expired by 1,739 hours, about 72 days.** A 12-hour build token, long dead.

Expiry is only the first of three reasons, and the other two would hold against a fresh one:

1. **Minting a new token is an unauthorized act.** `vercel env pull` is a Vercel account
   operation and rewrites `.env.local`, untracked user work. This operation is explicitly not
   authorized to make Vercel changes.
2. **It is the wrong credential.** Its scope is
   `owner:…:project:safety-insite:environment:development` — provisioned for FRONTEND builds,
   not for Expert inference. Its AI Gateway balance and billing posture cannot be established
   from here, so **`MAX_HOSTED_COST_USD = 3.00` could not be bounded before the first call**,
   and Phase 3 forbids a call whose maximum possible spend cannot be bounded.

### 2.2 What was NOT done to manufacture a result

- **Ollama was not substituted.** It is reachable on `127.0.0.1:11434` and it is the §§100–101
  provider, and the authorization says plainly not to call a local model a hosted probe.
  It was not called. **0 provider calls of any kind were made by this operation.**
- **No hosted adapter was written.** Phase 4 authorizes the smallest adapter *for the selected
  candidate*. No candidate could be selected, so an adapter would be written against a guessed
  provider-native transport — speculative code, unexercised, sitting in the tree looking like
  progress it is not.
- **No credential was requested from the owner mid-operation**, and none was fabricated.

---

## 3. Phase status, honestly

| phase | status |
|---|---|
| 0 preservation inventory | **EXECUTED** |
| 1 local accepted checkpoint | **EXECUTED** — `37a5d1b5`, not pushed |
| 2 hosted candidate selection | **EXECUTED → BLOCKED.** No selectable candidate |
| 3 hard spend boundary | recorded (`MAX_HOSTED_CALLS = 8`, `MAX_HOSTED_COST_USD = 3.00`) and **never consumed** |
| 4 hosted adapter | **NOT EXECUTED** — no candidate to adapt to |
| 5 prompt/schema invariance | **NOT EXECUTED** — `analysis.v2` / `prompt.v3` unchanged, which is the invariance this phase would have had to preserve |
| 6 pre-call gate | **EXECUTED ANYWAY** (§4 below) — it is what proves the preserved checkpoint is the verified state |
| 7 hosted fixtures H1–H8 | **NOT EXECUTED** |
| 8 grounding metrics | **NOT MEASURED** |
| 9 hosted transport gates | **NOT EVALUATED** — 0 of 18, not 0-passed-of-18 |
| 10 transport ≠ quality | binding regardless; both flags stay FALSE |
| 11 post-probe regression | folded into §4; there was no probe work to regress |
| 12 documentation | **EXECUTED** |
| 13 terminal | **BLOCKED** |

The evidence-grounding question §101 raised — `quotes = 0/0` on all 14 local calls, so every
Expert candidate so far is **ungrounded** — is **exactly as open as it was**. H7 and H8 were
built to answer it and did not run. `EVIDENCE_OPPORTUNITIES`, `EVIDENCE_QUOTES_EMITTED`,
`EVIDENCE_QUOTES_EXACTLY_BOUND`, `EVIDENCE_QUOTES_UNBINDABLE` and
`EVIDENCE_QUOTES_FABRICATED` are all **NOT MEASURED**, not zero.

---

## 4. Verification actually executed at the preserved commit

Run at `37a5d1b5`, after the commit, to prove the checkpoint *is* the verified state rather
than assuming it. Every figure matches §101's record field for field.

| suite | result |
|---|---|
| `test:expert-contract-foundation` | **56 / 0** |
| `test:expert-authority-merge` | **51 / 0** |
| `test:expert-provider-failure` | **131 / 0** |
| `test:expert-nocall-harness` | **141 / 0** |
| `test:expert-routing-contract` | **57 / 0** |
| `test:l32i-clarification-carrier` | **61 / 0** — Level-3 quarantine intact |
| `test:l32j-carrier-activation` | **37 / 0** — Level-3 quarantine intact |
| `test:kg4a-cutover-contract` | **146 / 0** |
| `test:kg4a-default-off` · `test:kg4d-default-off` | **52 / 0** · **121 / 0** |
| `test:hazlenz-level1-recall` · `test:hazlenz-actionable-coverage` | exit 0 · exit 0 |
| `test:hazlenz-precision` | case-level precision **100.0 %**, required-hazard omissions **0**, dangerous omissions **0**, life-critical omissions **0** |
| backend `tsc --noEmit` | **exit 0** |

Raw output: `regression/`.

**Confinement, re-proved at this HEAD.** `grep -rl expert-hazlenz` over `backend/src`,
`backend/scripts` and `frontend-next` returns **ten** files — eight scripts, the adapter, and
one core file. **No controller, service or module reaches the Expert layer**, checked directly
against `*.controller.ts`, `*.service.ts` and `*.module.ts`. The only tracked production file
modified across §§99–101 remains `backend/package.json`. No frontend source was touched.

---

## 5. What this checkpoint does NOT mean

The preservation commit changes exactly one thing: the work now survives in git locally.
It does not make the local model provider-validated, does not select a production provider,
does not validate Expert reasoning, does not authorize the seventeen-measure evaluation, and
does not activate anything for a customer.

**It is also not a deployment, and that distinction is load-bearing on this repository.**
`autoDeploy=yes` with `autoDeployTrigger=commit` on `main` means **pushing to `origin/main`
IS a production deployment**. `origin/main` is unmoved at `de655d2f`. Production runs
`de655d2f` and contains no Expert code.

---

## 6. Residual debt

**Unchanged and still open:** hosted-provider transport unmeasured · every Expert candidate
ungrounded (`quotes = 0/0` across 14 calls) · routing measured on one local model only ·
live malformed-output behaviour unobserved · `test:kg5b-operator-cli` 64/65 ·
unresolved-jurisdiction ranking · `directObjectStatus: NOT_VERIFIED_LOCAL_TEST_PROVIDER` ·
`LIVE_PAYMENT_PROOF = FALSE`.

**New:** the hosted question is now **entirely a credential question**. No engineering work
stands between this checkpoint and a hosted probe — `probe:expert-transport` and
`probe:expert-routing` would run against a hosted adapter unchanged, and the eight fixtures
H1–H8 including the two grounding controls are specified. What is missing is one valid
hosted provider API key with billing the owner is willing to bound at $3.00.

---

## 7. Exact next operation

**The account owner provisions ONE hosted provider credential**, in their own terminal, for a
provider whose current published pricing lets an 8-call probe be bounded under $3.00. Then the
probe of Phases 3–13 runs unchanged: adapter, H1–H8 including the two evidence-grounding
controls, the eighteen hard gates, and the grounding metrics that decide whether a hosted model
can quote where the local one never has.

Nothing here authorizes that spend by itself. Nothing was pushed, deployed, tagged, or run
against production, the original SafeScope database, Render, Vercel or Stripe.
