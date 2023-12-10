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

import { Action, ClientNotificationCallbackArgs } from "./types/contracts";
import {
  Memory,
  RegisteredOrUnregisteredListenerCallback,
} from "./types/memory";

interface Args<TState extends Object, TAction extends Action> {
  callback: (args: ClientNotificationCallbackArgs<TState, TAction>) => void;
  internalListenerId: string;
  container: Memory<TState, Action>;
  path: string;
}

export const registerListenerInternal = <
  TState extends Object,
  TAction extends Action
>({
  callback,
  container,
  path,
  internalListenerId,
}: Args<TState, TAction>) => {
  if (!container.listeners[path as string]) {
    container.listeners[path as string] = [];
  }
  /**
   * In this section of code registers or updates the callback function
   * (for a listenerId).
   * If listenerId callback is already registered, it is updated.
   * Otherwise, it is added.
   */
  const existingListenerIndex =
    container.listenerIdToIndexReference[internalListenerId];
  if (_.isNumber(existingListenerIndex)) {
    container.listeners[path][existingListenerIndex] =
      callback as RegisteredOrUnregisteredListenerCallback<any, Action>;
  } else {
    container.listenerIndexToIdReference[container.listeners[path].length] =
      internalListenerId;
    container.listenerIdToIndexReference[internalListenerId] =
      container.listeners[path].length;
    container.listeners[path].push(
      callback as RegisteredOrUnregisteredListenerCallback<any, Action>
    );
  }
};
