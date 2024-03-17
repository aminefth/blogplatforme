import express from 'express';
import { Types } from 'mongoose';
import crypto from 'crypto';

import { TokenRefreshResponse } from '../../core/ApiResponse';
import { ProtectedRequest } from 'app-request';
import { AuthFailureError } from '../../core/ApiError';
import JWT from '../../core/JWT';
import UserRepo from '../../database/repository/UserRepo';
import KeystoreRepo from '../../database/repository/KeystoreRepo';
import {
  validateTokenData,
  createTokens,
  getAccessToken,
} from '../../auth/authUtils';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import asyncHandler from '../../helpers/asyncHandler';

const router = express.Router();

/**
 * Refresh access token route
 * POST /refresh
 */
router.post(
  '/refresh',
  validator(schema.auth, ValidationSource.HEADER),
  validator(schema.refreshToken),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // Get the access token from the request headers
    req.accessToken = getAccessToken(req.headers.authorization);

    // Decode and validate the access token payload
    const accessTokenPayload = await JWT.decode(req.accessToken);
    validateTokenData(accessTokenPayload);

    // Find the user by ID
    const user = await UserRepo.findById(
      new Types.ObjectId(accessTokenPayload.sub),
    );
    if (!user) throw new AuthFailureError('User not registered');
    req.user = user;

    // Validate and decode the refresh token payload
    const refreshTokenPayload = await JWT.validate(req.body.refreshToken);
    validateTokenData(refreshTokenPayload);

    // Check if the access token and refresh token belong to the same user
    if (accessTokenPayload.sub !== refreshTokenPayload.sub)
      throw new AuthFailureError('Invalid access token');

    // Find the keystore for the user, access token, and refresh token
    const keystore = await KeystoreRepo.find(
      req.user,
      accessTokenPayload.prm,
      refreshTokenPayload.prm,
    );

    if (!keystore) throw new AuthFailureError('Invalid access token');

    // Remove the old keystore
    await KeystoreRepo.remove(keystore._id);

    // Generate new access token and refresh token keys
    const accessTokenKey = crypto.randomBytes(64).toString('hex');
    const refreshTokenKey = crypto.randomBytes(64).toString('hex');

    // Create a new keystore for the user with the new keys
    await KeystoreRepo.create(req.user, accessTokenKey, refreshTokenKey);

    // Create new access token and refresh token
    const tokens = await createTokens(
      req.user,
      accessTokenKey,
      refreshTokenKey,
    );

    // Send the token refresh response
    new TokenRefreshResponse(
      'Token Issued',
      tokens.accessToken,
      tokens.refreshToken,
    ).send(res);
  }),
);

export default router;
