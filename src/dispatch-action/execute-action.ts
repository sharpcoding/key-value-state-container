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
  checkOnlyBypassReducerActionsLeft,
  getNextAction,
} from "../auxiliary/action-queue-operations";
import { cloneObject } from "../auxiliary/clone-object";
import { notifyStateChangedListeners } from "./notify-state-changed-listeners";
import { getStateWithAsyncFlag } from "./get-state-with-async-flag";
import { actionNextSteps } from "./action-next-steps";
import { executeActionLogging } from "./execute-action-logging";
import { evaluateStateComparisonType } from "./evaluate-state-comparison-type";

export const executeAction = async <
  TState extends Object,
  TAction extends Action
>(args: {
  containerId: string;
  action: TAction;
}) => {
  const { action, containerId } = args;
  const container = containers[containerId];
  container.oldState = container.newState;

  const asyncOperationFlag =
    container.config?.managedAttributes?.asyncOperationFlag;

  let asyncOperationFlagValue: boolean = false;

  const comparison = evaluateStateComparisonType({
    action,
    containerConfig: container.config,
  });

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
      comparison,
      containerId,
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
      const { autoState, reducer = () => Promise.resolve(container.oldState) } =
        container;

      /**
       * ❤️ the most essential line of the library
       *   all other code is a kind of addition   ❤️
       */
      const reducerNewState = await reducer({
        action,
        state: action?.protectState
          ? cloneObject(container.oldState)
          : container.oldState,
      });

      const nextAction = getNextAction({
        containerId,
      });

      const autoStateNewState = autoState
        ? autoState({
            action,
            changedPaths: getChangedPaths({
              comparison,
              containerId,
              newState: reducerNewState,
              oldState: getStateWithAsyncFlag({
                action,
                state: container.oldState,
                asyncOperationFlagValue,
                asyncOperationFlag,
              }),
            }),
            newState: reducerNewState,
            oldState: container.oldState,
          })
        : reducerNewState;

      const newState = getStateWithAsyncFlag({
        action,
        state: autoStateNewState,
        asyncOperationFlagValue: nextAction?.async || false,
        asyncOperationFlag,
      });

      const changedPaths = getChangedPaths({
        comparison,
        containerId,
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

      const lastAction =
        nextAction === undefined ||
        checkOnlyBypassReducerActionsLeft({ container });

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
