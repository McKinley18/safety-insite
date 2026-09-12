# §203 — orchestrator integration report

**Provider calls = 0 · database operations = 0 · no commit / push / tag / branch / deploy · no
customer activation · 2,470 / 2,470 baseline files byte-unchanged · §187 pins 7/7 byte-identical ·
governed-binding stage remains `REDACTED` · adjudication remains 0 / 120.**

One orchestrator plus six specialist agents (A–F), strict file ownership written before launch
(FILE-OWNERSHIP-MAP.md), one declared serial handoff (B → C on
`expert-203-successor-binding.ts`). Every suite result below was **re-executed by the
orchestrator**, not taken from an agent's report.

## 1. Ruling 1 — the successor development contract

No §187-pinned file was modified. Agent A located the pin
(`owedFactSourceHashes` in
`verification/expert-hazlenz-required-structured-verifier-validation-2026-09-05/PREREGISTRATION.json`)
and recomputed all four pinned hashes plus `expert-prompt.ts` and
`expert-verifier-contract-v3.ts` **byte-identical**, before and after.
`expert-first-pass-owed-fact-projection.ts` is not hash-pinned anywhere but was classified
FROZEN_BY_RECORDED_EVIDENCE and treated exactly as pinned.

The successor contract is `hazlenz.expert.203-successor-boundary.v1`, held as code in
`expert-203-successor-identity.ts` with per-module lineage (COPIED_FROM / WRAPS / NEW) and the
seven ancestor pins as data. Minimum copied surface: **two functions** (the binding admission
check and the apply step), copied because the frozen checker *requires* the provider-authored
`priority` field the Ruling-5 successor contract removes, and because the collision test itself
had to change. Everything else **wraps** (ABF-1/2/7 sit in a wrapper that delegates to the
unmodified frozen projection) or is imported unchanged (the frozen ledger — the ABF-5 defect is
in admission, not in the ledger's documented no-op dedup). The successor has its own source
manifest (`SUCCESSOR-SOURCE-MANIFEST.json`, 12 successor files + 7 ancestor pins), its own
integrity gate (`verify:203-source-integrity`, distinguishing SUCCESSOR_DRIFT from
ANCESTOR_DRIFT, loud on absent manifest — the MANIFEST_ABSENT failure was demonstrated, not
assumed), and its own test evidence. Historical §187 behavior remains reproducible
byte-for-byte.

## 2. Ruling 2 — verbatim exposure not activated

The governed-binding stage was not touched by any agent; the §202 verbatim-evidence mode remains
unactivated and the default remains `REDACTED`. No citation-regex accumulation was performed
(BYPASS-1's detector is unchanged and still carries its recorded blind spots — that is the
recorded state, not a §203 repair).

## 3. Ruling 3 — ABF-5 / FACT_IDENTITY_COLLISION (Agent C, 63/63)

The successor admission boundary widens the ancestor's UNRESOLVED-only collision test to **every
terminal status, derived from the frozen `OWED_FACT_STATUSES` rather than restated**. A colliding
nomination is refused with the explicit structural state `FACT_IDENTITY_COLLISION` plus a
structured diagnostic naming both identities, carrying `semanticPosition: 'NONE_TAKEN'` — the
ruling's "do not infer identical, do not infer different" held as data. All nine required
regression classes pass. The decisive case is the differential: the **frozen** path re-measured
still admits → silently no-ops → `preservationViolations` = [] (§202's ABF-5.a reproduced against
the untouched ancestor); the **successor** refuses the same input loudly, emits no question for
the rejected nomination, never reopens the terminal fact, never synthesizes a key.

**Separate architecture analysis returned, not implemented:** semantically distinct facts CAN
realistically collide, and the deeper asymmetry is that `NominationPayload.factKey` is a
provider-authored free string (blank-checked only, not even shape-tested) while the first-pass
wire denies naming authority by construction. Recommendation to the product owner: HazLenz
computes nomination identity (removing provider naming authority); interim: shape + namespace
validation. Decision is the product owner's.

## 4. Rulings 4 and 5 — closure and priority (Agents B and D)

Every successor model-facing schema sets `additionalProperties: false` **at every object node**
(asserted by recursive walk), and the runtime parse enforces unknown-key rejection — schema and
parser key sets are asserted equal, so they cannot drift apart (the BYPASS-2 class, a schema
constant nobody enforces, is structurally excluded). The successor nomination contract carries
**no provider priority field** (presence refused regardless of value); priority is
deterministically assigned; model urgency survives only as `urgencyNomination`, vocabulary-checked,
non-authoritative, measured to map into no priority and no escalation state. This dissolves the
ABF-4 contract contradiction **for the successor only** — the frozen contracts still disagree and
ABF-4 remains open on the frozen path.

Agent D attacked all six enumerated model-facing objects with 107 counted adversarial cases —
authority fields at both levels and at depth, case/whitespace/Unicode-confusable keys, real
`__proto__` own-keys via JSON.parse, prototype-chain injection, forged checks and forged
diagnostics, attacks through B's one declared cast. **An unknown field cannot acquire
deterministic authority by surviving parsing**, and Ruling 5 held from five directions. Five
findings were recorded as EXPECTED-FINDING cases rather than weakened away; the common shape is
that **key closure is rigorous, value-shape closure is partial** on the binding path (RT203-2:
an object-valued `question` carrying citation-shaped content flows verbatim to the
development-only question surface; RT203-3: BOUND-path `affectedDecision` unchecked; RT203-1:
the ABF-7 guard inherits §202's depth-8 fail-open truncation — defense-in-depth held at depth 10
but the bound fails open). None yields authority; all are dispositioned in
SCHEMA-CLOSURE-RED-TEAM.md and none was repaired, since hardening beyond the five authorized
guards was not granted.

## 5. Guard integration (Agent B, 52/52)

All five §202 Category-A guards are integrated into the successor path with actual exercised call
sites, **imported from `expert-202-authority-boundary-guards.ts`, never reimplemented**. For each
of ABF-1/2/3/7/8 three facts are separately asserted: GUARD_EXISTS, GUARD_CALLED (the unsafe
input produces the guard's specific code at the boundary), and
GUARD_REJECTS_ADVERSARIAL_INPUT with the caller intentionally supplying the unsafe value —
alongside paired cases proving the **frozen path still admits the same inputs today**, so the
successor's effect is measured, not asserted. ABF-8's ceiling is structurally unwidenable
(`fn.length === 3`; no parameter exists). Safe-path differentials are byte-identical to the
ancestor; A's documented anchor-ordinal divergence is pinned by a regression test rather than
hidden. The five §202 pure guards remain uncalled on the frozen path — they are correctly
described as integrated **in the successor only**.

## 6. Ruling 7 — effective grammar identity (Agent E, 45/45)

`expert-203-effective-grammar-identity.ts` retires the §201 prototype prospectively. The three
§201 dangerous equivalences are **measured from the §201 module on disk and proven split** in
§203 (string/number; `additionalProperties` false/true; pattern content). Six §202 gaps are
closed, two of them measured false-merges in §202's own module (`dependentRequired` name arrays;
`unevaluatedProperties/Items` booleans). Undeclared decisions are resolved toward SPLIT — the
safe direction for a rejection cache, where the dangerous failure is a would-be-accepted grammar
inheriting a recorded rejection. The §199 cohort replay first validates the reconstruction
against the recorded contract ids (SG-01 `d0713f36696e8bea`, SG-02 `243bb6766c05599f`, fail-loud),
then partitions **10 ABSENT / 2 PRESENT on both sent and wire schemas**; the §200-defect replay
issues 12/suppresses 0 under the old key and **suppresses exactly SG-02** under the §203 key. The
enum decision (arity+kinds, not values, not lengths) is the load-bearing one and was chosen by
measurement against all three alternatives, with the residue recorded as a limit. The identity
**remains a proxy**; the disclaimer is machine-readable data (`GRAMMAR_MEASUREMENT_CLAIMS_203`,
five members, all false, asserted). Agreement with provider behaviour is one cohort of twelve —
agreement, not equality. Agent F's AB203-5 (delimiter injection collapsing two suppression keys
into one) was forwarded mid-flight and is closed in the §203 composed key: structural encoding,
never a string join, with a byte-identical-naive-encoding regression pair.

## 7. Systemic authority-boundary audit (Agent F)

11 new findings (AB203-1…11): 2 HIGH, 1 MED-HIGH, 2 MEDIUM, 3 LOW, 3 INFORMATIONAL; by class 2
NO_ENFORCEMENT_FOUND, 3 TYPE_ONLY, 3 CALLER_ONLY, 1 COMMENT_ONLY, 1 DEFENSE_IN_DEPTH_ONLY, 1
CALLER_ONLY/INFO. **No CRITICAL — nothing is customer-reachable today** (production build
boundary and the literal-`false` development gate both re-verified). 7 of 11 demonstrated by
executing the real modules with hostile values; 8 boundaries checked and recorded **sound**,
including the settlement-authority brand. The three consequential ones, plainly: the
normalization module's "every nested key" scans silently stop at depth 8 and report clean
(AB203-1 — the audit-that-cannot-read-must-fail-loudly class, in a frozen surface); the claim
that raw provider JSON is fenced by the type system is TYPE_ONLY at the merge seam (AB203-2 —
fourth confirmed instance of the unbranded-provenance class); `mintSettlementAuthority`'s
"requires a recorded human decision" rests on an unbranded plain object (AB203-3). The §202 red
team's declared gap is now closed: the rejection-cache key derivation was challenged and broken
(AB203-5), and the break is fixed **in the §203 key only**. KNOWN ledger carries ABF-1…11 and
BYPASS-1…8 forward with per-item anchor status. Declared unswept surfaces are named in the
report. All findings are analysis only — no patches outside §203 authorization.

## 8. HIGH-1 and HIGH-2 — exact status

Neither falls wholly inside a §203 ruling; **neither was repaired**, silently or otherwise.

**HIGH-1** (two divergent owed-fact implementations, both live, bidirectional drift): facts,
invariant conflict, and the three separable product-owner questions stand exactly as recorded in
§202's HIGH-1-HIGH-2-DISPOSITION.md; the §202 drift tripwire (4 assertions) re-executed green in
today's 83/83. Note for the decision: the §203 successor path builds on the **runtime** family
and does not retire the prototype — choosing the canonical implementation remains entirely open.

**HIGH-2** (settlement boundary has no producer): status unchanged; the §202 clarification is
preserved and restated precisely — `consumeSettlementClaims` never reads `requestedBy`, so the
producer/consumer incompatibility is a **compile-time barrier only**, and this remains a
compile-time claim, not promoted into observed runtime behavior. The runtime protections that do
hold (structural sanity check, `ledgerUnchanged`, the unforgeable settlement brand) were
re-executed green today. The four separable product-owner questions stand. Related new evidence
for that ruling: AB203-3 shows the brand's *trust root* is unbranded — worth reading alongside
HIGH-2 question 2.

## 9. NUL / text integrity

`verify:203-text-integrity` scans every §203 code file and every file in this evidence directory
byte-safely (fs reads, never grep) and fails on any raw 0x00: **PASS, 0 violations** across all
§203 files including this report. During development it caught a raw 0x1F control byte in Agent
E's module, which was repaired before freeze — the gate worked in-flight, not only at the end.

## 10. Verification — all re-executed by the orchestrator

| suite | result |
|---|---|
| test:203-boundary-guards | **52/52** |
| test:203-identity-collision | **63/63** |
| test:203-grammar-identity | **45/45** |
| test:203-schema-closure-redteam | **107/107** (5 EXPECTED-FINDING cases, none weakened) |
| §202 × 4 | 137/137 · 54/54 · 80/80 · 83/83 |
| §196 / §198 / §199 | 92/92 · 89/89 · 43/43 |
| §201 × 4 | 59/59 · 59/59 · 216/216 · 67/67 |
| §193 / §194 / v3-binding / v3-dev | 46/46 · 48/48 · 49/49 · 40/40 |
| **SRC_TYPECHECK** | **PASS** (`tsconfig.json`, `src/**` only) |
| **EXPERIMENT_SCOPE_TYPECHECK (§203)** | **PASS** (`tsconfig.scripts-203.json`) |
| **EXPERIMENT_SCOPE_TYPECHECK (§202)** | **PASS** (11 files) |
| verify:203-source-integrity | **PASS** (19 files, 0 successor drift, 0 ancestor drift) |
| verify:203-text-integrity | **PASS** (0 raw NUL) |
| **preservation** | **2,470 / 2,470 byte-unchanged** |

**267 new §203 assertions.** Neither typecheck is repository-wide; `backend/scripts` retains its
181-diagnostic pre-existing baseline under the corrected historical measurement, which §203 did
not re-measure and did not change.

## 11. Files

**Created — code (13):** five `expert-203-*` lib modules, four `test-203-*` suites, two
`verify-203-*` gates, the manifest generator, `backend/tsconfig.scripts-203.json`.
**Created — evidence (11):** this directory's contents.
**Modified pre-existing (1, orchestrator only):** `backend/package.json` — nine §203 script
entries appended by targeted edit, prior bytes preserved. **Modified by agents: zero
pre-existing files.** The 16 pre-existing uncommitted `M` entries and 1 `D` entry in the
worktree predate §203 and are byte-verified untouched.

## 12. Authorizations required next

| # | request | note |
|---|---|---|
| 1 | **Fact-identity construction revision** — Agent C: provider naming authority over `NominationPayload.factKey` should be removed (HazLenz computes identity); interim: shape + namespace validation | architecture; FACT_IDENTITY_COLLISION is complete without it |
| 2 | **AB203-1 / AB203-2 / AB203-3** — depth-8 fail-open normalization scan; TYPE_ONLY raw-JSON merge seam; unbranded settlement trust root — all in frozen/pinned surfaces | the successor-path pattern from Ruling 1 is the available instrument |
| 3 | **RT203-1/2/3 value-shape closure** on the successor binding path | successor files, but beyond the five authorized guards |
| 4 | **HIGH-1** — which owed-fact implementation is canonical | unchanged from §202, three separable questions |
| 5 | **HIGH-2** — whether the settlement consumer gets a producer | unchanged from §202, four separable questions; read with AB203-3 |
| 6 | **Successor promotion** — moving any caller from frozen to successor modules (migration §5 of SUCCESSOR-VERSION-ARCHITECTURE.md, steps 2–4) | nothing was promoted in §203 |
| 7 | **The 120 adjudication verdicts** — 0 supplied; U01 remains available | product owner only |
| 8 | **Any provider call**, including a hosted canary; the verbatim-evidence mode | remains unauthorized; deferring still costs zero |

**No successor module is imported by any production `src/` file, none is reachable from the
production build (`tsconfig.json` `include: ["src/**/*"]`), and nothing was promoted into the
active Expert path.**
