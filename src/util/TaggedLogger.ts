export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
}

// A subset of the Console methods that we want to expose using the #log
// wrapper. For type compatibility, we can only pick methods of the form (x:
// any[]) => void i.e. must allow zero arguments to be passed.
type Loggables = Pick<Console, "log" | "debug" | "info" | "warn" | "error">;

export class TaggedLogger {
  tag: string;
  level: LogLevel;

  constructor(tag: string, level?: LogLevel) {
    this.level = level ?? LogLevel.DEBUG;
    this.tag = `[${tag}]`;
  }

  #log(level: LogLevel, methodName: keyof Loggables) {
    const method = console[methodName];
    return this.level <= level ? method.bind(method, this.tag) : this.#noop;
  }

  // A method that allows us to return a type-safe logger method (takes any
  // arguments, returns void) when logging is disabled
  #noop = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function

  get log() {
    return console.log.bind(console.log, this.tag);
  }

  get debug() {
    return this.#log(LogLevel.DEBUG, "debug");
  }

  get info() {
    return this.#log(LogLevel.INFO, "info");
  }

  get warn() {
    return this.#log(LogLevel.WARN, "warn");
  }

  get error() {
    return this.#log(LogLevel.ERROR, "error");
  }

  get table() {
    return console.table.bind(console.table, this.tag);
  }
}
