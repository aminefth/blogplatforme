import User, { UserModel } from '../model/User';
import { RoleModel } from '../model/Role';
import { InternalError } from '../../core/ApiError';
import { Types } from 'mongoose';
import KeystoreRepo from './KeystoreRepo';
import Keystore from '../model/Keystore';

/**
 * Creates a new user along with their associated keystore and specific role.
 *
 * @param user - The user object containing the user details.
 * @param accessTokenKey - The access token key for the keystore.
 * @param refreshTokenKey - The refresh token key for the keystore.
 * @param roleCode - The code of the role assigned to the user.
 * @returns An object containing the created user and the associated keystore.
 * @throws {InternalError} If the role is not defined.
 */
async function create(
  user: User,
  accessTokenKey: string,
  refreshTokenKey: string,
  roleCode: string,
): Promise<{ user: User; keystore: Keystore }> {
  const now = new Date();

  const role = await RoleModel.findOne({ code: roleCode })
    .select('+code')
    .lean()
    .exec();
  if (!role) throw new InternalError('Role must be defined');

  user.roles = [role];
  user.createdAt = user.updatedAt = now;
  const createdUser = await UserModel.create(user);
  const keystore = await KeystoreRepo.create(
    createdUser,
    accessTokenKey,
    refreshTokenKey,
  );
  return {
    user: { ...createdUser.toObject(), roles: user.roles },
    keystore: keystore,
  };
}
//! contains critical information of the user and should be protected.
/**
 * Finds a user by their email.
 * @param email - The email of the user to find.
 * @returns A Promise that resolves to the found user or null if not found.
 */
async function findByEmail(email: string): Promise<User | null> {
  return UserModel.findOne({ email })
    .select(
      '+email +password +roles +gender +dob +grade +country +state +city +school +bio +hobbies',
    )
    .populate({
      path: 'roles',
      match: { status: true },
      select: { code: 1 },
    })
    .lean()
    .exec();
}
//! contains critical information of the user and should be protected.
/**
 * Finds a user by their ID.
 * @param id The ID of the user.
 * @returns A promise that resolves to the found user or null if not found.
 */
async function findById(id: Types.ObjectId): Promise<User | null> {
  return UserModel.findById({ _id: id, status: true })
    .select('+email +password +roles')
    .populate({
      path: 'roles',
      match: { status: true },
    })
    .lean()
    .exec();
}
/**
 * Finds a user by their ID and returns the specified fields.
 * @param id - The ID of the user.
 * @param fields - The fields to be returned.
 * @returns A promise that resolves to the user object or null if not found.
 */
async function findFieldsById(
  id: Types.ObjectId,
  ...fields: string[]
): Promise<User | null> {
  return UserModel.findOne(
    {
      _id: id,
      status: true,
    },
    [...fields],
  )
    .lean()
    .exec();
}

/**
 * Finds a public profile by ID.
 * @param id - The ID of the user.
 * @returns A promise that resolves to the user's public profile, or null if not found.
 */
async function findPublicProfileById(id: Types.ObjectId): Promise<User | null> {
  return UserModel.findOne({
    _id: id,
    status: true,
  })
    .lean()
    .exec();
}

/**
 * Finds a private profile by ID.
 * @param id - The ID of the user.
 * @returns A promise that resolves to the user object if found, or null if not found.
 */
async function findPrivateProfileById(
  id: Types.ObjectId,
): Promise<User | null> {
  return UserModel.findOne({ _id: id, status: true })
    .select('+email')
    .populate({
      path: 'roles',
      match: { status: true },
      select: { code: 1 },
    })
    .lean<User>()
    .exec();
}

/**
 * Checks if a user with the specified id exists in the database.
 * @param id - The id of the user.
 * @returns A promise that resolves to a boolean indicating whether the user exists or not.
 */
async function exists(id: Types.ObjectId): Promise<boolean> {
  const user = await UserModel.exists({ _id: id, status: true });
  return user !== null && user !== undefined;
}
/**
 * Updates a user in the database and creates a new keystore.
 * @param user - The user object to be updated.
 * @param accessTokenKey - The access token key for the new keystore.
 * @param refreshTokenKey - The refresh token key for the new keystore.
 * @returns A promise that resolves to an object containing the updated user and the new keystore.
 */
async function update(
  user: User,
  accessTokenKey: string,
  refreshTokenKey: string,
): Promise<{ user: User; keystore: Keystore }> {
  user.updatedAt = new Date();
  await UserModel.updateOne({ _id: user._id }, { $set: { ...user } })
    .lean()
    .exec();
  const keystore = await KeystoreRepo.create(
    user,
    accessTokenKey,
    refreshTokenKey,
  );
  return { user: user, keystore: keystore };
}

/**
 * Updates the information of a user.
 * @param user - The user object containing the updated information.
 * @returns A promise that resolves to the result of the update operation.
 */
async function updateInfo(user: User): Promise<any> {
  user.updatedAt = new Date();
  return UserModel.updateOne({ _id: user._id }, { $set: { ...user } })
    .lean()
    .exec();
}
export default {
  exists,
  findPrivateProfileById,
  findById,
  findByEmail,
  findFieldsById,
  findPublicProfileById,
  create,
  update,
  updateInfo,
};
