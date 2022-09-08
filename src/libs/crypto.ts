import axios from 'axios';
import * as _ from 'lodash';
import * as CryptoJS from 'crypto-js';
import { AccessTokenError, CryptoTokenError, EncryptDataError, IntegrityValueError, SymmetricKeyError } from '../models/nice-error';
import '../extensions/date.extensions';

export async function issueToken() {
  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'default');
    const response = await axios.post('https://svc.niceapi.co.kr:22001/digital/niceid/oauth/oauth/token', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${this._options.clientId}:${this._options.clientSecret}`).toString('base64'),
      },
    });
    const dataHeader = _.get(response, 'data.dataHeader') || {};
    const dataBody = _.get(response, 'data.dataBody') || {};
    if (dataHeader.GW_RSLT_CD !== '1200' || !dataBody.access_token) {
      throw new AccessTokenError();
    }
    return {
      accessToken: dataBody.access_token,
      tokenType: dataBody.token_type,
      expiresIn: dataBody.expires_in,
      scope: dataBody.scope,
    };
  } catch (e) {
    throw new AccessTokenError((e && e.message) || 'Failed to issue access token');
  }
}

export async function issueCryptoToken(requestno: string, accessToken: string, nowDate: Date) {
  try {
    const currentTimestamp = Math.round(nowDate.valueOf() / 1000);

    const Authorization = 'bearer ' + Buffer.from(`${accessToken}:${currentTimestamp}:${this._options.clientId}`).toString('base64');

    const response = await axios.post(
      'https://svc.niceapi.co.kr:22001/digital/niceid/api/v1.0/common/crypto/token',
      {
        dataHeader: { CNTY_CD: 'ko' },
        dataBody: {
          req_dtim: nowDate.YYYYMMDDHHmmss(),
          req_no: requestno,
          enc_mode: '1',
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization,
          'client_id': this._options.clientId,
          'ProductID': this._options.productId,
        },
      }
    );
    const dataHeader = _.get(response, 'data.dataHeader') || {};
    const dataBody = _.get(response, 'data.dataBody') || {};
    if (dataHeader.GW_RSLT_CD !== '1200' || dataBody.rsp_cd !== 'P000' || dataBody.result_cd !== '0000') {
      throw new CryptoTokenError();
    }

    return {
      cryptoToken: dataBody.token_val.trim(),
      siteCode: dataBody.site_code,
      tokenVersionId: dataBody.token_version_id,
    };
  } catch (e) {
    throw new CryptoTokenError((e && e.message) || 'Failed to issue crypto token');
  }
}

export function generateSymmetricKey(requestno: string, cryptoToken: string, now: Date) {
  try {
    if (!requestno || !cryptoToken || !now) {
      throw new SymmetricKeyError();
    }

    const hash = CryptoJS.SHA256(`${now.YYYYMMDDHHmmss()}${requestno}${cryptoToken}`);
    const symmetricKey = CryptoJS.enc.Base64.stringify(hash);
    if (!symmetricKey) {
      throw new SymmetricKeyError('Symmetric key base64 encoding failed');
    }

    return {
      symmetricKey,
      key: symmetricKey.substring(0, 16),
      iv: symmetricKey.substring(symmetricKey.length - 16),
      hmacKey: symmetricKey.substring(0, 32),
    };
  } catch (e) {
    throw new SymmetricKeyError((e && e.message) || 'Symmetric key generation failed');
  }
}

export function encryptData(key: string, iv: string, plainData: string): string {
  try {
    const cipher = CryptoJS.AES.encrypt(plainData, CryptoJS.enc.Utf8.parse(key), {
      iv: CryptoJS.enc.Utf8.parse(iv),
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    const cipherData = cipher && cipher.ciphertext && cipher.ciphertext.toString(CryptoJS.enc.Base64);

    if (!cipherData) {
      throw new EncryptDataError();
    }

    return cipherData;
  } catch (e) {
    throw new EncryptDataError((e && e.message) || 'Request data encryption failed');
  }
}

export function decryptData(key: string, iv: string, cipherData: string): string {
  return CryptoJS.AES.decrypt(cipherData, CryptoJS.enc.Utf8.parse(key), {
    iv: CryptoJS.enc.Utf8.parse(iv),
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  }).toString(CryptoJS.enc.Base64);
}

export function hmacSha256(key: string, data: string): string {
  try {
    const hmac = CryptoJS.HmacSHA256(data, key);
    const result = CryptoJS.enc.Base64.stringify(hmac);
    if (!result) {
      throw new IntegrityValueError();
    }
    return result;
  } catch (e) {
    throw new IntegrityValueError((e && e.message) || 'Integrity value generation failed');
  }
}

export function jsonParse(str: string) {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch (ex) {
    return null;
  }
}
