import { Router } from 'express';
import { ProtectedRequest } from 'app-request';
import { SuccessMsgResponse } from '../../core/ApiResponse';
import KeystoreRepo from '../../database/repository/KeystoreRepo';
import asyncHandler from '../../helpers/asyncHandler';
import authentication from '../../auth/authentication';

/**
 * Express router for handling logout requests.
 * @class
 */
const router = Router();

// Apply authentication middleware to all routes in this router
router.use(authentication);

/**
 * Handler for the logout route.
 * @name DELETE /
 * @function
 * @async
 * @param {ProtectedRequest} req - The protected request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>}
 */
router.delete(
  '/',
  asyncHandler(async (req: ProtectedRequest, res) => {
    await KeystoreRepo.remove(req.keystore._id);
    new SuccessMsgResponse('Logout success').send(res);
  }),
);

export default router;
