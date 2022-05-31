import { Generic, SerializedError } from "../global.js";
import { CodedError, DeveloperError } from "./coded-error.js";

export const stringifyErrorObject = (errorObject: Error): SerializedError => {
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

  return { code, message, details };
};
