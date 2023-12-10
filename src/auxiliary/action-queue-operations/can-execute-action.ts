import { containers } from "../../containers";

interface Args {
  containerId: string;
}

/**
 * Action gets executed if there is only one enqueued action.
 */
export const canExecuteAction = (args: Args): boolean => {
  const { containerId } = args;

  const container = containers[containerId];
  if (!container) {
    console.warn(
      `Cannot check action queue - container ${containerId} not found !`
    );
    return false;
  }

  return container.actionQueueContext.lastActionIndex === 0;
};
