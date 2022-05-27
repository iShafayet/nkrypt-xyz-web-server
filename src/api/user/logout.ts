import Joi from "joi";
import { AbstractApi } from "../../lib/abstract-api.js";

type CurrentRequest = {
  message: string;
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
        message: Joi.string()
          .min(4)
          .max(128 - 4)
          .required(),
      })
      .required();
  }

  async handle(body: CurrentRequest) {
    let { message } = body;

    await dispatch.sessionService.expireSessionById(
      this.interimData.sessionId as string,
      message
    );

    return {};
  }
}
