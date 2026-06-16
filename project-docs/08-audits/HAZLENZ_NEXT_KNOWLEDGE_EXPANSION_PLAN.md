# HazLenz Next Knowledge Expansion Plan

This document serves as the strategic backend knowledge expansion blueprint for HazLenz AI (SightSignal's core safety intelligence engine). It outlines our current validation baseline, identifies the top 10 remaining regulatory and accuracy gaps, and details the next high-value knowledge expansion patch to strengthen our advisory capabilities without introducing legal or operational liability.

---

## 1. Current Green Checkpoint Summary
We are operating at a clean, 100% green checkpoint on the `main` branch.
- **Commit Baseline:** Commits `fa26b47`, `6bfc8a7`, `77c1bf6`, and `e7b5f9b` have finalized and stabilized the Phase 1 Reliability Validation Gate, synchronized regulatory brain records, resolved false-positive list-negations (expanding the NLP negation window to 100 characters), and refined layout/spacing blocks.
- **Compiler Health:** The backend (`tsc`) and frontend-next production compilation (`next build` with Turbopack) both compile successfully with zero errors or warnings.
- **Assertion Coverage:** All 30+ database-independent unit and functional assertion modules pass cleanly.

---

## 2. What Current Validations Prove
Our validation gate currently provides empirical proof of the following capabilities:
1. **Structural Schema Contract Adherence:** Proves that all orchestrator results, brain snapshots, and evidence structures strictly adhere to their TypeScript definitions.
2. **Deterministic Fallback Routing:** Confirms that in zero-service or offline environments, keyword fallbacks map accurately to key categories.
3. **No False-Positive Overclaims on Negations:** Validates that complex list negations are correctly handled by our 100-character NLP negation window, preventing negated hazard terms from triggering false compliance citations.
4. **Static Brain Coverage and Alignment:** Validates that standard suggestions across 50 coverage matrix cases are 100% aligned with their static, official CFR and regulatory citations.
5. **Human Oversight Loop Resilience:** Proves that supervisor adjustments, validations, and overrides are persisted and logged correctly for learning updates.

---

## 3. What Current Validations Do NOT Prove Yet
Despite a 100% pass on the current gauntlets, our test suite does not yet guarantee:
1. **Dynamic Open-Ended Text Realism:** Validations check a static set of pre-calculated test observations (e.g., 118 gauntlet/pack-v2 cases). They do not verify correctness on arbitrary, highly unstructured paragraph narratives from real field workers.
2. **Contextual Multi-Hazard Isolation:** It does not prove that the system can cleanly isolate and suggest separate citations for overlapping, concurrent hazards (e.g., a blocked electrical panel representing *both* housekeeping obstructions and electrical hazard zones).
3. **Live External CFR Updates Integrity:** The tests run on offline static JSON registries. They do not prove that we can parse, clean, or cross-reference live Federal Register or CFR API feeds without validation drift.
4. **Absence of Bias in Suggestion Frequency:** Current validations do not prove that some general domains (like `housekeeping`) won't "swallow" rarer, higher-risk domains (like `electrical_guarding`) in unbalanced natural language inputs.

---

## 4. Top 10 Knowledge and Accuracy Gaps
Based on a systematic audit of the current brain registries, the next high-value gaps to address are:

| Rank | Hazard Family & Domain | Gap Description | Technical Risk / Product Value |
| :--- | :--- | :--- | :--- |
| **1** | **OSHA Construction:** Excavation/Trenching | Access & Egress ladders/ramps in trenches $\ge$ 4ft deep (29 CFR 1926.651(c)(2)). | **High Risk:** Structural cave-ins represent the highest fatality vector in excavations. Ladders must be present within 25ft of lateral travel. |
| **2** | **MSHA Underground:** Ground Support | Roof and Rib Control plans (30 CFR 75.202). Missing support checks on surface-to-underground transitions. | **High Risk:** Roof falls are a leading cause of underground mining fatalities. Requires evidence gaps mapping. |
| **3** | **OSHA General Industry:** Lockout/Tagout | Energy Isolation Verification (29 CFR 1910.147(d)(6)). Failure to verify "zero-energy state" before servicing. | **High Risk:** Amputations and fatal restarts occur due to residual pressure/energy. |
| **4** | **MSHA Surface:** Ground Control | Highwall and Bank Stability scaling checks (30 CFR 56.3130). Missing quarry wall audits. | **Medium Risk:** Scaling and loose material hazards in surface mining. |
| **5** | **OSHA Construction:** Fall Protection | Personal Fall Arrest Anchorage points (29 CFR 1926.502(d)(15)). Anchor ratings must meet 5,000 lbs. | **High Risk:** Workers anchoring to non-structural members (conduit, pipes) causing harness failures. |
| **6** | **OSHA General Industry:** Confined Space | Qualified Entry Attendant Positioning (29 CFR 1910.146(d)). Attendant leaving portal or performing rescue. | **High Risk:** Multiple fatalities occur when attendants attempt entry rescue without auxiliary air. |
| **7** | **OSHA General Industry:** Compressed Gas | Oxygen and Fuel-Gas Cylinder Separation (29 CFR 1910.253(b)(4)(iii)). Storage within 20ft or firewalls. | **Medium Risk:** Massive fire/explosion risk in maintenance bays. |
| **8** | **MSHA Surface:** Power Conveyors | Conveyor Pull-cord Emergency Stop Slack/Integrity (30 CFR 56.14109). Stop cords must be reachable. | **Medium Risk:** Amputations and head-pulley entanglement. |
| **9** | **OSHA General Industry:** Electrical | Arc Flash Boundary Clearances and PPE labeling (29 CFR 1910.303). Restricted access to open MCC rooms. | **High Risk:** Fatal shock/burn hazard. |
| **10** | **OSHA General Industry:** Bloodborne | Restroom Sharps Disposal and Exposure Control (29 CFR 1910.1030). Needle storage integrity. | **Low Risk:** Exposure to infectious bio-materials. |

---

## 5. Recommended Next Patch (Rank 1: Trenching Access/Egress)
We propose to implement **Rank 1: OSHA Construction Trenching Access and Egress** as the next backend knowledge expansion patch.

### Exact Files to Modify:
1.  **`backend/src/safescope-v2/brain/regulatory-brain/regulatory-knowledge.registry.ts`**
    *   *Action:* Append a new `SafeScopeRegulatoryBrainRecord` for `reg-osha-1926-651-excavation-access-egress`.
2.  **`backend/src/safescope-v2/brain/evidence-brain/evidence-knowledge.registry.ts`**
    *   *Action:* Append a new evidence record mapping critical evidence parameters (presence of ladder/ramp, trench depth, soil stability type, lateral travel distance).
3.  **`backend/src/safescope-v2/brain/controls-brain/controls-knowledge.registry.ts`**
    *   *Action:* Append a new controls record outlining specific administrative/engineering steps (structural ladder installation, daily competent person inspections, lateral distance limit audits).
4.  **`backend/src/safescope-v2/brain/mechanism-brain/mechanism-knowledge.registry.ts`**
    *   *Action:* Append a new mechanism record for `excavation_cave_in_or_entrapment` mapping energy factors and line-of-fire risks.
5.  **`backend/src/safescope-v2/standards/standards-applicability.registry.ts`**
    *   *Action:* Add the standard metadata mapping `29 CFR 1926.651(c)(2)` to the excavation subpart.

---

## 6. Proposed Benchmark Cases to Add
To verify the patch, we will add the following evaluation cases to **`safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json`**:

### Case A: Positive Trenching Access Violation
```json
{
  "id": "FIELD-V2-OSHA-TRENCH-EGRESS-MISSING-001",
  "title": "deep construction trench missing access ladder",
  "hazardObservation": "An employee was working in a 6-foot deep construction trench laying sewer pipe. No ladder, ramp, or steps were present within the trench. The soil appeared to be sandy clay.",
  "siteType": "roadway work zone",
  "industryContext": "osha_construction",
  "taskContext": "excavation pipe laying",
  "equipmentInvolved": "excavation trench",
  "photosAvailable": true,
  "employeeExposureKnown": true,
  "expectedTerms": [
    "ladder",
    "egress",
    "depth",
    "soil"
  ],
  "forbiddenTerms": [
    "scaffold",
    "confined space"
  ],
  "shouldHaveMissingEvidence": true
}
```

### Case B: Negated Trenching Access Case
```json
{
  "id": "FIELD-V2-OSHA-TRENCH-EGRESS-COMPLIANT-001",
  "title": "trench with ladder present near employee",
  "hazardObservation": "A worker was inside a 5-foot deep trench doing utility repair. An extension ladder was tied off and positioned directly next to the worker, providing immediate egress. No missing ladder was observed.",
  "siteType": "utility work zone",
  "industryContext": "osha_construction",
  "taskContext": "utility repair",
  "equipmentInvolved": "excavation trench",
  "photosAvailable": true,
  "employeeExposureKnown": true,
  "expectedTerms": [
    "egress",
    "ladder"
  ],
  "forbiddenTerms": [
    "missing egress",
    "unprotected trench",
    "no ladder"
  ],
  "shouldHaveMissingEvidence": false
}
```

---

## 7. Source-Governance Rules to Preserve
Our core mandate requires that we strictly preserve the following architectural boundaries during this and all future expansion patches:
1. **Authoritative Source Anchoring:** Every regulatory brain record must point to an official government citation (CFR 29/30 or NIOSH guidance) in `sourceReference`. No third-party blog or commercial summaries may act as primary sources.
2. **Read-Only / Decision-Support Boundary:** The expanded registries must remain advisory. The JSON property `authorityTier` must be set to `tier_1_binding_regulation` for CFR but `boundary` must strictly enforce:
   * `canCreateCitation: false`
   * `canDeclareViolation: false`
   * `canOverrideRegulation: false`
   * `canBypassHumanReview: false`
3. **No Automated Definitiveness:** Standard mapping or classification must never be presented to field workers as "certified compliance". Suggestion text must always include "qualified review required" context.

---

## 8. "Do Not Do" Section
To preserve SightSignal's technical authority and protect users from regulatory liability, the expansion patch **must NOT**:
- ❌ **Do NOT declare any violations:** Never output strings like *"This is an OSHA violation"* or *"You are violating 29 CFR 1926.651."* Always use advisory language: *"Candidate standard suggested for professional review: 29 CFR 1926.651(c)(2)."*
- ❌ **Do NOT generate citations:** Do not format PDF reports to mimic official citation notices or assess legal penalty calculations.
- ❌ **Do NOT draw unsupported regulatory conclusions:** Do not assume soil classification (e.g., Type A/B/C) or excavation safety unless verified and documented by a competent person in the evidence contract.
- ❌ **Do NOT do cosmetic UI work:** No buttons, dashboard redesigns, or profile layouts may be changed during this backend precision and coverage expansion.

---

## 9. Local Validation Commands
After implementing the future patch, the following commands must be executed locally to verify correctness and assert zero regressions:
```bash
# Execute the complete validation gate (including the new benchmark cases)
bash scripts/validate-hazlenz-ai.sh

# Target the regulatory brain validation specifically
cd backend && npx ts-node scripts/validate-safescope-regulatory-brain.ts

# Target the field realism v2 test suite specifically
cd backend && npx ts-node scripts/validate-safescope-field-realism-pack-v2.ts
```
