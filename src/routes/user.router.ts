import express from 'express';
import { registerUser } from 'src/controllers/user/registerUser';
import { loginUser } from 'src/controllers/user/loginUser';
import { searchUsers } from 'src/controllers/user/searchUsers';
import { whoAmI } from 'src/controllers/user/whoAmI';
import { verifyToken } from 'src/middleware/auth';
import { updateUserPassword } from 'src/controllers/user/updateUserPassword';
import { USER_ROUTES } from 'src/types/backendAndFrontendCommonTypes/routes';
import { removeProfilePhoto } from 'src/controllers/user/removeProfilePhoto';

const userRouter = express.Router();

// @ts-ignore
userRouter.post(USER_ROUTES.REGISTER, registerUser);
// @ts-ignore
userRouter.post(USER_ROUTES.LOGIN, loginUser);
// @ts-ignore
userRouter.get(USER_ROUTES.SEARCH_USERS, verifyToken, searchUsers);
// @ts-ignore
userRouter.get(USER_ROUTES.WHO_AM_I, verifyToken, whoAmI);
// @ts-ignore
userRouter.post(USER_ROUTES.UPDATE_PASSWORD, verifyToken, updateUserPassword);
// @ts-ignore
userRouter.delete(USER_ROUTES.REMOVE_PROFILE_PHOTO, verifyToken, removeProfilePhoto);

export { userRouter };
