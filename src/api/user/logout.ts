import Joi from "joi";
import collections from "../../constant/collections.js";
import { AbstractApi } from "../../lib/abstract-api.js";
import { throwOnFalsy } from "../../utility/coded-error.js";

const PREFIX = "Logout: ";

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
          .max(128 - PREFIX.length)
          .required(),
      })
      .required();
  }

  async handle(body: CurrentRequest) {
    let { message } = body;

    let session = await this.db.findOneAsync({
      collection: collections.SESSION,
      _id: this.interimData.sessionId,
    });

    throwOnFalsy(
      session,
      "SESSION_NOT_FOUND",
      "The requested session could not be found."
    );

    await this.db.updateAsync(
      {
        collection: collections.SESSION,
        _id: this.interimData.sessionId,
      },
      {
        hasExpired: true,
        expireReason: `${PREFIX}${message}`,
        expiredAt: Date.now(),
      }
    );

    return {};
  }
}
