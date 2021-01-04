
import * as fslib from 'fs';
import * as pathlib from 'path';
import * as crypto from 'crypto';
import { generateKey } from './utils.js';
import { CodedError } from './coded-error.js';

const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'excitingAdventure';

export class AuthService {

  async init({ dataDir }) {
    this.userDir = pathlib.join(dataDir, './user-data');
    this.userDataFile = pathlib.join(this.userDir, './users.json');
    this.sessionDataFile = pathlib.join(this.userDir, './sessions.json');

    fslib.mkdirSync(this.userDir, { recursive: true });

    // users
    if (!fslib.existsSync(this.userDataFile)) {
      let users = [
        {
          userKey: DEFAULT_USERNAME.padEnd(16, generateKey("", '', 16)),
          username: DEFAULT_USERNAME,
          passwordHash: this._hash(DEFAULT_PASSWORD),
          isAdmin: true
        }
      ];
      fslib.writeFileSync(this.userDataFile, JSON.stringify(users, null, 2));
    }
    this.users = JSON.parse(fslib.readFileSync(this.userDataFile, 'utf-8'));

    // sessions
    if (!fslib.existsSync(this.sessionDataFile)) {
      let sessions = {
        seed: 0,
        sessionList: []
      };
      fslib.writeFileSync(this.sessionDataFile, JSON.stringify(sessions, null, 2));
    }
    this.sessions = JSON.parse(fslib.readFileSync(this.sessionDataFile, 'utf-8'));
  }

  _hash(password) {
    return crypto.createHash('sha256').update(password).digest('base64');
  }

  _commit() {
    fslib.writeFileSync(this.userDataFile, JSON.stringify(this.users, null, 2));
    fslib.writeFileSync(this.sessionDataFile, JSON.stringify(this.sessions, null, 2));
  }

  async login({ username, password }) {
    let passwordHash = this._hash(password);
    let user = this.users.find((user) => (username === user.username && passwordHash === user.passwordHash));
    if (!user) {
      throw new CodedError("CREDENTIALS_INVALID", "Invalid credentials.");
    }

    let sessionId = this.sessions.seed;
    this.sessions.seed += 1;
    let apiKey = generateKey(sessionId, 8, 32);

    this.sessions.sessionList.push({
      sessionId,
      apiKey,
      userKey: user.userKey,
      username: user.username,
      createdDatetimeStamp: Date.now(),
      terminatedDatetimeStamp: 0
    });
    this._commit();

    return { apiKey, isAdmin: user.isAdmin };
  }

  async authenticate({ apiKey }) {
    let session = this.sessions.sessionList.find(session => session.apiKey === apiKey);
    if (!session) {
      throw new CodedError("APIKEY_INVALID", "Invalid API key provided");
    }
    if (session.terminatedDatetimeStamp > 0) {
      throw new CodedError("APIKEY_TERMINATED", "This API key has already been terminated");
    }
    // TODO:  expiration calculation
    return session;
  }

  async logout({ apiKey }) {
    let session = this.sessions.sessionList.find(session => session.apiKey === apiKey);
    session.terminatedDatetimeStamp = Date.now();
    this._commit();
  }

}