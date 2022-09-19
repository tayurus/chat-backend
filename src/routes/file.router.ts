import multer from 'multer';
import express from 'express';
import { FILE_ROUTES } from 'src/types/backendAndFrontendCommonTypes/routes';
import { uploadFile } from 'src/controllers/file/uploadFile';
import { getFile } from 'src/controllers/file/getFile';
import { FILE_UPLOAD } from 'src/types/backendAndFrontendCommonTypes/constants';
import { TypedRequestBody } from 'src/types/express';
import { UploadFileQueryParams } from 'src/types/backendParams';
import { getFileExtension } from 'src/utils/file';
import { ERROR_MESSAGES } from 'src/utils/errorMessages';

const ONE_KILOBYTE = 1024;
const ONE_MEGABYTE = ONE_KILOBYTE * ONE_KILOBYTE;
const MAX_FILE_SIZE = 10 * ONE_MEGABYTE;

type FILE_RESTRICTIONS = {
  mimetype: string[];
  fileSize: number;
};

const FILE_RESTRICTIONS_BY_TYPE: Record<FILE_UPLOAD, FILE_RESTRICTIONS> = {
  [FILE_UPLOAD.USER_PROFILE_PHOTO]: { mimetype: ['image/png', 'image/jpeg'], fileSize: ONE_MEGABYTE },
};

const upload = multer({
  dest: `./src${FILE_ROUTES.UPLOAD_STORAGE}`,
  fileFilter(req: TypedRequestBody<{}, UploadFileQueryParams>, file: Express.Multer.File, callback: multer.FileFilterCallback) {
    const fileRestrictions = FILE_RESTRICTIONS_BY_TYPE[req.query.type];
    if (fileRestrictions.mimetype.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE));
    }
  },
  // limits: { fileSize: MAX_FILE_SIZE },
}).single('file');

const fileRouter = express.Router();

// @ts-ignore
fileRouter.post(
  FILE_ROUTES.UPLOAD,
  (req, res, next) => {
    // @ts-ignore
    upload(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        console.log('1 = ', err);
      } else if (err) {
        console.log('2 = ', err);
        res.status(400).send(err.toString());
        // An unknown error occurred when uploading.
      } else {
        next!();
      }
    });
  },
  // @ts-ignore
  uploadFile,
); // @ts-ignore
fileRouter.get(FILE_ROUTES.GET, getFile);

export { fileRouter };
