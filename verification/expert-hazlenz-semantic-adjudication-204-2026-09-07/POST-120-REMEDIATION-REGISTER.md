# POST-120 DETERMINISTIC / TOOLING REMEDIATION REGISTER

**APPEND-ONLY.** Entries are added, never edited or removed. Nothing in this register is a
model/verifier semantic defect, and nothing here is repaired during adjudication. Every entry is
deferred to the post-120 deterministic/tooling remediation pass and requires separate authorization
before any repair is attempted.

---

## ENTRY 1 — `recordAdditive` PERFORMS OVERWRITE, NOT APPEND

- **Opened:** 2026-09-07, during §204D BATCH 2 recording (batch `204-D-BATCH-2`).
- **Class:** EVIDENCE-INTEGRITY DEFECT (deterministic tooling).
- **Explicitly NOT:** a model defect, a verifier defect, or a semantic-adjudication defect. No
  §204 verdict is affected by it and none is revised because of it.
- **Component:** `backend/scripts/lib/expert-202-adjudication-grouping.ts`, function
  `recordAdditive`.
- **Transport affected:** `backend/scripts/record-204-adjudication-verdicts.ts`, which passes
  caller-supplied additive text straight through.

**Observed behaviour.** `recordAdditive` assigns the supplied text directly (`unit[field] = text`).
It therefore replaces any previously recorded `reviewerNotes` / `truthSpecificationDefect` value on
that review unit. The name and the surrounding "additive" framing of the §204 recording path imply
append semantics; the implementation is overwrite semantics.

**Consequence if unmitigated.** A later batch that records additive reasoning for a review unit that
already carries additive reasoning silently destroys the earlier text. The destroyed text is
recoverable only from `VERDICT-LEDGER-204.jsonl`, which retains the per-batch `text` payloads; the
worksheet itself would retain no trace of the loss.

**Mitigation actually used (caller-side, both batches).** The caller reads the unit's current
`reviewerNotes` from the running worksheet and submits `prior + separator + new` as the additive
text, so the prior text is carried forward explicitly. Batch `204-A-SF08` and batch `204-D-BATCH-1`
used this concatenation. Batch `204-D-BATCH-2` applied the same procedure; for U10, U13 and U14 the
prior value was `null`, so no concatenation was required in fact, and no evidence loss occurred.

**Evidence-loss status to date.** NONE OBSERVED. Every additive recording so far either had a null
prior value or carried the prior value forward by caller-side concatenation.

**Standing constraint until remediated.** Any caller of the §204 additive path MUST read the
current field value first and resubmit prior text plus appended text. Do not rely on the machinery
to append.

**Deferred remediation (NOT AUTHORIZED, NOT PERFORMED).** Make the additive path genuinely additive
at the machinery level, or rename it to state its overwrite semantics and add a refusal when a
non-null prior value would be replaced without explicit acknowledgement. Requires separate
authorization; must not be performed during adjudication.
