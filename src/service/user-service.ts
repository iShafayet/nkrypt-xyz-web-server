import Nedb from "@seald-io/nedb";
import collections from "../constant/collections.js";
import { DatabaseEngine } from "../lib/database-engine.js";
import { throwOnFalsy, UserError } from "../utility/coded-error.js";

export class UserService {
  db: Nedb;

  constructor(dbEngine: DatabaseEngine) {
    this.db = dbEngine.connection;
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
}
