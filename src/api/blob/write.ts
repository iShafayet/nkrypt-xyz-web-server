import * as ExpressCore from "express-serve-static-core";
import Joi from "joi";
import { BucketPermission } from "../../constant/bucket-permission.js";
import {
  ensureFileBelongsToBucket,
  requireBucketAuthorizationByBucketId,
} from "../../utility/access-control-utils.js";
import { CodedError, UserError } from "../../utility/coded-error.js";
import { stringifyErrorObject } from "../../utility/error-utils.js";
import { validators } from "../../validators.js";

export const blobWriteApiPath = "/api/blob/write/:bucketId/:fileId";

let schema = Joi.object().required().keys({
  bucketId: validators.id,
  fileId: validators.id,
});

export const blobWriteApiHandler = async (
  req: ExpressCore.Request,
  res: ExpressCore.Response
) => {
  try {
    let { apiKey, userId, sessionId, user } =
      await dispatch.authService.authenticate(req);

    let { bucketId, fileId } = await schema.validateAsync(req.params);

    await ensureFileBelongsToBucket(bucketId, fileId);

    await requireBucketAuthorizationByBucketId(
      userId,
      bucketId,
      BucketPermission.MANAGE_CONTENT
    );

    /* TODO -
    1. insert blob { _id, fileId, startedAt, finishedAt, status }
    2. set startedAt to now
    3. pipe request to file
    4. limit file size while piping
    5. on successful end, set finishedAt and status
    6. reply 200
    7. remove any previous blob of fileId
    8. update updatedAt of file
    */

    res.send({
      apiKey,
      userId,
      sessionId,
      user,
      bucketId,
      fileId,
    });
  } catch (ex) {
    if (
      typeof ex === "object" &&
      ex &&
      ("isJoi" in ex || ex instanceof CodedError)
    ) {
      res.status(400).send(stringifyErrorObject(ex as Error));
    } else {
      res.end("Unknown error occurred.");
      console.error(ex);
    }
  }
};
