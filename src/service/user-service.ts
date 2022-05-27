import Nedb from "@seald-io/nedb";
import collections from "../constant/collections.js";
import { DatabaseEngine } from "../lib/database-engine.js";
import { throwOnFalsy, UserError } from "../utility/coded-error.js";

export class UserService {
  db: Nedb;

  constructor(dbEngine: DatabaseEngine) {
    this.db = dbEngine.connection;
  }

  async findUserByIdOrFail(_id: string) {
    let user = await this.db.findOneAsync({
      collection: collections.USER,
      _id,
    });
    throwOnFalsy(
      UserError,
      user,
      "USER_NOT_FOUND",
      "The requested user could not be found."
    );
    return user;
  }

  async findUserOrFail(userName: string) {
    let user = await this.db.findOneAsync({
      collection: collections.USER,
      userName,
    });
    throwOnFalsy(
      UserError,
      user,
      "USER_NOT_FOUND",
      "The requested user could not be found."
    );
    return user;
  }

  async updateOwnCommonProperties(_id: string, displayName: string) {
    return await this.db.updateAsync(
      {
        collection: collections.USER,
        _id,
      },
      {
        $set: {
          displayName,
        },
      }
    );
  }

  async listAllUsers() {
    let userList = await this.db.findAsync({
      collection: collections.USER,
    });
    return userList;
  }

  async updateUserPassword(
    _id: string,
    newPassword: { hash: string; salt: string }
  ) {
    return await this.db.updateAsync(
      {
        collection: collections.USER,
        _id,
      },
      {
        $set: {
          newPassword,
        },
      }
    );
  }
}
