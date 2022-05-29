import Nedb from "@seald-io/nedb";
import collections from "../constant/collections.js";
import { Generic } from "../global.js";
import { DatabaseEngine } from "../lib/database-engine.js";
import { throwOnFalsy, UserError } from "../utility/coded-error.js";

export class DirectoryService {
  db: Nedb;

  constructor(dbEngine: DatabaseEngine) {
    this.db = dbEngine.connection;
  }

  async listChildrenOfDirectory(bucketId: string, parentDirectoryId: string) {
    let list = await this.db.findAsync({
      collection: collections.DIRECTORY,
      bucketId,
      parentDirectoryId,
    });
    return list;
  }

  async findDirectoryById(bucketId: string, directoryId: string) {
    let doc = await this.db.findOneAsync({
      collection: collections.DIRECTORY,
      bucketId,
      _id: directoryId,
    });
    return doc;
  }

  async findDirectoryByNameAndParent(name: string, bucketId: string, parentDirectoryId: string) {
    let doc = await this.db.findOneAsync({
      collection: collections.DIRECTORY,
      name,
      bucketId,
      parentDirectoryId,
    });
    return doc;
  }

  async createDirectory(
    name: string,
    bucketId: string,
    metaData: Generic,
    encryptedMetaData: string | null,
    createdByUserId: string,
    parentDirectoryId: string | null
  ) {
    return await this.db.insertAsync({
      collection: collections.DIRECTORY,
      name,
      bucketId,
      metaData,
      encryptedMetaData,
      createdByUserId,
      parentDirectoryId,
      createdAt: Date.now(),
    });
  }

  async listDirectoriesByIdList(idList: string[]) {
    let list = await this.db.findAsync({
      collection: collections.DIRECTORY,
      bucketId: { $in: idList },
      parentDirectoryId: null,
    });
    return list;
  }
}
