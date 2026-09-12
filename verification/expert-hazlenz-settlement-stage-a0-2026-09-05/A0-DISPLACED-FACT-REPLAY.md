# §181 — DISPLACED-VALID-FACT REPLAY (HR-05 AND HR-07 SHAPES)

Zero provider calls. Driven through the real `checkBindingDeclarations`, `nominateAdditiveFact` and
`evaluateTargetCoverage`.

---

## The property under test

> **`ADJACENT VALID FACT != SUBSTITUTE OWED FACT`**

The authorization asks four questions about an owed fact A that is settled, and an adjacent plausible
fact B. Each was answered by driving the current modules, not by reading them.

| # | question | answer | how it was established |
|---|---|---|---|
| 1 | Can B **replace** A? | **NO** | `factsRemoved` is empty after nomination; the ledger holds both; A stays `SETTLED_BY_EVIDENCE` (4.2). `nominateAdditiveFact` takes no key to remove — substitution is *unrepresentable*, not merely forbidden. |
| 2 | Can B **inherit** A's clarification entitlement? | **NO** | B enters `UNRESOLVED` with `source: VERIFIER_NOMINATION` and its own status (4.3). Entitlement is per fact. |
| 3 | Can B become a **newly nominated** fact? | **YES** | `checkBindingDeclarations` admits it, `nominationCount = 1` (4.1). Legitimate new hazards are **not** suppressed. |
| 4 | Can B carry a question **only if separately admitted**? | **YES** | A nomination whose evidence span is not verbatim is refused with `NOMINATION_EVIDENCE_SPAN_NOT_VERBATIM` (4.5); a declaration that both binds and nominates is refused with `BINDING_MODE_CARRIES_A_NOMINATION` (4.4). |

## The two §179 shapes, replayed with their actual content

**HR-05 — the drying fans.** The owed auger-isolation fact was settled by evidence, then the adjacent
fact the model actually raised at §179 — *"Are the drying fans interconnected with the auger?"* — was
offered as a nomination.

Result: admitted as its own fact, sitting beside the settled one. It could not replace it, could not
inherit from it, and had to carry its own verbatim span and diverging branches to be admitted at all.

**HR-07 — the dust question.** The owed flame-failure fact was settled, then the §179 question —
*"How extensive is the dust accumulation?"* — was offered as a **binding** to that settled fact.

Result: **refused**, `BOUND_FACT_NOT_UNRESOLVED` (4.6). A question cannot attach itself to a fact that
is no longer owed.

## What this means, stated carefully

The structural control §180 said "already exists" **does exist and does work**. On the shapes that
failed at §179, the current modules refuse substitution, refuse inheritance, refuse a
non-verbatim nomination, and refuse a binding to a settled fact — while still admitting a genuinely
new hazard on its own proof burden.

**And none of that was running when HR-05 and HR-07 failed.** Those rows went through the first-pass
path, where a clarification binds to nothing and the concept of "the owed fact" does not exist.

So the honest conclusion is narrow and worth stating precisely:

> The architecture can express the distinction the §179 failures violated. That is a fact about
> **representation and structural admission**. It is **not** evidence that a model, given this
> structure, would stop producing displaced questions — a model may still nominate an adjacent fact
> on every row, and the architecture would faithfully admit each one as its own fact.

What the structure buys is that a displaced question can no longer *masquerade* as an answer to the
owed fact, and that the owed fact cannot disappear behind it. The question of whether the model asks
fewer unnecessary questions is a behavioural question, unmeasured here, and answerable only by a
hosted run that this authorization does not permit.

## One asymmetry worth recording for the next stage

Nomination is cheap by design — one nomination per response, a verbatim span, two branches, two
diverging decisions. Nothing in the structure limits how *often* a model nominates.

If a future hosted stage shows adjacent nominations arriving on most rows, the pressure will be to add
an importance test to nomination. **That would be the wrong repair**, and §180's risk register already
names it (R8): a missed new hazard is worse than an unnecessary question. The right surface for
volume is the question budget, which already defers rather than drops — not the admission burden.
