import _ from "lodash";

import { containers } from "../containers";
import { Action } from "../types/contracts/action";

export const executeActionLogging = async <
  TState extends Object,
  TAction extends Action
>(args: {
  containerId: string;
  action: TAction;
  actionListenersPath?: string;
  log:
    | "finished-dispatching"
    | "finished-calling-action-subscribers"
    | "started-dispatching"
    | "started-calling-action-subscribers";
}) => {
  const { action, actionListenersPath, containerId, log } = args;
  const container = containers[containerId];
  const config = container.config;

  if (
    config?.debug?.dispatching?.active &&
    log === "started-dispatching" &&
    !(
      config?.debug?.nonTrackedActions &&
      config?.debug?.nonTrackedActions[action.name]
    )
  ) {
    console.log(`Started dispatching ${action.name}`, {
      action,
    });
    if (config?.debug?.dispatching?.callstack) {
      console.trace("dispatchAction()");
    }
  }
  if (
    config?.debug?.dispatching?.active &&
    log === "started-calling-action-subscribers" &&
    actionListenersPath &&
    !(
      config?.debug?.nonTrackedActions &&
      config?.debug?.nonTrackedActions[action.name]
    )
  ) {
    console.groupCollapsed(
      `${containerId}: started calling subscribers for action ${action.name}`
    );
    console.log(
      `Number of action listeners for path ${actionListenersPath}:`,
      container.listeners[actionListenersPath].length
    );
  }

  if (
    log === "finished-calling-action-subscribers" &&
    config?.debug?.dispatching
  ) {
    console.groupEnd();
  }

  if (
    log === "finished-dispatching" &&
    config?.debug?.dispatching?.active &&
    !(
      config?.debug?.nonTrackedActions &&
      config?.debug?.nonTrackedActions[action.name]
    )
  ) {
    console.log(`Finished dispatching ${action.name}`, {
      action,
    });
    if (config?.debug?.dispatching?.queue) {
      const { currentlyExecutingActionIndex, lastActionIndex, queue } =
        containers[containerId].actionQueueContext;
      console.log("Action queue is:", {
        actionQueue: queue.slice(
          currentlyExecutingActionIndex,
          lastActionIndex + 1
        ),
        buffer: queue.slice(
          0,
          lastActionIndex + 2
        ),
        currentlyExecutingActionIndex,
        lastActionIndex,
      });
    }
  }
};
