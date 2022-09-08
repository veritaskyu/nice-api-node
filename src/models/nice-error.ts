import { CustomError } from 'ts-custom-error';

export class NiceError extends CustomError {
  public constructor(name: string, message?: string) {
    super(message);
  }
}

export class AccessTokenError extends NiceError {
  public constructor(message?: string) {
    super('AccessTokenError', message);
  }
}

export class CryptoTokenError extends NiceError {
  public constructor(message?: string) {
    super('CryptoTokenError', message);
  }
}

export class SymmetricKeyError extends NiceError {
  public constructor(message?: string) {
    super('SymmetricKeyError', message);
  }
}

export class EncryptDataError extends NiceError {
  public constructor(message?: string) {
    super('EncryptDataError', message);
  }
}

export class IntegrityValueError extends NiceError {
  public constructor(message?: string) {
    super('IntegrityValueError', message);
  }
}

export class DecryptDataError extends NiceError {
  public constructor(message?: string) {
    super('DecryptDataError', message);
  }
}
