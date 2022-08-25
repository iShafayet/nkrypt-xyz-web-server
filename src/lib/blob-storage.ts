import { createReadStream, createWriteStream, promises } from "fs";
import { ensureDir, resolvePath } from "../utility/file-utils.js";
import { Config } from "./config.js";
import { stat } from "fs/promises";

class BlobStorage {
  config: Config;
  private _dir: string;

  constructor(config: Config) {
    this.config = config;
    this._dir = resolvePath(config.blobStorage.dir);
  }

  async init() {
    ensureDir(this._dir);
  }

  createWritableStream(blobId: string) {
    let path = resolvePath(this._dir, blobId);
    let stream = createWriteStream(path);
    return stream;
  }

  async queryBlobSize(blobId: string) {
    let path = resolvePath(this._dir, blobId);
    let stats = (await stat(path))
    return stats.size;
  }

  createReadableStream(blobId: string) {
    let path = resolvePath(this._dir, blobId);
    let stream = createReadStream(path);
    return stream;
  }

  async removeByBlobId(blobId: string) {
    let path = resolvePath(this._dir, blobId);
    await promises.unlink(path);
  }
}

export { BlobStorage };
