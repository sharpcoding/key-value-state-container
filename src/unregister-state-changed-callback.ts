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
import { containers } from "./containers";
import { UnregisterStateChangedCallback } from "./types/contracts/unregister-state-changed-callback";
import { TKnownStatePath } from "./types/contracts/known-state-path";
import { LATE_INVOKE_PREFIX } from "./consts";

/**
 * As the name implies, unregisters a listener with an unique `listenerId`.
 * 
 * Note that if `registerStateChangedCallback` was called with `lateInvoke` set to `true`,
 * then this function must be called with `lateInvoke` set to `true` as well.
 */
export const unregisterStateChangedCallback: UnregisterStateChangedCallback = <
  TState extends Object
>(args: {
  containerId: string;
  lateInvoke?: boolean;
  listenerId: string;
  statePath: TKnownStatePath<TState>;
}) => {
  const {
    containerId,
    lateInvoke,
    listenerId,
    statePath: paramsStatePath,
  } = args;
  const statePath = lateInvoke
    ? `${LATE_INVOKE_PREFIX}:${String(paramsStatePath)}`
    : String(paramsStatePath);
  const internalListenerId = `${String(statePath)}:${listenerId}`;
  const container = containers[containerId];

  if (_.isUndefined(container)) {
    return;
  }

  if (_.isUndefined(container.listeners[statePath as string])) {
    return;
  }

  if (!_.isNumber(container.listenerIdToIndexReference[internalListenerId])) {
    if (container.config?.debug?.warnings) {
      console.warn(
        `Unregistering problem: listener ${internalListenerId} is not indexed`
      );
    }
    return;
  }

  container.listeners[statePath as string][
    container.listenerIdToIndexReference[internalListenerId]
  ] = undefined;

  if (container.config?.debug?.registration?.listeners?.unregistering) {
    console.log(
      `Unregistered listener ${internalListenerId} for path ${String(
        statePath
      )}`
    );
    if (container.config?.debug?.registration?.listeners?.callstack) {
      console.trace("unregisterStateChangedCallback()");
    }
  }
};
