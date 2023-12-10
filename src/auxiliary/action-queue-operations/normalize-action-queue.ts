import { ACTION_QUEUE_DEFAULT_SIZE } from "../../consts";
import { containers } from "../../containers";
import { Action } from "../../types/contracts/action";

interface Args {
  containerId: string;
}

/**
 * If all actions got executed from the action queue,
 * sets indices of the action queue to -1,
 * to avoid the action queue "buffer overrun".
 */
export const normalizeActionQueue = <TAction extends Action>(
  args: Args
): TAction | undefined => {
  const { containerId } = args;

  const container = containers[containerId];
  if (!container) {
    return;
  }

  if (
    container.actionQueueContext.currentlyExecutingActionIndex !==
    container.actionQueueContext.lastActionIndex
  ) {
    throw new Error(
      "state-container: trying to normalize action queue while there are actions in queue!"
    );
  }

  const config = container.config;

  container.lateInvokeChangedPaths = [];

  container.actionQueueContext = {
    currentlyExecutingActionIndex: -1,
    lastActionIndex: -1,
    lookup: {},
    queue: Array.from(
      { length: config?.actionQueueMaxLength || ACTION_QUEUE_DEFAULT_SIZE },
      () => undefined
    ),
  };
};
