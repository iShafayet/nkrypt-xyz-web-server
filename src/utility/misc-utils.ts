import { DeveloperError } from "./coded-error.js";

function extract(object: any, keyList: string[]) {
  if (typeof object !== "object" || object === null) {
    throw new DeveloperError(
      "GENERIC_OBJECT_NOT_OBJECT",
      "Expected object to be an object"
    );
  }
  let newObject: any = {};
  for (let key of keyList) {
    if (!object.hasOwnProperty(key)) {
      throw new DeveloperError(
        "GENERIC_OBJECT_KEY_MISSING",
        `Expected object to have key "${key}"`
      );
    }
    newObject[key] = object[key];
  }
  return newObject;
}

export { extract };
