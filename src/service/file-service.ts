import Nedb from "@seald-io/nedb";
import collections from "../constant/collections.js";
import { Generic } from "../global.js";
import { DatabaseEngine } from "../lib/database-engine.js";

export class FileService {
  db: Nedb;

  constructor(dbEngine: DatabaseEngine) {
    this.db = dbEngine.connection;
  }

  async findFileById(bucketId: string, fileId: string) {
    let doc = await this.db.findOneAsync({
      collection: collections.FILE,
      bucketId,
      _id: fileId,
    });
    return doc;
  }

  async findFileByNameAndParent(
    name: string,
    bucketId: string,
    parentDirectoryId: string
  ) {
    let doc = await this.db.findOneAsync({
      collection: collections.FILE,
      name,
      bucketId,
      parentDirectoryId,
    });
    return doc;
  }

  async createFile(
    name: string,
    bucketId: string,
    metaData: Generic,
    encryptedMetaData: string | null,
    createdByUserId: string,
    parentDirectoryId: string | null
  ) {
    return await this.db.insertAsync({
      collection: collections.FILE,
      name,
      bucketId,
      metaData,
      encryptedMetaData,
      createdByUserId,
      parentDirectoryId,
      createdAt: Date.now(),
    });
  }

  async setFileName(bucketId: string, fileId: string, name: string) {
    return await this.db.updateAsync(
      {
        collection: collections.FILE,
        _id: fileId,
        bucketId,
      },
      {
        $set: {
          name,
        },
      }
    );
  }

  async setFileEncryptedMetaData(
    bucketId: string,
    fileId: string,
    encryptedMetaData: string
  ) {
    return await this.db.updateAsync(
      {
        collection: collections.FILE,
        _id: fileId,
        bucketId,
      },
      {
        $set: {
          encryptedMetaData,
        },
      }
    );
  }

  async setFileMetaData(bucketId: string, fileId: string, metaData: Generic) {
    return await this.db.updateAsync(
      {
        collection: collections.FILE,
        _id: fileId,
        bucketId,
      },
      {
        $set: {
          metaData,
        },
      }
    );
  }

  async deleteFile(bucketId: string, fileId: string) {
    return await this.db.removeAsync(
      {
        collection: collections.FILE,
        _id: fileId,
        bucketId,
      },
      { multi: false }
    );
  }

  async moveFile(
    bucketId: string,
    fileId: string,
    newParentDirectoryId: string,
    newName: string
  ) {
    return await this.db.updateAsync(
      {
        collection: collections.FILE,
        _id: fileId,
        bucketId,
      },
      {
        $set: {
          parentDirectoryId: newParentDirectoryId,
          name: newName,
        },
      }
    );
  }

  async listFilesUnderDirectory(bucketId: string, parentDirectoryId: string) {
    let list = await this.db.findAsync({
      collection: collections.FILE,
      bucketId,
      parentDirectoryId,
    });
    return list;
  }
}
