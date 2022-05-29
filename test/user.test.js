/* eslint-disable no-undef */

import Joi from "joi";

import { callHappyPostJsonApi, callHappyPostJsonApiWithAuth, validateObject } from "./testlib/common-api-test-utils.js";

const DEFAULT_USER_NAME = "admin";
const DEFAULT_PASSWORD = "PleaseChangeMe@YourEarliest2Day";

const UPDATED_PASSWORD = "UpdatedPassword";

let vars = {
  apiKey: null,
};

describe("User Suite", () => {
  test("Login: Basic", async () => {
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

  test("Logout: Basic", async () => {
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
          code: Joi.string().required().valid("API_KEY_EXPIRED"),
          message: Joi.string().required(),
          details: Joi.object().required(),
        }),
    });
  });

  test("Login: Again", async () => {
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

  test("List: Basic", async () => {
    const data = await callHappyPostJsonApiWithAuth(vars.apiKey, "/user/list", {});

    await validateObject(data, {
      hasError: Joi.boolean().valid(false).required(),
      userList: Joi.array()
        .items(
          Joi.object().keys({
            userName: Joi.string().required(),
            displayName: Joi.string().required(),
          })
        )
        .required(),
    });

    expect(data.userList).toContainEqual({
      userName: "admin",
      displayName: "Administrator",
    });
  });

  test("Update: Basic", async () => {
    const data = await callHappyPostJsonApiWithAuth(vars.apiKey, "/user/update-profile", {
      displayName: "Administrator Edited",
    });

    await validateObject(data, {
      hasError: Joi.boolean().valid(false).required(),
    });
  });

  test("List: Update confirmation", async () => {
    const data = await callHappyPostJsonApiWithAuth(vars.apiKey, "/user/list", {});

    await validateObject(data, {
      hasError: Joi.boolean().valid(false).required(),
      userList: Joi.array()
        .items(
          Joi.object().keys({
            userName: Joi.string().required(),
            displayName: Joi.string().required(),
          })
        )
        .required(),
    });

    expect(data.userList).toContainEqual({
      userName: "admin",
      displayName: "Administrator Edited",
    });
  });

  test("Update: Revert", async () => {
    const data = await callHappyPostJsonApiWithAuth(vars.apiKey, "/user/update-profile", {
      displayName: "Administrator",
    });

    await validateObject(data, {
      hasError: Joi.boolean().valid(false).required(),
    });
  });

  test("Update Password: Basic", async () => {
    const data = await callHappyPostJsonApiWithAuth(vars.apiKey, "/user/update-password", {
      currentPassword: DEFAULT_PASSWORD,
      newPassword: UPDATED_PASSWORD,
    });

    await validateObject(data, {
      hasError: Joi.boolean().valid(false).required(),
    });
  });

  test("Assert: Ensure apiKey is invalidated.", async () => {
    const data = await callHappyPostJsonApiWithAuth(vars.apiKey, "/user/assert");

    await validateObject(data, {
      hasError: Joi.boolean().valid(true).required(),
      error: Joi.object()
        .required()
        .keys({
          code: Joi.string().required().valid("API_KEY_EXPIRED"),
          message: Joi.string().required(),
          details: Joi.object().required(),
        }),
    });
  });
});
