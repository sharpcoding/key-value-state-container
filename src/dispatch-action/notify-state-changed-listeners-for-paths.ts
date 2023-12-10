import _ from "lodash";
import { containers } from "../containers";
import { Action } from "../types/contracts/action";
import { notifyStateChangedListenersForPathsLogging } from "./notify-state-changed-listeners-for-paths-logging";

interface Args<TState extends Object, TAction extends Action> {
  action: TAction;
  changedPaths?: string[];
  containerId: string;
  lastAction?: boolean;
  newState?: TState;
  oldState?: TState;
  paths: string[];
}

export const notifyStateChangedListenersForPaths = <
  TState extends Object,
  TAction extends Action
>(
  args: Args<TState, TAction>
) => {
  const { action, containerId, lastAction, paths } = args;
  const container = containers[containerId];
  const changedPaths = args.changedPaths || container.changedPaths;
  const newState = args.newState || container.newState;
  const oldState = args.oldState || container.oldState;

  const timeStartedNotifySubscribers = performance.now();

  _.each(paths, (path) => {
    const listenersForPath = container.listeners[path];
    notifyStateChangedListenersForPathsLogging({
      ...args,
      log: "started-invoking-listener-callbacks-for-path",
      path,
      listenersForPath,
    });
    if (listenersForPath) {
      for (let i = 0; i < container.listeners[path].length; i++) {
        const registeredListenerCallback = container.listeners[path][i];
        if (registeredListenerCallback) {
          registeredListenerCallback({
            action,
            changedPaths,
            newState,
            oldState,
          });
        }
      }
    }
    notifyStateChangedListenersForPathsLogging({
      ...args,
      log: "finished-invoking-listener-callbacks-for-path",
      path,
      listenersForPath,
    });
  });

  notifyStateChangedListenersForPathsLogging({
    ...args,
    lastAction,
    log: "finished-subscriber-notification-section-in-reducer",
    timeStartedNotifySubscribers,
  });
};
