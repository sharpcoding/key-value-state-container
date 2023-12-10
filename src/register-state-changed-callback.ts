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
