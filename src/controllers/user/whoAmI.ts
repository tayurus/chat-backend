import { TypedRequestBody, TypedResponse } from 'src/types/express';
import { WhoAmIResponse } from 'src/types/backendResponses';
import { User } from 'src/model/user';
import { ERROR_MESSAGES } from 'src/utils/errorMessages';

export const whoAmI = async (req: TypedRequestBody, res: TypedResponse<WhoAmIResponse>) => {
  try {
    // @ts-ignore
    const { user } = req;
    const { user_id } = user;
    const userInfo = await User.findById(user_id);
    if (userInfo) {
      const { first_name, last_name, _id, email, profilePhoto } = userInfo;
      return res.status(200).send({ first_name, id: _id.toString(), last_name, email, profilePhoto });
    } else {
      res.status(400).send(ERROR_MESSAGES.USER_NOT_FOUND);
    }
  } catch (e) {
    return res.status(400).send(JSON.stringify(e));
  }
};
