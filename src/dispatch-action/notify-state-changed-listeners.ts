import _ from "lodash";
import { LATE_INVOKE_PREFIX } from "../consts";
import { containers } from "../containers";
import { Action } from "../types/contracts/action";
import { notifyStateChangedListenersForPaths } from "./notify-state-changed-listeners-for-paths";

interface Args<TState extends Object, TAction extends Action> {
  action: TAction;
  containerId: string;
  newState?: TState;
  oldState?: TState;
  /**
   * Is this the last action in the queue executed?
   */
  lastAction?: boolean;
}

export const notifyStateChangedListeners = <
  TState extends Object,
  TAction extends Action
>(
  args: Args<TState, TAction>
) => {
  const { action, containerId, lastAction, newState, oldState } = args;

  const container = containers[containerId];
  const changedPaths = container.changedPaths;

  const paths = [...changedPaths, "*"];

  notifyStateChangedListenersForPaths<TState, TAction>({
    action,
    containerId,
    paths,
    newState,
    oldState,
  });

  if (lastAction) {
    const paths = [
      ...container.lateInvokeChangedPaths.map((p) => {
        return `${LATE_INVOKE_PREFIX}:${p}`;
      }),
      `${LATE_INVOKE_PREFIX}:*`,
    ];
    notifyStateChangedListenersForPaths<TState, TAction>({
      action,
      changedPaths: container.lateInvokeChangedPaths,
      containerId,
      lastAction: true,
      paths,
      newState,
      oldState,
    });
  }
};
