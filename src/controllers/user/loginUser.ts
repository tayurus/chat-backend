import { User } from '@/model/user';
import { compare } from 'bcryptjs';
import { TypedRequestBody, TypedResponse } from '@/types/express';
import { LoginUserBodyParams } from '@/types/backendParams';
import { ERROR_MESSAGES } from '@utils/errorMessages';
import { LoginUserResponse } from '@/types/backendResponses';
import { signUser } from '@utils/user';

export const loginUser = async (req: TypedRequestBody<LoginUserBodyParams>, res: TypedResponse<LoginUserResponse>) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send(ERROR_MESSAGES.INVALID_DATA);
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (user && (await compare(password, user.password!))) {
      const token = signUser({ id: user._id.toString(), email, last_name: user.last_name, first_name: user.first_name });

      user.token = token;

      res.cookie('token', token, { maxAge: 900000 });

      return res.status(200).json({ id: user._id.toString(), first_name: user.first_name, last_name: user.last_name, email: user.email });
    } else {
      return res.status(400).send(ERROR_MESSAGES.USER_NOT_FOUND);
    }
  } catch (e) {
    return res.status(400).send(ERROR_MESSAGES.USER_NOT_FOUND);
  }
};

module.exports = { loginUser };
