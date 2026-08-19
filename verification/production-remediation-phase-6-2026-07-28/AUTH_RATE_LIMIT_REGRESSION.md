# Authentication and Rate-Limit Regression

The harness now treats authentication rejection and throttling as different expected controls.

Fresh isolated execution passed:

- Five malformed/invalid authentication attempts returned 401.
- Subsequent attempts returned 429.
- Changing `X-Forwarded-For`, `X-Real-IP`, and `User-Agent` did not trivially bypass the limit.
- Responses did not expose credentials, token material, stack traces, or account existence.

Independent authentication/password-reset execution passed registration, duplicate registration, login, reset completion, expired/invalid/reused token behavior, old-password rejection, and new-password acceptance.

Several broad sequential runs initially hit 429 because test processes shared one rate-limit state. They were rerun against freshly started isolated backend instances. Production rate limits were not weakened.

