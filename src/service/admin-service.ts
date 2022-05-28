import Nedb from "@seald-io/nedb";
import collections from "../constant/collections.js";
import constants from "../constant/common-constants.js";
import { Generic, GlobalPermissions } from "../global";
import { DatabaseEngine } from "../lib/database-engine.js";
import {
  DeveloperError,
  throwOnFalsy,
  UserError,
} from "../utility/coded-error.js";
import { calculateHashOfString } from "../utility/security-utils.js";
import { generateRandomString } from "../utility/string-utils.js";

export class AdminService {
  db: Nedb;

  constructor(dbEngine: DatabaseEngine) {
    this.db = dbEngine.connection;
  }

  async createDefaultAdminAccountIfNotPresent() {
    let defaultAdmin = await this.db.findOneAsync({
      collection: collections.USER,
      userName: constants.iam.DEFAULT_ADMIN_USER_NAME,
    });

    if (!defaultAdmin) {
      await this.db.insertAsync({
        collection: collections.USER,
        displayName: constants.iam.DEFAULT_ADMIN_DISPLAY_NAME,
        userName: constants.iam.DEFAULT_ADMIN_USER_NAME,
        password: calculateHashOfString(
          constants.iam.DEFAULT_ADMIN_USER_PASSWORD
        ),
        globalPermissions: {
          MANAGE_ALL_USER: true,
          CREATE_USER: true,
        },
        createdAt: Date.now(),
      });
    }
  }

  async addUser(
    displayName: string,
    userName: string,
    password: string,
    globalPermissions: GlobalPermissions
  ) {
    return await this.db.insertAsync({
      collection: collections.USER,
      displayName,
      userName,
      password: calculateHashOfString(password),
      globalPermissions,
      createdAt: Date.now(),
    });
  }
}
