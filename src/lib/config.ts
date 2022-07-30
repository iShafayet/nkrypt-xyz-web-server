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

export { Config };
