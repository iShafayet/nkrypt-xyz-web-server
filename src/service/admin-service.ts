import Nedb from "@seald-io/nedb";
import collections from "../constant/collections.js";
import constants from "../constant/common-constants.js";
import { GlobalPermission } from "../constant/global-permission.js";
import { GlobalPermissions } from "../global";
import { DatabaseEngine } from "../lib/database-engine.js";
import { calculateHashOfString } from "../utility/security-utils.js";

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
          [GlobalPermission.CREATE_USER]: true,
          [GlobalPermission.MANAGE_ALL_USER]: true,
          [GlobalPermission.CREATE_BUCKET]: true,
        },
        createdAt: Date.now(),
        isBanned: false,
      });
    }
  }

  async addUser(
    displayName: string,
    userName: string,
    password: string,
    globalPermissions: Record<string, boolean>
  ) {
    return await this.db.insertAsync({
      collection: collections.USER,
      displayName,
      userName,
      password: calculateHashOfString(password),
      globalPermissions,
      createdAt: Date.now(),
      isBanned: false,
    });
  }

  async setGlobalPermission(
    userId: string,
    globalPermissions: Record<string, boolean>
  ) {
    return await this.db.updateAsync(
      {
        collection: collections.USER,
        _id: userId
      },
      {
        $set: {
          globalPermissions,
        },
      }
    );
  }
}
