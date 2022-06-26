import stream, { Transform } from "stream";

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

export const createDelayerTransformStream = (duration: number) => {
  return new Transform({
    transform(chunk, encoding, callback) {
      setTimeout(() => {
        callback(null, chunk);
      }, duration);
    },
  });
};
