import { Router, Request, Response } from 'express';
import { sql, config } from '../config/db';

const router = Router();

// GET /match-suggestions: trả về danh sách gợi ý trùng khớp (MatchSuggestions)
router.get('/match-suggestions', async (req: Request, res: Response) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT ms.MatchID, lr.LostReportID, lr.Title AS LostTitle, ms.ItemID, i.ItemName,
             ms.MatchScore, ms.Reason, ms.Status, ms.CreatedAt
      FROM MatchSuggestions ms
      INNER JOIN LostReports lr ON ms.LostReportID = lr.LostReportID
      INNER JOIN Items i ON ms.ItemID = i.ItemID
      ORDER BY ms.CreatedAt DESC
    `);
    return res.json(result.recordset);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tải gợi ý khớp.', error: (error as Error).message });
  }
});

// GET /admin/stats: trả về số liệu thống kê cho dashboard admin
router.get('/admin/stats', async (req: Request, res: Response) => {
  try {
    const pool = await sql.connect(config);
    const [lostStats, itemStats, claimStats, userStats] = await Promise.all([
      pool.request().query(`SELECT COUNT(*) AS totalLost, SUM(CASE WHEN Status = 'PENDING' THEN 1 ELSE 0 END) AS pendingLost FROM LostReports`),
      pool.request().query(`SELECT COUNT(*) AS totalItems, SUM(CASE WHEN Status = 'STORED' THEN 1 ELSE 0 END) AS storedItems, SUM(CASE WHEN Status = 'RETURNED' THEN 1 ELSE 0 END) AS returnedItems FROM Items`),
      pool.request().query(`SELECT COUNT(*) AS pendingClaims FROM Claims WHERE Status = 'PENDING'`),
      pool.request().query(`SELECT COUNT(*) AS totalUsers FROM Users`)
    ]);

    return res.json({
      totalLost: Number(lostStats.recordset[0]?.totalLost || 0),
      pendingLost: Number(lostStats.recordset[0]?.pendingLost || 0),
      totalItems: Number(itemStats.recordset[0]?.totalItems || 0),
      storedItems: Number(itemStats.recordset[0]?.storedItems || 0),
      returnedItems: Number(itemStats.recordset[0]?.returnedItems || 0),
      pendingClaims: Number(claimStats.recordset[0]?.pendingClaims || 0),
      totalUsers: Number(userStats.recordset[0]?.totalUsers || 0)
    });
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tải thống kê quản trị.', error: (error as Error).message });
  }
});

// GET /admin/reports: trả về danh sách báo cáo vi phạm do người dùng gửi
router.get('/admin/reports', async (req: Request, res: Response) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT r.ReportID, r.ReportedByUserID, u.FullName AS ReportedByName, r.Reason,
             r.Status, r.CreatedAt, r.TargetUserID, r.ItemID, r.LostReportID,
             ISNULL(i.ItemName, lr.Title) AS TargetTitle
      FROM Reports r
      LEFT JOIN Users u ON r.ReportedByUserID = u.UserID
      LEFT JOIN Items i ON r.ItemID = i.ItemID
      LEFT JOIN LostReports lr ON r.LostReportID = lr.LostReportID
      ORDER BY r.CreatedAt DESC
    `);
    return res.json(result.recordset);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tải báo cáo vi phạm.', error: (error as Error).message });
  }
});

// GET /admin/logs: trả về nhật ký hệ thống (audit logs)
router.get('/admin/logs', async (req: Request, res: Response) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT a.LogID, a.Action, a.EntityName, a.EntityID, a.UserID, a.NewValue AS Details, a.CreatedAt
      FROM AuditLogs a
      ORDER BY a.CreatedAt DESC
    `);
    return res.json(result.recordset);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tải nhật ký hệ thống.', error: (error as Error).message });
  }
});

export default router;
