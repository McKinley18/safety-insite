# SafeScope End-to-End System Audit and Repair Plan

This audit report delivers a comprehensive, structured breakdown of the **SafeScope** engine's capabilities, database status, production/local behaviors, and identifies the exact root cause of the client-side `Failed to fetch` error triggered by the app button.

---

## 1. Executive Summary & Root-Cause Conclusion

### Why the App Button Fails but the Manual Browser Fetch Succeeds
The manual console fetch succeeds with HTTP 201 because it uses a highly simplified, raw payload. In contrast, the **Run SafeScope Review** app button fails with `SafeScope live request failed: Failed to fetch` due to two primary causes:

#### 1. CORS Masking of Hidden NestJS/Render Gateway Errors
*   **The Cause:** The app button compiles a highly nested payload containing a `priorFindings` array. If any part of this payload violates the strict `ClassifyDto` validation constraints, or if the Bearer token in the `Authorization` header has a parsing discrepancy in the `JwtGuard`, NestJS throws a `BadRequestException` (400) or `UnauthorizedException` (401).
*   **The Mask:** In some production environments, when NestJS global exception filters or the Render reverse proxy intercepts a 400 or 401 error early in the lifecycle, it sends an error response (or error gateway page) that **does not carry the CORS headers**.
*   **The Result:** The browser sees a response lacking `Access-Control-Allow-Origin` and immediately blocks the response, presenting it in the console as a **CORS Block (`ERR_FAILED`)** and raising a client-side `Failed to fetch` exception, which completely hides the actual HTTP error code.

#### 2. Telemetry and Tracing Headers Preflight Rejection
*   **The Cause:** Outgoing fetch calls triggered via the Next.js bundle on Vercel are automatically wrapped by telemetry integrations (like Sentry or OpenTelemetry) if active. These libraries inject custom tracing headers (e.g., `sentry-trace`, `baggage`) into the request.
*   **Why Manual Fetch Works:** Manual console fetches bypass Next.js bundle wrappers and do not receive telemetry headers.
*   **The Preflight Failure:** The backend CORS configuration previously hardcoded `allowedHeaders: ['Content-Type', 'Authorization']`. Preflight requests containing tracing headers were rejected, resulting in a CORS block on the preflight check. While CORS options were recently patched to remove this hardcoding, the middleware execution order in `backend/src/main.ts` still registers `helmet()` *before* CORS, which can preempt CORS preflight checks or header propagation during early validation/guard throws.

---

## 2. SafeScope Capability Verification

We have audited the backend intelligence pipeline to verify if SafeScope is a true decision-support engine or a demo fallback:

### 1. Classification Engine
*   **Mechanism:** SafeScope uses `WeightedClassifierService` (a deterministic, regex-weighted vocabulary scoring matrix) combined with `SafeScopeIntelligenceOrchestrator` to classify observed hazard narratives (e.g. mapping keywords like *conveyor, pulley, guard* to `Machine Guarding`).
*   **Source:** Located in `backend/src/safescope-v2/classifier/weighted-classifier.service.ts` and `backend/src/safescope-v2/orchestration/intelligence-orchestrator.service.ts`.

### 2. Regulatory Standards Matching
*   **Mechanism:** SafeScope matches standards using **two parallel layers**:
    1.  **Curated Fallback:** Mapped via `StandardsBridgeService` from `STANDARDS_MAPPING` inside `backend/src/safescope-v2/standards-mapping.seed.ts`.
    2.  **Database-backed CFR Search:** Mapped via `ApplicableStandardsService` by running direct database queries on `standards_master` and `safescope_knowledge_chunks` tables using `ILike` wildcard search terms.
*   **30 CFR 56.14107(a) Status:** It is fully database-backed and curated. It is seeded in the `standards_master` table (via `safescope-standards.seed.ts`) and is explicitly mapped under `"Machine Guarding"` in `STANDARDS_MAPPING` for curated fallback.

### 3. Deterministic Risk Assessment
*   **Mechanism:** Risk is assessed using `evaluateRisk` inside `backend/src/safescope-v2/risk/risk-engine.ts`. Wording triggers like *missing, unguarded, live* scale the severity/likelihood scores according to the selected `simple_4x4`, `standard_5x5`, or `advanced_6x6` profile. It is fully profile-based and deterministic.

### 4. Local/Offline Brain Bundle Requirements
*   **Harmless 404:** The 404 error on `/offline/safescope-brain-bundle.json` is **completely harmless** in online mode. The frontend catches any bundle download error and safely falls back to standard online API classification. Offline search `searchOfflineKnowledgeBrain` is only called if `navigator.onLine` is false or the server is completely down.

### 5. Production Database Knowledge Table Status
*   **Table Status:** The production database has the `standards_master` table, but its `safescope_knowledge_chunks` and `safescope_knowledge_documents` tables may be empty or unmigrated. This is why production queries return matches: `[]` after CFR filtering, forcing SafeScope to rely entirely on the curated `STANDARDS_MAPPING` fallback.

---

## 3. Local Database Verification Commands

Execute the following commands from `/Users/mckinley/Sentinel_Safety/backend` to verify the local database structure and contents using the active credentials from your `.env`:

### 1. Count Standards Rows in `standards_master`
```bash
psql -h localhost -U mckinley -d sentinel_safety -c "SELECT COUNT(*) FROM standards_master;"
```

### 2. Query MSHA Moving Machine Parts Standard `30 CFR 56.14107(a)`
```bash
psql -h localhost -U mckinley -d sentinel_safety -c "SELECT citation, title, plain_language_summary, scope_code FROM standards_master WHERE citation = '30 CFR 56.14107(a)';"
```

### 3. Query All Seeded MSHA Machine Guarding Standards
```bash
psql -h localhost -U mckinley -d sentinel_safety -c "SELECT citation, title, plain_language_summary FROM standards_master WHERE agency_code = 'MSHA' AND keywords::text LIKE '%guard%';"
```

### 4. List All Available Tables In Local DB
```bash
psql -h localhost -U mckinley -d sentinel_safety -c "\dt"
```

---

## 4. Production Backend Verification Commands

Use these exact terminal commands to verify the deployed production backend at `https://safescope-backend.onrender.com`:

### 1. Log In and Capture JWT Auth Token
```bash
TOKEN=<redacted-example-token-command-removed> # original curl command redacted -s -X POST https://safescope-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "<test-email-redacted>", "password": "<test-password-redacted>"}' | grep -o '"accessToken":"[^"]*' | grep -o '[^"]*$')
echo "Token: <redacted>"
```

### 2. Verify CORS Preflight OPTIONS Request with App Telemetry Headers
```bash
curl -i -X OPTIONS https://safescope-backend.onrender.com/safescope-v2/classify \
  -H "Origin: https://sentinelsafety.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization,sentry-trace,baggage"
```

### 3. Verify Classify MSHA Machine Guarding Payload
```bash
curl -i -X POST https://safescope-backend.onrender.com/safescope-v2/classify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "text": "Missing machine guard on conveyor drive pulley at crusher deck. Exposed rotating parts are accessible to miners during operation.",
    "scopes": ["msha"],
    "riskProfileId": "standard_5x5",
    "evidenceTexts": ["Photo shows unguarded conveyor drive pulley"],
    "priorFindings": []
  }'
```

### 4. Verify Classify OSHA Fall Hazard Payload
```bash
curl -i -X POST https://safescope-backend.onrender.com/safescope-v2/classify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "text": "Scaffold platform missing guardrails and fall protection at east building facade. Worker exposed to 15-foot fall hazard.",
    "scopes": ["osha_construction"],
    "riskProfileId": "standard_5x5",
    "evidenceTexts": ["Scaffold lack handrails"],
    "priorFindings": []
  }'
```

### 5. Verify Classify MSHA Electrical Hazard Payload
```bash
curl -i -X POST https://safescope-backend.onrender.com/safescope-v2/classify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "text": "Damaged electrical wire insulation on crusher water pump motor. Exposed live conductor creates shock and electrocution hazard.",
    "scopes": ["msha"],
    "riskProfileId": "standard_5x5",
    "evidenceTexts": ["Frayed extension cord near pump"],
    "priorFindings": []
  }'
```

---

## 5. Exact Browser DevTools Troubleshooting Checks

When the app button is clicked and fails with CORS in the browser, check these precise points in the Chrome DevTools:

1.  **Open Developer Tools (F12)** -> Navigate to the **Network Tab**.
2.  **Locate the failed `POST` request** to `/safescope-v2/classify`.
3.  **Check the Status Code:**
    *   If it is a `400 Bad Request` or `401 Unauthorized` response, click the **Response Tab**. You will see the exact JSON error body returned by NestJS (e.g. `"message": "Invalid token"` or validation error message).
4.  **Verify Request Headers:**
    *   Confirm the presence of `Authorization: Bearer <token>` in the Request Headers.
    *   Check if custom headers like `sentry-trace` or `baggage` are present.
5.  **Compare Payload:**
    *   Click the **Payload Tab** (or Request tab in older browsers). Compare it to the working manual console fetch. Verify if any properties are `null` or `undefined` (especially inside `priorFindings`).

---

## 6. Minimal Code Repair Plan

To stabilize SafeScope locally and in production and resolve the early throw/CORS masking issue, we recommend the following minimal changes:

### 1. Fix Backend CORS and Helmet Middleware Registration Order
Ensure CORS headers are appended first, and allow dynamic headers reflection to resolve preflight rejections of tracking headers.

*   **File:** [backend/src/main.ts](file:///Users/mckinley/Sentinel_Safety/backend/src/main.ts)
*   **Minimal Patch:**
    ```typescript
    // Move app.enableCors() BEFORE app.use(helmet())
    app.enableCors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        if (origin.endsWith('.vercel.app') && origin.includes('sentinelsafety')) {
          callback(null, true);
          return;
        }
        callback(new Error(`CORS blocked origin: ${origin}`), false);
      },
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      // Remove hardcoded allowedHeaders to dynamically reflect Access-Control-Request-Headers
      credentials: true,
      optionsSuccessStatus: 204,
    });

    app.use(helmet());
    ```

### 2. Fix Local Database Schema Column Mismatch
The local database `standards_master` table lacks the `source_key`, `source_name`, `source_type`, `authority_tier`, `allowed_use`, `requires_approval`, and `approved_for_auto_ingestion` columns, causing the seeding script to fail.

*   **The Cause:** TypeORM synchronization is turned off locally (`TYPEORM_SYNCHRONIZE=false` in `.env`).
*   **The Fix:**
    1. Temporarily toggle `TYPEORM_SYNCHRONIZE=true` in `backend/.env` and boot the NestJS application once via `npm run dev` to automatically synchronize all missing tables and columns.
    2. Reset `TYPEORM_SYNCHRONIZE=false` in `.env`.
    3. Run the standards seeding script:
       ```bash
       npm run seed:safescope-standards
       ```

### 3. Seeding MSHA Knowledge Documents Locally
*   **The Cause:** The local `safescope_knowledge_chunks` and `safescope_knowledge_documents` tables do not exist because the knowledge seeding script has not been run.
*   **The Fix:** Run the knowledge seeding script to populate the MSHA and OSHA knowledge brain:
    ```bash
    npm run seed:safescope-knowledge
    ```
    This script automatically runs with `synchronize: true` in development mode, ensuring the tables are created and populated with core hazard reference narratives.
