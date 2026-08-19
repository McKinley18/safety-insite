# Performance Results

- Authentic HazLenz corpus first post-fix run: p50 104 ms, p95 123 ms on local hardware.
- Frontend production compilation: 1.4 seconds in the verified build.
- Backend startup RSS: approximately 268–270 MB; heap used approximately 120–127 MB.
- No sustained load, memory-soak, high-cardinality standards benchmark, or hosted cold-start test was completed.

Performance is acceptable for local internal testing but not sufficiently characterized for public production capacity planning.
