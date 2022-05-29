import Joi from "joi";

import {
  callHappyPostJsonApi,
  callHappyPostJsonApiWithAuth,
  validateObject,
} from "./testlib/common-api-test-utils.js";

const DEFAULT_USER_NAME = "admin";
const DEFAULT_PASSWORD = "PleaseChangeMe@YourEarliest2Day";

const TEST_BUCKET_NAME = "testBucket1-" + Date.now();

let vars = {
  apiKey: null,
};

describe("Bucket Suite", () => {
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
      hasError: Joi.boolean().valid(false).required(),
      bucketId: Joi.string().required(),
      rootDirectoryId: Joi.string().required(),
    });
  });

  // eof
});
