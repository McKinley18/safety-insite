# L3 final acceptance — what must happen before this command can run

> ## `L3_FINAL_ACCEPTANCE_INVALID — NO_ACCEPTANCE_CONCLUSION`
> ## The stride was **not** exposed. **366 independent rows remain unopened.** Nothing is retired.

Two prerequisites blocked execution. **Neither is remediable inside the acceptance command**, and
neither is a model or engineering defect.

---

## A — Provide a credential `USER ACTION`

`ANTHROPIC_API_KEY` is absent, and so is every other path the SDK and CLI resolve —
`ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_PROFILE`, a `~/.config/anthropic/` profile, and the `ant` CLI.

Export a key for an organization under the Commercial Terms (`D-79`) for the duration of the run.
**Claude Code's own claude.ai OAuth session must not be substituted** — §47.7 fixed that boundary,
and using it would invalidate the acceptance evidence.

---

## B — Build and freeze the acceptance holdout `SEPARATE AUTHORIZED PHASE — NOT THIS ONE`

§37.10 and `INDEPENDENT_EVIDENCE_PLAN.md` identify the **sources** and declare the **rule**. They do
not constitute a built holdout, and the plan says so itself: *"**It is a plan.** Nothing here was
opened for evaluation, and no acceptance run was performed."*

Execute the plan's sealing procedure **exactly as written**, in this order:

1. **`HOLDOUT_FREEZE.txt` first** — the three source hashes **and the concrete stride rule**,
   recorded **before any selection code runs**.
2. **The builder** — L3-2b's pattern, with **overlap enforced by a throw at build time** against
   every prior sealed set, every development set, the exhausted field corpus, and both new sources'
   previously-used strides. Reserve the unused strides explicitly; the field corpus was exhausted
   precisely because that was not planned.
3. **The authored complement** — the ~25 negative-control / corrected-state rows the plan says must
   be authored, because they are structurally unavailable from any independent source (measured at
   **0 across all twelve candidates**). Mark them so the **by-provenance table** reports the
   independent number on its own (§36.5).
4. **Verbatim text** — only the observation reaches the model, carried unchanged. Any normalisation
   is a text edit and must be recorded as one.
5. **Hash the holdout, record the hash**, and re-verify it byte-identical after execution.
6. **The acceptance-holdout scorer**, written against the gates **already pre-registered** in
   `STATUS.md` §3 — G1…G10, fixed while no sealed row had been seen by anyone.

> **The gates are frozen and the builder is not.** A construction phase that finds a gate
> inconvenient changes the builder, never the gate. `D-72` stands: *changing a requirement is the
> user's call, never a response to a provider failing it.*

**That phase must not open the corpus for evaluation.** It reads ids, hashes and overlap — exactly
what `survey-l32g-evidence-sources.ts` did when it *"printed no observation text and ran no inference
and no scoring."* Building a holdout is not the same act as spending it.

---

## C — Then re-issue the acceptance command

With A and B done, the run proceeds exactly as authorized: freeze the configuration (already recorded
in `STATUS.md` §4 and binding), open **one** stride, construct every input through the sanctioned
builder `2865ae91…`, run **twice in isolated processes** per §38.3 and `P-08R` **A**, and score
against G1…G10 with nothing tuned between runs.

> **`claude-sonnet-5` measured 5/6 clarification precision on already-open diagnostic material, and
> G2 requires 100%. It may fail. That outcome would be the process working**, and under Phase 8 it
> would retire the stride permanently with no remediation against it.

---

## Explicitly NOT done, and not to be done by the next phase either

Tuning of any kind · prompt, schema, validator, binder or clarification changes · altering `B08` ·
selecting a production provider · building the production hosted adapter · beginning L3-3 ·
deploying · commit, push, merge, rebase, reset, restore, clean or any stash operation.

## Unchanged and still required before any CUSTOMER use

The hosted production adapter (**none exists**, §45.6 — the L3-2o shim must not become it) · §45.5's
name-level redaction decision, which `D-81` closes **only** for the acceptance run · `P-11` egress
telemetry · production credential management · ZDR as defence in depth (`D-80`).
