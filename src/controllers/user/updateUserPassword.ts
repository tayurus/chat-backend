import { User } from 'src/model/user';
import { compare, hash } from 'bcryptjs';
import { TypedRequestBody, TypedResponse } from 'src/types/express';
import { UpdateUserPasswordParams } from 'src/types/backendParams';
import { ERROR_MESSAGES } from 'src/utils/errorMessages';
import { UpdateUserPasswordResponse } from 'src/types/backendResponses';
import { signUser } from 'src/utils/user';

export const loginUser = async (req: TypedRequestBody<UpdateUserPasswordParams>, res: TypedResponse<UpdateUserPasswordResponse>) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { user } = req;
    if (!oldPassword) {
      return res.status(400).send(ERROR_MESSAGES.OLD_PASSWORD_INVALID);
    }

    if (!newPassword) {
      return res.status(400).send(ERROR_MESSAGES.NEW_PASSWORD_IS_REQUIRED);
    }

    const userInDb = await User.findOne({ email: user.email });

    const encryptedPassword = await hash(newPassword, 10);

    await User.updateOne({ email: user.email, password: encryptedPassword });

    const token = signUser({ id: userInDb!._id.toString(), email: user.email, last_name: user.last_name, first_name: user.first_name });

    user.token = token;

    res.cookie('token', token, { maxAge: 900000 });

    const response: UpdateUserPasswordResponse = {};

    return res.status(200).json(response);
  } catch (e) {
    return res.status(400).send(ERROR_MESSAGES.USER_NOT_FOUND);
  }
};
