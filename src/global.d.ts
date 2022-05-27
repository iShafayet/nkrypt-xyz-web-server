import { Logger } from "./lib/logger";
import { SessionService } from "./service/session-service";
import { UserService } from "./service/user-service";

declare global {
  var logger: Logger;
  var dispatch: {
    userService: UserService;
    sessionService: SessionService;
  };
}

type JsonValue =
  | string
  | number
  | boolean
  | { [x: string]: JsonValue }
  | Array<JsonValue>;

// We type-alias any as Generic to easily mark improvement scopes without adding comments
type Generic = any;
