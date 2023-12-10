import { enqueueAction } from "../auxiliary/action-queue-operations";
import { Action } from "../types/contracts/action";
import { containers } from "../containers";

interface Args<TAction extends Action> {
  action: TAction;
  containerId: string;
}

export const applyAutoActions = <TAction extends Action>({
  action,
  containerId,
}: Args<TAction>) => {
  const container = containers[containerId];
  if (!container) {
    return;
  }

  const { autoActions } = container;

  if (autoActions) {
    const { newState } = containers[containerId];
    const { oldState } = containers[containerId];
    const { changedPaths } = containers[containerId];

    const actions = autoActions({
      action,
      changedPaths,
      newState,
      oldState,
    });
    for (const action of actions) {
      enqueueAction({
        action,
        containerId,
      });
    }
  }
};
