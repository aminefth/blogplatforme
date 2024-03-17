import express from 'express';
import { ProtectedRequest } from 'app-request';
import { AuthFailureError } from '../core/ApiError';
import RoleRepo from '../database/repository/RoleRepo';
import asyncHandler from '../helpers/asyncHandler';

const router = express.Router();

/**
 * Middleware for authorization.
 * This middleware checks if the user has the required roles to access the route.
 * If the user is not authorized, it throws an AuthFailureError.
 * @param req The request object.
 * @param res The response object.
 * @param next The next middleware function.
 */
export default router.use(
  asyncHandler(async (req: ProtectedRequest, res, next) => {
    // Check if the user, user roles, and current role codes are present in the request
    if (!req.user || !req.user.roles || !req.currentRoleCodes)
      throw new AuthFailureError('Permission denied');

    // Find the roles based on the current role codes
    const roles = await RoleRepo.findByCodes(req.currentRoleCodes);

    // If no roles are found, throw an AuthFailureError
    if (roles.length === 0) throw new AuthFailureError('Permission denied');

    let authorized = false;

    // Check if the user has any of the required roles
    for (const userRole of req.user.roles) {
      if (authorized) break;
      for (const role of roles) {
        if (userRole._id.equals(role._id)) {
          authorized = true;
          break;
        }
      }
    }

    // If the user is not authorized, throw an AuthFailureError
    if (!authorized) throw new AuthFailureError('Permission denied');

    return next();
  }),
);
