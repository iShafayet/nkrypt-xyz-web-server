import Joi from "joi";

import {
  callHappyPostJsonApi,
  callHappyPostJsonApiWithAuth,
  validateObject,
} from "./testlib/common-api-test-utils.js";

import { userAssertion } from "./testlib/common-test-schema.js";

import { validators } from "../dist/validators.js";

const DEFAULT_USER_NAME = "admin";
const DEFAULT_PASSWORD = "PleaseChangeMe@YourEarliest2Day";

const TEST_USER_USER_NAME = "testuser1-" + Date.now();
const TEST_USER_DISPLAY_NAME = "Test User 1";
const TEST_USER_PASSWORD = "ExamplePassword";

let vars = {
  apiKey: null,
  newUserId: null
};

describe("Admin Suite", () => {
  test("(user/login): Preparational", async () => {
    const data = await callHappyPostJsonApi(200, "/user/login", {
      userName: DEFAULT_USER_NAME,
      password: DEFAULT_PASSWORD,
    });

    await validateObject(data, userAssertion);

    vars.apiKey = data.apiKey;
  });

  test("(admin/iam/add-user): Create new user", async () => {
    const data = await callHappyPostJsonApiWithAuth(200,
      vars.apiKey,
      "/admin/iam/add-user",
      {
        displayName: TEST_USER_DISPLAY_NAME,
        userName: TEST_USER_USER_NAME,
        password: TEST_USER_PASSWORD,
      }
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
      userId: validators.id,
    });

    vars.newUserId = data.userId;
  });

  test("(admin/iam/set-global-permissions): Set Global Permissions", async () => {
    const data = await callHappyPostJsonApiWithAuth(200,
      vars.apiKey,
      "/admin/iam/set-global-permissions",
      {
        userId: vars.newUserId,
        globalPermissions: {
          CREATE_USER: true,
        }
      }
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy
    });
  });

  test("(user/login): Ensure newly created user can log in and has the newly set permission", async () => {
    const data = await callHappyPostJsonApi(200, "/user/login", {
      userName: TEST_USER_USER_NAME,
      password: TEST_USER_PASSWORD,
    });

    await validateObject(data, userAssertion);

    expect(data.user.globalPermissions.CREATE_USER).toBe(true);
  });
});
