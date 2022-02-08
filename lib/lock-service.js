
import * as crypto from 'crypto';
import { CodedError } from './coded-error.js';
import { generateKey } from './utils.js';



export class LockService {

  async init() {
    this.keyPrefix = generateKey('LOCK', 4, 12);
    this.keySeed = 0;
    this.lockMap = {};
  }

  acquireLock(key, purpose) {
    return new Promise((accept) => {
      if (!(key in this.lockMap)) {
        this.lockMap[key] = {
          lockList: []
        }
      }

      this.keySeed += 1;
      let lockKey = this.keyPrefix + generateKey(this.keySeed, 8, 12);

      this.lockMap[key].lockList.push({
        callback: accept,
        lockKey,
        key,
        purpose,
        requestedTime: Date.now(),
        grantedTime: null,
        releasedTime: null
      });

      setImmediate(() => {
        this._processNext(key);
      });

    });
  }

  _processNext(key) {
    if (this.lockMap[key].lockList.length === 0) return;

    let top = this.lockMap[key].lockList[0];
    if (top.grantedTime === null) {
      top.grantedTime = Date.now();
      top.callback(top.lockKey);
    } else if (top.releasedTime === null) {
      // Lock has been granted.
      // TODO deny callback in the future.
    }
  }

  releaseLock(key, lockKey) {
    if (!(key in this.lockMap)) {
      throw new CodedError("LOCKLESS_KEY", "The lock does not exist");
    }

    let index = this.lockMap[key].lockList.findIndex(l => l.lockKey === lockKey);
    if (index === -1) {
      throw new CodedError("LOCKLESS_KEY", "The lock does not exist");
    }

    this.lockMap[key].lockList.splice(index, 1);
    this._processNext(key);
  }


}