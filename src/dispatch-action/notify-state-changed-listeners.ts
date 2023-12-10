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
