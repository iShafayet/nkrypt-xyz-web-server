import Nedb from "@seald-io/nedb";
import collections from "../constant/collections.js";
import { Generic } from "../global.js";
import { DatabaseEngine } from "../lib/database-engine.js";
import { throwOnFalsy, UserError } from "../utility/coded-error.js";

export class BucketService {
  db: Nedb;

  constructor(dbEngine: DatabaseEngine) {
    this.db = dbEngine.connection;
  }

  async findBucketByName(name: string) {
    let doc = await this.db.findOneAsync({
      collection: collections.BUCKET,
      name,
    });
    return doc;
  }

  async createBucket(
    name: string,
    cryptSpec: string,
    cryptData: string,
    metaData: Generic,
    userId: string
  ) {
    return await this.db.insertAsync({
      collection: collections.BUCKET,
      name,
      cryptSpec,
      cryptData,
      metaData,
      bucketAuthorizations: [
        {
          userId: userId,
          permissions: {
            USE: true,
            MODIFY: true,
            MANAGE: true,
          },
        },
      ],
    });
  }

  async listAllBuckets() {
    let list = await this.db.findAsync({
      collection: collections.BUCKET,
    });
    return list;
  }
}
