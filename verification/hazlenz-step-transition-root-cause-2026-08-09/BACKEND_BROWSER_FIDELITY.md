# Backend/browser fidelity

All 20 scenarios received HTTP 201 from the real `/safescope-v2/classify` endpoint and rendered the returned analysis in the browser. The page displayed structured hazard category, confidence, evidence-used/follow-up content, standards review, and finding-builder state. No generic placeholder replaced the returned analysis and no cross-observation association was observed. One expected 404 for the optional offline brain bundle occurred in the first scenario; it did not affect online analysis and is recorded in the machine results.
