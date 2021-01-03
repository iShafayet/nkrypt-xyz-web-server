
const config = {
  port: process.env.PORT || 9003,
  dataDir: './data',
  ssl: false
};

const reservedNodeKeys = {
  rootNodeKey: "root".padStart(32, 0),
  nullNodeKey: "".padStart(32, 0),
};

import * as httplib from 'http';
import * as httpslib from 'https';

import { parseRequestBody, sendJsonResponse, sendCaughtError, writeLog } from './lib/api-base.js';
import { CodedError } from './lib/coded-error.js';
import { AuthService } from './lib/auth-service.js';
import { FileStorage } from './lib/file-storage.js';
import { splitStringIntoChunks, bufferToString } from './lib/utils.js';

let fileStorage = new FileStorage();
await fileStorage.init({ dataDir: config.dataDir });

let authService = new AuthService();
await authService.init({ dataDir: config.dataDir });

let weblib = (config.ssl ? httpslib : httplib);
let server = weblib.createServer(async (req, res) => {
  try {
    // enable CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end('OK. CORS is allowed.');
      return;
    }

    // reject invalid protocols
    if (req.method !== 'POST') {
      res.writeHead(403);
      res.end("Invalid protocol.");
      return;
    }

    // parse url
    let url = new URL(req.url, 'https://nkyrpt.xyz/');

    // API /api/user-login
    if (url.pathname === '/api/user-login') {
      let body = await parseRequestBody(req);
      let { username, password } = await JSON.parse(body);
      // TODO: validate
      let userData = await authService.login({ username, password });
      return sendJsonResponse(res, userData);
    }

    // TODO new api: add-user
    // TODO new api: update-user

    // API /api/get-node
    else if (url.pathname === '/api/get-node') {
      let body = await parseRequestBody(req);
      let [apiKey, nodeKey] = splitStringIntoChunks(body, 32, 32);
      // TODO: validate length and charset
      let { userKey } = await authService.authenticate({ apiKey });
      let readStream = fileStorage.getReadStream(userKey, nodeKey);
      readStream.pipe(res);
    }

    // API /api/set-node
    else if (url.pathname === '/api/set-node') {
      let apiKey, nodeKey;
      req.on('error', (error) => {
        console.error(error);
        sendCaughtError(res, error);
      })
      req.once('readable', async () => {
        let head = bufferToString(req.read(64));
        let [apiKey, nodeKey] = splitStringIntoChunks(head, 32, 32);
        // TODO: validate length and charset
        let { userKey } = await authService.authenticate({ apiKey });

        // If nodeKey is the nullNodeKey, it indicates a new unique
        // nodeName is to be created
        let writeStream;
        if (nodeKey === reservedNodeKeys.nullNodeKey) {
          [nodeKey, writeStream] = fileStorage.createUniqueWriteStream(userKey);
        } else {
          writeStream = fileStorage.getWriteStream(userKey, nodeKey);
        }

        req.pipe(writeStream);
        req.on('end', () => {
          return sendJsonResponse(res, { nodeKey });
        });
      });
    }

    else {
      res.writeHead(404);
      res.end("Invalid API.");
      return;
    }

  } catch (error) {
    console.error(error);
    sendCaughtError(res, error);
  }
});

server.listen(config.port, () => {
  writeLog(`Listening on port ${config.port}`);
});
