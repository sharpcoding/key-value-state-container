import { Action } from "./action";
import { ClientNotificationCallbackArgs } from "./client-notification-callback-args";

export interface RegisterActionDispatchedCallbackArgs<
  TState extends Object,
  TAction extends Action
> {
  action: Pick<TAction, "name">;
  callback: (args: ClientNotificationCallbackArgs<TState, TAction>) => void;
  /**
   * The id of the container to/in which the action should be dispatched.
   * If the container is not registered, the function will throw an error.
   */
  containerId: string;
  listenerId: string;
}

export interface RegisterActionDispatchedCallbackFunction {
  <TState extends Object, TAction extends Action>(
    args: RegisterActionDispatchedCallbackArgs<TState, TAction>
  ): void;
}
