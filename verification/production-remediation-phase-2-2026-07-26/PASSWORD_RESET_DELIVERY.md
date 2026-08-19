# Password reset delivery

Added a provider boundary with development, test, and Resend production modes. Production startup requires provider, API key, sender and HTTPS reset frontend URL. URL construction fixes origin/path and discards attacker-controlled query/fragment data. Tokens remain hashed, expiring, newest-only and single-use; provider failure invalidates the token while the API remains enumeration-neutral.

Password changes now set `passwordChangedAt`; JWT validation loads the current user and rejects deleted users and tokens issued before the password change.

Frontend request and completion forms are connected and accessible. Automated provider tests passed without external email. A real provider account/key was unavailable, so target-environment delivery was not sent or observed; this remains a pilot blocker.
