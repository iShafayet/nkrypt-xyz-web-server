class Logger {
  private switches = {
    debug: true,
    log: true,
    important: true,
    warning: true,
    error: true,
  };

  constructor({
    switches: {
      debug = false,
      log = true,
      warning = true,
      error = true,
      important = true,
    },
  }: any = {}) {
    this.switches = {
      debug,
      log,
      important,
      warning,
      error,
    };
  }

  init() {
    this.log("Logger initated");
  }

  debug(...args: any) {
    if (!this.switches.log) return;
    console.log.apply(console, ["DEBUG\t", ...args]);
  }

  log(...args: any) {
    if (!this.switches.log) return;
    console.log.apply(console, ["LOG\t", ...args]);
  }

  important(...args: any) {
    if (!this.switches.important) return;
    console.log.apply(console, ["IMPORTANT\t", ...args]);
  }

  warn(errorObject: Error, optionalContext = null) {
    console.warn(errorObject);

    let errorString = JSON.stringify(
      errorObject,
      Object.getOwnPropertyNames(errorObject)
    );
    console.log.apply(console, ["IMPORTANT\t", errorString, optionalContext]);
  }

  error(errorObject: Error, optionalContext = null) {
    console.error(errorObject);

    // let errorString = JSON.stringify(
    //   errorObject,
    //   Object.getOwnPropertyNames(errorObject)
    // );
    // console.log.apply(console, ["IMPORTANT\t", errorString, optionalContext]);
  }
}

export { Logger };
