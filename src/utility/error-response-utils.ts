import { detectHttpStatusCode, stringifyErrorObject } from "./error-utils.js";

import * as ExpressCore from "express-serve-static-core";
import { UserError } from "./coded-error.js";
import Joi from "joi";

export const prepareAndSendCustomApiErrorResponse = (
  ex: any,
  req: ExpressCore.Request,
  res: ExpressCore.Response
) => {
  if (
    typeof ex === "object" &&
    ex &&
    ("isJoi" in ex || ex instanceof Error)
  ) {
    // There is no need to log UserErrors since they are always logged as response.
    if (!(ex instanceof UserError) && !(ex instanceof Joi.ValidationError)) {
      logger.error(<Error>ex);
    }

    let [serializedError, errorName] = stringifyErrorObject(<Error>ex);
    let statusCode = detectHttpStatusCode(serializedError, errorName);
    logger.log(
      statusCode,
      req.url,
      (<any>req).uuid,
      "\n" + JSON.stringify(serializedError, null, 2)
    );
    console.log("Sending sadness", statusCode, serializedError)
    res.status(statusCode).send(serializedError);
  } else {
    res.status(500).end("An unexpected error occurred.");
    console.error(ex);
  }
};