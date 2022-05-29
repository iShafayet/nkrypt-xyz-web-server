import Joi from "joi";
import { AbstractApi } from "../../lib/abstract-api.js";
import { throwOnFalsy, UserError } from "../../utility/coded-error.js";
import { extract } from "../../utility/misc-utils.js";
import { compareHashWithString } from "../../utility/security-utils.js";

type CurrentRequest = {
  userName: string;
  password: string;
};

export class Api extends AbstractApi {
  get isEnabled(): boolean {
    return true;
  }

  get requiresAuthentication() {
    return false;
  }

  get requestSchema() {
    return Joi.object()
      .keys({
        userName: Joi.string().min(4).max(32).required(),
        password: Joi.string().min(8).max(32).required(),
      })
      .required();
  }

  async handle(body: CurrentRequest) {
    let { userName, password } = body;

    let user = await dispatch.userService.findUserOrFail(userName);

    let isPasswordCorrect = compareHashWithString(
      password,
      user.password.salt,
      user.password.hash
    );
    throwOnFalsy(
      UserError,
      isPasswordCorrect,
      "INCORRECT_PASSWORD",
      "The password you have used is not correct."
    );

    let { session, apiKey } =
      await dispatch.sessionService.createNewUniqueSession(user);

    return {
      apiKey,
      user: extract(user, ["_id", "userName", "displayName"]),
      session: extract(session, ["_id"]),
    };
  }
}
