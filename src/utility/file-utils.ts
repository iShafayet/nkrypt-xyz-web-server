import { dirname, join } from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// NOTE: The relative pathing will have to be adjusted if this file is moved elsewhere.
const appRootDirPath = join(dirname(fileURLToPath(import.meta.url)), "../../");

const ensureDir = (dirpath: string) => {
  fs.mkdirSync(dirpath, { recursive: true });
};

const resolvePath = (...paths: string[]) => {
  return join(...paths);
};

export { appRootDirPath, ensureDir, resolvePath };
