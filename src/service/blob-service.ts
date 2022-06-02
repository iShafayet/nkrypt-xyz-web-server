import Nedb from "@seald-io/nedb";
import collections from "../constant/collections.js";
import { Generic } from "../global.js";
import { BlobStorage } from "../lib/blob-storage.js";
import { DatabaseEngine } from "../lib/database-engine.js";
import { createSizeLimiterPassthroughStream } from "../utility/stream-utils.js";

export class BlobService {
  db: Nedb;
  blobStorage: BlobStorage;

  constructor(dbEngine: DatabaseEngine, blobStorage: BlobStorage) {
    this.db = dbEngine.connection;
    this.blobStorage = blobStorage;
  }

  createStandardSizeLimiter() {
    return createSizeLimiterPassthroughStream(
      dispatch.config.blobStorage.maxFileSizeBytes
    );
  }

  async createInProgressBlob(bucketId: string, fileId: string) {
    let blob: Generic = await this.db.insertAsync({
      collection: collections.BLOB,
      bucketId,
      fileId,
      startedAt: Date.now(),
      finishedAt: null,
      status: "started",
      createdAt: Date.now(),
    });

    let stream = this.blobStorage.createWritableStream(blob._id);

    return { blob, stream };
  }

  async markBlobAsErroneous(bucketId: string, fileId: string, blobId: string) {
    return await this.db.updateAsync(
      {
        collection: collections.BLOB,
        _id: blobId,
        bucketId,
        fileId,
      },
      {
        $set: {
          status: "error",
        },
      }
    );
  }

  async markBlobAsFinished(bucketId: string, fileId: string, blobId: string) {
    return await this.db.updateAsync(
      {
        collection: collections.BLOB,
        _id: blobId,
        bucketId,
        fileId,
      },
      {
        $set: {
          status: "finished",
          finishedAt: Date.now(),
        },
      }
    );
  }

  async removeAllOtherBlobs(bucketId: string, fileId: string, blobId: string) {
    let blob: Generic = await this.db.insertAsync({
      collection: collections.BLOB,
      bucketId,
      fileId,
      startedAt: Date.now(),
      finishedAt: null,
      status: "started",
      createdAt: Date.now(),
    });

    let stream = this.blobStorage.createWritableStream(blob._id);

    return { blob, stream };
  }

  // async findFileById(bucketId: string, fileId: string) {
  //   let doc = await this.db.findOneAsync({
  //     collection: collections.BLOB,
  //     bucketId,
  //     _id: fileId,
  //   });
  //   return doc;
  // }

  // async findFileByNameAndParent(
  //   name: string,
  //   bucketId: string,
  //   parentDirectoryId: string
  // ) {
  //   let doc = await this.db.findOneAsync({
  //     collection: collections.FILE,
  //     name,
  //     bucketId,
  //     parentDirectoryId,
  //   });
  //   return doc;
  // }

  // async setFileName(bucketId: string, fileId: string, name: string) {
  //   return await this.db.updateAsync(
  //     {
  //       collection: collections.FILE,
  //       _id: fileId,
  //       bucketId,
  //     },
  //     {
  //       $set: {
  //         name,
  //       },
  //     }
  //   );
  // }

  // async setFileEncryptedMetaData(
  //   bucketId: string,
  //   fileId: string,
  //   encryptedMetaData: string
  // ) {
  //   return await this.db.updateAsync(
  //     {
  //       collection: collections.FILE,
  //       _id: fileId,
  //       bucketId,
  //     },
  //     {
  //       $set: {
  //         encryptedMetaData,
  //       },
  //     }
  //   );
  // }

  // async setFileMetaData(bucketId: string, fileId: string, metaData: Generic) {
  //   return await this.db.updateAsync(
  //     {
  //       collection: collections.FILE,
  //       _id: fileId,
  //       bucketId,
  //     },
  //     {
  //       $set: {
  //         metaData,
  //       },
  //     }
  //   );
  // }

  // async deleteFile(bucketId: string, fileId: string) {
  //   return await this.db.removeAsync(
  //     {
  //       collection: collections.FILE,
  //       _id: fileId,
  //       bucketId,
  //     },
  //     { multi: false }
  //   );
  // }

  // async moveFile(
  //   bucketId: string,
  //   fileId: string,
  //   newParentDirectoryId: string,
  //   newName: string
  // ) {
  //   return await this.db.updateAsync(
  //     {
  //       collection: collections.FILE,
  //       _id: fileId,
  //       bucketId,
  //     },
  //     {
  //       $set: {
  //         parentDirectoryId: newParentDirectoryId,
  //         name: newName,
  //       },
  //     }
  //   );
  // }

  // async listFilesUnderDirectory(bucketId: string, parentDirectoryId: string) {
  //   let list = await this.db.findAsync({
  //     collection: collections.FILE,
  //     bucketId,
  //     parentDirectoryId,
  //   });
  //   return list;
  // }
}
