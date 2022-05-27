import Nedb from "@seald-io/nedb";
import * as ExpressCore from "express-serve-static-core";
import Joi from "joi";
import collections from "../constant/collections.js";
import constants from "../constant/common-constants.js";
import { JsonValue } from "../global.js";
import {
  CodedError,
  throwOnFalsy,
  throwOnTruthy,
} from "../utility/coded-error.js";
import { Config } from "./config-loader.js";
import { Server } from "./server.js";

type SerializedError = {
  code: string;
  message: string;
  details: any;
};

const joiValidationOptions = {
  abortEarly: true,
  convert: true,
  allowUnknown: false,
};

abstract class AbstractApi {
  config: Config;
  db: Nedb<any>;
  interimData: {
    userId: string | null;
    user: any;
    apiKey: string | null;
    sessionId: string | null;
  };

  constructor(
    private apiPath: string,
    private server: Server,
    private networkDetails: { ip: string; requestUid: string | null },
    private _expressRequest: ExpressCore.Request,
    private _expressResponse: ExpressCore.Response
  ) {
    this.apiPath = apiPath;
    this.server = server;

    this.db = this.server.db.connection;

    this.config = this.server.config;
    this.networkDetails = networkDetails;

    this.interimData = {
      userId: null,
      user: null,
      apiKey: null,
      sessionId: null,
    };
  }

  // ============================== region: properties - start ==============================

  abstract get isEnabled(): boolean;

  // This is a Joi Schema. If not null, request will be parsed and validated.
  abstract get requestSchema(): Joi.Schema;

  abstract get requiresAuthentication(): boolean;

  abstract handle(body: JsonValue): Promise<JsonValue>;

  // ============================== region: properties - end ==============================
  // ============================== region: request processing - start ==============================

  async _composeAndValidateSchema(body: JsonValue) {
    let schema = this.requestSchema;

    try {
      let validatedBody = await schema.validateAsync(
        body,
        joiValidationOptions
      );
      return validatedBody;
    } catch (ex) {
      throw ex;
    }
  }

  async _authenticate() {
    const authorizationHeader = String(
      this._expressRequest.headers["authorization"] || ""
    );

    throwOnFalsy(
      authorizationHeader.length > 0,
      "AUTHORIZATION_HEADER_MISSING",
      "Authorization header is missing"
    );

    let parts = authorizationHeader.split(" ");
    throwOnFalsy(
      parts.length === 2 &&
        parts[0].toLowerCase().indexOf("bearer") === 0 &&
        parts[1].length === constants.iam.API_KEY_LENGTH,
      "AUTHORIZATION_HEADER_MALFORMATTED",
      "Authorization header is malformatted"
    );
    let apiKey = parts.pop();

    console.log({ apiKey });

    let session = await this.db.findOneAsync({
      collection: collections.SESSION,
      apiKey,
    });

    throwOnFalsy(
      session,
      "API_KEY_NOT_FOUND",
      "Your session could not be validated. Login again."
    );

    throwOnTruthy(
      session.hasExpired,
      "API_KEY_EXPIRED",
      "Your session has expired. Login again."
    );

    throwOnTruthy(
      Date.now() - Date.parse(session.createdAt) >
        constants.iam.SESSION_VALIDITY_DURATION_MS,
      "API_KEY_EXPIRED",
      "Your session has expired. Login again."
    );

    let { userId, _id: sessionId } = session;
    return { apiKey, userId, sessionId };
  }

  async _preHandleJsonPostApi(parsedJsonBody: JsonValue) {
    try {
      if (!this.isEnabled) {
        throw new CodedError(
          "API_DISABLED",
          "This action has been disabled by the developers."
        );
      }

      let body: JsonValue = {};
      if (this.requestSchema !== null) {
        body = await this._composeAndValidateSchema(parsedJsonBody);

        if (this.requiresAuthentication) {
          let authData = await this._authenticate();
          Object.assign(this.interimData, authData);
        }
      }

      let response = await this.handle(body);

      if (typeof response !== "object" || response === null) {
        throw new CodedError(
          "DEVELOPER_ERROR",
          "Expected response to be an object."
        );
      }

      // @ts-ignore
      response.hasError = false;
      this._sendResponse(200, response);
    } catch (ex: unknown) {
      logger.error(<Error>ex);

      let serializedError = this._stringifyErrorObject(<Error>ex);
      let statusCode = this._detectHttpStatusCode(serializedError);

      this._sendResponse(statusCode, {
        hasError: true,
        error: serializedError,
      });
    }
  }

  _sendResponse(statusCode: number, data: JsonValue) {
    logger.log(statusCode, this.apiPath, data);
    this._expressResponse.send(data);
  }

  _stringifyErrorObject(errorObject: Error): SerializedError {
    let details = {};

    if (!(errorObject instanceof Error)) {
      throw new CodedError(
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
      // @ts-ignore
      details = errorObject.details;
    }

    let message =
      "We have encountered an unexpected server error. " +
      "It has been logged and administrators will be notified.";

    if ("message" in errorObject) {
      message = errorObject.message;
    }

    return { code, message, details };
  }

  // ============================== region: request processing - end ==============================

  _detectHttpStatusCode(serializedError: SerializedError) {
    if (["VALIDATION_ERROR", "APIKEY_MISSING"].includes(serializedError.code)) {
      return 400;
    }

    if (["APIKEY_INVALID", "APIKEY_EXPIRED"].includes(serializedError.code)) {
      return 401;
    }

    if (["ACCESS_DENIED"].includes(serializedError.code)) {
      return 403;
    }

    if (["DEVELOPER_ERROR"].includes(serializedError.code)) {
      return 500;
    }

    return 500;
  }
}

interface IAbstractApi {
  new (
    apiPath: string,
    server: Server,
    networkDetails: { ip: string; requestUid: string | null },
    _expressRequest: ExpressCore.Request,
    _expressResponse: ExpressCore.Response
  ): AbstractApi;
}

export { AbstractApi, IAbstractApi };
