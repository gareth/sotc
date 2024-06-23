export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
}

export class TaggedLogger {
  tag: string;
  level: LogLevel;

  constructor(tag: string, level?: LogLevel) {
    this.level = level || LogLevel.DEBUG;
    this.tag = `[${tag}]`;
  }

  log(...args: any[]) {
    console.log(this.tag, ...args);
  }

  noop() {}

  get debug() {
    return this.level <= LogLevel.DEBUG
      ? console.debug.bind(console.debug, this.tag)
      : this.noop;
  }

  get info() {
    return this.level <= LogLevel.INFO
      ? console.info.bind(console.info, this.tag)
      : this.noop;
  }

  get warn() {
    return this.level <= LogLevel.WARN
      ? console.warn.bind(console.warn, this.tag)
      : this.noop;
  }

  get error() {
    return this.level <= LogLevel.ERROR
      ? console.error.bind(console.debug, this.tag)
      : this.noop;
  }

  get table() {
    return console.table.bind(console.table, this.tag);
  }
}
