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
  newParentDirectoryId: string;
  newName: string;
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
        newParentDirectoryId: validators.id,
        newName: validators.bucketName,
      })
      .required();
  }

  async handle(body: CurrentRequest) {
    let { newName, bucketId, directoryId, newParentDirectoryId } = body;

    await ensureDirectoryBelongsToBucket(bucketId, directoryId);

    await ensureDirectoryBelongsToBucket(bucketId, newParentDirectoryId);

    await requireBucketAuthorizationByBucketId(
      this.interimData.userId as string,
      bucketId,
      BucketPermission.MANAGE_CONTENT
    );

    let existingDirectory =
      await dispatch.directoryService.findDirectoryByNameAndParent(
        newName,
        bucketId,
        newParentDirectoryId
      );

    throwOnTruthy(
      UserError,
      existingDirectory,
      "DIRECTORY_NAME_ALREADY_IN_USE",
      `A directory with the provided name "${newName}" already exists in the new parent directory.`
    );

    await dispatch.directoryService.moveDirectory(
      bucketId,
      directoryId,
      newParentDirectoryId,
      newName
    );

    return {};
  }
}
