import _ from "lodash";

import { Action, ClientNotificationCallbackArgs } from "./types/contracts";
import {
  Memory,
  RegisteredOrUnregisteredListenerCallback,
} from "./types/memory";

interface Args<TState extends Object, TAction extends Action> {
  callback: (args: ClientNotificationCallbackArgs<TState, TAction>) => void;
  internalListenerId: string;
  container: Memory<TState, Action>;
  path: string;
}

export const registerListenerInternal = <
  TState extends Object,
  TAction extends Action
>({
  callback,
  container,
  path,
  internalListenerId,
}: Args<TState, TAction>) => {
  if (!container.listeners[path as string]) {
    container.listeners[path as string] = [];
  }
  /**
   * In this section of code registers or updates the callback function
   * (for a listenerId).
   * If listenerId callback is already registered, it is updated.
   * Otherwise, it is added.
   */
  const existingListenerIndex =
    container.listenerIdToIndexReference[internalListenerId];
  if (_.isNumber(existingListenerIndex)) {
    container.listeners[path][existingListenerIndex] =
      callback as RegisteredOrUnregisteredListenerCallback<any, Action>;
  } else {
    container.listenerIndexToIdReference[container.listeners[path].length] =
      internalListenerId;
    container.listenerIdToIndexReference[internalListenerId] =
      container.listeners[path].length;
    container.listeners[path].push(
      callback as RegisteredOrUnregisteredListenerCallback<any, Action>
    );
  }
};
