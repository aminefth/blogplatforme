import { AccessTokenError } from './../../core/ApiError';
import ApiKey, { ApiKeyModel } from '../model/Apikey';

async function findByKey(key: string): Promise<ApiKey | null> {
  return ApiKeyModel.findOne({ key, status: true }).lean().exec();
}

export default {
  findByKey,
};
