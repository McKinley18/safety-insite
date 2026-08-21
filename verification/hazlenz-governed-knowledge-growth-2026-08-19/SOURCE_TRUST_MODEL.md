# HazLenz Source Trust Model

Design phase only. Defines source authority classes, their permitted use, and the
rules that govern how each class may influence HazLenz knowledge.

This model is **not new**. `backend/src/safescope-knowledge/sources/safescope-source-registry.types.ts`
already defines `authorityTier: 1|2|3|4|5`, an `allowedUse` union, `refreshCadence`,
`requiresApproval` and `approvedForAutoIngestion`, and 33 sources are registered
against it. This document makes the policy behind those fields explicit and
identifies where the policy is currently descriptive rather than enforced.

---

## 1. Authority hierarchy

### Tier 1 — Primary legal / regulatory sources

The governing law. These are the only sources that establish a legal requirement.

| Source | Registry key | Cadence | Auto-ingest |
|---|---|---|---|
| MSHA 30 CFR standards | `msha-30-cfr-standards` | monthly | yes |
| OSHA 29 CFR 1910 (General Industry) | `osha-ecfr-1910` | monthly | yes |
| OSHA 29 CFR 1926 (Construction) | `osha-ecfr-1926` | monthly | yes |
| eCFR / Federal Register | *change-detection channel* | — | discovery only |
| State-plan authorities | *not yet supported* | — | future |

- **Authority level:** governing. Nothing overrides tier 1.
- **Permitted use:** `primary_regulatory_authority`. May establish a requirement,
  a threshold, a prohibition, an applicability rule.
- **Citation rules:** cited by exact CFR citation with `citationPath`. Verbatim
  text must be reproducible from the stored document.
- **Update cadence:** monthly polling; Federal Register feeds may trigger an
  off-cycle check.
- **Conflict behaviour:** wins against every other tier. Tier-1 vs tier-1
  conflicts resolve by jurisdiction, then explicit effective date, then escalate.
- **Promotion requirements:** substantive changes (threshold, added/deleted
  requirement, applicability) **always** require human approval regardless of
  autonomy level. Only checksum-neutral changes may auto-promote.

**Note on eCFR and the Federal Register.** The Federal Register is a *change
discovery* channel, not a knowledge source: it tells the system what to re-fetch.
Knowledge is extracted from the codified text in eCFR/30 CFR, because that is
what is in force. A proposed rule is not a requirement, and the extraction
pipeline must never treat a notice of proposed rulemaking as a knowledge unit.

### Tier 2 — Official interpretive / guidance sources

Issued by the same agency, explaining how it reads its own rule.

| Source | Registry key | Cadence | Auto-ingest |
|---|---|---|---|
| OSHA letters of interpretation | `osha-standard-interpretations` | monthly | no |
| OSHA compliance directives | `osha-directives` | quarterly | no |
| MSHA Program Policy Manual | `msha-program-policy-manual` | quarterly | no |
| Official agency technical manuals | *as registered* | quarterly | no |

- **Authority level:** interpretive. Explains tier 1; never replaces it.
- **Permitted use:** `official_guidance`. May narrow, clarify or illustrate
  applicability. **May not create a requirement that has no tier-1 basis.**
- **Citation rules:** cited as interpretation, visibly distinguished from the
  regulation in any output. A finding may never present an interpretation as the
  legal requirement itself.
- **Conflict behaviour:** loses to tier 1. An interpretation that appears to
  contradict its own regulation is escalated for human review — it usually means
  the extraction is wrong, or the regulation changed and the interpretation is
  stale.
- **Promotion requirements:** human review required for all substantive content
  (`requiresApproval: true`, `approvedForAutoIngestion: false` in the registry
  today, which is correct).

### Tier 3 — Incident learning sources

| Source | Registry key | Cadence | Auto-ingest |
|---|---|---|---|
| MSHA fatality reports | `msha-fatality-reports` | weekly | yes |
| OSHA fatality/catastrophe data | `osha-fatality-catastrophe-data` | monthly | no |
| NIOSH FACE reports | `niosh-face-reports` | monthly | no |
| CSB investigation reports | `csb-investigation-reports` | monthly | no |

- **Authority level:** evidential, not normative.
- **Permitted use:** `incident_learning`. May inform *risk* reasoning, mechanism
  understanding and hazard context.
- **Hard limit:** **may never establish, modify or map a legal requirement.** An
  incident report describing a fatality under a guarding standard does not create
  or alter that standard's applicability.
- **Conflict behaviour:** cannot conflict with tier 1 or 2 by construction, since
  it makes no normative claims. If extraction produces a normative unit from a
  tier-3 source, that is a bug and the unit is rejected.
- **Promotion requirements:** never auto-promotes into standards mapping.

### Tier 4 — Consensus / industry standards

| Body | Registry treatment |
|---|---|
| ANSI / ASSP | `ansi-assp-standards-metadata` — **metadata only** |
| NFPA | `nfpa-standards-metadata` — **metadata only** |
| ASTM | `astm-standards-metadata` — **metadata only** |
| ISO | `iso-standards-metadata` — **metadata only** |
| ACGIH | `acgih-tlv-metadata` — **metadata only** |
| NIOSH publications | `niosh-mining-publications`, `niosh-numbered-publications` |

- **Authority level:** advisory best practice.
- **Permitted use:** `supporting_best_practice` / `context_only`.
- **Licensing constraint — important.** ANSI, NFPA, ASTM, ISO and ACGIH texts are
  copyrighted. The registry already handles this correctly by registering them
  **metadata-only** under `license_review_required`, and the ingestion control
  plane routes them to `metadata_reference_only`. **Full text must not be
  ingested.** The system may record that a standard exists, its number, title and
  edition, and may cite it — it may not reproduce it.
- **Conflict behaviour:** never overrides a regulation. Where a regulation
  incorporates a consensus standard by reference, the *incorporation* is a tier-1
  fact and the referenced edition is pinned; a newer edition of the consensus
  standard does not automatically become the legal requirement.
- **Promotion requirements:** human review; metadata only.

### Tier 5 — Internal / secondary expert sources

| Source | Registry key |
|---|---|
| Internal supervisor feedback | `internal-supervisor-feedback` |
| Internal repeat findings | `internal-repeat-findings` |

- **Permitted use:** `internal_workspace_learning`.
- **Hard limit:** feeds internal memory only (`databaseRole: feeds_internal_memory`).
  **Never writes to the global knowledge release.**
- This tier is where future user-feedback learning would land, and it is
  deliberately walled off from regulatory knowledge. See
  `HAZLENZ_GOVERNED_KNOWLEDGE_ARCHITECTURE.md` §7 and the Phase 17 separation
  below.

### Future — Company-specific sources

Not in this phase. Boundary defined in `COMPANY_OVERLAY_BOUNDARY.md`. Company
content is tenant-scoped, never global, and may never weaken the legal floor.

---

## 2. Policy summary table

| Tier | Class | Allowed use | May create a requirement? | Overrides | Auto-promote |
|---|---|---|---|---|---|
| 1 | Primary law | `primary_regulatory_authority` | **yes** | everything | checksum-neutral only |
| 2 | Official guidance | `official_guidance` | no | tiers 3–5 | never (substantive) |
| 3 | Incident learning | `incident_learning` | **no** | nothing normative | never |
| 4 | Consensus / best practice | `supporting_best_practice`, `context_only` | no | nothing | never; metadata only |
| 5 | Internal | `internal_workspace_learning` | no | nothing | never; internal memory only |

**The one-line invariant:** *a lower tier may add caution, never remove a
requirement, and never create one.*

---

## 3. Learning from sources vs learning from users (Phase 17)

These are separate systems and must stay separate.

**`AUTHORITATIVE_SOURCE_LEARNING`** — the subject of this architecture. Sources
are allowlisted, tiered, checksummed and versioned. Output is a candidate
knowledge release, promoted under governance.

**`USER_FEEDBACK_LEARNING`** — **not implemented, and not to be implemented in
this phase.** No consumer-inspection self-learning.

Conceptual future shape only, recorded so the boundary is explicit:

```
user correction on a finding
  -> feedback signal            (tier 5; already partly modelled by
                                 safescope_feedback + HRLG + learning-candidate-queue)
  -> aggregate review           (patterns across many users, never a single correction)
  -> candidate improvement      (a proposal about our mapping, NOT about the law)
  -> governed validation        (same gates as source learning)
  -> human approval
```

Three permanent constraints:

1. A user correction may never directly rewrite global safety knowledge. The
   existing `learning-candidate-queue.types.ts` already encodes this —
   `CandidateStatus = 'blocked' | 'review_required' | 'draft_candidate'` has no
   auto-promote state.
2. User feedback may propose changes to **our applicability mapping**, never to
   **the regulatory text**. The law is not a matter of user opinion.
3. Feedback is aggregated before it is even considered. A single user disagreeing
   with a correct finding is not evidence; a consistent pattern across many
   inspections is a signal worth reviewing.

---

## 4. Enforcement gap

The policy above is currently **data, not enforcement**.

- `approvedForAutoIngestion` and `requiresApproval` are registry fields, and
  `ingestion-control-plane.ts` derives a `reviewPolicy` from them — but no write
  path calls a governance service to *refuse* a write (gap **G4**).
- The intake, promotion and write-guard services under `safescope-v2/` produce
  advisory output objects consumed by `intelligence-orchestrator.service.ts`.
  They are well-designed and already encode the right decisions; they are simply
  not positioned as gates.
- Tier rules are honoured by how the seeds were authored, not by a constraint
  that would reject a tier-3 source attempting to write a normative unit.

Turning this policy into enforcement is backlog item **KG-4** in
`IMPLEMENTATION_BACKLOG.md`. Until then, the trust model is a correct description
of intent and of current data, and should not be described as an implemented
control.
