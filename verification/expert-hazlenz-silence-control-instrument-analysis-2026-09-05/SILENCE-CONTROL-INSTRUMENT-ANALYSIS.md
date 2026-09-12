# Silence-control instrument analysis — the confounds, before the truth

**§172, 2026-09-05. 0 provider calls, $0.00, 0 database operations, 0 source-code changes.**

---

## 1. Terminal

```
EXPERT_HAZLENZ_SILENCE_CONTROL_INSTRUMENT_INVALID —
REAUTHORING_REQUIRED
```

The five reauthored controls are **materially confounded against the frozen REQUIRED rows on two
independent axes**. That is an *instrument* finding, reached without adjudicating any row's truth,
and it is decisive on its own: a confounded instrument cannot produce an interpretable precision
measurement even if every row were adjudicated valid.

---

## 2. Why no row carries a verdict

The authorization asks for `CLARIFICATION_REQUIRED` and `SILENCE_CONTROL_VALID` per row. It also
says **"Do NOT ask a model to adjudicate truth"**, and report item 29 requires confirming that **no
model adjudicated truth**. Those cannot both be satisfied by me filling the verdicts.

The five rows were **drafted by me**. Scoring them valid would be a model adjudicating its own
output — the closed loop this programme has refused since §162, where five of seven rows of
model-authored evaluation truth did not survive human review. The variable at stake is named
`HUMAN_AUTHORITATIVE_SILENCE_ROWS`; a model-supplied value would make the name false.

So `ROW-LEVEL-ADJUDICATION-INSTRUMENT.json` is complete except for the three verdict fields, which
are `null`. Everything mechanical is filled: target decision, the facts each draft asserts as
settled **with the verbatim span asserting each**, and the specific questions a reviewer must decide.

**And there is a second reason not to adjudicate now, which is the useful one:** the wording will
have to change to fix the confounds, and the standing rule is that the *final exact wording* is what
gets adjudicated. Reviewing this text today would be spent effort.

---

## 3. The seven confound checks, measured

| # | check | verdict |
|---|---|---|
| 17 | `LENGTH_CONFOUND` | **RESOLVED** |
| 18 | `FORMAT_CONFOUND` | MINOR_RESIDUAL |
| 19 | `VOCABULARY_CONFOUND` | **MATERIAL** |
| 20 | `EXPLICIT_SAFE_LABEL_CONFOUND` | CLEAN |
| 21 | `QUESTION_WORDING_CONFOUND` | CLEAN |
| 22 | `DECISION_CATEGORY_CONFOUND` | **MATERIAL** |
| 23 | `SETTLED_FACT_DENSITY_CONFOUND` | NOT SYMMETRICALLY ASSESSABLE |

### 17 — Length: resolved

Controls **382–409** characters; REQUIRED **402** and **412**. HS-A1 sits inside the control band and
HS-E1 is three characters above it. The §168 gross separation (559–592 against 402/412) is gone.
**This is what the reauthoring was for, and it worked.**

### 19 — Vocabulary: MATERIAL

Twelve verification words appear **only** in controls:

```
checked · deployed · initialled · locked · padlocked · records
sheet · shut · survey · surveyed · tag · tested
```

The REQUIRED rows contain one word from the list — `closed`, and there it describes a closed guard
door, not a verification.

A one-token rule — *"if the text says tested, checked, surveyed or initialled, stay silent"* —
separates the classes perfectly **without applying any clarification semantics at all.** That is
exactly the shortcut this check exists to find.

### 22 — Decision category: MATERIAL

| class | hazard domains |
|---|---|
| REQUIRED | fire/explosion + machine guarding (HS-A1); machine guarding (HS-E1) |
| controls | electrical · respiratory · fall protection · noise · powered industrial truck |

**No control shares a hazard domain with either REQUIRED row.** Class is perfectly predictable from
hazard family. Any prior of the form *"guarding and fire questions are usually warranted; noise and
forklift questions usually are not"* would score well on this set while applying no clarification
semantics whatever.

### 18 — Format: minor residual

Both REQUIRED rows have exactly **1 comma and 0 digits**. Controls run 1–5 commas and 0–2 digits, so
SC-1 (4), SC-4 (4) and SC-5 (5) are separable from both REQUIRED rows on comma count alone. Not
decisive, but worth removing in the same pass.

### 23 — Settled-fact density: not symmetrically assessable

The declared counts are 5–6 for controls and **0 for REQUIRED** — but that is an artifact of the
drafts carrying a declared settled-fact list while the frozen rows carry none. Comparing them would
measure the instrument, not the text.

The neutral proxy — clauses asserting a verified state — is **2–3 for controls against 1–2 for
REQUIRED**. Suggestive, not separating. Reported as unresolved rather than waved through, because
the honest answer is that this axis cannot be checked symmetrically until the REQUIRED side is
described the same way.

### 20, 21 — Clean

Zero hits across 16 banned safe-label cues. Zero question marks and zero interrogative constructions
on both sides.

---

## 4. The structural problem underneath, which is the same one as last time

**A silence control settles facts. Settling a fact usually requires saying it was verified. A
REQUIRED row leaves a fact open, so it has no reason to say so.** The verification vocabulary
therefore attaches to the row *class*, not to the individual row — exactly as length did in §168.

That is the second time the same shape of defect has appeared, and it is worth stating as a general
property rather than fixing twice:

> **Authoring a valid silence control tends to make it recognisable as one.** The properties that
> make a row a control — everything settled, verification stated, no open branch — are surface
> features a model can learn without learning the semantics. Any control corpus must be checked for
> class-separable surface features *as a set*, and the check must include vocabulary and hazard
> domain, not only length.

---

## 5. What a repairing pass has to do

1. **Write controls in the SAME hazard families as the REQUIRED rows** — machine guarding and
   fire/explosion. Domain must not predict class.
2. **Balance the verification vocabulary.** The controls cannot simply drop it — they need it to
   settle facts. So the balance has to come from the REQUIRED side: **new REQUIRED rows that contain
   verification vocabulary and still leave one decision-critical fact open.** For example, a row
   stating a guard was function-tested last month *and* that the interlock switch was replaced this
   morning and not retested — verification words present, fact still open.
3. **Even out commas and digits.**
4. Then author the final exact wording and adjudicate **that**.

**Item 2 is the expensive one and it is not optional.** New REQUIRED rows are new authored
evaluation truth and need their own independent human review — the same standard as the controls.
The two frozen REQUIRED rows cannot be edited to help, and padding them is explicitly forbidden.

---

## 6. Answers to the required determinations

| item | answer |
|---|---|
| VALID_SILENCE_ROWS | **not computable** — no row adjudicated |
| INVALID_SILENCE_ROWS | not computable |
| AMBIGUOUS_SILENCE_ROWS | not computable |
| controls admitted as human-authoritative | **none** |
| controls rejected | none *(rejection is also a truth verdict)* |
| controls requiring rewrite | **all five**, on instrument grounds, independent of their truth |
| `HUMAN_AUTHORITATIVE_SILENCE_ROWS` can move above zero? | **No** |
| new value | **0**, unchanged |
| silence-side precision validation scientifically interpretable? | **No** |
| remaining corpus defect blocking hosted validation? | **Yes — two material confounds** |

Two independent reasons the count stays at zero: no human verdict has been returned, **and** the
instrument would not yield an interpretable set even if one had been.

The §168 counterfactual re-check and the per-row evidence-sufficiency and temporal-scope assessments
are prepared as *questions* in `ROW-LEVEL-ADJUDICATION-INSTRUMENT.json`, not as answers. The
sufficiency lesson bears on four of five rows: **SC-2's airflow indicator, SC-3's scaffold tag,
SC-5's pre-use check sheet, and arguably SC-1's attending supervisor** each rest a settled fact on an
indicator, a tag, a document or a presence. Whether those settle their facts is precisely the human
question, and §169 established that this class of evidence often does not.

---

## 7. Historical integrity

§167 evidence, §168 controls, and §169 dispositions are **unchanged** — this operation read them and
wrote nothing to them. `TOPIC_REACH = 12/12`, `HUMAN_CONFIRMED_FULL_RESOLUTION_SUFFICIENCY = 8/12`,
and the four binding disposition counts stand exactly as recorded. No source code was changed; no
provider was called; no database was touched.

---

## 8. Recommended next authorization

**Reauthor the control set against the two material confounds, and commission the balancing REQUIRED
rows at the same time.** Then adjudicate the final exact wording of both sides in one pass.

Do not spend the human review on the current five rows. Their wording will change, and under the
standing rule the adjudication would have to be repeated on the new text.

The remaining semantic blockers are unchanged: silence truth, and human sampling of resolution
sufficiency. Customer activation remains unauthorized, and
`EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED` remains `false`.
