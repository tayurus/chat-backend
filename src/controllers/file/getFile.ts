import { TypedRequestBody } from 'src/types/express';
import { FILE_ROUTES } from 'src/types/backendAndFrontendCommonTypes/routes';

export const getFile = async (req: TypedRequestBody<{}, {}, { filename: string }>, res: any) => {
  res.sendFile(`${FILE_ROUTES.UPLOAD_STORAGE}/${req.params.filename}`, { root: './src' });
};
