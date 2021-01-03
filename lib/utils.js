
// const charsetBase64Standard = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/';
const charsetBase38UrlSafe = '0123456789abcdefghijklmnopqrstuvwxyz-_';

export const generateKey = (prefix, prefixLength, totalLength) => {
  let key = String(prefix).padStart(prefixLength, '0');
  for (var i = (totalLength - prefixLength); i > 0; --i) {
    key += charsetBase38UrlSafe[Math.floor(Math.random() * charsetBase38UrlSafe.length)];
  }
  return key;
}

export const splitStringIntoChunks = (sourceString, ...chunkSizeList) => {
  let extractedLength = 0;
  let extractedList = [];
  for (let chunkSize of chunkSizeList) {
    let chunk = sourceString.slice(extractedLength, extractedLength + chunkSize);
    extractedList.push(chunk);
    extractedLength += chunkSize;
  }
  extractedList.push(sourceString.slice(extractedLength));
  return extractedList;
}

export const bufferToString = (buffer) => {
  return String.fromCharCode.apply(null, new Uint8Array(buffer))
}