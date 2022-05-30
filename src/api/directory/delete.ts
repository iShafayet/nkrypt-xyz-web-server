import Joi from "joi";
import { BucketPermission } from "../../constant/bucket-permission.js";
import { AbstractApi } from "../../lib/abstract-api.js";
import {
  ensureDirectoryBelongsToBucket,
  requireBucketAuthorizationByBucketId,
} from "../../utility/access-control-utils.js";
import {
  throwOnFalsy,
  throwOnTruthy,
  UserError,
} from "../../utility/coded-error.js";
import { validators } from "../../validators.js";

type CurrentRequest = {
  bucketId: string;
  directoryId: string;
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
        bucketId: validators.id,
        directoryId: validators.id,
      })
      .required();
  }

  async handle(body: CurrentRequest) {
    let { bucketId, directoryId } = body;

    await ensureDirectoryBelongsToBucket(bucketId, directoryId);

    await requireBucketAuthorizationByBucketId(
      this.interimData.userId as string,
      bucketId,
      BucketPermission.MANAGE_CONTENT
    );

    let existingDirectory = await dispatch.directoryService.findDirectoryById(
      bucketId,
      directoryId
    );

    throwOnFalsy(
      UserError,
      existingDirectory,
      "DIRECTORY_NOT_IN_BUCKET",
      `Given directory does not belong to the given bucket`
    );

    await dispatch.directoryService.deleteDirectory(bucketId, directoryId);

    return {};
  }
}
