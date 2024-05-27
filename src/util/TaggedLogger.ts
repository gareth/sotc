export class TaggedLogger {
  tag: string;

  constructor(tag: string) {
    this.tag = `[${tag}]`;
  }

  log(...args: any[]) {
    console.log(this.tag, ...args);
  }

  debug(...args: any[]) {
    console.debug(this.tag, ...args);
  }

  error(...args: any[]) {
    console.error(this.tag, ...args);
  }

  info(...args: any[]) {
    console.info(this.tag, ...args);
  }

  warn(...args: any[]) {
    console.warn(this.tag, ...args);
  }

  table(...args: any[]) {
    console.table(this.tag, ...args);
  }
}
