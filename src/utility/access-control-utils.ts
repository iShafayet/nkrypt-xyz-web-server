import { BucketPermission } from "../constant/bucket-permission.js";
import { GlobalPermission } from "../constant/global-permission.js";
import { Generic } from "../global";
import { throwOnFalsy, UserError } from "./coded-error.js";

export const requireGlobalPermission = async (
  user: Generic,
  ...requiredPermissions: GlobalPermission[]
) => {
  requiredPermissions.forEach((permission) => {
    if (!(permission in user.globalPermissions)) {
      throw new UserError(
        "INSUFFICIENT_GLOBAL_PERMISSION",
        `You do not have the required permissions. This action requires the "${permission}" permission.`
      );
    }
  });
};

export const requireBucketAuthorizationByBucketId = async (
  userId: string,
  bucketId: string,
  ...requiredPermissions: BucketPermission[]
) => {
  let bucket = await dispatch.bucketService.findBucketById(bucketId);
  throwOnFalsy(
    UserError,
    bucket,
    "BUCKET_NOT_FOUND",
    `The requested bucket does not exist.`
  );

  let authorization = bucket.bucketAuthorizations.find(
    (authorization: Generic) => authorization.userId === userId
  );
  throwOnFalsy(
    UserError,
    authorization,
    "NO_AUTHORIZATION",
    `You are not authorized to access the bucket "${bucket.name}".`
  );

  requiredPermissions.forEach((permission: Generic) => {
    if (!(permission in authorization.permissions)) {
      throw new UserError(
        "INSUFFICIENT_BUCKET_PERMISSION",
        `You do not have the required permissions. This action requires the "${permission}" permission on bucket "${bucket.name}".`
      );
    }
  });
};
