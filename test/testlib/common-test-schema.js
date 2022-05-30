/* eslint-disable no-undef */

import { validators } from "../../dist/validators.js";

import Joi from "joi";

export const directorySchema = Joi.object()
  .keys({
    _id: Joi.string().required(),
    name: Joi.string().min(4).max(32).required(),
    bucketId: Joi.string().min(1).max(64).required(),
    parentDirectoryId: Joi.string().min(1).max(64).allow(null).required(),
    encryptedMetaData: Joi.string().min(1).max(2048).allow(null).required(),
    metaData: Joi.object().required(),
    createdAt: Joi.number().required(),
    createdByUserId: Joi.string().required(),
  })
  .required();

export const bucketListSchema = Joi.array()
  .required()
  .items(
    Joi.object().keys({
      _id: Joi.string().required(),
      name: Joi.string().required(),
      cryptSpec: Joi.string().required(),
      cryptData: Joi.string().required(),
      metaData: Joi.object().required(),
      bucketAuthorizations: Joi.array()
        .required()
        .items(
          Joi.object()
            .required()
            .keys({
              userId: Joi.string().required(),
              permissions: Joi.object().required().keys({
                USE: Joi.boolean().required(),
                MODIFY: Joi.boolean().required(),
                MANAGE: Joi.boolean().required(),
              }),
            })
        ),
      rootDirectoryId: Joi.string().required(),
    })
  );

export const userAssertion = {
  hasError: validators.hasErrorFalsy,
  apiKey: validators.apiKey,
  user: Joi.object().required().keys({
    _id: validators.id,
    userName: validators.userName,
    displayName: validators.displayName,
  }),
  session: Joi.object().required().keys({
    _id: validators.id,
  }),
};

export const errorOfCode = (code) => {
  return Joi.object()
    .required()
    .keys({
      code: Joi.string().required().valid(code),
      message: Joi.string().required(),
      details: Joi.object().required(),
    });
};

export const userListSchema = Joi.array()
  .items(
    Joi.object().keys({
      userName: validators.userName,
      displayName: validators.displayName,
    })
  )
  .required();
