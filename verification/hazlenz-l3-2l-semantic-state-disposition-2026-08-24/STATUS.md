# L3-2l — SEMANTIC-STATE REJECTION DISPOSITION: DELETE vs DETERMINISTIC DEMOTION

> ## `L3_2L_COMPLETE — SEMANTIC_STATE_REJECTION_DELETION_RETAINED`
> ## `CLASS A — DELETE REMAINS CORRECT`
> ## `SEALED_ACCEPTANCE_CORPUS_UNTOUCHED — CURRENT_LEVEL1_ENGINE_REMAINS_CUSTOMER_AUTHORITATIVE`
> ## `PRODUCTION_PROVIDER_SELECTION_REMAINS_OPEN`

Baseline HEAD `1feda622`, unchanged. **ARCHITECTURE DECISION ONLY — nothing was implemented.**
Zero production files, zero shipped-prompt bytes, zero shipped-schema bytes, zero scorers and zero
historical harnesses modified. No inference of any kind was run. Nothing committed, pushed or
deployed; no stash operation; no sealed corpus opened; no provider selected; L3-3 not begun.

§43.8 named the slice: *should a state the binder cannot support be **demoted** rather than
**deleted**?* This is that, and it stops there.

---

## 1 — The question is answered by a structural property of the check, not by `F-WC-09`

> ### `checkStateSupported` CAN ONLY EVER REFUSE A NON-ACTIVE STATE

Its `required` map covers exactly five states — `CORRECTED`, `REMOVED_FROM_SERVICE`, `NEGATED`,
`HYPOTHETICAL`, `CONTROLLED`. **`ACTIVE`, `INSUFFICIENT_EVIDENCE` and `UNKNOWN` are not in it.**
Measured across **1,871 records carrying binder output in 34 already-open artifacts**: this code has
fired **84 times** and the proposed state was `ACTIVE` on **zero** of them.

Two consequences follow immediately, and they decide the phase:

* **The check cannot prevent a false `ACTIVE`.** It is never consulted on an `ACTIVE` claim.
* **Deletion and demotion are both non-asserting.** The candidate it deletes was already at a
  non-`ACTIVE` state; demoting it to `INSUFFICIENT_EVIDENCE` moves it from one non-asserting state to
  another. On every hard safety gate in §29.8 — hazard detection, false `ACTIVE`, the
  high-consequence axis, all of which are computed from `asserts = some candidate at ACTIVE` —
  **delete-versus-demote is a null move.**

> **Demotion cannot recover `F-WC-09`.** The high-consequence gate increments a miss whenever no
> candidate asserts `ACTIVE`. A demoted `F-WC-09` candidate sits at `INSUFFICIENT_EVIDENCE`, does not
> assert, and the miss still counts. The disposition this phase was asked to evaluate does not fix
> the case that motivated it.

---

## 2 — The complete inventory `NEW_EVIDENCE` `DO_NOT_REDISCOVER`

Every `SEMANTIC_STATE_UNSUPPORTED_BY_EVIDENCE` rejection recorded anywhere in the open L3 corpus.
Built read-only by `inventory/build-inventory.js`; the rows are in
`inventory/semantic-state-rejection-inventory.json`.

| | |
|---|---|
| artifacts scanned | 34 |
| records carrying binder output | 1,871 |
| rejection occurrences | 84 |
| distinct scenarios | 46 |
| distinct (scenario, proposed-state) pairs | **52** |

| refused state | occurrences |
|---|---|
| `CORRECTED` | 38 |
| `CONTROLLED` | 35 |
| `REMOVED_FROM_SERVICE` | 6 |
| `NEGATED` | 1 |
| candidate key absent from the pre-semantic list | 4 |
| **`ACTIVE`** | **0** |

**83 of 84 carried this code alone**; one co-occurred with `SEMANTIC_EVIDENCE_UNRELATED_TO_FAMILY`.

### Ground truth of the 52 pairs

| class | pairs |
|---|---|
| **`NEGATIVE_CONTROL`** — `expect.hazardEstablished === false` | **39** |
| **`REAL_HAZARD`** — `expect.hazardEstablished === true` | **8** |
| no ground truth (ablation rows) | 5 |

### The eight real-hazard rows — the entire measured cost of deletion

| scenario | proposed | truth | HC | `control-adequacy` recorded on the same candidate |
|---|---|---|---|---|
| `C-FLD-048` | `NEGATED` | `ACTIVE` | no | *(none)* |
| `E-FLD-147` | `CONTROLLED` | `ACTIVE` | **yes** | *(none)* |
| `X-WC-02` (+3 repeats) | `CONTROLLED` | `ACTIVE` | **yes** | `CONTROL_MENTION: notice` |
| `F-WC-03` | `CONTROLLED` | `ACTIVE` | **yes** | `CONTROL_ABSENT: missing` |
| `F-WC-09` | `CONTROLLED` | `ACTIVE` | **yes** | `CONTROL_ABSENT: strapped down` |

**`F-WC-09` is not unique and it is not the worst case.** It is one of four distinct
high-consequence identities this code has deleted. §43.2's account of it reproduces exactly, at the
shipped path, in `results/qwen/D_WC09_LADDER.json`.

### The thirty-nine negative-control rows — what deletion is holding back

The model proposed a decided non-active state on a scenario whose ground truth is *no hazard
established*, and the binder refused the state because its **admission vocabulary does not contain
the phrasing**. Four verbatim examples:

| scenario | text | proposed |
|---|---|---|
| `D02` | "The line was shut down, the main disconnect was **locked out with each worker's personal lock**, and voltage was verified absent at the load side before work began." | `CONTROLLED` |
| `B14` | "The contractor **applied their own lock and tag** to the disconnect and our supervisor verified zero energy at the motor terminals with a meter…" | `CONTROLLED` |
| `H-OF7` | "Before they opened it up, the crew **put their locks on** and checked it was dead." | `CONTROLLED` |
| `DEV-28` | "Maintenance **destroyed the ladder and issued a replacement** before second break." | `CORRECTED` |

> **On these rows the model's state choice is right and the binder's refusal is wrong on its own
> terms** — a textbook lockout is a control in place. Deletion nevertheless yields the *expected
> customer outcome*, because a controlled hazard and a deleted hazard are both non-asserting. This is
> a `D-54` agreement: **the right outcome reached by a reason that has nothing to do with the
> scenario's semantics.** It is recorded here because it is exactly what a preservation rule would
> convert from harmless into harmful.

---

## 3 — Authority analysis, disposition by disposition

`L3-INV-08` — model output is a proposal; the binder **may refuse, must not invent model reasoning**.
`L3-INV-04` — no default `ACTIVE`. `L3-INV-12` — deterministic signals are advisory and **may not
re-acquire authority**. §35.1 — a vocabulary used to **REJECT** must be unambiguous; one used to
**ADMIT** may be permissive.

### The line this phase draws `STABLE_INVARIANT`

> #### `A REFUSAL MAY DEMOTE TO AN UNDECIDED STATE ONLY WHERE THE REFUSAL ITSELF ESTABLISHED THAT THE DECISION IS OPEN`

That is the general rule, and it is read off the one demotion the architecture already authorizes.

**§33.4's impression gate qualifies.** `checkSubjectiveImpression` establishes positively that
*"every predication in the cited evidence is a perception, a first-person judgement or governed by a
hedge, and **none asserts a condition of the thing observed**"* — nothing was asserted — and raises
`SEMANTIC_CLARIFICATION_EXPECTED_NOT_SUPPLIED` in the same breath. Demoting to
`INSUFFICIENT_EVIDENCE` therefore asserts **nothing the check did not already prove**. It is
refusal, and the clarification it carries is owed by the check's own finding.

**`checkStateSupported` does not qualify.** It establishes only that *the marker vocabulary for the
claimed state does not appear, asserted, in the cited span or its coordinated clause*. It says
nothing about whether anything was asserted, and it raises no clarification expectation. On `D02` the
evidence asserts a complete, verified lockout — a **decided** state — and the check simply cannot
read it. Demoting there would assert "the decision was not made", a proposition the check has **not**
established and which is **false on 39 of the 52 measured rows**.

> **That is deterministic semantic inference, not deterministic validation.** It converts the
> binder's own illegibility into a claim about the world, and it is a conclusion the provider never
> proposed — `L3-INV-08`.

### Verdicts

| | disposition | authority verdict |
|---|---|---|
| **A** | **DELETE** | **PERMITTED.** Pure refusal. Asserts nothing; invents nothing. |
| **B** | DEMOTE TO UNDECIDED | **NOT PERMITTED** under `checkStateSupported`. Asserts an undecided decision the check did not establish — `L3-INV-08`. |
| **C** | RE-DERIVE A DIFFERENT DECIDED STATE (`CONTROLLED`→`ACTIVE`) | **FORBIDDEN, twice.** It invents a decided semantic conclusion the provider never proposed (`L3-INV-08`) and manufactures `ACTIVE` from a state the binder merely failed to read (`L3-INV-04`). The only signal that would drive it — `control-adequacy.ts` — is recording-only by §36.4, §43.2 and `L3-INV-12`. |
| **D** | PRESERVE CANDIDATE + REJECT STATE | **COLLAPSES INTO B.** `L3_UNDECIDED_STATES` is `['INSUFFICIENT_EVIDENCE','UNKNOWN']`; the contract's only representation of "state unresolved" **is** an undecided state, and per §34.2 the other six *are* the decision. There is no third thing to move the candidate to without inventing one. |

### The discriminator that looks attractive and is forbidden

`controlAdequacy` does separate the poles where it speaks: `CONTROL_ABSENT`/`CONTROL_MENTION` on 6
real-hazard rows against 1 negative control; `CONTROL_EFFECTIVE`/`_WITH_WARNING` on 7 negative
controls against 0 real. A rule conditioned on it would recover 6 and falsely preserve 1.

**It is refused, for three independent reasons.** It is silent on **33 of the 52 rows**, so it cannot
carry a general rule. Using it to decide would give a deliberately advisory module decision authority
— the precise thing `L3-INV-12`, §35.2, §36.4 and §43.4 each fix in place. And per §1 above it would
still recover **zero** high-consequence misses, because the recovered candidates would not be
`ACTIVE`.

> **A safety intuition that "`ACTIVE` is safer" is not an authority argument.** On this inventory it
> is also simply false: promoting to `ACTIVE` would fire on 39 negative controls.

---

## 4 — The measured counterfactual `inventory/DISPOSITION_ANALYSIS.json`

Computed over all 52 pairs using the **shipped** scorer semantics read from
`score-l32f-reasoning.ts` (`asserts := some surviving candidate at ACTIVE`).

| | **A DELETE** `SHIPPED` | **B DEMOTE** | **C RE-DERIVE ACTIVE** | **D PRESERVE+REJECT** |
|---|---|---|---|---|
| hazards recovered | 0 | **0** | 8 | **0** |
| high-consequence recovered | 0 | **0** | 7 | **0** |
| high-consequence still missed | 7 | **7** | 0 | **7** |
| **false `ACTIVE` introduced** | 0 | 0 | **39** | 0 |
| negative-control candidates preserved | 0 | **39** | 39 | **39** |
| **unnecessary clarifications introduced** | 0 | **31** | 0 | **31** |
| candidates still deleted | 52 | 0 | 0 | 0 |

**B and D are strictly dominated by A.** They move the high-consequence axis by **zero**, and pay for
it with 39 preserved negative-control candidates and up to **31 unnecessary clarifications** — against
an axis the programme has held at **100% precision** since L3-2d and which §36.7 measured as the
binding trade against high-consequence recall. **C** closes the high-consequence axis and destroys the
false-`ACTIVE` gate on the same rows.

> **The trade is not "one deleted hazard against some precision noise".** It is *no gate movement at
> all* against a measured 31-scenario precision loss.

---

## 5 — What deletion costs, stated plainly and not minimised

Deletion is **retained**, not exonerated as harmless. On the four high-consequence identities above,
the customer receives **no hazard record at all** rather than a candidate with its evidence and an
open question — §43.2's finding, and a real loss that no metric on the shipped scorer captures,
because both outcomes are non-asserting.

**That loss is not repairable at the binder.** It originates where `D-63` placed it — the provider's
single-enum `conditionState` choice — and the binder cannot correct a wrong decided state without
making a decided claim of its own. Preserving the candidate at an undecided state does not deliver
the hazard; it delivers a question, on the 4 rows that deserve one and on 31 that do not.

---

## 6 — Regression, authority, preservation

**L3 offline: 814 assertions over 10 suites, 0 failed** — identical, suite for suite, to §43.7.
`test:hazlenz-core` **28 of 30 suites**, the two documented §13.1 failures only
(*Golden Hardening Scenarios* case 7, *HazLenz Production Path* "FAIL tagged but not locked"),
**not reclassified**. KG contracts unchanged: `kg4a-cutover-contract` 146/146, `kg4a-default-off`
51/51, `kg4b-shadow` 123/123, `kg3f-predicate` 16/16, `kg3f-determinism` 170/170,
`evidence-foundation` 35. Backend and frontend `tsc --noEmit` both exit 0.

**Customer authority is unchanged by construction: no production file was modified.** All 19
`reasoning-l3` modules are byte-identical to the digests L3-2k recorded, the shipped prompt is
`b8cc50fc` at `v6`, the run schema is `a522cf5a`, HEAD is `1feda622` at 0/0 with 23 tag objects and
4 untouched stash entries, and the sealed corpus is hash-verified and **not opened**. The worktree
gains exactly one entry: this evidence directory. Full record in `PRESERVATION_AND_EGRESS.txt`.

**Egress: none.** Zero local inference calls, zero hosted calls, zero metadata or auth calls, zero
scenario identifiers transmitted, no credential read.

---

## 7 — Exact next phase — NOT EXECUTED

**Unchanged from §43.8, and now with one engineering question closed rather than open.** The binder's
deletion behaviour is settled and needs no further phase. What blocks the sealed run is still the
**unadjudicated §31.2 / §10 privacy boundary**, the preview model's mutability (`MUST_REVERIFY`), and
§29.8's rule that the corpus is spent once.

**Recommended order, for the user to accept or reject:** adjudicate §31.2 first. If hosted egress is
refused, the sealed run executes against `qwen3-coder:30b` and `F-WC-09`'s deletion becomes a known,
quantified, one-scenario cost carried into acceptance — now with this phase's evidence that it is
**not** repairable downstream. If hosted egress is permitted, close the preview-label problem before
spending the corpus. **Do not open the corpus to settle a provider question.**

**No further diagnostic phase on already-open material is justified.** This phase exhausted the
delete-versus-demote question on the whole open corpus and reached a structural answer.
