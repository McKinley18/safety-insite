# §258 — Expert HazLenz Production Build Restoration and Executable Equivalence Proof

Provider calls: **0**. Database operations: **0**. Pushes: **0**. Tags: **0**. Deployments: **0**.
Database operations: **0**. `main` not used and not modified.

The production TypeScript build is restored by a one-token type-annotation correction. Every
emitted JavaScript file is byte-identical to the pre-repair build. No semantic behaviour changed.

**CASE A.**

---

## 1. Exact root cause

`POSTURE_REF_KINDS_237` **never existed**. It is not declared anywhere in the repository, in any
branch, or at any point in history. A search over `-S "POSTURE_REF_KINDS_237 ="` across all refs
returns nothing.

Every occurrence of the name in the tree is either the single broken reference itself or a quoted
copy of the resulting compiler message inside regression runners and evidence emitters. The only
non-quoted use is the one at the error site.

The declaration at `expert-237-posture-contract.ts:192-193` is:

```ts
export const DRIVER_ROLE_REF_KIND_237:
Readonly<Record<PostureDriverRole237, (typeof POSTURE_REF_KINDS_237)[number]>> = {
```

The name in the type position is a transcription slip: `_237` was written where `_233` was meant.

## 2. Historical evidence establishing the intended identifier

Five independent lines of evidence, none of them the compiler's suggestion.

**The file already imports the correct symbol, and uses it nowhere else.**
`POSTURE_REF_KINDS_233` is imported at line 56 of this very file. Across the whole 400-plus-line
module it appears exactly once more: in that import. It was brought in for line 193 and for nothing
else. An unused import is the strongest available evidence of the author's intent.

**`POSTURE_REF_KINDS_233` is the only reference-kind set that exists.**
A search for `REF_KINDS_<n> =` across the entire contract chain returns exactly one definition:

```ts
expert-233-posture-contract.ts:145:
export const POSTURE_REF_KINDS_233 = ['HAZARD_CANDIDATE', 'UNRESOLVED_DECLARATION'] as const;
```

**§237 inherits from §233 rather than specializing it.** The module header states that "§237 builds
its prompt and schema from §233 and can reduce both back to §233 byte for byte." It imports nine
symbols from §233 and defines no reference-kind set of its own.

**No later successor defines a different kind set.** §239's `DRIVER_ROLE_REF_KINDS_239` is declared
`Readonly<Record<PostureDriverRole239, readonly PostureRefKind233[]>>` — explicitly the §233 kind
type — and §239 carries a **runtime guard** that throws if any role binds to a kind §233 does not
define:

```ts
if (!POSTURE_REF_KINDS_233.includes(k)) {
  throw new Error(`FIRST_PASS_239_ABORT: ${role} binds to a kind §233 does not define`);
}
```

§247 generates its K6 union from `DRIVER_ROLE_REF_KINDS_239` rather than restating it. The §233 set
is therefore the authoritative vocabulary for the whole chain at runtime, not only in types.

**The object literal already satisfies the corrected annotation exactly.** All five values in
`DRIVER_ROLE_REF_KIND_237` are `'HAZARD_CANDIDATE'` or `'UNRESOLVED_DECLARATION'` — precisely the
two members of `POSTURE_REF_KINDS_233`. The annotation was always describing this set; it simply
named it wrongly.

**On question 5, whether the identifier can affect runtime JavaScript:** it cannot. The name appears
only inside a type annotation on a `const` declaration. TypeScript erases type annotations during
emit. This is proved empirically in section 5 rather than asserted.

## 3. Files changed

One.

    backend/src/safescope-v2/expert-hazlenz/contract/expert-237-posture-contract.ts

| | |
|---|---|
| SHA-256 before | `757c41a598b80893c8a301a9de9bb393d8847dea926d752a2f660efeb4bf5695` |
| SHA-256 after | `540e2df7ff9bc74999c09c12ee29d9d1db171df09e61530fd01c82c3a8b1935c` |
| Lines changed | 1 |
| Tokens changed | 1 |

No other file was touched. No naming, formatting, annotation, unused declaration, technical-debt or
historical-inconsistency cleanup was performed. No H3/H4 work. No `dischargingControlRef` work.

## 4. Exact source diff

```diff
--- a/backend/src/safescope-v2/expert-hazlenz/contract/expert-237-posture-contract.ts
+++ b/backend/src/safescope-v2/expert-hazlenz/contract/expert-237-posture-contract.ts
@@ -190,7 +190,7 @@ Readonly<Record<PostureDriverRole237, string>> = {

 /** Which reference kind each role may be used on. Pure lookup; nothing is inferred. */
 export const DRIVER_ROLE_REF_KIND_237:
-Readonly<Record<PostureDriverRole237, (typeof POSTURE_REF_KINDS_237)[number]>> = {
+Readonly<Record<PostureDriverRole237, (typeof POSTURE_REF_KINDS_233)[number]>> = {
   ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION: 'HAZARD_CANDIDATE',
   ESTABLISHED_CONDITION_REQUIRING_CONTROLS: 'HAZARD_CANDIDATE',
   ESTABLISHED_CONDITION_REQUIRING_CESSATION: 'HAZARD_CANDIDATE',
```

`(typeof POSTURE_REF_KINDS_233)[number]` was chosen over the equivalent exported alias
`PostureRefKind233` because it preserves the exact expression shape the author wrote and keeps the
change to a single token.

---

## Semantic non-change proof

### 5. Emitted runtime JavaScript — **unchanged**

Both trees were emitted from the same `tsconfig.json` to separate output directories and every
emitted `.js` file digested and compared.

| | |
|---|---|
| Emitted `.js` files, before | 1,118 |
| Emitted `.js` files, after | 1,118 |
| Files differing | **0** |

**Every emitted JavaScript file is byte-identical.** This is a whole-program comparison, not a
comparison of the changed module alone.

**Emitted type declarations: exactly one file differs, on one line.**

```
before: export declare const DRIVER_ROLE_REF_KIND_237: Readonly<Record<PostureDriverRole237, (typeof POSTURE_REF_KINDS_237)[number]>>;
after:  export declare const DRIVER_ROLE_REF_KIND_237: Readonly<Record<PostureDriverRole237, (typeof POSTURE_REF_KINDS_233)[number]>>;
```

This is reported rather than glossed. The change is material only in that the previous declaration
was itself **unresolvable** — it named a symbol that does not exist, so the emitted `.d.ts` was
broken. After the repair it resolves to `'HAZARD_CANDIDATE' | 'UNRESOLVED_DECLARATION'`, which is
what the value always was. The declaration moves from broken to correct; it does not move from one
meaning to another.

### 6. Provider request bytes — **unchanged**

`§254` pre-spend gate G3 confirms `strictSchema` is FALSE on the envelope and on the assembled
request, and G1 re-derives the full candidate identity from the assembled request bytes to the
authorized digest.

### 7. System prompt — **unchanged**

    G13  the system prompt matches the frozen candidate
         a2f53370753526ad2a5ae8c07a8b81956c91bbdc67fc7b82e84da9e110d6a957

### 8. Runtime wire schema — **unchanged**

G4 confirms the §253 successor cessation schema is the one the entry point invokes, and G5 that the
finalized `alongsideControlConsidered` semantics are bound. The §253 alongside-control suite's Z1
and Z2 both hold: the transmitted contract refuses exactly what the projection refuses and admits
exactly what it admits.

Independently, `expert-237-posture-contract.ts:430` computes a contract-identity digest as
`sha(JSON.stringify(DRIVER_ROLE_REF_KIND_237))`. That digest is taken over the object's **runtime
values**, which a type annotation cannot reach, so it is unchanged by construction as well as by
measurement.

---

## Build results

| # | command | exit code | TS errors |
|---|---|---|---|
| 9. | `npm run build` | **0** | **0** |
| 10. | `npm run build:render` | **0** | **0** |

**No additional build blocker surfaced.** The single TS2552 was the only error, and repairing it
revealed nothing behind it. Case C does not apply.

---

## 11. Regression results

All local, all zero provider calls and zero database operations. Because the build now succeeds,
every suite below was run with **full type checking**, not the `--transpile-only` bypass §257
required.

| suite | result |
|---|---|
| §254 pre-spend / candidate gate | **26 / 26 PASS** |
| Protected-module verification, read-only | **29 present, 0 missing, 0 mismatched** |
| §252 admission matrix | **18 / 18 PASS** |
| §243 historical replay | **exact match to the frozen §252 record** |
| §253 alongside-control closure | **27 passed, 0 failed** |
| §253 candidate identity | **33 passed, 0 failed**, digest re-derives to v2.3 |
| §247 driver-role and K6 | **33 passed, 0 failed** |
| §237 posture closure, the repaired contract's own suite | **204 passed, 0 failed** |
| §239 contract binding closure | **336 passed, 0 failed** |
| §252 candidate identity | 22 passed, **3 failed** — pre-existing, see below |

### The three §252 candidate-identity failures are not a §258 regression

`test-252-candidate-identity` fails P2, P4 and P5 with `identity digest: null`. The reported causes
are that "the assembled wire schema matches no known builder" and "production and adapter invoke
different contract versions."

This is the accepted A5 supersession: the suite derives **Candidate Identity v2.2** and knows only
the §247 wire-schema builder, while the entry point now invokes `buildExpert253WireSchema`, the
§253 successor. The suite cannot resolve a builder it predates.

**This was verified rather than assumed.** The single token was temporarily reverted, the file
digest confirmed back at `757c41a5…`, the suite re-run, and the result was identical: the same
22 passed / 3 failed, the same P2, P4 and P5, the same detail text, the same null digest. The
repair was then restored and the file digest confirmed back at `540e2df7…`. The failures predate
§258 and are independent of it.

### Preserved safety properties

| # | property | result |
|---|---|---|
| 12. | §252 admission matrix | 18 fixtures, 0 failed, `closureMatchesTransport=true`, `validatorDisagreements=0` |
| 13. | §243 replay | `total=24 admitted=2 refused=22 preserved=1` — identical to the frozen record's `totalOutputs 24, fullyAdmitted 2, refused 22, unresolvedTruthPreserved 1` |
| 14. | **F11** | **ADMIT with exactly one contained declaration refusal.** The fixture declares `containedDeclarationRefusals: 1` and the matrix asserts it, so the row cannot pass vacuously |
| 15. | §253 alongside-control | 27 passed, 0 failed. C1 and C2 confirm no invention and nothing supplied for a refused field; D1, D2 and D3 confirm owed unresolved truth survives |
| 16. | **Semantic inventions** | **0** — gate G14, admission matrix, §243 replay and §253 suite C1 all independently |
| 17. | **Unsafe malformed admissions** | **0** — admission matrix and §243 replay |
| 18. | Unresolved-truth preservation | **preserved.** §243 replay preserves 1; F13 returns `PRESERVE_UNRESOLVED`; §253 D1 preserves an owed fact while the cessation driver is refused |

No driver-role remediation was attempted and none occurred. No hosted observation was executed.

---

## Identity

| # | | |
|---|---|---|
| 19. | Historical Candidate Identity v2.3 | `293697746d7de52c1c5b8492592189e93211a0c986975832d8d8401bb258cfbf` |
| 20. | **§258 successor candidate identity** | `10c9712d9da6217a7958a8763ebc845a7fb80f1f8b810dd969727329fb70b2ad` |
| 21. | Protected modules | **29** |
| 22. | Mismatched / missing protected modules | **0 / 0**, composite unchanged at `9b3964b5…` |

The successor identity is the SHA-256 over six newline-joined `key=value` lines binding the
historical v2.3 digest, the repaired file's path and digest, the protected composite, the system
prompt identity and the emitted-JavaScript manifest digest. The derivation is recorded in
`SECTION-258-SUCCESSOR-IDENTITY.json` and is reproducible from the tree.

**Candidate Identity v2.3 still re-derives unchanged**, and that is stated precisely rather than
used to claim the tree is still v2.3. The repaired file is neither one of the 29 protected modules
nor an element of the v2.3 derivation, and the runtime values it defines are unchanged, so G1
matches exactly. v2.3 remains the historical identity of the §254 validated candidate. No
historical identity artifact was rewritten, and neither the §256 nor the §257 accepted identity
artifacts were overwritten.

---

## Git and production boundary

| # | | |
|---|---|---|
| 23. | Commit SHA | recorded in `SECTION-258-POST-COMMIT.txt` and in git history. A commit cannot contain its own hash, so it is not embedded here |
| 24. | Diff summary | 1 source file, 1 insertion, 1 deletion, plus the §258 evidence package |
| 25. | `git status` after commit | recorded in `SECTION-258-POST-COMMIT.txt` |
| 26. | `main` / `origin/main` | `main` at `37a5d1b50abe836eb19dd24ee18ad10557bda131`, unchanged. `origin/main` at `de655d2f6e4c0ff7b0de17f9ccfbd3668138a936`, unchanged |
| 27. | Provider calls | **0** |
| 28. | Database operations | **0** |
| 29. | Pushes / tags / deployments | **0 / 0 / 0** |

Work remained on `beta/expert-hazlenz-validated-candidate-2026-09-12`. No child branch was created,
because a single bounded one-token repair does not materially benefit from one.

The running production SHA remains separately **UNVERIFIED**, carried forward unchanged.

## 30. Package digest

Recorded in `REPORT-258.sha256`. The package digest is the SHA-256 of that file.

## 31. Terminal

    EXPERT_HAZLENZ_BUILD_RESTORED —
    CONTRACT_REPRESENTATION_SUCCESSOR_AUTHORIZATION_REQUIRED

STOP.
