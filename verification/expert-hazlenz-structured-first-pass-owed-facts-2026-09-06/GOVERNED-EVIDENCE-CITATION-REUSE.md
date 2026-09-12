# §196 — the governed-evidence citation boundary, resolved

## The collision, reproduced before it was repaired

§195 found this deterministically, with zero provider calls, while designing governed-evidence
fixtures. §196's suite reproduces it as **case L1** against the *unmodified* v3.2 boundary, so the
repair is measured against a demonstrated failure rather than a described one:

```
reliance    SUPPLIED_GOVERNED_EVIDENCE
sourceIds   ['GOV-WORKREST-01']          valid, supplied, closed-set member
proposition '...the supplied record at 29 CFR 1910.215(a)(4) sets a maximum work rest clearance'

  v3.2 →  admitted = false     PROHIBITED_REGULATORY_CITATION
```

The same verdict with the citation paraphrased away is admitted. A verifier behaving correctly lost
its whole verdict, and the repair it had to learn was *"paraphrase the source rather than quote
it"* — in a programme where `governed-evidence-derivation.ts` deliberately **copies** governed
vocabulary rather than paraphrasing it, precisely because paraphrase is where fidelity is lost.

The §195 finding also established why this is not hypothetical: real governed records **do** carry
citations. `ApprovedKnowledgeRecord.authority.citation` is a field, and the requirement template
substitutes it into the text handed downstream. The moment governed evidence is drawn from the live
registry rather than authored for a fixture, supplied text containing citations is the normal case.

## The distinction that actually matters

```
PROVIDER-ORIGINATED CITATION AUTHORITY     a citation produced from memory              REFUSED
REPRODUCTION OF AUTHORISED SUPPLIED TEXT   a citation copied from evidence the system
                                           itself handed over, under a declared and
                                           validated reliance                           ADMISSIBLE
```

Those two are not separable by reading the string — which is exactly why §193 refused everything, and
that refusal was right at the time. They **are** separable by asking whether the string is present in
the supplied source. That is a byte question with no inference in it, and it is the only rule that
distinguishes quoting from inventing exactly. It was §195's own preferred option; §196 implements it.

## The rule

`expert-governed-citation-reuse.ts` · `decideCitationReuse(texts, authorisedSourceTexts)`

1. Extract every **citation token** from the scanned text.
2. Extract every citation token from the text of the governed records the output **validly relied
   on** — ids declared under a reliance mode and confirmed present in the supplied set.
3. Canonicalise both sides: **uppercase, remove all whitespace, and nothing else.**
4. A token is admitted only on **exact equality** against that authorised set. One unmatched token
   refuses the whole verdict.

An empty authorised set therefore refuses every token — which is exactly what must happen under
`reliance: NONE` (case **N1**), and the module performs no authorisation of its own.

### Why a wider pattern for comparison than for detection

`CITATION_SHAPED_PATTERN` (`\b\d{2}\s*CFR\s*\d+`) remains the canonical **detector** and is reused
unchanged everywhere else in the product. It cannot serve as the unit of **comparison**, because it
matches only `29 CFR 1910` — comparing prefixes would admit `1910.215(a)(4)` against a source that
says `1910.147`, a different regulation entirely.

`CITATION_TOKEN_PATTERN` extends the canonical pattern rightwards over the dotted section and its
parenthesised paragraphs, so the whole identifier is compared. It never matches text the canonical
detector would not also match — asserted by case **R1** rather than assumed. A verdict citing
`1910.215(b)(9)` where the source says `1910.215(a)(4)` has **made a different citation** and is
refused (case **M2**): a paragraph reference is where regulatory meaning lives.

### Why normalisation stops where it does

Recorded in code as `CITATION_NORMALISATION_RULES`:

- uppercase, because the canonical detector is already case-insensitive
- remove all whitespace, because `29 CFR 1910.215` and `29CFR1910.215` are the same identifier
- **nothing else**: no punctuation stripping, no digit alteration, no paragraph truncation, no
  abbreviation expansion, no nearest-match

Every rule beyond those two starts deciding that two different citations are the same, and no fuzzy
citation inference is built anywhere.

## Where the rule is applied, and where it is not

### The verifier — v3.3 admission

`checkVerifierV3_3Output` composes `checkVerifierV3Output` (§166) and `checkVerifierV3_2Output`
(§194) and **mutates neither**. Reuse is evaluated **only when `PROHIBITED_REGULATORY_CITATION` is
the sole objection standing against the verdict**. If v3.2 raised any other code — a malformed id, an
id nobody supplied, a missing proposition, a broken binding — the verdict is refused on that code and
reuse is never assessed. **An invalid reliance declaration can therefore never become the authority
for its own citation** (case **M4**).

When reuse is assessed, v3.3 **re-scans every field itself**. v3.2's own violation list is not reused
for the decision, because `checkVerifierCitationContainment` reports only the first match per field —
a field carrying one legitimate quotation and one invented citation would look clean once the
legitimate one was cleared. Case **M3** exercises exactly that shape and refuses it whole.

On admission, exactly the citation code and its own detail lines are withdrawn, and the v3 layer is
re-run to recover `bindingAdmitted`, `nominationAdmitted` and `challengedFactKeys` — v3.2 zeroes
those whenever it refuses, and a withdrawn refusal must not leave them false (case **L3**).

### The prompt is NOT changed, and the asymmetry is deliberate

There is **no v3.3 instruction and no v3.3 prompt hash**. `EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT` and
`VERIFIER_V3_2_RESPONSE_SCHEMA` are byte-unchanged, and the verifier is still told that a
citation-shaped string anywhere in its free text discards the verdict.

That leaves the instruction **stricter than the boundary**, in that direction on purpose. What §195
asked for is that *faithful reuse should not be destroyed*, not that quoting should be encouraged.
Referring to governed evidence by `sourceId` remains the one authorised route and the prompt keeps
saying so. A prompt change would invite the behaviour rather than merely stop punishing it, and would
cost a fourth protocol version and a fourth set of hashes for no gain. The paraphrase route also
stays open and admitted (case **L4**) — nothing is closed, one thing is un-closed.

### The first pass gets NO reuse allowance

v15's `HARD PROHIBITIONS` block tells the first pass that reproducing a number that appeared in its
own input is the same violation as inventing one. §196 does not weaken v15, so the projection applies
the plain canonical refusal to every free-text field of a structured declaration (case **N3**). The
reuse rule lives on the verifier path, where §195 found the collision and where the structured
`regulatoryBasis` gives it something to be authorised against.

## `regulatoryBasis` consistency

- `reliance = NONE` — new provider-originated citation-shaped authority remains prohibited. The
  authorised token set is empty, so every token is refused (**N1**). `NONE` with `sourceIds` present
  is still refused by v3.2 before reuse is even considered (**N2**).
- declared reliance — every `sourceId` must be supplied (unchanged, §194), and any citation-shaped
  text must additionally map to authorised supplied source content under the new rule.
- **no structured field self-authorises its own citation.** The reliance declaration is validated
  first, by v3.2, and only a fully valid declaration reaches the reuse rule at all.

## Quotation length and copyright, kept distinct

Recorded as `QUOTATION_BOUNDARY_STATEMENT` and asserted by case **R5**:

```
ADMITTED_UNIT                                    a citation identifier, and nothing else
QUOTATION_LENGTH_LIMIT_EXISTS_ON_THE_VERIFIER_PATH   false
SECTION_196_CREATES_A_QUOTATION_LENGTH_LIMIT         false
SECTION_196_CREATES_A_LICENCE_TO_QUOTE_AT_LENGTH     false
```

Reproducing `29 CFR 1910.215` is not reproducing the paragraph it names, and this module admits no
text other than the citation tokens it matched. A long verbatim regulatory paragraph carrying no
citation-shaped string was admissible before §196 and is admissible after it — **unchanged**. That
residual is a different question from the one §195 raised, it is not resolved here, and it is stated
rather than implied: there is no quotation-length boundary on the verifier path to preserve, and §196
neither creates one nor takes its absence as permission.

## What is still not claimed

`V3_3_ADMISSION_RULE_CLASSIFICATION`:

```
EVERY_CITATION_TOKEN_APPEARS_IN_AN_AUTHORISED_SUPPLIED_SOURCE
    SAFE_DETERMINISTIC_EXACT_STRING_EQUALITY_AFTER_CASE_AND_WHITESPACE_NORMALISATION
RELIANCE_WAS_VALIDLY_DECLARED_BEFORE_REUSE_IS_CONSIDERED   SAFE_DETERMINISTIC
THE_QUOTED_IDENTIFIER_MEANS_WHAT_THE_VERDICT_SAYS_IT_MEANS  REQUIRES_HUMAN_TRUTH
THE_SOURCE_SUPPORTS_THE_CONCLUSION_DRAWN                    REQUIRES_HUMAN_TRUTH
```

A verdict may now quote an identifier the source really contains and still be wrong about what the
source says. **Structural reuse is not semantic validation**, exactly as structural source binding
was not legal validation at §194.

**v3.3 HOSTED VALIDATED = FALSE.** It has never been exercised against a provider.
