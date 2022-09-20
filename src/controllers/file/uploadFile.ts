import { TypedRequestBody, TypedResponse } from 'src/types/express';
import { ERROR_MESSAGES } from 'src/utils/errorMessages';
import * as fs from 'fs';
import { getFileExtension } from 'src/utils/file';
import { UploadFileResponse, UploadFileSuccessResponse } from 'src/types/backendResponses';
import { UploadFileQueryParams } from 'src/types/backendParams';
import { User } from 'src/model/user';

const handleError = (err: any, res: any) => {
  res.status(500).send(`Oops! Something went wrong! ${JSON.stringify(err)}`);
};

async function updateUserProfilePhoto(params: { userId: string; profilePhotoUrl: string }) {
  const { userId, profilePhotoUrl } = params;
  await User.findByIdAndUpdate(userId, { profilePhoto: profilePhotoUrl });
}

export const uploadFile = async (req: TypedRequestBody<{}, UploadFileQueryParams>, res: TypedResponse<UploadFileResponse>) => {
  if (req.file) {
    const {
      user: { user_id },
    } = req;
    const responseBody: UploadFileSuccessResponse = { url: '' };
    const tempPath = req.file.path;
    const fileExtension = getFileExtension(req.file);
    const resultPath = tempPath + fileExtension;

    fs.rename(tempPath, resultPath, async err => {
      if (err) return handleError(err, res);
      try {
        await updateUserProfilePhoto({ userId: user_id, profilePhotoUrl: resultPath });
      } catch (e) {
        res.status(400).send(ERROR_MESSAGES.UPDATE_USER_PROFILE_FAILED);
      }
      responseBody.url = resultPath;
      res.status(200).send(responseBody);
    });
  } else {
    res.status(400).send(ERROR_MESSAGES.FILE_IS_REQUIRED);
  }
};
