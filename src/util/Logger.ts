export let loggerWhitelist: string[] | null = null;

export function addToLoggerWhitelist(name: string) {
  if (loggerWhitelist === null) loggerWhitelist = [];
  loggerWhitelist.push(name);
}

export default class Logger {
  private name: string = "info";

  constructor(name: string) {
    this.name = name;

    this.log(`Logger ${name} initiated`);
  }

  private generateDefaultText(contents: string): string {
    return `[${this.name}]: ` + `${contents}`;
  }

  public log(...contents: any[]): void {
    if (loggerWhitelist !== null && !loggerWhitelist.includes(this.name))
      return;

    for (const content of contents)
      console.log(this.generateDefaultText(content));
  }

  public error(contents: string): void {
    if (loggerWhitelist !== null && !loggerWhitelist.includes(this.name))
      return;
    console.log(`\x1b[31m${this.generateDefaultText(contents)}\x1b[0m`);
  }

  public success(contents: string): void {
    if (loggerWhitelist !== null && !loggerWhitelist.includes(this.name))
      return;
    console.log(`\x1b[32m${this.generateDefaultText(contents)}\x1b[0m`);
  }

  public warn(contents: string): void {
    if (loggerWhitelist !== null && !loggerWhitelist.includes(this.name))
      return;
    console.log(`\x1b[33m${this.generateDefaultText(contents)}\x1b[0m`);
  }
}
