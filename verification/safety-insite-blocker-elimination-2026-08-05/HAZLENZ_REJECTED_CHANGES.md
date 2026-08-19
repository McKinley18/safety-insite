# Rejected experiments

No broad keyword-only promotion or scenario-specific patch was retained. A generalized family-presence fallback that would emit every taxonomy candidate was rejected because it increased unsupported hazard families and would violate the evidence boundary. The final implementation requires positive condition evidence, records review gaps, and preserves controlled-state suppression.
# Rejected experiment

Changing the compatibility adapter to select the classifier family rather than the canonical response family was reverted: it caused scaffold and controlled-state regressions (frozen recall fell to 93.33% and safe-state unsupported rows increased). The production adapter now preserves the canonical family while using explicit condition-state normalization.
