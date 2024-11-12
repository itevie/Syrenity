export type WebsocketType = "Hello" | "Identify" | "Authenticate" | "Error";

export interface BaseWSMessage {
  type: WebsocketType;
  payload: object;
}

export interface IdentifyWSMessage {
  token?: string;
}

export interface HelloWSMessage {
  user: User;
}
