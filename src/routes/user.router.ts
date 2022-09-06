import express from 'express';
import { registerUser } from '@/controllers/user/registerUser';
import { loginUser } from '@/controllers/user/loginUser';
import { searchUsers } from '@controllers/user/searchUsers';
import { whoAmI } from '@controllers/user/whoAmI';
import { verifyToken } from '@/middleware/auth';
import { USER_ROUTES } from '@/types/backendAndFrontendCommonTypes/routes';

const userRouter = express.Router();

// @ts-ignore
userRouter.post(USER_ROUTES.REGISTER, registerUser);
// @ts-ignore
userRouter.post(USER_ROUTES.LOGIN, loginUser);
// @ts-ignore
userRouter.get(USER_ROUTES.SEARCH_USERS, verifyToken, searchUsers);
// @ts-ignore
userRouter.get(USER_ROUTES.WHO_AM_I, verifyToken, whoAmI);

export { userRouter };
