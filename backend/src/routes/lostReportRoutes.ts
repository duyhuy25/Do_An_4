import { Router, Request, Response } from 'express';
import { sql, config, addAuditLog } from '../config/db';
import { uploadImages } from '../middleware/uploadImages';
import { optionalAuth } from '../middleware/optionalAuth';

const router = Router();

// GET /lost-reports: lấy danh sách báo mất (hỗ trợ tìm kiếm và lọc)
router.get('/lost-reports', optionalAuth, async (req: Request, res: Response) => {
  const { search, categoryId, status } = req.query;

  try {
    const pool = await sql.connect(config);
    let query = `
      SELECT lr.LostReportID, lr.UserID, u.FullName AS UserName, u.Phone AS UserPhone,
             lr.CategoryID, c.CategoryName, lr.LocationID, l.LocationName,
             lr.Title, lr.Description, lr.LostDate, lr.DistinguishingFeatures,
             lr.RewardAmount, lr.Status, lr.ApprovedBy, lr.ApprovedAt, lr.CreatedAt,
             image.ImageURL
      FROM LostReports lr
      LEFT JOIN Users u ON lr.UserID = u.UserID
      LEFT JOIN Categories c ON lr.CategoryID = c.CategoryID
      LEFT JOIN Locations l ON lr.LocationID = l.LocationID
      OUTER APPLY (SELECT TOP 1 ImageURL FROM ItemImages WHERE LostReportID = lr.LostReportID ORDER BY IsPrimary DESC, ImageID) image
      WHERE 1 = 1
    `;
    const request = pool.request();

    // Pending posts are visible only to their author and management roles.
    // Unauthenticated visitors can only receive already reviewed posts.
    const isAdminOrStaff = req.authUser?.roleId === 2 || req.authUser?.roleId === 3;
    if (!isAdminOrStaff) {
      if (req.authUser) {
        query += ' AND (lr.Status <> \'PENDING\' OR lr.UserID = @viewerUserId)';
        request.input('viewerUserId', sql.Int, req.authUser.userId);
      } else {
        query += " AND lr.Status <> 'PENDING'";
      }
    }

    if (search) {
      query += ` AND (LOWER(lr.Title) LIKE '%' + LOWER(@search) + '%' OR LOWER(lr.Description) LIKE '%' + LOWER(@search) + '%')`;
      request.input('search', sql.NVarChar(200), search.toString());
    }
    if (categoryId) {
      query += ` AND lr.CategoryID = @categoryId`;
      request.input('categoryId', sql.Int, Number(categoryId));
    }
    if (status) {
      query += ` AND lr.Status = @status`;
      request.input('status', sql.VarChar(30), status.toString());
    }

    query += ' ORDER BY lr.CreatedAt DESC';

    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tải báo mất đồ.', error: (error as Error).message });
  }
});

// POST /lost-reports: tạo báo mất mới (kèm upload ảnh)
router.post('/lost-reports', uploadImages.array('images', 10), async (req: Request, res: Response) => {
  const { UserID, CategoryID, LocationID, Title, Description, LostDate, DistinguishingFeatures, RewardAmount } = req.body;

  if (!UserID || !CategoryID || !Title) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
  }

  try {
    const pool = await sql.connect(config);
    const insert = await pool.request()
      .input('UserID', sql.Int, Number(UserID))
      .input('CategoryID', sql.Int, Number(CategoryID))
      .input('LocationID', sql.Int, LocationID ? Number(LocationID) : null)
      .input('Title', sql.NVarChar(200), Title)
      .input('Description', sql.NVarChar(sql.MAX), Description || '')
      .input('LostDate', sql.DateTime2, LostDate || new Date().toISOString())
      .input('DistinguishingFeatures', sql.NVarChar(sql.MAX), DistinguishingFeatures || '')
      .input('RewardAmount', sql.Decimal(12, 2), RewardAmount || 0)
      .query(`INSERT INTO LostReports (UserID, CategoryID, LocationID, Title, Description, LostDate, DistinguishingFeatures, RewardAmount, Status, ApprovedBy, ApprovedAt, CreatedAt)
              OUTPUT INSERTED.LostReportID
              VALUES (@UserID, @CategoryID, @LocationID, @Title, @Description, @LostDate, @DistinguishingFeatures, @RewardAmount, 'PENDING', NULL, NULL, GETDATE())`);

    const lostReportId = insert.recordset[0]?.LostReportID;
    const images = (req.files as Express.Multer.File[] | undefined) || [];
    for (const [index, image] of images.entries()) {
      await pool.request()
        .input('LostReportID', sql.Int, lostReportId)
        .input('ImageURL', sql.VarChar(500), `/uploads/${image.filename}`)
        .input('IsPrimary', sql.Bit, index === 0)
        .query('INSERT INTO ItemImages (LostReportID, ImageURL, IsPrimary) VALUES (@LostReportID, @ImageURL, @IsPrimary)');
    }
    await addAuditLog('CREATE_LOST_REPORT', 'LostReports', lostReportId ?? null, Number(UserID), `Báo mất đồ: ${Title}`);

    const result = await pool.request().input('LostReportID', sql.Int, lostReportId).query(`
      SELECT lr.LostReportID, lr.UserID, u.FullName AS UserName, u.Phone AS UserPhone,
             lr.CategoryID, c.CategoryName, lr.LocationID, l.LocationName,
             lr.Title, lr.Description, lr.LostDate, lr.DistinguishingFeatures,
             lr.RewardAmount, lr.Status, lr.ApprovedBy, lr.ApprovedAt, lr.CreatedAt,
             image.ImageURL
      FROM LostReports lr
      LEFT JOIN Users u ON lr.UserID = u.UserID
      LEFT JOIN Categories c ON lr.CategoryID = c.CategoryID
      LEFT JOIN Locations l ON lr.LocationID = l.LocationID
      OUTER APPLY (SELECT TOP 1 ImageURL FROM ItemImages WHERE LostReportID = lr.LostReportID ORDER BY IsPrimary DESC, ImageID) image
      WHERE lr.LostReportID = @LostReportID
    `);

    return res.status(201).json(result.recordset[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tạo báo mất đồ.', error: (error as Error).message });
  }
});

// PUT /lost-reports/:id/status: cập nhật trạng thái báo mất (duyệt/từ chối)
router.put('/lost-reports/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { Status, ApprovedBy } = req.body;

  try {
    const pool = await sql.connect(config);
    const reportCheck = await pool.request().input('LostReportID', sql.Int, Number(id)).query('SELECT * FROM LostReports WHERE LostReportID = @LostReportID');
    if (reportCheck.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy báo mất đồ.' });
    }

    await pool.request()
      .input('Status', sql.VarChar(30), Status)
      .input('ApprovedBy', sql.Int, ApprovedBy ?? null)
      .input('LostReportID', sql.Int, Number(id))
      .query(`
        UPDATE LostReports
        SET Status = @Status,
            ApprovedBy = @ApprovedBy,
            ApprovedAt = GETDATE()
        WHERE LostReportID = @LostReportID
      `);

    await addAuditLog('UPDATE_LOST_REPORT_STATUS', 'LostReports', Number(id), ApprovedBy || 1, `Cập nhật trạng thái báo mất -> ${Status}`);

    const result = await pool.request().input('LostReportID', sql.Int, Number(id)).query(`
      SELECT lr.LostReportID, lr.UserID, u.FullName AS UserName, u.Phone AS UserPhone,
             lr.CategoryID, c.CategoryName, lr.LocationID, l.LocationName,
             lr.Title, lr.Description, lr.LostDate, lr.DistinguishingFeatures,
             lr.RewardAmount, lr.Status, lr.ApprovedBy, lr.ApprovedAt, lr.CreatedAt,
             image.ImageURL
      FROM LostReports lr
      LEFT JOIN Users u ON lr.UserID = u.UserID
      LEFT JOIN Categories c ON lr.CategoryID = c.CategoryID
      LEFT JOIN Locations l ON lr.LocationID = l.LocationID
      OUTER APPLY (SELECT TOP 1 ImageURL FROM ItemImages WHERE LostReportID = lr.LostReportID ORDER BY IsPrimary DESC, ImageID) image
      WHERE lr.LostReportID = @LostReportID
    `);

    return res.json(result.recordset[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể cập nhật trạng thái báo mất.', error: (error as Error).message });
  }
});

export default router;
