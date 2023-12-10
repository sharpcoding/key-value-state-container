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
import { notifyStateChangedListenersForPathsLogging } from "./notify-state-changed-listeners-for-paths-logging";

interface Args<TState extends Object, TAction extends Action> {
  action: TAction;
  changedPaths?: string[];
  containerId: string;
  lastAction?: boolean;
  newState?: TState;
  oldState?: TState;
  paths: string[];
}

export const notifyStateChangedListenersForPaths = <
  TState extends Object,
  TAction extends Action
>(
  args: Args<TState, TAction>
) => {
  const { action, containerId, lastAction, paths } = args;
  const container = containers[containerId];
  const changedPaths = args.changedPaths || container.changedPaths;
  const newState = args.newState || container.newState;
  const oldState = args.oldState || container.oldState;

  const timeStartedNotifySubscribers = performance.now();

  _.each(paths, (path) => {
    const listenersForPath = container.listeners[path];
    notifyStateChangedListenersForPathsLogging({
      ...args,
      log: "started-invoking-listener-callbacks-for-path",
      path,
      listenersForPath,
    });
    if (listenersForPath) {
      for (let i = 0; i < container.listeners[path].length; i++) {
        const registeredListenerCallback = container.listeners[path][i];
        if (registeredListenerCallback) {
          registeredListenerCallback({
            action,
            changedPaths,
            newState,
            oldState,
          });
        }
      }
    }
    notifyStateChangedListenersForPathsLogging({
      ...args,
      log: "finished-invoking-listener-callbacks-for-path",
      path,
      listenersForPath,
    });
  });

  notifyStateChangedListenersForPathsLogging({
    ...args,
    lastAction,
    log: "finished-subscriber-notification-section-in-reducer",
    timeStartedNotifySubscribers,
  });
};
