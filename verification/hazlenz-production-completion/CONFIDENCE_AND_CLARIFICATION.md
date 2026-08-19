# Confidence and clarification

The authenticated harnesses now register a real disposable user and may grant a two-hour test entitlement only when `NODE_ENV=test`, the host is localhost, and the database name begins with an isolated-test prefix. This replaces unauthenticated failures without adding a production bypass.

Result: authentication worked, but the clarification gauntlet failed a real guarding promotion assertion. This remains a release blocker.

