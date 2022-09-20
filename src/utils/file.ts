import path from 'path';

export function getFileExtension(file: Express.Multer.File) {
  if (file) {
    return path.extname(file.originalname).toLowerCase();
  }
  return '';
}

export function clearResultPathFromRootDir(resultPath: string) {
  // @ts-ignore
  return resultPath.replace(process.env.ROOT_DIR, '');
}
