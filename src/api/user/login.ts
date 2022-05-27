import Joi from "joi";
import collections from "../../constant/collections.js";
import constants from "../../constant/common-constants.js";
import { AbstractApi } from "../../lib/abstract-api.js";
import { throwOnFalsy } from "../../utility/coded-error.js";
import { extract } from "../../utility/misc-utils.js";
import { compareHashWithString } from "../../utility/security-utils.js";
import { generateRandomString } from "../../utility/string-utils.js";

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

    let user = await this.db.findOneAsync({
      collection: collections.USER,
      userName,
    });
    throwOnFalsy(
      user,
      "USER_NOT_FOUND",
      "The requested user could not be found."
    );

    let isPasswordCorrect = compareHashWithString(
      password,
      user.password.salt,
      user.password.hash
    );
    throwOnFalsy(
      isPasswordCorrect,
      "INCORRECT_PASSWORD",
      "The password you have used is not correct."
    );

    let apiKey;
    let session, exists;
    let safetyCap = constants.std.SAFETY_CAP;
    do {
      apiKey = generateRandomString(constants.iam.API_KEY_LENGTH);

      let exists = await this.db.findOneAsync({
        collection: collections.SESSION,
        apiKey,
      });
      if (!exists) {
        session = await this.db.insertAsync({
          collection: collections.SESSION,
          userId: user._id,
          apiKey,
          hasExpired: false,
          expiredAt: null,
          expireReason: null,
        });
      }
      throwOnFalsy(safetyCap--, "API_KEY_CREATION_FAILED", "Timed out");
    } while (exists);

    return {
      apiKey,
      user: extract(user, ["_id"]),
      session: extract(session, ["_id"]),
    };
  }
}
