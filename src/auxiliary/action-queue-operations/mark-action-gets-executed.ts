import { containers } from "../../containers";

interface Args {
  containerId: string;
}

/**
 * Marks the next action as the executing one.
 */
export const markActionGetsExecuted = (args: Args) => {
  const { containerId } = args;

  const container = containers[containerId];
  if (!container) {
    console.warn(
      `Cannot execute action - container ${containerId} not found !`
    );
    return false;
  }

  container.actionQueueContext.currentlyExecutingActionIndex += 1;
};
