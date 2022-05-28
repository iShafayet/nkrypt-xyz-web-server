import Joi from "joi";

import {
  callHappyPostJsonApi,
  callHappyPostJsonApiWithAuth,
  validateObject,
} from "./testlib/common-api-test-utils.js";

const DEFAULT_USER_NAME = "admin";
const DEFAULT_PASSWORD = "PleaseChangeMe@YourEarliest2Day";

const TEST_USER_USER_NAME = "testuser1";
const TEST_USER_DISPLAY_NAME = "Test User 1";
const TEST_USER_PASSWORD = "ExamplePassword";

let vars = {
  apiKey: null,
};

describe("Admin Suite", () => {
  test("Admin Login: Basic", async () => {
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

  test("Admin Add User", async () => {
    const data = await callHappyPostJsonApiWithAuth(
      vars.apiKey,
      "/admin/iam/add-user",
      {
        displayName: TEST_USER_DISPLAY_NAME,
        userName: TEST_USER_USER_NAME,
        password: TEST_USER_PASSWORD,
      }
    );

    await validateObject(data, {
      hasError: Joi.boolean().valid(false).required(),
    });
  });
});
