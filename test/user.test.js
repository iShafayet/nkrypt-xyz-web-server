import Joi from "joi";

import {
  callPostJsonApi,
  callHappyPostJsonApi,
  callHappyPostJsonApiWithAuth,
  validateObject,
} from "./testlib/common-api-test-utils.js";

import {
  directorySchema,
  bucketListSchema,
  userAssertion,
  errorOfCode,
  userListSchema,
} from "./testlib/common-test-schema.js";

import { validators } from "../dist/validators.js";

const DEFAULT_USER_NAME = "admin";
const DEFAULT_PASSWORD = "PleaseChangeMe@YourEarliest2Day";

const UPDATED_PASSWORD = "UpdatedPassword";

let vars = {
  apiKey: null,
};

describe("User Suite", () => {
  test("(user/login): Affirmative", async () => {
    const data = await callHappyPostJsonApi(200, "/user/login", {
      userName: DEFAULT_USER_NAME,
      password: DEFAULT_PASSWORD,
    });

    await validateObject(data, userAssertion);

    vars.apiKey = data.apiKey;
  });

  test("(user/logout): Affirmative", async () => {
    const data = await callHappyPostJsonApiWithAuth(200,
      vars.apiKey,
      "/user/logout",
      {
        message: "Logout invoked from test case.",
      }
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
    });
  });

  test("(user/assert): Ensure apiKey is invalidated", async () => {
    const response = await callPostJsonApi("/user/assert", {}, vars.apiKey);
    expect(response.status).toEqual(401);
    let data = await response.json();

    await validateObject(data, {
      hasError: validators.hasErrorTruthy,
      error: errorOfCode("API_KEY_EXPIRED"),
    });
  });

  test("(user/login): Again", async () => {
    const data = await callHappyPostJsonApi(200, "/user/login", {
      userName: DEFAULT_USER_NAME,
      password: DEFAULT_PASSWORD,
    });

    await validateObject(data, userAssertion);

    vars.apiKey = data.apiKey;
  });

  test("(user/list): Affirmative", async () => {
    const data = await callHappyPostJsonApiWithAuth(200,
      vars.apiKey,
      "/user/list",
      {}
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
      userList: userListSchema,
    });

    expect(data.userList).toContainEqual({
      userName: "admin",
      displayName: "Administrator",
    });
  });

  test("(user/update-profile): Affirmative", async () => {
    const data = await callHappyPostJsonApiWithAuth(200,
      vars.apiKey,
      "/user/update-profile",
      {
        displayName: "Administrator Edited",
      }
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
    });
  });

  test("(user/list): Confirm profile was updated", async () => {
    const data = await callHappyPostJsonApiWithAuth(200,
      vars.apiKey,
      "/user/list",
      {}
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
      userList: userListSchema,
    });

    expect(data.userList).toContainEqual({
      userName: "admin",
      displayName: "Administrator Edited",
    });
  });

  test("(user/update-profile): Revert name change", async () => {
    const data = await callHappyPostJsonApiWithAuth(200,
      vars.apiKey,
      "/user/update-profile",
      {
        displayName: "Administrator",
      }
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
    });
  });

  test("(user/update-password): Affirmative", async () => {
    const data = await callHappyPostJsonApiWithAuth(200,
      vars.apiKey,
      "/user/update-password",
      {
        currentPassword: DEFAULT_PASSWORD,
        newPassword: UPDATED_PASSWORD,
      }
    );

    await validateObject(data, {
      hasError: validators.hasErrorFalsy,
    });
  });

  test("(user/assert): Ensure apiKey is invalidated when password is updated", async () => {
    const response = await callPostJsonApi("/user/assert", {}, vars.apiKey);
    expect(response.status).toEqual(401);
    let data = await response.json();

    await validateObject(data, {
      hasError: validators.hasErrorTruthy,
      error: errorOfCode("API_KEY_EXPIRED"),
    });
  });
});
