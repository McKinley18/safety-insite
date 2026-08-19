# Chromium results

The dedicated UI run used real authenticated Chromium at `/inspection-workspace`.

- Revision control visible: PASS.
- Existing observation displayed: PASS.
- Revision saved through PATCH: HTTP 200.
- Persisted observation version advanced from 1 to 2: PASS.
- Reanalysis control visible: PASS.
- Classify request: HTTP 201.
- Analysis snapshot request: HTTP 201.
- Current findings refreshed from server: PASS.
- Hydration/runtime errors: none observed.

The same UI scenario was repeated a second time with an equivalent controlled observation. The electrical finding ID remained stable and the machine-guarding finding remained superseded.

The final preserved three-case rerun is not all green: the removal case's repeated analysis returned HTTP 409 (stale request state), while the addition and material-change cases did not complete the update/reanalysis sequence in that run. This is why the phase verdict remains NOT_READY despite the single-case end-to-end proof.
