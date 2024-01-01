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

export const executeActionLogging = async <
  TState extends Object,
  TAction extends Action
>(args: {
  containerId: string;
  action: TAction;
  actionListenersPath?: string;
  log:
    | "finished-dispatching"
    | "finished-calling-action-subscribers"
    | "started-dispatching"
    | "started-calling-action-subscribers";
}) => {
  const { action, actionListenersPath, containerId, log } = args;
  const container = containers[containerId];
  const config = container.config;

  if (
    config?.debug?.dispatching?.active &&
    log === "started-dispatching" &&
    !(
      config?.debug?.nonTrackedActions &&
      config?.debug?.nonTrackedActions[action.name]
    )
  ) {
    console.log(`Started dispatching ${action.name}`, {
      action,
    });
    if (config?.debug?.dispatching?.callstack) {
      console.trace("dispatchAction()");
    }
  }
  if (
    config?.debug?.dispatching?.active &&
    log === "started-calling-action-subscribers" &&
    actionListenersPath &&
    !(
      config?.debug?.nonTrackedActions &&
      config?.debug?.nonTrackedActions[action.name]
    )
  ) {
    console.groupCollapsed(
      `${containerId}: started calling subscribers for action ${action.name}`
    );
    console.log(
      `Number of action listeners for path ${actionListenersPath}:`,
      container.listeners[actionListenersPath].length
    );
  }

  if (
    log === "finished-calling-action-subscribers" &&
    config?.debug?.dispatching
  ) {
    console.groupEnd();
  }

  if (
    log === "finished-dispatching" &&
    config?.debug?.dispatching?.active &&
    !(
      config?.debug?.nonTrackedActions &&
      config?.debug?.nonTrackedActions[action.name]
    )
  ) {
    console.log(`Finished dispatching ${action.name}`, {
      action,
    });
    if (config?.debug?.dispatching?.queue) {
      const { currentlyExecutingActionIndex, lastActionIndex, queue } =
        containers[containerId].actionQueueContext;
      console.log("Action queue is:", {
        actionQueue: queue.slice(
          currentlyExecutingActionIndex,
          lastActionIndex + 1
        ),
        buffer: queue.slice(
          0,
          lastActionIndex + 2
        ),
        currentlyExecutingActionIndex,
        lastActionIndex,
      });
    }
  }
};
