import { Action } from "./contracts/action";
import { ActionQueueContext } from "./action-queue-context";
import { Config } from "./config";
import { StateContainerPersistence } from "./contracts/state-container-persistence";
import { AutoActions } from "./contracts/auto-actions";
import { Reducer } from "./contracts/reducer";

type StatePath = string;
type ListenerId = string;
type IndexOfListener = number;

interface ListenerCallback<TState extends Object, TAction extends Action> {
  (args: {
    action: TAction;
    changedPaths: string[];
    newState: TState;
    oldState: TState;
  }): void;
}

export type RegisteredOrUnregisteredListenerCallback<
  TState extends Object,
  TAction extends Action
> = ListenerCallback<TState, TAction> | undefined;

export interface Memory<TState extends Object, TAction extends Action> {
  /**
   * action at the 0 index is currently executing
   * action at the 1 index is should get executed next... etc
   */
  actionQueueContext: ActionQueueContext<TAction>;
  autoActions?: AutoActions<TState, TAction>;
  changedPaths: string[];
  config?: Config<TState>;
  id: string;
  listeners: Record<
    StatePath,
    RegisteredOrUnregisteredListenerCallback<TState, TAction>[]
  >;
  /**
   * Here we keep track of the paths that were changed during
   * the execution of the actions batch
   */
  lateInvokeChangedPaths: string[];
  listenerIdToIndexReference: Record<ListenerId, IndexOfListener>;
  listenerIndexToIdReference: Record<IndexOfListener, ListenerId>;
  immediateState?: TState;
  newState: TState;
  oldState: TState;
  reducer?: Reducer<TState, TAction>;
  persistence?: StateContainerPersistence<TState>;
}
