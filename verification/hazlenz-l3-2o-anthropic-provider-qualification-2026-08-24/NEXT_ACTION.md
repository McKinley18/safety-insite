# L3-2o — what is qualified, what is not, and the exact next action

## Terminal

> ### `FINAL_ACCEPTANCE_PROVIDER_NOT_QUALIFIED — ANTHROPIC_FAILS_EXISTING_REQUIREMENTS`
> ### `P-05 / P-06 SATISFIED — DATA HANDLING IS NOT THE BLOCKER`

Blueprint **§47**. Decisions **`D-70`** (Anthropic clears `P-05`/`P-07`/`P-12`), **`D-71`** (the
`P-02` blocker) and **`D-72`** (`P-08` has no control surface), all additive. `D-55` … `D-69`
preserved. §29–§46 not rewritten. HEAD `1feda622`. **Nothing implemented. No sealed corpus opened.**

## Is a provider qualified to carry the sealed acceptance run?

**No.** Four hosted candidates have now been probed and each is disqualified on a different
requirement. Anthropic came closest and still failed.

| candidate | disqualifying requirement |
|---|---|
| `gemini-2.5-pro` | **`P-12`** — not callable at all |
| `gemini-3.7-flash` | **`P-02`** — 71% valid |
| `gemini-3.6-flash` | **`P-02`** — 83% valid |
| `gemini-3.1-pro-preview` | **`P-07`** — preview (`D-67`) |
| **`claude-sonnet-5`** | **`P-02`** — 95.8% / 91.7%, reproducing rejection; **`P-08`** — 6/24 noise, no determinism control |

---

## What L3-2o settled, so it is not re-derived

* **Anthropic's data handling is solved, and less conditionally than Google's.** `P-05` rests on the
  Commercial Terms (*"Anthropic may not train models on Customer Content from Services"*), not on a
  billing tier. `P-06` is a stated 30 days with **ZDR available on request**; the Messages API is
  explicitly ZDR-eligible and `claude-sonnet-5` is **not** a 30-day Covered Model.
  *Precondition: the organization behind the credential must be under the Commercial Terms — this
  phase could not verify that from the API, exactly as L3-2n could not verify Google billing state.*
* **`P-07` is genuinely satisfiable on a hosted provider.** *"Every Claude model ID is a pinned
  snapshot … not an evergreen pointer"*, Active, retirement not sooner than 2027-06-30, ≥60 days'
  notice. `D-67`'s blocker is **not** a permanent property of hosted inference. §45.4's separate
  ceiling still stands: it is still not a content digest.
* **`claude-sonnet-5` is callable**, and catalogue presence matched callability — the §46.2 trap did
  not recur, but it was probed rather than assumed, and must be again.
* **Anthropic produces the best reasoning result on record**: MODEL 13/13 and **VALIDATED 13/13**,
  twice, in isolated processes. The validated tier is not the problem.
* **`P-02` fails on a reproducing rejection.** 95.8% / 91.7% against ≥99%, `F-COR-01`
  `UNGROUNDED_CORRECTIVE_ACTION` in both processes. **FAIL under both readings of `P-02`.**
* **`P-08` has no control surface at all** — `temperature` deprecated (400 on non-default), no
  `seed`. 6/24 noise floor, the worst measured. `DO_NOT_REDISCOVER`.
* **Clarification precision now discriminates** — `B08` asks unnecessarily on both runs, 5/6. Every
  prior model tied at 5/5.
* **`F-WC-09`, `F-WC-03` and `C-CS-05` are all CORRECT.** `D-63`'s residual is confirmed a `qwen`
  property on a third provider.
* **The transport strips were proved benign** — zero occurrences of any code D1/D2/D3 could cause,
  across 51 rows. `minLength` and `type` unions are accepted natively, so porting costs *less* than
  `PROVIDER_SELECTION.md` predicted on 2026-08-22.
* **The validator is correct and was not weakened.** Provider non-conformance, per §22/§24 and §46.3.

---

## The exact next action — NOT EXECUTED

**Minimum blocker: no hosted provider yet reaches `P-02`'s ≥99% schema-contract validity, and the one
that comes closest additionally offers no determinism control for `P-08`.**

**None of these is a HazLenz engineering phase.** This is a decision for the user, not for
engineering to take:

1. **Re-run Anthropic at a lower `output_config.effort`.** The only *measurement* gap this phase
   leaves. Everything here was taken at the **default** effort `high` with adaptive thinking, because
   tuning a provider to pass is not legitimate — but `low`/`medium` are documented, supported by
   `claude-sonnet-5`, and untested. This is the narrowest remaining experiment: another 51-call run
   on the same already-open cohort, ~$1.40, reusing this phase's shim and runner unchanged. It could
   move `P-02` and `P-08` in either direction, and a result obtained at a non-default setting must be
   recorded as such.
2. **Accept `P-02` and `P-08` as written and stop qualifying hosted providers.** Four candidates,
   four different failures. `P-08` in particular is not a provider-selection problem: the frontier is
   removing sampling controls, so "deterministic-enough reproduction" may be unobtainable from *any*
   current hosted model. If that is true, `PROVIDER_REQUIREMENTS.md` itself needs a decision — and
   changing a requirement is the user's call, **never** something to do because a provider failed it.
3. **Run acceptance locally.** `qwen3-coder:30b` @ `06c1097efce0…` remains the only candidate
   pinnable by **content digest**, satisfies `P-05`/`P-06` absolutely at `127.0.0.1`, satisfies
   `P-08` at 65/66, and scores 11/13 validated — carrying `F-WC-09`'s deletion as `D-63`'s known,
   quantified, one-scenario cost.

### Before any hosted production use, additionally — none of it started

* confirm the organization behind `ANTHROPIC_API_KEY` is under the **Commercial Terms** (the `P-05`
  claim rests on them) and request **ZDR** for it;
* build a hosted adapter behind the existing `HazLenzReasoningProvider` interface — **none exists**
  (§45.6), and this phase's shim is a verification-only instrument that must not become one;
* decide name-level redaction, or explicitly accept narrative PII egress (§45.5);
* implement `P-11` egress telemetry and a hosted-dependency error taxonomy;
* accept §45.4's digest ceiling explicitly — a pinned snapshot label is still not a weight hash.

---

## Is further HazLenz engineering justified?

**No.** `L3-2l` closed the last open engineering question and nothing found here is an architecture
defect. `UNGROUNDED_CORRECTIVE_ACTION` is provider non-conformance against a correct contract that
two providers satisfy at 23/24. The `B08` precision miss and the 6/24 noise floor are **provider
properties measured through an unmodified pipeline**, not HazLenz defects.

> **Do not weaken `P-02`, the validator, or the binder to qualify Anthropic.** §46.3's rule is
> restated deliberately: if a future phase ever revisits the corrective-action grounding rule it must
> do so on its own root cause and its own evidence — **never to qualify a provider**.

> **Do not open the sealed corpus to qualify a provider.** §29.8 spends it once.
