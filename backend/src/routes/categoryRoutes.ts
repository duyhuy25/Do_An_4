import { Router, Request, Response } from 'express';
import { sql, config, addAuditLog } from '../config/db';

const router = Router();

// GET /categories: trả về danh sách danh mục đang kích hoạt
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`SELECT * FROM Categories WHERE IsActive = 1 ORDER BY CategoryID`);
    return res.json(result.recordset);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tải danh mục.', error: (error as Error).message });
  }
});

// POST /categories: tạo danh mục mới (admin)
router.post('/categories', async (req: Request, res: Response) => {
  const { CategoryName, Description } = req.body;
  if (!CategoryName) {
    return res.status(400).json({ message: 'Tên danh mục không được để trống.' });
  }

  try {
    const pool = await sql.connect(config);
    const insert = await pool.request()
      .input('CategoryName', sql.NVarChar(100), CategoryName)
      .input('Description', sql.NVarChar(255), Description || '')
      .query(`INSERT INTO Categories (CategoryName, Description, IsActive, CreatedAt)
              OUTPUT INSERTED.CategoryID
              VALUES (@CategoryName, @Description, 1, GETDATE())`);

    const categoryId = insert.recordset[0]?.CategoryID;
    await addAuditLog('CREATE_CATEGORY', 'Categories', categoryId ?? null, 1, `Tạo danh mục mới: ${CategoryName}`);

    const result = await pool.request().input('CategoryID', sql.Int, categoryId).query(`SELECT * FROM Categories WHERE CategoryID = @CategoryID`);
    return res.status(201).json(result.recordset[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tạo danh mục.', error: (error as Error).message });
  }
});

// GET /locations: trả về danh sách địa điểm trong trường
router.get('/locations', async (req: Request, res: Response) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`SELECT * FROM Locations WHERE IsActive = 1 ORDER BY LocationID`);
    return res.json(result.recordset);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tải địa điểm.', error: (error as Error).message });
  }
});

// POST /locations: tạo địa điểm mới (admin)
router.post('/locations', async (req: Request, res: Response) => {
  const { LocationName, Building, Floor } = req.body;
  if (!LocationName) {
    return res.status(400).json({ message: 'Tên địa điểm không được để trống.' });
  }

  try {
    const pool = await sql.connect(config);
    const insert = await pool.request()
      .input('LocationName', sql.NVarChar(150), LocationName)
      .input('Building', sql.NVarChar(100), Building || '')
      .input('Floor', sql.NVarChar(50), Floor || '')
      .query(`INSERT INTO Locations (LocationName, Description, Building, Floor, IsActive, CreatedAt)
              OUTPUT INSERTED.LocationID
              VALUES (@LocationName, NULL, @Building, @Floor, 1, GETDATE())`);

    const locationId = insert.recordset[0]?.LocationID;
    await addAuditLog('CREATE_LOCATION', 'Locations', locationId ?? null, 1, `Thêm địa điểm mới: ${LocationName}`);

    const result = await pool.request().input('LocationID', sql.Int, locationId).query(`SELECT * FROM Locations WHERE LocationID = @LocationID`);
    return res.status(201).json(result.recordset[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tạo địa điểm.', error: (error as Error).message });
  }
});

// GET /storage-locations: trả về danh sách kho/lưu trữ và người phụ trách
router.get('/storage-locations', async (req: Request, res: Response) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT s.*, u.FullName AS ResponsibleName
      FROM StorageLocations s
      LEFT JOIN Users u ON s.ResponsibleUserID = u.UserID
      WHERE s.IsActive = 1
      ORDER BY s.StorageLocationID
    `);
    return res.json(result.recordset);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tải kho đồ.', error: (error as Error).message });
  }
});

export default router;
