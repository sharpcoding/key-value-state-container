import _ from "lodash";
import { containers } from "../../containers";
import { Action } from "../../types/contracts/action";

interface Args {
  containerId: string;
}

/**
 * Gets a next action without doing anything!
 * Returns `undefined` if there is no next action
 */
export const getNextAction = <TAction extends Action>(
  args: Args
): TAction | undefined => {
  const { containerId } = args;

  const container = containers[containerId];
  if (!container) {
    console.warn(
      `Cannot get next action - container ${containerId} not found !`,
      `All containers:`,
      JSON.stringify(_.keys(containers))
    );
    return undefined;
  }

  const result = container.actionQueueContext.queue[
    container.actionQueueContext.currentlyExecutingActionIndex + 1
  ] as TAction;

  return result;
};
