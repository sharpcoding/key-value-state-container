import _ from "lodash";

import { Action } from "../../types/contracts/action";
import { containers } from "../../containers";

interface Args<TAction extends Action> extends Pick<TAction, "name"> {
  containerId: string;
}

type Result =
  | { status: "no-container" }
  | { status: "empty-queue" }
  | { status: "not-in-queue" }
  | { status: "currently-executing" }
  /**
   * This type of result indicates:
   * - action is not currently executed...
   * - ...yet, it is enqueued somewhere in the message queue
   * `index` attribute provides position of the first position of
   * the action in queue
   */
  | { status: "enqueued-for-later-execution"; index: number };

export const actionInQueueStatus = <TAction extends Action>(
  args: Args<TAction>
): Result => {
  const { name, containerId } = args;

  const container = containers[containerId];
  if (!container) {
    return { status: "no-container" };
  }

  if (
    container.actionQueueContext.currentlyExecutingActionIndex ===
    container.actionQueueContext.lastActionIndex
  ) {
    return { status: "empty-queue" };
  }

  const currentlyExecutingAction =
    container.actionQueueContext.queue[
      container.actionQueueContext.currentlyExecutingActionIndex
    ];
  if (
    currentlyExecutingAction &&
    currentlyExecutingAction.name === name
  ) {
    return { status: "currently-executing" };
  }

  const lastIndexOfAction = container.actionQueueContext.lookup[name];

  if (
    lastIndexOfAction >
    container.actionQueueContext.currentlyExecutingActionIndex
  ) {
    return {
      status: "enqueued-for-later-execution",
      index: container.actionQueueContext.lookup[name],
    };
  }

  return { status: "not-in-queue" };
};
