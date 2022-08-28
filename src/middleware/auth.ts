import { verify } from 'jsonwebtoken';
import { NextFunction } from 'express';
import { TypedRequestBody, TypedResponse } from '@/types/express';

const config = process.env;

export const verifyToken = (req: TypedRequestBody, res: TypedResponse<string>, next?: NextFunction) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(403).send('You did not pass auth token!');
  }

  try {
    // @ts-ignore
    const decoded = verify(token, config.TOKEN_KEY);
    // @ts-ignore
    req.user = decoded;
  } catch (e) {
    return res.status(403).send('Invalid token');
  }

  return next ? next() : undefined;
};
