# §229 — FINAL FRESH EXPERT HAZLENZ ACCEPTANCE: DESIGN ENVELOPE

**Not executed. Not authorized. No case authored.** This is the envelope a later section would design
inside, produced so the product owner can size and authorize that work.

The baseline it would run against is
`EXPERT-HAZLENZ-CANDIDATE-BASELINE.json`, digest
`48db2a0f800b3632f1434130508895b625fa8e9a53a12ef691c5013058666200`.

---

## What final acceptance is for, and how it differs

Every cohort from §219 to §228C was a **targeted engineering instrument**: small, trap-shaped, and
authored by the same programme that built what it measured. Each answered a specific mechanism
question and each is honest about not generalising.

Final acceptance asks a different question:

> **Does Expert HazLenz do the actual intended expert job, at a rate a duty holder can rely on?**

Three consequences follow.

**It must evaluate the job, not the traps.** A cohort made only of known defect shapes measures how
well the last remediation was aimed. The majority of the cohort should be ordinary and difficult
hazard analysis of the kind the product will really meet.

**It must be substantially fresher and more independent.** The §229 baseline records the limitation
plainly: the §226 remediation, the §228A cohort and its scoring rules, and the §228C case were all
authored inside the development programme. Final acceptance needs case authorship independent of the
development session, a cohort never seen by it, and a denominator not chosen by the party being
measured.

**It must measure rates, not mechanisms.** The mechanisms are now demonstrated. What is unknown is
frequency: how often the first pass silently fails to declare, how often it picks the wrong property,
how often the adverse branch is too weak, how often the verifier accepts a non-controlling property.

---

## Size

**25 to 40 cases.** Below 25 no rate is meaningful for a defect that occurs at single-digit
percentages. Above 40 the adjudication burden grows faster than the information: §228B's 8 cases
produced 68 judgment slots, and a 40-case cohort on comparable density approaches 300.

## Coverage

The cohort must collectively exercise all of the following. The weighting matters as much as the
list: **the first group is the job, the second is the boundary, the third is the failure surface.**

**The job — the majority of cases.**

- ordinary hazards a competent person meets routinely
- difficult hazards where the controlling property is genuinely hard to name
- safe and adequately negated conditions, where the correct output is restraint
- multiple independent hazards in one observation
- incomplete evidence, where something is missing but not everything
- exact controlling-property reasoning, including act-versus-state and artifact-versus-state
- corrective-action reasoning
- immediate-decision and while-unresolved behaviour — **the axis no instrument in this programme has
  ever gated**, and the one carrying the C7 defect
- legitimate required acts and required artifacts, where the act or the document genuinely is the
  requirement

**The boundary.**

- OSHA grounding with a supplied authorized record
- MSHA grounding with a supplied authorized record
- off-point regulatory traps, where an authorized but irrelevant record is in the payload
- human confirmation and human correction of the property
- evidence authority, held separate from property authority
- satisfactory settlement, and adverse or keep-unresolved outcomes
- KR-1: a model-authored property reaching settlement with no property authority

**The failure surface.**

- RR-7 malformed declaration handling
- malformed provider behaviour **where naturally encountered** — not injected. §228B saw one
  truncation in 13 calls without asking for it; a 40-case cohort will meet more.

## What must be preregistered, and what must not be

Preregistered before any call, per the §228A pattern: established facts, unresolved properties,
non-facts, prohibited proxies, expected declaration count, exact controlling property, expected
verifier routing, human property action, evidence action, settlement action, expected refusal codes,
expected final state, expected transition count, and the unsafe authorization that must not occur.

**The denominator must be authored before the cohort is seen**, and a hard requirement with zero
exercised opportunities is `COVERAGE_INSUFFICIENT`, never a pass.

**Not preregistered:** the pass rate anyone hopes for. Final acceptance measures a rate; it does not
start from one.

## Two lessons from §228 that should shape the design

**One. Do not put a hard requirement's only home on a single case.** §228B lost HR4 and HR7 to one
truncated call, and §228C cost a separate frozen slice to recover. Every hard requirement in the
final cohort should have at least two independent homes.

**Two. Author the judgment slots with the cases, not after.** §228A's preflight caught five
requirement claims with no slot feeding them, reproducing the §221 authoring gap inside the very
instrument written to avoid it. The check that caught it should be carried forward verbatim.

## Spend envelope

From measured unit cost on this contract: first-pass calls averaged **USD 0.0916**, verifier calls
**USD 0.0403**, across 13 §228B calls and 2 §228C calls.

| cohort | calls | projected | suggested ceiling |
|---|---|---|---|
| 25 cases, ~18 verifier legs | 43 | ≈ USD 3.03 | USD 4.00 |
| 40 cases, ~30 verifier legs | 70 | ≈ USD 4.87 | USD 6.30 |

Ceilings price every call at the worst unit cost observed and add two contingency calls, which are
spendable only on a transport, HTTP or never-reached-inference failure.

**Instrument integrity outranks the ceiling.** If the frozen design collides with it, the product
owner raises the ceiling; coverage is not cut and the semantic request contract is not changed.

## Sequencing

1. **Design and freeze the instrument first**, as a separate authorized slice. §228 was authorized to
   execute against a design that had never been authored, and stopped at zero calls. Do not repeat it.
2. **Author the cases independently of the development session.**
3. **Run the machine-checked truth preflight** and freeze only when it passes at 100%.
4. **Hash before spend.**
5. **Execute once.** No semantic-preference retries.
6. **Adjudicate against the frozen slots**, then compute.

## What would make it fail, and what would not

**Would fail it:** any uncontained authoritative safety defect; a decision-critical property lost
before containment with no named defect; an unsafe authorization; a settlement without the required
authority.

**Would not fail it, and must be recorded rather than treated as failure:** a provider structural
defect the architecture detects, refuses and names honestly; a contained branch or decision quality
defect; an axis with no genuine opportunity to fail, which is `NOT_EXERCISED`.

---

## Recommendation

Authorize the **instrument design and freeze** as its own slice, on the §229 candidate baseline, with
case authorship independent of this development programme. Do not authorize design and execution in
one step.
