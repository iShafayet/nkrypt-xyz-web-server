import Joi from "joi";
import { Generic } from "../../../global.js";
import { AbstractApi } from "../../../lib/abstract-api.js";
import { throwOnTruthy, UserError } from "../../../utility/coded-error.js";

type CurrentRequest = {
  displayName: string;
  userName: string;
  password: string;
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
        displayName: Joi.string().min(4).max(128).required(),
        userName: Joi.string().min(4).max(32).required(),
        password: Joi.string().min(8).max(32).required(),
      })
      .required();
  }

  async handle(body: CurrentRequest) {
    let { displayName, userName, password } = body;

    let exists = await dispatch.userService.findUserByUserName(userName);
    throwOnTruthy(
      UserError,
      exists,
      "USER_NAME_ALREADY_IN_USE",
      `The provided UserName ${userName} is already in use.`
    );

    let user: Generic = await dispatch.adminService.addUser(
      displayName,
      userName,
      password,
      {
        CREATE_USER: true,
        MANAGE_ALL_USER: false,
      }
    );

    return { userId: user._id };
  }
}
