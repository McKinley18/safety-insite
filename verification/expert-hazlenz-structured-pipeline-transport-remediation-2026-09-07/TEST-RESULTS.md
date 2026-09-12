# §198 — test results

```
npm run test:198-transport-remediation      89/89 PASS  ·  0 FAIL
npm run verify:198-source-integrity         PASS 72/72
```

Full per-case output: `TEST-OUTPUT.txt`. Gate output: `SOURCE-INTEGRITY.txt`. Both executed; neither
result is inferred.

## The authorization's matrix, A–P

| id | requirement | cases | result |
|---|---|---|---|
| **A** | zero sources — schema omission, no maxItems workaround, no binding instruction, ordinary path still valid | A1–A8 | **PASS** — property absent from `properties` and `required`; **no `maxItems` before the strip runs**; no instruction in the prompt; prompt and schema derived from one source of truth |
| **B** | zero sources — provider cannot introduce the binding | B1–B3 | **PASS** — refused at the boundary and prohibited by `additionalProperties: false` |
| **C** | one source — capability present, exact sourceId visible | C1–C5 | **PASS** — `sourceId: GOV-ABRASIVE-01` rendered; enum is the supplied set |
| **D** | multiple sources — closed set visible, nothing unsupplied | D1–D6 | **PASS** — plus duplicate and malformed ids **refused rather than normalised** |
| **E** | unsupplied id refused | E1–E4 | **PASS** — including a case-differing near-miss |
| **F** | id/text pairing deterministic, no cross-pairing | F1–F4 | **PASS** — and no hidden internal identifier is offered |
| **G** | citation-shaped supplied text does not itself trigger the collision | G1–G4 | **PASS** — the verifier reuse path is confirmed unaffected |
| **H** | unsupplied citation-shaped authority still fails closed | H1–H3 | **PASS** — first pass and verifier both |
| **I** | offline provider-request compatibility for all twelve §197 requests | I1–I4 | **PASS** — **zero known-prohibited keywords remain**, `maxItems` regression explicit |
| **J** | §108 strip regression — not extended, not relied upon | J1–J3 | **PASS** — `maxItems` still passes through the strip untouched, because §198 does not need it to |
| **K** | circuit breaker — two identical rejections stop the run | K1–K3 | **PASS** — attempts 1 and 2 recorded, attempt 3 not issued |
| **L** | non-identical rejections not falsely collapsed | L1–L6 | **PASS** — message, stage, contract and status all discriminate; normalisation keeps the tool index |
| **M** | inference-time failure must not trip the breaker | M1–M4 | **PASS** — an inference-reaching attempt breaks the streak |
| **N** | empty-run scorer — no green behavioural wording at zero executions | N1–N8 | **PASS** — including the two exact strings §197 printed |
| **O** | integrity comment false positive | O1–O6 | **PASS** — plus **O2b**, which records that comment-stripping alone would *not* have rescued the §197 check |
| **P** | §196 regression, K3 corrected without rewriting history | P1–P8 | **PASS** — both prompt variants reconstruct to v15; the register distinguishes historical from current |

## Beyond the matrix

| id | proves | result |
|---|---|---|
| **Q1–Q6** | the §197 preregistration can no longer be satisfied (prompt hash and every per-row schema hash moved), and §197 remains inconclusive with every axis `NOT_EXERCISED`, an unevaluable hard-fail block, and its recorded instrument defects intact | **PASS** |
| **R1–R3** | §196's historical 91/91 output still contains the original K3 line verbatim | **PASS** |

## Legacy suites, all re-run

| suite | result |
|---|---|
| §196 structured owed-fact matrix | **92/92 PASS** (91 → 92; K3 corrected, K3b added) |
| §193 citation-boundary hardening | **46 passed, 0 failed** |
| §194 regulatory basis | **48 passed, 0 failed** |
| verifier-v3 binding protocol | **49/49 PASS** |
| verifier-v3 development integration | **40/40 PASS** |
| §195 preservation gate | **PASS 21/21** |
| `tsc --noEmit -p tsconfig.json` (`src/` only) | clean |
| `tsc --noEmit -p tsconfig.scripts-198.json` (§196–§198 file set) | clean |

### The §196 and §197 gates were NOT re-run, deliberately

Both **write** `SOURCE-INTEGRITY.txt` into their own evidence directories, and the §197 gate
additionally pins the vNext prompt hash that §198 moved on purpose. Re-running either would
overwrite a frozen record or fail on a pin that is *supposed* to have moved. Their still-valid
checks are subsumed by the §198 gate, and preservation is proven by **hashing** both packages rather
than by re-deriving them.

## Defects §198 found in its own new code, before it was finished

Four cases failed on first run and each was a real defect, not a bad test:

1. **A7** — the projection refused every declaration lacking the now-omitted governed field. The
   parser had to learn that an absent field is the normal shape on a capability-absent treatment.
2. **K2** — the message normaliser replaced any quoted token of eight characters or more, turning
   `property 'maxItems' is not supported` into `property '{identifier}' is not supported` and making
   two *different* unsupported-keyword rejections look identical. It now treats a quoted token as an
   identifier only when it carries a separator or a digit.
3. **O2** — the assertion named the wrong file, and revealed something better: comment-stripping
   alone does **not** rescue the §197 proximity scan, because the ledger also *imports*
   `MODEL_AUTHORED_SOURCES` nearby. Recorded as **O2b**; the real fix was always the value assertion.
4. **P8** — asserted `maxItems` against the wrong register field.

## What these results do NOT establish

- **No hosted behaviour.** Zero provider calls. vNext and v3.3 both remain `HOSTED VALIDATED = FALSE`.
- **No semantic evidence.** Nothing here measures whether a model declares the right facts. Every
  §197 axis is still `NOT_EXERCISED`.
- **Not even transport success.** §198 proves the request no longer *contains* a keyword this
  provider is known to reject. It does **not** prove the provider accepts the request — only sending
  one can do that, and §198 sends none.
- **No §196 contract question resolved.** Owed-property representation, priority escalation
  authority and semantic correctness all remain open.
