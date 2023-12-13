/**
 * The MIT License (MIT)
 * 
 * Copyright Tomasz Szatkowski and WealthArc https://www.wealtharc.com (c) 2023 
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
      actionNextSteps({
        action,
        containerId,
      });
    });
    return;
  }

  actionNextSteps({
    action,
    containerId,
  });
};
