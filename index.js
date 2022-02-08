
// TODO Add config loader
const config = {
  port: process.env.PORT || 9003,
  dataDir: './data',
  ssl: false
};

import * as httplib from 'http';
import * as httpslib from 'https';

import { parseRequestBody, sendJsonResponse, sendCaughtError, writeLog } from './lib/api-base.js';
import { CodedError } from './lib/coded-error.js';
import { AuthService } from './lib/auth-service.js';
import { FileStorage } from './lib/file-storage.js';
import { LockService } from './lib/lock-service.js';
import { splitStringIntoChunks, bufferToString } from './lib/utils.js';

let lockService = new LockService();
await lockService.init();

// let key = "AAAA";
// let lock = await lockService.acquireLock(key, "read");
// console.log(key + " " + lock);

// setTimeout(()=>{
// lockService.releaseLock(key, lock)
// }, 3000);

// let lock2 = await lockService.acquireLock(key, "read");
// console.log(key + " " + lock2);

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
    const exampleHostName = 'https://nkyrpt.xyz/';
    let url = new URL(req.url, exampleHostName);
    writeLog(`POST ${url.pathname}`);

    // API /api/user-login
    if (url.pathname === '/api/user-login') {
      let body = await parseRequestBody(req);
      let { username, password } = await JSON.parse(body);
      // TODO: validate
      let userData = await authService.login({ username, password });
      return sendJsonResponse(res, userData);
    }

    // API /api/user-logout
    else if (url.pathname === '/api/user-logout') {
      let body = await parseRequestBody(req);
      let { apiKey } = await JSON.parse(body);
      let { userKey } = await authService.authenticate({ apiKey });
      // TODO: validate
      let userData = await authService.logout({ apiKey });
      return sendJsonResponse(res, {});
    }

    // TODO new api: add-user
    // TODO new api: update-user

    // API /api/list-child-nodes
    else if (url.pathname === '/api/list-child-nodes') {
      let body = await parseRequestBody(req);
      let { apiKey, nodeKey } = await JSON.parse(body);
      // TODO: validate length and charset
      let { userKey } = await authService.authenticate({ apiKey });
      let nodeList = fileStorage.listChildNodes(nodeKey);
      return sendJsonResponse(res, { nodeList })
    }

    // request-write-lock
    // write
    // read (automatically creates read locks)

    // multiple readlocks are allowed
    // multiple writelocks are not allowed



    // // API /api/get-node
    // else if (url.pathname === '/api/get-node') {
    //   let body = await parseRequestBody(req);
    //   let [apiKey, nodeKey] = splitStringIntoChunks(body, 32, 32);
    //   // TODO: validate length and charset
    //   let { userKey } = await authService.authenticate({ apiKey });
    //   let readStream = fileStorage.getReadStream(userKey, nodeKey);
    //   readStream.pipe(res);
    // }

    // // API /api/set-node
    // else if (url.pathname === '/api/set-node') {
    //   let apiKey, nodeKey;
    //   req.on('error', (error) => {
    //     console.error(error);
    //     sendCaughtError(res, error);
    //   })
    //   req.once('readable', async () => {
    //     let head = bufferToString(req.read(64));
    //     let [apiKey, nodeKey] = splitStringIntoChunks(head, 32, 32);
    //     // TODO: validate length and charset
    //     let { userKey } = await authService.authenticate({ apiKey });

    //     // If nodeKey is the nullNodeKey, it indicates a new unique
    //     // nodeName is to be created
    //     let writeStream;
    //     if (nodeKey === reservedNodeKeys.nullNodeKey) {
    //       [nodeKey, writeStream] = fileStorage.createUniqueWriteStream(userKey);
    //     } else {
    //       writeStream = fileStorage.getWriteStream(userKey, nodeKey);
    //     }

    //     req.pipe(writeStream);
    //     req.on('end', () => {
    //       return sendJsonResponse(res, { nodeKey });
    //     });
    //   });
    // }

    // // API /api/remove-nodes
    // else if (url.pathname === '/api/remove-nodes') {
    //   let body = await parseRequestBody(req);
    //   let { apiKey, nodeKeyList } = await JSON.parse(body);
    //   // TODO: validate length and charset
    //   let { userKey } = await authService.authenticate({ apiKey });
    //   for (let nodeKey of nodeKeyList) {
    //     await fileStorage.removeNode(userKey, nodeKey);
    //   }
    //   return sendJsonResponse(res, {});
    // }

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
