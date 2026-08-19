# Entitlement fixture root cause

The evaluator granted the disposable entitlement after the first login but continued using the pre-grant JWT. That token carried the free plan snapshot, and the authorization guard could deny requests before the database grant was reflected in the authenticated context. The fixture now refreshes the token through `/auth/login` after the grant is committed. This changes test setup only; production entitlement enforcement is unchanged.

The fixture remains isolated by requiring `NODE_ENV=test`, localhost database host, and a disposable database name. It rejects production databases and does not inspect email patterns or use bypass headers.

