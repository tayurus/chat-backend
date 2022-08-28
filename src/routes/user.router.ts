import express from 'express';
import { registerUser } from '@/controllers/user/registerUser';
import { loginUser } from '@/controllers/user/loginUser';
import { searchUsers } from '@controllers/user/searchUsers';
import { whoAmI } from '@controllers/user/whoAmI';
import { verifyToken } from '@/middleware/auth';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/search', searchUsers);
userRouter.get('/whoAmI', verifyToken, whoAmI);

export { userRouter };
