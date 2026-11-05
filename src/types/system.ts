export type SystemState =
  | "loading"
  | "error"
  | "success"
  | "empty";

export interface SystemMessage {
  state: SystemState;
  message: string;
}