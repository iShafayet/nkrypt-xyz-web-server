/* NOTE: This file basically deals with a couple of devops actions
         to ease local development. If you're reviewing the codebase
         index.js is your true entrypoint.
*/

import { existsSync, rmSync } from "fs";

import { NkWebServerProgram } from "./index.js";
import { Config } from "./lib/config.js";
import { extractProcessParams } from "./utility/startup-utils.js";

const wipeOutLocalData = () => {
  console.log("STARTUP Clearing local data.")
  // DANGER - start
  const testDatabaseDir = "./nkrypt-xyz-local-data/db/";
  if (existsSync(testDatabaseDir)) {
    rmSync(testDatabaseDir, { recursive: true, force: true });
  }
  const testBlobDir = "./nkrypt-xyz-local-data/blob/";
  if (existsSync(testBlobDir)) {
    rmSync(testBlobDir, { recursive: true, force: true });
  }
  // DANGER - end
}

let params = extractProcessParams();
console.log("STARTUP Application parameters: ", params);

const ARG_AMNESIAC = '--amnesiac';

if (params.indexOf(ARG_AMNESIAC) > -1) {
  wipeOutLocalData();
}

let config: Config = {
  webServer: {
    port: 9041,
    contextPath: "/",
  },
  database: {
    dir: "./nkrypt-xyz-local-data/db/",
  },
  lockProvider: {
    dir: "./nkrypt-xyz-local-data/lock/",
  },
  blobStorage: {
    dir: "./nkrypt-xyz-local-data/blob/",
    maxFileSizeBytes: 1024 * 1024 * 1024,
  },
};

(new NkWebServerProgram()).start(config);