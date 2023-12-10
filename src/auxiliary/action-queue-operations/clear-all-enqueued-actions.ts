import _ from "lodash";

import { containers } from "../../containers";

export const clearAllEnqueuedActions = (args: {
  /**
   * The id of the container to clear all enqueued actions for.
   * If the container cannot be found, the method will do nothing.
   */
  containerId: string;
}): void => {
  const { containerId } = args;

  const container = containers[containerId];
  if (!container) {
    return;
  }

  if (container.actionQueueContext.currentlyExecutingActionIndex === 1) {
    return;
  }

  const currentlyExecutingAction =
    container.actionQueueContext.queue[
      container.actionQueueContext.currentlyExecutingActionIndex
    ];

  /**
   * Keep in mind the action at the index 0 is the one that is currently being processed
   */
  container.actionQueueContext = {
    currentlyExecutingActionIndex: currentlyExecutingAction ? -1 : 0,
    lookup: {},
    lastActionIndex: currentlyExecutingAction ? 0 : -1,
    queue: currentlyExecutingAction ? [currentlyExecutingAction] : [],
  };
};
