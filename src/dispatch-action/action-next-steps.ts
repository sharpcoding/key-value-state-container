import { Action } from "../types/contracts/action";
import {
  getNextAction,
  markActionGetsExecuted,
  normalizeActionQueue,
} from "../auxiliary/action-queue-operations";
import { applyAutoActions } from "./apply-auto-actions";
import { applyPersistence } from "./apply-persistence";
import { containers } from "../containers";
import { executeAction } from "./execute-action";

export const actionNextSteps = async <TAction extends Action>({
  action,
  containerId,
}: {
  containerId: string;
  action: TAction;
}) => {
  applyAutoActions({
    action,
    containerId,
  });

  const container = containers[containerId];

  if (container && container.persistence) {
    await applyPersistence({
      containerId,
    });
  }

  const nextAction = getNextAction({
    containerId,
  });

  if (nextAction) {
    markActionGetsExecuted({ containerId });
    executeAction({
      containerId,
      action: nextAction,
    });
  } else {
    normalizeActionQueue({
      containerId,
    });
  }
};
