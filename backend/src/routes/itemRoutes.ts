import { Router, Request, Response } from 'express';
import { sql, config, addAuditLog } from '../config/db';
import { uploadImages } from '../middleware/uploadImages';

const router = Router();

// GET /items: lấy danh sách vật phẩm đã nhặt / lưu kho (hỗ trợ tìm kiếm/lọc)
router.get('/items', async (req: Request, res: Response) => {
  const { search, categoryId, locationId, status } = req.query;

  try {
    const pool = await sql.connect(config);

    let query = `
      SELECT i.ItemID, i.CategoryID, c.CategoryName, i.LocationID, l.LocationName,
             i.ItemName, i.Description, i.IdentifyingFeatures, i.FoundDate, i.Status,
             i.StorageLocationID, s.StorageName, i.TrackingCode, i.ReceivedBy, i.ReturnedAt,
             i.CreatedAt, image.ImageURL
      FROM Items i
      LEFT JOIN Categories c ON i.CategoryID = c.CategoryID
      LEFT JOIN Locations l ON i.LocationID = l.LocationID
      LEFT JOIN StorageLocations s ON i.StorageLocationID = s.StorageLocationID
      OUTER APPLY (SELECT TOP 1 ImageURL FROM ItemImages WHERE ItemID = i.ItemID ORDER BY IsPrimary DESC, ImageID) image
      WHERE 1 = 1
    `;
    const request = pool.request();

    if (search) {
      query += ` AND (LOWER(i.ItemName) LIKE '%' + LOWER(@search) + '%' OR LOWER(i.Description) LIKE '%' + LOWER(@search) + '%' OR LOWER(i.IdentifyingFeatures) LIKE '%' + LOWER(@search) + '%' OR LOWER(i.TrackingCode) LIKE '%' + LOWER(@search) + '%')`;
      request.input('search', sql.NVarChar(200), search.toString());
    }
    if (categoryId) {
      query += ` AND i.CategoryID = @categoryId`;
      request.input('categoryId', sql.Int, Number(categoryId));
    }
    if (locationId) {
      query += ` AND i.LocationID = @locationId`;
      request.input('locationId', sql.Int, Number(locationId));
    }
    if (status) {
      query += ` AND i.Status = @status`;
      request.input('status', sql.VarChar(30), status.toString());
    }

    query += ' ORDER BY i.CreatedAt DESC';

    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tải vật phẩm.', error: (error as Error).message });
  }
});

// POST /found-reports: tạo báo nhặt đồ (sinh tracking code, có thể tạo MatchSuggestions)
router.post('/found-reports', uploadImages.array('images', 10), async (req: Request, res: Response) => {
  const { CategoryID, LocationID, ItemName, Description, IdentifyingFeatures, FoundDate, StorageLocationID } = req.body;

  if (!CategoryID || !ItemName) {
    return res.status(400).json({ message: 'Thiếu danh mục hoặc tên vật phẩm.' });
  }

  try {
    const pool = await sql.connect(config);
    const trackingCode = `TK-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

    const insert = await pool.request()
      .input('CategoryID', sql.Int, Number(CategoryID))
      .input('LocationID', sql.Int, LocationID ? Number(LocationID) : null)
      .input('ItemName', sql.NVarChar(200), ItemName)
      .input('Description', sql.NVarChar(sql.MAX), Description || '')
      .input('IdentifyingFeatures', sql.NVarChar(sql.MAX), IdentifyingFeatures || '')
      .input('FoundDate', sql.DateTime2, FoundDate || new Date().toISOString())
      .input('StorageLocationID', sql.Int, StorageLocationID ? Number(StorageLocationID) : 1)
      .input('TrackingCode', sql.VarChar(50), trackingCode)
      .query(`INSERT INTO Items (CategoryID, LocationID, ItemName, Description, IdentifyingFeatures, FoundDate, Status, StorageLocationID, TrackingCode, ReceivedBy, CreatedAt)
              OUTPUT INSERTED.ItemID
              VALUES (@CategoryID, @LocationID, @ItemName, @Description, @IdentifyingFeatures, @FoundDate, 'STORED', @StorageLocationID, @TrackingCode, 4, GETDATE())`);

    const itemId = insert.recordset[0]?.ItemID;
    const images = (req.files as Express.Multer.File[] | undefined) || [];
    for (const [index, image] of images.entries()) {
      await pool.request()
        .input('ItemID', sql.Int, itemId)
        .input('ImageURL', sql.VarChar(500), `/uploads/${image.filename}`)
        .input('IsPrimary', sql.Bit, index === 0)
        .query('INSERT INTO ItemImages (ItemID, ImageURL, IsPrimary) VALUES (@ItemID, @ImageURL, @IsPrimary)');
    }
    const result = await pool.request().input('ItemID', sql.Int, itemId).query(`
      SELECT i.ItemID, i.CategoryID, c.CategoryName, i.LocationID, l.LocationName,
             i.ItemName, i.Description, i.IdentifyingFeatures, i.FoundDate, i.Status,
             i.StorageLocationID, s.StorageName, i.TrackingCode, i.ReceivedBy, i.ReturnedAt,
             i.CreatedAt, image.ImageURL
      FROM Items i
      LEFT JOIN Categories c ON i.CategoryID = c.CategoryID
      LEFT JOIN Locations l ON i.LocationID = l.LocationID
      LEFT JOIN StorageLocations s ON i.StorageLocationID = s.StorageLocationID
      OUTER APPLY (SELECT TOP 1 ImageURL FROM ItemImages WHERE ItemID = i.ItemID ORDER BY IsPrimary DESC, ImageID) image
      WHERE i.ItemID = @ItemID
    `);

    const newItem = result.recordset[0];

    const pendingLost = await pool.request().input('CategoryID', sql.Int, Number(CategoryID)).query(`
      SELECT LostReportID, Title, CategoryID, LocationID
      FROM LostReports
      WHERE CategoryID = @CategoryID AND Status IN ('APPROVED', 'PENDING')
    `);

    for (const row of pendingLost.recordset) {
      await pool.request()
        .input('LostReportID', sql.Int, row.LostReportID)
        .input('ItemID', sql.Int, itemId)
        .input('Reason', sql.NVarChar(sql.MAX), `Trùng khớp danh mục (${newItem.CategoryName}) và khu vực nhặt được (${newItem.LocationName || 'Không rõ'}).`)
        .query(`INSERT INTO MatchSuggestions (LostReportID, ItemID, MatchScore, Reason, Status, CreatedAt)
                VALUES (@LostReportID, @ItemID, 85.0, @Reason, 'PENDING', GETDATE())`);
    }

    await addAuditLog('CREATE_FOUND_ITEM', 'Items', itemId ?? null, 4, `Tiếp nhận đồ nhặt được: ${ItemName} [${trackingCode}]`);
    return res.status(201).json(newItem);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tạo báo nhặt đồ.', error: (error as Error).message });
  }
});

// PUT /items/:id: cập nhật trạng thái hoặc kho lưu trữ của vật phẩm
router.put('/items/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { Status, StorageLocationID } = req.body;

  try {
    const pool = await sql.connect(config);
    const itemCheck = await pool.request().input('ItemID', sql.Int, Number(id)).query('SELECT * FROM Items WHERE ItemID = @ItemID');
    if (itemCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy vật phẩm' });
    }

    if (Status) {
      await pool.request().input('Status', sql.VarChar(30), Status).input('ItemID', sql.Int, Number(id)).query('UPDATE Items SET Status = @Status WHERE ItemID = @ItemID');
    }

    if (StorageLocationID) {
      await pool.request().input('StorageLocationID', sql.Int, Number(StorageLocationID)).input('ItemID', sql.Int, Number(id)).query('UPDATE Items SET StorageLocationID = @StorageLocationID WHERE ItemID = @ItemID');
    }

    await addAuditLog('UPDATE_ITEM', 'Items', Number(id), 1, `Cập nhật trạng thái đồ vật #${id} -> ${Status}`);

    const result = await pool.request().input('ItemID', sql.Int, Number(id)).query(`
      SELECT i.ItemID, i.CategoryID, c.CategoryName, i.LocationID, l.LocationName,
             i.ItemName, i.Description, i.IdentifyingFeatures, i.FoundDate, i.Status,
             i.StorageLocationID, s.StorageName, i.TrackingCode, i.ReceivedBy, i.ReturnedAt,
             i.CreatedAt, image.ImageURL
      FROM Items i
      LEFT JOIN Categories c ON i.CategoryID = c.CategoryID
      LEFT JOIN Locations l ON i.LocationID = l.LocationID
      LEFT JOIN StorageLocations s ON i.StorageLocationID = s.StorageLocationID
      OUTER APPLY (SELECT TOP 1 ImageURL FROM ItemImages WHERE ItemID = i.ItemID ORDER BY IsPrimary DESC, ImageID) image
      WHERE i.ItemID = @ItemID
    `);

    return res.json(result.recordset[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể cập nhật trạng thái vật phẩm.', error: (error as Error).message });
  }
});

export default router;
