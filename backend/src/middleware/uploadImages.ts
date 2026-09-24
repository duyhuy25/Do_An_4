import fs from 'fs';
import path from 'path';
import multer from 'multer';

const uploadDirectory = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
    callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
  }
});

const imageFilter: multer.Options['fileFilter'] = (_req, file, callback) => {
  if (file.mimetype.startsWith('image/')) {
    callback(null, true);
    return;
  }
  callback(new Error('Chỉ hỗ trợ tệp hình ảnh.'));
};

export const uploadImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { files: 10, fileSize: 5 * 1024 * 1024 }
});
