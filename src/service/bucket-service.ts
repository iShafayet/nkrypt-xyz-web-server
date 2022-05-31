import Nedb from "@seald-io/nedb";
import { BucketPermission } from "../constant/bucket-permission.js";
import collections from "../constant/collections.js";
import { Generic } from "../global.js";
import { DatabaseEngine } from "../lib/database-engine.js";

export class BucketService {
  db: Nedb;

  constructor(dbEngine: DatabaseEngine) {
    this.db = dbEngine.connection;
  }

  async findBucketById(id: string) {
    let doc = await this.db.findOneAsync({
      collection: collections.BUCKET,
      _id: id,
    });
    return doc;
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
          permissions: this.createNewBucketPermissionAllAllowed(),
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

  async setBucketName(bucketId: string, name: string) {
    return await this.db.updateAsync(
      {
        collection: collections.BUCKET,
        _id: bucketId,
      },
      {
        $set: {
          name,
        },
      }
    );
  }

  async setBucketMetaData(bucketId: string, metaData: Generic) {
    return await this.db.updateAsync(
      {
        collection: collections.BUCKET,
        _id: bucketId,
      },
      {
        $set: {
          metaData,
        },
      }
    );
  }

  async removeBucket(bucketId: string) {
    return await this.db.removeAsync(
      {
        collection: collections.BUCKET,
        _id: bucketId,
      },
      { multi: false }
    );
  }

  createNewBucketPermissionAllAllowed() {
    return Object.keys(BucketPermission).reduce((map: Generic, key) => {
      map[key] = true;
      return map;
    }, {});
  }

  createNewBucketPermissionAllForbidden() {
    return Object.keys(BucketPermission).reduce((map: Generic, key) => {
      map[key] = false;
      return map;
    }, {});
  }

  async authorizeUserWithAllPermissionsForbidden(
    bucketId: string,
    userId: string
  ) {
    return await this.db.updateAsync(
      {
        collection: collections.BUCKET,
        _id: bucketId,
      },
      {
        $push: {
          bucketAuthorizations: {
            userId,
            permissions: this.createNewBucketPermissionAllForbidden(),
          },
        },
      }
    );
  }

  async setAuthorizationList(bucketId: string, bucketAuthorizations: Generic) {
    return await this.db.updateAsync(
      {
        collection: collections.BUCKET,
        _id: bucketId,
      },
      {
        $set: {
          bucketAuthorizations,
        },
      }
    );
  }
}
