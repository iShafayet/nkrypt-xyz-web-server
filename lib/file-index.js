
import * as fslib from 'fs';
import * as pathlib from 'path';
import { generateKey } from './utils.js';
import { CodedError } from './coded-error.js';

export class FileIndex {

  async init({ dataDir }) {
    this.indexFilePath = pathlib.join(dataDir, './file-data', 'index-file.json');
    this.masterIndex = {};
  }

  async _commitIndexFile() {
    let data = JSON.stringify(this.masterIndex);
    fslib.writeFileSync(this.indexFilePath, data, "utf-8");
  }

  async _prepareIndexFile() {
    try {
      fslib.statSync(path);
    } catch (ex) {
      this._commitIndexFile();
    }
  }

  async listIndexesOfUser(userKey) {
    if (!(userKey in this.masterIndex)) {
      this.masterIndex[userKey] = [];
      this._commitIndexFile();
    }
    return this.masterIndex[userKey];
  }


}