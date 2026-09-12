# §196 — first-pass protocol v15 → vNext

## Why a successor rather than an edit

`expert-prompt.ts` is pinned whole by §187's preregistration (`firstPassIdentity.promptFileSha256`),
and `EXPERT_SYSTEM_PROMPT` is pinned separately and asserted by every integrity gate from §193
onward — including §195's own `PROTOCOL-HASHES.txt`. Every recorded first-pass behaviour is attached
to those hashes: §138's routing measurement, §147/§148's `affectedDecision` label repair, §176's
conjunctive threshold clause, §183's retained-unknown check, §104's grounding-status repair.

Editing the file in place would detach all of it. So vNext is a **prospective successor**, built
exactly the way v3 → v3.1 → v3.2 was built on the verifier side, and `expert-prompt.ts` is not
modified by §196 at all.

## Identity

| protocol | system prompt sha256 | status |
|---|---|---|
| first-pass **v15** | `20979d90c0fe0b81843d75edeb1c7d01c637f95ad76be877e6ea44d390b42979` | **UNCHANGED**; all first-pass evidence stays attached |
| first-pass **vNext** | `05e1ad22efd1353d72f04406f63ee3985892072ca566aed5ceb34c4c29881db6` | NEW — **zero hosted evidence of any kind** |

`EXPERT_FIRST_PASS_INSTRUCTION_VNEXT_VERSION = 'hazlenz.expert.first-pass-instruction.vNext'`.

The wire schema is **per-request** — `buildExpertWireSchema` binds enums to the request's own
vocabularies (`allowedHazardFamilies`, `authoritativeSources`), and vNext additionally binds
`governedEvidenceSourceIds`. A single schema hash therefore identifies a schema *for a given input*,
not the protocol. The integrity gate records both hashes against one named fixture input so the
comparison is like-for-like; `SOURCE-INTEGRITY.txt` carries the recomputed values.

## Built by construction, and reversible

The prompt is v15's own line array with **one block** inserted immediately before its closing line,
at a uniqueness-checked anchor. The schema is a structural clone of v15's with **one collection
added** and **one optional property added** to the clarification item. The module refuses to load
against a drifted base: a v15 that already carries either addition, or whose anchor line appears any
number of times other than once, aborts rather than silently producing something that is no longer
"v15 plus two edits".

Reversal is asserted, not asserted-about:

- `reconstructV15SystemPrompt()` → sha256 equals `EXPERT_SYSTEM_PROMPT` — case **P1**, and again in
  the integrity gate against the file on disk.
- `reconstructV15WireSchema(input, governed)` → `stableStringify` equals
  `buildExpertWireSchema(input)` — case **P2**, and again in the integrity gate.

## The complete diff — three edits, no others

### 1. SCHEMA · `unresolvedFactDeclarations` collection, added to `properties` and to `required`

A fifth sibling array. Empty by default. Each item requires twelve fields:

```
declarationId · missingFact · observationSourceId · observationSpan · notEstablishedBecause
affectedDecision · branchA · decisionIfA · branchB · decisionIfB · whyNecessaryNow
governedEvidenceSourceIds
```

Enum bindings, in the manner v15 already uses:

- `observationSourceId` — enum of this request's `authoritativeSources[].sourceId`
- `affectedDecision` — `EXPERT_AFFECTED_DECISIONS`, with v15's own confusable-pair sentences
- `governedEvidenceSourceIds` — enum of the governed ids supplied with this request; when **none**
  were supplied the property carries `maxItems: 0`, so the transport itself makes naming a governed
  source impossible (case **K3**). The projection refuses an unknown id again at the boundary (case
  **K1**). Two refusals is correct, for the reason `buildExpertWireSchema` already gives.

Every string carries `minLength: 1`, for the reason §104 established: a field the boundary will
refuse as empty should be refused by the transport first, or the round trip is wasted and the issue
code is confusing.

### 2. SCHEMA · optional `answersUnresolvedFactDeclarationId` on the clarification item

A back-reference from a question to a declaration. **Not** added to `required`, so every existing
construction site keeps compiling and keeps meaning what it meant: no declared link. The direction
is deliberate — a clarification may point at a declaration, and no declaration depends on a
clarification, so `D-56` carrier coupling is not reintroduced in a new place.

### 3. INSTRUCTION · the `STATING AN UNRESOLVED FACT IN FULL` block

Inserted immediately before v15's closing line, so it is read after the clarification rules it
deliberately reuses. Its substance:

- **The standard is unchanged and the block says so.** "This adds NO new reason to raise anything.
  The test is the one you have already applied." Every added instruction in this programme has the
  same measured failure mode — a coverage habit — and the block is written against it. "If you would
  not have asked about it, do not declare it."
- **What is new is the shape.** A question records that something is missing; a declaration records
  what, where the text shows it, which decision it blocks, what the two answers are, and what would
  be done differently under each.
- **The span rules are v15's own quote rules, verbatim in substance**: copied word for word, matched
  by exact string search, one contiguous run, no joined fragments, no ellipsis, no corrected grammar.
  "If you are about to write a phrase you composed rather than copied, you have no span and the
  declaration must not be made."
- **The negative-reading rule is v15's own**: read a negative for exactly the predicate it uses; a
  worst-case branch may explain why a gap matters but never settles it.
- **The two decisions must differ, and the remedy for failing that is deletion, not invention**:
  "If you write the same action twice, the fact does not change what is done and does not belong
  here at all — delete the entry rather than inventing a difference to satisfy the rule."
- **Branches are states of the world, not opinions.** "the interlock is fitted and functioning"
  against "the interlock is absent or defeated", never "it is fine" against "it is not fine".
- **The hard prohibition on citations is restated as reaching every field of the new list**,
  including reproducing a number that appeared in the model's own input.
- **Writing a declaration settles nothing.** "Declaring a fact records that it is open. It does not
  resolve it, does not cover it, and does not decide what happens next."

## What was NOT changed

- No v15 line was edited, reordered or removed. `outcome` stays last in the schema, which §104
  established is load-bearing.
- No existing collection's semantics changed. `decisionCriticalClarifications` keeps every rule it
  had; the one added property is optional.
- The `HARD PROHIBITIONS` block is untouched, including its clause that reproducing a citation from
  the model's own input is the same violation as inventing one. **vNext does not weaken it**, and the
  projection enforces it on the new collection (case **N3**). The supplied-source reuse allowance
  §196 introduces lives on the *verifier* path only — see `GOVERNED-EVIDENCE-CITATION-REUSE.md`.
- `expert-normalization.ts` is unchanged. vNext's collection is admitted by the §196 projection,
  which is a separate boundary; nothing existing was relaxed to make room for it.

## Status

**vNext HOSTED VALIDATED = FALSE.** It has never been sent to a provider. It carries no measured
first-pass behaviour, and no §195 or earlier first-pass result transfers to it — see
`§195-ARTIFACT-DISPOSITION.md`.
