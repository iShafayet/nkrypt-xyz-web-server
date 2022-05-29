import { existsSync, rmSync } from "fs";

export function wipeOutLocalData() {
  // DANGER
  const testDatabaseDir = "./nkrypt-xyz-local-data/db/";
  if (existsSync(testDatabaseDir)) {
    rmSync(testDatabaseDir, { recursive: true, force: true });
  }
  // DANGER
}
