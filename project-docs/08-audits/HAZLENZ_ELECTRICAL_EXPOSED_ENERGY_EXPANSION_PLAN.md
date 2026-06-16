# HazLenz AI Electrical Exposed-Energy Expansion Plan

This document serves as the strategic planning-only audit and backend knowledge expansion blueprint for HazLenz AI (SightSignal's core safety intelligence engine) in the domain of **Electrical Exposed-Energy and Energized-Equipment reasoning**. It outlines our current validated baseline, identifies the top 10 remaining false-positive and false-negative accuracy risks, and details the next high-value electrical safety knowledge patch.

---

## 1. Current Green Checkpoint Summary
We are operating at a clean, 100% green committed checkpoint on the `main` branch:
- **Baseline Commit:** Commit `18adfeed` has successfully merged and validated the OSHA Construction Trench Access/Egress knowledge expansion, including 8 new evaluation cases.
- **Validation Pass:** Running `bash scripts/validate-hazlenz-ai.sh` passes 100% cleanly on both backend assertions and the frontend Next.js production compilation.
- **Suite Health:** All **108 Field Realism Pack v2 cases** pass cleanly with zero false positives or missing terms, demonstrating highly stable and verified engine behaviors.

---

## 2. What HazLenz Currently Handles Well
HazLenz's existing reasoning adapters (`SafeScopeReasoningOrchestratorService` and related brain registries) successfully manage several core electrical safety boundaries:
1.  **Closed Panel Enclosures:** Distinguishes closed electrical panels from open ones, ensuring that simply mentioning an electrical panel near a walkway does not trigger high-severity "exposed live parts" alarms.
2.  **Blocked Panel Access Clearance:** Correctly classifies boxes stored in front of closed electrical panels as **housekeeping or clearance access issues** (`OSHA 29 CFR 1910.303(g)` working space) rather than assuming active shock exposure.
3.  **Wet Surfaces Near Closed Panels:** Integrates wet floors near closed electrical enclosures as moderate-risk/hold-for-critical-evidence scenarios, requiring operators to confirm exposed conductors or water intrusion before issuing a high-confidence alert.
4.  **Jurisdiction-Specific Conductor Routing:** Bridges MSHA conductor protection (`30 CFR 56.12004`) and OSHA general industry electrical guarding (`29 CFR 1910.303(g)(2)(i)`) accurately depending on the mine-site or factory-site scope.

---

## 3. What HazLenz Does NOT Prove Yet
Despite passing our 108-case gauntlets, the validation suite does not yet prove or safeguard:
1.  **Missing "Dead-Front" (Interior Cover) Nuance:** If the outer door of an electrical cabinet is open, but the metal "dead-front" interior barrier is fully in place, there are **no exposed live parts**. The current engine cannot yet differentiate between a missing outer door and a missing inner dead-front.
2.  **Energized State Assumption Constraints:** The engine frequently assumes any open junction box or scuffed cord is actively energized, neglecting cases where circuits are locked out (LOTO) or completely abandoned/dead, resulting in unnecessary safety shutdowns.
3.  **Qualified vs. Unqualified Employee Proximity:** The engine does not evaluate whether a worker near an open panel is a **Qualified Electrical Worker** performing active testing/PPE troubleshooting vs. an unqualified, unprotected operator exposed to inadvertent shock contact.
4.  **Temporary Wiring (GFCI) Testing Intervals:** Does not evaluate temporary construction site generator setups under the Assured Equipment Grounding Conductor Program (AEGCP) or verify GFCI test-button logging.

---

## 4. Top 10 Electrical False-Positive and False-Negative Risks
Based on our current codebase audit, we have ranked the top 10 electrical safety accuracy risks by severity and product value:

| Rank | Hazard Domain / Scenario | Risk Type | Technical Risk / Product Value Impact |
| :--- | :--- | :--- | :--- |
| **1** | Assuming energized state on a verified locked-out or dead system. | **False Positive** (Overclaim) | **High Risk:** Recommending immediate emergency pauses or shutdowns on equipment that has been safely isolated via LOTO reduces trust. |
| **2** | Blocked electrical panel workspace clearance. | **False Positive** (Overclaim) | **Moderate Risk:** Conflating stored boxes near closed panels with high-severity exposed live wires. Should route strictly to working-space access. |
| **3** | Panel with outer door open but dead-front inner metal cover intact. | **False Positive** (Overclaim) | **Moderate Risk:** Overclaims "exposed live parts" because the cabinet door is open, ignoring that the interior dead-front prevents all direct contact. |
| **4** | Open electrical panel with missing dead-front / exposed live terminals. | **False Negative** (Underclaim) | **High Risk:** Failing to issue high-priority warnings on actually exposed, energized 480V busbars because the outer cabinet door is in place. |
| **5** | Wet floor near closed, intact electrical cabinet. | **False Positive** (Overclaim) | **High Risk:** Treating generic water near closed boxes as an active shock hazard without confirming enclosure breaches or water intrusion. |
| **6** | Outdoor temporary construction cords lacking GFCI protection. | **False Negative** (Underclaim) | **High Risk:** Failing to flag portable cords lying in outdoor puddles without verifying GFCI protection at the generator or panel source. |
| **7** | Energized troubleshooting performed by a Qualified Electrician. | **False Positive** (Overclaim) | **Medium Risk:** Raising critical violations for active voltage testing performed by qualified personnel wearing Category 4 Arc Flash PPE. |
| **8** | Conflating low-voltage telecom (Ethernet/CAT5) with high-voltage lines. | **False Positive** (Overclaim) | **Medium Risk:** Generating high-severity warnings for loose or dangling low-voltage internet/data lines. |
| **9** | Damaged outer jacket on a cord without inner insulation damage. | **False Positive** (Overclaim) | **Medium Risk:** Treating a scuffed or outer-jacket-nicked extension cord as an active bare conductor exposure (shock potential). |
| **10** | Locked Motor Control Center (MCC) room access restrictions. | **False Positive** (Overclaim) | **Low Risk:** Generating warnings because a qualified room door is closed, conflating authorized locked-room security with "blocked emergency exits". |

---

## 5. Recommended Next Patch (OSHA Dead-Front & Temporary GFCI)
To resolve these risks, the next knowledge-expansion patch should target **OSHA General Industry Dead-Front Cover Integrity (29 CFR 1910.305(b)(1))** and **OSHA Construction GFCI Temporary Protection (29 CFR 1926.404(b)(1)(ii))**.

### Target Files and Modules to Modify:
1.  **`backend/src/safescope-v2/standards/standards-applicability.registry.ts`**
    *   Add standard metadata mapping for `29 CFR 1910.305(b)(1)` (enclosure box covers) and `29 CFR 1926.404(b)(1)(ii)` (ground-fault protection).
2.  **`backend/src/safescope-v2/brain/regulatory-brain/regulatory-knowledge.registry.ts`**
    *   Append `SafeScopeRegulatoryBrainRecord` entries for `reg-osha-1910-305-dead-front-covers` and `reg-osha-1926-404-construction-gfci`.
3.  **`backend/src/safescope-v2/brain/evidence-brain/evidence-knowledge.registry.ts`**
    *   Append `SafeScopeEvidenceBrainRecord` entries mapping evidence questions (outer door state, dead-front presence, cord insulation split vs. jacket nick, GFCI tester button result).
4.  **`backend/src/safescope-v2/brain/controls-brain/controls-knowledge.registry.ts`**
    *   Append `SafeScopeControlBrainRecord` entries outlining distinct administrative controls (restricting unqualified staff) and engineering controls (installing temporary GFCIs).
5.  **`backend/src/safescope-v2/brain/mechanism-brain/mechanism-knowledge.registry.ts`**
    *   Append a new mechanism record for `energized_dead_front_exposure` to evaluate secondary contact hazards.
6.  **`backend/src/safescope-v2/reasoning-orchestrator/reasoning-orchestrator.service.ts`**
    *   Implement context-aware routing overrides to isolate `29 CFR 1910.305(b)(1)` when "dead front" or "cabinet interior cover" is described, and `29 CFR 1926.404(b)` when temporary construction cords are referenced.
7.  **`safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json`**
    *   Append the copy-paste-ready benchmark cases detailed below.

---

## 6. Proposed Benchmark Cases to Add

The following copy-paste-ready JSON objects will be appended to **`safescope-field-realism-pack-v2.v1.json`** to lock in these precise behaviors:

```json
  {
    "id": "FIELD-V2-OSHA-ELECTRICAL-EXPOSED-LIVE-PARTS-001",
    "title": "open electrical panel with missing dead-front and live busbars",
    "hazardObservation": "An electrical distribution panel in the maintenance bay had its outer door open. The interior dead-front safety cover was missing, exposing fully energized 480V copper busbars to direct contact.",
    "siteType": "maintenance bay",
    "industryContext": "osha_general_industry",
    "taskContext": "ordinary facility inspection",
    "equipmentInvolved": "electrical panel",
    "photosAvailable": true,
    "employeeExposureKnown": true,
    "expectedTerms": [
      "exposed",
      "live",
      "dead-front",
      "29 cfr 1910.303"
    ],
    "forbiddenTerms": [
      "closed panel"
    ],
    "shouldHaveMissingEvidence": true
  },
  {
    "id": "FIELD-V2-OSHA-ELECTRICAL-CORD-DAMAGED-001",
    "title": "temporary extension cord with split inner insulation exposing bare copper",
    "hazardObservation": "A temporary heavy-duty extension cord in use on the fabrication floor was severely damaged. The outer jacket was sliced and the inner conductor insulation was split, exposing bare copper copper wiring.",
    "siteType": "fabrication floor",
    "industryContext": "osha_general_industry",
    "taskContext": "welding setup",
    "equipmentInvolved": "extension cord",
    "photosAvailable": true,
    "employeeExposureKnown": true,
    "expectedTerms": [
      "conductor",
      "damaged cord",
      "insulation",
      "29 cfr 1910.305"
    ],
    "shouldHaveMissingEvidence": true
  },
  {
    "id": "FIELD-V2-OSHA-ELECTRICAL-TROUBLESHOOTING-001",
    "title": "energized voltage testing by qualified electrician with Category 4 PPE",
    "hazardObservation": "A qualified electrical technician was performing voltage testing on an open, energized motor control center. The technician was wearing certified Category 4 arc flash PPE and using insulated probes under a hot work permit.",
    "siteType": "electrical room",
    "industryContext": "osha_general_industry",
    "taskContext": "energized troubleshooting",
    "equipmentInvolved": "motor control center",
    "photosAvailable": true,
    "employeeExposureKnown": true,
    "expectedTerms": [
      "qualified",
      "testing",
      "permit",
      "29 cfr 1910.333"
    ],
    "forbiddenTerms": [
      "unprotected exposure"
    ],
    "shouldHaveMissingEvidence": false
  },
  {
    "id": "FIELD-V2-OSHA-ELECTRICAL-WET-EQUIPMENT-001",
    "title": "open disconnect switch exposed to active roof leak water",
    "hazardObservation": "Water from an active roof leak was dripping directly onto an open 240V disconnect switch box on the production floor. The cover was hanging loose, allowing moisture accumulation.",
    "siteType": "production floor",
    "industryContext": "osha_general_industry",
    "taskContext": "ordinary facility inspection",
    "equipmentInvolved": "disconnect switch",
    "photosAvailable": true,
    "employeeExposureKnown": true,
    "expectedTerms": [
      "wet",
      "dripping",
      "disconnect",
      "29 cfr 1910.303"
    ],
    "shouldHaveMissingEvidence": true
  },
  {
    "id": "FIELD-V2-OSHA-ELECTRICAL-FALSE-CLOSED-PANEL-001",
    "title": "closed panel door and no exposed parts nearby",
    "hazardObservation": "An electrical panel was located in the office hallway. The panel door was fully closed, latched, undamaged, and there were no exposed wires, sparks, heat, or moisture present.",
    "siteType": "office hallway",
    "industryContext": "osha_general_industry",
    "taskContext": "facility inspection",
    "equipmentInvolved": "electrical panel",
    "photosAvailable": true,
    "employeeExposureKnown": false,
    "expectedTerms": [
      "evidence",
      "confirm"
    ],
    "forbiddenTerms": [
      "exposed live parts",
      "29 cfr 1910.303(g)(2)(i)",
      "shock hazard"
    ],
    "shouldHaveMissingEvidence": true
  },
  {
    "id": "FIELD-V2-OSHA-ELECTRICAL-FALSE-BLOCKED-ACCESS-001",
    "title": "electrical panel access blocked but panel closed and intact",
    "hazardObservation": "Three plastic storage bins were stacked in front of an office electrical panel, blocking clear access. The panel outer door was closed, latched, and completely intact with no damaged parts or wiring.",
    "siteType": "office storage",
    "industryContext": "osha_general_industry",
    "taskContext": "housekeeping audit",
    "equipmentInvolved": "electrical panel",
    "photosAvailable": true,
    "employeeExposureKnown": false,
    "expectedTerms": [
      "working space",
      "clearance",
      "boxes"
    ],
    "forbiddenTerms": [
      "exposed live parts",
      "bare conductor"
    ],
    "shouldHaveMissingEvidence": true
  },
  {
    "id": "FIELD-V2-OSHA-ELECTRICAL-HOLD-WET-FLOOR-CLOSED-001",
    "title": "wet floor near closed panel requires evidence confirmation",
    "hazardObservation": "A small puddle of water was observed on the concrete floor about 4 feet away from a closed, undamaged electrical cabinet. The report does not document whether the moisture has entered the enclosure.",
    "siteType": "compressor room",
    "industryContext": "osha_general_industry",
    "taskContext": "facility audit",
    "equipmentInvolved": "electrical cabinet",
    "photosAvailable": true,
    "employeeExposureKnown": false,
    "expectedTerms": [
      "hold",
      "evidence",
      "confirm",
      "enclosure"
    ],
    "forbiddenTerms": [
      "unprotected shock exposure"
    ],
    "shouldHaveMissingEvidence": true
  },
  {
    "id": "FIELD-V2-OSHA-ELECTRICAL-FALSE-GENERIC-NEARBY-001",
    "title": "generic electrical panel nearby note must not overroute",
    "hazardObservation": "A generic note states 'there was an electrical panel nearby while we were sweeping the floor'. No damaged, open, blocked, or wet conditions are described.",
    "siteType": "shop floor",
    "industryContext": "osha_general_industry",
    "taskContext": "floor sweeping",
    "equipmentInvolved": "electrical panel",
    "photosAvailable": true,
    "employeeExposureKnown": false,
    "expectedTerms": [
      "evidence",
      "sweeping"
    ],
    "forbiddenTerms": [
      "29 cfr 1910.303(g)(2)(i)",
      "exposed live parts"
    ],
    "shouldHaveMissingEvidence": true
  }
```

---

## 7. Source-Governance and Defensibility Rules to Preserve
Our strict commitment to technical safety authority and legal compliance requires that we preserve the following boundaries during any future electrical patch:
1.  **Strictly Advisory-Only:** The engine must never issue a final directive or legal compliance assertion. All returned standard suggestions are strictly candidate recommendations for decision-support only.
2.  **Zero Violation Declarations:** The output text must **never** state *"You are violating OSHA rules"* or *"This is an MSHA violation."* We must use qualified, professional vocabulary: *"Advisory candidate standard suggested for professional review: 29 CFR 1910.303."*
3.  **No Citation Generation:** HazLenz AI does not act as an automated citation engine, legal penalty assessor, or inspector replacement.
4.  **No Assumed Energized Status:** If the energized state of a panel, conductor, or equipment is undocumented, the engine must **withhold a high-confidence alert** and place the finding in a `'hold_for_critical_evidence'` state, explicitly generating an evidence gap question asking for circuit testing or lock verification.
5.  **No Assumed Exposure on Closed Enclosures:** The system must never trigger "exposed live parts" mechanism paths (`shock_arc_flash`) on any closed or latched panel doors, regardless of proximity to walkways or water, unless enclosure breach or moisture ingress is explicitly documented.
6.  **Mandatory Qualified Review for Energized Tasks:** Any active troubleshooting, diagnostics, or voltage-testing scenarios must automatically trigger a recommended action of *"restrict access to Qualified Persons wearing NFPA 70E Category-aligned PPE"* and bypass automated closure workflows.

---

## 8. Local Validation Commands
After the future patch has been applied to the code, developers must run the following validation scripts locally to assert complete correctness and guarantee zero regressions:
```bash
# Execute the entire Phase 1 reliability validation gate (including Next.js and all 108+ realism checks)
bash scripts/validate-hazlenz-ai.sh

# Target the Regulatory Brain registry assertions specifically
cd backend && npx ts-node scripts/validate-safescope-regulatory-brain.ts

# Target the Evidence Brain registry assertions specifically
cd backend && npx ts-node scripts/validate-safescope-evidence-brain.ts

# Target the Controls Brain registry assertions specifically
cd backend && npx ts-node scripts/validate-safescope-controls-brain.ts

# Target the Mechanism Brain registry assertions specifically
cd backend && npx ts-node scripts/validate-safescope-mechanism-brain.ts

# Target the Field Realism Pack v2 test runner specifically (to verify all 108+ cases pass)
cd backend && npx ts-node scripts/validate-safescope-field-realism-pack-v2.ts
```
