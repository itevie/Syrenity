export default class ModelBase {
  toJSON() {
    return JSON.stringify((this as any).data);
  }
}
