# Finalization governance

Backend transition now queries active findings, requires a current review for each, requires finalized/dismissed status, and rejects incomplete finding review with a clear 400. Fresh API regression finalized two independently reviewed findings. Stale review status is rejected with conflict before finding mutation. Complete browser proof with one finding intentionally unreviewed remains open.
