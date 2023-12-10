import _ from "lodash";

import { Memory } from "../../types/memory";
import { containers } from "../../containers";
import { Action } from "../../types/contracts/action";
import { actionInQueueStatus } from "./action-in-queue-status";
import { ACTION_QUEUE_DEFAULT_SIZE } from "../../consts";

interface Args<TAction> {
  containerId: string;
  action: TAction;
}

const notify = <TAction extends Action>(
  container: Memory<any, TAction>,
  action: TAction,
  operation: "added to" | "replaced in"
) => {
  if (
    container?.config?.debug?.dispatching?.active &&
    container?.config?.debug?.dispatching?.queue &&
    container?.config?.debug?.nonTrackedActions
  ) {
    if (container.config.debug.nonTrackedActions[action.name]) {
      return;
    }
    console.log(
      `Action ${action.name} ${operation} queue:`,
      _.clone(
        container.actionQueueContext.queue.slice(
          0,
          container.actionQueueContext.lastActionIndex + 1
        )
      )
    );
  }
};

const addActionToQueue = <TAction extends Action>(
  container: Memory<any, TAction>,
  action: TAction
) => {
  if (
    container.actionQueueContext.lastActionIndex + 1 >
    (container.config?.actionQueueMaxLength || ACTION_QUEUE_DEFAULT_SIZE)
  ) {
    throw new Error("Action queue buffer overrun (increase queue size in config settings) !");
  }
  container.actionQueueContext.lastActionIndex += 1;
  container.actionQueueContext.queue[
    container.actionQueueContext.lastActionIndex
  ] = action;
  container.actionQueueContext.lookup[action.name] =
    container.actionQueueContext.lastActionIndex;

  notify<TAction>(container, action, "added to");
};

const replaceActionInQueue = <TAction extends Action>(
  container: Memory<any, TAction>,
  action: TAction,
  index: number
) => {
  container.actionQueueContext.queue[index] = action;
  notify<TAction>(container, action, "replaced in");
};

export const enqueueAction = <TAction extends Action>(args: Args<TAction>) => {
  const { action, containerId } = args;

  const container = containers[containerId];
  if (!container) {
    console.warn(
      `Cannot enqueue action ${action.name} - container ${containerId} not found !`,
      {
        containers,
      }
    );
    return;
  }

  const result = actionInQueueStatus({
    containerId,
    name: action.name,
  });

  switch (result.status) {
    case "no-container": {
      break;
    }
    case "empty-queue":
    /**
     * Although there is currently set for execution exactly action of the same name
     */
    case "currently-executing":
    /**
     * Not in queue: add action!
     */
    case "not-in-queue": {
      addActionToQueue(container, action);
      break;
    }
    case "enqueued-for-later-execution": {
      if (action.evanescent) {
        replaceActionInQueue(container, action, result.index);
      } else {
        addActionToQueue(container, action);
      }
      break;
    }
  }
};
