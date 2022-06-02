import { createWriteStream } from "fs";
import { ensureDir, resolvePath } from "../utility/file-utils.js";
import { Config } from "./config-loader.js";

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
}

export { BlobStorage };
