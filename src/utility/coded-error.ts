class ExtendableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

class CodedError extends ExtendableError {
  public code: string;

  constructor(code: string, message = "Unnamed error occurred.") {
    message = `${code}: ${message}`;
    super(message);
    this.code = code;
  }
}

function throwOnFalsy(value: any, code: string, message: string) {
  if (!value) {
    throw new CodedError(code, message);
  }
}

function throwOnTruthy(value: any, code: string, message: string) {
  if (!!value) {
    throw new CodedError(code, message);
  }
}

export { ExtendableError, CodedError, throwOnFalsy, throwOnTruthy };
