import multer from 'multer';
import express from 'express';
import { FILE_ROUTES } from 'src/types/backendAndFrontendCommonTypes/routes';
import { uploadFile } from 'src/controllers/file/uploadFile';
import { getFile } from 'src/controllers/file/getFile';
import { FILE_UPLOAD } from 'src/types/backendAndFrontendCommonTypes/constants';

type FILE_RESTRICTIONS = {
  mimetype: string[];
};
const FILE_RESTRICTIONS_BY_TYPE: Record<FILE_UPLOAD, FILE_RESTRICTIONS> = {
  [FILE_UPLOAD.USER_PROFILE_PHOTO]: { mimetype: ['image/png', 'image/jpeg'] },
};

const upload = multer({
  dest: `./src${FILE_ROUTES.UPLOAD_STORAGE}`,
  fileFilter(req: e.Request, file: Express.Multer.File, callback: multer.FileFilterCallback) {
    if ()
  },
  // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

const fileRouter = express.Router();

// @ts-ignore
fileRouter.post(FILE_ROUTES.UPLOAD, upload.single('file'), uploadFile); // @ts-ignore
fileRouter.get(FILE_ROUTES.GET, getFile);

export { fileRouter };
