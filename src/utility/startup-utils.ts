import { readFileSync } from "fs";
import { Config } from "../lib/config.js";

export const extractProcessParams = () => {
  if (process.argv.length < 2) {
    throw new Error("Invalid number of arguments");
  }

  let index = process.argv.findIndex(arg => {
    return (arg.indexOf('start.js') > -1) || (arg.indexOf('start-dev.js') > -1)
  });

  if (index === -1) {
    throw new Error("Expected start.js or start-dev.js in process arguments.");
  }

  return process.argv.slice(index + 1);
}

export const loadConfig = (path: String): Config => {
  let content = readFileSync(<any>path, { encoding: 'utf8' });
  return JSON.parse(content);
}