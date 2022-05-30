import Joi from "joi";
import { AbstractApi } from "../../lib/abstract-api.js";
import { throwOnFalsy, UserError } from "../../utility/coded-error.js";
import { validators } from "../../validators.js";

type CurrentRequest = {
  // We want to make the user type in the name to ensure intention
  name: string;
  bucketId: string;
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
        name: validators.bucketName,
        bucketId: validators.id,
      })
      .required();
  }

  async handle(body: CurrentRequest) {
    let { name, bucketId } = body;

    let existingBucket = await dispatch.bucketService.findBucketByName(name);

    throwOnFalsy(
      UserError,
      existingBucket,
      "BUCKET_NOT_FOUND",
      `The requested bucket does not exist.`
    );

    throwOnFalsy(
      UserError,
      existingBucket.name === name,
      "BUCKET_NAME_MISMATCH",
      `You have incorrectly entered the bucket name.`
    );

    await dispatch.bucketService.removeBucket(bucketId);

    // TODO Recursively delete all directories and files;

    return {};
  }
}
