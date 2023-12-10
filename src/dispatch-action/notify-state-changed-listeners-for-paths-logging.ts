import _ from "lodash";

import { RegisteredOrUnregisteredListenerCallback } from "../types/memory";
import { containers } from "../containers";
import { Action } from "../types/contracts/action";

interface Args<TState extends Object, TAction extends Action> {
  action: TAction;
  changedPaths?: string[];
  containerId: string;
  newState?: TState;
  lastAction?: boolean;
  oldState?: TState;
  path?: string;
  listenersForPath?: RegisteredOrUnregisteredListenerCallback<
    TState,
    TAction
  >[];
  timeStartedNotifySubscribers?: number;
  log:
    | "finished-invoking-listener-callbacks-for-path"
    | "finished-subscriber-notification-section-in-reducer"
    | "started-invoking-listener-callbacks-for-path";
}

export const notifyStateChangedListenersForPathsLogging = <
  TState extends Object,
  TAction extends Action
>(
  args: Args<TState, TAction>
) => {
  const {
    action,
    containerId,
    lastAction,
    listenersForPath,
    log,
    path,
    timeStartedNotifySubscribers,
  } = args;
  const container = containers[containerId];
  const changedPaths = args.changedPaths || container.changedPaths;
  const config = container.config;
  if (
    config?.debug?.dispatching?.active &&
    log === "started-invoking-listener-callbacks-for-path" &&
    path &&
    !(
      config?.debug?.nonTrackedActions &&
      config?.debug?.nonTrackedActions[action.name]
    )
  ) {
    if (listenersForPath) {
      console.groupCollapsed(
        `${containerId}: started invoking listener callbacks for path ${path}`
      );
      if (config?.debug?.dispatching?.listeners) {
        console.log(
          `Number of listeners for path ${path}:`,
          container.listeners[path].length
        );
        console.log({
          listeners: _.filter(
            _.keys(container.listenerIdToIndexReference),
            (el) => _.startsWith(el, `${path}:`)
          ),
        });
      }
    } else {
      if (config?.debug?.dispatching.listeners) {
        console.log(`No listeners for path ${path}`);
      }
    }
  }

  if (
    config?.debug?.dispatching?.active &&
    log === "finished-invoking-listener-callbacks-for-path" &&
    path &&
    !(
      config?.debug?.nonTrackedActions &&
      config?.debug?.nonTrackedActions[action.name]
    )
  ) {
    if (listenersForPath) {
      console.groupEnd();
    }
  }

  if (
    config?.debug?.reducer &&
    log === "finished-subscriber-notification-section-in-reducer" &&
    timeStartedNotifySubscribers &&
    !(
      config?.debug?.nonTrackedActions &&
      config?.debug?.nonTrackedActions[action.name]
    )
  ) {
    const timeFinishedNotifySubscribers = performance.now();
    const time = `${(
      timeFinishedNotifySubscribers - timeStartedNotifySubscribers
    ).toFixed(0)} milliseconds`;

    console.groupCollapsed(
      `${containerId}: reducer for ${action.name} action (${time})`
    );

    if (action.name == "long-operation") {
      console.log(
        container
      )
    }

    if (lastAction) {
      console.warn("This is the last action notifying `lateInvoke` listeners and changed paths are cumulative!");
    }

    const newState = args.newState || container.newState;
    const oldState = args.oldState || container.oldState;

    console.log({
      action,
      newState,
      changed: changedPaths,
      oldState,
    });
    console.groupEnd();
  }
};
