import { Generic, SerializedError } from "../global.js";
import { CodedError, DeveloperError } from "./coded-error.js";

export const stringifyErrorObject = (
  errorObject: Error
): [SerializedError, string] => {
  let details = {};

  if (!(errorObject instanceof Error)) {
    throw new DeveloperError(
      "DEVELOPER_ERROR",
      "expected errorObject to be an instanceof Error"
    );
  }

  let code = "GENERIC_SERVER_ERROR";
  if ("code" in errorObject) {
    code = (errorObject as CodedError).code;
  }

  if ("isJoi" in errorObject) {
    code = "VALIDATION_ERROR";
    details = (errorObject as Generic).details;
  }

  let message =
    "We have encountered an unexpected server error. " +
    "It has been logged and administrators will be notified.";

  if ("message" in errorObject) {
    message = errorObject.message;
  }

  let name = errorObject.name;

  return [{ code, message, details }, name];
};

export const detectHttpStatusCode = (
  serializedError: SerializedError,
  errorName: string | null
) => {
  if (
    ["VALIDATION_ERROR", "API_KEY_NOT_FOUND"].includes(serializedError.code)
  ) {
    return 400;
  }

  if (["API_KEY_EXPIRED"].includes(serializedError.code)) {
    return 401;
  }

  if (["ACCESS_DENIED"].includes(serializedError.code)) {
    return 403;
  }

  if (
    [
      "AUTHORIZATION_HEADER_MISSING",
      "AUTHORIZATION_HEADER_MALFORMATTED",
    ].includes(serializedError.code)
  ) {
    return 412;
  }

  if (
    ["DEVELOPER_ERROR", "API_KEY_CREATION_FAILED"].includes(
      serializedError.code
    )
  ) {
    return 500;
  }

  if (errorName === "UserError") {
    return 400;
  }

  return 500;
};
