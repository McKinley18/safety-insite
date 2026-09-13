# HazLenz architecture

HazLenz is the governed safety-intelligence engine. Its organising principle is a strict division of
labour: **the provider authors semantics; deterministic code decides what is admissible.** A
language model proposes hazards, standards and postures. It never decides whether its own proposal
is structurally valid, whether it carries authority, or whether it may reach a customer. Those are
code decisions, and they fail closed.

Two analysis families coexist on an observation and are not versions of one another: deterministic
HazLenz, and Expert HazLenz (provider-backed). Both may be present; neither supersedes the other.

## Layers

The boundaries below are deliberate. They are not merged to reduce file count.

| layer | where | responsibility |
|---|---|---|
| **Candidate / core** | `expert-hazlenz/` | the analysis entry point and the contracts that define a request |
| **Contract** | `expert-hazlenz/contract/` | wire schema, system prompt, structural admission, posture and projection contracts |
| **Provider adapter** | `expert-hazlenz-adapters/` | the only place that speaks to a provider. Transport, envelope, timeouts |
| **Deterministic admission** | `expert-hazlenz/contract/expert-252-structural-admission.ts` | accepts or refuses a provider response on structure alone |
| **Authority & settlement** | `expert-hazlenz/owed-facts/` | property authority, evidence authority, settlement review, the owed-fact ledger |
| **Governed evidence** | `expert-hazlenz/owed-facts/governed-evidence-derivation.ts` | derives citable evidence from the governed corpus only |
| **Product integration** | `expert-hazlenz-product/` | persistence, execution budget, operational controls, candidate provenance |
| **Knowledge** | `src/hazlenz-knowledge/` | ingestion, review queue, retrieval over approved regulatory sources |
| **Validation** | `backend/scripts/` + `src/safescope-v2/tests/` | instruments, scorers and harnesses |

## Owed facts and settlement

When the engine recognises that something it does not know controls the decision, it does not guess
and it does not silently proceed. It emits a structured **owed fact**: the proposition whose truth
would change the answer. Owed facts are held in a ledger, bound to the finding they affect, and
settled either by governed evidence or by a human.

Property authority and evidence authority are separate modules on purpose. Merging them is
explicitly an invariant violation: the question "who may assert this property" is not the question
"what evidence supports it".

## Human confirmation

Expert output is a proposal until a human confirms it. The confirmation boundary is code, not
convention — an unconfirmed analysis cannot present itself as an asserted finding. A refusal is
never rendered as an available analysis.

## Identity and the protected boundary

The engine's behaviour is pinned by a **frozen candidate identity**, §259
(`0b12adf6e44e4586ec2be27c5274dafd8a36b2c1042dfe34d543b51d5be70bee`): a digest over twenty-two
elements, nineteen of them SHA-256 digests of source files, plus the contract version, the
transmitted system prompt and the wire schema. Twenty-nine modules are **protected**, with digests
recorded in `PROTECTED-IDENTITIES.json`.

Editing a protected module — even to reformat, sort imports, or fix a comment — changes an
acceptance artifact. That is a stop-and-ask event, not an implementation detail. Verify with
`npm run hazlenz:verify`, which must report drift 0, before and after any engine change.

## Kill switch

`EXPERT_EXECUTION_ENABLED` must be present and exactly `"true"` or `"false"` in production; boot
fails on absence. The switch is deliberately not defaulted in either direction, because "nobody set
it" and "somebody decided it" must not produce the same running system for the one control an
operator reaches for during an incident. It is currently `false`.

See [HAZLENZ-INVARIANTS.md](HAZLENZ-INVARIANTS.md) for the rules that must hold.
