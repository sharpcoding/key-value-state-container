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
import { LATE_INVOKE_PREFIX } from "./consts";
import { containers } from "./containers";
import { Action } from "./types/contracts/action";
import {
  ClientNotificationCallbackArgs,
  RegisterStateChangedCallback,
} from "./types/contracts";
import { TKnownStatePath } from "./types/contracts/known-state-path";
import { registerStateChangedCallbackLogging } from "./register-state-changed-callback-logging";
import { registerListenerInternal } from "./register-listener-internal";

/**
 * Registers a callback function that gets be invoked **after** the state changes.
 * 
 * `listenerId` attribute should an unique identifier of the listener 
 * (the callback function).
 * 
 * To be more specific, `statePath` gives some granularity to control which attribute
 * change make the callback invoked.
 * 
 * There are two possible values for `statePath`:
 * - `statePath` is a single attribute callback listens to (so callback will be invoked only when this attribute changes),
 * - `statePath` must be `"*"` (callback is invoked when any attribute changes).
 * Please keep in mind in any of these cases, there `changedPaths: string[]` array 
 * of changed attributes array to check which attributes changed.
 * 
 * The limitation is there is no possibility to listen to level-2 nested attributes. 
 * For example, if you have a state like so:
 * 
 * ```ts
 * export type Car = {
 *   engine: {
 *     horsepower: number;
 *     cylinders: number;
 *   };
 *   year: number;
 * };
 * ```
 * 
 * there is no possibility to listen to `horsepower` attribute changes only
 * (thus `key-value-state-container` name).
 * 
 * IMPORTANT: each `registerStateChangedCallback` must be paired with `unregisterStateChangedCallback` call.
 * Otherwise memory leaks occur.
 */
export const registerStateChangedCallback: RegisterStateChangedCallback = <
  TState extends Object,
  TAction extends Action
>(args: {
  callback: (args: ClientNotificationCallbackArgs<TState, TAction>) => void;
  containerId: string;
  lateInvoke?: boolean;
  listenerId: string;
  statePath: TKnownStatePath<TState>;
}) => {
  const {
    callback,
    lateInvoke,
    listenerId,
    containerId,
    statePath: paramsStatePath,
  } = args;
  const statePath = lateInvoke
    ? `${LATE_INVOKE_PREFIX}:${String(paramsStatePath)}`
    : String(paramsStatePath);
  const internalListenerId = `${String(statePath)}:${listenerId}`;
  const container = containers[containerId];

  if (_.isUndefined(container)) {
    registerStateChangedCallbackLogging({
      containerId,
      container,
      internalListenerId,
      log: "container-not-found",
    });
    /* istanbul ignore next */
    throw new Error("Container not found");
  }

  registerListenerInternal({
    callback,
    container,
    internalListenerId,
    path: statePath,
  });

  registerStateChangedCallbackLogging({
    containerId,
    container,
    internalListenerId,
    log: "registered-listener-for-path",
    statePath,
  });
};
