type Config = {
  webServer: {
    port: number;
    contextPath: string;
  };
  database: {
    dir: string;
  };
  lockProvider: {
    dir: string;
  };
  blobStorage: {
    dir: string;
    maxFileSizeBytes: number;
  };
};

class ConfigLoader {
  static loadConfig() {
    let config: Config = {
      webServer: {
        port: 9041,
        contextPath: "/",
      },
      database: {
        dir: "./nkrypt-xyz-local-data/db/",
      },
      lockProvider: {
        dir: "./nkrypt-xyz-local-data/lock/",
      },
      blobStorage: {
        dir: "./nkrypt-xyz-local-data/blob/",
        maxFileSizeBytes: 1024 * 1024 * 1024,
      },
    };

    return config;
  }
}

export { ConfigLoader, Config };
