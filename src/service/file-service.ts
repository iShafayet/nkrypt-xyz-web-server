import Nedb from "@seald-io/nedb";
import collections from "../constant/collections.js";
import { DatabaseEngine } from "../lib/database-engine.js";
import { throwOnFalsy, UserError } from "../utility/coded-error.js";

export class FileService {
  db: Nedb;

  constructor(dbEngine: DatabaseEngine) {
    this.db = dbEngine.connection;
  }
}
