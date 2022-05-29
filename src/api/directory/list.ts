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
    let bucketList = (await dispatch.bucketService.listAllBuckets()).filter((bucket) =>
      bucket.bucketAuthorizations.find((authorization: Generic) => authorization.userId === this.interimData.userId)
    );

    let idList: string[] = bucketList.map((bucket: Generic) => bucket._id);
    let dirList = await dispatch.directoryService.listDirectoriesByIdList(idList);

    bucketList.forEach((bucket: Generic) => {
      bucket.rootDirectoryId = dirList.find(
        (dir: Generic) => dir.bucketId == bucket._id && dir.parentDirectoryId === null
      )._id;
    });

    strip(bucketList, ["collection"]);
    return { bucketList };
  }
}
