import Joi from "joi";
import constants from "../../constant/common-constants.js";
import { Generic } from "../../global.js";
import { AbstractApi } from "../../lib/abstract-api.js";
import { throwOnFalsy, throwOnTruthy, UserError } from "../../utility/coded-error.js";
import { extract } from "../../utility/misc-utils.js";
import { calculateHashOfString, compareHashWithString } from "../../utility/security-utils.js";

type CurrentRequest = {
  name: string;
  cryptSpec: string;
  cryptData: string;
  metaData: Generic;
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
        cryptSpec: Joi.string().min(1).max(64).required(),
        cryptData: Joi.string().min(1).max(2048).required(),
        metaData: Joi.object().required(),
      })
      .required();
  }

  async handle(body: CurrentRequest) {
    let { name, cryptData, cryptSpec, metaData } = body;

    let exists = await dispatch.bucketService.findBucketByName(name);
    throwOnTruthy(
      UserError,
      exists,
      "BUCKET_NAME_ALREADY_IN_USE",
      `A bucket with the provided name ${name} already exists.`
    );

    let bucket: Generic = await dispatch.bucketService.createBucket(
      name,
      cryptSpec,
      cryptData,
      metaData,
      this.interimData.userId as string
    );

    let directory: Generic = await dispatch.directoryService.createDirectory(
      `${name} Root`,
      bucket._id,
      metaData,
      null,
      this.interimData.userId as string,
      null
    );

    return { bucketId: bucket._id, rootDirectoryId: directory._id };
  }
}
