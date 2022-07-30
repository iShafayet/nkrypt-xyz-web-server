/* eslint-disable no-undef */

import fetch from "node-fetch";
import Joi from "joi";

const basePath = "http://localhost:9041/api";

const callPostJsonApi = async (endPoint, postData, authToken = null) => {
  const url = basePath + endPoint;
  // console.log("POST " + url);

  const body = JSON.stringify(postData);

  let headers = { "Content-Type": "application/json" };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    method: "post",
    body,
    headers,
  });

  return response;
};

const callHappyPostJsonApi = async (endPoint, postData) => {
  const response = await callPostJsonApi(endPoint, postData);

  if (response.status !== 200) {
    console.log("UNSUCCESSFUL Endpoint: ", endPoint);
    console.log("UNSUCCESSFUL Request: ", postData);
    console.log("UNSUCCESSFUL Status: ", response.status);
    console.log("UNSUCCESSFUL Response: ", await response.text());
    throw new Error("Expected 200");
  }

  return await response.json();
};

const callHappyPostJsonApiWithAuth = async (authToken, endPoint, postData) => {
  const response = await callPostJsonApi(endPoint, postData, authToken);

  if (response.status !== 200) {
    console.log("UNSUCCESSFUL Endpoint: ", endPoint);
    console.log("UNSUCCESSFUL authToken: ", authToken);
    console.log("UNSUCCESSFUL Request: ", postData);
    console.log("UNSUCCESSFUL Status: ", response.status);
    console.log("UNSUCCESSFUL Response: ", await response.text());
    throw new Error("Expected 200");
  }

  return await response.json();
};

const validateSchema = async (data, schema) => {
  return await schema.validateAsync(data);
};

const validateObject = async (data, objectKeysMap) => {
  return await validateSchema(
    data,
    Joi.object().keys(objectKeysMap).required()
  );
};

const callRawPostApi = async (endPoint, authToken, body) => {
  const basePath = "http://localhost:9041/api";
  const url = basePath + endPoint;
  let headers = { "Content-Type": "text/plain" };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  const response = await fetch(url, {
    method: "post",
    body,
    headers,
  });
  return response;
};

export {
  callHappyPostJsonApiWithAuth,
  callPostJsonApi,
  callHappyPostJsonApi,
  validateObject,
  validateSchema,
  callRawPostApi,
};
