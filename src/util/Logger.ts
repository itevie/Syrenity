export default class Logger {
  private name: string = "info";

  constructor(name: string) {
    this.name = name;

    this.log(`Logger ${name} initiated`);
  }

  private generateDefaultText(contents: string): string {
    return `[${this.name}]: ` + `${contents}`;
  }

  public log(contents: string): void {
    console.log(this.generateDefaultText(contents));
  }

  public error(contents: string): void {
    console.log(this.generateDefaultText(contents));
  }

  public success(contents: string): void {
    console.log(this.generateDefaultText(contents));
  }
}
