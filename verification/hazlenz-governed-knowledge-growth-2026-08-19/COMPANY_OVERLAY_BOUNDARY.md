# Company-Specific Safety Overlay — Design Boundary Only

**Not implemented in this phase, and not to be implemented until the governed
knowledge growth foundation exists.** This document defines the interface
boundary and the invariant so that later work cannot accidentally violate it,
and so that the global knowledge design made now leaves the right seams.

---

## 1. The governing invariant

> **Company requirements may meet or exceed the applicable legal requirement, but
> may never weaken or replace the legal floor.**

This is not a policy preference. A product that lets a company configure away a
legal requirement, and then reports compliance against that weakened rule, would
actively assist in producing an unsafe workplace and a false compliance record.
The invariant must be enforced structurally — a company rule must be *incapable*
of lowering the floor, not merely discouraged from it.

---

## 2. Layering

```
  LEGAL_REQUIREMENT          governed knowledge release; global; tenant-immutable
         |                   "OSHA 1910.23 requires fall protection at 4 feet."
         v
  COMPANY_REQUIREMENT        tenant-scoped overlay; may only add or tighten
         |                   "Our policy requires fall protection at 3 feet."
         v
  HAZLENZ_RECOMMENDATION     what the inspector is shown
                             both surfaced; the stricter applies operationally
```

Three separate layers, resolved in this order, every time. The legal layer is
read-only from the overlay's perspective: **the overlay is a separate store that
is composed at read time, never a mutation of the knowledge release.** That is
the structural guarantee — a tenant cannot write into global knowledge because
there is no write path from the overlay to it.

---

## 3. Resolution semantics

Let `L` be the applicable legal requirement and `C` the company requirement for
the same hazard/control.

| Case | Condition | Behaviour |
|---|---|---|
| **Stricter** | `C` is more protective than `L` | Apply `C` operationally. Surface **both**: "Legal: 4 ft. Company policy: 3 ft. Applying company policy." |
| **Equal** | `C` restates `L` | Apply either; surface once, noting the company has adopted the legal standard. |
| **Additional** | `C` covers something `L` does not | Apply `C` as a company requirement, clearly labelled as policy rather than law. |
| **Weaker** | `C` is less protective than `L` | **`L` is preserved and applied.** `C` is flagged as *conflicting / insufficient*. `C` is never applied and never displayed as the requirement. |
| **Contradictory** | `C` forbids what `L` requires | Same as weaker: `L` governs, conflict raised for the tenant's safety leadership. |
| **Unmappable** | `C` cannot be tied to a legal requirement or a known hazard | Held as an unmapped company policy; surfaced but never merged into standards reasoning. |

**Comparability caveat, stated honestly.** "Stricter" is only mechanically
decidable when both sides reduce to a comparable structured threshold on the same
dimension — a height, a concentration, a voltage, an interval. That is exactly
what the `threshold` knowledge-unit type in the architecture is for. For
non-numeric requirements ("adequate training", "competent person"), automated
strictness comparison is **not** reliable, and the design must not pretend
otherwise. Non-comparable company rules are treated as *additional* requirements
and surfaced alongside the legal requirement, never as replacements, and never
auto-classified as stricter or weaker.

This is the main reason the overlay must wait for structured knowledge units: a
legal-floor comparison against `simple-array` keywords cannot be done safely.

---

## 4. Interface boundary

What the global knowledge system must expose for a future overlay — and nothing
more:

```ts
interface LegalFloorQuery {
  jurisdiction: Jurisdiction;
  hazardFamily: HazardFamily;
  mechanism: TaskMechanism;
  equipmentFamily?: EquipmentFamily;
  knowledgeReleaseId: string;        // resolution is release-pinned
}

interface LegalFloor {
  units: KnowledgeUnit[];            // read-only
  thresholds: Array<{ dimension: string; value: number; unit: string;
                      comparator: '>=' | '>' | '<=' | '<'; citation: string }>;
  knowledgeReleaseId: string;
  comparable: boolean;               // false => strictness is not machine-decidable
}
```

Boundary rules:

1. The overlay **reads** the legal floor. It has no write path to knowledge
   releases, standards, or knowledge units.
2. Resolution is pinned to a `knowledgeReleaseId`, so a company rule evaluated
   today can be re-explained later against the law as it stood then.
3. `comparable: false` forces the "additional requirement" path. The overlay may
   not infer strictness where the system cannot compute it.
4. Overlay output is a distinct layer in the analysis result, never merged into
   the legal citation block. A report must always be able to show what the *law*
   required, independent of company policy.

---

## 5. Future requirements for the overlay itself

Recorded so they are not rediscovered later. None of this is built.

| Concern | Requirement |
|---|---|
| **Versioning** | Company rule sets are versioned like knowledge releases: parent version, approval, effective date, rollback. An inspection records the company rule version *and* the knowledge release. |
| **Approval** | A company rule requires an identified approver within the tenant. Self-service weakening is impossible by construction (§3), but additions still need accountability. |
| **Effective dates** | Company rules carry effective and expiry dates; an expired rule stops applying without deletion. |
| **Source documents** | A company rule should cite its own policy document, with the same provenance discipline (document, checksum, retrieval/upload date, approver). |
| **Tenant scoping** | Hard tenant isolation. A company rule is visible only within its tenant; no cross-tenant read is possible, and company content never enters the global corpus or any shared index. |
| **Audit logs** | Every create/modify/approve/retire is audited with actor and timestamp. |
| **Conflict detection** | Runs at authoring time, not just evaluation time: a tenant should be told immediately that a proposed rule is below the legal floor. |
| **Legal-floor comparison** | Requires structured thresholds (architecture §3). Blocked until knowledge units exist. |
| **Uploads are untrusted** | Company policy documents are user-supplied content. They are sanitized, never executed, never treated as instructions to a model, and never granted authority above tier 5. |

---

## 6. Dependencies

The overlay cannot be built responsibly until:

1. structured `KnowledgeUnit`s with typed thresholds exist (architecture §3) —
   without them there is nothing to compare against;
2. knowledge releases are versioned and production-bound
   (`KNOWLEDGE_VERSIONING_AND_ROLLBACK.md` §3.4) — without them a company rule
   cannot be pinned to the law it was evaluated against;
3. tenant isolation is verified for knowledge reads.

**Stop here.** No overlay implementation, no schema, no endpoint in this phase.
