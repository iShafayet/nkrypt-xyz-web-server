import Joi from "joi";
import { AbstractApi } from "../../lib/abstract-api.js";

type CurrentRequest = {
  displayName: string;
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
      })
      .required();
  }

  async handle(body: CurrentRequest) {
    let { displayName } = body;

    await dispatch.userService.updateOwnCommonProperties(
      this.interimData.userId as string,
      displayName
    );

    return {};
  }
}
