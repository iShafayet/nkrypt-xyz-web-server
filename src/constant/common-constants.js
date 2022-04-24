const constants = {
  api: {
    CORE_API_DIR: "./api",
  },
  webServer: {
    INTENTIONAL_REQUEST_DELAY_MS: 1,
  },
  database: {
    CORE_FILE_NAME: "core.db",
    BACKUP_POSTFIX: "_BAK_",
  },
  crypto: {
    SALT_BYTE_LEN: 128,
    ITERATION_COUNT: 10302,
    PASSWORD_DIGEST_KEYLEN: 512,
    DIGEST_ALGO: "sha256",
  },
  std: {
    SAFETY_CAP: 99,
  },
  iam: {
    API_KEY_LENGTH: 128,
    SESSION_VALIDITY_DURATION_MS: 7 * 24 * 60 * 60 * 1000,
  },
};

export default constants;
