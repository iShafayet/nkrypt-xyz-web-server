import { Logger } from "./lib/logger";

declare global {
  var logger: Logger;
}

type JsonValue =
  | string
  | number
  | boolean
  | { [x: string]: JsonValue }
  | Array<JsonValue>;
