// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    "prefer-const": "off",
    "no-prototype-builtins": "off",
  },
  globals: {
    dispatch: true,
    logger: true,
  },
  env: {
    node: true,
  },
  ignorePatterns: ["dist/"],
};
