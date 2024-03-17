import path from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';
import { sign, verify } from 'jsonwebtoken';
import { InternalError, TokenExpiredError, BadTokenError } from './ApiError';

/**
 * Represents the payload of a JSON Web Token (JWT).
 */
export class JwtPayload {
  /**
   * The audience of the JWT.
   */
  aud: string;
  /**
   * The subject of the JWT.
   */
  sub: string;
  /**
   * The issuer of the JWT.
   */
  iss: string;
  /**
   * The issued at timestamp of the JWT.
   */
  iat: number;
  /**
   * The expiration timestamp of the JWT.
   */
  exp: number;
  /**
   * Additional parameter of the JWT.
   */
  prm: string;

  /**
   * Creates a new instance of JwtPayload.
   * @param issuer The issuer of the JWT.
   * @param audience The audience of the JWT.
   * @param subject The subject of the JWT.
   * @param param Additional parameter of the JWT.
   * @param validity The validity period of the JWT in seconds.
   */
  constructor(
    issuer: string,
    audience: string,
    subject: string,
    param: string,
    validity: number,
  ) {
    this.iss = issuer;
    this.aud = audience;
    this.sub = subject;
    this.prm = param;
    this.iat = Math.floor(Date.now() / 1000);
    this.exp = this.iat + validity;
  }
}

async function readPublicKey(): Promise<string> {
  return promisify(readFile)(
    path.join(__dirname, '../../keys/public.pem'),
    'utf8',
  );
}

async function readPrivateKey(): Promise<string> {
  return promisify(readFile)(
    path.join(__dirname, '../../keys/private.pem'),
    'utf8',
  );
}
//TODO: type problem typescript
async function encode(payload: JwtPayload): Promise<string> {
  const cert = await readPrivateKey();
  if (!cert) throw new InternalError('Token generation failure');
  // @ts-ignore
  return promisify(sign)({ ...payload }, cert, { algorithm: 'RS256' });
}

/**
 * This method checks the token and returns the decoded data when token is valid in all respect
 */
async function validate(token: string): Promise<JwtPayload> {
  const cert = await readPublicKey();
  try {
    // @ts-ignore
    return (await promisify(verify)(token, cert)) as JwtPayload;
  } catch (e: any) {
    if (e && e.name === 'TokenExpiredError') throw new TokenExpiredError();
    // throws error if the token has not been encrypted by the private key
    throw new BadTokenError();
  }
}
/**
 * Returns the decoded payload if the signature is valid even if it is expired
 */
async function decode(token: string): Promise<JwtPayload> {
  const cert = await readPublicKey();
  try {
    // @ts-ignore
    return (await promisify(verify)(token, cert, {
      ignoreExpiration: true,
    })) as JwtPayload;
  } catch (e) {
    throw new BadTokenError();
  }
}

export default {
  encode,
  validate,
  decode,
};
