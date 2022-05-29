import Joi, { any } from "joi";
import { Generic } from "../../global.js";
import { AbstractApi } from "../../lib/abstract-api.js";
import { extract, strip } from "../../utility/misc-utils.js";

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
        bucketId: Joi.string().min(1).max(64).required(),
        directoryId: Joi.string().min(1).max(64).required(),
      })
      .required();
  }

  async handle(body: CurrentRequest) {
    let { bucketId, directoryId } = body;

    let directory = await dispatch.directoryService.findDirectoryById(bucketId, directoryId);

    let childDirectoryList = await dispatch.directoryService.listChildrenOfDirectory(bucketId, directoryId);

    strip(directory, ["collection"]);
    strip(childDirectoryList, ["collection"]);
    return { directory, childDirectoryList };
  }
}
