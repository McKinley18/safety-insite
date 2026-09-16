/**
 * §305 (SE-12) — THE NORMALIZED SCHEMA EXTRACTOR, AND THE ONE DEFINITION OF "MATERIAL DRIFT".
 *
 * ===============================================================================================
 * WHY THIS LIVES IN src/ RATHER THAN IN A SCRIPT.
 *
 * Four different things need to mean EXACTLY the same thing by "the schema":
 *
 *   1. the canonical manifest committed to the repository,
 *   2. the fresh-migration replay proof,
 *   3. the restored-production upgrade proof,
 *   4. the durable drift gate that runs on every precommit.
 *
 * If any of those extracted or normalized differently, a drift gate would be comparing two
 * descriptions rather than two schemas, and would go green on a real difference or red on a
 * cosmetic one. SE-12 exists precisely because nobody could tell those two cases apart, so the
 * extractor is a single shared module and every consumer calls it.
 *
 * ===============================================================================================
 * WHAT IS MATERIAL, AND WHAT IS DELIBERATELY NOT.
 *
 * MATERIAL: table presence; column presence; the column's TYPE as the planner sees it, including
 * length and precision where declared; nullability; primary keys; foreign keys WITH their delete and
 * update actions; unique constraints; and indexes by their column list.
 *
 * NOT MATERIAL, and normalized away:
 *
 *   - GENERATED CONSTRAINT AND INDEX NAMES. Production's invitation table came from TypeORM
 *     `synchronize` and is named `PK_beb994737756c0f18a1c1f8669c`; the hand-written migration names
 *     the same constraint `PK_invitation_id`. They are the same primary key. Comparing names would
 *     report drift on every synchronize-era object in the database and drown the real differences —
 *     which is exactly the failure mode that let SE-12 go unnoticed. Constraints are therefore
 *     compared by their DEFINITION against the table, not by their name.
 *
 *   - DEFAULTS THAT DIFFER ONLY IN SPELLING. `uuid_generate_v4()` and `gen_random_uuid()` are
 *     different functions and ARE reported; `now()` versus `CURRENT_TIMESTAMP` is the same default
 *     written two ways and is not.
 *
 *   - ROW DATA. This is a structural contract. Nothing here reads a customer row.
 *
 * ===============================================================================================
 * SCOPE CLASSES.
 *
 * Every table is assigned to ACTIVE_INDIVIDUAL_BETA, SHARED_INFRASTRUCTURE, DEFERRED_COMPANY_TEAM
 * or RETIRED_COMPATIBILITY. The gate's strictness follows the class: a Beta-v1 or shared table must
 * match the manifest exactly, while a retired-compatibility object is recorded and tolerated,
 * because §305 is forbidden from dropping production-only tables and there is no value in failing a
 * release over a table nothing reads.
 */

export type SchemaScope =
  | 'ACTIVE_INDIVIDUAL_BETA'
  | 'SHARED_INFRASTRUCTURE'
  | 'DEFERRED_COMPANY_TEAM'
  | 'RETIRED_COMPATIBILITY';

export interface ColumnShape {
  readonly name: string;
  readonly type: string;
  readonly nullable: boolean;
  readonly default: string | null;
}

export interface ForeignKeyShape {
  readonly columns: string[];
  readonly references: string;
  readonly onDelete: string;
  readonly onUpdate: string;
}

export interface TableShape {
  readonly name: string;
  readonly scope: SchemaScope;
  readonly columns: ColumnShape[];
  readonly primaryKey: string[] | null;
  readonly foreignKeys: ForeignKeyShape[];
  readonly unique: string[][];
  readonly indexes: string[][];
}

export interface CanonicalSchema {
  readonly tables: TableShape[];
}

export interface SchemaReader {
  query(sql: string, parameters?: unknown[]): Promise<any[]>;
}

/**
 * A default is normalized so that two spellings of the same value compare equal, while two genuinely
 * different defaults do not. Sequence defaults carry the table name, which is identical on both
 * sides for the same table and so is left alone.
 */
function normalizeDefault(raw: string | null): string | null {
  if (raw === null || raw === undefined) return null;
  let value = String(raw).trim();
  value = value.replace(/::[a-zA-Z_ ]+(\[\])?/g, '');          // drop type casts
  value = value.replace(/^CURRENT_TIMESTAMP$/i, 'now()');
  value = value.replace(/^\(?now\(\)\)?$/i, 'now()');
  value = value.replace(/\s+/g, ' ');
  return value;
}

/**
 * `information_schema` reports `character varying` with the length in a separate column and reports
 * numeric precision separately again. The planner cares about the combination, so it is folded into
 * one string — `character varying(40)` — which is also how a person reads it.
 */
function formatType(row: any): string {
  const base = String(row.data_type);
  /*
   * `information_schema` reports every array column as the bare word `ARRAY`, which is neither valid
   * DDL nor a useful comparison — `text[]` and `integer[]` would look identical. The element type
   * lives in `udt_name` as an underscore-prefixed name (`_text`), so it is expanded here. This also
   * means the gate can see an element-type change, which the bare `ARRAY` would have hidden.
   */
  if (base === 'ARRAY') {
    const udt = String(row.udt_name || '');
    return udt.startsWith('_') ? `${udt.slice(1)}[]` : 'text[]';
  }
  if (row.character_maximum_length !== null && row.character_maximum_length !== undefined) {
    return `${base}(${row.character_maximum_length})`;
  }
  if (base === 'numeric' && row.numeric_precision !== null) {
    return `${base}(${row.numeric_precision},${row.numeric_scale ?? 0})`;
  }
  return base;
}

/**
 * THE SCOPE MAP.
 *
 * Derived from §305A's A/B/C/D classification and from what the §305A individual-workflow suite
 * actually exercised. A table absent from every list is SHARED_INFRASTRUCTURE by default rather
 * than retired, because defaulting an unknown object to "ignore me" is how a drift gate quietly
 * stops covering things.
 */
const ACTIVE_INDIVIDUAL_BETA = new Set([
  'user', 'refresh_token', 'agreement_acceptances', 'notifications',
  'site', 'inspection', 'observations', 'hazlenz_analyses',
  'inspection_findings', 'inspection_assignments', 'inspection_evidence',
  'inspection_reports', 'inspection_report_versions', 'storage_objects',
  'corrective_actions', 'tasks',
  'entitlement_grants', 'user_subscription',
  'security_audit_events', 'audit_logs',
]);

const DEFERRED_COMPANY_TEAM = new Set([
  'organization', 'organization_memberships', 'invitation',
  'platform_support_grant', 'workspace_invite',
]);

/**
 * RETIRED / COMPATIBILITY. Each of these has a canonical successor under a different name, or is the
 * already-registered DB-4 unexplained object. They are PRESERVED in production — §305 is forbidden
 * from dropping a production-only table — and recorded here so the gate reports them rather than
 * silently ignoring them.
 */
const RETIRED_COMPATIBILITY = new Set([
  /*
   * Each of these has a canonical successor under a different name, or is the already-registered
   * DB-4 unexplained object. They are PRESERVED in production — §305 forbids dropping a
   * production-only table — and named here so the drift gate REPORTS them rather than silently
   * ignoring them, while not failing a release over a table nothing on the Beta v1 path reads.
   *
   * The names matter and were verified rather than guessed:
   *
   *   `reports`  is the LEGACY report table from InitialMigration. NO entity maps to it. The
   *              canonical report is `inspection_reports` (InspectionReport) with its versions in
   *              `inspection_report_versions` — which is what the §305A individual workflow drove to
   *              an issued report. Production's `reports` carries 15 further legacy columns
   *              (hazardDescription, severity, immediateDanger, reviewDecision, workActivity …) that
   *              the migration-built one does not, and nothing reads them.
   *
   *   `report` / `finding` are the singular tables of the bare-@Entity() `Report` and `Finding`
   *              classes behind the legacy /reports routes. Those routes resolve scope through
   *              `requireOrganization`, so an individual Beta user is refused before reaching them.
   *              Live code, unreachable product path.
   */
  'users',      // superseded by "user"
  /*
   * `report_attachments` belongs to the legacy `report` table by foreign key, and no service uses
   * the ReportAttachment entity — it is registered in the datasource and referenced nowhere else.
   * It was classified SHARED_INFRASTRUCTURE by default until the convergence migration tried to
   * recreate its foreign key in a fresh database and could not, because its target is retired. An
   * enforced table cannot depend on a retired one; that dependency is what identified it.
   */
  'report_attachments',
  'reports',    // legacy; superseded by "inspection_reports"
  'report',     // legacy singular, reachable only through organization-scoped routes
  'finding',    // legacy singular, superseded by "inspection_findings"
  'outcomes',   // DB-4: exists in production, no migration creates it, nothing explains it
  'standards', 'hazard_taxonomy', 'regulatory_profile', 'control_verifications',
]);

export function scopeOf(table: string): SchemaScope {
  if (ACTIVE_INDIVIDUAL_BETA.has(table)) return 'ACTIVE_INDIVIDUAL_BETA';
  if (DEFERRED_COMPANY_TEAM.has(table)) return 'DEFERRED_COMPANY_TEAM';
  if (RETIRED_COMPATIBILITY.has(table)) return 'RETIRED_COMPATIBILITY';
  return 'SHARED_INFRASTRUCTURE';
}

/** Scopes the drift gate treats as binding. A retired object is reported, never fatal. */
export const ENFORCED_SCOPES: readonly SchemaScope[] = [
  'ACTIVE_INDIVIDUAL_BETA', 'SHARED_INFRASTRUCTURE', 'DEFERRED_COMPANY_TEAM',
];

export async function extractCanonicalSchema(reader: SchemaReader): Promise<CanonicalSchema> {
  const tableRows = await reader.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      AND table_name <> 'migrations'
    ORDER BY table_name
  `);
  const columnRows = await reader.query(`
    SELECT table_name, column_name, data_type, udt_name, character_maximum_length,
           numeric_precision, numeric_scale, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, column_name
  `);
  const constraintRows = await reader.query(`
    SELECT rel.relname AS table_name, con.contype,
           pg_get_constraintdef(con.oid) AS definition
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = rel.relnamespace
    WHERE n.nspname = 'public' AND con.contype IN ('p', 'f', 'u')
    ORDER BY rel.relname
  `);
  const indexRows = await reader.query(`
    SELECT tablename AS table_name, indexdef
    FROM pg_indexes WHERE schemaname = 'public'
    ORDER BY tablename
  `);

  const columnsByTable = new Map<string, ColumnShape[]>();
  for (const row of columnRows) {
    const list = columnsByTable.get(row.table_name) || [];
    list.push({
      name: row.column_name,
      type: formatType(row),
      nullable: row.is_nullable === 'YES',
      default: normalizeDefault(row.column_default),
    });
    columnsByTable.set(row.table_name, list);
  }

  const splitColumns = (inside: string): string[] =>
    inside.split(',').map((c) => c.trim().replace(/^"|"$/g, '')).filter(Boolean);

  const tables: TableShape[] = [];
  for (const { table_name: name } of tableRows) {
    const constraints = constraintRows.filter((c: any) => c.table_name === name);

    let primaryKey: string[] | null = null;
    const foreignKeys: ForeignKeyShape[] = [];
    const unique: string[][] = [];

    for (const c of constraints) {
      const def: string = c.definition;
      if (c.contype === 'p') {
        const m = def.match(/PRIMARY KEY \(([^)]*)\)/);
        if (m) primaryKey = splitColumns(m[1]);
      } else if (c.contype === 'u') {
        const m = def.match(/UNIQUE \(([^)]*)\)/);
        if (m) unique.push(splitColumns(m[1]));
      } else if (c.contype === 'f') {
        const m = def.match(/FOREIGN KEY \(([^)]*)\) REFERENCES ([^\s(]+)\(([^)]*)\)/);
        if (m) {
          foreignKeys.push({
            columns: splitColumns(m[1]),
            references: `${m[2].replace(/^"|"$/g, '')}(${splitColumns(m[3]).join(',')})`,
            // Postgres omits the clause when the action is the NO ACTION default, so an omitted
            // clause and an explicit "ON DELETE NO ACTION" must compare equal.
            onDelete: (def.match(/ON DELETE (CASCADE|RESTRICT|SET NULL|SET DEFAULT|NO ACTION)/) || [, 'NO ACTION'])[1],
            onUpdate: (def.match(/ON UPDATE (CASCADE|RESTRICT|SET NULL|SET DEFAULT|NO ACTION)/) || [, 'NO ACTION'])[1],
          });
        }
      }
    }

    /*
     * Indexes are compared by their COLUMN LIST and uniqueness, never by name — the same index is
     * called `idx_invitation_organization_id` by a migration and something generated by synchronize.
     * A unique index and a unique constraint are the same guarantee to the planner, so a unique
     * index is also recorded in `unique` to stop one side reporting drift purely because the other
     * expressed it as a constraint.
     */
    const indexes: string[][] = [];
    for (const row of indexRows.filter((i: any) => i.table_name === name)) {
      const def: string = row.indexdef;
      const m = def.match(/\(([^)]*)\)\s*$/);
      if (!m) continue;
      const cols = splitColumns(m[1]);
      if (/CREATE UNIQUE INDEX/.test(def)) {
        if (!unique.some((u) => u.join(',') === cols.join(','))) unique.push(cols);
      }
      indexes.push(cols);
    }

    const dedupe = (lists: string[][]) => {
      const seen = new Set<string>();
      return lists.filter((l) => {
        const k = l.join(',');
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      }).sort((a, b) => a.join(',').localeCompare(b.join(',')));
    };

    tables.push({
      name,
      scope: scopeOf(name),
      columns: (columnsByTable.get(name) || []).sort((a, b) => a.name.localeCompare(b.name)),
      primaryKey,
      foreignKeys: foreignKeys.sort((a, b) =>
        `${a.columns}${a.references}`.localeCompare(`${b.columns}${b.references}`)),
      unique: dedupe(unique),
      indexes: dedupe(indexes),
    });
  }

  return { tables };
}

/**
 * COLUMNS PRODUCTION HAS THAT THE CANONICAL CONTRACT DELIBERATELY DOES NOT REQUIRE.
 *
 * `user.password` and `user.legacy_id` are synchronize-era leftovers: no entity declares them and
 * nothing reads them. §305 forbids dropping production data, so they stay in production — but a
 * fresh database should not be made to create dead columns, or the canonical contract would be
 * describing history instead of intent. They are therefore tolerated when present and never
 * required. Anything NOT on this list that appears unexpectedly is still reported, which is the
 * point: the allowance is a short, named list, not a category.
 */
export const TOLERATED_LEGACY_COLUMNS = new Set(['user.password', 'user.legacy_id']);

export interface SchemaDifference {
  readonly table: string;
  readonly scope: SchemaScope;
  readonly kind: string;
  readonly detail: string;
}

/**
 * Compare two extracted schemas and report MATERIAL differences only.
 *
 * `expected` is the canonical manifest; `actual` is the database under test. The asymmetry matters:
 * a table the database has and the manifest does not is reported as `unexpected_table`, which is how
 * a production-only object that nobody has classified surfaces rather than hides.
 */
export function diffSchemas(
  expected: CanonicalSchema, actual: CanonicalSchema,
  scopes: readonly SchemaScope[] = ENFORCED_SCOPES,
): SchemaDifference[] {
  const differences: SchemaDifference[] = [];
  const inScope = (s: SchemaScope) => scopes.includes(s);
  const actualByName = new Map(actual.tables.map((t) => [t.name, t]));
  const expectedByName = new Map(expected.tables.map((t) => [t.name, t]));

  for (const want of expected.tables) {
    if (!inScope(want.scope)) continue;
    const got = actualByName.get(want.name);
    if (!got) {
      differences.push({ table: want.name, scope: want.scope, kind: 'missing_table',
        detail: 'present in the canonical manifest, absent from this database' });
      continue;
    }
    const gotColumns = new Map(got.columns.map((c) => [c.name, c]));
    for (const column of want.columns) {
      const actualColumn = gotColumns.get(column.name);
      if (!actualColumn) {
        differences.push({ table: want.name, scope: want.scope, kind: 'missing_column',
          detail: column.name });
        continue;
      }
      if (actualColumn.type !== column.type) {
        differences.push({ table: want.name, scope: want.scope, kind: 'column_type',
          detail: `${column.name}: expected ${column.type}, found ${actualColumn.type}` });
      }
      if (actualColumn.nullable !== column.nullable) {
        differences.push({ table: want.name, scope: want.scope, kind: 'column_nullability',
          detail: `${column.name}: expected ${column.nullable ? 'NULL' : 'NOT NULL'}, found ${actualColumn.nullable ? 'NULL' : 'NOT NULL'}` });
      }
      if ((actualColumn.default || null) !== (column.default || null)) {
        differences.push({ table: want.name, scope: want.scope, kind: 'column_default',
          detail: `${column.name}: expected ${column.default}, found ${actualColumn.default}` });
      }
    }
    for (const column of got.columns) {
      if (TOLERATED_LEGACY_COLUMNS.has(`${want.name}.${column.name}`)) continue;
      if (!want.columns.some((c) => c.name === column.name)) {
        differences.push({ table: want.name, scope: want.scope, kind: 'unexpected_column',
          detail: column.name });
      }
    }
    const key = (v: unknown) => JSON.stringify(v);
    if (key(want.primaryKey) !== key(got.primaryKey)) {
      differences.push({ table: want.name, scope: want.scope, kind: 'primary_key',
        detail: `expected ${key(want.primaryKey)}, found ${key(got.primaryKey)}` });
    }
    for (const fk of want.foreignKeys) {
      if (!got.foreignKeys.some((f) => key(f) === key(fk))) {
        differences.push({ table: want.name, scope: want.scope, kind: 'missing_foreign_key',
          detail: `${fk.columns.join(',')} -> ${fk.references} ON DELETE ${fk.onDelete}` });
      }
    }
    for (const fk of got.foreignKeys) {
      if (!want.foreignKeys.some((f) => key(f) === key(fk))) {
        differences.push({ table: want.name, scope: want.scope, kind: 'unexpected_foreign_key',
          detail: `${fk.columns.join(',')} -> ${fk.references} ON DELETE ${fk.onDelete}` });
      }
    }
    for (const u of want.unique) {
      if (!got.unique.some((g) => g.join(',') === u.join(','))) {
        differences.push({ table: want.name, scope: want.scope, kind: 'missing_unique',
          detail: u.join(',') });
      }
    }
    for (const i of want.indexes) {
      if (!got.indexes.some((g) => g.join(',') === i.join(','))) {
        differences.push({ table: want.name, scope: want.scope, kind: 'missing_index',
          detail: i.join(',') });
      }
    }
  }

  for (const got of actual.tables) {
    if (!inScope(got.scope)) continue;
    if (!expectedByName.has(got.name)) {
      differences.push({ table: got.name, scope: got.scope, kind: 'unexpected_table',
        detail: 'present in this database, absent from the canonical manifest' });
    }
  }

  return differences;
}

/**
 * A stable digest of the manifest. Deterministic because extraction sorts every list, so the same
 * schema produces the same digest on any machine and in any extraction order.
 */
export function schemaDigest(schema: CanonicalSchema): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createHash } = require('crypto');
  return createHash('sha256').update(JSON.stringify(schema)).digest('hex');
}
