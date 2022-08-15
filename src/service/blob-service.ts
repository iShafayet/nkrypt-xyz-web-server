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

  async createInProgressBlob(bucketId: string, fileId: string, cryptoMetaHeaderContent: string) {
    let blob: Generic = await this.db.insertAsync({
      collection: collections.BLOB,
      bucketId,
      fileId,
      startedAt: Date.now(),
      finishedAt: null,
      status: "started",
      createdAt: Date.now(),
      cryptoMetaHeaderContent
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

  async findBlobByBucketIdAndFileId(bucketId: string, fileId: string) {
    let list = await this.db
      .findAsync({
        collection: collections.BLOB,
        bucketId,
        fileId,
      })
      .sort({ finishedAt: -1 });

    let doc = list.length ? list[0] : null;

    return doc;
  }

  createReadableStreamFromBlobId(blobId: string) {
    return this.blobStorage.createReadableStream(blobId);
  }

  async removeAllOtherBlobs(bucketId: string, fileId: string, blobId: string) {
    let list = await this.db.findAsync({
      collection: collections.BLOB,
      bucketId,
      fileId,
      _id: { $ne: blobId },
    });

    for (let blob of list) {
      try {
        await this.blobStorage.removeByBlobId(blob._id);
      } catch (ex) {
        if (
          ex &&
          typeof ex === "object" &&
          "code" in ex &&
          (<Generic>ex).code === "ENOENT"
        ) {
          // the file not being there is not a catastrophe in this case
          ("pass");
        } else {
          throw ex;
        }
      }
    }

    return await this.db.removeAsync(
      {
        collection: collections.BLOB,
        bucketId,
        fileId,
        _id: { $ne: blobId },
      },
      { multi: false }
    );
  }
}
