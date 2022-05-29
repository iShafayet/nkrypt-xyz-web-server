import Joi from "joi";
import { AbstractApi } from "../../lib/abstract-api.js";
import { throwOnFalsy, UserError } from "../../utility/coded-error.js";
import {
  calculateHashOfString,
  compareHashWithString,
} from "../../utility/security-utils.js";

type CurrentRequest = {
  currentPassword: string;
  newPassword: string;
};

export class Api extends AbstractApi {
  get isEnabled(): boolean {
    return true;
  }

  get requiresAuthentication() {
    return true;
  }

  get requestSchema() {
    return Joi.object()
      .keys({
        currentPassword: Joi.string().min(8).max(32).required(),
        newPassword: Joi.string().min(8).max(32).required(),
      })
      .required();
  }

  async handle(body: CurrentRequest) {
    let { currentPassword, newPassword } = body;

    let user = await dispatch.userService.findUserByIdOrFail(
      this.interimData.userId as string
    );

    let isPasswordCorrect = compareHashWithString(
      currentPassword,
      user.password.salt,
      user.password.hash
    );
    throwOnFalsy(
      UserError,
      isPasswordCorrect,
      "INCORRECT_PASSWORD",
      "The password you have used is not correct."
    );

    let newPasswordBlock = calculateHashOfString(newPassword);

    await dispatch.userService.updateUserPassword(
      this.interimData.userId as string,
      newPasswordBlock
    );

    await dispatch.sessionService.expireAllSessionByUserId(
      this.interimData.userId as string,
      "All sessions expired due to password change."
    );

    return {};
  }
}
