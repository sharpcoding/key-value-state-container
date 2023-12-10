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
