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
import {
  createDelayerTransformStream,
} from "../../utility/stream-utils.js";
import { validators } from "../../validators.js";

const pipeline = promisify(stream.pipeline);

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

    let { blob, stream: fileStream } =
      await dispatch.blobService.createInProgressBlob(bucketId, fileId);

    try {
      await pipeline(
        req,
        dispatch.blobService.createStandardSizeLimiter(),
        fileStream
      );

      await dispatch.blobService.markBlobAsFinished(bucketId, fileId, blob._id);

      await dispatch.blobService.removeAllOtherBlobs(
        bucketId,
        fileId,
        blob._id
      );

      res.send({
        hasError: false,
        blobId: blob._id,
      });
    } catch (err) {
      logger.error(err as Error);

      await dispatch.blobService.markBlobAsErroneous(
        bucketId,
        fileId,
        blob._id
      );

      throw err;
    }
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
