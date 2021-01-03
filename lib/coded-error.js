export class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

export class CodedError extends ExtendableError {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export function throwOnFalsy(value, code, message) {
  if (!value) {
    throw new CodedError(code, message);
  }
}

export function throwOnTruthy(value, code, message) {
  throwOnFalsy(!value, code, message);
}
