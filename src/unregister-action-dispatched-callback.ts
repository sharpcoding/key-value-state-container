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

import { Action } from "./types/contracts/action";

import { getActionPath } from "./auxiliary/get-action-path";
import { containers } from "./containers";
import { UnregisterActionDispatchedCallback } from "./types/contracts";

export const unregisterActionDispatchedCallback: UnregisterActionDispatchedCallback =
  <TAction extends Action>(args: {
    action: Pick<TAction, "name">;
    containerId: string;
    listenerId: string;
  }) => {
    const {
      containerId,
      listenerId,
      action: { name: actionName },
    } = args;
    const internalListenerId = `${getActionPath(actionName)}:${listenerId}`;
    const container = containers[containerId];

    if (_.isUndefined(container)) {
      /* istanbul ignore next */
      return;
    }

    const path = getActionPath(actionName);

    if (!_.isNumber(container.listenerIdToIndexReference[internalListenerId])) {
      if (container.config?.debug?.warnings) {
        console.warn(
          `Unregistering problem: listener ${internalListenerId} is not indexed`
        );
      }
      return;
    }

    if (!container.listeners[path]) {
      if (container.config?.debug?.warnings) {
        console.warn(
          `Unregistering problem: no listeners on path ${path} for ${internalListenerId}`
        );
      }
      return;
    }

    container.listeners[path][
      container.listenerIdToIndexReference[internalListenerId]
    ] = undefined;

    if (container.config?.debug?.registration?.listeners?.unregistering) {
      console.log(
        `Unregistered listener ${internalListenerId} for path ${path}`
      );
      if (container.config?.debug?.registration?.listeners?.callstack) {
        console.trace("unregisterActionDispatchedCallback()");
      }
    }
  };
