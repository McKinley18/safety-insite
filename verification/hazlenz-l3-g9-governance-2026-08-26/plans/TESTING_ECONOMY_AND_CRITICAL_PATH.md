# TESTING ECONOMY, CRITICAL PATH, AND THE STANDING INSTRUMENTATION RULE

---

# 1. TESTING ECONOMY — stop paying to re-verify what is already proven

**Governing principle:** *evidence already bought is never re-bought.* §65.5 already applied this —
`D-93`'s three axes were **preserved, not re-purchased**, when funding changed. The same rule now
governs the rest of L3.

| tier | what it is | cost | exit criterion to the next tier |
|---|---|---|---|
| **0** | static / type / unit — `tsc` strict, unit suites, digest assertions | **`$0`** | all green **and** every frozen identity re-verified from disk |
| **1** | deterministic local regression — the 814 L3 assertions, KG contracts, `hazlenz-core`, scorer synthetic suites | **`$0`** | zero regressions against the recorded baseline; any new invariant has a test **before** the change |
| **2** | **recorded-provider-output replay** — re-score frozen artifacts with changed downstream code, **zero new inference** | **`$0`** | the change reproduces every prior figure it must not move, and moves only what it claims to. **Any downstream change — binder, validator, resolver, scorer — is fully testable here.** |
| **3** | small development-provider cohort, tightly bounded | **≤ `$3`** (≈ 100 calls at the measured `$0.0305`) | pre-declared success criteria met on the development corpus; **all four RC-1 axes reported; no veto tripped** |
| **4** | broader development validation | **≤ `$15`** (≈ 500 calls) | Tier 3 passed; rate/clustering questions answered; cross-process stability measured at n ≥ 100 |
| **5** | **new sealed independent acceptance (Run 3)** | ≈ **`$6`** + an irreplaceable tranche | see the Run-3 condition below — **the corpus, not the money, is the cost** |

> **Tier 2 is the one being under-used and it is the highest-leverage.** Run 2 produced 186 fully
> recorded provider evaluations across two isolated processes. **Every downstream change — a
> deterministic state resolver, a clarification resolver, a binder tier change — can be replayed
> against that recorded output at `$0` before a single new call is bought.** `RC-2` arm **B** is
> *entirely* testable at Tier 2.

## Explicit prohibitions

> **Another sealed run purely to see whether the result changes is PROHIBITED.** A sealed corpus is
> single-use and irreplaceable; money is not the binding constraint and never was.
>
> **No tier may be skipped upward.** Tier 3 is not authorized until Tiers 0–2 pass. Tier 5 is not
> authorized until Tier 4 passes **and** the two conditions below both hold.

## The exact condition for another paid provider cohort (Tier 3/4)

**All** of: a specific remediation is implemented; it passes Tiers 0–2 including a Tier-2 replay
showing the intended movement and no unintended movement; pre-declared success criteria and vetoes
exist **in writing before the run**; and the cohort is **development-only** with no reserved tranche
touched.

## The exact condition for Run 3 (Tier 5)

**All four, simultaneously:**

1. a demonstrated material remediation of `RC-1` **and** `RC-2`, meeting the Tier-3/4 criteria with
   **no veto tripped**;
2. the `RC-3` question resolved — either an architecture measured to deliver the required
   reproducibility, **or** a provider with a real determinism control, **or** an explicit governance
   decision on G9 taken **on product grounds and recorded before the run**;
3. a **fresh** authored-control set and an unspent tranche, built under the `D-I` / `D-D.6` rules;
4. **explicit user authorization** naming both frozen identities, as Run 2 required.

> **Condition 2 is currently unmet and is the binding one.** Without it, Run 3 fails G9 on arrival —
> which is why "fix RC-1 and RC-2 then re-run" is *not* a sufficient plan.

---

# 2. FINISH-THE-APP CRITICAL PATH

## The finding that matters most

> ### **LEVEL 3 IS NOT BLOCKING APP COMPLETION, AND NEVER HAS BEEN.**
>
> `CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`. `customerDefaultMode = LEGACY`.
> `productionShadowEnabled = false`. `governedCutoverModeSetInProduction = false`. **Level 3 has never
> been customer-operational and no customer has ever received Level-3 output.** The Run-2 failure
> changes nothing a customer sees. It is a **research result about a candidate provider**, not a
> product defect.

## A — required before the existing Level-1 product can be production-tested / launched

These are **KG / Level-1** items from `openItems`, none of which involve Level 3:

* **`KG5C-DISC-01`** — adjudicate the 634 mid-word-truncated legacy summaries **before widening
  legacy delivery**. *(customer-visible content quality — the clearest launch blocker)*
* **`KG4E-DISC-03`** — `GET /inspection-reports` returns every version's full frozen
  `sourceSnapshot`. *(payload/privacy surface)*
* Confirm the platform log pipeline collects and retains `kg4c.shadow-comparison.v2` events.
* Name the single internal Stage-1 account and set the four locks *(operational decision)*.
* Operator-triggered instant kill switch *(control-plane)*.
* Decide whether the **six governed-release migrations** `1800000009000`–`1800000014000` are applied
  in production. They are currently **unapplied**; production has 40. **Applying them is additive and
  reversible, but it is a production action requiring its own authorization.**

## B — required only for Level-3 promotion — **not launch blockers**

* `RC-1` and `RC-2` remediation · the `RC-3` architecture/provider decision · `RC-4` rate evidence ·
  the G9 product specification · **the hosted production adapter behind `HazLenzReasoningProvider`,
  which does not exist** (§45.6 — the L3-2o shim must **not** become one) · a future Run 3 ·
  production-provider selection.

## C — optional post-launch Level-3 work

* Governed-mode widening beyond `LEGACY`, gated by the existing rules: **`GOVERNED_STRICT` must not be
  pursued as a customer mode while emitted-approved coverage is 23/160**, and **`GOVERNED_WITH_FALLBACK`
  must not be enabled for customers until a production shadow exercises the eleven unobserved
  categories.** · closing `GOVERNED_MISSING` (137 declared-but-unemitted citations, 39 parent/child
  ambiguities, 42 duplicate declarations, 3 records without a source URL, 5 OSHA registry mismatches).

## Shortest defensible path

**To PRODUCTION TESTING:** adjudicate `KG5C-DISC-01` → resolve `KG4E-DISC-03` → confirm the log
pipeline → name the Stage-1 account and set the four locks → decide the six migrations under
authorization → enable **production shadow** with `customerDefaultMode = LEGACY` unchanged.
**Level 3 appears nowhere in that list.**

**To LAUNCH:** production shadow observes cleanly across the eleven currently-unobserved categories →
close the `GOVERNED_MISSING` items required for the delivery scope → launch on **`LEGACY`**, with
Level 3 **absent from the customer path**.

> **Level 3 must be explicitly declared NON-AUTHORITATIVE and OUT OF THE LAUNCH SCOPE**, so that L3
> research cannot become an open-ended blocker. **This phase does not change authority or deploy
> anything** — it identifies the decision.

---

# 3. STANDING INSTRUMENTATION RULE — RECOMMENDED FOR ADOPTION

Five recorded defects, one shape: §66.7 (×2), §67.7, §68.6 — and a fifth in this phase.

| # | the instrument | what it actually measured |
|---|---|---|
| 1 | egress audit banning `anthropic` / `curl|wget` | its **own regex literal**, a file path in a digest table, and two banner comments |
| 2 | preservation check demanding `backend/scripts` clean vs HEAD | **pre-existing unrelated user work**, not this phase's changes |
| 3 | gate-threshold comparison by **string equality** | its own **label abbreviations**, not the thresholds |
| 4 | network-primitive detector | its **own regex literal** again |
| **5** | **this phase's own reserved-corpus check** | its **own regex literal** containing the corpus name — **it fired while this very document was being written** |

**None was a real finding. All five were the instrument measuring itself or its invocation
environment.**

> **The fifth occurred in this phase, minutes after the rule below was drafted, and was caught by
> it.** The reserved-corpus check matched the corpus name inside its **own regex literal**. It was
> fixed by applying mechanical test 1 (self-exclusion) **together with an explicit soundness
> proof**: the scanner re-scans itself and reports the delta, so the exclusion provably cannot hide
> a real finding. **Five occurrences across four phases is a systemic pattern, not a run of bad
> luck — which is the strongest argument for adopting the rule.** Two were caught only because a check failed loudly; a silently-passing variant of the
same bug would have produced **false assurance**, which is worse.

## `INSTRUMENT_SELF_REFERENCE_PROHIBITED` — recommended

> **A verification instrument must not derive PASS/FAIL from text, patterns, paths or invocation
> state that the instrument itself introduces, unless self-reference is explicitly the subject of the
> test.**

### Mechanical tests for the rule

1. **Self-exclusion test.** Every source-scanning check must exclude its own file, **or** prove the
   result is unchanged when it does. Mechanically: run the scan twice, once with the scanner file
   excluded; **differing verdicts ⇒ violation**.
2. **Literal-stripping test.** Source scanners must strip comments **and regex literals** before
   matching. Mechanically: a fixture file containing the banned pattern **only inside a comment and a
   regex literal** must produce **zero** findings.
3. **Invocation-invariance test.** A check's verdict must not depend on cwd or on absolute-vs-relative
   argument paths. Mechanically: run from two working directories with both path forms; **differing
   verdicts ⇒ violation.**
4. **Baseline-scope test.** Any "nothing changed" check must compare against a **recorded pre-state**,
   never against `HEAD`, wherever the tree may legitimately carry unrelated work. Mechanically: it
   must name the file recording that pre-state.
5. **Semantic-not-lexical test.** Checks over structured contracts must compare **parsed values**, not
   rendered strings. Mechanically: a fixture differing only in label text with identical semantics
   must **PASS**.

**Historical evidence is not modified. This is a recommendation for future phases**, and adopting it
would have caught all four defects before any of them fired.
