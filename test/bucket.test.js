/* eslint-disable no-undef */

import Joi from "joi";

import {
  callHappyPostJsonApi,
  callHappyPostJsonApiWithAuth,
  validateObject,
} from "./testlib/common-api-test-utils.js";

import {
  directorySchema,
  bucketListSchema,
  userAssertion,
} from "./testlib/common-test-schema.js";

import { validators } from "../dist/validators.js";

const DEFAULT_USER_NAME = "admin";
const DEFAULT_PASSWORD = "PleaseChangeMe@YourEarliest2Day";

const TEST_BUCKET_NAME = "testBucket1-" + Date.now();
const TEST_BUCKET_NEW_NAME = "testBucket1Renamed-" + Date.now();
const TEST_LEVEL_1_DIRECTORY_1_NAME = "testL1Dir1-" + Date.now();
const TEST_LEVEL_1_DIRECTORY_2_NAME = "testL1Dir2-" + Date.now();
const TEST_LEVEL_2_DIRECTORY_1_NAME = "testL2Dir1-" + Date.now();

let vars = {
  apiKey: null,
  bucketId: null,
  rootDirectoryId: null,
  level1Directory1Id: null,
  level1Directory2Id: null,
};

describe("Bucket and Directory Suite", () => {
  test("(user/login): Preparational", async () => {
    const data = await callHappyPostJsonApi("/user/login", {
      userName: DEFAULT_USER_NAME,
      password: DEFAULT_PASSWORD,
    });

    await validateObject(data, userAssertion);

    vars.apiKey = data.apiKey;
  });

  test("(bucket/create): Affirmative", async () => {
    const data = await callHappyPostJsonApiWithAuth(
      vars.apiKey,
      "/bucket/create",
      {
        name: TEST_BUCKET_NAME,
        cryptSpec: "V1:AES256",
        cryptData: "PLACEHOLDER",
        metaData: {},
      }
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
      bucketId: validators.id,
      rootDirectoryId: validators.id,
    });
  });

  test("(bucket/list): Affirmative", async () => {
    const data = await callHappyPostJsonApiWithAuth(
      vars.apiKey,
      "/bucket/list",
      {}
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
      bucketList: bucketListSchema,
    });

    let bucket = data.bucketList.find(
      (bucket) => bucket.name === TEST_BUCKET_NAME
    );
    expect(bucket).not.toBeFalsy();

    vars.bucketId = bucket._id;
    vars.rootDirectoryId = bucket.rootDirectoryId;
  });

  test("(directory/create): Bucket1Root/Level1Directory1", async () => {
    const data = await callHappyPostJsonApiWithAuth(
      vars.apiKey,
      "/directory/create",
      {
        name: TEST_LEVEL_1_DIRECTORY_1_NAME,
        bucketId: vars.bucketId,
        parentDirectoryId: vars.rootDirectoryId,
        encryptedMetaData: "PLACEHOLDER",
        metaData: { createdFromApp: "Integration testing" },
      }
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
      directoryId: validators.id,
    });

    vars.level1Directory1Id = data.directoryId;
  });

  test("(directory/create): Bucket1Root/Level1Directory2", async () => {
    const data = await callHappyPostJsonApiWithAuth(
      vars.apiKey,
      "/directory/create",
      {
        name: TEST_LEVEL_1_DIRECTORY_2_NAME,
        bucketId: vars.bucketId,
        parentDirectoryId: vars.rootDirectoryId,
        encryptedMetaData: "PLACEHOLDER",
        metaData: { createdFromApp: "Integration testing" },
      }
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
      directoryId: validators.id,
    });

    vars.level1Directory2Id = data.directoryId;
  });

  test("(directory/create) Bucket1Root/Level1Directory1/Level2Directory1", async () => {
    const data = await callHappyPostJsonApiWithAuth(
      vars.apiKey,
      "/directory/create",
      {
        name: TEST_LEVEL_2_DIRECTORY_1_NAME,
        bucketId: vars.bucketId,
        parentDirectoryId: vars.level1Directory1Id,
        encryptedMetaData: "PLACEHOLDER",
        metaData: { createdFromApp: "Integration testing" },
      }
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
      directoryId: validators.id,
    });
  });

  test("(directory/get): Bucket1Root/*", async () => {
    const data = await callHappyPostJsonApiWithAuth(
      vars.apiKey,
      "/directory/get",
      {
        bucketId: vars.bucketId,
        directoryId: vars.rootDirectoryId,
      }
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
      directory: directorySchema,
      childDirectoryList: Joi.array().required().items(directorySchema),
    });

    expect(data.childDirectoryList.length).toEqual(2);
  });

  test("(directory/get): Bucket1Root/Level1Directory1/*", async () => {
    const data = await callHappyPostJsonApiWithAuth(
      vars.apiKey,
      "/directory/get",
      {
        bucketId: vars.bucketId,
        directoryId: vars.level1Directory1Id,
      }
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
      directory: directorySchema,
      childDirectoryList: Joi.array().required().items(directorySchema),
    });

    expect(data.childDirectoryList.length).toEqual(1);
  });

  test("(directory/get): Bucket1Root/Level1Directory1/Level2Directory1/*", async () => {
    const data = await callHappyPostJsonApiWithAuth(
      vars.apiKey,
      "/directory/get",
      {
        bucketId: vars.bucketId,
        directoryId: vars.level1Directory2Id,
      }
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
      directory: directorySchema,
      childDirectoryList: Joi.array().optional().max(0),
    });

    expect(data.childDirectoryList.length).toEqual(0);
  });

  test("(bucket/rename): Affirmative", async () => {
    const data = await callHappyPostJsonApiWithAuth(
      vars.apiKey,
      "/bucket/rename",
      {
        name: TEST_BUCKET_NEW_NAME,
        bucketId: vars.bucketId,
      }
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
    });
  });

  test("(bucket/list): Ensure rename worked", async () => {
    const data = await callHappyPostJsonApiWithAuth(
      vars.apiKey,
      "/bucket/list",
      {}
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
      bucketList: bucketListSchema,
    });

    let bucket1 = data.bucketList.find(
      (bucket) => bucket.name === TEST_BUCKET_NAME
    );
    expect(bucket1).toBeFalsy();

    let bucket2 = data.bucketList.find(
      (bucket) =>
        bucket.name === TEST_BUCKET_NEW_NAME && bucket._id == vars.bucketId
    );
    expect(bucket2).not.toBeFalsy();
  });

  test("(bucket/destroy): Affirmative", async () => {
    const data = await callHappyPostJsonApiWithAuth(
      vars.apiKey,
      "/bucket/destroy",
      {
        name: TEST_BUCKET_NEW_NAME,
        bucketId: vars.bucketId,
      }
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
    });
  });

  test("(bucket/list): Ensure destroy worked", async () => {
    const data = await callHappyPostJsonApiWithAuth(
      vars.apiKey,
      "/bucket/list",
      {}
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
      bucketList: bucketListSchema,
    });

    let bucket1 = data.bucketList.find((bucket) => bucket._id == vars.bucketId);
    expect(bucket1).toBeFalsy();
  });

  // eof
});
