# HazLenz experiment log

## Iteration 1 — accepted

Hypothesis: independently evidenced secondary hazards were being computed by the decomposition engine but omitted from the canonical response consumed by downstream scoring and persistence. Promote decomposition hazards into `additionalHazards` using stable family keys, evidence fragments, confidence, evidence gaps, and review flags. Tighten chemical release predicates so an unknown release status is not an active release.

Result: recall increased from 0.7933 reproduced baseline to 0.8600; transport failures 0; life-critical misses 0; clarification recall 1.0; safe-state rate unchanged at 0.05. The iteration was retained and followed by a safe-state correction.

## Iteration 2 — accepted

Hypothesis: the compatibility adapter was reintroducing UNKNOWN regulatory candidates into controlled-condition outputs. Suppress applicability decisions when the condition assessment is explicitly controlled/verified-safe, while preserving review questions and advisory limitations.

Result: final recall 1.0; safe-state unsupported rate 0.0; life-critical misses 0; transport failures 0; metamorphic consistency 0.925. No expected-family regression was observed.

Both changes are general evidence-bound corrections; neither references evaluator IDs or answer files.
# 2026-08-07 precision iteration

Accepted the condition-state boundary correction after reproducing a controlled fall-protection case that leaked an active guided candidate. The general fix required verified-control evidence in the decomposition fragment, not a scenario identifier. A compatibility-family experiment was rejected because it reduced frozen recall and increased safe-state false positives.

Third iteration: exact eight frozen forbidden rows traced to a generic classifier fallback on context-free wording. The accepted fix requires explicit missing-context plus no concrete hazard anchor before allowing a specific family. Temporal metadata and structured historical output were then added; frozen recall stayed 100%, non-safe forbidden rows became 0, and metamorphic consistency stayed 92.5%.
