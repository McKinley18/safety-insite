# SafeScope Failure-Mode Calibration Map v1

This document maps the deliberate adversarial and edge-case scenarios used to calibrate SafeScope's reasoning engine.

## Calibration Categories

### A. Vague Observation
- **Goal:** Prevent overconfidence and hallucinated citations.
- **Behavior:** Downgrade confidence, flag as "Review Required", and generate clarifying supervisor questions.

### B. Keyword Trap / False Positive
- **Goal:** Ensure semantic understanding over simple substring matching.
- **Behavior:** Correct routing based on intent (e.g., "guardrail stored" is fall protection equipment management, not machine guarding).

### C. Conflicting Facts
- **Goal:** Surface evidence contradictions between narrative and visual metadata.
- **Behavior:** Confidence penalty, mandatory human review gate, and specific "conflict detected" flag.

### D. Jurisdiction Ambiguity
- **Goal:** Avoid authoritative regulatory declarations when the site type or jurisdiction is unclear.
- **Behavior:** Maintain advisory boundary, provide multi-jurisdiction hints, and require expert confirmation.

### E. Multi-Hazard Decomposition
- **Goal:** Correctively separate distinct hazards in a single narrative.
- **Behavior:** Identify multiple primary domains and generate hazard-specific corrective actions.

### F. Weak Corrective Action Trap
- **Goal:** Prevent SafeScope from accepting or generating insufficient administrative controls for high-energy hazards.
- **Behavior:** Penalize "retrain only" responses and insist on engineering/isolation controls.

### G. Health Exposure Ambiguity
- **Goal:** Prevent over-diagnosis of chronic health risks without measurement data.
- **Behavior:** Flag as "industrial hygiene review required", identify sampling evidence gaps.

## Anti-Regurgitation Principles
SafeScope is calibrated to avoid:
1.  **Scenario Memorization:** Using energy-based mechanics to reason about unseen text.
2.  **Generic Fallbacks:** Blocking "be careful" or "retrain" as primary solutions.
3.  **Keyword Bias:** Routing based on total narrative context, not single-word triggers.
