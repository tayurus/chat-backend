import path from 'path';

export function getFileExtension(file: Express.Multer.File) {
  if (file) {
    return path.extname(file.originalname).toLowerCase();
  }
  return '';
}
