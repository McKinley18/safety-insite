# 409 root cause and fix

The unexpected workflow conflict was client-side version drift. After a successful observation PATCH, the workspace retained a locally copied observation/inspection object while the subsequent reanalysis path derived request/version state from that stale copy. A later revision could therefore submit an older version even though the server had already accepted the prior mutation.

The server's optimistic concurrency check was correct and was not weakened. The workspace now refreshes the persisted inspection after a successful revision and replaces local observation text/version with the authoritative response. Reanalysis first fetches the current persisted observation and current analysis request version, refuses to proceed when persisted text differs from the user's text, and retries a request-version conflict only after synchronization proves the content is unchanged. This prevents internal drift while preserving genuine stale-write rejection.
