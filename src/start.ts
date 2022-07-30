/* NOTE: This file basically deals with a couple of devops actions
         to ease local development. If you're reviewing the codebase
         index.js is your true entrypoint.
*/

import { homedir } from "os";
import path from "path";

import { NkWebServerProgram } from "./index.js";
import { Config } from "./lib/config.js";
import { extractProcessParams, loadConfig } from "./utility/startup-utils.js";

let params = extractProcessParams();
console.log("STARTUP Application parameters: ", params);

const ARG_CONFIG_LOCATION = '--config';

let configLocation = path.join(homedir(), "nkrypt-xyz-web-server-config.json");
if (params.indexOf(ARG_CONFIG_LOCATION) > -1) {
  let index = params.indexOf(ARG_CONFIG_LOCATION) + 1;
  configLocation = params[index];
}
console.log("STARTUP Config location: ", configLocation);

let config: Config = loadConfig(configLocation);

(new NkWebServerProgram()).start(config);