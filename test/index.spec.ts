import { assert } from 'chai';
import { NiceAuth } from '../src';

describe('NiceAuthTest', () => {
  const { generateRequestData, decryptResultData } = new NiceAuth({
    clientId: '12345678-abcd-abcd-abcd-a12345678991',
    clientSecret: '81728371982784712971824782424124',
    productId: '1283924242',
  });

  const testReceiveData = JSON.stringify({
    testData: 'OK',
  });

  let niceRequestData;

  it('#generateRequestData', async () => {
    niceRequestData = await generateRequestData({
      requestno: '12345678910',
      returnurl: 'http://localhost:3000/test',
      authtype: 'M',
      methodtype: 'post',
      popupyn: 'Y',
      receivedata: testReceiveData,
    });

    assert.isNotEmpty(niceRequestData);
    assert.property(niceRequestData, 'symmetricKey');
    assert.property(niceRequestData, 'formData');
    assert.nestedProperty(niceRequestData, 'formData.tokenVersionId');
    assert.nestedProperty(niceRequestData, 'formData.encData');
    assert.nestedProperty(niceRequestData, 'formData.integrityValue');
  });

  it('#decryptResultData', async () => {
    const decryptedData = decryptResultData({
      symmetricKey: niceRequestData.symmetricKey,
      integrityValue: niceRequestData.formData.integrityValue,
      cipherData: niceRequestData.formData.encData,
    });

    assert.isNotEmpty(decryptedData);
    assert.property(decryptedData, 'receivedata');
    assert.equal(testReceiveData, decryptedData.receivedata);
  });
});
