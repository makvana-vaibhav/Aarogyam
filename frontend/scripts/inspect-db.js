import sql from "mssql";

const config = {
  server: "13.204.12.252",
  port: 1433,
  database: "AarogyamDB",
  user: "appuser",
  password: "AdminDB@#1411",
  options: {
    encrypt: true,
    trustServerCertificate: true,
    connectTimeout: 30000,
    requestTimeout: 30000
  }
};

async function inspectDb() {
  try {
    console.log("Connecting to production database at 13.204.12.252...");
    const pool = await sql.connect(config);
    console.log("✓ Connected successfully!");

    // Check DegreeMaster
    const degrees = await pool.request().query("SELECT * FROM dbo.DegreeMaster");
    console.log(`Current DegreeMaster row count: ${degrees.recordset.length}`);
    console.log("Sample DegreeMaster rows:", degrees.recordset.slice(0, 5));

    // Check SpecializationMaster
    const specs = await pool.request().query("SELECT * FROM dbo.SpecializationMaster");
    console.log(`Current SpecializationMaster row count: ${specs.recordset.length}`);
    console.log("Sample SpecializationMaster rows:", specs.recordset.slice(0, 5));

    // Check Columns in SpecializationMaster
    const specCols = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'SpecializationMaster'
    `);
    console.log("SpecializationMaster Columns:", specCols.recordset);

    // Check Foreign Keys on Doctors
    const fks = await pool.request().query(`
      SELECT fk.name, tp.name as parent_table, cp.name as parent_col, tr.name as ref_table, cr.name as ref_col
      FROM sys.foreign_keys fk
      JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
      JOIN sys.tables tp ON tp.object_id = fkc.parent_object_id
      JOIN sys.columns cp ON cp.object_id = fkc.parent_object_id AND cp.column_id = fkc.parent_column_id
      JOIN sys.tables tr ON tr.object_id = fkc.referenced_object_id
      JOIN sys.columns cr ON cr.object_id = fkc.referenced_object_id AND cr.column_id = fkc.referenced_column_id
      WHERE tr.name IN ('DegreeMaster', 'SpecializationMaster') OR tp.name IN ('DegreeMaster', 'SpecializationMaster')
    `);
    console.log("Foreign keys related to Degree/Specialization:", fks.recordset);

    await pool.close();
  } catch (err) {
    console.error("Database connection/query error:", err);
  }
}

inspectDb();
