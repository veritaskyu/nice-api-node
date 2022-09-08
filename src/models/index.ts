export interface NiceOption {
    clientId: string;
    clientSecret: string;
    productId: string;
}

export interface NiceAuthRequestParameter {
    requestno: string;
    returnurl: string;
    sitecode: string;
    authtype?: 'M' | 'C' | 'X' | 'U' | 'F' | 'S';
    mobilceco?: string;
    businessno?: string;
    methodtype?: 'post' | 'get';
    popupyn?: 'Y' | 'N';
    receivedata?: string;
}

export interface NiceAuthDecryptParameter {
    symmetricKey: string;
    integrityValue: string;
    cipherData: string;
}

export interface NiceAuthRequestResultData {
    symmetricKey: string;
    formData: {
        tokenVersionId: string;
        encData: string;
        integrityValue: string;
    };
}

export interface NiceAuthResponseData {
    resultcode: string;
    requestno: string;
    enctime: string;
    sitecode: string;
    responseno: string;
    authtype: string;
    name?: string;
    utf8_name?: string;
    birthdate?: string;
    gender?: string;
    nationalinfo?: string;
    mobile_co?: string;
    mobile_no?: string;
    ci?: string;
    di?: string;
    businessno?: string;
    receivedata?: string;
}