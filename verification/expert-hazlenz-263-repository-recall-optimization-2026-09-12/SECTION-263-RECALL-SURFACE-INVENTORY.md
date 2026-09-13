# §263 — RECALL SURFACE INVENTORY

The map §263 required before reorganizing anything. Every count is machine-derived unless marked.

## The problem, in numbers

| surface | count |
|---|---|
| verification evidence packages | 326 |
| TypeScript files under `backend/scripts/` | 1,005 |
| npm scripts in `backend/package.json` | 372 (362 before §263) |
| npm entry points that are NOT plain read-only | 149 |
| scripts that write into accepted historical evidence | **252** |
| scripts with write behaviour a static reader cannot resolve | **101** |
| provider-calling scripts | 61 |
| database-mutating scripts | 39 |
| live-environment scripts | 33 |
| evidence manifests (`*.sha256`) | 88, covering 5,533 member digests |

Before §263 the only way to know which of those 1,005 scripts was safe to run was to have been
present when it was written.

---

## A — Current Expert source

`backend/src/safescope-v2/expert-hazlenz/` — contract, projections, admission, owed facts, and the
production entry point `expert-hazlenz-analysis.ts`. 19 of the 22 candidate-identity elements are
file digests from this tree and its adapter sibling.

**Misleading entry point found.** `docs/hazlenz/governance/SOURCE_OF_TRUTH_MAP.md` (§223) names
`backend/scripts/lib/expert-210j-first-pass-contract.ts` as the canonical first-pass schema and
states that Expert "has no NestJS consumer at all". Both have been false since §246. The §229
`CONTEXT_INDEX.md` repeated the same pointer.

## B — Product integration source

`backend/src/safescope-v2/expert-hazlenz-product/` — route, execution service, authority service,
context loader, confirmation rule, response projection, transport seam, candidate provenance.
Created §261–§262. **Not mentioned anywhere in the §229 documentation set.**

## C — Historical verification scripts

The bulk of `backend/scripts/`. 252 of them write into accepted historical evidence packages.
Registry: `verification/current/MUTATING-SCRIPTS.json`.

## D — Current successor verification scripts

Before §263: `verify-262-candidate-identity.ts`, `test-261-*`, `test-262-*` — reachable only by
remembering their § numbers. After §263: `backend/scripts/hazlenz/`, reachable by name.

## E — Identity derivation

`verification/expert-hazlenz-259-carrier-coherence-2026-09-12/SECTION-259-SUCCESSOR-IDENTITY.json`
holds the 22 elements. `backend/scripts/verify-262-candidate-identity.ts` recomputes them read-only.
`PROTECTED-IDENTITIES.json` is the §229 snapshot of 29 modules; one of its digests (the Anthropic
adapter) has legitimately moved on since §259 and the current identity records the new value.

## F — Evidence packages

326 directories under `verification/`. Index:
`verification/expert-hazlenz-229-.../SECTION-229-HISTORICAL-ARCHIVE-INDEX.md`.

## G — Governance / current-state docs

`docs/hazlenz/current/` (3 documents) and `docs/hazlenz/governance/` (4). **All were §223/§229-era
and described a pre-§246 world.** §263 refreshed the three `current/` documents and added a fourth;
the `governance/` documents are left as historical and are routed around by the context index.

## H — Migrations

`backend/src/database/migrations/`. The Expert one is
`1800000019000-ExpertAnalysisAuthorityFoundation` (§261).

## I — Test commands

372 npm scripts. Before §263 there was no canonical entry point for "verify the current state" or
"run the integration suite"; both required assembling a `DATABASE_URL`, remembering
`DEV_AUTH_BYPASS=false`, and dropping the database afterwards.

## J — One-off scripts

The majority of the 1,005. Most are single-section probes, executors and adjudicators.

## K — Mutating scripts

**252 write accepted historical evidence; 101 more are unresolved and therefore sandbox-required.**
§258 ran two of them (`verify-252-admission-matrix`, `verify-252-section243-replay`) and did not
notice, because the bytes matched that time. §259 ran the same two and the numbers moved.

The §263 classifier reproduces both from source. Its first version missed one — the write path was
assembled as `join(__dirname,'..','..','verification','expert-hazlenz-252-…')`, so no single string
literal contained `verification/`. The reader now also matches bare package-name literals against
the real directory listing, and it **refuses to emit a registry** if it cannot reproduce the two
mutators §259 established by observation.

## L — Deprecated / superseded scripts

`backend/scripts/lib/` holds the pre-§246 contract ancestry. It is kept because byte-for-byte
identity reconstruction depends on the additive chain, and it is **not** a current entry point.
Routed accordingly in the context index rather than deleted.

## M — Live-environment checks

33 scripts. None is reachable from any §263 command. Storage is environmentally blocked; provider,
billing and deployment are unverified live.

## N — Accepted limitations

Were scattered across §254, §260, §261 and §262 reports. Now in one place:
`verification/current/EXPERT-HAZLENZ-STATE.json` → `acceptedLimitations`, and section 6 of
`docs/hazlenz/current/EXPERT_HAZLENZ_CURRENT_STATE.md`.

---

## Duplicated or misleading entry points, summarised

| what | why it misleads | §263 disposition |
|---|---|---|
| `SOURCE_OF_TRUTH_MAP.md` (§223) | names `scripts/lib/` as canonical; says Expert has no runtime consumer | left as history, explicitly routed around |
| `CONTEXT_INDEX.md` (§229) | same stale pointer; no product-integration section | rewritten |
| `EXPERT_HAZLENZ_CURRENT_STATE.md` (§229) | "Active blockers: None"; next phase described as final acceptance | rewritten |
| `HAZLENZ_INVARIANTS.md` invariant 30 (§229) | "Expert HazLenz has no production activation" | status clause corrected; the rule untouched |
| historical `RELEASE_BLOCKERS.md` files | read as current status | superseded by one current register |
| `verify-229-protected-identities.ts` | still correct for its own baseline, but reads as *the* verifier | superseded as an entry point, kept |
