# Answer-leakage review

Ground truth is in verification-only JSON and is not imported by backend production modules. Opaque IDs contain no answer labels. Production source search found no imports of `HAZLENZ_GROUND_TRUTH.json`, corpus manifests, or evaluator scripts. No scenario-ID conditionals or answer-specific production branches were added. The only production changes are generic verified-control and hazardous-energy evidence rules.

The ground-truth safe-state flag was corrected after an evaluator categorization mistake that treated insufficient-context rows as safe; this changed only the verification answer file, not corpus text or production prompts, and is recorded in `GROUND_TRUTH_CORRECTION.log`.
