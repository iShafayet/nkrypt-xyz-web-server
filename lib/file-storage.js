
import * as fslib from 'fs';
import * as pathlib from 'path';
import { generateKey } from './utils.js';
import { CodedError } from './coded-error.js';
import { FileIndex } from './file-index.js';

export class FileStorage {

  async init({ dataDir }) {
    this.contentDir = pathlib.join(dataDir, './file-data');
    fslib.mkdirSync(this.contentDir, { recursive: true });

    this.fileIndex = new FileIndex();
    await this.fileIndex.init({ dataDir });
  }

  async _listIndexDataOfChildNodes(userKey, parentNodeKey) {
    let list = this.fileIndex.listIndexesOfUser(userKey);
    let indexDataList = list.filter(node => node.parentNodeKey === parentNodeKey);
    indexDataList = JSON.parse(JSON.stringify(indexDataList));
    return indexDataList;
  }

  _ensureUserDirExists(userKey) {
    fslib.mkdirSync(pathlib.join(this.contentDir, userKey), { recursive: true });
  }

  _makeMetaFilePath(userKey, nodeKey) {
    const extension = '-meta.json.aes';
    let path = pathlib.join(this.contentDir, userKey, (nodeKey + extension));
    return path;
  }

  _makeDataFilePath(userKey, nodeKey) {
    const extension = '-data.blob.aes';
    let path = pathlib.join(this.contentDir, userKey, (nodeKey + extension));
    return path;
  }

  _readMetaFile(userKey, nodeKey) {
    let metaFilePath = this._makeMetaFilePath(userKey, nodeKey);
    try {
      return fslib.readFileSync(metaFilePath, 'utf-8')
    } catch (ex) {
      if (ex.code === "ENOENT") {
        throw new CodedError("NODE_INVALID", `The node ${userKey}/${nodeKey} does not exist`);
      } else {
        throw ex;
      }
    }
  }

  async listChildNodes(userKey, parentNodeKey) {
    let indexDataList = this._listIndexDataOfChildNodes(userKey, parentNodeKey);
    for (let indexData of indexDataList) {
      let encryptedMetaData = this._readMetaFile(userKey, indexData.nodeKey);
      indexData.encryptedMetaData = encryptedMetaData;
    }
    return indexDataList;
  }

  // getReadStream(userKey, nodeKey) {
  //   fslib.mkdirSync(pathlib.join(this.contentDir, userKey), { recursive: true });

  //   let path = pathlib.join(this.contentDir, userKey, nodeKey);
  //   try {
  //     fslib.statSync(path);
  //     return fslib.createReadStream(path, { encoding: 'utf-8' });
  //   } catch (ex) {
  //     if (ex.code === "ENOENT") {
  //       throw new CodedError("NODE_INVALID", `The node ${userKey}/${nodeKey} does not exist`);
  //     } else {
  //       throw ex;
  //     }
  //   }
  // }

  // createUniqueWriteStream(userKey) {
  //   fslib.mkdirSync(pathlib.join(this.contentDir, userKey), { recursive: true });

  //   let nodeKey;
  //   do {
  //     nodeKey = generateKey('', 0, 32);
  //     let path = pathlib.join(this.contentDir, userKey, nodeKey);
  //     var isUnique = !fslib.existsSync(path);
  //   } while (!isUnique);
  //   return [nodeKey, this.getWriteStream(userKey, nodeKey)];
  // }

  // getWriteStream(userKey, nodeKey) {
  //   fslib.mkdirSync(pathlib.join(this.contentDir, userKey), { recursive: true });

  //   let path = pathlib.join(this.contentDir, userKey, nodeKey);
  //   return fslib.createWriteStream(path, { encoding: 'utf-8' })
  // }

  // removeNode(userKey, nodeKey) {
  //   fslib.mkdirSync(pathlib.join(this.contentDir, userKey), { recursive: true });

  //   let path = pathlib.join(this.contentDir, userKey, nodeKey);
  //   fslib.unlinkSync(path);
  // }

  // writeMetaFile(userKey, nodeKey, encryptedMetaData) {

  // }

  // readMetaFile(userKey, nodeKey) {

  // }

}