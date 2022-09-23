import { TypedRequestBody, TypedResponse } from 'src/types/express';
import { RemoveProfilePhotoResponse } from 'src/types/backendResponses';
import { User } from 'src/model/user';
import { ERROR_MESSAGES } from 'src/utils/errorMessages';

export const removeProfilePhoto = async (req: TypedRequestBody, res: TypedResponse<RemoveProfilePhotoResponse>) => {
  try {
    // @ts-ignore
    const { user } = req;
    const { user_id } = user;
    const userInfo = await User.findById(user_id);

    if (userInfo) {
      const { profilePhoto } = userInfo;
      if (!profilePhoto) {
        return res.status(400).send(ERROR_MESSAGES.USER_HAS_NOT_PHOTO_PROFILE);
      }
      await User.updateOne({ _id: user_id, profilePhoto: null });
      return res.status(200).send({});
    } else {
      return res.status(400).send(ERROR_MESSAGES.USER_NOT_FOUND);
    }
  } catch (e) {
    return res.status(400).send(JSON.stringify(e));
  }
};
