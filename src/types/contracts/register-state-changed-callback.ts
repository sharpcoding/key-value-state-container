import { Action } from "./action";
import { TKnownStatePath } from "./known-state-path";
import { ClientNotificationCallbackArgs } from "./client-notification-callback-args";

export interface RegisterStateChangedCallbackArgs<
  TState extends Object,
  TAction extends Action
> {
  callback: (args: ClientNotificationCallbackArgs<TState, TAction>) => void;
  containerId: string;
  lateInvoke?: boolean;
  listenerId: string;
  statePath: TKnownStatePath<TState>;
}

export interface RegisterStateChangedCallback {
  <TState extends Object, TAction extends Action>(
    args: RegisterStateChangedCallbackArgs<TState, TAction>
  ): void;
}
