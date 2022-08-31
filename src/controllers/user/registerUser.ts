import { User } from '@/model/user';
import { TypedRequestBody, TypedResponse } from '@/types/express';
import { RegisterUserBodyParams } from '@/types/backendParams';
import { RegisterUserResponse } from '@/types/backendResponses';
import { hash } from 'bcryptjs';
import { ERROR_MESSAGES } from '@utils/errorMessages';
import { signUser } from '@utils/user';

export const registerUser = async (req: TypedRequestBody<RegisterUserBodyParams>, res: TypedResponse<RegisterUserResponse | string>) => {
  // Our register logic starts here
  try {
    // Get user input
    const { first_name, last_name, email, password } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      return res.status(400).send(ERROR_MESSAGES.ALL_INPUT_IS_REQUIRED);
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    //Encrypt user password
    const encryptedPassword = await hash(password, 10);

    // Create user in our database
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = signUser({ id: user._id.toString(), email, last_name: user.last_name, first_name: user.first_name });
    // save user token
    user.token = token;

    res.cookie('token', token, { maxAge: 900000 });

    const userForFrontend = {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      id: user._id.toString(),
    };

    // return new user
    return res.status(201).send(userForFrontend);
  } catch (err) {
    console.log(err);
    return res.status(400).send(ERROR_MESSAGES.REGISTER_ERROR);
  }
  // Our register logic ends here
};

module.exports = { registerUser };
