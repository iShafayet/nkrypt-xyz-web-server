import * as ExpressCore from "express-serve-static-core";
import Joi, { func } from "joi";
import stream from "stream";
import { promisify } from "util";
import { BucketPermission } from "../../constant/bucket-permission.js";
import {
  ensureFileBelongsToBucket,
  requireBucketAuthorizationByBucketId,
} from "../../utility/access-control-utils.js";
import { CodedError, UserError } from "../../utility/coded-error.js";
import {
  detectHttpStatusCode,
  stringifyErrorObject,
} from "../../utility/error-utils.js";
import { createSizeLimiterPassthroughStream } from "../../utility/stream-utils.js";
import { validators } from "../../validators.js";

const pipeline = promisify(stream.pipeline);

export const blobReadApiPath = "/api/blob/read/:bucketId/:fileId";

let schema = Joi.object().required().keys({
  bucketId: validators.id,
  fileId: validators.id,
});

export const blobReadApiHandler = async (
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
      BucketPermission.VIEW_CONTENT
    );

    let blob = await dispatch.blobService.findBlobByBucketIdAndFileId(
      bucketId,
      fileId
    );

    if (!blob) {
      throw new UserError("BLOB_NOT_FOUND", "Desired blob could not be found");
    }

    let stream = dispatch.blobService.createReadableStreamFromBlobId(blob._id);

    await pipeline(stream, res);
  } catch (ex) {
    if (
      typeof ex === "object" &&
      ex &&
      ("isJoi" in ex || ex instanceof Error)
    ) {
      let [serializedError, errorName] = stringifyErrorObject(<Error>ex);
      let statusCode = detectHttpStatusCode(serializedError, errorName);
      res.status(statusCode).send(serializedError);
    } else {
      res.status(500).end("An unexpected error occurred.");
      console.error(ex);
    }
  }
};
