import Joi from "joi";
import constants from "../../constant/common-constants.js";
import { AbstractApi } from "../../lib/abstract-api.js";
import { throwOnFalsy, UserError } from "../../utility/coded-error.js";
import { extract } from "../../utility/misc-utils.js";
import {
  calculateHashOfString,
  compareHashWithString,
} from "../../utility/security-utils.js";

type CurrentRequest = Record<string, never>;

export class Api extends AbstractApi {
  get isEnabled(): boolean {
    return true;
  }

  get requiresAuthentication() {
    return true;
  }

  get requestSchema() {
    return Joi.object().keys({}).required();
  }

  async handle(body: CurrentRequest) {
    let user = await dispatch.userService.findUserByIdOrFail(
      this.interimData.userId as string
    );

    let session = await dispatch.sessionService.getSessionByIdOrFail(
      this.interimData.sessionId as string
    );

    return {
      apiKey: this.interimData.apiKey as string,
      user: extract(user, ["_id", "userName", "displayName"]),
      session: extract(session, ["_id"]),
    };
  }
}
