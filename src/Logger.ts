import clc from 'cli-color';

let longestNameLength = 0;

enum LogLevel {
  standard,
  debug,
  verbose,
}

export let options = {
  disableLogging: false,
};

/**
 * Used for logging for the server
 */
export default class Logger {
  private type = 'info';
  private logLevel: LogLevel;

  constructor(type: string, logLevel: LogLevel = LogLevel.standard) {
    this.type = type.toUpperCase();
    this.logLevel = logLevel;

    // Update longest name for style
    if (type.length > longestNameLength)
      longestNameLength = type.length;
  }

  private generateDefaultText(content: string) {
    let text = content;

    return (
      "[" +
      this.addPadding(`${new Date().toLocaleTimeString()}:${this.type}`)
      + "] "
      + text
    );
  }

  private addPadding(content: string) {
    return `${content}${" ".repeat(longestNameLength - this.type.length)}`;
  }

  /**
   * Log something to the console
   * @param content The content to log
   */
  public log(content: string) {
    if (options.disableLogging) return;
    const text = this.generateDefaultText(content);
    console.log(text);
  }

  public success(content: string) {
    if (options.disableLogging) return;
    const text = this.generateDefaultText(content);
    console.log(clc.green(text));
  }

  /**
   * Log an error to the console
   * @param content The content to log
   */
  public error(content: string) {
    const text = this.generateDefaultText(content);
    console.log(clc.red(text));
  }

  public warn(content: string) {
    const text = this.generateDefaultText(content);
    console.log(clc.yellow(text));
  }
}