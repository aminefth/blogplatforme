import Keystore, { KeystoreModel } from '../model/Keystore';
import { Types } from 'mongoose';
import User from '../model/User';

/**
 * Finds a Keystore document for a given client and key.
 * @param client - The client associated with the Keystore document.
 * @param key - The primary key of the Keystore document.
 * @returns A Promise that resolves to the found Keystore document, or null if not found.
 */
async function findforKey(client: User, key: string): Promise<Keystore | null> {
  return KeystoreModel.findOne({
    client: client,
    primaryKey: key,
    status: true,
  })
    .lean()
    .exec();
}
/**
 * Removes a keystore document from the database.
 * @param id - The ID of the keystore document to remove.
 * @returns A promise that resolves to the removed keystore document, or null if not found.
 */
async function remove(id: Types.ObjectId): Promise<Keystore | null> {
  return KeystoreModel.findByIdAndDelete(id).lean().exec();
}

/**
 * Removes all keystore entries for a given client.
 * @param client - The client user.
 * @returns A promise that resolves to the result of the delete operation.
 */
async function removeAllForClient(client: User) {
  return KeystoreModel.deleteMany({ client: client }).exec();
}
/**
 * Finds a Keystore document in the database based on the provided parameters.
 * @param client - The user client.
 * @param primaryKey - The primary key.
 * @param secondaryKey - The secondary key.
 * @returns A Promise that resolves to the found Keystore document, or null if not found.
 */
async function find(
  client: User,
  primaryKey: string,
  secondaryKey: string,
): Promise<Keystore | null> {
  return KeystoreModel.findOne({
    client: client,
    primaryKey: primaryKey,
    secondaryKey: secondaryKey,
  })
    .lean()
    .exec();
}
/**
 * Creates a new Keystore document in the database.
 *
 * @param client - The user associated with the Keystore.
 * @param primaryKey - The primary key of the Keystore.
 * @param secondaryKey - The secondary key of the Keystore.
 * @returns A Promise that resolves to the created Keystore document.
 */
async function create(
  client: User,
  primaryKey: string,
  secondaryKey: string,
): Promise<Keystore> {
  const now = new Date();
  const Keystore = await KeystoreModel.create({
    client,
    primaryKey,
    secondaryKey,
    createdAt: now,
    updatedAt: now,
  });
  return Keystore.toObject();
}
/**
 * Represents a repository for managing keystore data.
 */
export default {
  /**
   * Finds a keystore entry by key.
   * @param key - The key to search for.
   * @returns The found keystore entry, or undefined if not found.
   */
  findforKey,

  /**
   * Removes a keystore entry by key.
   * @param key - The key to remove.
   * @returns A boolean indicating whether the removal was successful.
   */
  remove,

  /**
   * Removes all keystore entries for a specific client.
   * @param clientId - The ID of the client.
   * @returns A boolean indicating whether the removal was successful.
   */
  removeAllForClient,

  /**
   * Finds keystore entries based on a query.
   * @param query - The query to search for.
   * @returns An array of keystore entries that match the query.
   */
  find,

  /**
   * Creates a new keystore entry.
   * @param data - The data for the new keystore entry.
   * @returns The created keystore entry.
   */
  create,
};
