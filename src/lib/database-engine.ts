import Nedb from "@seald-io/nedb";
import collections from "../constant/collections.js";
import constants from "../constant/common-constants.js";
import { ensureDir, resolvePath } from "../utility/file-utils.js";
import { calculateHashOfString } from "../utility/security-utils.js";
import { Config } from "./config-loader.js";

class DatabaseEngine {
  config: Config;
  private _dir: string;
  private _dbFilePath: string;
  connection: Nedb;

  constructor(config: Config) {
    this.config = config;
    this._dir = resolvePath(config.database.dir);
    this._dbFilePath = resolvePath(
      config.database.dir,
      constants.database.CORE_FILE_NAME
    );

    // @ts-ignore
    this.connection = null;
  }

  async init() {
    ensureDir(this._dir);
    await this.backup();

    this.connection = new Nedb({ filename: this._dbFilePath });

    await this.connection.loadDatabaseAsync();

    await this.setupInitialValues();
  }

  async setupInitialValues() {
    await this.connection.compactDatafileAsync();
    await this.connection.updateAsync(
      { collection: collections.SYSTEM },
      { $inc: { timesApplicationRan: 1 } },
      { upsert: true }
    );

    let defaultAdmin = await this.connection.findOneAsync({
      collection: collections.USER,
      userName: constants.iam.DEFAULT_ADMIN_USER_NAME,
    });

    if (!defaultAdmin) {
      await this.connection.insertAsync({
        collection: collections.USER,
        userName: constants.iam.DEFAULT_ADMIN_USER_NAME,
        password: calculateHashOfString(
          constants.iam.DEFAULT_ADMIN_USER_PASSWORD
        ),
        globalPermissions: {
          MANAGE_ALL_USER: true,
          CREATE_USER: true,
        },
        createdAt: Date.now(),
      });
    }
  }

  async backup() {
    // TODO backup
  }
}

export { DatabaseEngine };
