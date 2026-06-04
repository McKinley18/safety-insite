import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

function buildDataSourceOptions() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    return {
      type: "postgres" as const,
      url: databaseUrl,
      ssl: databaseUrl.includes("neon.tech")
        ? { rejectUnauthorized: false }
        : false,
    };
  }

  return {
    type: "postgres" as const,
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USERNAME || process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database:
      process.env.DB_DATABASE || process.env.POSTGRES_DB || "sentinel_safety",
  };
}

const ds = new DataSource(buildDataSourceOptions());

async function addColumnIfMissing(columnName: string, definition: string) {
  const exists = await ds.query(
    `
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'standards_master'
        AND column_name = $1
      LIMIT 1
    `,
    [columnName],
  );

  if (!exists.length) {
    await ds.query(`ALTER TABLE standards_master ADD COLUMN ${definition}`);
    console.log(`Added standards_master.${columnName}`);
  }
}

async function run() {
  await ds.initialize();

  await ds.query(`
    CREATE TABLE IF NOT EXISTS standards_master (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      agency_code varchar NOT NULL,
      citation varchar NOT NULL,
      part_number varchar NULL,
      subpart varchar NULL,
      title varchar NOT NULL,
      standard_text text NOT NULL,
      plain_language_summary text NULL,
      scope_code varchar NULL,
      hazard_codes text NULL,
      required_controls text NULL,
      keywords text NULL,
      severity_weight integer NOT NULL DEFAULT 1,
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await ds.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_standards_master_agency_citation
    ON standards_master (agency_code, citation)
  `);

  await addColumnIfMissing("source_key", `"source_key" varchar NULL`);
  await addColumnIfMissing("source_name", `"source_name" varchar NULL`);
  await addColumnIfMissing("source_type", `"source_type" varchar NULL`);
  await addColumnIfMissing(
    "authority_tier",
    `"authority_tier" integer NOT NULL DEFAULT 1`,
  );
  await addColumnIfMissing("allowed_use", `"allowed_use" varchar NULL`);
  await addColumnIfMissing(
    "requires_approval",
    `"requires_approval" boolean NOT NULL DEFAULT false`,
  );
  await addColumnIfMissing(
    "approved_for_auto_ingestion",
    `"approved_for_auto_ingestion" boolean NOT NULL DEFAULT true`,
  );

  console.log("standards_master table verified.");
  await ds.destroy();
}

run().catch(async (error) => {
  console.error(error);
  await ds.destroy().catch(() => undefined);
  process.exit(1);
});
