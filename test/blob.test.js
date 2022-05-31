import Joi from "joi";

import {
  callHappyPostJsonApi,
  callHappyPostJsonApiWithAuth,
  validateObject,
} from "./testlib/common-api-test-utils.js";

import {
  directorySchema,
  fileSchema,
  bucketListSchema,
  userAssertion,
  errorOfCode,
} from "./testlib/common-test-schema.js";

import { validators } from "../dist/validators.js";

const DEFAULT_USER_NAME = "admin";
const DEFAULT_PASSWORD = "PleaseChangeMe@YourEarliest2Day";

const TEST_BUCKET_NAME = "BuckX-" + Date.now();
const TEST_FILE_P_NAME = "FileP-" + Date.now();

const TEST_INITIAL_METADATA = { createdFromApp: "Integration testing" };
const TEST_INITIAL_ENCRYPTED_METADATA = "PLACEHOLDER";

let vars = {
  apiKey: null,
  bucketId: null,
  rootDirectoryId: null,
  idOfDirectoryA: null,
  idOfDirectoryB: null,
  idOfFileP: null,
};

describe("Blob Suite", () => {
  test("(user/login): Preparational", async () => {
    const data = await callHappyPostJsonApi("/user/login", {
      userName: DEFAULT_USER_NAME,
      password: DEFAULT_PASSWORD,
    });

    await validateObject(data, userAssertion);

    vars.apiKey = data.apiKey;
  });

  test("(bucket/create): Preparational", async () => {
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

    vars.bucketId = data.bucketId;
    vars.rootDirectoryId = data.rootDirectoryId;
  });

  test("(file/create): BuckXRoot/FileP", async () => {
    const data = await callHappyPostJsonApiWithAuth(
      vars.apiKey,
      "/file/create",
      {
        name: TEST_FILE_P_NAME,
        bucketId: vars.bucketId,
        parentDirectoryId: vars.rootDirectoryId,
        encryptedMetaData: TEST_INITIAL_ENCRYPTED_METADATA,
        metaData: TEST_INITIAL_METADATA,
      }
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
      fileId: validators.id,
    });

    vars.idOfFileP = data.fileId;
  });

  // eof
});
