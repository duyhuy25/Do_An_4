import { Router, Request, Response } from 'express';
import { sql, config, addAuditLog } from '../config/db';
import { User } from '../types';
import { createAccessToken } from '../middleware/optionalAuth';

const router = Router();

// POST /auth/register: đăng ký tài khoản sinh viên mới
router.post('/auth/register', async (req: Request, res: Response) => {
  const { FullName, Email, Password, StudentCode, Phone, ClassName } = req.body;

  if (!FullName || !Email || !Password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu.' });
  }

  try {
    const pool = await sql.connect(config);

    const existing = await pool.request()
      .input('Email', sql.VarChar(100), Email)
      .query('SELECT TOP 1 UserID FROM Users WHERE LOWER(Email) = LOWER(@Email)');

    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: 'Email này đã được đăng ký trên hệ thống.' });
    }

    const generatedStudentCode = StudentCode || `SV${Date.now().toString().slice(-6)}`;

    const insertResult = await pool.request()
      .input('RoleID', sql.Int, 1)
      .input('StudentCode', sql.VarChar(20), generatedStudentCode)
      .input('FullName', sql.NVarChar(100), FullName)
      .input('Email', sql.VarChar(100), Email)
      .input('Phone', sql.VarChar(15), Phone || '')
      .input('PasswordHash', sql.VarChar(255), Password)
      .input('ClassName', sql.NVarChar(100), ClassName || 'Chưa cập nhật')
      .query(`INSERT INTO Users (RoleID, StudentCode, FullName, Email, Phone, PasswordHash, ClassName, CreatedAt)
              OUTPUT INSERTED.UserID
              VALUES (@RoleID, @StudentCode, @FullName, @Email, @Phone, @PasswordHash, @ClassName, GETDATE())`);

    const userId = insertResult.recordset[0]?.UserID;

    const userRow = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(`SELECT u.UserID, u.RoleID, u.StudentCode, u.FullName, u.Email, u.Phone, u.PasswordHash AS Password, r.RoleName, u.ClassName
              FROM Users u
              INNER JOIN Roles r ON u.RoleID = r.RoleID
              WHERE u.UserID = @UserID`);

    const newUser = userRow.recordset[0] as User;
    await addAuditLog('REGISTER_USER', 'Users', newUser.UserID, newUser.UserID, `Sinh viên đăng ký tài khoản: ${FullName} (${Email})`);

    const { Password: _, ...userResult } = newUser;
    return res.status(201).json({ ...userResult, AccessToken: createAccessToken(newUser) });
  } catch (error) {
    return res.status(500).json({ message: 'Đăng ký thất bại.', error: (error as Error).message });
  }
});

// POST /auth/login: đăng nhập bằng Email và Password
router.post('/auth/login', async (req: Request, res: Response) => {
  const { Email, Password } = req.body;

  if (!Email || !Password) {
    return res.status(400).json({ message: 'Vui lòng nhập Email và Mật khẩu.' });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('Email', sql.VarChar(100), Email)
      .input('Password', sql.VarChar(255), Password)
      .query(`SELECT u.UserID, u.RoleID, u.StudentCode, u.FullName, u.Email, u.Phone, u.PasswordHash AS Password, r.RoleName, u.ClassName
              FROM Users u
              INNER JOIN Roles r ON u.RoleID = r.RoleID
              WHERE LOWER(u.Email) = LOWER(@Email) AND u.PasswordHash = @Password`);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
    }

    const user = result.recordset[0] as User;
    await addAuditLog('LOGIN_USER', 'Users', user.UserID, user.UserID, `Người dùng đăng nhập: ${user.FullName} (${user.RoleName})`);

    const { Password: _, ...userResult } = user;
    return res.json({ ...userResult, AccessToken: createAccessToken(user) });
  } catch (error) {
    return res.status(500).json({ message: 'Đăng nhập thất bại.', error: (error as Error).message });
  }
});

export default router;
