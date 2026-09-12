# Compound customer-visible question strings — adjudication packet

**FOR HUMAN ADJUDICATION. §168, 2026-09-04. Zero provider calls. This packet assigns no
disposition.**

---

## 1. The frozen rule being applied

From the §165 question budget, unchanged:

> Questions may be combined **only** when they share the same decision, concern the same
> equipment/context, each answer remains independently clear, and combining them does not hide
> separate decision branches.

And the standing caution the authorization restates: *if the two facts require separate answers or
affect different immediate controls, one textual question is not acceptable merely because the
contract permits one string.*

**Note the gap this exposes.** The §165 budget rule governs how HazLenz **assembles** questions from
surviving owed facts. It does not govern the single `question` string the verifier returns. Nothing
in the v3 contract inspects that string for compound structure — `MORE_THAN_ONE_PROPOSED_CLARIFICATION`
refuses an *array*, not two questions inside one string. So the rule and the artefact under review
are currently governed by different mechanisms, and that is itself part of what is being adjudicated.

---

## 2. The two draws the authorization names

Both bound the supplied flame-failure fact **and** carried an additive nomination of the auger
isolation fact.

### VC-08-2 — 327 characters

> Is the flame-failure device confirmed to be functional (e.g., via a recent test, remote indicator,
> or maintenance log), and separately, has the discharge auger's drive been locked out or
> de-energized for the operative currently clearing the blockage, or is the auger flighting still
> powered/live during that clearing?

**Structural markers:** `"and separately,"` · a parenthetical followed by `", and"` · multiple
disjunctions in a 327-character string.

### VC-08-3 — 230 characters

> Is the flame-failure device confirmed to be functional (e.g., through a recent test or
> verification log), and separately, has the discharge auger drive been locked out/de-energized
> before the operative began clearing the blockage?

**Structural markers:** `"and separately,"` · a parenthetical followed by `", and"`.

### The two facts, and whether they meet the combination test

Recorded mechanically from the frozen material, without a verdict:

| combination condition | flame-failure fact | auger isolation fact | same? |
|---|---|---|---|
| affected decision | `REQUIRED_CONTROL` | `REQUIRED_CONTROL` | **yes** |
| equipment / context | the burner unit behind the shroud | the discharge auger drive | **no** |
| immediate control if the answer is adverse | shut down the burner, restore the safeguard | stop the clearing work until isolation is established | **different** |
| answerable independently | — | — | *for the reviewer* |

Two of the four conditions are not met on the face of the record: the equipment differs, and the
immediate controls differ. Whether that is decisive is the adjudication.

---

## 3. Two further draws flagged by structure only — and why they are probably not the same thing

The structural detector also flagged **VC-08-4** and **VC-04-2**, but on a *weak* marker only:
"long string containing more than one `or`". Neither contains `"and separately,"` and neither
addresses two subjects.

> **VC-08-4** — "…confirmed to be functional (e.g., via a recent test, maintenance log, or
> control-panel status indicator), **or** is its operability unverified since it cannot be visually
> inspected from the walkway?"

> **VC-04-2** — "Was the rotor guard interlock's protective function … functionally tested and
> verified after the overnight rotor tooth change and before the debarker was returned to service
> this morning, **or was only the physical closure** confirmed?"

In both, the `or` separates **the two answer branches of one fact** — which is the two-branch shape
the contract asks for, not a second question. They are listed here because a structural flag that
silently drops its weak hits is not a flag a reviewer can trust, and because the reviewer may take a
different view of VC-04-2's length.

**These two are presented for completeness. The authorization's adjudication targets are VC-08-2 and
VC-08-3.**

---

## 4. Allowed dispositions

One per draw, for VC-08-2 and VC-08-3 (and optionally for the two weak-marker draws):

- [ ] `COMPOUND_ACCEPTABLE`
- [ ] `COMPOUND_ACCEPTABLE_WITH_FORMAT_REPAIR`
- [ ] `COMPOUND_UNACCEPTABLE`
- [ ] `AMBIGUOUS`

## 5. What each disposition would commit the programme to

| disposition | what follows |
|---|---|
| `COMPOUND_ACCEPTABLE` | the verifier may return two facts in one string. The §165 combination rule then does not govern the verifier's output at all, and that divergence should be recorded deliberately. |
| `COMPOUND_ACCEPTABLE_WITH_FORMAT_REPAIR` | the content stands and HazLenz splits the string before it reaches a customer. This needs a deterministic splitter, or a schema change giving the binding and the nomination their own question fields — the second is cheaper and cannot mis-split. |
| `COMPOUND_UNACCEPTABLE` | a contract change is required: either refuse a compound string at admission, or give each declared fact its own question field. Refusing at admission needs a structural test that does not read meaning — the `"and separately,"` marker is a lexical heuristic and would not qualify. |
| `AMBIGUOUS` | the two draws are removed prospectively from any burden denominator; §167 records stay unchanged. |

## 6. One observation offered as fact, not as argument

On the five HS-A1 draws that nominated additively, the nomination payload always carried the auger
fact **as its own fully-proved object** — `missingFact`, `observationSpan`, both branches and both
decisions — regardless of whether the `question` string mentioned it. The second fact is therefore
already structurally separate in the response; only the customer-visible string merges the two.

**Reviewer:** ______________________  **Date:** ____________
