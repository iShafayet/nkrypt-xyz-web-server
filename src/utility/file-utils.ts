import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath, pathToFileURL } from "url";

// NOTE: The relative pathing will have to be adjusted if this file is moved elsewhere.
const appRootDirPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../dist/"
);

const ensureDir = (dirpath: string) => {
  fs.mkdirSync(dirpath, { recursive: true });
};

const resolvePath = (...paths: string[]) => {
  return join(...paths);
};

const toFileUrl = (path: string) => {
  return pathToFileURL(path).toString();
};

export { ensureDir, resolvePath, appRootDirPath, toFileUrl };
