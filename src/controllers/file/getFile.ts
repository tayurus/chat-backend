import { TypedRequestBody } from 'src/types/express';

export const getFile = async (req: TypedRequestBody<{}, {}, { filename: string }>, res: any) => {
  res.sendFile(`uploads/${req.params.filename}`, { root: './src/' });
};
