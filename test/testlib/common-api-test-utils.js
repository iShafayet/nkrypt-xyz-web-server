import fetch from "node-fetch";
import Joi from "joi";

const basePath = "http://localhost:9041/api";

const callPostJsonApi = async (endPoint, postData, authToken = null) => {
  const url = basePath + endPoint;
  console.log(url);

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
    console.log(response.status);
    console.log(await response.text());
    throw new Error("Expected 200");
  }

  return await response.json();
};

const callHappyPostJsonApiWithAuth = async (authToken, endPoint, postData) => {
  const response = await callPostJsonApi(endPoint, postData, authToken);

  if (response.status !== 200) {
    console.log(response.status);
    console.log(await response.text());
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

export {
  callHappyPostJsonApiWithAuth,
  callPostJsonApi,
  callHappyPostJsonApi,
  validateObject,
  validateSchema,
};
