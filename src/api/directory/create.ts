import Joi from "joi";
import constants from "../../constant/common-constants.js";
import { Generic } from "../../global.js";
import { AbstractApi } from "../../lib/abstract-api.js";
import { throwOnFalsy, throwOnTruthy, UserError } from "../../utility/coded-error.js";
import { extract } from "../../utility/misc-utils.js";
import { calculateHashOfString, compareHashWithString } from "../../utility/security-utils.js";

type CurrentRequest = {
  name: string;
  bucketId: string;
  parentDirectoryId: string;
  metaData: Generic;
  encryptedMetaData: string;
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
        name: Joi.string().min(4).max(32).required(),
        bucketId: Joi.string().min(1).max(64).required(),
        parentDirectoryId: Joi.string().min(1).max(64).required(),
        encryptedMetaData: Joi.string().min(1).max(2048).required(),
        metaData: Joi.object().required(),
      })
      .required();
  }

  async handle(body: CurrentRequest) {
    let { name, bucketId, parentDirectoryId, encryptedMetaData, metaData } = body;

    let exists = await dispatch.directoryService.findDirectoryByNameAndParent(name, bucketId, parentDirectoryId);
    throwOnTruthy(
      UserError,
      exists,
      "DIRECTORY_NAME_ALREADY_IN_USE",
      `A directory with the provided name ${name} already exists in the parent directory.`
    );

    let directory: Generic = await dispatch.directoryService.createDirectory(
      name,
      bucketId,
      metaData,
      encryptedMetaData,
      this.interimData.userId as string,
      parentDirectoryId
    );

    return { directoryId: directory._id };
  }
}
