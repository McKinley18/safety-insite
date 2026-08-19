# HazLenz Failure Analysis

The independent corpus contains 165 cases and is evaluated through `POST /safescope-v2/classify`.

The initial run produced 103 PASS, 25 NEEDS REVIEW, and 37 FAIL. A structured API evidence boundary reduced unsupported definitive promotions, preserved uncertainty, demoted candidates for contradictory/incomplete/controlled evidence, and recalibrated controlled-state risk without changing the five protected reasoning files.

The first post-remediation run produced 125 PASS, 26 NEEDS REVIEW, and 14 FAIL. A final full rerun after adding general explicit-no-exposure negation handling produced **126 PASS, 26 NEEDS REVIEW, and 13 FAIL**. It retained eight life-safety standard misses, five unsupported definitive promotions, and six safe-state suppression failures. Clarification behavior was acceptable in 62/62 cases where it was expected.

Root causes still visible:

- incomplete regulatory-family recall for life-critical cases;
- keyword sensitivity where negated/hypothetical wording reaches upstream classification;
- evidence predicates and citation promotion remain distributed across competing pipeline components;
- confidence and risk output are not calibrated against a validated field distribution.

HazLenz therefore remains advisory and is not approved for unsupervised use.
