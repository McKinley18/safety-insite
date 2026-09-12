# §196 — citation admission matrix

The table is `CITATION_ADMISSION_MATRIX`, exported as data from `expert-governed-citation-reuse.ts`
so the document and the suite read the same rows rather than two hand-kept copies. Case **R5**
asserts its size; the lettered cases are the authorization's own.

| id | case | outcome | why |
|---|---|---|---|
| **L** | declared reliance, valid supplied `sourceId`, token present verbatim in that source | **ADMITTED** | the identifier is reproduction of authorised supplied text, not new authority |
| **M** | declared reliance, valid `sourceId`, token absent from every authorised source | **REFUSED** | produced from memory; a valid reliance declaration does not authorise a citation the source does not contain |
| **M2** | declared reliance, token is a *different* citation from the supplied one (altered section or added paragraph) | **REFUSED** | exact comparison over the whole identifier; a paragraph reference is where regulatory meaning lives and a changed one is a new claim |
| **N** | `reliance: NONE`, any citation token anywhere | **REFUSED** | no authorised source text exists, so the authorised token set is empty and every token is refused. Unchanged from §194 |
| **K** | `sourceId` not in the supplied set | **REFUSED BEFORE REUSE IS EVALUATED** | `SOURCE_ID_NOT_IN_SUPPLIED_SET` is a non-citation code, and reuse is evaluated only when the citation refusal is the *only* thing standing against the verdict |
| **MIXED** | two tokens, one an authorised reuse and one invented | **REFUSED WHOLE** | every token must be authorised; one unauthorised token refuses the verdict, as v1 through v3.2 all refuse whole |
| **FIRST_PASS** | any citation token in a first-pass structured declaration | **REFUSED** | the v15 `HARD PROHIBITIONS` block tells the first pass that reproducing a number from its own input is the same violation as inventing one, and §196 does not weaken v15 |

## The executed cases behind each row

| row | suite case | what was actually run |
|---|---|---|
| the collision itself | **L1** | the *unmodified* v3.2 boundary refuses a citation copied from the supplied source — the §195 finding reproduced, not described |
| **L** | **L2**, **L3** | v3.3 admits the same verdict, records `admittedReuse = 29CFR1910.215(A)(4)`, and the withdrawal restores `bindingAdmitted` and `boundSourceIds` that the refusal had zeroed |
| paraphrase still works | **L4** | the paraphrasing verdict is admitted; nothing was closed to open this |
| normalisation | **L5** | `29 cfr  1910.215(a)(4)` and `29CFR1910.215(A)(4)` canonicalise equal; case and whitespace only |
| **M** | **M1** | `29 CFR 1910.147` against a source that carries only `1910.215(a)(4)` → `UNAUTHORISED_REGULATORY_CITATION` |
| **M2** | **M2** | `29 CFR 1910.215(b)(9)` against a source carrying `(a)(4)` → refused, the altered paragraph named in `unauthorisedCitations` |
| **MIXED** | **M3** | one authorised token beside one invented token → refused whole, exactly one unauthorised token reported |
| **K** | **M4** | an unsupplied `sourceId` → refused on `SOURCE_ID_NOT_IN_SUPPLIED_SET`, and `citationReuse` is `null` because reuse was never assessed |
| **N** | **N1**, **N2** | `NONE` with a citation in the rationale → refused; `NONE` carrying `sourceIds` → refused by v3.2 first |
| **FIRST_PASS** | **N3** | a citation in `notEstablishedBecause` → `PROHIBITED_REGULATORY_CITATION`, no reuse allowance |
| pattern discipline | **R1**, **R2** | every token the comparison pattern matches is also matched by the canonical detector; a fresh regex instance per call, so no `lastIndex` carry-over |
| empty authorised set | **R3**, **R4** | clean text admits nothing (clean ≠ reuse-admitted); an empty authorised set refuses every token |

## The one property that makes this safe to state

**Reuse can only ever be a withdrawal of one specific refusal, and only when that refusal is the sole
objection.** Every other admission rule in the chain — v3's binding, nomination, declaration and
proposal rules; v3.2's regulatory-basis rules; the closed-set membership of every `sourceId` — is
evaluated first and unchanged. If any of them objects, the verdict is refused and the reuse question
is never reached.
