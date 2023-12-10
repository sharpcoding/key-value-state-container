import { Action } from "../../types/contracts/action";
import { actionInQueueStatus } from "./action-in-queue-status";

interface Args<TAction extends Action> extends Pick<TAction, "name"> {
  containerId: string;
}

export const actionInQueue = <TAction extends Action>(
  args: Args<TAction>
): boolean => {
  const { status } = actionInQueueStatus(args);
  switch (status) {
    case "no-container":
    case "empty-queue":
    case "not-in-queue": {
      return false;
    }
    default: {
      return true;
    }
  }
};
