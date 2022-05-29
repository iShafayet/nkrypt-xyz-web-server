/* eslint-disable no-undef */

import Joi from "joi";

import { callHappyPostJsonApi, callHappyPostJsonApiWithAuth, validateObject } from "./testlib/common-api-test-utils.js";

const DEFAULT_USER_NAME = "admin";
const DEFAULT_PASSWORD = "PleaseChangeMe@YourEarliest2Day";

const TEST_BUCKET_NAME = "testBucket1-" + Date.now();
const TEST_LEVEL_1_DIRECTORY_1_NAME = "testL1Dir1-" + Date.now();
const TEST_LEVEL_1_DIRECTORY_2_NAME = "testL1Dir2-" + Date.now();

let vars = {
  apiKey: null,
  bucketId: null,
  rootDirectoryId: null,
  level1Directory1Id: null,
};

describe("Bucket and Directory Suite", () => {
  test("User Login: Basic", async () => {
    const data = await callHappyPostJsonApi("/user/login", {
      userName: DEFAULT_USER_NAME,
      password: DEFAULT_PASSWORD,
    });

    await validateObject(data, {
      hasError: Joi.boolean().valid(false).required(),
      apiKey: Joi.string().required(),
      user: Joi.object().required().keys({
        _id: Joi.string().required(),
        userName: Joi.string().required(),
        displayName: Joi.string().required(),
      }),
      session: Joi.object().required().keys({
        _id: Joi.string().required(),
      }),
    });

    vars.apiKey = data.apiKey;
  });

  test("Bucket/Create", async () => {
    const data = await callHappyPostJsonApiWithAuth(vars.apiKey, "/bucket/create", {
      name: TEST_BUCKET_NAME,
      cryptSpec: "V1:AES256",
      cryptData: "PLACEHOLDER",
      metaData: {},
    });

    await validateObject(data, {
      hasError: Joi.boolean().valid(false).required(),
      bucketId: Joi.string().required(),
      rootDirectoryId: Joi.string().required(),
    });
  });

  test("List: Basic", async () => {
    const data = await callHappyPostJsonApiWithAuth(vars.apiKey, "/bucket/list", {});

    await validateObject(data, {
      hasError: Joi.boolean().valid(false).required(),
      bucketList: Joi.array()
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
        ),
    });

    let bucket = data.bucketList.find((bucket) => bucket.name === TEST_BUCKET_NAME);
    expect(bucket).not.toBeFalsy();

    vars.bucketId = bucket._id;
    vars.rootDirectoryId = bucket.rootDirectoryId;
  });

  test("Directory/Create 1", async () => {
    const data = await callHappyPostJsonApiWithAuth(vars.apiKey, "/directory/create", {
      name: TEST_LEVEL_1_DIRECTORY_1_NAME,
      bucketId: vars.bucketId,
      parentDirectoryId: vars.rootDirectoryId,
      encryptedMetaData: "PLACEHOLDER",
      metaData: { createdFromApp: "Integration testing" },
    });

    await validateObject(data, {
      hasError: Joi.boolean().valid(false).required(),
      directoryId: Joi.string().required(),
    });
  });

  test("Directory/Create 2", async () => {
    const data = await callHappyPostJsonApiWithAuth(vars.apiKey, "/directory/create", {
      name: TEST_LEVEL_1_DIRECTORY_2_NAME,
      bucketId: vars.bucketId,
      parentDirectoryId: vars.rootDirectoryId,
      encryptedMetaData: "PLACEHOLDER",
      metaData: { createdFromApp: "Integration testing" },
    });

    await validateObject(data, {
      hasError: Joi.boolean().valid(false).required(),
      directoryId: Joi.string().required(),
    });
  });

  test("Directory/List", async () => {
    const data = await callHappyPostJsonApiWithAuth(vars.apiKey, "/directory/get", {
      bucketId: vars.bucketId,
      directoryId: vars.rootDirectoryId,
    });
    console.log(data);

    // await validateObject(data, {
    //   hasError: Joi.boolean().valid(false).required(),
    //   bucketList: Joi.array()
    //     .required()
    //     .items(
    //       Joi.object().keys({
    //         _id: Joi.string().required(),
    //         name: Joi.string().required(),
    //         cryptSpec: Joi.string().required(),
    //         cryptData: Joi.string().required(),
    //         metaData: Joi.object().required(),
    //         bucketAuthorizations: Joi.array()
    //           .required()
    //           .items(
    //             Joi.object()
    //               .required()
    //               .keys({
    //                 userId: Joi.string().required(),
    //                 permissions: Joi.object().required().keys({
    //                   USE: Joi.boolean().required(),
    //                   MODIFY: Joi.boolean().required(),
    //                   MANAGE: Joi.boolean().required(),
    //                 }),
    //               })
    //           ),
    //         rootDirectoryId: Joi.string().required(),
    //       })
    //     ),
    // });

    // let bucket = data.bucketList.find((bucket) => bucket.name === TEST_BUCKET_NAME);
    // expect(bucket).not.toBeFalsy();

    // vars.bucketId = bucket._id;
    // vars.rootDirectoryId = bucket.rootDirectoryId;
  });

  // eof
});
