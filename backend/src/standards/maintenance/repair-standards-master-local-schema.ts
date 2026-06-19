import "reflect-metadata";
import { DataSource } from "typeorm";

const databaseUrl = process.env.DATABASE_URL;

const ds = new DataSource({
  type: "postgres",
  url: databaseUrl || "postgresql://user:password@db:5432/safescope",
  ssl: false,
});

async function run() {
  await ds.initialize();

  await ds.query(`
    ALTER TABLE standards_master
      ADD COLUMN IF NOT EXISTS source_key varchar(160),
      ADD COLUMN IF NOT EXISTS source_name varchar(220),
      ADD COLUMN IF NOT EXISTS source_type varchar(80),
      ADD COLUMN IF NOT EXISTS authority_tier integer DEFAULT 5,
      ADD COLUMN IF NOT EXISTS requires_approval boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS approved_for_auto_ingestion boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS required_controls text DEFAULT '',
      ADD COLUMN IF NOT EXISTS severity_weight integer DEFAULT 1;
  `);

  await ds.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'standards_master'
          AND column_name = 'allowed_use'
          AND data_type = 'jsonb'
      ) THEN
        ALTER TABLE standards_master
          ALTER COLUMN allowed_use DROP DEFAULT;

        ALTER TABLE standards_master
          ALTER COLUMN allowed_use TYPE varchar(120)
          USING
            CASE
              WHEN allowed_use IS NULL THEN NULL
              WHEN jsonb_typeof(allowed_use) = 'string' THEN allowed_use #>> '{}'
              ELSE allowed_use::text
            END;
      END IF;
    END $$;
  `);

  await ds.query(`
    ALTER TABLE standards_master
      ADD COLUMN IF NOT EXISTS allowed_use varchar(120);

    ALTER TABLE standards_master
      ALTER COLUMN allowed_use SET DEFAULT 'primary_regulatory_authority';
  `);

  await ds.query(`
    CREATE SEQUENCE IF NOT EXISTS standards_master_uuid_seq;

    ALTER TABLE standards_master
      ALTER COLUMN id SET DEFAULT (
        '00000000-0000-4000-8000-' ||
        lpad(to_hex(nextval('standards_master_uuid_seq')), 12, '0')
      )::uuid;
  `);

  const [{ count }] = await ds.query(`
    SELECT COUNT(*)::int AS count
    FROM standards_master;
  `);

  console.log({
    ok: true,
    table: "standards_master",
    count,
    repaired: [
      "source governance columns",
      "allowed_use varchar compatibility",
      "required_controls",
      "severity_weight",
      "extension-free uuid default",
    ],
  });

  await ds.destroy();
}

run().catch(async (err) => {
  console.error(err);
  await ds.destroy().catch(() => undefined);
  process.exit(1);
});
