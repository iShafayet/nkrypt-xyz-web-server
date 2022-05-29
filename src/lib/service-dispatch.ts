import { AdminService } from "../service/admin-service.js";
import { BucketService } from "../service/bucket-service.js";
import { DirectoryService } from "../service/directory-service.js";
import { FileService } from "../service/file-service.js";
import { SessionService } from "../service/session-service.js";
import { UserService } from "../service/user-service.js";
import { DatabaseEngine } from "./database-engine.js";

export const prepareServiceDispatch = async (db: DatabaseEngine) => {
  global.dispatch = {
    bucketService: new BucketService(db),
    directoryService: new DirectoryService(db),
    fileService: new FileService(db),
    userService: new UserService(db),
    sessionService: new SessionService(db),
    adminService: new AdminService(db),

  };
};
