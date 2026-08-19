# Finding/review linkage

The disposable database contains 9 current findings and 9 current reviews. Each review row has the corresponding observation ID, finding ID, analysis ID, reviewer, decision, and current status. No sibling review ID was reused. The first scenario, for example, persisted `machine-guarding`, `conveyors`, and `electrical` with separate finding IDs and separate review IDs, all linked to analysis `6618454a-fd92-4a01-b4d9-60b85a8d3c9a`.

Database invariant query: each of the three inspections had `findings=3` and `reviewed=3`; all active findings had `finalReviewId`.
