import { Action, ClientNotificationCallbackArgs } from "./contracts";

type ClientNotificationCallbackFunction<
  TState extends Object,
  TAction extends Action
> = {
  (args: ClientNotificationCallbackArgs<TState, TAction>): void;
};

export type CallbacksDictionary<
  TState extends Object,
  TAction extends Action
> = Partial<
  Record<string, ClientNotificationCallbackFunction<TState, TAction>>
>;
