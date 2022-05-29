import Nedb from "@seald-io/nedb";
import { DatabaseEngine } from "../lib/database-engine.js";

export class FileService {
  db: Nedb;

  constructor(dbEngine: DatabaseEngine) {
    this.db = dbEngine.connection;
  }
}
