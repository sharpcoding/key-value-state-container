import _ from "lodash";

import { containers } from "../containers";
import { Action } from "../types/contracts/action";
import { getChangedPaths } from "../get-changed-paths";
import { getActionPath } from "../auxiliary/get-action-path";
import {
  getNextAction,
  numberOfActionsLeft,
} from "../auxiliary/action-queue-operations";
import { notifyStateChangedListeners } from "./notify-state-changed-listeners";
import { getStateWithAsyncFlag } from "./get-state-with-async-flag";
import { actionNextSteps } from "./action-next-steps";
import { executeActionLogging } from "./execute-action-logging";

export const executeAction = async <
  TState extends Object,
  TAction extends Action
>(args: {
  containerId: string;
  action: TAction;
}) => {
  const { action, containerId } = args;
  const container = containers[containerId];
  container.oldState = _.clone(container.newState);

  const asyncOperationFlag =
    container.config?.managedAttributes?.asyncOperationFlag;

  let asyncOperationFlagValue: boolean = false;

  if (action.async && asyncOperationFlag) {
    asyncOperationFlagValue = true;
    const state: TState = getStateWithAsyncFlag<TState, TAction>({
      action,
      state: container.oldState,
      asyncOperationFlagValue,
      asyncOperationFlag,
    });
    /**
     * Here we change state in only one way - by setting `asyncOperationFlag` field to `true`
     */
    container.newState = state;
    container.immediateState = {};
    container.changedPaths = getChangedPaths({
      newState: state,
      oldState: container.oldState,
    });
    notifyStateChangedListeners({
      action,
      containerId,
      lastAction: false,
    });
  }

  executeActionLogging({ ...args, log: "started-dispatching" });

  switch (!!action.bypassReducer) {
    case false: {
      const { reducer = () => Promise.resolve(container.oldState) } = container;

      const reducerNewState = await reducer({
        action,
        state: container.oldState,
      });

      const nextAction = getNextAction({
        containerId,
      });

      const newState = getStateWithAsyncFlag({
        action,
        state: reducerNewState,
        asyncOperationFlagValue: nextAction?.async || false,
        asyncOperationFlag,
      });

      const changedPaths = getChangedPaths({
        newState,
        oldState: getStateWithAsyncFlag({
          action,
          state: container.oldState,
          asyncOperationFlagValue,
          asyncOperationFlag,
        }),
      });

      container.newState = newState;
      container.lateInvokeChangedPaths = _.uniq([
        ...container.lateInvokeChangedPaths,
        ...changedPaths,
      ]);
      container.immediateState = {};
      container.changedPaths = changedPaths;

      const numberOfAllActionsLeft = numberOfActionsLeft({
        containerId,
        query: "count-all-actions",
      });

      const numberOfBypassReducerActionsLeft = numberOfActionsLeft({
        containerId,
        query: "count-only-bypass-reducer-actions",
      });

      const lastAction =
        nextAction === undefined ||
        (nextAction.bypassReducer &&
          numberOfAllActionsLeft === numberOfBypassReducerActionsLeft);

      notifyStateChangedListeners({
        action,
        containerId,
        lastAction,
      });

      if (lastAction) {
        container.lateInvokeChangedPaths = [];
      }
      break;
    }
    case true: {
      break;
    }
  }

  const actionListenersPath = getActionPath(action.name);
  if (container.listeners[actionListenersPath]) {
    executeActionLogging({
      ...args,
      actionListenersPath,
      log: "started-calling-action-subscribers",
    });
    for (let i = 0; i < container.listeners[actionListenersPath].length; i++) {
      const registeredListenerCallback =
        container.listeners[actionListenersPath][i];
      if (registeredListenerCallback) {
        registeredListenerCallback({
          action,
          changedPaths: [],
          newState: container.newState,
          oldState: container.oldState,
        });
      }
    }
    executeActionLogging({
      ...args,
      actionListenersPath,
      log: "finished-calling-action-subscribers",
    });
  }

  executeActionLogging({ ...args, log: "finished-dispatching" });

  if (action.waitForFullUiRepaint) {
    _.defer(async () => {
      await actionNextSteps({
        action,
        containerId,
      });
    });
    return;
  }

  await actionNextSteps({
    action,
    containerId,
  });
};
