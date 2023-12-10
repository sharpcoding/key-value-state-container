import _ from "lodash";

import { containers } from "../containers";
import { Action } from "../types/contracts/action";
import {
  canExecuteAction,
  enqueueAction,
  markActionGetsExecuted,
} from "../auxiliary/action-queue-operations";
import { DispatchAction } from "../types/contracts/dispatch-action";
import { executeAction } from "./execute-action";

/**
 * Dispatches an action to the state container (registered with the given `containerId`).
 *
 * You can invoke this function from anywhere in your application, in hook context or outside of it.
 * There is no need for action creators or any other boilerplate.
 *
 * If there is no container registered, function would **print** (but not throw) an error.
 * So, effectively, the function call in such case gets ignored.
 */
export const dispatchAction: DispatchAction = <
  TState extends Object,
  TAction extends Action
>(args: {
  containerId: string;
  action: TAction;
  immediateState?: Partial<TState>;
}) => {
  const { action, containerId, immediateState } = args;

  if (action.bypassReducer && immediateState) {
    throw new Error(
      "bypassing reducer and setting immediate state at the same time is not supported!"
    );
  }
  const container = containers[containerId];
  if (_.isUndefined(container)) {
    console.group("Error");
    console.error(`no container registered for containerId: ${containerId}!`);
    console.error(`dispatched action "${action.name}`);
    if (_.get(action, "payload")) {
      console.error(
        `payload ${JSON.stringify(_.get(action, "payload"), undefined, 2)})`
      );
    }
    console.groupEnd();
    return;
  }
  container.immediateState = immediateState;

  enqueueAction({
    action,
    containerId,
  });

  if (canExecuteAction({ containerId })) {
    markActionGetsExecuted({ containerId });
    executeAction<TState, TAction>({
      containerId,
      action,
    });
  }
};
