#!/usr/bin/env bash
# ---------------------------------------------------------------------------------------------
# InSite v1.0 — production governed-cutover runbook: SHARED TARGET GUARD.
#
# Sourced by every step. It never prints, echoes, logs or stores DATABASE_URL.
#
# WHY THIS EXISTS. `backend/src/database/data-source.ts` resolves the connection as
# `process.env.DATABASE_URL || DB_*`, and every operator script begins with `import 'dotenv/config'`.
# dotenv does NOT override an already-exported variable, so an exported production URL wins — but
# if the export is missing, `backend/.env` supplies its own DATABASE_URL and the SAME COMMAND
# would silently mutate the LOCAL `safescope` development database instead. Measured, not assumed:
# with no export, the resolution probe below returns `safescope`.
#
# So the guard resolves the target through the identical mechanism the mutating commands use
# (dotenv, then DATABASE_URL) and refuses unless it is provably the production database at the
# expected schema level.
# ---------------------------------------------------------------------------------------------
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
BACKEND="$REPO_ROOT/backend"
EVIDENCE="$REPO_ROOT/verification/insite-v1-production-governed-cutover-2026-08-28"

RELEASE_ID="federal-core-2026-08-28.1"
EXPECTED_MANIFEST="680540d994cedb9384912cb7a3ccd28d798756bd787a84a530c8076ed3a668cb"
EXPECTED_MEMBERS=64
EXPECTED_DATABASE="neondb"
EXPECTED_LATEST_MIGRATION="InspectionKnowledgeReleaseBinding1800000018000"
REVIEWER_ID="insite-product-owner-authorized-regulatory-content-review"
REVIEWER_ROLE="regulatory-content-reviewer (non-attorney, non-agency)"

# The active-release pointer the operator BELIEVES they are replacing. `none` is the expected
# value for this cutover (production has never activated a governed release). If step 1 shows a
# different active pointer, STOP and re-read the authorization — do not simply override this.
EXPECTED_CURRENT="${EXPECTED_CURRENT:-none}"

# Runs an arbitrary read-only SQL statement through the SAME resolution the operator scripts use.
# Always inside `BEGIN READ ONLY`, so it is structurally incapable of writing.
psql_ro() {
  ( cd "$BACKEND" && DBQ="$1" node -e '
    require("dotenv").config({ quiet: true });
    const { Client } = require("pg");
    const url = process.env.DATABASE_URL;
    if (!url) { console.error("NO_DATABASE_URL_RESOLVED"); process.exit(1); }
    const c = new Client({
      connectionString: url,
      ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
    });
    (async () => {
      await c.connect();
      await c.query("BEGIN READ ONLY");
      const r = await c.query(process.env.DBQ);
      await c.query("ROLLBACK");
      await c.end();
      console.log(JSON.stringify(r.rows, null, 2));
    })().catch(e => { console.error("QUERY_ERROR:", e.message); process.exit(1); });
  ' )
}

require_production_target() {
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "STOP: DATABASE_URL is not exported in this shell." >&2
    echo "      Load it with:  read -rs DATABASE_URL ; export DATABASE_URL" >&2
    echo "      Without the export these commands resolve to the LOCAL development database." >&2
    return 1
  fi

  local proof
  proof="$( cd "$BACKEND" && node -e '
    require("dotenv").config({ quiet: true });
    const { Client } = require("pg");
    const url = process.env.DATABASE_URL;
    if (!url) { console.error("NO_DATABASE_URL_RESOLVED"); process.exit(1); }
    const c = new Client({
      connectionString: url,
      ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : false,
    });
    (async () => {
      await c.connect();
      await c.query("BEGIN READ ONLY");
      const db = (await c.query("SELECT current_database() AS db")).rows[0].db;
      const led = await c.query(
        `SELECT name, timestamp FROM migrations ORDER BY timestamp DESC LIMIT 1`);
      const total = (await c.query(`SELECT count(*)::int AS n FROM migrations`)).rows[0].n;
      const newer = (await c.query(
        `SELECT name FROM migrations WHERE timestamp > 1800000015000 ORDER BY timestamp`)).rows
        .map(r => r.name);
      const cols = (await c.query(
        `SELECT table_name, column_name FROM information_schema.columns
          WHERE (table_name = $1 AND column_name IN ($3,$4))
             OR (table_name = $2 AND column_name = $5)
          ORDER BY table_name, column_name`,
        ["inspection", "inspection_findings", "displayNumber", "knowledgeReleaseId", "source"]))
        .rows.map(r => `${r.table_name}.${r.column_name}`);
      await c.query("ROLLBACK");
      await c.end();
      console.log(JSON.stringify({
        database: db, latestMigration: led.rows[0] && led.rows[0].name,
        ledgerRows: total, migrationsNewerThan1800000015000: newer, schemaColumns: cols,
      }));
    })().catch(e => { console.error("PROBE_ERROR:", e.message); process.exit(1); });
  ' )" || { echo "STOP: could not resolve or read the target database." >&2; return 1; }

  echo "--- RESOLVED TARGET PROOF (read-only, credential never printed) ---"
  echo "$proof" | python3 -m json.tool

  python3 - "$proof" "$EXPECTED_DATABASE" "$EXPECTED_LATEST_MIGRATION" <<'PY' || return 1
import json, sys
p = json.loads(sys.argv[1]); want_db, want_mig = sys.argv[2], sys.argv[3]
fail = []
if p["database"] != want_db:
    fail.append(f"resolved database is {p['database']!r}, expected {want_db!r}")
if p["latestMigration"] != want_mig:
    fail.append(f"latest migration is {p['latestMigration']!r}, expected {want_mig!r}")
expected_newer = ["UserAuthoredFindingProvenance1800000016000",
                  "InspectionDisplayNumber1800000017000",
                  "InspectionKnowledgeReleaseBinding1800000018000"]
if p["migrationsNewerThan1800000015000"] != expected_newer:
    fail.append(f"migrations above 1800000015000 are {p['migrationsNewerThan1800000015000']}, "
                f"expected exactly {expected_newer}")
expected_cols = ["inspection.displayNumber", "inspection.knowledgeReleaseId",
                 "inspection_findings.source"]
if sorted(p["schemaColumns"]) != sorted(expected_cols):
    fail.append(f"schema columns are {sorted(p['schemaColumns'])}, expected {sorted(expected_cols)}")
if fail:
    print("\nSTOP — TARGET PROOF FAILED:", file=sys.stderr)
    for f in fail: print("  -", f, file=sys.stderr)
    print("\nNo mutation will be attempted. Resolve this before continuing.", file=sys.stderr)
    sys.exit(1)
print(f"\nTARGET PROOF OK — database={p['database']}, latest={p['latestMigration']}, "
      f"ledger rows observed={p['ledgerRows']} (observed, not asserted; the production ledger is "
      f"baselined so its row count is not the repository migration position).")
PY
}
