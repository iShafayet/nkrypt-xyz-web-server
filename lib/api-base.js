
export const writeLog = (...data) => {
  console.log(`(nkypt.xyz)>`, ...data);
}

export const parseRequestBody = (req) => {
  return new Promise((accept, reject) => {
    let data = [];
    req.on('data', (chunk) => {
      data.push(chunk);
    });
    req.on('end', () => {
      data = data.join('');
      accept(data);
    });
    req.on('error', (error) => {
      error.code = "INVALID_PAYLOAD";
      reject(error);
    });
  });
}

export const sendJsonResponse = (res, object) => {
  // send header only if not already sent
  if (!res.headersSent) {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
  }

  // serialize and send error only if res not already finished.
  if (!res.writableFinished) {
    object.hasError = false;
    res.end(JSON.stringify(object));
  }
}

export const sendCaughtError = (res, error) => {
  // send header only if not already sent
  if (!res.headersSent) {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
  }

  // serialize and send error only if res not already finished.
  if (!res.writableFinished) {
    let { code, message } = error;
    if (!code) {
      code = "GENERIC_SERVER_ERROR";
      message = "Your request cannot be served at this time. Please try again.";
    }
    res.end(JSON.stringify({
      hasError: true,
      error: {
        code, message
      }
    }));
  }
}

