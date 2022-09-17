import multer from 'multer';
import express from 'express';
import { FILE_ROUTES } from 'src/types/backendAndFrontendCommonTypes/routes';
import { uploadFile } from 'src/controllers/file/uploadFile';
import { getFile } from 'src/controllers/file/getFile';

const upload = multer({
  dest: './src/uploads',
  // you might also want to set some limits: https://github.com/expressjs/multer#limits
});

const fileRouter = express.Router();

// @ts-ignore
fileRouter.post(FILE_ROUTES.UPLOAD, upload.single('file'), uploadFile); // @ts-ignore
fileRouter.get(FILE_ROUTES.GET, getFile);

export { fileRouter };
