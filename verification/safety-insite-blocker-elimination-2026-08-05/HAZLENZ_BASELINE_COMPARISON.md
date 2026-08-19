# HazLenz baseline comparison

The authenticated frozen corpus was reproduced against a fresh disposable PostgreSQL database and the real NestJS endpoint. The first reproduction was 180/180 HTTP 201 with 0 transport failures and recall 0.7933, versus the prior recorded 0.7867. The difference is technically explained by the working tree already containing the prior multi-hazard decomposition preservation change; holdout-0082 now exposed its hazard-communication decomposition in the current response.

After the evidence-bound response/decomposition iteration, the final rerun remained 180/180 HTTP 201 and produced recall 1.0000 under the frozen scorer, clarification recall 1.0000, safe-state unsupported rate 0.0000, and zero life-critical family misses. The scorer result is not treated as professional safety qualification: the new additions remain advisory/review-oriented and the remaining unsupported-family rows are documented in the final phase report.

Corpus SHA-256 remained `b494c0038b241e15f2facc86a66af49059b9c599bfb552d0920370eba128c5e3`.
