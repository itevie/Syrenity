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
    for (const content of contents)
      console.log(this.generateDefaultText(content));
  }

  public error(contents: string): void {
    console.log(this.generateDefaultText(contents));
  }

  public success(contents: string): void {
    console.log(this.generateDefaultText(contents));
  }
}
