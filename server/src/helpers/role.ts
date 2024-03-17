import { RoleCode } from '../database/model/Role';
import { RoleRequest } from 'app-request';
import { Response, NextFunction } from 'express';

/**
 * Middleware function to set the current role codes in the request object.
 * @param roleCodes The role codes to set.
 */
export default (...roleCodes: RoleCode[]) =>
  (req: RoleRequest, res: Response, next: NextFunction) => {
    req.currentRoleCodes = roleCodes;
    next();
  };
