# Render Production Diagnostics & Verification Guide

This guide describes how to verify the active backend deployment version and troubleshoot discrepancies in regulatory standard ranking between local and production environments using the built-in diagnostic tools.

## What Problem This Solves

When testing or releasing new HazLenz improvements, container rebuild issues, build caching, or incorrect environment variables on Render can result in the production container executing outdated code or using stale database schema/records.

To resolve this ambiguity:
1. We have added deployment and version checks to the backend health endpoint.
2. We have added a production-safe diagnostic mode (`debugMetadata: true`) to the classification endpoint.
3. We have provided a remote verification script to run the classification suite against any server.

---

## Confirming Render Deployment Version

You can verify the deployment metadata (commit SHA, build timestamp, environment, version source) using either of two endpoints:

### 1. Extended Health Check (`GET /health`)
Returns a non-breaking version object:
```json
{
  "status": "ok",
  "database": "up",
  "timestamp": "2026-06-19T20:42:00Z",
  "version": {
    "appName": "safety-insite-backend",
    "gitCommit": "ae5c586",
    "buildTimestamp": "2026-06-19T20:42:00Z",
    "nodeEnv": "production",
    "versionSourceStatus": "RENDER_GIT_COMMIT"
  }
}
```

### 2. Standalone Version Endpoint (`GET /health/version`)
Returns the version metadata directly:
```json
{
  "appName": "safety-insite-backend",
  "gitCommit": "ae5c586",
  "buildTimestamp": "2026-06-19T20:42:00Z",
  "nodeEnv": "production",
  "versionSourceStatus": "RENDER_GIT_COMMIT"
}
```

If `gitCommit` matches the latest commit on your target branch, Render is running the correct build.

---

## Running Remote Diagnostic Tests

The diagnostic script (`check-production-hazlenz-diagnostics.ts`) authenticates and issues query calls for the key HazLenz verification cases, outputting standard scores and debugging telemetry.

### Running locally (against local dev server)
```bash
cd backend
npm run diagnose:production
```

### Running against production
Set `TARGET_HOST` and your authentication token or credentials:

Using a direct JWT token:
```bash
TARGET_HOST=https://safety-insite-backend.onrender.com DIAGNOSTIC_JWT_TOKEN=your_jwt_here npm run diagnose:production
```

Using login credentials (which will obtain a token automatically):
```bash
TARGET_HOST=https://safety-insite-backend.onrender.com DIAGNOSTIC_USER_EMAIL=user@example.com DIAGNOSTIC_USER_PASSWORD=password123 npm run diagnose:production
```

---

## What Passing Output Looks Like

For a healthy and correct backend instance, the script output for the conveyor guarding scenario should look like this:

```
Running scenario: MSHA Conveyor Guarding
Narrative: "At an aggregate mine, the tail pulley on a conveyor is missing guarding and miners walk near the pinch point during cleanup."
Scopes: ["msha"]
----------------------------------------------------------------
HTTP Status: 200
Classification: Machine Guarding
Risk Level: HIGH
Route Shard Key: msha/conveyors/conveyor/guarding
Focused Shard Citations: ["30 CFR 56.14107"]

Top 5 Suggested Standards:
  [#1] 30 CFR 56.14107(a) (Score: 290)
      Reasons: warm-shard: focused citation match, scenario: unguarded conveyor pulley / exposed nip point
  [#2] 30 CFR 56.14109 (Score: 31)
      Reasons: title: conveyor
  ...

Diagnostics Fields (debugMetadata):
{
  "standardsLookupMode": "compact_route_scoped",
  "usedFocusedShardCitations": true,
  "focusedShardCitations": [
    "30 CFR 56.14107"
  ],
  "standardsCandidatesQueried": 26,
  "standardsReturned": 5,
  "knowledgeChunksQueried": 3,
  "selectedColumnsMode": "compact",
  "fallbackUsed": false,
  "activeJurisdiction": "msha",
  "routeShardKey": "msha/conveyors/conveyor/guarding",
  "routeSourceKeys": [],
  "routeBundleIds": []
}
```

---

## Troubleshooting Discrepancies

If production returns different standard suggestions or rankings than local tests, check the following debug fields in the script output:

### 1. Stale Deployment (Code mismatch)
* **Check**: The `gitCommit` returned by `/health/version`.
* **Fix**: If it is older than `ae5c586`, triggering a fresh build on Render is required. Ensure that you trigger the deploy with cleared build cache.

### 2. Code-Path Mismatch
* **Check**: The `standardsLookupMode` and `selectedColumnsMode` in the `debugMetadata` output.
* **Expected**: `standardsLookupMode` should be `"compact_route_scoped"` and `selectedColumnsMode` should be `"compact"`.
* **Issue**: If these fields are missing or indicate a different mode, the request did not run the updated service code path, indicating that traffic is routed to a stale version or service file.

### 3. Database / Data Mismatch
* **Check**: The `standardsCandidatesQueried` count.
* **Issue**: If `standardsCandidatesQueried` is `0`, or `focusedShardCitations` is correct but the score for `30 CFR 56.14107(a)` is low or missing entirely.
* **Cause**: This means the `standards_master` table in the production database does not contain the standard row for `30 CFR 56.14107(a)` or has incorrect columns, preventing the on-demand database-side queries from finding a match. Run the db migration/seeding script on the production database.
