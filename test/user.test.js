import Joi from "joi";
import {
  callHappyPostJsonApi,
  callHappyPostJsonApiWithAuth,
  validateObject,
} from "./testlib/common-api-test-utils.js";

const DEFAULT_USER_NAME = "admin";
const DEFAULT_PASSWORD = "PleaseChangeMe@YourEarliest2Day";

let vars = {
  apiKey: null,
};

test("Login", async () => {
  const data = await callHappyPostJsonApi("/user/login", {
    userName: DEFAULT_USER_NAME,
    password: DEFAULT_PASSWORD,
  });

  await validateObject(data, {
    hasError: Joi.boolean().valid(false).required(),
    apiKey: Joi.string().required(),
    user: Joi.object().required().keys({
      _id: Joi.string().required(),
    }),
    session: Joi.object().required().keys({
      _id: Joi.string().required(),
    }),
  });

  vars.apiKey = data.apiKey;
});

test("Logout", async () => {
  const data = await callHappyPostJsonApiWithAuth(vars.apiKey, "/user/logout", {
    // apiKey: vars.apiKey,
    message: "Logout invoked from test case.",
  });

  await validateObject(data, {
    hasError: Joi.boolean().valid(false).required(),
  });
});

test("Logout: Ensure apiKey is invalidated.", async () => {
  const data = await callHappyPostJsonApiWithAuth(vars.apiKey, "/user/logout", {
    message: "Logout invoked from test case.",
  });

  await validateObject(data, {
    hasError: Joi.boolean().valid(true).required(),
    error: Joi.object()
      .required()
      .keys({
        code: Joi.string().required().valid("API_KEY_NOT_FOUND"),
        message: Joi.string().required(),
        details: Joi.object().required(),
      }),
  });
});
