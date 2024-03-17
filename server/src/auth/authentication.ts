import express, { Router, Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { ProtectedRequest } from 'app-request';
import {
  AuthFailureError,
  AccessTokenError,
  TokenExpiredError,
} from '../core/ApiError';
import JWT from '../core/JWT';
import UserRepo from '../database/repository/UserRepo';
import KeystoreRepo from '../database/repository/KeystoreRepo';
import { getAccessToken, validateTokenData } from './authUtils';
import validator, { ValidationSource } from '../helpers/validator';
import schema from './schema';
import asyncHandler from '../helpers/asyncHandler';

const router: Router = express.Router();

const authenticateAndAuthorize = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    const { authorization } = req.headers;
    if (!authorization) {
      throw new AuthFailureError('Authorization header missing');
    }

    const accessToken = getAccessToken(authorization);
    const payload = await JWT.validate(accessToken);
    validateTokenData(payload);

    const userId = new Types.ObjectId(payload.sub);
    const user = await UserRepo.findById(userId);
    if (!user) {
      throw new AuthFailureError('User not registered');
    }
    req.user = user;

    const keystore = await KeystoreRepo.findforKey(req.user, payload.prm);
    if (!keystore) {
      throw new AuthFailureError('Invalid access token');
    }
    req.keystore = keystore;

    return next();
  },
);

router.use(
  validator(schema.auth, ValidationSource.HEADER),
  authenticateAndAuthorize,
);

export default router;
