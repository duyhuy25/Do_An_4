import { Router, Request, Response } from 'express';
import { sql, config, addAuditLog } from '../config/db';

const router = Router();

// GET /claims: lấy danh sách yêu cầu nhận đồ (Claims)
router.get('/claims', async (req: Request, res: Response) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT c.ClaimID, c.ItemID, i.ItemName, c.UserID, u.FullName AS UserName, u.Email AS UserEmail,
             u.Phone AS UserPhone, c.ClaimReason, c.OwnershipEvidence, c.Status,
             c.SubmittedAt, c.ReviewedBy, c.ReviewedAt, c.RejectionReason
      FROM Claims c
      INNER JOIN Items i ON c.ItemID = i.ItemID
      INNER JOIN Users u ON c.UserID = u.UserID
      ORDER BY c.SubmittedAt DESC
    `);
    return res.json(result.recordset);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tải yêu cầu nhận đồ.', error: (error as Error).message });
  }
});

// POST /claims: tạo yêu cầu nhận đồ (người dùng gửi bằng chứng)
router.post('/claims', async (req: Request, res: Response) => {
  const { ItemID, UserID, UserName, UserEmail, UserPhone, ClaimReason, OwnershipEvidence } = req.body;

  if (!ItemID || !UserID) {
    return res.status(400).json({ message: 'Thiếu thông tin vật phẩm hoặc người dùng.' });
  }

  try {
    const pool = await sql.connect(config);
    const item = await pool.request().input('ItemID', sql.Int, Number(ItemID)).query('SELECT ItemID, ItemName FROM Items WHERE ItemID = @ItemID');
    const user = await pool.request().input('UserID', sql.Int, Number(UserID)).query('SELECT UserID, FullName, Email, Phone FROM Users WHERE UserID = @UserID');

    if (item.recordset.length === 0 || user.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy vật phẩm hoặc người dùng.' });
    }

    const itemInfo = item.recordset[0];
    const userInfo = user.recordset[0];

    const insert = await pool.request()
      .input('ItemID', sql.Int, Number(ItemID))
      .input('UserID', sql.Int, Number(UserID))
      .input('ClaimReason', sql.NVarChar(sql.MAX), ClaimReason || '')
      .input('OwnershipEvidence', sql.NVarChar(sql.MAX), OwnershipEvidence || '')
      .query(`INSERT INTO Claims (ItemID, UserID, ClaimReason, OwnershipEvidence, Status, SubmittedAt)
              OUTPUT INSERTED.ClaimID
              VALUES (@ItemID, @UserID, @ClaimReason, @OwnershipEvidence, 'PENDING', GETDATE())`);

    const claimId = insert.recordset[0]?.ClaimID;
    await addAuditLog('CREATE_CLAIM', 'Claims', claimId ?? null, Number(UserID), `Yêu cầu nhận đồ: ${itemInfo.ItemName}`);

    const result = await pool.request().input('ClaimID', sql.Int, claimId).query(`
      SELECT c.ClaimID, c.ItemID, i.ItemName, c.UserID, u.FullName AS UserName, u.Email AS UserEmail,
             u.Phone AS UserPhone, c.ClaimReason, c.OwnershipEvidence, c.Status,
             c.SubmittedAt, c.ReviewedBy, c.ReviewedAt, c.RejectionReason
      FROM Claims c
      INNER JOIN Items i ON c.ItemID = i.ItemID
      INNER JOIN Users u ON c.UserID = u.UserID
      WHERE c.ClaimID = @ClaimID
    `);

    return res.status(201).json(result.recordset[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể tạo yêu cầu nhận đồ.', error: (error as Error).message });
  }
});

// PUT /claims/:id/status: admin xử lý yêu cầu nhận đồ (duyệt/từ chối)
router.put('/claims/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { Status, RejectionReason, ReviewedBy } = req.body;

  try {
    const pool = await sql.connect(config);
    const claim = await pool.request().input('ClaimID', sql.Int, Number(id)).query('SELECT * FROM Claims WHERE ClaimID = @ClaimID');
    if (claim.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu nhận đồ.' });
    }

    await pool.request()
      .input('Status', sql.VarChar(30), Status)
      .input('ReviewedBy', sql.Int, ReviewedBy ?? null)
      .input('RejectionReason', sql.NVarChar(sql.MAX), RejectionReason ?? null)
      .input('ClaimID', sql.Int, Number(id))
      .query(`
        UPDATE Claims
        SET Status = @Status,
            ReviewedBy = @ReviewedBy,
            ReviewedAt = GETDATE(),
            RejectionReason = @RejectionReason
        WHERE ClaimID = @ClaimID
      `);

    await addAuditLog('UPDATE_CLAIM_STATUS', 'Claims', Number(id), ReviewedBy || 1, `Xử lý yêu cầu nhận đồ -> ${Status}`);

    const updated = await pool.request().input('ClaimID', sql.Int, Number(id)).query(`
      SELECT c.ClaimID, c.ItemID, i.ItemName, c.UserID, u.FullName AS UserName, u.Email AS UserEmail,
             u.Phone AS UserPhone, c.ClaimReason, c.OwnershipEvidence, c.Status,
             c.SubmittedAt, c.ReviewedBy, c.ReviewedAt, c.RejectionReason
      FROM Claims c
      INNER JOIN Items i ON c.ItemID = i.ItemID
      INNER JOIN Users u ON c.UserID = u.UserID
      WHERE c.ClaimID = @ClaimID
    `);

    return res.json(updated.recordset[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Không thể cập nhật yêu cầu nhận đồ.', error: (error as Error).message });
  }
});

export default router;
