import { TypedRequestBody, TypedResponse } from 'src/types/express';
import { ERROR_MESSAGES } from 'src/utils/errorMessages';
import * as fs from 'fs';
import { getFileExtension } from 'src/utils/file';

const handleError = (err: any, res: any) => {
  res.status(500).send(`Oops! Something went wrong! ${JSON.stringify(err)}`);
};

export const uploadFile = async (req: TypedRequestBody, res: TypedResponse<any>) => {
  console.log('YA TUT');
  if (req.file) {
    const tempPath = req.file.path;
    const fileExtension = getFileExtension(req.file);
    const resultPath = tempPath + fileExtension;

    fs.rename(tempPath, resultPath, err => {
      if (err) return handleError(err, res);

      res.status(200).send(resultPath);
    });
  } else {
    res.status(400).send(ERROR_MESSAGES.FILE_IS_REQUIRED);
  }
};

// app.get('/uploads/:name', function (request, response) {
//   response.sendFile(path.join(__dirname, './uploads/376x376.jpg'));
// });
