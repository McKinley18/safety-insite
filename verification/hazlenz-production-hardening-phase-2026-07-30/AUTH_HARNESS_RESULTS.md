# Authentication harness results

The legacy auth harness no longer requires a raw reset token in the neutral API response. It now verifies identical known/unknown response shapes and messages. Reset completion remains covered by the isolated delivery/reset suite.

The clarification gauntlet accepts `HAZLENZ_AUTH_TOKEN` and no longer assumes an unauthenticated production endpoint.

Results:

- auth flow: PASS after isolated rate-limit reset
- password-reset production fail-closed/dev/test/provider failure: PASS
- browser registration/login/logout protection: PASS
- canonical cross-user denial: PASS

Rate limiting was preserved; restarting the disposable backend isolated suite state.

