import Joi from "joi";
import { BucketPermission } from "./constant/bucket-permission.js";
import { Generic } from "./global.js";

export const validators = {
  id: Joi.string().length(16).required(),

  bucketName: Joi.string().min(4).max(32).required(),
  directoryName: Joi.string().min(4).max(32).required(),
  fileName: Joi.string().min(4).max(32).required(),

  displayName: Joi.string().min(4).max(128).required(),
  userName: Joi.string().min(4).max(32).required(),
  password: Joi.string().min(8).max(32).required(),

  cryptSpec: Joi.string().min(1).max(64).required(),
  cryptData: Joi.string().min(1).max(2048).required(),

  metaData: Joi.object().required(),

  encryptedMetaData: Joi.string().min(1).max(2048).required(),

  logoutMessage: Joi.string()
    .min(4)
    .max(128 - 4)
    .required(),

  hasErrorFalsy: Joi.boolean().valid(false).required(),
  hasErrorTruthy: Joi.boolean().valid(true).required(),
  apiKey: Joi.string().required(),

  allBucketPermissions: Joi.object()
    .required()
    .keys(
      Object.keys(BucketPermission).reduce((map: Generic, key) => {
        map[key] = Joi.boolean().required();
        return map;
      }, {})
    ),

  partialBucketPermissions: Joi.object()
    .required()
    .keys(
      Object.keys(BucketPermission).reduce((map: Generic, key) => {
        map[key] = Joi.boolean().optional();
        return map;
      }, {})
    ),
};
