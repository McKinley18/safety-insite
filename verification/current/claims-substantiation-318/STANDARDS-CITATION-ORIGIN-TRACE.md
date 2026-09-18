# §318 — WHERE `29 CFR 1910.212(a)(1)` CAME FROM

§317 observed that on a database built by migrations alone — **no standards corpus seeded** —
HazLenz still produced `29 CFR 1910.212(a)(1)` at High (16). §318 was told not to call that success
or failure until it was traced. It is traced here, and it is **neither**.

---

## 1. WHERE THE CITATION CAME FROM

**A code-resident applicability rule.** `backend/src/hazlenz/inspection-intelligence/standard-applicability.rules.ts`
carries a rule `general-machine-guarding-osha-gi` whose `standardCitation` is the literal string
`'29 CFR 1910.212(a)(1)'`. It fires when the observation text matches an `appliesWhen` regex
(`nip point|rotating|shaft|moving part|…`) **and** a `requiredEvidence` regex
(`unguard\w*|no guard|missing guard|no barrier|expos\w*|…`) **and** no `doNotSelectWhen` regex
(`guarded|guard in place|fully enclosed|interlocked`).

The §318 observation — *"Unguarded rotating shaft … no barrier guard … nip point is reachable"* —
matches all three conditions.

## 2. PROVIDER OUTPUT OR HAZLENZ-OWNED KNOWLEDGE?

**HazLenz-owned, and provably not the provider.** The run had `EXPERT_EXECUTION_ENABLED=false` and
no `ANTHROPIC_API_KEY`, and the citation appeared on the **deterministic** path, which does not
reach a provider at all. **0 provider calls were made.**

**And provably not the database.** Every corpus table in that database was empty:

```
standards_master                0
hazard_standard_mappings        0
safescope_knowledge_documents   0
safescope_knowledge_chunks      0
regulatory_releases             0
```

## 3. THIS IS NOT A NEW DISCOVERY — THE PROJECT ESTABLISHED IT AT KG-3F

`verification/hazlenz-governed-knowledge-growth-2026-08-19/kg-3f/baseline-shadow.json` records the
same fact in the project's own words:

> `applyFindingScopedStandards()` (evidence-foundation) performs citation **SELECTION entirely in
> code with no database access**. `standards_master` is consumed by `hydrateStandardReferences()`.

and the cutover matrix states the consequence:

> **Citation selection is in code and independent of the corpus**, so filtering on backing can only
> ever REMOVE content from a citation that was already correctly selected.

So §317's unseeded-database observation is a **re-observation of a known governance property**, not
a new defect. Recording it as a discovery would overstate it.

## 4. WHAT THE CORPUS ACTUALLY GOVERNS

Not the citation. The corpus governs the **regulatory text displayed for** the citation, and its
review state. That is why the unseeded run showed:

> *"The regulatory text shown for this standard has not completed source review. This does not
> affect how HazLenz assessed applicability."*

which is emitted whenever `backingStatus !== 'APPROVED_GOVERNED_CONTENT'`. **In production this
citation IS backed**: KG-3F's matrix records `29 CFR 1910.212(a)(1)` as
`APPROVED_GOVERNED_CONTENT`, exact citation match, authoritative text available, remediation NONE.

**One consequence worth stating plainly: the unseeded environment was MORE transparent than
production.** The notice is suppressed for approved content, so in production the same citation is
presented without that caveat — correctly, because the text *has* been reviewed, but a reader
cannot tell from the screen that the **selection** was never a corpus operation in either case.

## 5. WAS CITATION *EXISTENCE* VERIFIED?

**Not at request time.** `applicable-standards/citation-structure.ts` parses a citation into
`(part, section, subsections)` — that is **structural** validation for retrieval and de-duplication,
and its own header says so. Nothing at request time checks that the cited provision exists in a
current authoritative source.

Existence is a **governance-time** property, measured by KG-3F across every declaring surface:

| KG-3F measurement | value |
|---|---|
| distinct citations declared by the rule surfaces | **160** |
| emitted by the gold set | 23 |
| emitted **and** backed by approved governed content | 22 (95.7%) |
| emitted with **no governed record at all** | 1 (`30 CFR 56.14132(a)`) |
| **declared by a rule with no governed record at all** | **132** |
| parent/child citation ambiguities | 39 |

The 132 are not a live customer exposure today — they are *declared* but not *emitted* by the gold
set. They are a measure of how much of the rule surface is unbacked, and they are the reason the
answer to "does the product verify the citation exists" is **no, not per request**.

## 6. WAS *APPLICABILITY* VERIFIED?

**No — not in the legal sense, and the product is careful about this almost everywhere.**

What happens is: regex match over the observation, a required-evidence regex, an exclusion regex,
confidence boosters and reducers, a named unresolved predicate, and — optionally — **one human
answer** to one question. In the §318 run, answering *Yes* to *"moving or accessible energy"* moved
the standard from `Candidate · Confidence: Low` to `Applies · Confidence: High`.

That is **lexical applicability with a human predicate settlement**. It is not a determination that
the provision governs this workplace, this employer, this jurisdiction or these facts.

## 7. COULD THE UI IMPLY STRONGER AUTHORITY THAN EXISTS?

**In most places, no — the hedging is genuinely good**, and §318 records that as a finding in the
product's favour. The workspace carries, persistently and per-analysis:

- *"HazLenz AI is advisory. Applicability depends on facts and jurisdiction; a qualified safety professional must verify every finding before finalization."*
- *"Candidate standards are not confirmed violations."*
- *"Applicability depends on verified facts, jurisdiction, and the current authoritative source."*
- *"Unknown facts stay unknown; they are never treated as observed."*
- per-fact provenance — `user text · observed`, `user confirmation · confirmed`, `inspection context · confirmed`, `human assertion · confirmed`
- and, after settlement, *"qualified review remains required"* **in the same sentence** as the verdict.

**Two strings are the exception, and they are the ones a lawyer would circle:**

| string | why it matters |
|---|---|
| **`Applicable standard (1)`** — the section heading | "Applicable" is the legal-applicability word. The heading asserts, as a label, the thing every surrounding sentence carefully declines to assert. |
| **`Applies`** — the post-settlement state, beside `Confidence: High` | Reached by regex plus one human yes/no. "Applies" reads as a determination; the mitigating clause is present but subordinate to it. |

Compare the product's own `/hazlenz` wording, which gets it right: *"surface **potentially
applicable** standard families and standards-informed references **for qualified safety review**."*

## 8. DISPOSITION

**No new engineering defect is registered.** The engine behaved as designed and as previously
documented, the citation is correct for the observation, and in production it is backed and
approved.

**One claims item is registered — `CM-2`** — for the two authority-implying strings above, because
§318's whole subject is the gap between what the evidence supports and what the product says, and
`Applicable standard` / `Applies` are the only places in the workflow where the product's
vocabulary is stronger than its mechanism. The remedy is wording, it is small, and it belongs with
the rest of the claims decisions rather than as a standalone repair.

**The standards architecture is not redesigned and no rule was changed.**
