import Joi from "joi";
import { BucketPermission } from "../../constant/bucket-permission.js";
import { AbstractApi } from "../../lib/abstract-api.js";
import { requireBucketAuthorizationByBucketId } from "../../utility/access-control-utils.js";
import { strip } from "../../utility/misc-utils.js";
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

    await requireBucketAuthorizationByBucketId(
      this.interimData.userId as string,
      bucketId,
      BucketPermission.VIEW_CONTENT
    );

    let directory = await dispatch.directoryService.findDirectoryById(
      bucketId,
      directoryId
    );

    let childDirectoryList =
      await dispatch.directoryService.listChildrenOfDirectory(
        bucketId,
        directoryId
      );

    strip(directory, ["collection"]);
    strip(childDirectoryList, ["collection"]);
    return { directory, childDirectoryList };
  }
}
