import Nedb from "@seald-io/nedb";
import collections from "../constant/collections";
import { DatabaseEngine } from "../lib/database-engine";
import { throwOnFalsy } from "../utility/coded-error";

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
      user,
      "USER_NOT_FOUND",
      "The requested user could not be found."
    );
    return user;
  }
}
