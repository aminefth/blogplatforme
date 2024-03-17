import Role, { RoleModel } from '../model/Role';

/**
 * Finds a role by its code.
 * @param code - The code of the role to find.
 * @returns A promise that resolves to the found role, or null if not found.
 */
async function findByCode(code: string): Promise<Role | null> {
  return RoleModel.findOne({ code: code, status: true }).lean().exec();
}

/**
 * Finds roles by their codes.
 * @param codes - An array of role codes to find.
 * @returns A promise that resolves to an array of found roles.
 */
async function findByCodes(codes: string[]): Promise<Role[]> {
  return RoleModel.find({ code: { $in: codes }, status: true })
    .lean()
    .exec();
}

export default {
  findByCode,
  findByCodes,
};
