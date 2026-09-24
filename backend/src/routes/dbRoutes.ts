import { Router, Request, Response } from 'express';
import { testConnection } from '../config/db';

const router = Router();

// GET /db/test: kiểm tra kết nối tới cơ sở dữ liệu (diagnostic)
router.get('/db/test', async (req: Request, res: Response) => {
  const result = await testConnection();

  if (!result.success) {
    return res.status(500).json(result);
  }

  res.json(result);
});

export default router;
