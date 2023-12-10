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

import { containers } from "./containers";
import { getActionPath } from "./auxiliary/get-action-path";
import { RegisterActionDispatchedCallbackFunction } from "./types/contracts";
import { registerActionDispatchedCallbackLogging } from "./register-action-dispatched-callback-logging";
import { registerListenerInternal } from "./register-listener-internal";

/**
 * Low-level function registering a callback that will get called when an action
 * got dispatched.
 *
 * No matter the state was changed or not, a was reducer invoked or not
 * (see also `bypassReducer` in the `dispatchAction()` function),
 * this callback will get called.
 */
export const registerActionDispatchedCallback: RegisterActionDispatchedCallbackFunction =
  ({ action: { name: actionName }, callback, listenerId, containerId }) => {
    const internalListenerId = `${getActionPath(actionName)}:${listenerId}`;
    const container = containers[containerId];
    if (!container) {
      registerActionDispatchedCallbackLogging({
        container,
        internalListenerId,
        log: "container-not-found",
      });
      throw new Error("Container not found");
    }
    const actionPath = getActionPath(actionName);

    registerListenerInternal({
      callback,
      container,
      internalListenerId,
      path: actionPath,
    });

    registerActionDispatchedCallbackLogging({
      actionPath,
      container,
      internalListenerId,
      log: "registered-listener-for-path",
    });
  };
