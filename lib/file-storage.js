
import * as fslib from 'fs';
import * as pathlib from 'path';
import { generateKey } from './utils.js';
import { CodedError } from './coded-error.js';

export class FileStorage {

  async init({ dataDir }) {
    this.contentDir = pathlib.join(dataDir, './content');

    fslib.mkdirSync(this.contentDir, { recursive: true });
  }

  getReadStream(userKey, nodeKey) {
    fslib.mkdirSync(pathlib.join(this.contentDir, userKey), { recursive: true });

    let path = pathlib.join(this.contentDir, userKey, nodeKey);
    try {
      fslib.statSync(path);
      return fslib.createReadStream(path, { encoding: 'utf-8' });
    } catch (ex) {
      if (ex.code === "ENOENT") {
        throw new CodedError("NODE_INVALID", `The node ${userKey}/${nodeKey} does not exist`);
      } else {
        throw ex;
      }
    }
  }

  createUniqueWriteStream(userKey) {
    fslib.mkdirSync(pathlib.join(this.contentDir, userKey), { recursive: true });

    let nodeKey;
    do {
      nodeKey = generateKey('', 0, 32);
      let path = pathlib.join(this.contentDir, userKey, nodeKey);
      var isUnique = !fslib.existsSync(path);
    } while (!isUnique);
    return [nodeKey, this.getWriteStream(userKey, nodeKey)];
  }

  getWriteStream(userKey, nodeKey) {
    fslib.mkdirSync(pathlib.join(this.contentDir, userKey), { recursive: true });

    let path = pathlib.join(this.contentDir, userKey, nodeKey);
    return fslib.createWriteStream(path, { encoding: 'utf-8' })
  }

  removeNode(userKey, nodeKey) {
    fslib.mkdirSync(pathlib.join(this.contentDir, userKey), { recursive: true });

    let path = pathlib.join(this.contentDir, userKey, nodeKey);
    fslib.unlinkSync(path);
  }

}