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

  debug(...args: any[]) {
    this.level <= LogLevel.DEBUG && console.debug(this.tag, ...args);
  }

  info(...args: any[]) {
    this.level <= LogLevel.INFO && console.info(this.tag, ...args);
  }

  warn(...args: any[]) {
    this.level <= LogLevel.WARN && console.warn(this.tag, ...args);
  }

  error(...args: any[]) {
    this.level <= LogLevel.ERROR && console.error(this.tag, ...args);
  }

  table(...args: any[]) {
    console.table(this.tag, ...args);
  }
}
