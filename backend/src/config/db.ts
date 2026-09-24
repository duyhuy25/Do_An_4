import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123',
  server: process.env.DB_SERVER || 'DESKTOP-FTDRE2U',
  database: process.env.DB_NAME || 'Do_An_4',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

export const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch((err) => {
    console.log('Database connection failed:', err);
    throw err;
  });

export async function testConnection() {
  try {
    await sql.connect(config);
    return { success: true, message: 'Kết nối SQL Server thành công.' };
  } catch (error) {
    return {
      success: false,
      message: 'Kết nối SQL Server thất bại.',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function addAuditLog(
  action: string,
  entityName: string,
  entityId: number | null,
  userId: number | null,
  details: string
) {
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('UserID', sql.Int, userId)
      .input('Action', sql.VarChar(100), action)
      .input('EntityName', sql.VarChar(100), entityName)
      .input('EntityID', sql.Int, entityId)
      .input('NewValue', sql.NVarChar(sql.MAX), details)
      .query(`
        INSERT INTO AuditLogs (UserID, Action, EntityName, EntityID, OldValue, NewValue, IPAddress, CreatedAt)
        VALUES (@UserID, @Action, @EntityName, @EntityID, NULL, @NewValue, NULL, GETDATE())
      `);
  } catch (error) {
    console.error('Audit log failed:', error);
  }
}

export { sql, config };
