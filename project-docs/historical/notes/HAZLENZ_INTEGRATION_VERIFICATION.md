# HazLenz AI - Integration & Reliability Verification Guide

This guide documents the setup, execution, and verification steps to ensure the HazLenz AI backend service and frontend inspection workflow are integrated and operating reliably.

---

## 1. Start the Database
Ensure PostgreSQL is running locally on port 5432 and contains the `safescope` database.

```bash
# Check if PostgreSQL is accepting connections
pg_isready -h 127.0.0.1 -p 5432
```

## 2. Start the Backend with DATABASE_URL
Start the NestJS backend dev server, passing the `DATABASE_URL` environment variable explicitly. This verifies the connection string parsing works correctly.

```bash
cd backend
DATABASE_URL="postgresql://user:password@127.0.0.1:5432/safescope" npm run dev
```

The backend starts on port 4000 by default.

## 3. Verify the Classify Endpoint with curl
To check that the AI engine classification, risk ratings, suggested regulations, and evidence gaps are returned correctly, make a test POST request to the `/safescope-v2/classify` endpoint.

Because `DEV_AUTH_BYPASS=true` is enabled in development mode, you can pass any string in the `Authorization` header to bypass JWT signature verification.

```bash
curl -X POST http://localhost:4000/safescope-v2/classify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{
    "text": "At an aggregate mine, the tail pulley on a conveyor is missing guarding and miners walk near the pinch point during cleanup.",
    "scopes": ["msha"]
  }'
```

### Expected Output Structure
Confirm the response has:
1. `classification`: `"Machine Guarding"` (or similar).
2. `risk`: containing a non-null `riskBand` (e.g. `"Critical"`).
3. `suggestedStandards`: containing `"30 CFR 56.14107"` near the top.
4. `evidenceGaps` and `reasoningSummary` showing contextual hazard parameters.

---

## 4. Start the Frontend
Start the Next.js development server.

```bash
cd frontend-next
npm run dev
```

The frontend runs on `http://localhost:3000` (or `3001` if port 3000 is occupied).

---

## 5. Verify the Frontend Inspection Flow
1. Open the browser and go to `http://localhost:3000/inspection`.
2. Enter an observation description (e.g., `"At an aggregate mine, the tail pulley on a conveyor is missing guarding and miners walk near the pinch point during cleanup."`).
3. Select MSHA or OSHA regulatory scope.
4. Click **Run HazLenz AI** (or trigger the review).
5. Verify:
   * Real backend suggestions are displayed in the finding builder card (e.g. `30 CFR 56.14107` and `Machine Guarding`).
   * "Evidence needed" details appear.
   * If the backend is stopped, a clear degraded notice is displayed:
     > "HazLenz AI intelligence is unavailable. Continue documenting the finding and review before relying on automated guidance."
   * Saving findings is not blocked when HazLenz AI is offline or returns an error.

---

## 6. Run Builds
To verify full compile-time safety and type safety before releasing:

```bash
# Compile NestJS Backend
cd backend
npm run build:render

# Compile Next.js Frontend
cd frontend-next
npm run build
```
