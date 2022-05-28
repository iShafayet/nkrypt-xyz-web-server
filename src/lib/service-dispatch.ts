import { AdminService } from "../service/admin-service.js";
import { SessionService } from "../service/session-service.js";
import { UserService } from "../service/user-service.js";
import { DatabaseEngine } from "./database-engine.js";

export const prepareServiceDispatch = async (db: DatabaseEngine) => {
  global.dispatch = {
    userService: new UserService(db),
    sessionService: new SessionService(db),
    adminService: new AdminService(db),
  };
};
