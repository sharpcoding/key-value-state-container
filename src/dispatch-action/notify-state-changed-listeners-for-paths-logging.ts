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

import { RegisteredOrUnregisteredListenerCallback } from "../types/container-in-memory";
import { containers } from "../containers";
import { Action } from "../types/contracts/action";

interface Args<TState extends Object, TAction extends Action> {
  action: TAction;
  changedPaths?: string[];
  containerId: string;
  newState?: TState;
  lastAction?: boolean;
  oldState?: TState;
  path?: string;
  listenersForPath?: RegisteredOrUnregisteredListenerCallback<
    TState,
    TAction
  >[];
  timeStartedNotifySubscribers?: number;
  log:
    | "finished-invoking-listener-callbacks-for-path"
    | "finished-subscriber-notification-section-in-reducer"
    | "started-invoking-listener-callbacks-for-path";
}

export const notifyStateChangedListenersForPathsLogging = <
  TState extends Object,
  TAction extends Action
>(
  args: Args<TState, TAction>
) => {
  const {
    action,
    containerId,
    lastAction,
    listenersForPath,
    log,
    path,
    timeStartedNotifySubscribers,
  } = args;
  const container = containers[containerId];
  const changedPaths = args.changedPaths || container.changedPaths;
  const config = container.config;
  if (
    config?.debug?.dispatching?.active &&
    log === "started-invoking-listener-callbacks-for-path" &&
    path &&
    !(
      config?.debug?.nonTrackedActions &&
      config?.debug?.nonTrackedActions[action.name]
    )
  ) {
    if (listenersForPath) {
      console.groupCollapsed(
        `${containerId}: started invoking listener callbacks for path ${path}`
      );
      if (config?.debug?.dispatching?.listeners) {
        console.log(
          `Number of listeners for path ${path}:`,
          container.listeners[path].length
        );
        console.log({
          listeners: _.filter(
            _.keys(container.listenerIdToIndexReference),
            (el) => _.startsWith(el, `${path}:`)
          ),
        });
      }
    } else {
      if (config?.debug?.dispatching.listeners) {
        console.log(`No listeners for path ${path}`);
      }
    }
  }

  if (
    config?.debug?.dispatching?.active &&
    log === "finished-invoking-listener-callbacks-for-path" &&
    path &&
    !(
      config?.debug?.nonTrackedActions &&
      config?.debug?.nonTrackedActions[action.name]
    )
  ) {
    if (listenersForPath) {
      console.groupEnd();
    }
  }

  if (
    config?.debug?.reducer &&
    log === "finished-subscriber-notification-section-in-reducer" &&
    timeStartedNotifySubscribers &&
    !(
      config?.debug?.nonTrackedActions &&
      config?.debug?.nonTrackedActions[action.name]
    )
  ) {
    const timeFinishedNotifySubscribers = performance.now();
    const time = `${(
      timeFinishedNotifySubscribers - timeStartedNotifySubscribers
    ).toFixed(0)} milliseconds`;

    console.groupCollapsed(
      `${containerId}: reducer for ${action.name} action (${time})`
    );

    if (action.name == "long-operation") {
      console.log(
        container
      )
    }

    if (lastAction) {
      console.warn("This is the last action notifying `lateInvoke` listeners and changed paths are cumulative!");
    }

    const newState = args.newState || container.newState;
    const oldState = args.oldState || container.oldState;

    console.log({
      action,
      newState,
      changed: changedPaths,
      oldState,
    });
    console.groupEnd();
  }
};
