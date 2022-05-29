import { Logger } from "./lib/logger.js";
import { Server } from "./lib/server.js";

import { ConfigLoader } from "./lib/config-loader.js";
import { DatabaseEngine } from "./lib/database-engine.js";

import constants from "./constant/common-constants.js";

import pathlib from "path";
import { prepareServiceDispatch } from "./lib/service-dispatch.js";

import { appRootDirPath, toFileUrl } from "./utility/file-utils.js";
import { wipeOutLocalData } from "./utility/wipe-out.js";

wipeOutLocalData();

// We initiate logger and inject it into global so that it is usable by everyone.
let logger = (global.logger = new Logger({
  switches: {
    debug: false,
    log: false,
    important: true,
    warning: true,
    error: true,
  },
}));
await logger.init();

let config = ConfigLoader.loadConfig();

class Program {
  db!: DatabaseEngine;
  server!: Server;

  async start() {
    try {
      await this._initialize();
    } catch (ex) {
      logger.log("Error propagated to root level. Throwing again.");
      throw ex;
    }
  }

  async _initialize() {
    this.db = new DatabaseEngine(config);
    await this._initiateDatabase();

    await prepareServiceDispatch(this.db);

    await dispatch.adminService.createDefaultAdminAccountIfNotPresent();

    this.server = new Server(config, this.db);
    await this._registerEndpoints();
    await this._startServer();
  }

  async _initiateDatabase() {
    await this.db.init();
  }

  async _registerEndpoints() {
    logger.log("(server)> Dynamically registering APIs");

    const apiNameList = [
      // user
      "user/login",
      "user/assert",
      "user/logout",
      "user/list",
      "user/update-profile",
      "user/update-password",
      // admin
      "admin/iam/add-user",
      // bucket
      "bucket/create",
      "bucket/list",
      // directory
      "directory/create",
      "directory/list",
    ];

    await Promise.all(
      apiNameList.map(async (name) => {
        let path = toFileUrl(pathlib.join(appRootDirPath, constants.api.CORE_API_DIR, `${name}.js`));

        let apiModule = await import(path);
        await this.server.registerJsonPostApi(name, apiModule.Api);
      })
    );
  }

  async _startServer() {
    await this.server.start();
  }
}

new Program().start();
