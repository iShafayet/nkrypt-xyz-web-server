let charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const generateRandomString = (length: number) => {
  let result = "";
  for (var i = length; i > 0; --i) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }
  return result;
};

let charset2 = "0123456789abcdefghijklmnopqrstuvwxyz";

const generateRandomStringCaseInsensitive = (length: number) => {
  let result = "";
  for (var i = length; i > 0; --i) {
    result += charset2[Math.floor(Math.random() * charset2.length)];
  }
  return result;
};

export { generateRandomString, generateRandomStringCaseInsensitive };
