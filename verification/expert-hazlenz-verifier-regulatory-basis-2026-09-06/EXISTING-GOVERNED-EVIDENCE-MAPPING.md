# §194 — Existing governed-evidence architecture, mapped

The authorization required investigating what already exists before designing anything, and
preferring canonical identifiers. **Two mechanisms were found, and both were reused. Nothing was
invented.**

## 1. The verifier input has always carried governed evidence keyed by `sourceId`

`scripts/lib/expert-verifier-contract.ts:53`:

```ts
/** Governed evidence as supplied to the first pass. Never re-fetched, never re-selected. */
readonly governedEvidence: ReadonlyArray<{
  readonly sourceId: string;
  readonly text: string;
}>;
```

The comment is the important half. Governed evidence reaches the verifier **as supplied to the first
pass** — it is not fetched, not selected and not expanded by the verifier. So there already exists a
closed set of identifiers, per request, that the verifier may legitimately point at. `sourceId` is
the canonical identifier and §194 adopts it unchanged.

`buildVerifierV3UserPrompt` already prints this block under `GOVERNED REGULATORY EVIDENCE SUPPLIED
WITH THIS OBSERVATION`, so the model already sees the ids. (In the §192 cohort the array was empty on
every row, which is why no reliance question arose there.)

## 2. The first pass already binds model claims to those identifiers

This is the decisive precedent, and it means §194 is applying an established pattern rather than
introducing one.

`expert-prompt.ts:1055` — the supplied ids are enumerated **into the wire schema**:

```ts
const sourceIds = input.authoritativeSources.map(s => s.sourceId);
…
sourceId: { type: 'string', enum: sourceIds },
```

`expert-normalization.ts:260` — and anything else is refused by name:

```ts
const source = input.authoritativeSources.find(s => s.sourceId === item.sourceId);
…
code: 'EVIDENCE_SOURCE_UNKNOWN', detail: `${where}: unknown source ${item.sourceId}`,
```

So the product's settled answer to *"how may a model invoke supplied evidence?"* is: **by its exact
supplied id, checked against a closed set, with anything else refused.** §194 gives the verifier the
same route.

## 3. The governed record behind those sources

`owed-facts/governed-evidence-derivation.ts` derives `acceptableEvidence` from an
`ApprovedKnowledgeRecord`, and its refusal reasons are the ones that matter here:

```
NO_GOVERNED_RECORD_LINKED · RECORD_NOT_APPROVED · CITATION_IS_A_PLACEHOLDER
NO_VERIFICATION_METHOD_IN_RECORD · NO_REQUIRED_FACT_IN_RECORD
```

`ApprovedKnowledgeRecord` carries `recordId`, `version`, `status`, and
`authority.{citation, agency, authorityTier, jurisdiction}`. Two properties of that module set the
tone for §194:

- **Nothing searches for a record.** *"a search would be an inference, and inferring which governed
  record applies to an unresolved fact is a judgement this module has no standing to make."*
- **`null` is the normal answer.** A record that is not approved, or carries a placeholder citation,
  yields no criterion rather than a weaker one.

§194 follows both: the verifier may not go looking for authority, and declaring `NONE` is the normal
answer rather than a failure.

## What was deliberately NOT reused

**`authority.citation` as a binding target.** A citation string is a *property* of a governed record,
not an identifier the verifier may quote to invoke it. Binding to `recordId` or to `sourceId` points
at evidence somebody else governed; binding to a citation string would let a model type the right
characters and thereby self-authorise. §194 binds to `sourceId` — the identifier the verifier was
actually handed — and refuses citation-shaped strings everywhere in free text, including inside the
new structured field.

**`ApprovedKnowledgeRecord.recordId` directly.** The verifier never sees records; it sees
`governedEvidence[].sourceId`. Binding to the thing actually supplied keeps the closed set
verifiable at admission from the request alone, with no registry lookup and no database access.

## The gap this closes

The first-pass path had a legitimate structured route to supplied evidence and a deterministic
refusal for anything else. **The verifier path had neither** — no route, and after §193 a prohibition
it could not enforce. §194 gives the verifier the route the first pass has had all along.
