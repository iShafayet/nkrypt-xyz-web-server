import stream from "stream";

export const createSizeLimiterPassthroughStream = (sizeLimit: number) => {
  let count = 0;
  const sizeLimiter = new stream.Transform({
    transform: function transformer(chunk, encoding, callback) {
      count += chunk.length;

      if (count > sizeLimit) {
        callback(new Error("Sigh"));
        return;
      }

      callback(null, chunk);
    },
  });
  return sizeLimiter;
};
