import * as _ from 'lodash';
import * as iconv from 'iconv-lite';
import * as niceCrypto from '../libs/crypto';

import { DecryptDataError } from '../models/nice-error';

import { NiceAuthDecryptParameter, NiceOption, NiceAuthRequestParameter, NiceAuthRequestResultData, NiceAuthResponseData } from '../models';

class NiceAuth {
  constructor(private _options: NiceOption) {}

  generateRequestData = async (niceRequestParameter: Omit<NiceAuthRequestParameter, 'sitecode'>): Promise<NiceAuthRequestResultData> => {
    const options = niceRequestParameter as NiceAuthRequestParameter;

    const now = new Date();

    const _issueToken = niceCrypto.issueToken.bind(this);
    const _issueCryptoToken = niceCrypto.issueCryptoToken.bind(this);

    const { accessToken } = await _issueToken();
    const { cryptoToken, siteCode, tokenVersionId } = await _issueCryptoToken(options.requestno, accessToken, now);
    const { symmetricKey, key, iv, hmacKey } = niceCrypto.generateSymmetricKey(options.requestno, cryptoToken, now);

    options.sitecode = siteCode;

    const requestData = JSON.stringify(_.pickBy(options, _.identity)).trim();

    const encData = niceCrypto.encryptData(key, iv, requestData);
    const integrityValue = niceCrypto.hmacSha256(encData, hmacKey);

    return {
      symmetricKey,
      formData: {
        tokenVersionId,
        encData,
        integrityValue,
      },
    };
  };

  decryptResultData = (params: NiceAuthDecryptParameter): NiceAuthResponseData => {
    try {
      if (!params.cipherData) {
        throw new DecryptDataError('invalid cipher data');
      }

      if (!params.integrityValue) {
        throw new DecryptDataError('invalid integrity value');
      }

      if (!params.symmetricKey) {
        throw new DecryptDataError('invalid symmetric key');
      }

      const key = params.symmetricKey.substring(0, 16);
      const iv = params.symmetricKey.substring(params.symmetricKey.length - 16);
      const hmacKey = params.symmetricKey.substring(0, 32);

      if (params.integrityValue !== niceCrypto.hmacSha256(params.cipherData, hmacKey)) {
        throw new DecryptDataError('integrity validation failed');
      }

      const decryptedBase64Text = niceCrypto.decryptData(key, iv, params.cipherData);
      const decodedPlainText = Buffer.from(decryptedBase64Text, 'base64');
      const decodedEucKrText = iconv.decode(decodedPlainText, 'euc-kr');
      const result = niceCrypto.jsonParse(decodedEucKrText);

      _.forIn(result, (value, key) => {
        if (key === 'utf8_name') {
          result[key] = decodeURIComponent(value);
        } else if (key === 'name') {
          result[key] = iconv.encode(value, 'utf-8').toString();
        }
        // else if (key === 'receivedata') {
        //     const receivedata = this.jsonParse(value)
        //     if (receivedata) {
        //         result[key] = receivedata
        //     }
        // }
      });
      return result as NiceAuthResponseData;
    } catch (e) {
      throw new DecryptDataError((e && e.message) || 'Data decryption failed');
    }
  };
}

export { NiceAuth };
