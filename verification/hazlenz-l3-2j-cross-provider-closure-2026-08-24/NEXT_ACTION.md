# L3-2j item (4) — what is closed, and the exact next action

## Terminal

> ### `L3_2J_ITEM4_COMPLETE — CROSS_PROVIDER_REVALIDATION_EXECUTED_ON_THE_SHIPPED_LADDER`
> ### `D-59_STRENGTHENED — ACTIVATION_IS_NOT_PROVIDER-CONDITIONED`
> ### `D-55_REMAINS_SUPPORTED — SCOPE_BOUNDED_ADDITIVELY_BY_D-62`
> ### `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`

Blueprint **§42**. Decision log **`D-62`** (additive). `D-55` … `D-61` are preserved exactly.
§31–§41 are not rewritten. Baseline HEAD `1feda622`, unchanged. **No code changed.**

**This state does NOT mean** L3-3 starts, that a production provider has been chosen, that `D-55` is
weakened, or that the carrier should be deleted. It means the one outstanding instruction from the
L3-2j command was executed and the answer is recorded.

## Is L3-3 eligible?

**No, and this phase did not move that gate.** `L3-3 must not start until` the high-consequence gate
reaches **zero on FRESH SEALED evidence** with the clarification axis still at **100/100**. **No
sealed evidence was opened.** Family coverage remains complete at 24 of 24.

What *has* changed is that the two inputs the gate was waiting on are no longer missing:

* the **provider axis on the shipped path is now `n = 2`**, where it had been `n = 1` since §31.1;
* the **shipped clarification axis is at 100/100 on both providers** on already-open diagnostic
  material — which is the *precondition shape* the gate asks for, on the wrong corpus.

Neither of those is sealed evidence, and neither authorizes L3-3.

---

## What this phase settled, so the next one does not re-derive it

* **Activation is not provider-conditioned.** Gemini carries the clarification on a hazard candidate
  **5/5**, on the **same five scenario identities** as qwen, at **100% precision**, and used the
  proposal-level carrier **zero times**. `D-59`'s refusal holds at `n = 2`.
* **`D-55`'s decisive axis does not exist on the shipped ladder.** `CONDITIONAL_AND_ASSERTED` is
  computed from `stateFacts`; ladder rows have none. `D-55` governs architecture selection and may
  not be cited as a shipped-path statement. `D-62` records the shipped-path conclusion separately.
* **The shipped-path provider delta is TWO scenarios**, not a wholesale difference: `F-WC-09`
  (high-consequence, qwen `CONTROLLED` vs Gemini `ACTIVE`) and `C-CS-05` (qwen's 1/24 order
  sensitivity, on the MUST-NOT-ASK pole).
* **The model label has not drifted.** The `V_S_STRUCT` drift control reproduces the frozen L3-2h
  Gemini numbers on every pre-registered axis; the 2/24 row difference sits at L3-2h's own 1/24 floor.
* **A locked-scorer zero on ladder rows is a NON-MEASUREMENT.** `rederive-l32g-resolution.ts` reports
  0/5 scenario-level recall on rows that scored 5/5 — because it detects the carrier through
  `derived[].facts`, which the ladder does not emit. Do not cite it. Do not patch it either.
* **Gemini's noise floor is instrument-dependent**: 0/24 in the locked harness, 2/24 in the shipped
  runner, on the same day and model. Both non-zero differences are `NEGATIVE_CONTROL` rows emitting an
  optional `NEGATED` candidate. No clarification or high-consequence scenario moved in any floor pair.

---

## The exact next action — NOT EXECUTED

> ### A SEPARATE PROGRAMME DECISION ABOUT THE SEALED ACCEPTANCE RUN — WHICH IS THE USER'S CALL, NOT ENGINEERING'S

The evidence now **does** justify putting that decision on the table, and it did not before. Three
things that were open when §37.10 wrote the sampling-and-sealing plan are now closed: the provider
axis is `n = 2` on the shipped path, the shipped clarification axis is at ceiling on both providers,
and the carrier question is settled in both directions. What remains open is **not** engineering:

1. **Which provider the sealed run is executed against.** This is the production-provider decision in
   disguise. §31.2's privacy boundary — satisfied absolutely by the local provider at `127.0.0.1` —
   is **unadjudicated** for a hosted provider carrying customer observation text, and a sealed
   acceptance run against Gemini would send novel field-realistic scenarios to a third party.
2. **Whether a preview model may carry an acceptance result at all.** `gemini-3.1-pro-preview` has no
   content digest. An acceptance run that cannot be reproduced because its model moved under its
   label is not an acceptance run.
3. **That the corpus is spent once.** §29.8 opens the sealed holdout **once per acceptance run and
   then retires it.** Spending it on an unresolved provider question wastes the only unspent evidence
   the programme has.

**Recommendation, for the user to accept or reject:** do **not** open the sealed corpus yet. Resolve
(1) and (2) as a product/policy decision first, because both change what the sealed run means and
neither can be settled by more measurement on already-open material.

### If the answer to that decision is "not yet", the next ENGINEERING slice is narrow

**L3-2k — the two shipped-path scenarios, root-caused.** `F-WC-09` and `C-CS-05` are now the entire
measured provider delta on the shipped ladder. Both are already-open, both are one scenario, and
neither needs sealed evidence:

* `F-WC-09` — why does qwen read `controlReading: DEFEATED` correctly under structural separation
  (§38.2) and still answer `CONTROLLED` through the ladder? That is a **representation** question
  about the shipped prompt, on a scenario where the correct answer is already known.
* `C-CS-05` — qwen's single order-sensitivity scenario is on the `CLARIFICATION_MUST_NOT_ASK` pole,
  the one pole where a regression is a false question to a safety professional.

Both are diagnosis, not tuning, and any prompt change either produces **re-arms `D-61`** and owes a
full re-derivation of the locked comparison.

### Do NOT

* read `D-55` as a statement about the shipped ladder — `D-62` exists precisely because it is not;
* read the locked resolution scorer's 0/5 on ladder rows as a measurement, or patch that scorer;
* cite Gemini's shipped-ladder advantage without the `thinkingLevel: low` / 592-thought-token
  confound and the non-zero, instrument-dependent noise floor;
* re-run the restored-v6 qwen baseline — it is hash-backed and frozen;
* activate `unresolvedDecisions`, re-ship either rejected v7 revision, or delete the carrier;
* edit `L3_SYSTEM_PROMPT` without re-deriving the locked comparison (§41.5, `D-61`);
* promote `R1_MISSING_FIRST` — §39.5.3's reason now has a shipped-path confirmation;
* consume the sealed acceptance corpus, begin L3-3, or select a production provider;
* deploy, commit, push, or perform any stash operation.

---

## Deferred, unchanged

1. `R1_MISSING_FIRST` still **not promoted** — `state-facts.ts` byte-unchanged.
2. **Unifying the two clarification shape predicates**, with the hazard-deletion consequence measured.
3. `F-FLD-159`'s class — whether one non-verbatim quotation should cost a high-consequence finding.
4. `DISC-02` — still leave it.
5. **Whether the structural representation is ever selected.** L3-2j raised this; this phase sharpens
   it. The structural representation is the only one with the zero-candidate defect **and** the only
   one on which `D-55`'s decisive axis can be measured. If it is never selected, the carrier never
   activates and `TERMINAL_A` never governs a shipped decision — and that should be said out loud
   rather than left dangling.
6. **§31.2's privacy boundary for a hosted provider** — unadjudicated, and now on the critical path
   for the first time, because the sealed-run decision cannot be made without it.

## Sealed corpus

`safescope-gauntlet.source.v1.json` (`a95e5480…`), `safescope-gauntlet.seed.json` (`49aa40fd…`) and
`safescope-field-realism-pack-v2.v1.json` (`6f6897f1…`) are hash-verified unchanged before and after,
appear in **zero** artifacts of this phase, and were seen by no provider. §37.10's plan is untouched.
