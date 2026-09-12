# §249 — Executable Contract Binding Repair and Candidate Identity v2 Hardening: Final Report

Zero provider calls. Zero database operations. No commit, no push, no tag, no deploy.

## Terminal

    EXPERT_HAZLENZ_EXECUTABLE_SUCCESSOR_CONTRACT_BOUND —
    DRIVER_ROLE_HOSTED_CONFIRMATION_REAUTHORIZATION_REQUIRED

## Required report fields

| Field | Value |
|---|---|
| §243 | D HOLD RELEASE — PRESERVED |
| §248 | INVALID — ZERO PROVIDER EXPOSURE, preserved unmutated |
| Provider calls | **0** |
| Spend | **USD 0.00** |
| Production entry point invoked prompt | `build247SystemPrompt` |
| Production entry point invoked schema | `buildExpert247WireSchema` |
| Adapter invoked prompt | `build247SystemPrompt` |
| Adapter invoked schema | `buildExpert247WireSchema` |
| Actual request `roleJustification` | **PRESENT** |
| Actual request K6 pairs | **6 admissible / 0 inadmissible** |
| Actual request strict schema | **ENABLED** |
| Production/adapter semantic parity | **PASS** — 0 mismatches across 12 load-bearing elements |
| Candidate Identity v2 | **17 / 17** |
| Identity derivation | **EXECUTION-DERIVED** |
| Written declarations used | **0** |
| Negative identity tests | **6 / 6** all correctly failing the identity |
| Local suites | **15** |
| Local assertions | **1,473** |
| Failures | **0** |
| test-218 | **113 / 113** |
| Frozen TypeScript provenance errors | expected known set only — `POSTURE_REF_KINDS_237`, no additional |
| Substantive confirmation changes | **0** |
| Six cases | UNCHANGED |
| Truth | UNCHANGED |
| Gates | UNCHANGED |
| Success threshold | UNCHANGED |
| New executable candidate identity | `e59cbf26b67a030068a091e8df84f57333c7b19dda28c8718a749d757c8993e6` |
| New confirmation instrument digest | `e45fc33843e71b778b0f2af8c41356855bf670de80e719b8371f21f894269b9f` |
| New confirmation package digest | see `REPORT-249.sha256` below |
| Database operations | 0 |
| Commit / push / tag / deploy | NONE |

## The repair

Four call sites and one projection. The entry point and the compatibility adapter now invoke
`build247SystemPrompt` and `buildExpert247WireSchema`; the entry point reports the §247 contract
version and runs `checkRoleJustification247` beside the posture projection, so the representation is
enforced and not merely transmitted.

No §247 semantics were touched. Selecting a builder is binding, not meaning, and the §247 contract
remains a byte-reversible extension of §239 — both reconstruction assertions still pass.

## The proof, taken from the real path

The request was obtained by driving `runExpertHazLenzAnalysis` with a capturing transport and passing
the captured bytes through the same envelope and provider-native functions the hosted transport
calls. Nothing was reimplemented and nothing was sent; the verifier contains no network primitive.

Discriminated union present, `roleJustification` present, justification instruction present in the
system prompt, six admissible pairs, zero inadmissible, strict schema enabled, canonical envelope
used, zero unsupported provider keywords surviving. Adapter parity: zero mismatches.

## The identity, and why it is different this time

§247's identity reported 17 of 17 throughout the period when the product was transmitting §239 bytes.
It was declaration-derived — it proved that named modules existed, and existence is not invocation.

The hardened procedure starts from the assembled request and resolves each element by reproducing the
bytes. Element 5 resolves because the assembled prompt reproduces `build247SystemPrompt` exactly, and
would report `build239SystemPrompt` if it reproduced that instead. Element 17 is read off the
transmitted schema rather than off a contract module, so a successor that exists but is not sent
cannot satisfy it.

All six required negative fixtures break the identity, including the two that reproduce the §248
defect itself: the §239 prompt or schema invoked while the §247 modules sit unused in the same
directory. The procedure that missed it now cannot.

## Regression

Fifteen suites, 1,473 assertions, zero failures, against the §247 baseline of fourteen and 1,458. The
fifteen additional assertions are the thirteen identity-hardening checks and the two from
strengthening E3 to name the invoked successor. Every required protected check passes: test-218 at
113 of 113, property authority, evidence authority, settlement, KR-1 (still OPEN and human-gated),
RR-7, governed evidence, citation containment, no-call purity and canonical-path parity.

The production build reports the frozen `POSTURE_REF_KINDS_237` annotation error and no other. It was
not repaired, notwithstanding that this work touched neighbouring code.

## The re-frozen confirmation

The same substantive confirmation: six observations, frozen truth, role truth, posture truth, six
gates, the 5 of 6 role-presence coherence floor against the historical 0.60, the stopping rule, the
spend design and the authoring limitation — all preserved unchanged and bound to the digest of the
§247 design document they came from. Substantive changes: **0**.

Only the mechanical fields were updated: executable candidate identity, contract identity, request
identity, derived hashes, manifest and freeze metadata.

§248 is preserved intact and unmutated as INVALID — ZERO PROVIDER EXPOSURE. Its six observations were
never exposed to a provider and remain unspent.

## What was deliberately not done

No provider call was made, and the re-frozen confirmation was not executed. Every local check passes
and the instruction is still to stop and return the new identities for explicit execution
authorization.

§247 was not rewritten. Its report remains historical evidence of what was implemented and what its
then-current identity procedure concluded; the newly discovered limitation is recorded here instead.

## What the product owner now has

A production path that assembles exactly the request the frozen confirmation was written to test, an
identity procedure that fails when it stops being true, and an instrument whose substantive content
is unchanged from the one already reviewed.

§243 stands at D HOLD RELEASE. No successor candidate has been frozen. The §247 stopping rule is not
triggered, because the driver-role representation has still received no hosted confirmation.

STOP.
