import { verify } from 'jsonwebtoken';
import { NextFunction } from 'express';
import { TypedRequestBody, TypedResponse } from 'src/types/express';
import { ERROR_MESSAGES } from 'src/utils/errorMessages';

const config = process.env;

export const verifyToken = (req: TypedRequestBody, res: TypedResponse<string>, next?: NextFunction) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(403).send(ERROR_MESSAGES.TOKEN_REQUIRED);
  }

  try {
    // @ts-ignore
    const decoded = verify(token, config.TOKEN_KEY);
    // @ts-ignore
    req.user = decoded;
  } catch (e) {
    return res.status(403).send(ERROR_MESSAGES.INVALID_TOKEN);
  }

  return next ? next() : undefined;
};
