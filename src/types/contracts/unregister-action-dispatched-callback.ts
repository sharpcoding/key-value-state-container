import { Action } from "./action";

export interface UnregisterActionDispatchedCallback {
  <TAction extends Action>(args: {
    action: Pick<TAction, "name">;
    containerId: string;
    listenerId: string;
  }): void;
}
