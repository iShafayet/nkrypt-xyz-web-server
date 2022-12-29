const constants = {
  api: {
    CORE_API_DIR: "./api",
    CORE_API_SUBCONTEXT_PATH: "/api",
  },
  webServer: {
    INTENTIONAL_REQUEST_DELAY_MS: 100,
    INTENTIONAL_BLOB_UPLOAD_DELAY_MS: 400,
    FALLBACK_PORT: 8080,
    BLOB_API_CRYPTO_META_HEADER_NAME: "nk-crypto-meta"
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
    DEFAULT_ADMIN_USER_NAME: "admin",
    DEFAULT_ADMIN_DISPLAY_NAME: "Administrator",
    DEFAULT_ADMIN_USER_PASSWORD: "PleaseChangeMe@YourEarliest2Day",
    SESSION_VALIDITY_DURATION_MS: 7 * 24 * 60 * 60 * 1000,
  },
};

export default constants;
