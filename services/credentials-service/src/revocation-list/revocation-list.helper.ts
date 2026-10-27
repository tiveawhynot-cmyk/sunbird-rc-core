// @ts-ignore
import { Bitstring } from '@techsavvyash/bitstring';
import { gzipSync, gunzipSync } from 'zlib';

type BitstringConstructorParam = {
  length?: number,
  buffer?: Uint8Array
};

// @techsavvyash/bitstring@3.2.0 loads base64url-universal through a dynamic import()
// (a Promise), so its encodeBits/decodeBits throw "base64url.encode is not a function".
// Encode/decode with Node's zlib + base64url instead (same format: GZIP, then
// base64url without padding).
export class RevocationList {

  private bitstring: any;
  constructor({ length, buffer }: BitstringConstructorParam = { length: 100000 }) {
    this.bitstring = new Bitstring({ length, buffer });
  }

  setRevoked(index, revoked) {
    if (typeof revoked !== 'boolean') {
      throw new TypeError('revoked must be a boolean.');
    }

    return this.bitstring.set(index, revoked);
  }

  isRevoked(index) {
    return this.bitstring.get(index);
  }

  async encode() {
    return gzipSync(Buffer.from(this.bitstring.bits)).toString('base64url');
  }

  static async decode({ encodedList }) {
    const buffer = new Uint8Array(gunzipSync(Buffer.from(encodedList, 'base64url')));
    return new RevocationList({ buffer });
  }
}
