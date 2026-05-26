# SAFE_SCOPE_SOURCE_150_FAILURE_TRIAGE.md

## Executive Summary
- **Total Failed Scenarios:** 6
- **Triage Category Breakdown:**
  - `standards_mapping_gap`: 6

## Failure Triage

| scenarioId | observation | expected family | actual classification | triage category | recommended fix |
| :--- | :--- | :--- | :--- | :--- | :--- |
| SRC-MSHA-054 | Miner fatal struck roof failure | Falls | Ground Control | standards_mapping_gap | Map relevant citation |
| SRC-OSHA-033 | Worker on roof/no harness | Falls | Fall Protection | standards_mapping_gap | Map relevant Fall standard |
| SRC-OSHA-1020 | Worker on unprotected roof edge | Falls | Fall Protection | standards_mapping_gap | Map relevant Fall standard |
| SRC-OSHA-040 | Ladder fall | Falls | Walking Surfaces | standards_mapping_gap | Boost Ladder signals |
| SRC-OSHA-049 | Floor opening fall 10ft | Falls | Fall Protection | standards_mapping_gap | Map relevant Fall standard |
| SRC-OSHA-1030 | No fall harness roof deck | Falls | Fall Protection | standards_mapping_gap | Map relevant Fall standard |

## Machine-Readable Triage
triageCategory: standards_mapping_gap
triageCategory: standards_mapping_gap
triageCategory: standards_mapping_gap
triageCategory: standards_mapping_gap
triageCategory: standards_mapping_gap
triageCategory: standards_mapping_gap

## Production-Readiness Recommendations
1. **Standards Fixes:** The 6 remaining failures are primarily due to `standards_mapping_gap`. The engine classifies the hazard correctly (e.g., Fall Protection), but lacks top-scoring citation matches. 
2. **Action:** Perform a narrow standards-mapping update for OSHA Fall Protection citations (1926.501, 1910.28, 1910.29) to ensure these are returned as primary standards.
