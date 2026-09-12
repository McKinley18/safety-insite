# §203 — Agent D: schema closure / authority red team

**Provider calls: 0 · Database operations: 0 · Files created: 2 (this report and
`backend/scripts/test-203-schema-closure-redteam.ts`) · Implementation files modified: 0.**
Date 2026-09-07. Independent of Agents B/C/E: no assertion below relies on their suites; every
verdict was established by executing the real frozen modules with hostile input from my own suite
(**107 passed / 0 failed**, first run, no assertion weakened at any point).

## 1. Model-facing objects enumerated

| # | object | boundary | closure mechanism | additional properties permitted? |
|---|---|---|---|---|
| 1 | `SuccessorClarificationDeclaration` | `checkBindingDeclarations203` | runtime key-closure (`UNKNOWN_FIELD_AT_CLOSED_BOUNDARY`) + forbidden-field scan + schema `additionalProperties:false` | **no** — justified: none needed |
| 2 | `SuccessorNominationPayload` | same, NOMINATED_NEW branch | runtime key-closure + §202 owned-field scan + dedicated `priority` refusal + schema closed | **no** |
| 3 | first-pass successor declaration | `projectDeclaredOwedFacts203` | runtime top-level key-closure + ABF-7 nested walk + schema closed on every node | **no** at top level; **value shapes are enforced downstream** (see RT203-1 caveat) |
| 4 | `urgencyNomination` value | binding boundary | vocabulary membership (`URGENCY_NOMINATION_NOT_A_MEMBER`) | n/a (scalar) |
| 5 | `FactIdentityCollisionDiagnostic` | output, not input | provider free text appears only in fields explicitly labelled `nominated*` | n/a |
| 6 | E's grammar-identity module | **no model-authored value reaches it** on the successor path: schemas are HazLenz-authored; `rejectionSignature` is a deterministic transport-derived class. Determination stated, probes run anyway (§8) | n/a |

No successor model-facing object permits additional properties anywhere in its schema tree
(mechanical recursive walk, cases 1.1–1.2), and the schema property sets are asserted equal to the
runtime closed key sets (1.3–1.5), so the schema constant and the enforcing parse cannot drift —
the §201 BYPASS-2 class ("a comment claiming a layer that was never built") does not recur here:
**the runtime enforcement exists and was attacked directly.**

## 2. Attacks run

107 counted cases: 23 authority-bearing fields + 7 key variants (case-changed, whitespace,
Unicode-confusable, `constructor`, `toString`) at declaration level; the same minus legal fields at
nomination level; `priority` with member, non-member, numeric and null values; `__proto__` as a
genuine own key via `JSON.parse` at both levels and at the projection top level; an inherited
(prototype-chain) `priority`; nomination-as-array; a combined multi-field attack; admitted-set
key-purity over the corpus; 9 projection top-level attacks; nested citation burial at depth 3 and
depth 10; hostile declaring stage; forged evidence provenance; urgency-to-priority escalation
attempts including a forged admitted check; settlement attempts; collision-diagnostic forgery;
delimiter injection and `__proto__` probes against E's module; effect-declaration truthfulness.

## 3. Verdicts — what HELD (the consequential ones in plain language)

- **Unknown fields cannot acquire deterministic authority by surviving parsing — PROVEN for the
  binding path.** Every unknown or forbidden field, in every spelling variant, at both levels, is
  refused whole-declaration; nothing admitted carries an unknown key (2.10); and even a
  **forged admitted check** cannot launder authority: `applyAdmittedDeclarations203` reads named
  fields only, writes the deterministic priority constant (5.4), and its G6 post-condition
  **throws** on a forged collision (7.1) — the flagged `as unknown as BindingCheckResult` cast is
  structurally sound under attack, not merely under the happy path.
- **Ruling 5 HOLDS end to end.** `nomination.priority` is refused under its own code for any value
  (2.3); `urgencyNomination: LIFE_CRITICAL` is carried but the applied fact is `OTHER` (5.2); and
  the frozen G8 hole (`structural-questions.ts:138` reading `d.nomination?.priority`) is closed **by
  contract absence**: a successor nomination has no priority field to read, so the projected
  question is `OTHER` (5.5, executed through the real frozen function).
- **No settlement channel.** `settled`/`resolved` refused as HazLenz-owned (6.1); the successor
  result surface has no settlement-named member (6.2); the only path to a terminal status is the
  frozen `transition` under its closed authority vocabulary (6.3).
- **Collision integrity.** A terminal collision is refused before apply with the diagnostic's
  status taken from the **ledger** — nominated prose demanding a reopen cannot forge it (7.3) — and
  no question is projected for the refused nomination (7.4).
- **`__proto__` arrives as an own key via JSON.parse and is refused as unknown** at all three
  boundaries (2.4–2.6, 4.2); an inherited `priority` is also refused because `in` walks the
  prototype chain (2.7).
- **E's rejection key resists delimiter injection** (8.1): component content shaped like a
  delimiter cannot merge two keys — AB203-5's class is closed in the §203 constructor.

## 4. Findings (all EXPECTED-FINDING cases in the suite; none silently tolerated)

| id | verdict | severity | finding |
|---|---|---|---|
| **RT203-1** | HELD-WITH-CAVEAT | **MEDIUM** | The successor ABF-7 walk imports §202's `nestedForbiddenGovernanceFields`, which **fails OPEN past depth 8** (`expert-202-authority-boundary-guards.ts:252` returns `[]` — silent truncation, the same class as Agent F's AB203-1). Executed: a citation at depth 10 under a legal key produces **zero successor refusals** (RT203-1) and is stopped only by the frozen projection's `REQUIRED_FIELD_MISSING` shape check on the carrier (4.4) plus, in hosted use, the transport keyword. Defense-in-depth held on every carrier I could construct — every legal key's value is shape-checked downstream — but the successor boundary's own claim ("recursive walk") is depth-bounded and the bound fails open, not closed. Disposition: report to orchestrator; a §203 fix would need either a depth-unlimited walk or a fail-closed refusal at the depth limit, and the guard is §202's, not mine to edit. |
| **RT203-2 / 2b** | BROKEN (no authority acquired) | **MEDIUM** | `question` value shape is **TYPE_ONLY** at the binding admission boundary: `{citation:'29 CFR 1910.147', approved:true}` as the `question` value is **admitted with zero codes** and the frozen `projectStructuralQuestions` copies it **verbatim** onto the (development-only) question surface. No deterministic authority is acquired — priority/status stay ledger-derived (3.1) — but this is a citation-bearing free-content channel through a boundary whose contract says closed, and the nested-governance walk is not applied to binding declaration values at all. |
| **RT203-3** | BROKEN (no authority acquired) | LOW-MEDIUM | Declaration-level `affectedDecision` on the BOUND path is copied to the question surface **unchecked** — `'TOTALLY_BOGUS_DECISION'` admitted. Only `nomination.affectedDecision` is membership-checked. TYPE_ONLY. |
| **RT203-4** | BROKEN (no authority acquired) | LOW | Object-valued `declarationId` admitted on the binding path (used only for duplicate detection; the projection path, by contrast, enforces `FACT_KEY_SHAPE`). TYPE_ONLY. |
| **RT203-5** | HELD-WITH-CAVEAT | LOW / not model-facing | A schema property literally named `__proto__` is **erased** from E's grammar identity (`o[k]=v` sets the prototype, not an own key), merging two different grammars — the false-MERGE direction for a rejection cache. Not reachable by model-authored data (schemas are HazLenz-authored); a `Object.defineProperty`/null-prototype rebuild would close it. |

Common shape of RT203-2/3/4: the successor boundary enforces **key closure** rigorously but
**value shape** only where a specific check exists (blank/vocabulary/verbatim-span). Fields whose
values feed only display/observability surfaces (`question`, declaration-level `affectedDecision`,
`declarationId`) ride on TypeScript types alone — the §201/§202 defect class, surviving at smaller
blast radius. None yields status, priority, settlement, key, or escalation authority; all three are
refused at the projection boundary's stricter twin where one exists.

## 5. Ruling 4 / Ruling 5 verdicts

**Ruling 4 (closed schemas): PASS with the RT203-2/3/4 caveat.** `additionalProperties: false` is
present at every object node of every declared successor model-facing schema (mechanical walk) and
the runtime parse genuinely enforces key closure — unknown authority-bearing fields cannot survive
parsing. Value-shape closure is complete on the projection path, partial on the binding path.

**Ruling 5 (no provider priority/escalation authority): PASS, attacked from five directions**
(payload field, forged check, urgency channel, frozen question projection, effect declarations).

## 6. Verification executed

- `npx ts-node scripts/test-203-schema-closure-redteam.ts` → **107 passed / 0 failed**, 6
  EXPECTED-FINDING ledger lines printed (first run; no reruns needed, no assertion adjusted).
- `EXPERIMENT_SCOPE_TYPECHECK (§203)`: `npx tsc --noEmit -p tsconfig.scripts-203.json` → see
  orchestrator run record (exit status reported in my completion message).
- `npx ts-node scripts/verify-203-text-integrity.ts` → reported in completion message.
- `git status` → only the two Agent-D files created; zero implementation or pre-existing files
  touched.
